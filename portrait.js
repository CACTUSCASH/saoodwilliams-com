const VERTEX_SOURCE = `#version 300 es
precision highp float;
uniform sampler2D uPhoto;
uniform int uGrid;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uImageAspect;
uniform float uAmount;
uniform float uTime;
uniform float uDpr;
out vec3 vColour;
out float vOpacity;
out float vRoundness;

vec3 random3(float value) {
  return fract(sin(vec3(value * 0.1031, value * 0.11369, value * 0.13787) + vec3(17.1, 61.7, 12.4)) * 43758.5453);
}

void main() {
  int col = gl_VertexID % uGrid;
  int row = gl_VertexID / uGrid;
  vec2 uv = (vec2(float(col), float(row)) + 0.5) / float(uGrid);
  float aspect = uResolution.x / uResolution.y;
  vec2 cover = vec2(min(1.0, aspect / uImageAspect), min(1.0, uImageAspect / aspect));
  vec3 colour = texture(uPhoto, (uv - 0.5) * cover + 0.5).rgb;
  vec3 seed = random3(float(gl_VertexID) + 1.0);
  vec2 origin = uv * 2.0 - 1.0;
  float luminance = dot(colour, vec3(0.2126, 0.7152, 0.0722));
  float paper = smoothstep(0.83, 0.98, min(colour.r, min(colour.g, colour.b)));
  float release = smoothstep(0.18, 0.95, seed.x);
  float spread = uAmount * release;

  // Every particle retains its source colour and returns to its source pixel.
  vec3 position = vec3(origin, 0.0);
  position.xy *= 1.0 - 0.10 * uAmount;
  position.z = uAmount * ((luminance - 0.45) * 0.24 + (seed.z - 0.5) * release * 0.92);
  position.z += uAmount * (cos(origin.x * 2.2) - 0.5) * 0.14;
  position.xy += (seed.xy - 0.5) * spread * vec2(0.12, 0.10);
  position.xy += normalize(origin + vec2(0.0001)) * spread * 0.045;
  position.x += sin(origin.y * 4.0 + position.z * 3.0 + uTime * 0.55) * spread * 0.022;
  position.y += cos(origin.x * 3.0 - uTime * 0.40 + seed.z * 5.0) * spread * 0.018;

  vec2 distanceToPointer = position.xy - uPointer;
  float influence = exp(-dot(distanceToPointer, distanceToPointer) * 18.0) * uPointerStrength * uAmount;
  position.xy += normalize(distanceToPointer + vec2(0.0001)) * influence * (0.17 + release * 0.18);
  position.z += influence * (0.18 + seed.z * 0.20);

  float yaw = (uPointer.x * 0.24 + sin(uTime * 0.22) * 0.035) * uAmount;
  float pitch = (-uPointer.y * 0.17 + cos(uTime * 0.19) * 0.018) * uAmount;
  position.xz = mat2(cos(yaw), -sin(yaw), sin(yaw), cos(yaw)) * position.xz;
  position.yz = mat2(cos(pitch), -sin(pitch), sin(pitch), cos(pitch)) * position.yz;
  float perspective = 1.0 / (1.0 - position.z * 0.30);
  gl_Position = vec4(position.xy * perspective, -position.z * 0.35, 1.0);
  float cell = max(uResolution.x, uResolution.y) / float(uGrid);
  gl_PointSize = clamp(cell * mix(1.16, 0.80, uAmount) * perspective, 1.0, 9.0 * uDpr);
  vColour = colour + vec3(0.045) * uAmount * (1.0 - luminance);
  vOpacity = 1.0 - paper * smoothstep(0.05, 0.8, uAmount) * 0.985;
  vRoundness = smoothstep(0.0, 0.45, uAmount);
}
`;

const FRAGMENT_SOURCE = `#version 300 es
precision highp float;
in vec3 vColour;
in float vOpacity;
in float vRoundness;
out vec4 outColour;
void main() {
  float radius = length(gl_PointCoord - 0.5);
  float circle = 1.0 - smoothstep(0.34, 0.5, radius);
  float alpha = mix(1.0, circle, vRoundness) * vOpacity;
  if (alpha < 0.025) discard;
  outColour = vec4(vColour, alpha);
}
`;

