/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-f707339784d4 */(()=>{const e=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(e)||e.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();const t=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler2DArray;
`,o=`
#define PI 3.14159265359
#define TAU 6.28318530718
float saturate(float x){return clamp(x,0.0,1.0);}
vec3 saturate(vec3 x){return clamp(x,0.0,1.0);}
float luma(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}
vec3 toLinear(vec3 c){return pow(max(c,0.0),vec3(2.2));}
vec3 toGamma(vec3 c){return pow(max(c,0.0),vec3(1.0/2.2));}
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 hash22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}
vec3 hash33(vec3 p3){p3=fract(p3*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yxz+33.33);return fract((p3.xxy+p3.yxx)*p3.zyx);}
float hash11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}
// Interleaved gradient noise: cheap, temporally stable dither.
float ign(vec2 pixel,float frame){pixel+=5.588238*mod(frame,64.0);return fract(52.9829189*fract(0.06711056*pixel.x+0.00583715*pixel.y));}
mat2 rot2(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}

// Simplex noise 3D (Ashima, MIT).
vec4 permute4(vec4 x){return mod(((x*34.0)+10.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod(i,289.0);
  vec4 p=permute4(permute4(permute4(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm3(vec3 p){float a=0.5,s=0.0;for(int i=0;i<4;i++){s+=a*snoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return s;}
// Divergence-free 2D flow from a scalar potential (cheap curl noise).
vec2 curl2(vec3 p){
  float e=0.08;
  float n1=snoise(vec3(p.x,p.y+e,p.z)),n2=snoise(vec3(p.x,p.y-e,p.z));
  float n3=snoise(vec3(p.x+e,p.y,p.z)),n4=snoise(vec3(p.x-e,p.y,p.z));
  return vec2(n1-n2,-(n3-n4))/(2.0*e);
}
vec3 curl3(vec3 p){
  const float e=0.1;
  vec3 dx=vec3(e,0,0),dy=vec3(0,e,0),dz=vec3(0,0,e);
  float x=(snoise(p+dy+vec3(31.4))-snoise(p-dy+vec3(31.4)))-(snoise(p+dz+vec3(-17.2))-snoise(p-dz+vec3(-17.2)));
  float y=(snoise(p+dz)-snoise(p-dz))-(snoise(p+dx+vec3(31.4))-snoise(p-dx+vec3(31.4)));
  float z=(snoise(p+dx+vec3(-17.2))-snoise(p-dx+vec3(-17.2)))-(snoise(p+dy)-snoise(p-dy));
  return vec3(x,y,z)/(2.0*e);
}
// Physically plausible blackbody tint, t in [0,1] maps ~1000K..12000K.
vec3 blackbody(float t){
  t=saturate(t);
  vec3 c=vec3(1.0,0.18+0.82*smoothstep(0.0,0.6,t),0.02+0.98*smoothstep(0.25,1.0,t));
  return c*c;
}
`,a=`
vec3 agxContrast(vec3 x){
  vec3 x2=x*x;vec3 x4=x2*x2;
  return 15.5*x4*x2-40.14*x4*x+31.96*x4-6.868*x2*x+0.4298*x2+0.1191*x-0.00232;
}
vec3 agx(vec3 c){
  const mat3 inset=mat3(0.842479062253094,0.0423282422610123,0.0423756549057051,
    0.0784335999999992,0.878468636469772,0.0784336,
    0.0792237451477643,0.0791661274605434,0.879142973793104);
  const mat3 outset=mat3(1.19687900512017,-0.0528968517574562,-0.0529716355144438,
    -0.0980208811401368,1.15190312990417,-0.0980434501171241,
    -0.0990297440797205,-0.0989611768448433,1.15107367264116);
  const float minEv=-12.47393,maxEv=4.026069;
  c=inset*c;
  c=clamp(log2(max(c,1e-10)),minEv,maxEv);
  c=(c-minEv)/(maxEv-minEv);
  c=agxContrast(c);
  c=outset*c;
  return pow(max(c,0.0),vec3(2.2));
}
// Faithful tone curve: identity below the knee so the camera stays true,
// smooth exponential shoulder above it, and hot highlights bleed to white.
vec3 softTonemap(vec3 c){
  c=max(c,0.0);
  float l=max(c.r,max(c.g,c.b));
  const float k=0.78;
  float lm=l<k?l:k+(1.0-k)*(1.0-exp(-(l-k)/(1.0-k)));
  vec3 m=c*(lm/max(l,1e-5));
  float over=max(l-1.0,0.0);
  return mix(m,vec3(lm),1.0-exp(-over*0.45));
}
vec3 agxPunchy(vec3 c,float saturation){
  float l=luma(c);
  c=mix(vec3(l),c,saturation);
  return c;
}
`;export{o as COMMON,t as HEADER,a as TONEMAP};
