/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-43673d6058cb */(()=>{const e=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(e)||e.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();const l=24e3,f=18e4,c=12,r=`#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uScale;
uniform float uIntensity;
out vec4 outColor;
`,s=`
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
`,d=[{id:"tide",name:"Tidal glass",detail:"Domain-warped liquid in copper and petrol blue",source:r+s+`
void main(){
vec2 p =(gl_FragCoord.xy - 0.5 * uResolution)/ uResolution.y;
p = p * uScale * 2.2 + uPointer * 0.24;
float t = uTime * 0.12;
vec2 q = vec2(fbm(p + t),fbm(p + vec2(4.2,1.3)- t));
vec2 r = vec2(fbm(p + 3.8 * q + vec2(t,2.1)),fbm(p + 3.8 * q + vec2(8.3,-t)));
float f = fbm(p + 4.6 * r);
float folds = sin(f * 18.0 + q.x * 3.0);
vec3 color = mix(vec3(0.012,0.034,0.050),vec3(0.05,0.37,0.43),smoothstep(0.22,0.72,f));
color = mix(color,vec3(0.92,0.30,0.10),smoothstep(0.43,0.78,r.x));
float glint = pow(max(0.0,1.0 - abs(folds)),8.0);
color += vec3(1.0,0.80,0.50)* glint * 0.36 * uIntensity;
color *= 0.55 + 0.65 * uIntensity;
outColor = vec4(pow(max(color,vec3(0.0)),vec3(0.87)),1.0);
}
`},{id:"orbit",name:"Chromatic orb",detail:"A shaded sphere with moving interference bands",source:r+`
void main(){
vec2 p =(gl_FragCoord.xy - 0.5 * uResolution)/ uResolution.y * uScale;
p -= uPointer * 0.075;
float t = uTime * 0.24;
float radius = 0.34,r = length(p);
float aa = fwidth(r)* 1.5;
vec3 color = vec3(0.009,0.012,0.027);
float halo = exp(-abs(r - radius)* 22.0);
color += vec3(0.23,0.14,0.64)* halo * 0.42 * uIntensity;
float z = sqrt(max(0.0,radius * radius - r * r))/ radius;
vec3 n = normalize(vec3(p / radius,max(z,0.001)));
float bands = sin(n.y * 13.0 + n.x * 4.0 + sin(n.z * 7.0 + t)* 2.0 - t);
vec3 surface = 0.5 + 0.5 * cos(vec3(0.3,2.4,4.3)+ bands * 2.8 + n.z * 3.0);
vec3 light = normalize(vec3(-0.5 + uPointer.x * 0.5,0.7 + uPointer.y * 0.5,1.0));
float diffuse = max(0.0,dot(n,light));
float specular = pow(max(0.0,dot(reflect(-light,n),vec3(0,0,1))),42.0);
float rim = pow(1.0 - z,2.6);
surface = surface *(0.14 + diffuse * 0.9)+ vec3(1.0,0.85,0.7)* specular;
surface += vec3(0.32,0.28,0.7)* rim;
color = mix(color,surface * uIntensity,1.0 - smoothstep(radius - aa,radius + aa,r));
outColor = vec4(color,1.0);
}
`},{id:"topography",name:"Contour atlas",detail:"Antialiased contour lines across a shifting field",source:r+s+`
float contour(float value,float frequency,float width){
float v = value * frequency;
float distanceToLine = abs(fract(v + 0.5)- 0.5);
float aa = max(fwidth(v),0.0001);
return 1.0 - smoothstep(width * aa,(width + 1.0)* aa,distanceToLine);
}
void main(){
vec2 p =(gl_FragCoord.xy - 0.5 * uResolution)/ uResolution.y;
p = p * uScale * 1.5 + uPointer * 0.17;
float t = uTime * 0.065;
float f = fbm(p * 2.1 + vec2(t,-t))+ length(p + vec2(0.1,0.3))* 0.24;
float minor = contour(f,42.0,0.1);
float major = contour(f,10.5,0.5);
vec3 color = mix(vec3(0.028,0.032,0.04),vec3(0.11,0.15,0.17),f);
color = mix(color,vec3(0.29,0.38,0.40),minor * 0.65 * min(uIntensity,1.0));
color = mix(color,vec3(0.96,0.49,0.24)* uIntensity,major);
outColor = vec4(color,1.0);
}
`},{id:"interference",name:"Wave interference",detail:"Two moving wave sources and spectral fringes",source:r+`
void main(){
vec2 p =(gl_FragCoord.xy - 0.5 * uResolution)/ uResolution.y * uScale;
float t = uTime * 0.35;
vec2 a = vec2(-0.3,0.12 * sin(t))+ uPointer * 0.18;
vec2 b = vec2(0.32,0.18 * cos(t * 0.8));
float d1 = length(p - a),d2 = length(p - b);
float wave = sin(d1 * 34.0 - t * 4.0)+ sin(d2 * 34.0 - t * 4.0);
float fringe = pow(0.5 + 0.5 * sin((d1 - d2)* 34.0),3.0);
vec3 spectrum = 0.5 + 0.5 * cos(vec3(0.0,2.0,4.0)+(d1 + d2)* 5.0 - t);
vec3 color = vec3(0.012,0.022,0.030);
color += spectrum *(0.08 + fringe * 0.75)*(0.3 + 0.7 * pow(abs(wave)* 0.5,2.0))* uIntensity;
color += vec3(0.85,0.9,1.0)*(exp(-d1 * 100.0)+ exp(-d2 * 100.0));
outColor = vec4(color,1.0);
}
`},{id:"signal",name:"Signal ribbons",detail:"Layered light trails with a responsive bend",source:r+`
void main(){
vec2 p =(gl_FragCoord.xy - 0.5 * uResolution)/ uResolution.y * uScale;
float t = uTime * 0.32;
vec3 color = vec3(0.012,0.009,0.026);
for(int i = 0;i < 8;i++){
float k = float(i);
float curve = sin(p.x * 3.0 + t + k * 0.18)* 0.20;
curve += cos(p.x * 1.8 - t + k * 0.3)* 0.09;
curve += uPointer.y * 0.16 * exp(-pow(p.x - uPointer.x * 0.7,2.0)* 4.0);
curve +=(k - 3.5)* 0.025;
float d = abs(p.y - curve);
float core = exp(-d * 280.0);
float glow = exp(-d * 25.0)* 0.12;
vec3 hue = 0.5 + 0.5 * cos(vec3(0.0,1.8,3.6)+ k * 0.4 + p.x * 0.9);
color += hue *(core * 0.55 + glow)* uIntensity;
}
color = 1.0 - exp(-color);
outColor = vec4(color,1.0);
}
`}];function u(e){return typeof e=="string"&&e.trim().length>0&&e.length<=l}function a(e){return!!(e&&typeof e=="object"&&!Array.isArray(e)&&typeof e.id=="string"&&/^[a-zA-Z0-9_-]{1,80}$/.test(e.id)&&typeof e.name=="string"&&e.name.trim().length>0&&e.name.length<=100&&u(e.source)&&(e.settings===void 0||e.settings&&typeof e.settings=="object"&&Number.isFinite(e.settings.scale)&&e.settings.scale>=.45&&e.settings.scale<=2.5&&Number.isFinite(e.settings.intensity)&&e.settings.intensity>=.2&&e.settings.intensity<=2))}function v(e){if(!a(e))throw new Error("Invalid shader patch");return JSON.stringify({id:e.id,name:e.name.trim(),source:e.source,...e.settings?{settings:{scale:e.settings.scale,intensity:e.settings.intensity}}:{}},null,2)}function m(e){try{const t=JSON.parse(e||"[]");if(!Array.isArray(t))return[];const n=new Set;return t.filter(i=>!a(i)||n.has(i.id)?!1:(n.add(i.id),!0)).slice(0,c)}catch{return[]}}function p(e,{preview:t,parentWindow:n,origin:i}){const o=e?.data;return!e||!t||e.source!==n||e.origin!==i||!o||typeof o!="object"||Array.isArray(o)||o.type!=="portfolio-motion"||typeof o.paused!="boolean"||o.visible!==void 0&&typeof o.visible!="boolean"?null:{paused:o.paused,...o.visible!==void 0?{visible:o.visible}:{}}}export{f as MAX_PATCH_BYTES,c as MAX_SAVED_PATCHES,l as MAX_SOURCE_LENGTH,d as presets,p as readPortfolioMotionMessage,m as readSavedPatches,v as serialisePatch,a as validatePatch,u as validateSource};
