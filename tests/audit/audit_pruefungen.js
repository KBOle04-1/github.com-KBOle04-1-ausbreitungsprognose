// Prüfungen zum technischen Code-Audit (Schritt 1). Nur lesend: lädt die Modelldateien und rechnet.
// Aufruf: node tests/audit/audit_pruefungen.js   -> schreibt docs/TECHNISCHER_CODE_AUDIT_Anhang.md
const fs=require('fs'), path=require('path'), vm=require('vm');
const root=path.join(__dirname,'..','..'), ctx=vm.createContext({console,Math});
for(const f of ['modell-ausbreitung.js','modell-schwergas.js','modell-vegetationsbrand.js','modell-explosion.js'])
  vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
const m=new Proxy({},{get:(_,k)=>vm.runInContext(String(k),ctx)});
const f3=v=>typeof v==='number'?(Number.isFinite(v)?Number(v.toPrecision(3)).toLocaleString('de-DE'):String(v)):String(v);
const T=[]; // Funktionstests
function ft(fn,art,fall,erwartet,run,ok){ let ist,bew; try{ ist=run(); bew=ok(ist)?'bestanden':'**nicht bestanden**'; }catch(e){ ist='Abbruch: '+e.message; bew='**nicht bestanden**'; }
  T.push(`| ${fn} | ${art} | ${fall} | ${erwartet} | ${Array.isArray(ist)?ist.map(f3).join(' / '):f3(ist)} | ${bew} |`); }
const fin=v=>Number.isFinite(v), near=(a,b,t)=>Math.abs(a/b-1)<=t;
const wx=(cls,u,zi)=>()=>({u10:u,dx:1,dy:0,cls,zi:zi||0,Tk:288});
const N=121, base=(o)=>Object.assign({nSlots:2,R:2000,terrain:null,urban:false,wx:wx(3,3),fireMW:0,dense:false,inst:false,rateKgS:1,durS:3600,H0:0,sy0:2,sz0:1},o);
const peak=P=>{ const sn=m.trackPuffs(P); if(!sn.length) return 0; const f=m.evalField(sn[sn.length-1],P,{N,R:P.R}); let mx=-Infinity,mn=Infinity; for(const v of f){ if(v>mx)mx=v; if(v<mn)mn=v; } return [mx,mn]; };

