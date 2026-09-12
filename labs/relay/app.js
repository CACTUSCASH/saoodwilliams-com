import {
  TYPES,
  FIXTURES,
  executeWorkflow,
  validateWorkflow,
  validateInput,
} from "./engine.js";
import { copyPreset } from "./presets.js";

const $ = (selector) => document.querySelector(selector);
const escape = (text) =>
  String(text ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const clone = (value) => JSON.parse(JSON.stringify(value));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const preview = new URLSearchParams(location.search).has("preview");
if (preview) document.body.classList.add("preview");
let previewSuppressed = reducedMotion;
let previewPlayed = false;
let previewTimer = null;
let previewWait = null;
function schedulePreview() {
  if (!preview || previewSuppressed || previewPlayed || previewTimer !== null)
    return;
  previewTimer = setTimeout(() => {
    previewTimer = null;
    if (previewSuppressed || previewPlayed) return;
    previewPlayed = true;
    runWorkflow();
  }, 700);
}
function previewSleep(ms) {
  if (previewSuppressed) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      previewWait = null;
      resolve();
    }, ms);
    previewWait = () => {
      clearTimeout(timer);
      previewWait = null;
      resolve();
    };
  });
}
if (preview)
  addEventListener("message", (event) => {
    if (
      event.source !== parent ||
      event.origin !== location.origin ||
      event.data?.type !== "portfolio-motion"
    )
      return;
    previewSuppressed =
      reducedMotion ||
      event.data.paused === true ||
      event.data.visible === false;
    if (previewSuppressed) {
      clearTimeout(previewTimer);
      previewTimer = null;
      previewWait?.();
    } else schedulePreview();
  });
const keys = { workflow: "relay.workflow.v1", runs: "relay.runs.v1" };
let workflow = copyPreset("orders"),
  selected = workflow.nodes[2].id,
  tab = "node",
  history = [],
  currentRun = null,
  trace = [],
  activeTrace = null,
  running = false,
  backend = false;
let toastTimer,
  scale = 1;
let inputText = JSON.stringify(workflow.input, null, 2);
const glyphs = {
  trigger: ">",
  transform: "fx",
  condition: "<>",
  http: "{}",
  delay: "t",
  output: "=",
};
const help = {
  trigger:
    "The entry point. Edit the JSON input to send a different payload through this workflow.",
  transform:
    "Set a new top-level field, or multiply a numeric field. Templates read payload values using {{field.path}}.",
  condition:
    "Compare a payload field, then send the result down the true or false connection.",
  http: "A deterministic HTTP fixture. Simulate failures and test retry behavior without sending network requests.",
  delay:
    "Pause execution for a short, measured interval. The maximum delay per node is 500 ms.",
  output:
    "Finish the workflow and return its payload. Your message can include {{field.path}} values.",
};

