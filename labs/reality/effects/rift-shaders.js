/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-cc4e5c0cd73c */(()=>{const s=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(s)||s.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();import{HEADER as e,COMMON as t}from"../engine/glsl.js?v=0aafddc6f3";const o=`
vec2 pgrad(vec2 c,float seed){float a=hash12(c+seed*17.31)*6.2831853;return vec2(cos(a),sin(a));}
float pn(vec2 x,vec2 P,float seed){
  vec2 i=floor(x),f=fract(x);
  vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  vec2 i0=mod(i,P),i1=mod(i+1.0,P);
  float a=dot(pgrad(i0,seed),f);
  float b=dot(pgrad(vec2(i1.x,i0.y),seed),f-vec2(1.0,0.0));
  float c=dot(pgrad(vec2(i0.x,i1.y),seed),f-vec2(0.0,1.0));
  float d=dot(pgrad(i1,seed),f-1.0);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y)*1.5;
}
`,r=`
uniform sampler2D uNoise;
vec4 N4(vec2 p){return texture(uNoise,p)*2.0-1.0;}
// animated noise: two layers drifting against each other read as evolving turbulence
float nA(vec2 p,float t){return N4(p+vec2(0.071,0.043)*t).r*0.62+N4(p*1.37+vec2(-0.053,0.067)*t+0.31).g*0.5;}
float fbmN(vec2 p){return N4(p).r*0.5+N4(p*2.03+0.17).g*0.25+N4(p*4.07+0.41).b*0.125+N4(p*8.11+0.73).a*0.0625;}
`,i=`
uniform vec4 uWin;      // centre.xy, half extents.zw (aspect space)
uniform vec2 uRot;      // cos/sin of the window tilt
uniform float uAspect;
uniform float uTime;
uniform float uGrow; uniform float uCollapse;
vec2 winLocal(vec2 p){vec2 d=p-uWin.xy;return vec2(d.x*uRot.x+d.y*uRot.y,-d.x*uRot.y+d.y*uRot.x);}
vec2 winWorld(vec2 l){return vec2(l.x*uRot.x-l.y*uRot.y,l.x*uRot.y+l.y*uRot.x);}
float sdRBox(vec2 q,vec2 h,float r){vec2 a=abs(q)-h+r;return length(max(a,0.0))+min(max(a.x,a.y),0.0)-r;}
// the seal squashes the window into a burning line, then shrinks the line
vec2 effHalf(){
  vec2 h=uWin.zw;
  float cy=1.0-smoothstep(0.0,0.62,uCollapse);
  float cx=1.0-smoothstep(0.5,1.0,uCollapse);
  float line=0.0024*(1.0-smoothstep(0.82,1.0,uCollapse));
  return vec2(max(h.x*cx,0.0006),max(h.y*cy,line+0.0004));
}
`,m=e+t+o+`
in vec2 vUv;out vec4 outColor;
void main(){
vec2 x=vUv*8.0;
vec4 n=vec4(pn(x,vec2(8.0),1.0),pn(x,vec2(8.0),2.0),pn(x,vec2(8.0),3.0),pn(x*2.0,vec2(16.0),4.0));
outColor=clamp(n*0.5+0.5,0.0,1.0);
}`,h=e+t+`
in vec2 vUv;out vec4 outColor;
uniform float uLayer;uniform float uDomain;uniform vec2 uStar;uniform float uMobile;
float fbmK(vec3 p,int oct){float s=0.0,a=0.5;for(int i=0;i<7;i++){if(i>=oct)break;s+=a*snoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return s;}
float ridgeK(vec3 p,int oct){float s=0.0,a=0.5;for(int i=0;i<6;i++){if(i>=oct)break;float n=1.0-abs(snoise(p));s+=a*n*n;p=p*2.11+vec3(4.1,2.3,7.7);a*=0.5;}return s;}
vec3 hubble(float h){
vec3 teal=vec3(0.06,0.5,0.75),mag=vec3(0.95,0.1,0.35),gold=vec3(1.0,0.45,0.12);
return h<0.5?mix(teal,mag,smoothstep(0.0,0.5,h)):mix(mag,gold,smoothstep(0.5,1.0,h));
}
void main(){
vec2 p=(vUv-0.5)*2.0*uDomain;
vec3 acc=vec3(0.0);float T=1.0;
vec2 ds=p-uStar;float rs=length(ds);
int hi=uMobile>0.5?5:6;
vec2 toS=-ds/max(rs,1e-4);
float lobe=fbmK(vec3(p*0.6,1.3),4);
float region=exp(-rs*rs*(1.6-0.9*smoothstep(-0.3,0.5,lobe)));
float light=1.0/(1.0+rs*rs*12.0);
if(uLayer<0.5){
for(int i=0;i<6;i++){
float z=(float(i)+0.5)/6.0;
vec3 x=vec3(p*0.8,z*1.1+0.3);
vec3 w=vec3(fbmK(x*0.7+vec3(0.0,0.0,3.0),3),fbmK(x*0.7+vec3(5.2,1.3,0.0),3),0.0);
float nn=fbmK(x+w*1.25,hi);
float dens=smoothstep(-0.25,0.65,nn);dens*=dens;
float ion=clamp(rs*0.62-0.05+nn*0.35,0.0,1.0);
vec3 e=hubble(ion)*dens*(0.004+0.9*region+1.6*light);
acc+=T*e*0.36;
T*=exp(-dens*0.18);
}
acc+=vec3(0.45,0.85,1.0)*exp(-rs*5.5)*1.2;
float kn=fbmK(vec3(p*5.0,13.0),4);
float knot=smoothstep(0.42,0.8,kn);knot*=knot*exp(-rs*rs*9.0);
acc+=vec3(1.0,0.35,0.55)*knot*9.0+vec3(0.6,0.95,1.0)*knot*knot*14.0;
float bd=dot(p,vec2(0.42,-0.9075))+0.42;
float band=exp(-bd*bd*6.0)*(0.45+0.55*smoothstep(-0.3,0.5,fbmK(vec3(p*2.2,4.0),4)));
acc+=vec3(0.6,0.62,0.85)*band*0.02;
outColor=vec4(acc,T);
}else if(uLayer<1.5){
vec3 x=vec3(p*1.05+vec2(3.7,-1.9),7.0);
vec3 w=vec3(fbmK(x*0.6,3),fbmK(x*0.6+vec3(2.0,7.0,1.0),3),0.0)*0.8;
float macro=fbmK(x*0.7+w,3);
float macro2=fbmK(x*0.7+w+vec3(toS*0.05,0.0),3);
float det=fbmK(x*2.6+w*1.5,hi-1);
float shape=macro+det*0.28;
float near=smoothstep(1.7,0.35,rs);
float dust=smoothstep(0.16,0.42,shape)*near*0.85;
float rim=clamp((macro-macro2)*18.0,0.0,1.0)*smoothstep(0.08,0.17,shape)*(1.0-smoothstep(0.2,0.34,shape));
float r=ridgeK(x*1.6+w*1.25,hi-1);
float fil=clamp(r-0.3,0.0,1.0)*1.7;fil=fil*fil*fil*region;
vec3 e=vec3(1.0,0.62,0.3)*rim*near*(0.01+2.2*light+0.6*region)*(0.7+0.6*det)+hubble(0.45+0.35*w.x)*fil*0.25;
acc=e*0.6;
T=exp(-dust*2.0);
outColor=vec4(acc,T);
}else{
vec3 x=vec3(p*1.7+vec2(-5.1,2.4),21.0);
vec3 w=vec3(fbmK(x*0.5,3),fbmK(x*0.5+vec3(4.0,1.0,8.0),3),0.0)*1.15;
float nn=fbmK(x+w,hi);
float nn2=fbmK(x+w+vec3(toS*0.03,0.0),hi);
float dust=smoothstep(0.3,0.66,nn);
float rim=clamp((nn-nn2)*10.0,0.0,1.0)*smoothstep(0.2,0.42,nn)*(1.0-smoothstep(0.45,0.75,nn));
vec3 e=vec3(1.0,0.56,0.3)*rim*(0.01+1.4*light+0.3*region);
outColor=vec4(e,exp(-dust*3.2));
}
}`,c=`
uniform float uPeriod; uniform vec2 uSkyY; uniform vec2 uSun;
float fbmS(vec2 s,float cells,int oct,float seed){
  vec2 x=s*(cells/uPeriod); vec2 P=vec2(cells,4099.0);
  float a=0.5,r=0.0;
  for(int i=0;i<6;i++){if(i>=oct)break;r+=a*pn(x,P,seed+float(i)*7.13);x*=2.0;P.x*=2.0;a*=0.5;}
  return r;
}
float smax(float a,float b,float k){float h=clamp(0.5+0.5*(a-b)/k,0.0,1.0);return mix(b,a,h)+k*h*(1.0-h);}
float bulge(vec2 s,vec2 c,float r){vec2 d=s-c;float q=r*r-dot(d,d);return q>0.0?sqrt(q):r-length(d);}
vec2 sunD(vec2 s){vec2 d=s-uSun;d.x-=uPeriod*floor(d.x/uPeriod+0.5);return d;}
// one tier of towers: N per period, half widths in units of half a cell
float towers(vec2 s,float N,float base,float hMin,float hMax,float wMin,float wMax,float seed,float fill,float gap){
  float cw=uPeriod/N; float ci=floor(s.x/cw);
  float H=-1.0;
  for(int k=-1;k<=1;k++){
    float cell=ci+float(k); float id=mod(cell,N);
    vec3 h=hash33(vec3(id*1.37+seed,seed*2.1,3.1));
    if(hash12(vec2(id+seed*7.7,1.3))>fill) continue;
    float x0=(cell+0.5+(h.x-0.5)*0.45)*cw;
    float Ht=mix(hMin,hMax,h.y);
    float W=mix(wMin,wMax,h.z)*cw*0.5;
    // towers near the low sun step aside so it sets in a gap between them
    float dsx=x0-uSun.x; dsx-=uPeriod*floor(dsx/uPeriod+0.5);
    float need=gap+W*0.62;
    if(gap>0.0&&abs(dsx)<need) x0+=(dsx<0.0?-1.0:1.0)*(need-abs(dsx));
    float b0=base+(h.x-0.5)*0.02;
    if(abs(s.x-x0)>W*1.25+Ht*0.3+0.06||s.y<b0-0.03||s.y>b0+Ht*1.2+0.06) continue;
    float lean=(h.z-0.5)*0.7;
    // a broad flat-bottomed body joins the domes (no gaps between "legs")
    vec2 eb=(s-vec2(x0,b0))/vec2(W*1.05,0.42*Ht+0.02);
    float qe=1.0-dot(eb,eb);
    float Hc=qe>0.0?(0.42*Ht+0.02)*sqrt(qe)*0.7:(1.0-length(eb))*0.04;
    for(int j=0;j<9;j++){
      vec3 g=hash33(vec3(id+seed,float(j),9.0));
      float u=(float(j)/8.0-0.5)*2.0+(g.x-0.5)*0.16;
      float a=u-lean; float hump=max(1.0-a*a*0.6,0.1);
      float r=(0.12*Ht+0.15*W)*mix(0.7,1.15,g.z)*(0.5+0.5*hump);
      vec2 c=vec2(x0+u*W*0.95,b0+Ht*hump*0.68+r*0.05);
      Hc=smax(Hc,bulge(s,c,r)+g.y*0.012,0.045);
    }
    for(int j=0;j<11;j++){
      vec3 g=hash33(vec3(id+seed,float(j),17.0));
      float u=(g.x-0.5)*2.1; float a=u-lean;
      float hump=max(1.0-a*a*0.62,0.0);
      float r=(0.075*Ht+0.085*W+0.005)*mix(0.6,1.15,g.z);
      vec2 c=vec2(x0+u*W*0.9,b0+Ht*(0.6+0.42*g.y)*hump+r*0.28);
      Hc=smax(Hc,bulge(s,c,r)+g.y*0.012,0.02);
    }
    for(int j=0;j<16;j++){
      vec3 g=hash33(vec3(id+seed,float(j),29.0));
      float u=(g.x-0.5)*2.1; float a=u-lean;
      float hump=max(1.0-a*a*0.62,0.0);
      float r=(0.034*Ht+0.04*W+0.003)*mix(0.6,1.2,g.z);
      vec2 c=vec2(x0+u*W*0.88,b0+Ht*(0.66+0.38*g.y)*hump+r*0.25);
      Hc=smax(Hc,bulge(s,c,r)-0.003+g.y*0.008,0.006);
    }
    // flat base at the condensation level
    Hc=min(Hc,(s.y-b0)*2.2);
    H=max(H,Hc);
  }
  return H;
}
`,d=e+t+o+c+`
float towerRaw(vec2 s){
float near=towers(s,5.0,-0.38,0.3,0.52,0.75,1.05,1.0,0.95,0.06);
float far=towers(s,9.0,-0.3,0.08,0.17,0.6,1.0,5.0,0.7,0.0)*0.85-0.003;
return max(near,far)+fbmS(s,48.0,3,3.0)*0.003;
}
in vec2 vUv;out vec4 outColor;
void main(){outColor=vec4(towerRaw(vec2(vUv.x*uPeriod,mix(uSkyY.x,uSkyY.y,vUv.y))),0.0,0.0,1.0);}`,x=e+t+o+c+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uH;
float towerField(vec2 s){
float v=(s.y-uSkyY.x)/(uSkyY.y-uSkyY.x);
if(v<0.0||v>1.0)return -1.0;
return texture(uH,vec2(s.x/uPeriod,v)).r;
}
float deck(vec2 s){
float w=fbmS(s*vec2(1.0,2.0),3.0,3,41.0);
float n=fbmS(vec2(s.x+0.35*w,s.y*5.5+w*0.9),4.0,5,43.0);
float rolls=fbmS(vec2(s.x*1.0+0.2*w,s.y*11.0),9.0,3,47.0);
float band=smoothstep(-0.04,0.12,s.y)*(1.0-smoothstep(0.45,0.7,s.y));
vec2 d=sunD(s);float sd=length(d*vec2(0.6,1.4));
return n*0.85+rolls*0.22+band*0.36-0.33-0.22*exp(-sd*7.0);
}
float exitDist(vec2 s,vec2 dir){
float t=0.0;const float st=0.024;
for(int i=0;i<16;i++){t+=st;if(towerField(s+dir*t)<0.0)break;}
float a=max(t-st,0.0),b=t;
for(int i=0;i<4;i++){float m=(a+b)*0.5;if(towerField(s+dir*m)<0.0)b=m;else a=m;}
return(a+b)*0.5;
}
vec3 skyGrad(float y,float near){
vec3 c=mix(vec3(1.0,0.6,0.32),vec3(1.0,0.76,0.48),smoothstep(-0.5,-0.18,y));
c=mix(c,vec3(1.0,0.7,0.6),smoothstep(-0.18,0.05,y));
c=mix(c,vec3(0.86,0.6,0.76),smoothstep(0.02,0.24,y));
c=mix(c,vec3(0.42,0.44,0.84),smoothstep(0.2,0.48,y));
c=mix(c,vec3(0.17,0.22,0.58),smoothstep(0.45,0.78,y));
return c+vec3(1.0,0.66,0.42)*near;
}
void main(){
vec2 s=vec2(vUv.x*uPeriod,mix(uSkyY.x,uSkyY.y,vUv.y));
float y=s.y;
vec2 ds=sunD(s);float sd=length(ds*vec2(0.62,1.2));
vec2 toS=-ds/max(length(ds),1e-4);
float near=exp(-sd*1.3);
vec3 sky=skyGrad(y,exp(-sd*3.2)*0.28+exp(-sd*10.0)*0.32);
sky=min(sky,vec3(1.0));
const float e=0.0022;
vec3 col=sky;float cover=0.0;
float D=deck(s);
if(D>-0.03){
float cov=smoothstep(-0.006,0.006,D);
float Dt=deck(s+toS*0.03),Dt2=deck(s+toS*0.012);
float belly=1.0-smoothstep(-0.02,0.03,Dt);
float rim=1.0-smoothstep(-0.012,0.01,Dt2);
vec3 shade=mix(vec3(0.52,0.45,0.76),vec3(0.66,0.5,0.74),near);
shade=mix(shade,sky*0.78,0.25);
vec3 lit=mix(vec3(0.98,0.58,0.62),vec3(1.0,0.74,0.5),near);
vec3 hot=mix(vec3(1.0,0.84,0.76),vec3(1.0,0.93,0.76),near);
vec3 cc=mix(shade,lit,smoothstep(0.45,0.55,belly));
cc=mix(cc,hot,smoothstep(0.45,0.55,rim)*(0.55+0.45*near));
cc=mix(cc,sky,smoothstep(0.42,0.7,y)*0.35);
col=mix(col,cc,cov);cover=max(cover,cov);
}
float H=towerField(s);
if(H>-0.01){
float cov=smoothstep(-0.0016,0.0016,H);
float hx=towerField(s+vec2(e,0.0))-towerField(s-vec2(e,0.0));
float hy=towerField(s+vec2(0.0,e))-towerField(s-vec2(0.0,e));
vec3 nF=normalize(vec3(-hx/(2.0*e),-hy/(2.0*e),1.0));
vec2 dl=normalize(toS+vec2(0.0,0.35));
vec2 da=rot2(0.1)*dl,db=rot2(-0.1)*dl;
float tt=0.5*exitDist(s,da)/max(exitDist(s,da)+exitDist(s,-da),1e-4)+0.5*exitDist(s,db)/max(exitDist(s,db)+exitDist(s,-db),1e-4);
vec3 L=normalize(vec3(dl,0.45));
float ndl=clamp(dot(nF,L),0.0,1.0);
float back=exp(-sd*2.2);
float k=(1.0-tt)*0.85+ndl*0.25-0.1-back*0.42;
float up=smoothstep(-0.4,0.1,y);
vec3 baseC=mix(vec3(0.3,0.27,0.54),vec3(0.38,0.34,0.64),up);
vec3 shadeC=mix(vec3(0.5,0.44,0.72),vec3(0.6,0.52,0.78),up);
vec3 midC=mix(vec3(0.96,0.6,0.6),vec3(1.0,0.66,0.52),near);
vec3 litC=mix(vec3(1.0,0.84,0.68),vec3(1.0,0.86,0.7),near);
vec3 cc=mix(baseC,shadeC,smoothstep(0.1,0.16,k+0.15*nF.y));
cc=mix(cc,midC,smoothstep(0.5,0.55,k));
cc=mix(cc,litC,smoothstep(0.68,0.73,k));
cc*=0.93+0.1*ndl;
cc=mix(cc,baseC,(1.0-smoothstep(0.0,0.035,H))*smoothstep(0.25,-0.6,nF.y)*0.75);
float edge=1.0-smoothstep(0.0,0.011,H);
float lining=edge*clamp(dot(normalize(nF.xy+1e-5),toS),0.0,1.0)*(0.3+1.0*near+1.2*back);
cc=mix(cc,vec3(1.0,0.97,0.9),smoothstep(0.22,0.42,lining));
float far=1.0-smoothstep(0.0,0.06,H);
cc=mix(cc,sky,0.12*far+0.55*smoothstep(-0.22,-0.42,y));
col=mix(col,cc,cov);cover=max(cover,cov);
}
outColor=vec4(col,cover);
}`,p=e+t+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;uniform float uStep;uniform float uSigma;uniform int uR;
void main(){
vec3 c0=texture(uSrc,vUv).rgb;vec3 g0=sqrt(max(c0,0.0));
vec3 sum=vec3(0.0);float ws=0.0;
float k=0.5/(uSigma*uSigma);
for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){
if(abs(i)>uR||abs(j)>uR)continue;
vec2 o=vec2(float(i),float(j));
vec3 c=texture(uSrc,vUv+o*uTexel*uStep).rgb;
vec3 dg=sqrt(max(c,0.0))-g0;
float w=exp(-dot(o,o)*0.2222-dot(dg,dg)*k);
sum+=c*w;ws+=w;
}
outColor=vec4(sum/ws,1.0);
}`,g=e+t+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;uniform float uSigma;
void main(){
vec3 c0=texture(uSrc,vUv).rgb;vec3 g0=sqrt(max(c0,0.0));
vec3 sum=vec3(0.0);float ws=0.0;
float k=0.5/(uSigma*uSigma);
for(int i=-3;i<=3;i++){
float x=float(i);
vec3 c=texture(uSrc,vUv+uDir*x).rgb;
vec3 dg=sqrt(max(c,0.0))-g0;
float w=exp(-x*x*0.125-dot(dg,dg)*k);
sum+=c*w;ws+=w;
}
outColor=vec4(sum/ws,1.0);
}`,l=`
float skinW(vec3 cg,float L){
  vec3 ch=cg/max(cg.r+cg.g+cg.b,1e-4);
  return smoothstep(0.36,0.4,ch.r)*(1.0-smoothstep(0.55,0.6,ch.r))*(1.0-smoothstep(0.035,0.07,abs(ch.g-0.305)))*smoothstep(0.05,0.1,L);
}`,n=`
uniform sampler2D uMac; uniform vec4 uMacT;   // r: 4 % blur, g: 12 % blur of the matte; texel sizes (uv) of both
vec3 macroNormal(vec2 uv){
  vec2 t1=uMacT.xy, t2=uMacT.zw;
  float ax=texture(uMac,uv+vec2(t1.x,0.0)).r-texture(uMac,uv-vec2(t1.x,0.0)).r;
  float ay=texture(uMac,uv+vec2(0.0,t1.y)).r-texture(uMac,uv-vec2(0.0,t1.y)).r;
  float bx=texture(uMac,uv+vec2(t2.x,0.0)).g-texture(uMac,uv-vec2(t2.x,0.0)).g;
  float by=texture(uMac,uv+vec2(0.0,t2.y)).g-texture(uMac,uv-vec2(0.0,t2.y)).g;
  // gradients in aspect units, scaled by each blur's width so both scales weigh in equally
  vec2 g=vec2(ax/(2.0*t1.x*uAspect),ay/(2.0*t1.y))*0.045+vec2(bx/(2.0*t2.x*uAspect),by/(2.0*t2.y))*0.14;
  return normalize(vec3(-g*2.2,1.0));
}`,b=e+t+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uCur;uniform sampler2D uHist;uniform vec2 uTexel;uniform float uReset;
vec3 G(vec2 uv){return sqrt(max(texture(uCur,uv).rgb,0.0));}
void main(){
vec3 c=G(vUv);
if(uReset>0.5){outColor=vec4(c*c,1.0);return;}
vec3 a=G(vUv+vec2(uTexel.x,0.0)),b=G(vUv-vec2(uTexel.x,0.0)),d=G(vUv+vec2(0.0,uTexel.y)),e=G(vUv-vec2(0.0,uTexel.y));
vec3 lo=min(c,min(min(a,b),min(d,e)))-0.022,hi=max(c,max(max(a,b),max(d,e)))+0.022;
vec3 h=sqrt(max(texture(uHist,vUv).rgb,0.0));
vec3 hc=clamp(h,lo,hi);
float k=mix(0.3,1.0,smoothstep(0.025,0.09,length(h-c)));
vec3 o=mix(hc,c,k);
outColor=vec4(o*o,1.0);
}`,w=e+t+l+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform sampler2D uMask;uniform sampler2D uStats;uniform vec2 uDir;uniform float uFirst;uniform float uSigma;
float gKey;
vec4 tapFirst(vec2 uv){
vec3 cg=sqrt(max(texture(uSrc,uv).rgb,0.0));float L=luma(cg);
float m=smoothstep(0.45,0.85,texture(uMask,uv).r);
float s=skinW(cg,L)*smoothstep(0.26,0.44,L/gKey)*m;
return vec4(L*m,m,L*s,s);
}
void main(){
vec4 sum=vec4(0.0);float ws=0.0;float k=-0.5/(uSigma*uSigma);
gKey=max(texture(uStats,vec2(0.5)).x,0.06);
float stp=max(1.0,uSigma/3.4);
for(int i=-8;i<=8;i++){
float x=float(i)*stp;float w=exp(x*x*k);
vec2 uv=vUv+uDir*x;
sum+=(uFirst>0.5?tapFirst(uv):texture(uSrc,uv))*w;ws+=w;
}
outColor=sum/ws;
}`,a=`
vec3 tensorAt(sampler2D src,vec2 uv,vec2 texel){
  float Ls[25];
  for(int j=0;j<5;j++)for(int i=0;i<5;i++) Ls[j*5+i]=luma(sqrt(max(texture(src,uv+(vec2(float(i),float(j))-2.0)*texel*1.25).rgb,0.0)));
  vec3 J=vec3(0.0);
  for(int j=1;j<4;j++)for(int i=1;i<4;i++){
    float gx=Ls[j*5+i+1]-Ls[j*5+i-1], gy=Ls[(j+1)*5+i]-Ls[(j-1)*5+i];
    float w=(i==2&&j==2)?1.0:((i==2||j==2)?0.7:0.5);
    J+=w*vec3(gx*gx,gx*gy,gy*gy);
  }
  return J;
}
float coherenceOf(vec3 J){return sqrt((J.x-J.z)*(J.x-J.z)+4.0*J.y*J.y)/max(J.x+J.z,1e-7);}
vec2 strokeDir(vec3 J){
  float a=J.x,b=J.y,c=J.z;
  float l2=0.5*(a+c-sqrt((a-c)*(a-c)+4.0*b*b));
  vec2 v=vec2(b,l2-a);
  if(dot(v,v)<1e-12) v=vec2(l2-c,b);
  if(dot(v,v)<1e-12) return a<c?vec2(1.0,0.0):vec2(0.0,1.0);
  return normalize(v);
}`,y=e+t+a+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;
void main(){outColor=vec4(tensorAt(uSrc,vUv,uTexel)*64.0,1.0);}`,k=e+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uFoot;
void main(){
vec4 s=vec4(0.0);
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)s+=texture(uSrc,vUv+vec2(float(i),float(j))*uFoot*0.333);
outColor=s/9.0;
}`,S=e+t+l+a+`
in vec2 vUv; out vec4 outColor;
uniform float uAspect;
`+n+`
uniform sampler2D uDogH;uniform sampler2D uSrc;uniform sampler2D uLow;uniform sampler2D uWide;uniform sampler2D uTens;
uniform sampler2D uStats;uniform sampler2D uMask;uniform vec2 uDir;uniform vec2 uSun;uniform float uDbgF;uniform vec2 uTexel;
uniform float uFaceTex;
float meanL(vec4 v){return v.r/max(v.g,1e-3);}
void main(){
vec4 s=vec4(0.0),ws=vec4(0.0);
for(int i=-5;i<=5;i++){
float x=float(i),x2=x*2.0;
vec2 w=vec2(exp(-x*x*0.5),exp(-x*x/(2.0*1.6*1.6)));
float wb=exp(-x2*x2/32.0);
vec4 v=texture(uDogH,vUv+uDir*x),vb=texture(uDogH,vUv+uDir*x2);
s.xy+=v.xy*w;ws.xy+=w;
s.zw+=vb.zw*wb;ws.zw+=vec2(wb);
}
vec4 g=s/ws;
vec4 St=texture(uStats,vec2(0.5));float key=max(St.x,0.06);
vec3 cg=sqrt(max(texture(uSrc,vUv).rgb,0.0));float L=luma(cg);
float m=texture(uMask,vUv).r;
vec4 lo=texture(uLow,vUv),wi=texture(uWide,vUv);
float Le=lo.r/max(lo.g,1e-3),Lw=wi.r/max(wi.g,1e-3);
float Les=mix(Le,lo.b/max(lo.a,1e-4),smoothstep(0.03,0.15,lo.a/max(lo.g,1e-3)));
float Lws=mix(Lw,wi.b/max(wi.a,1e-4),smoothstep(0.03,0.15,wi.a/max(wi.g,1e-3)));
float faceE=lo.a/max(lo.g,1e-3),faceW=wi.a/max(wi.g,1e-3);
float sk=skinW(cg,L)*smoothstep(0.26,0.44,(0.3*g.y+0.2*g.z+0.5*L)/key);
float region=max(smoothstep(0.32,0.62,sk*0.6+faceE*0.55),smoothstep(0.55,0.78,faceW));
float gs=0.6*g.y+0.4*g.z;
float onFace=smoothstep(0.15,0.4,faceW);
vec2 oy=vec2(0.0,max(uFaceTex*0.055,2.0)*uTexel.y);
vec4 la=texture(uLow,vUv+oy),lb=texture(uLow,vUv-oy);
float LsA=mix(meanL(la),la.b/max(la.a,1e-4),smoothstep(0.03,0.15,la.a/max(la.g,1e-3)));
float LsB=mix(meanL(lb),lb.b/max(lb.a,1e-4),smoothstep(0.03,0.15,lb.a/max(lb.g,1e-3)));
float val=(min(LsA,LsB)-g.y)/key;
float rho=g.y/max(Les,0.02);
float fill=smoothstep(0.93,0.8,rho)*smoothstep(-0.01,0.05,val)*onFace;
fill=max(fill,smoothstep(0.5,0.36,gs/max(Lws,0.03))*smoothstep(0.55,0.8,faceW));
float hair=smoothstep(0.6,0.44,Le/key)*smoothstep(0.72,0.52,gs/key)*(1.0-0.85*sk)*(1.0-smoothstep(0.35,0.7,faceE))*(1.0-smoothstep(0.35,0.55,faceW));
fill*=1.0-hair;
float lstd=sqrt(max(g.w-g.z*g.z,0.0));
float nrm=0.75*lstd+0.25*clamp(St.y,0.05,0.25)+0.015;
nrm=mix(nrm,max(nrm,0.42*key),region);
float D=(g.x-g.y)/nrm,Dm=(g.y-g.z)/nrm;
float resp=max(-D*0.9,-Dm);
float t0=0.135+0.035*(1.0-onFace);
float coh=coherenceOf(texture(uTens,vUv).rgb);
float line=clamp(0.5*resp/(t0+0.11),0.0,1.0)*smoothstep(t0*0.8,t0,resp)*smoothstep(0.3,0.7,m)*(1.0-hair);
line*=mix(1.0,smoothstep(0.22,0.55,coh),region);
vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
vec3 nb=macroNormal(vUv);
vec2 sdir=normalize(uSun-p+vec2(0.0,0.25));
float form=dot(nb.xy,sdir);
float skinShade=0.62*log2(max(Lws,1e-3)/key)+0.26*log2(max(Les,1e-3)/key)+0.5*form;
float matShade=log2(max(mix(gs,Le,0.45),1e-3)/key);
region*=(1.0-hair)*(1.0-smoothstep(0.5,0.34,mix(gs,Le,0.5)/key)*(1.0-smoothstep(0.35,0.55,faceW)));
float shade=mix(matShade,skinShade,region);
outColor=vec4(line,fill,shade,region);
if(uDbgF>3.5)outColor=vec4(-D,-Dm,nrm/key,region);
else if(uDbgF>2.5)outColor=vec4(val,rho,gs/key,coh);
else if(uDbgF>1.5)outColor=vec4(rho,gs/key,fill,hair);
else if(uDbgF>0.5)outColor=vec4(max(-D,0.0)*0.5,max(-Dm,0.0)*0.5,coh,region);
}`,P=e+t+a+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform sampler2D uTens;uniform vec2 uTexel;
float S(float r){return smoothstep(0.29,0.5,r);}
void main(){
vec4 f=texture(uSrc,vUv);
float r0=f.r;
vec2 sd=strokeDir(texture(uTens,vUv).rgb);
vec2 t=sd*uTexel*1.25,nn=vec2(-sd.y,sd.x)*uTexel*1.3;
float mp=0.0,mn=0.0,sum=S(r0);
for(int i=1;i<=6;i++){
float x=float(i),fall=1.0-x*0.06;
float a=S(texture(uSrc,vUv+t*x).r),b=S(texture(uSrc,vUv-t*x).r);
mp=max(mp,a*fall);mn=max(mn,b*fall);sum+=a+b;
}
float side=max(max(texture(uSrc,vUv+nn).r,texture(uSrc,vUv-nn).r),0.97*max(texture(uSrc,vUv+nn*2.0).r,texture(uSrc,vUv-nn*2.0).r));
float thin=smoothstep(0.78,0.97,r0/max(max(side,r0),1e-4));
float l0=S(r0);
float strong=smoothstep(0.36,0.6,l0);
float joined=max(l0*thin*mix(smoothstep(0.3,0.55,max(mp,mn)),1.0,strong),min(mp,mn)*0.9*(1.0-smoothstep(0.12,0.29,r0)));
joined*=mix(1.0,smoothstep(0.05,0.14,sum/13.0),f.a);
f.r=joined;
outColor=f;
}`,D=e+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;uniform float uSigma;uniform float uSigmaF;uniform float uSigmaS;
void main(){
vec4 sum=vec4(0.0),ws=vec4(0.0);
float sf=max(max(uSigmaF,uSigmaS)/2.6,1.0);
float kl=-0.5/(uSigma*uSigma),kf=-0.5/(uSigmaF*uSigmaF),ks=-0.5/(uSigmaS*uSigmaS);
for(int i=-6;i<=6;i++){
float x=float(i)*sf;
vec4 v=texture(uSrc,vUv+uDir*x);
vec3 w=exp(x*x*vec3(kl,kf,ks));
sum+=v*w.xyzz;ws+=w.xyzz;
}
outColor=sum/ws;
}`,C=e+t+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;uniform float uFirst;
void main(){
vec4 s=vec4(0.0),ws=vec4(0.0);
for(int i=-5;i<=5;i++){
float x=float(i),x2=x*2.0;
vec2 w=vec2(exp(-x*x*0.5),exp(-x*x/(2.0*1.6*1.6)));
float wb=exp(-x2*x2/32.0);
vec4 v,vb;
if(uFirst>0.5){
float L=luma(sqrt(max(texture(uSrc,vUv+uDir*x).rgb,0.0)));
float Lb=luma(sqrt(max(texture(uSrc,vUv+uDir*x2).rgb,0.0)));
v=vec4(L);vb=vec4(Lb,Lb,Lb,Lb*Lb);
}else{v=texture(uSrc,vUv+uDir*x);vb=texture(uSrc,vUv+uDir*x2);}
s.xy+=v.xy*w;ws.xy+=w;
s.zw+=vb.zw*wb;ws.zw+=vec2(wb);
}
outColor=s/ws;
}`,L=e+t+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform sampler2D uMask;uniform sampler2D uPrev;uniform vec4 uBox;uniform float uK;
float sampleAt(int i,int j,out float L,out float skin,out vec2 chrg){
vec2 uv=mix(uBox.xy,uBox.zw,(vec2(float(i),float(j))+0.5)/12.0);
float w=smoothstep(0.6,0.95,texture(uMask,uv).r);
vec3 cg=sqrt(max(texture(uSrc,uv).rgb,0.0));
L=luma(cg);
vec3 ch=cg/max(cg.r+cg.g+cg.b,1e-4);chrg=ch.rg;
skin=smoothstep(0.37,0.4,ch.r)*(1.0-smoothstep(0.53,0.57,ch.r))*(1.0-smoothstep(0.03,0.055,abs(ch.g-0.305)))*smoothstep(0.08,0.14,L);
return w;
}
void main(){
float sw=0.0,s1=0.0,s2=0.0,kw=0.0,k1=0.0;
float L,skin;vec2 ch;
for(int j=0;j<12;j++)for(int i=0;i<12;i++){
float w=sampleAt(i,j,L,skin,ch);
sw+=w;s1+=w*L;s2+=w*L*L;kw+=w*skin;k1+=w*skin*L;
}
vec4 cur=vec4(0.45,0.17,0.45,0.31);
if(sw>3.0){
float mu=s1/sw;
float key;
vec2 kc=vec2(0.45,0.31);
if(kw>4.0){
float k0=k1/kw,rw=0.0,r1=0.0;vec2 rc=vec2(0.0);
for(int j=0;j<12;j++)for(int i=0;i<12;i++){
float w=sampleAt(i,j,L,skin,ch);
float ww=w*skin*smoothstep(0.55*k0,0.7*k0,L);rw+=ww;r1+=ww*L;rc+=ww*ch;
}
key=rw>2.0?r1/rw:k0;kc=rw>2.0?rc/rw:kc;
}else{
float uw=0.0,u1=0.0;
for(int j=0;j<12;j++)for(int i=0;i<12;i++){float w=sampleAt(i,j,L,skin,ch);float ww=w*step(mu,L);uw+=ww;u1+=ww*L;}
key=uw>1.0?u1/uw:mu;
}
cur=vec4(key,sqrt(max(s2/sw-mu*mu,0.0)),kc);
}
vec4 prev=texture(uPrev,vec2(0.5));
outColor=prev.x<=0.0?cur:mix(prev,cur,uK);
}`,q=e+t+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform sampler2D uMask;uniform sampler2D uHand;uniform float uLive;uniform vec4 uBox;uniform float uAspect;
const int NX=28,NY=18;
void main(){
vec2 cell=(uBox.zw-uBox.xy)/vec2(float(NX),float(NY));
float cw=cell.x*uAspect,ch=cell.y;
float y0=-1.0,wmax=0.0;
for(int j=NY-1;j>=0;j--){
float y=uBox.y+(float(j)+0.5)*cell.y;
if(y0>0.0&&y0-y>1.45*wmax+2.0*ch)break;
float run=0.0,best=0.0;
for(int i=0;i<NX;i++){
vec2 uv=vec2(uBox.x+(float(i)+0.5)*cell.x,y);
float w=smoothstep(0.5,0.9,texture(uMask,uv).r)*(1.0-uLive*texture(uHand,uv).r);
vec3 cg=sqrt(max(texture(uSrc,uv).rgb,0.0));float L=luma(cg);
vec3 c3=cg/max(cg.r+cg.g+cg.b,1e-4);
w*=smoothstep(0.36,0.4,c3.r)*(1.0-smoothstep(0.55,0.6,c3.r))*(1.0-smoothstep(0.035,0.07,abs(c3.g-0.305)))*smoothstep(0.06,0.12,L);
if(w>0.25)run+=w;else{best=max(best,run);run=0.0;}
}
best=max(best,run)*cw;
if(best>1.5*cw){if(y0<0.0)y0=y;wmax=max(wmax,best);}
}
outColor=vec4(clamp(wmax/1.5,0.0,1.0),y0>0.0?1.0:0.0,0.0,1.0);
}`,T=e+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;
void main(){
float s=0.0;
for(int j=0;j<4;j++)for(int i=0;i<4;i++)s+=texture(uSrc,vUv+(vec2(float(i),float(j))-1.5)*0.25*uTexel).r;
outColor=vec4(s/16.0,0.0,0.0,1.0);
}`,R=e+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uA;uniform sampler2D uB;
void main(){outColor=vec4(texture(uA,vUv).r,texture(uB,vUv).r,0.0,1.0);}`,z=e+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uTexel;uniform float uFoot;
void main(){
vec4 s=vec4(0.0);
for(int j=0;j<6;j++)for(int i=0;i<6;i++)s+=texture(uSrc,vUv+((vec2(float(i),float(j))+0.5)/6.0-0.5)*uFoot*uTexel);
outColor=s/36.0;
}`,N=e+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;
void main(){
vec4 s=vec4(0.0);float ws=0.0;
for(int i=-4;i<=4;i++){float x=float(i);float w=exp(-x*x*0.125);s+=texture(uSrc,vUv+uDir*x)*w;ws+=w;}
outColor=s/ws;
}`,M=e+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;uniform vec2 uDir;
void main(){
const float w[5]=float[5](0.2270270270,0.1945945946,0.1216216216,0.0540540541,0.0162162162);
float s=texture(uSrc,vUv).r*w[0];
for(int i=1;i<5;i++){s+=texture(uSrc,vUv+uDir*float(i)).r*w[i];s+=texture(uSrc,vUv-uDir*float(i)).r*w[i];}
outColor=vec4(s,0.0,0.0,1.0);
}`,F=e+`
in vec2 vUv;out vec4 outColor;
uniform vec4 uPts[11];uniform float uSize;uniform float uAspect;uniform float uFeather;
const ivec2 BONES[20]=ivec2[20](ivec2(0,1),ivec2(1,2),ivec2(2,3),ivec2(3,4),ivec2(0,5),ivec2(5,6),ivec2(6,7),ivec2(7,8),
ivec2(9,10),ivec2(10,11),ivec2(11,12),ivec2(13,14),ivec2(14,15),ivec2(15,16),ivec2(0,17),ivec2(17,18),ivec2(18,19),ivec2(19,20),
ivec2(5,9),ivec2(9,13));
const float BR[20]=float[20](0.3,0.24,0.19,0.165,0.27,0.17,0.15,0.14,0.17,0.15,0.14,0.16,0.145,0.13,0.27,0.145,0.125,0.12,0.25,0.25);
vec2 P(int k){vec4 v=uPts[k/2];return(k%2==0)?v.xy:v.zw;}
float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float t=clamp(dot(pa,ba)/max(dot(ba,ba),1e-9),0.0,1.0);return length(pa-ba*t);}
void main(){
vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
float s=uSize;
float d=1e3,dc=1e3;
for(int i=0;i<20;i++){float q=seg(p,P(BONES[i].x),P(BONES[i].y));d=min(d,q-BR[i]*s);dc=min(dc,q-BR[i]*s*0.55);}
dc=min(dc,seg(p,P(0),P(9))-0.24*s);
d=min(d,seg(p,P(0),P(9))-0.4*s);
d=min(d,seg(p,P(0),P(13))-0.37*s);
d=min(d,seg(p,P(5),P(17))-0.25*s);
vec2 w=P(0),m=P(9);
d=min(d,seg(p,w,w+(w-m)*2.8)-0.5*s);
outColor=vec4(smoothstep(uFeather,-uFeather,d),smoothstep(0.62*s,0.22*s,d),smoothstep(uFeather*2.0,-uFeather*2.0,dc),1.0);
}`,U=`#version 300 es
precision highp float;
uniform float uTime;uniform float uN;uniform float uDepth;
out float vB;
const vec2 K[12]=vec2[12](vec2(4.0,1.0),vec2(-3.0,4.0),vec2(2.0,-5.0),vec2(5.0,3.0),vec2(-6.0,2.0),vec2(3.0,6.0),
vec2(-5.0,-5.0),vec2(7.0,-3.0),vec2(-2.0,8.0),vec2(6.0,6.0),vec2(-9.0,-2.0),vec2(4.0,-9.0));
const float S[12]=float[12](1.0,-1.0,1.0,-1.0,1.0,-1.0,1.0,1.0,-1.0,-1.0,1.0,-1.0);
void main(){
int id=gl_VertexID;int cell=id/6;int c=id-cell*6;
int N=int(uN);
int i=cell-(cell/N)*N,j=cell/N;
vec2 off=c==0?vec2(0.0):c==1?vec2(1.0,0.0):c==2?vec2(0.0,1.0):c==3?vec2(1.0,0.0):c==4?vec2(1.0):vec2(0.0,1.0);
vec2 x=(vec2(float(i),float(j))+off)/uN*1.24-0.12;
vec2 g=vec2(0.0);float hxx=0.0,hyy=0.0,hxy=0.0;
for(int k=0;k<12;k++){
vec2 kv=K[k]*6.2831853;
float kl=length(kv);
float a=(k<6?0.62:0.5)/(kl*kl);
float ph=dot(kv,x)+uTime*S[k]*0.42*sqrt(kl)+float(k)*1.7;
g+=a*kv*cos(ph);
float s=a*sin(ph);
hxx-=s*kv.x*kv.x;hyy-=s*kv.y*kv.y;hxy-=s*kv.x*kv.y;
}
vec2 y=x+uDepth*g;
float det=(1.0+uDepth*hxx)*(1.0+uDepth*hyy)-uDepth*uDepth*hxy*hxy;
vB=1.0/max(abs(det),0.085);
gl_Position=vec4(y*2.0-1.0,0.0,1.0);
}`,A=e+`
in float vB;out vec4 outColor;
uniform float uGain;
void main(){outColor=vec4(vB*uGain,0.0,0.0,1.0);}`,H=e+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uSrc;
void main(){outColor=vec4(0.0,texture(uSrc,vUv).r,0.0,1.0);}`,u=`
uniform sampler2D uBase; uniform sampler2D uMask; uniform sampler2D uNormals; uniform sampler2D uHand;
uniform sampler2D uInkC; uniform sampler2D uInkD; uniform sampler2D uStats; uniform sampler2D uSky;
uniform sampler2D uL0; uniform sampler2D uL1; uniform sampler2D uL2; uniform sampler2D uPlate; uniform sampler2D uCaustic;   // r sharp, g glow
uniform vec2 uRes; uniform vec2 uMaskTexel; uniform float uLive;
uniform vec2 uPar; uniform vec2 uStarScr; uniform vec4 uDrift; uniform float uDomain;
uniform vec3 uSkyMap;   // sky coords = p + xy; z = period
uniform vec2 uSkyY; uniform vec2 uSun;
uniform sampler2D uEnv;   // the three slabs blurred wide, side by side
${n}

struct Px{vec2 uv;vec2 p;float m;float mg;vec3 n;float h;vec2 uvIn;float wP;float hb;float bgk;};
// near the silhouette, a pixel that matches the learned clean background is wall the
// matte swallowed (the classic pale cut-out halo): it must not be shaded as the person
// (judged over a small neighbourhood, so the decision is a smooth region, not per-pixel noise
// that tears a white shirt against a white wall into rags; and only against the room actually
// seen there: under your shoulders the hole-filled plate is a guess of white wall, and a white
// shirt matching that guess must stay you)
float bgLikeAt(vec2 uv){
  vec2 o=uMaskTexel*1.5; float d=0.0, c=0.0;
  for(int i=0;i<4;i++){
    vec2 q=uv+o*vec2(i==0||i==2?1.0:-1.0,i<2?1.0:-1.0);
    vec4 pl=texture(uPlate,q);
    d+=length(sqrt(max(texture(uBase,q).rgb,0.0))-sqrt(max(pl.rgb,0.0)));
    c+=pl.a;
  }
  return (1.0-smoothstep(0.035,0.11,d*0.25))*smoothstep(0.55,0.9,c*0.25);
}
Px pixel(vec2 uv,vec2 p){
  Px P; P.uv=uv; P.p=p;
  // a tent filter of the matte (four bilinear taps one texel out): the person's contour becomes a
  // smooth curve instead of the bilinear staircase of the work-resolution matte, and its
  // gradient (per screen pixel) comes for free
  vec2 o=uMaskTexel;
  float ma=texture(uMask,uv+o).r, mb=texture(uMask,uv+vec2(-o.x,o.y)).r;
  float mc=texture(uMask,uv+vec2(o.x,-o.y)).r, md=texture(uMask,uv-o).r;
  float m0=texture(uMask,uv).r;
  P.m=m0*0.36+(ma+mb+mc+md)*0.16;
  vec2 tp=o*uRes;   // one mask texel in screen pixels
  P.mg=length(vec2(((ma+mc)-(mb+md))/(4.0*tp.x),((ma+mb)-(mc+md))/(4.0*tp.y)));
  vec4 nr=texture(uNormals,uv);
  P.n=normalize(nr.xyz*2.0-1.0); P.h=nr.w;
  // the soft matte band holds wall colour: take the person's colour from just inside instead
  float band=1.0-smoothstep(0.75,0.99,P.m);
  float push=5.0*band;
  P.bgk=0.0;
  if(P.m>0.03&&P.h<0.995){
    P.bgk=bgLikeAt(uv)*(1.0-smoothstep(0.93,0.995,P.h));
    push=max(push,P.bgk*14.0);
  }
  P.uvIn=uv-P.n.xy*uMaskTexel*push*step(0.03,P.m);
  // the person is opaque wherever the matte is more likely person than not (no see-through ears,
  // hair or hands: a ghost of the camera image over the other world reads as a hole)
  P.wP=smoothstep(0.42,0.7,P.m)*(1.0-P.bgk);
  P.hb=uLive*texture(uHand,uv).g;
  // around your hands the (temporally smoothed) matte trails a fast hand over the room for a few
  // frames: a thin, light piece of "person" there that is not skin is the wall the hand just left,
  // and stays the other world (otherwise a pale ghost of a finger hangs in space)
  if(P.hb>0.001&&P.wP>0.001){
    vec3 g=sqrt(max(texture(uBase,uv).rgb,0.0)); vec3 ch=g/max(g.r+g.g+g.b,1e-4);
    float sk=smoothstep(0.345,0.375,ch.r)*(1.0-smoothstep(0.62,0.68,ch.r))*(1.0-smoothstep(0.07,0.11,abs(ch.g-0.3)))*smoothstep(0.04,0.09,luma(g));
    P.wP*=1.0-P.hb*(1.0-sk)*(1.0-smoothstep(0.35,0.7,P.h))*smoothstep(0.3,0.45,luma(g));
  }
  return P;
}
// deliberate silhouette contour (pixels from the m=level iso line)
float silhouette(Px P,float level,float widthPx){
  if(P.m<0.03||P.m>0.99) return 0.0;
  float g=P.mg;
  float dist=abs(P.m-level)/max(g,1e-4);
  return (1.0-smoothstep(widthPx*0.5-0.6,widthPx*0.5+0.8,dist))*smoothstep(0.002,0.012,g);
}

// ---------- cosmos
// Three nebula slabs, each mapped as slab = p*scale + offset (uLM*.z / .xy). The JS side anchors
// them to the window with different follow factors, so moving the window is a camera move in the
// other universe: far gas barely shifts, near dust slides past (parallax).
uniform vec4 uLM0; uniform vec4 uLM1; uniform vec4 uLM2;
uniform vec4 uStarOff;  // screen offsets of the far / mid point-star fields
vec2 luv(vec2 p,vec4 m){return (p*m.z+m.xy)/(2.0*uDomain)+0.5;}
// A star keeps its light when the interior is rendered coarser (camera-matched or at a lower
// quality): its point spreads over a wider blur at a lower peak, the way the camera would see it,
// never a bigger bright disc. Reference: a point one pixel of a 1080-line picture wide.
float starFlux(){return min(1.0,uRes.y*uRes.y/(1080.0*1080.0));}
vec3 starLayer(vec2 p,float sc,float seed,float density,float bright){
  vec2 sp=p*sc; vec2 id=floor(sp); vec2 f=fract(sp)-0.5;
  vec3 h=hash33(vec3(id,seed));
  if(h.z>density) return vec3(0.0);
  vec2 o=(h.xy-0.5)*0.76;
  vec2 dd=f-o;
  float pxc=sc/uRes.y;
  float r2=dot(dd,dd)/(pxc*pxc);
  float hb=hash12(id+seed*3.1);
  float b=bright*hb*hb*hb*(0.75+0.25*sin(uTime*(1.3+h.x*3.0)+h.y*40.0))*starFlux();
  vec3 tint=mix(vec3(1.0,0.7,0.48),vec3(0.62,0.76,1.0),h.y);
  return tint*b*exp(-r2*0.6);
}
vec3 brightStar(vec2 p){
  vec2 d=p-uStarScr; float r=length(d);
  float px=1.0/uRes.y;
  float core=exp(-r*r/(px*px*14.0));
  // diffraction spikes fall off like the light that makes them (~1/r^2 past a short core), so they
  // are a short glint around the star, never a ruled line across the window
  float sy=1.0/(1.0+d.y*d.y/(0.016*0.016)), sx=1.0/(1.0+d.x*d.x/(0.016*0.016));
  float sp=exp(-abs(d.x)/(px*1.3))*sy*exp(-abs(d.y)*6.0)+exp(-abs(d.y)/(px*1.3))*sx*exp(-abs(d.x)*6.0);
  vec2 e=rot2(0.785)*d;
  float sp2=exp(-abs(e.x)/(px*0.9))*exp(-abs(e.y)*40.0)+exp(-abs(e.y)/(px*0.9))*exp(-abs(e.x)*40.0);
  float fk=starFlux();
  return vec3(1.0,0.94,0.88)*(core*90.0*fk+(sp*7.0+sp2*1.6)*sqrt(fk))+vec3(0.6,0.7,1.0)*(0.0012/(r*r+0.0012))*1.2;
}
// fine turbulent structure on top of the (lower resolution) slab: two taps of the noise tile
float gasDetail(vec2 s){return N4(s*2.3).r*0.6+N4(s*5.1+0.37).g*0.4;}
vec3 cosmosBg(vec2 p){
  vec2 s0=p*uLM0.z+uLM0.xy;
  vec4 l0=texture(uL0,luv(p,uLM0));
  vec4 l1=texture(uL1,luv(p,uLM1));
  vec4 l2=texture(uL2,luv(p,uLM2));
  float det=gasDetail(s0+uTime*0.002);
  // fine ionised filaments (ridged noise) carve the smooth slab into wisps, and a soft knee
  // pushes the faint fog toward black so the bright gas stands in real dynamic range
  vec2 wq=s0*0.13+det*0.012;
  float r1=1.0-abs(N4(wq+vec2(0.13,0.71)).r), r2=1.0-abs(N4(wq*2.4+vec2(0.57,0.29)+r1*0.02).g);
  float fil=r1*r1*r1*r1*r1*r1*0.7+r2*r2*r2*r2*r2*r2*r2*r2*0.45;
  vec3 neb=l0.rgb*clamp(0.55+0.45*det+1.2*fil,0.1,2.4)*1.5;
  float ln=luma(neb); neb*=ln/(ln+0.035)*1.2;
  float cl=exp(-length(p-uStarScr)*3.0);
  vec2 sf=p+uStarOff.xy;
  vec3 stars=starLayer(sf,300.0,1.0,0.07+0.3*cl,0.8)+starLayer(sf,140.0,2.0,0.02+0.16*cl,4.0);
  vec3 far=neb+l0.a*(stars+vec3(0.0002,0.0003,0.0009));
  far+=brightStar(p)*mix(l0.a,1.0,0.6);
  vec3 c=l1.rgb+l1.a*(far+starLayer(p+uStarOff.zw,60.0,4.0,0.025+0.1*cl,14.0));
  return l2.rgb*0.4+l2.a*c;
}
// blurry environment: what light reaches you from a direction (no stars, no filaments: the
// wide-blurred slabs, so the gas lights you in soft coloured washes)
vec4 envTap(vec2 uv,float k){
  vec2 m=1.0-abs(mod(uv,2.0)-1.0);   // mirrored repeat, like the slabs
  m=clamp(m,vec2(0.6/96.0),vec2(1.0-0.6/96.0));
  return texture(uEnv,vec2((k+m.x)/3.0,m.y));
}
vec3 cosmosSoft(vec2 p){
  vec4 l0=envTap(luv(p,uLM0),0.0);
  vec4 l1=envTap(luv(p,uLM1),1.0);
  vec4 l2=envTap(luv(p,uLM2),2.0);
  return l2.rgb+l2.a*(l1.rgb+l1.a*(l0.rgb+vec3(0.0006,0.0009,0.0025)));
}
vec3 bulgeNormal(vec2 uv,float R){
  vec2 ex=vec2(R/uAspect,0.0), ey=vec2(0.0,R);
  float bx=texture(uMask,uv+ex).r-texture(uMask,uv-ex).r;
  float by=texture(uMask,uv+ey).r-texture(uMask,uv-ey).r;
  return normalize(vec3(-bx,-by,0.85));
}
// You, standing in deep space and lit by it: your real albedo and features, the cluster's star
// as a clean raking key (live: it moves across your face as you move), the nebula as coloured image-based
// fill from whatever side each part of you faces, a thin back-light rim where the star or the gas
// is behind your edge (HDR, so it blooms). Dark hair and clothes stay opaque dark material. No
// stars, glass or scan lines on the skin.
vec3 cosmosWorld(Px P,vec3 bg){
  if(P.m<0.02) return bg;
  vec3 alb=texture(uBase,P.uvIn).rgb;
  vec3 n=P.n; float nz=clamp(n.z,0.0,1.0); float f1=1.0-nz;
  float keep=1.0-P.hb;
  vec3 nb=normalize(macroNormal(P.uv)+vec3(n.xy*0.35,0.0));
  // skin keeps its room exposure on the lit side (your face is never a darker copy of the camera);
  // clothes and the rest are lit by space alone, so a white shirt is a shaded form, not a cut-out
  vec3 ag=sqrt(max(alb,0.0)); vec3 ac=ag/max(ag.r+ag.g+ag.b,1e-4);
  // (lips, ears and a shadowed stubbled chin are redder than the cheek: they are skin too, or they
  // drop to the clothes' lighting and read as bruises)
  float skinish=smoothstep(0.36,0.4,ac.r)*(1.0-smoothstep(0.58,0.63,ac.r))*(1.0-smoothstep(0.06,0.095,abs(ac.g-0.295)))*smoothstep(0.08,0.14,luma(ag));
  vec2 toS=uStarScr-P.p; float ds=length(toS);
  // the star is beside you: a raking key that wraps across your face from its side (space has
  // no ambient, so the far side falls to the nebula's coloured light and then to black)
  vec2 sd2=toS/max(ds,1e-4);
  vec3 Ld=normalize(vec3(toS,0.28+0.2*ds));
  float across=dot(P.p-uWin.xy,sd2)/max(length(uWin.zw),0.05);   // -1 far side .. +1 star side
  // (the falloff across the window carries the key's direction even where the silhouette normals
  // are flat, e.g. a face that fills the window: the side away from the star falls into the gas's
  // dim coloured light, so you are visibly lit by something that is not the room)
  float ndl=dot(nb,Ld)+0.5*across;
  float lam=smoothstep(-0.4,0.95,ndl);
  float fall=1.0/(1.0+ds*ds*2.5);
  // exposure-matched: the lit side of you is as bright as in the room (never a darker, cooler
  // copy of the camera), the far side falls to the nebula's own coloured light
  // (the cluster's star is hot and blue-white: on skin it reads as a clean, slightly cool key,
  // never a warm grade over the camera's own colour)
  vec3 key=vec3(0.95,0.97,1.03)*lam*lam*(mix(0.3,0.74,skinish)+mix(0.7,1.12,skinish)*fall);
  vec3 envN=cosmosSoft(P.p+nb.xy*0.3);
  // the gas on each side of you lights that side in its own colour (pink from one, teal from the
  // other): its hue at a fixed strength, so the colour shows even where the gas is faint
  // (clearly coloured on both cheeks: the gas's own hue pulled toward magenta on one side and teal on
  // the other, so a face that fills the window still stands inside a nebula)
  float sideW=smoothstep(0.0,0.6,abs(nb.x));
  vec3 side=vec3(0.0);
  if(sideW>0.001){
    vec3 envS=cosmosSoft(P.p+vec2(nb.x>0.0?0.45:-0.45,0.05));
    vec3 hueS=mix(envS/(luma(envS)+0.04),nb.x>0.0?vec3(0.35,0.85,1.25):vec3(1.3,0.42,0.95),0.55);
    // (mostly the gas's real light, only a little fixed hue: a coloured edge on the cheek, never a
    // tinted face)
    side=(hueS*0.38+min(envS,vec3(1.2))*0.6)*sideW*sideW;
  }
  vec3 fill=min(envN,vec3(1.2))*0.7+side+envN/(luma(envN)+0.06)*0.07+vec3(0.02,0.018,0.04);
  // (clothes take the key at half strength: lit by the star and the gas, never by the room)
  vec3 body=alb*(fill*mix(0.7,1.0,skinish)+key*mix(0.38,1.0,skinish));
  // soft skin sheen from the key
  vec3 H=normalize(Ld+vec3(0.0,0.0,1.0));
  float spec=pow(max(dot(nb,H),0.0),14.0);
  body+=vec3(1.0,0.9,0.8)*spec*0.035*(0.45+1.4*fall)*smoothstep(0.01,0.12,luma(alb))*keep;
  // the rim: only the outer band of the silhouette (low inflated height), brightest where the
  // star or bright gas is behind that edge, in the colour of the light behind it
  float rimW=(1.0-smoothstep(0.5,0.64,P.h))*smoothstep(0.42,0.75,P.m)*keep;
  float r3=rimW*smoothstep(0.2,0.8,f1);
  vec3 envB=cosmosSoft(P.p-n.xy*0.04);
  float back=clamp(dot(normalize(n.xy+vec2(1e-5)),toS/max(ds,1e-4)),0.0,1.0);
  body+=(min(envB,vec3(2.0))*1.6+vec3(1.0,0.88,0.74)*back*back*(0.5+3.5*fall))*r3*(0.4+0.6*luma(alb)/(luma(alb)+0.1));
  // clothes and shoulders: within a few percent of the screen of their contour (the wide-blurred
  // matte falls toward one half there) they are back-lit by the gas and feather into it, so a white
  // shirt's lumpy matte edge becomes a soft rim-lit form, never a paper-white cut-out
  float edgeS=(1.0-skinish)*(1.0-smoothstep(0.55,0.93,texture(uMac,P.uv).r));
  body+=min(envB,vec3(1.5))*edgeS*1.2*keep;
  // dark hair, a dark cap, dark clothes: a dark material in space, lit only where the star and the
  // gas reach it, with a faint sheen of the gas on it (fabric and hair scatter a little of the light
  // around them); opaque, so you always occlude the universe behind you, never a see-through ghost
  float dark=(1.0-skinish)*smoothstep(0.3,0.1,luma(ag))*smoothstep(0.7,0.95,P.m)*keep;
  if(dark>0.002) body+=alb*min(envN,vec3(1.2))*0.5*dark+min(envB,vec3(1.2))*0.05*dark*f1;
  return mix(bg,body,P.wP*(1.0-0.45*edgeS));
}
// gas and dust drifting between you and the lens, faster than the window (nearest layer): space
// reads even when your face fills the window
vec3 cosmosFront(vec2 p,float wP){
  vec2 q=p*0.9+uPar*1.6+vec2(uTime*0.012,uTime*0.004);
  // soft sheets of glowing gas drifting between you and the lens (low-frequency, warped, with a
  // brighter edge where a sheet folds) and the motes of dust right in front of the lens; both slide
  // faster than the window (parallax), so space reads even when your face fills it
  vec2 wq=q+vec2(N4(q*0.35+0.1).r,N4(q*0.35+0.6).g)*0.35;
  float n=N4(wq*0.7).r*0.6+N4(wq*1.6+0.3).g*0.3+N4(wq*3.4+0.7).b*0.1;
  float sheet=smoothstep(0.05,0.75,n);
  float fold=exp(-abs(n-0.32)*14.0)*smoothstep(-0.2,0.4,N4(wq*0.5+0.4).a);
  vec3 tint=mix(vec3(1.2,0.48,0.95),vec3(0.42,0.92,1.25),smoothstep(-0.4,0.4,N4(q*0.37+0.5).a));
  vec2 sp=(p+uPar*2.2)*42.0; vec2 id=floor(sp); vec3 h=hash33(vec3(id,9.0));
  vec2 dm=fract(sp)-0.5-(h.xy-0.5)*0.6;
  float mote=h.z<0.16?exp(-dot(dm,dm)*uRes.y*uRes.y/(42.0*42.0*2.2))*(0.6+0.4*sin(uTime*2.0+h.x*40.0))*starFlux():0.0;
  // over you the haze thins (it is thin gas, not a coloured film on the face) and the sharp motes
  // keep to the space around you: pin-point lights printed on skin read as stickers, not depth
  return tint*(sheet*sheet*0.11+fold*0.09)*mix(1.0,0.3,wP)+vec3(1.0,0.9,0.95)*mote*3.2*(1.0-0.95*wP);
}


// ---------- ink (living anime cel cartoon under a painted golden-hour sky)
uniform float uSkyReady;   // the painted sky is generated in bands; until it is complete a plain gradient stands in
vec3 skyAt(vec2 p,out float cover){
  vec2 s=p+uSkyMap.xy;
  vec2 t=vec2(s.x/uSkyMap.z,(s.y-uSkyY.x)/(uSkyY.y-uSkyY.x));
  vec4 k=texture(uSky,vec2(t.x,clamp(t.y,0.002,0.998)));
  if(uSkyReady<0.999){
    float y=clamp(t.y,0.0,1.0);
    vec3 g=mix(vec3(1.0,0.8,0.6),vec3(0.6,0.56,0.8),smoothstep(0.25,0.95,y));
    k=vec4(mix(g,k.rgb,uSkyReady),k.a*uSkyReady);
  }
  cover=k.a; return k.rgb;
}
// HDR sun: a flat-topped core with a soft limb (no hard disc edge), bloom makes the glow
vec3 sunHDR(vec2 p,float cover){
  vec2 d=p-uSun; float r=length(d);
  float x=r/0.021;
  float x2=x*x;
  float core=exp(-x2*x2*1.1)*(1.0-0.3*min(x2,1.0));
  vec3 c=vec3(1.0,0.9,0.74)*core*10.0;
  vec3 glow=vec3(1.0,0.62,0.3)*(exp(-r*40.0)*1.5+exp(-r*12.0)*0.45+exp(-r*3.5)*0.1);
  return c*(1.0-cover*0.96)+glow*(1.0-cover*0.5);
}
// You as a hand-drawn cel: flat paint in a few clean shapes, inked features, a deliberate contour.
//   skin    one clean warm tone from your own mean skin colour, a warm shadow shape where your
//           real light falls off (wide skin-only mean + the head's macro form), a deep shadow
//           under a brim or the jaw, a rosy tint on the lips and ears
//   other   your clothes, hair and cap in their own hue, quantised to dark / shadow / lit / light
//   ink     eyes, brows, nostrils and the mouth line always ink (local contrast at eye scale),
//           XDoG contour lines, the silhouette; specks below ~0.4 % of the screen are opened away
// Every threshold acts on a temporally denoised, smooth field: edges are clean and do not boil.
vec3 inkWorld(Px P){
  vec4 S=texture(uStats,vec2(0.5));
  float key=max(S.x,0.06);
  vec3 c=texture(uInkC,P.uvIn).rgb;
  vec4 f=texture(uInkD,P.uvIn);
  vec3 cg=sqrt(max(c,0.0));
  float L=luma(cg);
  float shade=f.b;
  float aw=fwidth(shade)*0.75+0.012;
  // --- skin palette: the person's own mean skin chromaticity, nudged toward a clean warm tone
  vec3 sc=vec3(S.z,S.w,max(1.0-S.z-S.w,0.05));
  sc=mix(sc,vec3(0.425,0.322,0.253),0.3);
  vec3 sHue=sc/max(luma(sc),1e-3);
  // cel skin is lighter and a touch softer in chroma than the camera's (a clean peach, not tan)
  sHue=mix(vec3(1.0),sHue,0.72);
  float sL=clamp(key*0.75+0.36,0.4,0.86);
  vec3 skLit=min(sHue*sL,vec3(0.97));
  vec3 skSh=skLit*vec3(0.85,0.71,0.71);
  vec3 skDeep=skLit*vec3(0.63,0.48,0.52);
  vec3 skHi=mix(skLit,vec3(1.0,0.97,0.92),0.3);
  float lit=smoothstep(-0.44-aw,-0.44+aw,shade);
  float deep=1.0-smoothstep(-1.45-aw,-1.45+aw,shade);
  // (a highlight only well inside the silhouette: the bright wall caught in the matte's edge band
  // never turns into a white rim)
  float shine=smoothstep(0.9-aw,0.9+aw,shade)*smoothstep(0.9,0.98,P.m)*(1.0-P.bgk);
  vec3 skin=mix(mix(skSh,skDeep,deep),skLit,lit);
  skin=mix(skin,skHi,shine);
  // lips and ears: redder than your mean skin colour
  vec3 ch=cg/max(cg.r+cg.g+cg.b,1e-4);
  float rosy=smoothstep(0.03,0.065,ch.r-S.z)*smoothstep(-0.008,-0.03,ch.g-S.w)*smoothstep(0.08,0.2,L);
  skin=mix(skin,skin*vec3(1.0,0.76,0.78),rosy*0.7);
  // --- other materials: their own hue, four flat levels relative to the key
  vec3 hue=cg/max(L,0.035);
  hue=clamp(mix(vec3(luma(hue)),hue,mix(0.55,0.9,smoothstep(0.03,0.18,L))),0.0,2.5);
  float m1=smoothstep(-1.6-aw,-1.6+aw,shade), m2=smoothstep(-0.6-aw,-0.6+aw,shade), m3=smoothstep(0.42-aw,0.42+aw,shade);
  vec3 mat=hue*key*0.2+vec3(0.01,0.008,0.022);
  mat=mix(mat,hue*key*0.52*vec3(0.95,0.9,1.0),m1);
  mat=mix(mat,hue*key*0.92,m2);
  mat=mix(mat,min(hue*mix(key*1.3,0.94,0.5),vec3(0.97)),m3);
  float rw=fwidth(f.a)*0.75+0.02;
  vec3 tone=mix(mat,skin,smoothstep(0.5-rw,0.5+rw,f.a));
  float body=P.wP*(1.0-P.hb);
  // --- ink: filled features, then lines
  float fw=fwidth(f.g)*0.75+0.01, lw=fwidth(f.r)*0.75+0.01;
  float fillM=smoothstep(0.5-fw,0.5+fw,f.g)*body;
  // strokes carry pressure: full ink where the line is strong, tapering out at its weak ends
  // (a brush stroke, never a row of broken dashes); anything below 0.16 after the opening is gone
  float lineM=smoothstep(0.16-lw,0.5+lw,f.r)*body;
  vec3 ink=vec3(0.1,0.055,0.07);
  // filled features in their own darkened hue (dark brown brows and irises, not flat black), with
  // the eye's real catchlight kept as a white glint where the photo is bright inside the fill
  vec3 fillCol=mix(ink,min(hue*clamp(L,0.08,0.3)*0.6,vec3(0.25)),0.5);
  float glint=smoothstep(1.0,1.3,L/key)*smoothstep(0.6,0.85,f.g)*body;
  tone=mix(tone,fillCol,fillM);
  tone=mix(tone,vec3(0.96,0.97,1.0),glint);
  // line colour: strong strokes (lids, lashes, glasses, contours) are ink; the softer strokes on
  // skin are a dark warm brown, as in coloured-trace anime line work
  float skinR=smoothstep(0.45,0.55,f.a);
  vec3 lineCol=mix(ink,mix(skDeep*0.5,ink,smoothstep(0.55,0.95,f.r)),skinR);
  // anime rim light from the sun side
  vec3 n=P.n;
  float f1=1.0-clamp(n.z,0.0,1.0);
  float rim=f1*f1*sqrt(f1)*smoothstep(-0.2,0.6,n.x*0.6+n.y*0.8)*smoothstep(0.75,0.97,P.m);
  tone+=vec3(1.0,0.86,0.7)*rim*0.26*(1.0-P.hb)*(1.0-fillM);
  float cover; vec3 sky=skyAt(P.p,cover);
  float wI=smoothstep(0.6,0.78,P.m);
  vec3 col=mix(sky,tone,wI);
  float sil=silhouette(P,0.63,1.4+uRes.y/800.0)*(1.0-P.hb);
  vec4 pn=N4(P.p*vec2(6.0,0.9)+0.3);
  float fib=pn.r*0.5+pn.g*0.25+(hash12(floor(gl_FragCoord.xy*0.5))-0.5)*0.55;
  col*=vec3(1.0,0.975,0.935)*(0.97+0.026*fib);
  col=mix(col,lineCol,lineM*wI);
  col=mix(col,ink,sil);
  vec3 lin=toLinear(col);
  float bg=(1.0-wI)*(1.0-sil);
  lin+=sunHDR(P.p,cover)*bg;
  float sl=luma(sky);
  lin+=toLinear(sky)*max(sl-0.86,0.0)*6.0*bg*cover;   // silver linings bloom
  return lin;
}

// ---------- abyss
// Caustic light from the splatted wave mesh (tileable), with a slight dispersion. Two
// differently scaled, differently drifting samples break the regular net into the familiar
// interfering filaments.
uniform vec4 uAby;   // xy: scene anchor (window centre x follow), z: horizon height, w: sun ray tilt
uniform float uFaceK;   // caustic scale on the person: about three cells across the face
vec3 causticRGB(vec2 x){
  const vec2 e=vec2(0.0016,0.0011);
  return vec3(texture(uCaustic,x+e).r,texture(uCaustic,x).r,texture(uCaustic,x-e).r);
}
vec3 caustic2(vec2 x,float t){
  vec3 a=causticRGB(x+vec2(t*0.011,t*0.004));
  vec3 b=causticRGB(x*1.618+vec2(0.37,0.61)-vec2(t*0.007,-t*0.009));
  return sqrt(max(a*b,0.0))*1.3+(a+b)*0.12;
}
// every window, small or huge, looks down into the deep and up toward the light: the water
// gradient runs over the window's own height (y in window half-heights)
float winH(){return max(uWin.w,0.12);}
vec3 waterCol(float y){
  float v=y/winH();
  vec3 c=mix(vec3(0.0008,0.008,0.022),vec3(0.006,0.06,0.085),smoothstep(-1.3,0.0,v));
  c=mix(c,vec3(0.03,0.22,0.27),smoothstep(-0.1,0.9,v));
  return mix(c,vec3(0.09,0.42,0.46),smoothstep(0.75,1.6,v));
}
// distant reef and rock spires standing on the floor, two depths dissolving into the blue (they
// slide at different rates as the window moves: depth you can feel)
vec4 reef(vec2 sp,float hz){
  vec4 r=vec4(0.0);
  float hw=winH();
  for(int k=0;k<2;k++){
    int l=1-k;   // the near ridge first: it occludes the far one
    float fl=float(l);
    float x=sp.x*(0.75+0.8*fl)-uPar.x*(0.12+0.3*fl)+fl*5.3;
    float n=N4(vec2(x*0.42,0.13+fl*0.41)).r*0.7+N4(vec2(x*1.2,0.57+fl*0.3)).g*0.24+N4(vec2(x*3.3,0.91+fl*0.2)).b*0.06;
    // rounded coral mounds with the odd tall rock stack
    float m=max(n+0.3,0.0); m=m*m*1.6;
    float stack=smoothstep(0.55,0.85,N4(vec2(x*0.55,0.33+fl*0.17)).a);
    float top=hz+hw*(0.03+0.08*fl)+hw*(0.24+0.18*fl)*m+hw*0.55*stack*(0.6+0.4*fl);
    float aa=fwidth(sp.y)*1.5+0.0008;
    float cov=smoothstep(top+aa,top-aa,sp.y)*(1.0-r.a);
    // lit from above: a pale caustic-lit crest, darker below, fog by depth
    float crest=exp(-max(top-sp.y,0.0)/(0.012+0.01*fl));
    vec3 rock=mix(vec3(0.006,0.03,0.04),vec3(0.02,0.1,0.11),crest)*(0.7+0.3*fl);
    vec3 fogC=waterCol(sp.y)*0.92;
    rock=mix(rock,fogC,l==0?0.72:0.42);
    r.rgb+=rock*cov; r.a+=cov;
  }
  return r;
}
// shafts of sunlight from the surface, slanted, swaying; brighter higher up
float godRays(vec2 sp){
  vec2 S=vec2(-0.35+uAby.w,1.6);
  vec2 dv=sp-S; float ang=atan(dv.x,-dv.y); float dist=length(dv);
  float r1=N4(vec2(ang*1.6,uTime*0.008)).r, r2=N4(vec2(ang*4.8+0.5,uTime*0.016)).g, r3=N4(vec2(ang*11.0+0.2,uTime*0.03)).b;
  float rays=smoothstep(-0.1,0.8,r1)*0.55+smoothstep(0.1,0.85,r2)*0.35+smoothstep(0.3,0.9,r3)*0.25;
  return rays*rays*smoothstep(3.2,0.9,dist)*(0.3+0.7*smoothstep(-1.3,1.0,sp.y/winH()));
}
vec3 abyssBg(vec2 p){
  vec2 sp=p-uAby.xy;
  float hz=uAby.z-0.32*winH();
  vec3 col=waterCol(sp.y);
  vec4 rf=reef(sp,hz);
  col=mix(col,rf.rgb/max(rf.a,1e-4),rf.a);
  // the sea floor in perspective: sand dunes with caustics, fading into the blue
  if(sp.y<hz){
    float dh=hz-sp.y;
    float z=0.085/(dh+0.002);
    vec2 fp=vec2(sp.x*z,z);
    float dune=N4(fp*vec2(0.22,0.5)+0.2).r*0.65+N4(fp*vec2(0.7,1.4)+0.6).g*0.35;
    float ripple=0.5+0.5*sin(fp.x*18.0+fp.y*3.0+dune*7.0+N4(fp*1.1).b*2.5);
    vec3 sand=vec3(0.62,0.56,0.42)*(0.62+0.3*dune)*(0.82+0.18*ripple);
    float cw=exp(-z*0.45);
    vec3 ca=caustic2(fp*0.42,uTime*0.6);
    vec3 lit=sand*(vec3(0.03,0.16,0.18)+vec3(0.4,1.1,1.05)*(0.25+min(ca,vec3(6.0))*0.6*cw));
    lit*=vec3(0.32,0.72,0.82);
    float fog=1.0-exp(-z*0.42);
    col=mix(col,mix(lit,waterCol(hz+0.02)*1.1,fog),smoothstep(0.0,0.004,dh));
  }
  col+=vec3(0.12,0.5,0.52)*godRays(sp)*1.25;
  // looking up toward the surface: a bright rippling ceiling at the top
  float surf=smoothstep(0.6,1.3,sp.y/winH());
  if(surf>0.0){vec3 ca=causticRGB(vec2(sp.x*0.8,sp.y*3.0)+vec2(uTime*0.012,0.0)); col+=vec3(0.15,0.52,0.55)*surf*surf*(0.25+0.08*min(ca,vec3(6.0)));}
  return col;
}
vec3 snow(vec2 p){
  vec3 s=vec3(0.0);
  for(int l=0;l<3;l++){
    float fl=float(l);
    float sc=9.0+fl*13.0;
    vec2 sp=(p-uAby.xy*(0.6-fl*0.15)+uPar*(0.25+fl*0.32))*sc+vec2(0.0,uTime*(0.12+fl*0.09)*sc*0.1);
    vec2 id=floor(sp); vec2 f=fract(sp)-0.5;
    vec3 h=hash33(vec3(id,fl*7.0+1.0));
    if(h.z>0.42) continue;
    vec2 o=(h.xy-0.5)*0.6+vec2(0.12*sin(uTime*0.6+h.y*30.0),0.0);
    float r=length(f-o)*uRes.y/sc;
    float rad=l==0?mix(9.0,18.0,h.x):(l==1?mix(2.0,4.0,h.x):mix(1.0,1.8,h.x));
    float a=l==0?smoothstep(rad,rad*0.6,r)*0.05:exp(-r*r/(rad*rad))*(l==1?0.45:0.85);
    s+=vec3(0.55,0.9,0.95)*a;
  }
  return s;
}
// you, underwater, lit by the water: a dim absorbed teal ambient, and the caustic net as the real
// light on you: it refracts through your own curvature (wraps around the face), falls on every
// surface that faces up, is brightest where a sun shaft lands, and splits slightly in colour.
// A cool top rim and the haze between you and the lens finish it.
vec3 abyssWorld(Px P,vec3 bg){
  if(P.m<0.02) return bg;
  // a slow refraction wobble, only well inside the silhouette (at the edge it would pull the
  // bright room behind you into a jagged white seam)
  vec2 w=vec2(nA(P.p*0.5,uTime*0.6),nA(P.p*0.5+0.5,uTime*0.6))*0.003*smoothstep(0.93,0.995,P.m)*(1.0-P.bgk);
  vec3 b=texture(uBase,P.uvIn+w).rgb;
  vec2 sp=P.p-uAby.xy;
  float depthK=smoothstep(0.55,-0.5,sp.y);
  vec3 nb=normalize(macroNormal(P.uv)+vec3(P.n.xy*0.5,0.0));
  // light from the surface falls on what faces up; under the chin, the nose, a brim: none
  float up=smoothstep(-0.3,0.55,nb.y);
  // the pool-light net, refracted by your own curvature: about three cells across your face (sized
  // from your measured face width), plus a second, slower scale drifting through it, so the light
  // brightens, breaks and re-forms instead of sitting on you like a fixed pattern. It is projected
  // onto your form: it bends with the surface normal and compresses where the surface turns away.
  vec2 cq=P.p*uFaceK*(1.0+0.35*(1.0-nb.z))+nb.xy*0.06;
  float t=uTime*0.6;
  vec2 q1=cq+vec2(t*0.011,t*0.004), q2=cq*0.73+vec2(0.37,0.61)-vec2(t*0.007,-t*0.009);
  // skin scatters focused light under its surface: on you the net is mostly its soft glow (the
  // blurred caustics) with only a gentle, colourless crest along the filaments (pool light on skin,
  // never cracked glass or lightning)
  vec2 c1=texture(uCaustic,q1).rg, c2=texture(uCaustic,q2).rg;
  float glow=c1.y*0.62+c2.y*0.38;
  float crest=sqrt(max(c1.x*0.6+c2.x*0.4,0.0));
  // (the tile's glow averages ~0.65: the soft net is brightest where light gathers, near dark between)
  float net=smoothstep(0.3,4.0,pow(glow*1.55,2.2))*1.3+smoothstep(1.2,3.0,crest)*0.3;
  // the surface focuses more in some patches than others (long swell)
  float patchy=0.25+1.0*smoothstep(-0.35,0.55,nA(P.p*0.55+3.1,uTime*0.25));
  vec3 light=vec3(net*patchy);
  float shaft=0.55+0.9*godRays(sp);
  // water takes the red first: the skin keeps its own shading, cooled and dimmed with depth
  vec3 absorb=mix(vec3(0.6,0.88,0.93),vec3(0.3,0.58,0.7),depthK);
  // the caustic light is near-white cyan (it has only crossed a little water): it lights the
  // albedo mostly desaturated, in HDR, so the filaments bloom like real focused sunlight
  vec3 alb=mix(b,vec3(luma(b)),0.3)*vec3(0.92,1.04,1.06)*1.1+0.012;
  // (the water's ambient keeps you readable: a person in shallow water, never a near-black cut-out)
  // (a face looking at you still catches the net: light reaching through the water from above and in
  // front, strongest on what faces up)
  vec3 c=b*absorb*(0.62+0.26*up)+alb*vec3(0.7,1.0,1.04)*light*(0.6+0.4*up)*shaft*(1.6-0.6*depthK)+vec3(0.004,0.03,0.045)*(1.0+depthK);
  float f1=1.0-clamp(P.n.z,0.0,1.0);
  float topRim=f1*f1*sqrt(f1)*smoothstep(0.7,0.97,P.m)*(1.0-P.hb)*clamp(P.n.y*0.8+0.45,0.0,1.0);
  c+=vec3(0.1,0.75,0.85)*topRim*0.55;
  vec3 wc=waterCol(sp.y+uPar.y*0.35);
  c=mix(c,wc*1.5,0.05+0.32*depthK*depthK);
  c+=vec3(0.12,0.5,0.52)*godRays(sp)*0.16;
  return mix(bg,c,P.wP);
}

vec3 universe(float id,Px P){
  if(id<0.5){ vec3 bg=P.wP<0.999?cosmosBg(P.p):vec3(0.0); return cosmosWorld(P,bg)+cosmosFront(P.p,P.wP); }
  if(id<1.5) return inkWorld(P);
  vec3 bg=P.m<0.92||P.bgk>0.0?abyssBg(P.p):vec3(0.0);
  return abyssWorld(P,bg)+snow(P.p)*0.75;
}
`,j=e+t+r+i+u+`
in vec2 vUv;out vec4 outColor;
uniform float uUni;uniform float uPrev;uniform float uMixT;uniform vec3 uRimCore;uniform float uDbg;
void main(){
vec2 uv=vUv;vec2 p=(uv-0.5)*vec2(uAspect,1.0);
vec2 q=winLocal(p);vec2 hh=effHalf();
vec2 ao=abs(q)-hh;float boxd=length(max(ao,0.0))+min(max(ao.x,ao.y),0.0);
float R=uGrow*(length(hh)+0.06);
if(boxd>0.03||length(q)-R>0.075){outColor=vec4(0.0,0.0,0.0,1.0);return;}
Px P=pixel(uv,p);
if(uDbg>0.5){
vec4 g=texture(uInkD,P.uvIn);
vec3 o=uDbg<1.5?vec3(P.bgk,P.wP,P.h):uDbg<2.5?macroNormal(uv)*0.5+0.5:uDbg<3.5?vec3(g.r,g.g,0.0):uDbg<4.5?vec3(clamp(g.b*0.3+0.6,0.0,1.0),clamp(g.b*0.3+0.6,0.0,1.0),g.a):uDbg<5.5?vec3(step(0.35,g.r),step(0.5,g.g),step(-0.4,g.b)*0.5):g.rgb;
outColor=vec4(o,1.0);return;}
vec3 col=universe(uUni,P);
if(uMixT<0.999){
vec3 prev=universe(uPrev,P);
float fr=length(q/max(hh,vec2(1e-3)))*0.72+N4(q*0.9+vec2(uTime*0.06)).r*0.12;
float front=fr-(uMixT*1.55-0.12);
col=mix(prev,col,smoothstep(0.025,-0.025,front));
col+=uRimCore*exp(-abs(front)/0.014)*4.0*(1.0-uMixT);
}
outColor=vec4(max(col,0.0),1.0);
}`,B=e+t+r+i+`
in vec2 vUv;out vec4 outColor;
uniform sampler2D uBase;uniform sampler2D uMask;uniform sampler2D uNormals;uniform sampler2D uHand;
uniform sampler2D uInner;uniform sampler2D uGlow;
uniform vec2 uInnerScale;uniform vec2 uInnerMax;
uniform vec2 uRes;uniform float uShafts;uniform float uMaskTrust;
uniform float uTear;uniform float uVis;uniform float uLive;
uniform float uEnergy;uniform float uSpill;uniform float uChar;uniform float uReach;
uniform float uDarkIn;uniform float uScorch;uniform float uCoreK;
uniform vec3 uRimCore;uniform vec3 uRimHalo;
uniform float uArm;uniform float uTrace;uniform vec4 uCorners;
uniform sampler2D uPlate;
uniform vec4 uGrain;
uniform vec3 uFlash;
uniform float uShaftN;
float roomLike(vec2 uv){
vec2 o=2.0/uRes;float d=0.0,c=0.0;
for(int i=0;i<4;i++){
vec2 q=uv+o*vec2(i==0||i==2?1.0:-1.0,i<2?1.0:-1.0);
vec4 pl=texture(uPlate,q);
d+=length(sqrt(max(texture(uBase,q).rgb,0.0))-sqrt(max(pl.rgb,0.0)));
c+=pl.a;
}
return(1.0-smoothstep(0.035,0.11,d*0.25))*smoothstep(0.55,0.9,c*0.25);
}
float skinLike(vec3 c){
vec3 g=sqrt(max(c,0.0));vec3 ch=g/max(g.r+g.g+g.b,1e-4);
return smoothstep(0.345,0.375,ch.r)*(1.0-smoothstep(0.62,0.68,ch.r))*(1.0-smoothstep(0.07,0.11,abs(ch.g-0.3)))*smoothstep(0.04,0.09,luma(g));
}
float camGrain(vec2 uv){
vec2 g=uv*uGrain.zw;vec2 i=floor(g),f=fract(g);f=f*f*(3.0-2.0*f);
vec2 s=vec2(uGrain.y*7.13,uGrain.y*3.71);
float a=hash12(i+s),b=hash12(i+vec2(1.0,0.0)+s),c=hash12(i+vec2(0.0,1.0)+s),e=hash12(i+vec2(1.0)+s);
return(mix(mix(a,b,f.x),mix(c,e,f.x),f.y)-0.5)*5.0;
}
vec3 spillColor(){return mix(vec3(dot(uRimHalo,vec3(0.2126,0.7152,0.0722))),uRimHalo,0.5)*1.25;}
float winSDF(vec2 q,vec2 hh,out float n){
float r=min(0.016,min(hh.x,hh.y));
float d=sdRBox(q,hh,r);
float R=uGrow*(length(hh)+0.06);
float hole=length(q)-R;
float dd=max(d,hole);
n=0.0;
if(abs(dd)<0.085){
n=nA(q*1.4,uTime*0.4)*0.7+nA(q*4.6+3.0,uTime*1.15)*0.3;
hole+=n*0.055*(1.0-0.85*uGrow);
dd=max(d,hole)+n*0.0055*uTear;
}
return dd;
}
vec2 boxGrad(vec2 q,vec2 hh){
vec2 a=abs(q)-hh;
vec2 g=(a.x>0.0||a.y>0.0)?normalize(max(a,0.0)+1e-6):(a.x>a.y?vec2(1.0,0.0):vec2(0.0,1.0));
return g*vec2(q.x<0.0?-1.0:1.0,q.y<0.0?-1.0:1.0);
}
void main(){
vec2 uv=vUv;
vec2 p=(uv-0.5)*vec2(uAspect,1.0);
vec3 base=texture(uBase,uv).rgb;
vec2 q=winLocal(p);
vec2 hh=effHalf();
vec2 ao=abs(q)-hh;
float far=length(max(ao,0.0))+min(max(ao.x,ao.y),0.0);
float px=1.0/uRes.y;
if(uArm>0.0){
vec2 c1=p-uCorners.xy,c2=p-uCorners.zw;
float r1=dot(c1,c1),r2=dot(c2,c2);
if(far>0.09&&min(r1,r2)>0.012){outColor=vec4(base,1.0);return;}
float hand=uLive*texture(uHand,uv).r;
float d=sdRBox(q,hh,min(0.016,min(hh.x,hh.y)));
float ad=abs(d);
vec2 rr=abs(q)/max(hh,vec2(1e-4));
float along=rr.x>rr.y?rr.y:rr.x;
float lit=smoothstep(1.0-uTrace-0.05,1.0-uTrace+0.01,along);
float fl=0.5+0.5*smoothstep(-0.35,0.45,nA(q*5.0,uTime*7.0));
ad=abs(d+nA(q*2.6,uTime*4.0)*0.0035);
float core=exp(-ad/max(1.2*px,0.0009))*lit*fl;
float halo=exp(-ad/0.007)*lit;
vec3 g=uRimCore*core*3.2+uRimHalo*halo*0.9;
float glow=exp(-r1/0.0011)+exp(-r2/0.0011);
float pin=exp(-r1/0.00005)+exp(-r2/0.00005);
g+=(uRimHalo*1.4+uRimCore*0.4)*glow*1.2+uRimCore*pin*6.0;
g*=uArm;
vec3 sC=spillColor();
vec3 spill=base*sC*(glow*0.9+halo*0.3)*uArm;
vec3 col=base+(g+spill)*(1.0-hand*0.85)+base*sC*glow*hand*uArm*0.8;
outColor=vec4(col,1.0);
return;
}
if(uVis<0.002||far>uReach){
vec3 col=base;
if(uFlash.z>0.001){vec2 dv=p-uFlash.xy;col+=base*spillColor()*uFlash.z/(1.0+dot(dv,dv)/0.0035);}
outColor=vec4(col,1.0);return;
}
float n;
float d=winSDF(q,hh,n);
float ad=abs(d);
vec2 gw=winWorld(boxGrad(q,hh));
float m=texture(uMask,uv).r;
vec3 nrm=normalize(texture(uNormals,uv).xyz*2.0-1.0);
vec3 hh3=texture(uHand,uv).rgb;
float hand=0.0;
if(uLive*max(hh3.r,hh3.b)>0.001){
float sk=skinLike(base);
hand=uLive*max(hh3.r*mix(1.0,smoothstep(0.25,0.7,m),uMaskTrust)*sk,
hh3.b*mix(1.0,smoothstep(0.05,0.3,m),uMaskTrust)*(1.0-roomLike(uv)*(1.0-sk)));
}
float aa=1.25*px;
vec3 spillC=spillColor();
float dOut=max(d,0.0);
vec3 col;
vec3 outside=base;
if(d>-aa){
if(dOut<0.09){
float hz=exp(-dOut/0.022);
vec2 wob=vec2(nA(p*3.2,uTime*2.2),nA(p*3.2+0.5,uTime*2.2));
vec2 off=gw*0.0065*exp(-dOut/0.03)*uVis+wob*0.0022*hz*uVis;
outside=texture(uBase,uv-off/vec2(uAspect,1.0)).rgb;
if(uChar>0.001){
float charZ=uChar*smoothstep(0.034,0.0,dOut+n*0.012)*uVis;
float brown=uChar*smoothstep(0.075,0.0,dOut+n*0.02)*uVis;
outside*=mix(vec3(1.0),vec3(0.72,0.5,0.32),brown);
outside*=mix(1.0,0.05,charZ);
float en=nA(p*11.0,uTime*1.6)*0.6+nA(p*5.0+0.3,uTime*0.7)*0.4;
float emb=uChar*smoothstep(0.35,0.85,en)*exp(-dOut/0.008)*uVis;
outside+=blackbody(0.55+0.3*en)*emb*4.0;
}
}
if(uShafts>0.001&&dOut<0.2){
vec2 toC=uWin.xy-p;float lc=length(toC);vec2 dir=toC/max(lc,1e-4);
float N=uShaftN,stp=min(lc,0.22)/N,wk=exp(-0.1*9.0/N);
vec3 sh=vec3(0.0);float jit=hash12(gl_FragCoord.xy+fract(uTime*7.31)*vec2(91.7,47.3)),w=1.0,ws=0.0;
for(int i=0;i<9;i++){
if(float(i)>=N)break;
vec2 sp=p+dir*stp*(float(i)+jit);
vec2 sq=winLocal(sp);vec2 sa=abs(sq)-hh;
if(max(sa.x,sa.y)<0.0){vec3 c=texture(uGlow,sp/vec2(uAspect,1.0)+0.5).rgb;sh+=min(max(c-0.35,0.0),vec3(0.9))*w;}
ws+=w;w*=wk;
}
outside+=sh*(6.24/max(ws,1e-3))*uShafts*0.085*exp(-dOut/0.08)*uVis;
}
vec3 L=normalize(vec3(-gw*0.85,0.5));
float pm=smoothstep(0.2,0.8,m);
float ndl=mix(0.5,max(dot(nrm,L),0.0)*1.35+0.05,pm);
float x=dOut/mix(0.018,0.03,pm);
float fall=uSpill/(1.0+x*x)*smoothstep(uReach,uReach*0.35,dOut)*uVis*mix(0.3,1.0,pm);
outside+=outside*spillC*fall*ndl;
}
vec3 inside=vec3(0.0);
if(d<aa){
inside=texture(uInner,min(uv*uInnerScale,uInnerMax)).rgb;
float dIn=max(-d,0.0);
inside*=mix(1.0-uDarkIn,1.0,smoothstep(0.0,0.035,dIn));
inside=mix(inside,inside*vec3(0.8,0.58,0.36),uScorch*exp(-dIn/0.014));
inside+=(uRimHalo*exp(-dIn/0.006)*0.32+inside*spillC*exp(-dIn/0.02)*0.7)*uEnergy*(1.0-0.6*uScorch);
float L=luma(inside);
inside+=(inside/max(L,1e-4)*sqrt(max(L,0.0))+vec3(0.04))*camGrain(uv)*uGrain.x*(1.0-smoothstep(0.45,0.85,m));
inside=max(inside,0.0);
}
float inM=smoothstep(aa,-aa,d);
col=mix(outside,inside,inM);
if(ad<0.12){
vec2 aq=vec2(q.x*hh.y,q.y*hh.x);
float ang=dot(aq,aq)>1e-14?atan(aq.y,aq.x):0.0;
vec2 cs=vec2(cos(ang),sin(ang));
float flick=0.72+0.28*nA(cs*0.33,uTime*3.2);
float f0=0.5+0.5*sin(ang*9.0-uTime*6.5+n*3.0);f0*=f0;float flow=f0*f0*f0;
float f2=0.5+0.5*sin(ang*23.0+uTime*9.0-n*2.0);float a2=f2*f2;float b2=a2*a2;float flow2=b2*b2*a2;
float wc=max(max(1.3*px,0.0012),0.55/uGrain.w);
float core=exp(-ad/wc);
float halo=exp(-ad/0.0055);
float wide=exp(-ad/0.02);
float fil=0.0;
if(ad<0.04){
float fn=nA(q*3.25+gw*uTime*0.02,uTime*3.4);
fil=smoothstep(0.06,0.0,abs(fn))*exp(-max(d,-0.004)/0.006)*smoothstep(-0.006,0.0,d);
fil*=smoothstep(0.42,0.8,nA(cs*0.37+0.2,uTime*1.7)*0.5+0.5)*(1.0+1.5*exp(-max(d,0.0)/0.003));
}
vec3 cC=mix(uRimCore,vec3(1.0),0.3),hC=mix(uRimHalo,uRimCore,0.3);
vec3 rim=cC*core*(4.5+5.0*flow+3.0*flow2)*flick*uCoreK
+hC*(halo*(1.1+0.9*flow)*flick+wide*0.07*step(0.0,d))
+mix(hC,cC,0.5)*fil*1.3;
col+=rim*uEnergy*uVis;
}
if(hand>0.001){
float x=dOut/0.03;
float fh=uSpill/(1.0+x*x)*uVis;
float f1=1.0-clamp(nrm.z,0.0,1.0);
vec3 handCol=base+base*spillC*fh*(0.3+2.0*f1*f1);
col=mix(col,handCol,hand);
}
outColor=vec4(col,1.0);
}`,W=`#version 300 es
precision highp float;
layout(location=0)in vec4 aA;
layout(location=1)in vec4 aB;
uniform float uAspect;uniform vec2 uRes;
out vec2 vQ;out vec3 vDim;out float vT;out float vKind;out float vSeed;
void main(){
vec2 corner=vec2(float(gl_VertexID&1),float((gl_VertexID>>1)&1))*2.0-1.0;
vT=aB.x;vKind=aB.z;vSeed=aB.w;vQ=corner;
if(aB.x>=1.0){gl_Position=vec4(2.0,2.0,2.0,1.0);vDim=vec3(1.0);return;}
float px=1.0/uRes.y;
vec2 v=aA.zw;float sp=length(v);
vec2 dir=sp>1e-5?v/sp:vec2(1.0,0.0);
vec2 nor=vec2(-dir.y,dir.x);
float r=fract(aB.w*7.31);
float w,len;
if(aB.z<0.5){w=px*mix(0.9,2.2,r*r);len=sp*0.018;}
else if(aB.z<1.5){w=px*mix(0.7,1.6,r*r);len=sp*0.019;}
else{w=px*mix(2.0,7.5,r*r*r);len=0.0;}
float hl=len*0.5+w*1.6,hw=w*1.6;
vec2 c=aA.xy-dir*len*0.5;
vec2 pos=c+dir*corner.x*hl+nor*corner.y*hw;
vDim=vec3(hl,hw,len*0.5);
gl_Position=vec4(pos/vec2(uAspect,1.0)*2.0,0.0,1.0);
}`,_=e+t+`
in vec2 vQ;in vec3 vDim;in float vT;in float vKind;in float vSeed;
uniform sampler2D uHand;uniform sampler2D uMask;uniform float uLive;uniform vec2 uRes;uniform float uTime;uniform float uGain;
uniform vec4 uWin;uniform vec2 uRot;uniform float uAspect;uniform float uMaskTrust;
uniform vec3 uHot;uniform vec3 uCool;uniform float uGrow;uniform float uInFade;
out vec4 outColor;
void main(){
float along=vQ.x*vDim.x,across=vQ.y*vDim.y;
float da=max(abs(along)-vDim.z,0.0);
float r=length(vec2(da,across))/max(vDim.y/1.6,1e-7);
float head=clamp((along+vDim.z)/max(2.0*vDim.z,1e-7),0.0,1.0);
float a=exp(-r*r*1.3)*mix(0.12,1.0,head*head);
float fade=smoothstep(0.0,0.06,vT)*(1.0-smoothstep(0.5,1.0,vT));
vec3 col;
float hb=fract(vSeed*13.7);
float bright=0.35+1.65*hb*hb*hb;
if(vKind<0.5){
float temp=mix(0.98,0.32,vT)*(0.78+0.22*sin(uTime*31.0+vSeed*97.0));
col=blackbody(temp)*7.0*bright;
}else if(vKind<1.5){
col=mix(uHot,uCool,smoothstep(0.0,0.6,vT))*bright;
}else{
float rr=(r-0.74)*6.5;
float ring=exp(-rr*rr)*mix(0.35,1.0,smoothstep(-0.6,0.8,vQ.y*0.8-vQ.x*0.4));
vec2 gq=vQ-vec2(-0.32,0.36);
float glint=exp(-dot(gq,gq)*60.0);
a=(ring*0.7+glint*1.6)*smoothstep(1.2,0.9,r);col=vec3(0.62,1.0,1.0)*1.25;
}
vec2 uv=gl_FragCoord.xy/uRes;
if(vKind>1.5||uInFade>0.001){
vec2 pp=(uv-0.5)*vec2(uAspect,1.0)-uWin.xy;
vec2 q=vec2(pp.x*uRot.x+pp.y*uRot.y,-pp.x*uRot.y+pp.y*uRot.x);
vec2 e=abs(q)-uWin.zw;
float d=length(max(e,0.0))+min(max(e.x,e.y),0.0);
if(vKind>1.5)a*=smoothstep(0.0,-0.012,d);
else a*=mix(1.0,smoothstep(-0.07,-0.015,max(d,length(q)-uGrow*(length(uWin.zw)+0.06))),uInFade);
}
float occ=uLive*texture(uHand,uv).r*mix(1.0,smoothstep(0.25,0.7,texture(uMask,uv).r),uMaskTrust);
outColor=vec4(col*a*fade*(1.0-occ*0.92)*uGain,1.0);
}`;export{p as BILATERAL_FS,g as BILATERAL_SEP_FS,A as CAUSTIC_FS,H as CAUSTIC_G_FS,U as CAUSTIC_VS,B as COMPOSITE_FS,h as COSMOS_GEN_FS,C as DOG_FS,k as DOWN_FS,N as ENV_BLUR_FS,z as ENV_DOWN_FS,q as FACE_FS,S as FEAT_FS,F as HAND_FS,j as INNER_FS,P as JOIN_FS,w as LOWBLUR_FS,M as MACRO_BLUR_FS,T as MACRO_DOWN_FS,R as MACRO_MERGE_FS,m as NOISE_GEN_FS,D as OPEN_FS,x as SKY_GEN_FS,d as SKY_H_FS,_ as SPARK_FS,W as SPARK_VS,L as STATS_FS,b as TEMPORAL_FS,y as TENSOR_FS};
