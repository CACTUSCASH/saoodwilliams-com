/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-6f6216d48820 */(()=>{const _=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(_)||_.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as re,COMMON as Ze}from"../engine/glsl.js?v=0aafddc6f3";const C=(_,l,t)=>Math.min(t,Math.max(l,_)),V=(_,l,t)=>{const le=C((t-_)/(l-_),0,1);return le*le*(3-2*le)},uo=Math.PI*2,no=24,pt=16,Ut=.72,io=.4,fo=.3,mo=.8/60,Io=[.35,.45,.5,.55,.6],Qe=2.5,se=re+`precision highp sampler3D;
`+Ze,Ht=`float skinKey(vec3 base){
  vec3 g=toGamma(base);
  float cb=-0.1687*g.r-0.3313*g.g+0.5*g.b, cr=0.5*g.r-0.4187*g.g-0.0813*g.b;
  return smoothstep(0.012,0.045,cr)*(1.0-smoothstep(0.0,0.035,cb))*smoothstep(0.03,0.09,luma(g));
}`,Nt=`uniform vec4 uHandP[21]; uniform vec4 uHandR; uniform vec2 uHandC; uniform vec4 uHandBox[2]; uniform vec4 uArm[2];
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
${Ht}`,vo=`uniform vec4 uPT; uniform float uPSh;
vec2 personUv(vec2 uv){
  float km=uPT.y; if(km<1e-4) return vec2(uv.x,uv.y+uPSh);
  float a=uPT.z,b=uPT.w,t=uv.y;
  float w=clamp((t-a)/(b-a),0.0,1.0);
  float F=(b-a)*(w*w*w-0.5*w*w*w*w)+max(t-b,0.0);
  float k=1.0+km*w*w*(3.0-2.0*w);
  return vec2(uPT.x+(uv.x-uPT.x)*k,t+km*F+uPSh);
}`,Oo=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uPlate;uniform sampler2D uMask;uniform sampler2D uRoom;uniform vec2 uTexel;uniform float uAspect;
uniform sampler2D uEnvB;uniform float uEnvH;uniform float uEnvOk;
${Nt}
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
}`,qo=re+`
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
}`,Vo=se+`
in vec2 vUv;out vec4 outColor;uniform float uAspect;
${Nt}
void main(){vec4 h=handsHull(vUv);outColor=vec4(h.x,max(h.y,h.z),h.w,1.0);}`,Go=se+`
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
float m=m0,enc=0.0,held=0.0,wall=0.0;
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
wall=smoothstep(0.5,0.9,room.a)*(1.0-smoothstep(0.04,0.1,keyDist(g,room.rgb)));
enc=max(enc,held);
m=max(m0,enc*(1.0-wall));
}
outColor=vec4(m,enc*(1.0-wall),streak,max(prev.a-uDt/mix(6.0,0.5,learn),m*learn));
}`,jo=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uHandM;uniform sampler2D uPrev;uniform sampler2D uFill;uniform float uReset;
void main(){
float learn=(1.0-smoothstep(0.02,0.15,texture(uHandM,vUv).b))*smoothstep(0.35,0.75,texture(uFill,vUv).r);
vec3 cam=toGamma(texture(uBase,vUv).rgb);
vec3 prev=uReset>0.5?cam:texture(uPrev,vUv).rgb;
outColor=vec4(mix(prev,cam,learn),1.0);
}`,Yo=se+`
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
}`,Wo=se+`
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
return c*asym*(1.0-disc)*(1.0+uFlare*1.8);
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
}`,Zo=re+Ze+`
layout(location=0)in vec3 aLocal;
layout(location=1)in vec3 aNormal;
layout(location=2)in vec2 aCenter;
layout(location=3)in vec2 aUv;
layout(location=4)in vec4 aInfo;
layout(location=5)in vec2 aExtra;
uniform float uTau;uniform float uTauPrev;uniform float uVelK;uniform float uAspect;uniform float uDelayK;
uniform float uOpen;uniform float uContract;uniform vec2 uImpact;uniform vec2 uDrift;
uniform vec4 uHF[2];uniform vec4 uHFP[2];uniform float uForce;uniform float uForceP;uniform vec2 uFwd;
out vec3 vWorld;out vec3 vN;out vec2 vUv;out vec4 vInfo;out vec2 vRest;out float vS;out vec2 vVel;out float vZ;out vec2 vLoc;out float vAcross;
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
vAcross=aLocal.z>1e-6?1.0:0.0;
gl_Position=c;
}`,Qo=se+`
const float PZ=${Ut.toFixed(3)};
in vec3 vWorld;in vec3 vN;in vec2 vUv;in vec4 vInfo;in vec2 vRest;in float vS;in vec2 vVel;in float vZ;in vec2 vLoc;in float vAcross;
uniform sampler2D uFrozen;uniform sampler2D uVoid;uniform sampler3D uNoise;
uniform vec2 uRes;uniform float uCrackR;uniform float uCrackGlow;uniform float uDesat;uniform float uHeat;
uniform float uPxW;uniform float uFlashL;uniform float uLightI;uniform float uMoving;uniform float uCrackVis;
uniform vec3 uLightPos;uniform vec3 uTint;uniform vec2 uImpact;uniform float uBuild;uniform float uHair;
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
float wpx=1.0/max(fwidth(vAcross),1e-4);
float nearA=smoothstep(0.1,0.34,vZ);
float kind=vInfo.z,edge=vInfo.w;
if(nearA<0.35||(kind>1.5&&wpx<0.75))discard;
float a=smoothstep(0.35,1.0,nearA)*(1.0-smoothstep(9.0,22.0,vZ));
if(kind>1.5)a*=smoothstep(0.75,2.0,wpx);
vec2 suv=gl_FragCoord.xy/uRes;
vec3 N=normalize(vN);
float moved=smoothstep(0.0,0.3,vS);
float restD=length(vRest-uImpact);
vec2 nA=texture(uNoise,vec3(vRest*0.45,0.13)).rg-0.5;
float wob=nA.x*0.14+(fract(vInfo.x*13.7)-0.5)*0.22;
float reveal=smoothstep(0.0,0.05,uCrackR-restD+wob);
vec2 rof=N.xy*0.028*moved;
vec2 cj=fract(vInfo.x*vec2(13.7,7.31)+0.31)-0.5;
rof+=cj*vec2(uRes.y/uRes.x,1.0)*0.0042*uBuild*reveal*(1.0-moved)*(0.35+0.65*fract(vInfo.x*3.1));
vec3 tex=toLinear(vec3(texture(uFrozen,vUv+rof*0.85).r,texture(uFrozen,vUv+rof).g,texture(uFrozen,vUv+rof*1.15).b));
tex=mix(tex,vec3(luma(tex)),uDesat*smoothstep(uCrackR+0.15,uCrackR-0.35,restD));
vec3 V=normalize(-vWorld);
float ndv=saturate(dot(N,V));
float fres=0.04+0.96*pow(1.0-ndv,5.0);
vec3 Rf=reflect(-V,N);
vec3 L=normalize(uLightPos-vWorld);
float spec=0.0,diffF=0.0,specF=0.0;
if(uLightI>0.0)spec=pow(saturate(dot(N,normalize(L+V))),90.0)*step(0.0,dot(N,L))*uLightI;
if(uFlashL>0.001){
vec3 Lf=vec3(uImpact*0.7,0.7)-vWorld;float dlf=length(Lf);Lf/=max(dlf,1e-4);
diffF=saturate(dot(N,Lf))*uFlashL/(1.0+dlf*dlf*2.5);
specF=pow(saturate(dot(N,normalize(Lf+V))),70.0)*uFlashL;
}
float tGlass=mix(1.1,6.0,fract(vInfo.x*3.7));
float pic=fract(vInfo.x*9.13)<0.5?1.0:1.0-smoothstep(tGlass,tGlass+0.3,vS);
vec3 Lr=normalize(vec3(-0.45,0.55,-0.7));
float relit=mix(1.0,(0.3+0.7*pow(saturate(dot(N,Lr))/0.7,1.4))*(0.82+0.3*fract(vInfo.x*5.17)),smoothstep(0.0,0.1,vS));
vec3 voidL=vec3(0.09,0.1,0.15)
+vec3(1.0,0.97,0.95)*0.75*saturate(dot(N,normalize(vec3(0.15,0.85,-0.5))))
+vec3(0.7,0.82,1.0)*0.35*saturate(dot(N,normalize(vec3(-0.72,-0.25,-0.65))))
+vec3(0.72,0.22,0.95)*0.24*saturate(dot(N,normalize(vec3(-0.55,0.45,-0.7))))
+vec3(0.08,0.62,0.95)*0.24*saturate(dot(N,normalize(vec3(0.62,-0.3,-0.72))));
vec3 lit=mix(vec3(relit),voidL*(0.82+0.3*fract(vInfo.x*5.17)),smoothstep(0.15,1.8,vS));
vec3 envR=vec3(0.0);
if(moved>0.0){
envR=envRefl(Rf)*moved;
vec2 sp=vUv*vec2(1.7,1.0);
envR*=0.9+0.2*texture(uNoise,vec3(sp*1.2,vInfo.x)).r;
float ph=dot(N,vec3(1.3,0.8,0.35))*2.2+vInfo.x*6.0;
float band=exp(-pow(fract(dot(sp,vec2(0.8,0.6))*2.2+ph)-0.5,2.0)*55.0);
envR+=vec3(0.8,0.85,1.0)*band*(0.15+0.75*pow(1.0-ndv,2.0))*moved*0.5;
}
float behind=smoothstep(PZ-0.05,PZ+0.05,vZ);
vec3 trans=vec3(0.0),refr=vec3(0.0);
if(uMoving>0.5&&moved>0.0){
vec2 ro=N.xy*0.045;
trans=vec3(texture(uVoid,clamp(suv-ro*0.9,0.0,1.0)).r,texture(uVoid,clamp(suv-ro,0.0,1.0)).g,texture(uVoid,clamp(suv-ro*1.1,0.0,1.0)).b);
refr=(trans-texture(uVoid,suv).rgb)*behind*(1.0-fres);
trans*=behind;
}
float cover=1.0;
vec3 glassT=vec3(0.84,0.92,1.0);
float epx=edge/aa;
if(kind<1.5)a*=mix(1.0,smoothstep(0.0,1.3,epx),moved);
float rimG=exp(-epx/1.6)*moved*uLightI*0.8;
vec3 rimC=vec3(0.78,0.86,1.0)*rimG*(0.5+2.2*pow(1.0-ndv,1.5)+2.6*saturate(dot(N,-L)))*(0.6+0.8*fract(vInfo.x*7.31));
float body=exp(-epx/9.0)*moved;
vec3 col;
if(kind<0.5){
vec3 picC=tex*lit+tex*trans*glassT*0.45;
picC=picC*(1.0-0.5*body)+vec3(0.04,0.1,0.09)*body*(0.4+uLightI);
vec2 lc=normalize(uLightPos.xy-vWorld.xy+1e-4);
picC*=1.0+0.22*moved*clamp(dot(vLoc,lc)*6.0,-1.0,1.0);
col=mix(refr+vec3(0.03,0.08,0.07)*body*uLightI,picC,pic);
cover=mix(min(1.0,0.05+fres+0.25*body),1.0,pic);
col+=envR*(0.07+0.93*fres)*(0.4+0.6*(1.0-pic*0.7));
col+=uTint*diffF*(tex*0.3*pic+0.025)+vec3(0.9,0.92,1.0)*specF*2.2*smoothstep(0.0,0.1,vS);
col+=vec3(0.85,0.9,1.0)*spec*6.0+rimC;
}else if(kind<1.5){
col=mix(refr,tex*lit*0.3+tex*trans*glassT*0.4,pic)+envR*(0.1+0.9*fres)+vec3(0.85,0.9,1.0)*spec*8.0+uTint*diffF*0.15+rimC*0.8;
cover=mix(min(1.0,0.05+fres+0.25*body),0.7,pic);
}else{
float rim=pow(1.0-ndv,2.0);
vec3 disp=0.5+0.5*cos(6.2831*(vec3(0.0,0.33,0.67)+ndv*1.7+vInfo.x));
col=trans*1.5+tex*0.12*pic+envR*0.7+mix(vec3(0.9,0.95,1.0),disp,0.4)*(spec*12.0+rim*0.8+0.18*uLightI)+uTint*diffF*0.8;
col+=uTint*uHeat*exp(-vS*1.6)*2.2;
}
float along=(texture(uNoise,vec3(vRest*2.4,vInfo.x)).r-0.5)*3.2;
float lineVar=0.35+0.65*smoothstep(-0.4,0.6,along)+0.8*pow(saturate(along),6.0);
vec2 nJ=texture(uNoise,vec3(vRest*8.7,0.61)).rg-0.5;
float jag=nJ.x*2.6+nJ.y*1.6;
float epj=max(epx+jag*(1.0-moved),0.0);
float line=1.0-smoothstep(0.45,1.7,epj);
float halo=exp(-epj/3.0);
float hair=0.0;
if(kind<0.5&&uHair>0.01&&uCrackR>0.0&&moved<1.0&&epx<26.0&&uCrackR-restD>-0.1){
vec2 g=vRest*55.0;vec2 ci=floor(g),cf=fract(g);
float f1=8.0,f2=8.0;
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
vec2 o=vec2(i,j);vec2 rp=o+hash22(ci+o)-cf;float dd=dot(rp,rp);
if(dd<f1){f2=f1;f1=dd;}else if(dd<f2)f2=dd;
}
float px2=(sqrt(f2)-sqrt(f1))/55.0/(rw*0.75);
hair=(1.0-smoothstep(0.3,1.1,px2))*exp(-epx/7.0)*smoothstep(0.15,0.4,along)*(1.0-moved)*uHair;
}
float heat=reveal*uCrackGlow+uHeat*exp(-vS*1.5);
float seam=0.0;
if(kind<0.5){
float rv=reveal*(1.0-moved)*uCrackVis;
col*=1.0-(line*0.8+hair*0.35)*rv;
vec3 lc=mix(uTint,vec3(0.95,0.93,1.0),0.6);
float leak=lineVar*lineVar*uCrackVis;
vec3 em=(lc*line*3.2*leak+uTint*halo*0.12*leak+lc*hair*0.5*leak)*heat;
col+=em;
seam=(line*1.2*leak+halo*0.08*leak)*heat;
}
float fog=1.0-exp(-max(vZ-1.0,0.0)*0.13);
if(fog>0.002){
vec3 vb=texture(uVoid,suv).rgb;
col=mix(col,vb*0.9*cover+uTint*0.006,fog*0.8);
a*=1.0-fog*0.55;
}
oColor=vec4(col*a,a*cover);
oAux=vec4(vVel,vZ,seam*a);
}`,$o=re+Ze+`
uniform float uTau;uniform float uAspect;uniform vec2 uImpact;uniform float uDelayK;uniform vec2 uHalf;uniform float uPxScale;
uniform float uCount;
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
life*=clamp((uCount-id)/300.0,0.0,1.0);
vCol=mix(vec3(0.62,0.74,1.0),vec3(1.0,0.92,0.98),h2.y)*(0.18+5.5*tw)*life;
vec4 c=project(P);
if(s<=0.0||life<0.003||P.z<0.15){gl_Position=vec4(2.0,2.0,2.0,1.0);gl_PointSize=1.0;return;}
gl_Position=c;
gl_PointSize=clamp(uPxScale*(1.0+1.6*h.y)/P.z,1.0,7.0);
}`,Jo=re+`
in vec3 vCol;layout(location=0)out vec4 oColor;
void main(){vec2 d=gl_PointCoord-0.5;float g=exp(-dot(d,d)*14.0);oColor=vec4(vCol*g,0.0);}`,ea=re+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;
void main(){
vec4 s=vec4(0.0);
for(int j=0;j<4;j++)for(int i=0;i<4;i++)s+=texture(uSrc,vUv+(vec2(i,j)-1.5)*uTexel*2.0);
outColor=s/16.0;
}`,ta=re+`
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
}`,oa=re+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;
void main(){
vec2 best=vec2(0.0);float bl=0.0;
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
vec2 v=texture(uSrc,vUv+vec2(i,j)*uTexel).xy;
float l=dot(v,v);if(l>bl){bl=l;best=v;}
}
outColor=vec4(best,0.0,1.0);
}`,aa=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uVoid;uniform sampler2D uMask;uniform sampler2D uShard;uniform sampler2D uAux;
uniform float uAspect;uniform float uER;uniform float uDom;uniform float uCrack;uniform float uShards;uniform vec2 uE;uniform vec3 uTint;
${vo}
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
}`,ra=re+Ze+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uCenter;uniform float uDensity;uniform float uDecay;uniform float uWeight;uniform int uSamples;uniform float uFrame;
void main(){
vec2 d=(vUv-uCenter)*uDensity/float(uSamples);
float j=ign(gl_FragCoord.xy,uFrame);
vec2 uv=vUv-d*j;
vec3 acc=vec3(0.0);float il=1.0;
for(int i=0;i<48;i++){if(i>=uSamples)break;acc+=texture(uSrc,uv).rgb*il;il*=uDecay;uv-=d;}
outColor=vec4(acc*uWeight,1.0);
}`,sa=se+`
in vec2 vUv;layout(location=0)out vec4 oC;layout(location=1)out vec4 oF;
uniform sampler2D uShard;uniform sampler2D uAux;uniform sampler2D uTile;
uniform vec2 uRes;uniform float uBlurMax;uniform float uFrame;uniform float uSideMax;
const float PZ=${Ut.toFixed(3)},HZ=${io.toFixed(3)};
void shardLayer(vec2 uvr,out vec4 sc,out float fP,out float fH){
vec4 c0=texture(uShard,uvr);vec4 a0=texture(uAux,uvr);
sc=c0;fP=step(a0.z,PZ);fH=step(a0.z,HZ);
float j=ign(gl_FragCoord.xy,uFrame);
vec2 vm=texture(uTile,uvr).xy*uRes;
float L=length(vm);
if(L<2.5)return;
int M=int(clamp(ceil(min(L,uBlurMax)*0.5/2.2),3.0,min(float(BLUR_SIDE),uSideMax)));
vec2 dir=vm/L;
vec2 vX=a0.xy*uRes;float vx=length(vX);
float own=smoothstep(0.25,0.75,c0.a)*smoothstep(0.5,2.0,vx);
if(own>0.0){vec2 dd=mix(dir,vX/max(vx,1e-4),own);float dn=length(dd);dir=dn>1e-4?dd/dn:dir;L=mix(L,max(vx,L*0.5),own);}
float hl=min(L,uBlurMax)*0.5;
float dl=max(hl/float(M),0.35);
vx=min(vx,uBlurMax);
float wc=min(1.0,dl/max(vx,1e-3));
float kc=1.0/(1.0+luma(c0.rgb)*0.4);
vec3 accC=c0.rgb*wc*kc;float accK=wc*kc,accW=wc,cov=c0.a*wc;
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
float kk=1.0/(1.0+luma(c.rgb)*0.4);
accC+=c.rgb*w*kk;accK+=w*kk;accW+=w;cov+=c.a*w;
aP+=c.a*w*step(ax.z,PZ);aH+=c.a*w*step(ax.z,HZ);
}
}
float sN=1.0/max(cov,1.0);
sc=vec4(accC/max(accK,1e-5)*accW*sN,cov*sN);
fP=cov>1e-4?aP/cov:fP;fH=cov>1e-4?aH/cov:fH;
}
void main(){vec4 sc;float fP,fH;shardLayer(vUv,sc,fP,fH);oC=sc;oF=vec4(fP,fH,smoothstep(2.5,8.0,length(texture(uTile,vUv).xy*uRes)),1.0);}`,la=se+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uNormals;
uniform sampler2D uVoid;uniform sampler2D uShard;uniform sampler2D uAux;uniform sampler2D uRays;uniform sampler2D uFrozen;
uniform vec2 uRes;uniform float uAspect;uniform float uTime;uniform float uFrame;
uniform float uDom;uniform float uDesat;uniform float uShards;uniform float uBlur;uniform float uER;uniform float uWarp;uniform float uZoom;
uniform float uRaysK;uniform float uStarK;uniform float uPxW;uniform float uDebug;uniform vec2 uMaskTexel;uniform vec2 uNTexel;
uniform float uStarN;uniform float uSeedCore;uniform vec3 uCrack;uniform float uQDetail;
${vo}uniform float uRecede;
uniform sampler2D uVoidLow;uniform sampler3D uNoise;uniform sampler2D uBlurC;uniform sampler2D uBlurF;uniform sampler2D uRoom;
uniform sampler2D uEnvB;uniform sampler2D uEnvS;uniform sampler2D uEnvN;uniform float uEnvH;uniform vec2 uVoidRes;uniform float uWrapK;
${Nt}
uniform vec2 uE;uniform vec2 uCam;uniform vec4 uSeed;uniform vec4 uShock;uniform vec3 uTint;
const float PZ=${Ut.toFixed(3)},HZ=${io.toFixed(3)};
vec3 stars(vec2 p){
vec3 acc=vec3(0.0);
for(int L=0;L<STAR_LAYERS;L++){
float fl=float(L);
float wL=clamp(uStarN-fl,0.0,1.0);
if(wL<=0.0)break;
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
acc+=c*b*gs*tw/(1.0+sl/uPxW*0.25)*min(magT*magR,3.0)*wL;
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
float dsK=uDesat*smoothstep(uCrack.z+0.15,uCrack.z-0.35,length(pr-uCrack.xy));
vec3 baseD=mix(base,vec3(luma(base)),dsK*(1.0-mBld));
vec3 outc=baseD;
if(uShards>0.5&&uDom<0.999){
vec4 rP=texture(uRoom,uvr);float kn=smoothstep(0.5,0.85,rP.a),dR=keyDist(toGamma(base),rP.rgb);
float mB=max(mBld,max(kn*smoothstep(0.07,0.16,dR),skinKey(base)*(1.0-kn*(1.0-smoothstep(0.03,0.08,dR)))));
vec3 frozen=toLinear(texture(uFrozen,uvr).rgb);
frozen=mix(frozen,vec3(luma(frozen)),dsK);
outc+=(sc.rgb-frozen*sc.a)*(1.0-mB);
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
float a=aM;vec3 Fin=baseP;vec3 Bg=baseP;float conf=0.0;
float notHand=(1.0-hh.x)*(1.0-wz);
float band=max(smoothstep(0.13,0.28,hgt)*(1.0-smoothstep(0.66,0.86,hgt)),
smoothstep(0.04,0.3,mS)*(1.0-smoothstep(0.86,0.985,mS)))*notHand;
float hz=smoothstep(0.62,0.76,hgt)*(1.0-smoothstep(0.95,0.995,hgt))*notHand*(1.0-band)*(1.0-smoothstep(0.75,0.93,m0));
float hole=0.0,bwK=0.0;
float kp=uRes.y/1080.0;
if(band>0.001||hz>0.001||(aM>0.002&&aM<0.998))Bg=toLinear(pullMip(uEnvB,pu,3.5,toGamma(baseP)));
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
vec2 ob=vec2(1.4,0.5)*kp/uRes,oc=vec2(-0.5,1.4)*kp/uRes;
vec3 bq=(baseP*2.0+texture(uBase,pu+ob).rgb+texture(uBase,pu-ob).rgb+texture(uBase,pu+oc).rgb+texture(uBase,pu-oc).rgb)/6.0;
vec3 FB=Fin-Bg;float fb2=max(dot(FB,FB),1e-5);
float acu=dot(bq-Bg,FB)/fb2;
float ac=clamp(acu,0.0,1.0);
float res=length(bq-Bg-FB*acu)/sqrt(fb2);
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
Fc=clamp(Fc,min(baseP,Fin)*0.55,max(baseP,Fin)*1.4+0.005);
Fc=capChroma(mix(Fin,Fc,smoothstep(0.15,0.65,aB)),Fin,1.08);
vec3 alb=mix(Fin,Fc,smoothstep(0.7,0.97,aB));
if(hh.w>0.001){
float aHc=mix(a,min(a,mix(max(apD,hcD),apD,onLD*smoothstep(0.025,0.06,sepD))),hConf);
vec3 Bl=toLinear(gBh),Fl=toLinear(gFh);
vec3 FcH=clamp((baseP-(1.0-aHc)*Bl)/max(aHc,0.02),min(baseP,Fl)*0.85,max(baseP,Fl)*1.15+0.004);
FcH=capChroma(mix(Fl,FcH,smoothstep(0.1,0.4,aHc)),Fl,1.1);
float wF=wz*onLD*(1.0-smoothstep(0.9,1.0,aHc));
Fc=mix(Fc,FcH,wF);alb=mix(alb,FcH,wF);
}
vec4 vt=texture(uVoid,uvr);
vec2 rp=pr-uE;float r=length(rp);float x=r-uER;
vec3 vcol=vec3(0.0);
if(a<0.999||wz>0.001){
vcol=uQDetail>0.0?mix(vt.rgb,texCR(uVoid,uvr,uVoidRes),uQDetail):vt.rgb;
vec2 qd=pr+uCam*0.6;
float d1=texture(uNoise,vec3(qd*1.9,uTime*0.004)).r,d2=uQDetail>0.0?texture(uNoise,vec3(qd*5.3+3.7,0.37+uTime*0.006)).g:0.5;
float det=(d1-0.5)*1.1+(d2-0.5)*0.7*uQDetail;
vcol*=max(0.0,0.85+det*0.8);
float disc=smoothstep(uPxW*1.5,-uPxW*1.5,x);
float ang=atan(rp.y,rp.x);
float asym=1.0+0.22*cos(ang-0.75);
vcol+=vec3(1.0,0.97,0.94)*exp(-max(x,0.0)/(uPxW*3.2+uER*0.004))*(1.0-disc)*16.0*asym*vt.a;
if(a<0.985&&(1.0-disc)*vt.a>0.01)vcol+=stars(pr)*(1.0-disc)*vt.a*uStarK;
}
vec3 person=vec3(0.0);
if(a>0.001){
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
vec3 grade=mix(vec3(0.71,0.72,0.78),vec3(0.84,0.85,0.9),toward);
person=Fc*grade+alb*envA*0.36+albR*envD*1.5*rimMask+vec3(0.8,0.88,1.0)*rimI*(0.03+albR*1.8);
vec2 sdp=(uvr-uSeed.xy)*vec2(uAspect,1.0);
vec3 Ls=vec3(-sdp,0.12);float dls=length(Ls);Ls/=dls;
person+=alb*uTint*saturate(dot(n,Ls))*uSeed.z*0.9/(1.0+dls*dls*40.0);
float wrapB=hasDir?pow(1.0-smoothstep(0.5,1.0,hgt),3.0):0.0;
float wrapH=min(saturate(a*(1.0-a)*2.6),0.4);
vec2 qo=uvr+dOut*16.0*kp/uRes;
if(wrapB>0.01&&hh.w>0.001&&hk<0.999){vec4 ho=handsHull(personUv(qo));wrapB*=1.0-max(ho.x,max(ho.y,ho.z)*0.8);}
float wrap=mix(wrapB,wrapH,hk)*a;
if(wrap>0.001){
vec4 vo=texture(uVoid,qo);
vec2 rpo=(qo-0.5)*vec2(uAspect,1.0)-uE;float xo=length(rpo)-uER;
vec3 limb=vec3(1.0,0.96,0.92)*exp(-max(xo,0.0)/(uER*0.06))*step(0.0,xo)*2.2*vo.a;
vec3 wl=mix(texture(uVoidLow,qo).rgb*1.3,vo.rgb,0.4)+limb;
vec3 wlH=texture(uVoidLow,uvr).rgb*1.3+vec3(1.0,0.96,0.92)*exp(-max(x,0.0)/(uER*0.06))*step(0.0,x)*2.2*vt.a;
wl=mix(wl,wlH,hk);
person+=wl*wrap/(1.0+luma(wl)*0.6)*0.3*uWrapK;
}
if(uDebug>7.5&&uDebug<8.5){outColor=vec4(wrap,rimI,(a<0.999?1.0:0.0),1.0);return;}
}
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
float core=exp(-l2/(rs*rs*0.0009))*uSeedCore;
float glow=1.0/(1.0+l2/(rs*rs*0.02));
float halo2=exp(-l2/(rs*rs*0.35));
float streak=exp(-abs(d.y)/(rs*0.006))*exp(-abs(d.x)/(rs*0.3));
float veil=1.0-(uDom>0.001?0.3:0.65)*mRays;
outc+=(vec3(1.0,0.97,1.0)*core*mix(2.6,1.4,mRays)+(uTint*glow*0.3+uTint*halo2*0.1+vec3(0.7,0.75,1.0)*streak*0.3)*veil)*uSeed.z*fl;
}
outc*=1.0+prof*vec3(-0.12,0.05,0.22);
outColor=vec4(max(outc,0.0),1.0);
}`,ca=re+Ze+`
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
}`;function ua(_,l){const le=l.createTexture();l.bindTexture(l.TEXTURE_3D,le),l.texStorage3D(l.TEXTURE_3D,1,l.RG8,128,128,128),l.texParameteri(l.TEXTURE_3D,l.TEXTURE_MIN_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_3D,l.TEXTURE_MAG_FILTER,l.LINEAR);for(const J of[l.TEXTURE_WRAP_S,l.TEXTURE_WRAP_T,l.TEXTURE_WRAP_R])l.texParameteri(l.TEXTURE_3D,J,l.REPEAT);l.bindTexture(l.TEXTURE_3D,null);const W=_.program(ca,{label:"domain noise bake"}),$e=l.createFramebuffer();l.bindFramebuffer(l.FRAMEBUFFER,$e),l.viewport(0,0,128,128),l.disable(l.BLEND),W.use();for(let J=0;J<128;J++)l.framebufferTextureLayer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0,le,0,J),W.set({uZ:(J+.5)/128,uPeriod:16}),_.fullscreen();return l.bindFramebuffer(l.FRAMEBUFFER,null),l.deleteFramebuffer($e),W.dispose(),le}function ia(_){const l=_.kit,t=_.gl,le=_.caps,W=!!_.mobile,$e=le.hdr==="rgba16f"||le.hdr==="rgba32f",J=W?260:440,_t=W?2200:6500,ho=W?5:8,po=W?4:5,xo=W?4:3,It=W?3:4,Ot=W?6:12,bo=W?34:48,xt=16,Je=.3,et=.26;let Q=null,qt=!1,tt=1;try{const o=new URLSearchParams(location.search);Q=o.get("domainview"),qt=o.has("domainprof")}catch{}const bt=qt?t.getExtension("EXT_disjoint_timer_query_webgl2"):null,ot={},at=[];let rt=null,Xt="";const ue=o=>{if(bt&&(rt&&(t.endQuery(bt.TIME_ELAPSED_EXT),at.push(rt),rt=null),o)){const s=t.createQuery();t.beginQuery(bt.TIME_ELAPSED_EXT,s),rt={q:s,name:Xt+":"+o}}},go=()=>{for(;at.length&&t.getQueryParameter(at[0].q,t.QUERY_RESULT_AVAILABLE);){const o=at.shift(),s=t.getQueryParameter(o.q,t.QUERY_RESULT)/1e6;t.deleteQuery(o.q);const r=ot[o.name]||(ot[o.name]={n:0,sum:0,list:[]});r.n++,r.sum+=s,r.list.push(s),r.list.length>240&&r.list.shift()}},G={freeze:l.program(Oo,{label:"domain freeze"}),room:l.program(Yo,{label:"domain room plate"}),maskAny:l.program(qo,{label:"domain mask probe"}),fill:l.program(Ko,{label:"domain matte fill"}),memc:l.program(jo,{label:"domain matte memory colour"}),handM:l.program(Vo,{label:"domain hand hull"}),henv:l.program(Go,{label:"domain hand surroundings"}),edge:l.program(Xo,{label:"domain edge probe"}),void:l.program(Wo,{label:"domain void"}),shard:l.program(Qo,{vs:Zo,label:"domain shards"}),glint:l.program(Jo,{vs:$o,label:"domain glints"}),tile:l.program(ta,{label:"domain tiles"}),box4:l.program(ea,{label:"domain ambient"}),neigh:l.program(oa,{label:"domain tile neighbours"}),raySrc:l.program(aa,{label:"domain ray source"}),radial:l.program(ra,{label:"domain radial"}),blur:l.program(sa.replace(/BLUR_SIDE/g,String(Ot)),{label:"domain motion blur"}),compose:l.program(la.replace("STAR_LAYERS",String(It)),{label:"domain compose"})},a={frozen:l.target(4,4,{format:"rgba8"}),roomA:l.target(4,4,{format:"rgba8"}),roomB:l.target(4,4,{format:"rgba8"}),maskAny:l.target(1,1,{format:"rgba8",filter:"nearest"}),fillA:l.target(4,4,{format:"rgba8"}),handM:l.target(4,4,{format:"rgba8"}),fillB:l.target(4,4,{format:"rgba8"}),memA:l.target(4,4,{format:"rgba8"}),memB:l.target(4,4,{format:"rgba8"}),void:l.target(4,4,{format:"hdr"}),voidLow:l.target(4,4,{format:"hdr"}),shardColor:l.target(4,4,{format:"hdr"}),shardAux:l.target(4,4,{format:"hdr",filter:"nearest"}),tileA:l.target(4,4,{format:"hdr",filter:"nearest"}),tileB:l.target(4,4,{format:"hdr"}),blurC:l.target(4,4,{format:"hdr"}),blurF:l.target(4,4,{format:"rgba8"}),raysA:l.target(4,4,{format:"hdr"}),raysB:l.target(4,4,{format:"hdr"}),black:l.target(2,2,{format:"rgba8"}),envB:l.target(4,4,{format:"rgba8"}),envS:l.target(4,4,{format:"rgba8"}),envN:l.target(4,4,{format:"rgba8"}),edge:l.target(2,1,{format:"rgba8",filter:"nearest"}),hold:l.target(4,4,{format:"hdr"})};a.black.clear(0,0,0,0);const st=ua(l,t),gt=t.createFramebuffer(),wt=[t.COLOR_ATTACHMENT0,t.COLOR_ATTACHMENT1,t.COLOR_ATTACHMENT2];let Vt=[null,null,null],Gt=!1;function wo(o,s){const r=[a.envB,a.envS,a.envN];for(const n of r)n.resize(o,s);r.every((n,i)=>n.tex===Vt[i])||(t.bindFramebuffer(t.FRAMEBUFFER,gt),r.forEach((n,i)=>{t.bindTexture(t.TEXTURE_2D,n.tex),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.framebufferTexture2D(t.FRAMEBUFFER,wt[i],t.TEXTURE_2D,n.tex,0),Vt[i]=n.tex}),t.bindTexture(t.TEXTURE_2D,null),t.drawBuffers(wt),Gt=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE,t.bindFramebuffer(t.FRAMEBUFFER,null))}const lt=t.createBuffer();t.bindBuffer(t.PIXEL_PACK_BUFFER,lt),t.bufferData(t.PIXEL_PACK_BUFFER,8,t.STREAM_READ),t.bindBuffer(t.PIXEL_PACK_BUFFER,null);const yt=new Uint8Array(8);let ve=null;const Kt=J*14*12,j=new Float32Array(Kt*pt),kt=t.createBuffer(),At=t.createVertexArray();t.bindVertexArray(At),t.bindBuffer(t.ARRAY_BUFFER,kt),t.bufferData(t.ARRAY_BUFFER,j.byteLength,t.DYNAMIC_DRAW);const yo=pt*4,Te=(o,s,r)=>{t.enableVertexAttribArray(o),t.vertexAttribPointer(o,s,t.FLOAT,!1,yo,r*4)};Te(0,3,0),Te(1,3,3),Te(2,2,6),Te(3,2,8),Te(4,4,10),Te(5,2,14),t.bindVertexArray(null),t.bindBuffer(t.ARRAY_BUFFER,null);const jt=t.createVertexArray();let ct=0;const Rt=t.createFramebuffer(),Ft=t.createRenderbuffer();let Yt=0,Wt=0,Et=!1,Zt=null,Qt=null;const Ne=[t.COLOR_ATTACHMENT0,t.COLOR_ATTACHMENT1],ko=[t.COLOR_ATTACHMENT0,t.NONE],Ao=new Float32Array([0,0,0,0]),Ro=new Float32Array([0,0,100,0]),Fo=new Float32Array([1]);function Eo(o,s){a.shardColor.resize(o,s),a.shardAux.resize(o,s),!(Yt===o&&Wt===s&&Zt===a.shardColor.tex&&Qt===a.shardAux.tex)&&(t.bindRenderbuffer(t.RENDERBUFFER,Ft),t.renderbufferStorage(t.RENDERBUFFER,t.DEPTH_COMPONENT24,o,s),t.bindRenderbuffer(t.RENDERBUFFER,null),t.bindFramebuffer(t.FRAMEBUFFER,Rt),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,a.shardColor.tex,0),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT1,t.TEXTURE_2D,a.shardAux.tex,0),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.RENDERBUFFER,Ft),t.drawBuffers(Ne),Et=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE,t.bindFramebuffer(t.FRAMEBUFFER,null),Yt=o,Wt=s,Zt=a.shardColor.tex,Qt=a.shardAux.tex)}const Mt=t.createFramebuffer();let $t=null,Jt=null,eo=!1;function Mo(o,s){a.blurC.resize(o,s),a.blurF.resize(o,s),!($t===a.blurC.tex&&Jt===a.blurF.tex)&&(t.bindFramebuffer(t.FRAMEBUFFER,Mt),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,a.blurC.tex,0),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT1,t.TEXTURE_2D,a.blurF.tex,0),t.drawBuffers(Ne),eo=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE,t.bindFramebuffer(t.FRAMEBUFFER,null),$t=a.blurC.tex,Jt=a.blurF.tex)}const Ae=new Float64Array(J+4),Re=new Float64Array(J+4);let ee=0;const To=new Float64Array(160),Do=new Float64Array(160),Fe=48,ut=new Int32Array(Fe*Fe),to=new Int32Array(J+4);let ne=1;const De=()=>{ne|=0,ne=ne+1831565813|0;let o=Math.imul(ne^ne>>>15,1|ne);return o=o+Math.imul(o^o>>>7,61|o)^o,((o^o>>>14)>>>0)/4294967296},T={valid:!1,ix:0,iy:0,u:.5,v:.5,aspect:0,at:0,count:0};function Bo(o,s,r,n,i,f,c){const b=f-n,h=c-i,k=(n+f)*.5,N=(i+c)*.5;let R=0;for(let g=0;g<s&&R<76;g++){const p=o[2*g],v=o[2*g+1],L=g+1===s?0:g+1,y=o[2*L],X=o[2*L+1],P=(p-k)*b+(v-N)*h,F=(y-k)*b+(X-N)*h;if(P<=0&&(r[2*R]=p,r[2*R+1]=v,R++),P<=0!=F<=0){const D=P/(P-F);r[2*R]=p+(y-p)*D,r[2*R+1]=v+(X-v)*D,R++}}return R}function Be(o,s,r,n){ne=Math.floor(n*1e3)^5369127|0;const i=(o-.5)*r,f=s-.5,c=-r/2-Je,b=r/2+Je,h=-.5-Je,k=.5+Je,N=Math.max(Math.hypot(c-i,h-f),Math.hypot(b-i,h-f),Math.hypot(c-i,k-f),Math.hypot(b-i,k-f)),R=W?205:360;let g=1.36,p=12,v=2.7;for(let y=0;y<8;y++){ee=0;const X=ne;Ae[ee]=i,Re[ee]=f,ee++;let P=.032,F=0,D=!1;for(;P<N+.12&&!D;){const K=Math.round(p+F*v),E=De()*uo;for(let M=0;M<K;M++){const x=E+(M+(De()-.5)*.7)*uo/K,S=P*(1+(De()-.5)*(g-1)*.9),U=i+Math.cos(x)*S,m=f+Math.sin(x)*S;if(!(U<c-.02||U>b+.02||m<h-.02||m>k+.02)){if(ee>=J){D=!0;break}Ae[ee]=U,Re[ee]=m,ee++}}P*=g*(.96+De()*.08),F++}if(!D&&ee<=R*1.25)break;ne=X,g*=1.06,v*=.88,p=Math.max(6,p-1)}const L=performance.now();zo(i,f,r,c,b,h,k),e.genMs=performance.now()-L,e.driftX=e.driftY=0,T.valid=!0,T.ix=i,T.iy=f,T.u=o,T.v=s,T.aspect=r,T.at=n,T.count=ee}function zo(o,s,r,n,i,f,c){const b=Math.max(.075,(i-n)/Fe,(c-f)/Fe),h=Math.min(Fe,Math.ceil((i-n)/b)+1),k=Math.min(Fe,Math.ceil((c-f)/b)+1);ut.fill(-1,0,h*k);const N=p=>C(Math.floor((p-n)/b),0,h-1),R=p=>C(Math.floor((p-f)/b),0,k-1);for(let p=0;p<ee;p++){const v=R(Re[p])*h+N(Ae[p]);to[p]=ut[v],ut[v]=p}let g=0;for(let p=0;p<ee;p++){let v=To,L=Do;v[0]=n,v[1]=f,v[2]=i,v[3]=f,v[4]=i,v[5]=c,v[6]=n,v[7]=c;let y=4;const X=N(Ae[p]),P=R(Re[p]);for(let w=0;w<Fe&&y>=3;w++){for(let A=P-w;A<=P+w;A++){if(A<0||A>=k)continue;const I=A===P-w||A===P+w;for(let H=X-w;H<=X+w;H+=I||w===0?1:2*w)if(!(H<0||H>=h)){for(let O=ut[A*h+H];O>=0;O=to[O]){if(O===p)continue;y=Bo(v,y,L,Ae[p],Re[p],Ae[O],Re[O]);const ae=v;if(v=L,L=ae,y<3)break}if(y<3)break}if(y<3)break}let z=0;for(let A=0;A<y;A++)z=Math.max(z,Math.hypot(v[2*A]-Ae[p],v[2*A+1]-Re[p]));if(w*b>=2*z)break}if(y<3)continue;if(y>no&&(y=no),g+y*12>Kt)break;let F=0,D=0,K=0;for(let w=0;w<y;w++){const z=w+1===y?0:w+1,A=v[2*w],I=v[2*w+1],H=v[2*z],O=v[2*z+1],ae=A*O-H*I;F+=ae,D+=(A+H)*ae,K+=(I+O)*ae}const E=F*.5;if(E<2e-6)continue;D/=3*F,K/=3*F;const M=C(Math.sqrt(E)*.03,.004,.007),x=De(),S=De(),U=Math.hypot(D-o,K-s),m=(w,z,A,I,H,O,ae,Ge,Ue,ht)=>{const q=g*pt;j[q]=w,j[q+1]=z,j[q+2]=A,j[q+3]=I,j[q+4]=H,j[q+5]=O,j[q+6]=D,j[q+7]=K,j[q+8]=ae/r+.5,j[q+9]=Ge+.5,j[q+10]=x,j[q+11]=U,j[q+12]=Ue,j[q+13]=ht,j[q+14]=E,j[q+15]=S,g++};for(let w=0;w<y;w++){const z=w+1===y?0:w+1,A=v[2*w],I=v[2*w+1],H=v[2*z],O=v[2*z+1],ae=H-A,Ge=O-I,Ue=Math.hypot(ae,Ge);if(Ue<1e-7)continue;const ht=Math.abs((A-D)*Ge-(I-K)*ae)/Ue,q=Ge/Ue,He=-ae/Ue,Ke=A-D,je=I-K,Ye=H-D,We=O-K;m(0,0,0,0,0,-1,D,K,0,ht),m(Ke,je,0,0,0,-1,A,I,0,0),m(Ye,We,0,0,0,-1,H,O,0,0),m(0,0,M,0,0,1,D,K,1,ht),m(Ye,We,M,0,0,1,H,O,1,0),m(Ke,je,M,0,0,1,A,I,1,0),m(Ke,je,0,q,He,0,A,I,2,0),m(Ye,We,M,q,He,0,H,O,2,0),m(Ye,We,0,q,He,0,H,O,2,0),m(Ke,je,0,q,He,0,A,I,2,0),m(Ke,je,M,q,He,0,A,I,2,0),m(Ye,We,M,q,He,0,H,O,2,0)}}ct=g,t.bindBuffer(t.ARRAY_BUFFER,kt),t.bufferSubData(t.ARRAY_BUFFER,0,j,0,g*pt),t.bindBuffer(t.ARRAY_BUFFER,null)}const e={phase:"idle",build:0,hold:0,clasped:!1,needRelease:!1,tau:0,tauPrev:0,tauRate:0,age:0,openHold:0,spread:0,settle:0,crackR:0,crackGlow:0,crackVis:1,regrow:1,desat:0,dom:0,intensity:1,flare:0,heat:0,flashL:0,shockT:9,shockW:0,shockX:0,shockY:0,flash:0,shake:0,aberr:0,warp:0,zoom:0,seedX:.5,seedY:.3,seedI:0,seedR:.12,seedCore:0,voidDiv:0,blurDiv:2,shardK:1,ex:0,ey:.12,er:.4,eTx:0,eTy:.12,eTr:.4,camX:0,camY:0,lastCloseAt:-9,lastMidX:.5,lastMidY:.35,prevD:0,prevTwo:!1,dDot:0,frozenLocked:!1,freezeNow:!1,time:0,aspect:16/9,pulse:0,lastThrow:[-9,-9],lastThrowDx:[0,0],forceDemo:!1,rec:0,pScale:1,recDepth:.14,ancX:.5,tauAtReturn:1,lonely:0,noPerson:0,srcVersion:-1,live:!1,roomReset:!0,personOk:!1,hw:new Float32Array(2),seen:new Uint8Array(2),fw:new Float32Array(2),force:0,forceP:0,lmSig:new Float64Array([-1,-1]),lmFresh:new Uint8Array(2),lmFrame:new Float64Array(2),hSpeed:new Float32Array(2),hSize:new Float32Array(2),srcF:-1,srcAt:0,srcDt:1/30,stale:new Float32Array(2),capDt:new Float32Array(2),driftX:0,driftY:0,openArmed:!1,notOpenT:0,recA:0,recB:.3,touch:1,edgeOk:!1,recEff:0,shiftY:0,chimeAt:new Float64Array(8),chimePitch:new Float64Array(8),chimeGain:new Float64Array(8)},de=[],ie={},nt={wrapK:1,filK:1.4},fe=new Float32Array(8),_e=new Float32Array(8),ze=new Float32Array(84),me=new Float32Array(4),Se=new Float32Array(2),he=new Float32Array(8),pe=new Float32Array(8),it=new Float32Array(84),xe=new Float32Array(8),be=new Float32Array(8),ft=new Float32Array(4),Tt=new Float32Array([.62,.5,1]),u={res:new Float32Array(2),texel:new Float32Array(2),E:new Float32Array(2),cam:new Float32Array(2),impact:new Float32Array(2),seed:new Float32Array(4),shock:new Float32Array(4),lightPos:new Float32Array(3),half:new Float32Array(2),center:new Float32Array(2),mtexel:new Float32Array(2),ntexel:new Float32Array(2),pt:new Float32Array([.5,0,0,.3]),drift:new Float32Array(2),voidRes:new Float32Array(2),fwd:new Float32Array([.14,.55]),crack:new Float32Array(3),sres:new Float32Array(2)},Ce={level:0,pitch:1},Le={level:0,tone:.5},oo={level:0};Be(.5,.3,_.state.width/Math.max(1,_.state.height),0),T.valid=!1;function ao(){e.phase="idle",e.build=0,e.hold=0,e.clasped=!1,e.needRelease=!1,e.tau=0,e.tauPrev=0,e.tauRate=0,e.age=0,e.openHold=0,e.spread=0,e.settle=0,e.crackR=0,e.crackGlow=0,e.crackVis=1,e.regrow=1,e.desat=0,e.dom=0,e.intensity=1,e.flare=0,e.heat=0,e.flashL=0,e.shockT=9,e.shockW=0,e.flash=0,e.shake=0,e.aberr=0,e.warp=0,e.zoom=0,e.seedI=0,e.lastCloseAt=-9,e.frozenLocked=!1,e.pulse=0,e.chimeAt.fill(0),e.chimeGain.fill(0),e.rec=0,e.pScale=1,e.lonely=0,e.noPerson=0,e.hw.fill(0),e.fw.fill(0),e.force=0,e.forceP=0,fe.fill(0),_e.fill(0),e.driftX=e.driftY=0,e.openArmed=!1,e.notOpenT=0,e.edgeOk=!1,e.touch=1,e.recEff=0,e.shiftY=0,e.lmSig.fill(-1),T.valid=!1}const ro=o=>{const s=C((o-e.recA)/(e.recB-e.recA),0,1);return 1+(1/e.pScale-1)*s*s*(3-2*s)},So=o=>{const s=1/e.pScale-1,r=C((o-e.recA)/(e.recB-e.recA),0,1);return o+s*((e.recB-e.recA)*(r*r*r-.5*r*r*r*r)+Math.max(o-e.recB,0))},Ie=o=>{const s=o-e.shiftY;if(e.pScale>.9999)return s;let r=s;for(let n=0;n<6;n++)r-=(So(r)-s)/ro(r);return r},mt=(o,s)=>e.pScale>.9999?o:e.ancX+(o-e.ancX)/ro(Ie(s));function Dt(o,s){if(o&&o.present){const r=C(o.top,.3,1),n=C(o.center[1],.05,.9),i=C((r-n)*.42,.07,.24)*e.pScale;e.eTx=(C(mt(o.center[0],r),.15,.85)-.5)*s,e.eTy=C(Ie(r)-i*1.15,.25,.85)-.5,e.eTr=Math.min(C(i*2.6,.26,.5),s*.62)}else e.eTx=0,e.eTy=.1,e.eTr=Math.min(.38,s*.6)}function Co(o){const s=[.07,.15,.24,.36,.5,.68];for(let r=0;r<s.length;r++)e.chimeAt[r]=o+s[r]*(.8+Math.random()*.4),e.chimePitch[r]=1.2+Math.random()*1.6,e.chimeGain[r]=.55-r*.07}function Bt(o,s){(!T.valid||Math.hypot((e.lastMidX-T.u)*e.aspect-e.driftX,e.lastMidY-T.v-e.driftY)>.05)&&Be(e.lastMidX,e.lastMidY,e.aspect,o),e.phase="domain",e.tau=0,e.tauPrev=0,e.age=0,e.openHold=0,e.spread=0,e.hold=0,e.lonely=0,e.noPerson=0,e.shockT=0,e.shockX=T.ix+e.driftX,e.shockY=T.iy+e.driftY,e.openArmed=!1,e.notOpenT=0,e.flash=1,e.shake=1,e.aberr=1,e.frozenLocked=!0,e.freezeNow=!0,e.heat=1,e.flashL=1,e.warp=1,e.zoom=0,e.needRelease=!0,e.crackVis=1,e.regrow=1,e.ancX=s.person&&s.person.present?C(s.person.center[0],.2,.8):.5;const r=e.live?!!(s.person&&s.person.present&&s.person.top<.95):e.aspect<1;e.recDepth=r?.14:0,Dt(s.person,e.aspect),e.ex=e.eTx,e.ey=e.eTy,e.er=e.eTr;const n=_.audio;n&&(n.impact({strength:1.3,pitch:.62}),n.chime({strength:.9,pitch:1.5}),n.whoosh({strength:.9,duration:1.3,up:!1})),Co(o)}function Ee(){e.phase==="domain"&&(e.phase="return",e.openHold=0,e.spread=0,e.tauAtReturn=Math.max(.05,e.tau),_.audio?.whoosh({strength:1,duration:.9,up:!0}))}function Lo(o,s,r,n){e.seen[0]=e.seen[1]=0;for(let i=0;i<o.length&&i<2;i++){const f=o[i],c=f.id===1?1:0,b=f.raw&&f.raw.length>=63?f.raw:f.points;let h=9,k=9,N=-9,R=-9;for(let P=0;P<21;P++){const F=b[P*3],D=b[P*3+1];it[P*4+c*2]=F,it[P*4+c*2+1]=D,F<h&&(h=F),F>N&&(N=F),D<k&&(k=D),D>R&&(R=D)}const g=b[0],p=b[1],v=g+(g-b[27])*2.2,L=p+(p-b[28])*2.2;xe[c*4]=g,xe[c*4+1]=p,xe[c*4+2]=v,xe[c*4+3]=L,h=Math.min(h,v),N=Math.max(N,v),k=Math.min(k,L),R=Math.max(R,L);const y=f.size*.66;be[c*4]=h-y/s,be[c*4+1]=k-y,be[c*4+2]=N+y/s,be[c*4+3]=R+y,me[c]=f.size,e.seen[c]=1;const X=f.seenAt!==void 0?f.seenAt:b[0]*7.31+b[25]*3.17+b[61];X!==e.lmSig[c]&&(f.seenAt!==void 0&&e.lmSig[c]>0&&(e.capDt[c]+=(C(f.seenAt-e.lmSig[c],1/120,.5)-e.capDt[c])*.3),e.lmSig[c]=X,e.lmFresh[c]=1),ft[c*2]=f.velocity[0],ft[c*2+1]=f.velocity[1],e.hSpeed[c]=f.speed,e.hSize[c]=Math.max(.04,f.size),e.hw[c]=n?1:0}for(let i=0;i<2;i++)e.seen[i]||(e.hw[i]=Math.max(0,e.hw[i]-r/.15))}function Po(o){const s=o.sourceFrame;s!==e.srcF&&(e.srcAt>0&&(e.srcDt+=(C(e.time-e.srcAt,1/120,.1)-e.srcDt)*.15),e.srcAt=e.time,e.srcF=s);for(let r=0;r<2;r++){e.lmFresh[r]&&(e.lmFrame[r]=s,e.lmFresh[r]=0);const n=e.live?C(s-e.lmFrame[r],0,8):0;e.stale[r]=n;const i=n*(e.capDt[r]>0?Math.max(e.capDt[r],e.srcDt):e.srcDt),f=ft[r*2]*i,c=ft[r*2+1]*i;for(let h=0;h<21;h++)ze[h*4+r*2]=it[h*4+r*2]+f,ze[h*4+r*2+1]=it[h*4+r*2+1]+c;pe[r*4]=xe[r*4]+f,pe[r*4+1]=xe[r*4+1]+c,pe[r*4+2]=xe[r*4+2]+f,pe[r*4+3]=xe[r*4+3]+c,he[r*4]=be[r*4]+f,he[r*4+1]=be[r*4+1]+c,he[r*4+2]=be[r*4+2]+f,he[r*4+3]=be[r*4+3]+c;const b=e.hSpeed[r]*i*.5/e.hSize[r];Se[r]=1-V(.15,.5,b),me[2+r]=e.hw[r]*(1-V(.6,1.2,b))*(1-V(4,7,n))}}function Uo(o){const s=o.time,r=C(o.dt||1/60,1/240,.05)*tt,n=(e.time>0?C(s-e.time,0,.25):r)*tt;e.time=s;const i=_.source;if(i&&i.version!==e.srcVersion){const x=e.srcVersion<0;e.srcVersion=i.version,e.roomReset=!0,x||ao()}const f=!!(i&&i.element&&i.element.tagName==="VIDEO");e.live=f;const c=_.state.width/Math.max(1,_.state.height);Math.abs(c-e.aspect)>.001&&(e.aspect=c,T.valid&&e.phase==="idle"&&(T.valid=!1));const b=o.hands,h=b.length===2;let k=99,N=e.lastMidX,R=e.lastMidY,g=.12,p=9;if(h){const x=b[0],S=b[1],U=Math.hypot((x.palm[0]-S.palm[0])*c,x.palm[1]-S.palm[1]);g=Math.max(.04,(x.size+S.size)*.5),k=U/g,N=(x.palm[0]+S.palm[0])*.5,R=(x.palm[1]+S.palm[1])*.5;for(let m=0;m<5;m++)for(let w=0;w<5;w++){const z=Math.hypot((x.tips[m][0]-S.tips[w][0])*c,x.tips[m][1]-S.tips[w][1]);z<p&&(p=z)}p/=g,e.dDot=e.prevTwo&&r>1e-5?e.dDot*.6+.4*(U-e.prevD)/r:e.prevTwo?e.dDot:0,e.prevD=U}else e.dDot*=.8;e.prevTwo=h,e.ratio=k,e.tipNear=p;const v=h?1-V(1.3,2.1,Math.min(k,p<1?1.25+p*1.6:99)):0;e.seedCore+=(v-e.seedCore)*(1-Math.exp(-n/.08)),Lo(b,c,n,f);const L=h&&(k<(e.clasped?1.75:1.4)||p<(e.clasped?.5:.36)&&k<3.4);h&&(k<2.4||p<.6)&&(e.lastCloseAt=s,e.lastMidX=N,e.lastMidY=R);const y=L||!h&&(e.phase==="idle"||e.phase==="build")&&s-e.lastCloseAt<.5&&e.build>.45;e.clasped=y;let X=!1;for(const x of o.events)if(x.type==="clap"&&(X=!0),x.type==="throw"){const S=x.hand?.id?1:0;e.lastThrow[S]=s,e.lastThrowDx[S]=x.direction?x.direction[0]:0}const P=h?1-V(1.2,3,Math.min(k,p<1?1.2+p*1.8:99)):0,F=_.audio,D=!f||o.person&&o.person.present;e.personOk=D;for(let x=0;x<8;x++)e.chimeGain[x]>0&&s>=e.chimeAt[x]&&(F?.chime({strength:e.chimeGain[x],pitch:e.chimePitch[x]}),e.chimeGain[x]=0);if(e.phase==="idle"||e.phase==="build"){const x=y?1:P,S=x>e.build?1.9:1.3;if(e.build+=C(x-e.build,-S*n,S*n),e.build>.02){const w=h?N:e.lastMidX,z=h?R:e.lastMidY;if(!T.valid)Be(w,z,c,s),e.regrow=0;else if(h){let A=(w-T.u)*c,I=z-T.v;const H=Math.hypot(A,I);if(H>et&&e.build<.25&&s-T.at>.3)Be(w,z,c,s),e.regrow=0;else{H>et&&(A*=et/H,I*=et/H);const O=1-Math.exp(-n/.07);e.driftX+=(A-e.driftX)*O,e.driftY+=(I-e.driftY)*O}}}e.regrow=Math.min(1,e.regrow+n/.3);const U=V(0,1,e.regrow);y?e.hold+=n:e.hold=Math.max(0,e.hold-n*1.5),e.phase=e.build>.004?"build":"idle",e.phase==="idle"&&T.valid&&s-T.at>.6&&(T.valid=!1);const m=e.build;e.crackR=(Math.pow(m,1.25)*1.35+V(0,.4,e.hold)*.5)*(.2+.8*U),e.crackGlow=m*m*.85+V(0,.4,e.hold)*.5,e.crackVis=U,e.desat=m*.5,e.seedX=h?N:e.lastMidX,e.seedY=h?R:e.lastMidY,e.seedI=V(.15,1,m)*(y?1.1:.85)*(f?1:.75),e.seedR=g,e.dom=0,e.tau=0,e.tauPrev=0,e.rec=0,e.pScale=1,e.frozenLocked||Dt(o.person,c),F&&(Ce.level=m*.75,Ce.pitch=.55+m*.9+V(0,.4,e.hold)*.3,F.layer("hum",Ce),Le.level=m*.28,Le.tone=.15+m*.5,F.layer("noise",Le),oo.level=m*m*.3,F.layer("crackle",oo)),D&&((e.hold>=.4||X&&e.build>.05)&&e.build>.3?Bt(s,o):X&&(e.build=Math.max(e.build,.5),Bt(s,o)))}else if(e.phase==="domain"||e.phase==="return"||e.phase==="settle"){if(e.age+=r,e.shockT+=r,e.tauPrev=e.tau,h&&(e.seedX=N,e.seedY=R,e.seedR=g),e.phase==="domain"){const m=1-.68*V(.12,.3,e.age)*(1-V(.75,1.35,e.age));e.tau+=r*m/(1+Math.max(0,e.tau-5)*.45),e.dom=Math.min(1,e.dom+r/.1),e.age>.12&&(e.rec+=(1-e.rec)*(1-Math.exp(-n/.9))),e.lonely=b.length>=2?0:e.lonely+n;const w=h&&b[0].open>.7&&b[1].open>.7&&b[0].facing>0&&b[1].facing>0&&k>3.4;if(!w&&e.age>.3?(e.notOpenT+=n,e.notOpenT>.2&&(e.openArmed=!0)):e.notOpenT=0,w&&e.dDot>.3&&e.age>Qe&&(e.openArmed=!0),e.age>Qe&&h?(w&&(e.openArmed||e.age>Qe+2)?e.openHold+=n:e.openHold=Math.max(0,e.openHold-n),e.dDot>1.5&&k>3.2?e.spread+=n:e.spread=0,(e.openHold>.45||e.spread>.07)&&Ee()):(e.openHold=Math.max(0,e.openHold-n),e.spread=0),e.age>Qe&&Math.abs(e.lastThrow[0]-e.lastThrow[1])<.3&&s-Math.max(e.lastThrow[0],e.lastThrow[1])<.1&&e.lastThrowDx[0]*e.lastThrowDx[1]<0&&Ee(),e.age>Qe)for(const z of o.events){if(z.type!=="throw"||!z.hand||!z.direction)continue;const A=o.person&&o.person.present?o.person.center[0]:.5;Math.sign(z.hand.palm[0]-A)*z.direction[0]>1.6&&Math.abs(z.direction[0])>Math.abs(z.direction[1])*.8&&Ee()}e.age>2&&e.lonely>10&&Ee(),e.age>35&&Ee(),f&&!(o.person&&o.person.present)?(e.noPerson+=n,e.noPerson>.8&&Ee()):e.noPerson=0,y||(e.needRelease=!1),y&&!e.needRelease?e.hold+=n:e.hold=Math.max(0,e.hold-n*2),e.age>1.5&&e.pulse<=0&&e.hold>0&&(e.seedI=Math.max(e.seedI,V(0,.4,e.hold)*.9)),e.hold>.4&&e.age>1.5&&e.pulse<=0&&(e.needRelease=!0,e.pulse=1,e.shockT=0,e.flash=.35,e.shake=.5,e.aberr=.6,e.hold=0,e.shockX=(mt(e.seedX,e.seedY)-.5)*c,e.shockY=Ie(e.seedY)-.5,F?.impact({strength:.8,pitch:.9}),F?.chime({strength:.6,pitch:2}))}else e.phase==="return"?(e.tau=Math.max(0,e.tau-r*(3+2.4*e.tau)),e.rec=Math.min(e.rec,e.tau/e.tauAtReturn),e.tau<=0&&(e.phase="settle",e.settle=0,e.flash=.45,e.shake=.7,e.aberr=.7,e.crackGlow=1,e.heat=0,e.rec=0,F?.impact({strength:1,pitch:1}),F?.chime({strength:.7,pitch:1.1}))):(e.settle+=r,e.rec=0,e.dom=Math.max(0,e.dom-r/.16),e.crackGlow*=Math.exp(-r*4.2),e.settle>1&&(e.phase="idle",e.build=0,T.valid=!1,e.frozenLocked=!1,e.crackGlow=0,e.crackR=0));r>1e-5&&(e.tauRate=(e.tau-e.tauPrev)/r),e.phase!=="settle"&&(e.crackR=3,e.crackGlow=Math.max(0,e.crackGlow-r*1.2)),e.pulse=Math.max(0,e.pulse-r*.5),e.desat=Math.max(0,e.desat-r*4),e.heat*=Math.exp(-r*1.2),e.flashL*=Math.exp(-r*2.2),e.intensity=1+.9*Math.exp(-e.age*3)+e.pulse*.75,e.flare=Math.exp(-e.age*1.8)+e.pulse*.8,e.warp=Math.exp(-e.age*1.5)+e.pulse*.4,e.zoom=e.phase==="domain"?1.4*(1-Math.exp(-e.age*1.2)):e.zoom*Math.exp(-r*3);const x=!h||k>2&&p>.6;e.phase==="domain"&&e.hold>0&&e.pulse<=0||(e.seedI*=Math.exp(-r*(x?1/.05:6)));const S=e.edgeOk?e.recDepth*(1-V(.8,1.2,c))*(1-V(.45,.6,e.touch)):0;e.recA+=(C(e.touch+.02,0,.6)-e.recA)*(1-Math.exp(-r/.4)),e.recB=e.recA+.3,e.recEff+=(S-e.recEff)*(1-Math.exp(-r/.35)),e.pScale=1-e.recEff*e.rec*(1+.03*Math.sin(s*.6)),e.shiftY=e.live?0:.2*(1-V(.75,1,c))*e.rec,o.person&&o.person.present&&(e.ancX+=(C(o.person.center[0],.2,.8)-e.ancX)*(1-Math.exp(-r/2.5))),Dt(o.person,c);const U=1-Math.exp(-r/1.4);if(e.ex+=(e.eTx-e.ex)*U,e.ey+=(e.eTy-e.ey)*U,e.er+=(e.eTr-e.er)*U,F){const m=e.phase==="settle"?Math.max(0,1-e.settle*1.5):1;Ce.level=.42*m+e.pulse*.3+V(0,.4,e.hold)*.2,Ce.pitch=.42+e.pulse*.2+V(0,.4,e.hold)*.25,F.layer("hum",Ce),Le.level=(.2+e.warp*.25)*m,Le.tone=.1+e.warp*.35,F.layer("noise",Le)}}let K=.025*Math.sin(s*.13)+.012*Math.sin(s*.31),E=.015*Math.cos(s*.11);o.person&&o.person.present&&(K-=(o.person.center[0]-.5)*c*.35,E-=(o.person.center[1]-.45)*.3),h&&(K-=(N-.5)*c*.06,E-=(R-.4)*.05);const M=1-Math.exp(-r/.45);e.camX+=(K-e.camX)*M,e.camY+=(E-e.camY)*M;{const x=C(mo*.5/r,0,1);for(let m=0;m<8;m++)_e[m]=fe[m];const S=e.force,U=e.phase==="domain"?V(.9,1.8,e.age):0;e.force+=(U-e.force)*(1-Math.exp(-r/(U>e.force?.4:.1))),e.forceP=e.force+(S-e.force)*x;for(let m=0;m<2;m++){let w=0;for(let z=0;z<b.length&&z<2;z++){const A=b[z];if((A.id===1?1:0)!==m)continue;let I=A.palm[0],H=A.palm[1];if(e.pScale<.9995||e.shiftY>1e-5){const O=Ie(H);I=mt(I,H),H=O}fe[m*4]=(I-.5)*c,fe[m*4+1]=H-.5,fe[m*4+2]=A.size*1.3,w=e.live?e.hw[m]:e.forceDemo?1:0}e.fw[m]+=(w-e.fw[m])*(1-Math.exp(-r/.2)),fe[m*4+3]=e.fw[m]}for(let m=0;m<8;m++)_e[m]=fe[m]+(_e[m]-fe[m])*x}e.flash*=Math.exp(-r*16),e.shake*=Math.exp(-r*7),e.aberr*=Math.exp(-r*6),e.shockW=e.shockT<1.6?Math.exp(-e.shockT*1.6)*(e.pulse>0?.7:1):0}const Z={},te={},zt={},B={},ge={},Oe={},St={},$={},we={},ye={},d={},ke={},Y={},so={},oe={},Me={},qe={},vt={},Pe={};function Ho(o,s){if(ve){if(t.getSyncParameter(ve,t.SYNC_STATUS)!==t.SIGNALED)return;t.deleteSync(ve),ve=null,t.bindBuffer(t.PIXEL_PACK_BUFFER,lt),t.getBufferSubData(t.PIXEL_PACK_BUFFER,0,yt),t.bindBuffer(t.PIXEL_PACK_BUFFER,null),e.touch=Math.max(yt[0],yt[4])/255,e.edgeOk=!0}!(o.aspect<1.2)||s==="idle"||o.frame%4||(l.pass(G.edge,a.edge,(vt.uMask=o.mask,vt)),t.bindBuffer(t.PIXEL_PACK_BUFFER,lt),t.readPixels(0,0,2,1,t.RGBA,t.UNSIGNED_BYTE,0),t.bindBuffer(t.PIXEL_PACK_BUFFER,null),t.bindFramebuffer(t.FRAMEBUFFER,null),ve=t.fenceSync(t.SYNC_GPU_COMMANDS_COMPLETE,0))}let lo=!1,Xe=0,Ct=!1,Ve=0,dt=0,Lt=!1,Pt=!1;const ce={exposure:1,vignette:.35,bloom:.05,filmic:0,grain:.03};function No(o){const s=_.source;if(s&&s.uploaded!==s.version&&Xe<1.5&&o.frame>2){Xe===0&&(Ct=Ve>0&&o.scene.width===Ve&&o.scene.height===dt,Ct&&(a.hold.resize(Ve,dt),o.copy(o.scene,a.hold))),Xe+=Math.max(o.dt,.001),(o.scene.width!==Ve||o.scene.height!==dt)&&o.copy(Ct?a.hold:o.base,o.scene);const n=o.post;n.exposure=ce.exposure,n.vignette=ce.vignette,n.bloom=ce.bloom,n.filmic=ce.filmic,n.grain=ce.grain;return}if(Xe>0&&a.hold.resize(4,4),Xe=0,Ve=o.scene.width,dt=o.scene.height,!lo){lo=!0;const n={phase:e.phase,tau:e.tau,tauPrev:e.tauPrev,tauRate:e.tauRate,dom:e.dom,crackGlow:e.crackGlow,frozenLocked:e.frozenLocked,valid:T.valid,rec:e.rec,pScale:e.pScale};T.valid||Be(.5,.3,o.aspect,0),e.phase="domain",e.tau=.4,e.tauPrev=.39,e.tauRate=1,e.dom=1,e.crackGlow=.5,e.frozenLocked=!1,e.rec=.5,e.pScale=.95;const i=o.post,f=[i.exposure,i.vignette,i.bloom,i.filmic,i.grain,i.flash,i.aberration,i.shake[0],i.shake[1]];Lt=!0;try{co(o),l.pass(G.edge,a.edge,(vt.uMask=o.mask,vt))}catch(c){console.error(c)}Lt=!1,[i.exposure,i.vignette,i.bloom,i.filmic,i.grain,i.flash,i.aberration,i.shake[0],i.shake[1]]=f,e.phase=n.phase,e.tau=n.tau,e.tauPrev=n.tauPrev,e.tauRate=n.tauRate,e.dom=n.dom,e.crackGlow=n.crackGlow,e.frozenLocked=n.frozenLocked,e.rec=n.rec,e.pScale=n.pScale,T.valid=n.valid}co(o);const r=o.post;ce.exposure=r.exposure,ce.vignette=r.vignette,ce.bloom=r.bloom,ce.filmic=r.filmic,ce.grain=r.grain}function co(o){const s=o.width,r=o.height,n=o.aspect,i=o.post,f=e.phase;Po(o);{const E=o.mask.width,M=o.mask.height;(a.roomA.width!==E||a.roomA.height!==M)&&(a.roomA.resize(E,M),a.roomB.resize(E,M),a.fillA.resize(E,M),a.fillB.resize(E,M),a.memA.resize(E,M),a.memB.resize(E,M),e.roomReset=!0),u.texel[0]=1/E,u.texel[1]=1/M,a.handM.resize(E,M),l.pass(G.handM,a.handM,(Me.uAspect=n,Me.uHandP=ze,Me.uHandR=me,Me.uHandC=Se,Me.uHandBox=he,Me.uArm=pe,Me)),l.pass(G.maskAny,a.maskAny,(so.uMask=o.mask,so)),l.pass(G.memc,a.memB,(Pe.uBase=o.base,Pe.uHandM=a.handM,Pe.uPrev=a.memA,Pe.uFill=e.roomReset?a.black:a.fillA,Pe.uReset=e.roomReset?1:0,Pe));{const U=a.memA;a.memA=a.memB,a.memB=U}l.pass(G.fill,a.fillB,(oe.uMemC=a.memA,oe.uTexel=u.texel,oe.uMask=o.mask,oe.uHandM=a.handM,oe.uRoom=a.roomA,oe.uBase=o.base,oe.uPrev=e.roomReset?a.black:a.fillA,oe.uAspect=n,oe.uDt=C(o.dt,0,.1),oe.uOn=e.live?1:0,oe));{const U=a.fillA;a.fillA=a.fillB,a.fillB=U}l.pass(G.room,a.roomB,(Y.uHandM=a.handM,Y.uFill=a.fillA,Y.uAny=a.maskAny,Y.uBase=o.base,Y.uMask=o.mask,Y.uPrev=a.roomA,Y.uTexel=u.texel,Y.uAspect=n,Y.uReset=e.roomReset?1:0,Y.uLearn=e.personOk?1:0,Y.uLive=e.live?1:0,Y.uHandP=ze,Y.uHandR=me,Y.uHandC=Se,Y.uHandBox=he,Y.uArm=pe,Y));const x=a.roomA;a.roomA=a.roomB,a.roomB=x,e.roomReset=!1;const S=me[2]>.004||me[3]>.004;if(Pt=!1,(S&&(f!=="idle"||e.seedI>=.002)||f!=="idle"&&f!=="build"||Lt)&&!ie.env&&(wo(E,M),Gt)){t.bindFramebuffer(t.FRAMEBUFFER,gt),t.viewport(0,0,E,M),t.drawBuffers(wt),t.disable(t.BLEND),G.henv.use().set((qe.uBase=o.base,qe.uMask=a.fillA,qe.uHandM=a.handM,qe.uTexel=u.texel,qe)),l.fullscreen(),t.bindFramebuffer(t.FRAMEBUFFER,null),t.activeTexture(t.TEXTURE0);for(const U of[a.envB,a.envS,a.envN])t.bindTexture(t.TEXTURE_2D,U.tex),t.generateMipmap(t.TEXTURE_2D);Pt=!0,t.bindTexture(t.TEXTURE_2D,null)}Ho(o,f)}if(f==="idle"&&e.seedI<.002){o.copy(o.base,o.scene);return}const c=f!=="idle"&&f!=="build",b=T.valid&&ct>0,h=c&&e.tau>5e-4,k=c&&e.pScale<.9995,N=c&&(k||e.shiftY>1e-5);u.res[0]=s,u.res[1]=r,u.impact[0]=T.ix+e.driftX,u.impact[1]=T.iy+e.driftY,u.drift[0]=e.driftX,u.drift[1]=e.driftY,u.E[0]=e.ex,u.E[1]=e.ey,u.cam[0]=e.camX,u.cam[1]=e.camY,u.pt[0]=e.ancX,u.pt[1]=k?1/e.pScale-1:0,u.pt[2]=e.recA,u.pt[3]=e.recB;const R=1/r,g=C(o.quality===void 0?1:o.quality,.2,1);Xt=f==="domain"&&e.age<1.4?"burst":f,go(),ue("normals");const p=o.normals();ue("freeze");const v=a.frozen.width!==s||a.frozen.height!==r;if(a.frozen.resize(s,r),(!e.frozenLocked||v||e.freezeNow)&&(e.freezeNow=!1,u.texel[0]=1/o.mask.width,u.texel[1]=1/o.mask.height,l.pass(G.freeze,a.frozen,(Z.uBase=o.base,Z.uPlate=o.plate,Z.uMask=a.fillA,Z.uRoom=a.roomA,Z.uTexel=u.texel,Z.uAspect=n,Z.uHandP=ze,Z.uHandR=me,Z.uHandC=Se,Z.uHandBox=he,Z.uArm=pe,Z.uEnvB=a.envB,Z.uEnvH=a.envB.height,Z.uEnvOk=Pt?1:0,Z))),ue("void"),c&&e.dom>0&&!ie.void){const E=xo*(1+.75*(1-g)/.8);(!e.voidDiv||Math.abs(E-e.voidDiv)>.35)&&(e.voidDiv=Math.round(E*2)/2);const M=nt.voidDiv||e.voidDiv;a.void.resize(Math.ceil(s/M),Math.ceil(r/M)),u.voidRes[0]=a.void.width,u.voidRes[1]=a.void.height,l.pass(G.void,a.void,(te.uNoise=st,te.uAspect=n,te.uTime=e.time,te.uER=e.er,te.uIntensity=e.intensity,te.uFlare=e.flare,te.uE=u.E,te.uCam=u.cam,te.uSlices=e.age<1.2||f==="return"?po:ho,te.uPxW=R*M,te.uFilK=nt.filK,te)),a.voidLow.resize(Math.ceil(a.void.width/8),Math.ceil(a.void.height/8)),u.texel[0]=1/a.void.width,u.texel[1]=1/a.void.height,l.pass(G.box4,a.voidLow,(zt.uSrc=a.void,zt.uTexel=u.texel,zt))}if(ue("shards"),b&&!ie.shards){const E=.55+.45*g;Math.abs(E-e.shardK)>.065&&(e.shardK=Math.min(1,Math.round(E*10)/10));const M=Math.ceil(s*e.shardK),x=Math.ceil(r*e.shardK);if(u.sres[0]=M,u.sres[1]=x,Eo(M,x),Et){t.bindFramebuffer(t.FRAMEBUFFER,Rt),t.viewport(0,0,M,x),t.drawBuffers(Ne),t.depthMask(!0),t.clearBufferfv(t.COLOR,0,Ao),t.clearBufferfv(t.COLOR,1,Ro),t.clearBufferfv(t.DEPTH,0,Fo),t.enable(t.DEPTH_TEST),t.depthFunc(t.LEQUAL),t.enable(t.CULL_FACE),t.cullFace(t.BACK),t.disable(t.BLEND),u.lightPos[0]=e.ex*8,u.lightPos[1]=e.ey*8,u.lightPos[2]=8;const S=1-V(.75,1,n);if(u.fwd[0]=.14+.2*S,u.fwd[1]=.55-.25*S,G.shard.use().set((B.uTau=e.tau,B.uTauPrev=h?e.tau-e.tauRate*mo*.5:e.tau,B.uVelK=2,B.uAspect=n,B.uDelayK=fo,B.uOpen=f==="build"?e.build*e.build:0,B.uContract=f==="build"?e.build*e.build:0,B.uImpact=u.impact,B.uDrift=u.drift,B.uHF=fe,B.uHFP=_e,B.uForce=e.force,B.uForceP=e.forceP,B.uFwd=u.fwd,B.uFrozen=a.frozen,B.uNoise=st,B.uVoid=c&&e.dom>0?a.void:a.black,B.uRes=u.sres,B.uCrackR=e.crackR,B.uCrackGlow=e.crackGlow,B.uDesat=e.desat,B.uHeat=e.heat,B.uPxW=R,B.uFlashL=e.flashL*3,B.uLightI=c?1:0,B.uMoving=h?1:0,B.uLightPos=u.lightPos,B.uTint=Tt,B.uCrackVis=f==="settle"?C(1-e.settle/.6,0,1):e.crackVis,B.uBuild=f==="settle"?e.build*C(1-e.settle/.6,0,1):e.build,B.uHair=V(.3,.6,g),B)),t.bindVertexArray(At),t.drawArrays(t.TRIANGLES,0,ct),h&&e.tau<9&&!ie.glints){t.drawBuffers(ko),t.depthMask(!1),t.disable(t.CULL_FACE),t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ONE),u.half[0]=n/2,u.half[1]=.5;const U=_t*(.3+.7*g);G.glint.use().set((ge.uTau=e.tau,ge.uAspect=n,ge.uImpact=u.impact,ge.uDelayK=fo,ge.uHalf=u.half,ge.uPxScale=2.2*x/1100,ge.uCount=U,ge)),t.bindVertexArray(jt),t.drawArrays(t.POINTS,0,Math.min(_t,Math.ceil(U))),t.disable(t.BLEND),t.depthMask(!0),t.drawBuffers(Ne)}t.bindVertexArray(null),t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),t.bindFramebuffer(t.FRAMEBUFFER,null)}}const L=b&&Et&&!ie.shards;ue("tiles");const y=L&&h&&$e&&!ie.blur;let X=!1;if(y){a.tileA.resize(Math.ceil(s/xt),Math.ceil(r/xt)),a.tileB.resize(a.tileA.width,a.tileA.height),u.texel[0]=1/s,u.texel[1]=1/r,l.pass(G.tile,a.tileA,(Oe.uSrc=a.shardAux,Oe.uTexel=u.texel,Oe.uN=4,Oe.uStride=xt/4,Oe)),u.texel[0]=1/a.tileA.width,u.texel[1]=1/a.tileA.height,l.pass(G.neigh,a.tileB,(St.uSrc=a.tileA,St.uTexel=u.texel,St)),ue("blur");const E=f==="return"||e.age<1.6;!W&&E&&g>=.9?e.blurDiv=1:(W||!E||g<.8)&&(e.blurDiv=2),Mo(Math.ceil(s/e.blurDiv),Math.ceil(r/e.blurDiv)),eo&&(t.bindFramebuffer(t.FRAMEBUFFER,Mt),t.viewport(0,0,a.blurC.width,a.blurC.height),t.drawBuffers(Ne),t.disable(t.BLEND),G.blur.use().set((ke.uShard=a.shardColor,ke.uAux=a.shardAux,ke.uTile=a.tileB,ke.uRes=u.res,ke.uBlurMax=bo*r/1080,ke.uFrame=o.frame,ke.uSideMax=Math.max(3,Math.round(Ot*(.35+.65*g))),ke)),l.fullscreen(),t.bindFramebuffer(t.FRAMEBUFFER,null),X=!0)}ue("rays");const P=!ie.rays&&(c&&e.dom>0||L&&e.crackGlow>.02);if(P){const E=Math.ceil(s/5),M=Math.ceil(r/5);a.raysA.resize(E,M),a.raysB.resize(E,M),l.pass(G.raySrc,a.raysA,($.uVoid=c&&e.dom>0?a.void:a.black,$.uMask=a.fillA,$.uShard=L?a.shardColor:a.black,$.uAux=L?a.shardAux:a.black,$.uAspect=n,$.uER=e.er,$.uDom=c?e.dom:0,$.uCrack=f==="settle"?.3:1,$.uShards=L?1:0,$.uE=u.E,$.uTint=Tt,$.uPT=u.pt,$.uPSh=c?e.shiftY:0,$)),c?(u.center[0]=e.ex/n+.5,u.center[1]=e.ey+.5):(u.center[0]=u.impact[0]/n+.5,u.center[1]=u.impact[1]+.5);const x=Math.round((W?18:24)*(.55+.45*g)),S=Math.round(12*(.6+.4*g));l.pass(G.radial,a.raysB,(we.uSrc=a.raysA,we.uCenter=u.center,we.uDensity=.92,we.uDecay=.965,we.uWeight=2.2/x,we.uSamples=x,we.uFrame=o.frame,we)),l.pass(G.radial,a.raysA,(ye.uSrc=a.raysB,ye.uCenter=u.center,ye.uDensity=.22,ye.uDecay=1,ye.uWeight=1/S,ye.uSamples=S,ye.uFrame=o.frame+17,ye))}if(ue("compose"),u.seed[0]=N?mt(e.seedX,e.seedY):e.seedX,u.seed[1]=N?Ie(e.seedY):e.seedY,u.seed[2]=e.seedI,u.seed[3]=e.seedR*(k?e.pScale:1),u.mtexel[0]=1/o.mask.width,u.mtexel[1]=1/o.mask.height,u.ntexel[0]=1/p.width,u.ntexel[1]=1/p.height,u.shock[0]=e.shockX,u.shock[1]=e.shockY,u.shock[2]=e.shockT*2.1,u.shock[3]=e.shockW,u.crack[0]=u.impact[0],u.crack[1]=u.impact[1],u.crack[2]=e.crackR,ie.compose){o.copy(o.base,o.scene);return}if(l.pass(G.compose,o.scene,(d.uBase=o.base,d.uMask=a.fillA,d.uNormals=p,d.uVoid=c&&e.dom>0?a.void:a.black,d.uShard=L?a.shardColor:a.black,d.uAux=L?a.shardAux:a.black,d.uBlurC=X?a.blurC:a.black,d.uBlurF=X?a.blurF:a.black,d.uRays=P?a.raysA:a.black,d.uFrozen=a.frozen,d.uRes=u.res,d.uAspect=n,d.uTime=e.time,d.uFrame=o.frame,d.uDom=c?e.dom:0,d.uDesat=e.desat,d.uShards=L?1:0,d.uBlur=X?1:0,d.uER=e.er,d.uWarp=e.warp,d.uZoom=e.zoom,d.uRaysK=P?c?1:.7:0,d.uStarK=1,d.uStarN=It*(.5+.5*g),d.uQDetail=V(.25,.5,g),d.uSeedCore=e.seedCore,d.uCrack=u.crack,d.uPxW=R,d.uDebug=Q==="matte"?1:Q==="matte2"?2:Q==="matte3"?3:Q==="hand"?4:Q==="hand2"?5:Q==="hand3"?6:Q==="hand4"?7:Q==="light"?8:Q==="fc"?9:0,d.uMaskTexel=u.mtexel,d.uNTexel=u.ntexel,d.uPT=u.pt,d.uPSh=c?e.shiftY:0,d.uRecede=e.rec,d.uVoidLow=c&&e.dom>0?a.voidLow:a.black,d.uHandP=ze,d.uHandR=me,d.uHandC=Se,d.uHandBox=he,d.uArm=pe,d.uNoise=st,d.uRoom=a.roomA,d.uEnvB=a.envB,d.uEnvS=a.envS,d.uEnvN=a.envN,d.uEnvH=a.envB.height,d.uVoidRes=u.voidRes,d.uWrapK=nt.wrapK,d.uE=u.E,d.uCam=u.cam,d.uSeed=u.seed,d.uShock=u.shock,d.uTint=Tt,d)),ue(null),Q){const E={aux:a.shardAux,shard:a.shardColor,void:a.void,rays:a.raysA,frozen:a.frozen,tile:a.tileB,emask:o.mask,eplate:o.plate,eplateL:o.plateLearned,base:o.base,room:a.roomA,fill:a.fillA}[Q];E&&o.copy(E,o.scene)}const F=f==="build"?e.build:0,D=c?e.dom:0;i.exposure=1-F*.12,i.vignette=.35+F*.25+D*.2,i.bloom=.05+F*.012+D*.09,i.filmic=D*.35,i.grain=.03+D*.012,i.flash=e.flash*.4,i.aberration=e.aberr*.014;const K=e.shake*.006;i.shake[0]=K*Math.sin(e.time*91.7),i.shake[1]=K*Math.cos(e.time*77.3)}function _o(o,s,r,n,i){const f=[],c=o%14,b=s<1,h=b?.8:.785,k=b?.8:.56,N=(v,L)=>f.push({pts:n(L,s,r[v]),side:L.side}),R=(v,L,y,X,P,F=.15)=>{const D=v/s;N(0,{x:L-D,y,size:F,roll:P,side:"left",curls:X}),N(1,{x:L+D,y:y+.004,size:F,roll:-P,side:"right",curls:X})},g=v=>v*v*(3-2*v),p=Io;if(c>=.8&&c<1.8)R(.36,h,k-.06+.03*g(C(c-.8,0,1)),i.relaxed,.35);else if(c>=1.8&&c<3.25){const v=g(C((c-1.8)/1.45,0,1));R(.36-.325*v,h,k-.03+.03*v,i.open,.35+.35*v)}else if(c>=3.25&&c<3.9)R(.035,h,k,i.open,.7);else if(c>=3.9&&c<4.8){const v=g(C((c-3.9)/.9,0,1));R(.035+.25*v,h-.08*v,k-.25*v,p,.7-.4*v)}else if(c>=9.5&&c<10.9){const v=g(C((c-9.5)/.4,0,1));R(.62,.5,.15+.17*v,i.open,.15)}return f}return{id:"domain",coach:[{gesture:"two",label:"Clasp hands",text:"press palms together"},{gesture:"open",label:"Open palms",text:"hold wide to return"},{gesture:"throw",label:"Spread fast",text:"or fling them apart"}],activeCues(o){return de.length=0,e.phase==="idle"||e.phase==="build"?(e.build>.05||e.clasped)&&de.push("two"):e.phase==="domain"?(e.openHold>.05&&de.push("open"),e.spread>0&&de.push("throw")):e.phase==="return"&&de.push("open"),de.length||de.push("none"),de},update:Uo,render:No,choreography:_o,reset:ao,dispose(){for(const o of Object.values(G))o.dispose();for(const o of Object.values(a))o.dispose();t.deleteTexture(st),t.deleteBuffer(kt),t.deleteVertexArray(At),t.deleteVertexArray(jt),t.deleteFramebuffer(Rt),t.deleteFramebuffer(Mt),t.deleteFramebuffer(gt),t.deleteRenderbuffer(Ft),t.deleteBuffer(lt),ve&&(t.deleteSync(ve),ve=null)},debug:{get state(){return e},get pattern(){return T},get targets(){return a},get vertCount(){return ct},get hands(){return{stale:[...e.stale],handC:[...Se],handR:[...me],srcDt:e.srcDt}},skip:ie,tune:nt,get view(){return Q},get timeScale(){return tt},set timeScale(o){tt=Math.max(0,+o||0)},set view(o){Q=o||null},get prof(){const o={};for(const s in ot){const r=[...ot[s].list].sort((n,i)=>n-i);o[s]=[+(r[0]||0).toFixed(2),+(r[r.length>>2]||0).toFixed(2),+(r[r.length>>1]||0).toFixed(2)]}return o},shatterNow(o,s=.5,r=.3){e.build=1,e.lastMidX=s,e.lastMidY=r,T.valid=!1,Be(s,r,e.aspect,e.time),Bt(e.time,o||{person:{present:!1}})},returnNow(){Ee()}}}}export{ia as createEffect};