ft('sigma','Normal','Klasse D, 1000 m, Freifläche','76,3 / 37,9 m (Handrechnung)',()=>m.sigma(3,1000,false),v=>near(v[0],76.28,0.01)&&near(v[1],37.95,0.01));
ft('sigma','Grenz','x = 0 und x = −50','wie x = 1 m, endlich, positiv',()=>[...m.sigma(3,0,false),...m.sigma(3,-50,false)],v=>v.every(q=>fin(q)&&q>0)&&v[0]===v[2]);
ft('sigma','Extrem','x = 1000 km, Klasse A Bebauung','endlich, σz höchstens 5000 m',()=>m.sigma(0,1e6,true),v=>fin(v[0])&&v[1]<=5000);
ft('stabClass','Normal','4 m/s, 400 W/m²','C (2)',()=>m.stabClass(4,400,0),v=>v===2);
ft('stabClass','Grenz','genau 2 m/s, 20 W/m², 50 % Bewölkung','eine gültige Klasse 0 bis 5',()=>m.stabClass(2,20,50),v=>v>=0&&v<=5);
ft('stabClass','Extrem','ungültige Eingaben (NaN)','Fehler oder Kennzeichnung erwartet',()=>m.stabClass(NaN,NaN,NaN),v=>!(v>=0&&v<=5));
ft('vertTerm','Normal','d = 0, σz = 50 m, ohne Deckel','2/(√(2π)·50) = 0,01596',()=>m.vertTerm(0,50,false,0),v=>near(v,0.015958,0.001));
ft('vertTerm','Grenz','Übergang bei σz = 1,6·zi (zi = 500 m): Wert knapp darunter / darüber','stetig (Verhältnis nahe 1)',()=>{const a=m.vertTerm(0,799.9,true,500),b=m.vertTerm(0,800.1,true,500);return [a,b,b/a];},v=>Math.abs(v[2]-1)<0.05);
ft('vertTerm','Extrem','d = 1000 m, σz = 0,5 m','0',()=>m.vertTerm(1000,0.5,false,0),v=>v===0);
ft('plumeRiseFinal','Normal','F = 88 m⁴/s³ (10 MW konvektiv), 3 m/s, neutral','38,71·88^0,6/3 = 189 m',()=>m.plumeRiseFinal(88,3,3,288,0,2),v=>near(v,189.4,0.01));
ft('plumeRiseFinal','Grenz','F = 55 von unten / von oben','stetig',()=>[m.plumeRiseFinal(54.999,3,3,288,0,2),m.plumeRiseFinal(55.001,3,3,288,0,2)],v=>near(v[0],v[1],0.02));
ft('plumeRiseFinal','Extrem','F = 100 000, Wind 0','begrenzt auf 1500 m',()=>m.plumeRiseFinal(1e5,0,3,288,0,2),v=>v===1500);
ft('trackPuffs + evalField','Normal','1 kg/s, D, 3 m/s: Höchstwert / Kleinstwert des Feldes','endlich, nicht negativ',()=>peak(base({})),v=>fin(v[0])&&v[1]>=0);
ft('trackPuffs + evalField','Grenz','Freisetzungsrate 0 und Wind 0','alles 0; Wind wird auf 0,5 m/s gesetzt, Ergebnis endlich',()=>[...peak(base({rateKgS:0})),...peak(base({wx:wx(3,0)}))],v=>v[0]===0&&fin(v[2]));
ft('trackPuffs + evalField','Extrem','negative Freisetzungsrate −1 kg/s','Abweisung erwartet',()=>peak(base({rateKgS:-1})),v=>v[1]>=0);
ft('axisReach','Normal','Chlor 0,5 kg/s, D, 3 m/s, AEGL-2','rund 2000 m (analytisch 2011 m)',()=>{const P=base({R:10000,nSlots:8,rateKgS:0.5,durS:7200,H0:1});const thr=[null,2*70.9/23.63*1e-6,null];let r=0;for(const s of m.trackPuffs(P)){const a=m.axisReach(s,P,thr);if(a[1].r>r)r=a[1].r;}return r;},v=>near(v,2011,0.1));
ft('axisReach','Grenz','alle Schwellen leer','0 / 0 / 0',()=>{const P=base({});return m.axisReach(m.trackPuffs(P)[0],P,[null,null,null]).map(q=>q.r);},v=>v.every(q=>q===0));
ft('axisReach','Extrem','Schwelle über jeder Konzentration (1 kg/m³)','0',()=>{const P=base({});return m.axisReach(m.trackPuffs(P).pop(),P,[1,null,null])[0].r;},v=>v===0);
const th={Tb:239.1,dHv:288e3,cpl:930}, Ic=m.bmInit({M:70.9,Ta:288,p:101325,zustand:'gas'});
ft('bmInit','Normal','Chlor, Gas, 15 °C, 1013 hPa: Dichte','p·M/(R·T) = 3,00 kg/m³',()=>Ic.rho0,v=>near(v,3.0,0.01));
ft('bmInit','Grenz','Chlor „kalt", Luft −40 °C (unter Siedetemperatur): Zustand','Hinweis erwartet; tatsächlich stiller Rückfall auf „gas"',()=>m.bmInit({M:70.9,Ta:233.15,p:101325,zustand:'kalt',th}).zustand,v=>v!=='gas');
ft('bmInit','Extrem','molare Masse 0 bzw. Luftdruck 0','Abweisung erwartet',()=>[m.bmInit({M:0,Ta:288,p:101325,zustand:'gas'}).rho0,m.bmInit({M:70.9,Ta:288,p:0,zustand:'gas'}).rho0],v=>false);
const Q=o=>Object.assign({init:Ic,u:3,rate:0.5,dur:1800,mass:0,inst:false},o);
ft('bmDistance','Normal','Chlor 0,5 kg/s, 3 m/s, 1 Vol.-%','endlich, Bereich „ok"',()=>{const d=m.bmDistance(Q({}),0.01);return [d.x,d.range==='ok'?1:0];},v=>fin(v[0])&&v[1]===1);
ft('bmDistance','Grenz','Konzentration 100 % und 0','„ueber" bzw. „unter", endlich',()=>{const a=m.bmDistance(Q({}),0.999999),b=m.bmDistance(Q({}),0);return [a.range,b.range,b.x];},v=>v[0]==='ueber'&&v[1]==='unter'&&fin(v[2]));
ft('bmDistance','Extrem','Freisetzungsrate 0 (kontinuierlich)','Rückgabe ohne Abbruch',()=>m.bmDistance(Q({rate:0}),0.01).x,v=>true);
ft('bmDistance','Extrem','Wind 0','Abweisung oder Kennzeichnung',()=>m.bmDistance(Q({u:0}),0.01).x,v=>fin(v));
ft('denseDistance','Normal','Chlor 0,5 kg/s, 3 m/s, D, 2 ppm','„abgeleitet", endlich',()=>{const d=m.denseDistance(Q({}),2e-6,{u10:3,cls:3},false,70.9);return [d.x,d.kind];},v=>fin(v[0])&&v[1]==='abgeleitet');
ft('denseDistance','Grenz','Schwelle genau an der letzten Kurve (0,2 %)','stetiger Übergang berechnet/abgeleitet (Verhältnis nahe 1)',()=>{const a=m.denseDistance(Q({}),0.00201,{u10:3,cls:3},false,70.9),b=m.denseDistance(Q({}),0.00199,{u10:3,cls:3},false,70.9);return [a.x,b.x,b.x/a.x];},v=>Math.abs(v[2]-1)<0.05);
ft('denseDistance','Extrem','Schwelle 10⁻¹² (praktisch 0)','endlich, höchstens Suchgrenze 500 km',()=>m.denseDistance(Q({}),1e-12,{u10:3,cls:3},false,70.9).x,v=>fin(v));
ft('fuelMoisture','Normal','25 °C, 35 %','rund 6,7 %',()=>m.fuelMoisture(25,35),v=>near(v,6.69,0.02));
ft('fuelMoisture','Grenz','Nahtstellen bei 10 % und 50 % Feuchte, 25 °C: Wert darunter / darüber','stetig',()=>[m.fuelMoisture(25,9.999),m.fuelMoisture(25,10.001),m.fuelMoisture(25,49.999),m.fuelMoisture(25,50.001)],v=>near(v[0],v[1],0.03)&&near(v[2],v[3],0.03));
ft('fuelMoisture','Extrem','−20 °C / 100 % und 45 °C / 0 %','endlich, zwischen 1 und 40 %',()=>[m.fuelMoisture(-20,100),m.fuelMoisture(45,0)],v=>v.every(q=>q>=1&&q<=40));
const V=o=>Object.assign({N:121,R:2000,terrain:null,k:0.2,R0:0.03,state:1,r0:10,tEnd:3600,wx:()=>({u10:5,dx:1,dy:0,T:25,rh:35,prec:0})},o);
const area=(a,t=3600)=>{let c=0;for(const v of a)if(v<=t)c++;return c*(4000/120)**2/1e4;};
ft('rosParams','Normal','Gras, 5 m/s, 25 °C, 35 %','Kopf rund 20 % des Windes × Feuchtefaktor = 0,96 m/s',()=>m.rosParams(V({}).wx(0),V({})).Rh,v=>near(v,(0.03+1)*Math.exp(-0.108*(6.69-6)),0.03));
ft('rosParams','Grenz','Wind 0','Exzentrizität 0 (Kreis)',()=>m.rosParams({u10:0,dx:1,dy:0,T:25,rh:35,prec:0},V({})).e,v=>v===0);
ft('rosParams','Extrem','Wind 40 m/s','Länge zu Breite auf 6 begrenzt (e = 0,986)',()=>m.rosParams({u10:40,dx:1,dy:0,T:25,rh:35,prec:0},V({})).e,v=>near(v,Math.sqrt(1-1/36),0.001));
ft('spreadFire','Normal','Gras, 5 m/s, 1 h: Fläche in ha','endlich, größer 0',()=>area(m.spreadFire(V({}))),v=>fin(v)&&v>0);
ft('spreadFire','Grenz','Zustandsfaktor 0 (nicht brennbar)','nur die Anfangsfläche',()=>area(m.spreadFire(V({state:0}))),v=>v<0.2);
ft('spreadFire','Extrem','Prognosedauer 0','nur die Anfangsfläche',()=>area(m.spreadFire(V({tEnd:0})),0),v=>v<0.2);
ft('blastRatio','Normal','Z = 10 m/kg^(1/3)','rund 0,1 (10 kPa)',()=>m.blastRatio(10),v=>near(v,0.0986,0.02));
ft('blastRatio','Grenz','Z = 0','endlich (808)',()=>m.blastRatio(0),v=>near(v,808,0.001));
ft('blastRatio','Extrem','Z = 10 000','positiv, sehr klein',()=>m.blastRatio(1e4),v=>v>0&&v<1e-3);
ft('blastRadius','Normal','120 kg TNT, 2 kPa','rund 250 m',()=>m.blastRadius(120,2000,101325),v=>near(v,254,0.03));
ft('blastRadius','Grenz','Masse 0','0',()=>m.blastRadius(0,2000,101325),v=>v===0);
ft('blastRadius','Extrem','Druck 1 Pa (unter dem Suchbereich)','Kennzeichnung erwartet; tatsächlich Abbruch der Suche bei Z = 5000',()=>m.blastRadius(120,1,101325),v=>false);
ft('bleve','Normal','22 000 kg: Durchmesser / Dauer','5,8·M^(1/3) = 163 m / 12,6 s',()=>{const b=m.bleve(22000,15,60);return [b.D,b.t];},v=>near(v[0],162.5,0.01)&&near(v[1],12.61,0.01));
ft('bleve','Grenz','Dauer bei 30 000 kg von unten / von oben','stetig',()=>[m.bleve(29999,15,60).t,m.bleve(30001,15,60).t],v=>near(v[0],v[1],0.02));
ft('bleve','Extrem','Masse 0','Abweisung erwartet',()=>m.bleve(0,15,60).E,v=>fin(v));
ft('blastShadow','Normal','ebenes Gelände','kein Schatten',()=>{const h=new Float32Array(N*N).fill(100),Tt=m.prepTerrain({N,R:500,cell:1000/120,h});let s=0;for(const v of m.blastShadow(Tt,1.5,1.5))s+=v;return s;},v=>v===0);
ft('blastShadow','Grenz','Rücken 30 m hoch in 150 m: Punkt davor / dahinter','0 / 1',()=>{const R=500,c=1000/120,h=new Float32Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-R+i*c;h[j*N+i]=30*Math.exp(-((x-150)**2)/3200);}const Tt=m.prepTerrain({N,R,cell:c,h}),s=m.blastShadow(Tt,1.5,1.5),at=x=>s[60*N+Math.round((x+R)/c)];return [at(100),at(300)];},v=>v[0]===0&&v[1]===1);
ft('blastShadow','Extrem','Quelle 500 m über Grund (Feuerball), gleicher Rücken','kein Schatten dahinter',()=>{const R=500,c=1000/120,h=new Float32Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-R+i*c;h[j*N+i]=30*Math.exp(-((x-150)**2)/3200);}const Tt=m.prepTerrain({N,R,cell:c,h});return m.blastShadow(Tt,500,1.5)[60*N+Math.round(800/c)];},v=>v===0);

