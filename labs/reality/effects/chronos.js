/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-f33a83525867 */(()=>{const v=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(v)||v.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as oe,COMMON as Fe}from"../engine/glsl.js?v=0aafddc6f3";const k=(v,w,i)=>Math.min(i,Math.max(w,v)),R=(v,w,i)=>{const G=k((i-v)/(w-v),0,1);return G*G*(3-2*G)},L=(v,w,i,G)=>v+(w-v)*(1-Math.exp(-i*G)),de=(v,w,i,G,N,I)=>{v[w*4]=i,v[w*4+1]=G,v[w*4+2]=N,v[w*4+3]=I},J=64,we=3,qe=1.5,lt=.8,nt=4.6,je=`
const vec3 AMB=vec3(0.36,0.41,0.52);
const vec3 SUNC=vec3(1.633,1.173,0.713);
const float LSCALE=${lt.toFixed(2)};
float wband(float x,float hw,float pen){return 1.0-smoothstep(hw-pen,hw+pen,abs(x));}
float panes(vec2 q,float pen){
  float x=mod(q.x,0.9)-0.45;
  float win=wband(x,0.31,pen*1.6)*wband(q.y-0.04,0.62,pen*2.0);
  float mull=1.0-wband(x,0.011,pen*0.7);
  float tr=(1.0-wband(q.y+0.17,0.012,pen*0.7))*(1.0-wband(q.y-0.23,0.012,pen*0.7));
  return win*mull*tr;
}
// The window light at screen uv for the light phase lx and clock T. n, Nw, mp: silhouette normal, its
// height and the matte at the (drifted) photo position. litc: the pane light alone (for the wall).
float windowLight(vec2 uv,float aspect,vec3 n,float Nw,float mp,float lx,float T,out float litc){
  vec2 p=(uv-0.5)*vec2(aspect,1.0);
  vec2 q=rot2(-0.42)*p/clamp(aspect/1.6,0.5,1.0);
  q.x+=lx;
  float mc=smoothstep(0.55,1.0,mp)*smoothstep(0.45,1.0,Nw);
  // the light wraps his features (normals), but skin/hair texture in the normals must not
  // turn the thin mullion shadows into wiggly scratches: gentler wrap, softer penumbra on him
  q+=n.xy*0.02*mc;
  float pen=mix(0.03,0.016,smoothstep(0.2,0.9,Nw))*(1.0+1.2*mc);
  float lit=panes(q,pen);
  float cloud=0.8+0.2*sin(T*0.4189+q.x*1.5)*sin(T*0.4189*2.0+1.3);
  vec3 L=normalize(vec3(-0.62,0.45,0.64));
  float ms=smoothstep(0.8,1.0,mp)*smoothstep(0.35,0.95,Nw);
  float shade=mix(1.0,0.5+0.75*max(dot(n,L),0.0),ms);
  litc=lit*cloud;
  return lit*shade*cloud;
}
vec2 xf(vec2 uv,vec2 off,float zoom,float roll,vec2 pivot,float aspect){
  vec2 p=(uv-pivot)*vec2(aspect,1.0);
  p=rot2(roll)*p/zoom;
  return p/vec2(aspect,1.0)+pivot-off;
}
`,ut=()=>oe+`
uniform float uAspect;
`+Xe+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform sampler2D uMask;uniform vec2 uStep;uniform float uAlphaLight;
void main(){
vec4 a=texture(uSrc,vUv+vec2(-uStep.x,-uStep.y)),b=texture(uSrc,vUv+vec2(uStep.x,-uStep.y));
vec4 c=texture(uSrc,vUv+vec2(-uStep.x,uStep.y)),d=texture(uSrc,vUv+vec2(uStep.x,uStep.y));
vec4 s=(a+b+c+d)*0.25;
float al=uAlphaLight>0.5?s.a:max(texture(uMask,vUv).r*0.6,presentMask(isoH(vUv)).z);
outColor=vec4(sqrt(clamp(s.rgb*(1.0/${qe.toFixed(2)}),0.0,1.0)),clamp(al,0.0,1.0));
}`,ft=oe+`
in vec2 vUv;out vec4 outColor;
uniform sampler2DArray uHist;uniform float uLayer;uniform vec2 uStep;
void main(){
outColor=0.25*(texture(uHist,vec3(vUv+vec2(-uStep.x,-uStep.y),uLayer))+texture(uHist,vec3(vUv+vec2(uStep.x,-uStep.y),uLayer))
+texture(uHist,vec3(vUv+vec2(-uStep.x,uStep.y),uLayer))+texture(uHist,vec3(vUv+uStep,uLayer)));
}`,pt=oe+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uCell;
void main(){
vec3 s=vec3(0.0);
for(int j=0;j<5;j++)for(int i=0;i<5;i++)s+=texture(uSrc,vUv+(vec2(float(i),float(j))/4.0-0.5)*uCell*1.6).rgb;
outColor=vec4(s/25.0,1.0);
}`,ht=oe+`
in vec2 vUv;out vec4 outColor;
uniform sampler2DArray uHist;uniform vec4 uRing;
void main(){
vec2 c=floor(vUv*8.0)/8.0;vec4 s=vec4(0.0);
for(int j=0;j<4;j++)for(int i=0;i<4;i++)s+=texture(uHist,vec3(c+(vec2(float(i),float(j))+0.5)/32.0,uRing.x));
outColor=s/16.0;
}`,dt=oe+Fe+je+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uNormals;
uniform vec4 uCam;uniform float uAspect;uniform float uT;uniform float uLx;
void main(){
vec2 uvB=xf(vUv,uCam.xy,uCam.z,uCam.w,vec2(0.5),uAspect);
vec3 c=texture(uBase,uvB).rgb;
float mp=smoothstep(0.25,0.85,texture(uMask,uvB).r);
vec4 N=texture(uNormals,uvB);
vec3 n=normalize(N.xyz*2.0-1.0);
float litc;
float Lt=windowLight(vUv,uAspect,n,N.w,mp,uLx,uT,litc);
vec3 col=c*(AMB+SUNC*Lt);
col+=vec3(0.06,0.045,0.03)*litc*(1.0-mp);
outColor=vec4(col,clamp(Lt*LSCALE,0.0,1.0));
}`,vt=oe+Fe+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uPrev;uniform vec2 uTexel;uniform float uDt;uniform float uAspect;
uniform vec4 uBrushA[2];
uniform vec4 uBrushB[2];
uniform vec4 uVel[2];
uniform vec4 uDecay;
uniform float uReset;uniform float uTime;
vec2 iso(vec2 uv){return(uv-0.5)*vec2(uAspect,1.0);}
float capsule(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.0,1.0);return length(pa-ba*h);}
void main(){
if(uReset>0.5){outColor=vec4(uDecay.y,0.0,0.0,0.0);return;}
vec2 p=iso(vUv);
vec2 v=vec2(0.0);
for(int i=0;i<2;i++){
vec4 V=uVel[i];if(V.w<=0.0)continue;
float d=length(p-iso(uBrushA[i].xy))/max(V.z,1e-3);
v+=V.xy*exp(-d*d)*V.w;
}
v+=curl2(vec3(p*3.0,uTime*0.15))*0.01;
vec2 src=vUv-v*uDt*0.45/vec2(uAspect,1.0);
vec4 F=texture(uPrev,src);
vec4 nb=(texture(uPrev,src+vec2(uTexel.x,0.0))+texture(uPrev,src-vec2(uTexel.x,0.0))
+texture(uPrev,src+vec2(0.0,uTexel.y))+texture(uPrev,src-vec2(0.0,uTexel.y)))*0.25;
F=mix(F,nb,1.0-exp(-uDt*5.0));
float R=min(F.r+uDt,uDecay.y),G=F.g;vec2 V=F.ba;
for(int i=0;i<2;i++){
vec4 A=uBrushA[i];if(A.w<=0.0)continue;
vec4 B=uBrushB[i];
float x=capsule(p,iso(B.xy),iso(A.xy))/max(A.z,1e-3);
float b=exp(-x*x*1.7)*A.w;
R*=1.0-b;
G=max(G,b);
V=mix(V,uVel[i].xy,clamp(b*2.0,0.0,1.0));
}
G=max(0.0,G*exp(-uDt*uDecay.x)-uDt*0.03);
outColor=vec4(R,G,V*(G>0.002?1.0:0.0));
}`,Xe=`
uniform vec4 uHand[2];   // live palm uv, size, weight
uniform vec4 uWrist[2];  // wrist uv
uniform vec4 uTips[5];   // ten fingertips (two per vec4)
vec2 tipAt(int j){vec4 v=uTips[j>>1];return (j&1)==0?v.xy:v.zw;}
float capsuleH(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.0,1.0);return length(pa-ba*h);}
vec2 isoH(vec2 uv){return (uv-0.5)*vec2(uAspect,1.0);}
vec4 presentMask(vec2 p){
  vec4 m=vec4(0.0);
  for(int h=0;h<2;h++){
    vec4 H=uHand[h]; if(H.w<=0.001) continue;
    vec2 c=isoH(H.xy); float s=H.z;
    if(length(p-c)>2.8*s) continue;
    float dm=length(p-c)-0.62*s;
    vec2 w=isoH(uWrist[h].xy);
    dm=min(dm,capsuleH(p,c,w+(w-c)*0.9)-0.4*s);
    for(int k=0;k<5;k++) dm=min(dm,capsuleH(p,c,isoH(tipAt(h*5+k)))-0.19*s);
    m=max(m,H.w*vec4(1.0-smoothstep(-0.02*s,0.2*s,dm),1.0-smoothstep(-0.16*s,-0.05*s,dm),1.0-smoothstep(-0.11*s,-0.03*s,dm),1.0-smoothstep(0.0,0.7*s,dm)));
  }
  return m;
}
`,mt=`
uniform sampler2DArray uHist;
uniform vec4 uLut[16];
uniform vec4 uRing;      // head layer, layer count, max age (s), history valid
uniform float uHistDt;   // mean interval between layers (s)
uniform sampler2DArray uHistL;   // the long, soft ring (rewind only)
uniform vec4 uLutL[16];
uniform vec4 uRingL;     // head layer, layer count, max age (s, from the sharp ring's newest layer), valid
uniform vec3 uHistQ;     // sharp ring size (texels), weight of its bicubic read (api.quality)
const float ENC=${qe.toFixed(2)};
// The sharp ring is coarser than the screen (≈ 3x on a desktop): where the past is shown as a picture
// (the rewind, the pool) it is read through a Catmull-Rom filter (five bilinear taps, the corners
// dropped), crisp like the camera instead of bilinear mush; quality fades it to one tap.
vec4 histCR(vec2 uv,float layer){
  vec2 sp=uv*uHistQ.xy, t1=floor(sp-0.5)+0.5, f=sp-t1;
  vec2 w0=f*(-0.5+f*(1.0-0.5*f)), w1=1.0+f*f*(-2.5+1.5*f), w2=f*(0.5+f*(2.0-1.5*f)), w3=f*f*(-0.5+0.5*f);
  vec2 w12=w1+w2;
  vec2 p0=(t1-1.0)/uHistQ.xy, p3=(t1+2.0)/uHistQ.xy, p12=(t1+w2/w12)/uHistQ.xy;
  float a0=w12.x*w0.y, a1=w0.x*w12.y, a2=w12.x*w12.y, a3=w3.x*w12.y, a4=w12.x*w3.y;
  vec4 r=texture(uHist,vec3(p12.x,p0.y,layer))*a0+texture(uHist,vec3(p0.x,p12.y,layer))*a1+texture(uHist,vec3(p12,layer))*a2
        +texture(uHist,vec3(p3.x,p12.y,layer))*a3+texture(uHist,vec3(p12.x,p3.y,layer))*a4;
  return max(r/(a0+a1+a2+a3+a4),0.0);
}
vec4 histTap(vec2 uv,float layer,float cr){
  if(cr>0.999) return histCR(uv,layer);
  vec4 b=texture(uHist,vec3(uv,layer));
  return cr>0.001?mix(b,histCR(uv,layer),cr):b;
}
float lutAt(int j){return uLut[j>>2][j&3];}
float lutLAt(int j){return uLutL[j>>2][j&3];}
float ageIndex(float age){
  float f=clamp(age/max(uRing.z,1e-3),0.0,1.0)*float(${J-1});
  int j=int(floor(f)); int j1=min(j+1,${J-1});
  return mix(lutAt(j),lutAt(j1),f-float(j));
}
float ageIndexL(float age){
  float f=clamp(age/max(uRingL.z,1e-3),0.0,1.0)*float(${J-1});
  int j=int(floor(f)); int j1=min(j+1,${J-1});
  return mix(lutLAt(j),lutLAt(j1),f-float(j));
}
// Past frame at an age, interpolated between layers; a = person matte (attract: window light).
vec4 histAQ(vec2 uv,float age,float cr){
  float k=ageIndex(age);
  float i0=floor(k), fr=k-i0, N=uRing.y;
  vec4 a=histTap(uv,mod(uRing.x-i0,N),cr);
  if(fr>0.002) a=mix(a,histTap(uv,mod(uRing.x-i0-1.0,N),cr),fr);
  return vec4(a.rgb*a.rgb*ENC,a.a);
}
vec4 histA(vec2 uv,float age){return histAQ(uv,age,0.0);}
vec3 hist(vec2 uv,float age){return histA(uv,age).rgb;}
vec3 histLong(vec2 uv,float age){
  float k=ageIndexL(age);
  float i0=floor(k), fr=k-i0, N=uRingL.y;
  vec4 a=texture(uHistL,vec3(uv,mod(uRingL.x-i0,N)));
  if(fr>0.002) a=mix(a,texture(uHistL,vec3(uv,mod(uRingL.x-i0-1.0,N))),fr);
  return a.rgb*a.rgb*ENC;
}
// Played back like footage (the rewind): mostly whole camera frames with a quick dissolve between
// them, so fast motion stays crisp instead of double-exposed. Beyond the sharp ring it hands over
// (softly) to the long one: the further back, the softer the past.
vec3 histSQ(vec2 uv,float age,float cr){
  float w=uRingL.w>0.5?smoothstep(uRing.z-0.3,uRing.z-0.06,age):0.0;
  vec3 s=vec3(0.0);
  if(w<0.999){
    float k=ageIndex(age);
    float i0=floor(k), fr=smoothstep(0.38,0.62,k-i0), N=uRing.y;
    vec4 a=histTap(uv,mod(uRing.x-i0,N),cr);
    if(fr>0.002) a=mix(a,histTap(uv,mod(uRing.x-i0-1.0,N),cr),fr);
    s=a.rgb*a.rgb*ENC;
  }
  if(w>0.001) s=mix(s,histLong(uv,age),w);
  return s;
}
vec3 histS(vec2 uv,float age){return histSQ(uv,age,0.0);}
// Motion-compensated: each of the two camera frames around the age is shifted along the local
// motion v (uv/s), so a moving hand plays back as a continuous smear, not stacked copies.
vec4 histMC(vec2 uv,float age,vec2 v){
  float k=ageIndex(age);
  float i0=floor(k), fr=k-i0, N=uRing.y;
  vec2 dv=v*uHistDt;
  vec4 a=texture(uHist,vec3(uv+dv*fr,mod(uRing.x-i0,N)));
  vec4 b=texture(uHist,vec3(uv-dv*(1.0-fr),mod(uRing.x-i0-1.0,N)));
  a=mix(a,b,fr);
  return vec4(a.rgb*a.rgb*ENC,a.a);
}
vec3 dec(vec4 s){return s.rgb*s.rgb*ENC;}
`,xt=oe+Fe+je+mt+`
uniform float uAspect;
`+Xe+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uField;uniform sampler2D uFreeze;uniform sampler2D uEnv;
uniform sampler2D uNormals;uniform sampler2D uMask;
uniform vec4 uTrailX;
uniform vec4 uTap[8];
uniform vec4 uTrailP;
uniform vec2 uFieldT;
uniform vec4 uGrad;
uniform vec4 uGradP;
uniform vec4 uGradS;
uniform vec4 uRip[3];
uniform vec4 uRipB[3];
uniform vec4 uRew;
uniform vec4 uRew2;
uniform vec4 uRew3;
uniform vec4 uRew4;
uniform vec4 uBub[2];
uniform vec4 uBubF;
uniform vec4 uTrail;
uniform vec4 uCam;
uniform float uTime,uFrame,uLight,uSplit,uStill,uCut,uT,uLx;
uniform vec2 uRes;
uniform float uCamPx;
uniform float uQ;
vec2 iso(vec2 uv){return(uv-0.5)*vec2(uAspect,1.0);}
vec2 uvOf(vec2 p){return p/vec2(uAspect,1.0)+0.5;}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.0)/k;return min(a,b)-h*h*k*0.25;}
const float SH_TIP=0.055;
float sheetH(float t,float Hm){float u2=clamp(2.0*t-1.0,-1.0,1.0);return SH_TIP+(Hm-SH_TIP)*(1.0-u2*u2);}
float sheetSD(vec2 p,vec2 a,vec2 abn,vec2 prp,float L,float Hm){
vec2 ap=p-a;float t=dot(ap,abn)/L,y=dot(ap,prp);
float u2=clamp(2.0*t-1.0,-1.0,1.0);
float H=sheetH(t,Hm),dH=4.0*(Hm-SH_TIP)*abs(u2)/L;
vec2 dq=vec2((abs(t-0.5)-0.5)*L-0.01,(abs(y)-H)/sqrt(1.0+dH*dH))+0.045;
return length(max(dq,0.0))+min(max(dq.x,dq.y),0.0)-0.045;
}
float agreeW(vec3 a,vec3 b){return 1.0-smoothstep(0.025,0.09,length(sqrt(max(a,0.0))-sqrt(max(b,0.0))));}
vec3 relight(vec3 c,vec3 Lp,float Ln){return c*(AMB+SUNC*Lp)/(AMB+SUNC*Ln);}
vec3 gN=vec3(0.0,0.0,1.0);float gNw=0.0,gMp=0.0;
float pastL(vec2 uv,float age){float lc;return windowLight(uv,uAspect,gN,gNw,gMp,uLx-0.18*age,uT-age,lc);}
float frameRho(vec2 v,vec2 c){
vec2 e=vec2(v.x>0.0?0.5*uAspect-c.x:c.x+0.5*uAspect,v.y>0.0?0.5-c.y:c.y+0.5);
vec2 nd=abs(v)/max(e,vec2(1e-3))*1.04;
vec2 n2=nd*nd;vec2 n4=n2*n2;vec2 n10=n4*n4*n2;
return pow(n10.x+n10.y+1e-12,0.1);
}
const vec3 HK=vec3(-0.2195,0.3240,0.9202),HF=vec3(0.2718,-0.2283,0.9349);
vec3 waveSpec(vec3 n){
float dk=max(dot(n,HK),0.0),df=max(dot(n,HF),0.0);
float sheen=clamp((dk-HK.z)/(1.0-HK.z),0.0,1.0);sheen*=sheen*sheen;
float gk=pow(dk,96.0),gf=pow(df,128.0);
return vec3(1.0,0.9,0.76)*(sheen*0.9+gk*3.4)+vec3(0.55,0.74,1.0)*gf*1.1;
}
float softbox(vec3 r,vec3 L,vec2 hs,float soft,out vec2 g){
vec3 U=normalize(cross(vec3(0.0,1.0,0.0),L)),V=cross(L,U);
float d=dot(r,L);
g=vec2(dot(r,U),dot(r,V))/max(d,0.05);
vec2 e=abs(g)/hs;e*=e;e*=e;
float s=pow(e.x+e.y,0.25);
return(1.0-smoothstep(1.0-soft,1.0+soft,s))*smoothstep(0.05,0.25,d);
}
vec3 dusk(vec3 c,float o){return mix(c,c*vec3(0.66,0.69,0.74),o);}
vec3 tunnelLevel(vec2 c,vec2 d,float g,float tw,float B,float rpos,float ast,float aaW){
float zm=pow(B,g);
vec2 sp=c+rot2(g*tw)*d*zm;
vec2 suv=uvOf(sp);
float age=rpos+g*ast;
float fp=zm*0.5/max(uTrailX.x*uRes.x,1e-4);
vec3 h=histSQ(clamp(suv,0.0,1.0),age,uHistQ.z*(1.0-smoothstep(0.7,1.1,fp)));
float wA=aaW*smoothstep(1.0,2.2,fp);
if(wA>0.001){
vec2 r1=vec2(0.36,0.13)*zm/uRes,r2=vec2(-0.13,0.36)*zm/uRes;
vec3 s=histS(clamp(suv+r1,0.0,1.0),age)+histS(clamp(suv-r1,0.0,1.0),age)+histS(clamp(suv+r2,0.0,1.0),age)+histS(clamp(suv-r2,0.0,1.0),age);
h=mix(h,(h*2.0+s)/6.0,wA);
}
vec2 eo=abs(suv-0.5);
float outside=smoothstep(0.495,0.52,max(eo.x,eo.y));
h*=mix(vec3(1.0),vec3(0.9,0.95,1.04),min(1.0,g*0.24))*pow(0.88,g);
return mix(h,vec3(0.012,0.013,0.016),outside);
}
void main(){
vec2 uv=vUv,p=iso(uv);
bool histOK=uRing.w>0.5;
float mNow=texture(uMask,uv).r;
float person=smoothstep(0.3,0.85,mNow);
vec4 hm=presentMask(p);
float handM=hm.x*mix(1.0,max(smoothstep(0.45,0.85,mNow),hm.y*0.9),uCut);
vec3 N=vec3(0.0,0.0,1.0);vec4 Nt=vec4(0.5,0.5,1.0,0.0);
if(uLight>0.5){Nt=texture(uNormals,uv);N=normalize(Nt.xyz*2.0-1.0);}
vec4 F=texture(uField,uv);
if(uStill>0.5){
vec2 uvB=xf(uv,uCam.xy,uCam.z,uCam.w,vec2(0.5),uAspect);
vec4 Nb=texture(uNormals,uvB);gN=normalize(Nb.xyz*2.0-1.0);gNw=Nb.w;
gMp=smoothstep(0.25,0.85,texture(uMask,uvB).r);
}
vec2 O=vec2(0.0);float chroma=0.0;
vec3 light=vec3(0.0);
vec3 glow=vec3(0.0);
vec3 glowF=vec3(0.0);
float dRip=0.0;
for(int i=0;i<3;i++){
vec4 R=uRip[i];if(R.w<=0.001)continue;
vec4 RB=uRipB[i];
vec2 dp=p-iso(R.xy);float r=length(dp);vec2 dir=dp/max(r,1e-4);
float front=R.z*1.15,w=0.022+0.028*min(R.z,1.0);
float x=(r-front)/w;
float env=R.w*exp(-R.z*0.62)*smoothstep(0.0,0.06,R.z)*(1.0-smoothstep(RB.x*0.45,RB.x,front));
if(env<0.001 ||(abs(x)>5.0 && abs(x+2.4)>6.0))continue;
float uneven=0.6+0.4*snoise(vec3(dir*2.2,R.z*1.6+float(i)*7.0));
float g=exp(-0.5*x*x);
float slope=-x*g*env;
O+=dir*slope*0.065;
chroma=max(chroma,g*env*RB.y);
float xb=x+2.4;dRip+=env*exp(-0.22*xb*xb)*0.5;
vec3 spec=waveSpec(normalize(vec3(-dir*slope*1.6,1.0)));
float ds=0.15*RB.y;
vec3 xx=vec3(x-ds,x,x+ds)*1.26;
vec3 rc=(1.0-xx*xx)*exp(-0.5*xx*xx);
vec3 Ld=normalize(vec3(-dir*0.75,0.65));
light+=rc*env*0.6*(0.6+0.4*uneven)+spec*env*1.1*max(dot(N,Ld),0.0)*person;
glow+=spec*(0.5+0.5*uneven)*env*0.3;
}
if(uStill>0.5 && F.g>0.03 && uRew.x<0.002){
vec2 e1=vec2(uFieldT.x*1.5,0.0),e2=vec2(0.0,uFieldT.y*1.5);
float dx=texture(uField,uv+e1).g-texture(uField,uv-e1).g;
float dy=texture(uField,uv+e2).g-texture(uField,uv-e2).g;
vec2 gD=vec2(dx/(3.0*uFieldT.x*uAspect),dy/(3.0*uFieldT.y));
vec2 sl=gD*0.002*smoothstep(0.03,0.3,F.g);
float sL=length(sl);if(sL>0.012)sl*=0.012/sL;
O+=sl;
chroma=max(chroma,min(sL*20.0,0.45));
}
float wipeGate=1.0;
if(uRew3.z>0.5){
vec2 dp=p-iso(uRew4.xy);float r=length(dp);vec2 dir=dp/max(r,1e-4);
float w=0.018+0.03*min(uRew3.y,1.0);
float x=(r-uRew3.y)/w;
float s=smoothstep(-0.7,0.7,x);
wipeGate=uRew3.z<1.5?1.0-s:s;
float env=(1.0-smoothstep(1.4,2.4,uRew3.y))*smoothstep(0.0,0.08,uRew3.y);
float g=exp(-0.5*x*x);
float slope=-x*g*env;
O+=dir*slope*0.03;
chroma=max(chroma,g*env*0.35);
vec3 wc=uRew3.z<1.5?vec3(0.62,0.8,1.0):vec3(1.0,0.86,0.66);
vec3 spec=waveSpec(normalize(vec3(-dir*slope*1.4,1.0)))*wc;
vec3 xx=vec3(x-0.12,x,x+0.12)*1.48;
vec3 rc=mix(vec3(1.0),wc,0.5)*(1.0-xx*xx)*exp(-0.5*xx*xx);
vec3 Ld=normalize(vec3(-dir*0.75,0.65));
light+=rc*env*0.8+spec*env*0.9*max(dot(N,Ld),0.0)*person;
glow+=spec*env*0.4;
}
float rwL=uRew.x*wipeGate;
float gradD=0.0,bandW=0.0,pulse=0.0,tk=0.0,og=0.0,shIn=0.0,shFr=0.0,shRim=0.0;
vec3 shN=vec3(0.0,0.0,1.0);vec2 shN2=vec2(0.0);
if(uGradP.y>0.001){
vec2 a=iso(uGrad.xy),b=iso(uGrad.zw),ab=b-a;
float L=max(length(ab),0.06);vec2 abn=ab/L,prp=vec2(-abn.y,abn.x);
vec2 ap=p-a;
float sdS=sheetSD(p,a,abn,prp,L,uGradS.x);
if(sdS<0.012){
float keepH=1.0-smoothstep(0.0,0.6,hm.x)*uCut;
float H=sheetH(dot(ap,abn)/L,uGradS.x);
const float ES=0.0015;
vec2 gS=vec2(sheetSD(p+vec2(ES,0.0),a,abn,prp,L,uGradS.x)-sheetSD(p-vec2(ES,0.0),a,abn,prp,L,uGradS.x),
sheetSD(p+vec2(0.0,ES),a,abn,prp,L,uGradS.x)-sheetSD(p-vec2(0.0,ES),a,abn,prp,L,uGradS.x));
shN2=gS/max(length(gS),1e-6);
float Rr=min(0.06,0.6*H);
float xin=Rr-clamp(-sdS,0.0,Rr);
shN=normalize(vec3(shN2*xin,sqrt(max(Rr*Rr-xin*xin,0.0))+1e-4));
float eW=max(0.0018,uCamPx*0.8);
shIn=(1.0-smoothstep(-eW,eW,sdS))*uGradP.y;
shFr=0.04+0.96*pow(1.0-shN.z,5.0);
shRim=exp(-sdS*sdS/(eW*eW*0.8))*uGradP.y;
float er=xin/max(Rr,1e-4);
O-=shN2*Rr*0.45*er*er*shIn*keepH;
chroma=max(chroma,0.15*er*er*shIn);
float fD=min(0.05+uGradP.x*mix(0.12,0.2,uStill),0.85*H);
float dep=smoothstep(0.0,1.0,clamp(-sdS/fD,0.0,1.0));
float bandWD=dep*uGradP.y;
bandW=shIn*smoothstep(0.0,0.045,-sdS);
if(bandWD>0.002){
float dA=length(ap),x=dA/L;
tk=min(x,1.0);
float v=uGradP.x*x*(0.45+0.55*x);
float g=pow(1.0+pow(v/uGradS.w,4.0),-0.25);
float gd0=v*g;
gradD=gd0*bandWD;
og=clamp(gd0/max(uGradP.x,1e-3),0.0,1.0)*bandWD;
float per=uGradS.z;
float g2=g*g;
float slope=max(uGradP.x*(0.45+1.1*x)/L*g2*g2*g,0.05);
vec2 dirA=ap/max(dA,1e-4);
float cyc=(uGradP.z-gd0)/per+Nt.w*person*0.04*slope/per;
float phi=(fract(cyc+0.5)-0.5)*per;
float wT=clamp(mix(0.07,0.05,tk)*slope,0.01,per*0.14);
float fz=phi/wT;
float flash=exp(-fz*fz)+0.25*exp(-max(phi,0.0)/(2.5*wT))*smoothstep(-wT,0.0,phi)*(1.0-smoothstep(0.6,0.98,phi/(0.5*per)));
float uneven=0.78+0.22*snoise(vec3(dirA*2.4,floor(cyc+0.5)*3.7));
float env=bandW*uGradP.w*smoothstep(0.06,0.24,tk)*uneven;
pulse=flash*env;
vec3 pc=mix(vec3(1.0,0.74,0.44),vec3(0.46,0.68,1.0),smoothstep(0.15,1.0,tk));
vec3 Ld=normalize(vec3(-dirA*0.2,0.95));
float fall=1.0/(1.0+dA*dA*0.8);
light+=pc*pulse*mix(5.0,3.6,uStill)*(0.45+0.55*max(dot(N,Ld),0.0))*fall*(0.3+0.7*person);
float sw=-2.0*fz*exp(-fz*fz)*env;
O+=dirA*sw*0.006*keepH;
vec3 wsp=waveSpec(normalize(vec3(-dirA*sw*0.9,1.0)));
glow+=(pc*flash*0.3+wsp*0.1)*env*fall*(1.0-0.85*person);
float ph=(uGradP.z-gd0)/0.11;
float ring=sin(6.2832*ph);
float rA=bandW*smoothstep(0.08,0.3,tk)*(0.35+0.65*tk)*uGradP.w;
O+=dirA*ring*min(0.002,0.0012/slope)*rA*keepH;
glow+=pc*pow(0.5+0.5*ring,16.0)*rA*0.02;
O+=(0.5*(a+b)-p)*0.05*bandW*(0.35+0.65*clamp(gd0/max(uGradP.x,1e-3),0.0,1.0))*keepH;
}
}
}
float oL=length(O);if(oL>0.03)O*=0.03/oL;
vec2 q=O/vec2(uAspect,1.0);
vec3 cur;vec4 c0;
if(oL>1e-5){
float k=0.035+0.14*chroma;
c0=texture(uBase,uv+q);
cur=vec3(texture(uBase,uv+q*(1.0-k)).r,c0.g,texture(uBase,uv+q*(1.0+k)).b);
}else{c0=texture(uBase,uv);cur=c0.rgb;}
float Ln=c0.a/LSCALE;
vec3 col=cur;
float bandD=(gradD+dRip)*(1.0-rwL);
vec3 now=cur;
float dW=smoothstep(0.3,0.6,uQ);
if(histOK && dW>0.001 &&((bandD>0.003 && uStill<0.5)|| rwL>0.001)){
vec2 o=uTrailX.xy*(1.0-0.3*uHistQ.z),o2=vec2(o.x,-o.y);
now=(texture(uBase,uv+q+o).rgb+texture(uBase,uv+q-o).rgb+texture(uBase,uv+q+o2).rgb+texture(uBase,uv+q-o2).rgb)*0.25;
now=mix(cur,now,dW);
}
if(histOK && bandD>0.003){
float s=(uStill>0.5?0.02:0.014)*uSplit*smoothstep(0.05,0.4,bandD);
vec3 h;float diff=0.0,hm=0.0;
if(uStill>0.5){
vec2 su=uv+q;
float l1=pastL(su,bandD);
h=relight(cur,s>0.0?vec3(pastL(su,max(0.0,bandD-s)),l1,pastL(su,bandD+s)):vec3(l1),Ln);
}else{
vec4 hC=histAQ(uv+q,bandD,uHistQ.z);
h=hC.rgb;hm=hC.a;
if(s>0.0){
vec4 hA=histA(uv+q,max(0.0,bandD-s)),hB=histA(uv+q,bandD+s);
diff=length(sqrt(hA.rgb)-sqrt(hB.rgb));
h=mix(h,vec3(hA.r,h.g,hB.b),0.7*smoothstep(0.05,0.14,diff));
hm=max(hA.a,hB.a);
}
h+=(cur-now)*agreeW(h,now);
}
col=mix(col,h,smoothstep(0.0,0.035,bandD));
col=mix(col,vec3(luma(col)),0.15*og)*mix(vec3(1.0),vec3(0.93,0.97,1.05),og);
if(uStill<0.5){
float te=smoothstep(0.08,0.3,diff)*bandW*smoothstep(0.25,0.5,hm);
glow+=mix(vec3(1.0,0.86,0.66),vec3(0.62,0.78,1.0),tk)*te*(0.05+1.6*pulse);
}
}
if(shIn+shRim>0.002){
vec2 tg=vec2(-shN2.y,shN2.x);
vec2 ro=shN2*0.05/vec2(uAspect,1.0),rt=tg*0.035/vec2(uAspect,1.0);
vec3 envR=(texture(uEnv,clamp(uv+ro+rt,0.0,1.0)).rgb+texture(uEnv,clamp(uv+ro-rt,0.0,1.0)).rgb)*(0.75/2.0);
col=mix(col,envR*vec3(0.92,0.97,1.03),min(shFr,0.4)*shIn*(1.0-handM));
float dk=max(dot(shN,HK),0.0),df=max(dot(shN,HF),0.0);
float shS=clamp((dk-HK.z)/(1.0-HK.z),0.0,1.0);
glow+=(vec3(1.0,0.93,0.82)*(pow(dk,260.0)*2.6+shS*shS*shS*0.1)+vec3(0.6,0.78,1.0)*pow(df,220.0)*0.8)*shIn;
float keyF=max(dot(shN2,vec2(-0.62,0.78)),0.0);
glow+=vec3(0.82,0.9,1.0)*shRim*(0.05+0.4*keyF*keyF);
}
if(uStill>0.5){
float Dm=(F.r*1.4+0.08)*0.62;
float A=smoothstep(0.05,0.4,F.g)*(1.0-smoothstep(0.7,1.15,F.r))*(1.0-rwL);
if(A>0.002){
vec2 drag=F.ba*min(1.0,0.6/max(length(F.ba),1e-4))/vec2(uAspect,1.0)*0.55*Dm;
vec2 su=uv+q+drag;
float l1=pastL(su,Dm);
col=mix(col,relight(col,uSplit>0.5?vec3(pastL(su,Dm*0.95),l1,pastL(su,Dm*1.05)):vec3(l1),Ln),A);
}
}
float trOld=0.0;
if(uStill<0.5 && histOK && uTrailX.z>0.5 && rwL<0.999 && F.g>0.02){
float nearH=0.0;
for(int h=0;h<2;h++){
vec4 Hh=uHand[h];if(Hh.w<=0.001)continue;
nearH=max(nearH,Hh.w*(1.0-smoothstep(1.3*Hh.z,2.1*Hh.z,length(p-iso(Hh.xy)))));
}
float gate=smoothstep(0.02,0.3,F.g)*(1.0-smoothstep(uTrailP.z,uTrailP.z+0.3,F.r))*(1.0-smoothstep(0.05,0.5,hm.x))
*(1.0-0.8*hm.w)*(1.0-smoothstep(0.25,0.65,mNow)*nearH)*(1.0-rwL);
if(gate>0.002){
vec2 v=F.ba;float vl=length(v);if(vl>3.0)v*=3.0/vl;
v/=vec2(uAspect,1.0);
vec2 sw=curl2(vec3(p*3.2,uTime*0.35))/vec2(uAspect,1.0);
vec3 Tr=vec3(1.0),C=vec3(0.0);float ageW=0.0,covW=0.0;
float M=uTrailP.y;
float jt=ign(gl_FragCoord.xy,0.0)-0.5;
for(int k=0;k<8;k++){
if(float(k)>=uTrailP.x)break;
vec4 tp=uTap[k];if(tp.y<=0.0)continue;
float ag=tp.z/uTrailP.z;
vec2 bs=uv+sw*0.005*ag;
vec3 cs=vec3(0.0);float cv=0.0;
for(int j=0;j<4;j++){
if(float(j)>=M)break;
vec2 ps=bs+v*(((float(j)+0.5+jt)/M-0.5)*tp.w);
vec4 h=texture(uHist,vec3(ps,tp.x));
vec3 n=texture(uHist,vec3(ps,uRing.x)).rgb;
float d=smoothstep(0.03,0.17,length(h.rgb-n))*smoothstep(0.65,0.95,h.a);
cs+=h.rgb*h.rgb*d;cv+=d;
}
if(cv<1e-4)continue;
vec3 pc=cs/cv*ENC;
cv/=M;
vec3 w=vec3(pow(tp.y,1.15),tp.y,pow(tp.y,0.9))*cv;
C+=Tr*w*pc;Tr*=1.0-w;
float wa=tp.y*cv;ageW+=wa*ag;covW+=wa;
}
vec3 A3=1.0-Tr;
if(A3.b>0.002){
vec3 P=C/max(A3,vec3(1e-4));
trOld=ageW/max(covW,1e-4);
P=mix(P,vec3(luma(P))*vec3(0.93,0.98,1.06),0.05+0.35*smoothstep(0.15,0.8,trOld));
vec3 aT=A3*gate*uTrailP.w;
col=mix(col,P,aT);
}
}
}
if(histOK && rwL>0.001){
float rpos=uRew.y;
vec3 o=histSQ(uv+q,rpos,uHistQ.z);
vec3 outer=o+(cur-now)*agreeW(o,now);
outer=dusk(outer,1.0);
vec3 rc=outer;
vec2 c=iso(uRew.zw),d=p-c;
float B=uRew2.z,flow=uRew2.y,ast=uRew2.w,tw=uRew3.x,lB=log(B);
float lr=-log(max(frameRho(d,c),1e-6))/lB;
float g0=max(floor(lr+flow)-flow,0.0);
lr=-log(max(frameRho(rot2(g0*tw)*d,c),1e-6))/lB;
float kf=lr+flow;
float kl=floor(kf),f=kf-kl;
float rr=length(d);
float deep=smoothstep(3.6,6.0,kf);
vec3 sc=vec3(0.0);
if(kl>=1.0){
float kk=min(kl,6.0);
float g=kk-flow;
float aaW=smoothstep(0.45,0.8,uQ);
vec3 inner=tunnelLevel(c,d,g,tw,B,rpos,ast,aaW);
if(f<0.035){
vec3 prev=kk>1.5?tunnelLevel(c,d,g-1.0,tw,B,rpos,ast,aaW):outer;
inner=mix(prev,inner,smoothstep(0.0,0.035,f));
}
inner+=(cur-now)*agreeW(inner,now)*(1.0-smoothstep(0.0,0.3,g));
inner=dusk(inner,1.0-smoothstep(0.0,0.75,g));
inner*=1.0-0.5*exp(-f/0.16);
if(f<0.3){
vec2 ca=d/max(rr,1e-5);
float fw=smoothstep(0.35,0.65,uQ);
float fil=snoise(vec3(ca*2.3,kk*1.7-uTime*0.7))*0.6+(fw>0.001?snoise(vec3(ca*6.1,kk*3.1+uTime*1.3))*0.4*fw:0.0);
fil=smoothstep(-0.15,0.75,fil);
float lz=f/0.02;
float seam=(exp(-lz*lz)*0.35+exp(-f/0.07)*0.05)*fil;
vec2 ed=rot2(g*tw)*d;vec2 ea=abs(ed)/max(abs(ed.x)+abs(ed.y),1e-4);vec2 e2=ea*ea;vec2 e8=e2*e2*e2*e2;
vec2 en=normalize(sign(ed)*e8*ea+1e-6);
seam+=exp(-lz*lz)*max(dot(en,vec2(-0.62,0.78)),0.0)*0.4;
sc=vec3(0.92,0.95,1.0)*(0.35+0.65*min(luma(inner)*2.5,1.0))*(1.0-deep);
inner+=sc*seam*(0.7+0.6*uRew2.x/1.6);
}
rc=inner;
}
rc*=1.0-0.3*exp(-(1.0-f)/0.05)*step(0.0,kf);
vec3 core=vec3(0.82,0.9,1.0)*uRew4.z;
rc=mix(rc,core*0.35+rc*0.3,deep);
glow+=core*(exp(-rr/0.03)*0.4+exp(-rr/0.12)*0.05)*rwL;
light+=core*0.3*max(dot(N,normalize(vec3(-d,0.35))),0.0)/(1.0+rr*rr*10.0)*rwL;
col=mix(col,rc,rwL);
}
if(uTrail.w>0.5){
float sd=1e3,best=1e3,bw=0.0,R=0.0,bf=0.0,fr=0.0;vec2 cB=vec2(0.0);
for(int i=0;i<2;i++){
vec4 Bb=uBub[i];if(abs(Bb.w)<=0.001)continue;
vec2 cc=iso(Bb.xy);float r=length(p-cc)-Bb.z;
if(r<best){best=r;bw=Bb.w;R=Bb.z;cB=cc;bf=i==0?uBubF.x:uBubF.y;fr=i==0?uBubF.z:uBubF.w;}
sd=sd>=1e3?r:smin(sd,r,0.06);
}
float aa=max(uCamPx*0.9,1.2/uRes.y);
if(R>1e-4 && sd<max(0.03,R*1.15)){
bool frozen=bw>0.0;
float bwS=smoothstep(0.0,1.0,abs(bw));
float gp=frozen?smoothstep(0.0,0.32,bw):bwS;
float sh=frozen?gp*smoothstep(0.012,0.05,R):0.0;
vec2 dp=p-cB;float rr=length(dp);vec2 dir=dp/max(rr,1e-5);
if(sh>0.001){
vec2 sc=(p-(cB+vec2(0.22,-0.34)*R))/R;
float sr=length(sc*vec2(0.92,1.08));
float outside=smoothstep(-aa,aa*2.0,sd);
float shadow=(1.0-smoothstep(0.35,1.4,sr))*0.13;
float cz0=sr/0.3;
col*=1.0-shadow*outside*sh;
light+=vec3(1.0,0.92,0.8)*exp(-cz0*cz0)*0.45*outside*sh;
}
if(sd<aa*2.0){
float rn=clamp(1.0+sd/R,0.0,1.0);
float inside=(1.0-smoothstep(-aa*1.5,aa*0.8,sd))*gp;
float cz=sqrt(max(1.0-rn*rn,0.0));
vec3 n=normalize(vec3(dir*rn,cz+0.02));
float rimB=smoothstep(0.55,1.0,rn);
vec2 o=dir*R*(frozen?0.3:0.14)*rimB*rimB/vec2(uAspect,1.0);
float dk=0.012*rimB;
vec3 seen=vec3(texture(uBase,uv+o*(1.0-dk)).r,texture(uBase,uv+o).g,texture(uBase,uv+o*(1.0+dk)).b);
if(frozen && bf>0.002){
vec3 fz=dec(texture(uFreeze,uv+o));
vec2 fq=dp/max(R,1e-4);
float n1=snoise(vec3(fq*2.6,1.7));
float front=1.0-0.22*fr;
float fm=fr*smoothstep(front-0.1,front+0.2,rn+0.06*n1);
if(fm>0.004){
vec2 v1=rot2(6.2832*hash12(floor(gl_FragCoord.xy*0.5)+17.0))*vec2(0.0042*fm,0.0),v2=vec2(-v1.y,v1.x);
vec2 b1=v1/vec2(uAspect,1.0),b2=v2/vec2(uAspect,1.0);
vec3 bl=(dec(texture(uFreeze,uv+o+b1))+dec(texture(uFreeze,uv+o-b1))
+dec(texture(uFreeze,uv+o+b2))+dec(texture(uFreeze,uv+o-b2)))*0.25;
float wQ=smoothstep(0.55,0.85,uQ);
if(wQ>0.001){
vec2 b3=(b1+b2)*1.15,b4=(b1-b2)*1.15;
vec3 bo=(dec(texture(uFreeze,uv+o+b3))+dec(texture(uFreeze,uv+o-b3))
+dec(texture(uFreeze,uv+o+b4))+dec(texture(uFreeze,uv+o-b4)))*0.25;
bl=mix(bl,(bl+bo)*0.5,wQ);
}
fz=mix(fz,bl,smoothstep(0.0,0.5,fm));
vec3 veil=vec3(0.7,0.8,0.92)*(0.25+0.55*luma(bl))+0.02;
fz=mix(fz,veil,fm*0.05);
float drop=smoothstep(0.62,0.95,snoise(vec3(p*240.0,2.7)))*smoothstep(0.3,0.9,fm);
fz+=vec3(0.85,0.92,1.0)*drop*(0.25+0.6*max(dot(n,normalize(vec3(-0.45,0.62,1.0))),0.0))*0.28*(0.4+min(luma(bl),1.2));
}
fz=mix(vec3(luma(fz)),fz,0.94)*vec3(0.98,1.0,1.02);
float m=min(bf,bwS)*1.22;
float fk=1.0-smoothstep(m-0.14,m,rn+0.05*n1);
seen=mix(seen,fz,fk);
}
if(sh>0.001){
float th=smoothstep(0.72,0.99,rn);
seen*=mix(vec3(1.0),vec3(0.3,0.34,0.36),th*th*0.9*sh);
}
col=mix(col,seen,inside);
if(sh>0.001){
float Fr=0.04+0.96*pow(1.0-cz,5.0);
vec3 rv=2.0*n.z*n-vec3(0.0,0.0,1.0);
vec2 ring=uvOf(cB+dir*R*(1.1+0.9*(1.0-rn)));
vec2 tg=vec2(-dir.y,dir.x)*R*0.3/vec2(uAspect,1.0),rd=dir*R*0.12/vec2(uAspect,1.0);
vec3 around=(texture(uEnv,clamp(ring+tg,0.0,1.0)).rgb+texture(uEnv,clamp(ring-tg,0.0,1.0)).rgb
+texture(uEnv,clamp(ring+rd*2.0,0.0,1.0)).rgb)*(1.0/3.0);
around=mix(around,vec3(luma(around)),0.15)*mix(1.0,0.45,smoothstep(0.8,1.0,rn));
vec3 behind=texture(uEnv,clamp(uvOf(-rv.xy*vec2(0.55,0.4)),0.0,1.0)).rgb*vec3(0.26,0.29,0.34);
vec3 env=mix(behind,around*0.72,smoothstep(0.45,0.95,rn));
col=mix(col,env,min(Fr,0.6)*inside*sh);
vec3 roomC=texture(uEnv,vec2(0.25)).rgb+texture(uEnv,vec2(0.75)).rgb+texture(uEnv,vec2(0.25,0.75)).rgb+texture(uEnv,vec2(0.75,0.25)).rgb;
float roomL=luma(roomC)*0.25;
roomC=clamp(roomC/max(4.0*roomL,0.02),0.6,1.5);
vec2 g1;
float kb=softbox(rv,normalize(vec3(-0.62,0.52,0.58)),vec2(0.3,0.4),0.75,g1);
kb*=(1.0-0.3*smoothstep(-0.4,0.5,g1.y))*smoothstep(0.35,0.9,rn);
col+=mix(vec3(1.0),roomC,0.6)*kb*14.0*clamp(roomL/0.45,0.35,1.4)*Fr*inside*sh;
float cz2=(rn-0.9)/0.022;
float ca=exp(-cz2*cz2)*pow(max(dot(dir,vec2(0.6,-0.8)),0.0),3.0);
col+=vec3(1.0,0.9,0.74)*ca*(0.12+0.35*luma(seen))*inside*sh;
float rz=(sd+aa)/(aa*1.6);
float side=pow(max(dot(dir,vec2(-0.6,0.8)),0.0),2.5)+0.25*pow(max(dot(dir,vec2(0.6,-0.8)),0.0),3.0);
glow+=vec3(0.82,0.9,1.0)*exp(-rz*rz)*side*sh*0.4;
}
}
}
}
if(handM>0.002){
vec3 lv=texture(uBase,uv).rgb;
col=mix(col,dusk(lv,rwL),handM);
}
if(uRew3.w>0.002){
vec2 dp=p-iso(uRew4.xy);float r2=dot(dp,dp),r=sqrt(r2);
vec3 bc=vec3(1.0,0.8,0.55)*uRew3.w;
light+=bc*2.8*max(dot(N,normalize(vec3(-dp,0.3))),0.0)/(1.0+r2*9.0);
glowF+=bc*(exp(-r/0.05)*0.8+exp(-r/0.22)*0.08)*mix(1.0,0.3*(1.0-0.9*person),uStill);
}
col+=col*light*(0.55+0.8*person);
col+=glow*(1.0-0.75*handM)+glowF;
if(rwL>0.001){
float l=luma(col);
vec3 g=mix(col*vec3(0.94,0.98,1.03),col*vec3(1.02,1.0,0.97),smoothstep(0.05,0.5,l));
col=mix(col,g*(0.93+0.22*smoothstep(0.1,0.7,l)),rwL);
}
outColor=vec4(max(col,0.0),1.0);
}`;function wt(v){const w=v.kit,i=v.gl,G=v.caps,N=!!v.mobile,I={capture:w.program(ut(),{label:"chronos capture"}),captureLong:w.program(ft,{label:"chronos capture long"}),sig:w.program(ht,{label:"chronos signature"}),env:w.program(pt,{label:"chronos env"}),live:w.program(dt,{label:"chronos live"}),field:w.program(vt,{label:"chronos field"}),composite:w.program(xt,{label:"chronos composite"})},V=Math.min(N?24:48,G.maxLayers||256),re=Math.min(N?32:48,G.maxLayers||256),Qe=N?640*360:960*540,Re=N?15:30,Ke=N?7:10,Ve=2.35,Ye=.24,se=N?.27:.3,Te=N?4:8,Me=N?1:2,$e=N?3:4,Se=a=>Math.exp(-Math.max(0,a-.07)/.11)*(.7+.3*R(.02,.07,a))*(1-R(se*.75,se*1.15,a)),ze=()=>{const a={tex:null,fbo:i.createFramebuffer(),width:0,height:0,layer:0};return a.bind=()=>{i.bindFramebuffer(i.FRAMEBUFFER,a.fbo),i.framebufferTextureLayer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,a.tex,0,a.layer),i.viewport(0,0,a.width,a.height)},a},H=ze(),j=ze();function ke(a,s,c,f){a.tex&&i.deleteTexture(a.tex),a.tex=i.createTexture(),i.bindTexture(i.TEXTURE_2D_ARRAY,a.tex),i.texStorage3D(i.TEXTURE_2D_ARRAY,1,i.RGBA8,s,c,f),i.texParameteri(i.TEXTURE_2D_ARRAY,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D_ARRAY,i.TEXTURE_MAG_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D_ARRAY,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D_ARRAY,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),i.bindTexture(i.TEXTURE_2D_ARRAY,null),a.width=s,a.height=c}function ve(a){a.tex&&i.deleteTexture(a.tex),a.tex=null,a.width=a.height=0}const Ze=G.hdr==="rgba16f"||G.hdr==="rgba32f"?"hdr":"rgba16f",O=w.pingPong(4,4,{format:Ze,filter:"linear"}),X=w.target(4,4,{format:"rgba8"}),ee=w.target(40,24,{format:"hdr",filter:"linear"}),me={uSrc:null,uCell:new Float32Array(2)},y={t:w.target(8,8,{format:"rgba8",filter:"nearest"}),pbo:i.createBuffer(),fence:null,prev:new Uint8Array(256),cur:new Uint8Array(256),has:!1,cuts:0};i.bindBuffer(i.PIXEL_PACK_BUFFER,y.pbo),i.bufferData(i.PIXEL_PACK_BUFFER,256,i.STREAM_READ),i.bindBuffer(i.PIXEL_PACK_BUFFER,null);const be={uHist:null,uRing:null},Je=1.2;let P=null;const ie=new Float64Array(V),He=new Float64Array(re),Be=new Float32Array(J),Ce=new Float32Array(J),t={hand:new Float32Array(8),wrist:new Float32Array(8),tips:new Float32Array(20),brushA:new Float32Array(8),brushB:new Float32Array(8),vel:new Float32Array(8),decay:new Float32Array(4),rip:new Float32Array(we*4),ripB:new Float32Array(we*4),grad:new Float32Array(4),gradP:new Float32Array(4),gradS:new Float32Array(4),rew:new Float32Array(4),rew2:new Float32Array(4),rew3:new Float32Array(4),rew4:new Float32Array(4),ring:new Float32Array(4),ringL:new Float32Array(4),trail:new Float32Array(4),fieldTexel:new Float32Array(2),step:new Float32Array(2),stepL:new Float32Array(2),tap:new Float32Array(32),trailP:new Float32Array(4),cam:new Float32Array(4),bub:new Float32Array(8),bubF:new Float32Array(4),trailX:new Float32Array(4),res:new Float32Array(2),histQ:new Float32Array(3)},te={uBase:null,uMask:null,uNormals:null,uCam:t.cam,uAspect:1,uT:0,uLx:0},Z={uSrc:null,uMask:null,uStep:t.step,uAlphaLight:0,uAspect:1,uHand:t.hand,uWrist:t.wrist,uTips:t.tips},ye={uHist:null,uLayer:0,uStep:t.stepL},ce={uPrev:null,uTexel:t.fieldTexel,uDt:0,uAspect:1,uBrushA:t.brushA,uBrushB:t.brushB,uVel:t.vel,uDecay:t.decay,uReset:1,uTime:0},E={uBase:null,uHist:null,uHistL:null,uField:null,uFreeze:X,uNormals:null,uMask:null,uTrailX:t.trailX,uTap:t.tap,uTrailP:t.trailP,uLut:Be,uRing:t.ring,uLutL:Ce,uRingL:t.ringL,uHand:t.hand,uWrist:t.wrist,uTips:t.tips,uGrad:t.grad,uGradP:t.gradP,uGradS:t.gradS,uRip:t.rip,uRipB:t.ripB,uRew:t.rew,uRew2:t.rew2,uRew3:t.rew3,uRew4:t.rew4,uCam:t.cam,uBub:t.bub,uBubF:t.bubF,uTrail:t.trail,uFieldT:t.fieldTexel,uAspect:1,uTime:0,uFrame:0,uLight:0,uSplit:1,uStill:0,uHistDt:.033,uCut:0,uT:0,uLx:0,uRes:t.res,uCamPx:.002,uQ:1,uHistQ:t.histQ},ne=Array.from({length:we},()=>({x:.5,y:.5,t0:-99,s:0,reach:3,disp:1})),xe=[null,null],Ae={level:0,tone:.5},Le={level:0,pitch:1},U=[0,1].map(()=>({held:!1,committed:!1,fz:0,frost:0,holdUntil:-99,x:.5,y:.5,r:0,target:0,w:0,t0:-99,base:.1})),le=[0,1].map(()=>({has:!1,px:.5,py:.5,detT:0,gap:1/30,pinchT:0,pinchSteady:0,pinchOff:0,fistT:0,w:0,moving:0})),e={time:0,dt:1/60,aspect:16/9,head:-1,count:0,maxAge:.001,lastCapture:-99,lastSF:null,headL:-1,countL:0,maxAgeL:.001,lastCaptureL:-99,cutAt:-99,trailFade:1,paused:!1,pauseAt:0,resetField:!0,attract:!1,srcVersion:-1,lastPaint:-99,gradW:0,gradMax:0,gradHold:0,gradClock:0,gradH:.25,gradS:.1,trail:0,freeze:{holding:!1,need:!1,t0:-99,endAt:-99,x:.5,y:.5,r:.1},rew:{phase:"idle",latch:!1,hand:-1,pos:0,speed:0,w:0,cx:.5,cy:.5,fx:.5,fy:.5,flow:0,openT:0,goneT:0,endT:0,dur:0,startAt:-99,releaseAt:-99,wipeR:0,wipeMode:0,burst:0,core:0},kick:0,aberr:0,lastRipple:-99,cut:0,leaps:0};function et(a){const s=v.state,c=Math.max(16,s.width),f=Math.max(16,s.height),d=c/f;let p=Math.round(Math.sqrt(Qe*d)),o=Math.round(p/d);p=Math.max(16,Math.min(p,c)),o=Math.max(16,Math.min(o,f));const m=e.rew.phase!=="idle"&&!!H.tex;(!H.tex||!m&&(Math.abs(p-H.width)>6||Math.abs(o-H.height)>6))&&(ke(H,p,o,V),ke(j,Math.max(16,Math.round(p/2)),Math.max(16,Math.round(o/2)),re),e.head=-1,e.count=0,e.headL=-1,e.countL=0);const x=N?128:192,l=d>=1?x:Math.max(16,Math.round(x*d)),T=d>=1?Math.max(16,Math.round(x/d)):x;(O.width!==l||O.height!==T)&&(O.resize(l,T),e.resetField=!0);const M=Math.min(1,(N?1280:1920)/Math.max(c,f)),n=Math.round(c*M),g=Math.round(f*M),S=U[0].w>0||U[1].w>0||U[0].held||U[1].held;(X.width!==n||X.height!==g)&&!S&&(X.resize(n,g),X.clear()),e.attract?P?(P.width!==a.width||P.height!==a.height)&&P.resize(a.width,a.height):P=w.target(a.width,a.height,{format:"hdr"}):P&&(P.dispose(),P=null)}function Ee(a,s,c,f,d,p){if(c<2||s<0)return d.fill(0),.001;const o=a[(s-(c-1)+f*4)%f],m=Math.max(.001,p-o);let x=0;for(let l=0;l<J;l++){const T=p-l/(J-1)*m;for(;x<c-1&&a[(s-(x+1)+f*4)%f]>T;)x++;if(x>=c-1){d[l]=c-1;continue}const B=a[(s-x+f*4)%f],M=a[(s-x-1+f*4)%f];d[l]=T>=B?x:Math.min(c-1,x+(B-T)/Math.max(1e-6,B-M))}return m}function Pe(){const a=e.head>=0?ie[e.head]:0;e.maxAge=Ee(ie,e.head,e.count,V,Be,a),e.maxAgeL=Ee(He,e.headL,e.countL,re,Ce,a)}function Ne(){e.head=-1,e.count=0,e.maxAge=.001,e.lastCapture=-99,e.lastSF=null,e.resetField=!0,e.paused=!1,e.headL=-1,e.countL=0,e.maxAgeL=.001,e.lastCaptureL=-99,e.cutAt=-99,e.trailFade=1,y.has=!1,e.gradW=0,e.gradHold=0,e.gradMax=0,e.trail=0,e.kick=0,e.aberr=0,Object.assign(e.freeze,{holding:!1,need:!1,t0:-99,endAt:-99}),Object.assign(e.rew,{phase:"idle",latch:!1,hand:-1,pos:0,speed:0,w:0,openT:0,goneT:0,endT:0,dur:0,wipeR:0,wipeMode:0,burst:0,core:0});for(const a of ne)a.t0=-99,a.s=0;e.lastRipple=-99;for(const a of le)a.has=!1,a.pinchT=0,a.pinchSteady=0,a.pinchOff=0,a.fistT=0,a.moving=0;for(const a of U)a.held=!1,a.committed=!1,a.holdUntil=-99,a.w=0,a.r=0,a.frost=0,a.fz=0;e.lastPaint=-99}function De(){e.time-e.cutAt>=.15&&(e.cutAt=e.time)}function _e(a){return a-e.lastRipple>1.1&&e.gradW<.3&&e.rew.phase==="idle"&&!e.freeze.holding&&e.count>2}function Ue(a,s,c,f=3,d=1){let p=ne[0];for(const o of ne)o.t0<p.t0&&(p=o);p.x=a,p.y=s,p.t0=e.time,p.s=c,p.reach=f,p.disp=d}function We(a,s,c){e.lastRipple=e.time,Ue(a,s,c,3,1),v.audio?.whoosh({strength:.5,duration:.9,up:!0}),v.audio?.chime({strength:.18,pitch:.5}),e.aberr=Math.max(e.aberr,.005)}const Ge=a=>k(a+(.5-a)*.15,.16,.84),Ie=a=>k(a+(.5-a)*.15,.18,.82),Oe=(a,s,c,f,d,p,o)=>a>-.05&&a<1.05&&s>-.05&&s<1.05&&Math.hypot((a-c)*p,s-f)<o*d;function tt(a){const s=a.time,c=k(a.dt||1/60,1/240,.05);e.time=s,e.dt=c;const f=v.state,d=e.aspect=f?f.width/Math.max(1,f.height):16/9,p=v.source;p&&p.version!==e.srcVersion&&(e.srcVersion>=0&&Ne(),e.srcVersion=p.version),e.attract=!!p?.element&&p.element.tagName==="IMG";const o=e.rew,m=e.freeze;e.cut=L(e.cut,!e.attract&&a.person?.present?1:0,4,c),t.hand.fill(0),t.brushA.fill(0),t.vel.fill(0);let x=0,l=null,T=null,B=null,M=!1;xe[0]=xe[1]=null;for(const r of a.hands){const b=r.id&1,h=le[b];xe[b]=r;const Q=r.lost<.12?1:k(1-(r.lost-.12)/.13,0,1),z=r.palm[0],C=r.palm[1],W=r.size,u=Math.hypot((z-h.px)*d,C-h.py);u>1e-6&&(h.gap=s-h.detT,h.detT=s);const A=2.4*k(h.gap,1/60,.25),_=!h.has||u>Math.max(.12,W*1.4,A);h.has&&u>Math.max(.3,1.5*A)&&(De(),e.leaps++),_&&(h.px=z,h.py=C,h.has=!0),h.w=Q;const q=r.gesture==="fist"||o.phase!=="idle"?.15:r.pinching?e.attract?.15:.5:1,Y=_?0:(e.attract?R(.08,.35,r.speed)*(1-R(.75,.95,r.speed)):R(.22,.85,r.speed))*Q*q*(1-.8*e.gradW);h.moving=Y,x=Math.max(x,Y),Y>.01&&(e.lastPaint=s),de(t.hand,b,z,C,W,e.attract||o.phase!=="idle"&&r.id!==o.hand?0:Q);const $=r.points[0],ae=r.points[1],ue=Oe($,ae,z,C,W,d,1.1);t.wrist[b*4]=ue?$:z,t.wrist[b*4+1]=ue?ae:C;for(let K=0;K<5;K++){const pe=r.tips[K][0],he=r.tips[K][1],ge=Oe(pe,he,z,C,W,d,1.8);t.tips[b*10+K*2]=ge?pe:z,t.tips[b*10+K*2+1]=ge?he:C}de(t.brushA,b,z,C,W*(e.attract?1.6:1.45),Y),de(t.brushB,b,h.px,h.py,0,0),de(t.vel,b,r.velocity[0]*d,r.velocity[1],W*2.4,Q),h.px=z,h.py=C;const F=U[b];if(F.held)h.pinchOff=r.pinching?0:h.pinchOff+c,h.pinchOff>.06||o.phase!=="idle"?F.held=!1:(F.committed||s-F.t0>=.48&&(F.committed=!0,F.t0=s,F.holdUntil=s+1.1),F.target=F.committed?Math.min(.26,.4*Math.min(1,d),F.base*(.9+.9*R(0,1.8,s-F.t0))):F.base*(.22+.28*R(0,.48,s-F.t0)));else{const K=r.pinchPoint[0],pe=r.pinchPoint[1],he=r.pinching&&r.pinch>.9&&r.age>.4&&e.gradW<.5&&o.phase==="idle"&&K>.04&&K<.96&&pe>.04&&pe<.96;h.pinchT=he?h.pinchT+c:0,h.pinchSteady=he&&r.speed<.6?h.pinchSteady+c:0;const ge=!U[0].held&&!U[1].held&&U[0].w<.05&&U[1].w<.05;h.pinchT>=.12&&h.pinchSteady>=.1&&ge&&s-m.endAt>.8&&(F.held=!0,F.committed=!1,F.fz=0,F.frost=0,F.x=r.pinchPoint[0],F.y=r.pinchPoint[1],F.t0=s,F.r=0,F.base=W,h.pinchOff=0,m.need=!0,m.t0=s)}const fe=r.gesture==="fist"&&r.fist>.6&&r.speed<1.3&&r.age>.4&&!r.pinching;h.fistT=fe?h.fistT+c:0,(r.gesture==="fist"||r.fist>.5)&&(M=!0),h.fistT>.25&&(!l||h.fistT>le[l.id&1].fistT)&&(l=r),o.phase==="rewind"&&r.id===o.hand&&(T=r),!_&&r.age>.3&&r.open>.65&&r.speed>1.7&&!r.pinching&&_e(s)&&We(z,C,k(.6+(r.speed-1.7)*.3,.6,1.1))}for(let r=0;r<2;r++)if(!xe[r]){const b=le[r];b.has=!1,b.pinchT=0,b.pinchSteady=0,b.fistT=0,b.w=0,b.moving=0,U[r].held=!1}for(const r of a.events)r.type==="throw"&&r.hand&&r.hand.age>.3&&r.hand.open>.55&&_e(s)&&We(r.hand.palm[0],r.hand.palm[1],1);for(const r of U){const b=r.committed&&(r.held||s<r.holdUntil);r.fz=r.committed?L(r.fz,1,14,c):0,r.frost=b?L(r.frost,1,2,c):r.committed?Math.max(0,r.frost-c*1.6):0,b?(r.w=L(r.w,1,9,c),r.r=L(r.r,r.target,7,c),B||(B=r)):r.held?(r.w=L(r.w,.6,9,c),r.r=L(r.r,r.target,7,c)):(r.w=Math.max(0,r.w-c*(r.committed?1.4:4)),r.r=L(r.r,r.target*.35,r.committed?2.2:5,c))}B&&(m.r=B.r),B&&!m.holding?(m.holding=!0,m.x=B.x,m.y=B.y,v.audio?.chime({strength:.45,pitch:1.6}),v.audio?.whoosh({strength:.22,duration:.35,up:!1})):!B&&m.holding&&(m.holding=!1,m.endAt=s,e.lastRipple=s,e.gradW<.3&&Ue(m.x,m.y,.4,m.r*2.4+.06,.15),v.audio?.whoosh({strength:.35,duration:.7,up:!0}),v.audio?.chime({strength:.22,pitch:.75}));const n=a.left,g=a.right,S=a.twoHands&&n&&g&&n.open>.5&&g.open>.5&&!n.pinching&&!g.pinching&&n.gesture!=="fist"&&g.gesture!=="fist"&&o.phase==="idle";if(e.gradHold=S?e.gradHold+c:0,e.gradW=L(e.gradW,e.gradHold>.2?1:0,e.gradHold>.2?3.2:5,c),n&&g){t.grad[0]=n.palm[0],t.grad[1]=n.palm[1],t.grad[2]=g.palm[0],t.grad[3]=g.palm[1];const r=Math.hypot((n.palm[0]-g.palm[0])*d,n.palm[1]-g.palm[1]);e.gradMax=L(e.gradMax,R(.12,.75,r),6,c);const b=.5*(n.size+g.size);e.gradH=L(e.gradH,Math.min(1.5*b+.02,.12+.5*r,.03+.3*r),8,c),e.gradS=L(e.gradS,.6*b,8,c)}if(e.gradClock+=c,o.phase==="idle")o.w=L(o.w,0,12,c),o.latch&&!M&&(o.latch=!1),l&&e.count>12&&!m.holding&&!o.latch&&(Object.assign(o,{phase:"rewind",hand:l.id,pos:0,speed:.25,openT:0,goneT:0,endT:0,dur:0,startAt:s,flow:0,wipeMode:1,wipeR:0}),o.fx=l.palm[0],o.fy=l.palm[1],o.cx=Ge(o.fx),o.cy=Ie(o.fy),e.paused=!0,e.pauseAt=s,e.resetField=!0,v.audio?.whoosh({strength:.6,duration:1.3,up:!1}),v.audio?.impact({strength:.3,pitch:.6}));else if(o.phase==="rewind"){o.w=1,o.dur+=c;const r=e.countL>=3?Math.max(e.maxAge,e.maxAgeL):e.maxAge,b=Math.max(0,Math.min(nt,r-.1)),h=o.pos>=b-.001;o.endT=h?o.endT+c:0,o.speed=L(o.speed,h?0:1.6*Math.max(.3,R(0,1.1,b-o.pos)),h?8:2.4,c),o.pos=Math.min(b,o.pos+o.speed*c);const Q=(s-o.startAt)/.85;if(o.wipeR=2.4*Math.pow(k(Q,0,1),1.25),Q>=1&&(o.wipeMode=0),!T){for(const z of a.hands)if(z.gesture==="fist"||z.fist>.5){T=z,o.hand=z.id;break}}if(T){o.goneT=0;const z=T.gesture==="fist"||T.fist>.5;o.openT=z?0:o.openT+c,o.fx=L(o.fx,T.palm[0],18,c),o.fy=L(o.fy,T.palm[1],18,c),o.cx=L(o.cx,Ge(o.fx),5,c),o.cy=L(o.cy,Ie(o.fy),5,c)}else o.goneT+=c;(o.openT>=.15||o.goneT>.25||o.endT>1.4||o.dur>9)&&(Object.assign(o,{phase:"release",releaseAt:s,wipeMode:2,wipeR:0,burst:1,latch:o.openT<.15&&o.goneT<=.25}),e.kick=1,e.aberr=Math.max(e.aberr,.0055),v.audio?.impact({strength:.85,pitch:.9}),v.audio?.whoosh({strength:.7,duration:.5,up:!0}))}else if(o.phase==="release"){o.speed=L(o.speed,0,10,c),o.pos=L(o.pos,0,6,c);const r=(s-o.releaseAt)/.6;o.wipeR=2.4*(1-Math.pow(1-k(r,0,1),1.6)),r>=1&&(Object.assign(o,{phase:"idle",w:0,pos:0,wipeMode:0,hand:-1}),e.count=0,e.countL=0,e.headL=-1,Pe(),y.has=!1,e.paused=!1,e.lastCapture=-99,e.lastCaptureL=-99,e.resetField=!0)}o.flow+=c*(.2+.12*o.speed),o.core=L(o.core,o.phase==="rewind"?.75+.35*o.speed/1.6:0,4,c),o.burst=L(o.burst,0,5.5,c),e.kick=L(e.kick,0,9,c),e.aberr=L(e.aberr,0,5,c),e.trail=L(e.trail,x,6,c);const D=v.audio;if(D){const r=o.phase==="rewind"?1:0;Ae.level=k(e.trail*.24+e.gradW*.1+r*.42,0,1),Ae.tone=k(.25+e.trail*.4+r*(.3+.3*Math.sin(s*9)),0,1),D.layer("noise",Ae),Le.level=k(e.gradW*.35*e.gradMax+(m.holding?.32:0)+r*.6,0,1),Le.pitch=r?.6+o.speed*.5:m.holding?.5:1-.35*e.gradMax*e.gradW,D.layer("hum",Le)}}function at(){if(!y.fence)return;const a=i.clientWaitSync(y.fence,0,0);if(!(a!==i.ALREADY_SIGNALED&&a!==i.CONDITION_SATISFIED)){if(i.deleteSync(y.fence),y.fence=null,i.bindBuffer(i.PIXEL_PACK_BUFFER,y.pbo),i.getBufferSubData(i.PIXEL_PACK_BUFFER,0,y.cur),i.bindBuffer(i.PIXEL_PACK_BUFFER,null),y.has){let s=0,c=0;for(let f=0;f<64;f++){const d=(Math.abs(y.cur[f*4]-y.prev[f*4])+Math.abs(y.cur[f*4+1]-y.prev[f*4+1])+Math.abs(y.cur[f*4+2]-y.prev[f*4+2]))/3;c+=d,d>30&&s++}s>20&&c/64>25&&(De(),y.cuts++)}y.prev.set(y.cur),y.has=!0}}function ot(){y.fence||(be.uHist=H.tex,be.uRing=t.ring,w.pass(I.sig,y.t,be),i.bindBuffer(i.PIXEL_PACK_BUFFER,y.pbo),i.readPixels(0,0,8,8,i.RGBA,i.UNSIGNED_BYTE,0),i.bindBuffer(i.PIXEL_PACK_BUFFER,null),y.fence=i.fenceSync(i.SYNC_GPU_COMMANDS_COMPLETE,0))}function rt(a){et(a),e.attract||at();const s=e.time||a.time,c=e.dt,f=a.aspect;let d=a.base,p=0;if(e.attract&&P){const u=Math.PI*2/15;p=s%15;const A=1-R(5,5.5,p)*(1-R(8.1,8.8,p)),_=.004*Math.sin(u*5.6)+.002*Math.sin(u*3*5.6+1.3),q=.0025*Math.sin(u*2*5.6+.4),Y=.006*Math.sin(u*5.6+2),$=.004*Math.sin(u*2*5.6+.9);t.cam[0]=_+(.004*Math.sin(u*p)+.002*Math.sin(u*3*p+1.3)-_)*A,t.cam[1]=q+(.0025*Math.sin(u*2*p+.4)-q)*A,t.cam[2]=1.04+Y+(.006*Math.sin(u*p+2)-Y)*A,t.cam[3]=$+(.004*Math.sin(u*2*p+.9)-$)*A,te.uBase=a.base,te.uMask=a.mask,te.uNormals=a.normals(),te.uAspect=f,te.uT=p,te.uLx=.18*p,w.pass(I.live,P,te),d=P}e.lastSF===null&&(e.lastSF=a.sourceFrame);const o=s-e.lastCapture;let m=!1;e.paused||(e.attract?m=o>=.9/Re||e.head<0:a.sourceFrame!==e.lastSF&&(m=o>=.85/Re,e.lastSF=a.sourceFrame)),Z.uAlphaLight=e.attract?1:0,m&&(e.head=(e.head+1)%V,H.layer=e.head,ie[e.head]=s,e.count=Math.min(V,e.count+1),e.lastCapture=s,t.step[0]=.25/H.width,t.step[1]=.25/H.height,Z.uSrc=d,Z.uMask=a.mask,Z.uAspect=f,w.pass(I.capture,H,Z),(s-e.lastCaptureL>=.92/Ke||e.headL<0)&&(e.headL=(e.headL+1)%re,j.layer=e.headL,He[e.headL]=s,e.countL=Math.min(re,e.countL+1),e.lastCaptureL=s,t.stepL[0]=.25/j.width,t.stepL[1]=.25/j.height,ye.uHist=H.tex,ye.uLayer=e.head,w.pass(I.captureLong,j,ye)),Pe(),e.attract||(t.ring[0]=e.head,ot())),e.freeze.need&&(t.step[0]=.25/X.width,t.step[1]=.25/X.height,Z.uSrc=d,Z.uMask=a.mask,Z.uAspect=f,w.pass(I.capture,X,Z),e.freeze.need=!1),t.fieldTexel[0]=1/O.width,t.fieldTexel[1]=1/O.height,t.decay[0]=e.attract?.8:1.1,t.decay[1]=Je,ce.uPrev=O.read,ce.uDt=c,ce.uAspect=f,ce.uReset=e.resetField?1:0,ce.uTime=s,w.pass(I.field,O.write,ce),O.swap(),e.resetField=!1;let x=!1;for(let u=0;u<we;u++){const A=ne[u],_=s-A.t0,q=_>=0&&_<3.2&&_*1.15<A.reach?A.s:0;t.rip[u*4]=A.x,t.rip[u*4+1]=A.y,t.rip[u*4+2]=Math.max(0,_),t.rip[u*4+3]=q,t.ripB[u*4]=A.reach,t.ripB[u*4+1]=A.disp*(N?.6:1),q&&(x=!0)}const l=e.rew;t.rew[0]=l.w<.002?0:l.w,t.rew[1]=l.pos,t.rew[2]=l.cx,t.rew[3]=l.cy,t.rew2[0]=l.speed,t.rew2[1]=l.flow%1,t.rew2[2]=Ve,t.rew2[3]=Ye,t.rew3[0]=.1+.06*l.speed,t.rew3[1]=l.wipeR,t.rew3[2]=l.wipeMode,t.rew3[3]=l.burst<.002?0:l.burst,t.rew4[0]=l.fx,t.rew4[1]=l.fy,t.rew4[2]=l.core,t.rew4[3]=0,(t.rew[0]||l.wipeMode||t.rew3[3])&&(x=!0);let T=0;for(let u=0;u<2;u++){const A=U[u];t.bub[u*4]=A.x,t.bub[u*4+1]=A.y,t.bub[u*4+2]=A.r,t.bub[u*4+3]=A.w<.002?0:A.committed?A.w:-A.w,t.bubF[u]=A.fz,t.bubF[2+u]=A.frost,t.bub[u*4+3]&&(T=1)}t.trail[0]=N?10:16,t.trail[3]=T,t.gradP[0]=Math.max(.05,Math.min(e.attract?.9:1.5,e.maxAge*.8))*(.35+.65*e.gradMax),t.gradP[1]=e.gradW<.003?0:e.gradW,t.gradP[2]=e.gradClock,t.gradP[3]=R(.2,.9,e.gradW),t.gradS[0]=e.gradH,t.gradS[1]=e.gradS,t.gradS[2]=.8,t.gradS[3]=Math.max(.06,e.maxAge*.95),t.gradP[1]&&(x=!0),t.ring[0]=Math.max(0,e.head),t.ring[1]=V,t.ring[2]=e.maxAge,t.ring[3]=e.count>=3?1:0,t.ringL[0]=Math.max(0,e.headL),t.ringL[1]=re,t.ringL[2]=e.maxAgeL,t.ringL[3]=e.countL>=3&&e.count>=3?1:0;const B=x||e.attract?a.normals():a.mask;E.uBase=d,E.uHist=H.tex,E.uHistL=j.tex,E.uField=O.read,E.uNormals=B,E.uMask=a.mask,E.uAspect=f,E.uTime=s,E.uFrame=a.frame%64,E.uLight=x||e.attract?1:0,E.uStill=e.attract?1:0,E.uCut=e.cut,E.uT=p,E.uLx=.18*p;const M=k(a.quality??1,.2,1);E.uQ=M,t.res[0]=a.width,t.res[1]=a.height,t.histQ[0]=H.width,t.histQ[1]=H.height,t.histQ[2]=R(.6,.9,M);const n=v.source?.width||a.width,g=v.source?.height||a.height;E.uCamPx=k(Math.max(f/n,1/g),1/Math.max(a.height,1),.01),E.uSplit=N?0:R(.45,.8,M);const S=e.count>1?e.maxAge/(e.count-1):.033;E.uHistDt=S;const D=!e.attract&&e.count>=3&&l.w<.99,r=s-e.cutAt,b=r<.15;e.trailFade=b?Math.max(0,e.trailFade-c/.15):Math.min(1,e.trailFade+c/.2);const h=b&&e.trailFade>0?1e9:Math.max(0,r);t.tap.fill(0);let Q=0;const z=R(.7,.45,M);if(D){const u=Math.max(1,Math.round(se/Te/Math.max(S,.001))),A=ie[e.head];for(let _=1;_<=Te;_++){const q=_*u;if(q>=e.count)break;const Y=(e.head-q+V*4)%V,$=A-ie[Y];if($>se*1.15||$>h)break;let ae=Se($),ue=u*S;if((_&1)===0)ae*=1-z;else if(z>0&&q+u<e.count){const F=(e.head-q-u+V*4)%V,fe=A-ie[F],K=fe>se*1.15||fe>h?0:Se(fe)*z;ae=1-(1-ae)*(1-K),ue*=1+z}de(t.tap,Q++,Y,ae,$,ue)}}if(t.trailP[0]=Q,t.trailP[1]=Math.round(Me+($e-Me)*R(.3,.95,M)),t.trailP[2]=se,t.trailP[3]=.5*R(0,1,e.trailFade),t.trailX[0]=.5/H.width,t.trailX[1]=.5/H.height,t.trailX[2]=D&&Q>0?1:0,T||t.gradP[1]){const u=Math.max(8,Math.round(40/Math.max(.2,f)));ee.height!==u&&ee.resize(40,u),me.uSrc=d,me.uCell[0]=1/ee.width,me.uCell[1]=1/ee.height,w.pass(I.env,ee,me)}E.uEnv=ee,w.pass(I.composite,a.scene,E);const C=a.post,W=l.w;C.bloom=.075+.08*W+.05*e.gradW+(x?.03:0)+.06*l.burst+(e.freeze.holding?.03:0),C.vignette=.36+.14*W,C.grain=.03+.015*W,C.saturation=1-.06*W,C.exposure=1-.05*W,C.aberration=Math.min(.02,e.aberr+.003*W),C.flash=l.burst*.06,C.filmic=.1*W,e.kick>.01&&(C.shake[0]=(Math.sin(s*91)*.6+Math.sin(s*57.3)*.4)*.005*e.kick,C.shake[1]=(Math.cos(s*83)*.6+Math.sin(s*61.7)*.4)*.005*e.kick)}function st(){ve(H),ve(j),P&&(P.dispose(),P=null),Ne()}function it(){ve(H),ve(j),i.deleteFramebuffer(H.fbo),i.deleteFramebuffer(j.fbo),y.fence&&i.deleteSync(y.fence),y.fence=null,i.deleteBuffer(y.pbo),y.t.dispose(),O.dispose(),X.dispose(),ee.dispose(),P?.dispose(),P=null;for(const a in I)I[a].dispose()}function ct(a,s,c,f,d){const p=[],o=a%15,m=n=>n/s,x=n=>n*n*(3-2*n),l=(n,g,S)=>n+(g-n)*S,T=(n,g,S)=>n.map((D,r)=>l(D,g[r],S)),B=(n,g)=>p.push({pts:f(g,s,c[n]),side:g.side}),M=Math.min(1,s);if(o<4.8){const n=x(k(o/.7,0,1)),g=x(k((o-4)/.8,0,1)),S=R(.55,.8,o)*(1-R(3.55,3.7,o)),D=x(k((o-1)/2.5,0,1));B(1,{x:.5+m(l(.62,.2-.12*D,n)*M)+m(.3*g*M),y:l(.08,.4+.06*D,n)-.32*g+.01*Math.sin(o*4.5)*S,size:.16,roll:-.2,side:"right",curls:T(d.open,d.fist,S)})}else if(o<8.4){const n=x(k((o-4.8)/.7,0,1)),g=x(k((o-7.8)/.6,0,1)),S=R(5.55,5.75,o)*(1-R(7.55,7.7,o));B(0,{x:.5-m(l(.6,.2,n)*M)-m(.3*g*M),y:l(.1,.6,n)-.4*g,size:.16,roll:.35,side:"left",curls:T(d.relaxed,[.2,.1,.1,.1,.1],S),pinch:S})}else if(o<11.8){const n=x(k((o-8.4)/.8,0,1)),g=x(k((o-11.2)/.6,0,1)),S=.36+.06*Math.sin((o-8.4)*1.3),D=.44+.025*Math.sin(o*1.1)-.36*g;B(0,{x:.5-m(l(.6,S,n)*M),y:l(.15,D,n),size:.16,roll:.22,side:"left",curls:d.open}),B(1,{x:.5+m(l(.6,S,n)*M),y:l(.15,D+.02,n),size:.16,roll:-.22,side:"right",curls:d.open})}else{const n=x(k((o-11.8)/2.2,0,1)),g=R(14.1,14.24,o),S=.5+m(l(.6,-.28,n)*M)-m(.36*g*M),D=l(.16,.52,n)+.07*Math.sin(n*Math.PI)+.24*g-.5*R(14.4,15,o);B(1,{x:S,y:D,size:.17,roll:l(-.5,.35,n),side:"right",curls:d.open})}return p}return{id:"chronos",needsPlate:!1,coach:[{gesture:"move",label:"Move",text:"leave time behind"},{gesture:"two",label:"Two palms",text:"stretch time between"},{gesture:"pinch",label:"Pinch",text:"hold to freeze"},{gesture:"fist",label:"Fist",text:"rewind the world"}],activeCues(){const a=[];return e.trail>.25&&a.push("move"),e.gradW>.5&&a.push("two"),e.freeze.holding&&a.push("pinch"),e.rew.phase==="rewind"&&a.push("fist"),a},update:tt,render:rt,reset:st,dispose:it,choreography:ct,get debug(){const a=e.rew;return{head:e.head,count:e.count,maxAge:+e.maxAge.toFixed(3),countL:e.countL,maxAgeL:+e.maxAgeL.toFixed(3),attract:e.attract,rew:a.phase,rw:+a.w.toFixed(3),rpos:+a.pos.toFixed(3),rsp:+a.speed.toFixed(2),rc:[+a.cx.toFixed(3),+a.cy.toFixed(3)],wipe:[a.wipeMode,+a.wipeR.toFixed(2)],burst:+a.burst.toFixed(2),endT:+a.endT.toFixed(2),openT:+a.openT.toFixed(2),gradW:+e.gradW.toFixed(3),gradMax:+e.gradMax.toFixed(3),gradP:[...t.gradP].map(s=>+s.toFixed(3)),gradS:[...t.gradS].map(s=>+s.toFixed(3)),rip:ne.map(s=>[+s.x.toFixed(2),+s.y.toFixed(2),+(e.time-s.t0).toFixed(2),+s.s.toFixed(2),+s.reach.toFixed(2)]),speeds:[le[0].moving,le[1].moving].map(s=>+s.toFixed(2)),lastSF:e.lastSF,freeze:e.freeze.holding,committed:[U[0].committed,U[1].committed],bub:[...t.bub].map(s=>+s.toFixed(3)),bubF:[...t.bubF].map(s=>+s.toFixed(3)),trail:+e.trail.toFixed(3),cut:+e.cut.toFixed(2),leaps:e.leaps,cuts:y.cuts,cutAge:+(e.time-e.cutAt).toFixed(2),taps:[...t.tap].map(s=>+s.toFixed(3)),trailP:[...t.trailP].map(s=>+s.toFixed(3)),hist:[H.width,H.height],histL:[j.width,j.height],field:[O.width,O.height],freezeT:[X.width,X.height],liveT:P?[P.width,P.height]:null}}}}export{wt as createEffect};
