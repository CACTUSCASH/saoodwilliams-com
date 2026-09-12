import {
  COLORS,
  MAX_SHAPES,
  MAX_OPERATIONS,
  createDocument,
  applyOperations,
  operationLog,
  visibleShapes,
  makeOperation,
  validateRoom,
  validateFields,
  parseDiagram,
  exportDiagram,
  seedOperations,
} from "./model.js";
import { escape, sceneMarkup, exportSvg } from "./render.js";

const $ = (selector) => document.querySelector(selector);
const preview = new URLSearchParams(location.search).get("preview") === "1";
const client = crypto.randomUUID();
let room;
try {
  room = validateRoom(
    new URLSearchParams(location.search).get("room") || "product-map",
  );
} catch {
  room = "product-map";
}
const storageKey = `canvas-rooms:v1:${room}`;
const documentState = createDocument();
let selected = null,
  tool = "select",
  connectFrom = null,
  drag = null;
let view = { x: 0, y: 0, zoom: 1 },
  undoStack = [],
  channel = null,
  source = null;
let backend = false,
  sending = false,
  blocked = false,
  sequence = 0,
  saved = false;
let toastTimer,
  retryTimer,
  booted = false;
const pending = new Map(),
  peers = new Map(),
  activity = [];
if (preview) document.body.classList.add("preview");
$("#room-name").value = room;
$("#room-title").textContent = room
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");
const uid = () => crypto.randomUUID();
function toast(message) {
  if (preview) return;
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 4000);
}
function log(message) {
  activity.unshift({
    message,
    at: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  });
  activity.splice(40);
  $("#event-count").textContent = activity.length;
  $("#activity-list").innerHTML = activity
    .map(
      (item) =>
        `<li><span>${escape(item.message)}</span><time>${escape(item.at)}</time></li>`,
    )
    .join("");
}
function shapes() {
  const result = visibleShapes(documentState);
  if (drag?.draft)
    return result.map((shape) =>
      shape.id === drag.id ? { ...shape, ...drag.draft } : shape,
    );
  return result;
}
function renderCanvas() {
  const list = shapes();
  $("#world").setAttribute(
    "transform",
    `translate(${view.x} ${view.y}) scale(${view.zoom})`,
  );
  $("#world").innerHTML = sceneMarkup(list, selected, connectFrom, !preview);
  $("#shape-count").textContent =
    `${list.filter((shape) => shape.type !== "connector").length} shapes`;
  $("#zoom-level").textContent = `${Math.round(view.zoom * 100)}%`;
}
function setStatus() {
  $("#save-state").textContent = backend
    ? pending.size
      ? `${pending.size} operation${pending.size === 1 ? "" : "s"} waiting to sync`
      : "Saved to SQLite"
    : saved
      ? "Saved in this browser"
      : "Browser storage unavailable";
}
function persist() {
  if (preview) return;
  try {
    const previous = localStorage.getItem(storageKey);
    if (previous) applyOperations(documentState, JSON.parse(previous));
    localStorage.setItem(
      storageKey,
      JSON.stringify(operationLog(documentState)),
    );
    saved = true;
  } catch {
    saved = false;
    toast(
      "Browser storage is unavailable or full. Export a JSON copy of your diagram.",
    );
  }
  setStatus();
}
function updatePeers() {
  const now = Date.now();
  for (const [id, at] of peers) if (now - at > 6500) peers.delete(id);
  $("#peers").innerHTML =
    `<span class="peer self" title="This tab">You</span>${[...peers.keys()]
      .slice(0, 5)
      .map(
        (id) =>
          `<span class="peer" title="Active tab ${escape(id.slice(0, 8))}">${escape(id.slice(0, 2).toUpperCase())}</span>`,
      )
      .join("")}`;
  $("#presence-label").textContent = peers.size
    ? `${peers.size + 1} active tabs`
    : "Only this tab";
}
function send(message) {
  channel?.postMessage({ ...message, sender: client });
}
function receiveOperations(operations, origin) {
  if (!Array.isArray(operations) || operations.length > MAX_OPERATIONS) return;
  try {
    const changed = applyOperations(documentState, operations);
    if (!changed) return;
    log(`${changed} ${origin} operation${changed === 1 ? "" : "s"} merged`);
    persist();
    renderCanvas();
    if (backend && origin !== "server") {
      for (const operation of operations) pending.set(operation.id, operation);
      flush();
    }
    if (!$("#properties").contains(document.activeElement)) renderProperties();
    else if (selected && operations.some((op) => op.shape === selected))
      toast(
        "This shape changed in another tab. Applying your form writes a new version.",
      );
  } catch (error) {
    toast(error.message);
  }
}
async function api(path, options = {}) {
  const response = await fetch(`./api/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(data.error || "Request failed."), {
      status: response.status,
    });
  return data;
}
async function flush() {
  if (!backend || sending || blocked || !pending.size) return;
  sending = true;
  clearTimeout(retryTimer);
  try {
    while (pending.size) {
      const batch = [...pending.values()].slice(0, 64);
      await api(`rooms/${room}/operations`, {
        method: "POST",
        body: JSON.stringify({ operations: batch }),
      });
      for (const op of batch) pending.delete(op.id);
    }
    $("#connection").textContent = "SQLite + live events";
    setStatus();
  } catch (error) {
    $("#connection").textContent = "Changes waiting to sync";
    if (error.status && error.status < 500) {
      blocked = true;
      toast(
        `Server rejected these changes: ${error.message} Export a copy before changing rooms.`,
      );
    } else retryTimer = setTimeout(flush, 4000);
  } finally {
    sending = false;
  }
}
function commit(specifications, inverse) {
  if (preview) return;
  if (documentState.operations.size + specifications.length > MAX_OPERATIONS)
    return toast("Room history is full. Export and import into a new room.");
  const operations = [];
  try {
    const candidate = createDocument();
    applyOperations(candidate, operationLog(documentState));
    for (const specification of specifications) {
      const operation = makeOperation(
        candidate,
        client,
        specification.kind,
        specification.id,
        specification.fields,
      );
      applyOperations(candidate, [operation]);
      operations.push(operation);
    }
    applyOperations(documentState, operations);
    if (inverse) {
      undoStack.push(inverse);
      undoStack = undoStack.slice(-50);
    }
    $("#undo").disabled = !undoStack.length;
    persist();
    send({ type: "operations", operations });
    for (const operation of operations) pending.set(operation.id, operation);
    if (backend) flush();
    log(
      `${operations.length} local operation${operations.length === 1 ? "" : "s"} applied`,
    );
    renderCanvas();
    renderProperties();
    setStatus();
  } catch (error) {
    toast(error.message);
  }
}
function addShape(type, x, y) {
  if (shapes().length >= MAX_SHAPES)
    return toast("Use up to 128 shapes per diagram.");
  const id = uid();
  const values = {
    type,
    x: Math.round(Math.max(-5000, Math.min(5000, x - 100))),
    y: Math.round(Math.max(-5000, Math.min(5000, y - 48))),
    width: 200,
    height: type === "note" ? 140 : 96,
    text:
      type === "note"
        ? "A thought worth keeping"
        : type === "ellipse"
          ? "New service"
          : "New component",
    fill:
      type === "note" ? COLORS[2] : type === "ellipse" ? COLORS[3] : COLORS[0],
  };
  selected = id;
  commit([{ kind: "update", id, fields: values }], {
    type: "delete",
    ids: [id],
  });
  setTool("select");
}
function addConnector(from, to) {
  if (from === to) return toast("Choose a different shape as the destination.");
  if (shapes().length >= MAX_SHAPES)
    return toast("Use up to 128 shapes per diagram.");
  const id = uid();
  selected = id;
  commit(
    [
      {
        kind: "update",
        id,
        fields: { type: "connector", from, to, text: "", fill: "#91a4bf" },
      },
    ],
    { type: "delete", ids: [id] },
  );
  connectFrom = null;
  setTool("select");
}
function removeSelection() {
  const found = shapes().find((shape) => shape.id === selected);
  if (!found) return;
  const deleted = shapes().filter(
    (shape) =>
      shape.id === selected ||
      (shape.type === "connector" &&
        (shape.from === selected || shape.to === selected)),
  );
  selected = null;
  commit(
    deleted.map((shape) => ({ kind: "delete", id: shape.id })),
    { type: "restore", shapes: deleted },
  );
}
function restoreShapes(items) {
  if (shapes().length + items.length > MAX_SHAPES)
    return toast("Restoring these shapes would exceed the diagram limit.");
  const ids = new Map(items.map((shape) => [shape.id, uid()]));
  const specs = items.map((shape) => {
    const { id, ...fields } = shape;
    if (fields.type === "connector") {
      fields.from = ids.get(fields.from) || fields.from;
      fields.to = ids.get(fields.to) || fields.to;
    }
    return { kind: "update", id: ids.get(id), fields };
  });
  selected = specs[0]?.id || null;
  commit(specs);
}
function undo() {
  const action = undoStack.pop();
  if (!action) return;
  if (action.type === "delete") {
    selected = null;
    commit(action.ids.map((id) => ({ kind: "delete", id })));
  }
  if (action.type === "restore") restoreShapes(action.shapes);
  if (action.type === "update") {
    if (documentState.entities.get(action.id)?.deleted)
      toast("That shape was deleted. Its old ID stays deleted.");
    else commit([{ kind: "update", id: action.id, fields: action.fields }]);
  }
  $("#undo").disabled = !undoStack.length;
}
function setTool(value) {
  tool = value;
  if (tool !== "connector") connectFrom = null;
  $("#board").dataset.tool = value;
  document
    .querySelectorAll("button[data-tool]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.tool === value),
      ),
    );
  $("#tool-hint").textContent = {
    select: "Select a shape to edit. Drag the background to pan.",
    rectangle: "Click to place a box, or press Enter to add one at the center.",
    ellipse:
      "Click to place an ellipse, or press Enter to add one at the center.",
    note: "Click to place a note, or press Enter to add one at the center.",
    connector: connectFrom
      ? "Choose the destination shape. Tab and Enter also work."
      : "Select the starting shape, then its destination.",
    pan: "Drag to move around the canvas.",
  }[tool];
  renderCanvas();
}
function fit() {
  const nodes = shapes().filter((shape) => shape.type !== "connector");
  if (!nodes.length) {
    view = { x: 0, y: 0, zoom: 1 };
    renderCanvas();
    return;
  }
  const bounds = $("#board").getBoundingClientRect();
  const left = Math.min(...nodes.map((shape) => shape.x)),
    top = Math.min(...nodes.map((shape) => shape.y));
  const right = Math.max(...nodes.map((shape) => shape.x + shape.width)),
    bottom = Math.max(...nodes.map((shape) => shape.y + shape.height));
  const zoom = Math.max(
    0.25,
    Math.min(
      1.2,
      (bounds.width - 70) / (right - left),
      (bounds.height - (preview ? 140 : 100)) / (bottom - top),
    ),
  );
  view = {
    zoom,
    x: (bounds.width - (right - left) * zoom) / 2 - left * zoom,
    y:
      (bounds.height - (bottom - top) * zoom) / 2 -
      top * zoom +
      (preview ? 10 : -10),
  };
  renderCanvas();
}
function zoomAt(factor, x, y) {
  const next = Math.min(3, Math.max(0.25, view.zoom * factor));
  view.x = x - ((x - view.x) * next) / view.zoom;
  view.y = y - ((y - view.y) * next) / view.zoom;
  view.zoom = next;
  renderCanvas();
}
function coordinates(event) {
  const box = $("#board").getBoundingClientRect();
  return {
    x: (event.clientX - box.left - view.x) / view.zoom,
    y: (event.clientY - box.top - view.y) / view.zoom,
  };
}
const field = (key, title, value, extra = "") =>
  `<div class="field"><label for="field-${key}">${title}</label><input id="field-${key}" name="${key}" value="${escape(value)}" ${extra}/></div>`;
function renderProperties() {
  const shape = shapes().find((item) => item.id === selected);
  if (!shape) {
    selected = null;
    $("#selection-type").textContent = "NO SELECTION";
    $("#properties").innerHTML =
      '<div class="empty-property"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="4" width="24" height="20" rx="3"/><rect x="21" y="25" width="23" height="19" rx="3"/><path d="M16 24v11h5"/></svg><h2>Make the idea visible.</h2><p>Add a shape or select something on the canvas. Edits appear in other tabs connected to this room.</p><ul><li>Drag a shape to move it.</li><li>Connect two shapes with a line.</li><li>Press Ctrl/Cmd Z to undo.</li><li>Use arrow keys to move a selection.</li></ul></div>';
    return;
  }
  $("#selection-type").textContent = shape.type.toUpperCase();
  const nodes = shapes().filter((item) => item.type !== "connector");
  const choices = (current) =>
    nodes
      .map(
        (node) =>
          `<option value="${escape(node.id)}" ${node.id === current ? "selected" : ""}>${escape(node.text.split("\n")[0] || "Untitled")}</option>`,
      )
      .join("");
  $("#properties").innerHTML =
    `<h2>${escape(shape.type === "connector" ? "Connection" : "Shape details")}</h2><p>Changes are shared when you apply them. Move the shape directly on the canvas.</p><form id="shape-form"><label for="shape-text">${shape.type === "connector" ? "Connection label" : "Text"}</label><textarea name="text" id="shape-text" maxlength="500">${escape(shape.text || "")}</textarea>${shape.type === "connector" ? `<label for="field-from">From</label><select name="from" id="field-from">${choices(shape.from)}</select><label for="field-to">To</label><select name="to" id="field-to">${choices(shape.to)}</select>` : `<div class="field-pair">${field("x", "X position", shape.x, 'type="number" min="-5000" max="5000" step="1" required')}${field("y", "Y position", shape.y, 'type="number" min="-5000" max="5000" step="1" required')}</div><div class="field-pair">${field("width", "Width", shape.width, 'type="number" min="24" max="800" required')}${field("height", "Height", shape.height, 'type="number" min="24" max="800" required')}</div>`}${field("fill", "Hex color", shape.fill || "#91a4bf", 'pattern="#[a-fA-F0-9]{6}" required')}<div class="swatches" role="group" aria-label="Color presets">${COLORS.map((color) => `<button type="button" data-color="${color}" style="background:${color}" aria-label="Use ${color}" aria-pressed="${shape.fill === color}"></button>`).join("")}</div><button class="apply" type="submit">Apply changes</button></form><button class="delete" id="delete-selection">Delete ${shape.type === "connector" ? "connection" : "shape"}</button>`;
}

$("#board").addEventListener("pointerdown", (event) => {
  if (preview || event.button !== 0) return;
  const group = event.target.closest("[data-shape]"),
    id = group?.dataset.shape;
  const shape = shapes().find((item) => item.id === id),
    position = coordinates(event);
  if (tool === "connector" && shape?.type !== "connector" && shape) {
    if (!connectFrom) {
      connectFrom = id;
      setTool("connector");
    } else addConnector(connectFrom, id);
    return;
  }
  if (["rectangle", "ellipse", "note"].includes(tool)) {
    addShape(tool, position.x, position.y);
    return;
  }
  if (shape && tool !== "pan") {
    selected = id;
    renderProperties();
    if (shape.type !== "connector")
      drag = {
        id,
        start: position,
        original: { x: shape.x, y: shape.y },
        moved: false,
      };
  } else {
    selected = null;
    renderProperties();
    drag = {
      pan: true,
      startX: event.clientX,
      startY: event.clientY,
      original: { ...view },
      moved: false,
    };
  }
  $("#board").setPointerCapture(event.pointerId);
  renderCanvas();
});
$("#board").addEventListener("pointermove", (event) => {
  if (!drag || preview) return;
  if (drag.pan) {
    view.x = drag.original.x + event.clientX - drag.startX;
    view.y = drag.original.y + event.clientY - drag.startY;
  } else {
    const position = coordinates(event);
    drag.draft = {
      x: Math.round(
        Math.max(
          -5000,
          Math.min(5000, drag.original.x + position.x - drag.start.x),
        ),
      ),
      y: Math.round(
        Math.max(
          -5000,
          Math.min(5000, drag.original.y + position.y - drag.start.y),
        ),
      ),
    };
    drag.moved =
      Math.abs(position.x - drag.start.x) +
        Math.abs(position.y - drag.start.y) >
      2;
  }
  renderCanvas();
});
function finishDrag() {
  const gesture = drag;
  drag = null;
  if (gesture?.moved && gesture.draft)
    commit([{ kind: "update", id: gesture.id, fields: gesture.draft }], {
      type: "update",
      id: gesture.id,
      fields: gesture.original,
    });
  else renderCanvas();
}
$("#board").addEventListener("pointerup", finishDrag);
$("#board").addEventListener("pointercancel", () => {
  drag = null;
  renderCanvas();
});
$("#board").addEventListener("dblclick", (event) => {
  if (event.target.closest("[data-shape]")) $("#shape-text")?.focus();
});
$("#board").addEventListener(
  "wheel",
  (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const box = $("#board").getBoundingClientRect();
    zoomAt(
      event.deltaY < 0 ? 1.08 : 1 / 1.08,
      event.clientX - box.left,
      event.clientY - box.top,
    );
  },
  { passive: false },
);
document.querySelectorAll("button[data-tool]").forEach((button) => {
  button.setAttribute("aria-label", button.title);
  button.addEventListener("click", () => {
    setTool(button.dataset.tool);
    $("#board").focus();
  });
});
$("#properties").addEventListener("submit", (event) => {
  event.preventDefault();
  const shape = shapes().find((item) => item.id === selected);
  if (!shape) return;
  const values = Object.fromEntries(new FormData(event.target));
  for (const key of ["x", "y", "width", "height"])
    if (Object.hasOwn(values, key)) values[key] = Number(values[key]);
  try {
    validateFields(values);
    if (shape.type === "connector" && values.from === values.to)
      throw new Error("Connect two different shapes.");
    const changed = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => value !== shape[key]),
    );
    if (!Object.keys(changed).length) return toast("No changes to apply.");
    const inverse = Object.fromEntries(
      Object.keys(changed).map((key) => [key, shape[key]]),
    );
    commit([{ kind: "update", id: selected, fields: changed }], {
      type: "update",
      id: selected,
      fields: inverse,
    });
  } catch (error) {
    toast(error.message);
  }
});
$("#properties").addEventListener("click", (event) => {
  const swatch = event.target.closest("[data-color]");
  if (swatch) {
    $("#field-fill").value = swatch.dataset.color;
    document
      .querySelectorAll("[data-color]")
      .forEach((button) =>
        button.setAttribute("aria-pressed", String(button === swatch)),
      );
  }
  if (event.target.id === "delete-selection") removeSelection();
});
document.addEventListener("keydown", (event) => {
  if (preview || event.target.closest("input,textarea,select,dialog")) return;
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const id = event.target.closest("[data-shape]")?.dataset.shape;
  if (event.key === "Enter" && id) {
    event.preventDefault();
    if (
      tool === "connector" &&
      shapes().find((shape) => shape.id === id)?.type !== "connector"
    ) {
      if (!connectFrom) {
        connectFrom = id;
        setTool("connector");
      } else addConnector(connectFrom, id);
      $("#board").focus();
    } else {
      selected = id;
      renderProperties();
      renderCanvas();
      $("#shape-text")?.focus();
    }
    return;
  }
  if (
    event.key === "Enter" &&
    event.target === $("#board") &&
    ["rectangle", "ellipse", "note"].includes(tool)
  ) {
    event.preventDefault();
    addShape(
      tool,
      ($("#board").clientWidth / 2 - view.x) / view.zoom,
      ($("#board").clientHeight / 2 - view.y) / view.zoom,
    );
    $("#shape-text")?.focus();
    return;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    if (selected) {
      event.preventDefault();
      removeSelection();
    }
    return;
  }
  if (event.key.startsWith("Arrow") && selected) {
    const shape = shapes().find((item) => item.id === selected);
    if (!shape || shape.type === "connector") return;
    event.preventDefault();
    const step = event.shiftKey ? 10 : 1;
    const fields = {
      x:
        shape.x +
        (event.key === "ArrowRight"
          ? step
          : event.key === "ArrowLeft"
            ? -step
            : 0),
      y:
        shape.y +
        (event.key === "ArrowDown"
          ? step
          : event.key === "ArrowUp"
            ? -step
            : 0),
    };
    commit([{ kind: "update", id: selected, fields }], {
      type: "update",
      id: selected,
      fields: { x: shape.x, y: shape.y },
    });
    $("#board").focus();
    return;
  }
  if (event.key === "Escape") {
    selected = null;
    connectFrom = null;
    setTool("select");
    renderProperties();
  }
  const shortcut = {
    v: "select",
    r: "rectangle",
    o: "ellipse",
    n: "note",
    c: "connector",
    h: "pan",
  }[event.key.toLowerCase()];
  if (shortcut) {
    setTool(shortcut);
    $("#board").focus();
  }
});
$("#undo").addEventListener("click", undo);
$("#zoom-in").addEventListener("click", () =>
  zoomAt(1.2, $("#board").clientWidth / 2, $("#board").clientHeight / 2),
);
$("#zoom-out").addEventListener("click", () =>
  zoomAt(1 / 1.2, $("#board").clientWidth / 2, $("#board").clientHeight / 2),
);
$("#fit").addEventListener("click", fit);
$("#room-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const next = validateRoom($("#room-name").value.trim());
    const url = new URL(location.href);
    url.searchParams.set("room", next);
    location.assign(url);
  } catch (error) {
    toast(error.message);
  }
});
$("#open-tab").addEventListener("click", () => {
  const url = new URL(location.href);
  url.searchParams.set("room", room);
  window.open(url.href, "_blank", "noopener");
});
$("#activity-toggle").addEventListener("click", () => {
  $("#activity").hidden = !$("#activity").hidden;
  $("#activity-toggle").setAttribute(
    "aria-expanded",
    String(!$("#activity").hidden),
  );
});
$("#merge-help").addEventListener("click", () => $("#help-dialog").showModal());
$("#close-help").addEventListener("click", () => $("#help-dialog").close());
function download(content, type, name) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("#export-json").addEventListener("click", () =>
  download(
    JSON.stringify(exportDiagram(documentState), null, 2),
    "application/json",
    `${room}.json`,
  ),
);
$("#export-svg").addEventListener("click", () =>
  download(
    exportSvg(exportDiagram(documentState).shapes),
    "image/svg+xml",
    `${room}.svg`,
  ),
);
$("#import").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 200000)
      throw new Error("Diagram files are limited to 200 KB.");
    const data = parseDiagram(await file.text());
    if (data.shapes.length + shapes().length > MAX_SHAPES)
      throw new Error(
        "This import would exceed 128 shapes. Join an empty room first.",
      );
    const ids = new Map(data.shapes.map((shape) => [shape.id, uid()]));
    const specifications = data.shapes.map(({ id, ...fields }) => {
      if (fields.type === "connector") {
        fields.from = ids.get(fields.from);
        fields.to = ids.get(fields.to);
      }
      return { kind: "update", id: ids.get(id), fields };
    });
    if (!specifications.length) return toast("The diagram contains no shapes.");
    commit(specifications, { type: "delete", ids: [...ids.values()] });
    fit();
    toast("Diagram added to this room. Undo removes the imported shapes.");
  } catch (error) {
    toast(error.message);
  } finally {
    event.target.value = "";
  }
});
new ResizeObserver(() => {
  if (booted) fit();
}).observe($("#canvas-wrap"));
addEventListener("storage", (event) => {
  if (!preview && event.key === storageKey && event.newValue) {
    try {
      receiveOperations(JSON.parse(event.newValue), "stored");
    } catch {}
  }
});
addEventListener("online", flush);
addEventListener("message", (event) => {
  if (
    !preview ||
    event.source !== parent ||
    event.origin !== location.origin ||
    event.data?.type !== "portfolio-motion"
  )
    return;
  // This preview is a static representative diagram, so pause/visibility never starts a timer.
  document.documentElement.dataset.motion =
    event.data.paused || event.data.visible === false ? "paused" : "ready";
});
addEventListener("pagehide", () => {
  send({ type: "leave" });
  channel?.close();
  source?.close();
});
addEventListener("pageshow", (event) => {
  if (event.persisted && !preview) location.reload();
});

async function boot() {
  if (preview) {
    applyOperations(documentState, seedOperations());
    $("#board").removeAttribute("tabindex");
    $(".preview-label").hidden = false;
    booted = true;
    fit();
    return;
  }
  try {
    const local = localStorage.getItem(storageKey);
    if (local) applyOperations(documentState, JSON.parse(local));
  } catch {
    toast("Could not read saved room. A fresh local view is ready.");
  }
  try {
    const health = await fetch("./api/health", {
      signal: AbortSignal.timeout(1500),
    });
    if (health.ok && (await health.json()).app === "canvas-rooms") {
      const snapshot = await api(`rooms/${room}`);
      applyOperations(documentState, snapshot.operations);
      sequence = snapshot.sequence;
      backend = true;
      $("#connection").textContent = "SQLite + live events";
      $(".file-bar p").textContent =
        "Operations are saved to the local SQLite server. Open another tab to collaborate.";
      source = new EventSource(`./api/rooms/${room}/events?since=${sequence}`);
      source.addEventListener("operations", (event) => {
        try {
          const value = JSON.parse(event.data);
          receiveOperations(value.operations, "server");
          sequence = value.sequence;
        } catch {
          toast("Received an invalid event. Reload to reconnect.");
        }
      });
      source.onopen = () => {
        $("#connection").textContent = "SQLite + live events";
        flush();
      };
      source.onerror = () => {
        $("#connection").textContent = "Reconnecting to server";
      };
      const known = new Set(snapshot.operations.map((op) => op.id));
      for (const op of operationLog(documentState))
        if (!known.has(op.id)) pending.set(op.id, op);
    }
  } catch {
    $("#connection").textContent = "Browser storage";
  }
  if (!documentState.operations.size && room === "product-map") {
    applyOperations(documentState, seedOperations());
    for (const op of seedOperations()) pending.set(op.id, op);
  }
  try {
    channel = new BroadcastChannel(`canvas-rooms:v1:${room}`);
    channel.onmessage = (event) => {
      const data = event.data;
      if (!data || typeof data.sender !== "string" || data.sender === client)
        return;
      if (data.type === "leave") {
        peers.delete(data.sender);
        updatePeers();
        return;
      }
      peers.set(data.sender, Date.now());
      updatePeers();
      if (data.type === "hello")
        send({
          type: "state",
          target: data.sender,
          operations: operationLog(documentState),
        });
      if (
        data.type === "operations" ||
        (data.type === "state" && data.target === client)
      )
        receiveOperations(data.operations, "remote");
    };
    send({ type: "hello" });
    setInterval(() => {
      send({ type: "presence" });
      updatePeers();
    }, 2000);
  } catch {
    $("#presence-label").textContent = "Live tab presence unavailable";
    $("#open-tab").title =
      "This browser does not support BroadcastChannel. Storage events may still sync edits.";
  }
  persist();
  booted = true;
  updatePeers();
  renderProperties();
  fit();
  setTool("select");
  log("Room opened.");
  if (backend) flush();
}
boot();
