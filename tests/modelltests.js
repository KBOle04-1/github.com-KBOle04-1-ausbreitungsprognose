// Automatische Prüfung der Rechenmodelle. Aufruf: node tests/modelltests.js
// Lädt die Modelldateien ohne Browser, rechnet die Prüffälle und schreibt docs/Validierung-Ergebnisse.md.
// Nicht bestandene Fälle bleiben sichtbar; Referenzwerte werden nicht an das Ergebnis angepasst.
const fs=require('fs'), path=require('path'), vm=require('vm');
const root=path.join(__dirname,'..'), ctx=vm.createContext({console,Math});
for(const f of ['modell-ausbreitung.js','modell-schwergas.js','modell-vegetationsbrand.js','modell-explosion.js'])
  vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
const m=new Proxy({},{get:(_,k)=>vm.runInContext(String(k),ctx)});
const rows=[]; let fail=0;
// art: 'A' analytische Lösung, 'L' Lehrbuch/veröffentlichtes Rechenbeispiel, 'V' veröffentlichte Versuchsdaten, 'K' Konsistenzprüfung
function check(id,art,name,ist,soll,lo,hi,einheit,quelle){
  const rel=soll?ist/soll:NaN, ok=rel>=lo&&rel<=hi; if(!ok) fail++;
  rows.push({id,art,name,ist,soll,rel,ok,lo,hi,einheit,quelle});
}
const wx=(cls,u,zi)=>()=>({u10:u,dx:1,dy:0,cls,zi:zi||0,Tk:288});
const N=121, KL='ABCDEF';

