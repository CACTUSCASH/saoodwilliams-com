/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-aba34a3222e2 */(()=>{const i=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(i)||i.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();const V=10,D=4,He=.8,Ve=1.1,Oe=.1,We=Object.freeze(["portrait","nebula","vortex","saturn","matrix","wave"]),N=(i,e,t)=>Math.max(e,Math.min(t,i));function Ne(i={},e={}){const t={mode:"portrait",palette:0,energy:.55,freeze:!1,spin:0,scale:1,...e};We.includes(i.mode)&&(t.mode=i.mode);for(const[u,d,s]of[["palette",0,3],["energy",0,1],["spin",-Math.PI,Math.PI],["scale",.6,1.6]])typeof i[u]=="number"&&Number.isFinite(i[u])&&(t[u]=N(i[u],d,s));return t.palette=Math.round(t.palette),typeof i.freeze=="boolean"&&(t.freeze=i.freeze),t}const qe=`#version 300 es
precision highp float;
#define MAX_FORCES${V}
uniform sampler2D uPhoto;
uniform int uGrid;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uImageAspect;
uniform float uAmount;
uniform float uTime;
uniform float uDpr;
uniform vec4 uForces[MAX_FORCES];
uniform int uForceCount;
uniform float uBurst;
uniform float uCamera;
uniform vec4 uWorld[2];
uniform vec4 uScene;
out vec3 vColour;
out float vOpacity;
out float vRoundness;
vec3 random3(float value){
return fract(sin(vec3(value * 0.1031,value * 0.11369,value * 0.13787)+ vec3(17.1,61.7,12.4))* 43758.5453);
}
vec3 spectrum(float t){
return 0.52 + 0.48 * cos(6.2831853 *(vec3(0.00,0.33,0.67)+ t));
}
void main(){
int col = gl_VertexID % uGrid;
int row = gl_VertexID / uGrid;
vec2 uv =(vec2(float(col),float(row))+ 0.5)/ float(uGrid);
float aspect = uResolution.x / uResolution.y;
vec2 cover = vec2(min(1.0,aspect / uImageAspect),min(1.0,uImageAspect / aspect));
vec2 sampleUv =(uv - 0.5)* cover;
sampleUv.x *= 1.0 - 2.0 * uCamera;
vec3 colour = texture(uPhoto,sampleUv + 0.5).rgb;
vec3 seed = random3(float(gl_VertexID)+ 1.0);
vec2 origin = uv * 2.0 - 1.0;
float luminance = dot(colour,vec3(0.2126,0.7152,0.0722));
float paper = smoothstep(0.83,0.98,min(colour.r,min(colour.g,colour.b)))*(1.0 - uCamera);
float release = smoothstep(0.18,0.95,seed.x);
float spread = uAmount * release;
vec3 position = vec3(origin,0.0);
position.xy *= 1.0 - 0.10 * uAmount;
position.z = uAmount *((luminance - 0.45)* 0.24 +(seed.z - 0.5)* release * 0.92);
position.z += uAmount *(cos(origin.x * 2.2)- 0.5)* 0.14;
position.xy +=(seed.xy - 0.5)* spread * vec2(0.12,0.10);
position.xy += normalize(origin + vec2(0.0001))* spread * 0.045;
position.x += sin(origin.y * 4.0 + position.z * 3.0 + uTime * 0.55)* spread * 0.022;
position.y += cos(origin.x * 3.0 - uTime * 0.40 + seed.z * 5.0)* spread * 0.018;
float worlds = dot(uWorld[0],vec4(1.0))+ uWorld[1].x;
float energy = uWorld[1].y;
float sceneOn = uWorld[1].w;
float motion = 0.28 + energy * 0.85;
float phase = uTime * motion;
vec3 rest = position;
if(worlds > 0.0001){
float nr = pow(seed.x,0.62)* 1.03;
float arm = floor(seed.y * 4.0)* 1.5707963;
float na = arm + nr * 4.8 - phase * 0.32 +(seed.z - 0.5)*(0.12 + nr * 0.85);
vec3 nebula = vec3(cos(na)* nr,sin(na)* nr * 0.74,(seed.z - 0.5)*(0.1 + nr * 0.65));
nebula.xy += vec2(sin(phase + seed.y * 9.0),cos(phase * 0.7 + seed.x * 8.0))* 0.025 * energy;
float vr = length(origin)* 0.63;
float va = atan(origin.y,origin.x)+ phase * 0.65 +(1.0 - vr)*(4.0 + 5.0 * energy);
vec3 vortex = vec3(cos(va)* vr,sin(va)* vr,-0.45 * exp(-vr * 3.5)+ seed.z * 0.08);
float longitude = seed.y * 6.2831853 + phase * 0.19;
float latitude = seed.z * 2.0 - 1.0;
float sphereRadius = sqrt(max(0.0,1.0 - latitude * latitude));
vec3 saturn;
if(seed.x < 0.54)saturn = vec3(cos(longitude)* sphereRadius,latitude,sin(longitude)* sphereRadius)* 0.41;
else{
float radius = 0.57 + pow((seed.x - 0.54)/ 0.46,0.8)* 0.48;
saturn = vec3(cos(longitude)* radius,(seed.z - 0.5)* 0.014,sin(longitude)* radius);
}
float tilt = 0.47;
saturn.yz = mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))* saturn.yz;
saturn.xy = mat2(0.94,-0.342,0.342,0.94)* saturn.xy;
float column = floor(uv.x * 72.0);
float fall = fract(uv.y + phase *(0.10 + random3(column + 41.0).x * 0.17));
vec3 matrix = vec3(((column + 0.5)/ 72.0 * 2.0 - 1.0)* 0.94 +(seed.x - 0.5)* 0.007,fall * 2.0 - 1.0,(seed.z - 0.5)* 0.12);
float wr = length(origin);
float waveHeight = sin(wr * 12.0 - phase * 2.0)* 0.13 + sin(origin.x * 7.0 + phase)* cos(origin.y * 6.0 - phase * 0.7)* 0.16;
vec3 wave = vec3(origin * 0.88,waveHeight *(0.5 + energy)+ luminance * 0.12);
wave.y += waveHeight * 0.19;
vec3 world = rest * max(0.0,1.0 - worlds)+ nebula * uWorld[0].x + vortex * uWorld[0].y + saturn * uWorld[0].z + matrix * uWorld[0].w + wave * uWorld[1].x;
position = mix(rest,world,smoothstep(0.0,0.65,uAmount));
vec3 cosmic = mix(vec3(0.10,0.78,1.0),vec3(0.80,0.25,1.0),0.5 + 0.5 * sin(na * 1.4 + nr * 4.0 + phase * 0.16));
cosmic += vec3(0.28,0.32,0.36)* exp(-nr * 8.0);
vec3 ringColour = mix(vec3(0.27,0.65,1.0),vec3(1.0,0.65,0.30),seed.x);
vec3 rainColour = mix(vec3(0.05,0.28,0.14),vec3(0.35,1.0,0.69),pow(fall,4.0));
vec3 worldColour = cosmic *(uWorld[0].x + uWorld[0].y + uWorld[1].x)+ ringColour * uWorld[0].z + rainColour * uWorld[0].w;
colour = mix(colour,worldColour *(0.6 + luminance * 0.5),min(worlds * 0.86,0.95));
}
if(sceneOn > 0.5){
float palette = uWorld[1].z;
if(palette > 0.5 && palette < 1.5)colour = mix(vec3(0.09,0.30,0.70),vec3(0.29,1.0,0.96),luminance)+ spectrum(luminance * 0.4 + 0.6)* 0.20;
else if(palette > 1.5 && palette < 2.5)colour = mix(vec3(0.52,0.05,0.23),vec3(1.0,0.88,0.37),luminance);
else if(palette > 2.5)colour = vec3(0.14 + luminance * 0.93);
float pulseAge = 1.0 - uScene.z;
float ring = exp(-pow((length(position.xy)- pulseAge * 2.2)/ 0.16,2.0))* sin(pulseAge * 3.1415926)* step(0.001,uScene.z);
position.xy += normalize(position.xy + vec2(0.0001))* ring *(0.2 + energy * 0.45);
position.z += ring *(seed.z - 0.5)* 0.8;
colour += vec3(0.22,0.35,0.45)* ring;
}
if(sceneOn > 0.5){
position.xy = mat2(cos(uScene.x),-sin(uScene.x),sin(uScene.x),cos(uScene.x))* position.xy;
position *= clamp(uScene.y,0.6,1.6);
}
float burst = uBurst * spread;
position.xy += normalize(origin + vec2(0.0001))* burst * 0.16;
position.z +=(seed.z - 0.5)* burst * 0.9;
vec2 distanceToPointer = position.xy - uPointer;
float influence = exp(-dot(distanceToPointer,distanceToPointer)* 18.0)* uPointerStrength * uAmount;
vec2 radial = normalize(distanceToPointer + vec2(0.0001));
position.xy += radial * influence *(0.035 + release * 0.055);
position.xy += vec2(-radial.y,radial.x)* influence * release * 0.065;
position.z += influence *(0.18 + seed.z * 0.20);
for(int i = 0;i < MAX_FORCES;i++){
if(i >= uForceCount)break;
vec4 force = uForces[i];
vec2 delta = position.xy - force.xy;
float distance2 = dot(delta,delta);
float radius = max(force.z,0.01);
float weight = exp(-distance2 /(radius * radius))* abs(force.w)* uAmount;
vec2 direction = delta * inversesqrt(distance2 + 0.000001);
vec2 tangent = vec2(-direction.y,direction.x);
if(force.w > 0.0){
position.xy +=(direction *(0.42 + release * 0.58)+ tangent * release * 0.55)* weight * radius;
position.z += weight *(0.10 + seed.z * 0.22);
}else{
position.xy = mix(position.xy,force.xy,min(weight *(0.55 + release * 0.35),0.94));
position.xy += tangent * weight * radius * release * 0.22;
position.z += weight * 0.18;
}
}
float yaw =(uPointer.x * 0.24 + sin(uTime * 0.22)* 0.035)* uAmount;
float pitch =(-uPointer.y * 0.17 + cos(uTime * 0.19)* 0.018)* uAmount;
position.xz = mat2(cos(yaw),-sin(yaw),sin(yaw),cos(yaw))* position.xz;
position.yz = mat2(cos(pitch),-sin(pitch),sin(pitch),cos(pitch))* position.yz;
float perspective = 1.0 / max(0.25,1.0 - position.z * 0.30);
gl_Position = vec4(position.xy * perspective,-position.z * 0.35,1.0);
float cell = max(uResolution.x,uResolution.y)/ float(uGrid);
gl_PointSize = clamp(cell * mix(1.16,0.98,uAmount)* perspective *(1.0 + 0.22 * uCamera),1.0,9.0 * uDpr);
vColour = colour + vec3(0.045)* uAmount *(1.0 - luminance);
vOpacity = 1.0 - paper * smoothstep(0.05,0.8,uAmount)* 0.985 *(1.0 - min(worlds,1.0));
vOpacity *= mix(1.0,0.48 + seed.z * 0.52,min(worlds,1.0));
vRoundness = smoothstep(0.0,0.45,uAmount);
}
`,je=`#version 300 es
precision highp float;
in vec3 vColour;
in float vOpacity;
in float vRoundness;
out vec4 outColour;
void main(){
float radius = length(gl_PointCoord - 0.5);
float circle = 1.0 - smoothstep(0.34,0.5,radius);
float alpha = mix(1.0,circle,vRoundness)* vOpacity;
if(alpha < 0.025)discard;
outColour = vec4(vColour,alpha);
}
`,y=(i,e=0)=>typeof i=="number"&&Number.isFinite(i)?i:e;function Ye(i,e=new Float32Array(V*D)){let t=0;if(!i||typeof i[Symbol.iterator]!="function")return 0;for(const u of i){if(t>=V||t*D>=e.length)break;if(!u)continue;const d=y(u.x,NaN),s=y(u.y,NaN),l=Math.min(2,y(u.radius)),p=Math.min(2,y(u.strength,1));if(!Number.isFinite(d)||!Number.isFinite(s)||l<=0||p<=0)continue;const P=t*D;e[P]=Math.max(-4,Math.min(4,d)),e[P+1]=Math.max(-4,Math.min(4,s)),e[P+2]=l,e[P+3]=u.mode==="pull"?-p:p,t++}return t}class Ke{constructor(e,t,u=240){if(this.gl=e,this.program=null,this.texture=null,this.vao=null,this.extended=null,this.playground=null,this.worldData=new Float32Array(8),this.sceneData=new Float32Array(4),this.camera=null,this.cameraShown=!1,!Number.isFinite(t.naturalWidth)||!Number.isFinite(t.naturalHeight)||t.naturalWidth<=0||t.naturalHeight<=0)throw new Error("A decoded portrait image is required.");this.grid=Math.max(128,Math.min(244,Math.round(Number.isFinite(u)?u:240))),this.imageAspect=t.naturalWidth/t.naturalHeight;const d=[];try{for(const[s,l]of[[e.VERTEX_SHADER,qe],[e.FRAGMENT_SHADER,je]]){const p=e.createShader(s);if(!p)throw new Error("Portrait shader allocation failed.");if(d.push(p),e.shaderSource(p,l),e.compileShader(p),!e.getShaderParameter(p,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(p)||"Portrait shader compilation failed.")}if(this.program=e.createProgram(),!this.program)throw new Error("Portrait program allocation failed.");if(d.forEach(s=>e.attachShader(this.program,s)),e.linkProgram(this.program),!e.getProgramParameter(this.program,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(this.program)||"Portrait program linking failed.");if(d.forEach(s=>e.detachShader(this.program,s)),this.vao=e.createVertexArray(),this.texture=e.createTexture(),!this.vao||!this.texture)throw new Error("Portrait texture allocation failed.");e.bindTexture(e.TEXTURE_2D,this.texture),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),this.uniforms=Object.fromEntries(["uPhoto","uGrid","uResolution","uPointer","uPointerStrength","uImageAspect","uAmount","uTime","uDpr"].map(s=>[s,e.getUniformLocation(this.program,s)]))}catch(s){throw this.destroy(),s}finally{d.forEach(s=>e.deleteShader(s))}}uploadCamera(e){const t=this.gl;if(!this.program||!e||t.isContextLost())return!1;const u=e.videoWidth||e.naturalWidth||e.width,d=e.videoHeight||e.naturalHeight||e.height;if(!(u>0&&d>0))return!1;if(!this.camera||this.camera.width!==u||this.camera.height!==d){this.dropCameraTexture();const s=t.createTexture();if(!s)throw new Error("Camera texture allocation failed.");this.camera={texture:s,width:u,height:d},t.bindTexture(t.TEXTURE_2D,s),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texStorage2D(t.TEXTURE_2D,1,t.RGBA8,u,d)}else t.bindTexture(t.TEXTURE_2D,this.camera.texture);return t.texSubImage2D(t.TEXTURE_2D,0,0,0,t.RGBA,t.UNSIGNED_BYTE,e),!0}showCamera(e){return this.cameraShown=!!e&&!!this.camera,this.cameraShown}releaseCamera(){this.dropCameraTexture(),this.cameraShown=!1}dropCameraTexture(){this.camera&&!this.gl.isContextLost()&&this.gl.deleteTexture(this.camera.texture),this.camera=null}extendedUniforms(){return this.extended||(this.extended=Object.fromEntries(["uForces","uForceCount","uBurst","uCamera"].map(e=>[e,this.gl.getUniformLocation(this.program,e)]))),this.extended}draw({width:e,height:t,dpr:u,amount:d,time:s,pointer:l,pointerStrength:p,forces:P=null,forceCount:ee=0,burst:te=0,scene:S=null}){const a=this.gl;if(!this.program||a.isContextLost())return!1;const n=this.cameraShown&&this.camera?this.camera:null;a.viewport(0,0,e,t),a.clearColor(0,0,0,0),a.clearDepth(1),a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT),a.enable(a.BLEND),a.blendFuncSeparate(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA),a.enable(a.DEPTH_TEST),a.depthFunc(a.LEQUAL),a.useProgram(this.program),a.bindVertexArray(this.vao),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,n?n.texture:this.texture);const f=this.uniforms;a.uniform1i(f.uPhoto,0),a.uniform1i(f.uGrid,this.grid),a.uniform2f(f.uResolution,e,t),a.uniform2f(f.uPointer,l.x,l.y),a.uniform1f(f.uPointerStrength,p),a.uniform1f(f.uImageAspect,n?n.width/n.height:this.imageAspect),a.uniform1f(f.uAmount,d),a.uniform1f(f.uTime,s),a.uniform1f(f.uDpr,u);const v=P?Math.max(0,Math.min(V,Math.floor(P.length/D),Math.floor(y(ee)))):0,F=Math.max(0,y(te));if(v||F||n||this.extended){const c=this.extendedUniforms();a.uniform1i(c.uForceCount,v),v&&a.uniform4fv(c.uForces,P,0,v*D),a.uniform1f(c.uBurst,F),a.uniform1f(c.uCamera,n?1:0)}if(S||this.playground){if(this.playground||(this.playground=Object.fromEntries(["uWorld","uScene"].map(c=>[c,a.getUniformLocation(this.program,c)]))),this.worldData.fill(0),this.sceneData.fill(0),S){for(let c=0;c<5;c++)this.worldData[c]=N(y(S.weights?.[c+1]),0,1);this.worldData[5]=N(y(S.energy,.55),0,1),this.worldData[6]=N(Math.round(y(S.palette)),0,3),this.worldData[7]=1,this.sceneData[0]=N(y(S.spin),-Math.PI,Math.PI),this.sceneData[1]=N(y(S.scale,1),.6,1.6),this.sceneData[2]=N(y(S.pulse),0,1)}a.uniform4fv(this.playground.uWorld,this.worldData),a.uniform4fv(this.playground.uScene,this.sceneData)}return a.drawArrays(a.POINTS,0,this.grid*this.grid),!0}destroy(){this.gl.isContextLost()||(this.program&&this.gl.deleteProgram(this.program),this.texture&&this.gl.deleteTexture(this.texture),this.vao&&this.gl.deleteVertexArray(this.vao),this.camera&&this.gl.deleteTexture(this.camera.texture)),this.program=this.texture=this.vao=this.camera=null,this.extended=null,this.playground=null,this.cameraShown=!1}}function Je(i,{imageUrl:e,reducedMotion:t=!1,onState:u,grid:d=240}={}){const s=i?.querySelector("img.portrait-base");if(!s)throw new Error("A portrait button containing img.portrait-base is required.");const l=document.createElement("canvas");l.className="portrait-particles",l.setAttribute("aria-hidden","true"),l.style.opacity="0",l.style.pointerEvents="none",i.append(l);const p=i.getAttribute("aria-label"),P=i.getAttribute("aria-pressed"),ee=i.style.getPropertyValue("--portrait-progress"),te=s.style.opacity,S=matchMedia("(prefers-reduced-motion: reduce)");let a=null,n=null,f=null,v=!1,F=!1,c=!1,Se=!1,Ae=!0,re=!1,fe=!1,B=!1,X=!1,T=0,q=0,Re=0,k=null,_=null,j={x:0,y:0},ie={x:0,y:0},he=0,ae=1,Pe="",oe=null;const _e=[],ne=new Set,Y=new Float32Array(V*D),K=new Float32Array(V*D);let $=0,de=0,me=0,w=Ne(),se=!1;const le=new Float32Array([1,0,0,0,0,0]);let U=0,pe=1,J=0,G=null;const be={weights:le,palette:0,energy:.55,spin:0,scale:1,pulse:0};let E=null,z=!1,H=!1,Q=null,xe=-1/0,ge=-1,ye=-1/0,b=!1,x=null;function m(r,o,A,O){r.addEventListener(o,A,O),_e.push(()=>r.removeEventListener(o,A,O))}function I(){const r=typeof t=="function"?t():typeof t=="object"?t?.matches:t;return Se||S.matches||!!r}function Ce(){return B||!X&&(re||fe)?1:Math.max(me,J>0?.9:0)}function Me(){return Ce()>0}function ve(){return!document.hidden&&Ae&&!v&&!F}function L(){const r={ready:!!n,active:T>.002&&!I()&&ve(),pinned:B,paused:I(),unavailable:c},o=JSON.stringify(r);if(i.setAttribute("aria-pressed",String(B)),i.setAttribute("aria-label",r.paused?"Portrait animation is paused":r.unavailable?"Sa'ood Williams portrait":B?"Reassemble portrait":"Keep portrait particles open"),o!==Pe){Pe=o,oe=r,typeof u=="function"&&u(r);for(const A of[...ne])A(r)}}function C(){T=0,q=0,l.style.opacity="0",s.style.opacity=te,i.classList.remove("portrait-active"),i.style.setProperty("--portrait-progress","0"),L()}function M(){_!==null&&cancelAnimationFrame(_),_=null,k=null}function De(){const r=i.getBoundingClientRect();ae=Math.min(devicePixelRatio||1,1.25,800/Math.max(r.width,r.height,1));const o=Math.max(1,Math.round(r.width*ae)),A=Math.max(1,Math.round(r.height*ae));(l.width!==o||l.height!==A)&&(l.width=o,l.height=A)}function h(){if(!v){if(!ve()||I()||!n){M(),C();return}_===null&&(Me()||T>.002)&&(_=requestAnimationFrame(ue)),L()}}function Be(r){if(typeof r.requestVideoFrameCallback!="function")return;const o=A=>{E!==r||v||(H=!0,xe=y(A,performance.now()),Q=r.requestVideoFrameCallback(o))};Q=r.requestVideoFrameCallback(o)}function we(){E&&Q!==null&&typeof E.cancelVideoFrameCallback=="function"&&E.cancelVideoFrameCallback(Q),Q=null}function Xe(){we(),E=null,z=!1,H=!1}function ke(r,o){if(E&&n){const R=E,ce=(R.readyState===void 0||R.readyState>=2)&&(R.videoWidth||R.width)>0,g=H||o-xe>250&&R.currentTime!==ge&&o-ye>30;if(ce&&g)try{n.uploadCamera(R)&&(z=!0,H=!1,ge=R.currentTime,ye=o)}catch{Xe()}}if(!x&&!!(E&&z)!==b&&(x={clock:0,applied:!1}),!x)return 0;x.clock=T<.05?1:Math.min(1,x.clock+r/He),x.clock>=.5&&!x.applied&&(x.applied=!0,!!(E&&z)?b=n.showCamera(!0):(n.releaseCamera(),b=!1));const O=Math.sin(Math.PI*x.clock)*Ve;return x.clock>=1&&(x=null),O}function Fe(){if(x=null,!n){b=!1;return}E&&z?b=n.showCamera(!0):(b||n.camera)&&(n.releaseCamera(),b=!1)}function ue(r){if(_=null,!ve()||I()||!n){M(),C();return}if(k!==null&&r-k<1e3/30-1){_=requestAnimationFrame(ue);return}const o=Math.min(k===null?1/60:(r-k)/1e3,.05);if(k=r,w.freeze&&G){try{n.draw({...G,width:l.width,height:l.height}),_=requestAnimationFrame(ue)}catch{c=!0,M(),C(),n.destroy(),n=null,b=!1,x=null,L()}return}w.freeze||(Re+=o);const A=w.freeze?0:ke(o,r);if(w.freeze||(J=Math.max(0,J-o)),se){const g=We.indexOf(w.mode),W=1-Math.exp(-4.2*o);for(let Z=0;Z<le.length;Z++)le[Z]+=((Z===g?1:0)-le[Z])*W;const Ge=Math.atan2(Math.sin(w.spin-U),Math.cos(w.spin-U));U+=Ge*W,U=Math.atan2(Math.sin(U),Math.cos(U)),pe+=(w.scale-pe)*W,Object.assign(be,{palette:w.palette,energy:w.energy,spin:U,scale:pe,pulse:J/1.6})}const O=Ce();q+=(O-T)*56*o,q*=Math.exp(-12*o),T=Math.max(0,Math.min(1,T+q*o));const R=1-Math.exp(-9*o);if(w.freeze||(j.x+=(ie.x-j.x)*R,j.y+=(ie.y-j.y)*R,he+=((re?1:0)-he)*R),!O&&T<.002&&Math.abs(q)<.02){M(),Fe(),C();return}const ce=1-Oe*T;for(let g=0;!w.freeze&&g<$*D;g+=4)K[g]=Y[g]*ce,K[g+1]=Y[g+1]*ce,K[g+2]=Y[g+2],K[g+3]=Y[g+3];try{if(G={width:l.width,height:l.height,dpr:ae,amount:T,time:Re,pointer:j,pointerStrength:he,forces:K,forceCount:$,burst:de+A,scene:se?be:null},!n.draw(G)){M(),C();return}const W=Math.min(1,T/.16);l.style.opacity=String(W),s.style.opacity=String(1-W),i.style.setProperty("--portrait-progress",String(W)),i.classList.add("portrait-active"),L(),_=requestAnimationFrame(ue)}catch{c=!0,M(),C(),n?.destroy(),n=null,b=!1,x=null,L()}}function Ee(r){const o=i.getBoundingClientRect();ie={x:Math.max(-1,Math.min(1,(r.clientX-o.left)/Math.max(o.width,1)*2-1)),y:Math.max(-1,Math.min(1,1-(r.clientY-o.top)/Math.max(o.height,1)*2))}}function Te(){if(!(v||!f?.naturalWidth))try{if(a=l.getContext("webgl2",{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:"low-power"}),!a)throw new Error("WebGL2 unavailable.");n=new Ke(a,f,d),c=!1,b=!1,x=null,z=!1,H=!!E,De(),L(),h()}catch{c=!0,n=null,C()}}m(i,"pointerenter",r=>{r.pointerType!=="touch"&&(re=!0,X=!1,Ee(r),h())}),m(i,"pointermove",r=>{Ee(r),h()},{passive:!0}),m(i,"pointerleave",()=>{re=!1,X=!1,ie={x:0,y:0},h()}),m(i,"pointerdown",Ee,{passive:!0}),m(i,"focus",()=>{fe=i.matches(":focus-visible"),X=!1,h()}),m(i,"blur",()=>{fe=!1,X=!1,h()}),m(i,"click",()=>{I()||c||(B=!B,X=!0,h())}),m(document,"visibilitychange",h),m(S,"change",h),t&&typeof t=="object"&&t!==S&&typeof t.addEventListener=="function"&&m(t,"change",h),m(l,"webglcontextlost",r=>{r.preventDefault(),F=!0,M(),C()}),m(l,"webglcontextrestored",()=>{F=!1,n=null,Te()});const Ue=new ResizeObserver(()=>{De(),h()});Ue.observe(i);const ze=new IntersectionObserver(([r])=>{Ae=r.isIntersecting,h()});ze.observe(i),m(window,"pagehide",()=>{M(),C()}),m(window,"pageshow",h);const Ie=s.currentSrc||s.src,Le=new URL(e||Ie,document.baseURI).href;return f=new URL(Ie,document.baseURI).href===Le?s:new Image,f!==s&&(f.crossOrigin="anonymous",f.src=Le),f.complete&&f.naturalWidth?Te():(m(f,"load",Te,{once:!0}),m(f,"error",()=>{c=!0,C()},{once:!0})),L(),{setPlayground(r={}){v||(w=Ne(r,w),se=!0,h())},triggerPulse(){return v||I()?!1:(se=!0,J=1.6,h(),!0)},capture(){if(v||c||F||!n||!G||T<.01||I())return null;try{return n.draw({...G,width:l.width,height:l.height}),l.toDataURL("image/png")}catch{return null}},setPaused(r){Se=!!r,h()},setForces(r=[],{burst:o=0}={}){return $=Ye(r,Y),de=Math.max(0,Math.min(3,y(o))),($||de)&&h(),$},setHold(r){const o=r===!0?1:Math.max(0,Math.min(1,y(Number(r))));o!==me&&(me=o,h())},setSource(r=null){const o=r&&typeof r=="object"&&("videoWidth"in r||"naturalWidth"in r||"width"in r)?r:null;return o===E||(we(),E=o,H=!!o,ge=-1,xe=ye=-1/0,o?Be(o):z=!1,!_&&(!o||!Me())&&Fe(),h()),!!n},getViewScale(){return 1-Oe*T},getState(){return oe},subscribe(r){return typeof r!="function"?()=>{}:(ne.add(r),oe&&r(oe),()=>ne.delete(r))},destroy(){v||(v=!0,M(),we(),E=null,ne.clear(),_e.splice(0).forEach(r=>r()),Ue.disconnect(),ze.disconnect(),n?.destroy(),n=null,l.remove(),s.style.opacity=te,i.classList.remove("portrait-active"),ee?i.style.setProperty("--portrait-progress",ee):i.style.removeProperty("--portrait-progress"),p===null?i.removeAttribute("aria-label"):i.setAttribute("aria-label",p),P===null?i.removeAttribute("aria-pressed"):i.setAttribute("aria-pressed",P))}}}export{V as MAX_FORCES,We as PLAYGROUND_MODES,Ke as PortraitRenderer,Je as createPortraitEffect,Ye as packForces,Ne as playgroundState};
