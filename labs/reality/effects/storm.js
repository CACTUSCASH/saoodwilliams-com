/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-716f4e0ec7c7 */(()=>{const V=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(V)||V.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as Ce,COMMON as n0}from"../engine/glsl.js?v=0aafddc6f3";const ge=Math.PI*2,Ue=(V,C,c)=>V<C?C:V>c?c:V,ye=V=>V<0?0:V>1?1:V,Ve=(V,C,c,$)=>V+(C-V)*(1-Math.exp(-c*$)),er=typeof location<"u"&&/[?&]fxdebug\b/.test(location.search||""),ot=10,tr=14e4,L0=8,nr=72,Fe=720,o0=40,Pt=20,Yn=Pt*2,Xn=8,ln=Yn+Xn,Ct=ln+64,Ye=1800,mt=16,vt=2400,Ae=64,Zn=24,Qn=.14,jn=.45,or=.3,Xr=.75,rr=.1,ar=1.5,$n=0,cn=4,un=5,P0=7,C0=8,_0=9,r0=11,Jn=16,sr=200,eo=201,fn=202,ir=203,to=204,we=0,lr=1,a0=2,s0=3,cr=4,D0=5,Se=0,i0=1,ur=[0,1,1,2,2,3,3,4,0,5,5,6,6,7,7,8,9,10,10,11,11,12,13,14,14,15,15,16,0,17,17,18,18,19,19,20,5,9,9,13,13,17,0,9,0,13,1,5],fr=[.19,.15,.13,.115,.17,.11,.1,.09,.11,.1,.09,.105,.095,.085,.17,.09,.08,.075,.16,.16,.15,.21,.21,.19],Zr=[.4,.7,.7,.7,.25,.7,.7,.7,.7,.7,.7,.7,.7,.7,.25,.7,.7,.7,.25,.25,.25,.25,.25,.3],Qr=`
float skinLike(vec3 c,vec3 s){
  float lc=c.r+c.g+c.b, ls=s.r+s.g+s.b;
  if(ls<1e-3) return 1.0;
  float r=lc/ls;
  return (1.0-smoothstep(0.07,0.15,length(c/max(lc,1e-4)-s/ls)))*smoothstep(0.1,0.25,r)*(1.0-smoothstep(2.5,4.0,r));
}`,jr=Qr+`
float handAlpha(sampler2D fgT,sampler2D bgT,vec2 st,vec3 c,float k,float sk,out vec3 B){
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
  al=max(al,0.9*smoothstep(0.5,0.95,k)*sk);
  // hand and room of the same colour cannot be told apart: then only a faint capsule prior remains
  float rel=smoothstep(0.05,0.14,sqrt(dd));
  B=mix(c,Bl,hasB);
  // Where no room colour is known close by (deep in a wide capsule) the capsule is trusted only on pixels
  // the colour of this hand's skin: landmarks that lag a moving hand put fingers on the bare wall, and
  // trusted blindly they lit ghostly fingers in mid air.
  return near*hasF*mix(cov*sk,mix(0.12*cov,al,rel),hasB);
}`,$r=`#version 300 es
precision highp float;
layout(location=0)in vec2 aPos;
layout(location=1)in vec4 aA;
layout(location=2)in vec4 aC;
uniform vec2 uRes;
out float vAcross;out float vHalfW;out float vCore;out float vEnergy;out vec3 vCol;out float vBehind;
void main(){
vAcross=aA.x;vHalfW=aA.y;vCore=aA.z;vEnergy=aA.w;vCol=aC.rgb;vBehind=aC.a;
gl_Position=vec4(aPos/uRes*2.0-1.0,0.0,1.0);
}`,Jr=Ce+n0+`
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
}`,ea=`#version 300 es
precision highp float;
layout(location=0)in vec4 iA;
layout(location=1)in vec4 iB;
uniform vec2 uRes;
out vec2 vQ;out vec4 vB;out float vExt;
void main(){
vec2 corner=vec2(float(gl_VertexID&1),float((gl_VertexID>>1)&1))*2.0-1.0;
vQ=corner*iA.w;vB=iB;vExt=iA.w;
gl_Position=vec4((iA.xy+corner*iA.z*iA.w)/uRes*2.0-1.0,0.0,1.0);
}`,ta=Ce+n0+`
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
float a=fract(seed)*6.2831853;
float fw=mix(1.0,smoothstep(-0.65,0.85,dot(cs,vec2(cos(a),sin(a)))),smoothstep(0.0,0.35,r));
float core=exp(-r*r*26.0);
float glow=exp(-r*2.8)*(0.25+0.75*fw);
float halo=exp(-r*r*0.9)*fw;
float n1=0.75+0.5*snoise(vec3(cs*1.1+seed,uTime*12.0+seed));
float br=0.6+0.8*pow(max(snoise(vec3(cs*3.2+seed*3.0,uTime*9.0)),0.0),1.5);
col=vec3(1.0,0.98,1.0)*core*2.6+vec3(0.45,0.5,1.0)*glow*n1*mix(1.0,br,fw)+vec3(0.4,0.4,1.0)*halo*0.08;
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
}`,na=`#version 300 es
precision highp float;
uniform vec2 uRes;uniform vec4 uBall;
out vec2 vQ;
void main(){
vec2 corner=vec2(float(gl_VertexID&1),float((gl_VertexID>>1)&1))*2.0-1.0;
vQ=corner*uBall.w;
gl_Position=vec4((uBall.xy+corner*uBall.z*uBall.w)/uRes*2.0-1.0,0.0,1.0);
}`,oa=Ce+n0+`
in vec2 vQ;out vec4 outColor;
uniform vec4 uBall;uniform vec4 uBallB;
uniform sampler2D uHand;uniform sampler2D uAlpha;uniform vec2 uTarget;uniform float uHtoPx;
uniform float uTime;uniform float uGain;
void main(){
float r=length(vQ),ext=uBall.w,seed=uBallB.y;
vec2 cq=vQ-0.07*vec2(sin(uTime*7.3+seed),cos(uTime*6.1+seed*1.3));
float cr2=dot(cq,cq);
vec3 col=vec3(1.0,0.97,1.0)*(exp(-cr2*40.0)*5.0+exp(-cr2*9.0)*0.6);
if(r<1.3){
float h=sqrt(1.69-r*r);
float a=uTime*0.85+seed,ca=cos(a),sa=sin(a);
float fil=0.0,body=0.0;
for(int i=0;i<3;i++){
vec3 p=vec3(vQ,h*(float(i)-1.0)*0.62);
float env=exp(-dot(p,p)*1.6);
p.xz=mat2(ca,-sa,sa,ca)*p.xz;
fil+=pow(saturate(1.0-abs(snoise(p*1.5+vec3(seed+float(i)*3.1,0.0,uTime*1.1)))),16.0)*env;
body+=env;
}
float k=2.0*h/3.0;
col+=vec3(0.58,0.54,1.0)*body*k*0.16+vec3(0.88,0.8,1.0)*fil*k*4.4;
}
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
}`,ra=`#version 300 es
precision highp float;
layout(location=0)in vec4 iA;
layout(location=1)in vec4 iB;
layout(location=2)in vec4 iC;
uniform vec2 uRes;
out vec2 vP;out vec4 vA;out vec4 vB;out float vW;out float vTip;
void main(){
vec2 a=iA.xy,b=iA.zw;float r=iB.x*1.35+1.5;
vec2 d=b-a;float l=length(d);vec2 u=l>1e-3?d/l:vec2(1.0,0.0);vec2 n=vec2(-u.y,u.x);
vec2 corner=vec2(float(gl_VertexID&1),float((gl_VertexID>>1)&1));
vec2 p=mix(a-u*r,b+u*r,corner.x)+n*r*(corner.y*2.0-1.0);
vP=p;vA=iA;vB=iB;vW=iC.x;vTip=iC.y;
gl_Position=vec4(p/uRes*2.0-1.0,0.0,1.0);
}`,aa=Ce+`
in vec2 vP;in vec4 vA;in vec4 vB;in float vW;in float vTip;
out vec4 outColor;
void main(){
vec2 pa=vP-vA.xy,ba=vA.zw-vA.xy;
float hr=dot(pa,ba)/max(dot(ba,ba),1e-4),h=clamp(hr,0.0,1.0);
vec2 w=pa-ba*h;
float d=length(w),Rp=max(vB.x,1e-3),R=Rp*1.35;
float q=max(1.0-d*d/(R*R),0.0),k=q*q*vW;
vec2 wn=vTip>0.5&&hr>1.0?w:pa-ba*hr;
float dn=length(wn);
float t=sin(min(dn/R,1.0)*1.5707963)*vB.w;
vec2 nxy=dn>1e-4?wn*(t/dn):vec2(0.0);
outColor=vec4(k,nxy*k,(vB.y+vB.z*vB.w*q)*k);
}`,sa=Ce+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uPrev;uniform sampler2D uEnergy;uniform vec2 uTexel;uniform float uK;uniform float uG;
void main(){
vec2 o=uTexel*0.5;
vec3 p=(texture(uPrev,vUv+o).rgb+texture(uPrev,vUv-o).rgb+texture(uPrev,vUv+vec2(o.x,-o.y)).rgb+texture(uPrev,vUv+vec2(-o.x,o.y)).rgb)*0.25;
vec3 e=texture(uEnergy,vUv).rgb;
outColor=vec4(p*uK+e*((1.0-uK)*uG),1.0);
}`,ia=Ce+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uHand;uniform vec2 uTexel;uniform float uCore;
void main(){
vec2 o=uTexel;
vec3 c=texture(uBase,vUv+vec2(-o.x,-o.y)).rgb+texture(uBase,vUv+vec2(o.x,-o.y)).rgb
+texture(uBase,vUv+vec2(-o.x,o.y)).rgb+texture(uBase,vUv+vec2(o.x,o.y)).rgb;
float k=texture(uHand,vUv).r;
float w=uCore>0.5?smoothstep(0.35,0.9,k):1.0-smoothstep(0.01,0.12,k);
outColor=vec4(c*0.25*w,w);
}`,la=Ce+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;
void main(){
outColor=(texture(uSrc,vUv+uDir*3.0)+texture(uSrc,vUv+uDir)+texture(uSrc,vUv-uDir)+texture(uSrc,vUv-uDir*3.0))*0.25;
}`,ca=Ce+n0+jr+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uPlate;uniform sampler2D uPlateL;
uniform sampler2D uHand;uniform sampler2D uGF;uniform sampler2D uGFB;
uniform vec2 uTexel;uniform float uHasHand;uniform float uAspect;
uniform vec4 uHandZone[2];
void main(){
vec2 o=uTexel;
vec3 c=(texture(uBase,vUv+vec2(-o.x,-o.y)).rgb+texture(uBase,vUv+vec2(o.x,-o.y)).rgb
+texture(uBase,vUv+vec2(-o.x,o.y)).rgb+texture(uBase,vUv+vec2(o.x,o.y)).rgb)*0.25;
float m=texture(uMask,vUv).r;
float a=0.0,ah=0.0,wB=0.0;
float nearHand=uHasHand>0.5?smoothstep(0.04,0.16,texture(uGF,vUv).a):0.0;
float hz=0.0,sk=1.0;
for(int i=0;i<2;i++){
vec4 Z=uHandZone[i];
if(Z.w<=0.0)continue;
float z=1.0-smoothstep(0.75,1.0,length((vUv-Z.xy)*vec2(uAspect,1.0))/Z.z);
if(z<=hz)continue;
vec2 q=vec2(Z.z*0.05/uAspect,Z.z*0.05);
vec3 ps=texture(uBase,Z.xy).rgb+texture(uBase,Z.xy+q).rgb+texture(uBase,Z.xy-q).rgb
+texture(uBase,Z.xy+vec2(q.x,-q.y)).rgb+texture(uBase,Z.xy+vec2(-q.x,q.y)).rgb;
hz=z;sk=skinLike(c,ps*0.2);
}
if(m>0.1){
vec3 gc=sqrt(max(c,0.0)),gB=sqrt(max(texture(uPlate,vUv).rgb,0.0));
float like=1.0-smoothstep(0.035,0.11,length(gc-gB));
float plateSkin=smoothstep(0.06,0.13,(gB.r-gB.b)/max(gB.r+gB.g+gB.b,0.05));
float fringe=1.0-smoothstep(0.6,0.9,m);
float pl=smoothstep(0.3,0.8,texture(uPlateL,vUv).a);
float gap=nearHand*pl*(1.0-plateSkin);
float ghost=hz*(1.0-sk)*pl;
a=smoothstep(0.1,0.9,m)*(1.0-like*max(max(fringe,gap),ghost));
}
vec3 B=texture(uPlate,vUv).rgb;
if(uHasHand>0.5){
float hk=texture(uHand,vUv).r;
if(hk>0.0){
vec3 Bh;ah=handAlpha(uGF,uGFB,vUv,c,hk,sk,Bh);
wB=smoothstep(0.0,0.05,hk)*saturate((ah-a)*4.0+0.5);
B=mix(B,Bh,wB);
a=max(a,ah);
}
}
float share=a>0.002?saturate(luma(clamp(c-(1.0-a)*B,vec3(0.0),c))/max(luma(c),1e-4)):0.0;
outColor=vec4(a,share,ah,1.0);
}`,ua=Ce+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;
void main(){
outColor=texture(uSrc,vUv)*0.2734375
+(texture(uSrc,vUv+uDir*1.3333333)+texture(uSrc,vUv-uDir*1.3333333))*0.328125
+(texture(uSrc,vUv+uDir*3.1111111)+texture(uSrc,vUv-uDir*3.1111111))*0.03515625;
}`,fa=Ce+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uMask;uniform vec2 uCell;
void main(){
float m=texture(uMask,vUv+uCell*vec2(-0.25,-0.25)).r+texture(uMask,vUv+uCell*vec2(0.25,-0.25)).r
+texture(uMask,vUv+uCell*vec2(-0.25,0.25)).r+texture(uMask,vUv+uCell*vec2(0.25,0.25)).r;
outColor=vec4(m*0.25,0.0,0.0,1.0);
}`,ha=Ce+n0+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uNormals;uniform sampler2D uHand;
uniform float uAspect;uniform float uWallZ;uniform float uWallGain;
uniform float uOutScale;uniform float uHasHand;uniform int uView;uniform int uShadows;
uniform vec4 uLA[${mt}];uniform vec4 uLB[${mt}];uniform vec4 uLC[${mt}];uniform int uNL;
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
for(int i=0;i<${mt};i++){
if(i>=uNL)break;
vec4 a=uLA[i],b=uLB[i],c=uLC[i];
vec3 V;float e=lineIrr(Pp,a.xyz,b.xyz,a.w,V);
vec3 L=V*inversesqrt(max(dot(V,V),1e-8));
per+=c.rgb*(max(dot(N,L)+0.18,0.0)/1.18)*e;
if(c.a<=1e-4)continue;
float wz=uWallZ*b.w;
vec3 Vw;float ew=lineIrr(vec3(p,-wz),a.xyz,b.xyz,a.w,Vw);
wall+=c.a*max(Vw.z*inversesqrt(max(dot(Vw,Vw),1e-8)),0.0)*ew*(i<uShadows?wallShadow(p,Vw,wz,uHasHand>0.5&&i<3):1.0);
}
outColor=vec4(per,wall*uWallGain)*uOutScale;
if(uView==3)outColor=vec4(N*0.5+0.5,0.0)*2.0;
else if(uView==4)outColor=vec4(vec3(z*10.0),0.0);
}`,da=Ce+n0+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uAlpha;uniform sampler2D uNormals;uniform sampler2D uAfter;
uniform sampler2D uLight;uniform sampler2D uHand;uniform sampler2D uEnergy;
uniform vec2 uAfterTexel;uniform float uAspect;uniform float uTime;
uniform float uAmbient;uniform vec3 uRoom;uniform vec3 uWallTint;
uniform float uHaze;uniform float uAfterGain;uniform float uLightIn;uniform float uEnergyIn;uniform float uHasHand;
uniform float uWallRoom;
uniform vec4 uLens[2];
uniform int uView;
void main(){
vec2 uv=vUv;
vec3 a0=texture(uAfter,uv).rgb*uEnergyIn;
vec2 off=vec2(0.0);
if(uHaze>0.0){
float lx=luma(texture(uAfter,uv+vec2(uAfterTexel.x*1.5,0.0)).rgb)-luma(texture(uAfter,uv-vec2(uAfterTexel.x*1.5,0.0)).rgb);
float ly=luma(texture(uAfter,uv+vec2(0.0,uAfterTexel.y*1.5)).rgb)-luma(texture(uAfter,uv-vec2(0.0,uAfterTexel.y*1.5)).rgb);
vec2 g=vec2(lx,ly)*uEnergyIn*uHaze;
if(dot(g,g)>1e-12){
float t=0.7+0.45*snoise(vec3(uv*vec2(uAspect,1.0)*13.0,uTime*5.0));
off=clamp(g*t,-uAfterTexel*0.7,uAfterTexel*0.7);
}
}
for(int i=0;i<2;i++){
vec4 B=uLens[i];
if(B.w<=0.0)continue;
vec2 d=(uv-B.xy)*vec2(uAspect,1.0);
float r=length(d)/B.z;
if(r>1.9)continue;
vec3 q=vec3(d/B.z*1.7,uTime*1.9+float(i)*7.1);
vec2 n=vec2(snoise(q),snoise(q+vec3(19.1,7.3,3.7)));
float fall=(1.0-smoothstep(1.0,1.9,r))*smoothstep(0.0,0.8,r);
off+=(n*0.7+d/max(length(d),1e-5)*0.45)*B.w*B.z*0.03*fall/vec2(uAspect,1.0);
}
vec3 base=texture(uBase,uv+off).rgb;
vec4 am=texture(uAlpha,uv);
vec4 Lt=texture(uLight,uv)*uLightIn;
vec3 Lp=Lt.rgb*inversesqrt(1.0+Lt.rgb*Lt.rgb*(1.0/5.8));
float Lw=Lt.a*inversesqrt(1.0+Lt.a*Lt.a*(1.0/0.64));
vec3 Lw3=uWallTint*Lw;
float sh=smoothstep(0.3,0.9,am.g);
vec3 dbgH=vec3(am.rgb);
vec3 fl=base*sh;
vec3 irr=mix(Lw3,Lp,sh);
float mm=sh;
vec3 amb=base*uAmbient;
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
else if(uView==11)outColor=vec4(dbgH,1.0);
else if(uView==2){vec4 hv=texture(uHand,uv);outColor=vec4(hv.gb/max(hv.r,1e-3)*0.5+0.5,min(hv.r,1.0),1.0);}
}`;function va(V){const C=V.kit,c=V.gl,$={strip:C.program(Jr,{vs:$r,label:"storm strip"}),sprite:C.program(ta,{vs:ea,label:"storm sprite"}),ball:C.program(oa,{vs:na,label:"storm ball"}),hand:C.program(aa,{vs:ra,label:"storm hand"}),decay:C.program(sa,{label:"storm decay"}),maskDown:C.program(fa,{label:"storm mask down"}),hmPrep:C.program(ia,{label:"storm hand colours"}),hmBox:C.program(la,{label:"storm hand colours box"}),alpha:C.program(ca,{label:"storm alpha"}),blur9:C.program(ua,{label:"storm alpha blur"}),light:C.program(ha,{label:"storm light"}),comp:C.program(da,{label:"storm composite"})},me=new Float32Array(tr*ot),z0=c.createVertexArray(),hn=c.createBuffer();c.bindVertexArray(z0),c.bindBuffer(c.ARRAY_BUFFER,hn),c.bufferData(c.ARRAY_BUFFER,me.byteLength,c.DYNAMIC_DRAW),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,2,c.FLOAT,!1,ot*4,0),c.enableVertexAttribArray(1),c.vertexAttribPointer(1,4,c.FLOAT,!1,ot*4,8),c.enableVertexAttribArray(2),c.vertexAttribPointer(2,4,c.FLOAT,!1,ot*4,24);const Ne=new Float32Array(nr*L0),dn=c.createVertexArray(),pn=c.createBuffer();c.bindVertexArray(dn),c.bindBuffer(c.ARRAY_BUFFER,pn),c.bufferData(c.ARRAY_BUFFER,Ne.byteLength,c.DYNAMIC_DRAW),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,4,c.FLOAT,!1,L0*4,0),c.vertexAttribDivisor(0,1),c.enableVertexAttribArray(1),c.vertexAttribPointer(1,4,c.FLOAT,!1,L0*4,16),c.vertexAttribDivisor(1,1);const Oe=12,fe=new Float32Array(Zn*2*Oe),mn=c.createVertexArray(),vn=c.createBuffer();c.bindVertexArray(mn),c.bindBuffer(c.ARRAY_BUFFER,vn),c.bufferData(c.ARRAY_BUFFER,fe.byteLength,c.DYNAMIC_DRAW),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,4,c.FLOAT,!1,Oe*4,0),c.vertexAttribDivisor(0,1),c.enableVertexAttribArray(1),c.vertexAttribPointer(1,4,c.FLOAT,!1,Oe*4,16),c.vertexAttribDivisor(1,1),c.enableVertexAttribArray(2),c.vertexAttribPointer(2,4,c.FLOAT,!1,Oe*4,32),c.vertexAttribDivisor(2,1);const no=c.createVertexArray();c.bindVertexArray(null),c.bindBuffer(c.ARRAY_BUFFER,null);let ae=null,Ie=null,se=null,Me=null,xt=null,Te=null,qe=null,Q=null,rt=null,_e=null,xn=0,l0=!0;const H0=V.caps.hdr==="rgba8";let H=0,G=0,ke=null,gn=null,U0=null,V0=null,N0=1,te=!1,oo=0,yn=128;const he=new Float32Array(vt),de=new Float32Array(vt),De=new Float32Array(vt),ze=new Float32Array(vt),ro=new Int16Array(vt),ao=new Int16Array(vt),c0=new Uint8Array(vt);let ne=0,u0=-1640531527,gt=1;function A(){u0=u0+1831565813|0;let e=Math.imul(u0^u0>>>15,1|u0);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}function An(){gt=gt+1831565813|0;let e=Math.imul(gt^gt>>>15,1|gt);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}const M=(e,t)=>e+(t-e)*A();function so(){return{t:we,h:0,k:0,x:0,y:0,ang:0,r:1,ox:0,oy:0}}function hr(e){return{i:e,on:!1,kind:Se,a:so(),b:so(),pts:new Float32Array(Fe*3),np:0,nMain:0,plen:.1,lines:new Int16Array(o0*2),lineE:new Float32Array(o0),lineW:new Float32Array(o0),nl:0,energy:1,flick:1,core:1,width:1,cr:.45,cg:.55,cb:1,behind:0,lightK:1,scale:1,born:0,kick:-9,until:0,nextOn:0,nextShape:0,rate:25,seed:1,strike:0,sx:0,sy:0,snx:0,sny:0,sEdge:-1,transient:!1,life:0,strokes:new Float32Array(8),ns:0,power:1,stype:0,sid:0,sk:0,pairA:0,pairB:0,levels:5,branches:1,rough:.26,bow:0,ox:0,oy:0,dirx:0,diry:0}}const O=Array.from({length:Ct},(e,t)=>hr(t)),f0=new Float32Array(Ye),h0=new Float32Array(Ye),at=new Float32Array(Ye),Xe=new Float32Array(Ye),Ze=new Float32Array(Ye),d0=new Float32Array(Ye),p0=new Float32Array(Ye),m0=new Uint8Array(Ye);let st=0;function io(){return{present:!1,fade:0,beads:0,charge:0,ballR:0,ballE:0,fistT:-9,tightT:-9,peakC:0,point:0,pointHold:-9,pinch:0,chimed:!1,size:.12,z:.16,flick:new Float32Array(5),bx:0,by:0,age:0,body:0}}const S=[io(),io()],N=[null,null];let z=0,T=16/9,J=!!V.mobile,lo=0,wn=-9,ie=!1,Mn=!1,it=!1,v0=!1,kn=!1,O0=!1,yt=0,At=0,wt=0,I0=-9,Bn=0,bn=0,Be=0,_t=0,x0=0,g0=-1,co=0,oe=0,Qe=0,En=0,Mt=0,q0=0,uo=0,G0=0,fo=0,ho=-9,y0=0,po=0,A0=0,mo=0,Fn=!1,vo=0;const Dt=[!1,!1],xo=[0,0],go=[0,0],yo=[0,0],Ao=[0,0];function dr(e){let t=-1,n=.2*.2;const r=e.points[24]*T,o=e.points[25];for(let a=0;a<2;a++){if(!Dt[a])continue;const i=(yo[a]-r)**2+(Ao[a]-o)**2;i<n&&(n=i,t=a)}return t}const D=new Float64Array(2),P=new Float64Array(2),zt=[],U={mode:"",forceBall:-1,forceCharge:1,noHand:!1},W=new Float32Array(Fe+4),K=new Float32Array(Fe+4),kt=new Float32Array(Fe+4),je=new Float32Array(Fe+4).fill(1),wo=new Float32Array(Fe+4),Mo=new Float32Array(Fe+4),Sn=new Float32Array(Fe+4),ko=new Float32Array(Fe),Bo=new Float32Array(Fe),Ge=new Float32Array(96),We=new Float32Array(96),W0=new Float32Array(96),K0=new Float32Array(96),lt=new Float32Array(96),Ht=new Float32Array(Ae),Ut=new Float32Array(Ae),Vt=new Float32Array(Ae),Nt=new Float32Array(Ae),Ot=new Float32Array(Ae),It=new Float32Array(Ae),qt=new Float32Array(Ae),Bt=new Float32Array(Ae),bt=new Float32Array(Ae),Et=new Float32Array(Ae),Re=new Float32Array(Ae),Gt=new Float32Array(Ae),Wt=new Float32Array(Ae);let Ft=1,Tn=1,$e=0;const Je=new Float32Array(mt*4),ct=new Float32Array(mt*4),Kt=new Float32Array(mt*4);let ce=2,Y=2,Ke=2,St=1,Rn=1,ve=1,bo=6,Ln=!1;const w0=(e,t=1)=>Math.max(t,Math.round(e*(.5+.5*ve)));function ee(e,t=4){const n=Math.max(1,e*Y);return Ue(Math.ceil(Math.log2(n/bo)),t,J?7:8)}function Yt(e,t,n,r,o,a,i,s,d,h,p){const x=1<<n;let w=t*3;e[w]=r,e[w+1]=o,e[w+2]=d,w=(t+x)*3,e[w]=a,e[w+1]=i,e[w+2]=h;let y=0;for(let m=x>>1;m>=1;m>>=1,y++){const l=y<p,u=s*(y===0?.8:y===1?1.1:y<4?.85:.55);for(let v=m;v<x;v+=m<<1){const g=(t+v-m)*3,R=(t+v+m)*3,f=(t+v)*3,k=e[g],B=e[g+1],E=e[R],F=e[R+1],b=E-k,L=F-B,_=Math.sqrt(b*b+L*L)||1e-6,I=l?An()+An()-1:A()+A()-1,j=l?An()*2-1:A()*2-1,Z=I*u*_*1.25,q=j*.1*_;e[f]=(k+E)*.5-L/_*Z+b/_*q,e[f+1]=(B+F)*.5+b/_*Z+L/_*q,e[f+2]=d+(h-d)*(v/x)}}return x+1}function Xt(e,t,n,r,o){return e.nl>=o0||n<2?!1:(e.lines[e.nl*2]=t,e.lines[e.nl*2+1]=n,e.lineE[e.nl]=r,e.lineW[e.nl]=o,e.nl++,!0)}function Y0(e,t,n,r,o,a,i,s,d,h){for(let p=0;p<r;p++){if(e.nl>=o0)return;const x=1<<o;if(e.np+x+1>Fe)return;const w=t+1+Math.floor(M(.08,.82)*(n-3)),y=w*3,m=e.pts[y],l=e.pts[y+1],u=e.pts[y+2];let v=e.pts[y+3]-e.pts[y-3],g=e.pts[y+4]-e.pts[y-2];const R=Math.hypot(v,g)||1;v/=R,g/=R;const f=(A()<.5?-1:1)*M(.28,.95),k=Math.cos(f),B=Math.sin(f),E=v*k-g*B,F=v*B+g*k,b=1-(w-t)/(n-1),L=d*M(.1,.34)*(.45+b),_=e.np,I=Yt(e.pts,_,o,m,l,m+E*L,l+F*L,h*1.15,u*.85,0,0);e.np+=I,Xt(e,_,I,a*M(.7,1.1),i),s>0&&o>3&&A()<.55&&Y0(e,_,I,1,o-1,a*.6,i*.7,s-1,L,h)}}function be(e,t,n,r,o,a){e.kind=Se,e.np=0,e.nl=0,gt=e.seed;const i=Yt(e.pts,0,t,0,0,1,0,n,1,1,a);if(r)for(let s=1;s<i-1;s++){const d=s/(i-1);e.pts[s*3+1]+=r*4*d*(1-d)}e.np=i,e.nMain=i,Xt(e,0,i,1,1),o>0&&Y0(e,0,i,o,Math.max(3,t-2),.5,.62,1,1,n)}function M0(e,t,n,r){e.kind=Se,e.np=0,e.nl=0,gt=e.seed;const o=Yt(e.pts,0,t,0,0,1,0,n,1,.05,0);e.np=o,e.nMain=o,Xt(e,0,o,1,1),r>0&&Y0(e,0,o,r,Math.max(3,t-2),.5,.6,0,1,n)}function xe(e,t){if(e.t===we)return t[0]=e.x,t[1]=e.y,!0;const n=N[e.h];if(!n)return!1;if(e.t===lr)return t[0]=n.points[e.k*3]*T,t[1]=n.points[e.k*3+1],!0;if(e.t===cr)return t[0]=n.points[e.k*3]*T+e.x,t[1]=n.points[e.k*3+1]+e.y,!0;if(e.t===D0)return t[0]=n.pinchPoint[0]*T+e.ox,t[1]=n.pinchPoint[1]+e.oy,!0;const r=S[e.h];if(e.t===a0)return t[0]=r.bx,t[1]=r.by,!0;const o=r.ballR*e.r;return t[0]=r.bx+Math.cos(e.ang)*o,t[1]=r.by+Math.sin(e.ang)*o,!0}function He(e,t,n){e.t=lr,e.h=t,e.k=n,e.ox=0,e.oy=0}function et(e,t,n){e.t=we,e.x=t,e.y=n,e.ox=0,e.oy=0}function k0(e){return!xe(e.a,D)||!xe(e.b,P)?.05:Math.hypot(P[0]-D[0],P[1]-D[1])}function pr(e,t){if(!te)return 0;const n=Math.floor(e/T*H),r=Math.floor(t*G);return n<0||r<0||n>=H||r>=G?0:ke[r*H+n]}const B0=(e,t)=>pr(e,t)>=yn;function mr(e,t){let n=Math.floor(e),r=Math.floor(t);const o=e-n,a=t-r,i=Ue(n+1,0,H-1),s=Ue(r+1,0,G-1);n=Ue(n,0,H-1),r=Ue(r,0,G-1);const d=ke[r*H+n],h=ke[r*H+i],p=ke[s*H+n],x=ke[s*H+i];return(d+(h-d)*o)*(1-a)+(p+(x-p)*o)*a}function vr(){for(let r=0,o=H*G;r<o;r++)ke[r]=gn[r*4];ne=0;const e=yn,t=T/H,n=1/G;for(let r=0;r<G;r++)for(let o=0;o<H;o++){const a=r*H+o;if(U0[a]=-1,ke[a]<e)continue;const i=o>0?ke[a-1]:255,s=o<H-1?ke[a+1]:255,d=r>0?ke[a-H]:255,h=r<G-1?ke[a+H]:255;if(i>=e&&s>=e&&d>=e&&h>=e||ne>=vt)continue;const p=(s-i)/t,x=(h-d)/n,w=Math.hypot(p,x)||1,y=-p/w,m=-x/w,l=(o+.5)*t,u=(r+.5)*n;let v=ke[a],g=0,R=0;for(let f=1;f<=3;f++){const k=f*.5*n,B=mr((l+y*k)/t-.5,(u+m*k)/n-.5);if(B<e){R=g+(k-g)*(v-e)/Math.max(.001,v-B);break}v=B,g=k,R=k}De[ne]=y,ze[ne]=m,he[ne]=l+y*R,de[ne]=u+m*R,ro[ne]=o,ao[ne]=r,U0[a]=ne++}te=!0}const Eo=[3,4,6,7,8,10,11,12,14,15,16,18,19,20,1,2];function xr(e,t,n){return Fo(e,t,n)?!0:e.speed>.25?Fo(e,t+e.velocity[0]*T*.09,n+e.velocity[1]*.09):!1}function Fo(e,t,n){const r=e.size,o=e.points;let a=t-e.palm[0]*T,i=n-e.palm[1];if(a*a+i*i<r*r*1.3)return!0;const s=r*r*.2;for(let u=0;u<Eo.length;u++){const v=Eo[u];if(a=t-o[v*3]*T,i=n-o[v*3+1],a*a+i*i<s)return!0}const d=o[0]*T,h=o[1];let p=o[27]*T-d,x=o[28]-h;const w=Math.hypot(p,x)||1;p/=w,x/=w;const y=t-d,m=n-h,l=-(y*p+m*x);return l>-r*.2&&l<r*4&&Math.abs(y*x-m*p)<r*.85}function X0(e,t){for(let n=0;n<2;n++){const r=N[n];if(r&&xr(r,e,t))return!0}return!1}function gr(){for(let e=0;e<ne;e++)c0[e]=X0(he[e],de[e])?1:0}function ut(e,t,n){let r=-1,o=n*n;for(let a=0;a<ne;a++){if(c0[a])continue;const i=he[a]-e,s=de[a]-t,d=i*i+s*s;d<o&&(o=d,r=a)}return r}function yr(e,t,n,r,o,a,i,s=.03){let d=-1,h=1/0;for(let p=0;p<ne;p++){if(c0[p])continue;const x=he[p]-e,w=de[p]-t,y=Math.hypot(x,w);if(y<s||y>a)continue;const m=(x*n+w*r)/y;if(m<o)continue;let l=y*(1+3.2*(1-m));if(i>=0&&i<ne){const u=he[i]-he[p],v=de[i]-de[p];u*u+v*v<9e-4&&(l*=.8)}l<h&&(h=l,d=p)}return d}function So(e,t,n,r,o,a=0){if(!te)return!1;const i=e,s=t,d=.6/G;let h=!1,p=e>=0&&t>=0&&e<=T&&t<=1;for(let x=0;x<900;x++){if(e+=n*d,t+=r*d,!(e>=0&&t>=0&&e<=T&&t<=1)){if(p)return!1;continue}if(p=!0,!(B0(e,t)&&!X0(e,t)))h=!0;else if(h)return(e-i)*(e-i)+(t-s)*(t-s)<a*a?!1:(o[0]=e,o[1]=t,!0)}return!1}function Ar(e,t,n){if(!te)return!1;let r=0;for(let o=0;o<8;o++){const a=o*(ge/8),i=e+Math.cos(a)*n*1.6,s=t+Math.sin(a)*n*1.6;B0(i,s)&&!X0(i,s)&&r++}return r>=5}function To(e,t,n,r){const o=n-e,a=r-t,i=Math.hypot(o,a),s=Math.floor((i-.02)/(.8/G));for(let d=1;d<s;d++){const h=d*.8/G/i,p=e+o*h,x=t+a*h;if(B0(p,x)&&!X0(p,x))return!1}return!0}function Pn(e,t,n,r,o){let a=1e9;n>1e-6?a=Math.min(a,(T-e)/n):n<-1e-6&&(a=Math.min(a,-e/n)),r>1e-6?a=Math.min(a,(1-t)/r):r<-1e-6&&(a=Math.min(a,-t/r)),(!(a<1e8)||a<0)&&(a=.5),a+=.04,o[0]=e+n*a,o[1]=t+r*a}let Cn=0;function Ro(e,t){const n=.004+.013*(.5+.5*Math.sin(e*.47+Cn)*Math.cos(e*.19-Cn*1.7));return Ge[e]=he[t]-De[t]*n,We[e]=de[t]-ze[t]*n,W0[e]=De[t],K0[e]=ze[t],e+1}function Lo(e,t,n){N0++,Cn=A()*ge;let r=ro[e],o=ao[e],a=-ze[e]*t,i=De[e]*t,s=Ro(0,e);V0[o*H+r]=N0;for(let d=0;d<n&&s<90;d++){let h=-1,p=-2,x=0,w=0;for(let v=-1;v<=1;v++)for(let g=-1;g<=1;g++){if(!g&&!v)continue;const R=r+g,f=o+v;if(R<0||f<0||R>=H||f>=G)continue;const k=f*H+R,B=U0[k];if(B<0||V0[k]===N0)continue;const E=Math.hypot(g,v),F=(g*a+v*i)/E;F>p&&(p=F,h=B,x=R,w=f)}if(h<0||p<-.3)break;V0[w*H+x]=N0;const y=x-r,m=w-o,l=Math.hypot(y,m);a=a*.55+y/l*.45,i=i*.55+m/l*.45;const u=Math.hypot(a,i)||1;if(a/=u,i/=u,r=x,o=w,c0[h])break;s=Ro(s,h)}for(let d=0;d<2;d++)for(let h=1;h<s-1;h++)Ge[h]=(Ge[h-1]+Ge[h]*2+Ge[h+1])*.25,We[h]=(We[h-1]+We[h]*2+We[h+1])*.25;return s}function Po(e,t,n,r){if(e.kind=i0,e.np=0,e.nl=0,t<3)return!1;lt[0]=0;for(let h=1;h<t;h++)lt[h]=lt[h-1]+Math.hypot(Ge[h]-Ge[h-1],We[h]-We[h-1]);const o=lt[t-1];if(o<.02)return!1;e.plen=o;const a=Yt(e.pts,0,ee(o),0,0,1,0,.3,1,.15,0);let i=0;for(let h=0;h<a;h++){const p=h*3,x=e.pts[p]*o,w=e.pts[p+1]*o*n;for(;i<t-2&&lt[i+1]<x;)i++;const y=lt[i+1]-lt[i]||1e-6,m=Ue((x-lt[i])/y,0,1),l=Ge[i]+(Ge[i+1]-Ge[i])*m,u=We[i]+(We[i+1]-We[i])*m;let v=W0[i]+(W0[i+1]-W0[i])*m,g=K0[i]+(K0[i+1]-K0[i])*m;const R=Math.hypot(v,g)||1;v/=R,g/=R;const f=w*.4-Math.abs(w)*.6;e.pts[p]=l+v*f,e.pts[p+1]=u+g*f,ko[h]=v,Bo[h]=g}e.np=a,e.nMain=a;let s=0;for(let h=0;h<r&&s<a-5;h++){const p=r-h,x=Math.max(5,Math.round((a-1-s)/p*M(.75,1.1))),w=Math.min(a-1,s+x);for(let y=s;y<=w;y++){const m=(y-s)/Math.max(1,w-s),l=Math.min(1,h===0?1:m/.15)*Math.min(1,(1-m)/.3);e.pts[y*3+2]=(.12+.88*l)*(1-.4*(y/(a-1)))}Xt(e,s,w-s+1,1-.16*h,1-.1*h),s=w+Math.max(3,Math.round(a*M(.08,.18)))}const d=2+(A()*3|0);for(let h=0;h<d&&!(e.nl>=o0);h++){const p=2+Math.floor(A()*(a-5)),x=p*3,w=e.pts[x+2];if(w<.3)continue;let y=e.pts[x+3]-e.pts[x-3],m=e.pts[x+4]-e.pts[x-2];const l=Math.hypot(y,m)||1;y/=l,m/=l;const u=M(-.75,.75);let v=-ko[p]+y*u,g=-Bo[p]+m*u;const R=Math.hypot(v,g)||1;v/=R,g/=R;const f=M(.018,.05)+.12*o*A()*A(),k=Math.min(6,ee(f));if(e.np+(1<<k)+1>Fe)break;const B=e.np,E=Yt(e.pts,B,k,e.pts[x],e.pts[x+1],e.pts[x]+v*f,e.pts[x+1]+g*f,.32,w*.8,0,0);let F=E;if(te)for(let b=1;b<E;b++){const L=(B+b)*3;if(!B0(e.pts[L],e.pts[L+1])){F=b;break}}e.np+=E,F>=3&&Xt(e,B,F,.65,.6)}return!0}function Co(e,t,n,r,o,a){e.kind=i0,e.np=0,e.nl=0,e.plen=a;const i=ee(a),s=Yt(e.pts,0,i,t,n,t+r*a,n+o*a,.3,1,.12,0);let d=s;if(te)for(let h=2;h<s;h++){const p=h*3;if(!B0(e.pts[p],e.pts[p+1])){d=h;break}}return e.np=s,e.nMain=d,d<3?!1:(Xt(e,0,d,1,1),Y0(e,0,d,3+(A()*3|0),Math.max(3,i-2),.6,.65,1,a,.3),!0)}function Zt(e,t,n,r,o,a,i,s,d,h,p,x){o=Math.round(o*(J?.5:1)*(.35+.65*ve));const w=J?Ye>>1:Ye,y=Math.atan2(r,n);for(let m=0;m<o;m++){if(st>=w)return;const l=y+(A()+A()-1)*i,u=a*(.08+1.5*Math.pow(A(),1.6)),v=st++,g=A()*A()*p,R=(A()-.5)*.008;f0[v]=e+d*g-h*R,h0[v]=t+h*g+d*R,at[v]=Math.cos(l)*u,Xe[v]=Math.sin(l)*u,m0[v]=A()<s*.5?1:0,Ze[v]=-A()*x,d0[v]=m0[v]?M(.06,.16):M(.18,.5),p0[v]=M(.7,1)}}function wr(e){const t=Math.exp(-2.2*e);for(let n=0;n<st;n++){if(Ze[n]<0){Ze[n]+=e;continue}const r=at[n]*at[n]+Xe[n]*Xe[n];if(Ze[n]+=e*(r<.09?1+3*(1-r/.09):1),Ze[n]>=d0[n]){const o=--st;f0[n]=f0[o],h0[n]=h0[o],at[n]=at[o],Xe[n]=Xe[o],Ze[n]=Ze[o],d0[n]=d0[o],p0[n]=p0[o],m0[n]=m0[o],n--;continue}Xe[n]-=1.5*e,at[n]*=t,Xe[n]*=t,f0[n]+=at[n]*e,h0[n]+=Xe[n]*e}}function _o(e){const t=V.audio;!t||z-uo<.09||q0<1||(uo=z,q0--,t.zap({strength:e}))}function Z0(e){const t=V.audio;!t||z-fo<.05||G0<1||(fo=z,G0--,t.whoosh({strength:e,duration:.04+.03*A(),up:!1}))}function re(e){e.on=!1,e.strike=0,e.transient=!1}function Mr(e,t){for(let n=e;n<e+t;n++)re(O[n])}function _n(e,t){e.strike=1,e.sEdge=t,e.sx=he[t]-De[t]*.003,e.sy=de[t]-ze[t]*.003,e.snx=De[t],e.sny=ze[t]}function ft(e,t,n,r,o,a,i,s){if(!t){e.on&&re(e);return}if(e.on){if(s>=e.until){e.on=!1,e.nextOn=s+M(a,i);return}s>=e.nextShape&&(Qt(e),e.nextShape=s+1/e.rate*M(.7,1.3),A()<.22&&(e.kick=s))}else if(s>=e.nextOn)if(A()<n){if(e.on=!0,e.born=s,e.kick=s,e.until=s+M(r,o),e.seed=A()*4294967296|0,!Qt(e)){e.on=!1,e.nextOn=s+a;return}e.nextShape=s+1/e.rate,e.stype===un&&(s-ho>.8?_o(.2+.12*A()):Z0(.22+.12*A()),ho=s)}else e.nextOn=s+M(a,i)*.6}const kr=[4,8,12,16],Br=[8,12,16,20],tt=[4,8,12,16,20];function Qt(e){const t=e.sid,n=N[t],r=S[t];switch(e.stype){case $n:case cn:{if(!n)return!1;let o,a;if(e.stype===$n)o=kr[e.sk],a=Br[e.sk];else{const x=A()*3|0;o=tt[x],a=tt[x+2]}He(e.a,t,o),He(e.b,t,a),xe(e.a,D),xe(e.b,P);const i=(D[0]+P[0])/2-n.palm[0]*T,s=(D[1]+P[1])/2-n.palm[1],d=P[0]-D[0],h=P[1]-D[1],p=-h*i+d*s>=0?1:-1;return be(e,ee(Math.hypot(d,h)*1.2),.3,p*M(.12,.3),A()<.35?1:0,1),e.energy=M(.7,1.2),e.width=.75,e.core=.9,e.lightK=.35,e.cr=.5,e.cg=.5,e.cb=1,e.strike=0,!0}case un:{if(!n||!te)return!1;if(e.strike!==1||!e.on||z-e.born<.001){let o=-1,a=Qn,i=8;for(let s=0;s<5;s++){const d=tt[s],h=ut(n.points[d*3]*T,n.points[d*3+1],a);h>=0&&(a=Math.hypot(he[h]-n.points[d*3]*T,de[h]-n.points[d*3+1]),o=h,i=d)}if(o<0)return!1;He(e.a,t,i),_n(e,o),et(e.b,e.sx,e.sy)}return be(e,ee(k0(e)),.25,M(-.12,.12),2+(A()*2|0),2),e.energy=M(1,1.5),e.width=.95,e.core=1,e.lightK=1,e.cr=.48,e.cg=.52,e.cb=1,!0}case P0:return n?(He(e.a,t,4),He(e.b,t,8),be(e,ee(k0(e)),.34,M(-.15,.15),A()<.5?1:0,0),e.width=.8,e.core=.95,e.lightK=.7,e.strike=0,e.cr=.45,e.cg=.58,e.cb=1,!0):!1;case C0:{if(!n)return!1;const o=n.points,a=o[24]*T,i=o[25];let s=a-o[18]*T,d=i-o[19],h=Math.hypot(s,d);h<n.size*.18&&(s=a-o[15]*T,d=i-o[16],h=Math.hypot(s,d)),s/=h||1,d/=h||1,e.dirx=s,e.diry=d,He(e.a,t,8);const p=O[t*Pt+_0],x=O[t*Pt+_0+1];A()<.3&&(e.seed=A()*4294967296|0,e.kick=z);const w=ie?dr(n):-1;if(w>=0){const y=xo[w],m=go[w];et(e.b,y,m);const l=a-y,u=i-m,v=Math.hypot(l,u)||1;e.strike=1,e.sEdge=-1,e.sx=y,e.sy=m,e.snx=l/v,e.sny=u/v,be(e,ee(v),.22,M(-.05,.05),w0(J?3:5),2);const g=Math.atan2(-u,-l);for(let R=0;R<2;R++){const f=R?x:p,k=g+(R?1:-1)*M(.5,1.4);Co(f,y,m,Math.cos(k),Math.sin(k),M(.07,.15))?(f.on||(f.born=z,f.kick=z),f.on=!0,f.energy=M(1,1.5),f.width=.8,f.core=.9,f.lightK=.6,f.cr=.55,f.cg=.5,f.cb=1,f.strike=0,f.behind=0):re(f)}}else{let y=-1;const m=n.size*.55;if(te&&So(a,i,s,d,P,m)&&(y=ut(P[0],P[1],.06)),y<0&&te&&(y=yr(a,i,s,d,Math.cos(.36),1.4,e.sEdge,m)),y<0&&h<n.size*.25&&te&&(y=ut(a,i,.4)),y>=0?(_n(e,y),et(e.b,e.sx,e.sy)):(e.strike=0,e.sEdge=-1,Pn(a,i,s,d,P),et(e.b,P[0],P[1])),be(e,ee(k0(e)),.22,M(-.05,.05),w0(J?3:5),2),e.strike===1)for(let l=0;l<2;l++){const u=l?x:p,v=Lo(e.sEdge,l?-1:1,12+(A()*12|0));Po(u,v,.18,2+(A()*2|0))?(u.on||(u.born=z,u.kick=z),u.on=!0,u.energy=M(.8,1.2),u.width=.75,u.core=.8,u.lightK=.6,u.cr=.55,u.cg=.5,u.cb=1,u.strike=0,u.behind=0):re(u)}else re(p),re(x)}return e.width=1.35,e.core=1.45,e.lightK=1.6,e.cr=.42,e.cg=.52,e.cb=1,!0}case r0:{if(!n||r.ballR<=0)return!1;if(e.sk>=3)return e.a.t=a0,e.a.h=t,e.b.t=s0,e.b.h=t,e.b.ang=A()*ge,e.b.r=M(.95,1.12),be(e,ee(r.ballR),.3,M(-.18,.18),A()<.5?1:0,0),e.energy=M(.7,1.2)*(.45+.7*Math.min(1,r.charge)),e.width=.55,e.core=.6,e.lightK=.2,e.cr=.66,e.cg=.5,e.cb=1,e.strike=0,!0;const o=A()*ge,a=o+(A()<.5?-1:1)*M(.7,2);e.a.t=s0,e.a.h=t,e.a.ang=o,e.a.r=M(.85,1),e.b.t=s0,e.b.h=t,e.b.ang=a,e.b.r=M(.85,1),xe(e.a,D),xe(e.b,P);const i=(D[0]+P[0])/2-r.bx,s=(D[1]+P[1])/2-r.by,d=P[0]-D[0],h=P[1]-D[1],p=-h*i+d*s>=0?1:-1;return be(e,ee(Math.hypot(d,h)*1.3),.28,p*M(.15,.32),A()<.4?1:0,0),e.energy=M(.9,1.6)*(.5+.7*Math.min(1,r.charge)),e.width=.65,e.core=.7,e.lightK=.3,e.cr=.6,e.cg=.45,e.cb=1,e.strike=0,!0}case Jn:{if(!n||r.ballR<=0)return!1;const o=A()*ge;e.a.t=s0,e.a.h=t,e.a.ang=o,e.a.r=.9,xe(e.a,D);const a=r.ballR*M(1.4,2.8)*(.7+.5*Math.min(1,r.charge)),i=te?ut(D[0],D[1],a*1.6):-1;return i>=0&&A()<.6?(_n(e,i),et(e.b,e.sx,e.sy),be(e,ee(Math.hypot(e.sx-D[0],e.sy-D[1])),.27,M(-.1,.1),1,1)):(e.strike=0,et(e.b,D[0]+Math.cos(o)*a,D[1]+Math.sin(o)*a),M0(e,ee(a),.3,1)),e.energy=M(.7,1.2)*Math.min(1.2,r.charge),e.width=.7,e.core=.7,e.lightK=.45,e.cr=.62,e.cg=.48,e.cb=1,!0}case 100:{const o=N[e.pairA],a=N[e.pairB];if(!o||!a)return!1;const i=tt[e.sk];He(e.a,e.pairA,i),He(e.b,e.pairB,i);const s=oe,d=[-.06,.05,.11,.17,.23];xe(e.a,D),xe(e.b,P);const h=P[0]>=D[0]?1:-1,p=ie&&it&&!(v0&&e.sk&1),x=ie?v0?.35:kn?-.3:it?.45:1:1;return be(e,ee(Math.hypot(P[0]-D[0],P[1]-D[1])*1.15),.25,h*(d[e.sk]*(1.15-.5*s)*x+M(-.04,.04)),Math.round((M(.4,1.4)+3*s)*(.5+.5*ve))-(J?1:0),2),e.energy=(.45+1.4*s)*M(.75,1.15),e.width=(.65+.85*s)*(p?1.25:1),e.core=(.6+.7*s)*(p?1.2:1),e.lightK=(.55+.6*s)*(p?1.5:1),e.cr=.45,e.cg=.55,e.cb=1,e.strike=0,e.behind=p?1:0,!0}case 101:{const o=N[e.pairA],a=N[e.pairB];return!o||!a?!1:(S[e.pairA].pinch>.3&&S[e.pairB].pinch>.3?(e.a.t=D0,e.a.h=e.pairA,e.a.ox=e.a.oy=0,e.b.t=D0,e.b.h=e.pairB,e.b.ox=e.b.oy=0):e.sk===0?(e.a.t=a0,e.a.h=e.pairA,e.b.t=a0,e.b.h=e.pairB):(He(e.a,e.pairA,tt[A()*5|0]),He(e.b,e.pairB,tt[A()*5|0])),be(e,ee(k0(e)*1.1),.26,M(-.12,.12),w0(J?2:4),1),e.energy=(.6+1.6*oe)*M(.8,1.2),e.width=e.sk===0?1.6:.9,e.core=e.sk===0?1.5:.8,e.lightK=1,e.cr=.5,e.cg=.5,e.cb=1,e.strike=0,e.behind=ie&&it?1:0,!0)}default:return!1}}function Do(){for(let e=0;e<2;e++)for(let t=0;t<Pt;t++){const n=O[e*Pt+t];n.sid=e,n.transient=!1,n.behind=0,n.stype=t<4?$n:t===cn?cn:t<=6?un:t===P0?P0:t===C0?C0:t<=10?-1:t<=15?r0:t<=18?Jn:-1,n.sk=t<4?t:n.stype===r0?t-r0:0,n.rate=n.stype===C0?22:n.stype===P0||n.stype===r0?30:26}for(let e=0;e<Xn;e++){const t=O[Yn+e];t.stype=e<5?100:101,t.sk=e<5?e:e-5,t.rate=26,t.transient=!1,t.sid=-1}}Do();function Tt(){for(let e=ln;e<Ct;e++)if(!O[e].on)return O[e];return null}function Q0(e,t){e.life=t,e.ns=2+(A()*4|0);let n=0;for(let r=0;r<e.ns;r++)e.strokes[r]=n,n+=M(.035,.11);e.nextShape=z+e.strokes[1%e.ns]}function Dn(e,t,n,r,o,a,i){const s=Tt();return s?(s.a.t=a0,s.a.h=e,et(s.b,t,n),s.on=!0,s.transient=!0,s.born=z,s.kick=z,s.seed=A()*4294967296|0,s.power=r,Q0(s,M(.3,.6)*(.8+.3*r)),s.stype=sr,s.sid=e,s.kind=Se,s.levels=ee(k0(s)),s.branches=J?2:w0(2+(A()*3|0)),s.width=.95+.3*r,s.core=1.15+.35*r,s.lightK=1,s.cr=.46,s.cg=.54,s.cb=1,s.behind=0,s.strike=o?1:0,s.sx=t,s.sy=n,s.snx=a,s.sny=i,s.sEdge=-1,be(s,s.levels,.24,M(-.08,.08),s.branches,3),s):null}function zo(e,t,n,r,o,a){const i=Tt();return i?(i.on=!0,i.transient=!0,i.born=z,i.kick=z,i.stype=eo,i.sid=e,i.sk=r,i.sx=t,i.sy=n,i.a.t=we,i.b.t=we,i.power=a,Q0(i,o),i.width=.85,i.core=.9,i.lightK=.6,i.cr=.55,i.cg=.52,i.cb=1,i.behind=0,i.strike=0,Uo(i)?i:(re(i),null)):null}function br(e,t,n,r,o,a,i){const s=Tt();return s?(s.on=!0,s.transient=!0,s.born=z,s.kick=z,s.stype=to,s.sid=e,s.sx=t,s.sy=n,s.dirx=r,s.diry=o,s.a.t=we,s.b.t=we,s.power=i,Q0(s,a),s.width=.75,s.core=.85,s.lightK=.5,s.cr=.55,s.cg=.5,s.cb=1,s.behind=0,s.strike=0,Ho(s)?s:(re(s),null)):null}function Ho(e){const t=Math.atan2(e.diry,e.dirx)+M(-.6,.6);return Co(e,e.sx,e.sy,Math.cos(t),Math.sin(t),M(.05,.12))}function Uo(e){const t=ut(e.sx,e.sy,.05);if(t<0)return!1;const n=Lo(t,e.sk,12+(A()*14|0));return Po(e,n,.18,2+(A()*2|0))}function Er(e){const t=S[e],n=Tt();if(!n)return;let r,o,a=0,i=0,s=0;const d=te&&A()<.35?ut(t.bx+M(-.25,.25),t.by+M(-.1,.3),.3):-1;if(d>=0&&Math.hypot(he[d]-t.bx,de[d]-t.by)>.08)r=he[d],o=de[d],a=1,i=De[d],s=ze[d];else for(let h=0;h<6;h++){const p=M(-.9,1.5);if(Pn(t.bx,t.by,Math.cos(p),Math.sin(p),P),r=P[0],o=P[1],!te||To(t.bx,t.by,r,o))break}et(n.a,r,o),n.b.t=s0,n.b.h=e,n.b.ang=Math.atan2(o-t.by,r-t.bx),n.b.r=.95,n.on=!0,n.transient=!0,n.born=z,n.kick=z,n.seed=A()*4294967296|0,n.power=.8,Q0(n,M(.16,.34)),n.stype=ir,n.sid=e,n.kind=Se,n.levels=ee(Math.hypot(r-t.bx,o-t.by)),n.branches=J?1:w0(2+(A()*2|0)),n.width=.85,n.core=1,n.lightK=.9,n.cr=.5,n.cg=.52,n.cb=1,n.behind=0,n.strike=a,n.sx=r,n.sy=o,n.snx=i,n.sny=s,n.sEdge=-1,be(n,n.levels,.25,M(-.1,.1),n.branches,3),a&&Zt(r,o,i,s,10,.8,1.1,.4,0,0,0,.04)}function Vo(e,t,n,r,o){const a=N[e];if(!a)return;const i=S[e],s=i.bx,d=i.by,h=Math.min(1.2,t),p=o<3,x=Math.round((J?4:5)+(J?3:5)*h*(p?.6:1)),w=p?Math.atan2(r,n):A()*ge,y=Ar(s,d,a.size);let m=0;for(let u=0;u<x;u++){const v=p?w+(A()*2-1)*o:w+u/x*ge+M(-.3,.3),g=Math.cos(v),R=Math.sin(v);if(te&&!y&&So(s,d,g,R,P,0)){const f=ut(P[0],P[1],.04),k=f>=0?De[f]:-g,B=f>=0?ze[f]:-R,E=P[0]-k*.004,F=P[1]-B*.004,b=Dn(e,E,F,t,!0,k,B);if(!b)continue;const L=Math.hypot(s-E,d-F)||1;Zt(E,F,k,B,9,.9,1.2,.35,(s-E)/L,(d-F)/L,L*.04,.05),m++<(J?2:3)&&br(e,E,F,-k,-B,b.life*1.2,t)}else Pn(s,d,g,R,P),Dn(e,P[0],P[1],t,!1,0,0)}if(te&&ne>0){const u=a.size*2.4,v=p?1:J?2:3;for(let g=0;g<v;g++){const R=p?w:A()*ge;let f=-1,k=1/0;for(let L=0;L<90;L++){const _=A()*ne|0;if(c0[_])continue;const I=he[_]-s,j=de[_]-d,Z=Math.hypot(I,j);if(Z<u||Z>1.1)continue;let q=Math.abs(Math.atan2(j,I)-R);q>Math.PI&&(q=ge-q);const Pe=q+Z*.4;Pe<k&&(y||To(s,d,he[_],de[_]))&&(k=Pe,f=_)}if(f<0)continue;const B=he[f]-De[f]*.003,E=de[f]-ze[f]*.003,F=Dn(e,B,E,t,!0,De[f],ze[f]);if(!F)break;const b=Math.hypot(s-B,d-E)||1;Zt(B,E,De[f],ze[f],32,1,1.3,.35,(s-B)/b,(d-E)/b,b*.04,.05),zo(e,B,E,1,F.life*1.3,t),zo(e,B,E,-1,F.life*1.3,t)}}Zt(s,d,0,1,56,1.3,Math.PI,.45,0,0,0,.06),Be=Math.max(Be,.45+.4*Math.min(1,t)),z-I0>.5&&(Bn=At,bn=wt),I0=z,_t=Math.max(_t,Math.min(1,t)),x0=Math.max(x0,Math.min(1,t));const l=V.audio;l&&(l.impact({strength:.6+.5*Math.min(1,t),pitch:.9}),l.zap({strength:1}),l.whoosh({strength:.6,duration:.5,up:!1})),g0=z+.32,co=t}function Fr(e){const t=S[e];if(t.charge<.06||!N[e]){t.charge=0,t.chimed=!1;return}const n=1+Math.round(2*Math.min(1,t.charge/jn));for(let r=0;r<n;r++){const o=Tt();if(!o)break;const a=A()*ge,i=t.ballR*M(1.2,2.4)+.02;o.a.t=s0,o.a.h=e,o.a.ang=a,o.a.r=.8,et(o.b,t.bx+Math.cos(a)*i,t.by+Math.sin(a)*i),o.on=!0,o.transient=!0,o.born=z,o.kick=z,o.life=M(.06,.14),o.ns=0,o.stype=fn,o.sid=e,o.kind=Se,o.seed=A()*4294967296|0,o.width=.55,o.core=.6,o.lightK=.4,o.cr=.55,o.cg=.5,o.cb=1,o.behind=0,o.strike=0,o.energy=o.power=M(.8,1.3),o.levels=ee(i),M0(o,o.levels,.34,1),o.nextShape=z+.03}Mt=Math.max(Mt,.5),Z0(.25),t.charge=0,t.chimed=!1}function Sr(e,t){const n=N[e],r=Tt();if(!r||!n)return;const o=A()*ge,a=n.size*M(.15,.42);r.a.t=D0,r.a.h=e,r.a.ox=0,r.a.oy=0,r.b.t=D0,r.b.h=e,r.b.ox=Math.cos(o)*a,r.b.oy=Math.sin(o)*a,r.on=!0,r.transient=!0,r.born=z,r.kick=z,r.life=M(.03,.08),r.ns=0,r.stype=fn,r.sid=e,r.kind=Se,r.seed=A()*4294967296|0,r.width=.5,r.core=.55,r.lightK=.3,r.cr=.5,r.cg=.52,r.cb=1,r.behind=0,r.strike=0,r.energy=t*M(.7,1.3),r.power=r.energy,r.levels=ee(a),M0(r,r.levels,.34,A()<.5?1:0),r.nextShape=z+.03}function Tr(e,t,n,r){const o=Tt();if(!o)return;const a=t.points,i=tt[n],s=i-1;let d=(a[i*3]-a[s*3])*T,h=a[i*3+1]-a[s*3+1];const p=Math.hypot(d,h)||1;d/=p,h/=p;const x=(A()*2-1)*1.25,w=Math.cos(x),y=Math.sin(x),m=t.size*M(.14,.45);He(o.a,e,i),o.b.t=cr,o.b.h=e,o.b.k=i,o.b.x=(d*w-h*y)*m,o.b.y=(d*y+h*w)*m,o.on=!0,o.transient=!0,o.born=z,o.kick=z,o.life=M(.035,.09),o.ns=0,o.stype=fn,o.sid=e,o.kind=Se,o.seed=A()*4294967296|0,o.width=.5,o.core=.6,o.lightK=.15,o.cr=.55,o.cg=.5,o.cb=1,o.behind=0,o.strike=0,o.energy=r*M(.7,1.25),o.power=o.energy,o.levels=ee(m),M0(o,o.levels,.34,A()<.4?1:0),o.nextShape=z+.03}function Rr(e){for(let t=ln;t<Ct;t++){const n=O[t];if(!n.on)continue;const r=e-n.born;if(r>=n.life){re(n);continue}if(n.a.t!==we&&!N[n.a.h]){re(n);continue}if(n.b.t!==we&&!N[n.b.h]){re(n);continue}if(n.stype===fn){e>=n.nextShape&&(M0(n,n.levels,.34,A()<.4?1:0),n.nextShape=e+.03),n.energy=n.power*ye((n.life-r)/.02);continue}let o=0;for(let a=0;a<n.ns;a++){const i=r-n.strokes[a];i>=0&&(o+=Math.exp(-i/.045)*(a===0?1.25:.9))}if(o+=.3*(1-r/n.life),n.energy=o*(n.stype===eo||n.stype===to?1.1:1.15+.55*n.power)*ye((n.life-r)/.08),e>=n.nextShape){if(n.stype===eo){if(!Uo(n)){re(n);continue}}else if(n.stype===to){if(!Ho(n)){re(n);continue}}else be(n,n.levels,.24,M(-.08,.08),n.branches,3);let a=1/0;for(let i=0;i<n.ns;i++)n.strokes[i]>r+.005&&(a=Math.min(a,n.strokes[i]));if(n.nextShape=a===1/0?e+.05:n.born+a,n.kick=e,n.strike&&A()<.5){let i=0,s=0;if(xe(n.a,D)){const d=Math.hypot(D[0]-n.sx,D[1]-n.sy)||1;i=(D[0]-n.sx)/d,s=(D[1]-n.sy)/d}Zt(n.sx,n.sy,n.snx,n.sny,7,.9,1.3,.35,i,s,.02,.04)}}}}function Lr(e,t){const n=S[e.id];if(!n.present||n.charge<jn)return;const r=Math.hypot(t[0]*T,t[1])||1;Vo(e.id,n.charge,t[0]*T/r,t[1]/r,.45),n.charge=0,n.chimed=!1}function Pr(e,t,n){const r=N[e],o=S[e],a=e*Pt;if((!r||r.age<o.age-.05)&&(o.present&&Mr(a,Pt),o.present=!1,o.beads=0,o.charge=0,o.point=0,o.fade=0,o.ballR=0,o.ballE=0,o.pinch=0,o.body=0,o.pointHold=-9,o.fistT=-9,o.tightT=-9,o.peakC=0,o.chimed=!1,o.age=0,!r))return;o.present=!0,o.age=r.age,o.size=r.size,o.z=.07+.35*r.size,o.fade=ye(1-(r.lost-.1)/.15);const i=Math.max(ye(1-(r.lost-.06)/.08),ye(1-(r.lost-.3)/.1)*ye(1-(r.speed-.15)/.2))*ye(1-(r.speed-.8)/.7);o.body=Ve(o.body,i,i<o.body?9:5,n);const s=r.gesture,d=ie&&Fn,h=!d&&(s==="fist"||r.fist>.82&&s!=="open"&&s!=="point");(s==="point"||s==="frame")&&(o.pointHold=t);const x=t-o.pointHold<.14,w=!h&&!x&&r.pinch>.3&&r.curls[1]<.85,y=!d&&!h&&!x&&(s==="open"||r.open>.55)&&r.pinch<.55;o.beads=Ve(o.beads,y?1:0,y?5:8,n),o.point=Ve(o.point,x?1:0,x?30:9,n),o.pinch=Ve(o.pinch,w?r.pinch:0,14,n);for(let f=0;f<5;f++)o.flick[f]=.55+.45*A();{const f=r.points;let k=(f[15]+f[27]+f[39]+f[51])*.25-f[0],B=(f[16]+f[28]+f[40]+f[52])*.25-f[1];k*=T;const E=Math.hypot(k,B)||1,F=ie?0:.22*r.size;o.bx=r.palm[0]*T+k/E*F,o.by=r.palm[1]+B/E*F}const m=U.forceBall===e,l=(r.curls[1]+r.curls[2]+r.curls[3]+r.curls[4])*.25;h?o.peakC=Math.max(o.peakC,l):o.charge<=0&&(o.peakC=0),l>o.peakC-.1&&(o.tightT=t),h&&r.age>.4||m?(m?o.charge=Math.max(o.charge,U.forceCharge):r.speed<.9&&(o.charge=Math.min(1.25,o.charge+n/1.6)),o.fistT=t,o.charge>=1&&!o.chimed&&(o.chimed=!0,V.audio?.chime({strength:.35,pitch:1.6}))):o.charge>0&&!h&&(s==="open"||r.open>.72||x?t-o.tightT<or&&o.charge>=jn?(Vo(e,o.charge,0,0,9),o.charge=0,o.chimed=!1):Fr(e):t-o.fistT>or&&(o.charge=Math.max(0,o.charge-n*1.4),o.charge<1&&(o.chimed=!1),o.charge>.06&&A()<n*6&&(Mt=Math.max(Mt,.25))));const u=Math.min(1,o.charge);if(o.ballR=Ve(o.ballR,o.charge>.02?r.size*(.14+.62*Math.pow(u,.7)):0,o.charge>.02?9:22,n),o.ballE=Ve(o.ballE,o.charge>.02?.25+.85*u:0,10,n),o.beads>.3&&!ie)for(let f=0;f<5;f++)A()<n*14*o.beads*(.5+.5*ve)&&Tr(e,r,f,.85*o.beads*o.fade);const v=Qe>.5,g=o.beads>.25;for(let f=0;f<4;f++)ft(O[a+f],g,.65*o.beads*(v?.35:1),.04,.13,.04,.35/(.3+o.beads),t);ft(O[a+cn],g&&!v,.35*o.beads,.03,.08,.15,.8,t);for(let f=0;f<2;f++){const k=O[a+un+f];let B=0;if(g&&te&&!k.on&&t>=k.nextOn){let E=1;for(let F=0;F<5;F++){const b=tt[F],L=ut(r.points[b*3]*T,r.points[b*3+1],Qn);L>=0&&(E=Math.min(E,Math.hypot(he[L]-r.points[b*3]*T,de[L]-r.points[b*3+1])/Qn))}B=E<1?o.beads*Math.pow(1-E,2)*3:0}ft(k,g,k.on?1:B,.06,.24,.06,.35,t)}if(o.pinch>.86&&!ie)for(let f=0;f<2;f++)A()<n*16&&Sr(e,.9*o.fade);{const f=O[a+P0],k=o.pinch>.25&&o.pinch<.9;k&&!f.on?(f.on=!0,f.born=t,f.kick=t,f.seed=A()*4294967296|0,Qt(f),f.nextShape=t+1/f.rate):!k&&f.on?re(f):f.on&&t>=f.nextShape&&(Qt(f),f.nextShape=t+1/f.rate*M(.7,1.3)),f.on&&(f.energy=(.6+1.6*ye((o.pinch-.25)/.6))*(A()<.1?.3:M(.8,1.2)))}{const f=O[a+C0],k=o.point>.04;if(k&&!f.on?(f.on=!0,f.born=t,f.kick=t,f.seed=A()*4294967296|0,f.sEdge=-1,Qt(f),f.nextShape=t+1/f.rate,_o(.55),Z0(.4)):!k&&f.on?(re(f),re(O[a+_0]),re(O[a+_0+1])):f.on&&t>=f.nextShape&&(Qt(f),f.nextShape=t+1/f.rate*M(.6,1.4),A()<.09&&Z0(.18+.2*A())),f.on){const B=A()<.12?1.6:1;if(B>1&&(f.kick=t),f.energy=o.point*M(1.1,1.6)*B,f.strike===1){const E=(A()<.35?1:0)+(A()<.12?2:0);E&&Zt(f.sx,f.sy,f.snx,f.sny,E,.75,1.25,.3,-f.dirx,-f.diry,.015,.02);for(let F=0;F<2;F++){const b=O[a+_0+F];b.on&&(b.energy=(A()<.08?.3:M(.7,1.2))*o.point)}}}}const R=o.charge>.05;for(let f=0;f<5;f++)ft(O[a+r0+f],R,.4+.6*u,.04,.14,.02,.28/(.2+u),t);for(let f=0;f<3;f++)ft(O[a+Jn+f],o.charge>.25,.3+.7*u,.05,.16,.1,.9/(.3+u),t)}function Cr(e,t){const n=N[0],r=N[1];let o=!1,a=0;const i=!!(n&&r&&S[0].pinch>.3&&S[1].pinch>.3);if(n&&r&&(S[0].beads>.3&&S[1].beads>.3||i)){const h=(n.size+r.size)*.5,p=Math.hypot((n.palm[0]-r.palm[0])*T,n.palm[1]-r.palm[1])/Math.max(.001,h);a=ye((8.5-p)/6.5),ie&&(a=Math.max(a,.55)),o=a>.02,a*=(i?.85:Math.min(S[0].beads,S[1].beads))*Math.min(S[0].fade,S[1].fade)}oe=Ve(oe,a,8,t),Qe=Ve(Qe,o?1:0,8,t);let s=0,d=1;n&&r&&n.palm[0]>r.palm[0]&&(s=1,d=0);for(let h=0;h<Xn;h++){const p=O[Yn+h];p.pairA=s,p.pairB=d,h<5?ft(p,o&&!i,.35+.65*oe,.04,.09+.5*oe,.01,.06+.4*(1-oe),e):h===5?ft(p,o&&(oe>.62||i),i?.5+.5*oe:.8,.05,.22,.02,i?.35:.15,e):ft(p,o&&oe>.35,.5*oe,.03,.1,.05,.4,e)}}function No(){for(let e=0;e<Ct;e++)re(O[e]);Do(),st=0;for(let e=0;e<2;e++){const t=S[e];t.present=!1,t.beads=0,t.charge=0,t.point=0,t.ballR=0,t.ballE=0,t.pinch=0,t.fade=0,t.chimed=!1,t.body=0,t.pointHold=-9,t.fistT=-9,t.tightT=-9,t.peakC=0,t.age=0}I0=-9,Bn=bn=0,yt=At=wt=Be=_t=x0=oe=Qe=Mt=0,g0=-1,it=!1,A0=0,Dt[0]=Dt[1]=!1,l0=!0,dt=!0}let pe=0,nt=0,jt=0;function Oo(e,t,n,r,o,a,i,s){if(e<2)return;let d=W[2]-W[1],h=K[2]-K[1],p=Math.hypot(d,h)||1;const x=n*.55;W[0]=W[1]-d/p*x,K[0]=K[1]-h/p*x,kt[0]=0,d=W[e]-W[e-1],h=K[e]-K[e-1],p=Math.hypot(d,h)||1,W[e+1]=W[e]+d/p*x,K[e+1]=K[e]+h/p*x,kt[e+1]=0,je[0]=je[1],je[e+1]=je[e];const w=e+2;if(pe+w*2+2>tr)return;for(let m=0;m<w;m++){let l=0,u=0,v=0,g=0,R=!1,f=!1;if(m>0){const F=W[m]-W[m-1],b=K[m]-K[m-1],L=Math.hypot(F,b);L>1e-4&&(l=-b/L,u=F/L,R=!0)}if(m<w-1){const F=W[m+1]-W[m],b=K[m+1]-K[m],L=Math.hypot(F,b);L>1e-4&&(v=-b/L,g=F/L,f=!0)}let k,B,E=1;if(R&&f){k=l+v,B=u+g;const F=Math.hypot(k,B);F<.001?(k=v,B=g):(k/=F,B/=F,E=1/Math.max(.42,k*l+B*u))}else R?(k=l,B=u):f?(k=v,B=g):(k=0,B=1);wo[m]=k,Mo[m]=B,Sn[m]=E}const y=pe;pe>0&&_r(pe-1);for(let m=0;m<w;m++){const l=kt[m],u=n*(.55+.45*l),v=wo[m]*u*Sn[m],g=Mo[m]*u*Sn[m],R=t*(.3+.7*l),f=r*l*je[m];m===0&&y>0&&zn(W[m]+v,K[m]+g,1,u,R,f,o,a,i,s),zn(W[m]+v,K[m]+g,1,u,R,f,o,a,i,s),zn(W[m]-v,K[m]-g,-1,u,R,f,o,a,i,s)}}function zn(e,t,n,r,o,a,i,s,d,h){const p=pe*ot;me[p]=e,me[p+1]=t,me[p+2]=n,me[p+3]=r,me[p+4]=o,me[p+5]=a,me[p+6]=i,me[p+7]=s,me[p+8]=d,me[p+9]=h,pe++}function _r(e){const t=pe*ot,n=e*ot;for(let r=0;r<ot;r++)me[t+r]=me[n+r];pe++}function j0(e,t,n,r,o,a,i,s){if(nt>=nr||o<=.002)return;const d=nt*L0;Ne[d]=e,Ne[d+1]=t,Ne[d+2]=n,Ne[d+3]=r,Ne[d+4]=o,Ne[d+5]=a,Ne[d+6]=i,Ne[d+7]=s,nt++}function Hn(e,t,n,r,o,a,i,s,d,h,p){if(p<=.002)return;let x;if($e>=Ae){let w=0;for(let y=1;y<$e;y++)Re[y]<Re[w]&&(w=y);if(Re[w]>=p)return;x=w}else x=$e++;Ht[x]=e,Ut[x]=t,Vt[x]=n,Nt[x]=r,Ot[x]=o,It[x]=a,qt[x]=i,Bt[x]=s,bt[x]=d,Et[x]=h,Re[x]=p,Gt[x]=Ft,Wt[x]=Tn}const b0=(e,t,n,r,o,a,i,s)=>Hn(e-T*.5,t-.5,n,e-T*.5,t-.5,n,r,o,a,i,s);function Io(e,t){return t.behind?-.1:e.t===we?t.kind===i0||t.strike?.035:.1:S[e.h].z+.02}function Dr(e,t){let n=0,r=0,o=1,a=0,i=1;if(e.kind===Se){if(!xe(e.a,D)||!xe(e.b,P))return;n=D[0],r=D[1];const b=P[0]-n,L=P[1]-r;if(i=Math.hypot(b,L),i<1e-4)return;o=b/i,a=L/i}const s=e.energy*e.flick*t;if(Ft=e.behind?.3:e.stype===ir?.4:e.stype===sr?.5:1,Tn=e.strike===1||e.kind===i0?.5:1,s<.01)return;let d=0,h=0;e.a.t!==we&&N[e.a.h]&&(d+=N[e.a.h].size,h++),e.b.t!==we&&N[e.b.h]&&(d+=N[e.b.h].size,h++);const p=h?Ue(Math.pow(d/h/.16,.7),.8,1.7):1,x=.00105*Ke*e.core*St*p,w=.0165*Ke*e.width*St*Math.sqrt(p),y=ge/(.075*Ke),m=ge/(.21*Ke),l=e.pts;for(let b=0;b<e.nl;b++){const L=e.lines[b*2],_=e.lines[b*2+1];if(_>Fe)continue;const I=(e.seed&1023)*.0061+b*1.7;let j=0;for(let q=0;q<_;q++){const Pe=(L+q)*3;let R0,Kn;if(e.kind===Se){const $o=l[Pe]*i,Jo=l[Pe+1]*i;R0=n+$o*o-Jo*a,Kn=r+$o*a+Jo*o}else R0=l[Pe],Kn=l[Pe+1];W[q+1]=R0/T*ce,K[q+1]=Kn*Y,kt[q+1]=l[Pe+2],q>0&&(j+=Math.hypot(W[q+1]-W[q],K[q+1]-K[q])),je[q+1]=.86+.34*Math.sin(j*y+I)*Math.sin(j*m+I*1.9)}const Z=e.lineW[b];Oo(_,x*Z,w*(.5+.5*Z),s*e.lineE[b],e.cr,e.cg,e.cb,e.behind)}const u=.65+2.3*Math.exp(-(z-e.kick)/.045),v=e.kind===Se?i:e.plen,g=s*e.lightK*(.15+v)*u*ar,R=Math.max(2,e.nMain),f=v>.45?3:v>.18?2:1,k=e.kind===i0?.03:Io(e.a,e),B=e.kind===i0?.03:Io(e.b,e);let E=0,F=0;for(let b=0;b<=f;b++){const L=Math.floor(b*(R-1)/f)*3;let _,I;if(e.kind===Se){const j=l[L]*i,Z=l[L+1]*i;_=n+j*o-Z*a,I=r+j*a+Z*o}else _=l[L],I=l[L+1];if(_-=T*.5,I-=.5,b>0){const j=(b-1)/f,Z=b/f;Hn(E,F,k+(B-k)*j,_,I,k+(B-k)*Z,.075,.74,.8,1,g/f)}E=_,F=I}e.strike===1&&(b0(e.sx,e.sy,.035,.05,.78,.82,1,s*e.lightK*.55*u*ar),j0(e.sx/T*ce,e.sy*Y,.016*Ke*St*(.8+.4*Math.min(1.5,s)),3,Math.min(3.5,s*.9),2,e.i*1.7,0))}function zr(e){const t=Math.max(2,e.width>>1),n=Math.max(2,e.height>>1);ae?(ae.width!==t||ae.height!==n)&&(ae.resize(t,n),l0=!0):(ae=C.pingPong(t,n,{format:"hdr"}),l0=!0),ve<.45?Ln=!0:ve>.6&&(Ln=!1);const r=Math.max(2,Math.sqrt(e.width*e.height/(Ln?2e5:5e5))),o=Math.max(2,Math.round(e.width/r)),a=Math.max(2,Math.round(e.height/r));Ie?(Ie.width!==o||Ie.height!==a)&&Ie.resize(o,a):Ie=C.target(o,a,{format:"hdr"}),se?(se.width!==t||se.height!==n)&&(se.resize(t,n),dt=!0):(se=C.target(t,n,{format:"hdr"}),dt=!0);const i=Math.max(2,e.width>>2),s=Math.max(2,e.height>>2);Te?(Te.width!==i||Te.height!==s)&&Te.resize(i,s):Te=C.pingPong(i,s,{format:"hdr"}),qe?(qe.width!==i||qe.height!==s)&&qe.resize(i,s):qe=C.pingPong(i,s,{format:"hdr"}),Q?(Q.width!==i||Q.height!==s)&&(Q.resize(i,s),dt=!0):(Q=C.pingPong(i,s,{format:"hdr"}),dt=!0),Me?(Me.width!==e.width||Me.height!==e.height)&&Me.resize(e.width,e.height):Me=C.target(e.width,e.height,{format:"hdr"});const d=e.aspect;if(!xt||Math.abs(d-oo)>.01){const h=J?4200:6400,p=Math.max(16,Math.round(Math.sqrt(h*d))),x=Math.max(16,Math.round(h/p));H=p,G=x,oo=d,xt?xt.resize(H,G):xt=C.target(H,G,{format:"rgba8",filter:"linear"}),ke=new Uint8Array(H*G),U0=new Int16Array(H*G),V0=new Int32Array(H*G),gn=new Uint8Array(H*G*4),_e&&(c.deleteSync(_e),_e=null),rt||(rt=c.createBuffer()),xn=H*G*4,c.bindBuffer(c.PIXEL_PACK_BUFFER,rt),c.bufferData(c.PIXEL_PACK_BUFFER,xn,c.STREAM_READ),c.bindBuffer(c.PIXEL_PACK_BUFFER,null),te=!1,ne=0}}function Hr(e){if(_e){if(c.getSyncParameter(_e,c.SYNC_STATUS)!==c.SIGNALED)return;c.deleteSync(_e),_e=null,c.bindBuffer(c.COPY_READ_BUFFER,rt),c.getBufferSubData(c.COPY_READ_BUFFER,0,gn),c.bindBuffer(c.COPY_READ_BUFFER,null),vr()}lo%3===0&&(tn.uMask=e.mask,tn.uCell[0]=1/H,tn.uCell[1]=1/G,C.pass($.maskDown,xt,tn),c.bindBuffer(c.PIXEL_PACK_BUFFER,rt),c.bufferData(c.PIXEL_PACK_BUFFER,xn,c.STREAM_READ),c.readPixels(0,0,H,G,c.RGBA,c.UNSIGNED_BYTE,0),c.bindBuffer(c.PIXEL_PACK_BUFFER,null),_e=c.fenceSync(c.SYNC_GPU_COMMANDS_COMPLETE,0))}function Ur(){Me.clear(0,0,0,0),!(jt<=2)&&(c.enable(c.BLEND),c.blendEquation(c.MAX),c.blendFunc(c.ONE,c.ONE),Le.uMask=J0,Le.uTarget[0]=Me.width,Le.uTarget[1]=Me.height,Le.uPix=Rn,Le.uGain=H0?.125:1,$.strip.use().set(Le),c.bindVertexArray(z0),c.drawArrays(c.TRIANGLE_STRIP,0,jt),c.bindVertexArray(null),c.blendEquation(c.FUNC_ADD),c.disable(c.BLEND))}function Vr(e){e.bind(),c.enable(c.BLEND),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.ONE,c.ONE),pe-jt>2&&(Le.uMask=J0,Le.uTarget[0]=e.width,Le.uTarget[1]=e.height,Le.uPix=Rn,Le.uGain=1,$.strip.use().set(Le),c.bindVertexArray(z0),c.drawArrays(c.TRIANGLE_STRIP,jt,pe-jt)),nt>0&&(Jt.uMask=J0,Jt.uTarget[0]=e.width,Jt.uTarget[1]=e.height,Jt.uTime=en,Jt.uGain=1,$.sprite.use().set(Jt),c.bindVertexArray(dn),c.drawArraysInstanced(c.TRIANGLE_STRIP,0,4,nt));for(let t=0;t<2;t++){const n=S[t];!n.present||n.ballR<=.004||n.ballE<=.01||(ue.uBall[0]=n.bx/T*ce,ue.uBall[1]=n.by*Y,ue.uBall[2]=n.ballR*Y,ue.uBall[3]=1.4,ue.uBallB[0]=n.ballE*(.85+.3*A())*n.fade,ue.uBallB[1]=t*11.7,ue.uBallB[2]=ht?1:0,ue.uBallB[3]=Math.min(1,n.charge),ue.uHand=se,ue.uAlpha=Q.read,ue.uTarget[0]=e.width,ue.uTarget[1]=e.height,ue.uHtoPx=n.size*.1*e.height,ue.uTime=en,ue.uGain=1,$.ball.use().set(ue),c.bindVertexArray(no),c.drawArrays(c.TRIANGLE_STRIP,0,4))}c.bindVertexArray(null),c.disable(c.BLEND)}let ht=!1,dt=!0,qo=null,Go=-1;const Wo=new Float32Array(Zn*2*Oe);function Nr(e){let t=0;const n=se.width,r=se.height;if(O0&&!U.noHand)for(let a=0;a<2;a++){const i=N[a],s=S[a];if(!i)continue;const d=s.fade*s.body;if(d<.05)continue;const h=i.points,p=i.size*r;for(let x=0;x<Zn;x++){const w=ur[x*2],y=ur[x*2+1],m=t*Oe;fe[m]=h[w*3]*n,fe[m+1]=h[w*3+1]*r,fe[m+2]=h[y*3]*n,fe[m+3]=h[y*3+1]*r,fe[m+4]=fr[x]*p,fe[m+5]=s.z,fe[m+6]=fr[x]*i.size,fe[m+7]=Zr[x],fe[m+8]=d,fe[m+9]=y===4||y===8||y===12||y===16||y===20?1:0,t++}}let o=!dt&&e.mask===qo&&t===Go;for(let a=0,i=t*Oe;o&&a<i;a++)Math.abs(fe[a]-Wo[a])>(a%Oe<5?.6:.02)&&(o=!1);if(o)return!1;dt=!1,qo=e.mask,Go=t;for(let a=0,i=t*Oe;a<i;a++)Wo[a]=fe[a];return se.clear(0,0,0,0),ht=t>0,t&&(c.bindBuffer(c.ARRAY_BUFFER,vn),c.bufferSubData(c.ARRAY_BUFFER,0,fe,0,t*Oe),c.bindBuffer(c.ARRAY_BUFFER,null),se.bind(),c.enable(c.BLEND),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.ONE,c.ONE),qn.uRes[0]=n,qn.uRes[1]=r,$.hand.use().set(qn),c.bindVertexArray(mn),c.drawArraysInstanced(c.TRIANGLE_STRIP,0,4,t),c.bindVertexArray(null),c.blendEquation(c.FUNC_ADD),c.disable(c.BLEND)),!0}const $t={uBase:null,uHand:null,uTexel:new Float32Array(2),uCore:1},Un={uSrc:null,uDir:new Float32Array(2)},Vn={uSrc:null,uDir:new Float32Array(2)};function Or(e){if(!(!ht||U.noRefine)){$t.uBase=e.base,$t.uHand=se,$t.uTexel[0]=1/e.width,$t.uTexel[1]=1/e.height,Un.uDir[0]=1/Te.width,Vn.uDir[1]=1/Te.height;for(let t=0;t<2;t++){const n=t?qe:Te;$t.uCore=t?0:1,C.pass($.hmPrep,n.write,$t),n.swap(),Un.uSrc=n.read,C.pass($.hmBox,n.write,Un),n.swap(),Vn.uSrc=n.read,C.pass($.hmBox,n.write,Vn),n.swap()}}}const Ee={uBase:null,uMask:null,uPlate:null,uPlateL:null,uHand:null,uGF:null,uGFB:null,uTexel:new Float32Array(2),uHasHand:0,uAspect:1,uHandZone:null},Nn={uSrc:null,uDir:new Float32Array(2)},On={uSrc:null,uDir:new Float32Array(2)};function Ir(e){Ee.uBase=e.base,Ee.uMask=e.mask,Ee.uPlate=e.plate,Ee.uPlateL=e.plateLearned,Ee.uHand=se,Ee.uGF=Te.read,Ee.uGFB=qe.read,Ee.uTexel[0]=1/e.width,Ee.uTexel[1]=1/e.height,Ee.uHasHand=ht&&!U.noHandComp?1:0,Ee.uAspect=T,Ee.uHandZone=T0,C.pass($.alpha,Q.write,Ee),Q.swap(),Nn.uDir[0]=1/Q.width,On.uDir[1]=1/Q.height,Nn.uSrc=Q.read,C.pass($.blur9,Q.write,Nn),Q.swap(),On.uSrc=Q.read,C.pass($.blur9,Q.write,On),Q.swap()}let E0=null;const $0=[],Ko=[[],[],[],[],[],[],[]];let In=-1;function Rt(e){if(!er||!U.prof||(E0||(E0=c.getExtension("EXT_disjoint_timer_query_webgl2")),!E0))return;In>=0&&(c.endQuery(E0.TIME_ELAPSED_EXT),In=-1);for(let n=$0.length-1;n>=0;n--){const r=$0[n];c.getQueryParameter(r.q,c.QUERY_RESULT_AVAILABLE)&&(Ko[r.k].push(c.getQueryParameter(r.q,c.QUERY_RESULT)/1e6),c.deleteQuery(r.q),$0.splice(n,1))}if(e===2||e===6)return;const t=c.createQuery();c.beginQuery(E0.TIME_ELAPSED_EXT,t),$0.push({q:t,k:e}),In=e}const F0=new Float32Array(2);let J0=null,qr=null,en=0;const tn={uMask:null,uCell:new Float32Array(2)},Le={uRes:F0,uMask:null,uTarget:new Float32Array(2),uPix:1,uGain:1},Jt={uRes:F0,uMask:null,uTarget:new Float32Array(2),uTime:0,uGain:1},ue={uRes:F0,uBall:new Float32Array(4),uBallB:new Float32Array(4),uHand:null,uAlpha:null,uTarget:new Float32Array(2),uHtoPx:1,uTime:0,uGain:1},qn={uRes:new Float32Array(2)},e0={uPrev:null,uEnergy:null,uTexel:new Float32Array(2),uK:1,uG:1},pt={uNormals:null,uHand:null,uAspect:1,uWallZ:Xr,uWallGain:.42,uOutScale:H0?.125:1,uHasHand:0,uLA:Je,uLB:ct,uLC:Kt,uNL:0,uView:0,uShadows:6},S0=new Float32Array(8),T0=new Float32Array(8),X={uBase:null,uAlpha:null,uNormals:null,uAfter:null,uLight:null,uHand:null,uAfterTexel:new Float32Array(2),uAspect:1,uTime:0,uAmbient:1,uRoom:new Float32Array(3),uWallRoom:1,uWallTint:new Float32Array([.93,.96,1]),uHaze:.0012,uAfterGain:.5,uLightIn:H0?8:1,uEnergyIn:H0?8:1,uEnergy:null,uHasHand:0,uLens:S0,uView:0},Yo={level:0},Gn={level:0,pitch:1},Xo={level:0,tone:.75},nn=[{x:0,y:0,size:.15,roll:0,side:"left",curls:null,pinch:0},{x:0,y:0,size:.15,roll:0,side:"right",curls:null,pinch:0}],on=[{pts:null,side:"left"},{pts:null,side:"right"}],rn=[],Gr=[new Array(5).fill(0),new Array(5).fill(0)],Wr=(e,t,n,r)=>{const o=Gr[e];for(let a=0;a<5;a++)o[a]=t[a]+(n[a]-t[a])*r;return o},an=(e,t,n)=>{const r=ye((n-e)/(t-e));return r*r*(3-2*r)},Kr=[.35,.42,.45,.48,.5],le={asp:1,buffers:null,synthHand:null,POSES:null};function Zo(e,t){on[e].pts=le.synthHand(nn[e],le.asp,le.buffers[e]),on[e].side=t,rn.push(on[e])}function Qo(e,t,n,r,o,a,i){const s=nn[e];s.side=t,s.size=a,s.curls=i,s.pinch=0,s.x=n,s.y=r,s.roll=o,Zo(e,t)}function Wn(e,t,n,r,o,a){Qo(e,t,n,r,o,a,le.POSES.point)}function pa(e){on[e].pts=le.synthHand(nn[e],le.asp,le.buffers[e])}function t0(e,t,n,r,o,a){Qo(e,t,n,r,o,a,le.POSES.open)}function sn(e,t,n,r,o,a,i){const s=le.asp;let d=(o-n)*s,h=a-r;const p=Math.hypot(d,h)||1;d/=p,h/=p,Wn(e,t,n-d*1.35*i/s,r-h*1.35*i,Math.atan2(d,h),i),Dt[e]=!0,xo[e]=o*s,go[e]=a,yo[e]=n*s,Ao[e]=r}function jo(e,t,n,r,o){const a=nn[0],i=e-4.95;a.side="right",a.size=o,a.pinch=0,a.x=n+.008*Math.sin(t*3.1),a.y=r+.01*Math.sin(t*2.3)+(i>3.8?-(i-3.8)*.5:0),a.roll=-.15+.05*Math.sin(t*1.7),a.curls=i<.25?Wr(0,le.POSES.relaxed,le.POSES.fist,i/.25):i<2.75?le.POSES.fist:i<2.92?le.POSES.open:Kr,A0=i>.35&&i<2.7?1:0,Fn=i>2.92,Zo(0,"right")}function Yr(e,t,n,r,o){wn=e,rn.length=0,it=!1,v0=!1,kn=!1,Dt[0]=Dt[1]=!1,A0=0,Fn=!1;const a=e%16,i=t<1;if(le.asp=t,le.buffers=n,le.synthHand=r,le.POSES=o,i){const d=.13/t;if(a<2.2)sn(0,"right",1.05,1.07,.84,.76,.14);else if(a>2.5&&a<4.6)sn(0,"left",-.05,1.02,.18,.67,.14);else if(a>4.95&&a<9.7)jo(a,e,.93,.645,.095);else if(a>10&&a<12.9){it=!0,v0=!0;const h=a-10,p=an(0,.7,h)*.03,x=.75+.01*Math.sin(e*1.3);t0(0,"left",-d-.03+p,x,1.52,.1),t0(1,"right",1+d+.03-p,x+.01*Math.sin(e*.9),-1.52,.1)}else if(a>13.2&&a<15.8){const h=a-13.2,p=.01*Math.sin(e*2.1);sn(0,"left",-.07,1.03+p,.19,.7,.14),h>.35&&sn(1,"right",1.07,.99-p,.81,.79,.14)}return rn}if(a<4.6)if(a<2.3){const s=a/2.3;Wn(0,"right",.93-.04*s,1.28,-2.62+.22*s,.15)}else{const s=(a-2.3)/2.3;Wn(0,"right",1.16,.86-.3*s,-1.72-.25*s,.15)}else if(!(a<4.95)){if(a<9.7)jo(a,e,.655,.31,.16);else if(!(a<10)){if(a<12.9){it=!0;const s=a-10,d=an(0,.7,s)*.05,h=.55+.015*Math.sin(e*1.3);t0(0,"left",-.24+d,h-.02,1.45,.16),t0(1,"right",1.24-d,h+.02*Math.sin(e*.9),-1.45,.16)}else if(!(a<13.2)){const s=a-13.2;kn=!0;const d=an(0,.6,s),p=.21-.12*an(.3,2.4,s),x=-.13+.26*d+.008*Math.sin(e*2.2);t0(0,"left",.5-p,x,.5,.17),t0(1,"right",.5+p,x+.006*Math.sin(e*1.7),-.5,.17)}}}return rn}const Lt={id:"storm",coach:[{gesture:"open",label:"Open palm",text:"charge your fingertips"},{gesture:"two",label:"Both hands",text:"arc lightning between them"},{gesture:"point",label:"Point",text:"strike with a bolt"},{gesture:"fist",label:"Fist, open",text:"charge, then unleash"}],choreography:Yr,activeCues(e){return zt.length=0,(S[0].beads>.4||S[1].beads>.4)&&zt.push("open"),Qe>.5&&zt.push("two"),(S[0].point>.5||S[1].point>.5)&&zt.push("point"),(S[0].charge>.05||S[1].charge>.05)&&zt.push("fist"),zt},update(e){const t=e.time,n=Ue(e.dt||1/60,0,.05);z=t;const r=V.state;T=r.width/Math.max(1,r.height)||16/9;const o=V.source&&V.source.element,a=!!(o&&o.tagName==="VIDEO");O0=a,ie=!a&&t-wn<.3,Mn&&!ie&&(No(),vo=t),Mn=ie,yn=ie?190:128,q0=Math.min(2,q0+n*1.5),G0=Math.min(3,G0+n*5),N[0]=N[1]=null;const i=e.hands,s=e.events;for(let m=0;m<i.length;m++){const l=i[m];l.id!==0&&l.id!==1||O0&&t-l.lost-l.age<vo-.05||(N[l.id]=l)}gr();for(let m=0;m<s.length;m++){const l=s[m];l.type==="throw"&&l.hand&&Lr(l.hand,l.direction||l.hand.velocity)}Cr(t,n);for(let m=0;m<2;m++)Pr(m,t,n);if(ie&&A0&&t>=mo)for(let m=0;m<2;m++){const l=S[m];!l.present||l.charge<.02||(Er(m),mo=t+M(.06,.2)*(1.2-.5*Math.min(1,l.charge)))}Rr(t),wr(n),En=0;let d=st>0;for(let m=0;m<Ct;m++){const l=O[m];if(!l.on)continue;d=!0;const u=t-l.born<.03?1.5:1;l.flick=(A()<.06?.25:.7+.3*A())*u,En+=l.energy*.12}(d||S[0].ballR>0||S[1].ballR>0||S[0].beads>.02||S[1].beads>.02)&&(po=t),(t-y0>600&&t-po>1.5||t-y0>3e3||t<y0)&&(y0=t),en=t-y0;let h=0,p=0,x=0,w=0;for(let m=0;m<2;m++){const l=S[m],u=Math.min(1,l.charge);h=Math.max(h,l.beads*.65,u+(l.charge>0?.25:0),l.point*.9,l.pinch*.5),p=Math.max(p,l.point*.26,l.charge>.02?.08+.3*u:0),l.charge>.02&&(x=Math.max(x,.2+.35*u),w=Math.max(w,u))}h=Math.max(h,Qe*(.7+.3*oe)),p=Math.max(p,Qe*(.04+.18*oe)),ie&&(h=Math.max(h,.92),p=Math.max(p,it&&!v0?.68:.45),A0&&(p=Math.max(p,.58+.18*w),x=Math.max(x,.45+.4*w))),t-I0<.5&&(p=Math.max(p,Bn*.9),x=Math.max(x,bn)),yt=Ve(yt,Math.min(1,h),h>yt?2.5:.7,n),At=Ve(At,p,p>At?2.2:1.8,n),wt=Ve(wt,x,x>wt?2.2:1.3,n),Be*=Math.exp(-n/.075),_t*=Math.exp(-n/.22),x0*=Math.exp(-n/.14),Mt*=Math.exp(-n/.12);const y=V.audio;if(y){const m=Math.max(S[0].charge,S[1].charge);Yo.level=Math.min(.9,En*.8+(m>0?.2+m*.5:0)+Mt),Gn.level=Math.min(1,Math.max(m*.85,Qe*oe*.45,Math.max(S[0].beads,S[1].beads)*.12)),Gn.pitch=.7+Math.min(1.2,m)*1.5+oe*.6,Xo.level=Math.min(.5,Qe*oe*.25+Math.max(S[0].point,S[1].point)*.22+Be*.3),y.layer("crackle",Yo),y.layer("hum",Gn),y.layer("noise",Xo),g0>0&&t>=g0&&(y.impact({strength:.45+.4*Math.min(1,co),pitch:.42}),g0=-1)}},render(e){lo++,J=!!e.mobile,ce=e.width,Y=e.height,T=e.aspect,Ke=ce>=Y?Y:Math.min(Y,ce*1.3),St=J?.92:1,F0[0]=ce,F0[1]=Y,ve=Ue(e.quality??1,.2,1),bo=6/(.62+.38*ve)*(J?1.1:.85);{const l=V.source,u=l&&l.width,v=l&&l.height,g=u>0&&v>0?Math.max(ce/u,Y/v):1;Rn=Ue(.42*g,1,2.2)}J0=e.mask,qr=e.base,zr(e),Hr(e),pe=0,nt=0,$e=0;for(let l=0;l<Ct;l++){const u=O[l];if(!u.on||u.np<2)continue;let v=1;u.kind===Se?(u.a.t!==we&&(v*=S[u.a.h].fade),u.b.t!==we&&(v*=S[u.b.h].fade)):u.sid>=0&&S[u.sid].present&&(v*=S[u.sid].fade),Dr(u,v)}Ft=1,Tn=1,jt=pe;const t=.0034*Ke*St,n=5e-4*Ke*St,r=.0022*Ke;for(let l=0;l<st;l++){if(Ze[l]<0)continue;const u=1-Ze[l]/d0[l],v=p0[l]*Math.pow(u,.8);let g=Math.pow(u,1.3)*2.4*(.6+.4*p0[l]),R,f,k;m0[l]?(R=.6+.4*v,f=.72+.28*v,k=1):(R=1,f=.16+.84*Math.pow(v,1.6),k=.03+.85*Math.pow(v,3.2));const B=f0[l]/T*ce,E=h0[l]*Y;let F=at[l]*.012,b=Xe[l]*.012;const L=Math.hypot(F*ce/T,b*Y);if(L<r){const _=r/Math.max(L,.001);F*=_,b*=_}g*=Ue(L/(.006*Ke),.15,1),je[1]=je[2]=je[3]=1,W[1]=B-F/T*ce,K[1]=E-b*Y,kt[1]=0,W[2]=B-F/T*ce*.3,K[2]=E-b*Y*.3,kt[2]=.55,W[3]=B,K[3]=E,kt[3]=1,Oo(3,n,t,g,R,f,k,2)}for(let l=0;l<2;l++){const u=S[l],v=N[l];if(!v||!u.present)continue;const g=u.fade,R=v.size*Y*.068*St;if(u.beads>.03||u.point>.03){let f=0,k=0,B=0;for(let E=0;E<5;E++){const F=tt[E],b=E===1,L=(u.beads*(.8+.6*u.flick[E])*(ie?E===0?0:.4:1)+(b?u.point*1.8:0))*g;if(L<.02)continue;const _=v.points[F*3],I=v.points[F*3+1];let j=(_-v.points[(F-1)*3])*ce,Z=(I-v.points[(F-1)*3+1])*Y;const q=Math.hypot(j,Z)||1;j/=q,Z/=q;const Pe=R*(b?1+.5*u.point:1),R0=(Math.atan2(Z,j)/ge+1)%1;j0(_*ce+j*Pe*.7,I*Y+Z*Pe*.7,Pe,3.2,L,0,(l*5+E)*2+R0*.999,0),f+=_*T*L,k+=I*L,B+=L}if(B>0){const E=v.points,F=u.z+.08*v.size,b=B*1.1*v.size*v.size,L=v.size*.14,_=E[24]*T-T*.5,I=E[25]-.5,j=E[60]*T-T*.5,Z=E[61]-.5;Hn(_,I,F,j,Z,F,L,.74,.78,1,b*.8),b0(E[12]*T,E[13],F,L,.74,.78,1,b*.2)}}if(u.pinch>.25){const f=v.pinchPoint[0],k=v.pinchPoint[1],B=ye((u.pinch-.25)/.5)*1.5*(.7+.6*A())*g;j0(f*ce,k*Y,R*1.15,3,B,1,l*3.1,0),b0(f*T,k,u.z+.03,v.size*.35,.8,.88,1,B*.25*(.5+v.size*3))}if(u.ballR>.004&&u.ballE>.01){const f=Math.min(1.25,u.charge),k=.85+.3*A();Ft=.5,b0(u.bx,u.by,u.z+.04,Math.max(.04,u.ballR*.8),.7,.66,1,(.08+1.6*f*f)*k*g*u.ballE),Ft=1}}if(Be>.02)for(let l=ln;l<Ct;l++){const u=O[l];if(!u.on||u.a.t!==a0)continue;const v=N[u.a.h],g=S[u.a.h];if(v){j0(g.bx/T*ce,g.by*Y,v.size*Y*.42,2.5,Be*.7,3,0,0),Ft=.35,b0(g.bx,g.by,g.z+.04,.09,.82,.85,1,Be*4),Ft=1;break}}const o=J?4+6*ve:6+(mt-6)*ve,a=Math.min(Math.ceil(o),$e),i=U.mode==="nolight"||U.mode==="raw";for(let l=0;l<a;l++){let u=l;for(let g=l+1;g<$e;g++)Re[g]>Re[u]&&(u=g);if(u!==l){let g;g=Ht[l],Ht[l]=Ht[u],Ht[u]=g,g=Ut[l],Ut[l]=Ut[u],Ut[u]=g,g=Vt[l],Vt[l]=Vt[u],Vt[u]=g,g=Nt[l],Nt[l]=Nt[u],Nt[u]=g,g=Ot[l],Ot[l]=Ot[u],Ot[u]=g,g=It[l],It[l]=It[u],It[u]=g,g=qt[l],qt[l]=qt[u],qt[u]=g,g=Bt[l],Bt[l]=Bt[u],Bt[u]=g,g=bt[l],bt[l]=bt[u],bt[u]=g,g=Et[l],Et[l]=Et[u],Et[u]=g,g=Re[l],Re[l]=Re[u],Re[u]=g,g=Gt[l],Gt[l]=Gt[u],Gt[u]=g,g=Wt[l],Wt[l]=Wt[u],Wt[u]=g}const v=Re[l]*rr*Math.min(1,o-l);Je[l*4]=Ht[l],Je[l*4+1]=Ut[l],Je[l*4+2]=Vt[l],Je[l*4+3]=qt[l],ct[l*4]=Nt[l],ct[l*4+1]=Ot[l],ct[l*4+2]=It[l],ct[l*4+3]=Wt[l],Kt[l*4]=Bt[l]*v,Kt[l*4+1]=bt[l]*v,Kt[l*4+2]=Et[l]*v,Kt[l*4+3]=(Bt[l]+bt[l]+Et[l])*v/3*Gt[l]}let s=0;for(let l=0;l<$e;l++)s+=Re[l];const d=i?0:Math.min(.045,s*rr*.06),h=i?0:Be,p=d+h*.2;X.uWallRoom=p>1e-4?(d*(1-.75*wt)+h*.1)/p:1,pe>0&&(c.bindBuffer(c.ARRAY_BUFFER,hn),c.bufferSubData(c.ARRAY_BUFFER,0,me,0,pe*ot)),nt>0&&(c.bindBuffer(c.ARRAY_BUFFER,pn),c.bufferSubData(c.ARRAY_BUFFER,0,Ne,0,nt*L0)),c.bindBuffer(c.ARRAY_BUFFER,null);for(let l=0;l<2;l++){const u=N[l],v=l*4;T0[v]=u?u.palm[0]:0,T0[v+1]=u?u.palm[1]:0,T0[v+2]=u?u.size*2.1:1,T0[v+3]=u&&O0?1:0}Rt(0),Nr(e)&&(Or(e),Ir(e)),Rt(1),Ur(),Rt(2),l0&&(ae.read.clear(0,0,0,1),ae.write.clear(0,0,0,1),l0=!1),e0.uPrev=ae.read,e0.uEnergy=Me,e0.uK=Math.exp(-(e.dt||1/60)/.11),e0.uTexel[0]=1/ae.width,e0.uTexel[1]=1/ae.height,C.pass($.decay,ae.write,e0),ae.swap();const x=e.normals();pt.uNormals=x,pt.uHand=se,pt.uAspect=T,pt.uHasHand=ht&&!U.noHandLight?1:0,pt.uNL=i?0:a,pt.uView=U.mode==="vnormal"?3:U.mode==="vdepth"?4:0,pt.uShadows=J?ve>.5?4:2:Math.round(2+4*ve),Rt(3),C.pass($.light,Ie,pt),Rt(4),X.uBase=e.base,X.uAlpha=Q.read,X.uNormals=x,X.uAfter=ae.read,X.uLight=Ie,X.uHand=se,X.uEnergy=Me,X.uAfterTexel[0]=1/ae.width,X.uAfterTexel[1]=1/ae.height,X.uAspect=T,X.uTime=en,X.uHasHand=ht&&!U.noHandComp?1:0;const w=U.mode==="raw"?0:At;X.uAmbient=1-w,X.uRoom[0]=p*.88,X.uRoom[1]=p*.92,X.uRoom[2]=p,X.uAfterGain=U.mode==="raw"?0:.32,X.uHaze=U.mode==="raw"?0:.0016*ye((ve-.3)/.3);for(let l=0;l<2;l++){const u=S[l],v=l*4,g=u.present&&U.mode!=="raw"?ye(u.ballE*1.4)*u.fade*ye(u.ballR/.02):0;S0[v]=u.bx/T,S0[v+1]=u.by,S0[v+2]=Math.max(.001,u.ballR),S0[v+3]=g*(.6+.4*Math.min(1,u.charge))}X.uView=U.mode==="vlight"||U.mode==="vnormal"||U.mode==="vdepth"?1:U.mode==="vhand"?2:U.mode==="virr"?5:U.mode==="vmm"?6:U.mode==="venergy"?7:U.mode==="vbase"?8:U.mode==="vwall"?9:U.mode==="vlp"?10:U.mode==="vhs"?11:0,C.pass($.comp,e.scene,X),Rt(5),Vr(e.scene),Rt(6);const y=e.post;if(y.bloom=.1+.04*yt+.06*Be,y.exposure=1+.12*Be,y.flash=Be*.02,y.aberration=8e-4*yt+.006*x0,_t>.01){const l=_t*.006;y.shake[0]=(A()*2-1)*l,y.shake[1]=(A()*2-1)*l}const m=Math.max(S[0].charge,S[1].charge);if(m>.6){const l=(m-.6)*.0012;y.shake[0]+=(A()*2-1)*l,y.shake[1]+=(A()*2-1)*l}y.vignette=.35,y.grain=.03},reset(){No(),wn=-9,Mn=!1,te=!1,ne=0},dispose(){_e&&(c.deleteSync(_e),_e=null),rt&&(c.deleteBuffer(rt),rt=null),c.deleteBuffer(hn),c.deleteBuffer(pn),c.deleteBuffer(vn),c.deleteVertexArray(z0),c.deleteVertexArray(dn),c.deleteVertexArray(mn),c.deleteVertexArray(no),ae?.dispose(),xt?.dispose(),Ie?.dispose(),se?.dispose(),Me?.dispose(),Te?.dispose(),qe?.dispose(),Q?.dispose(),ae=xt=Ie=se=Me=Te=qe=Q=null;for(const e in $)$[e].dispose()}};return er&&(Object.defineProperty(Lt,"stats",{get(){let e=0;for(const t of O)t.on&&e++;return{storm:yt,dim:At,wallDim:wt,flash:Be,bolts:e,sparks:st,edges:ne,verts:pe,sprites:nt,lights:$e,attract:ie,twoG:oe,charge:[S[0].charge,S[1].charge],fade:[S[0].fade,S[1].fade],beads:[S[0].beads,S[1].beads],body:[S[0].body,S[1].body],handOn:ht,quality:ve}}}),Lt.debugBolts=()=>{const e=[];for(const t of O)if(t.on){const n=xe(t.a,D),r=D[0],o=D[1],a=xe(t.b,P);e.push({i:t.i,st:t.stype,kind:t.kind,np:t.np,nl:t.nl,A:n?[+(r/T).toFixed(3),+o.toFixed(3)]:null,B:a?[+(P[0]/T).toFixed(3),+P[1].toFixed(3)]:null,e:+t.energy.toFixed(2),strike:t.strike})}return e},Lt.debugSet=e=>{Object.assign(U,e),dt=!0},Lt.debugProf=()=>Ko.map(e=>{const t=[...e].sort((n,r)=>n-r);return t.length?+t[t.length>>1].toFixed(3):null}),Lt.debugTargets=()=>({handT:se,lightT:Ie,gf:Te,gfb:qe,am:Q,energyT:Me,CAP:fe,handOn:ht}),Lt.debugLights=()=>{const e=[];for(let t=0;t<Math.min(16,$e);t++)e.push({a:[Je[t*4],Je[t*4+1],Je[t*4+2]].map(n=>+n.toFixed(3)),b:[ct[t*4],ct[t*4+1],ct[t*4+2]].map(n=>+n.toFixed(3)),soft:+Je[t*4+3].toFixed(3),c:+Kt[t*4+2].toFixed(4)});return e}),Lt}export{va as createEffect};
