export const MAX_SOURCE_LENGTH = 24000;
export const MAX_PATCH_BYTES = 180000;
export const MAX_SAVED_PATCHES = 12;

const header = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uScale;
uniform float uIntensity;
out vec4 outColor;
`;

const noise = `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float result = 0.0, amplitude = 0.5;
  mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    result += amplitude * noise(p);
    p = turn * p * 2.03 + 4.7;
    amplitude *= 0.5;
  }
  return result;
}
`;

export const presets = [
  {
    id: "tide",
    name: "Tidal glass",
    detail: "Domain-warped liquid in copper and petrol blue",
    source:
      header +
      noise +
      `
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  p = p * uScale * 2.2 + uPointer * 0.24;
  float t = uTime * 0.12;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(4.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.8 * q + vec2(t, 2.1)), fbm(p + 3.8 * q + vec2(8.3, -t)));
  float f = fbm(p + 4.6 * r);
  float folds = sin(f * 18.0 + q.x * 3.0);
  vec3 color = mix(vec3(0.012, 0.034, 0.050), vec3(0.05, 0.37, 0.43), smoothstep(0.22, 0.72, f));
  color = mix(color, vec3(0.92, 0.30, 0.10), smoothstep(0.43, 0.78, r.x));
  float glint = pow(max(0.0, 1.0 - abs(folds)), 8.0);
  color += vec3(1.0, 0.80, 0.50) * glint * 0.36 * uIntensity;
  color *= 0.55 + 0.65 * uIntensity;
  outColor = vec4(pow(max(color, vec3(0.0)), vec3(0.87)), 1.0);
}
`,
  },
  {
    id: "orbit",
    name: "Chromatic orb",
    detail: "A shaded sphere with moving interference bands",
    source:
      header +
      `
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y * uScale;
  p -= uPointer * 0.075;
  float t = uTime * 0.24;
  float radius = 0.34, r = length(p);
  float aa = fwidth(r) * 1.5;
  vec3 color = vec3(0.009, 0.012, 0.027);
  float halo = exp(-abs(r - radius) * 22.0);
  color += vec3(0.23, 0.14, 0.64) * halo * 0.42 * uIntensity;
  float z = sqrt(max(0.0, radius * radius - r * r)) / radius;
  vec3 n = normalize(vec3(p / radius, max(z, 0.001)));
  float bands = sin(n.y * 13.0 + n.x * 4.0 + sin(n.z * 7.0 + t) * 2.0 - t);
  vec3 surface = 0.5 + 0.5 * cos(vec3(0.3, 2.4, 4.3) + bands * 2.8 + n.z * 3.0);
  vec3 light = normalize(vec3(-0.5 + uPointer.x * 0.5, 0.7 + uPointer.y * 0.5, 1.0));
  float diffuse = max(0.0, dot(n, light));
  float specular = pow(max(0.0, dot(reflect(-light, n), vec3(0,0,1))), 42.0);
  float rim = pow(1.0 - z, 2.6);
  surface = surface * (0.14 + diffuse * 0.9) + vec3(1.0, 0.85, 0.7) * specular;
  surface += vec3(0.32, 0.28, 0.7) * rim;
  color = mix(color, surface * uIntensity, 1.0 - smoothstep(radius - aa, radius + aa, r));
  outColor = vec4(color, 1.0);
}
`,
  },
  {
    id: "topography",
    name: "Contour atlas",
    detail: "Antialiased contour lines across a shifting field",
    source:
      header +
      noise +
      `