// ---------- Numerik ----------
const NUM=[];
{ const lat=50, R=50000, d=R/111320, merc=p=>Math.log(Math.tan(Math.PI/4+p*Math.PI/360));
  const y0=merc(lat-d), y1=merc(lat+d), mid=(merc(lat)-y0)/(y1-y0), q=(merc(lat+d/2)-y0)/(y1-y0);
  NUM.push(`| Kartenüberlagerung ± 50 km bei 50° N: Lage der Bildmitte bzw. des oberen Viertelpunkts im Mercator-Netz | Abweichung ${f3(Math.abs(mid-0.5)*2*R)} m bzw. ${f3(Math.abs(q-0.75)*2*R)} m gegenüber linearer Streckung |`);
  const a=6378137,e2=0.00669438,ph=lat*Math.PI/180, mdeg=Math.PI/180*a*(1-e2)/Math.pow(1-e2*Math.sin(ph)**2,1.5), ldeg=Math.PI/180*a*Math.cos(ph)/Math.sqrt(1-e2*Math.sin(ph)**2);
  NUM.push(`| Umrechnung Meter in Grad mit 111 320 m je Grad bei 50° N | Breite: Ellipsoid ${f3(mdeg)} m je Grad (Abweichung ${f3((111320/mdeg-1)*100)} %); Länge: ${f3(ldeg)} statt ${f3(111320*Math.cos(ph))} m je Grad (Abweichung ${f3((111320*Math.cos(ph)/ldeg-1)*100)} %) |`); }
{ const a=m.vertTerm(0,799.9,true,500), b=m.vertTerm(0,800.1,true,500);
  NUM.push(`| Deckel der Mischungsschicht: Sprung beim Wechsel auf Gleichverteilung (σz = 1,6·zi) | Faktor ${f3(b/a)} (Konzentration springt um ${f3((b/a-1)*100)} %) |`); }
{ const sim=u=>{const P=base({R:5000,nSlots:4,wx:wx(3,u),rateKgS:0.5,durS:3600,H0:1});const thr=[null,null,20*70.9/23.63*1e-6];let r=0;for(const s of m.trackPuffs(P)){const a=m.axisReach(s,P,thr);if(a[2].r>r)r=a[2].r;}return r;};
  const ana=u=>{let lo=1,hi=2e5;const t=20*70.9/23.63*1e-6;for(let i=0;i<60;i++){const x=Math.sqrt(lo*hi),[sy,sz]=m.sigma(3,x,false);if(0.5/(Math.PI*Math.hypot(sy,2)*Math.hypot(sz,1)*u)>t)lo=x;else hi=x;}return lo;};
  NUM.push(`| Zeitschritt 30 s: Reichweite AEGL-3 (Chlor 0,5 kg/s, D) bei 1 / 3 / 10 / 20 m/s gegenüber der analytischen Lösung | ${[1,3,10,20].map(u=>f3(sim(u)/ana(u))).join(' / ')} |`); }
{ const P=base({rateKgS:-1}); const v=peak(P); NUM.push(`| Negative Freisetzungsrate im Rechenkern | wird gerechnet; kleinster Feldwert ${f3(v[1])} kg/m³ |`); }

