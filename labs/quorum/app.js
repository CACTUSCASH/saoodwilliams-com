import { Cluster } from "./model.js";

const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const preview = new URLSearchParams(location.search).get("preview") === "1";
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
document.body.classList.toggle("preview", preview);
const positions = [
  [150, 210],
  [380, 111],
  [610, 210],
  [520, 410],
  [240, 410],
];
let cluster = new Cluster(19);
let selected = 1;
let target = null;
let playing = false;
let frame = null;
let lastTime = 0;
let elapsed = 0;
let parentPaused = true;
let parentVisible = false;
let previewWrites = 0;

function status(text, error = false) {
  $("#status").textContent = text;
  $("#status").classList.toggle("error", error);
}

function warmCluster() {
  cluster.step(45);
  cluster.write("SET region=cape-town");
  cluster.step(14);
  cluster.write("SET replicas=3");
  cluster.step(12);
}
warmCluster();

function packetPath(from, to, progress) {
  const a = positions[from],
    b = positions[to];
  const bend = from < to ? -13 : 13;
  const mid = [(a[0] + b[0]) / 2 + bend, (a[1] + b[1]) / 2 - 22];
  const t = Math.max(0, Math.min(1, progress)),
    u = 1 - t;
  return [
    u * u * a[0] + 2 * u * t * mid[0] + t * t * b[0],
    u * u * a[1] + 2 * u * t * mid[1] + t * t * b[1],
  ];
}

function renderPackets(fraction = 0) {
  $("#packets").innerHTML = cluster.queue
    .filter(
      (message) =>
        cluster.connected(message.from, message.to) &&
        cluster.nodes[message.to].online,
    )
    .map((message) => {
      const progress =
        (cluster.tick + fraction - message.sent) / (message.due - message.sent);
      const [x, y] = packetPath(message.from, message.to, progress);
      const kind =
        message.type === "vote"
          ? "vote"
          : message.type.endsWith("result")
            ? "reply"
            : "";
      return `<circle class="packet ${kind}" cx="${x}" cy="${y}" r="${kind === "reply" ? 2.5 : 3.5}"><title>${esc(message.type)}: N${message.from + 1} to N${message.to + 1}, term ${message.term}</title></circle>`;
    })
    .join("");
}

function renderNetwork() {
  $("#links").innerHTML = cluster.nodes
    .flatMap((a) =>
      cluster.nodes
        .filter((b) => b.id > a.id)
        .map((b) => {
          const start = positions[a.id],
            end = positions[b.id];
          const middle = [
            (start[0] + end[0]) / 2 - 13,
            (start[1] + end[1]) / 2 - 22,
          ];
          return `<path class="network-link ${cluster.connected(a.id, b.id) ? "" : "cut"}" d="M${start.join(",")} Q${middle.join(",")} ${end.join(",")}"/>`;
        }),
    )
    .join("");
  $("#node-art").innerHTML = cluster.nodes
    .map((node) => {
      const [x, y] = positions[node.id];
      return `<g class="server-node ${node.role} ${selected === node.id ? "selected" : ""}" transform="translate(${x} ${y})"><ellipse class="node-shadow" cy="27" rx="62" ry="22"/><ellipse class="selection-ring" cy="18" rx="73" ry="40"/>${node.role === "leader" ? '<ellipse class="leader-halo" cy="10" rx="83" ry="46"/>' : ""}<path class="server-top" d="M-40,-32 -7,-47 42,-27 9,-12Z"/><path class="server-front" d="M-40,-32 9,-12 9,32 -40,12Z"/><path class="server-side" d="M9,-12 42,-27 42,17 9,32Z"/><path class="server-line" d="M-35,-14 3,1M-35,-3 3,12M-35,8 3,23M16,1 35,-8M16,12 35,3"/><circle class="server-light" cx="-30" cy="-17" r="2"/><circle class="server-light" cx="-22" cy="-14" r="2"/><text class="node-name" text-anchor="middle" y="60">NODE 0${node.id + 1}</text><text class="node-role" text-anchor="middle" y="76">${node.role}</text><text class="node-term" text-anchor="middle" y="91">TERM ${node.term} / COMMIT ${node.commitIndex + 1}</text></g>`;
    })
    .join("");
  cluster.nodes.forEach((node) => {
    const button = $("#nodeControls").children[node.id];
    button.setAttribute(
      "aria-label",
      `Inspect node ${node.id + 1}, ${node.role}, term ${node.term}`,
    );
    button.setAttribute("aria-pressed", selected === node.id);
  });
  const leaders = cluster.leaders();
  $("#clusterState").textContent =
    leaders.length === 1
      ? `N${leaders[0].id + 1} / TERM ${leaders[0].term}`
      : leaders.length
        ? `${leaders.length} LEADER CLAIMS`
        : "ELECTION PENDING";
  $("#clusterState").classList.toggle("warning", leaders.length !== 1);
  $("#network").setAttribute(
    "aria-label",
    `${cluster.nodes.filter((node) => node.online).length} online nodes. ${leaders.map((node) => `Node ${node.id + 1} claims leadership in term ${node.term}`).join(". ") || "No elected leader"}. Select a node below to inspect it.`,
  );
  renderPackets();
}

