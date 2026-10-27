/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-de8049136198 */(()=>{const A=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(A)||A.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as te,COMMON as We}from"../engine/glsl.js?v=0aafddc6f3";const B=(A,b,i)=>Math.min(i,Math.max(b,A)),O=(A,b,i)=>{const F=B((i-A)/(b-A),0,1);return F*F*(3-2*F)},K=(A,b,i)=>A+(b-A)*i,G=(A,b,i,F)=>A+(b-A)*(1-Math.exp(-i*F)),m0=15e3,at=6e3,Ke=12,st=7*4096,h0=[[0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[9,10],[10,11],[11,12],[13,14],[14,15],[15,16],[17,18],[18,19],[19,20],[0,5],[0,17],[5,9],[9,13],[13,17],[0,9],[0,13],[5,17],[2,5],[0,-1],[1,5]],_=h0.length,nt=Int8Array.from(h0,A=>A[0]),lt=Int8Array.from(h0,A=>A[1]),v0=[],it=te+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uMask;uniform sampler2D uBase;uniform sampler2D uBg;uniform float uBgOk;uniform float uAspect;uniform vec2 uHandSize;
uniform float uMDbg;
uniform vec4 uPalm;
uniform vec2 uReach;
uniform vec4 uSweep;
uniform vec2 uUncert;
uniform vec2 uFresh;
uniform vec4 uBones[${_*2}];
uniform vec4 uCurl[3];
const float RAD[${_}]=float[${_}](0.14,0.13,0.115,0.1,0.1,0.095,0.085,0.105,0.1,0.09,0.1,0.095,0.085,0.09,0.085,0.075,
0.17,0.17,0.17,0.17,0.17,0.2,0.2,0.18,0.24,0.27,0.2);
const int FIN[${_}]=int[${_}](-1,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-2,-1);
const float OCW[${_}]=float[${_}](0.0,0.45,0.85,1.0,0.45,0.85,1.0,0.45,0.85,1.0,0.45,0.85,1.0,0.45,0.85,1.0,
0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0);
const int CORE[${_}]=int[${_}](0,2,2,2,1,1,2,1,1,2,1,1,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0);
float capsule(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.0,1.0);return length(pa-ba*h);}
float lum(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}
float cdist(vec3 a,vec3 b){
vec3 ca=a/(a.r+a.g+a.b+0.03),cb=b/(b.r+b.g+b.b+0.03);
vec3 d=ca-cb;float dl=log((lum(a)+0.015)/(lum(b)+0.015));
return dot(d,d)/0.0016+dl*dl/0.35;
}
float sdPalm(vec2 p,vec2 v[7]){
float d=1e9,s=1.0;
for(int i=0;i<7;i++){
int j=i==0?6:i-1;
vec2 e=v[j]-v[i],w=p-v[i];
vec2 b=w-e*clamp(dot(w,e)/max(dot(e,e),1e-10),0.0,1.0);
d=min(d,dot(b,b));
bool c1=p.y>=v[i].y,c2=p.y<v[j].y,c3=e.x*w.y>e.y*w.x;
if((c1&&c2&&c3)||(!c1&&!c2&&!c3))s=-s;
}
return s*sqrt(d);
}
void main(){
vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
vec3 c=texture(uBase,vUv).rgb;
vec3 bc=texture(uBg,vUv).rgb;
float m=smoothstep(0.3,0.7,texture(uMask,vUv).r);
float best=0.0,dall=1e3,lit=0.0,occ=0.0;vec3 dbgK=vec3(0.0);
for(int h=0;h<2;h++){
float sz=h==0?uHandSize.x:uHandSize.y;
if(sz<=0.0)continue;
vec2 pu=h==0?uPalm.xy:uPalm.zw;
if(length(p-(pu-0.5)*vec2(uAspect,1.0))>(h==0?uReach.x:uReach.y))continue;
vec4 cu=uCurl[h];float cpk=h==0?uCurl[2].x:uCurl[2].y;
float dPalm=1e3,dFin=1e3,dFore=1e3,dSw=1e3,dFm=1e3,dAx=1e3,dCoreT=1e3,dCoreF=1e3;
vec2 sw=h==0?uSweep.xy:uSweep.zw;
vec2 axP=vec2(0.0);
float dFN=1e3,fR=0.0;vec2 fQ=vec2(0.0),fN=vec2(1.0,0.0);
for(int i=0;i<${_};i++){
vec4 b=uBones[h*${_}+i];
float rr=RAD[i]*sz;
vec2 pa=p-b.xy,ba=b.zw-b.xy;float hh=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.0,1.0);
float d=(length(pa-ba*hh)-rr)/sz;
bool tipB=i==3||i==6||i==9||i==12||i==15;
if(FIN[i]!=-2&&d<dAx){dAx=d;axP=b.xy+ba*(tipB?min(hh,0.8):hh);}
float ds=(min(capsule(p+sw,b.xy,b.zw),capsule(p-sw,b.xy,b.zw))-rr)/sz;
dSw=min(dSw,ds);
int f=FIN[i];
if(f>=0){
if(d<dFN){dFN=d;fQ=b.xy+ba*hh;fN=normalize(vec2(-ba.y,ba.x)+vec2(1e-7,0.0));fR=rr;}
dFin=min(dFin,d);dFm=min(dFm,ds);
if(CORE[i]==2)dCoreT=min(dCoreT,tipB?(capsule(p,b.xy,b.xy+ba*0.8)-rr)/sz:d);else dCoreF=min(dCoreF,d);
float cf=f==0?cu.x:f==1?cu.y:f==2?cu.z:f==3?cu.w:cpk;
occ=max(occ,smoothstep(0.04,-0.06,d)*OCW[i]*smoothstep(0.22,0.65,cf));
}else if(f==-1)dPalm=min(dPalm,d);
else dFore=d;
}
float dmin=min(min(dPalm,dFin),dFore);
float fresh=h==0?uFresh.x:uFresh.y;
vec3 cp=texture(uBase,pu).rgb;
float skinL=smoothstep(0.06,0.16,(cp.r-cp.b)/(cp.r+cp.g+cp.b+0.03));
float here=uBgOk>0.5?max(smoothstep(1.0,4.0,cdist(cp,texture(uBg,pu).rgb)),max(smoothstep(0.3,0.7,texture(uMask,pu).r),fresh)*skinL):1.0;
dall=min(dall,min(dmin,dSw)+(1.0-here)*0.8);
float ur=h==0?uUncert.x:uUncert.y;
float reachB=max(0.13,ur);
float dHull=min(dmin,dSw);
if(dHull>reachB)continue;
int o0=h*${_};
vec2 V[7];
V[0]=uBones[o0].xy;V[1]=uBones[o0].zw;V[2]=uBones[o0+1].zw;
for(int k=0;k<4;k++){
vec4 bk=uBones[o0+4+k*3];
vec2 ax=bk.zw-bk.xy;
V[3+k]=bk.xy+ax*min(0.1*sz/max(length(ax),1e-5),0.35);
}
float dPoly=sdPalm(p,V)/sz;
float o=sz*0.12;
vec3 pc=(texture(uBase,pu).rgb+texture(uBase,pu+vec2(o/uAspect,0.0)).rgb+texture(uBase,pu-vec2(o/uAspect,0.0)).rgb
+texture(uBase,pu+vec2(0.0,o)).rgb+texture(uBase,pu-vec2(0.0,o)).rgb)*0.2;
float trust=(h==0?uCurl[2].z:uCurl[2].w)*fresh;
vec2 axUv=axP/vec2(uAspect,1.0)+0.5;
vec3 pcL=texture(uBase,axUv).rgb;
float okL=uBgOk>0.5?smoothstep(1.0,4.0,cdist(pcL,texture(uBg,axUv).rgb)):1.0;
float Ds=min(cdist(c,pcL)+(1.0-okL)*30.0,cdist(c,pc)+1.0),Db=cdist(c,bc);
float sep=min(cdist(pcL,bc)+(1.0-okL)*30.0,cdist(pc,bc)+2.0);
float key=1.0/(1.0+exp(clamp((Ds-Db)*0.6,-30.0,30.0)))*smoothstep(16.0,6.0,Ds);
float conf=uBgOk*smoothstep(1.2,5.0,sep);
float geo=max(smoothstep(0.02,-0.05,min(dFin,dPalm))*max(trust,m),smoothstep(0.02,-0.05,dFm)*0.6*max(trust,m));
geo=max(geo,smoothstep(0.0,-0.06,dFore)*m)*here;
float core=max(smoothstep(0.01,-0.03,dCoreT),smoothstep(-0.02,-0.06,dCoreF))*max(fresh,m)*here;
float band=smoothstep(reachB,reachB*0.5,dHull);
float need=smoothstep(0.02,reachB,dHull);
float keyF=smoothstep(0.45*need,1.0-0.05*need,key);
float a=band*mix(geo,keyF,conf);
a=max(a,smoothstep(0.0,-0.08,dFore)*max(m*0.92,keyF*conf*smoothstep(0.25,0.6,m)));
float palmCore=smoothstep(-0.01,-0.08,dPoly)*max(fresh*here,key*conf);
float roomK=conf/(1.0+exp(clamp((Db-Ds+4.0)*0.6,-30.0,30.0)));
a=max(a,max(palmCore,core)*(1.0-0.9*roomK));
if(dFN<0.0&&uBgOk>0.5&&length(p-fQ)<fR*0.72){
vec2 u1=(fQ+fN*fR*0.75)/vec2(uAspect,1.0)+0.5,u2=(fQ-fN*fR*0.75)/vec2(uAspect,1.0)+0.5;
vec3 c1=texture(uBase,u1).rgb,c2=texture(uBase,u2).rgb;
float s1=min(cdist(c1,pcL),cdist(c1,pc)+1.0)-cdist(c1,texture(uBg,u1).rgb);
float s2=min(cdist(c2,pcL),cdist(c2,pc)+1.0)-cdist(c2,texture(uBg,u2).rgb);
a=max(a,smoothstep(0.0,-3.0,max(s1,s2))*smoothstep(0.0,-0.02,dFN));
}
best=max(best,a);
lit=max(lit,band*key*conf);
dbgK=max(dbgK,vec3(key,conf,band*0.5+0.5*smoothstep(0.02,-0.02,dHull)));
}
outColor=vec4(best,clamp(dall+0.25,0.0,1.0),lit,min(occ,best));
if(uMDbg>0.5)outColor=vec4(dbgK,1.0);
}`,rt=te+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uHand;uniform sampler2D uMask;uniform float uHoleOn;
float handAt(vec2 uv){vec4 m=texture(uHand,uv);return max(smoothstep(0.02,0.25,max(m.r,m.b*1.6)),smoothstep(0.5,0.42,m.g));}
void main(){
vec3 c=texture(uBase,vUv).rgb;
float h=0.0;
if(uHoleOn>0.5){
h=handAt(vUv);
vec2 tx=1.0/vec2(textureSize(uHand,0));
for(int k=0;k<8;k++){
float an=float(k)*0.7853982+0.39;
h=max(h,handAt(vUv+vec2(cos(an),sin(an))*tx*(k%2==0?4.5:3.0)));
}
float dH=texture(uHand,vUv).g-0.25;
h=max(h,smoothstep(0.45,0.75,texture(uMask,vUv).r)*smoothstep(0.26,0.12,dH));
}
float a=(1.0-h)*(1.0-h);
outColor=vec4(c*a,a);
}`,ct=te+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;
void main(){
vec4 s=texture(uSrc,vUv+uTexel*vec2(-0.5,-0.5))+texture(uSrc,vUv+uTexel*vec2(0.5,-0.5))
+texture(uSrc,vUv+uTexel*vec2(-0.5,0.5))+texture(uSrc,vUv+uTexel*vec2(0.5,0.5));
s*=0.25;
float a=min(1.0,s.a*4.0);
outColor=s.a>1e-5?vec4(s.rgb/s.a*a,a):vec4(0.0);
}`,ut=te+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uFine;uniform sampler2D uCoarse;uniform float uLast;
void main(){
vec4 f=texture(uFine,vUv);
if(uLast>0.5){
ivec2 sz=textureSize(uFine,0);
vec2 me=vUv*vec2(sz);
vec4 acc=vec4(0.0),all4=vec4(0.0);
for(int y=0;y<32;y++){
if(y>=sz.y)break;
for(int x=0;x<32;x++){
if(x>=sz.x)break;
vec4 t=texelFetch(uFine,ivec2(x,y),0);
vec2 d=vec2(float(x),float(y))+0.5-me;
acc+=t*exp(-dot(d,d)*0.3);all4+=t;
}
}
acc+=all4*0.002;
vec3 est=acc.a>1e-6?acc.rgb/acc.a:vec3(0.25);
outColor=vec4(f.rgb+est*(1.0-f.a),1.0);
return;
}
outColor=vec4(f.rgb+texture(uCoarse,vUv).rgb*(1.0-f.a),1.0);
}`,p0=`
vec3 diskHue(float t){
  vec3 c=mix(vec3(1.0,0.2,0.035),vec3(1.0,0.46,0.13),smoothstep(0.22,0.6,t));
  c=mix(c,vec3(1.0,0.74,0.46),smoothstep(0.55,1.0,t));
  c=mix(c,vec3(0.97,0.93,0.92),smoothstep(0.95,1.4,t));
  return mix(c,vec3(0.74,0.85,1.0),smoothstep(1.35,2.0,t));
}
`,ft=te+We+p0+`
in vec2 vUv;
layout(location=0)out vec4 oEmit;
layout(location=1)out vec4 oLens;
uniform sampler2D uMask;
uniform float uAspect;uniform float uTime;uniform float uFrame;uniform float uMobile;
uniform float uQuality;
uniform vec2 uRes;
uniform vec4 uOrbA[2];
uniform vec4 uOrbB[2];
uniform vec4 uSingA;
uniform vec4 uSingB;
uniform vec4 uDiskP;
uniform mat3 uDisk;
uniform vec4 uShockA;
uniform vec4 uShockB;
uniform vec4 uBridge;
uniform vec4 uBridgeAB;
uniform sampler2D uHand;uniform float uHandOn;
uniform vec4 uPin;
const float Z0=20.0;
const float BMAX=13.0;
const float SHADOW=2.598;
float diskNoise(float r,float ang,float t){
float lr=log(r);
float a=ang+1.7*lr;
float n=snoise(vec3(cos(a)*1.7,sin(a)*1.7,lr*9.5+t*0.05));
float n2=snoise(vec3(cos(a)*3.6,sin(a)*3.6,lr*23.0)+vec3(4.1,1.7,t*0.08));
float ridge=1.0-abs(n);ridge*=ridge;
return clamp(0.3+0.5*ridge+0.35*n2*ridge+0.12*n,0.0,1.3);
}
vec4 diskShade(vec3 x,vec3 rd){
vec3 lx=x*uDisk;
float r=length(lx.xz);
float rin=uDiskP.x,rout=uDiskP.y;
if(r<rin*0.8||r>rout)return vec4(0.0);
float ph=atan(lx.z,lx.x);
float om=13.0*pow(r,-1.5);
float T=uDiskP.z;
const float P=7.0;
float c0=fract(T/P),c1=fract(T/P+0.5);
float n0=diskNoise(r,ph+om*c0*P,T),n1=diskNoise(r,ph+om*c1*P,T+3.7);
float w0=1.0-abs(2.0*c0-1.0);
float dens=mix(n1,n0,w0);
float x0=rin/r;
float flux=max(1.0-sqrt(min(x0,1.0)),0.0)*x0*x0*x0/0.0565;
flux+=smoothstep(rin*0.8,rin,r)*smoothstep(rin*1.15,rin,r)*0.35;
float edge=smoothstep(rin*0.8,rin*1.0,r)*smoothstep(rout,rout*0.62,r);
vec3 n=uDisk[1];
vec3 vo=normalize(cross(n,x));
float beta=clamp(sqrt(0.5/max(r-1.0,0.35)),0.0,0.8);
float cosT=dot(vo,-rd);
float g=sqrt(1.0-beta*beta)/(1.0-beta*cosT)*sqrt(max(1.0-1.0/r,0.04));
float boost=g*g*g;
vec3 hue=diskHue(pow(min(x0,1.25),0.75)*g*1.05);
float I=flux*boost*uDiskP.w*(0.55+0.45*dens)*0.72;
vec3 col=mix(hue,vec3(1.0,0.94,0.86),smoothstep(1.2,5.0,I)*0.7)*I;
float a=clamp((0.25+0.75*dens)*edge*(0.55+0.45*min(flux*1.6,1.0)),0.0,0.96);
return vec4(col*a,a);
}
float alphaWeak(float b){return(2.0/b+2.945/(b*b))*Z0/sqrt(Z0*Z0+b*b);}
vec4 traceBH(vec2 b,float L,inout vec3 em){
vec3 pos=vec3(b,Z0),vel=vec3(0.0,0.0,-1.0);
float h2=dot(b,b);
vec3 n=uDisk[1];
float s0=dot(pos,n);
float T=1.0;float cap=0.0;
float stepK=uMobile>0.5?mix(0.2,0.14,uQuality):mix(0.13,0.08,uQuality);
int maxI=int(uMobile>0.5?mix(46.0,64.0,uQuality):mix(76.0,120.0,uQuality));
for(int i=0;i<120;i++){
if(i>=maxI)break;
float r2=dot(pos,pos),r=sqrt(r2);
float dt=clamp(stepK*r,0.012,3.0);
vec3 vh=vel-1.5*h2*pos/(r2*r2*r)*(0.5*dt);
vec3 np=pos+vh*dt;
float nr2=dot(np,np),nr=sqrt(nr2);
vel=vh-1.5*h2*np/(nr2*nr2*nr)*(0.5*dt);
float s1=dot(np,n);
if(s0*s1<0.0&&T>0.01){
vec3 xc=mix(pos,np,s0/(s0-s1));
vec4 d=diskShade(xc,normalize(vel));
em+=T*d.rgb;T*=1.0-d.a;
}
s0=s1;pos=np;
if(nr<1.0){cap=1.0;break;}
if(pos.z<-Z0||(nr>Z0*1.3&&dot(pos,vel)>0.0))break;
}
if(cap>0.5)return vec4(b,0.0,1.0);
vec3 d=normalize(vel);
float ang=acos(clamp(-d.z,-1.0,1.0));
vec2 dir=d.xy/max(length(d.xy),1e-6);
float f=ang<1.0?tan(ang):1.5574+(ang-1.0)*3.43;
vec2 hit=pos.xy+dir*f*(L+pos.z);
return vec4(hit,T,0.0);
}
vec3 tintBlue(float e){e=max(e,0.0);return vec3(1.0-exp(-e*0.05),1.0-exp(-e*0.22),1.0)*e;}
vec3 tintRed(float e){e=max(e,0.0);return vec3(1.0,1.0-exp(-e*0.12),1.0-exp(-e*0.028))*e;}
void orbField(int i,vec2 p,float jit,float calmH,inout vec2 off,inout vec3 emit,inout float bgT,inout float front){
vec4 A=uOrbA[i];vec4 B=uOrbB[i];
float vis=A.w;
if(vis<0.002)return;
vec2 q=p-A.xy;float R=max(A.z,1e-4);float r=length(q);float s=r/R;
if(s>4.4)return;
vec2 qn=q/max(r,1e-6);
float seed=B.z;float t=uTime;float flare=1.0+B.w;
float vo=vis*min(vis,1.0);
float win=smoothstep(4.0,1.8,s);
float F=s<1.0?s:1.0/(s*s);
int NS=int(floor((uMobile>0.5?4.0:7.0)*mix(0.55,1.0,uQuality)+0.5));
if(B.x<0.5){
front=max(front,vis*smoothstep(1.04,0.86,s));
float th=vis*win*(s<1.0?0.6+0.95*(1.0-s)*(1.0-s):0.72/(s*s*s*s+0.2));
vec2 qq=rot2(th)*(q+qn*R*0.22*vis*F*win);
qq+=qn*R*0.035*vis*sin(10.0*s+t*7.5)*exp(-1.1*s)*win;
off+=(qq-q)*calmH*min(vis,1.0);
float e=0.0;
if(s<1.0){
float zf=sqrt(1.0-s*s);
float acc=0.0;
for(int k=0;k<7;k++){
if(k>=NS)break;
float z=zf*(1.0-2.0*(float(k)+jit)/float(NS));
vec3 x=vec3(q/R,z);
float rr=length(x);
x.xy=rot2(t*1.9+2.1/(rr+0.28))*x.xy;
x.yz=rot2(t*0.41+seed)*x.yz;
float n=snoise(x*2.3+vec3(seed,0.0,t*0.3));
float fil=pow(max(1.0-abs(n),0.0),11.0);
float n2=snoise(x*4.6+vec3(t*0.45,seed,1.3));
fil+=pow(max(1.0-abs(n2),0.0),14.0)*0.85;
acc+=fil*(1.0+2.5*smoothstep(0.8,0.15,rr));
}
e+=acc*(2.0*zf/float(NS))*4.2;
float limb=1.0/sqrt(max(1.0-s*s,0.02));
e+=0.55*zf+0.75*limb*smoothstep(1.0,0.9,s);
bgT*=1.0-0.84*vo*smoothstep(1.02,0.6,s);
}
e+=40.0*exp(-s*s*70.0)*flare+4.0*exp(-s*s*9.0);
if(s>0.9){
float ang=atan(q.y,q.x);
float sp=ang*2.0+3.4*log(s)+t*2.6;
float w=snoise(vec3(cos(sp)*1.3,sin(sp)*1.3,s*1.4-t*0.7+seed));
e+=pow(max(w*0.5+0.5,0.0),4.0)*exp(-(s-1.0)*2.2)*2.2;
}
e+=0.22/(1.0+pow(s*1.2,3.0));
emit+=tintBlue(e)*vis*0.32;
}else{
float ang=atan(q.y,q.x);
vec2 dn=qn;
float lb=1.0+0.032*snoise(vec3(dn*2.1,t*0.6+seed))+0.016*snoise(vec3(dn*5.5,t*1.4+seed*1.7));
float se=s/lb;
front=max(front,vis*smoothstep(1.04,0.86,se));
float g=vis*exp(-0.45*s*s);
vec2 qq=q*(1.0-0.38*g);
if(s<3.0){
vec3 hp=vec3(q/R*1.7,t*1.5+seed);hp.y-=t*1.3;
vec2 hz=vec2(snoise(hp),snoise(hp+vec3(7.3,1.1,3.7)));
qq+=hz*R*0.035*vis*smoothstep(3.0,1.0,s);
}
qq+=qn*R*0.05*vis*sin(9.0*s-t*10.0)*exp(-0.9*s)*win;
off+=(qq-q)*calmH*min(vis,1.0);
float e=0.0;vec3 col=vec3(0.0);
if(se<1.0){
float zf=sqrt(max(1.0-se*se,0.0)),mu=zf;
vec3 n=vec3(q/(R*lb),zf);
n.xz=rot2(t*0.11+seed)*n.xz;n.yz=rot2(0.35)*n.yz;
vec3 wp=n*1.6+vec3(seed,0.0,t*0.08);
vec3 warp=vec3(snoise(wp),snoise(wp+vec3(5.2,1.3,2.8)),snoise(wp+vec3(1.7,9.1,4.4)));
float big=0.5+0.5*snoise(n*2.4+warp*0.9+vec3(0.0,t*0.06,seed));
float g1=1.0-abs(snoise(n*6.0+warp*0.7+vec3(0.0,0.0,t*0.35)));
float g2=1.0-abs(snoise(n*12.5+warp*0.5+vec3(t*0.5,seed,0.0)));
float pxR=R*uRes.y;
float gran=g1*g1*0.65+mix(0.5,g2*g2,smoothstep(40.0,90.0,pxR))*0.35;
float T=(0.16+0.84*pow(mu,0.7))*(0.5+0.5*gran)*(0.45+0.85*big);
vec3 cc=mix(vec3(1.0,0.07,0.006),vec3(1.0,0.36,0.07),smoothstep(0.28,0.62,T));
cc=mix(cc,vec3(1.0,0.7,0.36),smoothstep(0.58,0.88,T));
cc=mix(cc,vec3(1.0,0.92,0.8),smoothstep(0.9,1.15,T));
col+=cc*(0.48+4.6*T*T*T)*smoothstep(1.0,0.97,se);
float fl=snoise(vec3(q/R*5.0,floor(t*20.0)*0.37+seed));
e+=smoothstep(0.86,0.98,fl)*6.0*smoothstep(1.0,0.5,se)*smoothstep(0.55,0.9,big);
bgT*=1.0-vo*smoothstep(1.0,0.96,se);
}
e+=16.0*exp(-s*s*80.0)*(flare-1.0);
if(se>0.86&&s<4.2){
float x=se-1.0;
float xo=max(x,0.0);
float outK=smoothstep(-0.015,0.01,x);
vec3 fp=vec3(dn*3.2,log(max(s,0.9))*3.2-t*1.5+seed);
float f1=snoise(fp),f2=snoise(fp*2.3+vec3(1.7,4.2,-t*0.9));
float tongue=smoothstep(0.05,0.95,0.5+0.45*f1+0.25*f2);
float fall=exp(-max(x+0.035,0.0)*mix(11.0,3.2,tongue));
float flame=fall*(0.25+0.75*tongue)*smoothstep(-0.07,-0.01,x)*mix(0.55,1.0,outK);
col+=mix(vec3(1.0,0.16,0.018),vec3(1.0,0.48,0.1),fall*tongue)*flame*2.4;
col+=vec3(1.0,0.3,0.05)*exp(-xo*28.0)*outK*0.9;
bgT*=1.0-vo*min(0.9,flame*1.15);
float str=0.5+0.5*snoise(vec3(dn*2.2,t*0.12+seed));
vec3 cp=vec3(dn*9.0,log(max(s,0.88))*5.0-t*0.7+seed);
float flw=0.5+0.5*(snoise(cp)*0.7+snoise(cp*2.07+vec3(3.1,0.7,-t*0.3))*0.3);
float veil=min(0.7*exp(-xo*3.5),0.9);
bgT*=1.0-vo*veil*outK;
float cor=(0.4*exp(-xo*3.0)*(0.5+0.8*str*flw*flw)+0.06*exp(-xo*0.9))*outK;
col+=mix(vec3(1.0,0.1,0.01),vec3(1.0,0.22,0.03),flw)*cor;
if(x>-0.02&&x<1.1){
float prom=0.0,pcore=0.0;
for(int k=0;k<3;k++){
float fk=float(k);
float a0=seed*1.7+fk*2.35+t*(0.045+0.02*fk);
float da=atan(sin(ang-a0),cos(ang-a0));
float big=k==0?1.0:0.0;
float wk=(0.24+0.12*big)+0.06*sin(fk*3.1+seed);
float hk=(0.32+0.32*big)+0.12*sin(fk*1.9+seed*2.0+t*0.12);
vec2 uv=vec2(da/wk,xo/hk);
float wob=snoise(vec3(dn*5.0,t*0.35+fk*7.0))*0.14+snoise(vec3(dn*19.0,xo*9.0+t*0.8+fk))*0.06;
float d=abs(length(uv)-1.0+wob);
float thick=0.27+0.06*sin(fk+seed);
float foot=smoothstep(1.35,0.6,abs(uv.x))*smoothstep(0.0,0.35,uv.y+0.2);
float ta=atan(uv.y,uv.x);
float strand=max(0.45+0.55*snoise(vec3(ta*5.0-t*1.6,d*7.0,fk*3.0+seed)),0.0);
float lp=exp(-d*d/(thick*thick))*foot;
prom+=lp*(0.35+0.65*strand);
pcore+=exp(-d*d/(thick*thick*0.18))*foot*strand*strand;
}
float pk=smoothstep(-0.02,0.03,x);
col+=(vec3(1.0,0.13,0.014)*prom*1.3+vec3(1.0,0.4,0.08)*pcore*4.0)*pk;
bgT*=1.0-vo*0.85*clamp(prom,0.0,1.0)*pk;
}
}
col+=vec3(1.0,0.13,0.012)*0.1/(1.0+pow(s*0.9,2.4))*step(1.0,se);
emit+=(tintRed(e)*0.34+col)*vis;
}
}
void main(){
vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
vec2 off=vec2(0.0);vec3 emitOrb=vec3(0.0);vec3 emitSing=vec3(0.0);
float bgT=1.0;float disp=0.0;float front=0.0;float sShadow=1.0;
float jit=ign(gl_FragCoord.xy,uFrame);
float dH=uHandOn>0.5?texture(uHand,vUv).g-0.25:9.0;
if(uSingA.w>0.0005){
vec2 q=p-uSingA.xy;float rs=max(uSingA.z,1e-5);vec2 b=q/rs;float bl=length(b);
float L=uSingB.x;
vec2 bn=b/max(bl,1e-5);
vec2 sampleRs=b-bn*alphaWeak(max(bl,0.6))*L;
if(bl<BMAX){
vec3 em=vec3(0.0);
vec4 tr=traceBH(b,L,em);
float blend=smoothstep(BMAX-2.0,BMAX,bl);
emitSing+=em*(1.0-blend);
if(tr.w>0.5){sampleRs=b;}
else{sampleRs=mix(tr.xy,sampleRs,blend);bgT*=mix(tr.z,1.0,blend);}
bgT*=mix(0.3,1.0,smoothstep(SHADOW+0.05,SHADOW+1.3,bl));
disp+=0.018*smoothstep(10.0,2.6,bl);
}
float calmS=1.0;
if(uHandOn>0.5)calmS=1.0-smoothstep(0.75,0.03,dH)*smoothstep(SHADOW*1.6,SHADOW*3.0,bl);
off+=(sampleRs-b)*rs*calmS;
bgT*=1.0-0.28*uSingA.w*exp(-bl*bl/110.0);
sShadow=mix(1.0,smoothstep(SHADOW*0.8,SHADOW*1.25,bl),min(1.0,uSingA.w*1.5));
emitSing*=uSingA.w;
}
float calmH=smoothstep(0.15,0.38,dH);
float calmB=smoothstep(0.04,0.35,dH);
orbField(0,p,jit,calmH,off,emitOrb,bgT,front);
orbField(1,p,jit,calmH,off,emitOrb,bgT,front);
emitOrb*=sShadow;front*=sShadow;
if(uBridge.x>0.002){
vec2 a=uBridgeAB.xy,bb=uBridgeAB.zw;
vec2 pa=a-p,pb=bb-p;float la=length(pa),lb=length(pb);float Lb=length(bb-a);
float uu=dot(p-a,bb-a)/max(Lb*Lb,1e-8);
float vv=abs(dot(p-a,vec2(-(bb-a).y,(bb-a).x)))/max(Lb*Lb,1e-8);
float bw=smoothstep(-0.35,-0.08,uu)*smoothstep(1.35,1.08,uu)*smoothstep(0.75,0.42,vv);
if(Lb>1e-4&&la>1e-5&&lb>1e-5&&bw>1e-3){
float th=acos(clamp(dot(pa,pb)/(la*lb),-1.0,1.0));
vec2 ab=bb-a;float sd=sign(ab.x*(p.y-a.y)-ab.y*(p.x-a.x));
float ang=(PI-th)*sd;
float sig=log(la/lb);
float t=uTime;
float K=6.0;
float fl=ang*K/PI+0.5;float fid=floor(fl);float dfl=abs(fract(fl)-0.5);
float aa=fwidth(fl);
float fl2=0.55+0.45*snoise(vec3(sig*2.2-t*3.0,fid*1.7,t*0.6));
float line=(exp(-pow(dfl/(aa*1.8+0.025),2.0))+exp(-dfl/(aa*3.0+0.07))*0.35)*fl2;
float env=exp(-abs(ang)*1.7)*smoothstep(0.0,0.6,min(la,lb)/Lb*4.0);
float pulse=pow(0.5+0.5*sin(sig*5.0-t*9.0+fid*2.3),3.0);
float u=0.5+0.5*tanh(sig*0.9);
vec3 hue=u<0.5?mix(vec3(0.25,0.6,1.0),vec3(0.72,0.38,1.0),u*2.0):mix(vec3(0.72,0.38,1.0),vec3(1.0,0.32,0.1),u*2.0-1.0);
float core=exp(-abs(ang)*9.0);
emitOrb+=hue*(max(line,0.0)*(0.5+3.0*pulse)+core*(0.7+1.2*pulse))*env*uBridge.x*(0.6+1.4*uBridge.x)*(1.6+2.4*uBridge.y)*bw*(1.0-front)*sShadow;
float perp=dot(p-a,vec2(-ab.y,ab.x)/Lb);
off+=vec2(-ab.y,ab.x)/Lb*(-perp)*exp(-perp*perp/(Lb*Lb*0.03))*0.35*uBridge.x*smoothstep(0.0,0.3,min(la,lb)/Lb)*bw*calmB;
}
}
if(abs(uShockA.w)>0.001){
vec2 q=p-uShockA.xy;float r=length(q);vec2 qn=q/max(r,1e-5);
float R=uShockA.z,w=uShockB.x;
float ang=atan(q.y,q.x);
R*=1.0+0.035*snoise(vec3(cos(ang)*2.0,sin(ang)*2.0,uShockB.y*3.0))*step(0.0,uShockA.w);
float x=(r-R)/w;
if(x>-14.0&&x<4.0){
float prof=x*exp(-x*x);
float trail=x<0.0?sin(x*2.4)*exp(x*0.35)*uShockB.w:0.0;
float amp=uShockA.w;
off+=qn*(prof+trail*0.45)*w*amp*1.1*calmB;
disp+=abs(prof)*abs(amp)*0.06;
float br=0.6+0.4*snoise(vec3(cos(ang)*5.0,sin(ang)*5.0,uShockB.y*6.0));
emitSing+=(vec3(1.0,0.82,0.62)*exp(-x*x*2.0)*0.22+vec3(1.0,0.95,0.9)*exp(-x*x*10.0)*0.3*br)*uShockB.z;
}
}
if(uPin.z>0.001){
vec2 d=p-uPin.xy;float sc=max(uPin.w,1e-4);float r2=dot(d,d)/(sc*sc);
emitSing+=vec3(0.9,0.85,1.0)*uPin.z*(70.0*exp(-r2*40.0)+7.0*exp(-r2*2.5)+0.8*exp(-r2*0.25));
emitSing+=vec3(0.62,0.55,1.0)*uPin.z*4.0*exp(-abs(d.y)/(sc*0.06))*exp(-abs(d.x)/(sc*9.0));
}
oEmit=vec4(emitSing+emitOrb,bgT);
oLens=vec4(off/vec2(uAspect,1.0),disp,front);
}`,mt=te+We+p0+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uNormals;uniform sampler2D uHand;
uniform sampler2D uFxA;uniform sampler2D uFxB;uniform sampler2D uClean;uniform sampler2D uEnv;
uniform sampler2D uParts;uniform sampler2D uPlate;uniform sampler2D uPlateL;uniform sampler2D uMask;uniform sampler2D uHole;
uniform sampler2D uEnvMid;
uniform sampler2D uEnvTop;
uniform float uAspect;uniform float uFxOn;uniform float uHandOn;uniform float uPartsOn;uniform float uDebugMatte;
uniform vec2 uRes;uniform float uHandRef;uniform float uDbgBits;
uniform float uSoft;
uniform vec4 uSingA;uniform vec4 uSingB;uniform vec4 uDiskP;uniform vec2 uDiskAx;
uniform vec4 uLightP[4];uniform vec4 uLightC[4];
uniform vec3 uDiskN;
uniform vec4 uGrade;
uniform vec4 uGradeC;
uniform vec4 uBeamA;
uniform vec4 uBeamB;
uniform vec4 uBeamC;
uniform vec4 uOrbA[2];uniform vec4 uOrbB[2];
const float SHADOW=2.598;
const float BMAX=13.0;
vec2 mirrorUv(vec2 uv){return 1.0-abs(1.0-mod(uv,2.0));}
vec3 beyond(vec2 uv,float o){
return mix(texture(uEnv,mirrorUv(uv)).rgb,texture(uEnvTop,clamp(uv,0.0,1.0)).rgb,smoothstep(0.12,0.5,o))*0.75;
}
vec3 room(vec2 uv){
vec2 c=clamp(uv,0.0,1.0);
vec3 a=texture(uBase,c).rgb;
float o=length((uv-c)*vec2(uAspect,1.0));
if(o<=0.0)return a;
return mix(a,beyond(uv,o),smoothstep(0.0,0.05,o));
}
vec3 blurRoom(sampler2D t,vec2 uv){
vec2 c=clamp(uv,0.0,1.0);
float o=length((uv-c)*vec2(uAspect,1.0));
if(o<=0.0)return texture(t,uv).rgb;
return mix(texture(t,c).rgb,beyond(uv,o),smoothstep(0.0,0.05,o));
}
vec3 roomFree(vec2 uv){
if(uHandOn<0.5)return room(uv);
vec2 c=clamp(uv,0.0,1.0);
vec3 a=texture(uClean,c).rgb;
float o=length((uv-c)*vec2(uAspect,1.0));
return o<=0.0?a:mix(a,beyond(uv,o),smoothstep(0.0,0.05,o));
}
vec3 relight(vec3 albedo,vec2 uv,vec2 sp,float handW,float amb,float roomW){
vec4 nt=texture(uNormals,uv);
float body=smoothstep(0.45,0.92,nt.a)*(1.0-handW)*(1.0-roomW);
vec3 N=nt.rgb*2.0-1.0;
N=normalize(mix(vec3(0.0,0.0,1.0),N,smoothstep(0.5,0.95,nt.a)*(1.0-handW)));
vec3 surf=vec3(sp,0.26+body*0.24+handW*0.26);
vec3 acc=vec3(0.0);
for(int i=0;i<4;i++){
vec4 lc=uLightC[i];
if(lc.w<=0.0)continue;
vec3 Lv=uLightP[i].xyz-surf;float d2=dot(Lv,Lv);vec3 l=Lv*inversesqrt(max(d2,1e-6));
float nl=max(dot(N,l)+0.2,0.0)/1.2;
nl=mix(nl,0.9,handW*0.6);
float dn=abs(dot(l,uDiskN));
float an=i>=2?mix(0.2+0.8*dn,0.75+0.25*dn,handW):1.0;
acc+=lc.rgb*(nl*an)/(1.0+d2/(lc.w*lc.w));
}
float spill=max(body,handW);
acc=mix(max(mix(vec3(luma(acc)),acc,1.1),0.0)*0.3,acc,spill);
float L=luma(acc);
float k0=mix(0.75,0.4,handW),K=mix(1.0,0.6,handW);
float Lk=L<=k0?L:k0+(L-k0)/(1.0+(L-k0)/K);
acc=mix(acc,mix(vec3(L),acc,0.68),handW)*(Lk/max(L,1e-5));
return albedo*(amb+acc);
}
vec3 capHDR(vec3 c){
float m=max(c.r,max(c.g,c.b));
const float k0=1.8,K=3.2;
if(m<=k0)return c;
return c*((k0+(m-k0)/(1.0+(m-k0)/K))/m);
}
vec3 grade(vec3 c,float k,vec2 p){
vec2 d=(p-uGradeC.xy)/max(uGradeC.z,1e-4);k*=exp(-dot(d,d));
return mix(c,vec3(luma(c))*vec3(0.94,0.97,1.06),uGrade.x*k)*(1.0-uGrade.y*k);
}
void main(){
vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
vec4 E=vec4(0.0,0.0,0.0,1.0),Lz=vec4(0.0);
if(uFxOn>0.5){E=texture(uFxA,vUv);Lz=texture(uFxB,vUv);}
if(uFxOn>0.5&&uSingA.w>0.0005){
float blq=length((p-uSingA.xy)/max(uSingA.z,1e-5));
float wq=smoothstep(SHADOW*2.2,SHADOW*1.7,blq);
if(wq>0.001){
vec2 ft=1.1/vec2(textureSize(uFxA,0));
vec4 Es=(texture(uFxA,vUv+vec2(ft.x,ft.y*0.35))+texture(uFxA,vUv-vec2(ft.x,ft.y*0.35))
+texture(uFxA,vUv+vec2(-ft.x*0.35,ft.y))+texture(uFxA,vUv+vec2(ft.x*0.35,-ft.y)))*0.25;
E=mix(E,Es,0.8*wq);
}
}
vec2 offUv=Lz.xy;float disp=Lz.z;float front=clamp(Lz.w,0.0,1.0);float bgT=E.a;vec3 emit=E.rgb;
vec2 bd=min(vUv,1.0-vUv)*vec2(uAspect,1.0);
offUv*=smoothstep(0.0,0.07,min(bd.x,bd.y));
vec4 hm=vec4(0.0);
if(uHandOn>0.5){
vec2 mt=0.75/vec2(textureSize(uHand,0));
hm=texture(uHand,vUv)*0.4+(texture(uHand,vUv+vec2(mt.x,mt.y*0.4))+texture(uHand,vUv-vec2(mt.x,mt.y*0.4))
+texture(uHand,vUv+vec2(-mt.x*0.4,mt.y))+texture(uHand,vUv+vec2(mt.x*0.4,-mt.y)))*0.15;
if(hm.g<0.42&&hm.r<0.95){
vec2 ct=3.5/vec2(textureSize(uHand,0));
float cl=0.0,ring=0.0;
for(int k=0;k<4;k++){
float an=float(k)*0.7853982;
vec2 d=vec2(cos(an),sin(an))*ct;
float r0=texture(uHand,vUv+d).r,r1=texture(uHand,vUv-d).r;
cl=max(cl,min(r0,r1));
ring+=texture(uHand,vUv+d*1.9).r+texture(uHand,vUv-d*1.9).r;
}
hm.r=max(hm.r,max(cl,smoothstep(6.4,7.4,ring)));
}
}
float cutK=0.0,voidK=0.0,scorch=0.0;vec3 beamE=vec3(0.0);vec2 tq=vec2(0.0);
if(uBeamB.z>0.001||uBeamB.w>0.001||uBeamC.x>0.001||uBeamC.w>0.001){
vec2 dn=uBeamA.zw,nn=vec2(-dn.y,dn.x);
vec2 rel=p-uBeamA.xy;float al=dot(rel,dn),pe=dot(rel,nn);
float w=max(uBeamB.y,1e-4);float ap=abs(pe)/w;float sd=pe<0.0?-1.0:1.0;
float seed=uBeamC.z,age=uBeamC.y;
float seg=smoothstep(-w*0.8,w*0.3,al)*smoothstep(uBeamB.x+w*0.5,uBeamB.x-w*0.5,al);
tq=vec2(al,pe);
if(seg>0.0005&&ap<8.0){
float u=al/w;
float frS=snoise(vec3(u*0.3,sd*3.0,seed))*0.55+snoise(vec3(u*0.85,sd*3.0+7.0,seed))*0.25;
float fr=frS+snoise(vec3(u*2.6,sd*3.0+13.0,seed+age*2.0))*0.05;
float carve=uBeamB.z;
float halfW=carve*(0.8+0.26*fr);
float inside=ap-halfW;
float insideS=ap-carve*(0.8+0.26*frS);
float aa=1.5/(uRes.y*w);
float open=step(0.002,carve);
cutK=smoothstep(aa+0.07,-aa-0.07,inside)*seg*open;
voidK=cutK*smoothstep(0.25,0.7,carve);
float glow=max(open,uBeamC.w);
float ew=0.09+0.06*(1.0-carve);
float edge=exp(-insideS*insideS/(ew*ew))*seg*glow;
float gaps=smoothstep(0.12,0.6,0.5+0.5*snoise(vec3(u*0.85,sd*5.0,seed+3.0)));
float heat=smoothstep(0.55,0.95,carve);
vec3 eC=mix(vec3(1.0,0.26,0.045)*1.6,vec3(0.95,0.8,1.05)*2.2,heat);
beamE+=eC*edge*(0.3+0.7*gaps)*(0.75+0.25*snoise(vec3(u*1.6,sd,age*6.0+seed)));
scorch=smoothstep(0.75,0.0,inside)*step(0.0,inside)*seg*uBeamC.w*0.7*(0.55+0.45*snoise(vec3(u*1.9,ap*2.5,seed+9.0)));
if(uBeamC.w>0.002){
float cs=0.3;float ci=floor(u/cs);
for(int k=-1;k<=1;k++){
float id=ci+float(k);float h=hash12(vec2(id*1.37,sd*7.1+seed));
if(h<0.35)continue;
float h2=hash12(vec2(id*3.11+seed,sd*1.9)),h3=hash12(vec2(id*0.71,sd*5.3+seed*3.0));
float a0=age-0.04*h3;
float life=0.18+0.35*h2;
float ea=(id+h2)*cs*w+a0*w*(h3-0.5)*1.5;
float ep=sd*(halfW*w+a0*w*(0.6+2.4*h3));
vec2 dd=vec2(al-ea,pe-ep);
float rr=dot(dd,dd)/(w*w*0.0012);
float f=step(0.0,a0)*smoothstep(life,life*0.35,a0)*(0.6+0.8*h);
beamE+=mix(vec3(1.0,0.32,0.06),vec3(1.0,0.75,0.45),h3)*exp(-rr)*f*7.0*uBeamC.w;
}
}
if(uBeamB.w>0.002){
float flow=0.72+0.28*snoise(vec3(u*0.8-age*70.0,0.0,seed));
float hx=(al-uBeamB.x)/(w*1.2);
float head=exp(-hx*hx);
float coreP=exp(-ap*ap*12.0);
float sheath=exp(-ap*ap*2.0);
float halo=exp(-ap*0.9);
float n1=snoise(vec3(u*0.7-age*48.0,pe/w*1.4,seed)),n2=snoise(vec3(u*1.6-age*80.0,pe/w*2.6,seed+5.0));
float fil=pow(max(1.0-abs(n1),0.0),2.2)*0.6+pow(max(1.0-abs(n2),0.0),2.8)*0.4;
beamE+=(vec3(1.0,0.97,1.06)*coreP*9.0*(0.55+0.45*flow)
+vec3(0.62,0.4,1.05)*sheath*0.9*(0.45+0.8*fil)
+vec3(0.5,0.25,1.0)*fil*exp(-ap*0.9)*0.7
+vec3(0.4,0.2,1.0)*halo*0.3)*seg*uBeamB.w;
beamE+=vec3(0.9,0.8,1.0)*head*exp(-ap*ap*1.5)*uBeamB.w*seg*7.0;
}
float hz=uBeamC.x*seg*exp(-ap*0.35);
vec2 jit2=vec2(snoise(vec3(al*55.0,pe*55.0,age*14.0+seed)),snoise(vec3(al*55.0+3.1,pe*55.0,age*14.0-seed)));
float calmF=uHandOn>0.5?smoothstep(0.04,0.35,hm.g-0.25):1.0;
offUv+=jit2*0.0045*hz*calmF/vec2(uAspect,1.0);
float push=(ap<1.0?ap:exp(-(ap-1.0)*1.6))*seg*(uBeamB.w+0.5*uBeamC.x)*w*0.45;
offUv-=nn*sd*push*calmF/vec2(uAspect,1.0);
}
}
float singW=0.0,handDark=1.0,shadowK=0.0;
if(uSingA.w>0.0005){
vec2 q=p-uSingA.xy;float rs=max(uSingA.z,1e-5);vec2 b=q/rs;float bl=length(b);
handDark=1.0-0.2*uSingA.w*exp(-bl*bl/110.0);
float pxRs=1.0/(uRes.y*rs);
float sw=pxRs*max(uSoft,1.0);
float sEdge=smoothstep(SHADOW-sw*0.6,SHADOW+sw,bl);
bgT*=sEdge;shadowK=(1.0-sEdge)*min(1.0,uSingA.w*1.5);
float x=bl-SHADOW;
if(x>-0.4&&x<3.0){
vec2 bn=b/max(bl,1e-5);
float side=0.5-0.5*dot(bn,uDiskAx);
vec3 rc=diskHue(0.55+0.85*side);
float wc=max(0.035,sw*0.8);
float core=exp(-(x-0.03)*(x-0.03)/(wc*wc));
float tail=exp(-max(x,0.0)/max(0.28,sw*1.6))*smoothstep(-wc,wc*0.3,x);
float lump=0.72+0.28*snoise(vec3(bn*2.4,uDiskP.z*0.22));
emit+=rc*(core+0.3*tail)*lump*(0.25+1.35*side*side)*uDiskP.w*0.4*uSingA.w;
}
singW=smoothstep(BMAX*3.0,BMAX*0.8,bl);
}
vec2 suv=vUv+offUv;
float comp=max(length(dFdx(suv)*uRes),length(dFdy(suv)*uRes));
vec3 bg;
if(disp>0.0008){
bg=vec3(room(vUv+offUv*(1.0+disp)).r,room(suv).g,room(vUv+offUv*(1.0-disp)).b);
}else bg=room(suv);
float roomW=0.0;
vec2 luv=suv;
float bandFlat=0.0;
if(uHandOn>0.5){
vec2 cs=clamp(suv,0.0,1.0);
vec4 hc=texture(uHand,cs);
vec2 mt2=2.5/vec2(textureSize(uHand,0));
float ev=max(hc.r,hc.b);
ev=max(ev,0.85*max(max(texture(uHand,cs+vec2(mt2.x,0.0)).r,texture(uHand,cs-vec2(mt2.x,0.0)).r),
max(texture(uHand,cs+vec2(0.0,mt2.y)).r,texture(uHand,cs-vec2(0.0,mt2.y)).r)));
float hs=max(smoothstep(0.02,0.25,max(hc.r,hc.b*1.6)),smoothstep(0.42,0.34,hc.g));
float ofsPx=length(offUv)*uRes.y;
float onHand=smoothstep(0.06,0.35,ev);
float ofsPalm=length(offUv*vec2(uAspect,1.0))/max(uHandRef,0.06);
float hw=1.0-sqrt(clamp(texture(uHole,cs).a,0.0,1.0));
float rep=max(hs*onHand,hw*smoothstep(0.1,0.25,ofsPalm))*smoothstep(0.5,1.5,ofsPx);
if(mod(uDbgBits,2.0)>0.5)rep=0.0;
if(rep>0.001){
vec3 cl=texture(uClean,cs).rgb;
vec3 pl=texture(uPlate,cs).rgb;
float dd=length(cl-pl)/(luma(cl)+0.06);
cl=mix(cl,pl,smoothstep(0.4,0.15,dd)*smoothstep(0.4,0.9,texture(uPlateL,cs).a));
bg=mix(bg,cl,rep);
}
roomW=smoothstep(0.47,0.37,hc.g)*(1.0-smoothstep(0.1,0.7,hc.r));
}
if(comp>1.6){
bg=mix(bg,blurRoom(uEnvMid,suv),smoothstep(1.6,4.5,comp));
bg=mix(bg,blurRoom(uEnv,suv),smoothstep(6.0,18.0,comp));
}
if(uSingA.w>0.0005){
vec2 q=p-uSingA.xy;float rs=max(uSingA.z,1e-5);vec2 b=q/rs;float bl=length(b);
float wB=smoothstep(SHADOW*2.0,SHADOW*1.45,bl);
{
vec2 bn=b/max(bl,1e-5);
float bb=max(bl,SHADOW*1.0005);
float xc=SHADOW/bb;
float al=-0.98719*log(1.0-xc)-0.2284*xc+0.00805*xc*xc-0.11339*xc*xc*xc-0.5/bb*(1.0-20.0/sqrt(400.0+bb*bb));
float f=al<1.0?tan(al):1.5574+(al-1.0)*3.43;
float sc=al<1.0?1.0/cos(al):1.8508+(al-1.0)*2.88;
vec2 huv=(uSingA.xy+bn*(bb*sc-f*uSingB.x)*rs)/vec2(uAspect,1.0)+0.5;
float bc=max(length(dFdx(huv)*uRes),length(dFdy(huv)*uRes));
if(wB>0.001){
vec3 bandC=mix(roomFree(huv),blurRoom(uEnvMid,huv),smoothstep(1.6,4.5,bc));
bandC=mix(bandC,blurRoom(uEnv,huv),smoothstep(5.0,16.0,bc));
bandC=mix(bandC,blurRoom(uEnvTop,huv),smoothstep(24.0,90.0,bc));
bg=mix(bg,bandC,wB);
luv=mix(suv,huv,wB);
bandFlat=wB*smoothstep(4.0,16.0,bc);
}
}
}
bg=grade(bg,1.0,(luv-0.5)*vec2(uAspect,1.0));
vec2 sp=(luv-0.5)*vec2(uAspect,1.0);
float amb=1.0;
for(int i=0;i<2;i++){
vec4 A=uOrbA[i];
if(A.w<0.002)continue;
float so=length(p-A.xy)/max(A.z,1e-4);
amb*=1.0-(uOrbB[i].x<0.5?0.2:0.42)*min(A.w,1.0)*exp(-max(so-1.0,0.0)*1.8);
}
if(mod(floor(uDbgBits/2.0),2.0)>0.5)amb=1.0;
if(mod(floor(uDbgBits/4.0),2.0)>0.5)roomW=0.0;
vec3 col=relight(bg,clamp(luv,0.0,1.0),sp,0.0,amb,roomW)*bgT;
if(bandFlat>0.001)col=mix(col,bg*amb*bgT,bandFlat);
if(shadowK>0.001)col+=texture(uEnv,vUv).rgb*0.022*shadowK;
float hf=0.0,occF=0.0;vec3 handCol=vec3(0.0);
if(uHandOn>0.5&&uDebugMatte<1.5){
hf=smoothstep(0.06,0.78,hm.r)*(1.0-front);
occF=hm.a;
if(max(hf,occF)>0.002){
handCol=relight(grade(texture(uBase,vUv).rgb,0.6,p),vUv,p,smoothstep(0.1,0.6,hm.r),amb,0.0)*handDark;
col=mix(col,handCol,hf);
}
}
if(cutK>0.001){
float pm=smoothstep(0.3,0.7,texture(uMask,vUv).r)*smoothstep(0.4,0.9,texture(uPlateL,vUv).a);
col=mix(col,texture(uPlate,vUv).rgb*0.8,cutK*pm);
vec2 g=tq*vec2(70.0,70.0)+vec2(13.1,7.7);vec2 id=floor(g),f=fract(g)-0.5;float hs=hash12(id);
float star=smoothstep(0.09,0.0,length(f-(hash22(id)-0.5)*0.7))*step(0.9,hs)*(0.4+3.0*(hs-0.9)*10.0);
float neb=0.5+0.5*snoise(vec3(tq*3.0,uBeamA.y*5.0));
vec3 voidc=vec3(0.006,0.004,0.016)+vec3(0.05,0.02,0.11)*neb*neb+vec3(0.7,0.75,1.0)*star;
col=mix(col,voidc,voidK);
}
col*=1.0-scorch*(1.0-cutK);
float eOcc=uDebugMatte<1.5?smoothstep(0.3,0.97,hm.r)*(1.0-front)*mix(0.8,1.0,singW):0.0;
col+=emit*(1.0-eOcc);
if(uPartsOn>0.5){
vec4 P=texture(uParts,vUv);
col=col*(1.0-P.a*(1.0-eOcc))+capHDR(P.rgb)*(1.0-eOcc);
}
col+=beamE;
if(occF>0.002)col=mix(col,handCol,occF);
outColor=vec4(col,1.0);
if(uDebugMatte>2.5)outColor=vec4(cutK,voidK,scorch,1.0);
if(uDebugMatte>0.5&&uDebugMatte<1.5)outColor=vec4(texture(uBase,vUv).rgb*0.4+vec3(smoothstep(0.52,0.35,hm.g)*0.4,hm.r*0.5,hm.b*0.6)+vec3(hm.a*0.5),1.0);
}`,I0=`
uniform vec4 uBlue;   // xy centre, z radius, w vis
uniform vec4 uRed;    // xy centre, z radius, w vis
uniform vec4 uSing;   // xy centre, z p-units per Rs, w presence
uniform vec4 uLens;   // x L (Rs), y r_in, z r_out
uniform mat3 uDisk;
vec2 lensImg(vec2 beta,float depth){
  if(depth>=0.0) return beta;
  float te2=2.0*min(-depth,uLens.x);
  float bl=length(beta);
  float th=(bl+sqrt(bl*bl+4.0*te2))*0.5;
  return bl>1e-5?beta/bl*th:vec2(sqrt(te2),0.0);
}
vec3 singView(vec3 st){return uDisk*vec3(st.x*cos(st.y),st.z,st.x*sin(st.y));}
vec2 singScreen(vec3 st,out float hidden,out float depth){
  vec3 v=singView(st);
  vec2 img=lensImg(v.xy,v.z);
  hidden=(v.z<0.0&&length(img)<2.7)?1.0:0.0;
  depth=v.z;
  return uSing.xy+img*uSing.z;
}
float singVin(float r,float kind){return kind>0.5?0.18:(1.6+14.0/r);}
float singOm(float r){return 13.0*pow(r,-1.5);}
`,ht=te+We+I0+`
layout(location=0)in vec4 aA;
layout(location=1)in vec4 aB;
layout(location=2)in vec4 aC;
out vec4 vA;out vec4 vB;out vec4 vC;
uniform float uTime;uniform float uDt;uniform float uAspect;uniform float uCount;
uniform vec4 uSpawn;
uniform vec4 uEvent;
uniform vec4 uEvent2;
uniform vec4 uRelC;
uniform vec4 uRelD;
uniform vec4 uVelB;
uniform vec4 uCaps;
float rnd(float id,float k){return hash12(vec2(id*0.1731+k*17.13,uTime*13.37+k*3.1));}
void main(){
float id=float(gl_VertexID);
vec4 A=aA,B=aB,C=aC;
float owner=floor(B.w/4.0+0.01);float kind=B.w-owner*4.0;
float dt=uDt;
if(id>=uCount||uRelC.w>0.5){vA=vec4(0.0,0.0,0.0,1e3);vB=vec4(0.0,0.0,0.0,16.0);vC=vec4(0.0);gl_Position=vec4(0.0);return;}
A.w+=dt;
float sd=hash11(id*0.6180339+0.17);
if(owner==2.0&&uEvent2.x>0.5){B.w=16.0;owner=4.0;}
if(owner==2.0&&uEvent.x>0.5){
float hid,dep;vec2 P=singScreen(A.xyz,hid,dep);
vec2 dir=rot2((hash11(id*2.713+0.4)-0.5)*1.5)*normalize(P-uRelC.xy+1e-5);
vec3 vo=uDisk*vec3(sin(A.y),0.0,-cos(A.y));
vec2 vel=dir*(0.3+1.2*sd)*uRelC.z+vo.xy*singOm(A.x)*A.x*uSing.z*0.8;
if(uEvent2.y>0.5)vel=mix(vel,uRelD.xy*(1.2+2.6*sd),0.55);
A=vec4(P,0.0,0.0);B=vec4(vel,0.0,12.0);C.w=0.4+0.7*sd;
float hb=hash11(id*0.77+3.0);
C.rgb=vec3(0.55+0.45*hash11(id*1.37),0.15+2.6*hb*hb*hb*hb,-1.0);
if(hid>0.5||sd>(uEvent2.y>0.5?0.05:0.08))C.w=0.0;
owner=3.0;kind=0.0;
}
if(owner==0.0&&(uEvent.x>0.5||uEvent.y>0.5||uEvent.w>0.5)){
vec2 P=uBlue.xy+A.xy;
if(uEvent.w>0.5){A=vec4(P,0.0,0.0);B=vec4(0.0,0.0,0.0,14.0);C.w=0.2+0.16*sd;C.rgb*=0.9;}
else{
vec2 vel=normalize(A.xy+1e-5)*(0.15+0.5*sd)*(uEvent.x>0.5?3.0*uRelC.z:1.0);
A=vec4(P,0.0,0.0);B=vec4(vel,0.0,12.0+kind);C.w=0.45+0.5*sd;
}
owner=3.0;kind=B.w-12.0;
}
if(owner==1.0&&(uEvent.x>0.5||uEvent.z>0.5||uEvent.w>0.5)){
if(uEvent.w>0.5){C.rgb=vec3(1.0,0.36,0.08)*(0.7+0.9*C.r);A.w=0.0;C.w=0.18+0.14*sd;B=vec4(0.0,0.0,0.0,14.0);owner=3.0;kind=2.0;}
else if(uEvent.x>0.5){B.xy+=normalize(A.xy-uRelC.xy+1e-5)*(0.6+1.2*sd)*uRelC.z;}
else C.w=min(C.w,A.w+0.4);
}
if(owner==0.0){
vec3 x=A.xyz;float R=max(uBlue.z,1e-4);float r=length(x.xy)+1e-6;float s=r/R;
vec2 rh=x.xy/r,th=vec2(-rh.y,rh.x);
float vin=R*(0.5+0.9/s)*(0.7+0.6*sd);
float vt=R*1.8/sqrt(max(s,0.2))*(0.8+0.4*sd);
vec2 v=-rh*vin+th*vt;
x.xy+=v*dt;x.z*=exp(-dt*2.5);
A.xyz=x;B.xyz=vec3(v,0.0);
if(s<0.3||uBlue.w<0.02)B.w=16.0;
}else if(owner==1.0){
vec2 cn=curl2(vec3(A.xy*6.0,uTime*0.5+sd*7.0));
B.xy+=(cn*0.5+vec2(0.0,0.22))*dt;B.xy*=exp(-dt*1.3);
A.xy+=B.xy*dt;
if(A.w>C.w)B.w=16.0;
}else if(owner==2.0){
float r=A.x;
r-=singVin(r,kind)*dt;
A.y-=singOm(r)*dt;
A.z*=exp(-dt*(kind>0.5?3.0:1.3));
A.x=r;
if(r<2.25||uSing.w<0.02)B.w=16.0;
}else if(owner==3.0&&kind>1.5){
vec2 rel=A.xy-uSing.xy;float r=length(rel)+1e-5;vec2 rh=rel/r,th=vec2(-rh.y,rh.x);
vec2 v=(-rh*7.5+th*(9.0+5.0*sd))*r;
A.xy+=v*dt;B.xy=v;
if(A.w>C.w||r<uSing.z*2.75)B.w=16.0;
}else if(owner==3.0){
B.xy*=exp(-dt*(kind>0.5?2.2:1.6));
B.y+=0.05*dt;
B.xy+=curl2(vec3(A.xy*6.0,uTime*0.5+sd*5.0))*(0.22+(kind>0.5?0.0:0.9*length(B.xy)))*dt;
A.xy+=B.xy*dt;
if(A.w>C.w)B.w=16.0;
}
owner=floor(B.w/4.0+0.01);
if(owner>=4.0){
bool inB=id<uCaps.x,inR=id>=uCaps.x&&id<uCaps.x+uCaps.y;
bool inS=id<uCaps.w;
float wB=inB?uSpawn.x:0.0,wR=inR?uSpawn.y:0.0,wS=inS?uSpawn.z:0.0;
float wsum=wB+wR+wS;
float prob=inB||inR?uCaps.z:uSpawn.w;
if(wsum>1e-4&&rnd(id,1.0)<prob){
float u=rnd(id,2.0)*wsum;
float h1=rnd(id,3.0),h2=rnd(id,4.0),h3=rnd(id,5.0),h4=rnd(id,6.0);
if(u<wB){
float R=uBlue.z;float arm=floor(h1*3.0);
float ang=arm*TAU/3.0+uTime*1.1+(h2-0.5)*0.5;float rad=R*(1.2+1.0*h3*h3);
vec2 rel=vec2(cos(ang),sin(ang))*rad;
vec3 c=mix(vec3(0.06,0.25,1.0),vec3(0.45,0.75,1.0),h3*h3*h3)*1.4;
A=vec4(rel,(h3-0.5)*R,0.0);B=vec4(0.0,0.0,0.0,0.0);C=vec4(c,99.0);
}else if(u<wB+wR){
float R=uRed.z;float ang=TAU*h1;vec2 d=vec2(cos(ang),sin(ang));
vec2 P=uRed.xy+d*R*(0.8+0.2*h3);
vec2 v=d*(0.08+0.42*h2*h2*h2)*(R/0.08)+uVelB.zw*0.4;
A=vec4(P,0.0,0.0);B=vec4(v,0.0,4.0);C=vec4(0.55+0.45*h4,0.0,0.0,0.35+0.8*h3*h3);
}else{
float k=h4<0.15?0.0:1.0;
float rmax=clamp(0.34/max(uSing.z,1e-4),8.0,16.0);
float r=k>0.5?uLens.y+(uLens.z-uLens.y)*sqrt(h1):7.0+(rmax-7.0)*h1;
float ph=TAU*h2;float hgt=k>0.5?(h3-0.5)*0.22:(h3-0.5)*r*0.15;
vec3 st=vec3(r,ph,hgt);
A=vec4(st,0.0);B=vec4(0.0,0.0,0.0,8.0+k);C=vec4(vec3(0.85,0.7,1.0),99.0);
}
}else{B.w=16.0;}
}
vA=A;vB=B;vC=C;
gl_Position=vec4(0.0);
}`,vt=te+"out vec4 outColor;void main(){outColor=vec4(0.0);}",pt=te+We+I0+p0+`
layout(location=0)in vec4 aA;
layout(location=1)in vec4 aB;
layout(location=2)in vec4 aC;
uniform float uAspect;uniform vec2 uRes;uniform float uShutter;uniform float uGain;
uniform vec4 uVelB;uniform float uFloor;
out vec2 vQ;out float vHalf;out vec3 vCol;out float vAlpha;
void main(){
vec2 cq=vec2(float(gl_VertexID&1),float((gl_VertexID>>1)&1))*2.0-1.0;
float owner=floor(aB.w/4.0+0.01);float kind=aB.w-owner*4.0;
float px=1.0/uRes.y;
vec2 P=vec2(0.0),P0=vec2(0.0);float size=0.0;vec3 col=vec3(0.0);float alive=1.0;float alpha=0.0;
float fadeIn=smoothstep(0.0,0.18,aA.w);
if(owner==0.0){
float R=uBlue.z;vec2 rel=aA.xy;float s=length(rel)/max(R,1e-4);
P=uBlue.xy+rel;P0=P-(aB.xy+uVelB.xy*0.3)*uShutter;
float hv=hash11(float(gl_InstanceID));
size=R*(kind>0.5?0.008:0.005)*(0.6+0.8*hv);
float heat=smoothstep(1.7,0.35,s);
float fade=fadeIn*uBlue.w*smoothstep(0.3,0.55,s);
if(kind>0.5){alpha=0.3*fade*(1.0-heat);col=aC.rgb*0.5*fade*(1.0-heat)/1.6+vec3(0.15,0.45,1.0)*heat*2.0*fade;}
else col=aC.rgb*(0.25+hv*hv*hv*2.5)*(1.0+heat*3.0)*fade;
}else if(owner==1.0){
float t=1.0-clamp(aA.w/max(aC.w,1e-3),0.0,1.0);
P=aA.xy;P0=P-aB.xy*uShutter;
size=uRed.z*0.009*(0.4+t)+px*0.3;
float hv=hash11(float(gl_InstanceID)+0.3);
col=blackbody(0.12+0.36*t*aC.r)*(0.35+(1.0+5.0*hv*hv*hv)*t*t*t)*smoothstep(0.0,0.06,aA.w)*t;
}else if(owner==2.0){
float hid,dep;P=singScreen(aA.xyz,hid,dep);
float hid0,dep0;float sh=uShutter*(kind>0.5?14.0:4.0)/(1.0+uSing.z*30.0);if(kind>0.5)sh=min(sh,0.25/singOm(aA.x));vec3 st0=vec3(aA.x+singVin(aA.x,kind)*sh,aA.y+singOm(aA.x)*sh,aA.z*exp(sh*1.3));
P0=singScreen(st0,hid0,dep0);
if(dep*dep0<0.0||hid0!=hid)P0=P;
float r=aA.x;
float heat=smoothstep(8.0,3.0,r);
vec3 vo=uDisk*vec3(sin(aA.y),0.0,-cos(aA.y));
float beta=clamp(sqrt(0.5/max(r-1.0,0.35)),0.0,0.8);
float g=sqrt(1.0-beta*beta)/(1.0-beta*vo.z);
vec3 hue=diskHue(pow(min(3.0/max(r,1.0),1.25),0.75)*g*1.05);
float hv=hash11(float(gl_InstanceID)+0.5);
float vis=fadeIn*uSing.w*(1.0-hid)*smoothstep(2.25,2.9,r);
if(kind>0.5){size=uSing.z*0.03*(0.6+0.8*hv);col=hue*(0.05+0.7*hv*hv*hv*hv*hv)*g*g*vis*(0.45+heat);}
else{size=uSing.z*0.028*(0.7+0.6*hv);float inS=step(length(P-uSing.xy),2.75*uSing.z);col=mix(vec3(1.0,0.84,0.66),hue,heat)*(0.1+1.1*heat)*g*vis*smoothstep(0.0,2.5,16.0-r)*smoothstep(3.0,4.5,r)*(1.0-inS)*smoothstep(0.0,0.3,aA.w);}
}else if(owner==3.0){
float t=1.0-clamp(aA.w/max(aC.w,1e-3),0.0,1.0);
P=aA.xy;P0=P-aB.xy*uShutter;
float hv=hash11(float(gl_InstanceID)+0.7);
size=px*(0.75+1.0*t);
col=mix(aC.rgb,vec3(luma(aC.rgb))*vec3(0.9,0.95,1.05)+aC.rgb*0.3,t*t*0.6)*t*t*(0.35+2.6*hv*hv*hv);
if(kind>1.5){P0=P-aB.xy*uShutter*0.5;col=aC.rgb*t*0.9;}
else if(aC.b<-0.5){
float temp=(0.12+0.36*t*t)*(0.75+0.25*aC.r);
col=blackbody(temp)*(0.3+6.5*t*t*t)*aC.g*smoothstep(0.0,0.04,aA.w);
size=px*(0.85+1.5*t);
P0=P-aB.xy*uShutter*0.6;
}
}else alive=0.0;
if(owner<1.5){float fk=smoothstep(uFloor,uFloor+0.07,P.y);col*=fk;alpha*=fk;}
if(owner!=2.0&&uSing.w>0.001){
float rr=length(P-uSing.xy)/max(uSing.z,1e-5);
float sk=1.0-min(1.0,uSing.w*1.5)*smoothstep(2.9,2.6,rr);col*=sk;alpha*=sk;
}
if(alive<0.5||dot(col,col)+alpha<1e-8){gl_Position=vec4(2.0,2.0,2.0,1.0);vQ=vec2(0.0);vHalf=0.0;vCol=vec3(0.0);vAlpha=0.0;return;}
vec2 d=P-P0;float len=length(d);
float maxLen=(owner==3.0&&kind>1.5)?0.008:owner==0.0?0.014:owner==1.0?0.012:owner==3.0?0.016:0.06;
if(len>maxLen){d*=maxLen/len;P0=P-d;len=maxLen;}
vec2 dir=len>1e-7?d/len:vec2(1.0,0.0);vec2 nrm=vec2(-dir.y,dir.x);
float w=max(size,px*1.15);
float energy=size/w;
float halfLen=len*0.5;
vec2 mid=(P+P0)*0.5;
vec2 pos=mid+dir*cq.x*(halfLen+w*1.6)+nrm*cq.y*w*1.6;
vQ=vec2(cq.x*(halfLen/w+1.6),cq.y*1.6);vHalf=halfLen/w;
float spread=sqrt(1.0/(1.0+len/w*0.5));
vCol=col*energy*spread*uGain;vAlpha=alpha*energy*spread;
gl_Position=vec4(pos/vec2(uAspect,1.0)*2.0,0.0,1.0);
}`,dt=te+`
in vec2 vQ;in float vHalf;in vec3 vCol;in float vAlpha;out vec4 outColor;
void main(){
float ax=max(abs(vQ.x)-vHalf,0.0);
float d2=ax*ax+vQ.y*vQ.y;
float f=exp(-d2*2.4);
outColor=vec4(vCol*f,vAlpha*f);
}`;function bt(A){const b=A.kit,i=A.gl,F=typeof location<"u"?new URLSearchParams(location.search):new URLSearchParams,V0=Number(F.get("demoOffset"))||0,W0=F.has("sgNoParticles"),K0=F.has("sgForce"),d0=F.has("sgLaunchAt")?Number(F.get("sgLaunchAt")):-1,x0=(Number(F.get("sgLaunchDir"))||25)*Math.PI/180,b0=F.has("sgImplodeAt")?Number(F.get("sgImplodeAt")):-1,$={noLight:F.has("sgNoLight"),noBridge:F.has("sgNoBridge"),prof:null,view:F.get("sgView"),matteMode:F.has("sgMatte")?1:F.has("sgNoHands")?2:F.has("sgCutDbg")?3:0},$e=["matte","fill","fx","sim","draw","final"],pe=F.has("sgProfile")?i.getExtension("EXT_disjoint_timer_query_webgl2"):null;let g0=0,ce=null,Me=[];pe&&($.prof=Object.fromEntries($e.map(o=>[o,[]])));function de(o){!pe||ce||$e[g0%$e.length]!==o||(ce={q:i.createQuery(),name:o},i.beginQuery(pe.TIME_ELAPSED_EXT,ce.q))}function xe(o){!ce||ce.name!==o||(i.endQuery(pe.TIME_ELAPSED_EXT),Me.push(ce),ce=null)}function $0(){if(pe){g0++;for(let o=Me.length-1;o>=0;o--){const f=Me[o];if(i.getQueryParameter(f.q,i.QUERY_RESULT_AVAILABLE)){if(!i.getParameter(pe.GPU_DISJOINT_EXT)){const s=$.prof[f.name];s.push(i.getQueryParameter(f.q,i.QUERY_RESULT)/1e6),s.length>400&&s.shift()}i.deleteQuery(f.q),Me.splice(o,1)}}}}const Qe=F.has("sgNoFill"),w0=F.has("sgSlow")?B(Number(F.get("sgSlow"))||1,.02,1):1,ue=F.has("sgDebug")?[]:null,be=o=>{ue&&(ue.push(`${t.time.toFixed(2)} ${o}`),ue.length>200&&ue.shift())},je=b.program(ft,{label:"singularity fx"}),Xe=b.program(mt,{label:"singularity final"}),Ge=b.program(it,{label:"singularity hand matte"}),y0=b.program(rt,{label:"singularity fill prep"}),A0=b.program(ct,{label:"singularity fill push"}),Ye=b.program(ut,{label:"singularity fill pull"}),Ze=b.program(vt,{vs:ht,feedback:["vA","vB","vC"],label:"singularity sim"}),Je=b.program(dt,{vs:pt,label:"singularity particles"}),Q=b.target(4,4,{format:"rgba8"}),fe=b.target(4,4,{format:"hdr"}),S=[],T=[];let Ce=0,Re=0,ze=!1;function k0(o,f){if(o===Ce&&f===Re&&S.length)return;Ce=o,Re=f,ze=!1;let s=o,c=f,n=0;for(;n<9&&(S[n]?(S[n].resize(s,c),T[n].resize(s,c)):(S[n]=b.target(s,c,{format:"hdr"}),T[n]=b.target(s,c,{format:"hdr"})),n++,!(s<=8||c<=8));)s=Math.max(2,Math.ceil(s/2)),c=Math.max(2,Math.ceil(c/2));for(;S.length>n;)S.pop().dispose(),T.pop().dispose()}const De={uSrc:null,uTexel:new Float32Array(2)},se={uFine:null,uCoarse:null,uLast:0},Te={uBase:null,uHand:Q,uMask:null,uHoleOn:0};let e0=null;function B0(o,f){const s=S.length,c=Math.min(3,s-1),n=Math.min(5,s-1);Te.uBase=o.base,Te.uMask=o.mask||o.base,Te.uHoleOn=f?1:0,b.pass(y0,S[0],Te);const h=f?s:n+1;for(let m=1;m<h;m++){const r=S[m-1];De.uSrc=r,De.uTexel[0]=1/r.width,De.uTexel[1]=1/r.height,b.pass(A0,S[m],De)}if(e0=f?T[n]:S[n],!f)return S[c];se.uFine=S[s-1],se.uCoarse=S[s-1],se.uLast=1,b.pass(Ye,T[s-1],se),se.uLast=0;for(let m=s-2;m>=0;m--)se.uFine=S[m],se.uCoarse=T[m+1],b.pass(Ye,T[m],se);return T[c]}const Z=b.target(4,4,{format:"hdr"}),ne=b.target(4,4,{format:"hdr"}),t0=i.createFramebuffer();let S0=null,F0=null;const o0={bind(){return i.bindFramebuffer(i.FRAMEBUFFER,t0),i.viewport(0,0,Z.width,Z.height),o0}};function M0(o,f){Z.resize(o,f),ne.resize(o,f),!(S0===Z.tex&&F0===ne.tex)&&(S0=Z.tex,F0=ne.tex,i.bindFramebuffer(i.FRAMEBUFFER,t0),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Z.tex,0),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT1,i.TEXTURE_2D,ne.tex,0),i.drawBuffers([i.COLOR_ATTACHMENT0,i.COLOR_ATTACHMENT1]),i.bindFramebuffer(i.FRAMEBUFFER,null))}const a0=new Float32Array(m0*Ke);for(let o=0;o<m0;o++)a0[o*Ke+3]=1e3,a0[o*Ke+7]=16;const Pe=[i.createBuffer(),i.createBuffer()],Ee=[],Oe=[],He=[];for(let o=0;o<2;o++)i.bindBuffer(i.ARRAY_BUFFER,Pe[o]),i.bufferData(i.ARRAY_BUFFER,a0,i.DYNAMIC_COPY);for(let o=0;o<2;o++){for(const[s,c]of[[Ee,0],[Oe,1]]){const n=i.createVertexArray();i.bindVertexArray(n),i.bindBuffer(i.ARRAY_BUFFER,Pe[o]);for(let h=0;h<3;h++)i.enableVertexAttribArray(h),i.vertexAttribPointer(h,4,i.FLOAT,!1,Ke*4,h*16),i.vertexAttribDivisor(h,c);s.push(n)}const f=i.createTransformFeedback();i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,f),i.bindBufferBase(i.TRANSFORM_FEEDBACK_BUFFER,0,Pe[o]),He.push(f)}i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,null),i.bindBuffer(i.TRANSFORM_FEEDBACK_BUFFER,null),i.bindVertexArray(null),i.bindBuffer(i.ARRAY_BUFFER,null);let ke=0;const e={orbA:new Float32Array(8),orbB:new Float32Array(8),singA:new Float32Array(4),singB:new Float32Array(4),diskP:new Float32Array(4),disk:new Float32Array(9),shockA:new Float32Array(4),shockB:new Float32Array(4),bridge:new Float32Array(4),bridgeAB:new Float32Array(4),lightP:new Float32Array(16),lightC:new Float32Array(16),grade:new Float32Array(4),blue:new Float32Array(4),red:new Float32Array(4),sing:new Float32Array(4),lens:new Float32Array(4),spawn:new Float32Array(4),caps:new Float32Array(4),event:new Float32Array(4),event2:new Float32Array(4),relC:new Float32Array(4),relD:new Float32Array(4),velB:new Float32Array(4),bones:new Float32Array(_*2*4),handSize:new Float32Array(2),palm:new Float32Array(4),curl:new Float32Array(12),reach:new Float32Array(2),sweep:new Float32Array(4),uncert:new Float32Array(2),fresh:new Float32Array(2),res:new Float32Array(2),fxRes:new Float32Array(2),pRes:new Float32Array(2),diskAx:new Float32Array(2),diskN:new Float32Array(3),gradeC:new Float32Array(4),beamA:new Float32Array(4),beamB:new Float32Array(4),beamC:new Float32Array(4),pin:new Float32Array(4)},Be={uMask:null,uAspect:1,uTime:0,uFrame:0,uMobile:0,uQuality:1,uRes:e.fxRes,uOrbA:e.orbA,uOrbB:e.orbB,uSingA:e.singA,uSingB:e.singB,uDiskP:e.diskP,uDisk:e.disk,uShockA:e.shockA,uShockB:e.shockB,uBridge:e.bridge,uBridgeAB:e.bridgeAB,uHand:Q,uHandOn:0,uPin:e.pin},s0={uBase:null,uNormals:null,uHand:Q,uFxA:Z,uFxB:ne,uClean:null,uEnv:null,uEnvMid:null,uEnvTop:null,uParts:fe,uPlate:null,uPlateL:null,uMask:null,uHole:null,uAspect:1,uFxOn:0,uHandOn:0,uPartsOn:0,uDebugMatte:0,uRes:e.res,uHandRef:.2,uDbgBits:0,uSoft:1.5,uSingA:e.singA,uSingB:e.singB,uDiskP:e.diskP,uDiskAx:e.diskAx,uDiskN:e.diskN,uLightP:e.lightP,uLightC:e.lightC,uGrade:e.grade,uGradeC:e.gradeC,uBeamA:e.beamA,uBeamB:e.beamB,uBeamC:e.beamC,uOrbA:e.orbA,uOrbB:e.orbB},j={uMDbg:0,uMask:null,uBase:null,uBg:null,uBgOk:0,uAspect:1,uHandSize:e.handSize,uBones:e.bones,uPalm:e.palm,uCurl:e.curl,uReach:e.reach,uSweep:e.sweep,uUncert:e.uncert,uFresh:e.fresh},C0={uTime:0,uDt:0,uAspect:1,uCount:0,uSpawn:e.spawn,uCaps:e.caps,uEvent:e.event,uEvent2:e.event2,uRelC:e.relC,uRelD:e.relD,uVelB:e.velB,uBlue:e.blue,uRed:e.red,uSing:e.sing,uLens:e.lens,uDisk:e.disk},R0={uAspect:1,uRes:e.pRes,uShutter:1/45,uGain:1,uVelB:e.velB,uFloor:-10,uBlue:e.blue,uRed:e.red,uSing:e.sing,uLens:e.lens,uDisk:e.disk},n0=o=>({id:o,active:!1,charge:0,vis:0,pol:o,x:0,y:0,vx:0,vy:0,R:.05,size:.14,open:0,seed:1.3+o*4.7,flare:0,absorb:0,ax:0,ay:0,lost:0,dissipating:!1,chimeArmed:!0}),t={time:0,clock:0,orbs:[n0(0),n0(1)],anticip:0,fuse:0,cooldown:0,sing:{phase:"none",t:0,age:0,presence:0,x:0,y:0,rs:.014,rsT:.014,ang:0,sep:.3,sepVel:0,growth:0,flare:0,implode:0,lostT:0,size:.14,twoT:0,fast:null,oneSided:!1},shock:{on:!1,t:0,x:0,y:0,strength:0,mode:"out",scale:1},beam:{on:!1,t:0,x:0,y:0,dx:1,dy:0,w:.05,strength:1,seed:0},flash:0,shake:0,aberr:0,energy:0,liveAt:-10,ev:{release:0,blueDiss:0,redDiss:0,birth:0,kill:1,collapse:0,launch:0},relC:[0,0,1],relD:[0,0],shakePhase:0,srcVersion:-1,blocked:[!1,!1],byId:[null,null],matH:[null,null],ghost:[z0(),z0()],prevSize:[0,0],grow:[0,0],openT:[0,0],pin:0,pinX:0,pinY:0,pinS:.02,qLevel:6};function z0(){return{points:new Float32Array(63),palm:[0,0],size:0,curls:[0,0,0,0,0],velocity:[0,0],speed:0,lost:0,seenAt:-10,lost0:0,valid:!1}}function Q0(o,f,s){o.points.set(f.points),o.palm[0]=f.palm[0],o.palm[1]=f.palm[1],o.size=f.size;for(let c=0;c<5;c++)o.curls[c]=f.curls[c];o.velocity[0]=f.velocity[0],o.velocity[1]=f.velocity[1],o.speed=f.speed,o.lost0=f.lost||0,o.seenAt=s,o.valid=!0}const j0=.8,ge=[],le={hum:{level:0,pitch:1},noise:{level:0,tone:.5},crackle:{level:0}},we=[0,0],ye=[0,0];function D0(){const o=A.source?.element;return!!o&&typeof HTMLImageElement<"u"&&o instanceof HTMLImageElement}function X0(){return A.state.width/Math.max(1,A.state.height)}function T0(o,f,s){const c=o.points,n=(c[27]-c[0])*f,h=c[28]-c[1],m=Math.hypot(n,h)||1;return s[0]=n/m,s[1]=h/m,s}function P0(o,f,s,c){if(!o||!f||!(o.open>.45||o.gesture==="open"))return!1;const n=f[0]*c,h=f[1],m=Math.hypot(n,h);if(m<.001||h<-.6*m)return!1;const r=s.person,P=r&&r.present?(r.center[0]-.5)*c:t.sing.x,d=r&&r.present?r.center[1]-.5:t.sing.y,C=(o.palm[0]-.5)*c-P,H=o.palm[1]-.5-d;return n*C+h*H>-.15*m*Math.hypot(C,H)}function Le(o,f){let s=null;for(const c of t.orbs)c.pol===o&&(!f||c.active)&&(!s||c.vis>s.vis)&&(s=c);return s}function q(o,f){const s=A.audio;s&&s[o]&&s[o](f)}function E0(o,f){be("birth");const s=t.sing;s.phase="alive",s.t=0,s.age=0,s.presence=0,s.growth=0,s.implode=0,s.lostT=0,s.flare=1.2,s.x=(o.x+f.x)/2,s.y=(o.y+f.y)/2,s.sep=Math.hypot(f.x-o.x,f.y-o.y),s.sepVel=0,s.twoT=0,s.ang=Math.atan2(f.y-o.y,f.x-o.x),s.size=(o.size+f.size)/2;for(const c of t.orbs)c.absorb=1,c.ax=c.x,c.ay=c.y;t.ev.birth=1,t.relC[0]=s.x,t.relC[1]=s.y,t.relC[2]=1,t.fuse=0,Object.assign(t.shock,{on:!0,t:0,x:s.x,y:s.y,strength:1,mode:"in",scale:s.sep*1.4}),t.flash=Math.max(t.flash,.55),t.shake=Math.max(t.shake,.35),t.aberr=Math.max(t.aberr,.5),q("impact",{strength:.9,pitch:.8}),q("chime",{strength:.55,pitch:.5}),q("whoosh",{strength:.7,duration:.5,up:!1})}function Ue(o=1,f=null,s=""){const c=t.sing;be(`release ${o.toFixed(2)} sepVel=${c.sepVel.toFixed(2)}${f?" launch":""} ${s}`),c.phase="released",c.t=0,t.ev.release=1,t.relC[0]=c.x,t.relC[1]=c.y,t.relC[2]=o,t.flash=1,t.shake=1,t.aberr=1,t.cooldown=1.3,f?(t.ev.launch=1,t.relD[0]=f[0],t.relD[1]=f[1],Object.assign(t.beam,{on:!0,t:0,x:c.x,y:c.y,dx:f[0],dy:f[1],w:Math.max(.03,c.rs*1.7*Math.min(1,c.presence)),strength:o,seed:t.time*7.13%50}),Object.assign(t.shock,{on:!0,t:0,x:c.x,y:c.y,strength:o*.6,mode:"out",scale:.7}),q("impact",{strength:1.5*o,pitch:.45}),q("whoosh",{strength:1.3,duration:.7,up:!0}),q("zap",{strength:.9})):(Object.assign(t.shock,{on:!0,t:0,x:c.x,y:c.y,strength:o,mode:"out",scale:1}),q("impact",{strength:1.4*o,pitch:.55}),q("whoosh",{strength:1.1,duration:1.1,up:!0}),q("zap",{strength:.6}))}function l0(o=!1){be(`implode quiet=${o}`);const f=t.sing;f.phase==="alive"&&(f.phase=o?"collapsing":"imploding",f.t=0,t.cooldown=1,o||q("whoosh",{strength:.8,duration:.35,up:!1}))}function O0(){for(const o of t.orbs)Object.assign(o,n0(o.id));t.anticip=0,t.fuse=0,t.cooldown=0,Object.assign(t.sing,{phase:"none",t:0,age:0,presence:0,growth:0,flare:0,implode:0,lostT:0,sepVel:0,twoT:0}),t.shock.on=!1,t.beam.on=!1,t.flash=0,t.shake=0,t.aberr=0,t.energy=0,t.pin=0,t.prevSize[0]=t.prevSize[1]=0,t.grow[0]=t.grow[1]=0,t.openT[0]=t.openT[1]=0,t.ev.release=t.ev.blueDiss=t.ev.redDiss=t.ev.birth=t.ev.collapse=t.ev.launch=0,t.ev.kill=1,t.ghost[0].valid=t.ghost[1].valid=!1,t.matH[0]=t.matH[1]=null}function G0(o){const f=B(o.dt||.016666666666666666,.004166666666666667,.25)*w0,s=Math.min(f,.05);t.time+=s,t.clock=(t.clock+s)%st;const c=X0(),n=t.sing,h=D0(),m=A.source?.version??0;m!==t.srcVersion&&(t.srcVersion!==-1&&(be(`source ${t.srcVersion}->${m}: reset`),O0(),t.blocked[0]=t.blocked[1]=!0),t.srcVersion=m),t.cooldown=Math.max(0,t.cooldown-s);const r=t.byId;r[0]=r[1]=null;let P=0;for(const a of o.hands||v0)if(!(a.id!==0&&a.id!==1)){if(t.blocked[a.id])if(a.lost===0)t.blocked[a.id]=!1;else continue;a.lost>1||(r[a.id]=a,P++)}const d=r[0]||r[1],C=r[0]&&r[1]?r[1]:null;for(let a=0;a<2;a++){const u=t.ghost[a];if(r[a]){Q0(u,r[a],t.time),t.matH[a]=r[a];continue}const w=t.time-u.seenAt;u.valid&&w<j0&&!h?(u.lost=u.lost0+w,t.matH[a]=u):(u.valid=!1,t.matH[a]=null)}for(let a=0;a<2;a++){const u=r[a];if(!u){t.prevSize[a]=0,t.grow[a]=0,t.openT[a]=0;continue}t.openT[a]=u.open>.7&&u.facing>.3?t.openT[a]+s:0,t.prevSize[a]>0&&(t.grow[a]=G(t.grow[a],(u.size-t.prevSize[a])/Math.max(u.size,.001)/f,12,s)),t.prevSize[a]=u.size}if(r[0]&&r[1]){const a=r[0].palm[0],u=r[1].palm[0],w=t.orbs[0],k=t.orbs[1];if(w.pol===k.pol){const Y=a<=u?0:1;w.pol=Y,k.pol=1-Y}else(w.pol===0?a>u+.07:u>a+.07)&&w.charge<.35&&k.charge<.35&&(w.pol=1-w.pol,k.pol=1-k.pol)}else for(const a of t.orbs){const u=r[a.id];!u||a.charge>.08||(a.pol=u.side==="left"?0:1)}const H=n.phase!=="none";for(const a of t.orbs){const u=r[a.id],w=a.charge;if(u){a.active=!0,a.lost=0,T0(u,c,we),a.vx=u.velocity[0]*c,a.vy=u.velocity[1];const E=h?.1:.68;a.x=(u.palm[0]-.5)*c+we[0]*E*u.size,a.y=u.palm[1]-.5+we[1]*E*u.size,a.size=u.size,a.open=u.open;const W=(u.gesture==="open"||u.open>.6)&&!u.pinching,v=u.gesture==="fist"||u.fist>.45||u.open<.2;H||a.absorb>0?a.charge=Math.max(0,a.charge-s*4):t.cooldown>0?a.charge=Math.max(0,a.charge-s*2):W?a.charge=Math.min(1,a.charge+s/.85*(.55+.45*u.open)):v?(a.charge>.3&&!a.dissipating&&(a.dissipating=!0,be(`dissipate ${a.id} pol${a.pol} g=${u.gesture} open=${u.open.toFixed(2)} fist=${u.fist.toFixed(2)}`),a.pol===0?t.ev.blueDiss=1:t.ev.redDiss=1,q("whoosh",{strength:.35,duration:.35,up:!1})),a.charge=Math.max(0,a.charge-s*3.2),a.charge<.3&&(a.charge=Math.max(0,a.charge-s*6))):a.charge=Math.max(0,a.charge-s*.35),(!v||a.charge<=0)&&(a.dissipating=!1)}else a.active=!1,a.lost+=s,a.x+=a.vx*s,a.y+=a.vy*s,a.vx*=Math.exp(-s*6),a.vy*=Math.exp(-s*6),a.charge=Math.max(0,a.charge-s*(a.lost>.25?2.2:.4));if(a.absorb>0){a.absorb=Math.max(0,a.absorb-s/.32);const E=1-a.absorb;a.ax=K(a.ax,n.x,E*E),a.ay=K(a.ay,n.y,E*E)}w<.05&&a.charge>=.05&&!H&&q("whoosh",{strength:.3,duration:.7,up:!0}),a.chimeArmed&&a.charge>=.97?(a.chimeArmed=!1,q("chime",{strength:.22,pitch:a.pol===0?1.5:.9})):a.charge<.6&&(a.chimeArmed=!0);const k=O(0,1,a.charge);a.R=h?a.size*(.1+.46*k)*(.8+.2*a.open):a.size*(.08+.28*k)*(.85+.15*a.open);const Y=a.absorb>0?a.absorb:O(.02,.45,a.charge);a.vis=G(a.vis,Y,18,s),a.flare=G(a.flare,0,5,s)}if(K0&&d&&n.phase==="none"&&t.cooldown<=0&&t.time>1.2){const a=(d.palm[0]-.5)*c,u=d.palm[1]-.5,w=t.orbs[0],k=t.orbs[1];w.x=a-d.size*1.3,w.y=u,k.x=a+d.size*1.3,k.y=u,w.size=k.size=d.size,E0(w,k)}const R=Le(0,!0),z=Le(1,!0);let D=0;if(R&&z&&!H&&t.cooldown<=0){const a=Math.hypot(z.x-R.x,z.y-R.y),u=(R.size+z.size)/2,w=Math.min(R.charge,z.charge);D=O(3.5*u,2*u,a)*O(.35,.8,w),a<2*u&&w>.7?t.fuse+=s/.42:t.fuse=Math.max(0,t.fuse-s*2),t.fuse>=1&&E0(R,z)}else t.fuse=Math.max(0,t.fuse-s*3);if(t.anticip=G(t.anticip,D,H?18:6,s),n.phase!=="none"){if(n.t+=s,n.age+=s,n.phase==="alive"){let a=n.x,u=n.y;if(C){const v=d.palm[0]<=C.palm[0]?d:C,y=v===d?C:d,X=(v.palm[0]-.5)*c,V=v.palm[1]-.5,J=(y.palm[0]-.5)*c,Se=y.palm[1]-.5;a=(X+J)/2,u=(V+Se)/2;const me=Math.hypot(J-X,Se-V);Math.abs(me-n.sep)>Math.max(.2,9*f)&&(n.twoT=0),n.sepVel=n.twoT>.15?G(n.sepVel,(me-n.sep)/f,14,s):0,n.sep=me,n.size=(v.size+y.size)/2;let he=Math.atan2(Se-V,J-X)-n.ang;for(;he>Math.PI;)he-=2*Math.PI;for(;he<-Math.PI;)he+=2*Math.PI;n.ang+=he*(1-Math.exp(-s*20)),n.lostT=0,n.twoT+=s,n.fast=v.speed>y.speed?v:y,n.oneSided=Math.max(v.speed,y.speed)>1.6&&Math.max(v.speed,y.speed)>2.4*Math.min(v.speed,y.speed)}else d?(T0(d,c,we),a=(d.palm[0]-.5)*c+we[0]*d.size*.9,u=d.palm[1]-.5+we[1]*d.size*.9,n.sep=G(n.sep,d.size*1.9,2,s),n.sepVel=0,n.lostT=0,n.twoT=0,n.oneSided=!1):(n.lostT+=s,n.twoT=0,n.sepVel=G(n.sepVel,0,10,s),n.oneSided=!1);const w=n.twoT>.12;n.x=w?a:G(n.x,a,16,s),n.y=w?u:G(n.y,u,16,s),n.growth=Math.min(1,n.growth+s/.75);const k=n.growth,Y=1+2.2*(k-1)**3+1.2*(k-1)**2;n.rsT=B(n.sep*.07,.009,.046),n.rs=G(n.rs,n.rsT,14,s),n.presence=B(Y,0,1.15),n.flare=G(n.flare,0,2.5,s);let E=null,W=!1;for(const v of o.events||v0)if(!(v.hand&&r[v.hand.id]!==v.hand)&&(v.type==="throw"&&n.age>.75&&P0(v.hand,v.direction,o,c)&&(E=v),v.type==="pinchstart"&&n.age>.35)){l0(!1);break}for(let v=0;v<2;v++){const y=r[v];y&&n.age>.75&&t.grow[v]>2.8&&t.openT[v]>.35&&y.speed<1.2&&(W=!0)}if(n.phase==="alive"&&d0>=0&&n.age>=d0?(ye[0]=Math.cos(x0),ye[1]=Math.sin(x0),Ue(B(.9+n.rs*12,.9,1.45),ye,"debug")):n.phase==="alive"&&b0>=0&&n.age>=b0&&l0(!1),n.phase==="alive"){const v=n.age>.9&&n.sepVel>1.25&&n.oneSided&&P0(n.fast,n.fast.velocity,o,c)?n.fast:null;if(E||v){const y=E?E.direction:v.velocity,X=(y?.[0]??0)*c,V=y?.[1]??0,J=Math.hypot(X,V);ye[0]=X/(J||1),ye[1]=V/(J||1),Ue(B(.9+n.rs*12,.9,1.45),J>.001?ye:null,E?"throw":"fling")}else n.age>.9&&n.sepVel>1.25?Ue(B(.8+n.rs*12,.8,1.4),null,"rip"):W?Ue(B(.9+n.rs*12,.9,1.45),null,`push ${t.grow[0].toFixed(1)},${t.grow[1].toFixed(1)}`):n.lostT>.9&&l0(!0)}}else if(n.phase==="released")n.presence=Math.max(0,1-n.t/.16)*(1+n.t*6),n.flare=3*Math.max(0,1-n.t/.16),n.t>.2&&(n.phase="none",n.presence=0);else if(n.phase==="imploding"||n.phase==="collapsing"){const a=n.phase==="imploding"?.38:.7,u=B(n.t/a,0,1);n.implode=u,n.presence=(1-u*u*u)*(n.phase==="imploding"?1+.3*Math.sin(u*Math.PI):1),u>=1&&(n.phase==="imploding"&&(t.pin=1,t.pinX=n.x,t.pinY=n.y,t.pinS=B(n.rs*1.6,.012,.06),t.flash=Math.max(t.flash,.5),t.aberr=Math.max(t.aberr,.8),t.shake=Math.max(t.shake,.45),q("impact",{strength:.75,pitch:1.6}),q("chime",{strength:.45,pitch:2}),q("zap",{strength:.5}),Object.assign(t.shock,{on:!0,t:0,x:n.x,y:n.y,strength:.85,mode:"out",scale:.62})),t.ev.collapse=1,n.phase="none",n.presence=0,n.implode=0)}}for(const a of o.events||v0){if(a.type!=="pinchstart"||n.phase!=="none")continue;const u=a.hand&&r[a.hand.id]===a.hand?t.orbs[a.hand.id]:null;u&&u.charge>.3&&(be(`pinch-implode orb ${u.id}`),u.flare=3,u.charge=0,u.pol===0?t.ev.blueDiss=1:t.ev.redDiss=1,t.flash=Math.max(t.flash,.2),q("zap",{strength:.5}),q("impact",{strength:.35,pitch:1.8}))}const g=t.shock;g.on&&(g.t+=s,(g.mode==="in"?g.t>.34:g.t>1.7)&&(g.on=!1)),t.beam.on&&(t.beam.t+=s,t.beam.t>.75&&(t.beam.on=!1)),t.flash*=Math.exp(-s*7),t.shake*=Math.exp(-s*4.5),t.aberr*=Math.exp(-s*3.5),t.pin*=Math.exp(-s*13),t.pin<.002&&(t.pin=0),t.shakePhase+=s;const I=A.audio;if(I){let a=0,u=0;for(const k of t.orbs)k.pol===0?a=Math.max(a,k.vis):u=Math.max(u,k.vis);const w=n.phase==="alive"?n.presence:0;le.hum.level=B(.22*(a+u)+.3*t.anticip+.55*w,0,1),le.hum.pitch=.6+.55*t.anticip+.2*w+.25*B(n.rs*20,0,1)*w,le.noise.level=B(.1*a+.14*u+.22*w+(g.on&&g.mode==="out"?.3*Math.max(0,1-g.t):0),0,1),le.noise.tone=B(.25+.5*u-.1*a+.15*w,0,1),le.crackle.level=B(.32*u+.3*t.anticip,0,1),I.layer("hum",le.hum),I.layer("noise",le.noise),I.layer("crackle",le.crackle)}ge.length=0;let N=!1,x=!1;for(const a of t.orbs)a.active&&a.charge>.05&&a.absorb===0&&(N=!0);(r[0]?.pinching||r[1]?.pinching)&&(x=!0),N&&ge.push("open"),P===2&&(t.anticip>.05||t.fuse>0)&&ge.push("two"),n.phase==="alive"&&ge.push("throw"),x&&ge.push("pinch")}function Y0(o){const{width:f,height:s,aspect:c}=o,n=t.clock,h=t.sing,m=t.shock,r=t.beam,P=!!o.mobile,d=D0(),C=B(o.quality??1,.2,1);Math.abs(C*6-t.qLevel)>.6&&(t.qLevel=Math.round(C*6));const H=B(t.qLevel/6,.2,1);let R=0,z=0;e.blue[3]=0,e.red[3]=0;for(let l=0;l<2;l++){const p=t.orbs[l],M=p.absorb>0?p.ax:p.x,U=p.absorb>0?p.ay:p.y,Ae=p.R*(p.absorb>0?.4+.6*p.absorb:1);e.orbA[l*4]=M,e.orbA[l*4+1]=U,e.orbA[l*4+2]=Ae,e.orbA[l*4+3]=B(p.vis,0,1.2),e.orbB[l*4]=p.pol,e.orbB[l*4+1]=p.charge,e.orbB[l*4+2]=p.seed,e.orbB[l*4+3]=p.flare;const ve=p.pol===0?e.blue:e.red,re=p.pol===0?R:z;p.vis>=re&&(ve[0]=M,ve[1]=U,ve[2]=Ae,ve[3]=p.vis,e.velB[p.pol*2]=p.vx,e.velB[p.pol*2+1]=p.vy,p.pol===0?R=p.vis:z=p.vis)}const D=h.phase==="none"?0:B(h.presence,0,1.6),g=h.rs*(h.phase==="released"?1+h.t*4:1)*Math.max(1e-4,D);e.singA[0]=h.x,e.singA[1]=h.y,e.singA[2]=g,e.singA[3]=D>.001?Math.min(1,D):0;const I=19*(1+2.5*h.implode*h.implode)*(h.phase==="released"?1+3*h.t:1);e.singB[0]=I,e.singB[1]=h.flare,e.singB[2]=h.growth,e.singB[3]=h.implode,e.diskP[0]=3,e.diskP[1]=9.5,e.diskP[2]=n,e.diskP[3]=3.2*(1+h.flare*2.5);const N=1.36+.05*Math.sin(t.time*.37),x=Math.cos(h.ang),a=Math.sin(h.ang),u=Math.PI/2-N,w=Math.cos(u),k=Math.sin(u);if(e.disk[0]=x,e.disk[1]=a,e.disk[2]=0,e.disk[3]=-a*w,e.disk[4]=x*w,e.disk[5]=k,e.disk[6]=a*k,e.disk[7]=-x*k,e.disk[8]=w,e.sing[0]=h.x,e.sing[1]=h.y,e.sing[2]=g,e.sing[3]=e.singA[3],e.lens[0]=I,e.lens[1]=3,e.lens[2]=9.5,m.on)if(m.mode==="out"){const l=m.t;e.shockA[0]=m.x,e.shockA[1]=m.y,e.shockA[2]=(.02+1.45*Math.pow(l,.72))*m.scale,e.shockA[3]=.9*m.strength*Math.pow(Math.max(0,1-l/1.7),1.6),e.shockB[0]=(.025+.06*l)*m.scale,e.shockB[1]=l,e.shockB[2]=2.6*m.strength*Math.max(0,1-l/.55)**2,e.shockB[3]=1}else{const l=B(m.t/.34,0,1);e.shockA[0]=m.x,e.shockA[1]=m.y,e.shockA[2]=m.scale*(1-l)*(1-l)+.005,e.shockA[3]=-.8*Math.sin(l*Math.PI),e.shockB[0]=.02+.03*(1-l),e.shockB[1]=l,e.shockB[2]=.9*Math.sin(l*Math.PI),e.shockB[3]=0}else e.shockA[3]=0,e.shockB[2]=0;let Y=0;if(r.on){const l=r.t;e.beamA[0]=r.x,e.beamA[1]=r.y,e.beamA[2]=r.dx,e.beamA[3]=r.dy,e.beamB[0]=Math.min(3.2,13*l),e.beamB[1]=r.w*(1+.5*O(0,.3,l)),e.beamB[2]=O(0,.03,l)*(1-O(.1,.4,l)),e.beamB[3]=Math.exp(-l*9)*O(0,.02,l)*B(r.strength,0,1.3),e.beamC[0]=Math.exp(-l*4.5)*O(0,.02,l),e.beamC[1]=l,e.beamC[2]=r.seed,e.beamC[3]=1-O(.45,.72,l),Y=e.beamB[3]}else e.beamB[2]=0,e.beamB[3]=0,e.beamC[0]=0,e.beamC[3]=0;e.pin[0]=t.pinX,e.pin[1]=t.pinY,e.pin[2]=t.pin,e.pin[3]=t.pinS;const E=Le(0,!1),W=Le(1,!1);e.bridge[0]=t.anticip,e.bridge[1]=t.fuse,E&&W?(e.bridgeAB[0]=E.x,e.bridgeAB[1]=E.y,e.bridgeAB[2]=W.x,e.bridgeAB[3]=W.y):e.bridge[0]=0,$.noBridge&&(e.bridge[0]=0);const v=e.lightP,y=e.lightC;for(let l=0;l<2;l++){const p=t.orbs[l],M=e.orbA[l*4],U=e.orbA[l*4+1],Ae=e.orbA[l*4+2],ve=e.orbA[l*4+3];v[l*4]=M,v[l*4+1]=U,v[l*4+2]=.54+Ae*.5,v[l*4+3]=0;const re=ve*((p.pol===0?5.6:5.8)+2.5*p.flare)*(1+.06*Math.sin(n*23+l*2));p.pol===0?(y[l*4]=.22*re,y[l*4+1]=.56*re,y[l*4+2]=1.42*re):(y[l*4]=1.35*re,y[l*4+1]=.36*re,y[l*4+2]=.07*re),y[l*4+3]=ve>.001?p.pol===0?.05+Ae*1.15:.06+Ae*1.35:0}const X=t.flash*2.5+Y*3+t.pin*3,V=Math.min(1,D)*(3.9+h.flare*2)+X,J=g*6;for(let l=0;l<2;l++){const p=l===0?-1:1,M=(2+l)*4;v[M]=h.x+p*x*J,v[M+1]=h.y+p*a*J,v[M+2]=.57,v[M+3]=0,l===0?(y[M]=.72*V+X*.4,y[M+1]=.74*V+X*.3,y[M+2]=.82*V):(y[M]=1*V,y[M+1]=.68*V+X*.3,y[M+2]=.42*V+X*.4),y[M+3]=V>.001?.035+g*2.4:0}if(r.on&&Y>.01&&(v[8]=r.x+r.dx*.15,v[9]=r.y+r.dy*.15),t.pin>.01&&D<.01&&(v[8]=t.pinX,v[9]=t.pinY,v[12]=t.pinX,v[13]=t.pinY,y[11]=y[15]=.12),$.noLight)for(let l=0;l<16;l++)y[l]=0;const Se=Math.max(R,z,Math.min(1,D)),me=(o.dt||1/60)*w0;t.energy=G(t.energy,Se,6,me),e.grade[0]=B(t.anticip*.45,0,.5),e.grade[1]=t.anticip*.08,E&&W?(e.gradeC[0]=(E.x+W.x)/2,e.gradeC[1]=(E.y+W.y)/2,e.gradeC[2]=Math.max(.12,Math.hypot(W.x-E.x,W.y-E.y)*1.1)):e.grade[0]=e.grade[1]=0;const Fe=t.matH,he=!!(Fe[0]||Fe[1]),oe=!d&&he&&(D>.001||R>.01||z>.01);let i0=null;const ee=R>.002||z>.002||D>5e-4||e.bridge[0]>.002||e.shockA[3]!==0||r.on||t.pin>0,H0=H>.6?2:H>.35?2.4:2.9,r0=Math.max(2,Math.round(f/H0)),c0=Math.max(2,Math.round(s/H0));if(ue&&($.attract=d,$.handOn=oe,$.fxActive=ee),$0(),de("matte"),oe){Q.resize(r0,c0),Z0(o),j.uMask=o.mask,j.uBase=o.base,j.uAspect=c;const l=ze&&Ce===r0&&Re===c0;j.uBg=l?T[0]:o.base,j.uBgOk=l?1:0,j.uMDbg=$.view==="key"?1:0,b.pass(Ge,Q,j)}if(xe("matte"),ee?(k0(r0,c0),de("fill"),i0=B0(o,oe&&!Qe),ze=oe&&!Qe,xe("fill")):ze=!1,ee){const l=Math.min(1,(P?1e3:1600)*Math.max(.6,A.scale||1)*(.55+.45*H)/Math.max(f,s)),p=Math.max(2,Math.round(f*l)),M=Math.max(2,Math.round(s*l));M0(p,M),e.fxRes[0]=p,e.fxRes[1]=M;const U=Be;U.uMask=o.mask,U.uAspect=c,U.uTime=n,U.uFrame=o.frame,U.uMobile=P?1:0,U.uQuality=C,U.uHand=Q,U.uHandOn=oe?1:0,de("fx"),b.pass(je,o0,U),xe("fx")}const ot=P?at:m0,_e=.35+.65*C,Ie=Math.max(256,Math.round(ot*_e)),L0=R>.05?R:0,U0=z>.05?z:0,q0=h.phase==="alive"&&D>.2?1:0,L=t.ev;(L0>0||U0>0||q0>0||L.release||L.blueDiss||L.redDiss||L.birth)&&(t.liveAt=t.time);const N0=t.time-t.liveAt<3.5||L.kill||L.collapse,_0=B(me*60,.05,3);if(e.spawn[0]=L0,e.spawn[1]=U0,e.spawn[2]=q0,e.spawn[3]=.015*_0,e.caps[0]=Math.round((P?2e3:5e3)*_e),e.caps[1]=Math.round((P?450:1e3)*_e),e.caps[2]=Math.min(1,.035*_0),e.caps[3]=Ie,e.event[0]=L.release,e.event[1]=L.blueDiss,e.event[2]=L.redDiss,e.event[3]=L.birth,e.event2[0]=L.collapse,e.event2[1]=L.launch,e.relC[0]=t.relC[0],e.relC[1]=t.relC[1],e.relC[2]=t.relC[2],e.relC[3]=L.kill,e.relD[0]=t.relD[0],e.relD[1]=t.relD[1],de("sim"),N0){const l=C0;l.uTime=n,l.uDt=B(me,0,.05),l.uAspect=c,l.uCount=Ie,Ze.use().set(l),i.enable(i.RASTERIZER_DISCARD),i.bindVertexArray(Ee[ke]),i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,He[1-ke]),i.beginTransformFeedback(i.POINTS),i.drawArrays(i.POINTS,0,Ie),i.endTransformFeedback(),i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,null),i.bindBuffer(i.TRANSFORM_FEEDBACK_BUFFER,null),i.disable(i.RASTERIZER_DISCARD),ke=1-ke}xe("sim"),L.release=0,L.blueDiss=0,L.redDiss=0,L.birth=0,L.kill=0,L.collapse=0,L.launch=0;const u0=N0&&!W0;if(de("draw"),u0){const l=Math.min(1,2200*(.7+.3*H)/Math.max(f,s)),p=Math.max(2,Math.round(f*l)),M=Math.max(2,Math.round(s*l));fe.resize(p,M),fe.clear(0,0,0,0),e.pRes[0]=p,e.pRes[1]=M;const U=R0;U.uAspect=c,U.uGain=1/Math.sqrt(_e),U.uFloor=d&&c>=1?-.31:-10,Je.use().set(U),b.blend("premultiplied"),i.bindVertexArray(Oe[ke]),i.drawArraysInstanced(i.TRIANGLE_STRIP,0,4,Ie),i.bindVertexArray(null),b.blend(null)}if(xe("draw"),e.res[0]=f,e.res[1]=s,ee||u0||t.flash>.002){de("final"),e.diskAx[0]=e.disk[0],e.diskAx[1]=e.disk[1],e.diskN[0]=e.disk[3],e.diskN[1]=e.disk[4],e.diskN[2]=e.disk[5];const l=s0,p=A.source,M=p&&p.width>0&&p.height>0?Math.max(f/p.width,s/p.height):1;l.uSoft=B(M*.85,1.2,5),l.uBase=o.base,l.uNormals=o.normals(),l.uHand=Q,l.uFxA=Z,l.uFxB=ne,l.uClean=ee&&oe?T[0]:o.base,l.uEnv=ee&&i0?i0:o.base,l.uHole=ee&&oe&&S.length?S[0]:o.base,l.uEnvMid=ee&&S.length>1?oe&&!Qe?T[1]:S[1]:o.base,l.uEnvTop=ee&&e0?e0:o.base,l.uParts=fe,l.uPlate=o.plate,l.uPlateL=o.plateLearned,l.uMask=o.mask,l.uAspect=c,l.uFxOn=ee?1:0,l.uHandOn=oe?1:0,l.uPartsOn=u0?1:0,l.uDebugMatte=$.matteMode,l.uDbgBits=$.bits||0,l.uHandRef=Math.max(.06,Fe[0]?.size||0,Fe[1]?.size||0),b.pass(Xe,o.scene,l),xe("final")}else o.copy(o.base,o.scene);const ie=$.view;if(ie==="fill"&&T.length)o.copy(T[0],o.scene);else if(ie==="prep"&&S.length)o.copy(S[0],o.scene);else if(ie==="matte"||ie==="key")o.copy(Q,o.scene);else if(ie&&/^(push|pull)\d$/.test(ie)){const l=(ie[2]==="s"?S:T)[+ie[4]];l&&o.copy(l,o.scene)}const ae=o.post,Ve=t.energy;ae.exposure=1-.08*Ve,ae.bloom=.06+.05*Ve+.05*Math.min(1,D)+.12*t.flash,ae.vignette=.35+.2*Ve,ae.aberration=.0015*Math.min(1,D)+.011*t.aberr,ae.flash=.12*t.flash*t.flash,ae.filmic=.1*Ve,ae.grain=.035;const f0=t.shake*.012;if(f0>1e-5){const l=t.shakePhase*38;ae.shake[0]=f0*(Math.sin(l*1.3)*.6+Math.sin(l*2.9+1.7)*.4)/c,ae.shake[1]=f0*(Math.sin(l*1.7+.4)*.6+Math.sin(l*3.3+2.2)*.4)}}function Z0(o){const f=o.aspect;e.handSize[0]=0,e.handSize[1]=0;for(let s=0;s<2;s++){const c=t.matH[s],n=s*_*4;if(!c){for(let g=0;g<_*4;g++)e.bones[n+g]=1e3;e.sweep[s*2]=e.sweep[s*2+1]=0;continue}e.handSize[s]=c.size,e.palm[s*2]=c.palm[0],e.palm[s*2+1]=c.palm[1],e.curl[s*4]=c.curls[0],e.curl[s*4+1]=c.curls[1],e.curl[s*4+2]=c.curls[2],e.curl[s*4+3]=c.curls[3],e.curl[8+s]=c.curls[4],e.curl[10+s]=1-.55*O(.8,2.4,c.speed||0),e.sweep[s*2]=(c.velocity?.[0]||0)*f*.03,e.sweep[s*2+1]=(c.velocity?.[1]||0)*.03,e.uncert[s]=.1+.35*O(.8,2.4,c.speed||0)+1.4*B((c.lost||0)-.12,0,.5);const h=c.lost||0,m=h*(c.speed||0)/Math.max(c.size,.05);e.fresh[s]=(1-O(.06,.22,m))*(1-O(.25,.5,h));const r=c.points,P=(c.palm[0]-.5)*f,d=c.palm[1]-.5;let C=0;for(let g=0;g<21;g++)C=Math.max(C,Math.hypot((r[g*3]-.5)*f-P,r[g*3+1]-.5-d));const H=(r[0]-.5)*f,R=r[1]-.5,z=H-((r[27]-.5)*f-H)*2,D=R-(r[28]-.5-R)*2;C=Math.max(C,Math.hypot(z-P,D-d)+.3*c.size),e.reach[s]=C+(1+1.4*Math.min(c.lost||0,.5))*c.size+Math.hypot(e.sweep[s*2],e.sweep[s*2+1]);for(let g=0;g<_;g++){const I=nt[g],N=lt[g],x=n+g*4;if(e.bones[x]=(r[I*3]-.5)*f,e.bones[x+1]=r[I*3+1]-.5,N>=0){let a=(r[N*3]-.5)*f,u=r[N*3+1]-.5;(N===4||N===8||N===12||N===16||N===20)&&(a+=(a-e.bones[x])*.25,u+=(u-e.bones[x+1])*.25),e.bones[x+2]=a,e.bones[x+3]=u}else e.bones[x+2]=z,e.bones[x+3]=D}}}const qe=[{pts:null,side:"left"},{pts:null,side:"right"}],Ne=[],J0={c:[.33,-.06],b:[.17,-.25],r:[.58,.2],size:.17,hold:.33,grow:.1,amp:.05,out:1.3,ax:0,rise:.08},et={c:[.11,.235],b:[.07,.15],r:[.17,.35],size:.085,hold:.16,grow:.045,amp:.018,out:.55,ax:.62,rise:.05};function tt(o,f,s,c,n){const m=((o+V0)%13.2+13.2)%13.2;Ne.length=0;const r=f>=1?J0:et,P=(x,a,u=0)=>x*Math.sin(o*a+u),d=r.size,C=Math.cos(r.ax),H=Math.sin(r.ax);let R,z,D,g,I=.25,N=-.25;if(m<4.1){const x=O(.25,.9,m),a=O(.55,1.2,m);R=r.b[0]+P(.015,.9)*d/.17,z=K(r.b[1]-r.rise,r.b[1],x)+P(.015,1.3)*d/.17,D=r.r[0]+P(.02,1.1,1)*d/.17,g=K(r.r[1]-r.rise,r.r[1],a)+P(.02,1.2,2)*d/.17}else if(m<5.6){const x=O(4.1,5.5,m);R=K(r.b[0],r.c[0]-C*r.hold/2,x),z=K(r.b[1],r.c[1]-H*r.hold/2,x)+P(.01,1.3)*d/.17,D=K(r.r[0],r.c[0]+C*r.hold/2,x),g=K(r.r[1],r.c[1]+H*r.hold/2,x)+P(.01,1.2,2)*d/.17,I=K(.25,.5,x),N=K(-.25,-.5,x)}else if(m<10.3){const x=m-5.6,a=r.hold+r.grow*O(0,1.6,x)+r.amp*Math.sin(x*1.4)*O(.8,2,x),u=r.ax+.22*Math.sin(x*.8)*O(.5,2,x),w=r.c[0]+P(.012,.7)*d/.17,k=r.c[1]+P(.012,.9)*d/.17;R=w-Math.cos(u)*a/2,z=k-Math.sin(u)*a/2,D=w+Math.cos(u)*a/2,g=k+Math.sin(u)*a/2,I=.5+u-r.ax,N=-.5+u-r.ax}else{const x=O(10.3,10.62,m),a=K(r.hold+r.grow,r.out,x);R=r.c[0]-C*a/2,z=r.c[1]-H*a/2+K(0,-.05,x)*d/.17,D=r.c[0]+C*a/2,g=r.c[1]+H*a/2+K(0,.04,x)*d/.17,I=.5+x*.4,N=-.5-x*.4}return m>.25&&m<10.95&&(qe[0].pts=c({x:.5+R/f,y:.5+z,size:d,roll:I,side:"left",curls:n.open},f,s[0]),qe[1].pts=c({x:.5+D/f,y:.5+g,size:d,roll:N,side:"right",curls:n.open},f,s[1]),Ne.push(qe[0]),m>.55&&Ne.push(qe[1])),Ne}try{const o=A.targets,f=b.target(4,4,{format:"hdr"});M0(4,4),k0(16,16),Q.resize(4,4),fe.resize(4,4),e.res[0]=e.res[1]=e.fxRes[0]=e.fxRes[1]=e.pRes[0]=e.pRes[1]=4,e.orbA[3]=1,e.orbA[2]=.1,e.orbB[0]=0,e.orbA[7]=1,e.orbA[6]=.1,e.orbB[4]=1,e.singA[2]=.02,e.singA[3]=1,e.singB[0]=19,e.diskP[0]=3,e.diskP[1]=9.5,e.diskP[3]=1,e.disk[0]=1,e.disk[4]=1,e.disk[8]=1,e.bridge[0]=.5,e.shockA[3]=.5,e.shockB[0]=.05,e.beamB[1]=.05,e.beamB[2]=.5,e.beamB[3]=.5,e.beamC[0]=.5,e.beamC[3]=.5,e.beamA[2]=1,e.pin[2]=.5,e.pin[3]=.02,Be.uMask=o.mask.read,Be.uHandOn=1,b.pass(je,o0,Be),Be.uHandOn=0,j.uMask=o.mask.read,j.uBase=o.base,j.uBg=o.base,j.uAspect=1,b.pass(Ge,Q,j),B0({base:o.base,mask:o.mask.read},!0),Object.assign(s0,{uBase:o.base,uNormals:o.normals,uClean:T[0],uEnv:T[0],uEnvMid:T[1],uEnvTop:T[T.length-1],uHole:S[0],uPlate:o.plateFilled,uPlateL:o.plate.read,uMask:o.mask.read,uFxOn:1,uHandOn:1,uPartsOn:1,uAspect:1}),b.pass(Xe,f,s0),Ze.use().set(Object.assign(C0,{uCount:1,uDt:0})),i.enable(i.RASTERIZER_DISCARD),i.bindVertexArray(Ee[0]),i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,He[1]),i.beginTransformFeedback(i.POINTS),i.drawArrays(i.POINTS,0,1),i.endTransformFeedback(),i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,null),i.bindBuffer(i.TRANSFORM_FEEDBACK_BUFFER,null),i.disable(i.RASTERIZER_DISCARD),fe.bind(),Je.use().set(R0),b.blend("premultiplied"),i.bindVertexArray(Oe[0]),i.drawArraysInstanced(i.TRIANGLE_STRIP,0,4,1),i.bindVertexArray(null),b.blend(null),f.dispose();for(const s of["orbA","orbB","singA","singB","diskP","disk","bridge","shockA","shockB","beamA","beamB","beamC","pin"])e[s].fill(0)}catch(o){console.warn("singularity warm-up skipped",o)}return ue&&typeof window<"u"&&(window.__singularity={S:t,log:ue,dbg:$,U:e,fxA:Z,fxB:ne,fillPush:S,fillPull:T,matte:Q}),{id:"singularity",coach:[{gesture:"open",label:"Open palm",text:"charge an orb"},{gesture:"two",label:"Collide",text:"bring both orbs together"},{gesture:"throw",label:"Rip apart",text:"fast, to release it"},{gesture:"pinch",label:"Pinch",text:"implode it"}],activeCues(){return ge},update:G0,render:Y0,reset:O0,choreography:tt,dispose(){for(const o of[je,Xe,Ge,y0,A0,Ye,Ze,Je])o.dispose();Q.dispose(),fe.dispose(),Z.dispose(),ne.dispose(),i.deleteFramebuffer(t0);for(const o of S)o.dispose();for(const o of T)o.dispose();S.length=T.length=0,Ce=Re=0;for(const o of Pe)i.deleteBuffer(o);for(const o of[...Ee,...Oe])i.deleteVertexArray(o);for(const o of He)i.deleteTransformFeedback(o)}}}export{bt as createEffect};
