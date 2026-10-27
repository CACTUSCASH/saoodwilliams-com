/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-dbb0600c5251 */(()=>{const k=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(k)||k.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as b,COMMON as U}from"../engine/glsl.js?v=0aafddc6f3";const w=(k,i,l)=>Math.min(l,Math.max(i,k)),Et=(k,i,l)=>{const $=w((l-k)/(i-k),0,1);return $*$*(3-2*$)},H=0,G=1,I=2,yt=.7,e0=.085,We=.24,R0=11,t0=48,xe=`
const float UNREACHED=2000.0;
const float EDGE_AMP=${e0.toFixed(3)};
const int BA[24]=int[24](0,1,2,3, 0,5,6,7, 9,10,11, 13,14,15, 0,17,18,19, 0,5,0,5,9,13);
const int BB[24]=int[24](1,2,3,4, 5,6,7,8, 10,11,12, 14,15,16, 17,18,19,20, 9,17,13,9,13,17);
float segDist(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-9),0.0,1.0);return length(pa-ba*h);}
// The kept hands, from the prot pass: signed distance (frame heights) to the kept hand, negative
// inside. Low-resolution consumers take it with a soft edge; the composite anti-aliases it per pixel.
float protLo(float sd){ return 1.0-smoothstep(-0.004,0.004,sd); }
// A delay that was reset for something arriving over a long-burned area: it re-burns quietly.
float quietOf(float dl){ return smoothstep(0.24,0.36,dl); }
// The field, bilinear by hand: an UNREACHED tap counts as the earliest finite arrival next to it
// plus a small margin (hardware filtering of a finite T against 2000 stair-steps the edge on the
// field grid), and the front speed is filtered by magnitude (its sign is a flag that must never
// interpolate through zero). Returns (T or UNREACHED, |speed|, hull, delay).
vec4 fieldAt(sampler2D f,vec2 uv){
  vec2 n=vec2(textureSize(f,0)), fc=uv*n-0.5, fl=floor(fc), w=fc-fl;
  ivec2 i0=ivec2(fl), mx=ivec2(n)-1;
  vec4 a=texelFetch(f,clamp(i0,ivec2(0),mx),0), b=texelFetch(f,clamp(i0+ivec2(1,0),ivec2(0),mx),0);
  vec4 c=texelFetch(f,clamp(i0+ivec2(0,1),ivec2(0),mx),0), d=texelFetch(f,clamp(i0+ivec2(1,1),ivec2(0),mx),0);
  vec4 T=vec4(a.r,b.r,c.r,d.r), G=abs(vec4(a.g,b.g,c.g,d.g));
  float tm=min(min(T.x,T.y),min(T.z,T.w));
  T=mix(T,vec4(tm+0.06),step(1000.0,T));
  vec2 ba=mix(mix(a.ba,b.ba,w.x),mix(c.ba,d.ba,w.x),w.y);
  return vec4(tm<1000.0?mix(mix(T.x,T.y,w.x),mix(T.z,T.w,w.x),w.y):UNREACHED,mix(mix(G.x,G.y,w.x),mix(G.z,G.w,w.x),w.y),ba);
}
`,o0=`
uniform vec4 uHand[42];   // per landmark: xy position (x scaled by aspect), zw its lead (predicted motion)
uniform vec4 uHandW;      // x,y weights, z,w hand sizes
uniform vec4 uHandR;      // x,y largest lead per hand, z,w inflation (a stale track: the hand may be anywhere near)
uniform vec4 uWrist[2];   // per hand: xy radial (thumb side) wrist corner, zw ulnar (little finger side) corner
const int FA[15]=int[15](1,2,3, 5,6,7, 9,10,11, 13,14,15, 17,18,19);
// (a little wider than typical fingers: thick fingers, and fingers nearer the camera than the wrist;
// the colour snap trims whatever is clearly not skin off that margin)
const float FRA[15]=float[15](0.16,0.14,0.125, 0.125,0.115,0.108, 0.13,0.12,0.11, 0.123,0.113,0.105, 0.112,0.102,0.095);
const float FRB[15]=float[15](0.14,0.125,0.11, 0.115,0.108,0.1, 0.12,0.11,0.102, 0.113,0.105,0.097, 0.102,0.095,0.088);
float capT(vec2 p,vec2 a,vec2 b,float ra,float rb){ vec2 pa=p-a,ba=b-a; float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-12),0.0,1.0); return length(pa-ba*h)-mix(ra,rb,h); }
// Signed distance to the palm polygon (crossing-number sign, exact edge distance). The little-finger
// side bulges out between its knuckle and the wrist (the hypothenar), as a real palm does.
float sdPalm(vec2 p,int h,float sz){
  vec2 v[9];
  v[0]=uWrist[h].xy; v[1]=uHand[h*21+1].xy; v[2]=uHand[h*21+2].xy; v[3]=uHand[h*21+5].xy;
  v[4]=uHand[h*21+9].xy; v[5]=uHand[h*21+13].xy; v[6]=uHand[h*21+17].xy; v[8]=uWrist[h].zw;
  vec2 eb=v[8]-v[6], nb=vec2(-eb.y,eb.x)/max(length(eb),1e-6);
  if(dot(nb,v[4]-v[6])>0.0) nb=-nb;
  v[7]=mix(v[6],v[8],0.45)+nb*0.07*sz;
  float d=dot(p-v[0],p-v[0]), s=1.0;
  for(int i=0;i<9;i++){
    int j=i==0?8:i-1;
    vec2 e=v[j]-v[i], w=p-v[i];
    vec2 b=w-e*clamp(dot(w,e)/max(dot(e,e),1e-12),0.0,1.0);
    d=min(d,dot(b,b));
    bvec3 c=bvec3(p.y>=v[i].y,p.y<v[j].y,e.x*w.y>e.y*w.x);
    if(all(c)||all(not(c))) s=-s;
  }
  return s*sqrt(d);
}
// Signed distance to hand h in units of its size (negative inside): x = the hand where the tracker
// puts it, y = the hand where it is heading (each joint led along its own motion).
vec2 handSDF2(vec2 q,int h,float sz){
  float d=1e3, dl=1e3;
  for(int k=0;k<15;k++){
    int a=h*21+FA[k];
    vec4 A=uHand[a], B=uHand[a+1];
    vec2 b0=B.xy;
    // (the tip landmark sits a little inside the pad)
    if(k==5||k==8||k==11||k==14){ vec2 e=B.xy-A.xy; b0+=e/max(length(e),1e-6)*0.035*sz; }
    float ra=FRA[k]*sz, rb=FRB[k]*sz;
    d=min(d,capT(q,A.xy,b0,ra,rb)); dl=min(dl,capT(q,A.xy+A.zw,b0+B.zw,ra,rb));
  }
  vec2 lp=(uHand[h*21].zw+uHand[h*21+9].zw)*0.5;
  d=min(d,sdPalm(q,h,sz)-0.045*sz); dl=min(dl,sdPalm(q-lp,h,sz)-0.045*sz);
  return vec2(d,dl)/sz;
}
float handSDF(vec2 q,int h,float sz){ vec2 d=handSDF2(q,h,sz); return min(d.x,d.y); }
`,P0=b+U+xe+o0+`
in vec2 vUv;out vec4 o;
uniform sampler2D uPrev;uniform sampler2D uMask;uniform sampler2D uMaskD;uniform sampler2D uNoiseB;
uniform vec2 uRes;uniform float uAspect;uniform float uTau;uniform float uSpeed;uniform float uBg;
uniform float uReset;uniform float uFirst;uniform float uPropagate;uniform float uDt;uniform float uBump;uniform float uRewind;
uniform vec4 uRebase;
float rebased(float T){
if(uRebase.w<0.5 || T>=1000.0)return T;
float R=uRebase.x,K=uRebase.z;
return T>=R+K?T-R:K*clamp((T-uRebase.y)/max(R+K-uRebase.y,1e-3),0.0,1.0);
}
uniform vec4 uIgn[4];uniform vec4 uIgnP[4];
const ivec2 OFF[24]=ivec2[24](
ivec2(1,0),ivec2(-1,0),ivec2(0,1),ivec2(0,-1),ivec2(1,1),ivec2(-1,1),ivec2(1,-1),ivec2(-1,-1),
ivec2(3,0),ivec2(-3,0),ivec2(0,3),ivec2(0,-3),ivec2(2,2),ivec2(-2,2),ivec2(2,-2),ivec2(-2,-2),
ivec2(6,0),ivec2(-6,0),ivec2(0,6),ivec2(0,-6),ivec2(4,4),ivec2(-4,4),ivec2(4,-4),ivec2(-4,-4));
void main(){
ivec2 px=ivec2(gl_FragCoord.xy);ivec2 mx=ivec2(uRes)-1;
vec4 prev=texelFetch(uPrev,px,0);
vec2 uv=(vec2(px)+0.5)/uRes;vec2 q=vec2(uv.x*uAspect,uv.y);
float T=uReset>0.5?UNREACHED:rebased(prev.r);
float v=abs(prev.g),dl=prev.a,hull=prev.b,m=0.0,inSign=prev.g<0.0?-1.0:1.0;
vec4 nb=vec4(0.0);
if(uFirst>0.5){
nb=texture(uNoiseB,uv);
m=texture(uMask,uv).r;
v=uSpeed*mix(uBg,1.0,smoothstep(0.12,0.5,max(m,texture(uMaskD,uv).r)))*(0.38+1.25*smoothstep(-0.45,0.55,nb.r));
float dl0=0.04+0.16*smoothstep(-0.2,0.65,nb.g);
dl=uReset>0.5||uRewind>0.5?dl0:max(dl0,prev.a-uDt);
hull=0.0;
for(int h=0;h<2;h++){
float w=h==0?uHandW.x:uHandW.y;
if(w<0.01)continue;
float sz=h==0?uHandW.z:uHandW.w,infl=h==0?uHandR.z:uHandR.w,reach=(h==0?uHandR.x:uHandR.y)+infl;
vec2 w0=uHand[h*21].xy,m9=uHand[h*21+9].xy;
if(length(q-(w0+m9)*0.5)>sz*2.9+reach)continue;
float d=handSDF(q,h,sz)-infl/sz+nb.b*0.02;
hull=max(hull,w*clamp(1.0-max(d,0.0)/0.34,0.0,1.0));
}
if(uBump>0.5 && uReset<0.5 && T<1000.0 && uTau-T-dl>-0.08 && prev.g<0.0 && m>0.55)dl=max(dl,uTau-T-0.06);
inSign=m<0.08?-1.0:1.0;
}
v=max(v,1e-3);
if(uPropagate>0.5){
for(int i=0;i<24;i++){
ivec2 of=OFF[i];
float Tn=uReset>0.5?UNREACHED:rebased(texelFetch(uPrev,clamp(px+of,ivec2(0),mx),0).r);
vec2 d=vec2(of)/uRes*vec2(uAspect,1.0);
T=min(T,Tn+length(d)/v);
}
if(uFirst>0.5 && m>0.25){
for(int i=0;i<4;i++){
if(uIgnP[i].y<0.5)continue;
float d=segDist(q,uIgn[i].xy,uIgn[i].zw);
float r=uIgnP[i].x*(0.7+0.6*(0.5+0.5*nb.a));
if(d<r)T=min(T,uTau+d/(v*2.0));
}
}
}
o=vec4(min(T,UNREACHED),v*inSign,hull,dl);
}`,T0=b+U+`
in vec2 vUv;out vec4 o;uniform float uAspect;uniform float uWhich;
float crackDist(vec2 p){
vec2 ip=floor(p),fp=fract(p);
float f1=8.0,f2=8.0,i1=0.0,i2=0.0;
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
vec2 g=vec2(float(i),float(j));
vec2 r=g+0.1+0.8*hash22(ip+g)-fp;
float d=dot(r,r),h=hash12(ip+g+17.31);
if(d<f1){f2=f1;i2=i1;f1=d;i1=h;}else if(d<f2){f2=d;i2=h;}
}
float pair=hash12(vec2(min(i1,i2),max(i1,i2))*97.3);
return pair>0.42?(sqrt(f2)-sqrt(f1)):1.0;
}
void main(){
vec2 q=vec2(vUv.x*uAspect,vUv.y);
if(uWhich<0.5){
vec2 w=vec2(snoise(vec3(q*3.1,1.3)),snoise(vec3(q*3.1+5.2,2.1)));
vec2 w2=vec2(snoise(vec3(q*9.0+w*0.6,4.1)),snoise(vec3(q*9.0+w*0.6+3.3,5.7)));
float e=0.55*snoise(vec3(q*6.0+w*0.9,0.7))+0.3*snoise(vec3(q*15.0+w2*0.8,1.9))+0.15*snoise(vec3(q*38.0+w2*0.5,2.6));
float c=min(crackDist(q*24.0+w*1.3+w2*0.5),crackDist(q*55.0+w2*1.1+w*0.7)*1.5+0.04);
o=vec4(e,c,snoise(vec3(q*46.0,0.0)),snoise(vec3(q*20.0,3.0)));
}else o=vec4(fbm3(vec3(q*2.2,1.7)),fbm3(vec3(q*4.2,4.2)),snoise(vec3(q*60.0,1.0)),snoise(vec3(q*9.0,7.0)));
}`,z0=b+U+`
in vec2 vUv;out vec4 o;
vec2 gr(vec2 i,float P){i=mod(i,P);float a=hash12(i*1.13+vec2(0.37,1.91))*6.2832;return vec2(cos(a),sin(a));}
float pn(vec2 p,float P){
vec2 i=floor(p),f=fract(p),u=f*f*f*(f*(f*6.0-15.0)+10.0);
float a=dot(gr(i,P),f),b=dot(gr(i+vec2(1.0,0.0),P),f-vec2(1.0,0.0));
float c=dot(gr(i+vec2(0.0,1.0),P),f-vec2(0.0,1.0)),d=dot(gr(i+vec2(1.0,1.0),P),f-vec2(1.0,1.0));
return mix(mix(a,b,u.x),mix(c,d,u.x),u.y)*1.45;
}
float pf(vec2 p,float P,int oct){float s=0.0,a=0.5;for(int k=0;k<5;k++){if(k>=oct)break;s+=a*pn(p,P);p*=2.0;P*=2.0;a*=0.5;}return s;}
void main(){
vec2 p=vUv;
o=vec4(pf(p*3.0,3.0,5),pf(p*6.0+vec2(1.7,2.2),6.0,4),pf(p*8.0+vec2(0.4,3.1),8.0,4),pf(p*16.0+vec2(2.9,0.6),16.0,3));
}`,U0=b+U+`
in vec2 vUv;out vec4 o;uniform float uAspect;uniform float uTime;
void main(){
vec2 q=vec2(vUv.x*uAspect,vUv.y);
o=vec4(curl2(vec3(q*1.25,uTime*0.06))*0.21+curl2(vec3(q*4.2+3.1,uTime*0.19))*0.055,0.0,1.0);
}`,M0=b+U+`
in vec2 vUv;out vec4 o;uniform sampler2D uSrc;uniform float uAspect;uniform float uTime;
void main(){
vec2 tx=1.0/vec2(textureSize(uSrc,0));
float L=texture(uSrc,vUv).r;
float lx=texture(uSrc,vUv+vec2(tx.x*2.0,0.0)).r-texture(uSrc,vUv-vec2(tx.x*2.0,0.0)).r;
float ly=texture(uSrc,vUv+vec2(0.0,tx.y*2.0)).r-texture(uSrc,vUv-vec2(0.0,tx.y*2.0)).r;
vec2 q=vec2(vUv.x*uAspect,vUv.y);
o=vec4(L,lx,ly,L>0.004?snoise(vec3(q*12.0,uTime*1.3)):0.0);
}`,C0=b+U+xe+`
in vec2 vUv;out vec4 o;
uniform sampler2D uField;uniform sampler2D uMask;uniform sampler2D uNoiseA;uniform sampler2D uProt;
uniform float uTau;uniform float uOn;uniform float uAspect;
uniform vec4 uHandC[2];uniform vec4 uFlare[2];uniform vec4 uSparkH[2];
void main(){
vec2 q=vec2(vUv.x*uAspect,vUv.y);
float g=0.0;
if(uOn>0.5){
vec4 F=fieldAt(uField,vUv);
float m=texture(uMask,vUv).r;
float s=F.r<1000.0?uTau-F.r-F.a-EDGE_AMP*texture(uNoiseA,vUv).r:-10.0;
g=smoothstep(-0.16,-0.01,s)*(1.0-smoothstep(0.0,0.1,s))*smoothstep(0.2,0.6,m)*(1.0-protLo(texture(uProt,vUv).r))*(1.0-quietOf(F.a));
}
for(int h=0;h<2;h++){
vec4 C=uHandC[h];
if(C.w>0.01){vec2 d=q-C.xy;g+=C.w*C.w*1.3*exp(-dot(d,d)/(C.z*C.z*0.35));}
vec4 FL=uFlare[h];
if(FL.z>0.01){vec2 d=q-FL.xy;g+=FL.z*1.8*exp(-dot(d,d)/0.0036);}
vec4 SH=uSparkH[h];
if(SH.z>0.01){vec2 d=q-SH.xy;g+=SH.z*1.1*exp(-dot(d,d)/0.0016);}
}
o=vec4(g,0.0,0.0,1.0);
}`,H0=b+`
in vec2 vUv;out vec4 o;
uniform sampler2D uSrc;uniform vec2 uDir;
void main(){
const float w[5]=float[5](0.2270270270,0.1945945946,0.1216216216,0.0540540541,0.0162162162);
vec4 s=texture(uSrc,vUv)*w[0];
for(int i=1;i<5;i++){s+=texture(uSrc,vUv+uDir*float(i))*w[i];s+=texture(uSrc,vUv-uDir*float(i))*w[i];}
o=s;
}`,L0=b+`
in vec2 vUv;out vec4 o;uniform sampler2D uMask;uniform float uAspect;
void main(){
float m0=texture(uMask,vUv).r,r1=0.0,r2=0.0,r3=0.0,r4=0.0,avg=0.0;
for(int k=0;k<8;k++){
float a=float(k)*0.785398;
vec2 d=vec2(cos(a)/uAspect,sin(a)),e=vec2(cos(a+0.39)/uAspect,sin(a+0.39));
float t1=texture(uMask,vUv+d*0.006).r,t2=texture(uMask,vUv+e*0.013).r,t3=texture(uMask,vUv+d*0.026).r,t4=texture(uMask,vUv+e*0.042).r;
r1=max(r1,t1);r2=max(r2,t2);r3=max(r3,t3);r4=max(r4,t4);
avg+=t2+t3+t4;
}
o=vec4(max(m0,max(r1*0.9,r2*0.6)),max(max(m0,r1),max(r2,max(r3,r4))),(m0*3.0+avg)/27.0,max(m0,max(max(r1*0.88,r2*0.72),max(r3*0.52,r4*0.3))));
}`,N0=b+`
in vec2 vUv;out vec4 o;
uniform sampler2D uPrev;uniform sampler2D uBase;uniform sampler2D uMaskD;uniform sampler2D uProt;uniform sampler2D uStats;uniform sampler2D uField;
uniform float uAspect;uniform float uValid;uniform float uReset;uniform float uRate;uniform float uGate;
uniform vec4 uArm[2];uniform vec4 uArmP[2];
void main(){
float mx=texture(uMaskD,vUv).g;
vec4 P0=texture(uProt,vUv);
float hand=1.0-smoothstep(0.012,0.03,P0.r),arm=P0.g;
for(int k=0;k<4;k++){
float a=float(k)*1.5708+0.4;vec4 Pk=texture(uProt,vUv+vec2(cos(a)/uAspect,sin(a))*0.018);
hand=max(hand,1.0-smoothstep(0.012,0.03,Pk.r));arm=max(arm,Pk.g);
}
hand=max(hand,smoothstep(0.04,0.2,arm));
hand=max(hand,smoothstep(0.4,0.6,texture(uField,vUv).b));
vec2 q=vec2(vUv.x*uAspect,vUv.y);
for(int h=0;h<2;h++){
float w=uArmP[h].y*(1.0-uArmP[h].z);if(w<0.01)continue;
float sz=uArmP[h].x;vec2 d=q-uArm[h].xy,ax=uArm[h].zw;
float t=dot(d,ax),l=abs(dot(d,vec2(-ax.y,ax.x)));
float r=0.5*sz+0.13*max(t,0.0);
float inA=(1.0-smoothstep(r,r+0.3*sz,l))*smoothstep(-0.5*sz,-0.2*sz,t)*(1.0-smoothstep(4.2*sz,4.8*sz,t));
hand=max(hand,inA*w);
}
float bg=(1.0-smoothstep(0.02,0.1,max(mx,hand*1.5)))*uValid;
if(uGate>0.5 && texelFetch(uStats,ivec2(0,0),0).a<0.004)bg=0.0;
vec4 prev=uReset>1.5?texture(uPrev,vUv)*vec4(1.0,1.0,1.0,0.25):uReset>0.5?vec4(0.0):texture(uPrev,vUv);
vec3 cam=texture(uBase,vUv).rgb;
float rate=prev.a<0.3?1.0:uRate;
if(prev.a>0.6)rate*=mix(1.0,0.12,smoothstep(0.08,0.3,length(cam-prev.rgb)));
vec3 c=mix(prev.rgb,cam,bg*rate);
o=vec4(c,bg>0.01?min(1.0,prev.a+bg*0.085):prev.a*0.9997);
}`,E0=b+`
in vec2 vUv;out vec4 o;
uniform sampler2D uRoom;uniform vec2 uAxis;
float val(vec2 uv){return smoothstep(0.8,0.96,texture(uRoom,uv).a);}
void main(){
vec4 c0=texture(uRoom,vUv);
float v0=smoothstep(0.8,0.96,c0.a);
vec3 s=c0.rgb*v0*0.36;float w=v0*0.36;
float nNear=0.0,nFar=0.0;
for(int i=0;i<8;i++){
vec2 d=vec2(i==0||i==4||i==5?1.0:(i==1||i==6||i==7?-1.0:0.0),i==2||i==4||i==6?1.0:(i==3||i==5||i==7?-1.0:0.0));
float k=i<4?0.1:0.06;
vec4 a=texture(uRoom,vUv+d*uAxis*0.9);
float va=smoothstep(0.8,0.96,a.a)*k;s+=a.rgb*va;w+=va;
float ang=float(i)*0.785398+0.2;
vec2 e=vec2(cos(ang),sin(ang))*uAxis;
nNear+=step(0.5,val(vUv+e*2.6));nFar+=step(0.5,val(vUv+e*7.0));
}
float keep=step(4.5,nNear)*step(2.5,nFar);
o=vec4(w>1e-4?s/w:vec3(0.0),v0>0.5&&keep>0.5?1.0:0.0);
}`,q0=b+`
out vec4 o;
uniform sampler2D uSrc;uniform vec2 uDir;uniform float uStep;uniform float uInit;uniform float uRadix;
const float NONE=4000.0;
vec4 st(ivec2 q){vec4 t=texelFetch(uSrc,q,0);return uInit>0.5?(t.a>0.5?vec4(t.rgb,0.0):vec4(0.0,0.0,0.0,NONE)):t;}
void main(){
ivec2 p=ivec2(gl_FragCoord.xy),n=textureSize(uSrc,0),dir=ivec2(uDir);
vec4 s=st(p);
if(s.a<NONE-1.0){o=s;return;}
int stp=int(uStep),R=int(uRadix);
for(int k=1;k<32;k++){
if(k>=R)break;
ivec2 q=p+dir*(stp*k);
if(q.x<0||q.y<0||q.x>=n.x||q.y>=n.y)break;
vec4 t=st(q);
if(t.a<NONE-1.0){o=vec4(t.rgb,t.a+float(stp*k));return;}
}
o=vec4(0.0,0.0,0.0,NONE);
}`,qt=`
const float NONE=4000.0;
uniform sampler2D uL; uniform sampler2D uR; uniform sampler2D uD; uniform sampler2D uU; uniform sampler2D uPref;
struct FillW { float wH; float wV; float w1; float wI; float gap; float dmin; float conf; };
// Same surface? Hue-tolerant: a light and a dark part of one poster agree, a wall and a poster do not.
float confOf(vec3 a,vec3 b){
  float la=dot(a,vec3(0.3333)), lb=dot(b,vec3(0.3333));
  float cs=1.0-smoothstep(0.06,0.22,length(a/max(la,1e-4)-b/max(lb,1e-4)));
  return cs*(1.0-smoothstep(1.2,2.6,abs(log2(max(la,1e-4)/max(lb,1e-4)))));
}
// The slope of the seen room just beyond where a scan ends (per texel, toward the hole), so the
// guess carries a wall's lighting gradient on and eases into a flat surface without a kink.
vec3 endSlope(ivec2 p,ivec2 dir,vec4 S){
  ivec2 n=textureSize(uPref,0)-1, q=p+dir*int(S.a+5.0);
  if(q.x<0||q.y<0||q.x>n.x||q.y>n.y) return vec3(0.0);
  vec4 f=texelFetch(uPref,q,0);
  return f.a>0.5?(S.rgb-f.rgb)/5.0:vec3(0.0);
}
// Monotone cubic (Fritsch-Carlson limited tangents): C1 with the seen room at both ends, never overshooting.
vec3 hermite(vec3 c0,vec3 c1,vec3 s0,vec3 s1,float sp,float t){
  vec3 sec=c1-c0, sg=sign(sec);
  vec3 m0=sg*min(max(s0*sp*sg,0.0),3.0*abs(sec)), m1=sg*min(max(s1*sp*sg,0.0),3.0*abs(sec));
  float t2=t*t, t3=t2*t;
  return (2.0*t3-3.0*t2+1.0)*c0+(t3-2.0*t2+t)*m0+(3.0*t2-2.0*t3)*c1+(t3-t2)*m1;
}
// (a gradient across a poster still agrees; wall white against chair grey does not)
float agreeOf(vec3 a,vec3 b){ return 1.0-smoothstep(0.05,0.3,length(sqrt(max(a,0.0))-sqrt(max(b,0.0)))); }
// The colour a scan ends on, averaged over the neighbouring rows (or columns) that are in the hole
// too, so one row that happens to hit a bright stripe never paints a band through the hole.
vec3 smoothEnd(sampler2D T,ivec2 p,ivec2 perp,vec4 S0){
  ivec2 n=textureSize(T,0)-1;
  vec3 s=S0.rgb; float w=1.0;
  for(int j=-4;j<=4;j++){
    if(j==0) continue;
    vec4 t=texelFetch(T,clamp(p+perp*(2*j),ivec2(0),n),0);
    if(t.a<0.5 || t.a>=NONE-1.0) continue;
    float dj=t.a-S0.a, dc=length(sqrt(max(t.rgb,0.0))-sqrt(max(S0.rgb,0.0)))/0.3;
    // (robust: a variation within one surface averages out, a real edge such as a poster's border stays put)
    float k=exp(-float(j*j)*0.18)/((1.0+dj*dj/(0.06*S0.a*S0.a+9.0))*(1.0+dc*dc));
    s+=t.rgb*k; w+=k;
  }
  return s/w;
}
// One-sided evidence (the far side is a frame edge): extend what lies next to the hole, averaged
// ACROSS the direction over a window that widens with depth, so a narrow feature never extrudes
// into a bar; deep inside it becomes a soft continuation of the whole boundary.
float sideW(sampler2D T,ivec2 p,ivec2 perp,float d,bool colour,float k1,inout vec3 acc){
  // (rooms are layered horizontally: a row seen on one side only continues sideways, e.g. a poster
  // that runs on past the edge of the frame, rather than taking the colour of what is above or below)
  // (and one-sided evidence fades out with depth: far from the seen room an edge extruded from one
  // side is a slab with hard sides, while the smooth membrane is the honest guess)
  float ww=(perp.y!=0?0.48:0.12)*k1/pow(2.0*d+2.0,2.0)*exp(-d/30.0);
  if(!colour) return ww;
  ivec2 n=textureSize(T,0)-1;
  float win=clamp(d*0.9,1.0,96.0), w=0.0; vec3 s=vec3(0.0);
  for(int i=-5;i<=5;i++){
    vec4 t=texelFetch(T,clamp(p+perp*int(floor(float(i)*win/5.0+0.5)),ivec2(0),n),0);
    if(t.a<NONE-1.0){ float k=exp(-float(i*i)*0.08); s+=t.rgb*k; w+=k; }
  }
  if(w<=0.0) return 0.0;
  vec3 c=s/w;
  acc+=mix(c,vec3(dot(c,vec3(0.2126,0.7152,0.0722))),clamp(d/500.0,0.0,0.15))*ww;   // (very deep guesses fade a little toward neutral)
  return ww;
}
FillW fillW(ivec2 p,bool colour,out vec3 cH,out vec3 cV,out vec3 c1,out vec3 corr){
  FillW F; F.gap=1e4; F.wH=0.0; F.wV=0.0; F.w1=0.0; F.conf=0.0;
  float cfH=0.0, cfV=0.0, W=float(textureSize(uL,0).x);
  cH=vec3(0.0); cV=vec3(0.0); c1=vec3(0.0); corr=vec3(0.0);
  vec4 L=texelFetch(uL,p,0), R=texelFetch(uR,p,0), D=texelFetch(uD,p,0), U=texelFetch(uU,p,0);
  bool hL=L.a<NONE-1.0, hR=R.a<NONE-1.0, hD=D.a<NONE-1.0, hU=U.a<NONE-1.0;
  vec3 sL=L.rgb, sR=R.rgb, sD=D.rgb, sU=U.rgb;
  if(colour){
    if(hL) sL=smoothEnd(uL,p,ivec2(0,1),L);
    if(hR) sR=smoothEnd(uR,p,ivec2(0,1),R);
    if(hD) sD=smoothEnd(uD,p,ivec2(1,0),D);
    if(hU) sU=smoothEnd(uU,p,ivec2(1,0),U);
  }
  if(hL&&hR){
    float sp=L.a+R.a+1.0, a=colour?agreeOf(sL,sR):agreeOf(L.rgb,R.rgb);
    cH=colour?hermite(sL,sR,endSlope(p,ivec2(-1,0),L),-endSlope(p,ivec2(1,0),R),sp,(L.a+0.5)/sp):mix(sL,sR,(L.a+0.5)/sp);
    F.wH=4.0*(0.04+a*a*a*a)/(sp*sp); F.gap=min(F.gap,sp);   // rooms are layered horizontally
    if(colour) cfH=confOf(sL,sR)*exp(-sp/(0.8*W));
  }
  if(hD&&hU){
    float sp=D.a+U.a+1.0, a=colour?agreeOf(sD,sU):agreeOf(D.rgb,U.rgb);
    cV=colour?hermite(sD,sU,endSlope(p,ivec2(0,-1),D),-endSlope(p,ivec2(0,1),U),sp,(D.a+0.5)/sp):mix(sD,sU,(D.a+0.5)/sp);
    F.wV=(0.04+a*a*a*a)/(sp*sp); F.gap=min(F.gap,sp);
    if(colour) cfV=0.85*confOf(sD,sU)*exp(-sp/(0.8*W));
  }
  // The better-supported direction takes most of the weight, with a soft ratio (a hard switch
  // between row and column fill is a dead-straight edge in the guess); the blur pass smooths the rest.
  if(F.wH>0.0 && F.wV>0.0){
    float tot=F.wH+F.wV, rr=smoothstep(-2.0,2.0,log2(F.wH/F.wV));
    F.wH=tot*rr; F.wV=tot*(1.0-rr);
  }
  bool pair=F.wH+F.wV>0.0;
  // (a pair whose ends disagree, e.g. an orange armrest against a grey chair, must not extrude
  // one end across the hole: then what lies above / below carries the guess too)
  float agMax=max(hL&&hR?agreeOf(L.rgb,R.rgb):0.0,hD&&hU?agreeOf(D.rgb,U.rgb):0.0);
  float k1=pair?mix(1.0,0.08,agMax):1.0;
  vec3 a1=vec3(0.0);
  if(!(hL&&hR)){
    if(hL) F.w1+=sideW(uL,p,ivec2(0,1),L.a,colour,k1,a1);
    if(hR) F.w1+=sideW(uR,p,ivec2(0,1),R.a,colour,k1,a1);
  }
  if(!(hD&&hU)){
    if(hD) F.w1+=sideW(uD,p,ivec2(1,0),D.a,colour,k1,a1);
    if(hU) F.w1+=sideW(uU,p,ivec2(1,0),U.a,colour,k1,a1);
  }
  c1=F.w1>0.0?a1/F.w1:vec3(0.0);
  float dmin=min(min(L.a,R.a),min(D.a,U.a)); F.dmin=dmin;
  // The isotropic push-pull only where nothing at all was seen along the row or the column.
  F.wI=(pair?0.007:0.07)/pow(2.0*min(dmin,600.0)+2.0,2.0)+(pair||F.w1>0.0?0.0:1.0);   // (see PUSH_FS)
  F.gap=min(F.gap,2.0*min(dmin,600.0)+2.0);
  // How trustworthy the guess is (drives the lingering smoke): the share of a two-sided guess
  // between ends of one surface over a moderate span; anything close to the seen room is fine.
  float tw=F.wH+F.wV+F.w1+F.wI;
  F.conf=max(max(cfH*F.wH,cfV*F.wV)/tw,0.3*exp(-dmin/(0.06*W)));
  // Near the boundary the guess takes the exact colour the room ends on (the smoothed ends drift a
  // little from it), so the seen room and the guess meet without a seam.
  if(colour){
    float ks=0.0, k;
    if(hL){ k=exp(-L.a/3.0); corr+=(L.rgb-sL)*k; ks+=k; }
    if(hR){ k=exp(-R.a/3.0); corr+=(R.rgb-sR)*k; ks+=k; }
    if(hD){ k=exp(-D.a/3.0); corr+=(D.rgb-sD)*k; ks+=k; }
    if(hU){ k=exp(-U.a/3.0); corr+=(U.rgb-sU)*k; ks+=k; }
    corr/=max(1.0,ks);
  }
  return F;
}`,B0=b+U+qt+`
in vec2 vUv;out vec4 o;
uniform sampler2D uIso;
void main(){
ivec2 p=ivec2(gl_FragCoord.xy);
vec4 c=texelFetch(uPref,p,0);
if(c.a>0.5){o=vec4(c.rgb,0.0);return;}
vec3 cH,cV,c1,corr;
FillW F=fillW(p,true,cH,cV,c1,corr);
vec3 iso=texture(uIso,vUv).rgb;
vec3 col=(cH*F.wH+cV*F.wV+c1*F.w1+iso*F.wI)/(F.wH+F.wV+F.w1+F.wI)+corr;
o=vec4(max(col,0.0),1.0+clamp(F.conf,0.0,1.0));
}`,V0=b+`
in vec2 vUv;out vec4 o;
uniform sampler2D uSrc;uniform vec2 uTexel;uniform float uFirst;
vec4 tap(vec2 uv){vec4 c=texture(uSrc,uv);return uFirst>0.5?vec4(c.rgb*c.a,c.a):c;}
void main(){
vec4 s=(tap(vUv+vec2(-uTexel.x,-uTexel.y))+tap(vUv+vec2(uTexel.x,-uTexel.y))+tap(vUv+vec2(-uTexel.x,uTexel.y))+tap(vUv+uTexel))*0.25;
float al=min(1.0,s.a*4.0);
o=s.a>1e-6?s*(al/s.a):vec4(0.0);
}`,_0=b+`
in vec2 vUv;out vec4 o;
uniform sampler2D uFine;uniform sampler2D uCoarse;uniform float uCoarseTop;uniform float uZero;
void main(){
vec4 c=texture(uCoarse,vUv);
vec3 cc=uCoarseTop>0.5?(c.a>1e-6?c.rgb/c.a:vec3(uZero>0.5?0.0:0.16)):c.rgb;
vec4 f=texture(uFine,vUv);
vec3 fc=f.a>1e-6?f.rgb/f.a:cc;
o=vec4(mix(cc,fc,f.a),1.0);
}`,O0=b+U+qt+`
in vec2 vUv;out vec4 o;
uniform sampler2D uSrc;uniform vec2 uDir;uniform float uLast;
void main(){
ivec2 p=ivec2(gl_FragCoord.xy),n=textureSize(uSrc,0)-1;
vec4 c=texelFetch(uSrc,p,0);
ivec2 st=uDir.x>0.0?ivec2(1,0):ivec2(0,1);
if(c.a<0.5){
float prox=uLast>0.5?-c.a:0.0;
for(int i=-7;i<=7;i++){
if(i==0)continue;
vec4 t=texelFetch(uSrc,clamp(p+st*i,ivec2(0),n),0);
float fi=abs(float(i))/8.0;
prox=max(prox,t.a>=0.5?1.0-fi:(uLast>0.5?-t.a-fi:0.0));
}
o=vec4(c.rgb,uLast>0.5?-(0.5+8.0*(1.0-prox)):-prox);
return;
}
vec3 cH,cV,c1,corr;
FillW F=fillW(p,false,cH,cV,c1,corr);
float sw=F.wH+F.wV+F.w1+F.wI,fH=F.wH/sw,fV=F.wV/sw,fO=max(0.0,1.0-fH-fV);
float lng=0.14*F.gap,shr=0.8+0.015*F.gap,iso=0.1*F.gap;
float r=uDir.x>0.0?lng*fH+shr*fV+iso*fO:lng*fV+shr*fH+iso*fO;
r=max(r,0.4*min(F.dmin,60.0)*fO);
r=clamp(min(r,F.dmin*0.6),0.0,24.0);
if(r<0.5){o=c;return;}
vec3 s=c.rgb;float w=1.0;
for(int i=1;i<=5;i++){
float t=float(i)/5.0,k=exp(-t*t*2.2);
s+=(texture(uSrc,vUv+uDir*r*t).rgb+texture(uSrc,vUv-uDir*r*t).rgb)*k;w+=2.0*k;
}
o=vec4(s/w,c.a);
}`,W0=b+U+qt+`
in vec2 vUv;out vec4 o;
uniform sampler2D uSrc;uniform vec2 uStepDir;uniform sampler2D uIso;uniform float uLast;
void main(){
ivec2 p=ivec2(gl_FragCoord.xy),n=textureSize(uSrc,0)-1;
vec4 c=texelFetch(uSrc,p,0);
if(c.a<0.5){o=c;return;}
vec3 cH,cV,c1,corr;
FillW F=fillW(p,false,cH,cV,c1,corr);
float sw=F.wH+F.wV+F.w1+F.wI;
float k=(uStepDir.y>0.5?F.wH+0.5*F.w1:F.wV+0.5*F.w1)/sw;
float memb=uLast>0.5?0.6*smoothstep(60.0,110.0,F.dmin)*(1.0-clamp(c.a-1.0,0.0,1.0)):0.0;
if(k<0.03){o=vec4(mix(c.rgb,texture(uIso,vUv).rgb,memb),c.a);return;}
ivec2 st=ivec2(uStepDir);
vec3 c0=sqrt(max(c.rgb,0.0)),s=c.rgb;float w=1.0;
for(int i=1;i<=10;i++){
float g=exp(-float(i*i)/50.0);
for(int sg=-1;sg<=1;sg+=2){
vec4 t=texelFetch(uSrc,clamp(p+st*(i*sg*2),ivec2(0),n),0);
if(t.a<0.5)continue;
vec3 dc=sqrt(max(t.rgb,0.0))-c0;
float wk=g*exp(-dot(dc,dc)/0.012);
s+=t.rgb*wk;w+=wk;
}
}
o=vec4(mix(mix(c.rgb,s/w,clamp(k,0.0,1.0)),texture(uIso,vUv).rgb,memb),c.a);
}`,I0=b+U+`
in vec2 vUv;out vec4 o;
uniform sampler2D uNNF;uniform sampler2D uGuide;uniform sampler2D uSrc;uniform sampler2D uCur;
uniform sampler2D uL;uniform sampler2D uR;uniform sampler2D uD;uniform sampler2D uU;
uniform vec2 uFillRes;uniform float uJump;uniform float uSeed;uniform float uReset;uniform float uLambda;uniform float uCurOK;
const ivec2 PT[13]=ivec2[13](ivec2(0,0),ivec2(1,0),ivec2(-1,0),ivec2(0,1),ivec2(0,-1),ivec2(1,1),ivec2(-1,1),ivec2(1,-1),ivec2(-1,-1),ivec2(2,0),ivec2(-2,0),ivec2(0,2),ivec2(0,-2));
const float PW[13]=float[13](1.0,0.8,0.8,0.8,0.8,0.62,0.62,0.62,0.62,0.45,0.45,0.45,0.45);
vec3 T[13];float TW[13];vec3 GM,GX,GY;float DEEP;ivec2 N;vec2 NB[4];
vec3 srcAt(vec2 s){return texture(uSrc,(s+0.5)/uFillRes).rgb;}
float cost(vec2 s){
ivec2 i=ivec2(s);
if(i.x<2||i.y<2||i.x>N.x-3||i.y>N.y-3)return 1e4;
if(texelFetch(uGuide,i,0).a>-2.9)return 1e4;
float c=0.0,w=0.0;vec3 m=vec3(0.0),gx=vec3(0.0),gy=vec3(0.0),q2=vec3(0.0);
for(int k=0;k<13;k++){
vec3 S=sqrt(max(srcAt(s+vec2(PT[k])),0.0));vec3 d=T[k]-S;vec2 o=vec2(PT[k]);
c+=TW[k]*dot(d,d);w+=TW[k];
m+=S*PW[k];gx+=S*(PW[k]*o.x);gy+=S*(PW[k]*o.y);q2+=S*S*PW[k];
}
m/=8.48;gx/=7.68;gy/=7.68;
vec3 res=max(q2/8.48-m*m-(gx*gx+gy*gy)*(7.68/8.48),0.0);
vec3 dm=m-GM,dx=gx-GX,dy=gy-GY;
return c/max(w,1e-3)+uLambda*(dot(dm,dm)+0.6*(dot(dx,dx)+dot(dy,dy)))+(0.6+1.6*DEEP)*(res.x+res.y+res.z);
}
float coh(vec2 c){float k=0.0;for(int i=0;i<4;i++)k+=step(dot(abs(NB[i]-c),vec2(1.0)),0.5);return 1.0-0.14*k;}
void try1(vec2 c,inout vec2 best,inout float bc){c=floor(c+0.5);float cc=cost(c)*coh(c);if(cc<bc*0.985-1e-6){bc=cc;best=c;}}
void main(){
ivec2 p=ivec2(gl_FragCoord.xy);N=textureSize(uGuide,0);
vec4 g=texelFetch(uGuide,p,0);
if(g.a<0.5){o=vec4(vec2(p),0.0,0.0);return;}
GM=vec3(0.0);GX=vec3(0.0);GY=vec3(0.0);DEEP=0.0;
for(int k=0;k<13;k++){
ivec2 pk=clamp(p+PT[k],ivec2(0),N-1);
vec4 gk=texelFetch(uGuide,pk,0);
T[k]=sqrt(max(uCurOK>0.5||gk.a<0.5?texture(uCur,(vec2(pk)+0.5)/uFillRes).rgb:gk.rgb,0.0));
TW[k]=PW[k]*(gk.a<0.5?1.0:0.12);
vec3 gs=sqrt(max(gk.rgb,0.0));vec2 o=vec2(PT[k]);
GM+=gs*PW[k];GX+=gs*(PW[k]*o.x);GY+=gs*(PW[k]*o.y);DEEP+=gk.a<0.5?0.0:PW[k];
}
GM/=8.48;GX/=7.68;GY/=7.68;DEEP/=8.48;
for(int i=0;i<4;i++){
ivec2 e=i==0?ivec2(1,0):i==1?ivec2(-1,0):i==2?ivec2(0,1):ivec2(0,-1),qn=clamp(p+e,ivec2(0),N-1);
vec4 nq=texelFetch(uNNF,qn,0);
NB[i]=nq.a>0.5?nq.xy-vec2(e):vec2(-99.0);
}
vec4 cur=texelFetch(uNNF,p,0);
bool fresh=uReset>0.5||cur.a<0.5;
vec2 best=fresh?vec2(p):cur.xy;float bc=fresh?1e5:cost(best)*coh(best);
if(fresh||bc>9e3){
vec4 L=texelFetch(uL,p,0),R=texelFetch(uR,p,0),D=texelFetch(uD,p,0),U=texelFetch(uU,p,0);
if(L.a<4000.0)try1(vec2(p)-vec2(2.0*L.a+4.0,0.0),best,bc);
if(R.a<4000.0)try1(vec2(p)+vec2(2.0*R.a+4.0,0.0),best,bc);
if(D.a<4000.0)try1(vec2(p)-vec2(0.0,2.0*D.a+4.0),best,bc);
if(U.a<4000.0)try1(vec2(p)+vec2(0.0,2.0*U.a+4.0),best,bc);
}
int J=int(uJump);
for(int i=0;i<4;i++){
ivec2 of=(i==0?ivec2(1,0):i==1?ivec2(-1,0):i==2?ivec2(0,1):ivec2(0,-1))*J,qn=p+of;
if(qn.x<0||qn.y<0||qn.x>=N.x||qn.y>=N.y)continue;
vec4 nq=texelFetch(uNNF,qn,0);
if(nq.a<0.5)continue;
try1(nq.xy-vec2(of),best,bc);
}
float r=float(max(N.x,N.y))*0.5;
for(int i=0;i<4;i++){
vec2 h=hash22(vec2(p)*vec2(0.731,1.137)+vec2(uSeed*17.13+float(i)*3.7,uSeed*5.31))-0.5;
try1(best+h*2.0*r,best,bc);
r*=0.33;
}
o=vec4(best,bc,1.0);
}`,K0=b+U+`
in vec2 vUv;out vec4 o;
uniform sampler2D uRoom;uniform sampler2D uFill;uniform sampler2D uNNF;uniform sampler2D uPrevF;uniform sampler2D uLow;
uniform sampler2D uL;uniform sampler2D uR;uniform sampler2D uD;uniform sampler2D uU;uniform vec2 uFillRes;uniform float uBlend;
vec3 lowAt(vec2 uv){vec4 l=texture(uLow,uv);return l.a>1e-4?l.rgb/l.a:vec3(0.0);}
void main(){
vec4 rp=texture(uRoom,vUv);
vec4 Fl=texture(uFill,vUv);
vec3 fc=Fl.rgb;float sd=Fl.a,unk=0.0;
if(sd>0.0){
ivec2 N=textureSize(uNNF,0);
vec2 f=vUv*uFillRes-0.5;ivec2 b=ivec2(floor(f+0.5));
vec3 acc=vec3(0.0),accL=vec3(0.0);float ws=0.0,cs=0.0;
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
ivec2 P=clamp(b+ivec2(i,j),ivec2(0),N-1);
vec4 nn=texelFetch(uNNF,P,0);
if(nn.a<0.5 || nn.b>100.0)continue;
vec2 dd=vec2(P)-f;
float w=exp(-dot(dd,dd)*1.2)/(nn.b+0.003);
vec2 su=vUv+(nn.xy-vec2(P))/uFillRes;
acc+=texture(uRoom,su).rgb*w;accL+=lowAt(su)*w;ws+=w;cs+=nn.b*w;
}
ivec2 fp=clamp(ivec2(vUv*uFillRes),ivec2(0),N-1);
float dmin=min(min(texelFetch(uL,fp,0).a,texelFetch(uR,fp,0).a),min(texelFetch(uD,fp,0).a,texelFetch(uU,fp,0).a));
unk=max(smoothstep(4.0,30.0,dmin)*(1.0-0.85*clamp(sd-1.0,0.0,1.0)),smoothstep(0.03,0.09,ws>0.0?cs/ws:1.0)*smoothstep(2.0,10.0,dmin));
if(ws>0.0){
vec3 syn=acc/ws,synL=accL/ws;
vec3 det=sqrt(max(fc,0.0))+clamp(sqrt(max(syn,0.0))-sqrt(max(synL,0.0)),-0.045,0.045);
fc=mix(syn,max(det,0.0)*max(det,0.0),smoothstep(0.2,0.7,unk));
}
}
float pw=smoothstep(0.55,0.9,rp.a)*(1.0-smoothstep(-1.2,0.4,sd));
vec3 col=mix(fc,rp.rgb,pw);
if(sd>0.0){vec4 pv=texture(uPrevF,vUv);col=mix(pv.rgb,col,uBlend);unk=mix(pv.a,unk,uBlend);}
o=vec4(col,unk);
}`,G0=b+U+`
in vec2 vUv;out vec4 o;
uniform sampler2D uRoom;uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uMaskD;
uniform sampler2D uProt;uniform vec2 uTex;uniform float uLive;
void main(){
vec4 pl=texture(uRoom,vUv);
float wp=smoothstep(0.86,0.97,pl.a);
vec3 T=pl.rgb*wp;float w=wp;
if(uLive>0.5){
float m=max(texture(uMask,vUv).r,texture(uMaskD,vUv).r);
vec4 P=texture(uProt,vUv);
float wl=(1.0-smoothstep(0.02,0.08,m))*smoothstep(0.012,0.03,P.r)*(1.0-smoothstep(0.03,0.15,P.g))*0.8;
if(wl>0.001){
vec2 e=uTex*0.5;
vec3 b=0.25*(texture(uBase,vUv+e).rgb+texture(uBase,vUv-e).rgb+texture(uBase,vUv+vec2(e.x,-e.y)).rgb+texture(uBase,vUv+vec2(-e.x,e.y)).rgb);
T+=b*wl;w+=wl;
}
}
o=w>1e-4?vec4(T/w*min(w,1.0),min(w,1.0)):vec4(0.0);
}`,X0=b+`
in vec2 vUv;out vec4 o;
uniform sampler2D uRoomF;uniform sampler2D uTrust;uniform vec2 uTex;
void main(){
vec3 rf=texture(uRoomF,vUv).rgb;
vec4 t=texture(uTrust,vUv);
vec3 D=t.rgb-rf*t.a;float w=t.a;
if(t.a<0.5){
vec4 sT=vec4(0.0);
for(int k=0;k<8;k++){float a=float(k)*0.785398;sT+=texture(uTrust,vUv+vec2(cos(a),sin(a))*uTex*1.6);}
if(sT.a>0.4){float k=0.85*(1.0-t.a)*smoothstep(0.4,2.0,sT.a);D+=(sT.rgb/sT.a-rf)*k;w+=k;}
}
o=w>1.0?vec4(D/w,1.0):vec4(D,w);
}`,Y0=b+U+xe+`
in vec2 vUv;out vec4 o;
uniform sampler2D uPrev;uniform sampler2D uFlow;uniform sampler2D uField;uniform sampler2D uMask;uniform sampler2D uMaskD;
uniform sampler2D uNoiseA;uniform sampler2D uRoomF;uniform sampler2D uNoiseC;uniform sampler2D uProt;
uniform float uDt;uniform float uAspect;uniform float uTau;uniform float uMode;uniform float uDecay;uniform float uReset;uniform float uTime;
uniform vec3 uWind;uniform vec4 uForce[2];uniform vec4 uForceP[2];uniform float uLive;
void main(){
if(uReset>0.5){o=vec4(0.0);return;}
vec2 q=vec2(vUv.x*uAspect,vUv.y);
vec2 v=texture(uFlow,vUv).rg*0.5+uWind.xy*0.8+vec2(0.0,0.07);
for(int k=0;k<2;k++){
if(uForceP[k].y<0.001)continue;
vec2 d=q-uForce[k].xy;float r=uForceP[k].x*1.3;
v+=uForce[k].zw*exp(-dot(d,d)/(r*r))*uForceP[k].y*1.2;
}
vec2 src=vUv-v*vec2(1.0/uAspect,1.0)*uDt,tx=1.5/vec2(textureSize(uPrev,0));
float c0=texture(uPrev,src).r;
float c4=0.25*(texture(uPrev,src+vec2(tx.x,0.0)).r+texture(uPrev,src-vec2(tx.x,0.0)).r+texture(uPrev,src+vec2(0.0,tx.y)).r+texture(uPrev,src-vec2(0.0,tx.y)).r);
float D=mix(c0,c4,0.4)*exp(-uDt*uDecay);
if(uMode>0.5 && uMode<1.5){
vec4 F=fieldAt(uField,vUv);
float m=texture(uMask,vUv).r,mb=texture(uMaskD,vUv).b;
if(F.r<1000.0 && max(m,mb)>0.05){
float s=uTau-F.r-F.a-EDGE_AMP*texture(uNoiseA,vUv).r;
float pr=protLo(texture(uProt,vUv).r),qu=quietOf(F.a),mm=smoothstep(0.2,0.6,m)*(1.0-pr);
float unk=texture(uRoomF,vUv).a*uLive;
vec2 dr=(uWind.xy*0.3+vec2(0.0,0.1))*uTime;
float puff=smoothstep(-0.2,0.5,texture(uNoiseC,q*0.8-dr*0.6).r*0.8+texture(uNoiseC,q*1.9-dr+vec2(0.3,0.6)).g*0.45);
float line=smoothstep(-0.03,0.03,s)*(1.0-smoothstep(0.08,0.45,s))*mm;
D+=line*uDt*mix(0.8+3.4*unk,0.5,qu)*(0.25+1.5*puff);
float sm=smoothstep(0.35,0.85,unk)*smoothstep(0.2,0.9,s)*(1.0-smoothstep(7.0,10.0,s))*(1.0-pr)*(1.0-qu)*(1.0-smoothstep(0.02,0.3,F.b))*smoothstep(0.05,0.35,max(m,mb));
D+=uDt*0.75*sm*(0.15+1.6*puff*puff);
}
}
o=vec4(min(D,1.4),0.0,0.0,1.0);
}`,j0=b+U+`
in vec2 vUv;out vec4 o;
uniform sampler2D uSmoke;uniform sampler2D uAmb;uniform sampler2D uAmbG;uniform sampler2D uNoiseC;
uniform float uAspect;uniform float uTime;uniform vec3 uWind;
void main(){
float D=texture(uSmoke,vUv).r;
if(D<0.003){o=vec4(0.0);return;}
vec2 q=vec2(vUv.x*uAspect,vUv.y),tx=1.0/vec2(textureSize(uSmoke,0));
vec2 dr=(uWind.xy*0.3+vec2(0.0,0.08))*uTime;
float n1=texture(uNoiseC,q*0.6-dr*0.5).r,n2=texture(uNoiseC,q*1.4-dr*0.85+vec2(0.31,0.17)).g,n3=texture(uNoiseC,q*3.2-dr*1.3+vec2(0.6,0.2)).b;
float det=0.2+1.7*smoothstep(-0.4,0.5,n1*0.95+n2*0.55+n3*0.3);
float dens=D*det;
float sh=0.0;
for(int i=1;i<=2;i++)sh+=texture(uSmoke,vUv+vec2(tx.x*0.8*float(i),tx.y*4.0*float(i))).r;
float trans=exp(-sh*1.2*det);
float gy=texture(uSmoke,vUv+vec2(0.0,tx.y*1.5)).r-texture(uSmoke,vUv-vec2(0.0,tx.y*1.5)).r;
float top=clamp(0.5-gy*4.0+0.25*n2,0.0,1.0);
vec3 amb=texture(uAmb,vUv).rgb;vec4 ag=texture(uAmbG,vec2(0.5));
vec3 ambG=ag.a>1e-4?ag.rgb/ag.a:amb;
float LA=luma(ambG);
vec3 lit=vec3(0.33,0.31,0.29)*LA*(0.22+0.78*trans)*(0.6+0.8*top)+mix(amb,vec3(luma(amb)),0.6)*0.07;
o=vec4(lit,clamp(1.0-exp(-dens*1.9),0.0,0.82));
}`,Q0=b+xe+`
out vec4 o;
uniform sampler2D uField;uniform sampler2D uMask;uniform sampler2D uMaskD;uniform sampler2D uRoom;uniform sampler2D uBase;uniform sampler2D uProt;
uniform vec2 uRes;uniform float uTau;
void main(){
ivec2 b=ivec2(gl_FragCoord.xy)*16;
float mt=0.0,pc=0.0,cc=0.0,pk=0.0,ds=0.0,dn=0.0;
for(int j=0;j<16;j+=4)for(int i=0;i<16;i+=4){
ivec2 p=min(b+ivec2(i,j),ivec2(uRes)-1);
vec2 uv=(vec2(p)+0.5)/uRes;
vec4 F=texelFetch(uField,p,0);
float m=texture(uMask,uv).r;
vec4 rp=texture(uRoom,uv);
if(m>0.35 && protLo(texelFetch(uProt,p,0).r)<0.5){
pc+=1.0;
if(rp.a>0.85)pk+=1.0;
if(F.r<1000.0 && uTau-F.r-F.a>0.0){cc+=1.0;if(F.a<0.3)mt=max(mt,F.r+F.a);}
}
if(rp.a>0.8 && texture(uMaskD,uv).g<0.02 && F.b<0.01){vec3 c=texture(uBase,uv).rgb;ds+=length(sqrt(max(c,0.0))-sqrt(max(rp.rgb,0.0)));dn+=1.0;}
}
o=vec4(mt,pc,cc+32.0*pk,dn>0.0?2.0+ds/dn:0.0);
}`,J0=b+xe+`
out vec4 o;
uniform sampler2D uSrc;uniform sampler2D uMask;uniform sampler2D uField;
uniform vec4 uProbe[2];uniform vec4 uProbeAx[2];uniform float uTau;
void main(){
int x=int(gl_FragCoord.x);
if(x==3){
ivec2 n=textureSize(uSrc,0);
float ds=0.0,dn=0.0,pc=0.0,pk=0.0;
for(int y=0;y<n.y;y++)for(int i=0;i<n.x;i++){vec4 t=texelFetch(uSrc,ivec2(i,y),0);if(t.a>=2.0){ds+=t.a-2.0;dn+=1.0;}pc+=t.g;pk+=floor(t.b/32.0+0.01);}
o=vec4(dn>0.0?clamp(ds/dn,0.0,1.0):0.0,clamp(dn/float(n.x*n.y),0.0,1.0),pc>0.0?pk/pc:0.0,1.0);
return;
}
if(x==0){
ivec2 n=textureSize(uSrc,0);
float mt=0.0,pc=0.0,cc=0.0;
for(int y=0;y<n.y;y++)for(int i=0;i<n.x;i++){vec4 s=texelFetch(uSrc,ivec2(i,y),0);mt=max(mt,s.r);pc+=s.g;cc+=s.b-32.0*floor(s.b/32.0+0.01);}
float v=floor(clamp(mt/128.0,0.0,1.0)*65535.0);
o=vec4(floor(v/256.0)/255.0,mod(v,256.0)/255.0,pc>0.0?cc/pc:0.0,clamp(pc/float(n.x*n.y*16),0.0,1.0));
return;
}
vec4 P=uProbe[x-1],A=uProbeAx[x-1];
if(P.w<0.5){o=vec4(1.0,0.5,0.5,0.0);return;}
float sz=P.z,asp=A.z;
vec2 best=vec2(0.0);float br=-1.0;
for(int ri=0;ri<6;ri++){
float r=ri==0?0.7:ri==1?0.95:ri==2?1.25:ri==3?1.55:ri==4?1.9:2.25;
vec2 sum=vec2(0.0);float cnt=0.0;
for(int i=0;i<16;i++){
float a=float(i)*0.392699+float(ri)*0.19;
vec2 dir=vec2(cos(a),sin(a));
if(dot(dir,-A.xy)>0.6)continue;
vec2 off=dir*r*sz,uv=P.xy+off/vec2(asp,1.0);
if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0)continue;
if(texture(uMask,uv).r<0.5)continue;
vec4 F=texture(uField,uv);
if(F.b>0.02)continue;
if(F.r<1000.0 && uTau-F.r-F.a>-0.05)continue;
sum+=off;cnt+=1.0;
}
if(cnt>0.0){best=sum/cnt;br=r;break;}
}
o=br<0.0?vec4(1.0,0.5,0.5,0.0):vec4(br/2.5,clamp(0.5+best.x/(5.0*sz),0.0,1.0),clamp(0.5+best.y/(5.0*sz),0.0,1.0),1.0);
}`,Z0=b+U+xe+o0+`
in vec2 vUv;out vec4 o;
uniform sampler2D uBase;uniform sampler2D uPrev;uniform vec2 uTex;uniform float uAspect;uniform float uDt;uniform float uMem;uniform float uTime;
uniform vec4 uHandS[2];uniform vec4 uHandS2[2];uniform vec4 uArm[2];uniform vec4 uArmP[2];
float skinSim(vec3 c,vec3 ref,float loose){
float lc=dot(c,vec3(0.3333)),lr=dot(ref,vec3(0.3333));
float cs=1.0-smoothstep(mix(0.08,0.15,loose),mix(0.24,0.38,loose),length(c/max(lc,1e-4)-ref/max(lr,1e-4)));
float ls=1.0-smoothstep(mix(0.8,1.3,loose),mix(1.7,2.6,loose),abs(log2(max(lc,1e-4)/max(lr,1e-4))));
return cs*ls;
}
vec3 tap4(vec2 uv,float r){
vec2 e=uTex*r;
return 0.25*(texture(uBase,uv+e).rgb+texture(uBase,uv-e).rgb+texture(uBase,uv+vec2(e.x,-e.y)).rgb+texture(uBase,uv+vec2(-e.x,e.y)).rgb);
}
void main(){
vec2 uv=vUv,q=vec2(uv.x*uAspect,uv.y);
float best=0.06,wrist=0.0,armM=0.0;
vec3 c=vec3(0.0);bool cs=false;
for(int h=0;h<2;h++){
float w=h==0?uHandW.x:uHandW.y;if(w<0.01)continue;
float sz=h==0?uHandW.z:uHandW.w,infl=h==0?uHandR.z:uHandR.w,reach=(h==0?uHandR.x:uHandR.y)+infl;
vec2 w0=uHand[h*21].xy,m9=uHand[h*21+9].xy;
if(length(q-(w0+m9)*0.5)<sz*3.0+reach){
vec2 d2=handSDF2(q,h,sz)-infl/sz;
float d=min(d2.x,d2.y);
vec2 wa=uWrist[h].xy,wb=uWrist[h].zw,wm=(wa+wb)*0.5,wt=(wb-wa)/max(length(wb-wa),1e-6),wn=vec2(-wt.y,wt.x);
if(dot(wn,m9-wm)<0.0)wn=-wn;
float lw=dot(q-wm,wt)/sz,tw=dot(q-wm,wn)/sz;
float dE=1e3;
for(int f=0;f<5;f++){
int ia=h*21+f*4+3;vec2 A=uHand[ia].xy,B=uHand[ia+1].xy,e=(B-A)/max(length(B-A),1e-6);
dE=min(dE,capT(q,B,B+e*0.3*sz,0.1*sz,0.08*sz));
}
dE=dE/sz-infl/sz;
if(min(d,dE)<0.2 && d2.x>-0.07){
if(!cs){c=tap4(uv,0.35);cs=true;}
vec3 r1=tap4(uHandS[h].zw,1.0),r2=tap4(uHandS2[h].xy,1.0),r3=tap4(uHandS2[h].zw,1.0);
float sim=max(skinSim(c,r1,0.0),max(skinSim(c,r2,0.0),skinSim(c,r3,0.0)));
float simL=max(skinSim(c,r1,1.0),max(skinSim(c,r2,1.0),skinSim(c,r3,1.0)));
d=min(min(d2.x,d2.y+0.25*(1.0-sim*sim)),dE+0.35*(1.0-smoothstep(0.55,0.85,sim)));
d-=0.1*sim*sim*(1.0-smoothstep(0.06,0.2,abs(d)))*smoothstep(0.02,0.14,tw);
d+=0.03*(1.0-simL)*(1.0-smoothstep(0.0,0.03,-d))*(1.0-smoothstep(0.02,0.08,d));
}
float nearCut=(1.0-smoothstep(0.1,0.3,abs(tw)))*(1.0-smoothstep(0.32,0.6,abs(lw)));
if(nearCut>0.0)d+=0.085*nearCut*(snoise(vec3(lw*3.3+float(h)*5.3,1.7,uTime*0.12))*0.65+snoise(vec3(lw*9.0,4.1,uTime*0.3))*0.35);
d+=(1.0-w)*0.6;
best=min(best,d*sz);
float dw=segDist(q,uWrist[h].xy,uWrist[h].zw)/sz;
wrist=max(wrist,(1.0-smoothstep(0.08,0.32,dw))*uHandS[h].y*w);
}
float wa=uArmP[h].y*uArmP[h].z;
if(wa>0.01){
float az=uArmP[h].x;vec2 dq=q-uArm[h].xy,ax=uArm[h].zw;
float t=dot(dq,ax),l=abs(dot(dq,vec2(-ax.y,ax.x)));
float r=0.36*az+0.07*max(t,0.0);
float inA=(1.0-smoothstep(r,r+0.3*az,l))*smoothstep(0.0,0.2*az,t)*(1.0-smoothstep(3.6*az,4.4*az,t));
if(inA>0.01){
vec3 ca=tap4(uv,1.1);
vec3 r1=tap4(uHandS[h].zw,1.5),r2=tap4(uHandS2[h].xy,1.5);
float sim=max(skinSim(ca,r1,1.0),skinSim(ca,r2,1.0));
armM=max(armM,inA*wa*smoothstep(0.1,0.45,sim));
}
}
}
if(uMem>0.5)best=min(best,texture(uPrev,uv).r+uDt*0.5);
o=vec4(clamp(best,-0.06,0.06),armM,wrist,1.0);
}`,$0=b+U+xe+`
in vec2 vUv;out vec4 o;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uMaskD;uniform sampler2D uField;
uniform sampler2D uLight;uniform sampler2D uNormals;uniform sampler2D uNoiseA;uniform sampler2D uRoomF;
uniform sampler2D uSmoke;uniform sampler2D uVeil;uniform sampler2D uProt;uniform sampler2D uCorr;
uniform float uTau;uniform float uTime;uniform float uAspect;uniform float uReform;
uniform float uActive;uniform float uFx;uniform vec2 uRes;uniform vec3 uLightColor;uniform float uDebug;
uniform float uSmokeOn;
uniform vec4 uHandC[2];uniform vec4 uHandK[2];
uniform vec4 uSpark[2];uniform vec4 uSparkC[2];uniform vec4 uFlare[2];
uniform vec2 uCamRes;uniform float uNoiseAmp;uniform float uSrcFrame;uniform vec2 uFieldRes;
uniform sampler2D uGuideT;uniform sampler2D uNNF;
vec3 sensorNoise(vec2 uv){
vec2 g=uv*uCamRes,i=floor(g),f=fract(g);f=f*f*(3.0-2.0*f);
vec2 o=vec2(fract(uSrcFrame*0.1307)*517.0,fract(uSrcFrame*0.0731)*311.0);
vec3 a=hash33(vec3(i+o,1.0)),b=hash33(vec3(i+o+vec2(1.0,0.0),1.0)),c=hash33(vec3(i+o+vec2(0.0,1.0),1.0)),d=hash33(vec3(i+o+vec2(1.0,1.0),1.0));
vec3 n=mix(mix(a,b,f.x),mix(c,d,f.x),f.y)-0.5;
return vec3(n.x)*1.6+(n-n.x)*0.5;
}
vec2 bez(vec2 a,vec2 c,vec2 b,float t){float s=1.0-t;return s*s*a+2.0*s*t*c+t*t*b;}
vec3 palmFx(vec2 q){
vec3 e=vec3(0.0);
for(int h=0;h<2;h++){
vec4 C=uHandC[h];
float c=C.w,sz=C.z;
if(c>0.01){
vec2 dq=q-C.xy;float r2=dot(dq,dq);
if(r2<sz*sz*2.4 ||(dq.y>0.0 && dq.y<sz*1.6 && abs(dq.x)<sz*0.9)){
for(int i=0;i<14;i++){
float fi=float(i)+float(h)*23.0;
float h1=hash11(fi*1.37+0.1),h2=hash11(fi*2.91+0.7),h3=hash11(fi*4.17+0.3),h4=hash11(fi*5.31+0.9);
float per=0.5+0.5*h2,ph=fract(uTime/per+h1),life=1.0-ph;
float on=smoothstep(float(i)/14.0,float(i)/14.0+0.1,c*1.1);
if(on<0.01)continue;
vec2 v=vec2((h4-0.5)*0.35,0.55+0.55*h3)*sz;
vec2 P=C.xy+vec2(h3-0.5,h4-0.5)*sz*0.42+v*ph*per+vec2(sin(ph*per*8.0+fi)*0.05*sz,0.0);
float d=segDist(q,P-v*0.03,P);
float tw=0.7+0.3*sin(uTime*(19.0+13.0*h2)+fi*3.1);
e+=blackbody(0.24+0.42*life*life)*exp(-d*d/(2.2e-6+1.6e-6*h2))*life*life*tw*on*(5.0+5.0*h2);
}
float core=exp(-r2/(sz*sz*0.0016))*c*c,halo=exp(-r2/(sz*sz*0.03))*c*c;
e+=blackbody(0.3+0.55*c)*core*7.0+blackbody(0.22)*halo*0.35;
}
}
vec4 SC=uSparkC[h];
if(SC.w>0.01){
vec2 a=uSpark[h].xy,b=uSpark[h].zw,cc=SC.xy,ab=b-a;
float len=max(length(ab),1e-4);
vec2 nrm=vec2(-ab.y,ab.x)/len;
float u0=dot(q-a,ab)/(len*len),off=abs(dot(q-a,nrm));
if(u0>-0.35 && u0<1.35 && off<len*0.7+0.05){
float head=SC.z,t0=max(head-0.22,0.0),tr=0.0,trK=0.0;
vec2 pp=bez(a,cc,b,t0);
for(int i=1;i<=10;i++){
float k=float(i)/10.0;
vec2 P=bez(a,cc,b,mix(t0,head,k));
float dd=segDist(q,pp,P),wd=mix(0.0007,0.0024,k);
float g=exp(-dd*dd/(wd*wd))*k*k;
if(g>tr){tr=g;trK=k;}
pp=P;
}
vec2 H=bez(a,cc,b,head),hd=q-H;float hr=dot(hd,hd);
float fl=0.8+0.2*sin(uTime*53.0+float(h)*2.0);
e+=(blackbody(0.32+0.5*trK)*tr*4.5+blackbody(0.93)*(exp(-hr/5.0e-6)*10.0+exp(-hr/1.0e-4)*1.3)*fl)*SC.w;
for(int i=0;i<8;i++){
float fi=float(i)+float(h)*11.0,tt=head-0.05-0.065*float(i);
if(tt<0.0)break;
vec2 P=bez(a,cc,b,tt)+nrm*(hash11(fi*3.1)-0.5)*0.004*float(i+1)-vec2(0.0,0.0007*float(i*i));
vec2 sd=q-P;float tw=0.5+0.5*sin(uTime*47.0+fi*7.0);
e+=blackbody(0.62-0.03*float(i))*exp(-dot(sd,sd)/1.6e-6)*2.6*tw*SC.w*(1.0-float(i)/8.0);
}
}
}
vec4 FL=uFlare[h];
if(FL.z>0.01){vec2 d=q-FL.xy;float r2=dot(d,d);e+=blackbody(0.72)*FL.z*(exp(-r2/1.4e-5)*6.0+exp(-sqrt(r2)/0.022)*0.55);}
}
return e;
}
void main(){
vec2 uv=vUv;vec2 q=vec2(uv.x*uAspect,uv.y);
float px=1.0/uRes.y;
vec4 F=uActive>0.5||uDebug>0.5?fieldAt(uField,uv):vec4(UNREACHED,1.0,0.0,0.0);
float m=texture(uMask,uv).r;
vec4 Lt=uFx>0.5?texture(uLight,uv):vec4(0.0);
float L=Lt.r;
vec2 hz=vec2(0.0);
if(L>0.01){
float ha=Lt.a*4.0;
hz=vec2(cos(ha),sin(ha))*abs(Lt.a)*0.0024*min(L,1.2)*(1.0-uReform*0.6);
}
for(int h=0;h<2;h++){
vec4 C=uHandC[h];
if(C.w>0.05){
vec2 dq=q-C.xy;float r2=dot(dq,dq)/(C.z*C.z);
if(r2<2.0){float ph=uTime*9.0+dot(q,vec2(41.0,57.0));hz+=vec2(sin(ph),cos(ph*1.13))*0.0016*C.w*exp(-r2*1.5);}
}
}
vec3 base=texture(uBase,uv+hz).rgb;
vec4 PR=texture(uProt,uv);
if(PR.r<0.02 || PR.g>0.004 || PR.b>0.004){
vec2 pt=0.5/uFieldRes;
PR=0.25*(texture(uProt,uv+pt)+texture(uProt,uv-pt)+texture(uProt,uv+vec2(pt.x,-pt.y))+texture(uProt,uv+vec2(-pt.x,pt.y)));
}
float prot=1.0-smoothstep(-1.2*px,1.2*px,PR.r);
if(uActive>0.5)m=max(m,smoothstep(0.3,0.75,PR.g)*(1.0-prot));
float stump=PR.b*(1.0-smoothstep(0.0,0.035,PR.r))*step(-0.004,PR.r);
float s=-10.0,d=1.0,gone=0.0,quiet=0.0,brk=0.5;
vec4 nA=vec4(0.0);
if(uActive>0.5){
nA=texture(uNoiseA,uv);
float en=EDGE_AMP*nA.r;
s=F.r<1000.0?uTau-F.r-F.a-en-0.5*stump:-10.0;
quiet=quietOf(F.a);
float fw=max(fwidth(s),1e-5);
float sharp=clamp(0.5+s/min(fw,0.05),0.0,1.0);
gone=s>-0.5?mix(mix(sharp,smoothstep(0.0,0.07,s),uReform),smoothstep(-0.08,0.22,s),quiet):0.0;
float gn=fwidth(en)/px;
d=mix(max(-s,0.0),abs(s-0.035),uReform)/sqrt(1.0/max(F.g*F.g,1e-6)+gn*gn);
}
bool band=uActive>0.5 && s>-0.9 && s<1.6 && quiet<0.995;
float mG=smoothstep(0.03,0.42,m);
vec4 mD3=s>0.0||uDebug>0.5?texture(uMaskD,uv):vec4(0.0);
float hole=gone*max(mG,max(smoothstep(0.03,0.55,mD3.r),smoothstep(0.22,0.8,mD3.a)));
vec3 lc=uLightColor;
vec3 room=base;
if(hole>0.001){
room=max(texture(uRoomF,uv+hz*1.3).rgb+texture(uCorr,uv).rgb,0.0);
if(uNoiseAmp>0.0){vec3 r=sqrt(max(room,0.0))+sensorNoise(uv)*uNoiseAmp;room=r*r;}
}
float mE=smoothstep(0.22,0.65,m);
float mP=smoothstep(0.08,0.55,m);
float hot=1.0-uReform;
vec3 person=base;
vec3 emit=vec3(0.0);
if(band){
float alive=(1.0-gone)*(1.0-quiet);
float flick=0.72+0.56*texture(uNoiseA,uv*1.7+vec2(uTime*0.037,-uTime*0.051)).b;
brk=smoothstep(-0.3,0.6,texture(uNoiseA,uv*0.8+vec2(uTime*0.019,-uTime*0.013)).a);
float core=exp(-d/0.0016)*(0.3+1.05*brk),glow=exp(-d/0.0055)*(0.5+0.6*brk),deep=exp(-d/0.008);
float charN=0.75+0.25*nA.a;
person*=mix(vec3(1.0),vec3(1.05,0.93,0.84),exp(-d/0.014)*alive*hot*0.55);
float scorch=exp(-d/max(0.0075,px*3.0))*alive*hot*charN;
person=mix(person,person*vec3(0.2,0.12,0.07)+vec3(0.004,0.002,0.001),scorch*0.94);
float crack=(1.0-smoothstep(0.0,0.06,nA.g))*(1.0-smoothstep(0.006,0.03,d))*alive*hot;
person=mix(person,person*0.2,crack*0.8);
float smoulder=pow(clamp(0.5+0.5*texture(uNoiseA,uv*2.4+vec2(-uTime*0.013,uTime*0.019)).b,0.0,1.0),5.0)*scorch;
vec3 hotC=blackbody(0.3+0.5*core)*(core*4.5+glow*1.15)*flick
+blackbody(0.16)*deep*0.26*charN*flick
+blackbody(0.42)*(smoulder*2.0+crack*exp(-d/0.0035)*1.1*flick);
vec3 coolC=vec3(0.55,0.8,1.0)*(core*2.4+glow*0.16)*(0.8+0.4*flick);
emit=mix(hotC,coolC,uReform)*mE*alive;
}
vec3 keep=base;
if(L>0.002){
vec3 N=texture(uNormals,uv).xyz*2.0-1.0;
vec3 Ld=normalize(vec3(Lt.g*7.0,Lt.b*7.0,0.5));
float ndl=clamp(dot(N,Ld),0.0,1.0);
vec3 lit=base*lc*L*(0.15+0.85*ndl)*0.6*(1.0-0.65*uReform);
person+=lit;keep+=lit;
}
vec3 rimE=vec3(0.0);
if(uActive>0.5 && PR.b>0.01 && PR.r>-0.02 && PR.r<0.03){
int hn=length(q-uHandK[0].xy)<length(q-uHandK[1].xy)?0:1;
float sz=uHandC[hn].z;vec2 w0=uHandK[hn].xy,ax=uHandK[hn].zw;
vec2 buv=uv-vec2(ax.x/uAspect,ax.y)*0.12*sz;
vec4 Fb=fieldAt(uField,buv);
float burnt=Fb.r<1000.0?smoothstep(0.02,0.25,uTau-Fb.r-Fb.a-0.5*PR.b):0.0;
float dpx=PR.r/px,l=dot(q-w0,vec2(-ax.y,ax.x))/sz;
float k=PR.b*burnt;
float fl=smoothstep(-0.25,0.55,texture(uNoiseA,vec2(l*0.55+uTime*0.02,0.37)).r)*(0.7+0.3*texture(uNoiseA,vec2(l*2.3,uTime*0.17)).b);
float cw=4.0+5.0*fl,charB=(1.0-smoothstep(0.0,cw,-dpx))*step(dpx,1.0)*k;
keep=mix(keep,keep*vec3(0.36,0.22,0.13)+vec3(0.003,0.0015,0.0008),charB*charB*0.85*(1.0-uReform));
float line=exp(-(dpx+0.8)*(dpx+0.8)/3.0)*smoothstep(0.2,0.55,fl)*k;
float sp=0.0;
if(k>0.01 && dpx>-2.0 && dpx<60.0){
float al=l*sz/px;
for(int i=0;i<2;i++){
float cw=13.0+9.0*float(i),ci=floor(al/cw+float(i)*0.37);
float hs=hash11(ci*7.13+float(i)*31.7+float(hn)*3.1);
if(hs<0.55){
float ph=fract(uTime*(0.5+0.6*hs)+hs*7.0);
vec2 c=vec2((ci+0.2+0.6*hash11(ci*3.7+float(i)))*cw+sin(ph*6.0+hs*20.0)*3.0*ph,ph*ph*48.0+1.0);
vec2 dd=vec2(al,dpx)-c;
sp+=exp(-dot(dd,dd)/2.0)*(1.0-ph)*(0.55+0.45*sin(uTime*40.0+hs*50.0));
}
}
}
vec3 hotR=blackbody(0.4+0.25*fl)*line*(1.2+4.5*fl)+blackbody(0.3)*charB*charB*0.25*fl+blackbody(0.55)*sp*k*4.0;
rimE=mix(hotR,vec3(0.55,0.8,1.0)*line*(0.3+0.8*fl),uReform);
}
vec3 bg=base*(1.0+lc*L*0.28);
room*=1.0+lc*L*0.38*(1.0-0.75*uReform);
vec3 col=mix(mix(mix(bg,person,mP),room,hole),keep,prot);
if(uSmokeOn>0.5){
vec4 V=texture(uVeil,uv+hz);
float protIn=1.0-smoothstep(-0.012,-0.004,PR.r);
if(V.a>0.002)col=mix(col,V.rgb+lc*L*0.35,V.a*(1.0-0.75*protIn)*0.8*(1.0-0.9*uReform*(1.0-hole)));
}
col+=emit*(1.0-hole*0.9)*(1.0-prot)+rimE;
col+=palmFx(q);
if(uDebug>0.5)col=uDebug<1.5?max(texture(uRoomF,uv).rgb+texture(uCorr,uv).rgb,0.0):uDebug<2.5?vec3(texture(uRoomF,uv).rgb*0.5+vec3(mD3.g,F.b,0.0)*0.5):uDebug<3.5?vec3(gone,prot,hole):
uDebug<4.5?vec3(F.r<1000.0?fract(F.r):0.0,F.r>=1000.0?0.3:clamp(0.5+(uTau-F.r)*0.5,0.0,1.0),F.b):uDebug<5.5?vec3(texture(uSmoke,uv).r,texture(uRoomF,uv).a,quiet):
uDebug<6.5?vec3(prot,PR.g,PR.b)*0.7+base*0.3:uDebug<7.5?(fract(uTime*0.5)<0.5?texture(uGuideT,uv).rgb:(texture(uGuideT,uv).a>0.5?vec3(1.0-clamp(texture(uGuideT,uv).a-1.0,0.0,1.0),clamp(texture(uGuideT,uv).a-1.0,0.0,1.0),0.0):vec3(0.0,0.0,0.4))):
vec3(clamp(texture(uNNF,uv).b*20.0,0.0,1.0),texture(uNNF,uv).a*0.5,texture(uGuideT,uv).a<-2.9?0.6:0.0);
o=vec4(max(col,0.0),1.0);
}`,a0=`
vec4 hash44(vec4 p4){ p4=fract(p4*vec4(.1031,.1030,.0973,.1099)); p4+=dot(p4,p4.wzxy+33.33); return fract((p4.xxyz+p4.yzzw)*p4.zywx); }
struct Seed { vec2 home; vec2 cell; float kind; float life; float h2; float h3; float hs; float hg; };
Seed seedOf(int id, vec2 grid){
  Seed S;
  int gw=int(grid.x);
  S.cell=vec2(float(id-(id/gw)*gw),float(id/gw));
  vec2 j=hash22(S.cell*vec2(0.731,1.137)+vec2(3.1,7.7));
  S.home=(S.cell+0.12+0.76*j)/grid;
  float h1=hash12(S.cell+vec2(0.37,11.3));
  S.h2=hash12(S.cell*1.31+vec2(5.2,1.9));
  S.h3=hash12(S.cell*0.71+vec2(9.7,4.4));
  S.hs=hash12(S.cell*0.913+vec2(2.3,8.1));                  // piece size
  S.hg=hash12(floor(S.cell/3.0)*1.17+vec2(4.4,0.9));        // the small sheet (3x3 cells) it leaves with
  // 0 = piece of the person crumbling to fine ash, 1 = tumbling chunk, 2 = ember, 3 = smoke wisp
  S.kind=h1<0.005?2.0:(h1<0.03?3.0:(h1<0.055?1.0:0.0));
  S.life=S.kind>1.5&&S.kind<2.5?(1.0+1.6*S.h2):(S.kind>2.5?(2.8+2.2*S.h2):(2.0+2.4*S.h2));
  return S;
}
float holdOf(Seed S){ return 0.02+0.2*S.hg*S.hg+0.05*S.h3; }
// Return path: an inward spiral around home; every mote turns the same way, so the returning
// dust reads as one vortex condensing back into the body.
vec3 spiralPos(vec3 from, vec3 to, float e, float h, float aspect){
  vec2 off=(from.xy-to.xy)*vec2(aspect,1.0);
  float l=length(off); if(l>0.45) off*=0.45/l;
  float a=e*(1.5+0.9*h);
  float c=cos(a), sn=sin(a);
  vec2 r=vec2(c*off.x-sn*off.y,sn*off.x+c*off.y)*(1.0-e)*(1.0-e*0.15*(1.0-e));
  return vec3(to.xy+r/vec2(aspect,1.0),from.z*(1.0-e)*(1.0-e));
}
// Reform vortex: every mote waits on a slowly turning orbit around its home, hanging downwind
// (where the air carried the dust) the longer its moment is away, and streams in, tightening, as its
// moment approaches: the dust visibly flows back rather than sprinkling the whole room.
vec2 orbitPos(Seed S, vec3 wind, float aspect, float time, float wait){
  vec2 wd=normalize(wind.xy+vec2(1e-4,0.0));
  float a=S.h3*6.2832+time*(1.1+1.2*S.h2);
  vec2 dir=vec2(cos(a),sin(a));
  float w=clamp(wait/1.6,0.0,1.0);
  float r=(0.04+0.12*S.h2*S.h2+0.04*S.h3)*(0.45+0.55*w);
  vec2 down=wd*(0.08+0.3*S.h3)*w*w;
  return S.home+(dir*r+down)/vec2(aspect,1.0);
}
`,eo=b+U+xe+a0+`
layout(location=0)in vec4 aPos;
layout(location=1)in vec4 aVel;
layout(location=2)in vec4 aCol;
out vec4 vPos;out vec4 vVel;out vec4 vCol;
uniform sampler2D uField;uniform sampler2D uMask;uniform sampler2D uBase;uniform sampler2D uNoiseA;uniform sampler2D uFlow;uniform sampler2D uProt;
uniform vec2 uGrid;uniform float uAspect;uniform float uTau;uniform float uDt;uniform float uTime;
uniform float uMode;uniform float uReset;uniform float uWindow;
uniform vec3 uWind;uniform float uTurb;uniform float uHands;
uniform vec4 uForce[2];uniform vec4 uForceP[2];
void main(){
gl_Position=vec4(0.0);
Seed S=seedOf(gl_VertexID,uGrid);
vec4 P=aPos,V=aVel,C=aCol;
float state=V.w;
if(uReset>0.5 || S.cell.y>=uGrid.y){
vPos=vec4(S.home,0.0,0.0);vVel=vec4(0.0);vCol=vec4(0.0);return;
}
vec4 F=texelFetch(uField,ivec2(S.home*vec2(textureSize(uField,0))),0);
bool reached=F.r<1000.0;
vec4 PH=uHands>0.5?texture(uProt,S.home):vec4(0.06,0.0,0.0,1.0);
float s=uTau-F.r-F.a-EDGE_AMP*texture(uNoiseA,S.home).r-0.5*PH.b*(1.0-smoothstep(0.0,0.035,PH.r))*step(-0.004,PH.r);
bool dissolving=uMode>0.5 && uMode<1.5,reforming=uMode>1.5;
bool ember=S.kind>1.5&&S.kind<2.5,smoke=S.kind>2.5;
if(state<0.5){
float qu=quietOf(F.a);
if(dissolving && reached && s>0.0 && s<0.4 &&(qu<0.5 ||(smoke && S.h2<0.6))){
float m=texture(uMask,S.home).r;
if(m>0.3 && protLo(PH.r)<0.3){
state=1.0;
P=vec4(S.home,0.0,qu>0.5?0.5:0.0);
vec3 r=hash33(vec3(S.cell,uTime))-0.5;
vec2 sh=vec2(cos(S.hg*6.2832),sin(S.hg*6.2832));
float ra=r.x*6.2832,rs=0.03+0.11*(r.y+0.5)*(r.y+0.5);
V.xyz=vec3(vec2(cos(ra),sin(ra))*rs+sh*0.025+vec2(0.0,0.015),0.01+abs(r.z)*0.04);
vec3 c=texture(uBase,S.home).rgb;
C=vec4(mix(c,c*vec3(0.5,0.36,0.26)+vec3(0.004,0.002,0.001),0.5),m);
}
}
}else if(state<1.5){
vec2 c=texture(uFlow,clamp(P.xy,0.0,1.0)).rg;
if(reforming && reached){
state=3.0;P.w=1.0;V.xyz=vec3(0.0);C.w=0.0;
}else if(!reforming){
P.w+=uDt;
float age=P.w;
vec2 qp=vec2(P.x*uAspect,P.y);
float hold=holdOf(S);
float ramp=smoothstep(hold,hold+0.32,age);
float gust=0.45+1.3*S.h3;
vec3 flow=uWind*(0.15+0.85*ramp)*gust;
flow.z=uWind.z*(0.25+2.6*S.h2*S.h2*S.h2)*(0.2+0.8*ramp);
flow.xy+=c*uTurb*(0.45+0.55*ramp)*(ember?2.6:(smoke?1.3:1.0));
flow.y+=(ember?0.12:(smoke?0.09:0.03))*ramp;
if(smoke)flow*=0.75;
for(int k=0;k<2;k++){
if(uForceP[k].y<0.001)continue;
vec2 d=qp-uForce[k].xy;
float r=uForceP[k].x;
float f=exp(-dot(d,d)/(r*r))*uForceP[k].y;
flow.xy+=uForce[k].zw*f*1.5+normalize(d+1e-5)*f*0.12;
flow.z+=f*0.1;
}
float drag=(ember?2.4:(smoke?2.0:1.6))*(0.45+0.55*ramp);
V.xyz+=(flow-V.xyz)*(1.0-exp(-drag*uDt));
P.x+=V.x/uAspect*uDt;P.y+=V.y*uDt;
P.xy+=(P.xy-vec2(0.5,0.5))*V.z*uDt/max(1.0-P.z,0.5);
P.z=clamp(P.z+V.z*uDt,0.0,0.5);
if(age>S.life)state=2.0;
}
}else if(state<2.5){
if(reforming && reached){
state=3.0;P=vec4(orbitPos(S,uWind,uAspect,uTime,s-uWindow),0.15+0.3*S.h3,0.0);V.xyz=vec3(0.0);C.w=0.0;
}
}else if(state<3.5){
P.w+=uDt;
if(!reforming){state=1.0;P.w=S.life*0.55;V.xyz=vec3(0.0);C.w=1.0;}
else{
vec2 g=orbitPos(S,uWind,uAspect,uTime,s-uWindow);
vec2 c=texture(uFlow,clamp(P.xy,0.0,1.0)).rg;
vec2 np=mix(P.xy,g,1.0-exp(-uDt*(1.6+1.6*S.h2)))+c*vec2(1.0/uAspect,1.0)*0.04*uDt;
V.xy=(np-P.xy)/max(uDt,1e-4)*vec2(uAspect,1.0);
P.xy=np;P.z=mix(P.z,0.12+0.25*S.h3,1.0-exp(-uDt*2.0));
if(s<uWindow){state=4.0;V.xyz=P.xyz;C.w=0.0;}
}
}else{
float pr=reached?clamp(1.0-s/uWindow,0.0,1.0):1.0;
C.w=pr;P.w+=uDt;
float e=pr*pr*(3.0-2.0*pr);
P.xyz=spiralPos(V.xyz,vec3(S.home,0.0),e,S.h3,uAspect);
if(pr>=0.999){state=0.0;P=vec4(S.home,0.0,0.0);}
else if(dissolving && s>uWindow){state=1.0;P.w=S.life*0.55;V.xyz=vec3(0.0);C.w=1.0;}
}
V.w=state;
vPos=P;vVel=V;vCol=C;
}`,to=b+"out vec4 o;void main(){o=vec4(0.0);}",oo=b+U+xe+a0+`
layout(location=0)in vec4 aPos;layout(location=1)in vec4 aVel;layout(location=2)in vec4 aCol;
uniform sampler2D uLight;uniform sampler2D uField;uniform sampler2D uMask;uniform sampler2D uBase;uniform sampler2D uAmb;uniform sampler2D uProt;
uniform vec2 uGrid;uniform vec2 uRes;uniform float uAspect;uniform float uTime;uniform float uCell;
uniform float uShutter;uniform float uRate;uniform vec3 uLightColor;uniform float uTau;
out vec2 vLocal;out vec4 vShape;out vec4 vShape2;out vec4 vColor;out vec3 vEmit;out float vFlat;
flat out vec4 vFlake;flat out vec4 vTex;flat out vec4 vN01;flat out vec4 vN23;flat out vec4 vN4D;flat out vec4 vD;
vec3 ashOf(float h,vec3 src){
vec3 a=mix(vec3(0.035,0.03,0.026),vec3(0.32,0.305,0.29),h*(0.6+0.4*h));
return mix(a,vec3(luma(src))*vec3(1.0,0.92,0.83),0.25);
}
void main(){
float state=aVel.w;
int corner=gl_VertexID;
vec2 c=vec2(float(corner&1),float((corner>>1)&1))*2.0-1.0;
if(state<0.5 ||(state>1.5 && state<2.5)){gl_Position=vec4(2.0,2.0,2.0,1.0);return;}
Seed S=seedOf(gl_InstanceID,uGrid);
float age=aPos.w,z=min(aPos.z,0.5);
float persp=1.0/(1.0-z);
float px=uRes.y;
float t=clamp(age/S.life,0.0,1.0);
bool back=state>2.5,gather=state>2.5&&state<3.5;
float pr=gather?0.0:aCol.w;
float shutter=uShutter,hard=1.0,irreg=0.0,rot=0.0,coreK=0.0,square=0.0,flatk=1.0,maxLen=0.016;
vec2 velPx;
if(back && !gather){
float e=pr*pr*(3.0-2.0*pr),de=6.0*pr*(1.0-pr);
vec3 a=spiralPos(aVel.xyz,vec3(S.home,0.0),e,S.h3,uAspect);
vec3 b=spiralPos(aVel.xyz,vec3(S.home,0.0),min(e+0.02,1.0),S.h3,uAspect);
velPx=(b.xy-a.xy)/0.02*de*uRate/${yt.toFixed(2)}*uRes;
shutter*=0.18;
}else{velPx=aVel.xy*vec2(1.0/uAspect,1.0)*uRes;if(gather)shutter*=0.5;}
float alpha,size;
vec3 col,emit=vec3(0.0);
float hold=holdOf(S);
float fine=uCell*(0.08+0.14*S.h2*S.h2);
bool ember=S.kind>1.5&&S.kind<2.5;
float texK=0.0,charK=0.0,glowK=0.0,polyK=0.0,s0=uCell;
float fr=back?1.0:smoothstep(0.45,0.7,aCol.w);
if(S.kind<0.5){
bool big=S.hs>0.94;
s0=big?uCell*(1.1+1.2*S.h2*S.h2):uCell*mix(0.53,0.9,S.hs/0.94);
float crumble=max(smoothstep(hold+(big?0.25:0.0),hold+(big?0.95:0.45),age),1.0-fr);
size=mix(s0*mix(1.0,0.88,smoothstep(0.0,hold+0.2,age)),fine,crumble);
float ashK=smoothstep(hold*0.5+0.06,hold+0.5,age);
col=mix(aCol.rgb,ashOf(S.h3,aCol.rgb),ashK);
texK=1.0-max(ashK,crumble);charK=0.35+0.65*smoothstep(0.0,hold+0.35,age);
glowK=2.6*exp(-age/0.09)*(0.4+0.6*S.h3)*fr;
polyK=1.0-crumble;
alpha=0.97*(1.0-smoothstep(0.3,1.0,t))*mix(1.0,0.6,crumble)*mix(0.5,1.0,fr);
emit=blackbody(0.45)*2.0*exp(-age/0.04)*step(0.975,S.h2);
hard=mix(0.85,0.25,crumble);
float spin=(0.7+2.8*S.h2)*(big?0.55:1.0);
float flip=abs(cos(spin*max(age-hold,0.0)*2.2+S.h3*6.28));
flatk=mix(1.0,0.28+0.72*flip,smoothstep(hold,hold+0.25,age)*(1.0-smoothstep(0.6,0.9,crumble)));
col*=mix(1.0,0.62+0.5*flip,smoothstep(hold,hold+0.25,age));
rot=S.h2*6.28+age*(S.h3-0.5)*3.0;
}else if(S.kind<1.5){
s0=uCell*(0.6+0.8*S.h3*S.h3);
size=s0*mix(1.0,0.32,smoothstep(0.1,1.8,age));
col=mix(aCol.rgb,ashOf(S.h2*0.5,aCol.rgb)*0.6,smoothstep(0.05,0.5,age));
texK=(1.0-smoothstep(0.02,0.35,age))*fr;charK=0.6+0.4*smoothstep(0.0,0.3,age);polyK=(1.0-smoothstep(0.8,1.8,age))*fr;
glowK=2.0*exp(-age/0.15)*fr;size=mix(fine*1.3,size,fr);
alpha=0.95*(1.0-smoothstep(0.6,1.0,t));
rot=S.h3*6.28+age*(S.h2-0.5)*7.0;
float flip=abs(cos(age*(2.2+4.5*S.h2)+S.h3*6.28));
flatk=0.22+0.78*flip;
col*=0.55+0.7*flip;
emit=blackbody(0.38)*1.2*exp(-age/0.12)*step(0.88,S.h3);
hard=0.85;shutter*=0.6;
}else if(ember){
size=px*(0.0005+0.0006*S.h3);
col=vec3(0.0);alpha=0.0;hard=0.0;
float hot=S.h2*S.h2*S.h2;
float temp=mix(0.3+0.32*hot,0.16,t);
float fl=0.55+0.45*sin(uTime*(15.0+13.0*S.h2)+S.h3*40.0)*sin(uTime*(4.0+5.0*S.h3)+S.h2*9.0);
emit=blackbody(temp)*(2.2+7.0*hot)*pow(1.0-t,1.6)*fl;
shutter*=0.9;
}else{
size=uCell*(3.0+9.0*smoothstep(0.0,2.5,age))*(0.7+0.6*S.h2);
vec3 amb=texture(uAmb,clamp(aPos.xy,0.0,1.0)).rgb;
col=(vec3(0.33,0.31,0.29)*luma(amb)*0.95+0.01)*(0.85+0.3*S.h3);
alpha=0.075*smoothstep(0.0,0.6,age)*pow(1.0-t,1.2);
hard=0.0;shutter*=3.0;maxLen=0.05;
}
if(back){
float wt=uTau-texture(uField,S.home).r-texture(uField,S.home).a-${yt.toFixed(2)};
float fadeIn=smoothstep(0.0,0.45,age)*(gather?mix(1.0,0.12,smoothstep(0.35,1.4,wt)):1.0);
float land=smoothstep(0.8,1.0,pr),late=smoothstep(0.72,0.98,pr);
vec3 ash=ashOf(S.h3,aCol.rgb)*0.6;
vec3 own=texture(uBase,S.home).rgb;
float early=1.0-smoothstep(0.3,0.6,pr);
float tw=0.55+0.45*sin(uTime*(5.0+7.0*S.h2)+S.h3*30.0);
hard=mix(0.3,0.85,late);coreK=16.0;irreg=0.0;maxLen=0.016;
texK=0.0;charK=0.0;glowK=0.0;polyK=0.0;
float melt=1.0-smoothstep(0.88,1.0,pr);
if(S.kind<0.5){
s0=S.hs>0.94?uCell*(1.1+1.2*S.h2*S.h2):uCell*mix(0.53,0.9,S.hs/0.94);
size=mix(max(fine*1.25,px*0.0006),s0,land);alpha=0.9*fadeIn*melt;col=mix(ash,own,late);texK=late;polyK=land;rot=S.h2*6.28;
}else if(S.kind<1.5){
s0=uCell*(0.6+0.8*S.h3*S.h3);
size=mix(s0*0.5,s0,land);alpha=0.95*fadeIn*melt;col=mix(ash*0.8,own,late);
rot=S.h3*6.28+uTime*(S.h2-0.5)*5.0*(1.0-land);hard=0.85;polyK=1.0;texK=late;charK=0.6*(1.0-late);
}else if(ember){size=px*0.0008;alpha=0.0;col=vec3(0.0);}
else{size=uCell*(2.5+3.0*S.h2)*(1.0-0.6*pr);alpha=0.06*fadeIn*(1.0-pr)*(1.0-pr);col=vec3(0.2,0.19,0.185);hard=0.0;coreK=0.0;}
float spark=ember?4.0:(S.kind<1.5?step(0.9,S.h2)*3.0:0.0);
emit=vec3(0.45,0.85,1.0)*spark*early*fadeIn*tw;
vec2 pp=clamp(aPos.xy,0.0,1.0);
vec4 Fh=texture(uField,pp);
float mh=texture(uMask,pp).r;
float occ=max(step(uTau-Fh.r-Fh.a,0.0)*smoothstep(0.3,0.6,mh),protLo(texture(uProt,pp).r))*(1.0-smoothstep(0.8,0.92,pr));
alpha*=1.0-0.94*occ;emit*=1.0-occ;
}else{
vec2 pp=clamp(aPos.xy,0.0,1.0);
vec4 Fh=texture(uField,pp);
if(Fh.b>0.05){
float occ=protLo(texture(uProt,pp).r)*(1.0-smoothstep(0.1,0.32,z));
alpha*=1.0-occ;emit*=1.0-occ;
}
}
vec2 lp=clamp(aPos.xy,vec2(0.0),vec2(1.0));
float L=texture(uLight,lp).r;
emit+=uLightColor*L*(col*0.9+0.02)*alpha*0.6;
size*=persp;
float coc=z*px*0.006;
float r=max(sqrt(size*size+coc*coc),0.7);
float energy=min(1.0,(size*size)/(r*r));
float sub=min(1.0,size*size/0.5);
alpha*=energy*sub;emit*=energy*sub;
hard*=energy;
float speed=length(velPx);
vec2 dir=speed>1e-3?velPx/speed:vec2(1.0,0.0);
float len=min(speed*shutter,px*maxLen);
float w=max(r,0.7);
float streak=(2.0*r)/(2.0*r+len);
alpha*=mix(1.0,streak,maxLen>0.03?0.3:0.8);emit*=streak;
float halfL=r+len*0.5;
float pad=polyK>0.01?1.06:(irreg>0.0?1.45:1.0);
vec2 perp=vec2(-dir.y,dir.x);
float mg=polyK>0.01?0.6:1.0;
vec2 local=vec2(c.x*(halfL*pad+mg),c.y*(w*pad+mg));
vec2 p=aPos.xy*uRes+dir*local.x+perp*local.y;
gl_Position=vec4(p/uRes*2.0-1.0,0.0,1.0);
vLocal=local;vShape=vec4(len*0.5,r,w,hard);vShape2=vec4(rot,irreg,coreK,square);vFlat=flatk;
vColor=vec4(col,alpha);vEmit=emit;
vFlake=vec4(texK,charK,glowK*alpha,polyK);
vTex=vec4(S.home,vec2(s0)/uRes);
if(polyK>0.01){
vec4 ha=hash44(vec4(S.cell,S.h3*17.0,3.1)),hb=hash44(vec4(S.cell.yx,S.h2*13.0,8.7));
float a0=S.h3*6.2832,st=1.25664;
vec2 n0=vec2(cos(a0),sin(a0)),n1,n2,n3,n4;
float a1=a0+st*(1.0+0.9*(ha.x-0.5)),a2=a0+st*(2.0+0.9*(ha.y-0.5)),a3=a0+st*(3.0+0.9*(ha.z-0.5)),a4=a0+st*(4.0+0.9*(ha.w-0.5));
n1=vec2(cos(a1),sin(a1));n2=vec2(cos(a2),sin(a2));n3=vec2(cos(a3),sin(a3));n4=vec2(cos(a4),sin(a4));
float cut=0.3+0.45*hb.x;
vN01=vec4(n0,n1);vN23=vec4(n2,n3);vN4D=vec4(n4,0.5+0.48*hb.y,1.0/max(r,1.0));
vD=vec4(cut,0.5+0.48*hb.z,0.5+0.48*hb.w,0.5+0.48*fract(hb.x*7.31+hb.y*3.7));
}else{vN01=vec4(1.0,0.0,0.0,1.0);vN23=vec4(-1.0,0.0,0.0,-1.0);vN4D=vec4(0.0,1.0,1.0,1.0);vD=vec4(1.0);}
}`,ao=b+`
in vec2 vLocal;in vec4 vShape;in vec4 vShape2;in vec4 vColor;in vec3 vEmit;in float vFlat;
flat in vec4 vFlake;flat in vec4 vTex;flat in vec4 vN01;flat in vec4 vN23;flat in vec4 vN4D;flat in vec4 vD;
uniform sampler2D uBase;
out vec4 o;
void main(){
float dx=max(abs(vLocal.x)-vShape.x,0.0);
vec2 pp=vec2(dx*sign(vLocal.x)/vShape.y,vLocal.y/vShape.z);
float d=length(pp);
vec2 fp=pp;
if(vFlat<0.99 || vFlake.w>0.01){
fp=mat2(cos(vShape2.x),sin(vShape2.x),-sin(vShape2.x),cos(vShape2.x))*pp;
fp.y/=max(vFlat,0.05);
d=length(fp);
}
float soft=exp(-d*d*2.3)*(1.0-smoothstep(0.85,1.35,d));
float disc=1.0-smoothstep(0.5,1.02,d);
float a=mix(soft,disc,vShape.w);
vec3 col=vColor.rgb,glow=vec3(0.0);
if(vFlake.w>0.01){
float sd=max(max(max(dot(fp,vN01.xy)-vD.x,dot(fp,vN01.zw)-vD.y),max(dot(fp,vN23.xy)-vD.z,dot(fp,vN23.zw)-vD.w)),dot(fp,vN4D.xy)-vN4D.z);
float aa=vN4D.w*1.2;
float aP=1.0-smoothstep(-aa,aa,sd);
a=mix(a,aP,vFlake.w);
if(vFlake.x>0.01){
vec3 tx=texture(uBase,vTex.xy+fp*vTex.zw).rgb;
col=mix(col,tx*mix(vec3(1.0),vec3(0.52,0.4,0.31),vFlake.y*0.6),vFlake.x);
}
float rim=smoothstep(-0.45,-0.02,sd)*vFlake.w;
col*=1.0-0.38*rim*vFlake.y;
glow=vec3(1.0,0.36,0.07)*vFlake.z*rim*rim*aP;
}
float core=vShape2.z>0.0?exp(-d*d*vShape2.z):a;
o=vec4(col*a*vColor.a+vEmit*core+glow,vColor.a*a);
}`;function so(k){const{kit:i,gl:l}=k,$=!!k.mobile,He=$?24576:98304,Bt=48,p={field:i.program(P0,{label:"dust field"}),emit:i.program(C0,{label:"dust emit"}),blur:i.program(H0,{label:"dust blur"}),maskD:i.program(L0,{label:"dust matte"}),plate:i.program(N0,{label:"dust plate"}),noise:i.program(T0,{label:"dust noise"}),noiseC:i.program(z0,{label:"dust smoke noise"}),flow:i.program(U0,{label:"dust flow"}),lightFin:i.program(M0,{label:"dust light"}),roomFin:i.program(K0,{label:"dust room"}),trust:i.program(G0,{label:"dust known room"}),corr:i.program(X0,{label:"dust seam correction"}),pref:i.program(E0,{label:"dust fill pref"}),scan:i.program(q0,{label:"dust fill scan"}),combine:i.program(B0,{label:"dust fill combine"}),pm:i.program(I0,{label:"dust fill synthesis"}),vblur:i.program(O0,{label:"dust fill blur"}),bilat:i.program(W0,{label:"dust fill debanding"}),push:i.program(V0,{label:"dust fill push"}),pull:i.program(_0,{label:"dust fill pull"}),smoke:i.program(Y0,{label:"dust smoke"}),veil:i.program(j0,{label:"dust veil"}),statsA:i.program(Q0,{label:"dust stats a"}),statsB:i.program(J0,{label:"dust stats b"}),prot:i.program(Z0,{label:"dust hands"}),comp:i.program($0,{label:"dust composite"}),update:i.program(to,{vs:eo,feedback:["vPos","vVel","vCol"],label:"dust update"}),draw:i.program(ao,{vs:oo,label:"dust draw"})},R=i.pingPong(4,4,{format:"hdr",filter:"linear"}),Le=i.pingPong(4,4,{format:"hdr",filter:"linear"}),ge=i.pingPong(4,4,{format:"hdr",filter:"linear"}),rt=i.target(4,4,{format:"hdr",filter:"linear"}),r0={format:"hdr",filter:"nearest"},fe=i.target(4,4,{format:"hdr",filter:"linear"}),X=i.target(4,4,{format:"hdr",filter:"linear"}),F=[0,1,2,3].map(()=>i.target(4,4,r0)),be=i.target(4,4,{format:"hdr",filter:"linear"}),Vt=[[-1,0],[1,0],[0,-1],[0,1]].map(o=>new Float32Array(o)),z=[],ae=[],B=[],me=[],Ie=i.target(4,4,{format:"hdr",filter:"linear"}),Ke=i.target(4,4,{format:"hdr",filter:"linear"}),st=i.target(4,4,{format:"hdr",filter:"linear"}),ee=i.pingPong(4,4,{format:"hdr",filter:"linear"}),Y=i.pingPong(4,4,{format:"hdr",filter:"linear"}),re=i.target(4,4,{format:"hdr",filter:"linear"}),se=i.pingPong(4,4,{format:"hdr",filter:"nearest"}),ve=i.target(4,4,{format:"hdr",filter:"linear"}),V=i.target(4,4,{format:"hdr",filter:"linear"}),Ne=i.target(4,4,{format:"hdr",filter:"linear"}),Ae=i.target(4,4,{format:"hdr",filter:"linear",wrap:"repeat"}),it=i.target(4,4,{format:"hdr",filter:"linear"}),ut=i.target(256,256,{format:"hdr",filter:"linear",wrap:"repeat"}),Ge=i.target(4,4,{format:"hdr",filter:"linear"}),Xe=i.target(4,4,{format:"hdr",filter:"linear"}),lt=i.target(4,4,{format:"hdr",filter:"nearest"}),ct=i.target(4,1,{format:"rgba8",filter:"nearest"}),Re=[l.createBuffer(),l.createBuffer()];for(const o of Re)l.bindBuffer(l.ARRAY_BUFFER,o),l.bufferData(l.ARRAY_BUFFER,He*Bt,l.DYNAMIC_DRAW);const nt=(o,n)=>{const r=l.createVertexArray();l.bindVertexArray(r),l.bindBuffer(l.ARRAY_BUFFER,o);for(let s=0;s<3;s++)l.enableVertexAttribArray(s),l.vertexAttribPointer(s,4,l.FLOAT,!1,Bt,s*16),l.vertexAttribDivisor(s,n);return l.bindVertexArray(null),r},_t=[nt(Re[0],0),nt(Re[1],0)],Ot=[nt(Re[0],1),nt(Re[1],1)],Wt=Re.map(o=>{const n=l.createTransformFeedback();return l.bindTransformFeedback(l.TRANSFORM_FEEDBACK,n),l.bindBufferBase(l.TRANSFORM_FEEDBACK_BUFFER,0,o),l.bindTransformFeedback(l.TRANSFORM_FEEDBACK,null),l.bindBufferBase(l.TRANSFORM_FEEDBACK_BUFFER,0,null),n});l.bindBuffer(l.ARRAY_BUFFER,null);let ft=0;const mt=l.createBuffer();l.bindBuffer(l.PIXEL_PACK_BUFFER,mt),l.bufferData(l.PIXEL_PACK_BUFFER,16,l.STREAM_COPY),l.bindBuffer(l.PIXEL_PACK_BUFFER,null);const j=new Uint8Array(16);let de=null,s0=0,It=0,Kt=-1,Gt=-1;const Xt=[!1,!1],St=[.1,.1],e={mode:H,tau:0,tauFirst:-1,rewindVel:0,reform:0,activity:0,reset:!0,lastActivity:0,kick:0,windX:0,windY:0,front:0,aspect:0,gridW:0,gridH:0,live:!1,time:0,srcVersion:-1,roomReset:!0,roomSoft:!1,roomAt:-10,fillHoldUntil:0,maskSeenAt:-1,maskValid:0,noiseDirty:!0,noiseCDone:!1,fillDirty:!0,frameNo:0,ignoreUntil:0,cooldownUntil:0,choreoStart:-1,cycleStart:0,choreoEmpty:-1,choreoDone:-1,dissolveSoundAt:-10,charge:0,flare:0,flips:0,maxT:-1,frac:0,cover:0,coverAt:-10,statsAt:-10,sceneDiff:0,sceneBad:0,replates:0,rebasePending:!1,statsGen:0,rebases:0,rebaseAt:t0,spent:!1,smokeUntil:-1,smokeReset:!0,crackleBurst:0,debugIgn:null,debugHold:!1,protFresh:!0,nnfReset:!0,roomFFresh:!0,guideReady:!1,known:1,knownAt:-10,pmIter:0,pmConv:0},M=[0,1].map(()=>({openHold:0,fistHold:0,pinchHold:0,closedHold:0,armed:!0,burning:!1,open:!1,prevX:0,prevY:0,hasPrev:!1,w:0,rim:0,seen:!1,armW:0,probeOk:!1,probeAt:-10,offX:0,offY:0,probeR:9,charge:0,sparkT:-1,sparkFX:0,sparkFY:0,sparkTX:0,sparkTY:0,flare:0,flareX:0,flareY:0,seedX:0,seedY:0,hasSeed:!1,palmX:.5,palmY:.5,size:.1,wx:0,wy:0,ax:0,ay:1,ptsPrev:new Float32Array(63),ptsT:-1,vel:new Float32Array(42),gesture:"none",gestAt:-10,sizeAvg:0})),a={ign:new Float32Array(16),ignP:new Float32Array(16),hand:new Float32Array(168),handW:new Float32Array(4),handR:new Float32Array(4),force:new Float32Array(8),forceP:new Float32Array(8),wind:new Float32Array(3),windDir:new Float32Array([1,0]),res:new Float32Array(2),grid:new Float32Array(2),dirX:new Float32Array(2),dirY:new Float32Array(2),renderRes:new Float32Array(2),handC:new Float32Array(8),handK:new Float32Array(8),handS:new Float32Array(8),handS2:new Float32Array(8),spark:new Float32Array(8),sparkC:new Float32Array(8),sparkH:new Float32Array(8),flare:new Float32Array(8),probe:new Float32Array(8),probeAx:new Float32Array(8),lc:new Float32Array([1,.48,.2]),arm:new Float32Array(8),armP:new Float32Array(8),camRes:new Float32Array([1280,720]),wrist:new Float32Array(8),protTex:new Float32Array(2),rebase:new Float32Array(4),noRebase:new Float32Array(4)},Ee=[],i0=[!1,!1],A={noise:{level:0,tone:0},crackle:{level:0},hum:{level:0,pitch:1}};let Ye=0;const L={uPrev:null,uMask:null,uMaskD:null,uNoiseB:null,uRes:a.res,uAspect:1,uTau:0,uSpeed:.27,uBg:.45,uReset:0,uRewind:0,uFirst:1,uPropagate:1,uDt:0,uBump:0,uRebase:a.noRebase,uIgn:a.ign,uIgnP:a.ignP,uHand:a.hand,uHandW:a.handW,uHandR:a.handR,uWrist:a.wrist},qe={uBase:null,uPrev:Ne,uDt:0,uMem:0,uTime:0,uTex:a.protTex,uAspect:1,uHand:a.hand,uHandW:a.handW,uHandR:a.handR,uWrist:a.wrist,uHandS:a.handS,uHandS2:a.handS2,uArm:a.arm,uArmP:a.armP},Pe={uField:null,uMask:null,uNoiseA:null,uProt:V,uTau:0,uOn:0,uAspect:1,uHandC:a.handC,uFlare:a.flare,uSparkH:a.sparkH},Be={uSrc:null,uDir:a.dirX},je={uAspect:1,uWhich:0},Dt={uAspect:1,uTime:0},vt={uSrc:null,uAspect:1,uTime:0},At={uMask:null,uAspect:1},K={uRoom:null,uFill:re,uNNF:null,uPrevF:null,uL:null,uR:null,uD:null,uU:null,uFillRes:new Float32Array(2),uBlend:1},Q={uNNF:null,uGuide:re,uSrc:null,uCur:null,uL:null,uR:null,uD:null,uU:null,uFillRes:K.uFillRes,uJump:1,uSeed:0,uReset:1,uLambda:1},Yt=$?[8,4,2,1,1]:[16,8,4,2],dt={uRoom:null,uAxis:new Float32Array(2)},ie={uSrc:null,uDir:Vt[0],uStep:1,uInit:1},Te={uPref:null,uL:null,uR:null,uD:null,uU:null,uIso:null},ue={uSrc:null,uTexel:new Float32Array(2),uFirst:0},_={uFine:null,uCoarse:null,uCoarseTop:0,uZero:0},we={uRoom:null,uBase:null,uMask:null,uMaskD:null,uProt:V,uTex:new Float32Array(2),uLive:0},Qe={uRoomF:null,uTrust:null,uTex:new Float32Array(2)},N={uSrc:null,uDir:new Float32Array(2),uLast:0,uL:null,uR:null,uD:null,uU:null,uPref:null},O={uSrc:null,uStepDir:null,uL:null,uR:null,uD:null,uU:null,uPref:null},u0=new Float32Array([1,0]),l0=new Float32Array([0,1]),C={uPrev:null,uFlow:null,uField:null,uMask:null,uMaskD:null,uNoiseA:null,uRoomF:null,uNoiseC:ut,uProt:V,uTime:0,uDt:0,uAspect:1,uTau:0,uMode:0,uDecay:3,uReset:0,uWind:a.wind,uForce:a.force,uForceP:a.forceP},Ve={uSmoke:null,uAmb:null,uAmbG:null,uNoiseC:ut,uAspect:1,uTime:0,uWind:a.wind},le={uPrev:null,uBase:null,uMaskD:null,uProt:V,uStats:null,uAspect:1,uValid:0,uReset:1,uRate:.12,uGate:0,uArm:a.arm,uArmP:a.armP},ze={uField:null,uMask:null,uMaskD:null,uRoom:null,uBase:null,uProt:V,uRes:a.res,uTau:0},Je={uSrc:null,uMask:null,uField:null,uProbe:a.probe,uProbeAx:a.probeAx,uTau:0},S={uBase:null,uMask:null,uMaskD:null,uField:null,uLight:null,uNormals:null,uNoiseA:null,uRoomF:null,uSmoke:null,uVeil:null,uSmokeOn:0,uProt:V,uCorr:Ke,uTau:0,uTime:0,uAspect:1,uReform:0,uActive:0,uFx:0,uDebug:0,uRes:a.renderRes,uLightColor:a.lc,uHandC:a.handC,uHandK:a.handK,uSpark:a.spark,uSparkC:a.sparkC,uFlare:a.flare,uCamRes:a.camRes,uNoiseAmp:0,uSrcFrame:0,uFieldRes:a.res},W={uField:null,uMask:null,uBase:null,uNoiseA:null,uFlow:null,uProt:V,uGrid:a.grid,uAspect:1,uTau:0,uDt:0,uTime:0,uMode:0,uReset:0,uWindow:yt,uWind:a.wind,uTurb:1,uForce:a.force,uForceP:a.forceP},te={uLight:null,uField:null,uMask:null,uBase:null,uAmb:null,uProt:V,uGrid:a.grid,uRes:a.renderRes,uAspect:1,uTime:0,uCell:4,uShutter:1/120,uRate:1.7,uLightColor:a.lc,uTau:0};function c0(){const o=k.source?.element;return typeof HTMLVideoElement<"u"&&o instanceof HTMLVideoElement}function jt(o){if(Math.abs(o-e.aspect)<.001&&R.width>4)return;e.aspect=o;const n=$?400:512,r=o>=1?n:Math.max(8,Math.round(n*o)),s=o>=1?Math.max(8,Math.round(n/o)):n;R.resize(r,s),ve.resize(r,s),rt.resize(r,s),V.resize(r,s),Ne.resize(r,s),V.clear(.06,0,0,1),Ne.clear(.06,0,0,1),e.protFresh=!0,e.protClear=!0,Le.resize(Math.max(4,r>>1),Math.max(4,s>>1)),ge.resize(Math.max(4,r>>1),Math.max(4,s>>1)),ee.resize(r*2,s*2),Y.resize(r*2,s*2),Ae.resize(r*2,s*2),it.resize(r,s),Y.read.clear(0,0,0,0),Y.write.clear(0,0,0,0),re.resize(r,s),re.clear(0,0,0,-1),se.resize(r,s),se.read.clear(0,0,0,0),se.write.clear(0,0,0,0),e.nnfReset=!0,e.roomFFresh=!0,e.guideReady=!1,Ge.resize(Math.max(4,r>>1),Math.max(4,s>>1)),Xe.resize(Math.max(4,r>>1),Math.max(4,s>>1)),e.noiseDirty=!0,e.fillDirty=!0,e.smokeReset=!0,ke=-1,fe.resize(r,s),X.resize(r,s),be.resize(r,s);for(const g of F)g.resize(r,s);let v=r,m=s,f=0;for(;v>3||m>3;)v=Math.max(1,Math.ceil(v/4)),m=Math.max(1,Math.ceil(m/4)),z[f]?(z[f].resize(v,m),ae[f].resize(v,m)):(z[f]=i.target(v,m,{format:"hdr",filter:"linear"}),ae[f]=i.target(v,m,{format:"hdr",filter:"linear"})),B[f]?(B[f].resize(v,m),me[f].resize(v,m)):(B[f]=i.target(v,m,{format:"hdr",filter:"linear"}),me[f]=i.target(v,m,{format:"hdr",filter:"linear"})),f++;for(let g=f;g<z.length;g++)z[g].dispose(),ae[g].dispose(),B[g].dispose(),me[g].dispose();z.length=ae.length=B.length=me.length=f,Ie.resize(r,s),Ke.resize(r,s),st.resize(r,s),Ke.clear(0,0,0,1),e.roomReset=!0,lt.resize(Math.ceil(r/16),Math.ceil(s/16)),e.gridW=Math.max(8,Math.round(Math.sqrt(He*o))),e.gridH=Math.floor(He/e.gridW),a.grid[0]=e.gridW,a.grid[1]=e.gridH,e.reset=!0}function Rt(o,n){e.mode!==G&&((e.mode===H||e.tauFirst<0)&&(e.tauFirst=e.tau,e.lastActivity=o,e.spent=!1),e.mode===I&&e.flips++,e.mode=G,e.fillDirty=!0,o-e.dissolveSoundAt>1.2&&(k.audio?.whoosh({strength:.4+.4*n,duration:1.8,up:!1}),k.audio?.impact({strength:.25+.3*n,pitch:1.3}),e.dissolveSoundAt=o),e.kick=Math.max(e.kick,.35+.3*n))}function Pt(){return(e.maxT>=0&&e.time-e.statsAt<1?e.maxT:e.tauFirst+3.6)+e0+yt*.8}function Tt(o){if(!(e.mode===I||e.tauFirst<0)){e.mode=I,e.rewindVel=.9,e.flips++,e.spent=!1,e.tau=Math.min(e.tau,Pt());for(const n of M)n.armed=!1,n.burning=!1,n.sparkT=-1,n.openHold=0,n.closedHold=0,n.hasSeed=!1;k.audio?.whoosh({strength:.75,duration:1.3,up:!0}),e.kick=Math.max(e.kick,.3),e.lastActivity=o}}function zt(o,n,r,s,v,m){return o>=4?o:(a.ign[o*4]=n,a.ign[o*4+1]=r,a.ign[o*4+2]=s,a.ign[o*4+3]=v,a.ignP[o*4]=m,a.ignP[o*4+1]=1,o+1)}const Ue=new Float32Array(6);function n0(o,n,r){const s=o.sparkFX*r,v=o.sparkFY,m=o.sparkTX*r,f=o.sparkTY,g=m-s,y=f-v,h=Math.hypot(g,y)||1e-4,D=(n===0?1:-1)*(g>=0?1:-1),gt=.4*h+.02;return Ue[0]=s,Ue[1]=v,Ue[2]=m,Ue[3]=f,Ue[4]=(s+m)/2-y/h*gt*D,Ue[5]=(v+f)/2+g/h*gt*D+h*.15,Ue}function f0(o){const n=w(o.dt||.016666666666666666,0,.05),r=o.time||0;e.time=r;const s=k.state.width/Math.max(1,k.state.height);e.live=c0(),jt(s);const v=k.source;if(v&&v.version!==e.srcVersion){e.srcVersion=v.version,e.roomReset=!0,e.smokeReset=!0,e.protFresh=!0,e.maskSeenAt=-1,e.cover=0,e.coverAt=-10,e.ignoreUntil=r+.3;for(const c of M)c.openHold=c.fistHold=c.pinchHold=c.closedHold=0,c.hasPrev=!1,c.probeOk=!1,c.burning=!1,c.sparkT=-1,c.armW=0,c.ptsT=-1}(!e.live||e.cover>.01&&r-e.coverAt<1.5)&&e.maskSeenAt<0&&(e.maskSeenAt=r),e.maskValid=e.maskSeenAt>=0&&r-e.maskSeenAt>.12?1:0,a.ign.fill(0),a.ignP.fill(0),a.forceP.fill(0),a.probe.fill(0);let f=0,g=0,y=!1,h=0;Ee.length=0;const D=i0;D[0]=D[1]=!1;const gt=r<e.cooldownUntil;e.mode===G&&e.frac>.97&&r-e.statsAt<1&&(e.spent=!0);for(const c of o.hands){const u=c.id&1,t=M[u];D[u]=!0;const d=c.points,E=Math.max(.001,c.size),P=r>=e.ignoreUntil&&(c.lost<.1||e.live&&c.lost<.4);t.hasPrev&&Math.hypot((c.palm[0]-t.prevX)*s,c.palm[1]-t.prevY)>.12&&(t.hasPrev=!1,t.hasSeed=!1,t.openHold=0,t.probeOk=!1,t.sparkT=-1,t.ptsT=-1,t.sizeAvg=0),c.gesture!==t.gesture&&(t.gesture=c.gesture,t.gestAt=r);const Fe=c.gesture==="fist"||c.gesture==="pinch"||c.pinching;P&&(t.open=!Fe&&(t.open?c.open>.6&&c.facing>.1:c.open>.86&&c.facing>.3));const q=P&&t.open,_e=P&&(c.open<.5||c.gesture==="fist"||c.pinching),ye=P&&(c.gesture==="fist"||c.fist>.8),bt=P&&c.pinching;t.openHold=q?c.speed<.55?t.openHold+n:Math.max(0,t.openHold-n):P?Math.max(0,t.openHold-n*3):t.openHold,t.fistHold=ye?t.fistHold+n:P?0:t.fistHold,t.pinchHold=bt?t.pinchHold+n:P?0:t.pinchHold,t.closedHold=_e?t.closedHold+n:P?0:t.closedHold,!t.armed&&(t.closedHold>.25||P&&c.fist>.8&&t.fistHold>.05)&&(t.armed=!0),t.palmX=c.palm[0],t.palmY=c.palm[1],t.size=E,t.wx=d[0],t.wy=d[1];let ce=(d[27]-d[0])*s,ne=d[28]-d[1];const et=Math.hypot(ce,ne)||1;ce/=et,ne/=et,t.ax=ce,t.ay=ne;let tt=!1;for(let x=0;x<63;x+=3)if(d[x]!==t.ptsPrev[x]||d[x+1]!==t.ptsPrev[x+1]){tt=!0;break}if(tt){const x=r-t.ptsT;if(t.ptsT>0&&x>.004&&x<.2)for(let T=0;T<21;T++){const Z=(d[T*3]-t.ptsPrev[T*3])*s/x,De=(d[T*3+1]-t.ptsPrev[T*3+1])/x;t.vel[T*2]+=(Z-t.vel[T*2])*.6,t.vel[T*2+1]+=(De-t.vel[T*2+1])*.6}else t.vel.fill(0);t.ptsPrev.set(d),t.ptsT=r}else if(r-t.ptsT>.15)for(let x=0;x<42;x++)t.vel[x]*=Math.exp(-n*8);t.w+=((e.live?1:0)-t.w)*Math.min(1,n*30),t.armW+=((e.live?1:0)-t.armW)*Math.min(1,n*30);const ot=.02+w(c.lost,0,.08)+(c.speed>1||r-t.gestAt<.35?.025:0),oe=u*21*4,wt=.3*E,Jt=w(c.velocity[0]*s,-4,4),Zt=w(c.velocity[1],-4,4);let Mt=0;for(let x=0;x<21;x++){let T=t.vel[x*2]-Jt,Z=t.vel[x*2+1]-Zt;const De=Math.hypot(T,Z),Oe=1.2;De>Oe&&(T*=Oe/De,Z*=Oe/De);let Lt=(Jt+.5*T)*ot,Nt=(Zt+.5*Z)*ot;const Ft=Math.hypot(Lt,Nt);Ft>wt&&(Lt*=wt/Ft,Nt*=wt/Ft),Mt=Math.max(Mt,Math.min(Ft,wt)),a.hand[oe+x*4]=d[x*3]*s,a.hand[oe+x*4+1]=d[x*3+1],a.hand[oe+x*4+2]=Lt,a.hand[oe+x*4+3]=Nt}const kt=Math.max(E,.92*Math.hypot((d[15]-d[51])*s,d[16]-d[52])/.78);t.sizeAvg=t.sizeAvg>0?t.sizeAvg+(kt-t.sizeAvg)*Math.min(1,n*1.5):kt;const Se=Math.max(kt,.85*t.sizeAvg),D0=w((.85*t.sizeAvg-kt)/(.85*t.sizeAvg),0,.6);a.handW[2+u]=Se,a.handR[u]=Mt,a.handR[2+u]=e.live?(Et(.12,.3,c.lost)*.25+D0*.6)*Se:0;{const x=-ne,T=ce,Z=(d[51]-d[0])*s*x+(d[52]-d[1])*T>=0?1:-1,De=d[0]*s-ce*.03*Se,Oe=d[1]-ne*.03*Se;a.wrist[u*4]=De-x*Z*.22*Se,a.wrist[u*4+1]=Oe-T*Z*.22*Se,a.wrist[u*4+2]=De+x*Z*.27*Se,a.wrist[u*4+3]=Oe+T*Z*.27*Se}a.arm[u*4]=d[0]*s,a.arm[u*4+1]=d[1],a.arm[u*4+2]=-ce,a.arm[u*4+3]=-ne,a.armP[u*4]=E,a.handS2[u*4]=w(d[15],0,1),a.handS2[u*4+1]=w(d[16],0,1),a.handS2[u*4+2]=w(d[30],0,1),a.handS2[u*4+3]=w(d[31],0,1),P&&(a.probe[u*4]=c.palm[0],a.probe[u*4+1]=c.palm[1],a.probe[u*4+2]=Math.min(E,.3),a.probe[u*4+3]=1,a.probeAx[u*4]=ce,a.probeAx[u*4+1]=ne,a.probeAx[u*4+2]=s),a.force[u*4]=c.palm[0]*s,a.force[u*4+1]=c.palm[1],a.force[u*4+2]=w(c.velocity[0]*s,-3,3),a.force[u*4+3]=w(c.velocity[1],-3,3),a.forceP[u*4]=E*1.5,a.forceP[u*4+1]=w(c.speed*.9,0,1.2)+(q?.1:0);const at=t.probeOk&&r-t.probeAt<.5,Ct=e.mode===I?.6:.45,Ht=q&&t.armed&&!gt&&!e.spent&&(!e.live||r-e.roomAt>.6),A0=Ht&&at&&t.probeR<1&&c.speed>.8&&e.mode!==I,Me=c.palm[0]+t.offX/s,Ce=c.palm[1]+t.offY;t.tx=Me,t.ty=Ce,t.near=at;const $t=Ht&&!t.burning?at?w(t.openHold/Ct,0,1):Math.min(.28,t.openHold/Ct*.28):0;if(t.charge+=($t-t.charge)*Math.min(1,n*($t>t.charge?16:7)),Ht&&at&&!t.burning&&t.sparkT<0&&(t.openHold>=Ct||A0)&&(t.sparkT=0,t.sparkTX=Me,t.sparkTY=Ce,k.audio?.whoosh({strength:.22,duration:.32,up:!0}),e.crackleBurst=Math.max(e.crackleBurst,.7)),t.sparkT>=0){t.sparkFX=c.palm[0],t.sparkFY=c.palm[1],t.burning||(t.sparkTX=Me,t.sparkTY=Ce);const x=t.sparkT;t.sparkT+=n,x<We&&t.sparkT>=We&&(t.open?(t.burning=!0,t.flare=1,t.flareX=t.sparkTX,t.flareY=t.sparkTY,t.seedX=t.sparkTX,t.seedY=t.sparkTY,t.hasSeed=!1,Rt(r,.6),f=zt(f,t.sparkTX*s,t.sparkTY,t.sparkTX*s,t.sparkTY,w(E*.4,.035,.09)),e.lastActivity=r):t.sparkT=-1),t.sparkT>We+.35&&(t.sparkT=-1)}if(t.burning){if(!q&&P)t.burning=!1;else if(at&&q){const x=!t.hasSeed||Math.hypot((Me-t.seedX)*s,Ce-t.seedY)>.12,T=x?Me:t.seedX,Z=x?Ce:t.seedY;f=zt(f,T*s,Z,Me*s,Ce,w(E*.35,.03,.08)),t.seedX=Me,t.seedY=Ce,t.hasSeed=!0,g++,e.lastActivity=r,e.windX+=c.velocity[0]*s*n*1.6,e.windY+=c.velocity[1]*n*1.6,e.mode!==G&&Rt(r,.3)}}(t.fistHold>.2||t.pinchHold>.9)&&(y=!0,e.lastActivity=r,t.sparkT=-1,t.burning=!1),t.prevX=c.palm[0],t.prevY=c.palm[1],t.hasPrev=!0,(t.charge>.25||t.burning)&&Ee.push("open"),q&&(t.charge>.2||t.burning)&&h++}for(let c=0;c<2;c++){const u=M[c];D[c]||(u.hasPrev=!1,u.hasSeed=!1,u.openHold=u.fistHold=u.pinchHold=u.closedHold=0,u.burning=!1,u.sparkT=-1,u.open=!1,u.w+=(0-u.w)*Math.min(1,n*2.5),u.charge*=Math.exp(-n*8),u.armW*=Math.exp(-n*.7),u.ptsT=-1,u.sizeAvg=0,!u.armed&&e.mode!==I&&(u.armed=!0)),u.seen=D[c],u.flare*=Math.exp(-n*5),a.handW[c]=u.w,a.armP[c*4+1]=u.armW,a.armP[c*4+2]=D[c]&&e.live?1:0}if(e.debugIgn){const c=e.debugIgn[0],u=e.debugIgn[1];e.debugIgn=null,Rt(r,.6),f=zt(f,c*s,u,c*s,u,.08),M[0].flare=1,M[0].flareX=c,M[0].flareY=u,e.lastActivity=r+30}if(e.debugHold&&(y=!1),y&&e.mode===G&&Tt(r),e.mode===G&&r-e.lastActivity>6&&Tt(r),e.mode===G){if(e.tau+=n*(1+.6*Math.max(0,g-1)),e.maxT>=0&&r-e.statsAt<1&&e.frac>.97&&(e.tau=Math.min(e.tau,Math.max(e.maxT,e.tauFirst)+2.5)),e.tau-e.tauFirst>e.rebaseAt&&!e.rebasePending){const u=e.rebaseAt/3,t=e.tau-u,d=e.tauFirst,E=u/4,P=Fe=>Fe>=t+E?Fe-t:E*w((Fe-d)/Math.max(t+E-d,.001),0,1);a.rebase[0]=t,a.rebase[1]=d,a.rebase[2]=E,a.rebase[3]=1,e.tau-=t,e.tauFirst=0,e.rebasePending=!0,e.statsGen++,e.rebases++,e.maxT>=0&&(e.maxT=P(e.maxT))}e.smokeUntil=r+3}else if(e.mode===I){const c=Pt();e.tau>c&&(e.tau=Math.max(c,e.tau-n*12)),e.rewindVel+=(2-e.rewindVel)*Math.min(1,n*4);const u=e.frac>.93&&r-e.statsAt<.3?2.5:1;if(e.tau-=n*e.rewindVel*u,e.tau<=0){e.tau=0,e.mode=H,e.tauFirst=-1,e.reset=!0,e.maxT=-1,e.frac=0,e.spent=!1,e.smokeUntil=r+1.2,e.cooldownUntil=r+1.5;for(const t of M)t.armed=!1;k.audio?.chime({strength:.55,pitch:1.25}),k.audio?.impact({strength:.2,pitch:1.8})}}e.windX*=Math.exp(-n*.9),e.windY*=Math.exp(-n*.9),e.windX=w(e.windX,-.8,.8),e.windY=w(e.windY,-.8,.8),a.wind[0]=.52+e.windX,a.wind[1]=.19+e.windY,a.wind[2]=.17;const Qt=Math.hypot(a.wind[0],a.wind[1])||1;a.windDir[0]=a.wind[0]/Qt,a.windDir[1]=a.wind[1]/Qt;const y0=e.mode===G&&(e.frac<.97||e.tau-e.tauFirst<1)&&(e.cover>.01||!e.live)?1:0;e.front+=(y0-e.front)*Math.min(1,n*3);const S0=e.mode===G?.4+.6*e.front:e.mode===I?1:0;e.activity+=(S0-e.activity)*Math.min(1,n*2.5),e.reform+=((e.mode===I?1:0)-e.reform)*Math.min(1,n*5),e.kick*=Math.exp(-n*4.5),e.charge=Math.max(M[0].charge,M[1].charge),e.flare=Math.max(M[0].flare,M[1].flare);for(let c=0;c<2;c++){const u=M[c],t=c*4,d=!e.live&&u.near,E=u.charge>.01&&(e.live||d);a.handC[t]=(d?u.tx:u.palmX)*s,a.handC[t+1]=d?u.ty:u.palmY,a.handC[t+2]=d?u.size*.55:u.size,a.handC[t+3]=E?u.charge:0,a.handK[t]=u.wx*s,a.handK[t+1]=u.wy,a.handK[t+2]=u.ax,a.handK[t+3]=u.ay,u.rim+=((u.seen&&e.live&&e.mode!==H?1:0)-u.rim)*Math.min(1,n*6),a.handS[t]=u.w,a.handS[t+1]=u.rim,a.handS[t+2]=w(u.palmX,0,1),a.handS[t+3]=w(u.palmY,0,1);const P=u.sparkT,Fe=P>=0?Math.min(1,P/We):0,q=1-(1-Fe)*(1-Fe),_e=P>=0&&e.live?P<We?1:Math.exp(-(P-We)*12):0,ye=n0(u,c,s),bt=ye[0],ce=ye[1],ne=ye[2],et=ye[3],tt=ye[4],ot=ye[5];a.spark[t]=bt,a.spark[t+1]=ce,a.spark[t+2]=ne,a.spark[t+3]=et,a.sparkC[t]=tt,a.sparkC[t+1]=ot,a.sparkC[t+2]=q,a.sparkC[t+3]=_e>.01?_e:0;const oe=1-q;a.sparkH[t]=oe*oe*bt+2*oe*q*tt+q*q*ne,a.sparkH[t+1]=oe*oe*ce+2*oe*q*ot+q*q*et,a.sparkH[t+2]=_e>.01?_e:0,a.flare[t]=u.flareX*s,a.flare[t+1]=u.flareY,a.flare[t+2]=u.flare>.01?u.flare:0}const he=k.audio;if(e.crackleBurst*=Math.exp(-n*6),he){const c=e.charge,u=e.crackleBurst;if(e.mode===G){const t=Math.min(1,Math.hypot(e.windX,e.windY));A.noise.level=.1+.3*e.front+.3*t,A.noise.tone=.4+.25*e.front,he.layer("noise",A.noise),A.crackle.level=Math.max(.3*e.front,.3*c,.5*u),he.layer("crackle",A.crackle),A.hum.level=.07+.09*e.front,A.hum.pitch=.55,he.layer("hum",A.hum)}else if(e.mode===I){const t=1-w(e.tau/Math.max(.5,Pt()),0,1);A.noise.level=.2,A.noise.tone=.72+.25*t,he.layer("noise",A.noise),A.hum.level=.2,A.hum.pitch=1+.9*t,he.layer("hum",A.hum),(c>.02||u>.02)&&(A.crackle.level=Math.max(.25*c,.5*u),he.layer("crackle",A.crackle))}else(c>.02||u>.02)&&(A.crackle.level=Math.max(.28*c,.5*u),he.layer("crackle",A.crackle),A.hum.level=.12*c,A.hum.pitch=.7+.5*c,he.layer("hum",A.hum))}(g>1||h>1)&&Ee.push("two"),e.live&&e.mode===H&&e.cover>.04&&r-e.knownAt<1.5&&e.known<.4&&Ee.push("aside"),e.mode===I&&y&&Ee.push("fist")}function m0(o){if(de&&l.getSyncParameter(de,l.SYNC_STATUS)===l.SIGNALED&&++It>1&&(l.bindBuffer(l.PIXEL_PACK_BUFFER,mt),l.getBufferSubData(l.PIXEL_PACK_BUFFER,0,j),l.bindBuffer(l.PIXEL_PACK_BUFFER,null),l.deleteSync(de),de=null,Kt===e.srcVersion&&Gt===e.statsGen)){e.cover=j[3]/255,e.coverAt=e.time,e.sceneDiff=j[12]/255;const r=j[13]/255;e.known=j[14]/255,e.knownAt=e.time,e.sceneBad=e.live&&r>.08&&e.sceneDiff>.045?e.sceneBad+1:0,e.sceneBad>=3&&(e.roomSoft=!0,e.sceneBad=0,e.fillHoldUntil=e.time+.45,e.replates++),e.mode!==H&&(e.maxT=(j[0]*256+j[1])/65535*128,e.frac=j[2]/255,e.statsAt=e.time);for(let s=0;s<2;s++){if(!Xt[s])continue;const v=4+s*4,m=M[s];m.probeOk=j[v+3]>127,m.probeR=m.probeOk?j[v]/255*2.5:9,m.probeOk&&(m.offX=(j[v+1]/255-.5)*5*St[s],m.offY=(j[v+2]/255-.5)*5*St[s]),m.probeAt=e.time}}const n=a.probe[3]>.5||a.probe[7]>.5;if(!de&&(e.mode!==H||e.live||n)&&++s0%h0===0){ze.uField=R.read,ze.uMask=o.mask,ze.uTau=e.tau,ze.uMaskD=ve,ze.uRoom=ee.read,ze.uBase=o.base,i.pass(p.statsA,lt,ze),Je.uSrc=lt,Je.uMask=o.mask,Je.uField=R.read,Je.uTau=e.tau,i.pass(p.statsB,ct,Je);for(let r=0;r<2;r++)Xt[r]=a.probe[r*4+3]>.5,St[r]=a.probe[r*4+2];ct.bind(),l.bindBuffer(l.PIXEL_PACK_BUFFER,mt),l.readPixels(0,0,4,1,l.RGBA,l.UNSIGNED_BYTE,0),l.bindBuffer(l.PIXEL_PACK_BUFFER,null),de=l.fenceSync(l.SYNC_GPU_COMMANDS_COMPLETE,0),l.flush(),It=0,Kt=e.srcVersion,Gt=e.statsGen}}function v0(o,n){for(const r of n)a.dirX[0]=r/o.width,a.dirX[1]=0,a.dirY[0]=0,a.dirY[1]=r/o.height,Be.uSrc=o.read,Be.uDir=a.dirX,i.pass(p.blur,o.write,Be),o.swap(),Be.uSrc=o.read,Be.uDir=a.dirY,i.pass(p.blur,o.write,Be),o.swap()}const d0=$?[2.2]:[1.4,2.8],p0=$?4:3,h0=$?4:3;let ke=-1;const pt=()=>ae.length>1?ae[0]:X;function x0(){const o=re.width,n=re.height;K.uFillRes[0]=o,K.uFillRes[1]=n;const r=e.roomFFresh||e.nnfReset||e.pmConv<12;if(e.roomTick=!e.roomTick,r||e.roomTick){Q.uSrc=ee.read,Q.uCur=Y.read,Q.uL=F[0],Q.uR=F[1],Q.uD=F[2],Q.uU=F[3];for(let s=0;s<($||e.pmConv>40?1:2);s++)Q.uNNF=se.read,Q.uJump=s===1?1:Yt[e.pmIter%Yt.length],Q.uSeed=(e.pmIter*.618034+s*.37)%1*97,Q.uReset=e.nnfReset?1:0,Q.uCurOK=e.roomFFresh?0:1,i.pass(p.pm,se.write,Q),se.swap(),e.nnfReset&&(e.pmConv=0),e.nnfReset=!1;if(e.pmIter++,e.pmConv++,!r)return}K.uRoom=ee.read,K.uNNF=se.read,K.uPrevF=Y.read,K.uL=F[0],K.uR=F[1],K.uD=F[2],K.uU=F[3],K.uBlend=e.roomFFresh?1:.45,K.uLow=z.length?z[0]:X,i.pass(p.roomFin,Y.write,K),Y.swap(),e.roomFFresh=!1}function Ut(o,n=-1){const r=fe.width,s=fe.height;if(n<0){for(let f=0;f<3;f++)Ut(o,f);return}if(n===0){dt.uRoom=ee.read,dt.uAxis[0]=1/r,dt.uAxis[1]=1/s,i.pass(p.pref,X,dt);const f=Math.ceil(Math.sqrt(Math.max(r,s)))+1;ie.uRadix=f;for(let h=0;h<4;h++)ie.uSrc=X,ie.uDir=Vt[h],ie.uStep=1,ie.uInit=1,i.pass(p.scan,be,ie),ie.uSrc=be,ie.uStep=f,ie.uInit=0,i.pass(p.scan,F[h],ie);let g=X;for(let h=0;h<z.length;h++)ue.uSrc=g,ue.uTexel[0]=1/g.width,ue.uTexel[1]=1/g.height,ue.uFirst=h===0?1:0,i.pass(p.push,z[h],ue),g=z[h];const y=z.length;for(let h=y-2;h>=0;h--)_.uFine=z[h],_.uCoarse=h===y-2?z[y-1]:ae[h+1],_.uCoarseTop=h===y-2?1:0,i.pass(p.pull,ae[h],_);return}if(n===1){Te.uIso=pt(),Te.uPref=X,Te.uL=F[0],Te.uR=F[1],Te.uD=F[2],Te.uU=F[3],i.pass(p.combine,fe,Te),N.uL=F[0],N.uR=F[1],N.uD=F[2],N.uU=F[3],N.uPref=fe,N.uSrc=fe,N.uDir[0]=1/r,N.uDir[1]=0,N.uLast=0,i.pass(p.vblur,be,N),N.uSrc=be,N.uDir[0]=0,N.uDir[1]=1/s,N.uLast=1,i.pass(p.vblur,X,N),O.uL=F[0],O.uR=F[1],O.uD=F[2],O.uU=F[3],O.uPref=fe,O.uIso=pt(),O.uSrc=X,O.uStepDir=l0,O.uLast=0,i.pass(p.bilat,be,O),O.uSrc=be,O.uStepDir=u0,O.uLast=1,i.pass(p.bilat,re,O),e.guideReady=!0;return}we.uRoom=ee.read,we.uBase=o.base,we.uMask=o.mask,we.uMaskD=ve,we.uTex[0]=1/r,we.uTex[1]=1/s,we.uLive=e.live?1:0,i.pass(p.trust,st,we),Qe.uRoomF=Y.read,Qe.uTrust=st,Qe.uTex[0]=1/r,Qe.uTex[1]=1/s,i.pass(p.corr,Ie,Qe);let v=Ie;for(let f=0;f<B.length;f++)ue.uSrc=v,ue.uTexel[0]=1/v.width,ue.uTexel[1]=1/v.height,ue.uFirst=0,i.pass(p.push,B[f],ue),v=B[f];const m=B.length;_.uZero=1;for(let f=m-2;f>=0;f--)_.uFine=B[f],_.uCoarse=f===m-2?B[m-1]:me[f+1],_.uCoarseTop=f===m-2?1:0,i.pass(p.pull,me[f],_);_.uFine=Ie,_.uCoarse=m>1?me[0]:B[0],_.uCoarseTop=m>1?0:1,i.pass(p.pull,Ke,_),_.uZero=0}let Ze=null,ht=null;const $e=[];function pe(o){const n=globalThis.__dustProf;if(n&&(Ze||(Ze=l.getExtension("EXT_disjoint_timer_query_webgl2")),!!Ze)){if(ht&&(l.endQuery(Ze.TIME_ELAPSED_EXT),$e.push(ht),ht=null),o&&$e.length<64){const r=l.createQuery();l.beginQuery(Ze.TIME_ELAPSED_EXT,r),ht={q:r,name:o}}for(let r=$e.length-1;r>=0;r--){const s=$e[r];if(!l.getQueryParameter(s.q,l.QUERY_RESULT_AVAILABLE))continue;const v=l.getQueryParameter(s.q,l.QUERY_RESULT)/1e6;(n[s.name]=n[s.name]||[]).push(v),n[s.name].length>240&&n[s.name].shift(),l.deleteQuery(s.q),$e.splice(r,1)}}}function g0(o){jt(o.aspect),pe("pre");const n=w(o.dt||1/60,0,.05),r=e.mode!==H||e.reset,s=e.mode!==H||e.charge>.01||e.flare>.01||a.sparkC[3]>0||a.sparkC[7]>0;if(a.res[0]=R.width,a.res[1]=R.height,a.renderRes[0]=o.scene.width,a.renderRes[1]=o.scene.height,e.frameNo++,e.noiseDirty&&(je.uAspect=o.aspect,je.uWhich=0,i.pass(p.noise,Ae,je),je.uWhich=1,i.pass(p.noise,it,je),e.noiseDirty=!1),e.noiseCDone||(i.pass(p.noiseC,ut,{}),e.noiseCDone=!0),At.uMask=o.mask,At.uAspect=o.aspect,i.pass(p.maskD,ve,At),le.uPrev=ee.read,le.uBase=o.base,le.uMaskD=ve,le.uAspect=o.aspect,e.roomReset&&(e.roomAt=e.time,e.nnfReset=!0,e.roomFFresh=!0),le.uField=R.read,le.uValid=e.maskValid,le.uReset=e.roomReset?1:e.roomSoft?2:0,le.uStats=ct,le.uGate=e.live?1:0,i.pass(p.plate,ee.write,le),ee.swap(),e.roomReset=!1,e.roomSoft=!1,pe("field"),r||e.live||s){for(let D=0;D<2;D++)L.uPrev=R.read,L.uMask=o.mask,L.uMaskD=ve,L.uNoiseB=it,L.uAspect=o.aspect,L.uTau=e.tau,L.uReset=e.reset&&D===0?1:0,L.uFirst=D===0?1:0,L.uRebase=D===0&&e.rebasePending?a.rebase:a.noRebase,L.uDt=D===0?n:0,L.uBump=e.live&&e.mode===G?1:0,L.uRewind=e.mode===I?1:0,L.uPropagate=e.mode===I?0:1,L.uSpeed=.32*(.7+.3*w(o.aspect,0,1)),i.pass(p.field,R.write,L),R.swap();qe.uBase=o.base,qe.uAspect=o.aspect,a.protTex[0]=1/R.width,a.protTex[1]=1/R.height,a.handW[0]>.01||a.handW[1]>.01||a.armP[1]>.01||a.armP[5]>.01?(qe.uDt=n,qe.uMem=e.protFresh?0:1,e.protFresh=!1,qe.uTime=o.time,i.pass(p.prot,V,qe),o.copy(V,Ne),e.protClear=!1):e.protClear||(V.clear(.06,0,0,1),Ne.clear(.06,0,0,1),e.protClear=!0)}pe("light"),(r||s)&&(Pe.uField=R.read,Pe.uMask=o.mask,Pe.uNoiseA=Ae,Pe.uTau=e.tau,Pe.uOn=e.mode!==H?1:0,Pe.uAspect=o.aspect,i.pass(p.emit,Le.write,Pe),Le.swap(),v0(Le,d0),vt.uSrc=Le.read,vt.uAspect=o.aspect,vt.uTime=o.time,i.pass(p.lightFin,Xe,vt));const v=e.mode!==H||e.time<e.smokeUntil;(r||s||v)&&(Dt.uAspect=o.aspect,Dt.uTime=o.time,i.pass(p.flow,Ge,Dt)),pe("fill"),ke<0&&(r||e.charge>.05||Ye)&&e.time>=e.fillHoldUntil&&(e.fillDirty||e.frameNo%p0===0)&&(e.fillDirty=!1,ke=0),ke>=0&&(Ut(o,ke),ke=ke<2?ke+1:-1),e.guideReady&&(r||e.charge>.05||Ye)&&x0(),pe("smoke"),(v||e.smokeReset)&&(C.uPrev=ge.read,C.uFlow=Ge,C.uField=R.read,C.uMask=o.mask,C.uMaskD=ve,C.uNoiseA=Ae,C.uRoomF=Y.read,C.uLive=e.live?1:0,C.uDt=n,C.uAspect=o.aspect,C.uTau=e.tau,C.uMode=e.mode,C.uTime=o.time,C.uDecay=e.mode===G?.55:e.mode===I?2.4:3,C.uReset=e.smokeReset?1:0,i.pass(p.smoke,ge.write,C),ge.swap(),e.smokeReset=!1,Ve.uSmoke=ge.read,Ve.uAmb=pt(),Ve.uAmbG=z.length?z[z.length-1]:X,Ve.uAspect=o.aspect,Ve.uTime=o.time,i.pass(p.veil,rt,Ve)),e.rebasePending=!1,m0(o),pe("comp");const m=a.lc,f=e.reform;m[0]=1+(.38-1)*f,m[1]=.48+(.52-.48)*f,m[2]=.2+(.7-.2)*f,S.uBase=o.base,S.uMask=o.mask,S.uMaskD=ve,S.uField=R.read,S.uLight=Xe,S.uNormals=s?o.normals():o.base,S.uNoiseA=Ae,S.uRoomF=Y.read,S.uSmoke=ge.read,S.uVeil=rt,S.uSmokeOn=v||Ye===5?1:0,S.uGuideT=re,S.uNNF=se.read,S.uTau=e.tau,S.uTime=o.time,S.uAspect=o.aspect,S.uReform=e.reform,S.uActive=e.mode!==H?1:0,S.uFx=s?1:0,S.uDebug=Ye;const g=k.source,y=k.sourceMap?k.sourceMap():null;if(g&&g.width>0&&y&&(a.camRes[0]=g.width*Math.abs(y[0]),a.camRes[1]=g.height*Math.abs(y[1])),S.uNoiseAmp=e.live?w(e.sceneDiff*1,0,.025):.004,S.uSrcFrame=(o.sourceFrame||0)%4096,i.pass(p.comp,o.scene,S),pe("sim"),e.mode!==H||e.reset){const D=1-ft;W.uField=R.read,W.uMask=o.mask,W.uBase=o.base,W.uNoiseA=Ae,W.uFlow=Ge,W.uAspect=o.aspect,W.uTau=e.tau,W.uDt=n,W.uTime=o.time,W.uMode=e.mode,W.uReset=e.reset?1:0,W.uTurb=1+e.activity*.3,W.uHands=e.protClear?0:1,p.update.use().set(W),l.bindVertexArray(_t[ft]),l.bindTransformFeedback(l.TRANSFORM_FEEDBACK,Wt[D]),l.enable(l.RASTERIZER_DISCARD),l.beginTransformFeedback(l.POINTS),l.drawArrays(l.POINTS,0,He),l.endTransformFeedback(),l.disable(l.RASTERIZER_DISCARD),l.bindTransformFeedback(l.TRANSFORM_FEEDBACK,null),l.bindVertexArray(null),ft=D,e.reset=!1}pe("draw"),e.mode!==H&&(o.scene.bind(),te.uAspect=o.aspect,te.uTime=o.time,te.uRate=e.rewindVel,te.uLight=Xe,te.uField=R.read,te.uMask=o.mask,te.uBase=o.base,te.uAmb=pt(),te.uTau=e.tau,te.uCell=o.scene.height/Math.max(1,e.gridH),p.draw.use().set(te),l.bindVertexArray(Ot[ft]),i.blend("premultiplied"),l.drawArraysInstanced(l.TRIANGLE_STRIP,0,4,He),l.disable(l.BLEND),l.bindVertexArray(null)),pe(null);const h=o.post;if(h.bloom=.06+.12*e.front*(1-e.reform)+.07*e.reform*e.activity+.06*Math.max(e.charge,e.flare),h.exposure=1,h.vignette=.36+.03*e.activity,h.grain=.034,h.aberration=.005*e.kick+.002*e.flare,h.flash=.02*e.kick*e.kick,e.kick>.02){const D=e.kick*e.kick*.0025;h.shake[0]=(Math.sin(o.time*71.3)+Math.sin(o.time*43.1))*D,h.shake[1]=(Math.cos(o.time*63.7)+Math.sin(o.time*37.9))*D}}const b0=[],J={x:0,y:0,size:.17,roll:0,side:"right",curls:null},xt={pts:null,side:"right"};function w0(o,n,r,s,v){(e.choreoStart<0||o<e.choreoStart)&&(e.choreoStart=e.cycleStart=o,e.choreoEmpty=e.choreoDone=-1);let m=o-e.cycleStart;(e.choreoDone>0&&m>e.choreoDone+2.2||m>R0)&&(e.cycleStart=o,m=0,e.choreoEmpty=e.choreoDone=-1),e.choreoEmpty<0&&e.mode===G&&e.frac>.97&&m>1.5&&(e.choreoEmpty=m);const f=e.choreoEmpty>0?w(e.choreoEmpty+1.3,3.4,5.1):5.1;e.choreoDone<0&&e.mode===H&&m>f+.4&&(e.choreoDone=m);const g=b0;if(g.length=0,m>.3&&m<3.1){const y=Et(1.15,3,m);J.x=.7-.32*y,J.y=.46+.34*y+.015*Math.sin(m*3.1)*y,J.size=.17,J.roll=-.45+.3*y,J.curls=v.open,xt.pts=s(J,n,r[0]),g.push(xt)}else if(m>f&&m<f+1){const y=Et(f,f+1,m);J.x=.66-.04*y,J.y=.3+.05*y,J.size=.16,J.roll=-.25,J.curls=v.fist,xt.pts=s(J,n,r[0]),g.push(xt)}return g}function k0(){e.mode=H,e.tau=0,e.tauFirst=-1,e.reset=!0,e.reform=0,e.activity=0,e.kick=0,e.windX=e.windY=0,e.front=0,e.choreoStart=-1,e.choreoEmpty=-1,e.choreoDone=-1,e.lastActivity=e.time,e.maxT=-1,e.frac=0,e.cooldownUntil=0,e.charge=0,e.flare=0,e.flips=0,e.spent=!1,e.smokeReset=!0,e.protFresh=!0,e.smokeUntil=-1,e.crackleBurst=0;for(const o of M)o.openHold=o.fistHold=o.pinchHold=o.closedHold=0,o.hasPrev=!1,o.w=0,o.rim=0,o.armed=!0,o.armW=0,o.burning=!1,o.sparkT=-1,o.charge=0,o.flare=0,o.probeOk=!1,o.hasSeed=!1,o.open=!1,o.ptsT=-1,o.vel.fill(0)}function F0(){for(const o of Object.values(p))o.dispose();R.dispose(),Le.dispose(),ge.dispose(),rt.dispose(),ee.dispose(),Y.dispose(),ve.dispose(),V.dispose(),Ne.dispose(),Ae.dispose(),it.dispose(),ut.dispose(),Ge.dispose(),Xe.dispose();for(const o of[fe,X,be,...F,...z,...ae,...B,...me,Ie,Ke,st,re])o.dispose();lt.dispose(),ct.dispose(),se.dispose(),z.length=ae.length=B.length=me.length=0;for(const o of[..._t,...Ot])l.deleteVertexArray(o);for(const o of Wt)l.deleteTransformFeedback(o);for(const o of Re)l.deleteBuffer(o);de&&l.deleteSync(de),de=null,l.deleteBuffer(mt)}return{id:"disintegrate",coach:[{gesture:"open",label:"Open palm",text:"hold beside you to ignite"},{gesture:"two",label:"Both palms",text:"burn from both sides"},{gesture:"fist",label:"Close hand",text:"pull yourself back"},{gesture:"aside",icon:"move",label:"Step aside",text:"a moment first, so I can see the room"}],activeCues(){return Ee},update:f0,render:g0,reset:k0,dispose:F0,choreography:w0,set debugView(o){Ye=+o||0,e.fillDirty=!0},set debugRebaseAt(o){e.rebaseAt=+o||t0},debugIgnite(o,n,r){o>=0&&(e.debugIgn=[o,n]),e.debugHold=!!r},debugReform(){e.debugHold=!1,Tt(e.time)},debugBenchFill(o,n){for(let r=0;r<n;r++)Ut(o)},get debugTargets(){return{scanF:F,prefV:X,prefH:fe,guide:re,nnf:se.read,room:ee.read,roomF:Y.read,smoke:ge.read}},get debug(){return{choreoStart:e.choreoStart,cycleStart:e.cycleStart,mode:e.mode,tau:e.tau,tauFirst:e.tauFirst,maxT:e.maxT,frac:e.frac,cover:e.cover,reform:e.reform,activity:e.activity,grid:[e.gridW,e.gridH],N:He,field:[R.width,R.height],charge:e.charge,flips:e.flips,sceneDiff:e.sceneDiff,known:+e.known.toFixed(3),replates:e.replates,cooldown:Math.max(0,e.cooldownUntil-e.time),rebases:e.rebases,spent:e.spent,handW:Array.from(a.handW,o=>+o.toFixed(3)),handR:Array.from(a.handR,o=>+o.toFixed(3)),hands:M.map(o=>({armed:o.armed,burning:o.burning,near:o.probeOk,r:+o.probeR.toFixed(2),hold:+o.openHold.toFixed(2),charge:+o.charge.toFixed(2),spark:+o.sparkT.toFixed(2),off:[+o.offX.toFixed(3),+o.offY.toFixed(3)]}))}}}}export{so as createEffect};
