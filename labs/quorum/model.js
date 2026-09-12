export const NODE_COUNT = 5;
export const QUORUM = 3;
export const MAX_LOG = 96;
export const MAX_TICKS = 5000;
const clone = (value) => structuredClone(value);
const equalEntry = (a, b) =>
  a?.term === b?.term && a?.id === b?.id && a?.command === b?.command;

export class Cluster {
  constructor(seed = 19) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
      throw new Error("Seed must be a whole number from 0 to 4294967295.");
    this.seed = seed;
    this.randomState = seed >>> 0;
    this.tick = 0;
    this.sequence = 0;
    this.commandSequence = 0;
    this.queue = [];
    this.events = [];
    this.delivered = [];
    this.committed = [];
    this.certificates = [];
    this.elections = [];
    this.voteHistory = new Map();
    this.links = Array.from({ length: NODE_COUNT }, (_, from) =>
      Array.from({ length: NODE_COUNT }, (_, to) => from !== to),
    );
    this.nodes = Array.from({ length: NODE_COUNT }, (_, id) => ({
      id,
      online: true,
      role: "follower",
      term: 0,
      votedFor: null,
      leaderId: null,
      log: [],
      commitIndex: -1,
      votes: [],
      nextIndex: [],
      matchIndex: [],
      heartbeatAt: 0,
      deadline: 0,
    }));
    for (const node of this.nodes) this.resetDeadline(node);
    this.record(
      "start",
      "Cluster started",
      "Five voters. Three acknowledgements make a majority.",
    );
  }

  random() {
    this.randomState =
      (Math.imul(this.randomState, 1664525) + 1013904223) >>> 0;
    return this.randomState / 4294967296;
  }

  resetDeadline(node) {
    node.deadline = this.tick + 12 + Math.floor(this.random() * 13);
  }

  record(type, title, detail = "", node = null) {
    this.events.push({
      id: ++this.sequence,
      tick: this.tick,
      type,
      title,
      detail,
      node,
    });
    if (this.events.length > 140) this.events.shift();
  }

  node(id) {
    if (!Number.isInteger(id) || id < 0 || id >= NODE_COUNT)
      throw new Error("Choose a node from 1 to 5.");
    return this.nodes[id];
  }

  connected(from, to) {
    return this.links[from][to];
  }

  send(from, to, type, data) {
    this.queue.push({
      id: ++this.sequence,
      from,
      to,
      type,
      ...clone(data),
      sent: this.tick,
      due: this.tick + 1 + Math.floor(this.random() * 3),
    });
  }

  follower(node, term) {
    if (term > node.term) {
      node.term = term;
      node.votedFor = null;
    }
    node.role = "follower";
    node.leaderId = null;
    node.votes = [];
    this.resetDeadline(node);
  }

  vote(node, candidateId) {
    const key = `${node.term}:${node.id}`;
    const previous = this.voteHistory.get(key);
    if (previous !== undefined && previous !== candidateId)
      throw new Error("Safety violation: two votes in one term.");
    node.votedFor = candidateId;
    this.voteHistory.set(key, candidateId);
  }

  election(node) {
    node.term++;
    node.role = "candidate";
    node.leaderId = null;
    node.votes = [node.id];
    this.vote(node, node.id);
    this.resetDeadline(node);
    this.record(
      "election",
      `N${node.id + 1} starts an election`,
      `Term ${node.term}. Last log term ${node.log.at(-1)?.term ?? 0}.`,
      node.id,
    );
    for (const peer of this.nodes)
      if (peer.id !== node.id)
        this.send(node.id, peer.id, "vote", {
          term: node.term,
          lastIndex: node.log.length - 1,
          lastTerm: node.log.at(-1)?.term ?? 0,
        });
  }

  becomeLeader(node) {
    if (node.votes.length < QUORUM)
      throw new Error("Safety violation: election without a majority.");
    if (
      this.elections.some(
        (election) => election.term === node.term && election.node !== node.id,
      )
    )
      throw new Error("Safety violation: two leaders elected in one term.");
    for (let index = 0; index < this.committed.length; index++)
      if (!equalEntry(node.log[index], this.committed[index]))
        throw new Error(
          "Safety violation: elected leader is missing a committed entry.",
        );
    node.role = "leader";
    node.leaderId = node.id;
    node.nextIndex = Array(NODE_COUNT).fill(node.log.length);
    node.matchIndex = Array(NODE_COUNT).fill(-1);
    node.matchIndex[node.id] = node.log.length - 1;
    this.elections.push({
      term: node.term,
      node: node.id,
      voters: [...node.votes],
      tick: this.tick,
    });
    this.record(
      "leader",
      `N${node.id + 1} elected leader`,
      `Term ${node.term}. Votes from ${node.votes.map((id) => `N${id + 1}`).join(", ")}.`,
      node.id,
    );
    // A current-term barrier allows previously replicated entries to commit safely.
    if (node.log.length < MAX_LOG)
      this.append(node, {
        id: `barrier-${node.term}`,
        term: node.term,
        kind: "barrier",
        command: "term barrier",
      });
    this.broadcast(node);
  }

  append(node, entry) {
    node.log.push(entry);
    node.matchIndex[node.id] = node.log.length - 1;
  }

  replicate(node, peerId) {
    const next = Math.max(0, Math.min(node.log.length, node.nextIndex[peerId]));
    this.send(node.id, peerId, "append", {
      term: node.term,
      prevIndex: next - 1,
      prevTerm: node.log[next - 1]?.term ?? 0,
      entries: node.log.slice(next),
      leaderCommit: node.commitIndex,
    });
  }

  broadcast(node) {
    node.heartbeatAt = this.tick + 4;
    for (const peer of this.nodes)
      if (peer.id !== node.id) this.replicate(node, peer.id);
  }

  commit(node, index, voters = null) {
    if (index <= node.commitIndex) return;
    for (let at = node.commitIndex + 1; at <= index; at++) {
      const entry = node.log[at];
      if (!entry) throw new Error("Safety violation: commit beyond the log.");
      if (this.committed[at] && !equalEntry(this.committed[at], entry))
        throw new Error("Safety violation: conflicting committed entries.");
      if (!this.committed[at]) this.committed[at] = clone(entry);
    }
    node.commitIndex = index;
    if (voters) {
      this.certificates.push({
        tick: this.tick,
        term: node.term,
        node: node.id,
        index,
        voters: [...voters],
      });
      this.record(
        "commit",
        `Log ${index + 1} committed`,
        `N${node.id + 1} received a majority: ${voters.map((id) => `N${id + 1}`).join(", ")}.`,
        node.id,
      );
    }
  }

  updateCommit(node) {
    for (let index = node.log.length - 1; index > node.commitIndex; index--) {
      if (node.log[index].term !== node.term) continue;
      const voters = this.nodes
        .filter((peer) => node.matchIndex[peer.id] >= index)
        .map((peer) => peer.id);
      if (voters.length >= QUORUM) {
        this.commit(node, index, voters);
        break;
      }
    }
  }

  receive(message) {
    const node = this.nodes[message.to];
    if (!node.online || !this.connected(message.from, message.to)) {
      this.delivered.push({ ...message, dropped: true });
      return;
    }
    this.delivered.push({ ...message, dropped: false });
    if (message.term > node.term) this.follower(node, message.term);
    if (message.type === "vote") {
      const lastTerm = node.log.at(-1)?.term ?? 0;
      const upToDate =
        message.lastTerm > lastTerm ||
        (message.lastTerm === lastTerm &&
          message.lastIndex >= node.log.length - 1);
      const granted =
        message.term === node.term &&
        (node.votedFor === null || node.votedFor === message.from) &&
        upToDate;
      if (granted) {
        this.vote(node, message.from);
        this.resetDeadline(node);
      }
      this.send(node.id, message.from, "vote-result", {
        term: node.term,
        granted,
      });
      return;
    }
    if (message.type === "vote-result") {
      if (
        node.role !== "candidate" ||
        message.term !== node.term ||
        !message.granted
      )
        return;
      if (!node.votes.includes(message.from)) node.votes.push(message.from);
      if (node.votes.length >= QUORUM) this.becomeLeader(node);
      return;
    }
    if (message.type === "append") {
      if (message.term < node.term) {
        this.send(node.id, message.from, "append-result", {
          term: node.term,
          success: false,
          next: node.log.length,
          requestPrev: message.prevIndex,
        });
        return;
      }
      if (node.role !== "follower") this.follower(node, message.term);
      node.leaderId = message.from;
      this.resetDeadline(node);
      if (
        message.prevIndex >= node.log.length ||
        (message.prevIndex >= 0 &&
          node.log[message.prevIndex].term !== message.prevTerm)
      ) {
        this.send(node.id, message.from, "append-result", {
          term: node.term,
          success: false,
          next: Math.min(node.log.length, message.prevIndex),
          requestPrev: message.prevIndex,
        });
        return;
      }
      for (let offset = 0; offset < message.entries.length; offset++) {
        const index = message.prevIndex + 1 + offset;
        const incoming = message.entries[offset];
        if (node.log[index] && node.log[index].term !== incoming.term) {
          if (index <= node.commitIndex)
            throw new Error("Safety violation: truncating a committed entry.");
          this.record(
            "repair",
            `N${node.id + 1} repairs its log`,
            `Removed an uncommitted suffix from index ${index + 1}.`,
            node.id,
          );
          node.log.splice(index);
        }
        if (!node.log[index]) node.log.push(clone(incoming));
      }
      const matched = message.prevIndex + message.entries.length;
      this.commit(node, Math.min(message.leaderCommit, matched));
      this.send(node.id, message.from, "append-result", {
        term: node.term,
        success: true,
        matched,
        requestPrev: message.prevIndex,
      });
      return;
    }
    if (message.type === "append-result") {
      if (node.role !== "leader" || message.term !== node.term) return;
      if (message.success) {
        node.matchIndex[message.from] = Math.max(
          node.matchIndex[message.from],
          message.matched,
        );
        node.nextIndex[message.from] = Math.max(
          node.nextIndex[message.from],
          message.matched + 1,
        );
        this.updateCommit(node);
      } else if (message.requestPrev >= node.matchIndex[message.from]) {
        // Ignore failures for prefixes that a later acknowledgement already confirmed.
        node.nextIndex[message.from] = Math.max(
          node.matchIndex[message.from] + 1,
          Math.min(node.nextIndex[message.from] - 1, message.next),
        );
        this.replicate(node, message.from);
      }
    }
  }

  step(count = 1) {
    if (!Number.isInteger(count) || count < 1 || count > MAX_TICKS)
      throw new Error("Step count must be from 1 to 5000.");
    for (let step = 0; step < count; step++) {
      if (this.tick >= MAX_TICKS)
        throw new Error(
          "This run reached 5000 ticks. Reset to start a new run.",
        );
      this.tick++;
      this.delivered = [];
      const ready = this.queue
        .filter((message) => message.due <= this.tick)
        .sort((a, b) => a.due - b.due || a.id - b.id);
      this.queue = this.queue.filter((message) => message.due > this.tick);
      for (const message of ready) this.receive(message);
      for (const node of this.nodes) {
        if (!node.online) continue;
        if (node.role === "leader") {
          if (this.tick >= node.heartbeatAt) this.broadcast(node);
        } else if (this.tick >= node.deadline) this.election(node);
      }
      this.assertSafety();
    }
    return this;
  }

  write(command, targetId = this.leaders()[0]?.id) {
    if (
      typeof command !== "string" ||
      !command.trim() ||
      command.trim().length > 64
    )
      throw new Error("Write a command from 1 to 64 characters.");
    const node = this.node(targetId);
    if (!node.online || node.role !== "leader")
      throw new Error("Choose an online leader before submitting a write.");
    if (node.log.length >= MAX_LOG)
      throw new Error("This log reached 96 entries. Reset to begin again.");
    const entry = {
      id: `client-${++this.commandSequence}`,
      term: node.term,
      kind: "write",
      command: command.trim(),
    };
    this.append(node, entry);
    this.record(
      "write",
      `Write accepted by N${node.id + 1}`,
      `Log ${node.log.length}: ${entry.command}. Waiting for majority replication.`,
      node.id,
    );
    this.broadcast(node);
    return entry.id;
  }

  leaders() {
    return this.nodes
      .filter((node) => node.online && node.role === "leader")
      .sort((a, b) => b.term - a.term || a.id - b.id);
  }

  isolate(id) {
    this.node(id);
    for (const peer of this.nodes)
      if (peer.id !== id)
        this.links[id][peer.id] = this.links[peer.id][id] = false;
    this.record(
      "fault",
      `N${id + 1} isolated`,
      "Its process keeps running. All links to this node are cut.",
      id,
    );
  }

  reconnect(id) {
    this.node(id);
    for (const peer of this.nodes)
      if (peer.id !== id)
        this.links[id][peer.id] = this.links[peer.id][id] = true;
    this.record(
      "heal",
      `N${id + 1} reconnected`,
      "Messages can cross this node's links again.",
      id,
    );
  }

  partition(group) {
    if (
      !Array.isArray(group) ||
      group.length < 1 ||
      group.length >= NODE_COUNT ||
      new Set(group).size !== group.length ||
      group.some((id) => !Number.isInteger(id) || id < 0 || id >= NODE_COUNT)
    )
      throw new Error("A partition needs 1 to 4 distinct valid nodes.");
    const side = new Set(group);
    for (const a of this.nodes)
      for (const b of this.nodes)
        this.links[a.id][b.id] =
          a.id !== b.id && side.has(a.id) === side.has(b.id);
    this.record(
      "fault",
      `${group.length} / ${NODE_COUNT - group.length} network partition`,
      "Only the component with three voters can elect a new leader and commit new writes.",
    );
  }

  heal() {
    for (const a of this.nodes)
      for (const b of this.nodes) this.links[a.id][b.id] = a.id !== b.id;
    this.record(
      "heal",
      "All network links restored",
      "Old leaders step down when they receive a higher term.",
    );
  }

  crash(id) {
    const node = this.node(id);
    if (!node.online) return;
    node.online = false;
    node.role = "offline";
    this.record(
      "fault",
      `N${id + 1} crashed`,
      "Term, vote, log, and committed prefix are retained in simulated stable storage.",
      id,
    );
  }

  restart(id) {
    const node = this.node(id);
    if (node.online) return;
    node.online = true;
    this.follower(node, node.term);
    this.record(
      "heal",
      `N${id + 1} restarted`,
      "The process returns as a follower with its retained log.",
      id,
    );
  }

  assertSafety() {
    for (const node of this.nodes) {
      if (node.commitIndex >= node.log.length)
        throw new Error("Safety violation: commit beyond log.");
      for (let index = 0; index <= node.commitIndex; index++)
        if (!equalEntry(node.log[index], this.committed[index]))
          throw new Error("Safety violation: committed prefix changed.");
    }
    for (const a of this.nodes)
      for (const b of this.nodes) {
        let prefixMatches = true;
        for (
          let index = 0;
          index < Math.min(a.log.length, b.log.length);
          index++
        ) {
          prefixMatches =
            prefixMatches && equalEntry(a.log[index], b.log[index]);
          if (a.log[index].term === b.log[index].term && !prefixMatches)
            throw new Error("Safety violation: log matching failed.");
        }
      }
    return true;
  }

  snapshot() {
    return clone({
      seed: this.seed,
      tick: this.tick,
      nodes: this.nodes,
      links: this.links,
      queue: this.queue,
      delivered: this.delivered,
      events: this.events,
      committed: this.committed,
      elections: this.elections,
      certificates: this.certificates,
    });
  }
}