function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3500);
}
async function api(path, options = {}) {
  const response = await fetch(`./api/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || "Request failed.");
  return value;
}
function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    toast(
      "Browser storage is full or unavailable. Export your workflow to keep a copy.",
    );
    return false;
  }
}
function subtext(node) {
  const c = node.config;
  if (node.type === "trigger") return "JSON payload";
  if (node.type === "transform")
    return c.action === "multiply"
      ? `${c.source} × ${c.factor}`
      : `set ${c.field}`;
  if (node.type === "condition")
    return `${c.field} ${c.operator === "gte" ? "≥" : c.operator === "eq" ? "=" : "contains"} ${c.value}`;
  if (node.type === "http") return `SIMULATED / ${c.fixture}`;
  if (node.type === "delay") return `${c.ms} ms interval`;
  return "Return payload";
}
function statusFor(id) {
  return (
    [...trace].reverse().find((event) => event.nodeId === id)?.status || ""
  );
}
function dimensions() {
  const width = Math.max(
    1180,
    ...workflow.nodes.map((node) => Number(node.x || 45) + 230),
  );
  const height = Math.max(
    470,
    ...workflow.nodes.map((node) => Number(node.y || 170) + 180),
  );
  return { width, height };
}
function fit() {
  const viewport = $("#canvas-viewport"),
    world = $("#canvas-world");
  const { width, height } = dimensions();
  const small = viewport.clientWidth < 600;
  scale = Math.min(
    viewport.clientWidth / width,
    viewport.clientHeight / height,
  );
  if (small && !preview) {
    scale = Math.max(scale, 0.78);
    viewport.style.overflowX = "auto";
    viewport.style.overflowY = "hidden";
  } else viewport.style.overflow = "hidden";
  world.style.width = `${width}px`;
  world.style.height = `${height}px`;
  world.style.transform = `scale(${scale})`;
  world.style.top = `${Math.max(0, (viewport.clientHeight - height * scale) / 2)}px`;
  world.style.left =
    small && !preview
      ? "0px"
      : `${Math.max(0, (viewport.clientWidth - width * scale) / 2)}px`;
}
function renderCanvas() {
  const { width, height } = dimensions();
  const edges = [];
  for (const node of workflow.nodes) {
    for (const [target, label] of [
      [node.next, node.type === "condition" ? "true" : ""],
      [node.otherwise, "false"],
    ]) {
      const destination = workflow.nodes.find((item) => item.id === target);
      if (!destination) continue;
      const x1 = node.x + 185,
        y1 = node.y + 56,
        x2 = destination.x,
        y2 = destination.y + 56;
      const control = Math.max(55, Math.abs(x2 - x1) * 0.5);
      const visited = trace.some(
        (event) =>
          event.nodeId === node.id &&
          event.next === target &&
          event.status === "completed",
      );
      edges.push(
        `<path class="edge ${visited ? "active" : ""}" d="M${x1},${y1} C${x1 + control},${y1} ${x2 - control},${y2} ${x2},${y2}"/>${label ? `<text class="edge-label" x="${x1 + 13}" y="${y1 + (label === "true" ? -13 : 25)}">${label}</text>` : ""}`,
      );
    }
  }
  $("#connections").setAttribute("viewBox", `0 0 ${width} ${height}`);
  $("#connections").style.width = `${width}px`;
  $("#connections").style.height = `${height}px`;
  $("#connections").innerHTML = edges.join("");
  $("#nodes").innerHTML = workflow.nodes
    .map((node) => {
      const state = statusFor(node.id);
      return `<button class="node ${node.id === selected ? "selected" : ""} ${state}" data-id="${escape(node.id)}" data-type="${escape(node.type)}" style="left:${Number(node.x)}px;top:${Number(node.y)}px" aria-label="${escape(node.name)}, ${escape(node.type)}${state ? `, ${state}` : ""}" aria-pressed="${node.id === selected}"><span class="node-icon" aria-hidden="true">${escape(glyphs[node.type])}</span><span class="node-type">${escape(node.type)}</span><strong>${escape(node.name)}</strong><small>${escape(subtext(node))}</small>${state ? `<span class="node-status">${state === "completed" ? "OK" : state === "running" ? "RUN" : state === "retry" ? "RETRY" : "FAIL"}</span>` : ""}</button>`;
    })
    .join("");
  $("#node-count").textContent =
    `${workflow.nodes.length} nodes / ${edges.length} connections`;
  fit();
}
const options = (list, value, label = (item) => item) =>
  list
    .map(
      (item) =>
        `<option value="${escape(item)}" ${String(item) === String(value) ? "selected" : ""}>${escape(label(item))}</option>`,
    )
    .join("");
const input = (name, label, value, type = "text", attributes = "") =>
  `<label for="field-${name}">${label}</label><input id="field-${name}" name="${name}" type="${type}" value="${escape(value)}" ${attributes}/>`;
const select = (name, label, content) =>
  `<label for="field-${name}">${label}</label><select name="${name}" id="field-${name}">${content}</select>`;
function connectionSelect(name, label, value, node) {
  return select(
    name,
    label,
    '<option value="">Choose a node</option>' +
      options(
        workflow.nodes
          .filter((item) => item.id !== node.id && item.type !== "trigger")
          .map((item) => item.id),
        value,
        (id) => workflow.nodes.find((item) => item.id === id).name,
      ),
  );
}
function renderInspector() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.tab === tab);
    button.setAttribute("aria-pressed", String(button.dataset.tab === tab));
  });
  if (tab === "input") {
    $("#inspector-body").innerHTML =
      `<div class="inspector-eyebrow">Workflow input</div><h3>Start with a payload.</h3><p>Edit this JSON and run again. For the order preset, try a subtotal below 170 to take the other branch.</p><label for="payload">Input JSON</label><textarea id="payload" class="payload" spellcheck="false">${escape(inputText)}</textarea><p class="note">Sample records are fictional. Changes stay in this browser when using demo mode.</p>`;
    return;
  }
  if (tab === "output") {
    const event = activeTrace !== null ? trace[activeTrace] : null;
    $("#inspector-body").innerHTML =
      `<div class="inspector-eyebrow">${event ? "Step inspection" : "Execution output"}</div><h3>${escape(event?.name || (currentRun ? "Payload delivered." : "Nothing here yet."))}</h3><p>${escape(event?.message || currentRun?.message || "Run a workflow, then inspect the output of every visited node.")}</p>${event?.input ? `<label>Before this step</label><pre>${escape(JSON.stringify(event.input, null, 2))}</pre>` : ""}${event?.output || currentRun ? `<label>${event ? "After this step" : "Final output"}</label><pre>${escape(JSON.stringify(event?.output || currentRun.output, null, 2))}</pre>` : ""}`;
    return;
  }
  const node =
    workflow.nodes.find((item) => item.id === selected) || workflow.nodes[0];
  selected = node.id;
  const c = node.config;
  let fields = input(
    "name",
    "Step name",
    node.name,
    "text",
    'maxlength="60" required',
  );
  if (!["trigger", "output"].includes(node.type))
    fields += select(
      "type",
      "Step type",
      options(["transform", "condition", "http", "delay"], node.type),
    );
  if (node.type === "transform") {
    fields += select(
      "action",
      "Operation",
      options(["set", "multiply"], c.action, (item) =>
        item === "set" ? "Set a field" : "Multiply a number",
      ),
    );
    fields += input(
      "field",
      "Output field",
      c.field,
      "text",
      'maxlength="40" required',
    );
    fields +=
      c.action === "multiply"
        ? input(
            "source",
            "Source field",
            c.source,
            "text",
            'maxlength="80" required',
          ) +
          input(
            "factor",
            "Multiplier",
            c.factor,
            "number",
            'step="any" required',
          )
        : input(
            "value",
            "Value / template",
            c.value,
            "text",
            'maxlength="200"',
          );
  } else if (node.type === "condition") {
    fields += input(
      "field",
      "Payload field",
      c.field,
      "text",
      'maxlength="80" required',
    );
    fields += select(
      "operator",
      "Comparison",
      options(
        ["gte", "eq", "contains"],
        c.operator,
        (item) =>
          ({
            gte: "Greater than or equal",
            eq: "Equals (same type)",
            contains: "Contains text",
          })[item],
      ),
    );
    fields += input(
      "value",
      "Compare with (JSON or text)",
      typeof c.value === "string" ? JSON.stringify(c.value) : c.value,
      "text",
      'required maxlength="200"',
    );
  } else if (node.type === "http") {
    fields += select(
      "fixture",
      "Simulated service",
      options(FIXTURES, c.fixture),
    );
    fields += `<div class="field-pair">${input("failures", "Fail first N tries", c.failures, "number", 'min="0" max="4" required')}${input("retries", "Retry budget", c.retries, "number", 'min="0" max="3" required')}</div>`;
  } else if (node.type === "delay")
    fields += input(
      "ms",
      "Delay (milliseconds)",
      c.ms,
      "number",
      'min="0" max="500" required',
    );
  else if (node.type === "output")
    fields += input(
      "message",
      "Completion message",
      c.message,
      "text",
      'maxlength="160"',
    );
  if (node.type !== "output")
    fields +=
      "<hr>" +
      connectionSelect(
        "next",
        node.type === "condition" ? "If true, connect to" : "Next step",
        node.next,
        node,
      );
  if (node.type === "condition")
    fields += connectionSelect(
      "otherwise",
      "If false, connect to",
      node.otherwise,
      node,
    );
  $("#inspector-body").innerHTML =
    `<div class="inspector-eyebrow"><span>${escape(node.type)} node</span><span>${String(workflow.nodes.indexOf(node) + 1).padStart(2, "0")}</span></div><h3>${escape(node.name)}</h3><p>${help[node.type]}</p><form id="node-form">${fields}<button class="apply" type="submit" ${running ? "disabled" : ""}>Apply changes</button></form>${!["trigger", "output"].includes(node.type) ? '<button class="delete-node" id="delete-node">Remove step</button>' : ""}${node.type === "http" ? '<p class="note">The fixture returns 503 for the first N attempts, then 200. The retry delay grows after each failure.</p>' : ""}`;
}
function renderTrace() {
  const items = trace
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => event.status !== "running");
  $("#trace-count").textContent = items.length;
  if (!items.length) {
    $("#trace").className = "trace-empty";
    $("#trace").innerHTML = running
      ? "Following your payload..."
      : "Your payload has somewhere to go.<br><span>Run the workflow to follow it through each step.</span>";
  } else {
    $("#trace").className = "";
    $("#trace").innerHTML = items
      .map(
        ({ event, index }) =>
          `<button class="trace-row ${escape(event.status)}" data-trace="${index}" aria-label="Inspect ${escape(event.name)}: ${escape(event.message)}"><span class="trace-state"></span><strong>${escape(event.name)}</strong><span class="trace-message">${escape(event.message)}</span><time>${event.elapsed}ms</time></button>`,
      )
      .join("");
    $("#trace").scrollTop = $("#trace").scrollHeight;
  }
  $("#run-summary").textContent = running
    ? "Execution in progress"
    : currentRun
      ? `${currentRun.status} / ${currentRun.duration} ms`
      : "Waiting for a run";
}
function renderHistory() {
  $("#history-list").className = history.length
    ? "history-table"
    : "history-empty";
  $("#history-list").innerHTML = history.length
    ? history
        .map(
          (run) =>
            `<button class="history-row" data-run="${escape(run.id)}"><span>${escape(run.name)}<br><small>${escape(run.id.slice(0, 8))}</small></span><span class="run-status ${escape(run.status)}">${escape(run.status)}</span><small>${run.duration} ms</small><small>${new Date(run.created).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></button>`,
        )
        .join("")
    : "Run a workflow to start its history.";
}
function validate() {
  try {
    validateWorkflow(workflow);
    $("#validation-state").textContent = running
      ? "Running workflow"
      : "Ready to run";
    return true;
  } catch (error) {
    $("#validation-state").textContent = "Connections need attention";
    return false;
  }
}
function render() {
  $("#workflow-title").textContent = workflow.name;
  $("#workflow-description").textContent =
    workflow.description || "Connect steps and inspect the result.";
  renderCanvas();
  renderInspector();
  renderTrace();
  renderHistory();
  validate();
}
function guard() {
  if (!running) return false;
  toast("Wait for the current run to finish.");
  return true;
}
function setBusy(value) {
  running = value;
  $("#run").disabled = value;
  $("#save").disabled = value;
  $("#add").disabled = value;
  $("#preset").disabled = value;
  $("#run").innerHTML = value
    ? '<span aria-hidden="true">...</span> Running'
    : '<span class="play-icon" aria-hidden="true"></span> Run workflow';
  validate();
}
async function runWorkflow() {
  if (guard()) return;
  let input;
  try {
    input = JSON.parse(inputText);
    validateInput(input);
    validateWorkflow(workflow);
  } catch (error) {
    toast(error.message);
    return;
  }
  trace = [];
  currentRun = null;
  activeTrace = null;
  setBusy(true);
  renderTrace();
  renderCanvas();
  try {
    const snapshot = clone(workflow);
    const onEvent = async (event) => {
      trace.push(event);
      if (preview && previewSuppressed) return;
      renderCanvas();
      renderTrace();
      if (!preview && !reducedMotion)
        await sleep(event.status === "running" ? 180 : 65);
    };
    if (backend) {
      currentRun = await api("runs", {
        method: "POST",
        body: JSON.stringify({ workflow: snapshot, input }),
      });
      for (const event of currentRun.trace) await onEvent(event);
      history = await api("runs");
    } else {
      const result = await executeWorkflow(snapshot, input, {
        onEvent,
        ...(preview ? { sleep: previewSleep } : {}),
      });
      currentRun = {
        id: crypto.randomUUID(),
        created: new Date().toISOString(),
        name: workflow.name,
        workflow: snapshot,
        input,
        ...result,
      };
      history.unshift(currentRun);
      history = history.slice(0, 12);
      if (!preview) persist(keys.runs, history);
    }
    if (!preview)
      toast(
        currentRun.status === "completed"
          ? "Workflow completed. Inspect any step in the trace."
          : currentRun.message,
      );
  } catch (error) {
    toast(error.message);
  } finally {
    setBusy(false);
    renderCanvas();
    renderTrace();
    renderHistory();
    if (tab === "output") renderInspector();
  }
}

$("#nodes").addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (!button) return;
  selected = button.dataset.id;
  tab = "node";
  renderCanvas();
  renderInspector();
});
document.querySelectorAll("[data-tab]").forEach((button) =>
  button.addEventListener("click", () => {
    tab = button.dataset.tab;
    activeTrace = null;
    renderInspector();
  }),
);
$("#inspector-body").addEventListener("input", (event) => {
  if (event.target.id === "payload") inputText = event.target.value;
});
$("#inspector-body").addEventListener("change", (event) => {
  if (event.target.name === "type") {
    if (guard()) return;
    const node = workflow.nodes.find((item) => item.id === selected);
    node.type = event.target.value;
    const defaults = {
      transform: { action: "set", field: "processedBy", value: "Relay" },
      condition: { field: "subtotal", operator: "gte", value: 100 },
      http: { fixture: "notification", failures: 0, retries: 2 },
      delay: { ms: 100 },
    };
    node.config = defaults[node.type];
    if (node.type === "condition") node.otherwise = node.next;
    else delete node.otherwise;
    trace = [];
    currentRun = null;
    render();
    return;
  }
  if (event.target.name !== "action" || guard()) return;
  const node = workflow.nodes.find((item) => item.id === selected);
  node.config =
    event.target.value === "multiply"
      ? {
          action: "multiply",
          field: node.config.field,
          source: "subtotal",
          factor: 1,
        }
      : { action: "set", field: node.config.field, value: "" };
  renderInspector();
  renderCanvas();
});
$("#inspector-body").addEventListener("submit", (event) => {
  event.preventDefault();
  if (guard()) return;
  const values = Object.fromEntries(new FormData(event.target));
  const node = workflow.nodes.find((item) => item.id === selected),
    c = {};
  node.name = values.name.trim();
  if (node.type === "transform")
    Object.assign(
      c,
      values.action === "multiply"
        ? {
            action: "multiply",
            field: values.field,
            source: values.source,
            factor: Number(values.factor),
          }
        : { action: "set", field: values.field, value: values.value },
    );
  if (node.type === "condition") {
    let value = values.value;
    try {
      const parsed = JSON.parse(value);
      if (["string", "number", "boolean"].includes(typeof parsed))
        value = parsed;
    } catch {}
    Object.assign(c, { field: values.field, operator: values.operator, value });
  }
  if (node.type === "http")
    Object.assign(c, {
      fixture: values.fixture,
      failures: Number(values.failures),
      retries: Number(values.retries),
    });
  if (node.type === "delay") c.ms = Number(values.ms);
  if (node.type === "output") c.message = values.message;
  node.config = c;
  if (node.type !== "output") node.next = values.next;
  if (node.type === "condition") node.otherwise = values.otherwise;
  trace = [];
  currentRun = null;
  render();
  try {
    validateWorkflow(workflow);
    toast("Step updated.");
  } catch (error) {
    toast(error.message);
  }
});
$("#inspector-body").addEventListener("click", (event) => {
  if (event.target.id !== "delete-node" || guard()) return;
  const node = workflow.nodes.find((item) => item.id === selected);
  if (["trigger", "output"].includes(node.type)) return;
  for (const other of workflow.nodes) {
    if (other.next === node.id) other.next = node.next;
    if (other.otherwise === node.id) other.otherwise = node.next;
  }
  workflow.nodes = workflow.nodes.filter((item) => item.id !== node.id);
  selected = workflow.nodes[0].id;
  trace = [];
  currentRun = null;
  render();
  toast("Step removed. Review its connections before running.");
});
$("#add").addEventListener("click", () => {
  if (guard()) return;
  if (workflow.nodes.length >= 20)
    return toast("A workflow supports up to 20 nodes.");
  const output = workflow.nodes.find((node) => node.type === "output");
  const id = `step-${crypto.randomUUID().slice(0, 8)}`;
  for (const node of workflow.nodes) {
    if (node.next === output.id) node.next = id;
    if (node.otherwise === output.id) node.otherwise = id;
  }
  workflow.nodes.push({
    id,
    name: "Set a field",
    type: "transform",
    config: { action: "set", field: "processedBy", value: "Relay" },
    next: output.id,
    x: output.x,
    y: output.y,
  });
  output.x += 230;
  selected = id;
  tab = "node";
  trace = [];
  currentRun = null;
  render();
  toast("Transform inserted before the output. Configure its fields.");
});
$("#preset").addEventListener("change", (event) => {
  if (guard()) return;
  workflow = copyPreset(event.target.value);
  selected = workflow.nodes[Math.min(2, workflow.nodes.length - 1)].id;
  inputText = JSON.stringify(workflow.input, null, 2);
  trace = [];
  currentRun = null;
  activeTrace = null;
  render();
  toast("Preset loaded. Save to keep your changes.");
});
$("#fit").addEventListener("click", () => {
  $("#canvas-viewport").scrollLeft = 0;
  fit();
});
$("#run").addEventListener("click", runWorkflow);
$("#save").addEventListener("click", async () => {
  if (guard()) return;
  try {
    validateWorkflow(workflow);
    const payload = JSON.parse(inputText);
    validateInput(payload);
    workflow.input = payload;
    if (backend) {
      await api("workflow", { method: "PUT", body: JSON.stringify(workflow) });
      toast("Workflow saved to SQLite.");
    } else if (persist(keys.workflow, workflow))
      toast("Workflow saved in this browser.");
  } catch (error) {
    toast(error.message);
  }
});
$("#trace").addEventListener("click", (event) => {
  const button = event.target.closest("[data-trace]");
  if (!button) return;
  activeTrace = Number(button.dataset.trace);
  tab = "output";
  selected = trace[activeTrace].nodeId;
  renderInspector();
  renderCanvas();
});
$("#history-list").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-run]");
  if (!button || guard()) return;
  try {
    const record = backend
      ? await api(`runs/${button.dataset.run}`)
      : history.find((run) => run.id === button.dataset.run);
    workflow = clone(record.workflow);
    currentRun = record;
    trace = record.trace;
    inputText = JSON.stringify(record.input, null, 2);
    activeTrace = null;
    tab = "output";
    selected = workflow.nodes[0].id;
    render();
    $("#workflow").scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
    });
  } catch (error) {
    toast(error.message);
  }
});
$("#export").addEventListener("click", () => {
  try {
    const payload = JSON.parse(inputText);
    validateInput(payload);
    const blob = new Blob(
      [JSON.stringify({ ...workflow, input: payload }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download = "relay-workflow.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    toast(error.message);
  }
});
new ResizeObserver(fit).observe($("#canvas-viewport"));

async function boot() {
  if (!preview) {
    try {
      const saved = localStorage.getItem(keys.workflow),
        runs = localStorage.getItem(keys.runs);
      if (saved) {
        const parsed = JSON.parse(saved);
        validateWorkflow(parsed);
        workflow = parsed;
      }
      if (runs) {
        const parsed = JSON.parse(runs);
        if (Array.isArray(parsed))
          history = parsed
            .filter(
              (run) =>
                run &&
                typeof run.id === "string" &&
                typeof run.name === "string" &&
                ["completed", "failed"].includes(run.status) &&
                Array.isArray(run.trace),
            )
            .slice(0, 12);
      }
    } catch {
      toast("Could not load saved browser data. Starting with a preset.");
    }
    try {
      const response = await fetch("./api/health", {
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok && (await response.json()).app === "relay-workflows") {
        backend = true;
        workflow = await api("workflow");
        history = await api("runs");
        $("#mode").textContent = "SQLite connected";
      }
    } catch {}
  }
  inputText = JSON.stringify(
    workflow.input || copyPreset("orders").input,
    null,
    2,
  );
  selected = workflow.nodes[Math.min(2, workflow.nodes.length - 1)].id;
  render();
  schedulePreview();
}
render();
boot();
