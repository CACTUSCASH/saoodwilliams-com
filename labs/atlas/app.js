import {
  createMap,
  mazeMap,
  seededMap,
  parseMap,
  search,
  ALGORITHMS,
  MAX_IMPORT_BYTES,
} from "./model.js";

const $ = (selector) => document.querySelector(selector);
const grid = $("#grid");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const storageKey = "atlas.map.v1";
const preview = new URLSearchParams(location.search).get("preview") === "1";
document.body.classList.toggle("preview", preview);
let previewPaused = false;
let previewVisible = true;
const instantTrace = () =>
  motion.matches || (preview && (previewPaused || !previewVisible));
let map = seededMap();
let tool = "wall";
let focusIndex = 0;
let cells = [];
let gesture = null;
let animation = null;
let frame = 0;
let worker = null;
let requestId = 0;
let pan = false;

function setStatus(message, tone = "ready") {
  $("#mode").textContent = message;
  $("#statusLed").dataset.tone = tone;
}

function persist() {
  if (preview) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(map));
    $("#saveState").textContent = "Saved in this browser";
  } catch {
    $("#saveState").textContent =
      "Storage unavailable. Export to keep this map.";
  }
}

function updateCell(index) {
  const cell = cells[index];
  const value = map.cells[index];
  const type =
    index === map.start
      ? "start"
      : index === map.end
        ? "end"
        : value === 1
          ? "wall"
          : value > 1
            ? "weighted"
            : "open";
  cell.className = `cell ${type}`;
  cell.textContent = value > 1 ? String(value) : "";
  cell.setAttribute(
    "aria-label",
    `Row ${Math.floor(index / map.width) + 1}, column ${(index % map.width) + 1}: ${type === "weighted" ? `terrain cost ${value}` : type}`,
  );
}

function renderMap() {
  const hadFocus = grid.contains(document.activeElement);
  focusIndex = Math.min(focusIndex, map.cells.length - 1);
  grid.style.setProperty("--cols", map.width);
  grid.style.setProperty("--rows", map.height);
  grid.setAttribute("aria-rowcount", map.height);
  grid.setAttribute("aria-colcount", map.width);
  const fragment = document.createDocumentFragment();
  cells = [];
  for (let y = 0; y < map.height; y++) {
    const row = document.createElement("div");
    row.className = "grid-row";
    row.setAttribute("role", "row");
    for (let x = 0; x < map.width; x++) {
      const index = y * map.width + x;
      const cell = document.createElement("button");
      cell.type = "button";
      cell.disabled = preview;
      cell.dataset.index = index;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-rowindex", y + 1);
      cell.setAttribute("aria-colindex", x + 1);
      cell.tabIndex = index === focusIndex ? 0 : -1;
      cells.push(cell);
      updateCell(index);
      row.append(cell);
    }
    fragment.append(row);
  }
  grid.replaceChildren(fragment);
  $("#mapDimensions").textContent = `${map.width} columns / ${map.height} rows`;
  if (hadFocus) focusCell(focusIndex);
}

function focusCell(index) {
  cells[focusIndex].tabIndex = -1;
  focusIndex = index;
  cells[index].tabIndex = 0;
  cells[index].focus({ preventScroll: true });
}

function clearTrail() {
  for (const cell of cells) cell.classList.remove("visited", "route");
}

function cancelWork(clear = true) {
  requestId++;
  worker?.terminate();
  worker = null;
  cancelAnimationFrame(frame);
  animation = null;
  $("#pause").disabled = true;
  $("#step").disabled = true;
  $("#pause").textContent = "Pause";
  $("#pause").setAttribute("aria-label", "Pause animation");
  $("#run").textContent = "Run search";
  grid.removeAttribute("aria-busy");
  if (clear) clearTrail();
}

function prepareEdit() {
  cancelWork();
  $("#comparison").hidden = true;
  updateMetrics();
  setStatus("EDITING MAP");
}

function applyTool(index) {
  if (!Number.isInteger(index) || index < 0 || index >= map.cells.length)
    return;
  if (index === map.start || index === map.end) return;
  const oldStart = map.start;
  const oldEnd = map.end;
  if (tool === "start") {
    map.start = index;
    map.cells[index] = 0;
    updateCell(oldStart);
  } else if (tool === "end") {
    map.end = index;
    map.cells[index] = 0;
    updateCell(oldEnd);
  } else if (tool === "wall") map.cells[index] = 1;
  else if (tool === "weight") map.cells[index] = Number($("#weight").value);
  else if (tool === "erase") map.cells[index] = 0;
  updateCell(index);
}

