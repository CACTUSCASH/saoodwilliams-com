/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-de8049136198 */(()=>{const k=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(k)||k.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as Z,COMMON as Ie}from"../engine/glsl.js?v=515dba1803";const z=(k,d,i)=>Math.min(i,Math.max(d,k)),L=(k,d,i)=>{const M=z((i-k)/(d-k),0,1);return M*M*(3-2*M)},W=(k,d,i)=>k+(d-k)*i,X=(k,d,i,M)=>k+(d-k)*(1-Math.exp(-i*M)),i0=49152,Y0=16384,Ne=12,G0=7*4096,r0=[[0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[9,10],[10,11],[11,12],[13,14],[14,15],[15,16],[17,18],[18,19],[19,20],[0,5],[0,17],[5,9],[9,13],[13,17],[0,9],[0,13],[5,17],[2,5],[0,-1],[1,5]],N=r0.length,Z0=Int8Array.from(r0,k=>k[0]),J0=Int8Array.from(r0,k=>k[1]),c0=[],et=Z+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uMask;uniform sampler2D uBase;uniform sampler2D uBg;uniform float uBgOk;uniform float uAspect;uniform vec2 uHandSize;
uniform float uMDbg;
uniform vec4 uPalm;
uniform vec2 uReach;
uniform vec4 uSweep;
uniform vec2 uUncert;
uniform vec2 uFresh;
uniform vec4 uBones[${N*2}];
uniform vec4 uCurl[3];
const float RAD[${N}]=float[${N}](0.14,0.13,0.115,0.1,0.1,0.095,0.085,0.105,0.1,0.09,0.1,0.095,0.085,0.09,0.085,0.075,
0.17,0.17,0.17,0.17,0.17,0.2,0.2,0.18,0.24,0.27,0.2);
const int FIN[${N}]=int[${N}](-1,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-2,-1);
const float OCW[${N}]=float[${N}](0.0,0.45,0.85,1.0,0.45,0.85,1.0,0.45,0.85,1.0,0.45,0.85,1.0,0.45,0.85,1.0,
0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0);
const int CORE[${N}]=int[${N}](0,2,2,2,1,1,2,1,1,2,1,1,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0);
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
for(int i=0;i<${N};i++){
vec4 b=uBones[h*${N}+i];
float rr=RAD[i]*sz;
vec2 pa=p-b.xy,ba=b.zw-b.xy;float hh=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.0,1.0);
float d=(length(pa-ba*hh)-rr)/sz;
bool tipB=i==3||i==6||i==9||i==12||i==15;
if(FIN[i]!=-2&&d<dAx){dAx=d;axP=b.xy+ba*(tipB?min(hh,0.8):hh);}
float ds=(min(capsule(p+sw,b.xy,b.zw),capsule(p-sw,b.xy,b.zw))-rr)/sz;
dSw=min(dSw,ds);
int f=FIN[i];
if(f>=0){
dFin=min(dFin,d);dFm=min(dFm,ds);
if(CORE[i]==2)dCoreT=min(dCoreT,tipB?(capsule(p,b.xy,b.xy+ba*0.8)-rr)/sz:d);else dCoreF=min(dCoreF,d);
float cf=f==0?cu.x:f==1?cu.y:f==2?cu.z:f==3?cu.w:cpk;
occ=max(occ,smoothstep(0.04,-0.06,d)*OCW[i]*smoothstep(0.22,0.65,cf));
}else if(f==-1)dPalm=min(dPalm,d);
else dFore=d;
}
float dmin=min(min(dPalm,dFin),dFore);
dall=min(dall,min(dmin,dSw));
float ur=h==0?uUncert.x:uUncert.y;
float reachB=max(0.13,ur);
float dHull=min(dmin,dSw);
if(dHull>reachB)continue;
int o0=h*${N};
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
float fresh=h==0?uFresh.x:uFresh.y;
float trust=(h==0?uCurl[2].z:uCurl[2].w)*fresh;
vec2 axUv=axP/vec2(uAspect,1.0)+0.5;
vec3 pcL=texture(uBase,axUv).rgb;
float okL=uBgOk>0.5?smoothstep(1.0,4.0,cdist(pcL,texture(uBg,axUv).rgb)):1.0;
float Ds=min(cdist(c,pcL)+(1.0-okL)*30.0,cdist(c,pc)+1.0),Db=cdist(c,bc);
float sep=min(cdist(pcL,bc)+(1.0-okL)*30.0,cdist(pc,bc)+2.0);
float key=1.0/(1.0+exp(clamp((Ds-Db)*0.6,-30.0,30.0)))*smoothstep(16.0,6.0,Ds);
float conf=uBgOk*smoothstep(1.2,5.0,sep);
float geo=max(smoothstep(0.02,-0.05,min(dFin,dPalm))*max(trust,m),smoothstep(0.02,-0.05,dFm)*0.6*max(trust,m));
geo=max(geo,smoothstep(0.0,-0.06,dFore)*m);
float core=max(smoothstep(0.01,-0.03,dCoreT),smoothstep(-0.02,-0.06,dCoreF))*max(fresh,m);
float band=smoothstep(reachB,reachB*0.5,dHull);
float need=smoothstep(0.02,reachB,dHull);
float keyF=smoothstep(0.45*need,1.0-0.05*need,key);
float a=band*mix(geo,keyF,conf);
a=max(a,smoothstep(0.0,-0.08,dFore)*max(m*0.92,keyF*conf*smoothstep(0.25,0.6,m)));
float palmCore=smoothstep(-0.01,-0.08,dPoly)*max(fresh,key*conf);
float roomK=conf/(1.0+exp(clamp((Db-Ds+4.0)*0.6,-30.0,30.0)));
a=max(a,max(palmCore,core)*(1.0-0.9*roomK));
best=max(best,a);
lit=max(lit,band*key*conf);
dbgK=max(dbgK,vec3(key,conf,band*0.5+0.5*smoothstep(0.02,-0.02,dHull)));
}
outColor=vec4(best,clamp(dall+0.25,0.0,1.0),lit,min(occ,best));
if(uMDbg>0.5)outColor=vec4(dbgK,1.0);
}`,tt=Z+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uHand;uniform sampler2D uMask;uniform float uHoleOn;
float handAt(vec2 uv){vec4 m=texture(uHand,uv);return max(smoothstep(0.02,0.25,max(m.r,m.b*1.6)),smoothstep(0.62,0.5,m.g));}
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
h=max(h,smoothstep(0.45,0.75,texture(uMask,vUv).r)*smoothstep(0.42,0.25,dH));
}
float a=(1.0-h)*(1.0-h);
outColor=vec4(c*a,a);
}`,ot=Z+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;
void main(){
vec4 s=texture(uSrc,vUv+uTexel*vec2(-0.5,-0.5))+texture(uSrc,vUv+uTexel*vec2(0.5,-0.5))
+texture(uSrc,vUv+uTexel*vec2(-0.5,0.5))+texture(uSrc,vUv+uTexel*vec2(0.5,0.5));
s*=0.25;
float a=min(1.0,s.a*4.0);
outColor=s.a>1e-5?vec4(s.rgb/s.a*a,a):vec4(0.0);
}`,at=Z+`
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
}`,st=Z+Ie+`
in vec2 vUv;
layout(location=0)out vec4 oEmit;
layout(location=1)out vec4 oLens;
uniform sampler2D uMask;
uniform float uAspect;uniform float uTime;uniform float uFrame;uniform float uMobile;
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
float k=smoothstep(0.55,1.35,g);
vec3 cR=vec3(1.0,0.2,0.08),cV=vec3(0.62,0.26,1.0),cB=vec3(0.25,0.6,1.0);
vec3 hue=k<0.5?mix(cR,cV,k*2.0):mix(cV,cB,k*2.0-1.0);
float I=flux*boost*uDiskP.w*(0.55+0.45*dens);
vec3 col=mix(hue,vec3(1.0,0.95,1.0),smoothstep(1.2,5.0,I)*0.75)*I;
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
float stepK=uMobile>0.5?0.14:0.08;
int maxI=uMobile>0.5?64:120;
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
int NS=uMobile>0.5?4:7;
if(B.x<0.5){
front=max(front,vis*smoothstep(1.04,0.86,s));
float th=vis*win*(s<1.0?0.6+0.95*(1.0-s)*(1.0-s):0.6/(s*s*s*s+0.2));
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
bgT*=mix(0.15,1.0,smoothstep(SHADOW+0.05,SHADOW+1.3,bl));
disp+=0.018*smoothstep(10.0,2.6,bl);
}
float calmS=1.0;
if(uHandOn>0.5)calmS=1.0-smoothstep(0.75,0.03,dH)*smoothstep(SHADOW*1.6,SHADOW*3.0,bl);
off+=(sampleRs-b)*rs*calmS;
bgT*=1.0-0.62*uSingA.w*exp(-bl*bl/260.0);
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
emitOrb+=hue*(max(line,0.0)*(0.5+3.0*pulse)+core*(0.7+1.2*pulse))*env*uBridge.x*(0.6+1.4*uBridge.x)*(1.6+2.4*uBridge.y)*bw*(1.0-front);
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
emitSing+=(vec3(0.62,0.42,1.0)*exp(-x*x*2.0)*0.7+vec3(0.9,0.85,1.0)*exp(-x*x*10.0)*0.35*br)*uShockB.z;
}
}
if(uPin.z>0.001){
vec2 d=p-uPin.xy;float sc=max(uPin.w,1e-4);float r2=dot(d,d)/(sc*sc);
emitSing+=vec3(0.9,0.85,1.0)*uPin.z*(70.0*exp(-r2*40.0)+7.0*exp(-r2*2.5)+0.8*exp(-r2*0.25));
emitSing+=vec3(0.62,0.55,1.0)*uPin.z*4.0*exp(-abs(d.y)/(sc*0.06))*exp(-abs(d.x)/(sc*9.0));
}
oEmit=vec4(emitSing+emitOrb,bgT);
oLens=vec4(off/vec2(uAspect,1.0),disp,front);
}`,nt=Z+Ie+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uNormals;uniform sampler2D uHand;
uniform sampler2D uFxA;uniform sampler2D uFxB;uniform sampler2D uClean;uniform sampler2D uEnv;
uniform sampler2D uParts;uniform sampler2D uPlate;uniform sampler2D uPlateL;uniform sampler2D uMask;uniform sampler2D uHole;
uniform float uAspect;uniform float uFxOn;uniform float uHandOn;uniform float uPartsOn;uniform float uDebugMatte;
uniform vec2 uRes;uniform float uHandRef;uniform float uDbgBits;
uniform vec4 uSingA;uniform vec4 uSingB;uniform vec4 uDiskP;uniform vec2 uDiskAx;
uniform vec4 uLightP[4];uniform vec4 uLightC[4];
uniform vec4 uGrade;
uniform vec4 uBeamA;
uniform vec4 uBeamB;
uniform vec4 uBeamC;
uniform vec4 uOrbA[2];uniform vec4 uOrbB[2];
const float SHADOW=2.598;
const float BMAX=13.0;
vec2 mirrorUv(vec2 uv){return 1.0-abs(1.0-mod(uv,2.0));}
vec3 room(vec2 uv){
vec2 c=clamp(uv,0.0,1.0);
vec3 a=texture(uBase,c).rgb;
float o=length((uv-c)*vec2(uAspect,1.0));
if(o<=0.0)return a;
return mix(a,texture(uEnv,mirrorUv(uv)).rgb*0.75,smoothstep(0.0,0.05,o));
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
acc+=lc.rgb*nl/(1.0+d2/(lc.w*lc.w));
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
vec3 grade(vec3 c,float k){return mix(c,vec3(luma(c))*vec3(0.94,0.97,1.06),uGrade.x*k)*(1.0-uGrade.y*k);}
void main(){
vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
vec4 E=vec4(0.0,0.0,0.0,1.0),Lz=vec4(0.0);
if(uFxOn>0.5){E=texture(uFxA,vUv);Lz=texture(uFxB,vUv);}
vec2 offUv=Lz.xy;float disp=Lz.z;float front=clamp(Lz.w,0.0,1.0);float bgT=E.a;vec3 emit=E.rgb;
vec2 bd=min(vUv,1.0-vUv)*vec2(uAspect,1.0);
offUv*=smoothstep(0.0,0.07,min(bd.x,bd.y));
vec4 hm=vec4(0.0);
if(uHandOn>0.5){
vec2 mt=0.75/vec2(textureSize(uHand,0));
hm=texture(uHand,vUv)*0.4+(texture(uHand,vUv+vec2(mt.x,mt.y*0.4))+texture(uHand,vUv-vec2(mt.x,mt.y*0.4))
+texture(uHand,vUv+vec2(-mt.x*0.4,mt.y))+texture(uHand,vUv+vec2(mt.x*0.4,-mt.y)))*0.15;
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
float singW=0.0,handDark=1.0;
if(uSingA.w>0.0005){
vec2 q=p-uSingA.xy;float rs=max(uSingA.z,1e-5);vec2 b=q/rs;float bl=length(b);
handDark=1.0-0.45*uSingA.w*exp(-bl*bl/260.0);
float pxRs=1.0/(uRes.y*rs);
bgT*=smoothstep(SHADOW-pxRs,SHADOW+pxRs*1.5,bl);
float pr=(bl-SHADOW-0.035)/max(0.04,pxRs*1.1);
if(abs(pr)<6.0){
float side=0.5-0.5*dot(b/max(bl,1e-5),uDiskAx);
vec3 rc=mix(vec3(1.0,0.45,0.35),vec3(0.55,0.7,1.0),side);
emit+=rc*exp(-pr*pr)*(0.25+1.35*side*side)*uDiskP.w*0.45*uSingA.w;
}
singW=smoothstep(BMAX*3.0,BMAX*0.8,bl);
}
vec2 suv=vUv+offUv;
vec3 bg;
if(disp>0.0008){
bg=vec3(room(vUv+offUv*(1.0+disp)).r,room(suv).g,room(vUv+offUv*(1.0-disp)).b);
}else bg=room(suv);
float roomW=0.0;
if(uHandOn>0.5){
vec2 cs=clamp(suv,0.0,1.0);
vec4 hc=texture(uHand,cs);
vec2 mt2=2.5/vec2(textureSize(uHand,0));
float ev=max(hc.r,hc.b);
ev=max(ev,0.85*max(max(texture(uHand,cs+vec2(mt2.x,0.0)).r,texture(uHand,cs-vec2(mt2.x,0.0)).r),
max(texture(uHand,cs+vec2(0.0,mt2.y)).r,texture(uHand,cs-vec2(0.0,mt2.y)).r)));
float hs=max(smoothstep(0.02,0.25,max(hc.r,hc.b*1.6)),smoothstep(0.45,0.36,hc.g));
float ofsPx=length(offUv)*uRes.y;
float onHand=smoothstep(0.06,0.35,ev);
float ofsPalm=length(offUv*vec2(uAspect,1.0))/max(uHandRef,0.06);
float hw=1.0-sqrt(clamp(texture(uHole,cs).a,0.0,1.0));
float rep=max(hs*onHand,hw*smoothstep(0.1,0.25,ofsPalm))*smoothstep(0.5,1.5,ofsPx);
if(mod(uDbgBits,2.0)>0.5)rep=0.0;
if(rep>0.001)bg=mix(bg,texture(uClean,cs).rgb,rep);
roomW=smoothstep(0.47,0.37,hc.g)*(1.0-smoothstep(0.1,0.7,hc.r));
}
if(uSingA.w>0.0005){
vec2 q=p-uSingA.xy;float rs=max(uSingA.z,1e-5);vec2 b=q/rs;float bl=length(b);
float wB=smoothstep(SHADOW*1.62,SHADOW*1.18,bl);
if(wB>0.001){
vec2 bn=b/max(bl,1e-5);
float bb=max(bl,SHADOW*1.0005);
float al=max(2.0/bb+2.945/(bb*bb),-log(bb/SHADOW-1.0)-0.4002);
float f=al<1.0?tan(al):1.5574+(al-1.0)*3.43;
vec2 huv=(uSingA.xy+(b-bn*f*uSingB.x)*rs)/vec2(uAspect,1.0)+0.5;
vec3 bandC=mix(texture(uEnv,mirrorUv(huv)).rgb,room(huv),0.3*smoothstep(SHADOW*1.25,SHADOW*1.6,bl));
bg=mix(bg,bandC,wB);
}
}
bg=grade(bg,1.0);
vec2 sp=p+offUv*vec2(uAspect,1.0);
float amb=1.0;
for(int i=0;i<2;i++){
vec4 A=uOrbA[i];
if(A.w<0.002)continue;
float so=length(p-A.xy)/max(A.z,1e-4);
amb*=1.0-(uOrbB[i].x<0.5?0.3:0.8)*min(A.w,1.0)*exp(-max(so-1.0,0.0)*1.15);
}
if(mod(floor(uDbgBits/2.0),2.0)>0.5)amb=1.0;
if(mod(floor(uDbgBits/4.0),2.0)>0.5)roomW=0.0;
vec3 col=relight(bg,clamp(suv,0.0,1.0),sp,0.0,amb,roomW)*bgT;
float hf=0.0,occF=0.0;vec3 handCol=vec3(0.0);
if(uHandOn>0.5&&uDebugMatte<1.5){
hf=smoothstep(0.06,0.78,hm.r)*(1.0-front);
occF=hm.a;
if(max(hf,occF)>0.002){
handCol=relight(grade(texture(uBase,vUv).rgb,0.6),vUv,p,smoothstep(0.1,0.6,hm.r),amb,0.0)*handDark;
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
}`,H0=`
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
`,lt=Z+Ie+H0+`
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
C.rgb=vec3(0.55+0.45*hash11(id*1.37),0.6+1.4*hash11(id*0.77+3.0),-1.0);
if(hid>0.5||sd>(uEvent2.y>0.5?0.06:0.11))C.w=0.0;
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
float ph=TAU*h2;float hgt=k>0.5?(h3-0.5)*0.22:(h3-0.5)*r*0.7;
vec3 st=vec3(r,ph,hgt);
A=vec4(st,0.0);B=vec4(0.0,0.0,0.0,8.0+k);C=vec4(vec3(0.85,0.7,1.0),99.0);
}
}else{B.w=16.0;}
}
vA=A;vB=B;vC=C;
gl_Position=vec4(0.0);
}`,it=Z+"out vec4 outColor;void main(){outColor=vec4(0.0);}",rt=Z+Ie+H0+`
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
if(kind>0.5){alpha=0.8*fade*(1.0-heat);col=aC.rgb*alpha/1.6+vec3(0.15,0.45,1.0)*heat*2.0*fade;}
else col=aC.rgb*(0.25+hv*hv*hv*2.5)*(1.0+heat*3.0)*fade;
}else if(owner==1.0){
float t=1.0-clamp(aA.w/max(aC.w,1e-3),0.0,1.0);
P=aA.xy;P0=P-aB.xy*uShutter;
size=uRed.z*0.009*(0.4+t)+px*0.3;
float hv=hash11(float(gl_InstanceID)+0.3);
col=blackbody(0.12+0.36*t*aC.r)*(0.35+(1.0+5.0*hv*hv*hv)*t*t*t)*smoothstep(0.0,0.06,aA.w)*t;
}else if(owner==2.0){
float hid,dep;P=singScreen(aA.xyz,hid,dep);
float hid0,dep0;float sh=uShutter*(kind>0.5?0.7:4.0)/(1.0+uSing.z*30.0);vec3 st0=vec3(aA.x+singVin(aA.x,kind)*sh,aA.y+singOm(aA.x)*sh,aA.z*exp(sh*1.3));
P0=singScreen(st0,hid0,dep0);
if(dep*dep0<0.0||hid0!=hid)P0=P;
float r=aA.x;
float heat=smoothstep(8.0,3.0,r);
vec3 vo=uDisk*vec3(sin(aA.y),0.0,-cos(aA.y));
float beta=clamp(sqrt(0.5/max(r-1.0,0.35)),0.0,0.8);
float g=sqrt(1.0-beta*beta)/(1.0-beta*vo.z);
float k=smoothstep(0.55,1.35,g);
vec3 hue=k<0.5?mix(vec3(1.0,0.2,0.08),vec3(0.62,0.26,1.0),k*2.0):mix(vec3(0.62,0.26,1.0),vec3(0.25,0.6,1.0),k*2.0-1.0);
float hv=hash11(float(gl_InstanceID)+0.5);
float vis=fadeIn*uSing.w*(1.0-hid)*smoothstep(2.25,2.9,r);
if(kind>0.5){size=uSing.z*0.02*(0.6+0.8*hv);col=hue*(0.15+2.4*hv*hv*hv*hv*hv)*g*g*vis*(0.45+heat);}
else{size=uSing.z*0.028*(0.7+0.6*hv);float inS=step(length(P-uSing.xy),2.75*uSing.z);col=mix(vec3(0.75,0.65,1.0),hue,heat)*(0.35+2.5*heat)*g*vis*smoothstep(0.0,2.5,16.0-r)*smoothstep(3.0,4.5,r)*(1.0-inS)*smoothstep(0.0,0.3,aA.w);}
}else if(owner==3.0){
float t=1.0-clamp(aA.w/max(aC.w,1e-3),0.0,1.0);
P=aA.xy;P0=P-aB.xy*uShutter;
size=px*(0.9+1.2*t);
col=aC.rgb*t*t*1.3;
if(kind>1.5){P0=P-aB.xy*uShutter*0.5;col=aC.rgb*t*0.9;}
else if(aC.b<-0.5){
float temp=(0.12+0.36*t*t)*(0.75+0.25*aC.r);
col=blackbody(temp)*(0.3+6.5*t*t*t)*aC.g*smoothstep(0.0,0.04,aA.w);
size=px*(1.0+1.8*t);
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
}`,ct=Z+`
in vec2 vQ;in float vHalf;in vec3 vCol;in float vAlpha;out vec4 outColor;
void main(){
float ax=max(abs(vQ.x)-vHalf,0.0);
float d2=ax*ax+vQ.y*vQ.y;
float f=exp(-d2*2.4);
outColor=vec4(vCol*f,vAlpha*f);
}`;function ut(k){const d=k.kit,i=k.gl,M=typeof location<"u"?new URLSearchParams(location.search):new URLSearchParams,L0=Number(M.get("demoOffset"))||0,U0=M.has("sgNoParticles"),q0=M.has("sgForce"),f0=M.has("sgLaunchAt")?Number(M.get("sgLaunchAt")):-1,u0=(Number(M.get("sgLaunchDir"))||25)*Math.PI/180,m0=M.has("sgImplodeAt")?Number(M.get("sgImplodeAt")):-1,K={noLight:M.has("sgNoLight"),noBridge:M.has("sgNoBridge"),prof:null,view:M.get("sgView"),matteMode:M.has("sgMatte")?1:M.has("sgNoHands")?2:M.has("sgCutDbg")?3:0},Ve=["matte","fill","fx","sim","draw","final"],ve=M.has("sgProfile")?i.getExtension("EXT_disjoint_timer_query_webgl2"):null;let h0=0,ue=null,Fe=[];ve&&(K.prof=Object.fromEntries(Ve.map(o=>[o,[]])));function de(o){!ve||ue||Ve[h0%Ve.length]!==o||(ue={q:i.createQuery(),name:o},i.beginQuery(ve.TIME_ELAPSED_EXT,ue.q))}function xe(o){!ue||ue.name!==o||(i.endQuery(ve.TIME_ELAPSED_EXT),Fe.push(ue),ue=null)}function _0(){if(ve){h0++;for(let o=Fe.length-1;o>=0;o--){const u=Fe[o];if(i.getQueryParameter(u.q,i.QUERY_RESULT_AVAILABLE)){if(!i.getParameter(ve.GPU_DISJOINT_EXT)){const s=K.prof[u.name];s.push(i.getQueryParameter(u.q,i.QUERY_RESULT)/1e6),s.length>400&&s.shift()}i.deleteQuery(u.q),Fe.splice(o,1)}}}}const p0=M.has("sgNoFill"),v0=M.has("sgSlow")?z(Number(M.get("sgSlow"))||1,.02,1):1,me=M.has("sgDebug")?[]:null,be=o=>{me&&(me.push(`${t.time.toFixed(2)} ${o}`),me.length>200&&me.shift())},We=d.program(st,{label:"singularity fx"}),Ke=d.program(nt,{label:"singularity final"}),$e=d.program(et,{label:"singularity hand matte"}),d0=d.program(tt,{label:"singularity fill prep"}),x0=d.program(ot,{label:"singularity fill push"}),je=d.program(at,{label:"singularity fill pull"}),Xe=d.program(it,{vs:lt,feedback:["vA","vB","vC"],label:"singularity sim"}),Qe=d.program(ct,{vs:rt,label:"singularity particles"}),$=d.target(4,4,{format:"rgba8"}),he=d.target(4,4,{format:"hdr"}),R=[],_=[];let Me=0,ze=0,Re=!1;function b0(o,u){if(o===Me&&u===ze&&R.length)return;Me=o,ze=u,Re=!1;let s=o,r=u,n=0;for(;n<9&&(R[n]?(R[n].resize(s,r),_[n].resize(s,r)):(R[n]=d.target(s,r,{format:"hdr"}),_[n]=d.target(s,r,{format:"hdr"})),n++,!(s<=8||r<=8));)s=Math.max(2,Math.ceil(s/2)),r=Math.max(2,Math.ceil(r/2));for(;R.length>n;)R.pop().dispose(),_.pop().dispose()}const Ce={uSrc:null,uTexel:new Float32Array(2)},ae={uFine:null,uCoarse:null,uLast:0},De={uBase:null,uHand:$,uMask:null,uHoleOn:0};function g0(o,u){const s=R.length,r=Math.min(3,s-1);De.uBase=o.base,De.uMask=o.mask||o.base,De.uHoleOn=u?1:0,d.pass(d0,R[0],De);const n=u?s:r+1;for(let m=1;m<n;m++){const h=R[m-1];Ce.uSrc=h,Ce.uTexel[0]=1/h.width,Ce.uTexel[1]=1/h.height,d.pass(x0,R[m],Ce)}if(!u)return R[r];ae.uFine=R[s-1],ae.uCoarse=R[s-1],ae.uLast=1,d.pass(je,_[s-1],ae),ae.uLast=0;for(let m=s-2;m>=0;m--)ae.uFine=R[m],ae.uCoarse=_[m+1],d.pass(je,_[m],ae);return _[r]}const G=d.target(4,4,{format:"hdr"}),se=d.target(4,4,{format:"hdr"}),Ye=i.createFramebuffer();let w0=null,y0=null;const Ge={bind(){return i.bindFramebuffer(i.FRAMEBUFFER,Ye),i.viewport(0,0,G.width,G.height),Ge}};function A0(o,u){G.resize(o,u),se.resize(o,u),!(w0===G.tex&&y0===se.tex)&&(w0=G.tex,y0=se.tex,i.bindFramebuffer(i.FRAMEBUFFER,Ye),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,G.tex,0),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT1,i.TEXTURE_2D,se.tex,0),i.drawBuffers([i.COLOR_ATTACHMENT0,i.COLOR_ATTACHMENT1]),i.bindFramebuffer(i.FRAMEBUFFER,null))}const Ze=new Float32Array(i0*Ne);for(let o=0;o<i0;o++)Ze[o*Ne+3]=1e3,Ze[o*Ne+7]=16;const Pe=[i.createBuffer(),i.createBuffer()],Te=[],Oe=[],Ee=[];for(let o=0;o<2;o++)i.bindBuffer(i.ARRAY_BUFFER,Pe[o]),i.bufferData(i.ARRAY_BUFFER,Ze,i.DYNAMIC_COPY);for(let o=0;o<2;o++){for(const[s,r]of[[Te,0],[Oe,1]]){const n=i.createVertexArray();i.bindVertexArray(n),i.bindBuffer(i.ARRAY_BUFFER,Pe[o]);for(let m=0;m<3;m++)i.enableVertexAttribArray(m),i.vertexAttribPointer(m,4,i.FLOAT,!1,Ne*4,m*16),i.vertexAttribDivisor(m,r);s.push(n)}const u=i.createTransformFeedback();i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,u),i.bindBufferBase(i.TRANSFORM_FEEDBACK_BUFFER,0,Pe[o]),Ee.push(u)}i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,null),i.bindBuffer(i.TRANSFORM_FEEDBACK_BUFFER,null),i.bindVertexArray(null),i.bindBuffer(i.ARRAY_BUFFER,null);let ke=0;const e={orbA:new Float32Array(8),orbB:new Float32Array(8),singA:new Float32Array(4),singB:new Float32Array(4),diskP:new Float32Array(4),disk:new Float32Array(9),shockA:new Float32Array(4),shockB:new Float32Array(4),bridge:new Float32Array(4),bridgeAB:new Float32Array(4),lightP:new Float32Array(16),lightC:new Float32Array(16),grade:new Float32Array(4),blue:new Float32Array(4),red:new Float32Array(4),sing:new Float32Array(4),lens:new Float32Array(4),spawn:new Float32Array(4),caps:new Float32Array(4),event:new Float32Array(4),event2:new Float32Array(4),relC:new Float32Array(4),relD:new Float32Array(4),velB:new Float32Array(4),bones:new Float32Array(N*2*4),handSize:new Float32Array(2),palm:new Float32Array(4),curl:new Float32Array(12),reach:new Float32Array(2),sweep:new Float32Array(4),uncert:new Float32Array(2),fresh:new Float32Array(2),res:new Float32Array(2),fxRes:new Float32Array(2),pRes:new Float32Array(2),diskAx:new Float32Array(2),beamA:new Float32Array(4),beamB:new Float32Array(4),beamC:new Float32Array(4),pin:new Float32Array(4)},Be={uMask:null,uAspect:1,uTime:0,uFrame:0,uMobile:0,uRes:e.fxRes,uOrbA:e.orbA,uOrbB:e.orbB,uSingA:e.singA,uSingB:e.singB,uDiskP:e.diskP,uDisk:e.disk,uShockA:e.shockA,uShockB:e.shockB,uBridge:e.bridge,uBridgeAB:e.bridgeAB,uHand:$,uHandOn:0,uPin:e.pin},Je={uBase:null,uNormals:null,uHand:$,uFxA:G,uFxB:se,uClean:null,uEnv:null,uParts:he,uPlate:null,uPlateL:null,uMask:null,uHole:null,uAspect:1,uFxOn:0,uHandOn:0,uPartsOn:0,uDebugMatte:0,uRes:e.res,uHandRef:.2,uDbgBits:0,uSingA:e.singA,uSingB:e.singB,uDiskP:e.diskP,uDiskAx:e.diskAx,uLightP:e.lightP,uLightC:e.lightC,uGrade:e.grade,uBeamA:e.beamA,uBeamB:e.beamB,uBeamC:e.beamC,uOrbA:e.orbA,uOrbB:e.orbB},j={uMDbg:0,uMask:null,uBase:null,uBg:null,uBgOk:0,uAspect:1,uHandSize:e.handSize,uBones:e.bones,uPalm:e.palm,uCurl:e.curl,uReach:e.reach,uSweep:e.sweep,uUncert:e.uncert,uFresh:e.fresh},k0={uTime:0,uDt:0,uAspect:1,uCount:0,uSpawn:e.spawn,uCaps:e.caps,uEvent:e.event,uEvent2:e.event2,uRelC:e.relC,uRelD:e.relD,uVelB:e.velB,uBlue:e.blue,uRed:e.red,uSing:e.sing,uLens:e.lens,uDisk:e.disk},B0={uAspect:1,uRes:e.pRes,uShutter:1/45,uGain:1,uVelB:e.velB,uFloor:-10,uBlue:e.blue,uRed:e.red,uSing:e.sing,uLens:e.lens,uDisk:e.disk},e0=o=>({id:o,active:!1,charge:0,vis:0,pol:o,x:0,y:0,vx:0,vy:0,R:.05,size:.14,open:0,seed:1.3+o*4.7,flare:0,absorb:0,ax:0,ay:0,lost:0,dissipating:!1,chimeArmed:!0}),t={time:0,clock:0,orbs:[e0(0),e0(1)],anticip:0,fuse:0,cooldown:0,sing:{phase:"none",t:0,age:0,presence:0,x:0,y:0,rs:.014,rsT:.014,ang:0,sep:.3,sepVel:0,growth:0,flare:0,implode:0,lostT:0,size:.14,twoT:0,fast:null,oneSided:!1},shock:{on:!1,t:0,x:0,y:0,strength:0,mode:"out",scale:1},beam:{on:!1,t:0,x:0,y:0,dx:1,dy:0,w:.05,strength:1,seed:0},flash:0,shake:0,aberr:0,energy:0,liveAt:-10,ev:{release:0,blueDiss:0,redDiss:0,birth:0,kill:1,collapse:0,launch:0},relC:[0,0,1],relD:[0,0],shakePhase:0,srcVersion:-1,blocked:[!1,!1],byId:[null,null],matH:[null,null],ghost:[S0(),S0()],prevSize:[0,0],grow:[0,0],openT:[0,0],pin:0,pinX:0,pinY:0,pinS:.02};function S0(){return{points:new Float32Array(63),palm:[0,0],size:0,curls:[0,0,0,0,0],velocity:[0,0],speed:0,lost:0,seenAt:-10,lost0:0,valid:!1}}function I0(o,u,s){o.points.set(u.points),o.palm[0]=u.palm[0],o.palm[1]=u.palm[1],o.size=u.size;for(let r=0;r<5;r++)o.curls[r]=u.curls[r];o.velocity[0]=u.velocity[0],o.velocity[1]=u.velocity[1],o.speed=u.speed,o.lost0=u.lost||0,o.seenAt=s,o.valid=!0}const N0=.8,ge=[],ne={hum:{level:0,pitch:1},noise:{level:0,tone:.5},crackle:{level:0}},we=[0,0],ye=[0,0];function F0(){const o=k.source?.element;return!!o&&typeof HTMLImageElement<"u"&&o instanceof HTMLImageElement}function V0(){return k.state.width/Math.max(1,k.state.height)}function M0(o,u,s){const r=o.points,n=(r[27]-r[0])*u,m=r[28]-r[1],h=Math.hypot(n,m)||1;return s[0]=n/h,s[1]=m/h,s}function z0(o,u,s,r){if(!o||!u||!(o.open>.45||o.gesture==="open"))return!1;const n=u[0]*r,m=u[1],h=Math.hypot(n,m);if(h<.001||m<-.6*h)return!1;const c=s.person,S=c&&c.present?(c.center[0]-.5)*r:t.sing.x,p=c&&c.present?c.center[1]-.5:t.sing.y,C=(o.palm[0]-.5)*r-S,P=o.palm[1]-.5-p;return n*C+m*P>-.15*h*Math.hypot(C,P)}function He(o,u){let s=null;for(const r of t.orbs)r.pol===o&&(!u||r.active)&&(!s||r.vis>s.vis)&&(s=r);return s}function U(o,u){const s=k.audio;s&&s[o]&&s[o](u)}function R0(o,u){be("birth");const s=t.sing;s.phase="alive",s.t=0,s.age=0,s.presence=0,s.growth=0,s.implode=0,s.lostT=0,s.flare=1.2,s.x=(o.x+u.x)/2,s.y=(o.y+u.y)/2,s.sep=Math.hypot(u.x-o.x,u.y-o.y),s.sepVel=0,s.twoT=0,s.ang=Math.atan2(u.y-o.y,u.x-o.x),s.size=(o.size+u.size)/2;for(const r of t.orbs)r.absorb=1,r.ax=r.x,r.ay=r.y;t.ev.birth=1,t.relC[0]=s.x,t.relC[1]=s.y,t.relC[2]=1,t.fuse=0,Object.assign(t.shock,{on:!0,t:0,x:s.x,y:s.y,strength:1,mode:"in",scale:s.sep*1.4}),t.flash=Math.max(t.flash,.55),t.shake=Math.max(t.shake,.35),t.aberr=Math.max(t.aberr,.5),U("impact",{strength:.9,pitch:.8}),U("chime",{strength:.55,pitch:.5}),U("whoosh",{strength:.7,duration:.5,up:!1})}function Le(o=1,u=null,s=""){const r=t.sing;be(`release ${o.toFixed(2)} sepVel=${r.sepVel.toFixed(2)}${u?" launch":""} ${s}`),r.phase="released",r.t=0,t.ev.release=1,t.relC[0]=r.x,t.relC[1]=r.y,t.relC[2]=o,t.flash=1,t.shake=1,t.aberr=1,t.cooldown=1.3,u?(t.ev.launch=1,t.relD[0]=u[0],t.relD[1]=u[1],Object.assign(t.beam,{on:!0,t:0,x:r.x,y:r.y,dx:u[0],dy:u[1],w:Math.max(.03,r.rs*1.7*Math.min(1,r.presence)),strength:o,seed:t.time*7.13%50}),Object.assign(t.shock,{on:!0,t:0,x:r.x,y:r.y,strength:o*.6,mode:"out",scale:.7}),U("impact",{strength:1.5*o,pitch:.45}),U("whoosh",{strength:1.3,duration:.7,up:!0}),U("zap",{strength:.9})):(Object.assign(t.shock,{on:!0,t:0,x:r.x,y:r.y,strength:o,mode:"out",scale:1}),U("impact",{strength:1.4*o,pitch:.55}),U("whoosh",{strength:1.1,duration:1.1,up:!0}),U("zap",{strength:.6}))}function t0(o=!1){be(`implode quiet=${o}`);const u=t.sing;u.phase==="alive"&&(u.phase=o?"collapsing":"imploding",u.t=0,t.cooldown=1,o||U("whoosh",{strength:.8,duration:.35,up:!1}))}function C0(){for(const o of t.orbs)Object.assign(o,e0(o.id));t.anticip=0,t.fuse=0,t.cooldown=0,Object.assign(t.sing,{phase:"none",t:0,age:0,presence:0,growth:0,flare:0,implode:0,lostT:0,sepVel:0,twoT:0}),t.shock.on=!1,t.beam.on=!1,t.flash=0,t.shake=0,t.aberr=0,t.energy=0,t.pin=0,t.prevSize[0]=t.prevSize[1]=0,t.grow[0]=t.grow[1]=0,t.openT[0]=t.openT[1]=0,t.ev.release=t.ev.blueDiss=t.ev.redDiss=t.ev.birth=t.ev.collapse=t.ev.launch=0,t.ev.kill=1,t.ghost[0].valid=t.ghost[1].valid=!1,t.matH[0]=t.matH[1]=null}function W0(o){const u=z(o.dt||.016666666666666666,.004166666666666667,.25)*v0,s=Math.min(u,.05);t.time+=s,t.clock=(t.clock+s)%G0;const r=V0(),n=t.sing,m=F0(),h=k.source?.version??0;h!==t.srcVersion&&(t.srcVersion!==-1&&(be(`source ${t.srcVersion}->${h}: reset`),C0(),t.blocked[0]=t.blocked[1]=!0),t.srcVersion=h),t.cooldown=Math.max(0,t.cooldown-s);const c=t.byId;c[0]=c[1]=null;let S=0;for(const a of o.hands||c0)if(!(a.id!==0&&a.id!==1)){if(t.blocked[a.id])if(a.lost===0)t.blocked[a.id]=!1;else continue;a.lost>1||(c[a.id]=a,S++)}const p=c[0]||c[1],C=c[0]&&c[1]?c[1]:null;for(let a=0;a<2;a++){const f=t.ghost[a];if(c[a]){I0(f,c[a],t.time),t.matH[a]=c[a];continue}const b=t.time-f.seenAt;f.valid&&b<N0&&!m?(f.lost=f.lost0+b,t.matH[a]=f):(f.valid=!1,t.matH[a]=null)}for(let a=0;a<2;a++){const f=c[a];if(!f){t.prevSize[a]=0,t.grow[a]=0,t.openT[a]=0;continue}t.openT[a]=f.open>.7&&f.facing>.3?t.openT[a]+s:0,t.prevSize[a]>0&&(t.grow[a]=X(t.grow[a],(f.size-t.prevSize[a])/Math.max(f.size,.001)/u,12,s)),t.prevSize[a]=f.size}if(c[0]&&c[1]){const a=c[0].palm[0],f=c[1].palm[0],b=t.orbs[0],B=t.orbs[1];if(b.pol===B.pol){const Q=a<=f?0:1;b.pol=Q,B.pol=1-Q}else(b.pol===0?a>f+.07:f>a+.07)&&b.charge<.35&&B.charge<.35&&(b.pol=1-b.pol,B.pol=1-B.pol)}else for(const a of t.orbs){const f=c[a.id];!f||a.charge>.08||(a.pol=f.side==="left"?0:1)}const P=n.phase!=="none";for(const a of t.orbs){const f=c[a.id],b=a.charge;if(f){a.active=!0,a.lost=0,M0(f,r,we),a.vx=f.velocity[0]*r,a.vy=f.velocity[1];const A=m?.1:.68;a.x=(f.palm[0]-.5)*r+we[0]*A*f.size,a.y=f.palm[1]-.5+we[1]*A*f.size,a.size=f.size,a.open=f.open;const T=(f.gesture==="open"||f.open>.6)&&!f.pinching,x=f.gesture==="fist"||f.fist>.45||f.open<.2;P||a.absorb>0?a.charge=Math.max(0,a.charge-s*4):t.cooldown>0?a.charge=Math.max(0,a.charge-s*2):T?a.charge=Math.min(1,a.charge+s/.85*(.55+.45*f.open)):x?(a.charge>.3&&!a.dissipating&&(a.dissipating=!0,be(`dissipate ${a.id} pol${a.pol} g=${f.gesture} open=${f.open.toFixed(2)} fist=${f.fist.toFixed(2)}`),a.pol===0?t.ev.blueDiss=1:t.ev.redDiss=1,U("whoosh",{strength:.35,duration:.35,up:!1})),a.charge=Math.max(0,a.charge-s*3.2),a.charge<.3&&(a.charge=Math.max(0,a.charge-s*6))):a.charge=Math.max(0,a.charge-s*.35),(!x||a.charge<=0)&&(a.dissipating=!1)}else a.active=!1,a.lost+=s,a.x+=a.vx*s,a.y+=a.vy*s,a.vx*=Math.exp(-s*6),a.vy*=Math.exp(-s*6),a.charge=Math.max(0,a.charge-s*(a.lost>.25?2.2:.4));if(a.absorb>0){a.absorb=Math.max(0,a.absorb-s/.32);const A=1-a.absorb;a.ax=W(a.ax,n.x,A*A),a.ay=W(a.ay,n.y,A*A)}b<.05&&a.charge>=.05&&!P&&U("whoosh",{strength:.3,duration:.7,up:!0}),a.chimeArmed&&a.charge>=.97?(a.chimeArmed=!1,U("chime",{strength:.22,pitch:a.pol===0?1.5:.9})):a.charge<.6&&(a.chimeArmed=!0);const B=L(0,1,a.charge);a.R=m?a.size*(.1+.46*B)*(.8+.2*a.open):a.size*(.08+.28*B)*(.85+.15*a.open);const Q=a.absorb>0?a.absorb:L(.02,.45,a.charge);a.vis=X(a.vis,Q,18,s),a.flare=X(a.flare,0,5,s)}if(q0&&p&&n.phase==="none"&&t.cooldown<=0&&t.time>1.2){const a=(p.palm[0]-.5)*r,f=p.palm[1]-.5,b=t.orbs[0],B=t.orbs[1];b.x=a-p.size*1.3,b.y=f,B.x=a+p.size*1.3,B.y=f,b.size=B.size=p.size,R0(b,B)}const y=He(0,!0),g=He(1,!0);let V=0;if(y&&g&&!P&&t.cooldown<=0){const a=Math.hypot(g.x-y.x,g.y-y.y),f=(y.size+g.size)/2,b=Math.min(y.charge,g.charge);V=L(3.5*f,2*f,a)*L(.35,.8,b),a<2*f&&b>.7?t.fuse+=s/.42:t.fuse=Math.max(0,t.fuse-s*2),t.fuse>=1&&R0(y,g)}else t.fuse=Math.max(0,t.fuse-s*3);if(t.anticip=X(t.anticip,V,6,s),n.phase!=="none"){if(n.t+=s,n.age+=s,n.phase==="alive"){let a=n.x,f=n.y;if(C){const x=p.palm[0]<=C.palm[0]?p:C,O=x===p?C:p,J=(x.palm[0]-.5)*r,le=x.palm[1]-.5,Y=(O.palm[0]-.5)*r,ie=O.palm[1]-.5;a=(J+Y)/2,f=(le+ie)/2;const Se=Math.hypot(Y-J,ie-le);Math.abs(Se-n.sep)>Math.max(.2,9*u)&&(n.twoT=0),n.sepVel=n.twoT>.15?X(n.sepVel,(Se-n.sep)/u,14,s):0,n.sep=Se,n.size=(x.size+O.size)/2;let te=Math.atan2(ie-le,Y-J)-n.ang;for(;te>Math.PI;)te-=2*Math.PI;for(;te<-Math.PI;)te+=2*Math.PI;n.ang+=te*(1-Math.exp(-s*20)),n.lostT=0,n.twoT+=s,n.fast=x.speed>O.speed?x:O,n.oneSided=Math.max(x.speed,O.speed)>1.6&&Math.max(x.speed,O.speed)>2.4*Math.min(x.speed,O.speed)}else p?(M0(p,r,we),a=(p.palm[0]-.5)*r+we[0]*p.size*.9,f=p.palm[1]-.5+we[1]*p.size*.9,n.sep=X(n.sep,p.size*1.9,2,s),n.sepVel=0,n.lostT=0,n.twoT=0,n.oneSided=!1):(n.lostT+=s,n.twoT=0,n.sepVel=X(n.sepVel,0,10,s),n.oneSided=!1);const b=n.twoT>.12;n.x=b?a:X(n.x,a,16,s),n.y=b?f:X(n.y,f,16,s),n.growth=Math.min(1,n.growth+s/.75);const B=n.growth,Q=1+2.2*(B-1)**3+1.2*(B-1)**2;n.rsT=z(n.sep*.07,.009,.046),n.rs=X(n.rs,n.rsT,14,s),n.presence=z(Q,0,1.15),n.flare=X(n.flare,0,2.5,s);let A=null,T=!1;for(const x of o.events||c0)if(!(x.hand&&c[x.hand.id]!==x.hand)&&(x.type==="throw"&&n.age>.75&&z0(x.hand,x.direction,o,r)&&(A=x),x.type==="pinchstart"&&n.age>.35)){t0(!1);break}for(let x=0;x<2;x++){const O=c[x];O&&n.age>.75&&t.grow[x]>2.8&&t.openT[x]>.35&&O.speed<1.2&&(T=!0)}if(n.phase==="alive"&&f0>=0&&n.age>=f0?(ye[0]=Math.cos(u0),ye[1]=Math.sin(u0),Le(z(.9+n.rs*12,.9,1.45),ye,"debug")):n.phase==="alive"&&m0>=0&&n.age>=m0&&t0(!1),n.phase==="alive"){const x=n.age>.9&&n.sepVel>1.25&&n.oneSided&&z0(n.fast,n.fast.velocity,o,r)?n.fast:null;if(A||x){const O=A?A.direction:x.velocity,J=(O?.[0]??0)*r,le=O?.[1]??0,Y=Math.hypot(J,le);ye[0]=J/(Y||1),ye[1]=le/(Y||1),Le(z(.9+n.rs*12,.9,1.45),Y>.001?ye:null,A?"throw":"fling")}else n.age>.9&&n.sepVel>1.25?Le(z(.8+n.rs*12,.8,1.4),null,"rip"):T?Le(z(.9+n.rs*12,.9,1.45),null,`push ${t.grow[0].toFixed(1)},${t.grow[1].toFixed(1)}`):n.lostT>.9&&t0(!0)}}else if(n.phase==="released")n.presence=Math.max(0,1-n.t/.16)*(1+n.t*6),n.flare=3*Math.max(0,1-n.t/.16),n.t>.2&&(n.phase="none",n.presence=0);else if(n.phase==="imploding"||n.phase==="collapsing"){const a=n.phase==="imploding"?.38:.7,f=z(n.t/a,0,1);n.implode=f,n.presence=(1-f*f*f)*(n.phase==="imploding"?1+.3*Math.sin(f*Math.PI):1),f>=1&&(n.phase==="imploding"&&(t.pin=1,t.pinX=n.x,t.pinY=n.y,t.pinS=z(n.rs*1.6,.012,.06),t.flash=Math.max(t.flash,.5),t.aberr=Math.max(t.aberr,.8),t.shake=Math.max(t.shake,.45),U("impact",{strength:.75,pitch:1.6}),U("chime",{strength:.45,pitch:2}),U("zap",{strength:.5}),Object.assign(t.shock,{on:!0,t:0,x:n.x,y:n.y,strength:.85,mode:"out",scale:.62})),t.ev.collapse=1,n.phase="none",n.presence=0,n.implode=0)}}for(const a of o.events||c0){if(a.type!=="pinchstart"||n.phase!=="none")continue;const f=a.hand&&c[a.hand.id]===a.hand?t.orbs[a.hand.id]:null;f&&f.charge>.3&&(be(`pinch-implode orb ${f.id}`),f.flare=3,f.charge=0,f.pol===0?t.ev.blueDiss=1:t.ev.redDiss=1,t.flash=Math.max(t.flash,.2),U("zap",{strength:.5}),U("impact",{strength:.35,pitch:1.8}))}const F=t.shock;F.on&&(F.t+=s,(F.mode==="in"?F.t>.34:F.t>1.7)&&(F.on=!1)),t.beam.on&&(t.beam.t+=s,t.beam.t>.75&&(t.beam.on=!1)),t.flash*=Math.exp(-s*7),t.shake*=Math.exp(-s*4.5),t.aberr*=Math.exp(-s*3.5),t.pin*=Math.exp(-s*13),t.pin<.002&&(t.pin=0),t.shakePhase+=s;const D=k.audio;if(D){let a=0,f=0;for(const B of t.orbs)B.pol===0?a=Math.max(a,B.vis):f=Math.max(f,B.vis);const b=n.phase==="alive"?n.presence:0;ne.hum.level=z(.22*(a+f)+.3*t.anticip+.55*b,0,1),ne.hum.pitch=.6+.55*t.anticip+.2*b+.25*z(n.rs*20,0,1)*b,ne.noise.level=z(.1*a+.14*f+.22*b+(F.on&&F.mode==="out"?.3*Math.max(0,1-F.t):0),0,1),ne.noise.tone=z(.25+.5*f-.1*a+.15*b,0,1),ne.crackle.level=z(.32*f+.3*t.anticip,0,1),D.layer("hum",ne.hum),D.layer("noise",ne.noise),D.layer("crackle",ne.crackle)}ge.length=0;let I=!1,w=!1;for(const a of t.orbs)a.active&&a.charge>.05&&a.absorb===0&&(I=!0);(c[0]?.pinching||c[1]?.pinching)&&(w=!0),I&&ge.push("open"),S===2&&(t.anticip>.05||t.fuse>0)&&ge.push("two"),n.phase==="alive"&&ge.push("throw"),w&&ge.push("pinch")}function K0(o){const{width:u,height:s,aspect:r}=o,n=t.clock,m=t.sing,h=t.shock,c=t.beam,S=!!o.mobile,p=F0();let C=0,P=0;e.blue[3]=0,e.red[3]=0;for(let l=0;l<2;l++){const v=t.orbs[l],E=v.absorb>0?v.ax:v.x,q=v.absorb>0?v.ay:v.y,Ae=v.R*(v.absorb>0?.4+.6*v.absorb:1);e.orbA[l*4]=E,e.orbA[l*4+1]=q,e.orbA[l*4+2]=Ae,e.orbA[l*4+3]=z(v.vis,0,1.2),e.orbB[l*4]=v.pol,e.orbB[l*4+1]=v.charge,e.orbB[l*4+2]=v.seed,e.orbB[l*4+3]=v.flare;const pe=v.pol===0?e.blue:e.red,fe=v.pol===0?C:P;v.vis>=fe&&(pe[0]=E,pe[1]=q,pe[2]=Ae,pe[3]=v.vis,e.velB[v.pol*2]=v.vx,e.velB[v.pol*2+1]=v.vy,v.pol===0?C=v.vis:P=v.vis)}const y=m.phase==="none"?0:z(m.presence,0,1.6),g=m.rs*(m.phase==="released"?1+m.t*4:1)*Math.max(1e-4,y);e.singA[0]=m.x,e.singA[1]=m.y,e.singA[2]=g,e.singA[3]=y>.001?Math.min(1,y):0;const V=19*(1+2.5*m.implode*m.implode)*(m.phase==="released"?1+3*m.t:1);e.singB[0]=V,e.singB[1]=m.flare,e.singB[2]=m.growth,e.singB[3]=m.implode,e.diskP[0]=3,e.diskP[1]=9.5,e.diskP[2]=n,e.diskP[3]=3.2*(1+m.flare*2.5);const F=1.36+.05*Math.sin(t.time*.37),D=Math.cos(m.ang),I=Math.sin(m.ang),w=Math.PI/2-F,a=Math.cos(w),f=Math.sin(w);if(e.disk[0]=D,e.disk[1]=I,e.disk[2]=0,e.disk[3]=-I*a,e.disk[4]=D*a,e.disk[5]=f,e.disk[6]=I*f,e.disk[7]=-D*f,e.disk[8]=a,e.sing[0]=m.x,e.sing[1]=m.y,e.sing[2]=g,e.sing[3]=e.singA[3],e.lens[0]=V,e.lens[1]=3,e.lens[2]=9.5,h.on)if(h.mode==="out"){const l=h.t;e.shockA[0]=h.x,e.shockA[1]=h.y,e.shockA[2]=(.02+1.45*Math.pow(l,.72))*h.scale,e.shockA[3]=.9*h.strength*Math.pow(Math.max(0,1-l/1.7),1.6),e.shockB[0]=(.025+.06*l)*h.scale,e.shockB[1]=l,e.shockB[2]=2.6*h.strength*Math.max(0,1-l/.55)**2,e.shockB[3]=1}else{const l=z(h.t/.34,0,1);e.shockA[0]=h.x,e.shockA[1]=h.y,e.shockA[2]=h.scale*(1-l)*(1-l)+.005,e.shockA[3]=-.8*Math.sin(l*Math.PI),e.shockB[0]=.02+.03*(1-l),e.shockB[1]=l,e.shockB[2]=.9*Math.sin(l*Math.PI),e.shockB[3]=0}else e.shockA[3]=0,e.shockB[2]=0;let b=0;if(c.on){const l=c.t;e.beamA[0]=c.x,e.beamA[1]=c.y,e.beamA[2]=c.dx,e.beamA[3]=c.dy,e.beamB[0]=Math.min(3.2,13*l),e.beamB[1]=c.w*(1+.5*L(0,.3,l)),e.beamB[2]=L(0,.03,l)*(1-L(.1,.4,l)),e.beamB[3]=Math.exp(-l*9)*L(0,.02,l)*z(c.strength,0,1.3),e.beamC[0]=Math.exp(-l*4.5)*L(0,.02,l),e.beamC[1]=l,e.beamC[2]=c.seed,e.beamC[3]=1-L(.45,.72,l),b=e.beamB[3]}else e.beamB[2]=0,e.beamB[3]=0,e.beamC[0]=0,e.beamC[3]=0;e.pin[0]=t.pinX,e.pin[1]=t.pinY,e.pin[2]=t.pin,e.pin[3]=t.pinS;const B=He(0,!1),Q=He(1,!1);e.bridge[0]=t.anticip,e.bridge[1]=t.fuse,B&&Q?(e.bridgeAB[0]=B.x,e.bridgeAB[1]=B.y,e.bridgeAB[2]=Q.x,e.bridgeAB[3]=Q.y):e.bridge[0]=0,K.noBridge&&(e.bridge[0]=0);const A=e.lightP,T=e.lightC;for(let l=0;l<2;l++){const v=t.orbs[l],E=e.orbA[l*4],q=e.orbA[l*4+1],Ae=e.orbA[l*4+2],pe=e.orbA[l*4+3];A[l*4]=E,A[l*4+1]=q,A[l*4+2]=.54+Ae*.5,A[l*4+3]=0;const fe=pe*((v.pol===0?5.6:5.8)+2.5*v.flare)*(1+.06*Math.sin(n*23+l*2));v.pol===0?(T[l*4]=.22*fe,T[l*4+1]=.56*fe,T[l*4+2]=1.42*fe):(T[l*4]=1.35*fe,T[l*4+1]=.36*fe,T[l*4+2]=.07*fe),T[l*4+3]=pe>.001?v.pol===0?.05+Ae*1.15:.06+Ae*1.35:0}const x=t.flash*2.5+b*3+t.pin*3,O=Math.min(1,y)*(5.2+m.flare*2)+x,J=g*6;for(let l=0;l<2;l++){const v=l===0?-1:1,E=(2+l)*4;A[E]=m.x+v*D*J,A[E+1]=m.y+v*I*J,A[E+2]=.57,A[E+3]=0,l===0?(T[E]=.36*O+x*.4,T[E+1]=.5*O+x*.3,T[E+2]=1.3*O):(T[E]=1.25*O,T[E+1]=.36*O+x*.3,T[E+2]=.22*O+x*.4),T[E+3]=O>.001?.05+g*2.6:0}if(c.on&&b>.01&&(A[8]=c.x+c.dx*.15,A[9]=c.y+c.dy*.15),t.pin>.01&&y<.01&&(A[8]=t.pinX,A[9]=t.pinY,A[12]=t.pinX,A[13]=t.pinY,T[11]=T[15]=.12),K.noLight)for(let l=0;l<16;l++)T[l]=0;const le=Math.max(C,P,Math.min(1,y)),Y=(o.dt||1/60)*v0;t.energy=X(t.energy,le,6,Y),e.grade[0]=z(t.anticip*.45+Math.min(1,y)*.08,0,.5),e.grade[1]=t.anticip*.08;const ie=t.matH,Se=!!(ie[0]||ie[1]),ee=!p&&Se&&(y>.001||C>.01||P>.01);let te=null;const re=C>.002||P>.002||y>5e-4||e.bridge[0]>.002||e.shockA[3]!==0||c.on||t.pin>0,o0=Math.max(2,Math.round(u/2)),a0=Math.max(2,Math.round(s/2));if(me&&(K.attract=p,K.handOn=ee,K.fxActive=re),_0(),de("matte"),ee){$.resize(o0,a0),$0(o),j.uMask=o.mask,j.uBase=o.base,j.uAspect=r;const l=Re&&Me===o0&&ze===a0;j.uBg=l?_[0]:o.base,j.uBgOk=l?1:0,j.uMDbg=K.view==="key"?1:0,d.pass($e,$,j)}if(xe("matte"),re?(b0(o0,a0),de("fill"),te=g0(o,ee&&!p0),Re=ee&&!p0,xe("fill")):Re=!1,re){const l=Math.min(1,(S?1e3:1600)/Math.max(u,s)),v=Math.max(2,Math.round(u*l)),E=Math.max(2,Math.round(s*l));A0(v,E),e.fxRes[0]=v,e.fxRes[1]=E;const q=Be;q.uMask=o.mask,q.uAspect=r,q.uTime=n,q.uFrame=o.frame,q.uMobile=S?1:0,q.uHand=$,q.uHandOn=ee?1:0,de("fx"),d.pass(We,Ge,q),xe("fx")}let s0=S?Y0:i0;const D0=C>.05?C:0,P0=P>.05?P:0,T0=m.phase==="alive"&&y>.2?1:0,H=t.ev;(D0>0||P0>0||T0>0||H.release||H.blueDiss||H.redDiss||H.birth)&&(t.liveAt=t.time);const O0=t.time-t.liveAt<3.5||H.kill||H.collapse,E0=z(Y*60,.05,3);if(e.spawn[0]=D0,e.spawn[1]=P0,e.spawn[2]=T0,e.spawn[3]=.015*E0,e.caps[0]=S?2e3:5e3,e.caps[1]=S?450:1e3,e.caps[2]=Math.min(1,.035*E0),e.caps[3]=S?6e3:15e3,e.event[0]=H.release,e.event[1]=H.blueDiss,e.event[2]=H.redDiss,e.event[3]=H.birth,e.event2[0]=H.collapse,e.event2[1]=H.launch,e.relC[0]=t.relC[0],e.relC[1]=t.relC[1],e.relC[2]=t.relC[2],e.relC[3]=H.kill,e.relD[0]=t.relD[0],e.relD[1]=t.relD[1],de("sim"),O0){const l=k0;l.uTime=n,l.uDt=z(Y,0,.05),l.uAspect=r,l.uCount=s0,Xe.use().set(l),i.enable(i.RASTERIZER_DISCARD),i.bindVertexArray(Te[ke]),i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,Ee[1-ke]),i.beginTransformFeedback(i.POINTS),i.drawArrays(i.POINTS,0,s0),i.endTransformFeedback(),i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,null),i.bindBuffer(i.TRANSFORM_FEEDBACK_BUFFER,null),i.disable(i.RASTERIZER_DISCARD),ke=1-ke}xe("sim"),H.release=0,H.blueDiss=0,H.redDiss=0,H.birth=0,H.kill=0,H.collapse=0,H.launch=0;const n0=O0&&!U0;if(de("draw"),n0){const l=Math.min(1,2200/Math.max(u,s)),v=Math.max(2,Math.round(u*l)),E=Math.max(2,Math.round(s*l));he.resize(v,E),he.clear(0,0,0,0),e.pRes[0]=v,e.pRes[1]=E;const q=B0;q.uAspect=r,q.uGain=1,q.uFloor=p&&r>=1?-.31:-10,Qe.use().set(q),d.blend("premultiplied"),i.bindVertexArray(Oe[ke]),i.drawArraysInstanced(i.TRIANGLE_STRIP,0,4,s0),i.bindVertexArray(null),d.blend(null)}if(xe("draw"),e.res[0]=u,e.res[1]=s,re||n0||t.flash>.002){de("final"),e.diskAx[0]=e.disk[0],e.diskAx[1]=e.disk[1];const l=Je;l.uBase=o.base,l.uNormals=o.normals(),l.uHand=$,l.uFxA=G,l.uFxB=se,l.uClean=re&&ee?_[0]:o.base,l.uEnv=re&&te?te:o.base,l.uHole=re&&ee&&R.length?R[0]:o.base,l.uParts=he,l.uPlate=o.plate,l.uPlateL=o.plateLearned,l.uMask=o.mask,l.uAspect=r,l.uFxOn=re?1:0,l.uHandOn=ee?1:0,l.uPartsOn=n0?1:0,l.uDebugMatte=K.matteMode,l.uDbgBits=K.bits||0,l.uHandRef=Math.max(.06,ie[0]?.size||0,ie[1]?.size||0),d.pass(Ke,o.scene,l),xe("final")}else o.copy(o.base,o.scene);const ce=K.view;if(ce==="fill"&&_.length)o.copy(_[0],o.scene);else if(ce==="prep"&&R.length)o.copy(R[0],o.scene);else if(ce==="matte"||ce==="key")o.copy($,o.scene);else if(ce&&/^(push|pull)\d$/.test(ce)){const l=(ce[2]==="s"?R:_)[+ce[4]];l&&o.copy(l,o.scene)}const oe=o.post,_e=t.energy;oe.exposure=1-.18*_e,oe.bloom=.06+.05*_e+.05*Math.min(1,y)+.12*t.flash,oe.vignette=.35+.2*_e,oe.aberration=.0015*Math.min(1,y)+.011*t.aberr,oe.flash=.22*t.flash*t.flash,oe.filmic=.1*_e,oe.grain=.035;const l0=t.shake*.012;if(l0>1e-5){const l=t.shakePhase*38;oe.shake[0]=l0*(Math.sin(l*1.3)*.6+Math.sin(l*2.9+1.7)*.4)/r,oe.shake[1]=l0*(Math.sin(l*1.7+.4)*.6+Math.sin(l*3.3+2.2)*.4)}}function $0(o){const u=o.aspect;e.handSize[0]=0,e.handSize[1]=0;for(let s=0;s<2;s++){const r=t.matH[s],n=s*N*4;if(!r){for(let g=0;g<N*4;g++)e.bones[n+g]=1e3;e.sweep[s*2]=e.sweep[s*2+1]=0;continue}e.handSize[s]=r.size,e.palm[s*2]=r.palm[0],e.palm[s*2+1]=r.palm[1],e.curl[s*4]=r.curls[0],e.curl[s*4+1]=r.curls[1],e.curl[s*4+2]=r.curls[2],e.curl[s*4+3]=r.curls[3],e.curl[8+s]=r.curls[4],e.curl[10+s]=1-.55*L(.8,2.4,r.speed||0),e.sweep[s*2]=(r.velocity?.[0]||0)*u*.03,e.sweep[s*2+1]=(r.velocity?.[1]||0)*.03,e.uncert[s]=.1+.35*L(.8,2.4,r.speed||0)+1.4*z((r.lost||0)-.12,0,.5),e.fresh[s]=1-L(.08,.3,r.lost||0);const m=r.points,h=(r.palm[0]-.5)*u,c=r.palm[1]-.5;let S=0;for(let g=0;g<21;g++)S=Math.max(S,Math.hypot((m[g*3]-.5)*u-h,m[g*3+1]-.5-c));const p=(m[0]-.5)*u,C=m[1]-.5,P=p-((m[27]-.5)*u-p)*2,y=C-(m[28]-.5-C)*2;S=Math.max(S,Math.hypot(P-h,y-c)+.3*r.size),e.reach[s]=S+(.5+1.4*Math.min(r.lost||0,.5))*r.size;for(let g=0;g<N;g++){const V=Z0[g],F=J0[g],D=n+g*4;if(e.bones[D]=(m[V*3]-.5)*u,e.bones[D+1]=m[V*3+1]-.5,F>=0){let I=(m[F*3]-.5)*u,w=m[F*3+1]-.5;(F===4||F===8||F===12||F===16||F===20)&&(I+=(I-e.bones[D])*.25,w+=(w-e.bones[D+1])*.25),e.bones[D+2]=I,e.bones[D+3]=w}else e.bones[D+2]=P,e.bones[D+3]=y}}}const Ue=[{pts:null,side:"left"},{pts:null,side:"right"}],qe=[],j0={c:[.33,-.06],b:[.17,-.25],r:[.58,.2],size:.17,hold:.33,grow:.1,amp:.05,out:1.3,ax:0,rise:.08},X0={c:[.11,.235],b:[.07,.15],r:[.17,.35],size:.085,hold:.16,grow:.045,amp:.018,out:.55,ax:.62,rise:.05};function Q0(o,u,s,r,n){const h=((o+L0)%13.2+13.2)%13.2;qe.length=0;const c=u>=1?j0:X0,S=(w,a,f=0)=>w*Math.sin(o*a+f),p=c.size,C=Math.cos(c.ax),P=Math.sin(c.ax);let y,g,V,F,D=.25,I=-.25;if(h<4.1){const w=L(.25,.9,h),a=L(.55,1.2,h);y=c.b[0]+S(.015,.9)*p/.17,g=W(c.b[1]-c.rise,c.b[1],w)+S(.015,1.3)*p/.17,V=c.r[0]+S(.02,1.1,1)*p/.17,F=W(c.r[1]-c.rise,c.r[1],a)+S(.02,1.2,2)*p/.17}else if(h<5.6){const w=L(4.1,5.5,h);y=W(c.b[0],c.c[0]-C*c.hold/2,w),g=W(c.b[1],c.c[1]-P*c.hold/2,w)+S(.01,1.3)*p/.17,V=W(c.r[0],c.c[0]+C*c.hold/2,w),F=W(c.r[1],c.c[1]+P*c.hold/2,w)+S(.01,1.2,2)*p/.17,D=W(.25,.5,w),I=W(-.25,-.5,w)}else if(h<10.3){const w=h-5.6,a=c.hold+c.grow*L(0,1.6,w)+c.amp*Math.sin(w*1.4)*L(.8,2,w),f=c.ax+.22*Math.sin(w*.8)*L(.5,2,w),b=c.c[0]+S(.012,.7)*p/.17,B=c.c[1]+S(.012,.9)*p/.17;y=b-Math.cos(f)*a/2,g=B-Math.sin(f)*a/2,V=b+Math.cos(f)*a/2,F=B+Math.sin(f)*a/2,D=.5+f-c.ax,I=-.5+f-c.ax}else{const w=L(10.3,10.62,h),a=W(c.hold+c.grow,c.out,w);y=c.c[0]-C*a/2,g=c.c[1]-P*a/2+W(0,-.05,w)*p/.17,V=c.c[0]+C*a/2,F=c.c[1]+P*a/2+W(0,.04,w)*p/.17,D=.5+w*.4,I=-.5-w*.4}return h>.25&&h<10.95&&(Ue[0].pts=r({x:.5+y/u,y:.5+g,size:p,roll:D,side:"left",curls:n.open},u,s[0]),Ue[1].pts=r({x:.5+V/u,y:.5+F,size:p,roll:I,side:"right",curls:n.open},u,s[1]),qe.push(Ue[0]),h>.55&&qe.push(Ue[1])),qe}try{const o=k.targets,u=d.target(4,4,{format:"hdr"});A0(4,4),b0(16,16),$.resize(4,4),he.resize(4,4),e.res[0]=e.res[1]=e.fxRes[0]=e.fxRes[1]=e.pRes[0]=e.pRes[1]=4,e.orbA[3]=1,e.orbA[2]=.1,e.orbB[0]=0,e.orbA[7]=1,e.orbA[6]=.1,e.orbB[4]=1,e.singA[2]=.02,e.singA[3]=1,e.singB[0]=19,e.diskP[0]=3,e.diskP[1]=9.5,e.diskP[3]=1,e.disk[0]=1,e.disk[4]=1,e.disk[8]=1,e.bridge[0]=.5,e.shockA[3]=.5,e.shockB[0]=.05,e.beamB[1]=.05,e.beamB[2]=.5,e.beamB[3]=.5,e.beamC[0]=.5,e.beamC[3]=.5,e.beamA[2]=1,e.pin[2]=.5,e.pin[3]=.02,Be.uMask=o.mask.read,Be.uHandOn=1,d.pass(We,Ge,Be),Be.uHandOn=0,j.uMask=o.mask.read,j.uBase=o.base,j.uBg=o.base,j.uAspect=1,d.pass($e,$,j),g0({base:o.base,mask:o.mask.read},!0),Object.assign(Je,{uBase:o.base,uNormals:o.normals,uClean:_[0],uEnv:_[0],uHole:R[0],uPlate:o.plateFilled,uPlateL:o.plate.read,uMask:o.mask.read,uFxOn:1,uHandOn:1,uPartsOn:1,uAspect:1}),d.pass(Ke,u,Je),Xe.use().set(Object.assign(k0,{uCount:1,uDt:0})),i.enable(i.RASTERIZER_DISCARD),i.bindVertexArray(Te[0]),i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,Ee[1]),i.beginTransformFeedback(i.POINTS),i.drawArrays(i.POINTS,0,1),i.endTransformFeedback(),i.bindTransformFeedback(i.TRANSFORM_FEEDBACK,null),i.bindBuffer(i.TRANSFORM_FEEDBACK_BUFFER,null),i.disable(i.RASTERIZER_DISCARD),he.bind(),Qe.use().set(B0),d.blend("premultiplied"),i.bindVertexArray(Oe[0]),i.drawArraysInstanced(i.TRIANGLE_STRIP,0,4,1),i.bindVertexArray(null),d.blend(null),u.dispose();for(const s of["orbA","orbB","singA","singB","diskP","disk","bridge","shockA","shockB","beamA","beamB","beamC","pin"])e[s].fill(0)}catch(o){console.warn("singularity warm-up skipped",o)}return me&&typeof window<"u"&&(window.__singularity={S:t,log:me,dbg:K,U:e,fxA:G,fxB:se,fillPush:R,fillPull:_,matte:$}),{id:"singularity",coach:[{gesture:"open",label:"Open palm",text:"charge an orb"},{gesture:"two",label:"Collide",text:"bring both orbs together"},{gesture:"throw",label:"Rip apart",text:"fast, to release it"},{gesture:"pinch",label:"Pinch",text:"implode it"}],activeCues(){return ge},update:W0,render:K0,reset:C0,choreography:Q0,dispose(){for(const o of[We,Ke,$e,d0,x0,je,Xe,Qe])o.dispose();$.dispose(),he.dispose(),G.dispose(),se.dispose(),i.deleteFramebuffer(Ye);for(const o of R)o.dispose();for(const o of _)o.dispose();R.length=_.length=0,Me=ze=0;for(const o of Pe)i.deleteBuffer(o);for(const o of[...Te,...Oe])i.deleteVertexArray(o);for(const o of Ee)i.deleteTransformFeedback(o)}}}export{ut as createEffect};
