import {
  presets,
  serialisePatch,
  validatePatch,
  readSavedPatches,
  MAX_PATCH_BYTES,
  MAX_SAVED_PATCHES,
  readPortfolioMotionMessage,
} from "./model.js";
import { ShaderRenderer } from "./renderer.js";

const $ = (selector) => document.querySelector(selector);
const canvas = $("#canvas");
const query = new URLSearchParams(location.search);
const preview = query.get("preview") === "1";
document.documentElement.classList.toggle("preview", preview);
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const gl = canvas.getContext("webgl2", {
  antialias: false,
  alpha: false,
  preserveDrawingBuffer: true,
});
let renderer = gl ? new ShaderRenderer(gl) : null;
let selected =
  presets.find((preset) => preset.id === query.get("preset")) || presets[0];
let validSource = selected.source;
let pointer = { x: 0, y: 0 };
let playing = !motion.matches;
let inView = true;
let portfolioPaused = false;
let portfolioVisible = true;
let elapsed = 0;
let lastFrame = null;
let frameRequest = null;
let lost = false;

function status(text, tone = "ready") {
  $("#status").textContent = text;
  $("#led").dataset.tone = tone;
}

function reportError(message, label = "COMPILE ERROR") {
  $("#error").textContent = message;
  status(label, "error");
}

function setOverlay(title, detail, visible = true) {
  $("#canvasOverlay strong").textContent = title;
  $("#canvasOverlay p").textContent = detail;
  $("#canvasOverlay").classList.toggle("visible", visible);
}

function canAnimate() {
  return playing && !portfolioPaused && canRender();
}

function canRender() {
  return !document.hidden && inView && portfolioVisible && !lost && renderer;
}

function render() {
  return renderer?.draw({
    time: elapsed,
    width: canvas.width,
    height: canvas.height,
    pointer,
    scale: Number($("#scale").value),
    intensity: Number($("#intensity").value),
  });
}

function tick(now) {
  frameRequest = null;
  if (canAnimate()) {
    if (lastFrame !== null) elapsed += Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
  } else {
    lastFrame = null;
  }
  if (canRender()) render();
  if (canAnimate()) frameRequest = requestAnimationFrame(tick);
}

function requestFrame() {
  if (frameRequest === null && canRender())
    frameRequest = requestAnimationFrame(tick);
}

function syncAnimation() {
  if (frameRequest !== null) cancelAnimationFrame(frameRequest);
  frameRequest = null;
  lastFrame = null;
  $("#pause").textContent = playing ? "Pause" : "Play";
  $("#pause").setAttribute(
    "aria-label",
    playing ? "Pause animation" : "Play animation",
  );
  $("#previewPause").textContent = portfolioPaused
    ? "Paused by portfolio"
    : playing
      ? "Pause"
      : "Play";
  $("#previewPause").disabled = portfolioPaused;
  $("#previewPause").setAttribute(
    "aria-label",
    portfolioPaused
      ? "Animation paused by portfolio"
      : playing
        ? "Pause animation"
        : "Play animation",
  );
  requestFrame();
}