function renderInspector() {
  const node = cluster.nodes[selected];
  const neighbors = cluster.nodes.filter(
    (peer) => peer.online && cluster.connected(selected, peer.id),
  ).length;
  $("#inspectorTitle").textContent = `Node 0${node.id + 1}`;
  $("#nodeState").textContent = node.role;
  $("#inspectorGlyph").classList.toggle("offline", !node.online);
  $("#nodeFacts").innerHTML = [
    ["Current term", node.term],
    ["Voted for", node.votedFor === null ? "No vote" : `N${node.votedFor + 1}`],
    ["Log entries", node.log.length],
    ["Commit index", node.commitIndex + 1],
    ["Reachable peers", `${neighbors} / 4`],
    [
      "Election in",
      !node.online
        ? "Offline"
        : node.role === "leader"
          ? "Heartbeat active"
          : `${Math.max(0, node.deadline - cluster.tick)} ticks`,
    ],
  ]
    .map(
      ([label, value]) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`,
    )
    .join("");
  $("#nodeExplanation").textContent = !node.online
    ? "The process is stopped. Its term, vote, and log remain available after a restart."
    : node.role === "leader"
      ? neighbors < 2
        ? "This leader cannot reach a majority. New writes can enter its log, but cannot be committed."
        : "This node accepts client writes and asks peers to replicate them. Three matching acknowledgements can commit an entry."
      : node.role === "candidate"
        ? `This node is asking for votes in term ${node.term}. It has ${node.votes.length} of the three votes needed.`
        : "This node votes once per term and accepts entries whose preceding log index and term match its own.";
  const fullyConnected = cluster.links[selected].filter(Boolean).length === 4;
  $("#nodeConnection").textContent = fullyConnected
    ? "Isolate node"
    : "Reconnect node";
  $("#nodePower").textContent = node.online ? "Crash node" : "Restart node";
}

function renderLogs() {
  const visibleLimit = preview ? 4 : 96;
  $("#logs").innerHTML = cluster.nodes
    .map((node) => {
      const start = Math.max(0, node.log.length - visibleLimit);
      return `<div class="log-row"><span class="log-label ${node.role}"><i></i>N0${node.id + 1}</span>${
        node.log.length
          ? node.log
              .slice(start)
              .map((entry, offset) => {
                const index = start + offset;
                return `<span class="log-entry ${index <= node.commitIndex ? "committed" : ""} ${entry.kind === "barrier" ? "barrier" : ""}" title="${esc(`Index ${index + 1}, term ${entry.term}, ${entry.command}, ${index <= node.commitIndex ? "committed" : "pending"}`)}" aria-label="${esc(`Index ${index + 1}, term ${entry.term}, ${entry.command}, ${index <= node.commitIndex ? "committed" : "pending"}`)}">${entry.kind === "barrier" ? "B" : index + 1}<small>T${entry.term}</small></span>`;
              })
              .join("")
          : '<span class="empty-log">No entries yet</span>'
      }</div>`;
    })
    .join("");
  const leaders = cluster.leaders();
  if (!leaders.some((node) => node.id === target))
    target = leaders[0]?.id ?? null;
  const options = leaders.length
    ? leaders
        .map(
          (node) =>
            `<option value="${node.id}">N${node.id + 1} / term ${node.term}</option>`,
        )
        .join("")
    : '<option value="">No leader</option>';
  if ($("#writeTarget").innerHTML !== options)
    $("#writeTarget").innerHTML = options;
  $("#writeTarget").value = target === null ? "" : String(target);
  $("#submitWrite").disabled = target === null;
  $("#crashLeader").disabled = leaders.length === 0;
}

function render() {
  const committed = cluster.committed.filter(
    (entry) => entry.kind === "write",
  ).length;
  $("#metrics").innerHTML = [
    ["SIMULATION TIME", cluster.tick, "ticks"],
    [
      "ONLINE VOTERS",
      cluster.nodes.filter((node) => node.online).length,
      "/ 5",
    ],
    ["COMMITTED WRITES", committed, "entries"],
    ["MESSAGES IN FLIGHT", cluster.queue.length, "RPCs"],
  ]
    .map(
      ([label, value, unit]) =>
        `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${unit}</small></div>`,
    )
    .join("");
  renderNetwork();
  renderInspector();
  renderLogs();
  $("#events").innerHTML = cluster.events
    .slice(-24)
    .reverse()
    .map(
      (event) =>
        `<li data-type="${event.type}"><span class="event-time">T+${String(event.tick).padStart(3, "0")}</span><span class="event-title">${esc(event.title)}</span><span class="event-detail">${esc(event.detail)}</span></li>`,
    )
    .join("");
}

function advance() {
  cluster.step();
  if (
    preview &&
    cluster.tick % 36 === 0 &&
    previewWrites < 4 &&
    cluster.leaders().length
  ) {
    cluster.write(
      ["SET mode=active", "SET quorum=3", "SET region=west", "SET replicas=5"][
        previewWrites++
      ],
    );
  }
  if (preview && cluster.tick > 245) playing = false;
  render();
}

function allowedToPlay() {
  return (
    playing &&
    !document.hidden &&
    (!preview || (!parentPaused && parentVisible && !reduced.matches))
  );
}
function cancelLoop() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  lastTime = 0;
}
function loop(time) {
  frame = null;
  if (!allowedToPlay()) return;
  if (!lastTime) lastTime = time;
  elapsed += Math.min(time - lastTime, 200);
  lastTime = time;
  const duration = 650 / Number($("#speed").value);
  try {
    while (elapsed >= duration && allowedToPlay()) {
      elapsed -= duration;
      advance();
    }
    if (!reduced.matches) renderPackets(elapsed / duration);
  } catch (error) {
    playing = false;
    status(error.message, true);
  }
  syncPlayButton();
  if (allowedToPlay()) frame = requestAnimationFrame(loop);
}
function syncPlayButton() {
  $("#play").textContent = playing ? "Pause simulation" : "Play simulation";
  $("#play").setAttribute("aria-pressed", playing);
}
function syncLoop() {
  cancelLoop();
  if (allowedToPlay()) frame = requestAnimationFrame(loop);
  syncPlayButton();
}
function act(action, message) {
  try {
    action();
    render();
    if (message) status(message);
  } catch (error) {
    status(error.message, true);
  }
}

$("#nodeControls").innerHTML = positions
  .map(
    ([x, y], id) =>
      `<button class="node-hit" data-node="${id}" style="left:${x / 7.6}%;top:${(y + 13) / 5.2}%" aria-label="Inspect node ${id + 1}" aria-pressed="${id === selected}">Node ${id + 1}</button>`,
  )
  .join("");
$("#nodeControls").addEventListener("click", (event) => {
  const button = event.target.closest("[data-node]");
  if (!button) return;
  selected = Number(button.dataset.node);
  renderNetwork();
  renderInspector();
});
$("#play").onclick = () => {
  playing = !playing;
  syncLoop();
  status(
    playing
      ? "Simulation running. Every tick delivers scheduled messages and checks node timers."
      : "Simulation paused. Step advances one logical tick.",
  );
};
$("#step").onclick = () => {
  playing = false;
  syncLoop();
  act(
    advance,
    "Advanced one tick. The topology and journal show the current model state.",
  );
};
$("#speed").onchange = () => {
  elapsed = 0;
};
$("#reset").onclick = () => {
  const raw = $("#seed").value;
  act(() => {
    if (raw.trim() === "") throw new Error("Enter a numeric seed.");
    const next = new Cluster(Number(raw));
    playing = false;
    syncLoop();
    cluster = next;
    target = null;
    elapsed = 0;
  }, "Reset to tick zero. Start an election with Play or Step.");
};
$("#partition").onclick = () =>
  act(() => {
    const id = cluster.leaders()[0]?.id ?? selected;
    cluster.partition([id, (id + 1) % 5]);
  }, "Network split. The previous leader is in the two-node minority. The other three nodes can elect a new leader.");
$("#crashLeader").onclick = () =>
  act(() => {
    const leader = cluster.leaders()[0];
    if (!leader) throw new Error("There is no online leader to crash.");
    cluster.crash(leader.id);
  }, "Leader crashed. Continue stepping to observe the next election.");
$("#heal").onclick = () =>
  act(() => {
    cluster.heal();
    cluster.nodes.forEach((node) => cluster.restart(node.id));
  }, "All links and processes restored. Continue the simulation to reconcile logs.");
$("#nodeConnection").onclick = () =>
  act(
    () => {
      if (cluster.links[selected].filter(Boolean).length === 4)
        cluster.isolate(selected);
      else cluster.reconnect(selected);
    },
    `Network links updated for N${selected + 1}.`,
  );
$("#nodePower").onclick = () =>
  act(
    () => {
      if (cluster.nodes[selected].online) cluster.crash(selected);
      else cluster.restart(selected);
    },
    `Process state updated for N${selected + 1}.`,
  );
$("#writeTarget").onchange = () => {
  target = Number($("#writeTarget").value);
};
$("#writeForm").onsubmit = (event) => {
  event.preventDefault();
  act(
    () => cluster.write($("#command").value, target),
    "Write accepted locally. Step or play to see whether a majority can commit it.",
  );
};
$("#export").onclick = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(cluster.snapshot(), null, 2)], {
      type: "application/json",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `quorum-seed-${cluster.seed}-tick-${cluster.tick}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status(
    "Exported the full model snapshot, log entries, event journal, and commit certificates.",
  );
};
document.addEventListener("visibilitychange", syncLoop);
reduced.addEventListener("change", () => {
  if (reduced.matches) {
    playing = false;
    cancelLoop();
    renderPackets();
  }
  syncPlayButton();
});
addEventListener("message", (event) => {
  if (
    !preview ||
    event.source !== parent ||
    event.origin !== location.origin ||
    event.data?.type !== "portfolio-motion" ||
    typeof event.data.paused !== "boolean" ||
    typeof event.data.visible !== "boolean"
  )
    return;
  parentPaused = event.data.paused;
  parentVisible = event.data.visible;
  if (cluster.tick <= 245) playing = true;
  syncLoop();
});
addEventListener("pagehide", cancelLoop);
render();
syncPlayButton();
status(
  "A seeded run is paused at tick 71. Submit a write, introduce a fault, or reset to watch the first election.",
);
if (preview) playing = true;
