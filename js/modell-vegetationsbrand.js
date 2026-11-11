/* ---------- Vegetationsbrand ---------- */
// Feuchte des feinen toten Brennmaterials in % (Simard 1968) aus Temperatur °C und relativer Feuchte %
function fuelMoisture(Tc, rh){
  const T=Tc*9/5+32; let m;
  if (rh<10) m=0.03229+0.281073*rh-0.000578*rh*T;
  else if (rh<50) m=2.22749+0.160107*rh-0.014784*T;
  else m=21.0606+0.005565*rh*rh-0.00035*rh*T-0.483199*rh;
  return Math.max(1,m);
}
// V: {k, R0, state}; w: {u10, dx, dy, T, rh, prec}  ->  Kopf-Ausbreitung Rh (m/s), Exzentrizität e
function rosParams(w, V){
  const fmc=fuelMoisture(w.T,w.rh);
  let fm=Math.min(1.3,Math.exp(-0.108*(fmc-6)))*V.state;
  if (w.prec>0.5) fm*=0.1; else if (w.prec>0.1) fm*=0.4;
  const u=Math.max(w.u10,0), LB=Math.min(6,1+0.3*u);
  return {Rh:(V.R0+V.k*u)*fm, e:Math.sqrt(1-1/(LB*LB)), Rmin:0.5*V.R0*fm, fmc, dx:w.dx, dy:w.dy};
}
// Ankunftszeit der Feuerfront (s) je Rasterzelle; V: {N,R,terrain|null,k,R0,state,r0,tEnd,wx(t)}
function spreadFire(V){
  const N=V.N, R=V.R, cell=2*R/(N-1), T=V.terrain, arr=new Float32Array(N*N).fill(Infinity);
  let hf=null;
  if (T){ hf=new Float32Array(N*N); for(let j=0;j<N;j++)for(let i=0;i<N;i++) hf[j*N+i]=bil(T,T.h,-R+i*cell,-R+j*cell); }
  const NB=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]
    .map(([a,b])=>{const n=Math.hypot(a,b);return {a,b,d:n*cell,ux:a/n,uy:b/n};});
  const ht=[], hk=[];
  const push=(t,k)=>{let i=ht.length;ht.push(t);hk.push(k);while(i>0){const p=(i-1)>>1;if(ht[p]<=t)break;ht[i]=ht[p];hk[i]=hk[p];i=p;}ht[i]=t;hk[i]=k;};
  const pop=()=>{const t0=ht[0],k0=hk[0],t=ht.pop(),k=hk.pop(),n=ht.length;if(n){let i=0;for(;;){let c=2*i+1;if(c>=n)break;if(c+1<n&&ht[c+1]<ht[c])c++;if(ht[c]>=t)break;ht[i]=ht[c];hk[i]=hk[c];i=c;}ht[i]=t;hk[i]=k;}return [t0,k0];};
  const c0=(N-1)/2, rc=Math.max(V.r0/cell,0.6), m=Math.ceil(rc);
  for(let j=c0-m;j<=c0+m;j++)for(let i=c0-m;i<=c0+m;i++) if(Math.hypot(i-c0,j-c0)<=rc){arr[j*N+i]=0;push(0,j*N+i);}
  const cache={};
  while(ht.length){
    const [t,k]=pop();
    if (t>arr[k]) continue;
    if (t>V.tEnd) break;
    const b=Math.floor(t/300), p=cache[b]||(cache[b]=rosParams(V.wx(b*300+150),V));
    const i=k%N, j=(k-i)/N;
    for(const n of NB){
      const ii=i+n.a, jj=j+n.b;
      if (ii<0||jj<0||ii>=N||jj>=N) continue;
      const kk=jj*N+ii;
      if (arr[kk]<=t) continue;
      let ros=Math.max(p.Rh*(1-p.e)/(1-p.e*(n.ux*p.dx+n.uy*p.dy)),p.Rmin);
      if (hf) ros*=Math.min(5,Math.max(0.3,Math.exp(0.069*Math.atan((hf[kk]-hf[k])/n.d)*57.2958)));
      if (ros<=1e-5) continue;
      const tt=Math.fround(t+n.d/ros);
      if (tt<arr[kk]){ arr[kk]=tt; push(tt,kk); }
    }
  }
  return arr;
}