function paintLine(from, to) {
  let x = from % map.width;
  let y = Math.floor(from / map.width);
  const endX = to % map.width;
  const endY = Math.floor(to / map.width);
  const dx = Math.abs(endX - x);
  const dy = -Math.abs(endY - y);
  const sx = x < endX ? 1 : -1;
  const sy = y < endY ? 1 : -1;
  let error = dx + dy;
  while (true) {
    applyTool(y * map.width + x);
    if (x === endX && y === endY) break;
    const twice = error * 2;
    if (twice >= dy) {
      error += dy;
      x += sx;
    }
    if (twice <= dx) {
      error += dx;
      y += sy;
    }
  }
}

grid.addEventListener("pointerdown", (event) => {
  const cell = event.target.closest(".cell");
  if (!cell || pan || event.button !== 0 || !event.isPrimary) return;
  event.preventDefault();
  prepareEdit();
  const index = Number(cell.dataset.index);
  focusCell(index);
  gesture = { pointerId: event.pointerId, last: index };
  grid.setPointerCapture(event.pointerId);
  applyTool(index);
});

grid.addEventListener("pointermove", (event) => {
  if (
    !gesture ||
    event.pointerId !== gesture.pointerId ||
    tool === "start" ||
    tool === "end"
  )
    return;
  const hit = document.elementFromPoint(event.clientX, event.clientY);
  const cell = hit?.closest(".cell");
  if (!cell) {
    // Keep the previous point while crossing the gutters between cells.
    if (!hit || !grid.contains(hit)) gesture.last = null;
    return;
  }
  if (!grid.contains(cell)) {
    gesture.last = null;
    return;
  }
  const index = Number(cell.dataset.index);
  if (gesture.last !== null) paintLine(gesture.last, index);
  else applyTool(index);
  gesture.last = index;
});

function endGesture() {
  if (!gesture) return;
  const id = gesture.pointerId;
  gesture = null;
  if (grid.hasPointerCapture(id)) grid.releasePointerCapture(id);
  persist();
  setStatus("MAP UPDATED");
}
grid.addEventListener("pointerup", endGesture);
grid.addEventListener("pointercancel", endGesture);
grid.addEventListener("lostpointercapture", endGesture);
addEventListener("blur", endGesture);

grid.addEventListener("keydown", (event) => {
  const cell = event.target.closest(".cell");
  if (!cell) return;
  const index = Number(cell.dataset.index);
  const x = index % map.width;
  const y = Math.floor(index / map.width);
  const moves = {
    ArrowRight: Math.min(map.width - 1, x + 1) + y * map.width,
    ArrowLeft: Math.max(0, x - 1) + y * map.width,
    ArrowDown: x + Math.min(map.height - 1, y + 1) * map.width,
    ArrowUp: x + Math.max(0, y - 1) * map.width,
    Home: event.ctrlKey ? 0 : y * map.width,
    End: event.ctrlKey ? map.cells.length - 1 : y * map.width + map.width - 1,
  };
  if (Object.hasOwn(moves, event.key)) {
    event.preventDefault();
    focusCell(moves[event.key]);
    cells[focusIndex].scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "instant",
    });
    return;
  }
  const shortcuts = {
    1: "wall",
    2: "weight",
    0: "erase",
    s: "start",
    e: "end",
  };
  if (Object.hasOwn(shortcuts, event.key.toLowerCase())) {
    event.preventDefault();
    setTool(shortcuts[event.key.toLowerCase()]);
    prepareEdit();
    applyTool(index);
    persist();
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    prepareEdit();
    applyTool(index);
    persist();
  }
});

function setTool(next) {
  tool = next;
  document.querySelectorAll(".tool").forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === tool);
    button.setAttribute("aria-pressed", button.dataset.tool === tool);
  });
  $("#weightLabel").hidden = tool !== "weight";
  $("#hint").textContent =
    tool === "start" || tool === "end"
      ? `Choose a cell for the ${tool}. Its terrain will be cleared.`
      : "Drag to paint. Arrow keys move, Enter paints. On a phone, use Pan map to scroll.";
}