function resize() {
  const box = canvas.getBoundingClientRect();
  const ratio = Math.min(
    preview ? 1.5 : 2,
    devicePixelRatio || 1,
    1600 / Math.max(box.width, box.height, 1),
  );
  const width = Math.max(1, Math.round(box.width * ratio));
  const height = Math.max(1, Math.round(box.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  $("#frameInfo").textContent = `${width} x ${height}`;
  requestFrame();
}

function compile(source) {
  if (!renderer || lost) {
    reportError("WebGL2 is currently unavailable.");
    return false;
  }
  try {
    renderer.compile(source);
    validSource = source;
    $("#error").textContent = "";
    $("#compileInfo").textContent = "Program ready";
    status(playing ? "PLAYING" : "PAUSED", playing ? "ready" : "pause");
    requestFrame();
    return true;
  } catch (error) {
    reportError(error.message);
    $("#compileInfo").textContent =
      "Compile failed. Previous shader remains active.";
    return false;
  }
}

function renderPresets() {
  $("#presets").replaceChildren(
    ...presets.map((preset, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `preset${preset.id === selected.id ? " active" : ""}`;
      button.dataset.preset = preset.id;
      button.setAttribute("aria-pressed", String(preset.id === selected.id));
      const number = document.createElement("span");
      number.className = "preset-num";
      number.textContent = String(index + 1).padStart(2, "0");
      const label = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = preset.name;
      const detail = document.createElement("small");
      detail.textContent = preset.detail;
      label.append(title, detail);
      button.append(number, label, document.createElement("i"));
      button.addEventListener("click", () => openPatch(preset));
      return button;
    }),
  );
}

function updateUniformLabels() {
  $("#scaleValue").textContent = Number($("#scale").value).toFixed(2);
  $("#intensityValue").textContent = Number($("#intensity").value).toFixed(2);
  requestFrame();
}

function openPatch(patch) {
  $("#source").value = patch.source;
  if (!compile(patch.source)) return false;
  selected = patch;
  $("#shaderName").textContent = patch.name;
  $("#previewName").textContent = patch.name;
  $("#patchName").value = patch.name;
  canvas.setAttribute(
    "aria-label",
    `${patch.name}. Animated fragment shader artwork.`,
  );
  $("#scale").value = patch.settings?.scale ?? 1;
  $("#intensity").value = patch.settings?.intensity ?? 1;
  updateUniformLabels();
  renderPresets();
  return true;
}

function currentPatch() {
  const patch = {
    id: selected.id,
    name: $("#patchName").value.trim(),
    source: $("#source").value,
    settings: {
      scale: Number($("#scale").value),
      intensity: Number($("#intensity").value),
    },
  };
  if (!validatePatch(patch))
    throw new Error(
      "Give the patch a name of 1 to 100 characters and valid shader source.",
    );
  return patch;
}

function savedPatches() {
  return readSavedPatches(localStorage.getItem("spectra-patches"));
}

function renderSaved() {
  try {
    const saved = savedPatches();
    $("#savedSection").hidden = !saved.length;
    $("#savedList").replaceChildren(
      ...saved.map((patch) => {
        const row = document.createElement("div");
        row.className = "saved-patch";
        const open = document.createElement("button");
        const name = document.createElement("span");
        name.textContent = patch.name;
        const caption = document.createElement("small");
        caption.textContent = "Open patch";
        open.append(name, caption);
        open.addEventListener("click", () => openPatch(patch));
        const remove = document.createElement("button");
        remove.className = "delete-patch";
        remove.textContent = "Delete";
        remove.setAttribute("aria-label", `Delete ${patch.name}`);
        remove.addEventListener("click", () => {
          if (!confirm(`Delete saved patch "${patch.name}"?`)) return;
          try {
            localStorage.setItem(
              "spectra-patches",
              JSON.stringify(
                savedPatches().filter((item) => item.id !== patch.id),
              ),
            );
            renderSaved();
            status("PATCH DELETED");
          } catch {
            reportError(
              "Browser storage could not be updated.",
              "STORAGE ERROR",
            );
          }
        });
        row.append(open, remove);
        return row;
      }),
    );
  } catch {
    reportError(
      "Browser storage is unavailable. JSON export still works.",
      "STORAGE ERROR",
    );
  }
}

function download(name, blob) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

$("#compile").addEventListener("click", () => compile($("#source").value));
$("#source").addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    compile($("#source").value);
  }
});
function togglePlayback() {
  playing = !playing;
  status(playing ? "PLAYING" : "PAUSED", playing ? "ready" : "pause");
  syncAnimation();
}
$("#pause").addEventListener("click", togglePlayback);
$("#previewPause").addEventListener("click", togglePlayback);
$("#restart").addEventListener("click", () => {
  elapsed = 0;
  lastFrame = null;
  requestFrame();
  status(playing ? "RESTARTED" : "PAUSED AT START");
});
$("#scale").addEventListener("input", updateUniformLabels);
$("#intensity").addEventListener("input", updateUniformLabels);
$("#save").addEventListener("click", () => {
  try {
    const patch = currentPatch();
    if (!compile(patch.source)) return;
    patch.id = `patch-${crypto.randomUUID()}`;
    localStorage.setItem(
      "spectra-patches",
      JSON.stringify([patch, ...savedPatches()].slice(0, MAX_SAVED_PATCHES)),
    );
    selected = patch;
    $("#shaderName").textContent = patch.name;
    $("#previewName").textContent = patch.name;
    renderPresets();
    renderSaved();
    status("PATCH SAVED");
  } catch (error) {
    reportError(error.message, "SAVE ERROR");
  }
});
$("#exportPng").addEventListener("click", () => {
  if (lost || !render()) {
    reportError(
      "A valid rendered frame is required for PNG export.",
      "EXPORT ERROR",
    );
    return;
  }
  canvas.toBlob((blob) => {
    if (!blob) {
      reportError("The browser could not export this frame.", "EXPORT ERROR");
      return;
    }
    download("spectra-frame.png", blob);
    status("PNG EXPORTED");
  }, "image/png");
});
$("#exportJson").addEventListener("click", () => {
  try {
    download(
      "spectra-patch.json",
      new Blob([serialisePatch(currentPatch())], { type: "application/json" }),
    );
    status("JSON EXPORTED");
  } catch (error) {
    reportError(error.message, "EXPORT ERROR");
  }
});
$("#import").addEventListener("click", () => $("#file").click());
$("#file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > MAX_PATCH_BYTES)
      throw new Error("The patch file is too large.");
    const patch = JSON.parse(await file.text());
    if (!validatePatch(patch))
      throw new Error("That patch format is not valid.");
    if (openPatch(patch)) status("PATCH IMPORTED");
  } catch (error) {
    reportError(error.message, "IMPORT ERROR");
  }
  event.target.value = "";
});
canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer = {
    x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
    y: 1 - ((event.clientY - rect.top) / rect.height) * 2,
  };
  $("#cursor").style.left = `${event.clientX - rect.left}px`;
  $("#cursor").style.top = `${event.clientY - rect.top}px`;
  requestFrame();
});
canvas.addEventListener("pointerleave", () => {
  $("#cursor").style.opacity = 0;
});
canvas.addEventListener("pointerenter", () => {
  $("#cursor").style.opacity = 1;
});
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  lost = true;
  syncAnimation();
  setOverlay(
    "Graphics paused",
    "Waiting for the browser to restore the WebGL2 context.",
  );
  status("CONTEXT LOST", "pause");
});
canvas.addEventListener("webglcontextrestored", () => {
  lost = false;
  renderer = new ShaderRenderer(gl);
  setOverlay("", "", false);
  compile(validSource);
  resize();
  syncAnimation();
});
document.addEventListener("visibilitychange", syncAnimation);
addEventListener("message", (event) => {
  const state = readPortfolioMotionMessage(event, {
    preview,
    parentWindow: parent,
    origin: location.origin,
  });
  if (!state) return;
  portfolioPaused = state.paused;
  if (state.visible !== undefined) portfolioVisible = state.visible;
  syncAnimation();
});
motion.addEventListener("change", () => {
  if (motion.matches) {
    playing = false;
    status("PAUSED", "pause");
    syncAnimation();
  }
});
new ResizeObserver(resize).observe(canvas);
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  syncAnimation();
}).observe(canvas);
addEventListener("pagehide", (event) => {
  if (frameRequest !== null) cancelAnimationFrame(frameRequest);
  frameRequest = null;
  if (!event.persisted) renderer?.dispose();
});
addEventListener("pageshow", () => {
  resize();
  syncAnimation();
});

if (!gl) {
  setOverlay(
    "WebGL2 required",
    "This browser could not create a WebGL2 context. Try a browser with hardware acceleration enabled.",
  );
  $("#source").value = selected.source;
  $("#patchName").value = selected.name;
  renderPresets();
  status("WEBGL2 UNAVAILABLE", "error");
} else {
  openPatch(selected);
  resize();
  syncAnimation();
}
renderSaved();