// ---------- Validierung ----------
const VAL=[]; let nB=0,nN=0,nP=0;
function val(id,bereich,szen,ref,ist,soll,lo,hi,einh,ursache){ const rel=ist/soll, ok=rel>=lo&&rel<=hi; ok?nB++:nN++;
  VAL.push(`| ${id} | ${bereich} | ${szen} | ${ref} | ${f3(ist)} | ${f3(soll)} | ${einh} | ${f3(ist-soll)} | ${f3((rel-1)*100)} % | ${f3(lo)} bis ${f3(hi)} | ${ok?'bestanden':'**nicht bestanden**'} | ${ursache||''} |`); return rel; }
function np(id,bereich,szen,ref,grund){ nP++; VAL.push(`| ${id} | ${bereich} | ${szen} | ${ref} | – | – | – | – | – | – | nicht prüfbar | ${grund} |`); }
let id=1; const I=()=>'S'+String(id++).padStart(2,'0');
for(const [cls,urban,H] of [[0,false,0],[3,false,0],[5,false,0],[3,true,0],[3,false,50]]){
  const P=base({wx:wx(cls,3),urban,H0:H}), sn=m.trackPuffs(P), f=m.evalField(sn[sn.length-1],P,{N,R:2000}), c=f[60*N+90], [sy,sz]=m.sigma(cls,1000,urban), uh=3*Math.pow(Math.max(H,10)/10,(urban?[0.15,0.15,0.2,0.25,0.3,0.3]:[0.07,0.07,0.1,0.15,0.35,0.55])[cls]);
  val(I(),'Gauß',`1 kg/s, Klasse ${'ABCDEF'[cls]}, ${urban?'Bebauung':'Freifläche'}, Höhe ${H} m, 3 m/s: Konzentration in 1 km`,'analytische Gauß-Fahne',c*1e6,1e6/(Math.PI*Math.hypot(sy,2)*Math.hypot(sz,1)*uh)*Math.exp(-H*H/(2*(sz*sz+1))),0.85,1.15,'mg/m³',cls===5?'Mindestbreite im Raster':''); }
{ const vm0=23.63, thr=[0.5,2,20].map(v=>v*70.9/vm0*1e-6);
  for(const [cls,u,R,n,l] of [[3,3,50000,24,2],[5,1.5,50000,48,2],[0,2,5000,8,1],[3,10,20000,8,2]]){
    const P=base({R,nSlots:n,wx:wx(cls,u),rateKgS:0.5,durS:n*900,H0:1}); let r=0; for(const s of m.trackPuffs(P)){const a=m.axisReach(s,P,thr); if(a[l].r>r) r=a[l].r;}
    let lo=1,hi=2e5; for(let i=0;i<60;i++){const x=Math.sqrt(lo*hi),[sy,sz]=m.sigma(cls,x,false); if(0.5/(Math.PI*Math.hypot(sy,2)*Math.hypot(sz,1)*u)>thr[l]) lo=x; else hi=x;}
    val(I(),'Gauß',`Chlor 0,5 kg/s, Klasse ${'ABCDEF'[cls]}, ${u} m/s, Gebiet ± ${R/1000} km: Reichweite AEGL-${l+1}`,'analytische Gauß-Fahne',r,lo,0.8,1.2,'m',u>=10?'Puffabstand 300 m':''); } }
{ const Il=m.bmInit({M:16.04,Ta:298,p:101325,zustand:'kalt',th:{Tb:111.7,dHv:510e3}});
  val(I(),'Schwergas','Flüssigerdgas 0,23 m³/s, 10,9 m/s: Entfernung bis 5 Vol.-%','Lehrbuchbeispiel (aus dem Gedächtnis zitiert)',m.bmDistance({init:Il,u:10.9,rate:0.23*425.6,dur:1e6,mass:0,inst:false},0.05).x,367,0.95,1.05,'m','Referenzwert nicht abgeglichen'); }
