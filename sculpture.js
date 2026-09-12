// A projected parametric point field. Rendering sleeps outside the viewport.
export function createSculpture(canvas, { paused = false } = {}) {
  const context = canvas.getContext("2d");
  if (!context) return { redraw() {}, setPaused() {}, setShape() {} };
  let width = 0,
    height = 0,
    frame = 0,
    time = 0,
    last = 0,
    shape = "orbit",
    inView = true;
  let pointer = { x: 0, y: 0 },
    rotation = { x: 0.28, y: 0 },
    points = [];
  const rowCount = 42,
    columnCount = 72;
  function generate(kind) {
    const next = [];
    for (let i = 0; i < rowCount; i++) {
      const u = i / (rowCount - 1);
      for (let j = 0; j < columnCount; j++) {
        const v = j / columnCount;
        const a = u * Math.PI * 2,
          b = v * Math.PI * 2;
        let x, y, z;
        if (kind === "sphere") {
          const latitude = u * Math.PI;
          const ripple = 1 + 0.05 * Math.sin(5 * b + 6 * latitude);
          x = Math.sin(latitude) * Math.cos(b) * ripple;
          y = Math.cos(latitude) * ripple;
          z = Math.sin(latitude) * Math.sin(b) * ripple;
        } else if (kind === "wave") {
          x = (v - 0.5) * 2.6;
          z = (u - 0.5) * 2.6;
          y = 0.27 * Math.sin(v * 10 + u * 7) + 0.16 * Math.cos(u * 13 - v * 6);
        } else {
          const radius = 0.7 + 0.13 * Math.sin(3 * b);
          const tube = 0.29 + 0.035 * Math.cos(5 * b);
          x = (radius + tube * Math.cos(a)) * Math.cos(b);
          y = tube * Math.sin(a) + 0.18 * Math.sin(3 * b);
          z = (radius + tube * Math.cos(a)) * Math.sin(b);
        }
        next.push({ x, y, z, u, v });
      }
    }
    return next;
  }
  let target = generate(shape);
  points = target.map((p) => ({ ...p }));
  function render(now = performance.now()) {
    frame = 0;
    const delta = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!paused) time += delta;
    rotation.x += (pointer.y * 0.3 + 0.4 - rotation.x) * 0.04;
    rotation.y += (pointer.x * 0.5 - rotation.y) * 0.04;
    context.clearRect(0, 0, width, height);
    const light = document.documentElement.dataset.theme === "light";
    const size = Math.min(width, height) * 0.36;
    const ax = rotation.x + (shape === "wave" ? 0.42 : 0.18),
      ay = rotation.y + time * 0.15;
    const sx = Math.sin(ax),
      cx = Math.cos(ax),
      sy = Math.sin(ay),
      cy = Math.cos(ay),
      sz = Math.sin(-0.37),
      cz = Math.cos(-0.37);
    const projected = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i],
        t = target[i];
      const ease = paused ? 1 : 0.075;
      p.x += (t.x - p.x) * ease;
      p.y += (t.y - p.y) * ease;
      p.z += (t.z - p.z) * ease;
      let py = p.y;
      if (shape === "wave" && !paused)
        py += 0.055 * Math.sin(p.x * 4 + time * 1.3 + p.z * 2);
      const x1 = p.x * cy - p.z * sy,
        z1 = p.x * sy + p.z * cy;
      const y2 = py * cx - z1 * sx,
        z2 = py * sx + z1 * cx;
      const x3 = x1 * cz - y2 * sz,
        y3 = x1 * sz + y2 * cz;
      const perspective = 3.7 / (3.7 + z2);
      projected.push({
        x: width * 0.52 + x3 * size * perspective,
        y: height * 0.47 + y3 * size * perspective,
        z: z2,
        alpha: 0.22 + (0.5 - z2 * 0.35) * 0.6,
        r: 0.65 + (0.7 - z2 * 0.33) * 0.6,
        i,
      });
    }
    projected.sort((a, b) => b.z - a.z);
    for (const p of projected) {
      const hue = light ? 93 : 82;
      context.fillStyle = `hsla(${hue},${light ? 28 : 55}%,${light ? 25 : 74}%,${Math.min(0.94, p.alpha)})`;
      context.beginPath();
      context.arc(p.x, p.y, Math.max(0.5, p.r), 0, Math.PI * 2);
      context.fill();
    }
    // Sparse crosshairs anchor the sculpture without obscuring the point field.
    context.strokeStyle = light ? "#556b3d55" : "#d2ee9933";
    context.lineWidth = 0.65;
    for (const [x, y] of [
      [width * 0.14, height * 0.47],
      [width * 0.9, height * 0.47],
    ]) {
      context.beginPath();
      context.moveTo(x - 4, y);
      context.lineTo(x + 4, y);
      context.moveTo(x, y - 4);
      context.lineTo(x, y + 4);
      context.stroke();
    }
    if (!paused && inView && !document.hidden)
      frame = requestAnimationFrame(render);
  }
  function redraw() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) {
      last = performance.now();
      redraw();
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }).observe(canvas);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      last = performance.now();
      redraw();
    }
  });
  canvas.addEventListener(
    "pointermove",
    (event) => {
      const r = canvas.getBoundingClientRect();
      pointer = {
        x: ((event.clientX - r.left) / r.width) * 2 - 1,
        y: ((event.clientY - r.top) / r.height) * 2 - 1,
      };
      document.querySelector("#pointerX").textContent = pointer.x.toFixed(2);
      document.querySelector("#pointerY").textContent = pointer.y.toFixed(2);
      if (!paused) redraw();
    },
    { passive: true },
  );
  canvas.addEventListener("pointerleave", () => {
    pointer = { x: 0, y: 0 };
  });
  resize();
  return {
    redraw,
    setPaused(value) {
      paused = value;
      if (paused) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      redraw();
    },
    setShape(value) {
      shape = value;
      target = generate(value);
      redraw();
    },
  };
}
