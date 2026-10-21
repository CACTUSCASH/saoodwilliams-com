/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-01f7806edc1d */(()=>{const C=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(C)||C.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{createGL as Je}from"./gl.js?v=515dba1803";import{HEADER as F,COMMON as ue,TONEMAP as Ze}from"./glsl.js?v=515dba1803";const Be=(C,q,B)=>Math.min(B,Math.max(q,C)),et=F+ue+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSource;uniform vec4 uMap;uniform float uHasSource;
void main(){
vec2 uv=vec2(vUv.x,1.0-vUv.y);
vec2 src=uMap.xy*(uv-0.5)+0.5+uMap.zw;
vec3 c=texture(uSource,src).rgb;
outColor=vec4(toLinear(c)*uHasSource,1.0);
}`,tt=F+ue+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uRaw;uniform sampler2D uGuide;uniform vec4 uMap;uniform float uHasMask;
void main(){
vec2 uv=vec2(vUv.x,1.0-vUv.y);
vec2 src=uMap.xy*(uv-0.5)+0.5+uMap.zw;
float I=luma(toGamma(texture(uGuide,vUv).rgb));
float p=uHasMask>0.5?texture(uRaw,src).r:0.0;
outColor=vec4(I,p,I*p,I*I);
}`,rt=F+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;
void main(){
vec4 s=vec4(0.0);
for(int i=-4;i<=4;i++)s+=texture(uSrc,vUv+uDir*float(i));
outColor=s/9.0;
}`,at=F+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform float uEps;
void main(){
vec4 m=texture(uSrc,vUv);
float varI=max(m.w-m.x*m.x,0.0),cov=m.z-m.x*m.y;
float a=cov/(varI+uEps);
outColor=vec4(a,m.y-a*m.x,0.0,1.0);
}`,ut=F+ue+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uAB;uniform sampler2D uGuide;uniform sampler2D uPrev;
uniform float uHasMask;uniform float uReset;uniform float uSharp;
void main(){
if(uHasMask<0.5){outColor=vec4(0.0);return;}
float I=luma(toGamma(texture(uGuide,vUv).rgb));
vec2 ab=texture(uAB,vUv).rg;
float m=clamp(ab.x*I+ab.y,0.0,1.0);
m=smoothstep(0.5-uSharp,0.5+uSharp,m);
float prev=texture(uPrev,vUv).r;
float k=uReset>0.5?1.0:clamp(0.6+abs(m-prev)*1.8,0.6,1.0);
outColor=vec4(mix(prev,m,k),0.0,0.0,1.0);
}`,ot=F+ue+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uPrev;
uniform vec2 uTexel;uniform float uRate;uniform float uReset;uniform float uHasMask;
void main(){
float m=0.0;
for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)m=max(m,texture(uMask,vUv+vec2(i,j)*uTexel*3.0).r);
float bg=(1.0-smoothstep(0.04,0.3,m))*uHasMask;
vec4 prev=texture(uPrev,vUv);
if(uReset>0.5)prev=vec4(0.0);
vec3 cam=texture(uBase,vUv).rgb;
float rate=prev.a<0.5?1.0:uRate;
vec3 c=mix(prev.rgb,cam,bg*rate);
float conf=max(prev.a*0.9995,bg);
outColor=vec4(c,conf);
}`,it=F+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;uniform float uFirst;
vec4 tap(vec2 uv){vec4 c=texture(uSrc,uv);if(uFirst>0.5){c.a=smoothstep(0.6,0.95,c.a);c.rgb*=c.a;}return c;}
void main(){
vec4 s=tap(vUv+uTexel*vec2(-0.5,-0.5))+tap(vUv+uTexel*vec2(0.5,-0.5))+tap(vUv+uTexel*vec2(-0.5,0.5))+tap(vUv+uTexel*vec2(0.5,0.5));
s*=0.25;
outColor=s.a>0.0?vec4(s.rgb/s.a*min(1.0,s.a*4.0),min(1.0,s.a*4.0)):vec4(0.0);
}`,st=F+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uFine;uniform sampler2D uCoarse;uniform float uFirst;
void main(){
vec4 f=texture(uFine,vUv);
if(uFirst>0.5){f.a=smoothstep(0.6,0.95,f.a);}
vec4 c=texture(uCoarse,vUv);
vec3 coarse=c.a>0.0?c.rgb:vec3(0.0);
outColor=vec4(mix(coarse,f.rgb,f.a),1.0);
}`,nt=F+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;
void main(){
const float w[5]=float[5](0.2270270270,0.1945945946,0.1216216216,0.0540540541,0.0162162162);
vec4 s=texture(uSrc,vUv)*w[0];
for(int i=1;i<5;i++){s+=texture(uSrc,vUv+uDir*float(i))*w[i];s+=texture(uSrc,vUv-uDir*float(i))*w[i];}
outColor=s;
}`,lt=F+ue+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uHeight;uniform sampler2D uBase;uniform vec2 uTexel;uniform float uAspect;
void main(){
float hl=texture(uHeight,vUv-vec2(uTexel.x,0)).r,hr=texture(uHeight,vUv+vec2(uTexel.x,0)).r;
float hd=texture(uHeight,vUv-vec2(0,uTexel.y)).r,hu=texture(uHeight,vUv+vec2(0,uTexel.y)).r;
float ll=luma(texture(uBase,vUv-vec2(uTexel.x,0)).rgb),lr=luma(texture(uBase,vUv+vec2(uTexel.x,0)).rgb);
float ld=luma(texture(uBase,vUv-vec2(0,uTexel.y)).rgb),lu=luma(texture(uBase,vUv+vec2(0,uTexel.y)).rgb);
vec2 g=vec2(hr-hl,hu-hd)*7.0+vec2(lr-ll,lu-ld)*0.35;
vec3 n=normalize(vec3(-g.x,-g.y,0.35));
float h=texture(uHeight,vUv).r;
outColor=vec4(n*0.5+0.5,h);
}`,ct=F+ue+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;uniform float uKaris;uniform float uThreshold;
vec3 karis(vec3 a,vec3 b,vec3 c,vec3 d){
float wa=1.0/(1.0+luma(a)),wb=1.0/(1.0+luma(b)),wc=1.0/(1.0+luma(c)),wd=1.0/(1.0+luma(d));
return(a*wa+b*wb+c*wc+d*wd)/(wa+wb+wc+wd);
}
void main(){
vec2 t=uTexel;
vec3 a=texture(uSrc,vUv+t*vec2(-2,2)).rgb,b=texture(uSrc,vUv+t*vec2(0,2)).rgb,c=texture(uSrc,vUv+t*vec2(2,2)).rgb;
vec3 d=texture(uSrc,vUv+t*vec2(-2,0)).rgb,e=texture(uSrc,vUv).rgb,f=texture(uSrc,vUv+t*vec2(2,0)).rgb;
vec3 g=texture(uSrc,vUv+t*vec2(-2,-2)).rgb,h=texture(uSrc,vUv+t*vec2(0,-2)).rgb,i=texture(uSrc,vUv+t*vec2(2,-2)).rgb;
vec3 j=texture(uSrc,vUv+t*vec2(-1,1)).rgb,k=texture(uSrc,vUv+t*vec2(1,1)).rgb;
vec3 l=texture(uSrc,vUv+t*vec2(-1,-1)).rgb,m=texture(uSrc,vUv+t*vec2(1,-1)).rgb;
vec3 o;
if(uKaris>0.5){
o=karis(j,k,l,m)*0.5+karis(a,b,d,e)*0.125+karis(b,c,e,f)*0.125+karis(d,e,g,h)*0.125+karis(e,f,h,i)*0.125;
float br=max(o.r,max(o.g,o.b)),kn=uThreshold*0.35;
float sk=clamp(br-uThreshold+kn,0.0,2.0*kn);sk=sk*sk/(4.0*kn+1e-5);
o*=max(sk,br-uThreshold)/max(br,1e-5);
}else{
o=e*0.125+(a+c+g+i)*0.03125+(b+d+f+h)*0.0625+(j+k+l+m)*0.125;
}
outColor=vec4(max(o,0.0),1.0);
}`,ft=F+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;uniform float uRadius;
void main(){
vec2 t=uTexel*uRadius;
vec3 s=texture(uSrc,vUv).rgb*4.0;
s+=(texture(uSrc,vUv+vec2(-t.x,0)).rgb+texture(uSrc,vUv+vec2(t.x,0)).rgb+texture(uSrc,vUv+vec2(0,-t.y)).rgb+texture(uSrc,vUv+vec2(0,t.y)).rgb)*2.0;
s+=texture(uSrc,vUv+vec2(-t.x,-t.y)).rgb+texture(uSrc,vUv+vec2(t.x,-t.y)).rgb+texture(uSrc,vUv+vec2(-t.x,t.y)).rgb+texture(uSrc,vUv+vec2(t.x,t.y)).rgb;
outColor=vec4(s/16.0,1.0);
}`,mt=F+ue+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uScene;uniform sampler2D uBase;uniform vec2 uTexel;
vec3 gain(vec2 uv){return(max(texture(uScene,uv).rgb,0.0)+0.0015)/(texture(uBase,uv).rgb+0.0015);}
void main(){
vec3 g=gain(vUv);
float dev=0.0;
for(int i=0;i<4;i++){
vec2 o=vec2(i<2?-1.0:1.0,(i&1)==0?-1.0:1.0);
vec3 d=abs(gain(vUv+o*uTexel)-g)/(g+0.05);
dev=max(dev,max(d.r,max(d.g,d.b)));
}
float lg=log2(max(g.r,max(g.g,g.b)));
float k=(1.0-smoothstep(0.04,0.14,dev))*(1.0-smoothstep(0.3,0.75,lg))*(1.0-smoothstep(3.0,5.0,-lg));
outColor=vec4(min(g,vec3(4.0))*0.25,k);
}`,vt=F+ue+Ze+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uScene;uniform sampler2D uBloom;
uniform float uBloomStrength;uniform float uExposure;uniform float uTime;uniform float uFrame;
uniform float uAberration;uniform vec2 uShake;uniform float uVignette;uniform float uGrain;
uniform float uSaturation;uniform vec3 uLift;uniform vec3 uGain;uniform vec2 uResolution;
uniform float uFlash;uniform float uBloomLevels;uniform float uFilmic;
uniform sampler2D uMark;uniform vec4 uMarkRect;
uniform sampler2D uBase;uniform sampler2D uPrev;uniform vec2 uSceneTexel;uniform float uSoft;uniform float uPersist;uniform float uLightGrain;
uniform float uUpscale;uniform float uDetail;uniform sampler2D uKeep;uniform sampler2D uSource;uniform vec4 uSrcMap;uniform float uHasSource;uniform float uSharpen;
void main(){
vec2 uv=vUv+uShake;
vec2 c=uv-0.5;
float r2=dot(c,c);
vec3 col;
if(uAberration>0.0005){
vec2 off=c*uAberration*(0.4+r2*2.0);
col=vec3(texture(uScene,uv-off).r,texture(uScene,uv).g,texture(uScene,uv+off).b);
}else col=texture(uScene,uv).rgb;
vec3 base=texture(uBase,uv).rgb;
float added=smoothstep(0.03,0.5,max(luma(col)-luma(base),0.0));
if(added>0.001){
vec2 t=uSceneTexel*uSoft;
vec3 s4=texture(uScene,uv+vec2(t.x,0.0)).rgb+texture(uScene,uv-vec2(t.x,0.0)).rgb+texture(uScene,uv+vec2(0.0,t.y)).rgb+texture(uScene,uv-vec2(0.0,t.y)).rgb;
col=mix(col,(col*2.0+s4)/6.0,added);
col=mix(col,max(col,texture(uPrev,uv).rgb),added*uPersist);
}
if(uUpscale>0.5){
vec4 kg=texture(uKeep,uv);
if(uSharpen>0.0&&kg.a<0.999){
vec2 t=uSceneTexel;
vec3 n=texture(uScene,uv+vec2(0.0,t.y)).rgb,s=texture(uScene,uv-vec2(0.0,t.y)).rgb;
vec3 e=texture(uScene,uv+vec2(t.x,0.0)).rgb,w=texture(uScene,uv-vec2(t.x,0.0)).rgb;
vec3 mn=max(min(min(n,s),min(min(e,w),col)),0.0),mx=max(max(max(n,s),max(max(e,w),col)),0.0);
vec3 cn=mn/(1.0+mn),cx=mx/(1.0+mx);
vec3 lobe=-0.2*uSharpen*sqrt(clamp(min(cn,1.0-cx)/max(cx,1e-4),0.0,1.0));
vec3 sh=clamp((col+lobe*(n+s+e+w))/(1.0+4.0*lobe),mn,mx);
col=mix(col,sh,(1.0-kg.a)*(1.0-added));
}
if(uDetail>0.5&&kg.a>0.002){
vec2 du=vec2(uv.x,1.0-uv.y);
vec3 cam=toLinear(texture(uSource,uSrcMap.xy*(du-0.5)+0.5+uSrcMap.zw).rgb)*uHasSource;
col=max(col+(cam-base)*kg.rgb*4.0*kg.a,0.0);
}
}
vec3 bloom=texture(uBloom,uv).rgb/max(uBloomLevels,1.0);
col+=bloom*uBloomStrength*1.2;
col+=uFlash;
col*=uExposure;
col*=mix(1.0,smoothstep(0.95,0.18,sqrt(r2)*1.15),uVignette);
col=mix(softTonemap(col),agx(col),uFilmic);
col=agxPunchy(col,uSaturation);
col=uLift*(1.0-col)+col*uGain;
vec3 outc=toGamma(max(col,0.0));
float n=hash12(gl_FragCoord.xy+fract(uTime*7.31)*vec2(91.7,47.3))-0.5;
outc+=n*(uGrain+added*uLightGrain*(0.35+luma(outc)));
vec2 mp=(gl_FragCoord.xy-uMarkRect.xy)/uMarkRect.zw;
if(mp.x>=0.0&&mp.y>=0.0&&mp.x<=1.0&&mp.y<=1.0){float m=texture(uMark,vec2(mp.x,1.0-mp.y)).a;outc=mix(outc,vec3(0.96),m*0.5);}
outc+=(ign(gl_FragCoord.xy,uFrame)-0.5)/255.0;
outColor=vec4(outc,1.0);
}`,ht=F+"in vec2 vUv;out vec4 outColor;uniform sampler2D uSrc;void main(){outColor=texture(uSrc,vUv);}",oe=[1,.875,.76,.66,.58,.5,.44,.38,.33],pt=[.75,.66,.58,.5],gt=2,We=.75,Ke=.2,Ye=[6.94,8.33,11.11,13.33,16.67,33.33];function xt({mobile:C=!1,refresh:q=0,slow:B=1,pin:s=0,pinQuality:t=0}={}){const g=new Float32Array(512),L=new Float64Array(512),i=new Float32Array(512),w=new Float64Array(512),H=new Float32Array(512),y=new Float64Array(oe.length),l=new Float64Array(oe.length),G=new Float32Array(oe.length),Q=new Float32Array(oe.length),O=new Float64Array(oe.length);let N=0,S=0,r=0;const d=new Map;let X=0,A=0,ee=0,z=0,de=0,Se=0,W=1,K=1,U=[{s:1,out:1}],c=0,te=1,be=0,ie=t||1,D=ie,se=0,Te=0,ne=0,Me=0,re=0,we=0,ke=1,le=0,De=0,Re=0,k=-1e9,ce="interval",Ue=0,fe=q||16.67,pe=16.67,_e=!1,ae=0,me=0,ve=0,he=0,Ee=-1e9,ge=-1e9,Y=0;function Fe(o){for(let n=0;n<U.length;n++)if(U[n].s<=o+.001)return n;return U.length-1}function Ae({mode:o=W,density:n=K,initial:v=!1}={}){const x=U[c].s;if(W=o,K=Math.max(.5,n),s>0)U=[{s,out:1}];else{const E=Math.max(oe[oe.length-1],Math.min(.5,1/K))-.001;U=(W===2?[1]:W===0?pt:oe.filter(h=>h>=E)).map(h=>({s:h,out:Math.min(1,Math.max(h,gt/K))}))}c=Fe(v?C&&W===1?Math.min(1,2/K):1:x)}function Pe(o){me=o+1500,ve=o,te++,be=0,A=0,Y=0,y.fill(0),l.fill(0),Te=0,ne=0,Me=0,re=0,Q.fill(0)}function e(o,n){let v=0,x=0,E=0,I=0,h=0;const M=(_,$,J)=>{v+=J,x+=J*_,E+=J*$,I+=J*_*_,h+=J*_*$};r=0;for(let _=0;_<U.length;_++){if(!Q[_])continue;const $=Math.min(3,Q[_])*Math.exp(-(o-O[_])/2e4);$>.05&&(M(U[_].s**2,G[_],$),r++)}M(0,.3*n,.4);const V=v*I-x*x;S=V>1e-9?(v*h-x*E)/V:0,N=(E-S*x)/v,S<0&&(S=0,N=E/v),N<0&&(N=0,S=h/Math.max(1e-9,I))}function a(o,n,v){return v&&r<2?(o/n)**2:(N+S*o*o)/Math.max(1e-6,N+S*n*n)}function u(){return be++>=3?te:-1}function f(o,n,v){k=v,n===te&&(o*=B,g[X]=o,L[X]=v,X=(X+1)%512,A=Math.min(512,A+1),le=le?le+(o-le)*(ce==="fence"?.3:.08):o)}function m(o,n){!(o>0)||o>250||(i[ee]=o,w[ee]=n,ee=(ee+1)%512,z=Math.min(512,z+1),++de>=30&&(de=0,p(n)))}function p(o){const n=Math.min(z,90);if(n<20)return;for(let M=0;M<n;M++)H[M]=i[(ee-1-M+512)%512];const v=H.subarray(0,n);v.sort();let x=0;const E=v[Math.floor(n*.25)]*1.4;for(;x<n&&v[x]<=E;)x++;const I=v[Math.floor(x/2)];let h=Ye[0];for(const M of Ye)Math.abs(M-I)<Math.abs(h-I)&&(h=M);h=Math.max(h,16.67),!_e||h<=pe?(pe=h,_e=!0,ae=0):ae?o-ae>2e4&&(pe=h,ae=0):ae=o,q||(fe=16.67)}function b(o,n){let v=0;for(let E=0;E<A;E++){const I=(X-1-E+512)%512;if(L[I]<o)break;H[v++]=g[I]}if(Se=v,!v)return 0;const x=H.subarray(0,v);return x.sort(),x[Math.min(v-1,Math.floor(v*n))]}function xe(o){let n=0,v=0;for(let x=0;x<z;x++){const E=(ee-1-x+512)%512;if(w[E]<o)break;n++,i[E]>pe*1.5&&v++}return n>=4?v/n:0}function T(o,n,v){return o=Math.max(0,Math.min(U.length-1,o)),o===c?!1:(v&&(l[c]=Math.min(3e5,l[c]?l[c]*2:3e4),y[c]=n+l[c],Ee=n),c=o,he=n,te++,be=0,A=0,Y=0,!0)}function R(o,n,v){s||t||o<se||o<Me||D<=Ke||(ke=D,we=v,re=o+2500,D=Math.max(Ke,D-(n?.25:.15)),se=o+(n?500:2e3),Ee=o,n||(ne=Math.min(16e4,ne?ne*2:15e3),Te=o+ne))}function j(o,n){s||t||o<se||o<Te||(D=Math.min(1,D+(n?.25:.1)),se=o+(n?500:2500))}function je(o,n,v){const x=Math.max(0,Math.min(.1,n)),E=1-Math.exp(-x/.35),I=.8*x;ie+=Math.max(-I,Math.min(I,(D-ie)*E)),Ue=o;const h=o<me;if(o-ve<(h?250:500))return!1;ve=o;const M=fe*We,V=xe(o-(h?400:1e3));V>0&&(ge=o);const _=U.length-1,$=U[c].s;if(ce=v!=="none"&&o-k<1500?v:"interval",ce!=="interval"){const Ne=h?-1e12:o-1500,Ce=b(Ne,.9),P=b(Ne,.75);if(Se<(ce==="timer"?h?5:8:3))return!1;De=P,Re=Ce,G[c]=Q[c]?G[c]+(P-G[c])*(h?.5:.25):P,Q[c]++,O[c]=o,e(o,P),re&&o>=re&&(re=0,P>we*.92&&(D=ke,Me=o+3e4,se=o+1500));const Ie=P>M||Ce>M*1.6||V>.25&&P>M*.6,He=P>M*1.4||V>.3;Y=Ie?Y+1:0;const Le=c>0?a(U[c-1].s,$,!0):1,Xe=c>0&&r>=2&&P*(Le-1)<=M*.08&&o-ge>5e3,qe=c>0&&o>=y[c-1]&&(h||o-he>=5e3&&o-Ee>=1e4);if(Ie){if(!h&&!He&&Y<2)return!1;const Ge=h?3:He?2:1;let Z=c;for(;Z<_&&Z-c<Ge&&P*a(U[Z].s,$,!1)>M*.9;)Z++;return Z>c&&a(U[Z].s,$,!1)<.9?T(Z,o,!0):Xe&&qe?T(c-1,o,!1):((V>.08||P>M*1.5)&&R(o,h,P),!1)}if(D<1)return P<M*.7&&Ce<M*1.1&&j(o,h),!1;if(!qe)return!1;const Oe=(Ge,Z,ze)=>Ge*ze<=M*.8&&Z*ze<=M*1.25||Xe;if(h)return Oe(P,Ce,Le)?T(c-1,o,!1):!1;const Qe=b(o-3e3,.9),$e=b(o-3e3,.75);return Se>=24&&Oe($e,Qe,Le)?T(c-1,o,!1):!1}if(V>(h?.3:.15))return Y++,!h&&Y<2?!1:c<_?T(c+(h&&V>.6?2:1),o,!0):(R(o,h,0),!1);if(Y=0,V>0)return!1;const J=h?400:6e3;return D<1?(o-ge>J&&j(o,h),!1):c>0&&o-ge>J&&o-he>J&&o>=y[c-1]?T(c-1,o,!1):!1}function Ve(o,n,v){o&&v>=me&&d.set(o,{s:U[c].s,q:D,mode:W});const x=n?d.get(n):null,E=c;return x&&x.mode===W&&(c=Fe(x.s),D=ie=x.q),Pe(v),c!==E}return Ae({initial:!0}),{configure:Ae,recalibrate:Pe,tag:u,sample:f,interval:m,update:je,switchEffect:Ve,get rung(){return U[c]},get rungIndex(){return c},get rungs(){return U.length},get quality(){return ie},get qualityTarget(){return D},get gpuMs(){return le},get gpuP75(){return De},get gpuP90(){return Re},get timing(){return ce},get refreshMs(){return fe},get budgetMs(){return fe*We},get calibrating(){return Ue<me},get epoch(){return te},model(){return{a:+N.toFixed(2),b:+S.toFixed(2),fitted:r,rungs:U.map((o,n)=>Q[n]?+G[n].toFixed(1):null)}}}}function bt(C,{mobile:q=!1,debug:B={}}={}){const s=Je(C),{gl:t,caps:ye}=s,g={base:s.program(et,{label:"base"}),mask:s.program(ut,{label:"mask"}),gfPrep:s.program(tt,{label:"guided prep"}),box:s.program(rt,{label:"box"}),gfCoef:s.program(at,{label:"guided coef"}),plate:s.program(ot,{label:"plate"}),push:s.program(it,{label:"push"}),pull:s.program(st,{label:"pull"}),blur:s.program(nt,{label:"blur"}),normal:s.program(lt,{label:"normal"}),down:s.program(ct,{label:"bloom down"}),up:s.program(ft,{label:"bloom up"}),post:s.program(vt,{label:"post"}),keep:s.program(mt,{label:"keep"}),copy:s.program(ht,{label:"copy"})},L=ye.hdr,i={base:s.target(4,4,{format:L}),scene:s.target(4,4,{format:L}),prev:s.target(4,4,{format:L}),mask:s.pingPong(4,4,{format:"r16f"}),gf:s.pingPong(4,4,{format:L}),plate:s.pingPong(4,4,{format:L}),plateFilled:s.target(4,4,{format:L}),height:s.pingPong(4,4,{format:"r16f"}),normals:s.target(4,4,{format:"rgba8"}),keep:s.target(4,4,{format:L})},w=[],H=[],y=[],l={tex:t.createTexture(),width:0,height:0,element:null,version:0,uploaded:-1,mirror:!0,staged:!1},G=[0,1,2].map(()=>({tex:t.createTexture(),width:0,height:0}));let Q=0,O=-1,N=0;const S={tex:t.createTexture(),width:0,height:0,has:!1,version:0};for(const e of[l.tex,S.tex,...G.map(a=>a.tex)])t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));const r={width:4,height:4,scale:1,density:1,nativeWidth:0,nativeHeight:0,nativeDensity:1,frame:0,resetMask:!0,resetPlate:!0,normalsFrame:-1,post:{bloom:.05,exposure:1,aberration:0,shake:[0,0],vignette:0,grain:0,persist:.35,lightGrain:.035,saturation:1,lift:[0,0,0],gain:[1,1,1],flash:0,filmic:0},upscale:{detail:B.upscale===0?0:1,sharpen:B.upscale===0?0:.5},frameMs:16,gpuMs:0,gpuP75:0,gpuP90:0,gpuLast:0,gpuLastFrame:0,gpuMode:"interval",budgetMs:12.5,refreshMs:16.67,quality:1,qualityTarget:1,rung:0,calibrating:!0,gpuBudget:q?26:15},d=xt({mobile:q,refresh:+B.refresh||0,slow:+B.gpuSlow||1,pin:Be(+B.scale||0,0,1),pinQuality:Be(+B.quality||0,0,1)}),X=s.frameTimer({mode:B.sections?"off":B.timer||"auto"}),A=B.sections?["pre","effect","bloom","final","copy"].map(e=>({name:e,timer:s.frameTimer({mode:"timer"}),ms:0})):null,ee=e=>a=>{e.ms=e.ms?e.ms+(a-e.ms)*.1:a};if(A){for(const e of A)e.onSample=ee(e);r.gpuSections={}}function z(e){A&&(e>0&&A[e-1].timer.end(),e<A.length&&A[e].timer.begin(0))}function de(){return[Math.max(2,Math.round(r.width*r.scale)),Math.max(2,Math.round(r.height*r.scale))]}function Se(){const a=Math.min(1,(q?720:960)/Math.max(r.width,r.height));return[Math.max(2,Math.round(r.width*a)),Math.max(2,Math.round(r.height*a))]}function W(){const[e,a]=de();i.base.resize(e,a),i.scene.resize(e,a),i.prev.resize(e,a),r.scale<.999?i.keep.resize(e,a):i.keep.resize(4,4);let u=e,f=a,m=0;for(;m<7&&(u=Math.max(2,u>>1),f=Math.max(2,f>>1),y[m]?y[m].resize(u,f):y[m]=s.target(u,f,{format:L}),m++,!(u<=8||f<=8)););y.length=m,r.dirty=!0,r.normalsFrame=-1;const[p,b]=Se();if(p===i.mask.width&&b===i.mask.height)return;i.mask.resize(p,b),i.plate.resize(p,b),i.plateFilled.resize(p,b),i.gf.resize(Math.max(2,p>>1),Math.max(2,b>>1));const xe=Math.max(2,p>>1),T=Math.max(2,b>>1);i.height.resize(xe,T),i.normals.resize(p,b);let R=p,j=b;for(m=0;R>4&&j>4&&m<9;)R=Math.max(2,R>>1),j=Math.max(2,j>>1),w[m]?w[m].resize(R,j):w[m]=s.target(R,j,{format:L}),H[m]?H[m].resize(R,j):H[m]=s.target(R,j,{format:L}),m++;w.length=H.length=m,r.resetMask=!0,r.resetPlate=!0}function K(){const e=d.rung,a=Math.max(2,Math.round(r.nativeWidth*e.out)),u=Math.max(2,Math.round(r.nativeHeight*e.out));(C.width!==a||C.height!==u)&&(C.width=a,C.height=u),r.width=a,r.height=u,r.scale=Be(e.s/e.out,.05,1),r.density=r.nativeDensity*e.s,r.rung=d.rungIndex,W()}function U(e,a,u=0){e=Math.max(2,Math.round(e)),a=Math.max(2,Math.round(a));const f=u>0?u:r.nativeDensity;if(r.nativeWidth===e&&r.nativeHeight===a&&f===r.nativeDensity)return;const m=!r.nativeWidth;r.nativeWidth=e,r.nativeHeight=a,(f!==r.nativeDensity||m)&&(r.nativeDensity=f,d.configure({density:f,initial:m})),d.recalibrate(performance.now()),K()}function c(){const e=l.width||1,a=l.height||1,u=r.width/r.height,f=e/a;let m=1,p=1;return f>u?m=u/f:p=f/u,[l.mirror?-m:m,p,0,0]}function te(e,a){const[u,f]=c();return[(e-.5)/u+.5,(a-.5)/f+.5]}function be(e,{mirror:a=!0,staged:u=!1}={}){l.element=e,l.mirror=a,l.version++,l.staged=u,O=-1,u&&(l.uploaded=-1),r.resetPlate=!0,r.resetMask=!0,d.recalibrate(performance.now())}function ie(e){l.staged!==e&&(l.staged=e,!e&&O>=0&&(O=-1))}function D(e){let a=Q;a===O&&(a=(a+1)%G.length),Q=(a+1)%G.length;const u=G[a];return t.bindTexture(t.TEXTURE_2D,u.tex),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,t.RGBA,t.UNSIGNED_BYTE,e),u.width=e.displayWidth||e.width,u.height=e.displayHeight||e.height,a}function se(e){const a=G[e];!a||!a.width||(O!==e&&N++,O=e,(a.width!==l.width||a.height!==l.height)&&(l.width=a.width,l.height=a.height,r.resetPlate=!0),l.uploaded=l.version)}function Te(){const e=l.element;if(!e)return!1;const a=e.videoWidth||e.naturalWidth||e.width||0,u=e.videoHeight||e.naturalHeight||e.height||0;return!a||!u?!1:e.readyState!==void 0&&e.readyState<2?l.uploaded>=0:((a!==l.width||u!==l.height)&&(l.width=a,l.height=u,r.resetPlate=!0),t.bindTexture(t.TEXTURE_2D,l.tex),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,t.RGBA,t.UNSIGNED_BYTE,e),l.uploaded=l.version,N++,!0)}function ne(e,a,u){!S.has&&e&&(r.resetPlate=!0),t.bindTexture(t.TEXTURE_2D,S.tex),t.pixelStorei(t.UNPACK_ALIGNMENT,1),e instanceof Float32Array?t.texImage2D(t.TEXTURE_2D,0,t.R16F,a,u,0,t.RED,t.FLOAT,e):e instanceof Uint8Array||e instanceof Uint8ClampedArray?t.texImage2D(t.TEXTURE_2D,0,t.R8,a,u,0,t.RED,t.UNSIGNED_BYTE,e):e&&(t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,t.RGBA,t.UNSIGNED_BYTE,e),a=e.width,u=e.height),t.pixelStorei(t.UNPACK_ALIGNMENT,4),S.width=a,S.height=u,S.has=!!e,S.version++}function Me(){S.has=!1}function re(){return l.staged&&O>=0?G[O].tex:l.tex}function we(){s.pass(g.base,i.base,{uSource:re(),uMap:c(),uHasSource:l.uploaded>=0?1:0})}function ke(){const e=i.gf,a=S.has?1:0,u=[.7/e.width,0],f=[0,.7/e.height];s.pass(g.gfPrep,e.write,{uRaw:S.tex,uGuide:i.base,uMap:c(),uHasMask:a}),e.swap(),s.pass(g.box,e.write,{uSrc:e.read,uDir:u}),e.swap(),s.pass(g.box,e.write,{uSrc:e.read,uDir:f}),e.swap(),s.pass(g.gfCoef,e.write,{uSrc:e.read,uEps:.0012}),e.swap(),s.pass(g.box,e.write,{uSrc:e.read,uDir:u}),e.swap(),s.pass(g.box,e.write,{uSrc:e.read,uDir:f}),e.swap(),s.pass(g.mask,i.mask.write,{uAB:e.read,uGuide:i.base,uPrev:i.mask.read,uHasMask:a,uReset:r.resetMask?1:0,uSharp:.24}),i.mask.swap(),r.resetMask=!1}function le(){s.pass(g.plate,i.plate.write,{uBase:i.base,uMask:i.mask.read,uPrev:i.plate.read,uTexel:[1/i.plate.width,1/i.plate.height],uRate:.18,uReset:r.resetPlate?1:0,uHasMask:S.has?1:0}),i.plate.swap(),r.resetPlate=!1;let e=i.plate.read;for(let u=0;u<w.length;u++)s.pass(g.push,w[u],{uSrc:e,uTexel:[1/e.width,1/e.height],uFirst:u===0?1:0}),e=w[u];for(let u=w.length-2;u>=0;u--)s.pass(g.pull,H[u],{uFine:w[u],uCoarse:u===w.length-2?w[u+1]:H[u+1],uFirst:0});const a=w.length>1?H[0]:w[0];s.pass(g.pull,i.plateFilled,{uFine:i.plate.read,uCoarse:a||i.plate.read,uFirst:1})}function De(){if(r.normalsFrame===ve)return i.normals;const e=i.height;s.pass(g.copy,e.write,{uSrc:i.mask.read}),e.swap();for(let a=0;a<2;a++){const u=a?3.2:2;s.pass(g.blur,e.write,{uSrc:e.read,uDir:[u/e.width,0]}),e.swap(),s.pass(g.blur,e.write,{uSrc:e.read,uDir:[0,u/e.height]}),e.swap()}return s.pass(g.normal,i.normals,{uHeight:e.read,uBase:i.base,uTexel:[1.5/i.normals.width,1.5/i.normals.height],uAspect:r.width/r.height}),r.normalsFrame=ve,i.normals}function Re(){let e=i.scene;for(let a=0;a<y.length;a++)s.pass(g.down,y[a],{uSrc:e,uTexel:[1/e.width,1/e.height],uKaris:a===0?1:0,uThreshold:1}),e=y[a];for(let a=y.length-1;a>0;a--){const u=y[a],f=y[a-1];s.pass(g.up,f,{uSrc:u,uTexel:[1/u.width,1/u.height],uRadius:1},{blend:"add"})}return y[0]}const k={tex:t.createTexture(),w:0,h:0,sw:0,sh:0,rect:[0,0,1,1]};function ce(){k.sw=r.width,k.sh=r.height;const e=Math.max(1,Math.min(3,r.height/600)),a=Math.round(330*e),u=Math.round(22*e),f=Math.round(14*e);if(k.rect=[r.width-a-f,f,a,u],a===k.w&&u===k.h)return;const m=document.createElement("canvas");m.width=a,m.height=u;const p=m.getContext("2d");p.font=`600 ${Math.round(11*e)}px ui-monospace, "SF Mono", Menlo, monospace`,p.textAlign="right",p.textBaseline="middle",p.fillStyle="#fff","letterSpacing"in p&&(p.letterSpacing=`${(1.6*e).toFixed(1)}px`),p.fillText("© SA’OOD WILLIAMS · REALITY STUDIO",a-2,u/2),t.bindTexture(t.TEXTURE_2D,k.tex),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,t.RGBA,t.UNSIGNED_BYTE,m),k.w=a,k.h=u}const Ue={post:{uResolution:[0,0],uSceneTexel:[0,0],uSrcMap:[0,0,0,0]},keep:{uTexel:[0,0],uScene:null,uBase:null}};function fe(e){(k.sw!==r.width||k.sh!==r.height)&&ce();const a=y.length?Re():i.scene;z(3);const u=r.post,f=Ue.post,m=r.scale<.999,p=m&&r.upscale.detail>0&&pe(),b=p||m&&r.upscale.sharpen>0;if(b){const T=Ue.keep;T.uTexel[0]=1/i.scene.width,T.uTexel[1]=1/i.scene.height,T.uScene=i.scene,T.uBase=i.base,s.pass(g.keep,i.keep,T)}f.uResolution[0]=r.width,f.uResolution[1]=r.height,f.uSceneTexel[0]=1/i.scene.width,f.uSceneTexel[1]=1/i.scene.height;const xe=c();for(let T=0;T<4;T++)f.uSrcMap[T]=xe[T];s.screen(r.width,r.height),s.pass(g.post,null,Object.assign(f,{uScene:i.scene,uBloom:a,uBloomStrength:u.bloom,uExposure:u.exposure,uTime:e,uFrame:r.frame,uAberration:u.aberration,uShake:u.shake,uVignette:u.vignette,uGrain:u.grain,uSaturation:u.saturation,uLift:u.lift,uGain:u.gain,uFlash:u.flash,uBloomLevels:y.length,uFilmic:u.filmic,uMark:k.tex,uMarkRect:k.rect,uBase:i.base,uPrev:i.prev,uSoft:_e(),uPersist:u.persist,uLightGrain:u.lightGrain,uUpscale:b?1:0,uDetail:p?1:0,uKeep:i.keep,uSource:re(),uHasSource:l.uploaded>=0?1:0,uSharpen:r.upscale.sharpen})),z(4),s.pass(g.copy,i.prev,{uSrc:i.scene})}function pe(){if(!l.width)return!1;const[e,a]=c();return i.scene.width<Math.abs(e)*l.width*1.5||i.scene.height<Math.abs(a)*l.height*1.5}function _e(){const e=l.width||r.width,a=l.height||r.height,u=Math.max(i.scene.width/e,i.scene.height/a);return Be(.35+(u-1)*.6,.35,1.8)}let ae=-1,me=-1,ve=0,he=null;const Ee=(e,a)=>{r.gpuLast=e,r.gpuLastFrame++,d.sample(e,a,performance.now())};function ge({time:e,dt:a,effect:u,newSource:f=!0,needsPlate:m=!0,frameMs:p=0,now:b=0}){if(t.isContextLost())return null;if(b=b||performance.now(),X.poll(Ee),p>0&&p<250&&(r.frameMs=r.frameMs*.92+p*.08,d.interval(p,b)),u!==he&&(d.switchEffect(he?.id,u?.id,b)&&K(),he=u),d.update(b,a,X.kind)&&K(),r.quality=d.quality,r.qualityTarget=d.qualityTarget,r.calibrating=d.calibrating,r.gpuMs=d.gpuMs,r.gpuP75=d.gpuP75,r.gpuP90=d.gpuP90,r.gpuMode=d.timing,r.budgetMs=d.budgetMs,r.refreshMs=d.refreshMs,X.every=r.calibrating?2:10,X.begin(d.tag()),A)for(const R of A)R.timer.poll(R.onSample),r.gpuSections[R.name]=R.ms;z(0),r.frame++,f&&!l.staged&&Te(),(r.dirty||r.resetMask||N!==ae||S.version!==me)&&(we(),ke(),ae=N,me=S.version,ve++,r.dirty=!1,r.plateStale=!0),m&&(r.plateStale||r.resetPlate)&&(le(),r.plateStale=!1);const T=Y(e,a);return z(1),u?u.render(T):s.pass(g.copy,i.scene,{uSrc:i.base}),z(2),fe(e),z(5),X.end(),T}function Y(e,a){const[u,f]=de();return{kit:s,gl:t,caps:ye,time:e,dt:a,frame:r.frame,mobile:q,quality:r.quality,width:u,height:f,aspect:r.width/r.height,base:i.base,mask:i.mask.read,plate:i.plateFilled,plateLearned:i.plate.read,scene:i.scene,sourceFrame:N,normals:()=>De(),post:r.post,toDisplay:te,copy:(m,p)=>s.pass(g.copy,p,{uSrc:m})}}function Fe(){try{return C.toDataURL("image/png")}catch{return null}}function Ae(e){d.configure({mode:e}),d.recalibrate(performance.now()),r.nativeWidth&&K()}function Pe(){X.dispose(),t.deleteTexture(l.tex),t.deleteTexture(S.tex),t.deleteTexture(k.tex);for(const e of G)t.deleteTexture(e.tex);s.dispose()}return W(),{kit:s,gl:t,caps:ye,state:r,targets:i,programs:g,mobile:q,resize:U,setSource:be,setStaged:ie,stageFrame:D,showSlot:se,setMask:ne,clearMask:Me,frame:ge,toDisplay:te,sourceMap:c,capture:Fe,setQuality:Ae,dispose:Pe,get scale(){return r.scale},get governor(){return d},present:fe,get source(){return l},resetPlate(){r.resetPlate=!0}}}export{bt as createEngine,xt as createGovernor};
