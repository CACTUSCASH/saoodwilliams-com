/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-1fc2cb7faf10 */(()=>{const e=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(e)||e.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{ACES_GLSL as t,GAMMA as a}from"./tonemap.js?v=515dba1803";import{LIMITS as o}from"./scene.js?v=515dba1803";const c=`#version 300 es
void main(){
vec2 p = vec2(float((gl_VertexID << 1)& 2),float(gl_VertexID & 2));
gl_Position = vec4(p * 2.0 - 1.0,0.0,1.0);
}
`,s=`#version 300 es
precision highp float;
uniform sampler2D uAccum;
uniform float uExposure;
uniform int uEncode;
out vec4 outColor;
${t}
void main(){
vec3 c = texelFetch(uAccum,ivec2(gl_FragCoord.xy),0).rgb;
if(uEncode == 1)c = c / max(vec3(1.0)- c,vec3(1.0 / 255.0));
vec3 mapped = pow(aces(c * uExposure),vec3(${(1/a).toFixed(6)}));
float dither =(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))* 43758.5453)- 0.5)/ 255.0;
outColor = vec4(mapped + dither,1.0);
}
`;function l(e){return`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform int uFrame;
uniform int uSamples;
uniform int uBounces;
uniform float uBlend;
uniform int uEncode;
uniform sampler2D uPrev;
uniform vec3 uEye;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uForward;
uniform float uTanHalfFov;
uniform vec4 uMatA[${o.materials}];
uniform vec4 uMatB[${o.materials}];
uniform vec4 uLights[${o.lights}];
uniform int uLightMat[${o.lights}];
uniform int uLightCount;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;
uniform vec3 uSkyGround;
uniform float uSkyIntensity;
uniform float uLumaClamp;
out vec4 outColor;
vec3 clampIndirect(vec3 c,int bounce){
float l = dot(c,vec3(0.2126,0.7152,0.0722));
return bounce > 0 && l > uLumaClamp ? c *(uLumaClamp / l): c;
}
const float PI = 3.14159265358979;
const int MAX_STEPS = 192;
const float T_MAX = 80.0;
${e}
uint rngState;
uint hash(uint v){
uint s = v * 747796405u + 2891336453u;
uint w =((s >>((s >> 28u)+ 4u))^ s)* 277803737u;
return(w >> 22u)^ w;
}
float rand(){
rngState = hash(rngState);
return float(rngState)*(1.0 / 4294967296.0);
}
float lum(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}
float trace(vec3 ro,vec3 rd,float tMax,out vec2 hit){
float omega = 1.4;
float t = 0.0;
float previousRadius = 0.0;
float stepLength = 0.0;
hit = vec2(0.0,-1.0);
for(int i = 0;i < MAX_STEPS;i++){
vec2 h = map(ro + rd * t);
float radius = abs(h.x);
bool sorFail = omega > 1.0 &&(radius + previousRadius)< stepLength;
if(sorFail){
stepLength -= omega * stepLength;
omega = 1.0;
}else{
stepLength = h.x * omega;
}
previousRadius = radius;
if(!sorFail && radius < max(0.0003,0.0005 * t)){
hit = h;
return t;
}
t += stepLength;
if(t > tMax)break;
}
return -1.0;
}
vec3 normalAt(vec3 p,float t){
float e = max(0.0004,0.0003 * t);
const vec2 k = vec2(1.0,-1.0);
return normalize(k.xyy * map(p + k.xyy * e).x + k.yyx * map(p + k.yyx * e).x +
k.yxy * map(p + k.yxy * e).x + k.xxx * map(p + k.xxx * e).x);
}
vec3 sky(vec3 d){
vec3 c = d.y >= 0.0
? mix(uSkyHorizon,uSkyZenith,pow(d.y,0.55))
: mix(uSkyHorizon,uSkyGround,pow(-d.y,0.4));
return c * uSkyIntensity;
}
void basis(vec3 n,out vec3 t,out vec3 b){
float s = n.z >= 0.0 ? 1.0 : -1.0;
float a = -1.0 /(s + n.z);
float c = n.x * n.y * a;
t = vec3(1.0 + s * n.x * n.x * a,s * c,-s * n.x);
b = vec3(c,s + n.y * n.y * a,-n.y);
}
vec3 sampleCosine(vec3 n){
float u = rand();
float phi = 2.0 * PI * rand();
float r = sqrt(u);
vec3 t,b;
basis(n,t,b);
return normalize(t *(r * cos(phi))+ b *(r * sin(phi))+ n * sqrt(max(0.0,1.0 - u)));
}
struct Surface{vec3 albedo;float rough;float metal;vec3 emission;};
float G1(float NoX,float a2){return 2.0 * NoX /(NoX + sqrt(a2 +(1.0 - a2)* NoX * NoX));}
float specularProbability(Surface s,float NoV){
vec3 F0 = mix(vec3(0.04),s.albedo,s.metal);
float fs = lum(F0 +(1.0 - F0)* pow(1.0 - NoV,5.0));
float fd = lum(s.albedo)*(1.0 - s.metal);
return clamp(fs / max(fs + fd,1e-4),0.1,0.9);
}
vec3 evalBSDF(Surface s,vec3 n,vec3 v,vec3 l,out float pdf){
pdf = 0.0;
float NoL = dot(n,l);
if(NoL <= 0.0)return vec3(0.0);
float NoV = max(dot(n,v),1e-4);
vec3 h = normalize(v + l);
float NoH = max(dot(n,h),0.0);
float VoH = max(dot(v,h),1e-4);
float a = max(s.rough * s.rough,0.002);
float a2 = a * a;
float dd = NoH * NoH *(a2 - 1.0)+ 1.0;
float D = a2 /(PI * dd * dd);
float G = G1(NoV,a2)* G1(NoL,a2);
vec3 F0 = mix(vec3(0.04),s.albedo,s.metal);
vec3 F = F0 +(1.0 - F0)* pow(1.0 - VoH,5.0);
vec3 spec = D * G * F /(4.0 * NoV * NoL);
vec3 diff =(1.0 - s.metal)*(1.0 - F)* s.albedo / PI;
float ps = specularProbability(s,NoV);
pdf = ps * D * NoH /(4.0 * VoH)+(1.0 - ps)* NoL / PI;
return diff + spec;
}
vec3 sampleBSDF(Surface s,vec3 n,vec3 v){
float NoV = max(dot(n,v),1e-4);
if(rand()< specularProbability(s,NoV)){
float a = max(s.rough * s.rough,0.002);
float a2 = a * a;
float u = rand();
float phi = 2.0 * PI * rand();
float cosT = sqrt((1.0 - u)/(1.0 +(a2 - 1.0)* u));
float sinT = sqrt(max(0.0,1.0 - cosT * cosT));
vec3 t,b;
basis(n,t,b);
vec3 h = normalize(t *(sinT * cos(phi))+ b *(sinT * sin(phi))+ n * cosT);
return reflect(-v,h);
}
return sampleCosine(n);
}
float lightPdf(vec3 p,vec4 L){
vec3 d = L.xyz - p;
float d2 = dot(d,d);
float r2 = L.w * L.w;
if(d2 <= r2)return 0.0;
float x = r2 / d2;
return 1.0 /(2.0 * PI *(x /(1.0 + sqrt(1.0 - x))));
}
vec3 sampleLight(vec3 p,vec4 L,out float pdf,out float dist){
vec3 d = L.xyz - p;
float d2 = dot(d,d);
float r2 = L.w * L.w;
pdf = 0.0;
dist = 0.0;
if(d2 <= r2)return vec3(0.0,1.0,0.0);
float x = r2 / d2;
float oneMinusCosMax = x /(1.0 + sqrt(1.0 - x));
float oneMinusCos = rand()* oneMinusCosMax;
float cosT = 1.0 - oneMinusCos;
float sinT = sqrt(max(0.0,oneMinusCos *(2.0 - oneMinusCos)));
float phi = 2.0 * PI * rand();
vec3 axis = d / sqrt(d2);
vec3 t,b;
basis(axis,t,b);
vec3 dir = t *(sinT * cos(phi))+ b *(sinT * sin(phi))+ axis * cosT;
float proj = dot(dir,d);
dist = proj - sqrt(max(0.0,proj * proj -(d2 - r2)));
pdf = 1.0 /(2.0 * PI * oneMinusCosMax);
return dir;
}
int lightAt(vec3 p,int m){
for(int i = 0;i <${o.lights};i++){
if(i >= uLightCount)break;
if(uLightMat[i] == m && length(p - uLights[i].xyz)< uLights[i].w * 1.02 + 0.003)return i;
}
return -1;
}
float powerHeuristic(float a,float b){return a * a / max(a * a + b * b,1e-20);}
vec3 radiance(vec3 ro,vec3 rd){
vec3 L = vec3(0.0);
vec3 T = vec3(1.0);
vec3 prevP = ro;
float prevPdf = 0.0;
for(int bounce = 0;bounce <= 8;bounce++){
if(bounce > uBounces)break;
vec2 h;
float t = trace(ro,rd,T_MAX,h);
if(t < 0.0){
L += clampIndirect(T * sky(rd),bounce);
break;
}
vec3 p = ro + rd * t;
int m = int(h.y + 0.5);
Surface s = Surface(uMatA[m].rgb,uMatA[m].a,uMatB[m].a,uMatB[m].rgb);
if(max(s.emission.r,max(s.emission.g,s.emission.b))> 0.0){
float w = 1.0;
if(prevPdf > 0.0){
int li = lightAt(p,m);
if(li >= 0)w = powerHeuristic(prevPdf,lightPdf(prevP,uLights[li])/ float(uLightCount));
}
L += clampIndirect(T * s.emission * w,bounce);
break;
}
if(bounce == uBounces)break;
vec3 v = -rd;
vec3 n = normalAt(p,t);
float nv = dot(n,v);
if(nv < 0.001)n = normalize(n + v *(0.001 - nv));
vec3 o = p + n * max(0.0012,0.0006 * t);
if(uLightCount > 0){
int li = min(int(rand()* float(uLightCount)),uLightCount - 1);
vec4 Ls = uLights[li];
float lp,dist;
vec3 l = sampleLight(o,Ls,lp,dist);
if(lp > 0.0 && dot(n,l)> 0.0){
vec2 sh;
float st = trace(o,l,dist + Ls.w,sh);
bool visible = st < 0.0 || lightAt(o + l * st,int(sh.y + 0.5))== li;
if(visible){
float bp;
vec3 f = evalBSDF(s,n,v,l,bp);
float pl = lp / float(uLightCount);
L += clampIndirect(T * uMatB[uLightMat[li]].rgb * f * dot(n,l)* powerHeuristic(pl,bp)/ pl,bounce + 1);
}
}
}
vec3 l = sampleBSDF(s,n,v);
float pdf;
vec3 f = evalBSDF(s,n,v,l,pdf);
if(pdf < 1e-7)break;
T *= f * dot(n,l)/ pdf;
prevP = o;
prevPdf = pdf;
ro = o;
rd = l;
if(bounce >= 2){
float q = clamp(max(T.r,max(T.g,T.b)),0.05,0.95);
if(rand()> q)break;
T /= q;
}
}
return L;
}
void main(){
uvec2 px = uvec2(gl_FragCoord.xy);
rngState = hash(px.x + hash(px.y + hash(uint(uFrame)+ 0x9E3779B9u)));
vec3 acc = vec3(0.0);
for(int i = 0;i < 8;i++){
if(i >= uSamples)break;
vec2 jitter = vec2(rand(),rand());
vec2 ndc =((gl_FragCoord.xy - 0.5 + jitter)/ uResolution)* 2.0 - 1.0;
ndc.x *= uResolution.x / uResolution.y;
vec3 rd = normalize(uForward +(uRight * ndc.x + uUp * ndc.y)* uTanHalfFov);
vec3 c = radiance(uEye,rd);
if(any(isnan(c))|| any(isinf(c)))c = vec3(0.0);
acc += c;
}
vec3 color = acc / float(uSamples);
vec3 prev = texelFetch(uPrev,ivec2(gl_FragCoord.xy),0).rgb;
if(uEncode == 1)prev = prev / max(vec3(1.0)- prev,vec3(1.0 / 255.0));
vec3 mixed = mix(prev,color,uBlend);
outColor = vec4(uEncode == 1 ? mixed /(1.0 + mixed): mixed,1.0);
}
`}export{s as DISPLAY_SHADER,c as VERTEX_SHADER,l as traceShader};
