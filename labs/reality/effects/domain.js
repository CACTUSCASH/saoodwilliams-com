/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-6f6216d48820 */(()=>{const U=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(U)||U.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as re,COMMON as $e}from"../engine/glsl.js?v=515dba1803";const z=(U,l,t)=>Math.min(t,Math.max(l,U)),G=(U,l,t)=>{const le=z((t-U)/(l-U),0,1);return le*le*(3-2*le)},lo=Math.PI*2,co=24,pt=16,Ut=.72,uo=.4,no=.3,io=.8/60,No=[.35,.45,.5,.55,.6],Qe=2.5,se=re+`precision highp sampler3D;
`+$e,Ht=`float skinKey(vec3 base){
  vec3 g=toGamma(base);
  float cb=-0.1687*g.r-0.3313*g.g+0.5*g.b, cr=0.5*g.r-0.4187*g.g-0.0813*g.b;
  return smoothstep(0.012,0.045,cr)*(1.0-smoothstep(0.0,0.035,cb))*smoothstep(0.03,0.09,luma(g));
}`,_t=`uniform vec4 uHandP[21]; uniform vec4 uHandR; uniform vec2 uHandC; uniform vec4 uHandBox[2]; uniform vec4 uArm[2];
const int BA[16]=int[16](0,1,2,3, 5,6,7, 9,10,11, 13,14,15, 17,18,19);
const int BB[16]=int[16](1,2,3,4, 6,7,8, 10,11,12, 14,15,16, 18,19,20);
float segD(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.0,1.0);return length(pa-ba*h);}
// colour difference used by every key: chroma counts more than luma, so soft shadows and exposure drift stay
// "background"; kv() maps a colour into that space (for projections), keyDist() is the distance in it
vec4 kv(vec3 g){ float l=dot(g,vec3(0.3333)); return vec4((g-l)*1.7,l*0.6); }
float keyDist(vec3 g,vec3 plate){
  vec3 d=g-plate; float l=dot(d,vec3(0.3333));
  return length(d-l)*1.7+abs(l)*0.6;
}
float triSD(vec2 p,vec2 p0,vec2 p1,vec2 p2){
  vec2 e0=p1-p0,e1=p2-p1,e2=p0-p2,v0=p-p0,v1=p-p1,v2=p-p2;
  vec2 q0=v0-e0*clamp(dot(v0,e0)/max(dot(e0,e0),1e-8),0.0,1.0);
  vec2 q1=v1-e1*clamp(dot(v1,e1)/max(dot(e1,e1),1e-8),0.0,1.0);
  vec2 q2=v2-e2*clamp(dot(v2,e2)/max(dot(e2,e2),1e-8),0.0,1.0);
  float s=sign(e0.x*e2.y-e0.y*e2.x);
  vec2 d=min(min(vec2(dot(q0,q0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(q1,q1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(q2,q2),s*(v2.x*e2.y-v2.y*e2.x)));
  return -sqrt(d.x)*sign(d.y);
}
vec2 hpt(int i,int k){vec4 v=uHandP[i];return (k==0?v.xy:v.zw)*vec2(uAspect,1.0);}
// x core, y outer band of the fingers + palm, z outer band of the forearm, w zone
vec4 handHull(vec2 uv,int k){
  vec4 bx=uHandBox[k];
  if(uv.x<bx.x||uv.y<bx.y||uv.x>bx.z||uv.y>bx.w) return vec4(0.0);
  float sz=k==0?uHandR.x:uHandR.y;
  vec2 p=uv*vec2(uAspect,1.0);
  float core=0.0,outer=0.0,dmin=9.0;
  for(int i=0;i<16;i++){
    float d=segD(p,hpt(BA[i],k),hpt(BB[i],k));
    // core capsules as wide as real fingers (the core is no longer colour-blind: pixels that plainly show the wall
    // are dropped from it in the compose, so a generous core cannot paint the wall)
    float rc=sz*(i<4?0.125:0.105), ro=sz*(i<4?0.21:0.18);
    core=max(core,smoothstep(rc,rc*0.7,d));
    outer=max(outer,smoothstep(ro,ro*0.55,d));
    dmin=min(dmin,d);
  }
  vec2 w=hpt(0,k),i5=hpt(5,k),p17=hpt(17,k),t2=hpt(2,k);
  float s1=triSD(p,w,i5,p17), s2=triSD(p,w,t2,i5);
  // the whole palm: the wrist-knuckle triangle grown out to the palm's real outline (ulnar edge, finger webs)
  core=max(core,1.0-smoothstep(sz*0.07,sz*0.13,s1));
  core=max(core,1.0-smoothstep(-sz*0.02,sz*0.03,s2));
  float sp=min(s1,s2+sz*0.04);
  outer=max(outer,1.0-smoothstep(sz*0.1,sz*0.24,sp));
  float zone=max(smoothstep(sz*0.42,sz*0.28,dmin),1.0-smoothstep(sz*0.22,sz*0.36,sp));
  vec4 arm=uArm[k];
  vec2 aw=arm.xy*vec2(uAspect,1.0), ae=arm.zw*vec2(uAspect,1.0);
  float da=segD(p,aw,ae);
  float outA=smoothstep(sz*0.48,sz*0.3,da);
  core=max(core,smoothstep(sz*0.24,sz*0.17,segD(p,aw,mix(aw,ae,0.11))));
  zone=max(zone,smoothstep(sz*0.58,sz*0.46,da));
  return vec4(core,outer,outA,zone);
}
// both hands; sz = palm size and hc = palm centre (aspect-scaled) of the hand whose zone dominates here
vec4 handsHullS(vec2 uv,out float sz,out vec2 hc){
  vec4 h=vec4(0.0); sz=0.1; hc=vec2(-9.0);
  if(uHandR.z>0.004){ h=handHull(uv,0)*vec4(uHandC.x,1.0,1.0,1.0)*uHandR.z; sz=uHandR.x; hc=mix(hpt(0,0),hpt(9,0),0.55); }
  if(uHandR.w>0.004){ vec4 h1=handHull(uv,1)*vec4(uHandC.y,1.0,1.0,1.0)*uHandR.w; if(h1.w>h.w){ sz=uHandR.y; hc=mix(hpt(0,1),hpt(9,1),0.55); } h=max(h,h1); }
  return h;
}
vec4 handsHull(vec2 uv){ float sz; vec2 hc; return handsHullS(uv,sz,hc); }
${Ht}`,fo=`uniform vec4 uPT; uniform float uPSh;
vec2 personUv(vec2 uv){
  float km=uPT.y; if(km<1e-4) return vec2(uv.x,uv.y+uPSh);
  float a=uPT.z,b=uPT.w,t=uv.y;
  float w=clamp((t-a)/(b-a),0.0,1.0);
  float F=(b-a)*(w*w*w-0.5*w*w*w*w)+max(t-b,0.0);
  float k=1.0+km*w*w*(3.0-2.0*w);
  return vec2(uPT.x+(uv.x-uPT.x)*k,t+km*F+uPSh);
}`,Io=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uPlate;uniform sampler2D uMask;uniform sampler2D uRoom;uniform vec2 uTexel;uniform float uAspect;
uniform sampler2D uEnvB;uniform float uEnvH;uniform float uEnvOk;
${_t}
vec3 pullMip(sampler2D t,vec2 uv,float L,vec3 fb){
vec4 c4=textureLod(t,uv,L+1.0);
vec3 c=c4.a>1e-4?c4.rgb/c4.a:fb;
for(int i=1;i<5;i++){
vec4 ci=textureLod(t,uv,max(L+1.0-float(i)*1.2,0.0));
c=mix(c,ci.rgb/max(ci.a,1e-4),smoothstep(0.03+0.02*float(i),0.25+0.05*float(i),ci.a));
}
return c;
}
void main(){
vec2 m=vec2(0.0);
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)m=max(m,texture(uMask,vUv+vec2(i,j)*uTexel*2.5).ra);
vec3 b=texture(uBase,vUv).rgb;
float hsz;vec2 hcen;vec4 hh=handsHullS(vUv,hsz,hcen);
vec4 room=texture(uRoom,vUv);
float rk=smoothstep(0.3,0.8,room.a);
vec3 pl=mix(texture(uPlate,vUv).rgb,toLinear(room.rgb),rk);
float fgK=smoothstep(0.035,0.11,keyDist(toGamma(b),room.rgb));
float mh=max(hh.x,max(hh.y,hh.z)*mix(skinKey(b),fgK,rk));
float k=max(max(smoothstep(0.02,0.32,m.x),smoothstep(0.12,0.3,m.y)),smoothstep(0.0,0.3,mh));
if(hh.w>0.001&&uEnvOk>0.5){
vec3 wa=pullMip(uEnvB,vUv,log2(max(hsz*uEnvH,1.0)),toGamma(pl));
vec3 plG=toGamma(pl);
plG=mix(wa,plG,1.0-smoothstep(0.08,0.2,keyDist(plG,wa)));
float wallM=(1.0-smoothstep(0.03,0.08,keyDist(toGamma(b),mix(wa,room.rgb,rk))))*(1.0-skinKey(b));
float z=smoothstep(0.0,0.3,hh.w);
k=max(k,z*(1.0-wallM));
pl=mix(pl,toLinear(plG),z);
}
outColor=vec4(toGamma(mix(b,pl,k)),1.0);
}`,Oo=re+`
out vec4 outColor;uniform sampler2D uMask;
void main(){
float m=0.0,s=0.0;
for(int j=0;j<16;j++)for(int i=0;i<16;i++){float v=texture(uMask,(vec2(i,j)+0.5)/16.0).r;m=max(m,v);s+=v;}
outColor=vec4(smoothstep(0.5,0.8,m)*smoothstep(1.0,4.0,s),0.0,0.0,1.0);
}`,Xo=re+`
out vec4 outColor;uniform sampler2D uMask;
void main(){
bool left=gl_FragCoord.x<1.0;
float top=0.0;
for(int j=0;j<48;j++){
float y=(float(j)+0.5)/48.0;
float m=max(texture(uMask,vec2(left?0.004:0.996,y)).r,texture(uMask,vec2(left?0.018:0.982,y)).r);
if(m>0.4)top=y+0.5/48.0;
}
outColor=vec4(top,0.0,0.0,1.0);
}`,qo=se+`
in vec2 vUv;out vec4 outColor;uniform float uAspect;
${_t}
void main(){vec4 h=handsHull(vUv);outColor=vec4(h.x,max(h.y,h.z),h.w,1.0);}`,Vo=se+`
in vec2 vUv;layout(location=0)out vec4 oB;layout(location=1)out vec4 oS;layout(location=2)out vec4 oN;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uHandM;uniform vec2 uTexel;
${Ht}
void main(){
float m0=texture(uMask,vUv).r,m=m0;
m=max(m,texture(uMask,vUv+vec2(uTexel.x,0.0)*2.5).r);m=max(m,texture(uMask,vUv-vec2(uTexel.x,0.0)*2.5).r);
m=max(m,texture(uMask,vUv+vec2(0.0,uTexel.y)*2.5).r);m=max(m,texture(uMask,vUv-vec2(0.0,uTexel.y)*2.5).r);
vec3 hm=texture(uHandM,vUv).rgb;
vec3 g=toGamma(texture(uBase,vUv).rgb);
float n=1.0-smoothstep(0.0,0.12,hm.b);
float w=(1.0-smoothstep(0.06,0.3,m))*n*(1.0-0.9*skinKey(texture(uBase,vUv).rgb));
float k=smoothstep(0.55,0.95,hm.r)*(0.12+0.88*skinKey(texture(uBase,vUv).rgb));
oB=vec4(g*w,w);oS=vec4(g*k,k);oN=vec4(n,smoothstep(0.3,0.7,m0)*n,0.0,1.0);
}`,Ko=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uMask;uniform sampler2D uRoom;uniform sampler2D uBase;uniform sampler2D uPrev;uniform sampler2D uHandM;
uniform sampler2D uMemC;uniform vec2 uTexel;uniform float uAspect;uniform float uDt;uniform float uOn;
float keyDist(vec3 g,vec3 plate){vec3 d=g-plate;float l=dot(d,vec3(0.3333));return length(d-l)*1.7+abs(l)*0.6;}
float bodyAt(vec2 q,out float v){v=1.0-smoothstep(0.1,0.5,texture(uHandM,q).b);return texture(uMask,q).r*v;}
void main(){
float m0=texture(uMask,vUv).r;
vec4 prev=texture(uPrev,vUv);
float streak=m0<0.15?min(1.0,prev.b+uDt/1.2):0.0;
float learn=1.0-smoothstep(0.02,0.15,texture(uHandM,vUv).b);
float m=m0,enc=0.0,held=0.0;
if(uOn>0.5){
vec3 g=toGamma(texture(uBase,vUv).rgb);
if(m0<=0.97){
float hits=0.0,nv=0.0;
for(int i=0;i<8;i++){
float an=float(i)*0.7853982+0.3927;
vec2 d=vec2(cos(an)/uAspect,sin(an));
float v0,v1,v2;
float h=max(bodyAt(vUv+d*0.04,v0),max(bodyAt(vUv+d*0.085,v1),bodyAt(vUv+d*0.13,v2)));
hits+=smoothstep(0.35,0.65,h);nv+=smoothstep(0.3,0.7,max(v0,max(v1,v2)));
}
enc=smoothstep(0.8,0.95,hits/max(nv,1.0))*smoothstep(3.5,5.5,nv);
}
if(learn<0.999){
float best=9.0;
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)best=min(best,keyDist(g,texture(uMemC,vUv+vec2(i,j)*uTexel*2.0).rgb));
held=prev.a*(1.0-learn)*(1.0-smoothstep(0.06,0.14,best));
}
vec4 room=texture(uRoom,vUv);
float wall=smoothstep(0.5,0.9,room.a)*(1.0-smoothstep(0.04,0.1,keyDist(g,room.rgb)));
enc=max(enc,held);
m=max(m0,enc*(1.0-wall));
}
outColor=vec4(m,enc,streak,max(prev.a-uDt/mix(6.0,0.5,learn),m*learn));
}`,Go=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uHandM;uniform sampler2D uPrev;uniform float uReset;
void main(){
float learn=1.0-smoothstep(0.02,0.15,texture(uHandM,vUv).b);
vec3 cam=toGamma(texture(uBase,vUv).rgb);
vec3 prev=uReset>0.5?cam:texture(uPrev,vUv).rgb;
outColor=vec4(mix(prev,cam,learn),1.0);
}`,jo=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uPrev;uniform vec2 uTexel;uniform float uAspect;
uniform float uReset;uniform float uLearn;uniform float uLive;uniform sampler2D uAny;uniform sampler2D uFill;uniform sampler2D uHandM;
${Ht}
void main(){
float m=0.0;
for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)m=max(m,texture(uMask,vUv+vec2(i,j)*uTexel*3.0).r);
float hz=texture(uHandM,vUv).b;
vec4 fl=texture(uFill,vUv);
float clear=(1.0-smoothstep(0.04,0.3,m))*(1.0-smoothstep(0.0,0.25,hz))*uLearn*texture(uAny,vec2(0.5)).r;
clear*=1.0-fl.g*(1.0-step(0.999,fl.b));
clear*=uLive>0.5?smoothstep(0.25,0.45,fl.b)*(1.0-smoothstep(0.1,0.3,fl.a)):1.0;
clear*=1.0-smoothstep(0.15,0.55,skinKey(texture(uBase,vUv).rgb));
vec4 prev=uReset>0.5?vec4(0.0):texture(uPrev,vUv);
vec3 cam=toGamma(texture(uBase,vUv).rgb);
float rate=prev.a<0.5?0.45:0.12;
vec3 c=mix(prev.rgb,cam,clear*max(rate,1.0-smoothstep(0.0,0.3,prev.a)));
float covered=smoothstep(0.3,0.6,m)*(1.0-smoothstep(0.0,0.2,hz));
float conf=max(prev.a*mix(0.9995,0.996,covered),prev.a+(1.0-prev.a)*clear*rate);
outColor=vec4(c,conf);
}`,Yo=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler3D uNoise;
uniform float uAspect;uniform float uTime;uniform float uER;uniform float uIntensity;uniform float uFlare;
uniform vec2 uE;uniform vec2 uCam;uniform int uSlices;uniform float uPxW;uniform float uFilK;
float nz(vec3 p){return texture(uNoise,p).r;}
float fbm(vec3 p,int oct){float s=0.0,a=0.5,n=0.0;for(int i=0;i<4;i++){if(i>=oct)break;s+=a*nz(p);n+=a;p=p*2.03+vec3(0.31,0.17,0.59);a*=0.5;}return s/n;}
vec2 fbm2(vec3 p){
vec2 s=vec2(0.0);float a=0.5;
for(int i=0;i<4;i++){vec2 t=texture(uNoise,p).rg;s+=t*vec2(a,a*(0.35+0.5*float(i)));p=p*2.03+vec3(0.31,0.17,0.59);a*=0.5;}
return s/vec2(0.9375,0.6719);
}
vec3 palette(float h){
vec3 a=vec3(0.03,0.22,0.62),b=vec3(0.30,0.10,0.80),c=vec3(0.78,0.12,0.62),d=vec3(1.0,0.55,0.28),e=vec3(0.02,0.55,0.70);
vec3 col=mix(e,a,smoothstep(0.22,0.4,h));
col=mix(col,b,smoothstep(0.42,0.58,h));
col=mix(col,c,smoothstep(0.62,0.78,h)*0.8);
col=mix(col,d,smoothstep(0.84,0.95,h)*0.6);
return col;
}
vec3 corona(vec2 rp,float r,float disc){
float x=max(r-uER,0.0);
float ang=atan(rp.y,rp.x);
vec3 q=vec3(cos(ang)*3.1,sin(ang)*3.1,x*1.6-uTime*0.012);
float st=fbm(q,3);st=smoothstep(0.45,0.8,st);
float st2=nz(vec3(cos(ang)*9.0,sin(ang)*9.0,x*3.0+uTime*0.02));
float asym=1.0+0.22*cos(ang-0.75);
vec3 c=vec3(0.62,0.74,1.0)*exp(-x/(uER*0.075))*2.6
+vec3(0.42,0.36,1.0)*exp(-x/(uER*0.34))*0.55
+vec3(0.55,0.6,1.0)*st*(0.5+st2)*exp(-x/(uER*0.6))*1.1
+vec3(0.30,0.20,0.85)*exp(-x/(uER*1.4))*0.10;
return c*asym*(1.0-disc)*(1.0+uFlare*2.5);
}
void main(){
vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
vec2 rp=p-uE;float r=length(rp);
float disc=smoothstep(uER+uPxW*2.0,uER-uPxW*2.0,r);
const float ZE=6.0;
vec3 col=vec3(0.0);float T=1.0,TE=1.0;bool passed=false;
float W=8.0/float(uSlices);
float xr=(r-uER)/max(uER,0.05);
float ringL=1.0/(1.0+xr*xr*9.0);
float outer=r>uER?1.0/(1.0+xr*xr*1.2):0.0;
float ill0=0.035+1.6*ringL+0.45*outer*outer;
vec2 rdir=r>1e-4?rp/r:vec2(0.0,1.0);
float thE=uER*0.92;
vec2 pl=uE+rdir*(r-thE*thE/max(r,1e-3));
for(int i=0;i<12;i++){
if(i>=uSlices)break;
float fi=(float(i)+0.5)/float(uSlices);
float z=1.4+fi*fi*10.0;
if(z>ZE && !passed){passed=true;TE=T;col+=T*corona(rp,r,disc);T*=1.0-disc;}
vec2 X=(z>ZE?pl:p)*z+uCam*(z-1.0);
vec3 q=vec3(X*0.068,fi*0.41+uTime*0.0022);
vec2 w=texture(uNoise,q*0.47+vec3(0.0,0.0,uTime*0.0013)).rg-0.5;
q.xy+=w*0.16;
vec2 fb=fbm2(q);
float d=(fb.x-0.5)*2.3+0.5;
float rn=1.0-abs(nz(q*1.4+vec3(1.3,4.1,2.2))*2.0-1.0);
float fil=pow(rn,3.5)*smoothstep(0.4,0.8,d);
float rn2=1.0-abs(nz(q*3.3+vec3(5.1,0.7,3.9))*2.0-1.0);
fil+=pow(rn2,7.0)*smoothstep(0.42,0.85,d)*uFilK*(1.0-fi*0.6);
float gas=smoothstep(0.5,1.0,d)*0.85+fil*0.9;
float dust=smoothstep(0.52,0.82,(fb.y-0.5)*3.1+0.5);
float hue=nz(q*0.29+vec3(7.0,2.0,1.0));
hue=(hue-0.5)*2.2+0.5;
vec3 em=palette(hue);
float core=smoothstep(0.75,1.1,d);
em=mix(em,vec3(0.85,0.85,1.0),core*0.35);
float ill=ill0*(0.55+0.9*exp(-abs(z-ZE)*0.3));
if(z<ZE)ill*=mix(1.0,0.04+0.6*pow(ringL,4.0),disc);
col+=T*em*gas*gas*ill*0.62*W;
T*=exp(-(dust*2.2+gas*0.22)*W*0.55);
}
if(!passed){TE=T;col+=T*corona(rp,r,disc);T*=1.0-disc;}
col+=T*vec3(0.0015,0.002,0.008);
outColor=vec4(col*uIntensity,TE);
}`,Wo=re+$e+`
layout(location=0)in vec3 aLocal;
layout(location=1)in vec3 aNormal;
layout(location=2)in vec2 aCenter;
layout(location=3)in vec2 aUv;
layout(location=4)in vec4 aInfo;
layout(location=5)in vec2 aExtra;
uniform float uTau;uniform float uTauPrev;uniform float uVelK;uniform float uAspect;uniform float uDelayK;
uniform float uOpen;uniform float uContract;uniform vec2 uImpact;uniform vec2 uDrift;
uniform vec4 uHF[2];uniform vec4 uHFP[2];uniform float uForce;uniform float uForceP;uniform vec2 uFwd;
out vec3 vWorld;out vec3 vN;out vec2 vUv;out vec4 vInfo;out vec2 vRest;out float vS;out vec2 vVel;out float vZ;out vec2 vLoc;
mat3 rotAxis(vec3 a,float ang){
float c=cos(ang),s=sin(ang),t=1.0-c;
return mat3(t*a.x*a.x+c,t*a.x*a.y+s*a.z,t*a.x*a.z-s*a.y,
t*a.x*a.y-s*a.z,t*a.y*a.y+c,t*a.y*a.z+s*a.x,
t*a.x*a.z+s*a.y,t*a.y*a.z-s*a.x,t*a.z*a.z+c);
}
void pose(float tau,out mat3 R,out vec3 T,out float s){
vec3 h=hash33(vec3(aInfo.x*113.1,aExtra.y*71.7,5.3));
vec3 h2=hash33(h*41.3+1.7);
s=max(0.0,tau-aInfo.y*uDelayK);
vec2 cen=aCenter+uDrift;
vec2 dir=cen-uImpact;float dl=length(dir);
dir=dl>1e-4?dir/dl:vec2(1.0,0.0);
float burst=(1.0-exp(-s*3.6))/2.0;
bool fwd=h.x<uFwd.x&&aExtra.x<0.006&&dl>uFwd.y;
vec3 off=vec3(0.0);
float lat=mix(0.16,0.7,h.y)*(0.45+0.7*dl);
off.xy=dir*lat*burst+(h2.xy-0.5)*0.07*s;
bool floater=!fwd&&h2.x<0.3;
if(fwd){
off.z=-(0.42+0.5*h.z)*s;
off.xy+=dir*(0.45+0.5*h2.z)*s;
}else if(floater){
float sat=1.0-exp(-s*0.7);
off.z=mix(0.3,1.7,h.z)*sat;
off.xy+=dir*0.06*s/(1.0+s*0.15)+vec2(sin(s*0.31+h.x*6.0),cos(s*0.27+h.y*6.0))*0.05*sat;
}else{
float zv=mix(0.10,0.62,h.z),za=mix(0.03,0.40,h2.z);
off.z=zv*s+za*s*s;
off.y-=0.025*s*s*h2.x;
}
off.xy+=-dir*uContract*min(dl,1.0)*0.010+dir*uOpen*0.0018*(0.4+h.y);
vec3 tang=vec3(-dir.y,dir.x,0.0);
vec3 axis=normalize(-tang*0.85+(h2-0.5)*vec3(1.0,1.0,0.6));
float w=mix(0.9,3.4,h.y);
float ang=w*burst*1.7+mix(0.08,0.6,h2.y)*s+uOpen*0.012*(h.z-0.5);
if(fwd)ang*=1.7;
if(floater)ang=w*burst*1.2+mix(0.12,0.35,h2.y)*s;
R=rotAxis(axis,ang);
T=vec3(cen+off.xy,1.0+off.z);
}
vec4 project(vec3 P){const float n=0.05,f=80.0;return vec4(P.x/(0.5*uAspect),P.y/0.5,(P.z*(f+n)-2.0*f*n)/(f-n),P.z);}
void handPush(vec4 h0,vec4 h1,float k,inout mat3 R,inout vec3 T){
float reach=k*(1.0-smoothstep(2.4,3.6,T.z))*smoothstep(0.3,0.55,T.z);
if(reach<1e-4)return;
vec2 sp=T.xy/T.z,tot=vec2(0.0);float fa=0.0;
for(int i=0;i<2;i++){
vec4 h=i==0?h0:h1;
if(h.w<1e-4)continue;
vec2 d=sp-h.xy;
float f=h.w*exp(-dot(d,d)/(h.z*h.z));
tot+=d*f*1.15;fa+=f;
}
T.xy+=tot*T.z*reach;
float tl=length(tot);
if(tl>1e-5){vec2 dn=tot/tl;R=rotAxis(vec3(-dn.y,dn.x,0.0),fa*reach*0.9)*R;}
}
void main(){
mat3 R;vec3 T;float s;
pose(uTau,R,T,s);
handPush(uHF[0],uHF[1],uForce,R,T);
vec3 P=R*aLocal+T;
mat3 Rp;vec3 Tp;float sp;
pose(uTauPrev,Rp,Tp,sp);
handPush(uHFP[0],uHFP[1],uForceP,Rp,Tp);
vec3 Pp=Rp*aLocal+Tp;
vec4 c=project(P),cp=project(Pp);
vVel=(c.xy/max(c.w,0.04)-cp.xy/max(cp.w,0.04))*0.5*uVelK;
vRest=aCenter+uDrift+aLocal.xy;
vWorld=P;vN=R*aNormal;vUv=vec2(vRest.x/uAspect+0.5,vRest.y+0.5);vInfo=aInfo;vS=s;vZ=P.z;vLoc=aLocal.xy;
gl_Position=c;
}`,Zo=se+`
const float PZ=${Ut.toFixed(3)};
in vec3 vWorld;in vec3 vN;in vec2 vUv;in vec4 vInfo;in vec2 vRest;in float vS;in vec2 vVel;in float vZ;in vec2 vLoc;
uniform sampler2D uFrozen;uniform sampler2D uVoid;uniform sampler3D uNoise;
uniform vec2 uRes;uniform float uCrackR;uniform float uCrackGlow;uniform float uDesat;uniform float uHeat;
uniform float uPxW;uniform float uFlashL;uniform float uLightI;uniform float uMoving;uniform float uCrackVis;
uniform vec3 uLightPos;uniform vec3 uTint;uniform vec2 uImpact;
layout(location=0)out vec4 oColor;layout(location=1)out vec4 oAux;
vec3 envRefl(vec3 R){
float a=pow(saturate(dot(R,normalize(vec3(-0.55,0.45,-0.7)))),3.0);
float b=pow(saturate(dot(R,normalize(vec3(0.62,-0.3,-0.72)))),4.0);
float k=saturate(dot(R,normalize(vec3(0.15,0.85,-0.5))));
float k2=saturate(dot(R,normalize(vec3(-0.72,-0.25,-0.65))));
float d=pow(saturate(dot(R,normalize(vec3(-0.2,-0.9,-0.4)))),4.0);
return vec3(0.72,0.22,0.95)*a*1.2+vec3(0.08,0.62,0.95)*b*1.3
+vec3(1.0,0.97,0.95)*(pow(k,50.0)*7.0+pow(k,700.0)*36.0)
+vec3(0.7,0.82,1.0)*(pow(k2,90.0)*4.0+pow(k2,900.0)*18.0)+vec3(0.05,0.08,0.3)*d;
}
void main(){
float aa=max(fwidth(vInfo.w),1e-6);
float rw=max(length(fwidth(vRest)),1e-6);
float nearA=smoothstep(0.1,0.34,vZ);
if(nearA<0.35)discard;
float a=smoothstep(0.35,1.0,nearA)*(1.0-smoothstep(9.0,22.0,vZ));
float kind=vInfo.z,edge=vInfo.w;
vec2 suv=gl_FragCoord.xy/uRes;
vec3 N=normalize(vN);
vec2 rof=N.xy*0.028*smoothstep(0.0,0.3,vS);
vec3 tex=toLinear(vec3(texture(uFrozen,vUv+rof*0.85).r,texture(uFrozen,vUv+rof).g,texture(uFrozen,vUv+rof*1.15).b));
tex=mix(tex,vec3(luma(tex)),uDesat);
vec3 V=normalize(-vWorld);
float ndv=saturate(dot(N,V));
float fres=0.04+0.96*pow(1.0-ndv,5.0);
vec3 Rf=reflect(-V,N);
vec3 L=normalize(uLightPos-vWorld);
float spec=pow(saturate(dot(N,normalize(L+V))),90.0)*step(0.0,dot(N,L))*uLightI;
vec3 Lf=vec3(uImpact*0.7,0.7)-vWorld;float dlf=length(Lf);Lf/=max(dlf,1e-4);
float diffF=saturate(dot(N,Lf))*uFlashL/(1.0+dlf*dlf*2.5);
float specF=pow(saturate(dot(N,normalize(Lf+V))),70.0)*uFlashL;
float moved=smoothstep(0.0,0.3,vS);
float face=saturate(-N.z);
float imgK=mix(1.0,exp(-vS*0.5)*(0.3+0.7*smoothstep(0.3,0.95,face)),moved);
float behind=smoothstep(PZ-0.05,PZ+0.05,vZ);
float clear=(1.0-behind)*moved;
vec3 Lr=normalize(vec3(-0.45,0.55,-0.7));
float relit=mix(1.0,(0.3+0.7*pow(saturate(dot(N,Lr))/0.7,1.4))*(0.82+0.3*fract(vInfo.x*5.17)),smoothstep(0.0,0.1,vS));
vec3 envR=envRefl(Rf)*moved;
vec2 sp=vUv*vec2(1.7,1.0);
envR*=0.9+0.2*texture(uNoise,vec3(sp*1.2,vInfo.x)).r;
float ph=dot(N,vec3(1.3,0.8,0.35))*2.2+vInfo.x*6.0;
float band=exp(-pow(fract(dot(sp,vec2(0.8,0.6))*2.2+ph)-0.5,2.0)*55.0);
envR+=vec3(0.8,0.85,1.0)*band*(0.15+0.75*pow(1.0-ndv,2.0))*moved*0.5;
vec3 trans=vec3(0.0);
if(uMoving>0.5&&behind>0.0){
vec2 ro=N.xy*0.045;
trans=vec3(texture(uVoid,clamp(suv-ro*0.9,0.0,1.0)).r,texture(uVoid,clamp(suv-ro,0.0,1.0)).g,texture(uVoid,clamp(suv-ro*1.1,0.0,1.0)).b)*behind;
}
float cover=1.0;
vec3 glassT=vec3(0.84,0.92,1.0);
float epx=edge/aa;
if(kind<1.5)a*=mix(1.0,smoothstep(0.0,1.3,epx),moved);
vec3 col;
if(kind<0.5){
vec3 back=trans*glassT;
col=tex*imgK*relit;
col+=(tex*(back*1.7+uTint*0.012)+back*(1.0-fres)*0.28)*(1.0-imgK);
float body=exp(-epx/9.0)*moved;
col=col*(1.0-0.5*body)+vec3(0.04,0.1,0.09)*body*(0.4+uLightI);
vec2 lc=normalize(uLightPos.xy-vWorld.xy+1e-4);
col*=1.0+0.22*moved*clamp(dot(vLoc,lc)*6.0,-1.0,1.0);
cover=mix(1.0,imgK+(1.0-imgK)*(0.1+0.55*fres),clear);
col+=envR*(0.07+0.93*fres)*(0.4+0.6*(1.0-imgK*0.7));
col+=uTint*diffF*(tex*0.3+0.025)+vec3(0.9,0.92,1.0)*specF*2.2*smoothstep(0.0,0.1,vS);
col+=vec3(0.85,0.9,1.0)*spec*6.0;
float rimG=exp(-epx/1.2)*moved*uLightI;
col+=vec3(0.78,0.86,1.0)*rimG*(0.5+2.2*pow(1.0-ndv,1.5)+2.6*saturate(dot(N,-L)))*(0.6+0.8*fract(vInfo.x*7.31));
}else if(kind<1.5){
vec3 back=trans*glassT;
col=tex*imgK*0.3*relit+tex*back*(1.0-imgK)+back*(1.0-fres)*(0.35+0.4*imgK)+envR*(0.1+0.9*fres)+vec3(0.85,0.9,1.0)*spec*8.0+uTint*diffF*0.15;
cover=mix(1.0,imgK*0.3+0.1+0.55*fres,clear);
}else{
float rim=pow(1.0-ndv,2.0);
vec3 disp=0.5+0.5*cos(6.2831*(vec3(0.0,0.33,0.67)+ndv*1.7+vInfo.x));
col=trans*1.5+tex*0.12*imgK+envR*0.7+mix(vec3(0.9,0.95,1.0),disp,0.4)*(spec*12.0+rim*0.8+0.18*uLightI)+uTint*diffF*0.8;
col+=uTint*uHeat*exp(-vS*1.6)*2.2;
}
float restD=length(vRest-uImpact);
vec2 nA=texture(uNoise,vec3(vRest*0.45,0.13)).rg-0.5;
float wob=nA.x*0.14+(fract(vInfo.x*13.7)-0.5)*0.22;
float reveal=smoothstep(0.0,0.05,uCrackR-restD+wob);
float along=(texture(uNoise,vec3(vRest*2.4,vInfo.x)).r-0.5)*3.2;
float lineVar=0.35+0.65*smoothstep(-0.4,0.6,along)+0.8*pow(saturate(along),6.0);
vec2 nJ=texture(uNoise,vec3(vRest*8.7,0.61)).rg-0.5;
float jag=nJ.x*2.6+nJ.y*1.6;
float epj=max(epx+jag*(1.0-moved),0.0);
float line=1.0-smoothstep(0.45,1.7,epj);
float halo=exp(-epj/7.0);
float hair=0.0;
if(kind<0.5&&uCrackR>0.0&&moved<1.0&&epx<26.0&&uCrackR-restD>-0.1){
vec2 g=vRest*55.0;vec2 ci=floor(g),cf=fract(g);
float f1=8.0,f2=8.0;
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
vec2 o=vec2(i,j);vec2 rp=o+hash22(ci+o)-cf;float dd=dot(rp,rp);
if(dd<f1){f2=f1;f1=dd;}else if(dd<f2)f2=dd;
}
float px2=(sqrt(f2)-sqrt(f1))/55.0/(rw*0.75);
hair=(1.0-smoothstep(0.3,1.1,px2))*exp(-epx/7.0)*smoothstep(0.15,0.4,along)*(1.0-moved);
}
float heat=reveal*uCrackGlow+uHeat*exp(-vS*1.5);
float seam=0.0;
if(kind<0.5){
float rv=reveal*(1.0-moved)*uCrackVis;
col*=1.0-(line*0.8+hair*0.35)*rv;
vec3 lc=mix(uTint,vec3(0.95,0.93,1.0),0.6);
float leak=lineVar*lineVar*uCrackVis;
vec3 em=(lc*line*3.2*leak+uTint*halo*0.28*leak+lc*hair*0.5*leak)*heat;
col+=em;
seam=(line*1.2*leak+halo*0.2*leak)*heat;
}
float fog=1.0-exp(-max(vZ-1.0,0.0)*0.13);
if(fog>0.002){
vec3 vb=texture(uVoid,suv).rgb;
col=mix(col,vb*0.9+uTint*0.006,fog*0.8);
a*=1.0-fog*0.55;
}
oColor=vec4(col*a,a*cover);
oAux=vec4(vVel,vZ,seam*a);
}`,$o=re+$e+`
uniform float uTau;uniform float uAspect;uniform vec2 uImpact;uniform float uDelayK;uniform vec2 uHalf;uniform float uPxScale;
out vec3 vCol;
vec4 project(vec3 P){const float n=0.05,f=80.0;return vec4(P.x/(0.5*uAspect),P.y/0.5,(P.z*(f+n)-2.0*f*n)/(f-n),P.z);}
void main(){
float id=float(gl_VertexID);
vec3 h=hash33(vec3(id*0.1373,id*0.7117,1.31));
vec3 h2=hash33(h*97.13+vec3(3.7,1.1,8.2));
vec2 pos=mix(-uHalf,uHalf,h.xy);
if(h.z<0.4){float a=h2.x*6.2831;float r=pow(h2.y,1.6)*0.6;pos=uImpact+vec2(cos(a),sin(a))*r;}
vec2 dir=pos-uImpact;float dl=length(dir);dir=dl>1e-4?dir/dl:vec2(1.0,0.0);
float s=max(0.0,uTau-dl*uDelayK-0.02);
float burst=(1.0-exp(-s*2.0))/2.0;
vec3 P=vec3(pos+dir*(0.25+0.6*h2.z)*burst*(0.6+dl)+(h2.xy-0.5)*0.08*s,1.0+(h2.z-0.35)*1.2*burst+0.1*s*s*h.x);
float life=smoothstep(0.0,0.04,s)*exp(-s*0.45);
float tw=pow(0.5+0.5*sin(h2.x*61.0+s*(5.0+12.0*h.y)),22.0);
vCol=mix(vec3(0.62,0.74,1.0),vec3(1.0,0.92,0.98),h2.y)*(0.18+5.5*tw)*life;
vec4 c=project(P);
if(s<=0.0||life<0.003||P.z<0.15){gl_Position=vec4(2.0,2.0,2.0,1.0);gl_PointSize=1.0;return;}
gl_Position=c;
gl_PointSize=clamp(uPxScale*(1.0+1.6*h.y)/P.z,1.0,7.0);
}`,Qo=re+`
in vec3 vCol;layout(location=0)out vec4 oColor;
void main(){vec2 d=gl_PointCoord-0.5;float g=exp(-dot(d,d)*14.0);oColor=vec4(vCol*g,0.0);}`,Jo=re+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;
void main(){
vec4 s=vec4(0.0);
for(int j=0;j<4;j++)for(int i=0;i<4;i++)s+=texture(uSrc,vUv+(vec2(i,j)-1.5)*uTexel*2.0);
outColor=s/16.0;
}`,ea=re+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;uniform int uN;uniform float uStride;
void main(){
vec2 best=vec2(0.0);float bl=0.0;
float c=float(uN-1)*0.5;
for(int j=0;j<8;j++){
if(j>=uN)break;
for(int i=0;i<8;i++){
if(i>=uN)break;
vec2 v=texture(uSrc,vUv+(vec2(i,j)-c)*uTexel*uStride).xy;
float l=dot(v,v);if(l>bl){bl=l;best=v;}
}
}
outColor=vec4(best,0.0,1.0);
}`,ta=re+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;
void main(){
vec2 best=vec2(0.0);float bl=0.0;
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
vec2 v=texture(uSrc,vUv+vec2(i,j)*uTexel).xy;
float l=dot(v,v);if(l>bl){bl=l;best=v;}
}
outColor=vec4(best,0.0,1.0);
}`,oa=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uVoid;uniform sampler2D uMask;uniform sampler2D uShard;uniform sampler2D uAux;
uniform float uAspect;uniform float uER;uniform float uDom;uniform float uCrack;uniform float uShards;uniform vec2 uE;uniform vec3 uTint;
${fo}
void main(){
vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
vec2 pu=personUv(vUv);
float m=(pu.x<0.0||pu.x>1.0||pu.y<0.0||pu.y>1.0)?0.0:texture(uMask,pu).r;
float sa=uShards>0.5?texture(uShard,vUv).a:0.0;
float em=uShards>0.5?texture(uAux,vUv).w:0.0;
vec3 src=vec3(0.0);
if(uDom>0.0){
vec4 v=texture(uVoid,vUv);
float r=length(p-uE);float x=r-uER;
float ang=atan(p.y-uE.y,p.x-uE.x);
float asym=1.0+0.22*cos(ang-0.75);
src=vec3(0.8,0.88,1.0)*(exp(-max(x,0.0)/(uER*0.045))*2.4+exp(-max(x,0.0)/(uER*0.25))*0.35)*step(0.0,x)*v.a*asym;
src*=uDom*(1.0-sa);
}
src+=uTint*em*uCrack;
src*=1.0-smoothstep(0.25,0.7,m);
outColor=vec4(src,1.0);
}`,aa=re+$e+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uCenter;uniform float uDensity;uniform float uDecay;uniform float uWeight;uniform int uSamples;uniform float uFrame;
void main(){
vec2 d=(vUv-uCenter)*uDensity/float(uSamples);
float j=ign(gl_FragCoord.xy,uFrame);
vec2 uv=vUv-d*j;
vec3 acc=vec3(0.0);float il=1.0;
for(int i=0;i<48;i++){if(i>=uSamples)break;acc+=texture(uSrc,uv).rgb*il;il*=uDecay;uv-=d;}
outColor=vec4(acc*uWeight,1.0);
}`,ra=se+`
in vec2 vUv;layout(location=0)out vec4 oC;layout(location=1)out vec4 oF;
uniform sampler2D uShard;uniform sampler2D uAux;uniform sampler2D uTile;
uniform vec2 uRes;uniform float uBlurMax;uniform float uFrame;
const float PZ=${Ut.toFixed(3)},HZ=${uo.toFixed(3)};
void shardLayer(vec2 uvr,out vec4 sc,out float fP,out float fH){
vec4 c0=texture(uShard,uvr);vec4 a0=texture(uAux,uvr);
sc=c0;fP=step(a0.z,PZ);fH=step(a0.z,HZ);
float j=ign(gl_FragCoord.xy,uFrame);
vec2 vm=texture(uTile,uvr).xy*uRes;
float L=length(vm);
if(L<2.5)return;
int M=int(clamp(ceil(min(L,uBlurMax)*0.5/2.2),3.0,float(BLUR_SIDE)));
vec2 dir=vm/L;
vec2 vX=a0.xy*uRes;float vx=length(vX);
float own=smoothstep(0.25,0.75,c0.a)*smoothstep(0.5,2.0,vx);
if(own>0.0){vec2 dd=mix(dir,vX/max(vx,1e-4),own);float dn=length(dd);dir=dn>1e-4?dd/dn:dir;L=mix(L,max(vx,L*0.5),own);}
float hl=min(L,uBlurMax)*0.5;
float dl=max(hl/float(M),0.35);
vx=min(vx,uBlurMax);
float wc=min(1.0,dl/max(vx,1e-3));
float kc=1.0/(1.0+luma(c0.rgb/max(c0.a,0.02))*0.4);
vec3 accC=c0.rgb*wc*kc;float accK=c0.a*wc*kc,cov=c0.a*wc;
float aP=c0.a*wc*fP,aH=c0.a*wc*fH;
vec2 du=dir/uRes;
for(int k=1;k<=BLUR_SIDE;k++){
if(k>M)break;
float d=(float(k)-0.5+j)*dl;
for(int sgn=0;sgn<2;sgn++){
vec2 q=uvr+du*(sgn==0?d:-d);
vec4 c=texture(uShard,q);
if(c.a<0.004)continue;
vec4 ax=texture(uAux,q);
vec2 vy=ax.xy*uRes;
float ly=min(length(vy),uBlurMax);
float ry=0.5*min(abs(dot(vy,dir)),uBlurMax);
float w=clamp((ry+0.5*dl-d)/dl,0.0,1.0)*dl/max(ly*abs(dot(normalize(vy+1e-6),dir)),dl);
float kk=1.0/(1.0+luma(c.rgb/max(c.a,0.02))*0.4);
accC+=c.rgb*w*kk;accK+=c.a*w*kk;cov+=c.a*w;
aP+=c.a*w*step(ax.z,PZ);aH+=c.a*w*step(ax.z,HZ);
}
}
float A=min(cov,1.0);
sc=vec4(accC/max(accK,1e-5)*A,A);
fP=cov>1e-4?aP/cov:fP;fH=cov>1e-4?aH/cov:fH;
}
void main(){vec4 sc;float fP,fH;shardLayer(vUv,sc,fP,fH);oC=sc;oF=vec4(fP,fH,smoothstep(2.5,8.0,length(texture(uTile,vUv).xy*uRes)),1.0);}`,sa=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uNormals;
uniform sampler2D uVoid;uniform sampler2D uShard;uniform sampler2D uAux;uniform sampler2D uRays;uniform sampler2D uFrozen;
uniform vec2 uRes;uniform float uAspect;uniform float uTime;uniform float uFrame;
uniform float uDom;uniform float uDesat;uniform float uShards;uniform float uBlur;uniform float uER;uniform float uWarp;uniform float uZoom;
uniform float uRaysK;uniform float uStarK;uniform float uPxW;uniform float uDebug;uniform vec2 uMaskTexel;uniform vec2 uNTexel;
${fo}uniform float uRecede;
uniform sampler2D uVoidLow;uniform sampler3D uNoise;uniform sampler2D uBlurC;uniform sampler2D uBlurF;uniform sampler2D uRoom;
uniform sampler2D uEnvB;uniform sampler2D uEnvS;uniform sampler2D uEnvN;uniform float uEnvH;uniform vec2 uVoidRes;uniform float uWrapK;
${_t}
uniform vec2 uE;uniform vec2 uCam;uniform vec4 uSeed;uniform vec4 uShock;uniform vec3 uTint;
const float PZ=${Ut.toFixed(3)},HZ=${uo.toFixed(3)};
vec3 stars(vec2 p){
vec3 acc=vec3(0.0);
for(int L=0;L<STAR_LAYERS;L++){
float fl=float(L);
float z=2.5+fl*2.6;
vec2 q=p+uCam*(1.0-1.0/z);
q=uE+(q-uE)/(1.0+uZoom*(0.35+fl*0.22));
vec2 lq=q-uE;float lr=length(lq);float thE=uER*0.92;
float kk=thE*thE/max(lr*lr,1e-4);
q=uE+lq*(1.0-kk);
float magT=1.0/max(abs(1.0-kk),0.06),magR=1.0/(1.0+kk);
float sc=24.0+fl*20.0;
vec2 g=q*sc;vec2 cell=floor(g);vec2 f=g-cell;
vec3 h=hash33(vec3(cell,fl*7.31+0.5));
if(h.z>0.36-fl*0.05)continue;
vec2 sp=0.15+0.7*h.xy;
vec2 dp=(f-sp)/sc;
vec2 rd=q-uE;float rl=length(rd);rd=rl>1e-4?rd/rl:vec2(1.0,0.0);
float along=dot(dp,rd)*magR,across=dot(dp,vec2(-rd.y,rd.x))*magT;
float sl=uWarp*rl*0.09*(0.6+fl*0.25);
along=along<0.0?max(-along-sl,0.0)*-1.0:along;
float d2=(along*along+across*across)/(uPxW*uPxW);
float b=0.35+45.0*pow(hash12(cell+11.0*fl+0.3),22.0);
float tw=0.72+0.28*sin(uTime*(1.3+3.0*h.x)+h.y*40.0);
float sig=0.5+0.45*min(b/12.0,1.0);
float gs=exp(-d2/(2.0*sig*sig));
vec3 c=mix(vec3(0.62,0.72,1.0),vec3(1.0,0.86,0.72),h.x*h.x);
acc+=c*b*gs*tw/(1.0+sl/uPxW*0.25)*min(magT*magR,3.0);
}
return acc;
}
vec3 texCR(sampler2D t,vec2 uv,vec2 res){
vec2 sp=uv*res,tc=floor(sp-0.5)+0.5,f=sp-tc;
vec2 w0=f*(-0.5+f*(1.0-0.5*f)),w1=1.0+f*f*(-2.5+1.5*f),w2=f*(0.5+f*(2.0-1.5*f)),w3=f*f*(-0.5+0.5*f);
vec2 w12=w1+w2,t12=(tc+w2/w12)/res,t0=(tc-1.0)/res,t3=(tc+2.0)/res;
vec3 c=texture(t,vec2(t12.x,t0.y)).rgb*(w12.x*w0.y)+texture(t,vec2(t0.x,t12.y)).rgb*(w0.x*w12.y)
+texture(t,t12).rgb*(w12.x*w12.y)+texture(t,vec2(t3.x,t12.y)).rgb*(w3.x*w12.y)+texture(t,vec2(t12.x,t3.y)).rgb*(w12.x*w3.y);
float ws=w12.x*w0.y+w0.x*w12.y+w12.x*w12.y+w3.x*w12.y+w12.x*w3.y;
return max(c/ws,0.0);
}
vec3 capChroma(vec3 c,vec3 ref,float k){
float lc=luma(c),lr=max(luma(ref),1e-4);
vec3 dc=c-lc;float cc=length(dc),cm=length(ref-luma(ref))/lr*lc*k+1e-5;
return cc>cm?lc+dc*(cm/cc):c;
}
vec3 pullMip(sampler2D t,vec2 uv,float L,vec3 fb){
vec4 c4=textureLod(t,uv,L+1.0);
vec3 c=c4.a>1e-4?c4.rgb/c4.a:fb;
for(int i=1;i<5;i++){
vec4 ci=textureLod(t,uv,max(L+1.0-float(i)*1.2,0.0));
c=mix(c,ci.rgb/max(ci.a,1e-4),smoothstep(0.03+0.02*float(i),0.25+0.05*float(i),ci.a));
}
return c;
}
void main(){
vec2 uv=vUv;
vec2 p=(uv-0.5)*vec2(uAspect,1.0);
vec2 sd=p-uShock.xy;float sl=length(sd);
float rr=(sl-uShock.z)/0.055;
float prof=exp(-rr*rr)*uShock.w;
vec2 sdir=sl>1e-4?sd/sl:vec2(0.0);
vec2 uvr=uv-sdir*prof*0.016*vec2(1.0/uAspect,1.0);
if(uSeed.z>0.001){
vec2 dd=(uv-uSeed.xy)*vec2(uAspect,1.0);float dl=length(dd)+1e-4;
float rs0=uSeed.w*0.9;
float xq=dl/rs0;
uvr-=dd/dl*vec2(1.0/uAspect,1.0)*uSeed.z*rs0*0.05*xq*exp(-xq*xq*1.5);
}
vec2 pr=(uvr-0.5)*vec2(uAspect,1.0);
bool rec=uPT.y>1e-4||uPSh>1e-5;
vec2 pu=personUv(uvr);
float fade=rec?smoothstep(0.0,0.03*uRecede+1e-4,1.0-pu.y):1.0;
vec3 base=texture(uBase,uvr).rgb;
vec3 baseP=rec?texture(uBase,pu).rgb:base;
float m0=texture(uMask,pu).r;
vec2 mt=uMaskTexel*1.25;
float mA=texture(uMask,pu+vec2(mt.x,0.0)).r,mB=texture(uMask,pu-vec2(mt.x,0.0)).r;
float mC=texture(uMask,pu+vec2(0.0,mt.y)).r,mE=texture(uMask,pu-vec2(0.0,mt.y)).r;
float mS=(m0*2.0+mA+mB+mC+mE)/6.0;
float mD=max(max(m0,max(mA,mB)),max(mC,mE));
float aSeg=smoothstep(0.42,0.92,mS);
vec4 sc=vec4(0.0);float fP=0.0,fH=0.0;
if(uShards>0.5){
vec4 a0=texture(uAux,uvr);
sc=texture(uShard,uvr);fP=step(a0.z,PZ);fH=step(a0.z,HZ);
if(uBlur>0.5){
vec3 bf=texture(uBlurF,uvr).xyz;float k=bf.z;
if(k>0.0){sc=mix(sc,texture(uBlurC,uvr),k);fP=mix(fP,bf.x,k);fH=mix(fH,bf.y,k);}
}
}
float hsz;vec2 hcen;vec4 hh=handsHullS(pu,hsz,hcen);
float aH=0.0,wz=0.0,rem=0.0,hConf=0.0,apD=0.0,hcD=0.0,onLD=0.0,bfD=1.0,knD=0.0,sepD=0.0;
vec3 gBh=vec3(0.0),gFh=vec3(0.0);
if(hh.w>0.001){
vec3 gC=toGamma(baseP);
float L=log2(max(hsz*uEnvH,1.0));
vec2 rt=uMaskTexel*0.75;
vec4 r0=texture(uRoom,pu+rt),r1=texture(uRoom,pu-rt),r2=texture(uRoom,pu+vec2(rt.x,-rt.y)),r3=texture(uRoom,pu+vec2(-rt.x,rt.y));
float ra=r0.a+r1.a+r2.a+r3.a;
vec4 room=vec4((r0.rgb*r0.a+r1.rgb*r1.a+r2.rgb*r2.a+r3.rgb*r3.a)/max(ra,1e-3),ra*0.25);
float rc=smoothstep(0.35,0.8,room.a)*(1.0-0.9*skinKey(toLinear(room.rgb)));
gBh=mix(pullMip(uEnvB,pu,L,gC),room.rgb,rc);
gFh=pullMip(uEnvS,pu,L-0.4,gC);
vec4 nn=textureLod(uEnvN,pu,L-0.4);
float bf=nn.r>0.03?nn.g/nn.r:1.0;
float known=max(rc,smoothstep(0.01,0.08,textureLod(uEnvB,pu,L+1.6).a));
vec2 pA=pu*vec2(uAspect,1.0),dv=pA-hcen;float dvl=length(dv);dv=dvl>1e-4?dv/dvl:vec2(0.0,1.0);
float pw=0.0,pb=0.0;
for(int i=0;i<6;i++){
vec2 q=clamp((pA+dv*hsz*(0.35+0.35*float(i)))/vec2(uAspect,1.0),vec2(0.002),vec2(0.998));
float k=1.0/(1.0+float(i)*0.45);
vec4 nq=textureLod(uEnvN,q,2.0);
pw+=nq.r*k;pb+=nq.g*k;
}
vec4 c4=textureLod(uEnvN,pu,L+1.5);float bp=c4.r>1e-3?c4.g/c4.r:bf;
for(int i=1;i<5;i++){vec4 ci=textureLod(uEnvN,pu,max(L+1.5-float(i),0.0));bp=mix(bp,ci.g/max(ci.r,1e-4),smoothstep(0.05,0.35,ci.r));}
float bodyDir=mix(bp,pb/max(pw,1e-3),smoothstep(0.05,0.5,pw));
wz=hh.w*(1.0-smoothstep(0.35,0.65,bodyDir))*known;
vec4 kC=kv(gC),kB=kv(gBh),FB=kv(gFh)-kB;
float fb2=max(dot(FB,FB),1e-5),sep=sqrt(fb2);
float ap0=clamp(dot(kC-kB,FB)/fb2,0.0,1.0);
float res=length(kC-kB-FB*ap0)/sep;
float ap=smoothstep(0.04,0.62,ap0);
float dC=keyDist(gC,gBh);
float dk=smoothstep(0.03,0.10,dC);
hConf=smoothstep(0.05,0.14,sep);
float sepK=smoothstep(0.025,0.06,sep);
float offL=smoothstep(0.35,0.8,res);
float fgC=mix(1.0,mix(ap,dk,offL),sepK);
rem=wz*(1.0-fgC)*(1.0-smoothstep(0.3,0.7,texture(uMask,pu).g));
float af=mix(dk,max(ap,dk*offL*smoothstep(0.6,1.0,hh.y)),hConf);
af=mix(max(aSeg,hh.x),af,sepK);
float hc=hh.x*(1.0-hConf*(1.0-dk)*(1.0-ap));
float armA=max(min(max(aSeg,hc),smoothstep(0.02,0.07,dC)),ap*(1.0-offL)*hConf*sepK);
aH=max(hc,max(hh.y*af,hh.z*armA));
apD=ap0;hcD=hc;onLD=1.0-offL;bfD=bodyDir;knD=known;sepD=sep;
}
if(uDebug>3.5&&uDebug<4.5){outColor=vec4(aH,rem,wz,1.0);return;}
if(uDebug>4.5&&uDebug<5.5){outColor=vec4(bfD,knD,sepD*4.0,1.0);return;}
if(uDebug>5.5&&uDebug<6.5){outColor=vec4(toLinear(gBh),1.0);return;}
if(uDebug>6.5&&uDebug<7.5){outColor=vec4(toLinear(gFh),1.0);return;}
float mBld=max(smoothstep(0.05,0.4,mD)*(1.0-rem),aH);
vec3 baseD=mix(base,vec3(luma(base)),uDesat*(1.0-0.8*mBld));
vec3 outc=baseD;
if(uShards>0.5&&uDom<0.999){
vec3 frozen=toLinear(texture(uFrozen,uvr).rgb);
frozen=mix(frozen,vec3(luma(frozen)),uDesat);
outc+=(sc.rgb-frozen*sc.a)*(1.0-mBld);
}
float mRays=max(m0*(1.0-rem),aH)*fade;
if(uDom>0.001){
vec4 nr0=texture(uNormals,pu);
float hgt=nr0.a;
vec2 nt=uNTexel*1.6;
vec2 gH=vec2(0.0);
if(hgt>0.004&&hgt<0.997)gH=vec2(texture(uNormals,pu+vec2(nt.x,0.0)).a-texture(uNormals,pu-vec2(nt.x,0.0)).a,
texture(uNormals,pu+vec2(0.0,nt.y)).a-texture(uNormals,pu-vec2(0.0,nt.y)).a);
vec2 gM=vec2(mA-mB,mC-mE);
float gl=length(gH),gml=length(gM);
vec2 dOut=gl>1e-5?-gH/gl:vec2(0.0);
if(gml>1e-4){vec2 dd=mix(dOut,-gM/gml,smoothstep(0.04,0.2,gml));float dl=length(dd);dOut=dl>1e-4?dd/dl:-gM/gml;}
bool hasDir=gl>1e-5||gml>1e-4;
float aM=aSeg;
float a=aM;vec3 Fin=baseP;vec3 Bg=toLinear(pullMip(uEnvB,pu,3.5,toGamma(baseP)));float conf=0.0;
float notHand=(1.0-hh.x)*(1.0-wz);
float band=max(smoothstep(0.13,0.28,hgt)*(1.0-smoothstep(0.66,0.86,hgt)),
smoothstep(0.04,0.3,mS)*(1.0-smoothstep(0.86,0.985,mS)))*notHand;
float hz=smoothstep(0.62,0.76,hgt)*(1.0-smoothstep(0.95,0.995,hgt))*notHand*(1.0-band)*(1.0-smoothstep(0.75,0.93,m0));
float hole=0.0,bwK=0.0;
float kp=uRes.y/1080.0;
if((band>0.001||hz>0.001)&&hasDir){
vec3 bs=vec3(0.0);float bw=0.0;
for(int i=0;i<4;i++){
float fi=float(i);
vec2 qb=pu+dOut*(3.0+fi*fi*2.2+fi*2.0)*kp*(1.0+hz)/uRes;
float inb=step(0.0,qb.x)*step(qb.x,1.0)*step(0.0,qb.y)*step(qb.y,1.0);
float wb=(1.0-smoothstep(0.02,0.25,texture(uMask,qb).r))*inb/(1.0+fi*0.5);
bs+=texture(uBase,qb).rgb*wb;bw+=wb;
}
if(bw>0.05)Bg=bs/bw;
vec3 gB=toGamma(Bg);
hole=hz*(1.0-smoothstep(0.03,0.065,length(toGamma(baseP)-gB)))*smoothstep(0.4,0.9,bw);
bwK=smoothstep(0.2,0.8,bw);
}
if(band>0.001&&hasDir){
vec3 gB=toGamma(Bg);
vec3 fs=vec3(0.0);float fw=0.0;
for(int i=0;i<4;i++){
float fi=float(i);
vec2 qf=pu-dOut*(4.0+fi*fi*3.0+fi*3.0)*kp/uRes;
vec3 c=texture(uBase,qf).rgb;
float wf=smoothstep(0.72,0.97,texture(uMask,qf).r)*smoothstep(0.05,0.22,length(toGamma(c)-gB))/(1.0+fi*0.4);
fs+=c*wf;fw+=wf;
}
if(fw>0.05)Fin=fs/fw;
vec3 FB=Fin-Bg;float fb2=max(dot(FB,FB),1e-5);
float acu=dot(baseP-Bg,FB)/fb2;
float ac=clamp(acu,0.0,1.0);
float res=length(baseP-Bg-FB*acu)/sqrt(fb2);
float sep=length(toGamma(Fin)-gB);
conf=smoothstep(0.07,0.22,sep)*(1.0-smoothstep(0.2,0.5,res))*smoothstep(0.2,0.7,fw)*bwK*band;
if(uDebug>2.5&&uDebug<3.5){outColor=vec4(smoothstep(0.07,0.22,sep),1.0-smoothstep(0.2,0.5,res),smoothstep(0.2,0.7,fw)*0.5+bwK*0.5,1.0);return;}
a=mix(aM,ac,conf);
}
a=max(a,(aM-0.15)*smoothstep(0.45,0.6,hgt));
float aB=min(a,1.0-hole);
float aBz=max(aB,smoothstep(0.3,0.75,mD)*hh.w);
a=max(aBz*(1.0-rem),aH)*fade;
float hk=max(wz,saturate((aH-aBz*(1.0-rem))/max(aH,0.05)));
if(uDebug>0.5&&uDebug<2.5){outColor=uDebug>1.5?vec4(aM,mS,hgt,1.0):vec4(a,conf,band,1.0);return;}
vec3 Fc=(baseP-(1.0-aB)*Bg)/max(aB,0.02);
Fc=clamp(Fc,vec3(0.0),max(baseP,Fin)*1.4+0.005);
Fc=capChroma(mix(Fin,Fc,smoothstep(0.15,0.65,aB)),Fin,1.08);
vec3 alb=mix(Fin,Fc,smoothstep(0.7,0.97,aB));
if(hh.w>0.001){
float aHc=mix(a,min(a,max(apD,hcD)),hConf);
vec3 Bl=toLinear(gBh),Fl=toLinear(gFh);
vec3 FcH=clamp((baseP-(1.0-aHc)*Bl)/max(aHc,0.02),min(baseP,Fl)*0.85,max(baseP,Fl)*1.15+0.004);
FcH=capChroma(mix(Fl,FcH,smoothstep(0.1,0.4,aHc)),Fl,1.1);
float wF=wz*onLD*(1.0-smoothstep(0.9,1.0,aHc));
Fc=mix(Fc,FcH,wF);alb=mix(alb,FcH,wF);
}
vec4 vt=texture(uVoid,uvr);
vec3 vcol=a<0.999||wz>0.001?texCR(uVoid,uvr,uVoidRes):vt.rgb;
vec2 qd=pr+uCam*0.6;
float d1=texture(uNoise,vec3(qd*1.9,uTime*0.004)).r,d2=texture(uNoise,vec3(qd*5.3+3.7,0.37+uTime*0.006)).g;
float det=(d1-0.5)*1.1+(d2-0.5)*0.7;
vcol*=max(0.0,0.85+det*0.8);
vec2 rp=pr-uE;float r=length(rp);float x=r-uER;
float disc=smoothstep(uPxW*1.5,-uPxW*1.5,x);
float ang=atan(rp.y,rp.x);
float asym=1.0+0.22*cos(ang-0.75);
vcol+=vec3(1.0,0.97,0.94)*exp(-max(x,0.0)/(uPxW*3.2+uER*0.004))*(1.0-disc)*16.0*asym*vt.a;
if(a<0.985&&(1.0-disc)*vt.a>0.01)vcol+=stars(pr)*(1.0-disc)*vt.a*uStarK;
vec3 n=normalize(nr0.rgb*2.0-1.0);
vec2 rdir=r>1e-4?rp/r:vec2(0.0,1.0);
vec2 ldir=r<uER?rdir:-rdir;
float rdist=abs(r-uER);
float rimMask=pow(saturate(1.0-n.z),1.3)*(1.0-hk);
float rimDir=saturate(dot(normalize(n.xy+1e-5),ldir)*0.85+0.15);
float rimEdge=rimMask*rimMask*sqrt(rimMask);
float nearRing=1.0/(1.0+rdist*rdist*12.0);
float rimI=(0.8+3.2*nearRing)*rimEdge*rimDir*smoothstep(0.72,0.97,a)*(1.0-aH*0.6);
vec3 envA=(texture(uVoidLow,vec2(0.12,0.8)).rgb+texture(uVoidLow,vec2(0.88,0.8)).rgb+texture(uVoidLow,vec2(0.18,0.3)).rgb+texture(uVoidLow,vec2(0.82,0.3)).rgb)*0.25;
vec2 qe=uvr+normalize(n.xy+1e-5)*vec2(1.0/uAspect,1.0)*0.22;
vec3 envD=(texture(uVoidLow,qe+vec2(0.035,0.0)).rgb+texture(uVoidLow,qe-vec2(0.035,0.0)).rgb+texture(uVoidLow,qe+vec2(0.0,0.06)).rgb+texture(uVoidLow,qe-vec2(0.0,0.06)).rgb)*0.25;
envA/=1.0+luma(envA)*0.6;envD/=1.0+luma(envD)*1.1;
float la=luma(alb);
vec3 albR=min(mix(alb,vec3(la),0.65),vec3(la*1.5+0.002));
float toward=saturate(dot(normalize(n.xy+1e-5),-rdir)*0.5+0.5)*(1.0-n.z*0.6);
vec3 grade=mix(vec3(0.64,0.68,0.84),vec3(0.78,0.81,0.94),toward);
vec3 person=Fc*grade+alb*envA*0.36+albR*envD*1.5*rimMask+vec3(0.8,0.88,1.0)*rimI*(0.03+albR*1.8);
vec2 sdp=(uvr-uSeed.xy)*vec2(uAspect,1.0);
vec3 Ls=vec3(-sdp,0.12);float dls=length(Ls);Ls/=dls;
person+=alb*uTint*saturate(dot(n,Ls))*uSeed.z*0.9/(1.0+dls*dls*40.0);
vec2 qo=uvr+dOut*16.0*kp/uRes;
vec4 vo=texture(uVoid,qo);
vec2 rpo=(qo-0.5)*vec2(uAspect,1.0)-uE;float xo=length(rpo)-uER;
vec3 limb=vec3(1.0,0.96,0.92)*exp(-max(xo,0.0)/(uER*0.06))*step(0.0,xo)*2.2*vo.a;
vec3 wl=mix(texture(uVoidLow,qo).rgb*1.3,vo.rgb,0.4)+limb;
vec2 rph=pr-uE;float xh=length(rph)-uER;
vec3 wlH=texture(uVoidLow,uvr).rgb*1.3+vec3(1.0,0.96,0.92)*exp(-max(xh,0.0)/(uER*0.06))*step(0.0,xh)*2.2*vt.a;
wl=mix(wl,wlH,hk);
float wrapB=hasDir?pow(1.0-smoothstep(0.5,1.0,hgt),3.0):0.0;
if(wrapB>0.01&&hh.w>0.001){vec4 ho=handsHull(personUv(qo));wrapB*=1.0-max(ho.x,max(ho.y,ho.z)*0.8);}
float wrapH=min(saturate(a*(1.0-a)*2.6),0.4);
float wrap=mix(wrapB,wrapH,hk)*a;
person+=wl*wrap/(1.0+luma(wl)*0.6)*0.3*uWrapK;
if(uDebug>7.5&&uDebug<8.5){outColor=vec4(wrap,rimI,(a<0.999?1.0:0.0),1.0);return;}
if(uDebug>8.5){outColor=vec4(Fc,1.0);return;}
float Ab=sc.a*(1.0-fP);
vec3 full=vcol*(1.0-Ab)+sc.rgb*(1.0-fP);
full=mix(full,person,a);
float aHand=max(aH,aBz*(1.0-rem)*smoothstep(0.2,0.6,hh.w));
float km=max(fP-fH,0.0)*(1.0-aHand);
full=full*(1.0-sc.a*km)+sc.rgb*km;
float kn=fH*(1.0-aHand*0.85);
full=full*(1.0-sc.a*kn)+sc.rgb*kn;
mRays=a;
outc=mix(outc,full,uDom);
}else if(uSeed.z>0.001){
vec3 n=normalize(texture(uNormals,pu).rgb*2.0-1.0);
vec2 sdp=(uvr-uSeed.xy)*vec2(uAspect,1.0);
vec3 Ls=vec3(-sdp,0.12);float dls=length(Ls);Ls/=dls;
outc+=baseD*uTint*saturate(dot(n,Ls))*uSeed.z*mRays*0.9/(1.0+dls*dls*40.0);
}
outc+=texture(uRays,uv).rgb*uRaysK*(1.0-(uDom>0.001?0.7:0.95)*mRays);
if(uSeed.z>0.001){
vec2 d=(uv-uSeed.xy)*vec2(uAspect,1.0);
float rs=uSeed.w;
float l2=dot(d,d);
float fl=0.85+0.15*sin(uTime*37.0)*sin(uTime*23.0+1.3);
float core=exp(-l2/(rs*rs*0.0009));
float glow=1.0/(1.0+l2/(rs*rs*0.02));
float halo2=exp(-l2/(rs*rs*0.35));
float streak=exp(-abs(d.y)/(rs*0.006))*exp(-abs(d.x)/(rs*0.3));
float veil=1.0-(uDom>0.001?0.3:0.65)*mRays;
outc+=(vec3(1.0,0.97,1.0)*core*mix(2.6,1.4,mRays)+(uTint*glow*0.3+uTint*halo2*0.1+vec3(0.7,0.75,1.0)*streak*0.3)*veil)*uSeed.z*fl;
}
outc*=1.0+prof*vec3(-0.12,0.05,0.22);
outColor=vec4(max(outc,0.0),1.0);
}`,la=re+$e+`
in vec2 vUv;out vec4 outColor;
uniform float uZ;uniform float uPeriod;
vec3 grad(vec3 i,float seed){vec3 h=hash33(mod(i,uPeriod)+vec3(seed*17.17,seed*3.1,seed*9.7));return normalize(h*2.0-1.0+1e-4);}
float pnoise(vec3 p,float seed){
vec3 i=floor(p),f=fract(p);
vec3 u=f*f*f*(f*(f*6.0-15.0)+10.0);
float n000=dot(grad(i,seed),f),n100=dot(grad(i+vec3(1,0,0),seed),f-vec3(1,0,0));
float n010=dot(grad(i+vec3(0,1,0),seed),f-vec3(0,1,0)),n110=dot(grad(i+vec3(1,1,0),seed),f-vec3(1,1,0));
float n001=dot(grad(i+vec3(0,0,1),seed),f-vec3(0,0,1)),n101=dot(grad(i+vec3(1,0,1),seed),f-vec3(1,0,1));
float n011=dot(grad(i+vec3(0,1,1),seed),f-vec3(0,1,1)),n111=dot(grad(i+vec3(1,1,1),seed),f-vec3(1,1,1));
return mix(mix(mix(n000,n100,u.x),mix(n010,n110,u.x),u.y),mix(mix(n001,n101,u.x),mix(n011,n111,u.x),u.y),u.z);
}
void main(){
vec3 p=vec3(vUv,uZ)*uPeriod;
outColor=vec4(pnoise(p,0.0)*0.95+0.5,pnoise(p,1.0)*0.95+0.5,0.0,1.0);
}`;function ca(U,l){const le=l.createTexture();l.bindTexture(l.TEXTURE_3D,le),l.texStorage3D(l.TEXTURE_3D,1,l.RG8,128,128,128),l.texParameteri(l.TEXTURE_3D,l.TEXTURE_MIN_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_3D,l.TEXTURE_MAG_FILTER,l.LINEAR);for(const J of[l.TEXTURE_WRAP_S,l.TEXTURE_WRAP_T,l.TEXTURE_WRAP_R])l.texParameteri(l.TEXTURE_3D,J,l.REPEAT);l.bindTexture(l.TEXTURE_3D,null);const Z=U.program(la,{label:"domain noise bake"}),Je=l.createFramebuffer();l.bindFramebuffer(l.FRAMEBUFFER,Je),l.viewport(0,0,128,128),l.disable(l.BLEND),Z.use();for(let J=0;J<128;J++)l.framebufferTextureLayer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0,le,0,J),Z.set({uZ:(J+.5)/128,uPeriod:16}),U.fullscreen();return l.bindFramebuffer(l.FRAMEBUFFER,null),l.deleteFramebuffer(Je),Z.dispose(),le}function na(U){const l=U.kit,t=U.gl,le=U.caps,Z=!!U.mobile,Je=le.hdr==="rgba16f"||le.hdr==="rgba32f",J=Z?260:440,mo=Z?2200:6500,vo=Z?5:8,ho=Z?4:5,Nt=Z?4:3,po=Z?6:12,xo=Z?34:48,xt=16,et=.3,tt=.26;let $=null,It=!1,ot=1;try{const o=new URLSearchParams(location.search);$=o.get("domainview"),It=o.has("domainprof")}catch{}const bt=It?t.getExtension("EXT_disjoint_timer_query_webgl2"):null,at={},rt=[];let st=null,Ot="";const ue=o=>{if(bt&&(st&&(t.endQuery(bt.TIME_ELAPSED_EXT),rt.push(st),st=null),o)){const s=t.createQuery();t.beginQuery(bt.TIME_ELAPSED_EXT,s),st={q:s,name:Ot+":"+o}}},bo=()=>{for(;rt.length&&t.getQueryParameter(rt[0].q,t.QUERY_RESULT_AVAILABLE);){const o=rt.shift(),s=t.getQueryParameter(o.q,t.QUERY_RESULT)/1e6;t.deleteQuery(o.q);const a=at[o.name]||(at[o.name]={n:0,sum:0,list:[]});a.n++,a.sum+=s,a.list.push(s),a.list.length>240&&a.list.shift()}},q={freeze:l.program(Io,{label:"domain freeze"}),room:l.program(jo,{label:"domain room plate"}),maskAny:l.program(Oo,{label:"domain mask probe"}),fill:l.program(Ko,{label:"domain matte fill"}),memc:l.program(Go,{label:"domain matte memory colour"}),handM:l.program(qo,{label:"domain hand hull"}),henv:l.program(Vo,{label:"domain hand surroundings"}),edge:l.program(Xo,{label:"domain edge probe"}),void:l.program(Yo,{label:"domain void"}),shard:l.program(Zo,{vs:Wo,label:"domain shards"}),glint:l.program(Qo,{vs:$o,label:"domain glints"}),tile:l.program(ea,{label:"domain tiles"}),box4:l.program(Jo,{label:"domain ambient"}),neigh:l.program(ta,{label:"domain tile neighbours"}),raySrc:l.program(oa,{label:"domain ray source"}),radial:l.program(aa,{label:"domain radial"}),blur:l.program(ra.replace(/BLUR_SIDE/g,String(po)),{label:"domain motion blur"}),compose:l.program(sa.replace("STAR_LAYERS",Z?"3":"4"),{label:"domain compose"})},r={frozen:l.target(4,4,{format:"rgba8"}),roomA:l.target(4,4,{format:"rgba8"}),roomB:l.target(4,4,{format:"rgba8"}),maskAny:l.target(1,1,{format:"rgba8",filter:"nearest"}),fillA:l.target(4,4,{format:"rgba8"}),handM:l.target(4,4,{format:"rgba8"}),fillB:l.target(4,4,{format:"rgba8"}),memA:l.target(4,4,{format:"rgba8"}),memB:l.target(4,4,{format:"rgba8"}),void:l.target(4,4,{format:"hdr"}),voidLow:l.target(4,4,{format:"hdr"}),shardColor:l.target(4,4,{format:"hdr"}),shardAux:l.target(4,4,{format:"hdr",filter:"nearest"}),tileA:l.target(4,4,{format:"hdr",filter:"nearest"}),tileB:l.target(4,4,{format:"hdr"}),blurC:l.target(4,4,{format:"hdr"}),blurF:l.target(4,4,{format:"rgba8"}),raysA:l.target(4,4,{format:"hdr"}),raysB:l.target(4,4,{format:"hdr"}),black:l.target(2,2,{format:"rgba8"}),envB:l.target(4,4,{format:"rgba8"}),envS:l.target(4,4,{format:"rgba8"}),envN:l.target(4,4,{format:"rgba8"}),edge:l.target(2,1,{format:"rgba8",filter:"nearest"}),hold:l.target(4,4,{format:"hdr"})};r.black.clear(0,0,0,0);const lt=ca(l,t),gt=t.createFramebuffer(),wt=[t.COLOR_ATTACHMENT0,t.COLOR_ATTACHMENT1,t.COLOR_ATTACHMENT2];let Xt=[null,null,null],qt=!1;function go(o,s){const a=[r.envB,r.envS,r.envN];for(const u of a)u.resize(o,s);a.every((u,n)=>u.tex===Xt[n])||(t.bindFramebuffer(t.FRAMEBUFFER,gt),a.forEach((u,n)=>{t.bindTexture(t.TEXTURE_2D,u.tex),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.framebufferTexture2D(t.FRAMEBUFFER,wt[n],t.TEXTURE_2D,u.tex,0),Xt[n]=u.tex}),t.bindTexture(t.TEXTURE_2D,null),t.drawBuffers(wt),qt=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE,t.bindFramebuffer(t.FRAMEBUFFER,null))}const ct=t.createBuffer();t.bindBuffer(t.PIXEL_PACK_BUFFER,ct),t.bufferData(t.PIXEL_PACK_BUFFER,8,t.STREAM_READ),t.bindBuffer(t.PIXEL_PACK_BUFFER,null);const yt=new Uint8Array(8);let me=null;const Vt=J*14*12,j=new Float32Array(Vt*pt),At=t.createBuffer(),kt=t.createVertexArray();t.bindVertexArray(kt),t.bindBuffer(t.ARRAY_BUFFER,At),t.bufferData(t.ARRAY_BUFFER,j.byteLength,t.DYNAMIC_DRAW);const wo=pt*4,Me=(o,s,a)=>{t.enableVertexAttribArray(o),t.vertexAttribPointer(o,s,t.FLOAT,!1,wo,a*4)};Me(0,3,0),Me(1,3,3),Me(2,2,6),Me(3,2,8),Me(4,4,10),Me(5,2,14),t.bindVertexArray(null),t.bindBuffer(t.ARRAY_BUFFER,null);const Kt=t.createVertexArray();let ut=0;const Rt=t.createFramebuffer(),Ft=t.createRenderbuffer();let Gt=0,jt=0,Et=!1,Yt=null,Wt=null;const He=[t.COLOR_ATTACHMENT0,t.COLOR_ATTACHMENT1],yo=[t.COLOR_ATTACHMENT0,t.NONE],Ao=new Float32Array([0,0,0,0]),ko=new Float32Array([0,0,100,0]),Ro=new Float32Array([1]);function Fo(o,s){r.shardColor.resize(o,s),r.shardAux.resize(o,s),!(Gt===o&&jt===s&&Yt===r.shardColor.tex&&Wt===r.shardAux.tex)&&(t.bindRenderbuffer(t.RENDERBUFFER,Ft),t.renderbufferStorage(t.RENDERBUFFER,t.DEPTH_COMPONENT24,o,s),t.bindRenderbuffer(t.RENDERBUFFER,null),t.bindFramebuffer(t.FRAMEBUFFER,Rt),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,r.shardColor.tex,0),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT1,t.TEXTURE_2D,r.shardAux.tex,0),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.RENDERBUFFER,Ft),t.drawBuffers(He),Et=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE,t.bindFramebuffer(t.FRAMEBUFFER,null),Gt=o,jt=s,Yt=r.shardColor.tex,Wt=r.shardAux.tex)}const Tt=t.createFramebuffer();let Zt=null,$t=null,Qt=!1;function Eo(o,s){r.blurC.resize(o,s),r.blurF.resize(o,s),!(Zt===r.blurC.tex&&$t===r.blurF.tex)&&(t.bindFramebuffer(t.FRAMEBUFFER,Tt),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,r.blurC.tex,0),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT1,t.TEXTURE_2D,r.blurF.tex,0),t.drawBuffers(He),Qt=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE,t.bindFramebuffer(t.FRAMEBUFFER,null),Zt=r.blurC.tex,$t=r.blurF.tex)}const ye=new Float64Array(J+4),Ae=new Float64Array(J+4);let ee=0;const To=new Float64Array(160),Mo=new Float64Array(160),ke=48,nt=new Int32Array(ke*ke),Jt=new Int32Array(J+4);let ne=1;const De=()=>{ne|=0,ne=ne+1831565813|0;let o=Math.imul(ne^ne>>>15,1|ne);return o=o+Math.imul(o^o>>>7,61|o)^o,((o^o>>>14)>>>0)/4294967296},T={valid:!1,ix:0,iy:0,u:.5,v:.5,aspect:0,at:0,count:0};function Do(o,s,a,u,n,f,c){const g=f-u,v=c-n,k=(u+f)*.5,P=(n+c)*.5;let R=0;for(let F=0;F<s&&R<76;F++){const p=o[2*F],m=o[2*F+1],S=F+1===s?0:F+1,A=o[2*S],V=o[2*S+1],w=(p-k)*g+(m-P)*v,L=(A-k)*g+(V-P)*v;if(w<=0&&(a[2*R]=p,a[2*R+1]=m,R++),w<=0!=L<=0){const M=w/(w-L);a[2*R]=p+(A-p)*M,a[2*R+1]=m+(V-m)*M,R++}}return R}function Be(o,s,a,u){ne=Math.floor(u*1e3)^5369127|0;const n=(o-.5)*a,f=s-.5,c=-a/2-et,g=a/2+et,v=-.5-et,k=.5+et,P=Math.max(Math.hypot(c-n,v-f),Math.hypot(g-n,v-f),Math.hypot(c-n,k-f),Math.hypot(g-n,k-f)),R=Z?205:360;let F=1.36,p=12,m=2.7;for(let A=0;A<8;A++){ee=0;const V=ne;ye[ee]=n,Ae[ee]=f,ee++;let w=.032,L=0,M=!1;for(;w<P+.12&&!M;){const y=Math.round(p+L*m),N=De()*lo;for(let x=0;x<y;x++){const H=N+(x+(De()-.5)*.7)*lo/y,_=w*(1+(De()-.5)*(F-1)*.9),d=n+Math.cos(H)*_,D=f+Math.sin(H)*_;if(!(d<c-.02||d>g+.02||D<v-.02||D>k+.02)){if(ee>=J){M=!0;break}ye[ee]=d,Ae[ee]=D,ee++}}w*=F*(.96+De()*.08),L++}if(!M&&ee<=R*1.25)break;ne=V,F*=1.06,m*=.88,p=Math.max(6,p-1)}const S=performance.now();Bo(n,f,a,c,g,v,k),e.genMs=performance.now()-S,e.driftX=e.driftY=0,T.valid=!0,T.ix=n,T.iy=f,T.u=o,T.v=s,T.aspect=a,T.at=u,T.count=ee}function Bo(o,s,a,u,n,f,c){const g=Math.max(.075,(n-u)/ke,(c-f)/ke),v=Math.min(ke,Math.ceil((n-u)/g)+1),k=Math.min(ke,Math.ceil((c-f)/g)+1);nt.fill(-1,0,v*k);const P=p=>z(Math.floor((p-u)/g),0,v-1),R=p=>z(Math.floor((p-f)/g),0,k-1);for(let p=0;p<ee;p++){const m=R(Ae[p])*v+P(ye[p]);Jt[p]=nt[m],nt[m]=p}let F=0;for(let p=0;p<ee;p++){let m=To,S=Mo;m[0]=u,m[1]=f,m[2]=n,m[3]=f,m[4]=n,m[5]=c,m[6]=u,m[7]=c;let A=4;const V=P(ye[p]),w=R(Ae[p]);for(let b=0;b<ke&&A>=3;b++){for(let E=w-b;E<=w+b;E++){if(E<0||E>=k)continue;const C=E===w-b||E===w+b;for(let I=V-b;I<=V+b;I+=C||b===0?1:2*b)if(!(I<0||I>=v)){for(let K=nt[E*v+I];K>=0;K=Jt[K]){if(K===p)continue;A=Do(m,A,S,ye[p],Ae[p],ye[K],Ae[K]);const ae=m;if(m=S,S=ae,A<3)break}if(A<3)break}if(A<3)break}let X=0;for(let E=0;E<A;E++)X=Math.max(X,Math.hypot(m[2*E]-ye[p],m[2*E+1]-Ae[p]));if(b*g>=2*X)break}if(A<3)continue;if(A>co&&(A=co),F+A*12>Vt)break;let L=0,M=0,y=0;for(let b=0;b<A;b++){const X=b+1===A?0:b+1,E=m[2*b],C=m[2*b+1],I=m[2*X],K=m[2*X+1],ae=E*K-I*C;L+=ae,M+=(E+I)*ae,y+=(C+K)*ae}const N=L*.5;if(N<2e-6)continue;M/=3*L,y/=3*L;const x=z(Math.sqrt(N)*.03,.004,.007),H=De(),_=De(),d=Math.hypot(M-o,y-s),D=(b,X,E,C,I,K,ae,Ge,Ce,ht)=>{const O=F*pt;j[O]=b,j[O+1]=X,j[O+2]=E,j[O+3]=C,j[O+4]=I,j[O+5]=K,j[O+6]=M,j[O+7]=y,j[O+8]=ae/a+.5,j[O+9]=Ge+.5,j[O+10]=H,j[O+11]=d,j[O+12]=Ce,j[O+13]=ht,j[O+14]=N,j[O+15]=_,F++};for(let b=0;b<A;b++){const X=b+1===A?0:b+1,E=m[2*b],C=m[2*b+1],I=m[2*X],K=m[2*X+1],ae=I-E,Ge=K-C,Ce=Math.hypot(ae,Ge);if(Ce<1e-7)continue;const ht=Math.abs((E-M)*Ge-(C-y)*ae)/Ce,O=Ge/Ce,Ue=-ae/Ce,je=E-M,Ye=C-y,We=I-M,Ze=K-y;D(0,0,0,0,0,-1,M,y,0,ht),D(je,Ye,0,0,0,-1,E,C,0,0),D(We,Ze,0,0,0,-1,I,K,0,0),D(0,0,x,0,0,1,M,y,1,ht),D(We,Ze,x,0,0,1,I,K,1,0),D(je,Ye,x,0,0,1,E,C,1,0),D(je,Ye,0,O,Ue,0,E,C,2,0),D(We,Ze,x,O,Ue,0,I,K,2,0),D(We,Ze,0,O,Ue,0,I,K,2,0),D(je,Ye,0,O,Ue,0,E,C,2,0),D(je,Ye,x,O,Ue,0,E,C,2,0),D(We,Ze,x,O,Ue,0,I,K,2,0)}}ut=F,t.bindBuffer(t.ARRAY_BUFFER,At),t.bufferSubData(t.ARRAY_BUFFER,0,j,0,F*pt),t.bindBuffer(t.ARRAY_BUFFER,null)}const e={phase:"idle",build:0,hold:0,clasped:!1,needRelease:!1,tau:0,tauPrev:0,tauRate:0,age:0,openHold:0,spread:0,settle:0,crackR:0,crackGlow:0,crackVis:1,regrow:1,desat:0,dom:0,intensity:1,flare:0,heat:0,flashL:0,shockT:9,shockW:0,shockX:0,shockY:0,flash:0,shake:0,aberr:0,warp:0,zoom:0,seedX:.5,seedY:.3,seedI:0,seedR:.12,ex:0,ey:.12,er:.4,eTx:0,eTy:.12,eTr:.4,camX:0,camY:0,lastCloseAt:-9,lastMidX:.5,lastMidY:.35,prevD:0,prevTwo:!1,dDot:0,frozenLocked:!1,time:0,aspect:16/9,pulse:0,lastThrow:[-9,-9],lastThrowDx:[0,0],forceDemo:!1,rec:0,pScale:1,recDepth:.14,ancX:.5,tauAtReturn:1,lonely:0,noPerson:0,srcVersion:-1,live:!1,roomReset:!0,personOk:!1,hw:new Float32Array(2),seen:new Uint8Array(2),fw:new Float32Array(2),force:0,forceP:0,lmSig:new Float64Array([-1,-1]),lmFresh:new Uint8Array(2),lmFrame:new Float64Array(2),hSpeed:new Float32Array(2),hSize:new Float32Array(2),srcF:-1,srcAt:0,srcDt:1/30,stale:new Float32Array(2),capDt:new Float32Array(2),driftX:0,driftY:0,openArmed:!1,notOpenT:0,recA:0,recB:.3,touch:1,edgeOk:!1,recEff:0,shiftY:0,chimeAt:new Float64Array(8),chimePitch:new Float64Array(8),chimeGain:new Float64Array(8)},ve=[],de={},_e={wrapK:1,filK:1.4},ie=new Float32Array(8),Ne=new Float32Array(8),ze=new Float32Array(84),fe=new Float32Array(4),Se=new Float32Array(2),he=new Float32Array(8),pe=new Float32Array(8),it=new Float32Array(84),xe=new Float32Array(8),be=new Float32Array(8),ft=new Float32Array(4),Mt=new Float32Array([.62,.5,1]),i={res:new Float32Array(2),texel:new Float32Array(2),E:new Float32Array(2),cam:new Float32Array(2),impact:new Float32Array(2),seed:new Float32Array(4),shock:new Float32Array(4),lightPos:new Float32Array(3),half:new Float32Array(2),center:new Float32Array(2),mtexel:new Float32Array(2),ntexel:new Float32Array(2),pt:new Float32Array([.5,0,0,.3]),drift:new Float32Array(2),voidRes:new Float32Array(2),fwd:new Float32Array([.14,.55])},Le={level:0,pitch:1},Pe={level:0,tone:.5},eo={level:0};Be(.5,.3,U.state.width/Math.max(1,U.state.height),0),T.valid=!1;function to(){e.phase="idle",e.build=0,e.hold=0,e.clasped=!1,e.needRelease=!1,e.tau=0,e.tauPrev=0,e.tauRate=0,e.age=0,e.openHold=0,e.spread=0,e.settle=0,e.crackR=0,e.crackGlow=0,e.crackVis=1,e.regrow=1,e.desat=0,e.dom=0,e.intensity=1,e.flare=0,e.heat=0,e.flashL=0,e.shockT=9,e.shockW=0,e.flash=0,e.shake=0,e.aberr=0,e.warp=0,e.zoom=0,e.seedI=0,e.lastCloseAt=-9,e.frozenLocked=!1,e.pulse=0,e.chimeAt.fill(0),e.chimeGain.fill(0),e.rec=0,e.pScale=1,e.lonely=0,e.noPerson=0,e.hw.fill(0),e.fw.fill(0),e.force=0,e.forceP=0,ie.fill(0),Ne.fill(0),e.driftX=e.driftY=0,e.openArmed=!1,e.notOpenT=0,e.edgeOk=!1,e.touch=1,e.recEff=0,e.shiftY=0,e.lmSig.fill(-1),T.valid=!1}const oo=o=>{const s=z((o-e.recA)/(e.recB-e.recA),0,1);return 1+(1/e.pScale-1)*s*s*(3-2*s)},zo=o=>{const s=1/e.pScale-1,a=z((o-e.recA)/(e.recB-e.recA),0,1);return o+s*((e.recB-e.recA)*(a*a*a-.5*a*a*a*a)+Math.max(o-e.recB,0))},Ie=o=>{const s=o-e.shiftY;if(e.pScale>.9999)return s;let a=s;for(let u=0;u<6;u++)a-=(zo(a)-s)/oo(a);return a},mt=(o,s)=>e.pScale>.9999?o:e.ancX+(o-e.ancX)/oo(Ie(s));function Dt(o,s){if(o&&o.present){const a=z(o.top,.3,1),u=z(o.center[1],.05,.9),n=z((a-u)*.42,.07,.24)*e.pScale;e.eTx=(z(mt(o.center[0],a),.15,.85)-.5)*s,e.eTy=z(Ie(a)-n*1.15,.25,.85)-.5,e.eTr=Math.min(z(n*2.6,.26,.5),s*.62)}else e.eTx=0,e.eTy=.1,e.eTr=Math.min(.38,s*.6)}function So(o){const s=[.07,.15,.24,.36,.5,.68];for(let a=0;a<s.length;a++)e.chimeAt[a]=o+s[a]*(.8+Math.random()*.4),e.chimePitch[a]=1.2+Math.random()*1.6,e.chimeGain[a]=.55-a*.07}function Bt(o,s){(!T.valid||Math.hypot((e.lastMidX-T.u)*e.aspect-e.driftX,e.lastMidY-T.v-e.driftY)>.05)&&Be(e.lastMidX,e.lastMidY,e.aspect,o),e.phase="domain",e.tau=0,e.tauPrev=0,e.age=0,e.openHold=0,e.spread=0,e.hold=0,e.lonely=0,e.noPerson=0,e.shockT=0,e.shockX=T.ix+e.driftX,e.shockY=T.iy+e.driftY,e.openArmed=!1,e.notOpenT=0,e.flash=1,e.shake=1,e.aberr=1,e.frozenLocked=!0,e.heat=1,e.flashL=1,e.warp=1,e.zoom=0,e.needRelease=!0,e.crackVis=1,e.regrow=1,e.ancX=s.person&&s.person.present?z(s.person.center[0],.2,.8):.5;const a=e.live?!!(s.person&&s.person.present&&s.person.top<.95):e.aspect<1;e.recDepth=a?.14:0,Dt(s.person,e.aspect),e.ex=e.eTx,e.ey=e.eTy,e.er=e.eTr;const u=U.audio;u&&(u.impact({strength:1.3,pitch:.62}),u.chime({strength:.9,pitch:1.5}),u.whoosh({strength:.9,duration:1.3,up:!1})),So(o)}function Re(){e.phase==="domain"&&(e.phase="return",e.openHold=0,e.spread=0,e.tauAtReturn=Math.max(.05,e.tau),U.audio?.whoosh({strength:1,duration:.9,up:!0}))}function Lo(o,s,a,u){e.seen[0]=e.seen[1]=0;for(let n=0;n<o.length&&n<2;n++){const f=o[n],c=f.id===1?1:0,g=f.raw&&f.raw.length>=63?f.raw:f.points;let v=9,k=9,P=-9,R=-9;for(let w=0;w<21;w++){const L=g[w*3],M=g[w*3+1];it[w*4+c*2]=L,it[w*4+c*2+1]=M,L<v&&(v=L),L>P&&(P=L),M<k&&(k=M),M>R&&(R=M)}const F=g[0],p=g[1],m=F+(F-g[27])*2.2,S=p+(p-g[28])*2.2;xe[c*4]=F,xe[c*4+1]=p,xe[c*4+2]=m,xe[c*4+3]=S,v=Math.min(v,m),P=Math.max(P,m),k=Math.min(k,S),R=Math.max(R,S);const A=f.size*.66;be[c*4]=v-A/s,be[c*4+1]=k-A,be[c*4+2]=P+A/s,be[c*4+3]=R+A,fe[c]=f.size,e.seen[c]=1;const V=f.seenAt!==void 0?f.seenAt:g[0]*7.31+g[25]*3.17+g[61];V!==e.lmSig[c]&&(f.seenAt!==void 0&&e.lmSig[c]>0&&(e.capDt[c]+=(z(f.seenAt-e.lmSig[c],1/120,.5)-e.capDt[c])*.3),e.lmSig[c]=V,e.lmFresh[c]=1),ft[c*2]=f.velocity[0],ft[c*2+1]=f.velocity[1],e.hSpeed[c]=f.speed,e.hSize[c]=Math.max(.04,f.size),e.hw[c]=u?1:0}for(let n=0;n<2;n++)e.seen[n]||(e.hw[n]=Math.max(0,e.hw[n]-a/.15))}function Po(o){const s=o.sourceFrame;s!==e.srcF&&(e.srcAt>0&&(e.srcDt+=(z(e.time-e.srcAt,1/120,.1)-e.srcDt)*.15),e.srcAt=e.time,e.srcF=s);for(let a=0;a<2;a++){e.lmFresh[a]&&(e.lmFrame[a]=s,e.lmFresh[a]=0);const u=e.live?z(s-e.lmFrame[a],0,8):0;e.stale[a]=u;const n=u*(e.capDt[a]>0?Math.max(e.capDt[a],e.srcDt):e.srcDt),f=ft[a*2]*n,c=ft[a*2+1]*n;for(let v=0;v<21;v++)ze[v*4+a*2]=it[v*4+a*2]+f,ze[v*4+a*2+1]=it[v*4+a*2+1]+c;pe[a*4]=xe[a*4]+f,pe[a*4+1]=xe[a*4+1]+c,pe[a*4+2]=xe[a*4+2]+f,pe[a*4+3]=xe[a*4+3]+c,he[a*4]=be[a*4]+f,he[a*4+1]=be[a*4+1]+c,he[a*4+2]=be[a*4+2]+f,he[a*4+3]=be[a*4+3]+c;const g=e.hSpeed[a]*n*.5/e.hSize[a];Se[a]=1-G(.15,.5,g),fe[2+a]=e.hw[a]*(1-G(.6,1.2,g))*(1-G(4,7,u))}}function Co(o){const s=o.time,a=z(o.dt||1/60,1/240,.05)*ot,u=(e.time>0?z(s-e.time,0,.25):a)*ot;e.time=s;const n=U.source;if(n&&n.version!==e.srcVersion){const x=e.srcVersion<0;e.srcVersion=n.version,e.roomReset=!0,x||to()}const f=!!(n&&n.element&&n.element.tagName==="VIDEO");e.live=f;const c=U.state.width/Math.max(1,U.state.height);Math.abs(c-e.aspect)>.001&&(e.aspect=c,T.valid&&e.phase==="idle"&&(T.valid=!1));const g=o.hands,v=g.length===2;let k=99,P=e.lastMidX,R=e.lastMidY,F=.12,p=9;if(v){const x=g[0],H=g[1],_=Math.hypot((x.palm[0]-H.palm[0])*c,x.palm[1]-H.palm[1]);F=Math.max(.04,(x.size+H.size)*.5),k=_/F,P=(x.palm[0]+H.palm[0])*.5,R=(x.palm[1]+H.palm[1])*.5;for(let d=0;d<5;d++)for(let D=0;D<5;D++){const b=Math.hypot((x.tips[d][0]-H.tips[D][0])*c,x.tips[d][1]-H.tips[D][1]);b<p&&(p=b)}p/=F,e.dDot=e.prevTwo&&a>1e-5?e.dDot*.6+.4*(_-e.prevD)/a:e.prevTwo?e.dDot:0,e.prevD=_}else e.dDot*=.8;e.prevTwo=v,e.ratio=k,e.tipNear=p,Lo(g,c,u,f);const m=v&&(k<(e.clasped?1.75:1.4)||p<(e.clasped?.5:.36)&&k<3.4);v&&(k<2.4||p<.6)&&(e.lastCloseAt=s,e.lastMidX=P,e.lastMidY=R);const S=m||!v&&(e.phase==="idle"||e.phase==="build")&&s-e.lastCloseAt<.5&&e.build>.45;e.clasped=S;let A=!1;for(const x of o.events)if(x.type==="clap"&&(A=!0),x.type==="throw"){const H=x.hand?.id?1:0;e.lastThrow[H]=s,e.lastThrowDx[H]=x.direction?x.direction[0]:0}const V=v?1-G(1.2,3,Math.min(k,p<1?1.2+p*1.8:99)):0,w=U.audio,L=!f||o.person&&o.person.present;e.personOk=L;for(let x=0;x<8;x++)e.chimeGain[x]>0&&s>=e.chimeAt[x]&&(w?.chime({strength:e.chimeGain[x],pitch:e.chimePitch[x]}),e.chimeGain[x]=0);if(e.phase==="idle"||e.phase==="build"){const x=S?1:V,H=x>e.build?1.9:1.3;if(e.build+=z(x-e.build,-H*u,H*u),e.build>.02){const D=v?P:e.lastMidX,b=v?R:e.lastMidY;if(!T.valid)Be(D,b,c,s),e.regrow=0;else if(v){let X=(D-T.u)*c,E=b-T.v;const C=Math.hypot(X,E);if(C>tt&&e.build<.25&&s-T.at>.3)Be(D,b,c,s),e.regrow=0;else{C>tt&&(X*=tt/C,E*=tt/C);const I=1-Math.exp(-u/.07);e.driftX+=(X-e.driftX)*I,e.driftY+=(E-e.driftY)*I}}}e.regrow=Math.min(1,e.regrow+u/.3);const _=G(0,1,e.regrow);S?e.hold+=u:e.hold=Math.max(0,e.hold-u*1.5),e.phase=e.build>.004?"build":"idle",e.phase==="idle"&&T.valid&&s-T.at>.6&&(T.valid=!1);const d=e.build;e.crackR=(Math.pow(d,1.25)*1.35+G(0,.4,e.hold)*.5)*(.2+.8*_),e.crackGlow=d*d*.85+G(0,.4,e.hold)*.5,e.crackVis=_,e.desat=d*.62,e.seedX=v?P:e.lastMidX,e.seedY=v?R:e.lastMidY,e.seedI=G(.15,1,d)*(S?1.1:.85)*(f?1:.75),e.seedR=F,e.dom=0,e.tau=0,e.tauPrev=0,e.rec=0,e.pScale=1,e.frozenLocked||Dt(o.person,c),w&&(Le.level=d*.75,Le.pitch=.55+d*.9+G(0,.4,e.hold)*.3,w.layer("hum",Le),Pe.level=d*.28,Pe.tone=.15+d*.5,w.layer("noise",Pe),eo.level=d*d*.3,w.layer("crackle",eo)),L&&((e.hold>=.4||A&&e.build>.05)&&e.build>.3?Bt(s,o):A&&(e.build=Math.max(e.build,.5),Bt(s,o)))}else if(e.phase==="domain"||e.phase==="return"||e.phase==="settle"){if(e.age+=a,e.shockT+=a,e.tauPrev=e.tau,v&&(e.seedX=P,e.seedY=R,e.seedR=F),e.phase==="domain"){const d=1-.68*G(.12,.3,e.age)*(1-G(.75,1.35,e.age));e.tau+=a*d/(1+Math.max(0,e.tau-5)*.45),e.dom=Math.min(1,e.dom+a/.1),e.age>.12&&(e.rec+=(1-e.rec)*(1-Math.exp(-u/.9))),e.lonely=g.length>=2?0:e.lonely+u;const D=v&&g[0].open>.7&&g[1].open>.7&&g[0].facing>0&&g[1].facing>0&&k>3.4;if(!D&&e.age>.3?(e.notOpenT+=u,e.notOpenT>.2&&(e.openArmed=!0)):e.notOpenT=0,D&&e.dDot>.3&&e.age>Qe&&(e.openArmed=!0),e.age>Qe&&v?(D&&(e.openArmed||e.age>Qe+2)?e.openHold+=u:e.openHold=Math.max(0,e.openHold-u),e.dDot>1.5&&k>3.2?e.spread+=u:e.spread=0,(e.openHold>.45||e.spread>.07)&&Re()):(e.openHold=Math.max(0,e.openHold-u),e.spread=0),e.age>Qe&&Math.abs(e.lastThrow[0]-e.lastThrow[1])<.3&&s-Math.max(e.lastThrow[0],e.lastThrow[1])<.1&&e.lastThrowDx[0]*e.lastThrowDx[1]<0&&Re(),e.age>Qe)for(const b of o.events){if(b.type!=="throw"||!b.hand||!b.direction)continue;const X=o.person&&o.person.present?o.person.center[0]:.5;Math.sign(b.hand.palm[0]-X)*b.direction[0]>1.6&&Math.abs(b.direction[0])>Math.abs(b.direction[1])*.8&&Re()}e.age>2&&e.lonely>10&&Re(),e.age>35&&Re(),f&&!(o.person&&o.person.present)?(e.noPerson+=u,e.noPerson>.8&&Re()):e.noPerson=0,S||(e.needRelease=!1),S&&!e.needRelease?e.hold+=u:e.hold=Math.max(0,e.hold-u*2),e.age>1.5&&e.pulse<=0&&e.hold>0&&(e.seedI=Math.max(e.seedI,G(0,.4,e.hold)*.9)),e.hold>.4&&e.age>1.5&&e.pulse<=0&&(e.needRelease=!0,e.pulse=1,e.shockT=0,e.flash=.35,e.shake=.5,e.aberr=.6,e.hold=0,e.shockX=(mt(e.seedX,e.seedY)-.5)*c,e.shockY=Ie(e.seedY)-.5,w?.impact({strength:.8,pitch:.9}),w?.chime({strength:.6,pitch:2}))}else e.phase==="return"?(e.tau=Math.max(0,e.tau-a*(3+2.4*e.tau)),e.rec=Math.min(e.rec,e.tau/e.tauAtReturn),e.tau<=0&&(e.phase="settle",e.settle=0,e.flash=.45,e.shake=.7,e.aberr=.7,e.crackGlow=1,e.heat=0,e.rec=0,w?.impact({strength:1,pitch:1}),w?.chime({strength:.7,pitch:1.1}))):(e.settle+=a,e.rec=0,e.dom=Math.max(0,e.dom-a/.16),e.crackGlow*=Math.exp(-a*4.2),e.settle>1&&(e.phase="idle",e.build=0,T.valid=!1,e.frozenLocked=!1,e.crackGlow=0,e.crackR=0));a>1e-5&&(e.tauRate=(e.tau-e.tauPrev)/a),e.phase!=="settle"&&(e.crackR=3,e.crackGlow=Math.max(0,e.crackGlow-a*1.2)),e.pulse=Math.max(0,e.pulse-a*.5),e.desat=Math.max(0,e.desat-a*4),e.heat*=Math.exp(-a*1.2),e.flashL*=Math.exp(-a*2.2),e.intensity=1+1.4*Math.exp(-e.age*3)+e.pulse*1.2,e.flare=Math.exp(-e.age*1.8)+e.pulse*.8,e.warp=Math.exp(-e.age*1.5)+e.pulse*.4,e.zoom=e.phase==="domain"?1.4*(1-Math.exp(-e.age*1.2)):e.zoom*Math.exp(-a*3);const x=!v||k>2&&p>.6;e.phase==="domain"&&e.hold>0&&e.pulse<=0||(e.seedI*=Math.exp(-a*(x?1/.05:6)));const H=e.edgeOk?e.recDepth*(1-G(.8,1.2,c))*(1-G(.45,.6,e.touch)):0;e.recA+=(z(e.touch+.02,0,.6)-e.recA)*(1-Math.exp(-a/.4)),e.recB=e.recA+.3,e.recEff+=(H-e.recEff)*(1-Math.exp(-a/.35)),e.pScale=1-e.recEff*e.rec*(1+.03*Math.sin(s*.6)),e.shiftY=e.live?0:.2*(1-G(.75,1,c))*e.rec,o.person&&o.person.present&&(e.ancX+=(z(o.person.center[0],.2,.8)-e.ancX)*(1-Math.exp(-a/2.5))),Dt(o.person,c);const _=1-Math.exp(-a/1.4);if(e.ex+=(e.eTx-e.ex)*_,e.ey+=(e.eTy-e.ey)*_,e.er+=(e.eTr-e.er)*_,w){const d=e.phase==="settle"?Math.max(0,1-e.settle*1.5):1;Le.level=.42*d+e.pulse*.3+G(0,.4,e.hold)*.2,Le.pitch=.42+e.pulse*.2+G(0,.4,e.hold)*.25,w.layer("hum",Le),Pe.level=(.2+e.warp*.25)*d,Pe.tone=.1+e.warp*.35,w.layer("noise",Pe)}}let M=.025*Math.sin(s*.13)+.012*Math.sin(s*.31),y=.015*Math.cos(s*.11);o.person&&o.person.present&&(M-=(o.person.center[0]-.5)*c*.35,y-=(o.person.center[1]-.45)*.3),v&&(M-=(P-.5)*c*.06,y-=(R-.4)*.05);const N=1-Math.exp(-a/.45);e.camX+=(M-e.camX)*N,e.camY+=(y-e.camY)*N;{const x=z(io*.5/a,0,1);for(let d=0;d<8;d++)Ne[d]=ie[d];const H=e.force,_=e.phase==="domain"?G(.9,1.8,e.age):0;e.force+=(_-e.force)*(1-Math.exp(-a/(_>e.force?.4:.1))),e.forceP=e.force+(H-e.force)*x;for(let d=0;d<2;d++){let D=0;for(let b=0;b<g.length&&b<2;b++){const X=g[b];if((X.id===1?1:0)!==d)continue;let E=X.palm[0],C=X.palm[1];if(e.pScale<.9995||e.shiftY>1e-5){const I=Ie(C);E=mt(E,C),C=I}ie[d*4]=(E-.5)*c,ie[d*4+1]=C-.5,ie[d*4+2]=X.size*1.3,D=e.live?e.hw[d]:e.forceDemo?1:0}e.fw[d]+=(D-e.fw[d])*(1-Math.exp(-a/.2)),ie[d*4+3]=e.fw[d]}for(let d=0;d<8;d++)Ne[d]=ie[d]+(Ne[d]-ie[d])*x}e.flash*=Math.exp(-a*16),e.shake*=Math.exp(-a*7),e.aberr*=Math.exp(-a*6),e.shockW=e.shockT<1.6?Math.exp(-e.shockT*1.6)*(e.pulse>0?.7:1):0}const W={},te={},zt={},B={},Fe={},Oe={},St={},Q={},ge={},we={},h={},Ee={},Y={},ao={},oe={},Te={},Xe={},vt={},qe={};function Uo(o,s){if(me){if(t.getSyncParameter(me,t.SYNC_STATUS)!==t.SIGNALED)return;t.deleteSync(me),me=null,t.bindBuffer(t.PIXEL_PACK_BUFFER,ct),t.getBufferSubData(t.PIXEL_PACK_BUFFER,0,yt),t.bindBuffer(t.PIXEL_PACK_BUFFER,null),e.touch=Math.max(yt[0],yt[4])/255,e.edgeOk=!0}!(o.aspect<1.2)||s==="idle"||o.frame%4||(l.pass(q.edge,r.edge,(vt.uMask=o.mask,vt)),t.bindBuffer(t.PIXEL_PACK_BUFFER,ct),t.readPixels(0,0,2,1,t.RGBA,t.UNSIGNED_BYTE,0),t.bindBuffer(t.PIXEL_PACK_BUFFER,null),t.bindFramebuffer(t.FRAMEBUFFER,null),me=t.fenceSync(t.SYNC_GPU_COMMANDS_COMPLETE,0))}let ro=!1,Ve=0,Lt=!1,Ke=0,dt=0,Pt=!1,Ct=!1;const ce={exposure:1,vignette:.35,bloom:.05,filmic:0,grain:.03};function Ho(o){const s=U.source;if(s&&s.uploaded!==s.version&&Ve<1.5&&o.frame>2){Ve===0&&(Lt=Ke>0&&o.scene.width===Ke&&o.scene.height===dt,Lt&&(r.hold.resize(Ke,dt),o.copy(o.scene,r.hold))),Ve+=Math.max(o.dt,.001),(o.scene.width!==Ke||o.scene.height!==dt)&&o.copy(Lt?r.hold:o.base,o.scene);const u=o.post;u.exposure=ce.exposure,u.vignette=ce.vignette,u.bloom=ce.bloom,u.filmic=ce.filmic,u.grain=ce.grain;return}if(Ve>0&&r.hold.resize(4,4),Ve=0,Ke=o.scene.width,dt=o.scene.height,!ro){ro=!0;const u={phase:e.phase,tau:e.tau,tauPrev:e.tauPrev,tauRate:e.tauRate,dom:e.dom,crackGlow:e.crackGlow,frozenLocked:e.frozenLocked,valid:T.valid,rec:e.rec,pScale:e.pScale};T.valid||Be(.5,.3,o.aspect,0),e.phase="domain",e.tau=.4,e.tauPrev=.39,e.tauRate=1,e.dom=1,e.crackGlow=.5,e.frozenLocked=!1,e.rec=.5,e.pScale=.95;const n=o.post,f=[n.exposure,n.vignette,n.bloom,n.filmic,n.grain,n.flash,n.aberration,n.shake[0],n.shake[1]];Pt=!0;try{so(o),l.pass(q.edge,r.edge,(vt.uMask=o.mask,vt))}catch(c){console.error(c)}Pt=!1,[n.exposure,n.vignette,n.bloom,n.filmic,n.grain,n.flash,n.aberration,n.shake[0],n.shake[1]]=f,e.phase=u.phase,e.tau=u.tau,e.tauPrev=u.tauPrev,e.tauRate=u.tauRate,e.dom=u.dom,e.crackGlow=u.crackGlow,e.frozenLocked=u.frozenLocked,e.rec=u.rec,e.pScale=u.pScale,T.valid=u.valid}so(o);const a=o.post;ce.exposure=a.exposure,ce.vignette=a.vignette,ce.bloom=a.bloom,ce.filmic=a.filmic,ce.grain=a.grain}function so(o){const s=o.width,a=o.height,u=o.aspect,n=o.post,f=e.phase;Po(o);{const y=o.mask.width,N=o.mask.height;(r.roomA.width!==y||r.roomA.height!==N)&&(r.roomA.resize(y,N),r.roomB.resize(y,N),r.fillA.resize(y,N),r.fillB.resize(y,N),r.memA.resize(y,N),r.memB.resize(y,N),e.roomReset=!0),i.texel[0]=1/y,i.texel[1]=1/N,r.handM.resize(y,N),l.pass(q.handM,r.handM,(Te.uAspect=u,Te.uHandP=ze,Te.uHandR=fe,Te.uHandC=Se,Te.uHandBox=he,Te.uArm=pe,Te)),l.pass(q.maskAny,r.maskAny,(ao.uMask=o.mask,ao)),l.pass(q.memc,r.memB,(qe.uBase=o.base,qe.uHandM=r.handM,qe.uPrev=r.memA,qe.uReset=e.roomReset?1:0,qe));{const _=r.memA;r.memA=r.memB,r.memB=_}l.pass(q.fill,r.fillB,(oe.uMemC=r.memA,oe.uTexel=i.texel,oe.uMask=o.mask,oe.uHandM=r.handM,oe.uRoom=r.roomA,oe.uBase=o.base,oe.uPrev=e.roomReset?r.black:r.fillA,oe.uAspect=u,oe.uDt=z(o.dt,0,.1),oe.uOn=e.live?1:0,oe));{const _=r.fillA;r.fillA=r.fillB,r.fillB=_}l.pass(q.room,r.roomB,(Y.uHandM=r.handM,Y.uFill=r.fillA,Y.uAny=r.maskAny,Y.uBase=o.base,Y.uMask=o.mask,Y.uPrev=r.roomA,Y.uTexel=i.texel,Y.uAspect=u,Y.uReset=e.roomReset?1:0,Y.uLearn=e.personOk?1:0,Y.uLive=e.live?1:0,Y.uHandP=ze,Y.uHandR=fe,Y.uHandC=Se,Y.uHandBox=he,Y.uArm=pe,Y));const x=r.roomA;r.roomA=r.roomB,r.roomB=x,e.roomReset=!1;const H=fe[2]>.004||fe[3]>.004;if(Ct=!1,(H&&(f!=="idle"||e.seedI>=.002)||f!=="idle"&&f!=="build"||Pt)&&!de.env&&(go(y,N),qt)){t.bindFramebuffer(t.FRAMEBUFFER,gt),t.viewport(0,0,y,N),t.drawBuffers(wt),t.disable(t.BLEND),q.henv.use().set((Xe.uBase=o.base,Xe.uMask=r.fillA,Xe.uHandM=r.handM,Xe.uTexel=i.texel,Xe)),l.fullscreen(),t.bindFramebuffer(t.FRAMEBUFFER,null),t.activeTexture(t.TEXTURE0);for(const _ of[r.envB,r.envS,r.envN])t.bindTexture(t.TEXTURE_2D,_.tex),t.generateMipmap(t.TEXTURE_2D);Ct=!0,t.bindTexture(t.TEXTURE_2D,null)}Uo(o,f)}if(f==="idle"&&e.seedI<.002){o.copy(o.base,o.scene);return}const c=f!=="idle"&&f!=="build",g=T.valid&&ut>0,v=c&&e.tau>5e-4,k=c&&e.pScale<.9995,P=c&&(k||e.shiftY>1e-5);i.res[0]=s,i.res[1]=a,i.impact[0]=T.ix+e.driftX,i.impact[1]=T.iy+e.driftY,i.drift[0]=e.driftX,i.drift[1]=e.driftY,i.E[0]=e.ex,i.E[1]=e.ey,i.cam[0]=e.camX,i.cam[1]=e.camY,i.pt[0]=e.ancX,i.pt[1]=k?1/e.pScale-1:0,i.pt[2]=e.recA,i.pt[3]=e.recB;const R=1/a;Ot=f==="domain"&&e.age<1.4?"burst":f,bo(),ue("normals");const F=o.normals();ue("freeze");const p=r.frozen.width!==s||r.frozen.height!==a;if(r.frozen.resize(s,a),(!e.frozenLocked||p)&&(i.texel[0]=1/o.mask.width,i.texel[1]=1/o.mask.height,l.pass(q.freeze,r.frozen,(W.uBase=o.base,W.uPlate=o.plate,W.uMask=r.fillA,W.uRoom=r.roomA,W.uTexel=i.texel,W.uAspect=u,W.uHandP=ze,W.uHandR=fe,W.uHandC=Se,W.uHandBox=he,W.uArm=pe,W.uEnvB=r.envB,W.uEnvH=r.envB.height,W.uEnvOk=Ct?1:0,W))),ue("void"),c&&e.dom>0&&!de.void){const y=_e.voidDiv||Nt;r.void.resize(Math.ceil(s/y),Math.ceil(a/y)),i.voidRes[0]=r.void.width,i.voidRes[1]=r.void.height,l.pass(q.void,r.void,(te.uNoise=lt,te.uAspect=u,te.uTime=e.time,te.uER=e.er,te.uIntensity=e.intensity,te.uFlare=e.flare,te.uE=i.E,te.uCam=i.cam,te.uSlices=e.age<1.2||f==="return"?ho:vo,te.uPxW=R*(_e.voidDiv||Nt),te.uFilK=_e.filK,te)),r.voidLow.resize(Math.ceil(r.void.width/8),Math.ceil(r.void.height/8)),i.texel[0]=1/r.void.width,i.texel[1]=1/r.void.height,l.pass(q.box4,r.voidLow,(zt.uSrc=r.void,zt.uTexel=i.texel,zt))}if(ue("shards"),g&&!de.shards&&(Fo(s,a),Et)){t.bindFramebuffer(t.FRAMEBUFFER,Rt),t.viewport(0,0,s,a),t.drawBuffers(He),t.depthMask(!0),t.clearBufferfv(t.COLOR,0,Ao),t.clearBufferfv(t.COLOR,1,ko),t.clearBufferfv(t.DEPTH,0,Ro),t.enable(t.DEPTH_TEST),t.depthFunc(t.LEQUAL),t.enable(t.CULL_FACE),t.cullFace(t.BACK),t.disable(t.BLEND),i.lightPos[0]=e.ex*8,i.lightPos[1]=e.ey*8,i.lightPos[2]=8;const y=1-G(.75,1,u);i.fwd[0]=.14+.2*y,i.fwd[1]=.55-.25*y,q.shard.use().set((B.uTau=e.tau,B.uTauPrev=v?e.tau-e.tauRate*io*.5:e.tau,B.uVelK=2,B.uAspect=u,B.uDelayK=no,B.uOpen=f==="build"?e.build*e.build:0,B.uContract=f==="build"?e.build*e.build:0,B.uImpact=i.impact,B.uDrift=i.drift,B.uHF=ie,B.uHFP=Ne,B.uForce=e.force,B.uForceP=e.forceP,B.uFwd=i.fwd,B.uFrozen=r.frozen,B.uNoise=lt,B.uVoid=c&&e.dom>0?r.void:r.black,B.uRes=i.res,B.uCrackR=e.crackR,B.uCrackGlow=e.crackGlow,B.uDesat=e.desat,B.uHeat=e.heat,B.uPxW=R,B.uFlashL=e.flashL*3,B.uLightI=c?1:0,B.uMoving=v?1:0,B.uLightPos=i.lightPos,B.uTint=Mt,B.uCrackVis=f==="settle"?z(1-e.settle/.6,0,1):e.crackVis,B)),t.bindVertexArray(kt),t.drawArrays(t.TRIANGLES,0,ut),v&&e.tau<9&&!de.glints&&(t.drawBuffers(yo),t.depthMask(!1),t.disable(t.CULL_FACE),t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ONE),i.half[0]=u/2,i.half[1]=.5,q.glint.use().set((Fe.uTau=e.tau,Fe.uAspect=u,Fe.uImpact=i.impact,Fe.uDelayK=no,Fe.uHalf=i.half,Fe.uPxScale=2.2*a/1100,Fe)),t.bindVertexArray(Kt),t.drawArrays(t.POINTS,0,mo),t.disable(t.BLEND),t.depthMask(!0),t.drawBuffers(He)),t.bindVertexArray(null),t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),t.bindFramebuffer(t.FRAMEBUFFER,null)}const m=g&&Et&&!de.shards;ue("tiles");const S=m&&v&&Je&&!de.blur;let A=!1;S&&(r.tileA.resize(Math.ceil(s/xt),Math.ceil(a/xt)),r.tileB.resize(r.tileA.width,r.tileA.height),i.texel[0]=1/s,i.texel[1]=1/a,l.pass(q.tile,r.tileA,(Oe.uSrc=r.shardAux,Oe.uTexel=i.texel,Oe.uN=4,Oe.uStride=xt/4,Oe)),i.texel[0]=1/r.tileA.width,i.texel[1]=1/r.tileA.height,l.pass(q.neigh,r.tileB,(St.uSrc=r.tileA,St.uTexel=i.texel,St)),ue("blur"),Eo(Math.ceil(s/2),Math.ceil(a/2)),Qt&&(t.bindFramebuffer(t.FRAMEBUFFER,Tt),t.viewport(0,0,r.blurC.width,r.blurC.height),t.drawBuffers(He),t.disable(t.BLEND),q.blur.use().set((Ee.uShard=r.shardColor,Ee.uAux=r.shardAux,Ee.uTile=r.tileB,Ee.uRes=i.res,Ee.uBlurMax=xo*a/1080,Ee.uFrame=o.frame,Ee)),l.fullscreen(),t.bindFramebuffer(t.FRAMEBUFFER,null),A=!0)),ue("rays");const V=!de.rays&&(c&&e.dom>0||m&&e.crackGlow>.02);if(V){const y=Math.ceil(s/5),N=Math.ceil(a/5);r.raysA.resize(y,N),r.raysB.resize(y,N),l.pass(q.raySrc,r.raysA,(Q.uVoid=c&&e.dom>0?r.void:r.black,Q.uMask=r.fillA,Q.uShard=m?r.shardColor:r.black,Q.uAux=m?r.shardAux:r.black,Q.uAspect=u,Q.uER=e.er,Q.uDom=c?e.dom:0,Q.uCrack=f==="settle"?.3:1,Q.uShards=m?1:0,Q.uE=i.E,Q.uTint=Mt,Q.uPT=i.pt,Q.uPSh=c?e.shiftY:0,Q)),c?(i.center[0]=e.ex/u+.5,i.center[1]=e.ey+.5):(i.center[0]=i.impact[0]/u+.5,i.center[1]=i.impact[1]+.5);const x=Z?18:24;l.pass(q.radial,r.raysB,(ge.uSrc=r.raysA,ge.uCenter=i.center,ge.uDensity=.92,ge.uDecay=.965,ge.uWeight=2.2/x,ge.uSamples=x,ge.uFrame=o.frame,ge)),l.pass(q.radial,r.raysA,(we.uSrc=r.raysB,we.uCenter=i.center,we.uDensity=.22,we.uDecay=1,we.uWeight=1/12,we.uSamples=12,we.uFrame=o.frame+17,we))}if(ue("compose"),i.seed[0]=P?mt(e.seedX,e.seedY):e.seedX,i.seed[1]=P?Ie(e.seedY):e.seedY,i.seed[2]=e.seedI,i.seed[3]=e.seedR*(k?e.pScale:1),i.mtexel[0]=1/o.mask.width,i.mtexel[1]=1/o.mask.height,i.ntexel[0]=1/F.width,i.ntexel[1]=1/F.height,i.shock[0]=e.shockX,i.shock[1]=e.shockY,i.shock[2]=e.shockT*2.1,i.shock[3]=e.shockW,l.pass(q.compose,o.scene,(h.uBase=o.base,h.uMask=r.fillA,h.uNormals=F,h.uVoid=c&&e.dom>0?r.void:r.black,h.uShard=m?r.shardColor:r.black,h.uAux=m?r.shardAux:r.black,h.uBlurC=A?r.blurC:r.black,h.uBlurF=A?r.blurF:r.black,h.uRays=V?r.raysA:r.black,h.uFrozen=r.frozen,h.uRes=i.res,h.uAspect=u,h.uTime=e.time,h.uFrame=o.frame,h.uDom=c?e.dom:0,h.uDesat=e.desat,h.uShards=m?1:0,h.uBlur=A?1:0,h.uER=e.er,h.uWarp=e.warp,h.uZoom=e.zoom,h.uRaysK=V?c?1:1.4:0,h.uStarK=1,h.uPxW=R,h.uDebug=$==="matte"?1:$==="matte2"?2:$==="matte3"?3:$==="hand"?4:$==="hand2"?5:$==="hand3"?6:$==="hand4"?7:$==="light"?8:$==="fc"?9:0,h.uMaskTexel=i.mtexel,h.uNTexel=i.ntexel,h.uPT=i.pt,h.uPSh=c?e.shiftY:0,h.uRecede=e.rec,h.uVoidLow=c&&e.dom>0?r.voidLow:r.black,h.uHandP=ze,h.uHandR=fe,h.uHandC=Se,h.uHandBox=he,h.uArm=pe,h.uNoise=lt,h.uRoom=r.roomA,h.uEnvB=r.envB,h.uEnvS=r.envS,h.uEnvN=r.envN,h.uEnvH=r.envB.height,h.uVoidRes=i.voidRes,h.uWrapK=_e.wrapK,h.uE=i.E,h.uCam=i.cam,h.uSeed=i.seed,h.uShock=i.shock,h.uTint=Mt,h)),ue(null),$){const y={aux:r.shardAux,shard:r.shardColor,void:r.void,rays:r.raysA,frozen:r.frozen,tile:r.tileB,emask:o.mask,eplate:o.plate,eplateL:o.plateLearned,base:o.base,room:r.roomA,fill:r.fillA}[$];y&&o.copy(y,o.scene)}const w=f==="build"?e.build:0,L=c?e.dom:0;n.exposure=1-w*.12,n.vignette=.35+w*.25+L*.2,n.bloom=.05+w*.012+L*.09,n.filmic=L*.35,n.grain=.03+L*.012,n.flash=e.flash*.4,n.aberration=e.aberr*.014;const M=e.shake*.006;n.shake[0]=M*Math.sin(e.time*91.7),n.shake[1]=M*Math.cos(e.time*77.3)}function _o(o,s,a,u,n){const f=[],c=o%14,g=s<1,v=g?.8:.785,k=g?.8:.56,P=(m,S)=>f.push({pts:u(S,s,a[m]),side:S.side}),R=(m,S,A,V,w,L=.15)=>{const M=m/s;P(0,{x:S-M,y:A,size:L,roll:w,side:"left",curls:V}),P(1,{x:S+M,y:A+.004,size:L,roll:-w,side:"right",curls:V})},F=m=>m*m*(3-2*m),p=No;if(c>=.8&&c<1.8)R(.36,v,k-.06+.03*F(z(c-.8,0,1)),n.relaxed,.35);else if(c>=1.8&&c<3.25){const m=F(z((c-1.8)/1.45,0,1));R(.36-.325*m,v,k-.03+.03*m,n.open,.35+.35*m)}else if(c>=3.25&&c<3.9)R(.035,v,k,n.open,.7);else if(c>=3.9&&c<4.8){const m=F(z((c-3.9)/.9,0,1));R(.035+.25*m,v-.08*m,k-.25*m,p,.7-.4*m)}else if(c>=9.5&&c<10.9){const m=F(z((c-9.5)/.4,0,1));R(.62,.5,.15+.17*m,n.open,.15)}return f}return{id:"domain",coach:[{gesture:"two",label:"Clasp hands",text:"press palms together"},{gesture:"open",label:"Open palms",text:"hold wide to return"},{gesture:"throw",label:"Spread fast",text:"or fling them apart"}],activeCues(o){return ve.length=0,e.phase==="idle"||e.phase==="build"?(e.build>.05||e.clasped)&&ve.push("two"):e.phase==="domain"?(e.openHold>.05&&ve.push("open"),e.spread>0&&ve.push("throw")):e.phase==="return"&&ve.push("open"),ve.length||ve.push("none"),ve},update:Co,render:Ho,choreography:_o,reset:to,dispose(){for(const o of Object.values(q))o.dispose();for(const o of Object.values(r))o.dispose();t.deleteTexture(lt),t.deleteBuffer(At),t.deleteVertexArray(kt),t.deleteVertexArray(Kt),t.deleteFramebuffer(Rt),t.deleteFramebuffer(Tt),t.deleteFramebuffer(gt),t.deleteRenderbuffer(Ft),t.deleteBuffer(ct),me&&(t.deleteSync(me),me=null)},debug:{get state(){return e},get pattern(){return T},get vertCount(){return ut},get hands(){return{stale:[...e.stale],handC:[...Se],handR:[...fe],srcDt:e.srcDt}},skip:de,tune:_e,get view(){return $},get timeScale(){return ot},set timeScale(o){ot=Math.max(0,+o||0)},set view(o){$=o||null},get prof(){const o={};for(const s in at){const a=[...at[s].list].sort((u,n)=>u-n);o[s]=[+(a[0]||0).toFixed(2),+(a[a.length>>2]||0).toFixed(2),+(a[a.length>>1]||0).toFixed(2)]}return o},shatterNow(o,s=.5,a=.3){e.build=1,e.lastMidX=s,e.lastMidY=a,T.valid=!1,Be(s,a,e.aspect,e.time),Bt(e.time,o||{person:{present:!1}})},returnNow(){Re()}}}}export{na as createEffect};