/** Low-level renderer is exported so resource cleanup can be tested without a DOM. */
export class PortraitRenderer {
  constructor(gl, image, grid = 240) {
    this.gl = gl;
    this.program = null;
    this.texture = null;
    this.vao = null;
    if (
      !Number.isFinite(image.naturalWidth) ||
      !Number.isFinite(image.naturalHeight) ||
      image.naturalWidth <= 0 ||
      image.naturalHeight <= 0
    )
      throw new Error("A decoded portrait image is required.");
    this.grid = Math.max(
      192,
      Math.min(244, Math.round(Number.isFinite(grid) ? grid : 240)),
    );
    this.imageAspect = image.naturalWidth / image.naturalHeight;
    const shaders = [];
    try {
      for (const [type, source] of [
        [gl.VERTEX_SHADER, VERTEX_SOURCE],
        [gl.FRAGMENT_SHADER, FRAGMENT_SOURCE],
      ]) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Portrait shader allocation failed.");
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error(
            gl.getShaderInfoLog(shader) ||
              "Portrait shader compilation failed.",
          );
      }
      this.program = gl.createProgram();
      if (!this.program) throw new Error("Portrait program allocation failed.");
      shaders.forEach((shader) => gl.attachShader(this.program, shader));
      gl.linkProgram(this.program);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
        throw new Error(
          gl.getProgramInfoLog(this.program) ||
            "Portrait program linking failed.",
        );
      shaders.forEach((shader) => gl.detachShader(this.program, shader));
      this.vao = gl.createVertexArray();
      this.texture = gl.createTexture();
      if (!this.vao || !this.texture)
        throw new Error("Portrait texture allocation failed.");
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      this.uniforms = Object.fromEntries(
        [
          "uPhoto",
          "uGrid",
          "uResolution",
          "uPointer",
          "uPointerStrength",
          "uImageAspect",
          "uAmount",
          "uTime",
          "uDpr",
        ].map((name) => [name, gl.getUniformLocation(this.program, name)]),
      );
    } catch (error) {
      this.destroy();
      throw error;
    } finally {
      shaders.forEach((shader) => gl.deleteShader(shader));
    }
  }

  draw({ width, height, dpr, amount, time, pointer, pointerStrength }) {
    const gl = this.gl;
    if (!this.program || gl.isContextLost()) return false;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
    );
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    const u = this.uniforms;
    gl.uniform1i(u.uPhoto, 0);
    gl.uniform1i(u.uGrid, this.grid);
    gl.uniform2f(u.uResolution, width, height);
    gl.uniform2f(u.uPointer, pointer.x, pointer.y);
    gl.uniform1f(u.uPointerStrength, pointerStrength);
    gl.uniform1f(u.uImageAspect, this.imageAspect);
    gl.uniform1f(u.uAmount, amount);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uDpr, dpr);
    gl.drawArrays(gl.POINTS, 0, this.grid * this.grid);
    return true;
  }

  destroy() {
    if (!this.gl.isContextLost()) {
      if (this.program) this.gl.deleteProgram(this.program);
      if (this.texture) this.gl.deleteTexture(this.texture);
      if (this.vao) this.gl.deleteVertexArray(this.vao);
    }
    this.program = this.texture = this.vao = null;
  }
}

/**
 * Creates a reversible particle portrait on a button containing img.portrait-base.
 * reducedMotion may be a Boolean, MediaQueryList, or function returning a Boolean.
 * onState receives { ready, active, pinned, paused, unavailable } when state changes.
 */
