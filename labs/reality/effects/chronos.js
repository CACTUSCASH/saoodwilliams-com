/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-f33a83525867 */(()=>{const g=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(g)||g.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as J,COMMON as xe}from"../engine/glsl.js?v=515dba1803";const z=(g,y,i)=>Math.min(i,Math.max(y,g)),E=(g,y,i)=>{const U=z((i-g)/(y-g),0,1);return U*U*(3-2*U)},L=(g,y,i,U)=>g+(y-g)*(1-Math.exp(-i*U)),ie=(g,y,i,U,N,G)=>{g[y*4]=i,g[y*4+1]=U,g[y*4+2]=N,g[y*4+3]=G},Y=64,de=3,Ge=1.5,it=.8,ct=4.6,Ie=`
const vec3 AMB=vec3(0.36,0.41,0.52);
const vec3 SUNC=vec3(1.633,1.173,0.713);
const float LSCALE=${it.toFixed(2)};
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
`,lt=()=>J+`
uniform float uAspect;
`+Oe+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform sampler2D uMask;uniform vec2 uStep;uniform float uAlphaLight;
void main(){
vec4 a=texture(uSrc,vUv+vec2(-uStep.x,-uStep.y)),b=texture(uSrc,vUv+vec2(uStep.x,-uStep.y));
vec4 c=texture(uSrc,vUv+vec2(-uStep.x,uStep.y)),d=texture(uSrc,vUv+vec2(uStep.x,uStep.y));
vec4 s=(a+b+c+d)*0.25;
float al=uAlphaLight>0.5?s.a:max(texture(uMask,vUv).r*0.6,presentMask(isoH(vUv)).z);
outColor=vec4(sqrt(clamp(s.rgb*(1.0/${Ge.toFixed(2)}),0.0,1.0)),clamp(al,0.0,1.0));
}`,nt=J+`
in vec2 vUv;out vec4 outColor;
uniform sampler2DArray uHist;uniform float uLayer;uniform vec2 uStep;
void main(){
outColor=0.25*(texture(uHist,vec3(vUv+vec2(-uStep.x,-uStep.y),uLayer))+texture(uHist,vec3(vUv+vec2(uStep.x,-uStep.y),uLayer))
+texture(uHist,vec3(vUv+vec2(-uStep.x,uStep.y),uLayer))+texture(uHist,vec3(vUv+uStep,uLayer)));
}`,ut=J+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uCell;
void main(){
vec3 s=vec3(0.0);
for(int j=0;j<5;j++)for(int i=0;i<5;i++)s+=texture(uSrc,vUv+(vec2(float(i),float(j))/4.0-0.5)*uCell*1.6).rgb;
outColor=vec4(s/25.0,1.0);
}`,ft=J+`
in vec2 vUv;out vec4 outColor;
uniform sampler2DArray uHist;uniform vec4 uRing;
void main(){
vec2 c=floor(vUv*8.0)/8.0;vec4 s=vec4(0.0);
for(int j=0;j<4;j++)for(int i=0;i<4;i++)s+=texture(uHist,vec3(c+(vec2(float(i),float(j))+0.5)/32.0,uRing.x));
outColor=s/16.0;
}`,dt=J+xe+Ie+`
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
}`,pt=J+xe+`
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
}`,Oe=`
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
`,ht=`
uniform sampler2DArray uHist;
uniform vec4 uLut[16];
uniform vec4 uRing;      // head layer, layer count, max age (s), history valid
uniform float uHistDt;   // mean interval between layers (s)
uniform sampler2DArray uHistL;   // the long, soft ring (rewind only)
uniform vec4 uLutL[16];
uniform vec4 uRingL;     // head layer, layer count, max age (s, from the sharp ring's newest layer), valid
const float ENC=${Ge.toFixed(2)};
float lutAt(int j){return uLut[j>>2][j&3];}
float lutLAt(int j){return uLutL[j>>2][j&3];}
float ageIndex(float age){
  float f=clamp(age/max(uRing.z,1e-3),0.0,1.0)*float(${Y-1});
  int j=int(floor(f)); int j1=min(j+1,${Y-1});
  return mix(lutAt(j),lutAt(j1),f-float(j));
}
float ageIndexL(float age){
  float f=clamp(age/max(uRingL.z,1e-3),0.0,1.0)*float(${Y-1});
  int j=int(floor(f)); int j1=min(j+1,${Y-1});
  return mix(lutLAt(j),lutLAt(j1),f-float(j));
}
// Past frame at an age, interpolated between layers; a = person matte (attract: window light).
vec4 histA(vec2 uv,float age){
  float k=ageIndex(age);
  float i0=floor(k), fr=k-i0, N=uRing.y;
  vec4 a=texture(uHist,vec3(uv,mod(uRing.x-i0,N)));
  if(fr>0.002) a=mix(a,texture(uHist,vec3(uv,mod(uRing.x-i0-1.0,N))),fr);
  return vec4(a.rgb*a.rgb*ENC,a.a);
}
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
vec3 histS(vec2 uv,float age){
  float w=uRingL.w>0.5?smoothstep(uRing.z-0.3,uRing.z-0.06,age):0.0;
  vec3 s=vec3(0.0);
  if(w<0.999){
    float k=ageIndex(age);
    float i0=floor(k), fr=smoothstep(0.38,0.62,k-i0), N=uRing.y;
    vec4 a=texture(uHist,vec3(uv,mod(uRing.x-i0,N)));
    if(fr>0.002) a=mix(a,texture(uHist,vec3(uv,mod(uRing.x-i0-1.0,N))),fr);
    s=a.rgb*a.rgb*ENC;
  }
  if(w>0.001) s=mix(s,histLong(uv,age),w);
  return s;
}
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
`,vt=J+xe+Ie+ht+`
uniform float uAspect;
`+Oe+`
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
vec3 dusk(vec3 c,float o){return mix(c,c*vec3(0.42,0.5,0.64),o);}
vec3 tunnelLevel(vec2 c,vec2 d,float g,float tw,float B,float rpos,float ast){
vec2 sp=c+rot2(g*tw)*d*pow(B,g);
vec2 suv=uvOf(sp);
vec3 h=histS(clamp(suv,0.0,1.0),rpos+g*ast);
vec2 eo=abs(suv-0.5);
float outside=smoothstep(0.495,0.52,max(eo.x,eo.y));
h*=mix(vec3(1.0),vec3(0.78,0.88,1.12),min(1.0,g*0.24))*pow(0.86,g);
return mix(h,vec3(0.01,0.014,0.025),outside);
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
float ds=0.3*RB.y,xr=x-ds,xu=x+ds;
vec3 rc=vec3(exp(-xr*xr*1.6),exp(-x*x*1.6),exp(-xu*xu*1.6));
vec3 Ld=normalize(vec3(-dir*0.75,0.65));
light+=(rc*0.9+spec*0.5)*env*3.0*max(dot(N,Ld),0.0);
glow+=(spec*(0.5+0.5*uneven)+rc*vec3(0.85,0.92,1.0)*0.16)*env;
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
chroma=max(chroma,g*env*0.6);
vec3 wc=uRew3.z<1.5?vec3(0.62,0.8,1.0):vec3(1.0,0.86,0.66);
vec3 spec=waveSpec(normalize(vec3(-dir*slope*1.4,1.0)))*wc;
float xr=x-0.25,xu=x+0.25;
vec3 rc=wc*vec3(exp(-xr*xr*2.2),exp(-x*x*2.2),exp(-xu*xu*2.2));
vec3 Ld=normalize(vec3(-dir*0.75,0.65));
light+=(rc*0.7+spec*0.4)*env*2.6*max(dot(N,Ld),0.0);
glow+=(spec+rc*0.06)*env;
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
shIn=(1.0-smoothstep(-0.0018,0.0018,sdS))*uGradP.y;
shFr=0.04+0.96*pow(1.0-shN.z,5.0);
shRim=exp(-sdS*sdS/(0.0016*0.0016))*uGradP.y;
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
glow+=(pc*flash*0.6+wsp*0.14)*env*fall*(1.0-0.85*person);
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
float k=0.05+0.22*chroma;
c0=texture(uBase,uv+q);
cur=vec3(texture(uBase,uv+q*(1.0-k)).r,c0.g,texture(uBase,uv+q*(1.0+k)).b);
}else{c0=texture(uBase,uv);cur=c0.rgb;}
float Ln=c0.a/LSCALE;
vec3 col=cur;
float bandD=(gradD+dRip)*(1.0-rwL);
vec3 now=cur;
if(histOK &&((bandD>0.003 && uStill<0.5)|| rwL>0.001)){
vec2 o=uTrailX.xy,o2=vec2(o.x,-o.y);
now=(texture(uBase,uv+q+o).rgb+texture(uBase,uv+q-o).rgb+texture(uBase,uv+q+o2).rgb+texture(uBase,uv+q-o2).rgb)*0.25;
}
if(histOK && bandD>0.003){
float s=(uStill>0.5?0.03:0.014)*uSplit*smoothstep(0.05,0.4,bandD);
vec3 h;float diff=0.0,hm=0.0;
if(uStill>0.5){
vec2 su=uv+q;
float l1=pastL(su,bandD);
h=relight(cur,s>0.0?vec3(pastL(su,max(0.0,bandD-s)),l1,pastL(su,bandD+s)):vec3(l1),Ln);
}else{
vec4 hC=histA(uv+q,bandD);
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
col=mix(col,vec3(luma(col)),0.4*og)*mix(vec3(1.0),vec3(0.8,0.9,1.14),og);
if(uStill<0.5){
float te=smoothstep(0.08,0.3,diff)*bandW*smoothstep(0.25,0.5,hm);
glow+=mix(vec3(1.0,0.86,0.66),vec3(0.62,0.78,1.0),tk)*te*(0.05+1.6*pulse);
}
}
if(shIn+shRim>0.002){
vec2 tg=vec2(-shN2.y,shN2.x);
vec2 ro=shN2*0.05/vec2(uAspect,1.0),rt=tg*0.035/vec2(uAspect,1.0);
vec3 envR=(texture(uEnv,clamp(uv+ro+rt,0.0,1.0)).rgb+texture(uEnv,clamp(uv+ro-rt,0.0,1.0)).rgb)*(0.75/2.0);
col=mix(col,envR*vec3(0.88,0.95,1.06),min(shFr,0.65)*shIn*(1.0-handM));
float dk=max(dot(shN,HK),0.0),df=max(dot(shN,HF),0.0);
float shS=clamp((dk-HK.z)/(1.0-HK.z),0.0,1.0);
glow+=(vec3(1.0,0.93,0.82)*(pow(dk,260.0)*5.0+shS*shS*shS*0.18)+vec3(0.6,0.78,1.0)*pow(df,220.0)*1.6)*shIn;
float keyF=max(dot(shN2,vec2(-0.62,0.78)),0.0);
glow+=vec3(0.78,0.88,1.0)*shRim*(0.12+0.75*keyF*keyF);
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
vec3 w=vec3(pow(tp.y,1.4),tp.y,pow(tp.y,0.8))*cv;
C+=Tr*w*pc;Tr*=1.0-w;
float wa=tp.y*cv;ageW+=wa*ag;covW+=wa;
}
vec3 A3=1.0-Tr;
if(A3.b>0.002){
vec3 P=C/max(A3,vec3(1e-4));
trOld=ageW/max(covW,1e-4);
P=mix(P,vec3(luma(P))*vec3(0.86,0.96,1.14),0.1+0.65*smoothstep(0.15,0.8,trOld));
vec3 aT=A3*gate*uTrailP.w;
col=mix(col,P,aT);
}
}
}
if(histOK && rwL>0.001){
float rpos=uRew.y;
vec3 o=histS(uv+q,rpos);
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
vec3 inner=tunnelLevel(c,d,g,tw,B,rpos,ast);
vec3 prev=kk>1.5?tunnelLevel(c,d,g-1.0,tw,B,rpos,ast):outer;
inner=mix(prev,inner,smoothstep(0.0,0.035,f));
inner+=(cur-now)*agreeW(inner,now)*(1.0-smoothstep(0.0,0.3,g));
inner=dusk(inner,1.0-smoothstep(0.0,0.75,g));
inner*=1.0-0.9*exp(-f/0.22);
if(f<0.3){
vec2 ca=d/max(rr,1e-5);
float fil=snoise(vec3(ca*2.3,kk*1.7-uTime*0.7))*0.6+snoise(vec3(ca*6.1,kk*3.1+uTime*1.3))*0.4;
fil=smoothstep(-0.15,0.75,fil);
float lz=f/0.02;
float seam=(exp(-lz*lz)*0.9+exp(-f/0.07)*0.12)*fil;
vec2 ed=rot2(g*tw)*d;vec2 ea=abs(ed)/max(abs(ed.x)+abs(ed.y),1e-4);vec2 e2=ea*ea;vec2 e8=e2*e2*e2*e2;
vec2 en=normalize(sign(ed)*e8*ea+1e-6);
seam+=exp(-lz*lz)*max(dot(en,vec2(-0.62,0.78)),0.0)*0.9;
sc=mix(vec3(0.5,0.82,1.0),vec3(0.72,0.5,1.0),smoothstep(1.0,4.0,g))*(1.0-deep);
inner+=sc*seam*(0.7+0.6*uRew2.x/1.6);
}
rc=inner;
}
rc*=1.0-0.4*exp(-(1.0-f)/0.05)*step(0.0,kf);
vec3 core=vec3(0.7,0.84,1.0)*uRew4.z;
rc=mix(rc,core*0.35+rc*0.3,deep);
glow+=core*(exp(-rr/0.02)*1.0+exp(-rr/0.12)*0.08)*rwL;
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
if(R>1e-4 && sd<max(0.03,R*1.15)){
bool frozen=bw>0.0;
float bwS=smoothstep(0.0,1.0,abs(bw));
float sh=frozen?bwS*smoothstep(0.012,0.05,R):0.0;
vec2 dp=p-cB;float rr=length(dp);vec2 dir=dp/max(rr,1e-5);
if(sh>0.001){
vec2 sc=rot2(0.6)*(p-(cB+vec2(0.62,-0.84)*R))/R;
float sr=length(sc*vec2(0.86,1.12));
float outside=smoothstep(-0.002,0.008,sd);
float shadow=(1.0-smoothstep(0.5,1.02,sr))*0.34;
float cz0=sr/0.28,cr=(sr-0.52)/0.1;
float caus=exp(-cz0*cz0)*1.3+exp(-cr*cr)*0.2;
col*=1.0-shadow*outside*sh;
light+=vec3(1.0,0.88,0.7)*caus*1.5*outside*sh;
}
if(sd<0.004){
float rn=clamp(1.0+sd/R,0.0,1.0);
float inside=(1.0-smoothstep(-0.0022,0.0012,sd))*bwS;
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
float front=1.0-0.34*fr;
float fm=fr*smoothstep(front-0.12,front+0.26,rn+0.07*n1);
if(fm>0.004){
float an=6.2832*hash12(floor(gl_FragCoord.xy*0.5)+17.0);
vec2 b1=rot2(an)*vec2(0.0042*fm,0.0)/vec2(uAspect,1.0);
vec2 b2=vec2(-b1.y,b1.x)*vec2(uAspect,1.0/uAspect);
vec3 bl=(dec(texture(uFreeze,uv+o+b1))+dec(texture(uFreeze,uv+o-b1))
+dec(texture(uFreeze,uv+o+b2))+dec(texture(uFreeze,uv+o-b2)))*0.25;
fz=mix(fz,bl,smoothstep(0.0,0.5,fm));
vec3 veil=vec3(0.7,0.8,0.92)*(0.25+0.55*luma(bl))+0.02;
fz=mix(fz,veil,fm*0.14);
float drop=smoothstep(0.6,0.95,snoise(vec3(p*380.0,2.7)))*smoothstep(0.3,0.9,fm);
fz+=vec3(0.85,0.92,1.0)*drop*(0.25+0.6*max(dot(n,normalize(vec3(-0.45,0.62,1.0))),0.0))*0.5;
}
fz=mix(vec3(luma(fz)),fz,0.84)*vec3(0.95,0.99,1.05);
seen=mix(seen,fz,bf);
}
if(sh>0.001){
float th=smoothstep(0.55,0.97,rn);
seen*=mix(vec3(1.0),vec3(0.15,0.19,0.25),th*th*0.95*sh);
}
col=mix(col,seen,inside);
if(sh>0.001){
float Fr=0.04+0.96*pow(1.0-cz,5.0);
vec3 rv=2.0*n.z*n-vec3(0.0,0.0,1.0);
vec2 ring=uvOf(cB+dir*R*(1.1+0.9*(1.0-rn)));
vec2 tg=vec2(-dir.y,dir.x)*R*0.3/vec2(uAspect,1.0),rd=dir*R*0.12/vec2(uAspect,1.0);
vec3 around=(texture(uEnv,clamp(ring+tg,0.0,1.0)).rgb+texture(uEnv,clamp(ring-tg,0.0,1.0)).rgb
+texture(uEnv,clamp(ring+rd*2.0,0.0,1.0)).rgb)*(1.0/3.0);
around=mix(around,vec3(luma(around)),0.35)*mix(1.0,0.45,smoothstep(0.8,1.0,rn));
vec3 behind=texture(uEnv,clamp(uvOf(-rv.xy*vec2(0.55,0.4)),0.0,1.0)).rgb*vec3(0.26,0.29,0.34);
vec3 env=mix(behind,around*0.72,smoothstep(0.45,0.95,rn));
col=mix(col,env,min(Fr,0.85)*inside*sh);
vec2 g1,g2;
float kb=softbox(rv,normalize(vec3(-0.62,0.52,0.58)),vec2(0.3,0.4),0.75,g1);
kb*=(1.0-0.3*smoothstep(-0.4,0.5,g1.y))*smoothstep(0.35,0.9,rn);
float sb=softbox(rv,normalize(vec3(-0.9,0.25,-0.35)),vec2(0.2,1.2),0.35,g2);
vec3 spec=vec3(1.0,0.96,0.9)*kb*18.0+vec3(0.85,0.92,1.0)*sb*9.0;
col+=spec*Fr*inside*sh;
float cz2=(rn-0.9)/0.022;
float ca=exp(-cz2*cz2)*pow(max(dot(dir,vec2(0.6,-0.8)),0.0),3.0);
col+=vec3(1.0,0.9,0.74)*ca*(0.12+0.35*luma(seen))*inside*sh;
float rz=(sd+0.0011)/0.0014;
float side=pow(max(dot(dir,vec2(-0.6,0.8)),0.0),2.5)+0.25*pow(max(dot(dir,vec2(0.6,-0.8)),0.0),3.0);
glow+=vec3(0.62,0.82,1.0)*exp(-rz*rz)*side*sh*0.8;
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
glowF+=bc*(exp(-r/0.045)*1.8+exp(-r/0.22)*0.16)*mix(1.0,0.3*(1.0-0.9*person),uStill);
}
col+=col*light*(0.55+0.8*person);
col+=glow*(1.0-0.75*handM)+glowF;
if(rwL>0.001){
float l=luma(col);
vec3 g=mix(col*vec3(0.86,0.97,1.08),col*vec3(1.04,1.0,0.95),smoothstep(0.05,0.5,l));
col=mix(col,g*(0.93+0.22*smoothstep(0.1,0.7,l)),rwL);
}
outColor=vec4(max(col,0.0),1.0);
}`;function xt(g){const y=g.kit,i=g.gl,U=g.caps,N=!!g.mobile,G={capture:y.program(lt(),{label:"chronos capture"}),captureLong:y.program(nt,{label:"chronos capture long"}),sig:y.program(ft,{label:"chronos signature"}),env:y.program(ut,{label:"chronos env"}),live:y.program(dt,{label:"chronos live"}),field:y.program(pt,{label:"chronos field"}),composite:y.program(vt,{label:"chronos composite"})},V=Math.min(N?24:48,U.maxLayers||256),Q=Math.min(N?32:48,U.maxLayers||256),We=N?640*360:960*540,ge=N?15:30,je=N?7:10,qe=2.35,Xe=.24,ae=N?.27:.3,we=N?4:8,Ke=N?2:3,be=()=>{const a={tex:null,fbo:i.createFramebuffer(),width:0,height:0,layer:0};return a.bind=()=>{i.bindFramebuffer(i.FRAMEBUFFER,a.fbo),i.framebufferTextureLayer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,a.tex,0,a.layer),i.viewport(0,0,a.width,a.height)},a},B=be(),W=be();function ye(a,s,c,h){a.tex&&i.deleteTexture(a.tex),a.tex=i.createTexture(),i.bindTexture(i.TEXTURE_2D_ARRAY,a.tex),i.texStorage3D(i.TEXTURE_2D_ARRAY,1,i.RGBA8,s,c,h),i.texParameteri(i.TEXTURE_2D_ARRAY,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D_ARRAY,i.TEXTURE_MAG_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D_ARRAY,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D_ARRAY,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),i.bindTexture(i.TEXTURE_2D_ARRAY,null),a.width=s,a.height=c}function ce(a){a.tex&&i.deleteTexture(a.tex),a.tex=null,a.width=a.height=0}const Ve=U.hdr==="rgba16f"||U.hdr==="rgba32f"?"hdr":"rgba16f",I=y.pingPong(4,4,{format:Ve,filter:"linear"}),j=y.target(4,4,{format:"rgba8"}),$=y.target(40,24,{format:"hdr",filter:"linear"}),le={uSrc:null,uCell:new Float32Array(2)},A={t:y.target(8,8,{format:"rgba8",filter:"nearest"}),pbo:i.createBuffer(),fence:null,prev:new Uint8Array(256),cur:new Uint8Array(256),has:!1,cuts:0};i.bindBuffer(i.PIXEL_PACK_BUFFER,A.pbo),i.bufferData(i.PIXEL_PACK_BUFFER,256,i.STREAM_READ),i.bindBuffer(i.PIXEL_PACK_BUFFER,null);const pe={uHist:null,uRing:null},Ye=1.2;let H=null;const oe=new Float64Array(V),Ae=new Float64Array(Q),Le=new Float32Array(Y),Fe=new Float32Array(Y),t={hand:new Float32Array(8),wrist:new Float32Array(8),tips:new Float32Array(20),brushA:new Float32Array(8),brushB:new Float32Array(8),vel:new Float32Array(8),decay:new Float32Array(4),rip:new Float32Array(de*4),ripB:new Float32Array(de*4),grad:new Float32Array(4),gradP:new Float32Array(4),gradS:new Float32Array(4),rew:new Float32Array(4),rew2:new Float32Array(4),rew3:new Float32Array(4),rew4:new Float32Array(4),ring:new Float32Array(4),ringL:new Float32Array(4),trail:new Float32Array(4),fieldTexel:new Float32Array(2),step:new Float32Array(2),stepL:new Float32Array(2),tap:new Float32Array(32),trailP:new Float32Array(4),cam:new Float32Array(4),bub:new Float32Array(8),bubF:new Float32Array(4),trailX:new Float32Array(4)},Z={uBase:null,uMask:null,uNormals:null,uCam:t.cam,uAspect:1,uT:0,uLx:0},q={uSrc:null,uMask:null,uStep:t.step,uAlphaLight:0,uAspect:1,uHand:t.hand,uWrist:t.wrist,uTips:t.tips},he={uHist:null,uLayer:0,uStep:t.stepL},ee={uPrev:null,uTexel:t.fieldTexel,uDt:0,uAspect:1,uBrushA:t.brushA,uBrushB:t.brushB,uVel:t.vel,uDecay:t.decay,uReset:1,uTime:0},P={uBase:null,uHist:null,uHistL:null,uField:null,uFreeze:j,uNormals:null,uMask:null,uTrailX:t.trailX,uTap:t.tap,uTrailP:t.trailP,uLut:Le,uRing:t.ring,uLutL:Fe,uRingL:t.ringL,uHand:t.hand,uWrist:t.wrist,uTips:t.tips,uGrad:t.grad,uGradP:t.gradP,uGradS:t.gradS,uRip:t.rip,uRipB:t.ripB,uRew:t.rew,uRew2:t.rew2,uRew3:t.rew3,uRew4:t.rew4,uCam:t.cam,uBub:t.bub,uBubF:t.bubF,uTrail:t.trail,uFieldT:t.fieldTexel,uAspect:1,uTime:0,uFrame:0,uLight:0,uSplit:1,uStill:0,uHistDt:.033,uCut:0,uT:0,uLx:0},re=Array.from({length:de},()=>({x:.5,y:.5,t0:-99,s:0,reach:3,disp:1})),ne=[null,null],ve={level:0,tone:.5},me={level:0,pitch:1},D=[0,1].map(()=>({held:!1,committed:!1,fz:0,frost:0,holdUntil:-99,x:.5,y:.5,r:0,target:0,w:0,t0:-99,base:.1})),te=[0,1].map(()=>({has:!1,px:.5,py:.5,detT:0,gap:1/30,pinchT:0,pinchSteady:0,pinchOff:0,fistT:0,w:0,moving:0})),e={time:0,dt:1/60,aspect:16/9,head:-1,count:0,maxAge:.001,lastCapture:-99,lastSF:null,headL:-1,countL:0,maxAgeL:.001,lastCaptureL:-99,cutAt:-99,trailFade:1,paused:!1,pauseAt:0,resetField:!0,attract:!1,srcVersion:-1,lastPaint:-99,gradW:0,gradMax:0,gradHold:0,gradClock:0,gradH:.25,gradS:.1,trail:0,freeze:{holding:!1,need:!1,t0:-99,endAt:-99,x:.5,y:.5,r:.1},rew:{phase:"idle",latch:!1,hand:-1,pos:0,speed:0,w:0,cx:.5,cy:.5,fx:.5,fy:.5,flow:0,openT:0,goneT:0,endT:0,dur:0,startAt:-99,releaseAt:-99,wipeR:0,wipeMode:0,burst:0,core:0},kick:0,aberr:0,lastRipple:-99,cut:0,leaps:0};function $e(a){const s=g.state,c=Math.max(16,s.width),h=Math.max(16,s.height),m=c/h;let d=Math.round(Math.sqrt(We*m)),o=Math.round(d/m);d=Math.max(16,Math.min(d,c)),o=Math.max(16,Math.min(o,h));const x=e.rew.phase!=="idle"&&!!B.tex;(!B.tex||!x&&(Math.abs(d-B.width)>6||Math.abs(o-B.height)>6))&&(ye(B,d,o,V),ye(W,Math.max(16,Math.round(d/2)),Math.max(16,Math.round(o/2)),Q),e.head=-1,e.count=0,e.headL=-1,e.countL=0);const b=N?128:192,l=m>=1?b:Math.max(16,Math.round(b*m)),F=m>=1?Math.max(16,Math.round(b/m)):b;(I.width!==l||I.height!==F)&&(I.resize(l,F),e.resetField=!0);const k=Math.min(1,(N?1280:1920)/Math.max(c,h)),n=Math.round(c*k),w=Math.round(h*k),S=D[0].w>0||D[1].w>0||D[0].held||D[1].held;(j.width!==n||j.height!==w)&&!S&&(j.resize(n,w),j.clear()),e.attract?H?(H.width!==a.width||H.height!==a.height)&&H.resize(a.width,a.height):H=y.target(a.width,a.height,{format:"hdr"}):H&&(H.dispose(),H=null)}function Re(a,s,c,h,m,d){if(c<2||s<0)return m.fill(0),.001;const o=a[(s-(c-1)+h*4)%h],x=Math.max(.001,d-o);let b=0;for(let l=0;l<Y;l++){const F=d-l/(Y-1)*x;for(;b<c-1&&a[(s-(b+1)+h*4)%h]>F;)b++;if(b>=c-1){m[l]=c-1;continue}const M=a[(s-b+h*4)%h],k=a[(s-b-1+h*4)%h];m[l]=F>=M?b:Math.min(c-1,b+(M-F)/Math.max(1e-6,M-k))}return x}function Te(){const a=e.head>=0?oe[e.head]:0;e.maxAge=Re(oe,e.head,e.count,V,Le,a),e.maxAgeL=Re(Ae,e.headL,e.countL,Q,Fe,a)}function Me(){e.head=-1,e.count=0,e.maxAge=.001,e.lastCapture=-99,e.lastSF=null,e.resetField=!0,e.paused=!1,e.headL=-1,e.countL=0,e.maxAgeL=.001,e.lastCaptureL=-99,e.cutAt=-99,e.trailFade=1,A.has=!1,e.gradW=0,e.gradHold=0,e.gradMax=0,e.trail=0,e.kick=0,e.aberr=0,Object.assign(e.freeze,{holding:!1,need:!1,t0:-99,endAt:-99}),Object.assign(e.rew,{phase:"idle",latch:!1,hand:-1,pos:0,speed:0,w:0,openT:0,goneT:0,endT:0,dur:0,wipeR:0,wipeMode:0,burst:0,core:0});for(const a of re)a.t0=-99,a.s=0;e.lastRipple=-99;for(const a of te)a.has=!1,a.pinchT=0,a.pinchSteady=0,a.pinchOff=0,a.fistT=0,a.moving=0;for(const a of D)a.held=!1,a.committed=!1,a.holdUntil=-99,a.w=0,a.r=0,a.frost=0,a.fz=0;e.lastPaint=-99}function Se(){e.time-e.cutAt>=.15&&(e.cutAt=e.time)}function ke(a){return a-e.lastRipple>1.1&&e.gradW<.3&&e.rew.phase==="idle"&&!e.freeze.holding&&e.count>2}function ze(a,s,c,h=3,m=1){let d=re[0];for(const o of re)o.t0<d.t0&&(d=o);d.x=a,d.y=s,d.t0=e.time,d.s=c,d.reach=h,d.disp=m}function Be(a,s,c){e.lastRipple=e.time,ze(a,s,c,3,1),g.audio?.whoosh({strength:.5,duration:.9,up:!0}),g.audio?.chime({strength:.18,pitch:.5}),e.aberr=Math.max(e.aberr,.005)}const He=a=>z(a+(.5-a)*.15,.16,.84),Ee=a=>z(a+(.5-a)*.15,.18,.82),Pe=(a,s,c,h,m,d,o)=>a>-.05&&a<1.05&&s>-.05&&s<1.05&&Math.hypot((a-c)*d,s-h)<o*m;function Ze(a){const s=a.time,c=z(a.dt||1/60,1/240,.05);e.time=s,e.dt=c;const h=g.state,m=e.aspect=h?h.width/Math.max(1,h.height):16/9,d=g.source;d&&d.version!==e.srcVersion&&(e.srcVersion>=0&&Me(),e.srcVersion=d.version),e.attract=!!d?.element&&d.element.tagName==="IMG";const o=e.rew,x=e.freeze;e.cut=L(e.cut,!e.attract&&a.person?.present?1:0,4,c),t.hand.fill(0),t.brushA.fill(0),t.vel.fill(0);let b=0,l=null,F=null,M=null,k=!1;ne[0]=ne[1]=null;for(const r of a.hands){const v=r.id&1,f=te[v];ne[v]=r;const u=r.lost<.12?1:z(1-(r.lost-.12)/.13,0,1),p=r.palm[0],R=r.palm[1],C=r.size,X=Math.hypot((p-f.px)*m,R-f.py);X>1e-6&&(f.gap=s-f.detT,f.detT=s);const O=2.4*z(f.gap,1/60,.25),se=!f.has||X>Math.max(.12,C*1.4,O);f.has&&X>Math.max(.3,1.5*O)&&(Se(),e.leaps++),se&&(f.px=p,f.py=R,f.has=!0),f.w=u;const rt=r.gesture==="fist"||o.phase!=="idle"?.15:r.pinching?e.attract?.15:.5:1,ue=se?0:(e.attract?E(.08,.35,r.speed)*(1-E(.75,.95,r.speed)):E(.22,.85,r.speed))*u*rt*(1-.8*e.gradW);f.moving=ue,b=Math.max(b,ue),ue>.01&&(e.lastPaint=s),ie(t.hand,v,p,R,C,e.attract||o.phase!=="idle"&&r.id!==o.hand?0:u);const Ce=r.points[0],Ne=r.points[1],De=Pe(Ce,Ne,p,R,C,m,1.1);t.wrist[v*4]=De?Ce:p,t.wrist[v*4+1]=De?Ne:R;for(let K=0;K<5;K++){const fe=r.tips[K][0],_e=r.tips[K][1],Ue=Pe(fe,_e,p,R,C,m,1.8);t.tips[v*10+K*2]=Ue?fe:p,t.tips[v*10+K*2+1]=Ue?_e:R}ie(t.brushA,v,p,R,C*(e.attract?1.6:1.45),ue),ie(t.brushB,v,f.px,f.py,0,0),ie(t.vel,v,r.velocity[0]*m,r.velocity[1],C*2.4,u),f.px=p,f.py=R;const T=D[v];if(T.held)f.pinchOff=r.pinching?0:f.pinchOff+c,f.pinchOff>.06||o.phase!=="idle"?T.held=!1:(T.committed||s-T.t0>=.48&&(T.committed=!0,T.t0=s,T.holdUntil=s+1.1),T.target=T.committed?Math.min(.26,T.base*(.9+.9*E(0,1.8,s-T.t0))):T.base*(.22+.28*E(0,.48,s-T.t0)));else{const K=r.pinching&&r.pinch>.9&&r.age>.4&&e.gradW<.5&&o.phase==="idle";f.pinchT=K?f.pinchT+c:0,f.pinchSteady=K&&r.speed<.6?f.pinchSteady+c:0;const fe=!D[0].held&&!D[1].held&&D[0].w<.05&&D[1].w<.05;f.pinchT>=.12&&f.pinchSteady>=.1&&fe&&s-x.endAt>.8&&(T.held=!0,T.committed=!1,T.fz=0,T.frost=0,T.x=r.pinchPoint[0],T.y=r.pinchPoint[1],T.t0=s,T.r=0,T.base=C,f.pinchOff=0,x.need=!0,x.t0=s)}const st=r.gesture==="fist"&&r.fist>.6&&r.speed<1.3&&r.age>.4&&!r.pinching;f.fistT=st?f.fistT+c:0,(r.gesture==="fist"||r.fist>.5)&&(k=!0),f.fistT>.25&&(!l||f.fistT>te[l.id&1].fistT)&&(l=r),o.phase==="rewind"&&r.id===o.hand&&(F=r),!se&&r.age>.3&&r.open>.65&&r.speed>1.7&&!r.pinching&&ke(s)&&Be(p,R,z(.6+(r.speed-1.7)*.3,.6,1.1))}for(let r=0;r<2;r++)if(!ne[r]){const v=te[r];v.has=!1,v.pinchT=0,v.pinchSteady=0,v.fistT=0,v.w=0,v.moving=0,D[r].held=!1}for(const r of a.events)r.type==="throw"&&r.hand&&r.hand.age>.3&&r.hand.open>.55&&ke(s)&&Be(r.hand.palm[0],r.hand.palm[1],1);for(const r of D){const v=r.committed&&(r.held||s<r.holdUntil);r.fz=r.committed?L(r.fz,1,14,c):0,r.frost=v?L(r.frost,1,2,c):r.committed?Math.max(0,r.frost-c*1.6):0,v?(r.w=L(r.w,1,9,c),r.r=L(r.r,r.target,7,c),M||(M=r)):r.held?(r.w=L(r.w,.6,9,c),r.r=L(r.r,r.target,7,c)):(r.w=Math.max(0,r.w-c*(r.committed?1.4:4)),r.r=L(r.r,r.target*.35,r.committed?2.2:5,c))}M&&(x.r=M.r),M&&!x.holding?(x.holding=!0,x.x=M.x,x.y=M.y,g.audio?.chime({strength:.45,pitch:1.6}),g.audio?.whoosh({strength:.22,duration:.35,up:!1})):!M&&x.holding&&(x.holding=!1,x.endAt=s,e.lastRipple=s,e.gradW<.3&&ze(x.x,x.y,.4,x.r*2.4+.06,.15),g.audio?.whoosh({strength:.35,duration:.7,up:!0}),g.audio?.chime({strength:.22,pitch:.75}));const n=a.left,w=a.right,S=a.twoHands&&n&&w&&n.open>.5&&w.open>.5&&!n.pinching&&!w.pinching&&n.gesture!=="fist"&&w.gesture!=="fist"&&o.phase==="idle";if(e.gradHold=S?e.gradHold+c:0,e.gradW=L(e.gradW,e.gradHold>.2?1:0,e.gradHold>.2?3.2:5,c),n&&w){t.grad[0]=n.palm[0],t.grad[1]=n.palm[1],t.grad[2]=w.palm[0],t.grad[3]=w.palm[1];const r=Math.hypot((n.palm[0]-w.palm[0])*m,n.palm[1]-w.palm[1]);e.gradMax=L(e.gradMax,E(.12,.75,r),6,c);const v=.5*(n.size+w.size);e.gradH=L(e.gradH,Math.min(1.5*v+.02,.12+.5*r,.03+.3*r),8,c),e.gradS=L(e.gradS,.6*v,8,c)}if(e.gradClock+=c,o.phase==="idle")o.w=L(o.w,0,12,c),o.latch&&!k&&(o.latch=!1),l&&e.count>12&&!x.holding&&!o.latch&&(Object.assign(o,{phase:"rewind",hand:l.id,pos:0,speed:.25,openT:0,goneT:0,endT:0,dur:0,startAt:s,flow:0,wipeMode:1,wipeR:0}),o.fx=l.palm[0],o.fy=l.palm[1],o.cx=He(o.fx),o.cy=Ee(o.fy),e.paused=!0,e.pauseAt=s,e.resetField=!0,g.audio?.whoosh({strength:.6,duration:1.3,up:!1}),g.audio?.impact({strength:.3,pitch:.6}));else if(o.phase==="rewind"){o.w=1,o.dur+=c;const r=e.countL>=3?Math.max(e.maxAge,e.maxAgeL):e.maxAge,v=Math.max(0,Math.min(ct,r-.1)),f=o.pos>=v-.001;o.endT=f?o.endT+c:0,o.speed=L(o.speed,f?0:1.6*Math.max(.3,E(0,1.1,v-o.pos)),f?8:2.4,c),o.pos=Math.min(v,o.pos+o.speed*c);const u=(s-o.startAt)/.85;if(o.wipeR=2.4*Math.pow(z(u,0,1),1.25),u>=1&&(o.wipeMode=0),!F){for(const p of a.hands)if(p.gesture==="fist"||p.fist>.5){F=p,o.hand=p.id;break}}if(F){o.goneT=0;const p=F.gesture==="fist"||F.fist>.5;o.openT=p?0:o.openT+c,o.fx=L(o.fx,F.palm[0],18,c),o.fy=L(o.fy,F.palm[1],18,c),o.cx=L(o.cx,He(o.fx),5,c),o.cy=L(o.cy,Ee(o.fy),5,c)}else o.goneT+=c;(o.openT>=.15||o.goneT>.25||o.endT>1.4||o.dur>9)&&(Object.assign(o,{phase:"release",releaseAt:s,wipeMode:2,wipeR:0,burst:1,latch:o.openT<.15&&o.goneT<=.25}),e.kick=1,e.aberr=Math.max(e.aberr,.0055),g.audio?.impact({strength:.85,pitch:.9}),g.audio?.whoosh({strength:.7,duration:.5,up:!0}))}else if(o.phase==="release"){o.speed=L(o.speed,0,10,c),o.pos=L(o.pos,0,6,c);const r=(s-o.releaseAt)/.6;o.wipeR=2.4*(1-Math.pow(1-z(r,0,1),1.6)),r>=1&&(Object.assign(o,{phase:"idle",w:0,pos:0,wipeMode:0,hand:-1}),e.count=0,e.countL=0,e.headL=-1,Te(),A.has=!1,e.paused=!1,e.lastCapture=-99,e.lastCaptureL=-99,e.resetField=!0)}o.flow+=c*(.2+.12*o.speed),o.core=L(o.core,o.phase==="rewind"?.75+.35*o.speed/1.6:0,4,c),o.burst=L(o.burst,0,5.5,c),e.kick=L(e.kick,0,9,c),e.aberr=L(e.aberr,0,5,c),e.trail=L(e.trail,b,6,c);const _=g.audio;if(_){const r=o.phase==="rewind"?1:0;ve.level=z(e.trail*.24+e.gradW*.1+r*.42,0,1),ve.tone=z(.25+e.trail*.4+r*(.3+.3*Math.sin(s*9)),0,1),_.layer("noise",ve),me.level=z(e.gradW*.35*e.gradMax+(x.holding?.32:0)+r*.6,0,1),me.pitch=r?.6+o.speed*.5:x.holding?.5:1-.35*e.gradMax*e.gradW,_.layer("hum",me)}}function Je(){if(!A.fence)return;const a=i.clientWaitSync(A.fence,0,0);if(!(a!==i.ALREADY_SIGNALED&&a!==i.CONDITION_SATISFIED)){if(i.deleteSync(A.fence),A.fence=null,i.bindBuffer(i.PIXEL_PACK_BUFFER,A.pbo),i.getBufferSubData(i.PIXEL_PACK_BUFFER,0,A.cur),i.bindBuffer(i.PIXEL_PACK_BUFFER,null),A.has){let s=0,c=0;for(let h=0;h<64;h++){const m=(Math.abs(A.cur[h*4]-A.prev[h*4])+Math.abs(A.cur[h*4+1]-A.prev[h*4+1])+Math.abs(A.cur[h*4+2]-A.prev[h*4+2]))/3;c+=m,m>30&&s++}s>20&&c/64>25&&(Se(),A.cuts++)}A.prev.set(A.cur),A.has=!0}}function Qe(){A.fence||(pe.uHist=B.tex,pe.uRing=t.ring,y.pass(G.sig,A.t,pe),i.bindBuffer(i.PIXEL_PACK_BUFFER,A.pbo),i.readPixels(0,0,8,8,i.RGBA,i.UNSIGNED_BYTE,0),i.bindBuffer(i.PIXEL_PACK_BUFFER,null),A.fence=i.fenceSync(i.SYNC_GPU_COMMANDS_COMPLETE,0))}function et(a){$e(a),e.attract||Je();const s=e.time||a.time,c=e.dt,h=a.aspect;let m=a.base,d=0;if(e.attract&&H){const u=Math.PI*2/15;d=s%15;const p=1-E(5,5.5,d)*(1-E(8.1,8.8,d)),R=.004*Math.sin(u*5.6)+.002*Math.sin(u*3*5.6+1.3),C=.0025*Math.sin(u*2*5.6+.4),X=.006*Math.sin(u*5.6+2),O=.004*Math.sin(u*2*5.6+.9);t.cam[0]=R+(.004*Math.sin(u*d)+.002*Math.sin(u*3*d+1.3)-R)*p,t.cam[1]=C+(.0025*Math.sin(u*2*d+.4)-C)*p,t.cam[2]=1.04+X+(.006*Math.sin(u*d+2)-X)*p,t.cam[3]=O+(.004*Math.sin(u*2*d+.9)-O)*p,Z.uBase=a.base,Z.uMask=a.mask,Z.uNormals=a.normals(),Z.uAspect=h,Z.uT=d,Z.uLx=.18*d,y.pass(G.live,H,Z),m=H}e.lastSF===null&&(e.lastSF=a.sourceFrame);const o=s-e.lastCapture;let x=!1;e.paused||(e.attract?x=o>=.9/ge||e.head<0:a.sourceFrame!==e.lastSF&&(x=o>=.85/ge,e.lastSF=a.sourceFrame)),q.uAlphaLight=e.attract?1:0,x&&(e.head=(e.head+1)%V,B.layer=e.head,oe[e.head]=s,e.count=Math.min(V,e.count+1),e.lastCapture=s,t.step[0]=.25/B.width,t.step[1]=.25/B.height,q.uSrc=m,q.uMask=a.mask,q.uAspect=h,y.pass(G.capture,B,q),(s-e.lastCaptureL>=.92/je||e.headL<0)&&(e.headL=(e.headL+1)%Q,W.layer=e.headL,Ae[e.headL]=s,e.countL=Math.min(Q,e.countL+1),e.lastCaptureL=s,t.stepL[0]=.25/W.width,t.stepL[1]=.25/W.height,he.uHist=B.tex,he.uLayer=e.head,y.pass(G.captureLong,W,he)),Te(),e.attract||(t.ring[0]=e.head,Qe())),e.freeze.need&&(t.step[0]=.25/j.width,t.step[1]=.25/j.height,q.uSrc=m,q.uMask=a.mask,q.uAspect=h,y.pass(G.capture,j,q),e.freeze.need=!1),t.fieldTexel[0]=1/I.width,t.fieldTexel[1]=1/I.height,t.decay[0]=e.attract?.8:1.1,t.decay[1]=Ye,ee.uPrev=I.read,ee.uDt=c,ee.uAspect=h,ee.uReset=e.resetField?1:0,ee.uTime=s,y.pass(G.field,I.write,ee),I.swap(),e.resetField=!1;let b=!1;for(let u=0;u<de;u++){const p=re[u],R=s-p.t0,C=R>=0&&R<3.2&&R*1.15<p.reach?p.s:0;t.rip[u*4]=p.x,t.rip[u*4+1]=p.y,t.rip[u*4+2]=Math.max(0,R),t.rip[u*4+3]=C,t.ripB[u*4]=p.reach,t.ripB[u*4+1]=p.disp*(N?.6:1),C&&(b=!0)}const l=e.rew;t.rew[0]=l.w<.002?0:l.w,t.rew[1]=l.pos,t.rew[2]=l.cx,t.rew[3]=l.cy,t.rew2[0]=l.speed,t.rew2[1]=l.flow%1,t.rew2[2]=qe,t.rew2[3]=Xe,t.rew3[0]=.1+.06*l.speed,t.rew3[1]=l.wipeR,t.rew3[2]=l.wipeMode,t.rew3[3]=l.burst<.002?0:l.burst,t.rew4[0]=l.fx,t.rew4[1]=l.fy,t.rew4[2]=l.core,t.rew4[3]=0,(t.rew[0]||l.wipeMode||t.rew3[3])&&(b=!0);let F=0;for(let u=0;u<2;u++){const p=D[u];t.bub[u*4]=p.x,t.bub[u*4+1]=p.y,t.bub[u*4+2]=p.r,t.bub[u*4+3]=p.w<.002?0:p.committed?p.w:-p.w,t.bubF[u]=p.fz,t.bubF[2+u]=p.frost,t.bub[u*4+3]&&(F=1)}t.trail[0]=N?10:16,t.trail[3]=F,t.gradP[0]=Math.max(.05,Math.min(e.attract?.9:1.5,e.maxAge*.8))*(.35+.65*e.gradMax),t.gradP[1]=e.gradW<.003?0:e.gradW,t.gradP[2]=e.gradClock,t.gradP[3]=E(.2,.9,e.gradW),t.gradS[0]=e.gradH,t.gradS[1]=e.gradS,t.gradS[2]=.8,t.gradS[3]=Math.max(.06,e.maxAge*.95),t.gradP[1]&&(b=!0),t.ring[0]=Math.max(0,e.head),t.ring[1]=V,t.ring[2]=e.maxAge,t.ring[3]=e.count>=3?1:0,t.ringL[0]=Math.max(0,e.headL),t.ringL[1]=Q,t.ringL[2]=e.maxAgeL,t.ringL[3]=e.countL>=3&&e.count>=3?1:0;const M=b||e.attract?a.normals():a.mask;P.uBase=m,P.uHist=B.tex,P.uHistL=W.tex,P.uField=I.read,P.uNormals=M,P.uMask=a.mask,P.uAspect=h,P.uTime=s,P.uFrame=a.frame%64,P.uLight=b||e.attract?1:0,P.uStill=e.attract?1:0,P.uCut=e.cut,P.uT=d,P.uLx=.18*d,P.uSplit=N?0:1;const k=e.count>1?e.maxAge/(e.count-1):.033;P.uHistDt=k;const n=!e.attract&&e.count>=3&&l.w<.99,w=s-e.cutAt,S=w<.15;e.trailFade=S?Math.max(0,e.trailFade-c/.15):Math.min(1,e.trailFade+c/.2);const _=S&&e.trailFade>0?1e9:Math.max(0,w);t.tap.fill(0);let r=0;if(n){const u=Math.max(1,Math.round(ae/we/Math.max(k,.001))),p=oe[e.head];for(let R=1;R<=we;R++){const C=R*u;if(C>=e.count)break;const X=(e.head-C+V*4)%V,O=p-oe[X];if(O>ae*1.15||O>_)break;const se=Math.exp(-Math.max(0,O-.07)/.11)*(.7+.3*E(.02,.07,O))*(1-E(ae*.75,ae*1.15,O));ie(t.tap,r++,X,se,O,u*k)}}if(t.trailP[0]=r,t.trailP[1]=Ke,t.trailP[2]=ae,t.trailP[3]=.5*E(0,1,e.trailFade),t.trailX[0]=.5/B.width,t.trailX[1]=.5/B.height,t.trailX[2]=n&&r>0?1:0,F||t.gradP[1]){const u=Math.max(8,Math.round(40/Math.max(.2,h)));$.height!==u&&$.resize(40,u),le.uSrc=m,le.uCell[0]=1/$.width,le.uCell[1]=1/$.height,y.pass(G.env,$,le)}P.uEnv=$,y.pass(G.composite,a.scene,P);const v=a.post,f=l.w;v.bloom=.075+.08*f+.05*e.gradW+(b?.03:0)+.06*l.burst+(e.freeze.holding?.03:0),v.vignette=.36+.22*f+.06*e.gradW,v.grain=.03+.015*f,v.saturation=1-.12*f,v.exposure=1-.05*f-.06*e.gradW,v.aberration=Math.min(.02,e.aberr+.003*f),v.flash=l.burst*.06,v.filmic=.1*f,e.kick>.01&&(v.shake[0]=(Math.sin(s*91)*.6+Math.sin(s*57.3)*.4)*.005*e.kick,v.shake[1]=(Math.cos(s*83)*.6+Math.sin(s*61.7)*.4)*.005*e.kick)}function tt(){ce(B),ce(W),H&&(H.dispose(),H=null),Me()}function at(){ce(B),ce(W),i.deleteFramebuffer(B.fbo),i.deleteFramebuffer(W.fbo),A.fence&&i.deleteSync(A.fence),A.fence=null,i.deleteBuffer(A.pbo),A.t.dispose(),I.dispose(),j.dispose(),$.dispose(),H?.dispose(),H=null;for(const a in G)G[a].dispose()}function ot(a,s,c,h,m){const d=[],o=a%15,x=n=>n/s,b=n=>n*n*(3-2*n),l=(n,w,S)=>n+(w-n)*S,F=(n,w,S)=>n.map((_,r)=>l(_,w[r],S)),M=(n,w)=>d.push({pts:h(w,s,c[n]),side:w.side}),k=Math.min(1,s);if(o<4.8){const n=b(z(o/.7,0,1)),w=b(z((o-4)/.8,0,1)),S=E(.55,.8,o)*(1-E(3.55,3.7,o)),_=b(z((o-1)/2.5,0,1));M(1,{x:.5+x(l(.62,.2-.12*_,n)*k)+x(.3*w*k),y:l(.08,.4+.06*_,n)-.32*w+.01*Math.sin(o*4.5)*S,size:.16,roll:-.2,side:"right",curls:F(m.open,m.fist,S)})}else if(o<8.4){const n=b(z((o-4.8)/.7,0,1)),w=b(z((o-7.8)/.6,0,1)),S=E(5.55,5.75,o)*(1-E(7.55,7.7,o));M(0,{x:.5-x(l(.6,.2,n)*k)-x(.3*w*k),y:l(.1,.6,n)-.4*w,size:.16,roll:.35,side:"left",curls:F(m.relaxed,[.2,.1,.1,.1,.1],S),pinch:S})}else if(o<11.8){const n=b(z((o-8.4)/.8,0,1)),w=b(z((o-11.2)/.6,0,1)),S=.36+.06*Math.sin((o-8.4)*1.3),_=.44+.025*Math.sin(o*1.1)-.36*w;M(0,{x:.5-x(l(.6,S,n)*k),y:l(.15,_,n),size:.16,roll:.22,side:"left",curls:m.open}),M(1,{x:.5+x(l(.6,S,n)*k),y:l(.15,_+.02,n),size:.16,roll:-.22,side:"right",curls:m.open})}else{const n=b(z((o-11.8)/2.2,0,1)),w=E(14.1,14.24,o),S=.5+x(l(.6,-.28,n)*k)-x(.36*w*k),_=l(.16,.52,n)+.07*Math.sin(n*Math.PI)+.24*w-.5*E(14.4,15,o);M(1,{x:S,y:_,size:.17,roll:l(-.5,.35,n),side:"right",curls:m.open})}return d}return{id:"chronos",needsPlate:!1,coach:[{gesture:"move",label:"Move",text:"leave time behind"},{gesture:"two",label:"Two palms",text:"stretch time between"},{gesture:"pinch",label:"Pinch",text:"hold to freeze"},{gesture:"fist",label:"Fist",text:"rewind the world"}],activeCues(){const a=[];return e.trail>.25&&a.push("move"),e.gradW>.5&&a.push("two"),e.freeze.holding&&a.push("pinch"),e.rew.phase==="rewind"&&a.push("fist"),a},update:Ze,render:et,reset:tt,dispose:at,choreography:ot,get debug(){const a=e.rew;return{head:e.head,count:e.count,maxAge:+e.maxAge.toFixed(3),countL:e.countL,maxAgeL:+e.maxAgeL.toFixed(3),attract:e.attract,rew:a.phase,rw:+a.w.toFixed(3),rpos:+a.pos.toFixed(3),rsp:+a.speed.toFixed(2),rc:[+a.cx.toFixed(3),+a.cy.toFixed(3)],wipe:[a.wipeMode,+a.wipeR.toFixed(2)],burst:+a.burst.toFixed(2),endT:+a.endT.toFixed(2),openT:+a.openT.toFixed(2),gradW:+e.gradW.toFixed(3),gradMax:+e.gradMax.toFixed(3),gradP:[...t.gradP].map(s=>+s.toFixed(3)),gradS:[...t.gradS].map(s=>+s.toFixed(3)),rip:re.map(s=>[+s.x.toFixed(2),+s.y.toFixed(2),+(e.time-s.t0).toFixed(2),+s.s.toFixed(2),+s.reach.toFixed(2)]),speeds:[te[0].moving,te[1].moving].map(s=>+s.toFixed(2)),lastSF:e.lastSF,freeze:e.freeze.holding,committed:[D[0].committed,D[1].committed],bub:[...t.bub].map(s=>+s.toFixed(3)),bubF:[...t.bubF].map(s=>+s.toFixed(3)),trail:+e.trail.toFixed(3),cut:+e.cut.toFixed(2),leaps:e.leaps,cuts:A.cuts,cutAge:+(e.time-e.cutAt).toFixed(2),taps:[...t.tap].map(s=>+s.toFixed(3)),trailP:[...t.trailP].map(s=>+s.toFixed(3)),hist:[B.width,B.height],histL:[W.width,W.height],field:[I.width,I.height],freezeT:[j.width,j.height],liveT:H?[H.width,H.height]:null}}}}export{xt as createEffect};
