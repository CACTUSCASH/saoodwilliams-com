export const TYPES = [
  "trigger",
  "transform",
  "condition",
  "http",
  "delay",
  "output",
];
export const FIXTURES = ["crm", "billing", "notification"];
const forbidden = new Set(["__proto__", "prototype", "constructor"]);
const clone = (value) => JSON.parse(JSON.stringify(value));
const plain = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const boundedText = (value, limit) =>
  typeof value === "string" && value.length <= limit;
const fail = (message) => {
  throw new Error(message);
};

export function validateInput(value) {
  if (!plain(value)) fail("Input must be a JSON object.");
  if (JSON.stringify(value).length > 65536) fail("Input is limited to 64 KB.");
  const inspect = (item, depth) => {
    if (depth > 12) fail("JSON nesting is limited to 12 levels.");
    if (item && typeof item === "object") {
      for (const [key, child] of Object.entries(item)) {
        if (forbidden.has(key)) fail("Reserved object keys are not allowed.");
        inspect(child, depth + 1);
      }
    } else if (typeof item === "number" && !Number.isFinite(item))
      fail("Numbers must be finite.");
    else if (
      !["string", "number", "boolean"].includes(typeof item) &&
      item !== null
    )
      fail("Input must contain JSON values.");
  };
  inspect(value, 0);
  return value;
}

export function readPath(data, path) {
  if (
    !boundedText(path, 80) ||
    !path ||
    path.split(".").some((part) => forbidden.has(part))
  )
    return undefined;
  return path
    .split(".")
    .reduce(
      (value, key) =>
        value !== null && typeof value === "object" && Object.hasOwn(value, key)
          ? value[key]
          : undefined,
      data,
    );
}

export function validateWorkflow(workflow) {
  validateInput(workflow);
  if (!boundedText(workflow.name, 80) || !workflow.name.trim())
    fail("Give the workflow a name.");
  if (
    !Array.isArray(workflow.nodes) ||
    workflow.nodes.length < 2 ||
    workflow.nodes.length > 20
  )
    fail("A workflow needs 2 to 20 nodes.");
  const ids = new Set();
  for (const node of workflow.nodes) {
    if (!plain(node) || !/^[a-zA-Z][a-zA-Z0-9_-]{0,35}$/.test(node.id))
      fail("Each node needs a valid ID.");
    if (ids.has(node.id)) fail("Node IDs must be unique.");
    ids.add(node.id);
    if (!TYPES.includes(node.type)) fail("Unknown node type.");
    if (!boundedText(node.name, 60) || !node.name.trim())
      fail("Each node needs a name.");
    if (
      ![node.x, node.y].every(
        (value) => Number.isFinite(value) && value >= 0 && value <= 6000,
      )
    )
      fail("Node coordinates must be between 0 and 6000.");
    if (!plain(node.config)) fail("Each node needs a configuration object.");
    const c = node.config;
    if (node.type === "transform") {
      if (!["set", "multiply"].includes(c.action))
        fail("Unknown transform action.");
      if (
        !/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(c.field) ||
        forbidden.has(c.field)
      )
        fail("Transform fields must be safe top-level names.");
      if (c.action === "set" && !boundedText(c.value, 200))
        fail("A set value is limited to 200 characters.");
      if (
        c.action === "multiply" &&
        (!boundedText(c.source, 80) ||
          !c.source ||
          !Number.isFinite(c.factor) ||
          Math.abs(c.factor) > 1e6)
      )
        fail("Multiply needs a source field and a finite factor.");
    }
    if (
      node.type === "condition" &&
      (!boundedText(c.field, 80) ||
        !c.field ||
        !["gte", "eq", "contains"].includes(c.operator) ||
        !["number", "string", "boolean"].includes(typeof c.value))
    )
      fail("Configure a field, comparison, and value.");
    if (
      node.type === "http" &&
      (!FIXTURES.includes(c.fixture) ||
        !Number.isInteger(c.failures) ||
        c.failures < 0 ||
        c.failures > 4 ||
        !Number.isInteger(c.retries) ||
        c.retries < 0 ||
        c.retries > 3)
    )
      fail("Choose a fixture, 0 to 4 failures, and 0 to 3 retries.");
    if (
      node.type === "delay" &&
      (!Number.isInteger(c.ms) || c.ms < 0 || c.ms > 500)
    )
      fail("Delay must be between 0 and 500 milliseconds.");
    if (node.type === "output" && !boundedText(c.message, 160))
      fail("Output message is limited to 160 characters.");
  }
  const triggers = workflow.nodes.filter((node) => node.type === "trigger");
  if (triggers.length !== 1) fail("A workflow needs exactly one trigger.");
  if (!workflow.nodes.some((node) => node.type === "output"))
    fail("Add at least one output node.");
  const byId = new Map(workflow.nodes.map((node) => [node.id, node]));
  for (const node of workflow.nodes) {
    const edges =
      node.type === "condition"
        ? [node.next, node.otherwise]
        : node.type === "output"
          ? []
          : [node.next];
    if (node.type === "output" && (node.next || node.otherwise))
      fail("Output nodes cannot have outgoing connections.");
    if (node.type !== "condition" && node.otherwise)
      fail("Only conditions can have a false branch.");
    for (const edge of edges) {
      if (!edge || !byId.has(edge))
        fail("Every branch must connect to an existing node.");
      if (byId.get(edge).type === "trigger")
        fail("Connections cannot point to the trigger.");
    }
  }
  const visiting = new Set(),
    visited = new Set();
  const visit = (id) => {
    if (visiting.has(id))
      fail("Cycles are not supported. Reconnect the loop before running.");
    if (visited.has(id)) return;
    visiting.add(id);
    const node = byId.get(id);
    if (node.next) visit(node.next);
    if (node.otherwise) visit(node.otherwise);
    visiting.delete(id);
    visited.add(id);
  };
  visit(triggers[0].id);
  if (visited.size !== workflow.nodes.length)
    fail("Every node must be reachable from the trigger.");
  return workflow;
}

