/* ---------- Schwergas: Britter-McQuaid ---------- */
// Vereinfachtes Schwergasverfahren nach Britter & McQuaid (1988), Workbook on the Dispersion of Dense Gases.
// Liefert die Entfernung in Windrichtung bis zu einem Konzentrationsverhältnis Cm/C0 am Boden auf der Wolkenachse,
// für ebenes, hindernisarmes Gelände. Kein zeitabhängiges und kein dreidimensionales Modell.
// Kurvenstücke beta = a*alpha + b für alpha <= alphaMax, je Konzentrationsverhältnis: [Verhältnis, [[alphaMax, a, b], ...]].
// Herkunft und Prüfstand der Zahlen: docs/Britter-McQuaid.md.
const BM_PLUME=[
  [0.1,  [[-0.55,0,1.75],[-0.14,0.24,1.88],[1,-0.50,1.78]]],
  [0.05, [[-0.68,0,1.92],[-0.29,0.36,2.16],[-0.18,0,2.06],[1,-0.56,1.96]]],
  [0.02, [[-0.69,0,2.08],[-0.31,0.45,2.39],[-0.16,0,2.25],[1,-0.54,2.16]]],
  [0.01, [[-0.70,0,2.25],[-0.29,0.49,2.59],[-0.20,0,2.45],[1,-0.52,2.35]]],
  [0.005,[[-0.67,0,2.40],[-0.28,0.59,2.80],[-0.15,0,2.63],[1,-0.49,2.56]]],
  [0.002,[[-0.69,0,2.60],[-0.25,0.39,2.87],[-0.13,0,2.77],[1,-0.50,2.71]]]];
const BM_PUFF=[
  [0.1,  [[-0.44,0,0.70],[0.43,0.26,0.81],[1,0,0.93]]],
  [0.05, [[-0.56,0,0.85],[0.31,0.26,1.00],[1,-0.12,1.12]]],
  [0.02, [[-0.66,0,0.95],[0.32,0.36,1.19],[1,-0.26,1.38]]],
  [0.01, [[-0.71,0,1.15],[0.37,0.34,1.39],[1,-0.38,1.66]]],
  [0.005,[[-0.52,0,1.48],[0.24,0.26,1.62],[1,-0.30,1.75]]],
  [0.002,[[0.27,0,1.83],[1,-0.32,1.92]]],
  [0.001,[[-0.10,0,2.075],[1,-0.27,2.05]]]];