const obs={6:{0.2:44000,1:1900,2:630},7:{0.2:70000,2:1200,5:340,11:50},9:{0.2:29000,1:1900,2:1300,5:300,11:100}}, tr={6:[33.2,8392,2.3,22.0],7:[36.4,8620,4.5,18.9],9:[133,17700,3.5,10.5]};
const lg=[]; const jq=t=>{const [dur,mass,u2,Tc]=tr[t],u=u2*Math.log(1e4)/Math.log(2e3),Ta=Tc+273.15;return {Q:{init:m.bmInit({M:70.9,Ta,p:87000,zustand:'zweiphasig',Ts:Ta,th}),u,rate:mass/dur,dur,mass:0,inst:false},u,Ta};};
for(const t of [6,7,9]){ const {Q:Qj,u}=jq(t);
  for(const x of Object.keys(obs[t]).sort((a,b)=>a-b)){ const o=obs[t][x], d=m.denseDistance(Qj,o*1e-6,{u10:u,cls:3},false,70.9);
    lg.push(Math.log(val(I(),'Schwergas',`Jack Rabbit II Versuch ${t}: Entfernung für ${o} ppm (${d.kind})`,'Messbogen mit dieser Spitzenkonzentration',d.x,x*1000,0.5,2,'m',d.kind==='abgeleitet'?'außerhalb der Kurven, Fortsetzung mit Gauß; Messwert ist Sekundenspitze':'Messwert ist Sekundenspitze'))); } }
{ // Ausgleichsgerade Hanna: C·u/Q = 8,5·x^(-5/3) (SI), Versuch 6; Modellkonzentration aus Umkehrung von denseDistance
  const {Q:Qj,u,Ta}=jq(6), rho=87000*0.0709/(8.314462*Ta);
  for(const x of [500,1000,2000,5000,11000]){ let lo=1e-9,hi=0.5; for(let i=0;i<70;i++){const c=Math.sqrt(lo*hi),d=m.denseDistance(Qj,c,{u10:u,cls:3},false,70.9); if((d.x||0)>x) lo=c; else hi=c;}
    const fit=8.5*Math.pow(x,-5/3)*Qj.rate/2.3/rho;
    val(I(),'Schwergas',`Jack Rabbit II Versuch 6: Konzentration in ${x/1000} km`,'Ausgleichsgerade der Chlorversuche (Hanna et al.), Streuung Faktor 3 bis 4',lo*1e6,fit*1e6,0.25,4,'ppm','Gerade beschreibt Sekundenspitzen'); } }