// --- Gauß-Puff gegen stationäre Gauß-Fahne, Bodenkonzentration auf der Achse in 1 km ---
let k=1;
for(const urban of [false,true]) for(const cls of [0,1,2,3,4,5]){
  const R=2000, u=3, P={nSlots:2,R,terrain:null,urban,wx:wx(cls,u),fireMW:0,dense:false,inst:false,rateKgS:1,durS:3600,H0:0,sy0:2,sz0:1};
  const sn=m.trackPuffs(P), f=m.evalField(sn[sn.length-1],P,{N,R}), cell=2*R/(N-1), c=f[60*N+Math.round(3000/cell)];
  const [sy,sz]=m.sigma(cls,1000,urban), an=1/(Math.PI*Math.hypot(sy,2)*Math.hypot(sz,1)*u);
  check('G'+String(k++).padStart(2,'0'),'A',`Gauß-Fahne ${urban?'Bebauung':'Freifläche'}, Klasse ${KL[cls]}, 3 m/s, 1 km`,c*1e6,an*1e6,0.85,1.15,'mg/m³ je kg/s','Q/(π·σy·σz·u)');
}
{ const R=2000, P={nSlots:2,R,terrain:null,urban:false,wx:wx(3,3),fireMW:0,dense:false,inst:false,rateKgS:1,durS:3600,H0:50,sy0:2,sz0:1};
  const sn=m.trackPuffs(P), f=m.evalField(sn[sn.length-1],P,{N,R}), cell=2*R/(N-1), c=f[60*N+Math.round(3000/cell)], [sy,sz]=m.sigma(3,1000,false), uh=3*Math.pow(5,0.15);
  check('G13','A','Gauß-Fahne Quellhöhe 50 m, Klasse D, 1 km',c*1e6,1e6/(Math.PI*Math.hypot(sy,2)*Math.hypot(sz,1)*uh)*Math.exp(-2500/(2*(sz*sz+1))),0.85,1.15,'mg/m³ je kg/s','Gauß-Fahne mit Bodenreflexion');
}
{ const R=5000, P={nSlots:1,R,terrain:null,urban:false,wx:wx(3,3),fireMW:0,dense:false,inst:true,massKg:1000,durS:0,H0:0,sy0:5,sz0:2};
  const sn=m.trackPuffs(P), s=sn.find(q=>q.t===600), p=s.puffs[0], f=m.evalField(s,P,{N,R}), cell=2*R/(N-1); let I=0; for(const v of f) I+=v*cell*cell;
  check('G14','K','Massenerhaltung Einzelwolke 1000 kg nach 10 min',I*p.sz*Math.sqrt(Math.PI/2),1000,0.97,1.03,'kg','Integral der Bodenkonzentration');
}
// --- Reichweite unabhängig vom Raster (axisReach) gegen analytische Reichweite, Chlor 0,5 kg/s ---
{ const vm0=22.414*288/273.15, thr=[0.5,2,20].map(v=>v*70.9/vm0*1e-6);
  const ana=(cls,u)=>thr.map(t=>{let lo=1,hi=2e5;for(let i=0;i<60;i++){const x=Math.sqrt(lo*hi),[sy,sz]=m.sigma(cls,x,false);if(0.5/(Math.PI*Math.hypot(sy,2)*Math.hypot(sz,1)*u)>t)lo=x;else hi=x;}return lo;});
  let q=1;
  for(const [cls,u,R,n,ls] of [[3,3,10000,8,[1,2]],[3,3,50000,24,[0,1,2]],[5,1.5,50000,48,[1,2]],[0,2,5000,8,[0,1,2]],[3,10,20000,8,[0,1,2]]]){
    const P={nSlots:n,R,terrain:null,urban:false,wx:wx(cls,u),fireMW:0,dense:false,inst:false,rateKgS:0.5,durS:n*900,H0:1,sy0:2,sz0:1}, r=[0,0,0];
    for(const s of m.trackPuffs(P)){ const a=m.axisReach(s,P,thr); for(let l=0;l<3;l++) if(a[l].r>r[l]) r[l]=a[l].r; }
    const an=ana(cls,u);
    for(const l of ls) check('R'+String(q++).padStart(2,'0'),'A',`Reichweite AEGL-${l+1} Chlor 0,5 kg/s, Klasse ${KL[cls]}, ${u} m/s, Gebiet ± ${R/1000} km`,r[l],an[l],0.8,1.2,'m','Gauß-Fahne, Achse');
  }
}
// --- Britter-McQuaid ---
{ let jump=0; for(const tab of [m.BM_PLUME,m.BM_PUFF]) for(const [r,segs] of tab) for(let i=0;i<segs.length-1;i++){ const a=segs[i][0]; jump=Math.max(jump,Math.abs(segs[i][1]*a+segs[i][2]-(segs[i+1][1]*a+segs[i+1][2]))); }
  check('B01','K','Britter-McQuaid: größter Sprung zwischen Kurvenstücken (soll unter 0,02 in log10)',jump+1,1,1,1.02,'1 + Sprung','Stetigkeit der Nomogrammkurven');
  const I=m.bmInit({M:16.04,Ta:298,p:101325,zustand:'kalt',th:{Tb:111.7,dHv:510e3}});
  const d=m.bmDistance({init:I,u:10.9,rate:0.23*425.6,dur:1e6,mass:0,inst:false},0.05);
  check('B02','L','Britter-McQuaid: Flüssigerdgas 0,23 m³/s, Wind 10,9 m/s, Entfernung bis 5 Vol.-%',d.x,367,0.95,1.05,'m','Rechenbeispiel Crowl & Louvar, Chemical Process Safety (aus dem Gedächtnis zitiert, Abgleich steht aus)');
  // Jack Rabbit II: Versuche 6, 7, 9
  const obs={6:{0.2:44000,1:1900,2:630},7:{0.2:70000,2:1200,5:340,11:50},9:{0.2:29000,1:1900,2:1300,5:300,11:100}};
  const tr={6:[33.2,8392,2.3,22.0],7:[36.4,8620,4.5,18.9],9:[133,17700,3.5,10.5]};
  let q=1;
  for(const t of [6,7,9]){ const [dur,mass,u2,T]=tr[t], u=u2*Math.log(10/0.001)/Math.log(2/0.001), Ta=T+273.15;
    const I2=m.bmInit({M:70.9,Ta,p:87000,zustand:'zweiphasig',Ts:Ta,th:{Tb:239.1,dHv:288e3,cpl:930}}), Q={init:I2,u,rate:mass/dur,dur,mass:0,inst:false};
    for(const x of Object.keys(obs[t]).sort((a,b)=>a-b)){ const o=obs[t][x], dd=m.denseDistance(Q,o*1e-6,{u10:u,cls:3},false,70.9);
      check('J'+String(q++).padStart(2,'0'),'V',`Jack Rabbit II Versuch ${t}: Entfernung, in der ${o.toLocaleString('de-DE')} ppm erreicht werden (${dd.kind})`,dd.x,x*1000,0.5,2,'m','gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al.');
    }
  }
  const Ia=m.bmInit({M:17.03,Ta:288,p:101325,zustand:'gas'}), Ic=m.bmInit({M:70.9,Ta:288,p:101325,zustand:'gas'});
  check('B03','K','Modellwahl: Ammoniakgas bei Umgebungstemperatur ist leichter als Luft (g0 < 0)',Ia.g0<0?1:0,1,1,1,'ja = 1','Dichtevergleich');
  check('B04','K','Modellwahl: Chlor 0,5 kg/s bei 3 m/s erfüllt das Schwergaskriterium',m.bmDistance({init:Ic,u:3,rate:0.5,dur:1800,mass:0,inst:false},0.01).dense?1:0,1,1,1,'ja = 1','Kennzahl ≥ 0,15');
  // Handrechnung: q0 = 0,001/2,999 = 3,33e-4 m³/s; g0' = 14,2 m/s²; Kennzahl = (g0'·q0/√(q0/u))^(1/3)/u = 0,094
  check('B05','K','Modellwahl: Kennzahl für Chlor 0,001 kg/s bei 10 m/s (unter 0,15, also passiv)',m.bmDistance({init:Ic,u:10,rate:0.001,dur:1800,mass:0,inst:false},0.01).crit,0.094,0.97,1.03,'–','Handrechnung');
}
// --- Vegetationsbrand: Ellipse ---
{ const Nv=241,R=5000,cell=2*R/(Nv-1),V={N:Nv,R,terrain:null,k:0.2,R0:0.03,state:1,r0:10,tEnd:3600,wx:()=>({u10:5,dx:1,dy:0,T:25,rh:35,prec:0})};
  const a=m.spreadFire(V), p=m.rosParams(V.wx(0),V); let xmax=0,ymax=0; for(let j=0;j<Nv;j++)for(let i=0;i<Nv;i++) if(a[j*Nv+i]<=3600){ const x=-R+i*cell,y=-R+j*cell; if(x>xmax)xmax=x; if(y>ymax)ymax=y; }
  const A=p.Rh*3600/(1+p.e);
  check('V01','K','Vegetationsbrand: Kopf der Brandellipse nach 1 h',xmax,p.Rh*3600,0.95,1.05,'m','vorgegebene Ellipse');
  check('V02','K','Vegetationsbrand: Halbbreite der Brandellipse nach 1 h',ymax,A*Math.sqrt(1-p.e*p.e),0.9,1.1,'m','vorgegebene Ellipse');
}
// --- Explosion, BLEVE ---
check('E01','L','Kinney-Graham: Überdruck bei skaliertem Abstand 10 m/kg^(1/3)',m.blastRatio(10)*101.325,10,0.85,1.15,'kPa','Größenordnung nach Kingery-Bulmash-Kurven (aus dem Gedächtnis, Abgleich steht aus)');
check('E02','L','BLEVE: Feuerballradius Tank 4000 l (2000 kg Propan angenommen)',m.bleve(2000,15,60).D/2,38,0.9,1.1,'m','Transport Canada, BLEVE – Response and Prevention');
check('E03','L','BLEVE: Feuerballradius Tank 40 000 l (20 000 kg Propan angenommen)',m.bleve(20000,15,60).D/2,81,0.9,1.1,'m','Transport Canada, BLEVE – Response and Prevention');