const BM_DENSE_CONT=0.15, BM_DENSE_INST=0.20;   // Schwergaskriterien des Workbooks
const BM_CONT=2.5, BM_INST=0.6;                 // u*Rd/x: ab 2,5 kontinuierlich, bis 0,6 momentan
const R_GAS=8.314462, M_AIR=0.028964, CP_AIR=1005;   // J/(mol K), kg/mol, J/(kg K)
function bmBeta(segs, alpha){
  for(const [amax,a,b] of segs) if (alpha<=amax) return a*alpha+b;
  const q=segs[segs.length-1]; return q[1]*alpha+q[2];           // alpha > 1: außerhalb, Aufrufer warnt
}
// beta für ein beliebiges Verhältnis innerhalb der Kurvenschar, linear in log10(Verhältnis)
function bmBetaAt(tab, alpha, ratio){
  const hi=tab[0][0], lo=tab[tab.length-1][0];
  if (ratio>hi) return {beta:bmBeta(tab[0][1],alpha), range:'ueber'};
  if (ratio<lo) return {beta:bmBeta(tab[tab.length-1][1],alpha), range:'unter'};
  for(let i=0;i<tab.length-1;i++){
    const [r1,s1]=tab[i], [r2,s2]=tab[i+1];
    if (ratio<=r1 && ratio>=r2){ const f=(Math.log10(r1)-Math.log10(ratio))/(Math.log10(r1)-Math.log10(r2)); return {beta:bmBeta(s1,alpha)*(1-f)+bmBeta(s2,alpha)*f, range:'ok'}; }
  }
  return {beta:bmBeta(tab[0][1],alpha), range:'ok'};
}
// Anfangszustand der Wolke. zustand: 'gas' (Umgebungstemperatur), 'kalt' (Dampf bei Siedetemperatur),
// 'zweiphasig' (druckverflüssigt). Für 'zweiphasig' wird die gesamte Masse als reiner Dampf bei Siedetemperatur angesetzt
// (kein Ausregnen, keine Vorverdünnung); der Anteil der Entspannungsverdampfung wird nur ausgewiesen.
// Begründung und Vergleich mit der Variante „Vorverdünnung mit Luft": docs/Validierung.md.
// th = {Tb [K], dHv [J/kg], cpl [J/(kg K)]}; Ts = Lagertemperatur [K]. Rückgabe in SI, vol = m³ Wolke je kg Stoff.
function bmInit(o){
  const M=o.M/1000, Ta=o.Ta, p=o.p, rhoA=p*M_AIR/(R_GAS*Ta), th=o.th;
  let T0=Ta, flash=null, zustand='gas';
  if ((o.zustand==='kalt'||o.zustand==='zweiphasig') && th && Ta>th.Tb){
    T0=th.Tb; zustand=o.zustand;
    if (o.zustand==='zweiphasig' && th.cpl) flash=Math.min(1,Math.max(0,th.cpl*((o.Ts||Ta)-th.Tb)/th.dHv));
  }
  const vol=R_GAS*T0/(p*M), rho0=1/vol;
  return {zustand, T0, C0:1, flash, vol, rho0, rhoA, g0:GRAV*(rho0-rhoA)/rhoA, Ta, p, M};
}
// Q: {init, u (Wind in 10 m, m/s), rate (kg/s), dur (s), mass (kg), inst (bool)}; C = geforderter Stoffmengenanteil.
function bmDistance(Q, C){
  const I=Q.init, u=Q.u, g0=I.g0, out={flags:[]};
  if (!(g0>0)) return {dense:false, flags:['nicht schwerer als Luft']};
  const Cs=C/(C+(1-C)*I.Ta/I.T0);                 // Korrektur für nicht isotherme Freisetzung
  const ratio=Cs/I.C0; out.ratio=ratio;
  let xc=null, xi=null;
  if (!Q.inst && Q.rate>0){
    const q0=Q.rate*I.vol, Dc=Math.sqrt(q0/u), al=Math.log10(Math.pow(g0*g0*q0/Math.pow(u,5),0.2)), b=bmBetaAt(BM_PLUME,al,ratio);
    xc={x:Dc*Math.pow(10,b.beta), alpha:al, range:b.range, crit:Math.cbrt(g0*q0/Dc)/u, L:Dc};
  }
  const mass=Q.inst?Q.mass:Q.rate*Q.dur;
  if (mass>0){
    const V0=mass*I.vol, Di=Math.cbrt(V0), al=Math.log10(Math.sqrt(g0*Di/(u*u))), b=bmBetaAt(BM_PUFF,al,ratio);
    xi={x:Di*Math.pow(10,b.beta), alpha:al, range:b.range, crit:Math.sqrt(g0*V0)/(u*Di), L:Di};
  }
  let use;
  if (!xc) { use=xi; out.regime='momentan'; }
  else if (u*Q.dur/xc.x>=BM_CONT) { use=xc; out.regime='kontinuierlich'; }
  else if (xi && u*Q.dur/xi.x<=BM_INST) { use=xi; out.regime='momentan'; }
  else { use=(xi&&xi.x>xc.x)?xi:xc; out.regime='Übergang'; out.flags.push('Freisetzungsdauer im Übergangsbereich zwischen kontinuierlich und momentan: größerer der beiden Abstände verwendet'); }
  out.cont=xc; out.inst=xi; out.x=use.x; out.alpha=use.alpha; out.range=use.range; out.crit=use.crit;
  out.dense=use===xc?use.crit>=BM_DENSE_CONT:use.crit>=BM_DENSE_INST;
  if (use.alpha>1) out.flags.push('Kennzahl alpha über dem Kurvenbereich des Workbooks');
  if (use.range==='ueber') out.flags.push('Konzentration über dem Kurvenbereich (C/C0 > 0,1): Nahbereich nicht berechenbar');
  if (use.range==='unter') out.flags.push('Konzentration unter dem Kurvenbereich (C/C0 < '+(use===xc?'0,002':'0,001')+')');
  return out;
}
// Umkehrung für Vergleichsrechnungen: Stoffmengenanteil in der Entfernung x; range 'ueber'/'unter', wenn x außerhalb der Kurven liegt
function bmConcAt(Q, x){
  const I=Q.init, toC=cs=>cs*(I.Ta/I.T0)/(1+cs*(I.Ta/I.T0-1));
  const probe=bmDistance(Q,0.01); if (!probe.x) return null;
  const inst=probe.regime!=='kontinuierlich', hi=toC(0.1*I.C0), lo=toC((inst?0.001:0.002)*I.C0);
  if (x<bmDistance(Q,hi).x) return {C:null, range:'ueber'};
  if (x>bmDistance(Q,lo).x) return {C:null, range:'unter'};
  let a=lo, b=hi;
  for(let i=0;i<70;i++){ const m=Math.sqrt(a*b); if (bmDistance(Q,m).x>x) a=m; else b=m; }
  return {C:a, range:'ok', regime:bmDistance(Q,a).regime};
}
// Schwergas-Entfernung je Schwelle. Innerhalb der Kurven: berechnet. Unterhalb (C/C0 < 0,002 bzw. 0,001): abgeleitet,
// indem die Wolke ab der letzten Kurve wie eine passive Gauß-Wolke weiter verdünnt wird (Anschluss über eine Ersatzquelle).
// w: {u10, cls}; Mg: molare Masse g/mol.
function denseDistance(Q, C, w, urban, Mg){
  const d=bmDistance(Q,C), inst=d.regime==='momentan'||(d.regime==='Übergang'&&d.inst&&d.x===d.inst.x);
  const res={regime:d.regime,flags:d.flags,alpha:d.alpha,ratio:d.ratio};
  if (d.range==='ok'){ res.x=d.x; res.kind='berechnet'; return res; }
  if (d.range==='ueber'){ res.x=null; res.kind='Nahbereich'; res.max=d.x; return res; }
  const I=Q.init, lim=(inst?0.001:0.002)*I.C0, Clim=lim*(I.Ta/I.T0)/(1+lim*(I.Ta/I.T0-1)), xt=bmDistance(Q,Clim*1.0000001).x;
  const mc=c=>c*I.p*Mg/1000/(R_GAS*I.Ta), u=Math.max(w.u10,0.5), mass=Q.inst?Q.mass:Q.rate*Q.dur;
  const gauss=x=>{ const [sy,sz]=sigma(w.cls,x,urban); return inst?2*mass/(Math.pow(6.2832,1.5)*sy*sy*sz):Q.rate/(Math.PI*sy*sz*u); };
  const inv=c=>{ let lo=1, hi=5e5; for(let i=0;i<70;i++){ const m=Math.sqrt(lo*hi); if (gauss(m)>c) lo=m; else hi=m; } return lo; };
  res.x=xt+Math.max(0,inv(mc(C))-inv(mc(Clim))); res.kind='abgeleitet'; res.xt=xt;
  return res;
}