function updateMetrics(result) {
  const entries = [
    ["EXPANDED", result?.expanded ?? 0],
    ["STEPS", result?.steps ?? "n/a"],
    ["TERRAIN COST", result?.cost ?? "n/a"],
    ["SEARCH TIME", result ? `${result.elapsed.toFixed(2)} ms` : "0 ms"],
  ];
  $("#metrics").replaceChildren(
    ...entries.map(([label, value]) => {
      const item = document.createElement("div");
      const name = document.createElement("span");
      name.textContent = label;
      const number = document.createElement("strong");
      number.textContent = value;
      item.append(name, number);
      return item;
    }),
  );
}

function finishAnimation() {
  if (!animation) return;
  const result = animation.result;
  cancelWork(false);
  updateMetrics(result);
  setStatus(
    result.reachable
      ? `${result.algorithm} FOUND A ROUTE`
      : `${result.algorithm} FOUND NO ROUTE`,
    result.reachable ? "ready" : "warn",
  );
}

function advance(count) {
  const state = animation;
  if (!state) return;
  while (count-- > 0 && animation === state) {
    if (state.visitedAt < state.result.visited.length)
      cells[state.result.visited[state.visitedAt++]].classList.add("visited");
    else if (state.pathAt < state.result.path.length)
      cells[state.result.path[state.pathAt++]].classList.add("route");
    if (
      state.visitedAt === state.result.visited.length &&
      state.pathAt === state.result.path.length
    )
      finishAnimation();
  }
}

function scheduleAnimation() {
  if (!animation || animation.paused) return;
  frame = requestAnimationFrame(() => {
    if (!animation || animation.paused) return;
    advance(instantTrace() ? Infinity : Number($("#speed").value) * 2);
    if (animation && !animation.paused) scheduleAnimation();
  });
}

function paintAnimation(result) {
  clearTrail();
  animation = { result, visitedAt: 0, pathAt: 0, paused: false };
  updateMetrics(result);
  $("#pause").disabled = false;
  $("#step").disabled = false;
  setStatus(`TRACING ${result.algorithm}`, "run");
  if (instantTrace()) advance(Infinity);
  else scheduleAnimation();
}

function presentComparison(results) {
  const max = Math.max(1, ...results.map((result) => result.expanded));
  $("#comparisonRows").innerHTML = results
    .map(
      (result) =>
        `<article class="comparison-row"><div><span class="algorithm-name">${result.algorithm}</span><strong>${result.reachable ? `${result.steps} steps` : "No route"}</strong></div><div><span>Expanded</span><b>${result.expanded}</b></div><div><span>Terrain cost</span><b>${result.cost ?? "n/a"}</b></div><div class="row-bar" aria-hidden="true"><i style="width:${(result.expanded / max) * 100}%"></i></div></article>`,
    )
    .join("");
  $("#comparison").hidden = false;
  $("#comparison").scrollIntoView({
    behavior: motion.matches ? "instant" : "smooth",
    block: "start",
  });
  setStatus("COMPARISON READY");
}

function compute(compare = false) {
  endGesture();
  cancelWork();
  const id = requestId;
  const algorithm = $("#algorithm").value;
  const snapshot = structuredClone(map);
  grid.setAttribute("aria-busy", "true");
  $("#run").textContent = "Restart search";
  setStatus("CALCULATING", "run");
  const accept = ({ results, error }) => {
    if (id !== requestId) return;
    worker?.terminate();
    worker = null;
    grid.removeAttribute("aria-busy");
    $("#run").textContent = "Run search";
    if (error) {
      setStatus(error, "warn");
      return;
    }
    if (compare) presentComparison(results);
    else paintAnimation(results[0]);
  };
  const fallback = () => {
    worker?.terminate();
    worker = null;
    $("#engine").textContent = "Local search";
    setTimeout(() => {
      if (id !== requestId) return;
      try {
        const results = (compare ? ALGORITHMS : [algorithm]).map((name) => {
          const started = performance.now();
          const result = search(snapshot, name);
          return { ...result, elapsed: performance.now() - started };
        });
        accept({ results });
      } catch (error) {
        accept({ error: error.message });
      }
    }, 0);
  };
  try {
    worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
    worker.onmessage = ({ data }) => {
      if (data.id === id) accept(data);
    };
    worker.onerror = (event) => {
      event.preventDefault();
      if (id === requestId) fallback();
    };
    $("#engine").textContent = "Web Worker";
    worker.postMessage({ id, map: snapshot, algorithm, compare });
  } catch {
    fallback();
  }
}