// --- Ausgabe ---
const f3=v=>Number.isFinite(v)?Number(v.toPrecision(3)).toLocaleString('de-DE'):'–';
let md='# Validierung: Ergebnisse des automatischen Prüflaufs\n\nErzeugt von `node tests/modelltests.js`. Diese Datei nicht von Hand ändern.\n\n'
 +'Art der Referenz: **A** analytische Lösung, **L** Lehrbuch oder veröffentlichtes Rechenbeispiel, **V** veröffentlichte Versuchsdaten, **K** Konsistenzprüfung der Umsetzung.\n\n'
 +`Geprüft: ${rows.length} Fälle, bestanden: ${rows.length-fail}, nicht bestanden: ${fail}.\n\n`
 +'| Nr. | Art | Prüffall | Ergebnis | Referenz | Einheit | Verhältnis | Zulässig | Bewertung | Referenzquelle |\n|---|---|---|---|---|---|---|---|---|---|\n';
for(const r of rows) md+=`| ${r.id} | ${r.art} | ${r.name} | ${f3(r.ist)} | ${f3(r.soll)} | ${r.einheit} | ${f3(r.rel)} | ${f3(r.lo)} bis ${f3(r.hi)} | ${r.ok?'bestanden':'**nicht bestanden**'} | ${r.quelle} |\n`;
fs.writeFileSync(path.join(root,'docs','Validierung-Ergebnisse.md'),md);
for(const r of rows) console.log((r.ok?'ok   ':'FEHL ')+r.id+' '+r.name+': '+f3(r.ist)+' / '+f3(r.soll)+' = '+f3(r.rel));
console.log(`\n${rows.length} Fälle, ${fail} nicht bestanden.`);
process.exitCode=0;   // nicht bestandene Fälle sind dokumentierte Befunde, kein Abbruchgrund
