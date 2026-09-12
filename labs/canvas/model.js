export const VERSION = 1;
export const MAX_SHAPES = 128;
export const MAX_OPERATIONS = 5000;
export const COLORS = [
  "#273c60",
  "#243f3b",
  "#4a3c27",
  "#40304e",
  "#3d414b",
  "#4e3039",
];
const fields = new Set([
  "type",
  "x",
  "y",
  "width",
  "height",
  "text",
  "fill",
  "from",
  "to",
]);
const identifier = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,48}$/.test(value);
const plain = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const clone = (value) => JSON.parse(JSON.stringify(value));
const fail = (message) => {
  throw new Error(message);
};
export function validateRoom(room) {
  if (typeof room !== "string" || !/^[a-z0-9][a-z0-9-]{0,39}$/.test(room))
    fail("Room names use 1 to 40 lowercase letters, numbers, or hyphens.");
  return room;
}
export function validateFields(value, complete = false) {
  if (!plain(value) || !Object.keys(value).length)
    fail("A shape update needs fields.");
  for (const [key, item] of Object.entries(value)) {
    if (!fields.has(key)) fail(`Unknown shape field: ${key}.`);
    if (
      key === "type" &&
      !["rectangle", "ellipse", "note", "connector"].includes(item)
    )
      fail("Unknown shape type.");
    if (
      ["x", "y"].includes(key) &&
      (!Number.isFinite(item) || Math.abs(item) > 5000)
    )
      fail("Position must be between -5000 and 5000.");
    if (
      ["width", "height"].includes(key) &&
      (!Number.isFinite(item) || item < 24 || item > 800)
    )
      fail("Shape dimensions must be between 24 and 800.");
    if (key === "text" && (typeof item !== "string" || item.length > 500))
      fail("Text is limited to 500 characters.");
    if (
      key === "fill" &&
      (typeof item !== "string" || !/^#[a-fA-F0-9]{6}$/.test(item))
    )
      fail("Use a six-digit hex color.");
    if (["from", "to"].includes(key) && !identifier(item))
      fail("Connector endpoints must be shape IDs.");
  }
  if (complete) {
    if (!["rectangle", "ellipse", "note", "connector"].includes(value.type))
      fail("Each shape needs a type.");
    if (value.type === "connector") {
      if (!value.from || !value.to || value.from === value.to)
        fail("Connect two different shapes.");
    } else if (
      !["x", "y", "width", "height", "fill", "text"].every((key) =>
        Object.hasOwn(value, key),
      )
    )
      fail("A shape needs position, size, color, and text.");
  }
  return value;
}
export function validateOperation(op) {
  if (
    !plain(op) ||
    Object.keys(op).some(
      (key) =>
        !["id", "client", "clock", "kind", "shape", "fields"].includes(key),
    )
  )
    fail("Invalid operation.");
  if (!identifier(op.client) || !identifier(op.shape))
    fail("Invalid operation identity.");
  if (!Number.isSafeInteger(op.clock) || op.clock < 1 || op.clock > 1e12)
    fail("Invalid logical clock.");
  if (op.id !== `${op.client}:${op.clock}`)
    fail("Operation ID must match its client and clock.");
  if (!["update", "delete"].includes(op.kind)) fail("Unknown operation kind.");
  if (op.kind === "update") validateFields(op.fields);
  else if (op.fields !== undefined)
    fail("Deletion operations do not contain fields.");
  if (JSON.stringify(op).length > 4000) fail("Operation is too large.");
  return op;
}
const stamp = (op) => ({ clock: op.clock, client: op.client });
function newer(a, b) {
  return (
    !b || a.clock > b.clock || (a.clock === b.clock && a.client > b.client)
  );
}
export function createDocument() {
  return { entities: new Map(), operations: new Map(), clock: 0 };
}
function canonical(op) {
  return JSON.stringify({
    id: op.id,
    client: op.client,
    clock: op.clock,
    kind: op.kind,
    shape: op.shape,
    ...(op.fields
      ? {
          fields: Object.fromEntries(
            Object.entries(op.fields).sort(([a], [b]) => a.localeCompare(b)),
          ),
        }
      : {}),
  });
}
export function applyOperation(document, raw) {
  validateOperation(raw);
  const op = clone(raw),
    serialized = canonical(op);
  if (document.operations.has(op.id)) {
    if (document.operations.get(op.id).serialized !== serialized)
      fail("Operation ID collision.");
    return false;
  }
  if (document.operations.size >= MAX_OPERATIONS)
    fail("Room history is full. Export and import into a new room.");
  document.operations.set(op.id, { op, serialized });
  document.clock = Math.max(document.clock, op.clock);
  const entity = document.entities.get(op.shape) || {
    fields: new Map(),
    deleted: null,
  };
  const version = stamp(op);
  if (op.kind === "delete") {
    if (newer(version, entity.deleted)) entity.deleted = version;
  } else {
    for (const [key, value] of Object.entries(op.fields)) {
      if (newer(version, entity.fields.get(key)?.version))
        entity.fields.set(key, { value, version });
    }
  }
  document.entities.set(op.shape, entity);
  return true;
}
export function applyOperations(document, operations) {
  if (!Array.isArray(operations)) fail("Operations must be an array.");
  let changed = 0;
  for (const op of operations) if (applyOperation(document, op)) changed++;
  return changed;
}
export function visibleShapes(document) {
  const result = [];
  for (const [id, entity] of document.entities) {
    if (entity.deleted) continue;
    const shape = Object.fromEntries(
      [...entity.fields].map(([key, item]) => [key, item.value]),
    );
    try {
      validateFields(shape, true);
      result.push({ id, ...shape });
    } catch {}
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}
export function operationLog(document) {
  return [...document.operations.values()].map((item) => clone(item.op));
}
export function makeOperation(document, client, kind, shape, values) {
  const clock = document.clock + 1;
  const op = {
    id: `${client}:${clock}`,
    client,
    clock,
    kind,
    shape,
    ...(kind === "update" ? { fields: values } : {}),
  };
  validateOperation(op);
  return op;
}
export function parseDiagram(raw) {
  if (typeof raw !== "string" || raw.length > 200000)
    fail("Diagram files are limited to 200 KB.");
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    fail("The file is not valid JSON.");
  }
  if (
    !plain(value) ||
    value.version !== VERSION ||
    !Array.isArray(value.shapes) ||
    value.shapes.length > MAX_SHAPES
  )
    fail("Use a Canvas Rooms version 1 diagram with up to 128 shapes.");
  const ids = new Set();
  for (const shape of value.shapes) {
    if (!plain(shape) || !identifier(shape.id) || ids.has(shape.id))
      fail("Shape IDs must be unique.");
    ids.add(shape.id);
    const { id, ...properties } = shape;
    validateFields(properties, true);
  }
  for (const shape of value.shapes.filter(
    (item) => item.type === "connector",
  )) {
    if (
      !ids.has(shape.from) ||
      !ids.has(shape.to) ||
      value.shapes.find((item) => item.id === shape.from)?.type ===
        "connector" ||
      value.shapes.find((item) => item.id === shape.to)?.type === "connector"
    )
      fail("Every connector must point to two existing shapes.");
  }
  return value;
}
export function exportDiagram(document) {
  const shapes = visibleShapes(document);
  const nodes = new Set(
    shapes
      .filter((shape) => shape.type !== "connector")
      .map((shape) => shape.id),
  );
  return {
    version: VERSION,
    shapes: shapes.filter(
      (shape) =>
        shape.type !== "connector" ||
        (nodes.has(shape.from) && nodes.has(shape.to)),
    ),
  };
}
export function seedOperations() {
  const shapes = [
    {
      id: "brief",
      type: "note",
      x: 110,
      y: 90,
      width: 215,
      height: 144,
      text: "Product handoff\nA small system, mapped together.",
      fill: "#4a3c27",
    },
    {
      id: "browser",
      type: "rectangle",
      x: 135,
      y: 310,
      width: 205,
      height: 95,
      text: "Browser client\nSVG editor + local state",
      fill: "#273c60",
    },
    {
      id: "operations",
      type: "rectangle",
      x: 435,
      y: 310,
      width: 210,
      height: 95,
      text: "Operation model\nMerge fields, keep tombstones",
      fill: "#243f3b",
    },
    {
      id: "store",
      type: "ellipse",
      x: 745,
      y: 300,
      width: 205,
      height: 115,
      text: "Room history\nSQLite / browser storage",
      fill: "#40304e",
    },
    {
      id: "note-try",
      type: "note",
      x: 520,
      y: 100,
      width: 270,
      height: 118,
      text: "Try it\nOpen this room in a second tab. Move a shape and watch it arrive.",
      fill: "#3d414b",
    },
    {
      id: "edge-client",
      type: "connector",
      from: "browser",
      to: "operations",
      text: "operations",
      fill: "#91a4bf",
    },
    {
      id: "edge-store",
      type: "connector",
      from: "operations",
      to: "store",
      text: "persist",
      fill: "#91a4bf",
    },
  ];
  return shapes.map(({ id, ...values }, index) => ({
    id: `starter:${index + 1}`,
    client: "starter",
    clock: index + 1,
    kind: "update",
    shape: id,
    fields: values,
  }));
}