function replaceMap(next, label) {
  endGesture();
  cancelWork();
  map = next;
  focusIndex = 0;
  renderMap();
  updateMetrics();
  persist();
  $("#comparison").hidden = true;
  setStatus(label);
}

function generate(kind) {
  const seed = Number($("#seed").value);
  if (
    !$("#seed").value ||
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 0xffffffff
  ) {
    setStatus("Use a seed from 0 to 4294967295.", "warn");
    $("#seed").focus();
    return;
  }
  const next =
    kind === "maze"
      ? mazeMap(map.width, map.height, seed)
      : seededMap(map.width, map.height, seed);
  replaceMap(next, `${kind === "maze" ? "MAZE" : "TERRAIN"} / SEED ${seed}`);
}

document
  .querySelectorAll(".tool")
  .forEach((button) =>
    button.addEventListener("click", () => setTool(button.dataset.tool)),
  );
$("#run").onclick = () => compute();
$("#compare").onclick = () => compute(true);
$("#pause").onclick = () => {
  if (!animation) return;
  animation.paused = !animation.paused;
  $("#pause").textContent = animation.paused ? "Play" : "Pause";
  $("#pause").setAttribute(
    "aria-label",
    animation.paused ? "Resume animation" : "Pause animation",
  );
  setStatus(
    animation.paused ? "PAUSED" : `TRACING ${animation.result.algorithm}`,
    animation.paused ? "pause" : "run",
  );
  if (animation.paused) cancelAnimationFrame(frame);
  else scheduleAnimation();
};
$("#step").onclick = () => {
  if (!animation) return;
  animation.paused = true;
  cancelAnimationFrame(frame);
  $("#pause").textContent = "Play";
  $("#pause").setAttribute("aria-label", "Resume animation");
  setStatus("PAUSED / ONE CELL FORWARD", "pause");
  advance(1);
};
$("#speed").oninput = () => {
  $("#speedValue").textContent = `${$("#speed").value}x`;
};
$("#clearMap").onclick = () =>
  replaceMap(createMap(map.width, map.height), "CLEAR MAP");
$("#generate").onclick = () => generate("terrain");
$("#maze").onclick = () => generate("maze");
$("#closeComparison").onclick = () => {
  $("#comparison").hidden = true;
  $("#compare").focus();
};
$("#pan").onclick = () => {
  endGesture();
  pan = !pan;
  grid.classList.toggle("pan-mode", pan);
  $("#pan").setAttribute("aria-pressed", pan);
  $("#pan").textContent = pan ? "Resume painting" : "Pan map";
  $("#hint").textContent = pan
    ? "Scroll or swipe inside the map. Resume painting to edit cells."
    : "Drag to paint. Arrow keys move, Enter paints. On a phone, use Pan map to scroll.";
};
$("#export").onclick = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(map, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "atlas-map.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$("#import").onclick = () => $("#file").click();
$("#file").onchange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > MAX_IMPORT_BYTES)
      throw new Error("Map files must be smaller than 100 KB.");
    const next = parseMap(await file.text());
    replaceMap(next, "MAP IMPORTED");
  } catch (error) {
    setStatus(error.message, "warn");
  }
  event.target.value = "";
};
addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    endGesture();
    cancelWork(false);
    setStatus("SEARCH STOPPED");
  }
});
motion.addEventListener("change", () => {
  if (motion.matches && animation) {
    cancelAnimationFrame(frame);
    advance(Infinity);
  }
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
  previewPaused = event.data.paused;
  previewVisible = event.data.visible;
  if (instantTrace() && animation) {
    cancelAnimationFrame(frame);
    advance(Infinity);
  }
});
addEventListener("pagehide", endGesture);

let restored = false;
try {
  const saved = preview ? null : localStorage.getItem(storageKey);
  if (saved) {
    map = parseMap(saved);
    restored = true;
  }
} catch {
  $("#saveState").textContent =
    "Saved map unavailable. Export to keep this map.";
}
renderMap();
setTool("wall");
updateMetrics();
setStatus(restored ? "SAVED MAP RESTORED" : "READY TO EXPLORE");
if (preview) {
  $("#previewMeta").hidden = false;
  grid.setAttribute("aria-readonly", "true");
  // One real search per preview load. No looping animation or storage mutation.
  compute();
}