float contour(float value, float frequency, float width) {
  float v = value * frequency;
  float distanceToLine = abs(fract(v + 0.5) - 0.5);
  float aa = max(fwidth(v), 0.0001);
  return 1.0 - smoothstep(width * aa, (width + 1.0) * aa, distanceToLine);
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  p = p * uScale * 1.5 + uPointer * 0.17;
  float t = uTime * 0.065;
  float f = fbm(p * 2.1 + vec2(t, -t)) + length(p + vec2(0.1, 0.3)) * 0.24;
  float minor = contour(f, 42.0, 0.1);
  float major = contour(f, 10.5, 0.5);
  vec3 color = mix(vec3(0.028, 0.032, 0.04), vec3(0.11, 0.15, 0.17), f);
  color = mix(color, vec3(0.29, 0.38, 0.40), minor * 0.65 * min(uIntensity, 1.0));
  color = mix(color, vec3(0.96, 0.49, 0.24) * uIntensity, major);
  outColor = vec4(color, 1.0);
}
`,
  },
  {
    id: "interference",
    name: "Wave interference",
    detail: "Two moving wave sources and spectral fringes",
    source:
      header +
      `
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y * uScale;
  float t = uTime * 0.35;
  vec2 a = vec2(-0.3, 0.12 * sin(t)) + uPointer * 0.18;
  vec2 b = vec2(0.32, 0.18 * cos(t * 0.8));
  float d1 = length(p - a), d2 = length(p - b);
  float wave = sin(d1 * 34.0 - t * 4.0) + sin(d2 * 34.0 - t * 4.0);
  float fringe = pow(0.5 + 0.5 * sin((d1 - d2) * 34.0), 3.0);
  vec3 spectrum = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + (d1 + d2) * 5.0 - t);
  vec3 color = vec3(0.012, 0.022, 0.030);
  color += spectrum * (0.08 + fringe * 0.75) * (0.3 + 0.7 * pow(abs(wave) * 0.5, 2.0)) * uIntensity;
  color += vec3(0.85, 0.9, 1.0) * (exp(-d1 * 100.0) + exp(-d2 * 100.0));
  outColor = vec4(color, 1.0);
}
`,
  },
  {
    id: "signal",
    name: "Signal ribbons",
    detail: "Layered light trails with a responsive bend",
    source:
      header +
      `
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y * uScale;
  float t = uTime * 0.32;
  vec3 color = vec3(0.012, 0.009, 0.026);
  for (int i = 0; i < 8; i++) {
    float k = float(i);
    float curve = sin(p.x * 3.0 + t + k * 0.18) * 0.20;
    curve += cos(p.x * 1.8 - t + k * 0.3) * 0.09;
    curve += uPointer.y * 0.16 * exp(-pow(p.x - uPointer.x * 0.7, 2.0) * 4.0);
    curve += (k - 3.5) * 0.025;
    float d = abs(p.y - curve);
    float core = exp(-d * 280.0);
    float glow = exp(-d * 25.0) * 0.12;
    vec3 hue = 0.5 + 0.5 * cos(vec3(0.0, 1.8, 3.6) + k * 0.4 + p.x * 0.9);
    color += hue * (core * 0.55 + glow) * uIntensity;
  }
  color = 1.0 - exp(-color);
  outColor = vec4(color, 1.0);
}
`,
  },
];

export function validateSource(source) {
  return (
    typeof source === "string" &&
    source.trim().length > 0 &&
    source.length <= MAX_SOURCE_LENGTH
  );
}

export function validatePatch(patch) {
  return Boolean(
    patch &&
    typeof patch === "object" &&
    !Array.isArray(patch) &&
    typeof patch.id === "string" &&
    /^[a-zA-Z0-9_-]{1,80}$/.test(patch.id) &&
    typeof patch.name === "string" &&
    patch.name.trim().length > 0 &&
    patch.name.length <= 100 &&
    validateSource(patch.source) &&
    (patch.settings === undefined ||
      (patch.settings &&
        typeof patch.settings === "object" &&
        Number.isFinite(patch.settings.scale) &&
        patch.settings.scale >= 0.45 &&
        patch.settings.scale <= 2.5 &&
        Number.isFinite(patch.settings.intensity) &&
        patch.settings.intensity >= 0.2 &&
        patch.settings.intensity <= 2)),
  );
}

export function serialisePatch(patch) {
  if (!validatePatch(patch)) throw new Error("Invalid shader patch");
  return JSON.stringify(
    {
      id: patch.id,
      name: patch.name.trim(),
      source: patch.source,
      ...(patch.settings
        ? {
            settings: {
              scale: patch.settings.scale,
              intensity: patch.settings.intensity,
            },
          }
        : {}),
    },
    null,
    2,
  );
}

export function readSavedPatches(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) return [];
    const ids = new Set();
    return parsed
      .filter((patch) => {
        if (!validatePatch(patch) || ids.has(patch.id)) return false;
        ids.add(patch.id);
        return true;
      })
      .slice(0, MAX_SAVED_PATCHES);
  } catch {
    return [];
  }
}

export function readPortfolioMotionMessage(
  event,
  { preview, parentWindow, origin },
) {
  const data = event?.data;
  if (
    !event ||
    !preview ||
    event.source !== parentWindow ||
    event.origin !== origin ||
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    data.type !== "portfolio-motion" ||
    typeof data.paused !== "boolean" ||
    (data.visible !== undefined && typeof data.visible !== "boolean")
  )
    return null;
  return {
    paused: data.paused,
    ...(data.visible !== undefined ? { visible: data.visible } : {}),
  };
}