val(I(),'BLEVE','Tank 4000 l (2000 kg angenommen): Feuerballradius','Transport Canada',m.bleve(2000,15,60).D/2,38,0.9,1.1,'m','Füllmasse angenommen');
val(I(),'BLEVE','Tank 40 000 l (20 000 kg angenommen): Feuerballradius','Transport Canada',m.bleve(20000,15,60).D/2,81,0.9,1.1,'m','Füllmasse angenommen');
val(I(),'BLEVE','Tank 4000 l: Abstand Einsatzkräfte (4 Radien)','Transport Canada',4*m.bleve(2000,15,60).D/2,150,0.9,1.1,'m','');
val(I(),'BLEVE','Tank 40 000 l: Abstand Einsatzkräfte (4 Radien)','Transport Canada',4*m.bleve(20000,15,60).D/2,320,0.9,1.1,'m','');
val(I(),'Explosion','Überdruck bei skaliertem Abstand 10','Größenordnung 10 kPa (nicht abgeglichen)',m.blastRatio(10)*101.325,10,0.85,1.15,'kPa','Referenzwert nicht abgeglichen');
np(I(),'Gauß','Vergleich mit NOAA ALOHA (passives Gas)','ALOHA','Programm nicht ausführbar, keine veröffentlichte Beispielrechnung beschafft');
np(I(),'Gauß','Feldversuch passiv (z. B. Prairie Grass)','Versuchsdaten','Daten nicht beschafft');
np(I(),'Schwergas','Vergleich mit DEGADIS','DEGADIS','Programm nicht ausführbar');
np(I(),'Schwergas','Vergleich mit SLAB','SLAB','Programm nicht ausführbar');
np(I(),'Schwergas','Originalnomogramme Britter-McQuaid','Workbook 1988','Primärquelle lag nicht vor');
np(I(),'Toxikologie','AEGL-Werte gegen amtliche Liste','US-Umweltbehörde','Abgleich noch nicht durchgeführt');
np(I(),'Brandrauch','Rauchkonzentration am Boden','Versuchsdaten','keine Referenz; Emissionsdaten nicht belegt');
np(I(),'Brandrauch','Brandüberhöhung großer Flächenbrände','Versuchsdaten','keine Referenz beschafft');
np(I(),'Vegetationsbrand','Ausbreitungsgeschwindigkeit gegen Rothermel','Rothermel','Rothermel nicht umgesetzt, keine Vergleichsrechnung');
np(I(),'Vegetationsbrand','dokumentierter Brandverlauf','Ereignisdaten','keine Daten beschafft');
np(I(),'Explosion','Gaswolkenexplosion gegen TNO Multi-Energy','TNO','Kurven nicht verfügbar');
np(I(),'Explosion','Rechenbeispiel CCPS','CCPS','Quelle nicht verfügbar');
np(I(),'BLEVE','Wärmestrahlung gegen Rechenbeispiel CCPS/TNO','CCPS/TNO','Quelle nicht verfügbar');
np(I(),'Gewässer','Fließgeschwindigkeit gegen Messung','HLNUG','keine Geschwindigkeitsmessung verfügbar');
const n=lg.length, mg=Math.exp(lg.reduce((a,b)=>a+b,0)/n), vg=Math.exp(lg.reduce((a,b)=>a+b*b,0)/n), fac2=lg.filter(v=>Math.abs(v)<=Math.log(2)).length/n;
const stat=`Jack Rabbit II, 12 Wertepaare (Entfernung Modell zu Messbogen): geometrisches Mittel ${f3(mg)}, geometrische Varianz ${f3(vg)}, Anteil innerhalb Faktor 2: ${f3(fac2*100)} %, mittlere quadratische Abweichung im Logarithmus ${f3(Math.sqrt(lg.reduce((a,b)=>a+b*b,0)/n))}.`;