function template(text, data) {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    const value = readPath(data, path);
    if (value === undefined)
      fail(`Field "${path}" is missing from the payload.`);
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  });
}

export async function executeWorkflow(workflow, input, options = {}) {
  validateWorkflow(workflow);
  validateInput(input);
  const sleep =
    options.sleep ||
    ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const clock = options.now || (() => Date.now());
  const started = clock();
  const trace = [];
  let data = clone(input),
    id = workflow.nodes.find((node) => node.type === "trigger").id;
  const byId = new Map(workflow.nodes.map((node) => [node.id, node]));
  const event = async (item) => {
    const entry = { ...item, elapsed: Math.max(0, clock() - started) };
    trace.push(entry);
    if (options.onEvent) await options.onEvent(clone(entry));
  };
  let status = "completed",
    message = "Workflow completed.";
  while (id) {
    const node = byId.get(id),
      c = node.config;
    const before = clone(data);
    await event({
      nodeId: id,
      name: node.name,
      type: node.type,
      status: "running",
      message: "Running node.",
    });
    let next = node.next;
    try {
      let detail = "Payload received.";
      if (node.type === "transform") {
        if (c.action === "set") data[c.field] = template(c.value, data);
        else {
          const source = readPath(data, c.source);
          if (typeof source !== "number" || !Number.isFinite(source * c.factor))
            fail(`Field "${c.source}" must be a finite number.`);
          data[c.field] = Math.round(source * c.factor * 100) / 100;
        }
        detail = `Set ${c.field}.`;
      } else if (node.type === "condition") {
        const value = readPath(data, c.field);
        if (value === undefined)
          fail(`Field "${c.field}" is missing from the payload.`);
        const passed =
          c.operator === "gte"
            ? typeof value === "number" &&
              typeof c.value === "number" &&
              value >= c.value
            : c.operator === "eq"
              ? value === c.value
              : String(value).includes(String(c.value));
        next = passed ? node.next : node.otherwise;
        detail = `Condition ${passed ? "true" : "false"}: following ${byId.get(next).name}.`;
      } else if (node.type === "http") {
        for (let attempt = 1; attempt <= c.retries + 1; attempt++) {
          await sleep(90);
          if (attempt <= c.failures) {
            if (attempt > c.retries)
              fail(
                `Simulated ${c.fixture} returned 503 after ${attempt} attempt${attempt === 1 ? "" : "s"}.`,
              );
            await event({
              nodeId: id,
              name: node.name,
              type: node.type,
              status: "retry",
              attempt,
              message: `Simulated 503. Retry ${attempt} of ${c.retries}.`,
            });
            await sleep(Math.min(50 * 2 ** (attempt - 1), 200));
            continue;
          }
          data.response = {
            fixture: c.fixture,
            status: 200,
            attempt,
            reference: `${c.fixture.toUpperCase()}-1042`,
            simulated: true,
          };
          detail = `Simulated 200 from ${c.fixture}, attempt ${attempt}.`;
          break;
        }
      } else if (node.type === "delay") {
        await sleep(c.ms);
        detail = `Waited ${c.ms} ms.`;
      } else if (node.type === "output") {
        message = template(c.message, data);
        detail = message;
        next = null;
      }
      validateInput(data);
      await event({
        nodeId: id,
        name: node.name,
        type: node.type,
        status: "completed",
        message: detail,
        input: before,
        output: clone(data),
        next: next || null,
      });
      id = next;
    } catch (error) {
      status = "failed";
      message = error.message;
      await event({
        nodeId: id,
        name: node.name,
        type: node.type,
        status: "failed",
        message,
        input: before,
        output: clone(data),
      });
      break;
    }
  }
  return {
    status,
    message,
    duration: Math.max(0, clock() - started),
    output: data,
    trace,
  };
}
