/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-716f4e0ec7c7 */(()=>{const z=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(z)||z.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as Be,COMMON as Zt}from"../engine/glsl.js?v=515dba1803";const Le=Math.PI*2,Ze=(z,C,c)=>z<C?C:z>c?c:z,$e=z=>z<0?0:z>1?1:z,Oe=(z,C,c,K)=>z+(C-z)*(1-Math.exp(-c*K)),Ho=typeof location<"u"&&/[?&]fxdebug\b/.test(location.search||""),Je=10,zo=14e4,B0=8,Vo=72,Ee=720,$t=40,Ft=20,Hn=Ft*2,zn=8,J0=Hn+zn,St=J0+64,Ie=1800,ft=16,ht=2400,pe=64,No=24,Vn=.14,Nn=.45,Oo=.3,Pr=.42,Io=.1,Go=1.5,On=0,en=4,tn=5,E0=7,F0=8,S0=9,Jt=11,In=16,Lr=200,Gn=201,nn=202,Wo=203,Wn=204,de=0,qo=1,e0=2,t0=3,Ko=4,T0=5,ye=0,n0=1,Yo=[0,1,1,2,2,3,3,4,0,5,5,6,6,7,7,8,9,10,10,11,11,12,13,14,14,15,15,16,0,17,17,18,18,19,19,20,5,9,9,13,13,17,0,9,0,13,1,5],Xo=[.19,.15,.13,.115,.17,.11,.1,.09,.11,.1,.09,.105,.095,.085,.17,.09,.08,.075,.16,.16,.15,.21,.21,.19],Cr=[.4,.7,.7,.7,.25,.7,.7,.7,.7,.7,.7,.7,.7,.7,.25,.7,.7,.7,.25,.25,.25,.25,.25,.3],Dr=`
float handAlpha(sampler2D fgT,sampler2D bgT,vec2 st,vec3 c,float k,out vec3 B){
  B=c;
  float near=smoothstep(0.0,0.05,k);
  if(near<=0.0) return 0.0;
  vec4 fs=texture(fgT,st), bs=texture(bgT,st);
  float cov=smoothstep(0.1,0.5,k);
  float hasF=smoothstep(0.005,0.05,fs.a), hasB=smoothstep(0.005,0.05,bs.a);
  vec3 Bl=bs.rgb/max(bs.a,1e-4);
  vec3 gc=sqrt(max(c,0.0)), gf=sqrt(max(fs.rgb/max(fs.a,1e-4),0.0)), gb=sqrt(max(Bl,0.0));
  vec3 d=gf-gb; float dd=dot(d,d);
  float al=clamp(dot(gc-gb,d)/max(dd,1e-4),0.0,1.0);
  // deep inside a finger the capsule prior wins: overshoot rings and specular glints at the colour line
  // must never punch a dark hairline into the finger
  al=max(al,0.9*smoothstep(0.5,0.95,k));
  // hand and room of the same colour cannot be told apart: then only a faint capsule prior remains
  float rel=smoothstep(0.05,0.14,sqrt(dd));
  B=mix(c,Bl,hasB);
  return near*hasF*mix(cov,mix(0.12*cov,al,rel),hasB);
}`,_r=`#version 300 es
precision highp float;
layout(location=0)in vec2 aPos;
layout(location=1)in vec4 aA;
layout(location=2)in vec4 aC;
uniform vec2 uRes;
out float vAcross;out float vHalfW;out float vCore;out float vEnergy;out vec3 vCol;out float vBehind;
void main(){
vAcross=aA.x;vHalfW=aA.y;vCore=aA.z;vEnergy=aA.w;vCol=aC.rgb;vBehind=aC.a;
gl_Position=vec4(aPos/uRes*2.0-1.0,0.0,1.0);
}`,Ur=Be+Zt+`
in float vAcross;in float vHalfW;in float vCore;in float vEnergy;in vec3 vCol;in float vBehind;
uniform sampler2D uMask;uniform vec2 uTarget;uniform float uPix;uniform float uGain;
out vec4 outColor;
void main(){
float d=abs(vAcross)*vHalfW;
float c=max(vCore,0.0);
float cw=max(c,0.5*uPix);
float core=saturate((cw+0.5*uPix-d)/uPix)*(c/cw);
float x=d/max(c*2.2+0.8*uPix,0.6);
float inner=exp(-x*x);
float r=saturate(d/max(vHalfW,1e-3));
float mid=exp(-r*6.5)*(1.0-r);
float wide=exp(-r*2.6)*(1.0-r)*(1.0-r);
vec3 col;
if(vBehind>1.5){
col=vCol*(core*3.2+inner*1.3+mid*0.55)+vCol*vCol*wide*0.5;
}else col=vec3(1.0,0.985,1.0)*core*4.6+mix(vec3(1.0),vCol,0.4)*inner*1.7+vCol*(mid*0.62+wide*0.09);
col*=vEnergy*uGain;
if(vBehind>0.5&&vBehind<1.5){
float m=texture(uMask,gl_FragCoord.xy/uTarget).r;
col*=1.0-smoothstep(0.3,0.75,m);
}
outColor=vec4(col,1.0);
}`,Hr=`#version 300 es
precision highp float;
layout(location=0)in vec4 iA;
layout(location=1)in vec4 iB;
uniform vec2 uRes;
out vec2 vQ;out vec4 vB;out float vExt;
void main(){
vec2 corner=vec2(float(gl_VertexID&1),float((gl_VertexID>>1)&1))*2.0-1.0;
vQ=corner*iA.w;vB=iB;vExt=iA.w;
gl_Position=vec4((iA.xy+corner*iA.z*iA.w)/uRes*2.0-1.0,0.0,1.0);
}`,zr=Be+Zt+`
in vec2 vQ;in vec4 vB;in float vExt;
uniform sampler2D uMask;uniform vec2 uTarget;uniform float uTime;uniform float uGain;
out vec4 outColor;
void main(){
float r=length(vQ);
if(r>vExt)discard;
float E=vB.x,type=vB.y,seed=vB.z;
vec2 cs=vQ/max(r,1e-4);
vec3 col;
if(type<0.5){
float core=exp(-r*r*14.0);
float glow=exp(-r*2.6);
float halo=exp(-r*r*0.9);
float n1=0.75+0.5*snoise(vec3(cs*1.1+seed,uTime*12.0+seed));
col=vec3(1.0,0.98,1.0)*core*3.6+vec3(0.42,0.46,1.0)*glow*1.0*n1+vec3(0.36,0.3,1.0)*halo*0.16;
}else if(type<1.5){
float core=exp(-r*r*16.0);
float glow=exp(-r*3.0);
float n=0.8+0.4*snoise(vec3(cs*1.3+seed,uTime*14.0+seed));
col=vec3(1.0)*core*3.4+vec3(0.6,0.76,1.0)*glow*0.85*n+vec3(0.55,0.7,1.0)*exp(-r*r*0.9)*0.1;
}else if(type<2.5){
float core=exp(-r*r*9.0);
float halo=exp(-r*1.7);
float n=0.75+0.5*snoise(vec3(cs*2.0,uTime*14.0+seed));
col=vec3(1.0,0.96,0.98)*core*4.5+vec3(0.62,0.56,1.0)*halo*0.75*n;
}else{
col=vec3(0.62,0.68,1.0)*exp(-r*r*2.2)+vec3(1.0)*exp(-r*r*14.0)*1.5;
}
col*=E*uGain*(1.0-smoothstep(vExt*0.72,vExt,r));
if(vB.w>0.5){
float m=texture(uMask,gl_FragCoord.xy/uTarget).r;
col*=1.0-smoothstep(0.3,0.75,m);
}
outColor=vec4(col,1.0);
}`,Vr=`#version 300 es
precision highp float;
uniform vec2 uRes;uniform vec4 uBall;
out vec2 vQ;
void main(){
vec2 corner=vec2(float(gl_VertexID&1),float((gl_VertexID>>1)&1))*2.0-1.0;
vQ=corner*uBall.w;
gl_Position=vec4((uBall.xy+corner*uBall.z*uBall.w)/uRes*2.0-1.0,0.0,1.0);
}`,Nr=Be+Zt+`
in vec2 vQ;out vec4 outColor;
uniform vec4 uBall;uniform vec4 uBallB;
uniform sampler2D uHand;uniform sampler2D uAlpha;uniform vec2 uTarget;uniform float uHtoPx;
uniform float uTime;uniform float uGain;
void main(){
float r=length(vQ),ext=uBall.w,seed=uBallB.y;
vec2 cs=vQ/max(r,1e-4);
float core=exp(-r*r*40.0)*5.0+exp(-r*r*10.0)*0.35;
float body=exp(-r*r*2.2)*(1.0-smoothstep(0.85,1.2,r));
float rim=exp(-pow((r-0.96)/0.12,2.0));
float ang=atan(vQ.y,vQ.x);
float shellN=0.6+0.8*(0.5+0.5*sin(ang*7.0+uTime*13.0+seed)*sin(ang*3.0-uTime*9.0));
float fil=0.0;
if(r<1.3){
float w=0.35*sin(ang*3.0+uTime*1.3+seed)+0.25*sin(r*5.0-uTime*2.1);
float f1=1.0-abs(snoise(vec3(cs*1.7+vec2(w,uTime*0.23),r*0.9-uTime*1.7+seed)));
float f2=1.0-abs(snoise(vec3(cs*3.1-vec2(uTime*0.19,w),r*1.4-uTime*2.5-seed)));
fil=(pow(saturate(f1),16.0)*1.5+pow(saturate(f2),22.0)*1.0)*(1.0-smoothstep(0.1,1.3,r));
}
float corona=exp(-max(r-0.9,0.0)*3.2)*0.3;
vec3 col=vec3(1.0,0.98,1.0)*core+vec3(0.30,0.26,1.0)*body*0.1+vec3(0.62,0.70,1.0)*rim*0.6*shellN
+vec3(0.85,0.68,1.0)*fil*4.2+vec3(0.32,0.36,1.0)*corona*0.45;
col*=uBallB.x*uGain*(1.0-smoothstep(ext*0.72,ext,r));
if(uBallB.z>0.5){
vec2 st=gl_FragCoord.xy/uTarget;
vec4 hv=texture(uHand,st);
float q=texture(uAlpha,st).b;
float occ=1.0-max(smoothstep(0.3,0.75,q),smoothstep(0.6,1.2,hv.r));
float ht=min(hv.r,1.0)*uHtoPx;
float edgePx=max(1.5,uBall.z*0.07);
float sss=(1.0-occ)*exp(-ht/edgePx);
float lum=luma(col);
col=col*occ+vec3(1.0,0.34,0.2)*min(lum,6.0)*sss*0.3;
}
outColor=vec4(col,1.0);
}`,Or=`#version 300 es
precision highp float;
layout(location=0)in vec4 iA;
layout(location=1)in vec4 iB;
layout(location=2)in vec4 iC;
uniform vec2 uRes;
out vec2 vP;out vec4 vA;out vec4 vB;out float vW;
void main(){
vec2 a=iA.xy,b=iA.zw;float r=iB.x*1.35+1.5;
vec2 d=b-a;float l=length(d);vec2 u=l>1e-3?d/l:vec2(1.0,0.0);vec2 n=vec2(-u.y,u.x);
vec2 corner=vec2(float(gl_VertexID&1),float((gl_VertexID>>1)&1));
vec2 p=mix(a-u*r,b+u*r,corner.x)+n*r*(corner.y*2.0-1.0);
vP=p;vA=iA;vB=iB;vW=iC.x;
gl_Position=vec4(p/uRes*2.0-1.0,0.0,1.0);
}`,Ir=Be+`
in vec2 vP;in vec4 vA;in vec4 vB;in float vW;
out vec4 outColor;
void main(){
vec2 pa=vP-vA.xy,ba=vA.zw-vA.xy;
float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-4),0.0,1.0);
vec2 w=pa-ba*h;
float d=length(w),Rp=max(vB.x,1e-3),R=Rp*1.35;
float q=max(1.0-d*d/(R*R),0.0),k=q*q*vW;
float u=min(d/R,1.0);
float t=sin(u*1.5707963)*vB.w;
vec2 nxy=d>1e-4?w*(t/d):vec2(0.0);
outColor=vec4(k,nxy*k,(vB.y+vB.z*vB.w*q)*k);
}`,Gr=Be+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uPrev;uniform sampler2D uEnergy;uniform vec2 uTexel;uniform float uK;uniform float uG;
void main(){
vec2 o=uTexel*0.5;
vec3 p=(texture(uPrev,vUv+o).rgb+texture(uPrev,vUv-o).rgb+texture(uPrev,vUv+vec2(o.x,-o.y)).rgb+texture(uPrev,vUv+vec2(-o.x,o.y)).rgb)*0.25;
vec3 e=texture(uEnergy,vUv).rgb;
outColor=vec4(p*uK+e*((1.0-uK)*uG),1.0);
}`,Wr=Be+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uHand;uniform vec2 uTexel;uniform float uCore;
void main(){
vec2 o=uTexel;
vec3 c=texture(uBase,vUv+vec2(-o.x,-o.y)).rgb+texture(uBase,vUv+vec2(o.x,-o.y)).rgb
+texture(uBase,vUv+vec2(-o.x,o.y)).rgb+texture(uBase,vUv+vec2(o.x,o.y)).rgb;
float k=texture(uHand,vUv).r;
float w=uCore>0.5?smoothstep(0.35,0.9,k):1.0-smoothstep(0.01,0.12,k);
outColor=vec4(c*0.25*w,w);
}`,qr=Be+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;
void main(){
outColor=(texture(uSrc,vUv+uDir*3.0)+texture(uSrc,vUv+uDir)+texture(uSrc,vUv-uDir)+texture(uSrc,vUv-uDir*3.0))*0.25;
}`,Kr=Be+Zt+Dr+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uPlate;uniform sampler2D uPlateL;
uniform sampler2D uHand;uniform sampler2D uGF;uniform sampler2D uGFB;
uniform vec2 uTexel;uniform float uHasHand;
void main(){
vec2 o=uTexel;
vec3 c=(texture(uBase,vUv+vec2(-o.x,-o.y)).rgb+texture(uBase,vUv+vec2(o.x,-o.y)).rgb
+texture(uBase,vUv+vec2(-o.x,o.y)).rgb+texture(uBase,vUv+vec2(o.x,o.y)).rgb)*0.25;
float m=texture(uMask,vUv).r;
float a=0.0,ah=0.0,wB=0.0;
float nearHand=uHasHand>0.5?smoothstep(0.04,0.16,texture(uGF,vUv).a):0.0;
if(m>0.1){
vec3 gc=sqrt(max(c,0.0)),gB=sqrt(max(texture(uPlate,vUv).rgb,0.0));
float like=1.0-smoothstep(0.035,0.11,length(gc-gB));
float plateSkin=smoothstep(0.06,0.13,(gB.r-gB.b)/max(gB.r+gB.g+gB.b,0.05));
float fringe=1.0-smoothstep(0.6,0.9,m);
float gap=nearHand*smoothstep(0.3,0.8,texture(uPlateL,vUv).a)*(1.0-plateSkin);
a=smoothstep(0.1,0.9,m)*(1.0-like*max(fringe,gap));
}
vec3 B=texture(uPlate,vUv).rgb;
if(uHasHand>0.5){
float hk=texture(uHand,vUv).r;
if(hk>0.0){
vec3 Bh;ah=handAlpha(uGF,uGFB,vUv,c,hk,Bh);
wB=smoothstep(0.0,0.05,hk)*saturate((ah-a)*4.0+0.5);
B=mix(B,Bh,wB);
a=max(a,ah);
}
}
float share=a>0.002?saturate(luma(clamp(c-(1.0-a)*B,vec3(0.0),c))/max(luma(c),1e-4)):0.0;
outColor=vec4(a,share,ah,1.0);
}`,Yr=Be+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;
void main(){
outColor=texture(uSrc,vUv)*0.2734375
+(texture(uSrc,vUv+uDir*1.3333333)+texture(uSrc,vUv-uDir*1.3333333))*0.328125
+(texture(uSrc,vUv+uDir*3.1111111)+texture(uSrc,vUv-uDir*3.1111111))*0.03515625;
}`,Xr=Be+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uMask;uniform vec2 uCell;
void main(){
float m=texture(uMask,vUv+uCell*vec2(-0.25,-0.25)).r+texture(uMask,vUv+uCell*vec2(0.25,-0.25)).r
+texture(uMask,vUv+uCell*vec2(-0.25,0.25)).r+texture(uMask,vUv+uCell*vec2(0.25,0.25)).r;
outColor=vec4(m*0.25,0.0,0.0,1.0);
}`,Qr=Be+Zt+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uNormals;uniform sampler2D uHand;
uniform float uAspect;uniform float uWallZ;uniform float uWallGain;
uniform float uOutScale;uniform float uHasHand;uniform int uView;
uniform vec4 uLA[${ft}];uniform vec4 uLB[${ft}];uniform vec4 uLC[${ft}];uniform int uNL;
float lineIrr(vec3 P,vec3 A,vec3 B,float soft,out vec3 V){
vec3 ab=B-A,ap=P-A;
float Ls=length(ab);
if(Ls<1e-3){V=-ap;return 1.0/(dot(ap,ap)+soft*soft);}
vec3 dir=ab/Ls;
float s0=dot(ap,dir);
vec3 perp=ap-dir*s0;
float h=sqrt(dot(perp,perp)+soft*soft);
V=A+dir*clamp(s0,0.0,Ls)-P;
return(atan((Ls-s0)/h)+atan(s0/h))/(h*Ls);
}
float wallShadow(vec2 P,vec3 V,float wz,bool hands){
if(V.z<=1e-3)return 1.0;
float occ=0.0;
float f=(wz+0.04)/V.z;
if(f<1.0)occ=smoothstep(0.3,0.75,texture(uNormals,(P+V.xy*f)/vec2(uAspect,1.0)+0.5).a);
if(hands){
float g=(wz+0.14)/V.z;
if(g<1.0){
vec2 q=(P+V.xy*g)/vec2(uAspect,1.0)+0.5,o=vec2(0.012/uAspect,0.012);
float h=texture(uHand,q+o).r+texture(uHand,q-o).r;
occ=max(occ,smoothstep(0.08,0.9,h*0.5)*0.85);
}
}
return 1.0-0.82*occ;
}
void main(){
vec4 nh=texture(uNormals,vUv);
vec3 N=normalize(mix(nh.xyz*2.0-1.0,vec3(0.0,0.0,1.0),0.08));
vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
float z=nh.a*0.10;
if(uHasHand>0.5){
vec4 hd=texture(uHand,vUv);
float hc=smoothstep(0.0,0.6,sqrt(hd.r));
if(hc>0.0){
float ir=1.0/max(hd.r,1e-3);
vec2 nxy=hd.gb*ir;
float l2=dot(nxy,nxy);
if(l2>1.0){nxy*=inversesqrt(l2);l2=1.0;}
N=normalize(mix(N,vec3(nxy,sqrt(1.0-l2)),hc));
z=mix(z,hd.a*ir,hc);
}
}
vec3 Pp=vec3(p,z);
vec3 per=vec3(0.0);float wall=0.0;
for(int i=0;i<${ft};i++){
if(i>=uNL)break;
vec4 a=uLA[i],b=uLB[i],c=uLC[i];
vec3 V;float e=lineIrr(Pp,a.xyz,b.xyz,a.w,V);
vec3 L=V*inversesqrt(max(dot(V,V),1e-8));
per+=c.rgb*(max(dot(N,L)+0.3,0.0)/1.3)*e;
if(c.a<=1e-4)continue;
float wz=uWallZ*b.w;
vec3 Vw;float ew=lineIrr(vec3(p,-wz),a.xyz,b.xyz,a.w,Vw);
wall+=c.a*max(Vw.z*inversesqrt(max(dot(Vw,Vw),1e-8)),0.0)*ew*(i<6?wallShadow(p,Vw,wz,uHasHand>0.5&&i<3):1.0);
}
outColor=vec4(per,wall*uWallGain)*uOutScale;
if(uView==3)outColor=vec4(N*0.5+0.5,0.0)*2.0;
else if(uView==4)outColor=vec4(vec3(z*10.0),0.0);
}`,jr=Be+Zt+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uAlpha;uniform sampler2D uNormals;uniform sampler2D uAfter;
uniform sampler2D uLight;uniform sampler2D uHand;uniform sampler2D uEnergy;
uniform vec2 uAfterTexel;uniform float uAspect;uniform float uTime;
uniform float uAmbient;uniform float uDesat;uniform vec3 uTint;uniform vec3 uRoom;uniform vec3 uWallTint;
uniform float uHaze;uniform float uAfterGain;uniform float uLightIn;uniform float uEnergyIn;uniform float uHasHand;
uniform float uWallDim;uniform float uWallRoom;
uniform int uView;
void main(){
vec2 uv=vUv;
vec3 a0=texture(uAfter,uv).rgb*uEnergyIn;
float lx=luma(texture(uAfter,uv+vec2(uAfterTexel.x*1.5,0.0)).rgb)-luma(texture(uAfter,uv-vec2(uAfterTexel.x*1.5,0.0)).rgb);
float ly=luma(texture(uAfter,uv+vec2(0.0,uAfterTexel.y*1.5)).rgb)-luma(texture(uAfter,uv-vec2(0.0,uAfterTexel.y*1.5)).rgb);
vec2 haze=clamp(vec2(lx,ly)*uEnergyIn*uHaze,-uAfterTexel*0.6,uAfterTexel*0.6);
vec3 base=texture(uBase,uv+haze).rgb;
vec4 am=texture(uAlpha,uv);
vec4 Lt=texture(uLight,uv)*uLightIn;
vec3 Lp=Lt.rgb*inversesqrt(1.0+Lt.rgb*Lt.rgb*(1.0/5.8));
float Lw=Lt.a*inversesqrt(1.0+Lt.a*Lt.a*(1.0/0.64));
vec3 Lw3=uWallTint*Lw*(1.0-0.6*uWallDim);
float sh=smoothstep(0.15,0.85,am.g);
vec3 fl=base*sh;
vec3 irr=mix(Lw3,Lp,sh);
float mm=sh;
float L=luma(base);
vec3 amb=mix(base,vec3(L),uDesat)*uTint*uAmbient*(1.0-uWallDim*(1.0-sh));
vec3 col=amb+fl*(Lp+uRoom)+(base-fl)*(Lw3+uRoom*uWallRoom);
col+=a0*uAfterGain*vec3(0.78,0.72,1.0);
col+=texture(uEnergy,uv).rgb*uEnergyIn;
outColor=vec4(col,1.0);
if(uView==1)outColor=vec4(Lt.rgb*0.5,1.0);
else if(uView==5)outColor=vec4(irr*0.5,1.0);
else if(uView==6)outColor=vec4(vec3(mm),1.0);
else if(uView==7)outColor=vec4(texture(uEnergy,uv).rgb*uEnergyIn+a0*uAfterGain,1.0);
else if(uView==8)outColor=vec4(base,1.0);
else if(uView==9)outColor=vec4(uWallTint*Lw*0.5,1.0);
else if(uView==10)outColor=vec4(Lp*0.5,1.0);
else if(uView==2){vec4 hv=texture(uHand,uv);outColor=vec4(hv.gb/max(hv.r,1e-3)*0.5+0.5,min(hv.r,1.0),1.0);}
}`;function Jr(z){const C=z.kit,c=z.gl,K={strip:C.program(Ur,{vs:_r,label:"storm strip"}),sprite:C.program(zr,{vs:Hr,label:"storm sprite"}),ball:C.program(Nr,{vs:Vr,label:"storm ball"}),hand:C.program(Ir,{vs:Or,label:"storm hand"}),decay:C.program(Gr,{label:"storm decay"}),maskDown:C.program(Xr,{label:"storm mask down"}),hmPrep:C.program(Wr,{label:"storm hand colours"}),hmBox:C.program(qr,{label:"storm hand colours box"}),alpha:C.program(Kr,{label:"storm alpha"}),blur9:C.program(Yr,{label:"storm alpha blur"}),light:C.program(Qr,{label:"storm light"}),comp:C.program(jr,{label:"storm composite"})},ue=new Float32Array(zo*Je),b0=c.createVertexArray(),on=c.createBuffer();c.bindVertexArray(b0),c.bindBuffer(c.ARRAY_BUFFER,on),c.bufferData(c.ARRAY_BUFFER,ue.byteLength,c.DYNAMIC_DRAW),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,2,c.FLOAT,!1,Je*4,0),c.enableVertexAttribArray(1),c.vertexAttribPointer(1,4,c.FLOAT,!1,Je*4,8),c.enableVertexAttribArray(2),c.vertexAttribPointer(2,4,c.FLOAT,!1,Je*4,24);const Ce=new Float32Array(Vo*B0),rn=c.createVertexArray(),an=c.createBuffer();c.bindVertexArray(rn),c.bindBuffer(c.ARRAY_BUFFER,an),c.bufferData(c.ARRAY_BUFFER,Ce.byteLength,c.DYNAMIC_DRAW),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,4,c.FLOAT,!1,B0*4,0),c.vertexAttribDivisor(0,1),c.enableVertexAttribArray(1),c.vertexAttribPointer(1,4,c.FLOAT,!1,B0*4,16),c.vertexAttribDivisor(1,1);const Tt=12,Ae=new Float32Array(No*2*Tt),sn=c.createVertexArray(),ln=c.createBuffer();c.bindVertexArray(sn),c.bindBuffer(c.ARRAY_BUFFER,ln),c.bufferData(c.ARRAY_BUFFER,Ae.byteLength,c.DYNAMIC_DRAW),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,4,c.FLOAT,!1,Tt*4,0),c.vertexAttribDivisor(0,1),c.enableVertexAttribArray(1),c.vertexAttribPointer(1,4,c.FLOAT,!1,Tt*4,16),c.vertexAttribDivisor(1,1),c.enableVertexAttribArray(2),c.vertexAttribPointer(2,4,c.FLOAT,!1,Tt*4,32),c.vertexAttribDivisor(2,1);const qn=c.createVertexArray();c.bindVertexArray(null),c.bindBuffer(c.ARRAY_BUFFER,null);let te=null,De=null,ne=null,me=null,pt=null,we=null,_e=null,q=null,et=null,Fe=null,cn=0,o0=!0;const R0=z.caps.hdr==="rgba8";let H=0,G=0,ve=null,un=null,P0=null,L0=null,C0=1,Z=!1,Kn=0,fn=128;const ie=new Float32Array(ht),le=new Float32Array(ht),Se=new Float32Array(ht),Te=new Float32Array(ht),Yn=new Int16Array(ht),Xn=new Int16Array(ht),r0=new Uint8Array(ht);let $=0,a0=-1640531527,dt=1;function w(){a0=a0+1831565813|0;let e=Math.imul(a0^a0>>>15,1|a0);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}function hn(){dt=dt+1831565813|0;let e=Math.imul(dt^dt>>>15,1|dt);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}const k=(e,t)=>e+(t-e)*w();function Qn(){return{t:de,h:0,k:0,x:0,y:0,ang:0,r:1,ox:0,oy:0}}function Qo(e){return{i:e,on:!1,kind:ye,a:Qn(),b:Qn(),pts:new Float32Array(Ee*3),np:0,nMain:0,plen:.1,lines:new Int16Array($t*2),lineE:new Float32Array($t),lineW:new Float32Array($t),nl:0,energy:1,flick:1,core:1,width:1,cr:.45,cg:.55,cb:1,behind:0,lightK:1,scale:1,born:0,kick:-9,until:0,nextOn:0,nextShape:0,rate:25,seed:1,strike:0,sx:0,sy:0,snx:0,sny:0,sEdge:-1,transient:!1,life:0,strokes:new Float32Array(8),ns:0,power:1,stype:0,sid:0,sk:0,pairA:0,pairB:0,levels:5,branches:1,rough:.26,bow:0,ox:0,oy:0,dirx:0,diry:0}}const N=Array.from({length:St},(e,t)=>Qo(t)),s0=new Float32Array(Ie),i0=new Float32Array(Ie),tt=new Float32Array(Ie),Ge=new Float32Array(Ie),We=new Float32Array(Ie),l0=new Float32Array(Ie),c0=new Float32Array(Ie),u0=new Uint8Array(Ie);let nt=0;function jn(){return{present:!1,fade:0,beads:0,charge:0,ballR:0,ballE:0,fistT:-9,tightT:-9,peakC:0,point:0,pointHold:-9,pinch:0,chimed:!1,size:.12,z:.16,flick:new Float32Array(5),bx:0,by:0,age:0}}const T=[jn(),jn()],O=[null,null];let U=0,b=16/9,oe=!!z.mobile,Zn=0,pn=-9,re=!1,dn=!1,ot=!1,f0=!1,mn=!1,vn=!1,be=0,mt=0,rt=0,D0=-9,xn=0,gn=0,xe=0,bt=0,h0=0,p0=-1,$n=0,J=0,qe=0,yn=0,vt=0,_0=0,Jn=0,U0=0,eo=0,to=-9,d0=0,no=0,m0=0,oo=0,An=!1,ro=0;const Rt=[!1,!1],ao=[0,0],so=[0,0],io=[0,0],lo=[0,0];function jo(e){let t=-1,n=.2*.2;const r=e.points[24]*b,o=e.points[25];for(let a=0;a<2;a++){if(!Rt[a])continue;const i=(io[a]-r)**2+(lo[a]-o)**2;i<n&&(n=i,t=a)}return t}const D=new Float64Array(2),L=new Float64Array(2),Pt=[],V={mode:"",forceBall:-1,forceCharge:1,noHand:!1},Y=new Float32Array(Ee+4),X=new Float32Array(Ee+4),xt=new Float32Array(Ee+4),co=new Float32Array(Ee+4),uo=new Float32Array(Ee+4),wn=new Float32Array(Ee+4),fo=new Float32Array(Ee),ho=new Float32Array(Ee),Ue=new Float32Array(96),He=new Float32Array(96),H0=new Float32Array(96),z0=new Float32Array(96),at=new Float32Array(96),Lt=new Float32Array(pe),Ct=new Float32Array(pe),Dt=new Float32Array(pe),_t=new Float32Array(pe),Ut=new Float32Array(pe),Ht=new Float32Array(pe),zt=new Float32Array(pe),gt=new Float32Array(pe),yt=new Float32Array(pe),At=new Float32Array(pe),Me=new Float32Array(pe),Vt=new Float32Array(pe),Nt=new Float32Array(pe);let v0=1,Mn=1,Ke=0;const Ye=new Float32Array(ft*4),st=new Float32Array(ft*4),Ot=new Float32Array(ft*4);let fe=2,Q=2,it=2,wt=1;function j(e,t=4){const n=Math.max(1,e*Q);return Ze(Math.ceil(Math.log2(n/6)),t,oe?7:8)}function It(e,t,n,r,o,a,i,s,h,f,p){const v=1<<n;let g=t*3;e[g]=r,e[g+1]=o,e[g+2]=h,g=(t+v)*3,e[g]=a,e[g+1]=i,e[g+2]=f;let y=0;for(let l=v>>1;l>=1;l>>=1,y++){const u=y<p,x=s*(y===0?.8:y===1?1.1:y<4?.85:.55);for(let m=l;m<v;m+=l<<1){const E=(t+m-l)*3,d=(t+m+l)*3,A=(t+m)*3,F=e[E],M=e[E+1],B=e[d],S=e[d+1],R=B-F,P=S-M,_=Math.sqrt(R*R+P*P)||1e-6,W=u?hn()+hn()-1:w()+w()-1,ze=u?hn()*2-1:w()*2-1,Ve=W*x*_*1.25,Ne=ze*.1*_;e[A]=(F+B)*.5-P/_*Ve+R/_*Ne,e[A+1]=(M+S)*.5+R/_*Ve+P/_*Ne,e[A+2]=h+(f-h)*(m/v)}}return v+1}function Gt(e,t,n,r,o){return e.nl>=$t||n<2?!1:(e.lines[e.nl*2]=t,e.lines[e.nl*2+1]=n,e.lineE[e.nl]=r,e.lineW[e.nl]=o,e.nl++,!0)}function V0(e,t,n,r,o,a,i,s,h,f){for(let p=0;p<r;p++){if(e.nl>=$t)return;const v=1<<o;if(e.np+v+1>Ee)return;const g=t+1+Math.floor(k(.08,.82)*(n-3)),y=g*3,l=e.pts[y],u=e.pts[y+1],x=e.pts[y+2];let m=e.pts[y+3]-e.pts[y-3],E=e.pts[y+4]-e.pts[y-2];const d=Math.hypot(m,E)||1;m/=d,E/=d;const A=(w()<.5?-1:1)*k(.28,.95),F=Math.cos(A),M=Math.sin(A),B=m*F-E*M,S=m*M+E*F,R=1-(g-t)/(n-1),P=h*k(.1,.34)*(.45+R),_=e.np,W=It(e.pts,_,o,l,u,l+B*P,u+S*P,f*1.15,x*.85,0,0);e.np+=W,Gt(e,_,W,a*k(.7,1.1),i),s>0&&o>3&&w()<.55&&V0(e,_,W,1,o-1,a*.6,i*.7,s-1,P,f)}}function ge(e,t,n,r,o,a){e.kind=ye,e.np=0,e.nl=0,dt=e.seed;const i=It(e.pts,0,t,0,0,1,0,n,1,1,a);if(r)for(let s=1;s<i-1;s++){const h=s/(i-1);e.pts[s*3+1]+=r*4*h*(1-h)}e.np=i,e.nMain=i,Gt(e,0,i,1,1),o>0&&V0(e,0,i,o,Math.max(3,t-2),.5,.62,1,1,n)}function x0(e,t,n,r){e.kind=ye,e.np=0,e.nl=0,dt=e.seed;const o=It(e.pts,0,t,0,0,1,0,n,1,.05,0);e.np=o,e.nMain=o,Gt(e,0,o,1,1),r>0&&V0(e,0,o,r,Math.max(3,t-2),.5,.6,0,1,n)}function he(e,t){if(e.t===de)return t[0]=e.x,t[1]=e.y,!0;const n=O[e.h];if(!n)return!1;if(e.t===qo)return t[0]=n.points[e.k*3]*b,t[1]=n.points[e.k*3+1],!0;if(e.t===Ko)return t[0]=n.points[e.k*3]*b+e.x,t[1]=n.points[e.k*3+1]+e.y,!0;if(e.t===T0)return t[0]=n.pinchPoint[0]*b+e.ox,t[1]=n.pinchPoint[1]+e.oy,!0;const r=T[e.h];if(e.t===e0)return t[0]=r.bx,t[1]=r.by,!0;const o=r.ballR*e.r;return t[0]=r.bx+Math.cos(e.ang)*o,t[1]=r.by+Math.sin(e.ang)*o,!0}function Re(e,t,n){e.t=qo,e.h=t,e.k=n,e.ox=0,e.oy=0}function Xe(e,t,n){e.t=de,e.x=t,e.y=n,e.ox=0,e.oy=0}function g0(e){return!he(e.a,D)||!he(e.b,L)?.05:Math.hypot(L[0]-D[0],L[1]-D[1])}function Zo(e,t){if(!Z)return 0;const n=Math.floor(e/b*H),r=Math.floor(t*G);return n<0||r<0||n>=H||r>=G?0:ve[r*H+n]}const y0=(e,t)=>Zo(e,t)>=fn;function $o(e,t){let n=Math.floor(e),r=Math.floor(t);const o=e-n,a=t-r,i=Ze(n+1,0,H-1),s=Ze(r+1,0,G-1);n=Ze(n,0,H-1),r=Ze(r,0,G-1);const h=ve[r*H+n],f=ve[r*H+i],p=ve[s*H+n],v=ve[s*H+i];return(h+(f-h)*o)*(1-a)+(p+(v-p)*o)*a}function Jo(){for(let r=0,o=H*G;r<o;r++)ve[r]=un[r*4];$=0;const e=fn,t=b/H,n=1/G;for(let r=0;r<G;r++)for(let o=0;o<H;o++){const a=r*H+o;if(P0[a]=-1,ve[a]<e)continue;const i=o>0?ve[a-1]:255,s=o<H-1?ve[a+1]:255,h=r>0?ve[a-H]:255,f=r<G-1?ve[a+H]:255;if(i>=e&&s>=e&&h>=e&&f>=e||$>=ht)continue;const p=(s-i)/t,v=(f-h)/n,g=Math.hypot(p,v)||1,y=-p/g,l=-v/g,u=(o+.5)*t,x=(r+.5)*n;let m=ve[a],E=0,d=0;for(let A=1;A<=3;A++){const F=A*.5*n,M=$o((u+y*F)/t-.5,(x+l*F)/n-.5);if(M<e){d=E+(F-E)*(m-e)/Math.max(.001,m-M);break}m=M,E=F,d=F}Se[$]=y,Te[$]=l,ie[$]=u+y*d,le[$]=x+l*d,Yn[$]=o,Xn[$]=r,P0[a]=$++}Z=!0}const po=[3,4,6,7,8,10,11,12,14,15,16,18,19,20,1,2];function er(e,t,n){return mo(e,t,n)?!0:e.speed>.25?mo(e,t+e.velocity[0]*b*.09,n+e.velocity[1]*.09):!1}function mo(e,t,n){const r=e.size,o=e.points;let a=t-e.palm[0]*b,i=n-e.palm[1];if(a*a+i*i<r*r*1.3)return!0;const s=r*r*.2;for(let x=0;x<po.length;x++){const m=po[x];if(a=t-o[m*3]*b,i=n-o[m*3+1],a*a+i*i<s)return!0}const h=o[0]*b,f=o[1];let p=o[27]*b-h,v=o[28]-f;const g=Math.hypot(p,v)||1;p/=g,v/=g;const y=t-h,l=n-f,u=-(y*p+l*v);return u>-r*.2&&u<r*4&&Math.abs(y*v-l*p)<r*.85}function N0(e,t){for(let n=0;n<2;n++){const r=O[n];if(r&&er(r,e,t))return!0}return!1}function tr(){for(let e=0;e<$;e++)r0[e]=N0(ie[e],le[e])?1:0}function lt(e,t,n){let r=-1,o=n*n;for(let a=0;a<$;a++){if(r0[a])continue;const i=ie[a]-e,s=le[a]-t,h=i*i+s*s;h<o&&(o=h,r=a)}return r}function nr(e,t,n,r,o,a,i,s=.03){let h=-1,f=1/0;for(let p=0;p<$;p++){if(r0[p])continue;const v=ie[p]-e,g=le[p]-t,y=Math.hypot(v,g);if(y<s||y>a)continue;const l=(v*n+g*r)/y;if(l<o)continue;let u=y*(1+3.2*(1-l));if(i>=0&&i<$){const x=ie[i]-ie[p],m=le[i]-le[p];x*x+m*m<9e-4&&(u*=.8)}u<f&&(f=u,h=p)}return h}function vo(e,t,n,r,o,a=0){if(!Z)return!1;const i=e,s=t,h=.6/G;let f=!1,p=e>=0&&t>=0&&e<=b&&t<=1;for(let v=0;v<900;v++){if(e+=n*h,t+=r*h,!(e>=0&&t>=0&&e<=b&&t<=1)){if(p)return!1;continue}if(p=!0,!(y0(e,t)&&!N0(e,t)))f=!0;else if(f)return(e-i)*(e-i)+(t-s)*(t-s)<a*a?!1:(o[0]=e,o[1]=t,!0)}return!1}function or(e,t,n){if(!Z)return!1;let r=0;for(let o=0;o<8;o++){const a=o*(Le/8),i=e+Math.cos(a)*n*1.6,s=t+Math.sin(a)*n*1.6;y0(i,s)&&!N0(i,s)&&r++}return r>=5}function xo(e,t,n,r){const o=n-e,a=r-t,i=Math.hypot(o,a),s=Math.floor((i-.02)/(.8/G));for(let h=1;h<s;h++){const f=h*.8/G/i,p=e+o*f,v=t+a*f;if(y0(p,v)&&!N0(p,v))return!1}return!0}function kn(e,t,n,r,o){let a=1e9;n>1e-6?a=Math.min(a,(b-e)/n):n<-1e-6&&(a=Math.min(a,-e/n)),r>1e-6?a=Math.min(a,(1-t)/r):r<-1e-6&&(a=Math.min(a,-t/r)),(!(a<1e8)||a<0)&&(a=.5),a+=.04,o[0]=e+n*a,o[1]=t+r*a}let Bn=0;function go(e,t){const n=.004+.013*(.5+.5*Math.sin(e*.47+Bn)*Math.cos(e*.19-Bn*1.7));return Ue[e]=ie[t]-Se[t]*n,He[e]=le[t]-Te[t]*n,H0[e]=Se[t],z0[e]=Te[t],e+1}function yo(e,t,n){C0++,Bn=w()*Le;let r=Yn[e],o=Xn[e],a=-Te[e]*t,i=Se[e]*t,s=go(0,e);L0[o*H+r]=C0;for(let h=0;h<n&&s<90;h++){let f=-1,p=-2,v=0,g=0;for(let m=-1;m<=1;m++)for(let E=-1;E<=1;E++){if(!E&&!m)continue;const d=r+E,A=o+m;if(d<0||A<0||d>=H||A>=G)continue;const F=A*H+d,M=P0[F];if(M<0||L0[F]===C0)continue;const B=Math.hypot(E,m),S=(E*a+m*i)/B;S>p&&(p=S,f=M,v=d,g=A)}if(f<0||p<-.3)break;L0[g*H+v]=C0;const y=v-r,l=g-o,u=Math.hypot(y,l);a=a*.55+y/u*.45,i=i*.55+l/u*.45;const x=Math.hypot(a,i)||1;if(a/=x,i/=x,r=v,o=g,r0[f])break;s=go(s,f)}for(let h=0;h<2;h++)for(let f=1;f<s-1;f++)Ue[f]=(Ue[f-1]+Ue[f]*2+Ue[f+1])*.25,He[f]=(He[f-1]+He[f]*2+He[f+1])*.25;return s}function Ao(e,t,n,r){if(e.kind=n0,e.np=0,e.nl=0,t<3)return!1;at[0]=0;for(let f=1;f<t;f++)at[f]=at[f-1]+Math.hypot(Ue[f]-Ue[f-1],He[f]-He[f-1]);const o=at[t-1];if(o<.02)return!1;e.plen=o;const a=It(e.pts,0,j(o),0,0,1,0,.3,1,.15,0);let i=0;for(let f=0;f<a;f++){const p=f*3,v=e.pts[p]*o,g=e.pts[p+1]*o*n;for(;i<t-2&&at[i+1]<v;)i++;const y=at[i+1]-at[i]||1e-6,l=Ze((v-at[i])/y,0,1),u=Ue[i]+(Ue[i+1]-Ue[i])*l,x=He[i]+(He[i+1]-He[i])*l;let m=H0[i]+(H0[i+1]-H0[i])*l,E=z0[i]+(z0[i+1]-z0[i])*l;const d=Math.hypot(m,E)||1;m/=d,E/=d;const A=g*.4-Math.abs(g)*.6;e.pts[p]=u+m*A,e.pts[p+1]=x+E*A,fo[f]=m,ho[f]=E}e.np=a,e.nMain=a;let s=0;for(let f=0;f<r&&s<a-5;f++){const p=r-f,v=Math.max(5,Math.round((a-1-s)/p*k(.75,1.1))),g=Math.min(a-1,s+v);for(let y=s;y<=g;y++){const l=(y-s)/Math.max(1,g-s),u=Math.min(1,f===0?1:l/.15)*Math.min(1,(1-l)/.3);e.pts[y*3+2]=(.12+.88*u)*(1-.4*(y/(a-1)))}Gt(e,s,g-s+1,1-.16*f,1-.1*f),s=g+Math.max(3,Math.round(a*k(.08,.18)))}const h=2+(w()*3|0);for(let f=0;f<h&&!(e.nl>=$t);f++){const p=2+Math.floor(w()*(a-5)),v=p*3,g=e.pts[v+2];if(g<.3)continue;let y=e.pts[v+3]-e.pts[v-3],l=e.pts[v+4]-e.pts[v-2];const u=Math.hypot(y,l)||1;y/=u,l/=u;const x=k(-.75,.75);let m=-fo[p]+y*x,E=-ho[p]+l*x;const d=Math.hypot(m,E)||1;m/=d,E/=d;const A=k(.018,.05)+.12*o*w()*w(),F=Math.min(6,j(A));if(e.np+(1<<F)+1>Ee)break;const M=e.np,B=It(e.pts,M,F,e.pts[v],e.pts[v+1],e.pts[v]+m*A,e.pts[v+1]+E*A,.32,g*.8,0,0);let S=B;if(Z)for(let R=1;R<B;R++){const P=(M+R)*3;if(!y0(e.pts[P],e.pts[P+1])){S=R;break}}e.np+=B,S>=3&&Gt(e,M,S,.65,.6)}return!0}function wo(e,t,n,r,o,a){e.kind=n0,e.np=0,e.nl=0,e.plen=a;const i=j(a),s=It(e.pts,0,i,t,n,t+r*a,n+o*a,.3,1,.12,0);let h=s;if(Z)for(let f=2;f<s;f++){const p=f*3;if(!y0(e.pts[p],e.pts[p+1])){h=f;break}}return e.np=s,e.nMain=h,h<3?!1:(Gt(e,0,h,1,1),V0(e,0,h,3+(w()*3|0),Math.max(3,i-2),.6,.65,1,a,.3),!0)}function Wt(e,t,n,r,o,a,i,s,h,f,p,v){o=Math.round(o*(oe?.5:1));const g=oe?Ie>>1:Ie,y=Math.atan2(r,n);for(let l=0;l<o;l++){if(nt>=g)return;const u=y+(w()+w()-1)*i,x=a*(.08+1.5*Math.pow(w(),1.6)),m=nt++,E=w()*w()*p,d=(w()-.5)*.008;s0[m]=e+h*E-f*d,i0[m]=t+f*E+h*d,tt[m]=Math.cos(u)*x,Ge[m]=Math.sin(u)*x,u0[m]=w()<s*.5?1:0,We[m]=-w()*v,l0[m]=u0[m]?k(.06,.16):k(.18,.5),c0[m]=k(.7,1)}}function rr(e){const t=Math.exp(-2.2*e);for(let n=0;n<nt;n++){if(We[n]<0){We[n]+=e;continue}const r=tt[n]*tt[n]+Ge[n]*Ge[n];if(We[n]+=e*(r<.09?1+3*(1-r/.09):1),We[n]>=l0[n]){const o=--nt;s0[n]=s0[o],i0[n]=i0[o],tt[n]=tt[o],Ge[n]=Ge[o],We[n]=We[o],l0[n]=l0[o],c0[n]=c0[o],u0[n]=u0[o],n--;continue}Ge[n]-=1.5*e,tt[n]*=t,Ge[n]*=t,s0[n]+=tt[n]*e,i0[n]+=Ge[n]*e}}function Mo(e){const t=z.audio;!t||U-Jn<.09||_0<1||(Jn=U,_0--,t.zap({strength:e}))}function O0(e){const t=z.audio;!t||U-eo<.05||U0<1||(eo=U,U0--,t.whoosh({strength:e,duration:.04+.03*w(),up:!1}))}function ee(e){e.on=!1,e.strike=0,e.transient=!1}function ar(e,t){for(let n=e;n<e+t;n++)ee(N[n])}function En(e,t){e.strike=1,e.sEdge=t,e.sx=ie[t]-Se[t]*.003,e.sy=le[t]-Te[t]*.003,e.snx=Se[t],e.sny=Te[t]}function ct(e,t,n,r,o,a,i,s){if(!t){e.on&&ee(e);return}if(e.on){if(s>=e.until){e.on=!1,e.nextOn=s+k(a,i);return}s>=e.nextShape&&(qt(e),e.nextShape=s+1/e.rate*k(.7,1.3),w()<.22&&(e.kick=s))}else if(s>=e.nextOn)if(w()<n){if(e.on=!0,e.born=s,e.kick=s,e.until=s+k(r,o),e.seed=w()*4294967296|0,!qt(e)){e.on=!1,e.nextOn=s+a;return}e.nextShape=s+1/e.rate,e.stype===tn&&(s-to>.8?Mo(.2+.12*w()):O0(.22+.12*w()),to=s)}else e.nextOn=s+k(a,i)*.6}const sr=[4,8,12,16],ir=[8,12,16,20],Qe=[4,8,12,16,20];function qt(e){const t=e.sid,n=O[t],r=T[t];switch(e.stype){case On:case en:{if(!n)return!1;let o,a;if(e.stype===On)o=sr[e.sk],a=ir[e.sk];else{const v=w()*3|0;o=Qe[v],a=Qe[v+2]}Re(e.a,t,o),Re(e.b,t,a),he(e.a,D),he(e.b,L);const i=(D[0]+L[0])/2-n.palm[0]*b,s=(D[1]+L[1])/2-n.palm[1],h=L[0]-D[0],f=L[1]-D[1],p=-f*i+h*s>=0?1:-1;return ge(e,j(Math.hypot(h,f)*1.2),.3,p*k(.12,.3),w()<.35?1:0,1),e.energy=k(.7,1.2),e.width=.75,e.core=.9,e.lightK=.35,e.cr=.5,e.cg=.5,e.cb=1,e.strike=0,!0}case tn:{if(!n||!Z)return!1;if(e.strike!==1||!e.on||U-e.born<.001){let o=-1,a=Vn,i=8;for(let s=0;s<5;s++){const h=Qe[s],f=lt(n.points[h*3]*b,n.points[h*3+1],a);f>=0&&(a=Math.hypot(ie[f]-n.points[h*3]*b,le[f]-n.points[h*3+1]),o=f,i=h)}if(o<0)return!1;Re(e.a,t,i),En(e,o),Xe(e.b,e.sx,e.sy)}return ge(e,j(g0(e)),.25,k(-.12,.12),2+(w()*2|0),2),e.energy=k(1,1.5),e.width=.95,e.core=1,e.lightK=1,e.cr=.48,e.cg=.52,e.cb=1,!0}case E0:return n?(Re(e.a,t,4),Re(e.b,t,8),ge(e,j(g0(e)),.34,k(-.15,.15),w()<.5?1:0,0),e.width=.8,e.core=.95,e.lightK=.7,e.strike=0,e.cr=.45,e.cg=.58,e.cb=1,!0):!1;case F0:{if(!n)return!1;const o=n.points,a=o[24]*b,i=o[25];let s=a-o[18]*b,h=i-o[19],f=Math.hypot(s,h);f<n.size*.18&&(s=a-o[15]*b,h=i-o[16],f=Math.hypot(s,h)),s/=f||1,h/=f||1,e.dirx=s,e.diry=h,Re(e.a,t,8);const p=N[t*Ft+S0],v=N[t*Ft+S0+1];w()<.3&&(e.seed=w()*4294967296|0,e.kick=U);const g=re?jo(n):-1;if(g>=0){const y=ao[g],l=so[g];Xe(e.b,y,l);const u=a-y,x=i-l,m=Math.hypot(u,x)||1;e.strike=1,e.sEdge=-1,e.sx=y,e.sy=l,e.snx=u/m,e.sny=x/m,ge(e,j(m),.22,k(-.05,.05),oe?3:5,2);const E=Math.atan2(-x,-u);for(let d=0;d<2;d++){const A=d?v:p,F=E+(d?1:-1)*k(.5,1.4);wo(A,y,l,Math.cos(F),Math.sin(F),k(.07,.15))?(A.on||(A.born=U,A.kick=U),A.on=!0,A.energy=k(1,1.5),A.width=.8,A.core=.9,A.lightK=.6,A.cr=.55,A.cg=.5,A.cb=1,A.strike=0,A.behind=0):ee(A)}}else{let y=-1;const l=n.size*.55;if(Z&&vo(a,i,s,h,L,l)&&(y=lt(L[0],L[1],.06)),y<0&&Z&&(y=nr(a,i,s,h,Math.cos(.36),1.4,e.sEdge,l)),y<0&&f<n.size*.25&&Z&&(y=lt(a,i,.4)),y>=0?(En(e,y),Xe(e.b,e.sx,e.sy)):(e.strike=0,e.sEdge=-1,kn(a,i,s,h,L),Xe(e.b,L[0],L[1])),ge(e,j(g0(e)),.22,k(-.05,.05),oe?3:5,2),e.strike===1)for(let u=0;u<2;u++){const x=u?v:p,m=yo(e.sEdge,u?-1:1,12+(w()*12|0));Ao(x,m,.18,2+(w()*2|0))?(x.on||(x.born=U,x.kick=U),x.on=!0,x.energy=k(.8,1.2),x.width=.75,x.core=.8,x.lightK=.6,x.cr=.55,x.cg=.5,x.cb=1,x.strike=0,x.behind=0):ee(x)}else ee(p),ee(v)}return e.width=1.35,e.core=1.45,e.lightK=1.6,e.cr=.42,e.cg=.52,e.cb=1,!0}case Jt:{if(!n||r.ballR<=0)return!1;if(e.sk>=3)return e.a.t=e0,e.a.h=t,e.b.t=t0,e.b.h=t,e.b.ang=w()*Le,e.b.r=k(.95,1.12),ge(e,j(r.ballR),.3,k(-.18,.18),w()<.5?1:0,0),e.energy=k(.7,1.2)*(.45+.7*Math.min(1,r.charge)),e.width=.55,e.core=.6,e.lightK=.2,e.cr=.66,e.cg=.5,e.cb=1,e.strike=0,!0;const o=w()*Le,a=o+(w()<.5?-1:1)*k(.7,2);e.a.t=t0,e.a.h=t,e.a.ang=o,e.a.r=k(.85,1),e.b.t=t0,e.b.h=t,e.b.ang=a,e.b.r=k(.85,1),he(e.a,D),he(e.b,L);const i=(D[0]+L[0])/2-r.bx,s=(D[1]+L[1])/2-r.by,h=L[0]-D[0],f=L[1]-D[1],p=-f*i+h*s>=0?1:-1;return ge(e,j(Math.hypot(h,f)*1.3),.28,p*k(.15,.32),w()<.4?1:0,0),e.energy=k(.9,1.6)*(.5+.7*Math.min(1,r.charge)),e.width=.65,e.core=.7,e.lightK=.3,e.cr=.6,e.cg=.45,e.cb=1,e.strike=0,!0}case In:{if(!n||r.ballR<=0)return!1;const o=w()*Le;e.a.t=t0,e.a.h=t,e.a.ang=o,e.a.r=.9,he(e.a,D);const a=r.ballR*k(1.4,2.8)*(.7+.5*Math.min(1,r.charge)),i=Z?lt(D[0],D[1],a*1.6):-1;return i>=0&&w()<.6?(En(e,i),Xe(e.b,e.sx,e.sy),ge(e,j(Math.hypot(e.sx-D[0],e.sy-D[1])),.27,k(-.1,.1),1,1)):(e.strike=0,Xe(e.b,D[0]+Math.cos(o)*a,D[1]+Math.sin(o)*a),x0(e,j(a),.3,1)),e.energy=k(.7,1.2)*Math.min(1.2,r.charge),e.width=.7,e.core=.7,e.lightK=.45,e.cr=.62,e.cg=.48,e.cb=1,!0}case 100:{const o=O[e.pairA],a=O[e.pairB];if(!o||!a)return!1;const i=Qe[e.sk];Re(e.a,e.pairA,i),Re(e.b,e.pairB,i);const s=J,h=[-.06,.05,.11,.17,.23];he(e.a,D),he(e.b,L);const f=L[0]>=D[0]?1:-1,p=re&&ot&&!(f0&&e.sk&1),v=re?f0?.35:mn?-.3:ot?.45:1:1;return ge(e,j(Math.hypot(L[0]-D[0],L[1]-D[1])*1.15),.25,f*(h[e.sk]*(1.15-.5*s)*v+k(-.04,.04)),Math.round(k(.4,1.4)+3*s)-(oe?1:0),2),e.energy=(.45+1.4*s)*k(.75,1.15),e.width=(.65+.85*s)*(p?1.25:1),e.core=(.6+.7*s)*(p?1.2:1),e.lightK=(.55+.6*s)*(p?1.5:1),e.cr=.45,e.cg=.55,e.cb=1,e.strike=0,e.behind=p?1:0,!0}case 101:{const o=O[e.pairA],a=O[e.pairB];return!o||!a?!1:(T[e.pairA].pinch>.3&&T[e.pairB].pinch>.3?(e.a.t=T0,e.a.h=e.pairA,e.a.ox=e.a.oy=0,e.b.t=T0,e.b.h=e.pairB,e.b.ox=e.b.oy=0):e.sk===0?(e.a.t=e0,e.a.h=e.pairA,e.b.t=e0,e.b.h=e.pairB):(Re(e.a,e.pairA,Qe[w()*5|0]),Re(e.b,e.pairB,Qe[w()*5|0])),ge(e,j(g0(e)*1.1),.26,k(-.12,.12),oe?2:4,1),e.energy=(.6+1.6*J)*k(.8,1.2),e.width=e.sk===0?1.6:.9,e.core=e.sk===0?1.5:.8,e.lightK=1,e.cr=.5,e.cg=.5,e.cb=1,e.strike=0,e.behind=re&&ot?1:0,!0)}default:return!1}}function ko(){for(let e=0;e<2;e++)for(let t=0;t<Ft;t++){const n=N[e*Ft+t];n.sid=e,n.transient=!1,n.behind=0,n.stype=t<4?On:t===en?en:t<=6?tn:t===E0?E0:t===F0?F0:t<=10?-1:t<=15?Jt:t<=18?In:-1,n.sk=t<4?t:n.stype===Jt?t-Jt:0,n.rate=n.stype===F0?22:n.stype===E0||n.stype===Jt?30:26}for(let e=0;e<zn;e++){const t=N[Hn+e];t.stype=e<5?100:101,t.sk=e<5?e:e-5,t.rate=26,t.transient=!1,t.sid=-1}}ko();function Mt(){for(let e=J0;e<St;e++)if(!N[e].on)return N[e];return null}function I0(e,t){e.life=t,e.ns=2+(w()*4|0);let n=0;for(let r=0;r<e.ns;r++)e.strokes[r]=n,n+=k(.035,.11);e.nextShape=U+e.strokes[1%e.ns]}function Fn(e,t,n,r,o,a,i){const s=Mt();return s?(s.a.t=e0,s.a.h=e,Xe(s.b,t,n),s.on=!0,s.transient=!0,s.born=U,s.kick=U,s.seed=w()*4294967296|0,s.power=r,I0(s,k(.3,.6)*(.8+.3*r)),s.stype=Lr,s.sid=e,s.kind=ye,s.levels=j(g0(s)),s.branches=oe?2:2+(w()*3|0),s.width=.95+.3*r,s.core=1.15+.35*r,s.lightK=1,s.cr=.46,s.cg=.54,s.cb=1,s.behind=0,s.strike=o?1:0,s.sx=t,s.sy=n,s.snx=a,s.sny=i,s.sEdge=-1,ge(s,s.levels,.24,k(-.08,.08),s.branches,3),s):null}function Bo(e,t,n,r,o,a){const i=Mt();return i?(i.on=!0,i.transient=!0,i.born=U,i.kick=U,i.stype=Gn,i.sid=e,i.sk=r,i.sx=t,i.sy=n,i.a.t=de,i.b.t=de,i.power=a,I0(i,o),i.width=.85,i.core=.9,i.lightK=.6,i.cr=.55,i.cg=.52,i.cb=1,i.behind=0,i.strike=0,Fo(i)?i:(ee(i),null)):null}function lr(e,t,n,r,o,a,i){const s=Mt();return s?(s.on=!0,s.transient=!0,s.born=U,s.kick=U,s.stype=Wn,s.sid=e,s.sx=t,s.sy=n,s.dirx=r,s.diry=o,s.a.t=de,s.b.t=de,s.power=i,I0(s,a),s.width=.75,s.core=.85,s.lightK=.5,s.cr=.55,s.cg=.5,s.cb=1,s.behind=0,s.strike=0,Eo(s)?s:(ee(s),null)):null}function Eo(e){const t=Math.atan2(e.diry,e.dirx)+k(-.6,.6);return wo(e,e.sx,e.sy,Math.cos(t),Math.sin(t),k(.05,.12))}function Fo(e){const t=lt(e.sx,e.sy,.05);if(t<0)return!1;const n=yo(t,e.sk,12+(w()*14|0));return Ao(e,n,.18,2+(w()*2|0))}function cr(e){const t=T[e],n=Mt();if(!n)return;let r,o,a=0,i=0,s=0;const h=Z&&w()<.35?lt(t.bx+k(-.25,.25),t.by+k(-.1,.3),.3):-1;if(h>=0&&Math.hypot(ie[h]-t.bx,le[h]-t.by)>.08)r=ie[h],o=le[h],a=1,i=Se[h],s=Te[h];else for(let f=0;f<6;f++){const p=k(-.9,1.5);if(kn(t.bx,t.by,Math.cos(p),Math.sin(p),L),r=L[0],o=L[1],!Z||xo(t.bx,t.by,r,o))break}Xe(n.a,r,o),n.b.t=t0,n.b.h=e,n.b.ang=Math.atan2(o-t.by,r-t.bx),n.b.r=.95,n.on=!0,n.transient=!0,n.born=U,n.kick=U,n.seed=w()*4294967296|0,n.power=.8,I0(n,k(.16,.34)),n.stype=Wo,n.sid=e,n.kind=ye,n.levels=j(Math.hypot(r-t.bx,o-t.by)),n.branches=oe?1:2+(w()*2|0),n.width=.85,n.core=1,n.lightK=.9,n.cr=.5,n.cg=.52,n.cb=1,n.behind=0,n.strike=a,n.sx=r,n.sy=o,n.snx=i,n.sny=s,n.sEdge=-1,ge(n,n.levels,.25,k(-.1,.1),n.branches,3),a&&Wt(r,o,i,s,10,.8,1.1,.4,0,0,0,.04)}function So(e,t,n,r,o){const a=O[e];if(!a)return;const i=T[e],s=i.bx,h=i.by,f=Math.min(1.2,t),p=o<3,v=Math.round((oe?4:5)+(oe?3:5)*f*(p?.6:1)),g=p?Math.atan2(r,n):w()*Le,y=or(s,h,a.size);let l=0;for(let x=0;x<v;x++){const m=p?g+(w()*2-1)*o:g+x/v*Le+k(-.3,.3),E=Math.cos(m),d=Math.sin(m);if(Z&&!y&&vo(s,h,E,d,L,0)){const A=lt(L[0],L[1],.04),F=A>=0?Se[A]:-E,M=A>=0?Te[A]:-d,B=L[0]-F*.004,S=L[1]-M*.004,R=Fn(e,B,S,t,!0,F,M);if(!R)continue;const P=Math.hypot(s-B,h-S)||1;Wt(B,S,F,M,9,.9,1.2,.35,(s-B)/P,(h-S)/P,P*.04,.05),l++<(oe?2:3)&&lr(e,B,S,-F,-M,R.life*1.2,t)}else kn(s,h,E,d,L),Fn(e,L[0],L[1],t,!1,0,0)}if(Z&&$>0){const x=a.size*2.4,m=p?1:oe?2:3;for(let E=0;E<m;E++){const d=p?g:w()*Le;let A=-1,F=1/0;for(let P=0;P<90;P++){const _=w()*$|0;if(r0[_])continue;const W=ie[_]-s,ze=le[_]-h,Ve=Math.hypot(W,ze);if(Ve<x||Ve>1.1)continue;let Ne=Math.abs(Math.atan2(ze,W)-d);Ne>Math.PI&&(Ne=Le-Ne);const k0=Ne+Ve*.4;k0<F&&(y||xo(s,h,ie[_],le[_]))&&(F=k0,A=_)}if(A<0)continue;const M=ie[A]-Se[A]*.003,B=le[A]-Te[A]*.003,S=Fn(e,M,B,t,!0,Se[A],Te[A]);if(!S)break;const R=Math.hypot(s-M,h-B)||1;Wt(M,B,Se[A],Te[A],32,1,1.3,.35,(s-M)/R,(h-B)/R,R*.04,.05),Bo(e,M,B,1,S.life*1.3,t),Bo(e,M,B,-1,S.life*1.3,t)}}Wt(s,h,0,1,56,1.3,Math.PI,.45,0,0,0,.06),xe=Math.max(xe,.45+.4*Math.min(1,t)),U-D0>.5&&(xn=mt,gn=rt),D0=U,bt=Math.max(bt,Math.min(1,t)),h0=Math.max(h0,Math.min(1,t));const u=z.audio;u&&(u.impact({strength:.6+.5*Math.min(1,t),pitch:.9}),u.zap({strength:1}),u.whoosh({strength:.6,duration:.5,up:!1})),p0=U+.32,$n=t}function ur(e){const t=T[e];if(t.charge<.06||!O[e]){t.charge=0,t.chimed=!1;return}const n=1+Math.round(2*Math.min(1,t.charge/Nn));for(let r=0;r<n;r++){const o=Mt();if(!o)break;const a=w()*Le,i=t.ballR*k(1.2,2.4)+.02;o.a.t=t0,o.a.h=e,o.a.ang=a,o.a.r=.8,Xe(o.b,t.bx+Math.cos(a)*i,t.by+Math.sin(a)*i),o.on=!0,o.transient=!0,o.born=U,o.kick=U,o.life=k(.06,.14),o.ns=0,o.stype=nn,o.sid=e,o.kind=ye,o.seed=w()*4294967296|0,o.width=.55,o.core=.6,o.lightK=.4,o.cr=.55,o.cg=.5,o.cb=1,o.behind=0,o.strike=0,o.energy=o.power=k(.8,1.3),o.levels=j(i),x0(o,o.levels,.34,1),o.nextShape=U+.03}vt=Math.max(vt,.5),O0(.25),t.charge=0,t.chimed=!1}function fr(e,t){const n=O[e],r=Mt();if(!r||!n)return;const o=w()*Le,a=n.size*k(.15,.42);r.a.t=T0,r.a.h=e,r.a.ox=0,r.a.oy=0,r.b.t=T0,r.b.h=e,r.b.ox=Math.cos(o)*a,r.b.oy=Math.sin(o)*a,r.on=!0,r.transient=!0,r.born=U,r.kick=U,r.life=k(.03,.08),r.ns=0,r.stype=nn,r.sid=e,r.kind=ye,r.seed=w()*4294967296|0,r.width=.5,r.core=.55,r.lightK=.3,r.cr=.5,r.cg=.52,r.cb=1,r.behind=0,r.strike=0,r.energy=t*k(.7,1.3),r.power=r.energy,r.levels=j(a),x0(r,r.levels,.34,w()<.5?1:0),r.nextShape=U+.03}function hr(e,t,n,r){const o=Mt();if(!o)return;const a=t.points,i=Qe[n],s=i-1;let h=(a[i*3]-a[s*3])*b,f=a[i*3+1]-a[s*3+1];const p=Math.hypot(h,f)||1;h/=p,f/=p;const v=(w()*2-1)*1.25,g=Math.cos(v),y=Math.sin(v),l=t.size*k(.14,.45);Re(o.a,e,i),o.b.t=Ko,o.b.h=e,o.b.k=i,o.b.x=(h*g-f*y)*l,o.b.y=(h*y+f*g)*l,o.on=!0,o.transient=!0,o.born=U,o.kick=U,o.life=k(.035,.09),o.ns=0,o.stype=nn,o.sid=e,o.kind=ye,o.seed=w()*4294967296|0,o.width=.5,o.core=.6,o.lightK=.15,o.cr=.55,o.cg=.5,o.cb=1,o.behind=0,o.strike=0,o.energy=r*k(.7,1.25),o.power=o.energy,o.levels=j(l),x0(o,o.levels,.34,w()<.4?1:0),o.nextShape=U+.03}function pr(e){for(let t=J0;t<St;t++){const n=N[t];if(!n.on)continue;const r=e-n.born;if(r>=n.life){ee(n);continue}if(n.a.t!==de&&!O[n.a.h]){ee(n);continue}if(n.b.t!==de&&!O[n.b.h]){ee(n);continue}if(n.stype===nn){e>=n.nextShape&&(x0(n,n.levels,.34,w()<.4?1:0),n.nextShape=e+.03),n.energy=n.power*$e((n.life-r)/.02);continue}let o=0;for(let a=0;a<n.ns;a++){const i=r-n.strokes[a];i>=0&&(o+=Math.exp(-i/.045)*(a===0?1.25:.9))}if(o+=.3*(1-r/n.life),n.energy=o*(n.stype===Gn||n.stype===Wn?1.1:1.15+.55*n.power)*$e((n.life-r)/.08),e>=n.nextShape){if(n.stype===Gn){if(!Fo(n)){ee(n);continue}}else if(n.stype===Wn){if(!Eo(n)){ee(n);continue}}else ge(n,n.levels,.24,k(-.08,.08),n.branches,3);let a=1/0;for(let i=0;i<n.ns;i++)n.strokes[i]>r+.005&&(a=Math.min(a,n.strokes[i]));if(n.nextShape=a===1/0?e+.05:n.born+a,n.kick=e,n.strike&&w()<.5){let i=0,s=0;if(he(n.a,D)){const h=Math.hypot(D[0]-n.sx,D[1]-n.sy)||1;i=(D[0]-n.sx)/h,s=(D[1]-n.sy)/h}Wt(n.sx,n.sy,n.snx,n.sny,7,.9,1.3,.35,i,s,.02,.04)}}}}function dr(e,t){const n=T[e.id];if(!n.present||n.charge<Nn)return;const r=Math.hypot(t[0]*b,t[1])||1;So(e.id,n.charge,t[0]*b/r,t[1]/r,.45),n.charge=0,n.chimed=!1}function mr(e,t,n){const r=O[e],o=T[e],a=e*Ft;if((!r||r.age<o.age-.05)&&(o.present&&ar(a,Ft),o.present=!1,o.beads=0,o.charge=0,o.point=0,o.fade=0,o.ballR=0,o.ballE=0,o.pinch=0,o.pointHold=-9,o.fistT=-9,o.tightT=-9,o.peakC=0,o.chimed=!1,o.age=0,!r))return;o.present=!0,o.age=r.age,o.size=r.size,o.z=.07+.35*r.size,o.fade=$e(1-(r.lost-.1)/.15);const i=r.gesture,s=re&&An,h=!s&&(i==="fist"||r.fist>.82&&i!=="open"&&i!=="point");(i==="point"||i==="frame")&&(o.pointHold=t);const p=t-o.pointHold<.14,v=!h&&!p&&r.pinch>.3&&r.curls[1]<.85,g=!s&&!h&&!p&&(i==="open"||r.open>.55)&&r.pinch<.55;o.beads=Oe(o.beads,g?1:0,g?5:8,n),o.point=Oe(o.point,p?1:0,p?30:9,n),o.pinch=Oe(o.pinch,v?r.pinch:0,14,n);for(let d=0;d<5;d++)o.flick[d]=.55+.45*w();{const d=r.points;let A=(d[15]+d[27]+d[39]+d[51])*.25-d[0],F=(d[16]+d[28]+d[40]+d[52])*.25-d[1];A*=b;const M=Math.hypot(A,F)||1,B=re?0:.22*r.size;o.bx=r.palm[0]*b+A/M*B,o.by=r.palm[1]+F/M*B}const y=V.forceBall===e,l=(r.curls[1]+r.curls[2]+r.curls[3]+r.curls[4])*.25;h?o.peakC=Math.max(o.peakC,l):o.charge<=0&&(o.peakC=0),l>o.peakC-.1&&(o.tightT=t),h&&r.age>.4||y?(y?o.charge=Math.max(o.charge,V.forceCharge):r.speed<.9&&(o.charge=Math.min(1.25,o.charge+n/1.6)),o.fistT=t,o.charge>=1&&!o.chimed&&(o.chimed=!0,z.audio?.chime({strength:.35,pitch:1.6}))):o.charge>0&&!h&&(i==="open"||r.open>.72||p?t-o.tightT<Oo&&o.charge>=Nn?(So(e,o.charge,0,0,9),o.charge=0,o.chimed=!1):ur(e):t-o.fistT>Oo&&(o.charge=Math.max(0,o.charge-n*1.4),o.charge<1&&(o.chimed=!1),o.charge>.06&&w()<n*6&&(vt=Math.max(vt,.25))));const u=Math.min(1,o.charge);if(o.ballR=Oe(o.ballR,o.charge>.02?r.size*(.14+.62*Math.pow(u,.7)):0,o.charge>.02?9:22,n),o.ballE=Oe(o.ballE,o.charge>.02?.25+.85*u:0,10,n),o.beads>.3&&!re)for(let d=0;d<5;d++)w()<n*14*o.beads&&hr(e,r,d,.85*o.beads*o.fade);const x=qe>.5,m=o.beads>.25;for(let d=0;d<4;d++)ct(N[a+d],m,.65*o.beads*(x?.35:1),.04,.13,.04,.35/(.3+o.beads),t);ct(N[a+en],m&&!x,.35*o.beads,.03,.08,.15,.8,t);for(let d=0;d<2;d++){const A=N[a+tn+d];let F=0;if(m&&Z&&!A.on&&t>=A.nextOn){let M=1;for(let B=0;B<5;B++){const S=Qe[B],R=lt(r.points[S*3]*b,r.points[S*3+1],Vn);R>=0&&(M=Math.min(M,Math.hypot(ie[R]-r.points[S*3]*b,le[R]-r.points[S*3+1])/Vn))}F=M<1?o.beads*Math.pow(1-M,2)*3:0}ct(A,m,A.on?1:F,.06,.24,.06,.35,t)}if(o.pinch>.86&&!re)for(let d=0;d<2;d++)w()<n*16&&fr(e,.9*o.fade);{const d=N[a+E0],A=o.pinch>.25&&o.pinch<.9;A&&!d.on?(d.on=!0,d.born=t,d.kick=t,d.seed=w()*4294967296|0,qt(d),d.nextShape=t+1/d.rate):!A&&d.on?ee(d):d.on&&t>=d.nextShape&&(qt(d),d.nextShape=t+1/d.rate*k(.7,1.3)),d.on&&(d.energy=(.6+1.6*$e((o.pinch-.25)/.6))*(w()<.1?.3:k(.8,1.2)))}{const d=N[a+F0],A=o.point>.04;if(A&&!d.on?(d.on=!0,d.born=t,d.kick=t,d.seed=w()*4294967296|0,d.sEdge=-1,qt(d),d.nextShape=t+1/d.rate,Mo(.55),O0(.4)):!A&&d.on?(ee(d),ee(N[a+S0]),ee(N[a+S0+1])):d.on&&t>=d.nextShape&&(qt(d),d.nextShape=t+1/d.rate*k(.6,1.4),w()<.09&&O0(.18+.2*w())),d.on){const F=w()<.12?1.6:1;if(F>1&&(d.kick=t),d.energy=o.point*k(1.1,1.6)*F,d.strike===1){const M=(w()<.35?1:0)+(w()<.12?2:0);M&&Wt(d.sx,d.sy,d.snx,d.sny,M,.75,1.25,.3,-d.dirx,-d.diry,.015,.02);for(let B=0;B<2;B++){const S=N[a+S0+B];S.on&&(S.energy=(w()<.08?.3:k(.7,1.2))*o.point)}}}}const E=o.charge>.05;for(let d=0;d<5;d++)ct(N[a+Jt+d],E,.4+.6*u,.04,.14,.02,.28/(.2+u),t);for(let d=0;d<3;d++)ct(N[a+In+d],o.charge>.25,.3+.7*u,.05,.16,.1,.9/(.3+u),t)}function vr(e,t){const n=O[0],r=O[1];let o=!1,a=0;const i=!!(n&&r&&T[0].pinch>.3&&T[1].pinch>.3);if(n&&r&&(T[0].beads>.3&&T[1].beads>.3||i)){const f=(n.size+r.size)*.5,p=Math.hypot((n.palm[0]-r.palm[0])*b,n.palm[1]-r.palm[1])/Math.max(.001,f);a=$e((8.5-p)/6.5),re&&(a=Math.max(a,.55)),o=a>.02,a*=(i?.85:Math.min(T[0].beads,T[1].beads))*Math.min(T[0].fade,T[1].fade)}J=Oe(J,a,8,t),qe=Oe(qe,o?1:0,8,t);let s=0,h=1;n&&r&&n.palm[0]>r.palm[0]&&(s=1,h=0);for(let f=0;f<zn;f++){const p=N[Hn+f];p.pairA=s,p.pairB=h,f<5?ct(p,o&&!i,.35+.65*J,.04,.09+.5*J,.01,.06+.4*(1-J),e):f===5?ct(p,o&&(J>.62||i),i?.5+.5*J:.8,.05,.22,.02,i?.35:.15,e):ct(p,o&&J>.35,.5*J,.03,.1,.05,.4,e)}}function To(){for(let e=0;e<St;e++)ee(N[e]);ko(),nt=0;for(let e=0;e<2;e++){const t=T[e];t.present=!1,t.beads=0,t.charge=0,t.point=0,t.ballR=0,t.ballE=0,t.pinch=0,t.fade=0,t.chimed=!1,t.pointHold=-9,t.fistT=-9,t.tightT=-9,t.peakC=0,t.age=0}D0=-9,xn=gn=0,be=mt=rt=xe=bt=h0=J=qe=vt=0,p0=-1,ot=!1,m0=0,Rt[0]=Rt[1]=!1,o0=!0}let ce=0,je=0,Kt=0;function bo(e,t,n,r,o,a,i,s){if(e<2)return;let h=Y[2]-Y[1],f=X[2]-X[1],p=Math.hypot(h,f)||1;const v=n*.55;Y[0]=Y[1]-h/p*v,X[0]=X[1]-f/p*v,xt[0]=0,h=Y[e]-Y[e-1],f=X[e]-X[e-1],p=Math.hypot(h,f)||1,Y[e+1]=Y[e]+h/p*v,X[e+1]=X[e]+f/p*v,xt[e+1]=0;const g=e+2;if(ce+g*2+2>zo)return;for(let l=0;l<g;l++){let u=0,x=0,m=0,E=0,d=!1,A=!1;if(l>0){const S=Y[l]-Y[l-1],R=X[l]-X[l-1],P=Math.hypot(S,R);P>1e-4&&(u=-R/P,x=S/P,d=!0)}if(l<g-1){const S=Y[l+1]-Y[l],R=X[l+1]-X[l],P=Math.hypot(S,R);P>1e-4&&(m=-R/P,E=S/P,A=!0)}let F,M,B=1;if(d&&A){F=u+m,M=x+E;const S=Math.hypot(F,M);S<.001?(F=m,M=E):(F/=S,M/=S,B=1/Math.max(.42,F*u+M*x))}else d?(F=u,M=x):A?(F=m,M=E):(F=0,M=1);co[l]=F,uo[l]=M,wn[l]=B}const y=ce;ce>0&&xr(ce-1);for(let l=0;l<g;l++){const u=xt[l],x=n*(.55+.45*u),m=co[l]*x*wn[l],E=uo[l]*x*wn[l],d=t*(.3+.7*u),A=r*u;l===0&&y>0&&Sn(Y[l]+m,X[l]+E,1,x,d,A,o,a,i,s),Sn(Y[l]+m,X[l]+E,1,x,d,A,o,a,i,s),Sn(Y[l]-m,X[l]-E,-1,x,d,A,o,a,i,s)}}function Sn(e,t,n,r,o,a,i,s,h,f){const p=ce*Je;ue[p]=e,ue[p+1]=t,ue[p+2]=n,ue[p+3]=r,ue[p+4]=o,ue[p+5]=a,ue[p+6]=i,ue[p+7]=s,ue[p+8]=h,ue[p+9]=f,ce++}function xr(e){const t=ce*Je,n=e*Je;for(let r=0;r<Je;r++)ue[t+r]=ue[n+r];ce++}function G0(e,t,n,r,o,a,i,s){if(je>=Vo||o<=.002)return;const h=je*B0;Ce[h]=e,Ce[h+1]=t,Ce[h+2]=n,Ce[h+3]=r,Ce[h+4]=o,Ce[h+5]=a,Ce[h+6]=i,Ce[h+7]=s,je++}function Tn(e,t,n,r,o,a,i,s,h,f,p){if(p<=.002)return;let v;if(Ke>=pe){let g=0;for(let y=1;y<Ke;y++)Me[y]<Me[g]&&(g=y);if(Me[g]>=p)return;v=g}else v=Ke++;Lt[v]=e,Ct[v]=t,Dt[v]=n,_t[v]=r,Ut[v]=o,Ht[v]=a,zt[v]=i,gt[v]=s,yt[v]=h,At[v]=f,Me[v]=p,Vt[v]=v0,Nt[v]=Mn}const A0=(e,t,n,r,o,a,i,s)=>Tn(e-b*.5,t-.5,n,e-b*.5,t-.5,n,r,o,a,i,s);function Ro(e,t){return t.behind?-.1:e.t===de?t.kind===n0||t.strike?.035:.1:T[e.h].z+.02}function gr(e,t){let n=0,r=0,o=1,a=0,i=1;if(e.kind===ye){if(!he(e.a,D)||!he(e.b,L))return;n=D[0],r=D[1];const B=L[0]-n,S=L[1]-r;if(i=Math.hypot(B,S),i<1e-4)return;o=B/i,a=S/i}const s=e.energy*e.flick*t;if(v0=e.behind?.3:e.stype===Wo?.4:1,Mn=e.strike===1||e.kind===n0?.5:1,s<.01)return;let h=0,f=0;e.a.t!==de&&O[e.a.h]&&(h+=O[e.a.h].size,f++),e.b.t!==de&&O[e.b.h]&&(h+=O[e.b.h].size,f++);const p=f?Ze(Math.pow(h/f/.16,.7),.8,1.7):1,v=.00105*it*e.core*wt*p,g=.0165*it*e.width*wt*Math.sqrt(p),y=e.pts;for(let B=0;B<e.nl;B++){const S=e.lines[B*2],R=e.lines[B*2+1];if(R>Ee)continue;for(let _=0;_<R;_++){const W=(S+_)*3;let ze,Ve;if(e.kind===ye){const Ne=y[W]*i,k0=y[W+1]*i;ze=n+Ne*o-k0*a,Ve=r+Ne*a+k0*o}else ze=y[W],Ve=y[W+1];Y[_+1]=ze/b*fe,X[_+1]=Ve*Q,xt[_+1]=y[W+2]}const P=e.lineW[B];bo(R,v*P,g*(.5+.5*P),s*e.lineE[B],e.cr,e.cg,e.cb,e.behind)}const l=.65+2.3*Math.exp(-(U-e.kick)/.045),u=e.kind===ye?i:e.plen,x=s*e.lightK*(.15+u)*l*Go,m=Math.max(2,e.nMain),E=u>.45?3:u>.18?2:1,d=e.kind===n0?.03:Ro(e.a,e),A=e.kind===n0?.03:Ro(e.b,e);let F=0,M=0;for(let B=0;B<=E;B++){const S=Math.floor(B*(m-1)/E)*3;let R,P;if(e.kind===ye){const _=y[S]*i,W=y[S+1]*i;R=n+_*o-W*a,P=r+_*a+W*o}else R=y[S],P=y[S+1];if(R-=b*.5,P-=.5,B>0){const _=(B-1)/E,W=B/E;Tn(F,M,d+(A-d)*_,R,P,d+(A-d)*W,.075,.74,.8,1,x/E)}F=R,M=P}e.strike===1&&(A0(e.sx,e.sy,.035,.05,.78,.82,1,s*e.lightK*.55*l*Go),G0(e.sx/b*fe,e.sy*Q,.016*it*wt*(.8+.4*Math.min(1.5,s)),3,Math.min(3.5,s*.9),2,e.i*1.7,0))}function yr(e){const t=Math.max(2,e.width>>1),n=Math.max(2,e.height>>1);te?(te.width!==t||te.height!==n)&&(te.resize(t,n),o0=!0):(te=C.pingPong(t,n,{format:"hdr"}),o0=!0);const r=e.width*e.height>35e5?3:2,o=Math.max(2,Math.round(e.width/r)),a=Math.max(2,Math.round(e.height/r));De?(De.width!==o||De.height!==a)&&De.resize(o,a):De=C.target(o,a,{format:"hdr"}),ne?(ne.width!==t||ne.height!==n)&&ne.resize(t,n):ne=C.target(t,n,{format:"hdr"});const i=Math.max(2,e.width>>2),s=Math.max(2,e.height>>2);we?(we.width!==i||we.height!==s)&&we.resize(i,s):we=C.pingPong(i,s,{format:"hdr"}),_e?(_e.width!==i||_e.height!==s)&&_e.resize(i,s):_e=C.pingPong(i,s,{format:"hdr"}),q?(q.width!==i||q.height!==s)&&q.resize(i,s):q=C.pingPong(i,s,{format:"hdr"}),me?(me.width!==e.width||me.height!==e.height)&&me.resize(e.width,e.height):me=C.target(e.width,e.height,{format:"hdr"});const h=e.aspect;if(!pt||Math.abs(h-Kn)>.01){const f=oe?4200:6400,p=Math.max(16,Math.round(Math.sqrt(f*h))),v=Math.max(16,Math.round(f/p));H=p,G=v,Kn=h,pt?pt.resize(H,G):pt=C.target(H,G,{format:"rgba8",filter:"linear"}),ve=new Uint8Array(H*G),P0=new Int16Array(H*G),L0=new Int32Array(H*G),un=new Uint8Array(H*G*4),Fe&&(c.deleteSync(Fe),Fe=null),et||(et=c.createBuffer()),cn=H*G*4,c.bindBuffer(c.PIXEL_PACK_BUFFER,et),c.bufferData(c.PIXEL_PACK_BUFFER,cn,c.STREAM_READ),c.bindBuffer(c.PIXEL_PACK_BUFFER,null),Z=!1,$=0}}function Ar(e){if(Fe){if(c.getSyncParameter(Fe,c.SYNC_STATUS)!==c.SIGNALED)return;c.deleteSync(Fe),Fe=null,c.bindBuffer(c.COPY_READ_BUFFER,et),c.getBufferSubData(c.COPY_READ_BUFFER,0,un),c.bindBuffer(c.COPY_READ_BUFFER,null),Jo()}Zn%3===0&&(Y0.uMask=e.mask,Y0.uCell[0]=1/H,Y0.uCell[1]=1/G,C.pass(K.maskDown,pt,Y0),c.bindBuffer(c.PIXEL_PACK_BUFFER,et),c.bufferData(c.PIXEL_PACK_BUFFER,cn,c.STREAM_READ),c.readPixels(0,0,H,G,c.RGBA,c.UNSIGNED_BYTE,0),c.bindBuffer(c.PIXEL_PACK_BUFFER,null),Fe=c.fenceSync(c.SYNC_GPU_COMMANDS_COMPLETE,0))}function wr(){me.clear(0,0,0,0),!(Kt<=2)&&(c.enable(c.BLEND),c.blendEquation(c.MAX),c.blendFunc(c.ONE,c.ONE),ke.uMask=q0,ke.uTarget[0]=me.width,ke.uTarget[1]=me.height,ke.uPix=1,ke.uGain=R0?.125:1,K.strip.use().set(ke),c.bindVertexArray(b0),c.drawArrays(c.TRIANGLE_STRIP,0,Kt),c.bindVertexArray(null),c.blendEquation(c.FUNC_ADD),c.disable(c.BLEND))}function Mr(e){e.bind(),c.enable(c.BLEND),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.ONE,c.ONE),ce-Kt>2&&(ke.uMask=q0,ke.uTarget[0]=e.width,ke.uTarget[1]=e.height,ke.uPix=1,ke.uGain=1,K.strip.use().set(ke),c.bindVertexArray(b0),c.drawArrays(c.TRIANGLE_STRIP,Kt,ce-Kt)),je>0&&(Xt.uMask=q0,Xt.uTarget[0]=e.width,Xt.uTarget[1]=e.height,Xt.uTime=K0,Xt.uGain=1,K.sprite.use().set(Xt),c.bindVertexArray(rn),c.drawArraysInstanced(c.TRIANGLE_STRIP,0,4,je));for(let t=0;t<2;t++){const n=T[t];!n.present||n.ballR<=.004||n.ballE<=.01||(se.uBall[0]=n.bx/b*fe,se.uBall[1]=n.by*Q,se.uBall[2]=n.ballR*Q,se.uBall[3]=1.8,se.uBallB[0]=n.ballE*(.85+.3*w())*n.fade,se.uBallB[1]=t*11.7,se.uBallB[2]=ut?1:0,se.uBallB[3]=Math.min(1,n.charge),se.uHand=ne,se.uAlpha=q.read,se.uTarget[0]=e.width,se.uTarget[1]=e.height,se.uHtoPx=n.size*.1*e.height,se.uTime=K0,se.uGain=1,K.ball.use().set(se),c.bindVertexArray(qn),c.drawArrays(c.TRIANGLE_STRIP,0,4))}c.bindVertexArray(null),c.disable(c.BLEND)}let ut=!1;function kr(){if(ne.clear(0,0,0,0),ut=!1,!vn||V.noHand)return;let e=0;const t=ne.width,n=ne.height;for(let r=0;r<2;r++){const o=O[r],a=T[r];if(!o)continue;const i=a.fade*$e(1-(o.lost-.06)/.08)*$e(1-(o.speed-.8)/.7);if(i<.05)continue;const s=o.points,h=o.size*n;for(let f=0;f<No;f++){const p=Yo[f*2],v=Yo[f*2+1],g=e*Tt;Ae[g]=s[p*3]*t,Ae[g+1]=s[p*3+1]*n,Ae[g+2]=s[v*3]*t,Ae[g+3]=s[v*3+1]*n,Ae[g+4]=Xo[f]*h,Ae[g+5]=a.z,Ae[g+6]=Xo[f]*o.size,Ae[g+7]=Cr[f],Ae[g+8]=i,e++}}e&&(ut=!0,c.bindBuffer(c.ARRAY_BUFFER,ln),c.bufferSubData(c.ARRAY_BUFFER,0,Ae,0,e*Tt),c.bindBuffer(c.ARRAY_BUFFER,null),ne.bind(),c.enable(c.BLEND),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.ONE,c.ONE),Dn.uRes[0]=t,Dn.uRes[1]=n,K.hand.use().set(Dn),c.bindVertexArray(sn),c.drawArraysInstanced(c.TRIANGLE_STRIP,0,4,e),c.bindVertexArray(null),c.blendEquation(c.FUNC_ADD),c.disable(c.BLEND))}const Yt={uBase:null,uHand:null,uTexel:new Float32Array(2),uCore:1},bn={uSrc:null,uDir:new Float32Array(2)},Rn={uSrc:null,uDir:new Float32Array(2)};function Br(e){if(!(!ut||V.noRefine)){Yt.uBase=e.base,Yt.uHand=ne,Yt.uTexel[0]=1/e.width,Yt.uTexel[1]=1/e.height,bn.uDir[0]=1/we.width,Rn.uDir[1]=1/we.height;for(let t=0;t<2;t++){const n=t?_e:we;Yt.uCore=t?0:1,C.pass(K.hmPrep,n.write,Yt),n.swap(),bn.uSrc=n.read,C.pass(K.hmBox,n.write,bn),n.swap(),Rn.uSrc=n.read,C.pass(K.hmBox,n.write,Rn),n.swap()}}}const Pe={uBase:null,uMask:null,uPlate:null,uPlateL:null,uHand:null,uGF:null,uGFB:null,uTexel:new Float32Array(2),uHasHand:0},Pn={uSrc:null,uDir:new Float32Array(2)},Ln={uSrc:null,uDir:new Float32Array(2)};function Er(e){Pe.uBase=e.base,Pe.uMask=e.mask,Pe.uPlate=e.plate,Pe.uPlateL=e.plateLearned,Pe.uHand=ne,Pe.uGF=we.read,Pe.uGFB=_e.read,Pe.uTexel[0]=1/e.width,Pe.uTexel[1]=1/e.height,Pe.uHasHand=ut&&!V.noHandComp?1:0,C.pass(K.alpha,q.write,Pe),q.swap(),Pn.uDir[0]=1/q.width,Ln.uDir[1]=1/q.height,Pn.uSrc=q.read,C.pass(K.blur9,q.write,Pn),q.swap(),Ln.uSrc=q.read,C.pass(K.blur9,q.write,Ln),q.swap()}let w0=null;const W0=[],Po=[[],[],[],[],[],[],[]];let Cn=-1;function kt(e){if(!Ho||!V.prof||(w0||(w0=c.getExtension("EXT_disjoint_timer_query_webgl2")),!w0))return;Cn>=0&&(c.endQuery(w0.TIME_ELAPSED_EXT),Cn=-1);for(let n=W0.length-1;n>=0;n--){const r=W0[n];c.getQueryParameter(r.q,c.QUERY_RESULT_AVAILABLE)&&(Po[r.k].push(c.getQueryParameter(r.q,c.QUERY_RESULT)/1e6),c.deleteQuery(r.q),W0.splice(n,1))}if(e===2||e===6)return;const t=c.createQuery();c.beginQuery(w0.TIME_ELAPSED_EXT,t),W0.push({q:t,k:e}),Cn=e}const M0=new Float32Array(2);let q0=null,Fr=null,K0=0;const Y0={uMask:null,uCell:new Float32Array(2)},ke={uRes:M0,uMask:null,uTarget:new Float32Array(2),uPix:1,uGain:1},Xt={uRes:M0,uMask:null,uTarget:new Float32Array(2),uTime:0,uGain:1},se={uRes:M0,uBall:new Float32Array(4),uBallB:new Float32Array(4),uHand:null,uAlpha:null,uTarget:new Float32Array(2),uHtoPx:1,uTime:0,uGain:1},Dn={uRes:new Float32Array(2)},Qt={uPrev:null,uEnergy:null,uTexel:new Float32Array(2),uK:1,uG:1},Bt={uNormals:null,uHand:null,uAspect:1,uWallZ:Pr,uWallGain:1.4,uOutScale:R0?.125:1,uHasHand:0,uLA:Ye,uLB:st,uLC:Ot,uNL:0,uView:0},I={uBase:null,uAlpha:null,uNormals:null,uAfter:null,uLight:null,uHand:null,uAfterTexel:new Float32Array(2),uAspect:1,uTime:0,uAmbient:1,uDesat:0,uTint:new Float32Array([1,1,1]),uRoom:new Float32Array(3),uWallDim:0,uWallRoom:1,uWallTint:new Float32Array([.8,.86,1]),uHaze:.0012,uAfterGain:.5,uLightIn:R0?8:1,uEnergyIn:R0?8:1,uEnergy:null,uHasHand:0,uView:0},Lo={level:0},_n={level:0,pitch:1},Co={level:0,tone:.75},X0=[{x:0,y:0,size:.15,roll:0,side:"left",curls:null,pinch:0},{x:0,y:0,size:.15,roll:0,side:"right",curls:null,pinch:0}],Q0=[{pts:null,side:"left"},{pts:null,side:"right"}],j0=[],Sr=[new Array(5).fill(0),new Array(5).fill(0)],Tr=(e,t,n,r)=>{const o=Sr[e];for(let a=0;a<5;a++)o[a]=t[a]+(n[a]-t[a])*r;return o},Z0=(e,t,n)=>{const r=$e((n-e)/(t-e));return r*r*(3-2*r)},br=[.35,.42,.45,.48,.5],ae={asp:1,buffers:null,synthHand:null,POSES:null};function Do(e,t){Q0[e].pts=ae.synthHand(X0[e],ae.asp,ae.buffers[e]),Q0[e].side=t,j0.push(Q0[e])}function _o(e,t,n,r,o,a,i){const s=X0[e];s.side=t,s.size=a,s.curls=i,s.pinch=0,s.x=n,s.y=r,s.roll=o,Do(e,t)}function Un(e,t,n,r,o,a){_o(e,t,n,r,o,a,ae.POSES.point)}function Zr(e){Q0[e].pts=ae.synthHand(X0[e],ae.asp,ae.buffers[e])}function jt(e,t,n,r,o,a){_o(e,t,n,r,o,a,ae.POSES.open)}function $0(e,t,n,r,o,a,i){const s=ae.asp;let h=(o-n)*s,f=a-r;const p=Math.hypot(h,f)||1;h/=p,f/=p,Un(e,t,n-h*1.35*i/s,r-f*1.35*i,Math.atan2(h,f),i),Rt[e]=!0,ao[e]=o*s,so[e]=a,io[e]=n*s,lo[e]=r}function Uo(e,t,n,r,o){const a=X0[0],i=e-4.95;a.side="right",a.size=o,a.pinch=0,a.x=n+.008*Math.sin(t*3.1),a.y=r+.01*Math.sin(t*2.3)+(i>3.8?-(i-3.8)*.5:0),a.roll=-.15+.05*Math.sin(t*1.7),a.curls=i<.25?Tr(0,ae.POSES.relaxed,ae.POSES.fist,i/.25):i<2.75?ae.POSES.fist:i<2.92?ae.POSES.open:br,m0=i>.35&&i<2.7?1:0,An=i>2.92,Do(0,"right")}function Rr(e,t,n,r,o){pn=e,j0.length=0,ot=!1,f0=!1,mn=!1,Rt[0]=Rt[1]=!1,m0=0,An=!1;const a=e%16,i=t<1;if(ae.asp=t,ae.buffers=n,ae.synthHand=r,ae.POSES=o,i){const h=.13/t;if(a<2.2)$0(0,"right",1.05,1.07,.84,.76,.14);else if(a>2.5&&a<4.6)$0(0,"left",-.05,1.02,.18,.67,.14);else if(a>4.95&&a<9.7)Uo(a,e,.93,.645,.095);else if(a>10&&a<12.9){ot=!0,f0=!0;const f=a-10,p=Z0(0,.7,f)*.03,v=.75+.01*Math.sin(e*1.3);jt(0,"left",-h-.03+p,v,1.52,.1),jt(1,"right",1+h+.03-p,v+.01*Math.sin(e*.9),-1.52,.1)}else if(a>13.2&&a<15.8){const f=a-13.2,p=.01*Math.sin(e*2.1);$0(0,"left",-.07,1.03+p,.19,.7,.14),f>.35&&$0(1,"right",1.07,.99-p,.81,.79,.14)}return j0}if(a<4.6)if(a<2.3){const s=a/2.3;Un(0,"right",.93-.04*s,1.28,-2.62+.22*s,.15)}else{const s=(a-2.3)/2.3;Un(0,"right",1.16,.86-.3*s,-1.72-.25*s,.15)}else if(!(a<4.95)){if(a<9.7)Uo(a,e,.655,.31,.16);else if(!(a<10)){if(a<12.9){ot=!0;const s=a-10,h=Z0(0,.7,s)*.05,f=.55+.015*Math.sin(e*1.3);jt(0,"left",-.24+h,f-.02,1.45,.16),jt(1,"right",1.24-h,f+.02*Math.sin(e*.9),-1.45,.16)}else if(!(a<13.2)){const s=a-13.2;mn=!0;const h=Z0(0,.6,s),p=.21-.12*Z0(.3,2.4,s),v=-.13+.26*h+.008*Math.sin(e*2.2);jt(0,"left",.5-p,v,.5,.17),jt(1,"right",.5+p,v+.006*Math.sin(e*1.7),-.5,.17)}}}return j0}const Et={id:"storm",coach:[{gesture:"open",label:"Open palm",text:"charge your fingertips"},{gesture:"two",label:"Both hands",text:"arc lightning between them"},{gesture:"point",label:"Point",text:"strike with a bolt"},{gesture:"fist",label:"Fist, open",text:"charge, then unleash"}],choreography:Rr,activeCues(e){return Pt.length=0,(T[0].beads>.4||T[1].beads>.4)&&Pt.push("open"),qe>.5&&Pt.push("two"),(T[0].point>.5||T[1].point>.5)&&Pt.push("point"),(T[0].charge>.05||T[1].charge>.05)&&Pt.push("fist"),Pt},update(e){const t=e.time,n=Ze(e.dt||1/60,0,.05);U=t;const r=z.state;b=r.width/Math.max(1,r.height)||16/9;const o=z.source&&z.source.element,a=!!(o&&o.tagName==="VIDEO");vn=a,re=!a&&t-pn<.3,dn&&!re&&(To(),ro=t),dn=re,fn=re?190:128,_0=Math.min(2,_0+n*1.5),U0=Math.min(3,U0+n*5),O[0]=O[1]=null;const i=e.hands,s=e.events;for(let l=0;l<i.length;l++){const u=i[l];u.id!==0&&u.id!==1||vn&&t-u.lost-u.age<ro-.05||(O[u.id]=u)}tr();for(let l=0;l<s.length;l++){const u=s[l];u.type==="throw"&&u.hand&&dr(u.hand,u.direction||u.hand.velocity)}vr(t,n);for(let l=0;l<2;l++)mr(l,t,n);if(re&&m0&&t>=oo)for(let l=0;l<2;l++){const u=T[l];!u.present||u.charge<.02||(cr(l),oo=t+k(.06,.2)*(1.2-.5*Math.min(1,u.charge)))}pr(t),rr(n),yn=0;let h=nt>0;for(let l=0;l<St;l++){const u=N[l];if(!u.on)continue;h=!0;const x=t-u.born<.03?1.5:1;u.flick=(w()<.06?.25:.7+.3*w())*x,yn+=u.energy*.12}(h||T[0].ballR>0||T[1].ballR>0||T[0].beads>.02||T[1].beads>.02)&&(no=t),(t-d0>600&&t-no>1.5||t-d0>3e3||t<d0)&&(d0=t),K0=t-d0;let f=0,p=0,v=0,g=0;for(let l=0;l<2;l++){const u=T[l],x=Math.min(1,u.charge);f=Math.max(f,u.beads*.65,x+(u.charge>0?.25:0),u.point*.9,u.pinch*.5),p=Math.max(p,u.beads*.13,u.point*.3,u.pinch*.1,u.charge>.02?.15+.6*x:0),u.charge>.02&&(v=Math.max(v,.2+.35*x),g=Math.max(g,x))}f=Math.max(f,qe*(.7+.3*J)),p=Math.max(p,qe*(.14+.12*J)),re&&(f=Math.max(f,.92),p=Math.max(p,ot&&!f0?.8:.56),m0&&(p=Math.max(p,.64+.2*g),v=Math.max(v,.45+.4*g))),t-D0<.5&&(p=Math.max(p,xn*.9),v=Math.max(v,gn)),be=Oe(be,Math.min(1,f),f>be?2.5:.7,n),mt=Oe(mt,p,p>mt?2.2:1.8,n),rt=Oe(rt,v,v>rt?2.2:1.3,n),xe*=Math.exp(-n/.075),bt*=Math.exp(-n/.22),h0*=Math.exp(-n/.14),vt*=Math.exp(-n/.12);const y=z.audio;if(y){const l=Math.max(T[0].charge,T[1].charge);Lo.level=Math.min(.9,yn*.8+(l>0?.2+l*.5:0)+vt),_n.level=Math.min(1,Math.max(l*.85,qe*J*.45,Math.max(T[0].beads,T[1].beads)*.12)),_n.pitch=.7+Math.min(1.2,l)*1.5+J*.6,Co.level=Math.min(.5,qe*J*.25+Math.max(T[0].point,T[1].point)*.22+xe*.3),y.layer("crackle",Lo),y.layer("hum",_n),y.layer("noise",Co),p0>0&&t>=p0&&(y.impact({strength:.45+.4*Math.min(1,$n),pitch:.42}),p0=-1)}},render(e){Zn++,oe=!!e.mobile,fe=e.width,Q=e.height,b=e.aspect,it=fe>=Q?Q:Math.min(Q,fe*1.3),wt=oe?.92:1,M0[0]=fe,M0[1]=Q,q0=e.mask,Fr=e.base,yr(e),Ar(e),ce=0,je=0,Ke=0;for(let l=0;l<St;l++){const u=N[l];if(!u.on||u.np<2)continue;let x=1;u.kind===ye?(u.a.t!==de&&(x*=T[u.a.h].fade),u.b.t!==de&&(x*=T[u.b.h].fade)):u.sid>=0&&T[u.sid].present&&(x*=T[u.sid].fade),gr(u,x)}v0=1,Mn=1,Kt=ce;const t=.0034*it*wt,n=5e-4*it*wt,r=.0022*it;for(let l=0;l<nt;l++){if(We[l]<0)continue;const u=1-We[l]/l0[l],x=c0[l]*Math.pow(u,.8);let m=Math.pow(u,1.3)*2.4*(.6+.4*c0[l]),E,d,A;u0[l]?(E=.6+.4*x,d=.72+.28*x,A=1):(E=1,d=.16+.84*Math.pow(x,1.6),A=.03+.85*Math.pow(x,3.2));const F=s0[l]/b*fe,M=i0[l]*Q;let B=tt[l]*.012,S=Ge[l]*.012;const R=Math.hypot(B*fe/b,S*Q);if(R<r){const P=r/Math.max(R,.001);B*=P,S*=P}m*=Ze(R/(.006*it),.15,1),Y[1]=F-B/b*fe,X[1]=M-S*Q,xt[1]=0,Y[2]=F-B/b*fe*.3,X[2]=M-S*Q*.3,xt[2]=.55,Y[3]=F,X[3]=M,xt[3]=1,bo(3,n,t,m,E,d,A,2)}for(let l=0;l<2;l++){const u=T[l],x=O[l];if(!x||!u.present)continue;const m=u.fade,E=x.size*Q*.068*wt;if(u.beads>.03||u.point>.03){let d=0,A=0,F=0;for(let M=0;M<5;M++){const B=Qe[M],S=M===1,R=(u.beads*(.8+.6*u.flick[M])*(re?M===0?0:.4:1)+(S?u.point*1.8:0))*m;if(R<.02)continue;const P=x.points[B*3],_=x.points[B*3+1];G0(P*fe,_*Q,E*(S?1+.5*u.point:1),3.2,R,0,l*7+M*1.3,0),d+=P*b*R,A+=_*R,F+=R}if(F>0){const M=x.points,B=u.z+.15*x.size,S=F*2.7*x.size*x.size,R=x.size*.3,P=M[24]*b-b*.5,_=M[25]-.5,W=M[60]*b-b*.5,ze=M[61]-.5;Tn(P,_,B,W,ze,B,R,.66,.7,1,S*.8),A0(M[12]*b,M[13],B,R,.66,.7,1,S*.2)}}if(u.pinch>.25){const d=x.pinchPoint[0],A=x.pinchPoint[1],F=$e((u.pinch-.25)/.5)*1.5*(.7+.6*w())*m;G0(d*fe,A*Q,E*1.15,3,F,1,l*3.1,0),A0(d*b,A,u.z+.03,x.size*.35,.8,.88,1,F*.25*(.5+x.size*3))}if(u.ballR>.004&&u.ballE>.01){const d=Math.min(1.25,u.charge),A=.85+.3*w();v0=.5,A0(u.bx,u.by,u.z+.04,Math.max(.04,u.ballR*.8),.7,.66,1,(.08+1.6*d*d)*A*m*u.ballE),v0=1}}if(xe>.02)for(let l=J0;l<St;l++){const u=N[l];if(!u.on||u.a.t!==e0)continue;const x=O[u.a.h],m=T[u.a.h];if(x){G0(m.bx/b*fe,m.by*Q,x.size*Q*.7,2.5,xe*.9,3,0,0),A0(m.bx,m.by,m.z+.04,.09,.82,.85,1,xe*4);break}}const o=Math.min(oe?10:ft,Ke),a=V.mode==="nolight"||V.mode==="raw";for(let l=0;l<o;l++){let u=l;for(let m=l+1;m<Ke;m++)Me[m]>Me[u]&&(u=m);if(u!==l){let m;m=Lt[l],Lt[l]=Lt[u],Lt[u]=m,m=Ct[l],Ct[l]=Ct[u],Ct[u]=m,m=Dt[l],Dt[l]=Dt[u],Dt[u]=m,m=_t[l],_t[l]=_t[u],_t[u]=m,m=Ut[l],Ut[l]=Ut[u],Ut[u]=m,m=Ht[l],Ht[l]=Ht[u],Ht[u]=m,m=zt[l],zt[l]=zt[u],zt[u]=m,m=gt[l],gt[l]=gt[u],gt[u]=m,m=yt[l],yt[l]=yt[u],yt[u]=m,m=At[l],At[l]=At[u],At[u]=m,m=Me[l],Me[l]=Me[u],Me[u]=m,m=Vt[l],Vt[l]=Vt[u],Vt[u]=m,m=Nt[l],Nt[l]=Nt[u],Nt[u]=m}const x=Me[l]*Io;Ye[l*4]=Lt[l],Ye[l*4+1]=Ct[l],Ye[l*4+2]=Dt[l],Ye[l*4+3]=zt[l],st[l*4]=_t[l],st[l*4+1]=Ut[l],st[l*4+2]=Ht[l],st[l*4+3]=Nt[l],Ot[l*4]=gt[l]*x,Ot[l*4+1]=yt[l]*x,Ot[l*4+2]=At[l]*x,Ot[l*4+3]=(gt[l]+yt[l]+At[l])*x/3*Vt[l]}let i=0;for(let l=0;l<Ke;l++)i+=Me[l];const s=a?0:Math.min(.3,i*Io*.35),h=a?0:xe,f=s+h*.32;I.uWallRoom=f>1e-4?(s*(1-.75*rt)+h*.1)/f:1,ce>0&&(c.bindBuffer(c.ARRAY_BUFFER,on),c.bufferSubData(c.ARRAY_BUFFER,0,ue,0,ce*Je)),je>0&&(c.bindBuffer(c.ARRAY_BUFFER,an),c.bufferSubData(c.ARRAY_BUFFER,0,Ce,0,je*B0)),c.bindBuffer(c.ARRAY_BUFFER,null),kt(0),kr(),Br(e),Er(e),kt(1),wr(),kt(2),o0&&(te.read.clear(0,0,0,1),te.write.clear(0,0,0,1),o0=!1),Qt.uPrev=te.read,Qt.uEnergy=me,Qt.uK=Math.exp(-(e.dt||1/60)/.11),Qt.uTexel[0]=1/te.width,Qt.uTexel[1]=1/te.height,C.pass(K.decay,te.write,Qt),te.swap();const p=e.normals();Bt.uNormals=p,Bt.uHand=ne,Bt.uAspect=b,Bt.uHasHand=ut&&!V.noHandLight?1:0,Bt.uNL=a?0:o,Bt.uView=V.mode==="vnormal"?3:V.mode==="vdepth"?4:0,kt(3),C.pass(K.light,De,Bt),kt(4),I.uBase=e.base,I.uAlpha=q.read,I.uNormals=p,I.uAfter=te.read,I.uLight=De,I.uHand=ne,I.uEnergy=me,I.uAfterTexel[0]=1/te.width,I.uAfterTexel[1]=1/te.height,I.uAspect=b,I.uTime=K0,I.uHasHand=ut&&!V.noHandComp?1:0;const v=V.mode==="raw"?0:mt;I.uAmbient=1-v,I.uDesat=.38*v,I.uWallDim=V.mode==="raw"?0:rt,I.uTint[0]=1-.24*v,I.uTint[1]=1-.13*v,I.uTint[2]=1+.1*v,I.uRoom[0]=f*.74,I.uRoom[1]=f*.8,I.uRoom[2]=f,I.uAfterGain=V.mode==="raw"?0:.4,I.uView=V.mode==="vlight"||V.mode==="vnormal"||V.mode==="vdepth"?1:V.mode==="vhand"?2:V.mode==="virr"?5:V.mode==="vmm"?6:V.mode==="venergy"?7:V.mode==="vbase"?8:V.mode==="vwall"?9:V.mode==="vlp"?10:0,C.pass(K.comp,e.scene,I),kt(5),Mr(e.scene),kt(6);const g=e.post;if(g.bloom=.085+.07*be+.06*xe,g.exposure=1+.12*xe,g.flash=xe*.025,g.aberration=.0015*be+.006*h0,bt>.01){const l=bt*.006;g.shake[0]=(w()*2-1)*l,g.shake[1]=(w()*2-1)*l}const y=Math.max(T[0].charge,T[1].charge);if(y>.6){const l=(y-.6)*.0012;g.shake[0]+=(w()*2-1)*l,g.shake[1]+=(w()*2-1)*l}g.vignette=.35+.15*be,g.grain=.03+.018*be,g.saturation=1-.06*be,g.filmic=.15*be},reset(){To(),pn=-9,dn=!1,Z=!1,$=0},dispose(){Fe&&(c.deleteSync(Fe),Fe=null),et&&(c.deleteBuffer(et),et=null),c.deleteBuffer(on),c.deleteBuffer(an),c.deleteBuffer(ln),c.deleteVertexArray(b0),c.deleteVertexArray(rn),c.deleteVertexArray(sn),c.deleteVertexArray(qn),te?.dispose(),pt?.dispose(),De?.dispose(),ne?.dispose(),me?.dispose(),we?.dispose(),_e?.dispose(),q?.dispose(),te=pt=De=ne=me=we=_e=q=null;for(const e in K)K[e].dispose()}};return Ho&&(Object.defineProperty(Et,"stats",{get(){let e=0;for(const t of N)t.on&&e++;return{storm:be,dim:mt,wallDim:rt,flash:xe,bolts:e,sparks:nt,edges:$,verts:ce,sprites:je,lights:Ke,attract:re,twoG:J,charge:[T[0].charge,T[1].charge],fade:[T[0].fade,T[1].fade],beads:[T[0].beads,T[1].beads]}}}),Et.debugBolts=()=>{const e=[];for(const t of N)if(t.on){const n=he(t.a,D),r=D[0],o=D[1],a=he(t.b,L);e.push({i:t.i,st:t.stype,kind:t.kind,np:t.np,nl:t.nl,A:n?[+(r/b).toFixed(3),+o.toFixed(3)]:null,B:a?[+(L[0]/b).toFixed(3),+L[1].toFixed(3)]:null,e:+t.energy.toFixed(2),strike:t.strike})}return e},Et.debugSet=e=>{Object.assign(V,e)},Et.debugProf=()=>Po.map(e=>{const t=[...e].sort((n,r)=>n-r);return t.length?+t[t.length>>1].toFixed(3):null}),Et.debugTargets=()=>({handT:ne,lightT:De,gf:we,gfb:_e,am:q,energyT:me,CAP:Ae,handOn:ut}),Et.debugLights=()=>{const e=[];for(let t=0;t<Math.min(16,Ke);t++)e.push({a:[Ye[t*4],Ye[t*4+1],Ye[t*4+2]].map(n=>+n.toFixed(3)),b:[st[t*4],st[t*4+1],st[t*4+2]].map(n=>+n.toFixed(3)),soft:+Ye[t*4+3].toFixed(3),c:+Ot[t*4+2].toFixed(4)});return e}),Et}export{Jr as createEffect};