let md='# Technischer Code-Audit: Anhang mit Prüfläufen\n\nErzeugt von `node tests/audit/audit_pruefungen.js` am geprüften Stand. Nicht von Hand ändern.\n\n'
 +'## A. Funktionstests (mathematisch)\n\nJe Funktion ein Normalfall, ein Grenzfall und ein Extremfall. Die Erwartung wurde vor dem Lauf festgelegt.\n\n| Funktion | Art | Fall | Erwartung | Ergebnis | Bewertung |\n|---|---|---|---|---|---|\n'+T.join('\n')
 +`\n\n${T.length} Fälle, davon ${T.filter(x=>x.includes('nicht bestanden')).length} nicht bestanden.\n\n`
 +'## B. Numerische Kontrollrechnungen\n\n| Prüfung | Ergebnis |\n|---|---|\n'+NUM.join('\n')
 +'\n\n## C. Validierungsszenarien (physikalisch)\n\nBewertungsmaßstab, vor der Auswertung festgelegt: analytische Lösung ± 15 % (Konzentration) bzw. ± 20 % (Reichweite); Lehrbuchbeispiel ± 5 %; Versuchsdaten Faktor 2; Ausgleichsgerade Faktor 4 (veröffentlichte Streuung); Richtwerte ± 10 %.\n\n'
 +'| Nr. | Bereich | Szenario | Referenz | Ergebnis | Referenzwert | Einheit | Abweichung absolut | relativ | zulässiges Verhältnis | Bewertung | Ursache / Anmerkung |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n'+VAL.join('\n')
 +`\n\n${VAL.length} Szenarien: ${nB} bestanden, ${nN} nicht bestanden, ${nP} nicht prüfbar.\n\n${stat}\n`;
fs.writeFileSync(path.join(root,'docs','TECHNISCHER_CODE_AUDIT_Anhang.md'),md);
console.log(T.filter(x=>x.includes('nicht bestanden')).join('\n')); console.log(NUM.join('\n')); console.log(VAL.filter(x=>x.includes('nicht bestanden')).map(x=>x.slice(0,170)).join('\n'));
console.log(`Funktionstests ${T.length}, Szenarien ${VAL.length}: ${nB}/${nN}/${nP}`); console.log(stat);
