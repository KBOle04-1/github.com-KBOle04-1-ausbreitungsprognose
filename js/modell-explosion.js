/* ---------- Blast-Cast: Druckwelle ---------- */
// Spitzenüberdruck im Verhältnis zum Luftdruck nach Kinney und Graham, Z = skalierter Abstand in m/kg^(1/3)
function blastRatio(Z){
  return 808*(1+(Z/4.5)**2)/(Math.sqrt(1+(Z/0.048)**2)*Math.sqrt(1+(Z/0.32)**2)*Math.sqrt(1+(Z/1.35)**2));
}
// Entfernung (m), in der der Überdruck ps (Pa) erreicht wird; Wkg TNT an der Oberfläche (Faktor 1,8), Luftdruck p0 (Pa)
function blastRadius(Wkg, ps, p0){
  const W=1.8*Wkg, target=ps/p0;
  let lo=0.05, hi=5000;
  for(let i=0;i<80;i++){ const mid=Math.sqrt(lo*hi); if(blastRatio(mid)>target) lo=mid; else hi=mid; }
  return lo*Math.cbrt(W)/Math.cbrt(p0/101325);
}
// Druckschatten: 1, wenn die Sichtlinie vom Explosionsort (hs über Grund) zum Punkt (hr über Grund) vom Gelände unterbrochen ist
function blastShadow(T, hs, hr){
  const N=T.N, out=new Uint8Array(N*N), z0=T.hsrc+hs;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){
    const x=-T.R+i*T.cell, y=-T.R+j*T.cell, d=Math.hypot(x,y), n=Math.ceil(d/T.cell), z1=T.h[j*N+i]+hr;
    for(let q=1;q<n;q++){ const f=q/n; if(bil(T,T.h,x*f,y*f)>z0+(z1-z0)*f+2){ out[j*N+i]=1; break; } }
  }
  return out;
}

// BLEVE: Feuerball und Wärmestrahlung. M = Masse Flüssiggas kg, Tc °C, rh %
function bleve(M, Tc, rh){
  const D=5.8*Math.cbrt(M), t=M<30000?0.45*Math.cbrt(M):2.6*Math.pow(M,1/6), H=0.75*D;
  const E=Math.min(350,0.3*M*46000/(Math.PI*D*D*t));                       // Abstrahlung der Oberfläche kW/m²
  const pw=Math.max(rh,5)/100*610.94*Math.exp(17.625*Tc/(Tc+243.04));       // Wasserdampfdruck Pa
  const q=x=>{ const L=Math.hypot(x,H), tau=Math.min(1,2.02*Math.pow(pw*Math.max(L-D/2,1),-0.09)); return tau*E*(D/2)**2/(L*L); };
  const rFor=tdu=>{ const qn=Math.pow(tdu/t,0.75); if(q(0)<qn) return 0; let lo=0, hi=50000; for(let i=0;i<60;i++){ const m=(lo+hi)/2; if(q(m)>qn) lo=m; else hi=m; } return lo; };
  return {D,t,H,E,q,rFor};
}