export function createPortraitEffect(
  button,
  { imageUrl, reducedMotion = false, onState } = {},
) {
  const base = button?.querySelector("img.portrait-base");
  if (!base)
    throw new Error(
      "A portrait button containing img.portrait-base is required.",
    );
  const canvas = document.createElement("canvas");
  canvas.className = "portrait-particles";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.opacity = "0";
  canvas.style.pointerEvents = "none";
  button.append(canvas);
  const originalLabel = button.getAttribute("aria-label");
  const originalPressed = button.getAttribute("aria-pressed");
  const originalProgress = button.style.getPropertyValue("--portrait-progress");
  const originalOpacity = base.style.opacity;
  const nativeMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let gl = null,
    renderer = null,
    textureImage = null;
  let destroyed = false,
    lost = false,
    unavailable = false;
  let paused = false,
    inView = true,
    hovered = false,
    focused = false,
    pinned = false,
    suppressPreview = false;
  let amount = 0,
    velocity = 0,
    time = 0,
    lastTime = null,
    frame = null;
  let pointer = { x: 0, y: 0 },
    pointerTarget = { x: 0, y: 0 },
    pointerStrength = 0,
    dpr = 1;
  let lastState = "";
  const listeners = [];

  function listen(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    listeners.push(() => target.removeEventListener(event, handler, options));
  }
  function motionBlocked() {
    const requested =
      typeof reducedMotion === "function"
        ? reducedMotion()
        : typeof reducedMotion === "object"
          ? reducedMotion?.matches
          : reducedMotion;
    return paused || nativeMotion.matches || Boolean(requested);
  }
  function desired() {
    return pinned || (!suppressPreview && (hovered || focused));
  }
  function visible() {
    return !document.hidden && inView && !destroyed && !lost;
  }
  function emitState() {
    const state = {
      ready: Boolean(renderer),
      active: amount > 0.002 && !motionBlocked() && visible(),
      pinned,
      paused: motionBlocked(),
      unavailable,
    };
    const key = JSON.stringify(state);
    button.setAttribute("aria-pressed", String(pinned));
    button.setAttribute(
      "aria-label",
      state.paused
        ? "Portrait animation is paused"
        : state.unavailable
          ? "Sa'ood Williams portrait"
          : pinned
            ? "Reassemble portrait"
            : "Keep portrait particles open",
    );
    if (key !== lastState) {
      lastState = key;
      if (typeof onState === "function") onState(state);
    }
  }
  function restorePhoto() {
    amount = 0;
    velocity = 0;
    canvas.style.opacity = "0";
    base.style.opacity = originalOpacity;
    button.classList.remove("portrait-active");
    button.style.setProperty("--portrait-progress", "0");
    emitState();
  }
  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
  }
  function resize() {
    const bounds = button.getBoundingClientRect();
    dpr = Math.min(
      devicePixelRatio || 1,
      1.75,
      1100 / Math.max(bounds.width, bounds.height, 1),
    );
    const width = Math.max(1, Math.round(bounds.width * dpr));
    const height = Math.max(1, Math.round(bounds.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }
  function request() {
    if (destroyed) return;
    if (!visible() || motionBlocked() || !renderer) {
      stop();
      restorePhoto();
      return;
    }
    if (frame === null && (desired() || amount > 0.002))
      frame = requestAnimationFrame(tick);
    emitState();
  }
  function tick(now) {
    frame = null;
    if (!visible() || motionBlocked() || !renderer) {
      stop();
      restorePhoto();
      return;
    }
    const dt = Math.min(
      lastTime === null ? 1 / 60 : (now - lastTime) / 1000,
      0.05,
    );
    lastTime = now;
    time += dt;
    const target = desired() ? 1 : 0;
    velocity += (target - amount) * 56 * dt;
    velocity *= Math.exp(-12 * dt);
    amount = Math.max(0, Math.min(1, amount + velocity * dt));
    const follow = 1 - Math.exp(-9 * dt);
    pointer.x += (pointerTarget.x - pointer.x) * follow;
    pointer.y += (pointerTarget.y - pointer.y) * follow;
    pointerStrength += ((hovered ? 1 : 0) - pointerStrength) * follow;
    if (!target && amount < 0.002 && Math.abs(velocity) < 0.02) {
      stop();
      restorePhoto();
      return;
    }
    try {
      const rendered = renderer.draw({
        width: canvas.width,
        height: canvas.height,
        dpr,
        amount,
        time,
        pointer,
        pointerStrength,
      });
      if (!rendered) {
        stop();
        restorePhoto();
        return;
      }
      // The original photo fades only after a complete GPU frame exists.
      const fade = Math.min(1, amount / 0.16);
      canvas.style.opacity = String(fade);
      base.style.opacity = String(1 - fade);
      button.style.setProperty("--portrait-progress", String(fade));
      button.classList.add("portrait-active");
      emitState();
      frame = requestAnimationFrame(tick);
    } catch {
      unavailable = true;
      stop();
      restorePhoto();
      renderer?.destroy();
      renderer = null;
      emitState();
    }
  }
  function pointerPosition(event) {
    const bounds = button.getBoundingClientRect();
    pointerTarget = {
      x: Math.max(
        -1,
        Math.min(
          1,
          ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
        ),
      ),
      y: Math.max(
        -1,
        Math.min(
          1,
          1 - ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2,
        ),
      ),
    };
  }
  function initialiseRenderer() {
    if (destroyed || !textureImage?.naturalWidth) return;
    try {
      gl = canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        powerPreference: "low-power",
      });
      if (!gl) throw new Error("WebGL2 unavailable.");
      renderer = new PortraitRenderer(gl, textureImage, 240);
      unavailable = false;
      resize();
      emitState();
      request();
    } catch {
      unavailable = true;
      renderer = null;
      restorePhoto();
    }
  }

  listen(button, "pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    hovered = true;
    suppressPreview = false;
    pointerPosition(event);
    request();
  });
  listen(
    button,
    "pointermove",
    (event) => {
      pointerPosition(event);
      request();
    },
    { passive: true },
  );
  listen(button, "pointerleave", () => {
    hovered = false;
    suppressPreview = false;
    pointerTarget = { x: 0, y: 0 };
    request();
  });
  listen(button, "pointerdown", pointerPosition, { passive: true });
  listen(button, "focus", () => {
    focused = button.matches(":focus-visible");
    suppressPreview = false;
    request();
  });
  listen(button, "blur", () => {
    focused = false;
    suppressPreview = false;
    request();
  });
  listen(button, "click", () => {
    if (motionBlocked() || unavailable) return;
    pinned = !pinned;
    suppressPreview = true;
    request();
  });
  listen(document, "visibilitychange", request);
  listen(nativeMotion, "change", request);
  if (
    reducedMotion &&
    typeof reducedMotion === "object" &&
    reducedMotion !== nativeMotion &&
    typeof reducedMotion.addEventListener === "function"
  )
    listen(reducedMotion, "change", request);
  listen(canvas, "webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    stop();
    restorePhoto();
  });
  listen(canvas, "webglcontextrestored", () => {
    lost = false;
    renderer = null;
    initialiseRenderer();
  });
  const resizeObserver = new ResizeObserver(() => {
    resize();
    request();
  });
  resizeObserver.observe(button);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    request();
  });
  intersectionObserver.observe(button);
  listen(window, "pagehide", () => {
    stop();
    restorePhoto();
  });
  listen(window, "pageshow", request);

  const source = new URL(
    imageUrl || base.currentSrc || base.src,
    document.baseURI,
  ).href;
  textureImage = base.src === source ? base : new Image();
  if (textureImage !== base) {
    textureImage.crossOrigin = "anonymous";
    textureImage.src = source;
  }
  if (textureImage.complete && textureImage.naturalWidth) initialiseRenderer();
  else {
    listen(textureImage, "load", initialiseRenderer, { once: true });
    listen(
      textureImage,
      "error",
      () => {
        unavailable = true;
        restorePhoto();
      },
      { once: true },
    );
  }
  emitState();

  return {
    setPaused(value) {
      paused = Boolean(value);
      request();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      listeners.splice(0).forEach((remove) => remove());
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer?.destroy();
      renderer = null;
      canvas.remove();
      base.style.opacity = originalOpacity;
      button.classList.remove("portrait-active");
      if (originalProgress)
        button.style.setProperty("--portrait-progress", originalProgress);
      else button.style.removeProperty("--portrait-progress");
      if (originalLabel === null) button.removeAttribute("aria-label");
      else button.setAttribute("aria-label", originalLabel);
      if (originalPressed === null) button.removeAttribute("aria-pressed");
      else button.setAttribute("aria-pressed", originalPressed);
    },
  };
}
