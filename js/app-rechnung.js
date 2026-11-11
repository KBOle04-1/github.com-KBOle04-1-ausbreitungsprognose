/* ---------- Berechnung ---------- */
const pause=()=>new Promise(r=>setTimeout(r,0));
function num(id,def){ const v=parseFloat($(id).value); return Number.isFinite(v)?v:def; }
const HCOL=[[125,133,144],[91,75,154],[31,20,64]];
const LLINE=['#b89600','#e06a00','#c4001a'], HLINE=['#5f6770','#5b4b9a','#1f1440'];

async function run(){
  if(!S.src){ status('Zuerst den Freisetzungsort wählen: Karte antippen, Ort suchen oder Standort verwenden.'); return; }
  const btn=$('run'); btn.disabled=true; stopPlay();
  try{
    const manual=$('manual').checked, R=+$('radius').value, nSlots=+$('horizon').value, T0=t0sec();
    if(!Number.isFinite(T0)) throw new Error('Ereignisbeginn fehlt.');
    if(S.mode==='blast'){ await runBlast(manual,T0); btn.disabled=false; return; }
    if(!manual){
      status('Lade Wetterdaten …'); await loadWeather(); showWx();
      const W=S.wx;
      if(T0<W.t[0]||T0+nSlots*900>W.t[W.t.length-1]) throw new Error('Für den gewählten Zeitraum liegen keine Wetterdaten vor. Ereignisbeginn oder Prognosedauer anpassen oder Wetter von Hand vorgeben.');
    }
    let terr=null;
    if($('useTerr').checked){ status('Lade Höhendaten …'); terr=await loadTerrain(R); }
    const meta=[];
    for(let n=1;n<=nSlots;n++) meta.push({n,t0:T0+(n-1)*900,t1:T0+n*900,w:wxAt(T0+n*900-450)});
    const defs = S.mode==='veg' ? await runVeg(R,nSlots,T0,terr,meta) : await runCloud(R,nSlots,T0,terr);
    S.res={layers:defs,meta,R,lat:S.src.lat,lon:S.src.lon,T0,nSlots,terr:!!terr,mode:S.mode,manual};
    warnings(defs,meta,terr,manual);
    buildTable(); $('timeline').hidden=false; $('tablesec').hidden=false;
    $('slider').max=nSlots; show(0);
    const far=Math.max(...defs.flatMap(d=>d.all.reach));
    if(map){ const b=boundsOf(S.res); map.fitBounds(far>0?L.latLngBounds(b).pad(-0.5+Math.min(0.5,far/R*0.6)):b,{padding:[60,24]}); }
    finishResult(); toMap();
    status(`Fertig: ${defs.map(d=>d.label).join(' + ')}, Beginn ${hhmm(T0)} Uhr, ${nSlots} Zeitfenster zu je 15 Minuten.`);
  }catch(e){ status('Fehler: '+e.message); console.error(e); }
  btn.disabled=false;
}
$('run').onclick=run;

/* Gefahrstoff, Brandrauch, Kombiniert */
async function runCloud(R,nSlots,T0,terr){
  const w0=wxAt(T0), vm=22.414*w0.Tk/273.15*1013.25/w0.pres, combo=S.mode==='combo';
  const base={nSlots,R,terrain:terr,urban:$('urban').value==='1',wx:t=>wxAt(T0+t),fireMW:0,dense:false,sz0:1,terrWind:$('terrWind').checked};
  if(S.mode!=='fire'&&$('useRiver').checked){ const rv=await riverSetup(R); if(rv&&$('riverSteer').checked) base.river=rv; } else clearRivers();
  const readThr=ids=>ids.map(id=>{const v=parseFloat($(id).value); return v>0?v:null;});
  const mw=num('mw',10), fsy=Math.max(2,Math.sqrt(num('farea',100))/4.3);
  const defs=[];
  if(S.mode!=='fire'){
    const s=curSubst(), M=s.kind==='custom'?num('cM',50):s.M, P={...base};
    P.inst=S.inst; P.H0=num('hrel',1);
    const rho=M/vm;
    if(S.inst){ P.massKg=num('mass',0); P.sy0=Math.max(2,0.5*Math.cbrt(P.massKg/rho)); P.sz0=Math.max(1,P.sy0/2); P.durS=0; }
    else { P.rateKgS=num('rate',0)/60; P.durS=num('dur',30)*60; P.sy0=2; }
    // Modellwahl: Schwergaskriterium nach Britter-McQuaid aus Dichte, Menge und Wind
    const lifted=combo&&$('lift').checked, ts=parseFloat($('tstore').value);
    const init=bmInit({M,Ta:w0.Tk,p:w0.pres*100,zustand:$('relState').value,Ts:Number.isFinite(ts)?ts+273.15:w0.Tk,th:s.th});
    const bmQ={init,u:Math.max(w0.u10,0.1),rate:S.inst?0:P.rateKgS,dur:S.inst?0:P.durS,mass:S.inst?P.massKg:0,inst:S.inst};
    const probe=bmDistance(bmQ,0.01), dense=!!probe.dense&&!lifted;
    P.dense=dense;
    const sg=lifted?{txt:'Stoff steigt mit dem Brandrauch auf: Gauß-Modell mit Brandüberhöhung, keine Schwergasrechnung.'}
      :!(init.g0>0)?{txt:`Wolke nicht schwerer als Luft (Dichte ${fmt(init.rho0,2)} kg/m³, Luft ${fmt(init.rhoA,2)} kg/m³): Gauß-Modell.`}
      :!dense?{txt:`Dichte ${fmt(init.rho0,2)} kg/m³, aber Schwergaskriterium nicht erfüllt (Kennzahl ${fmt(probe.crit,2)}, Grenze ${probe.regime==='momentan'?'0,20':'0,15'}): Die Wolke verhält sich bei diesem Wind passiv, Gauß-Modell.`}
      :{bm:true,txt:`Schweres Gas (Dichte ${fmt(init.rho0,2)} kg/m³, Kennzahl ${fmt(probe.crit,2)} über der Grenze ${probe.regime==='momentan'?'0,20':'0,15'}): Entfernungen nach Britter-McQuaid (${probe.regime}), Flächen aus dem passiven Gauß-Modell.`};
    if(init.zustand!=='gas') sg.txt+=` Wolke als reiner Dampf bei Siedetemperatur (${Math.round(init.T0-273.15)} °C)`+(init.flash!=null?`, Entspannungsverdampfung rechnerisch ${Math.round(init.flash*100)} %, Rest als Aerosol ohne Ausregnen.`:'.');
    if(combo&&$('lift').checked){ P.fireMW=0.7*mw; P.sy0=Math.max(P.sy0,fsy); P.sz0=Math.max(P.sz0,2); P.H0=Math.max(P.H0,2); P.dense=false; }
    const thrIn=readThr(['thr1','thr2','thr3']);
    const bm=sg.bm?thrIn.map(v=>v==null?null:denseDistance(bmQ,v*1e-6,w0,P.urban,M)):null;
    defs.push({P,thrIn,thr:thrIn.map(v=>v==null?null:v*M/vm*1e-6),unit:'ppm',names:LNAMES[s.kind],label:s.name,hatch:false,kind:s.kind,sid:s.id,heavy:dense,sg,bm,wdir:[w0.dx,w0.dy],init,hasTh:!!s.th});
  }
  if(S.mode!=='gas'){
    const [hc,ys]=$('fuel').value.split(',').map(Number), P={...base};
    P.inst=false; P.rateKgS=mw/hc*ys; P.durS=num('fdur',60)*60; P.H0=2; P.fireMW=0.7*mw; P.sy0=fsy; P.sz0=2;
    const thrIn=readThr(combo?['fthr1','fthr2','fthr3']:['thr1','thr2','thr3']);
    defs.push({P,thrIn,thr:thrIn.map(v=>v==null?null:v*1e-6),unit:'mg/m³',names:combo?['Rauch 1','Rauch 2','Rauch 3']:LNAMES.fire,label:'Brandrauch '+mw+' MW',hatch:combo,kind:'fire'});
  }
  for(const d of defs) if(d.thr.every(v=>v==null)) throw new Error('Für '+d.label+' mindestens einen Schwellenwert angeben.');
  // Zwei Raster: das ganze Rechengebiet und ein achtfach feineres um den Ereignisort, damit die inneren Zonen nicht im groben Raster untergehen
  const N=gridN(R), G0={N,R}, G1={N,R:R/8};
  if(terr){ G0.h=gridHeights(terr,N,G0.R); G1.h=gridHeights(terr,N,G1.R); }
  const zero=()=>[0,1,2].map(()=>({r:0,x:0,y:0})), up=(a,b)=>{ for(let l=0;l<3;l++) if(b[l].r>a[l].r) a[l]=b[l]; };
  const mx=(a,b)=>{ for(let k=0;k<a.length;k++) if(b[k]>a[k]) a[k]=b[k]; };
  const pics=(f0,f1,d)=>[{src:render(f0,d.thr,N,d.hatch,true),R:G0.R},{src:render(f1,d.thr,N,d.hatch,false),R:G1.R}];
  for(const d of defs){
    d.dense=d.P.dense; d.heads=[0,1,2].filter(l=>d.thr[l]!=null).map(l=>d.names[l]);
    status('Berechne Ausbreitung: '+d.label+' …'); await pause();
    const snaps=trackPuffs(d.P), e0=new Float32Array(N*N), e1=new Float32Array(N*N), eAx=zero(); d.slots=[];
    for(let n=1;n<=nSlots;n++){
      status(`${d.label}: Zeitfenster ${n} von ${nSlots} …`); await pause();
      const f0=new Float32Array(N*N), f1=new Float32Array(N*N), ax=zero();
      for(const sn of snaps) if(sn.t>(n-1)*900 && sn.t<=n*900){ mx(f0,evalField(sn,d.P,G0)); mx(f1,evalField(sn,d.P,G1)); up(ax,axisReach(sn,d.P,d.thr)); }
      mx(e0,f0); mx(e1,f1); up(eAx,ax);
      d.slots.push(cloudPost(d,{...analyse(f0,f1,d.thr,G0,G1,ax), imgs:pics(f0,f1,d)}));
    }
    d.all=cloudPost(d,{...analyse(e0,e1,d.thr,G0,G1,eAx), imgs:pics(e0,e1,d)});
    if(!d.all.reach.some(r=>r>0)) d.none=true;
  }
  return defs;
}
function cloudPost(d,a){
  a.chips=[]; a.rings=[]; a.cells=[];
  if(d.bm){
    a.bmChips=[];
    const rot=([x,y],g)=>{ const c=Math.cos(g), sn=Math.sin(g); return [x*c-y*sn,x*sn+y*c]; };
    for(let l=2;l>=0;l--){ const b=d.bm[l]; if(!b) continue;
      const t=b.kind==='berechnet'?`in Windrichtung bis ca. ${dist(b.x)} (berechnet, Unsicherheit etwa Faktor 2)`:b.kind==='abgeleitet'?`in Windrichtung mindestens ca. ${dist(b.x)}, bis zum 2,5-Fachen möglich (abgeleitet, außerhalb des Datenbereichs)`:`Nahbereich, nicht berechenbar (unter ca. ${dist(b.max)})`;
      a.bmChips.push(`<span class="chip"><span class="sw" style="background:repeating-linear-gradient(90deg,${LLINE[l]} 0 5px,transparent 5px 7px)"></span>${d.names[l]}: ${t}</span>`);
      if(b.x) a.rings.push({r:b.x,far:rot(d.wdir,(l-1)*0.5),color:LLINE[l],dash:true,text:'Schwergas '+d.names[l]+' · '+dist(b.x)+(b.kind==='abgeleitet'?' (abgel.)':'')});
    }
  }
  for(let l=2;l>=0;l--) if(d.thr[l]!=null){
    a.chips.push(`<span class="chip"><span class="sw${d.hatch?' h'+(l+1):''}"${d.hatch?'':` style="background:var(--l${l+1})"`}></span>${d.names[l]} (${d.thrIn[l].toLocaleString('de-DE')} ${d.unit}): ${a.reach[l]>0?'bis ca. '+dist(a.reach[l])+', Fläche '+areaTxt(a.area[l]):'nicht erreicht'}</span>`);
    if(a.reach[l]>0) a.rings.push({r:a.reach[l],far:a.far[l],color:(d.hatch?HLINE:LLINE)[l],dash:d.hatch,text:d.names[l]+' · '+dist(a.reach[l])});
  }
  for(let l=0;l<3;l++) if(d.thr[l]!=null) a.cells.push(dist(a.reach[l]));
  return a;
}
// Flächen aus beiden Rastern (innen fein, außen ohne den inneren Bereich); Reichweite: größter Wert aus Raster und Fahnenachse
function analyse(f0,f1,thr,G0,G1,ax){
  const reach=[0,0,0], area=[0,0,0], far=[[0,1],[0,1],[0,1]]; let edge=false;
  const low=Math.min(...thr.filter(v=>v!=null)), ri=G1.R;
  const scan=(f,G,outer)=>{
    const N=G.N, R=G.R, cell=2*R/(N-1);
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){
      const c=f[j*N+i]; if(c<low) continue;
      const x=-R+i*cell, y=-R+j*cell;
      if(outer){ if(Math.abs(x)<ri&&Math.abs(y)<ri) continue; if(i===0||j===0||i===N-1||j===N-1) edge=true; }
      const d=Math.hypot(x,y);
      for(let l=0;l<3;l++) if(thr[l]!=null&&c>=thr[l]){ area[l]+=cell*cell; if(d>reach[l]){ reach[l]=d; far[l]=[x,y]; } }
    }
  };
  scan(f1,G1,false); scan(f0,G0,true);
  for(let l=0;l<3;l++) if(thr[l]!=null&&ax[l].r>reach[l]){ reach[l]=ax[l].r; far[l]=[ax[l].x,ax[l].y]; if(ax[l].r>G0.R) edge=true; }
  return {reach,area,far,edge};
}
function render(f,thr,N,hatch,maskInner){
  const K=N>121?2:3, M=(N-1)*K+1, cv=document.createElement('canvas'); cv.width=cv.height=M;
  const cx=cv.getContext('2d'), im=cx.createImageData(M,M), D=im.data, col=hatch?HCOL:LCOL, m0=(M-1)*(0.5-1/16), m1=(M-1)*(0.5+1/16);
  for(let r=0;r<M;r++){
    const fy=(M-1-r)/K, j=Math.min(N-2,Math.floor(fy)), b=fy-j;
    for(let c=0;c<M;c++){
      if(hatch && (r+c)%8>=3) continue;
      if(maskInner && r>m0 && r<m1 && c>m0 && c<m1) continue;        // hier zeichnet das feine Raster
      const fx=c/K, i=Math.min(N-2,Math.floor(fx)), a=fx-i, k=j*N+i;
      const v=f[k]*(1-a)*(1-b)+f[k+1]*a*(1-b)+f[k+N]*(1-a)*b+f[k+N+1]*a*b;
      let l=-1; for(let q=0;q<3;q++) if(thr[q]!=null&&v>=thr[q]) l=q;
      if(l<0) continue;
      const o=(r*M+c)*4; D[o]=col[l][0]; D[o+1]=col[l][1]; D[o+2]=col[l][2]; D[o+3]=hatch?215:[125,145,165][l];
    }
  }
  cx.putImageData(im,0,0);
  return cv.toDataURL('image/png');
}

/* Fließgewässer */
const HLNUG_Q='https://www.hlnug.de/static/pegel/wiskiweb3/data/internet/layers/20/index.json';
function clearRivers(){ (S.riverLines||[]).forEach(o=>map&&map.removeLayer(o)); S.riverLines=[]; S.riverGeo=[]; }
async function loadGauge(name){
  let a;
  try{ a=await fetchJSON(HLNUG_Q); }
  catch(e){ return 'Pegeldaten des HLNUG nicht abrufbar. Fließgeschwindigkeit bitte von Hand eintragen (Treibgut über eine bekannte Strecke stoppen).'; }
  const {lat,lon}=S.src, cosl=Math.cos(lat*Math.PI/180); let same=null, any=null;
  for(const st of a){
    const la=+st.station_latitude, lo=+st.station_longitude, q=+st.ts_value;
    if(!(q>=0)||!la||!lo) continue;
    const d=Math.hypot((la-lat)*111.32,(lo-lon)*111.32*cosl), o={d,q,st};
    if(name&&String(st['EXTERN-WATERS-NAME']||'').trim().toLowerCase()===name.trim().toLowerCase()){ if(!same||d<same.d) same=o; }
    if(!any||d<any.d) any=o;
  }
  const g=(same&&same.d<=40)?same:(any&&any.d<=15?any:null);
  if(!g) return 'Kein HLNUG-Pegel in der Nähe (das Angebot deckt nur Hessen ab). Fließgeschwindigkeit bitte von Hand eintragen.';
  const v=Math.min(3.5,Math.max(0.05,0.35*Math.pow(g.q,0.25)));
  if(!S.rvelManual) $('rvel').value=v.toFixed(2);
  const t=g.st.timestamp?hhmm(Math.floor(new Date(g.st.timestamp).getTime()/1000))+' Uhr':'';
  return `Pegel ${g.st.station_name} (${g.st['EXTERN-WATERS-NAME']||'Gewässer unbekannt'}, ${fmt(g.d,1)} km entfernt${t?', '+t:''}): Abfluss ${fmt(g.q,g.q<10?2:0)} m³/s, daraus geschätzt rund ${fmt(v,1)} m/s (eigene Näherung ohne Literaturbeleg, Abweichung um den Faktor 2 möglich)`+(g===same?'.':'; der Pegel liegt an einem anderen Gewässer.');
}
async function riverSetup(R){
  const {lat,lon}=S.src, N=gridN(R), cell=2*R/(N-1), cosl=Math.cos(lat*Math.PI/180), info=$('riverinfo');
  clearRivers(); info.textContent=''; status('Lade Fließgewässer …');
  const dLat=R/111320, dLon=R/(111320*cosl), types=R<=5000?'river|canal|stream':'river|canal';
  const q=`[out:json][timeout:25];way["waterway"~"^(${types})$"](${(lat-dLat).toFixed(5)},${(lon-dLon).toFixed(5)},${(lat+dLat).toFixed(5)},${(lon+dLon).toFixed(5)});out geom;`;
  let ways;
  try{ ways=((await fetchJSON('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(q))).elements||[]).filter(w=>w.geometry&&w.geometry.length>1); }
  catch(e){ info.textContent='Fließgewässer nicht abrufbar ('+e.message+'). Es wird ohne Gewässer gerechnet.'; return null; }
  if(!ways.length){ info.textContent='Im Rechengebiet sind keine Fließgewässer verzeichnet.'; return null; }
  const big=w=>w.tags&&w.tags.waterway!=='stream';
  ways.sort((a,b)=>big(a)-big(b));                     // Bäche zuerst, Flüsse überschreiben
  const tx=new Float32Array(N*N), ty=new Float32Array(N*N), cw=Math.max(1,Math.round(60/cell));
  let near={d:Infinity,name:''};
  for(const w of ways){
    const g=w.geometry, name=(w.tags&&w.tags.name)||'';
    for(let i=0;i<g.length-1;i++){
      const x0=(g[i].lon-lon)*111320*cosl, y0=(g[i].lat-lat)*111320, x1=(g[i+1].lon-lon)*111320*cosl, y1=(g[i+1].lat-lat)*111320, L=Math.hypot(x1-x0,y1-y0);
      if(L<1) continue;
      const ux=(x1-x0)/L, uy=(y1-y0)/L, n=Math.max(1,Math.ceil(2*L/cell));
      for(let k=0;k<=n;k++){
        const x=x0+(x1-x0)*k/n, y=y0+(y1-y0)*k/n, d=Math.hypot(x,y);
        if(name&&d<near.d) near={d,name};
        const ci=Math.round((x+R)/cell), cj=Math.round((y+R)/cell);
        for(let b=-cw;b<=cw;b++)for(let a=-cw;a<=cw;a++){ const ii=ci+a, jj=cj+b; if(ii<0||jj<0||ii>=N||jj>=N) continue; tx[jj*N+ii]=ux; ty[jj*N+ii]=uy; }
      }
    }
  }
  if(map) for(const w of ways.slice(-500)) S.riverLines.push(L.polyline(w.geometry.map(p=>[p.lat,p.lon]),{color:'#1565c0',weight:big(w)?3.5:1.5,opacity:0.8,interactive:false}).addTo(map));
  S.riverGeo=ways.slice(-500).map(w=>({big:big(w),pts:w.geometry.map(p=>[p.lat,p.lon])}));
  S.riverName=near.name;
  const gt=S.rvelManual?'Fließgeschwindigkeit von Hand vorgegeben.':await loadGauge(near.name);
  info.textContent=`${ways.length} Gewässerabschnitte im Rechengebiet`+(near.name?`, nächstes benanntes Gewässer: ${near.name} (${dist(near.d)} entfernt)`:'')+'. '+gt;
  return {N,R,cell,tx,ty,v:Math.max(0,num('rvel',0.5))};
}

/* Blast-Cast */
const BLAST_LV=[
  {kpa:2,  col:'#6f8f00', txt:'Fensterbruch möglich, Verletzungen durch Glassplitter'},
  {kpa:7,  col:'#c99a00', txt:'Fenster und Türen zerstört, Dächer abgedeckt, Leichtbauten beschädigt'},
  {kpa:20, col:'#e06a00', txt:'Schwere Gebäudeschäden, Mauerwerk teilweise zerstört'},
  {kpa:35, col:'#c4001a', txt:'Trommelfellrisse, Wohngebäude weitgehend zerstört'},
  {kpa:100,col:'#5a0010', txt:'Lebensgefahr durch den Druck selbst (Lungenschäden)'}];
async function runBlast(manual,T0){
  if(!manual){
    status('Lade Wetterdaten …'); await loadWeather(); showWx();
    const W=S.wx; if(T0<W.t[0]||T0>W.t[W.t.length-1]) throw new Error('Für diesen Zeitpunkt liegen keine Wetterdaten vor. Ereignisbeginn anpassen oder Wetter von Hand vorgeben.');
  }
  clearRivers();
  const w=wxAt(T0), p0=w.pres*100, c0=Math.sqrt(1.4*287*w.Tk), kind=S.bkind, ws=[];
  const pz=(Wt,l)=>{ const r=blastRadius(Wt,l.kpa*1000,p0); return {name:l.kpa+' kPa',r,col:l.col,fill:true,txt:l.txt+` (Druckwelle nach ${fmt(r/c0,r/c0<1?2:1)} s)`}; };
  let zones, label, title, hs=1.5, shadeName='Druckschatten';
  if(kind==='bleve'){
    const M=num('bvmass',0)*Math.min(100,Math.max(1,num('bvfill',100)))/100;
    if(!(M>0)) throw new Error('Inhalt des Behälters angeben.');
    const B=bleve(M,w.T,w.rh), Rf=B.D/2;
    label='BLEVE '+$('bvessel').selectedOptions[0].textContent; title=`${label}: ${fmt(M,0)} kg, Feuerball ${Math.round(B.D)} m Durchmesser, ${fmt(B.t,1)} s`;
    hs=B.H; shadeName='Strahlungsschatten';
    zones=[
      {name:'Schmerzgrenze',r:B.rFor(125),col:'#c99a00',fill:true,txt:'Wärmestrahlung: Schmerz, Verbrennungen 1. Grades an ungeschützter Haut'},
      {name:'Verbrennung 2. Grades',r:B.rFor(250),col:'#e06a00',fill:true,txt:'Wärmestrahlung: Verbrennungen 2. Grades an ungeschützter Haut'},
      {name:'Lebensgefahr',r:B.rFor(1000),col:'#c4001a',fill:true,txt:'Wärmestrahlung: schwerste Verbrennungen, Lebensgefahr ohne Schutz'},
      {name:'Feuerball',r:Rf,col:'#5a0010',fill:true,txt:`Feuerball: Durchmesser ${Math.round(B.D)} m, Dauer ${fmt(B.t,1)} s, Abstrahlung rund ${Math.round(B.E)} kW/m²`},
      {name:'Richtwert Einsatzkräfte',r:Math.max(90,4*Rf),col:'#0b5c7a',fill:false,dash:false,txt:'4 Feuerballradien, mindestens 90 m: Richtwert von Transport Canada für Einsatzkräfte in Schutzkleidung. Trümmer können auch hier einschlagen.'},
      {name:'Richtwert Evakuierung',r:15*Rf,col:'#333c44',fill:false,dash:true,txt:'15 Feuerballradien: Richtwert von Transport Canada für die Evakuierung bei Flüssiggasbehältern (Trümmerflug). Kein allgemeiner Sicherheitsabstand.'},
      {name:'Richtwert erweitert',r:30*Rf,col:'#333c44',fill:false,dash:true,txt:'30 Feuerballradien: erweiterter Richtwert für weit fliegende Behälterteile. Kein allgemeiner Sicherheitsabstand.'}];
    ws.push('Trümmer sind die weitreichendste Gefahr: Behälterteile fliegen bevorzugt in Richtung der Behälterenden, einzelne weiter als der Mindestradius. Nicht in Verlängerung der Längsachse aufstellen.');
    ws.push('Der Zeitpunkt des Versagens ist nicht vorhersagbar. Bei direkter Beflammung kann ein Behälter binnen Minuten bersten; ein abblasendes Sicherheitsventil schließt einen BLEVE nicht aus.');
    ws.push('Gerechnet mit Propan und dem gesamten Inhalt. Die Druckwirkung wird nicht bemessen, weil dafür noch kein belegtes Verfahren hinterlegt ist; sie ist beim BLEVE gegenüber Feuerball und Trümmern nachrangig.');
  } else if(kind==='bomb'){
    const Wt=num('bneq',0), auw=Math.max(num('bauw',0),Wt);
    if(!(Wt>0)) throw new Error('Sprengstoffmasse angeben.');
    label=$('bbomb').selectedOptions[0].textContent; title=`Druckwelle: ${label} (${fmt(Wt,0)} kg TNT)`;
    zones=BLAST_LV.map(l=>pz(Wt,l));
    zones.push({name:'Splitter',r:634*Math.pow(auw,1/6),col:'#333c44',fill:false,dash:true,txt:'Gefahrenbereich für Splitter nach Faustformel UN IATG 01.80 (ungeschützt, Zutritt der Öffentlichkeit möglich)'});
    ws.push('Splitter fliegen viel weiter, als die Druckwelle wirkt. Den Evakuierungsradius legt der Kampfmittelräumdienst fest; der gestrichelte Kreis ist die Faustformel der Vereinten Nationen für eine ungeschützte Detonation im Freien.');
    ws.push('Liegt die Bombe im Erdreich, wird die Druckwelle gedämpft. Dafür kommen Erdauswurf und Erschütterung hinzu.');
  } else {
    const m=num('bmass',0); if(!(m>0)) throw new Error('Gasmenge angeben.');
    const Wt=+$('byield').value*m*(+$('bfuel').value)/4.6;
    label=fmt(m,0)+' kg '+$('bfuel').selectedOptions[0].textContent; title=`Druckwelle: ${label} (${fmt(Wt,Wt<10?1:0)} kg TNT)`;
    zones=BLAST_LV.map(l=>pz(Wt,l));
    ws.push('Das TNT-Äquivalent-Verfahren ist für Gaswolken grob: Im Nahbereich wird der Druck eher überschätzt, die Verdämmung bestimmt das Ergebnis stark. Im Zweifel die höhere Verdämmung wählen.');
    ws.push('Feuerball, Wärmestrahlung und Trümmerwurf sind nicht dargestellt.');
  }
  zones=zones.filter(z=>z.r>0).sort((a,b)=>b.r-a.r);
  const rFill=Math.max(...zones.filter(z=>z.fill).map(z=>z.r)), rAll=zones[0].r, R=Math.max(200,Math.ceil(rFill*1.25/100)*100);
  let terr=null, img=null, shade=0;
  if($('useTerr').checked){ status('Lade Höhendaten …'); terr=await loadTerrain(R); }
  if(terr){
    status('Berechne Geländeschatten …'); await pause();
    const sh=blastShadow(terr,hs,1.5), N=terr.N, K=3, M=(N-1)*K+1, cv=document.createElement('canvas'); cv.width=cv.height=M;
    const cx=cv.getContext('2d'), im=cx.createImageData(M,M), D=im.data; let inC=0, shC=0;
    for(let k=0;k<N*N;k++){ const i=k%N, j=(k-i)/N; if(Math.hypot(-R+i*terr.cell,-R+j*terr.cell)<=rFill){ inC++; if(sh[k]) shC++; } }
    shade=inC?shC/inC:0;
    for(let r=0;r<M;r++)for(let c=0;c<M;c++){
      if((r+c)%7>=3) continue;
      const j=Math.round((M-1-r)/K), i=Math.round(c/K);
      if(!sh[j*N+i]||Math.hypot(-R+i*terr.cell,-R+j*terr.cell)>rFill) continue;
      const o=(r*M+c)*4; D[o]=40; D[o+1]=50; D[o+2]=60; D[o+3]=170;
    }
    cx.putImageData(im,0,0); img=cv.toDataURL('image/png');
  }
  S.res={mode:'blast',bkind:kind,manual,blast:true,zones,title,label,shadeName,R,lat:S.src.lat,lon:S.src.lon,T0,terr:!!terr,img,shade,w,layers:[],meta:[],nSlots:0};
  if(kind!=='bleve') ws.push('Gebäude schirmen ab, in Straßenzügen kann der Druck aber gebündelt und verstärkt werden. Beides ist nicht erfasst.');
  if(kind!=='bleve'&&w.cls>=4) ws.push('Stabile Schichtung (Inversion): Die Druckwelle wird zum Boden zurückgelenkt. Fensterbruch kann deutlich weiter reichen als der äußere Kreis.');
  if(kind!=='bleve'&&w.u10>=5) ws.push(`Wind aus ${Math.round(w.dir)}° mit ${fmt(w.u10)} m/s: In Windrichtung reicht die Wirkung etwas weiter, gegen den Wind etwas weniger weit.`);
  if(kind==='bleve'&&w.u10>=5) ws.push(`Wind aus ${Math.round(w.dir)}° mit ${fmt(w.u10)} m/s: Der Feuerball wird in Windrichtung verdriftet, die Wärmezonen verschieben sich entsprechend.`);
  if(!terr) ws.push($('useTerr').checked?'Höhendaten nicht abrufbar: ohne Geländeschatten gerechnet.':'Gelände abgeschaltet: ohne Geländeschatten gerechnet.');
  const el=$('warnings'); el.hidden=false; el.innerHTML='<ul>'+ws.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
  buildTable(); $('timeline').hidden=false; $('tablesec').hidden=false; show(0);
  if(map) map.fitBounds(L.latLng(S.src.lat,S.src.lon).toBounds(2.2*rAll),{padding:[70,24]});
  finishResult(); toMap();
  status('Fertig: '+title+'.');
}
// Auf dem Telefon liegt die Karte über den Eingaben: nach der Rechnung dorthin zurückspringen
function toMap(){ try{ if(window.innerWidth<900) $('mapwrap').scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){} }
const blastRings=r=>r.zones.map((z,i)=>{ const a=[0,90,180,270,45,135,225,315][(r.zones.length-1-i)%8]*Math.PI/180; return {r:z.r,far:[Math.sin(a),Math.cos(a)],color:z.col,dash:!!z.dash,text:z.name+' · '+dist(z.r)}; });
function clearFills(){ (S.fills||[]).forEach(o=>map&&map.removeLayer(o)); S.fills=[]; }
const zsw=z=>`<span class="sw" style="background:${z.fill?z.col:`repeating-linear-gradient(90deg,${z.col} 0 4px,transparent 4px ${z.dash?7:4}px)`}"></span>`;
function showBlast(){
  const r=S.res;
  $('tlRow').hidden=true; S.slot=0;
  if(map){
    (S.overlays||[]).forEach(o=>map.removeLayer(o)); S.overlays=[]; clearFills();
    for(const z of r.zones) if(z.fill) S.fills.push(L.circle([r.lat,r.lon],{radius:z.r,color:z.col,weight:1,fillColor:z.col,fillOpacity:0.22,interactive:false}).addTo(map));
    if(r.img) S.overlays.push(L.imageOverlay(r.img,boundsOf(r),{opacity:1,interactive:false}).addTo(map));
    drawRings(blastRings(r));
  }
  $('slotlabel').textContent=r.title;
  let h='<div class="reach">';
  for(let i=r.zones.length-1;i>=0;i--){ const z=r.zones[i]; h+=`<span class="chip">${zsw(z)}${z.name} bis ${dist(z.r)}</span>`; }
  h+='</div><div class="small">Gelände: '+(r.terr?`berücksichtigt. Schraffiert: ${r.shadeName} hinter Geländeerhebungen (${Math.round(r.shade*100)} % der Fläche). Dort ist die Belastung geringer, Schäden bleiben möglich.`:'nicht berücksichtigt')+'</div>'+qualityHtml(r);
  $('slotinfo').innerHTML=h;
}

/* Vegetationsbrand */
async function runVeg(R,nSlots,T0,terr,meta){
  const N=241, cell=2*R/(N-1), [k,R0]=$('vfuel').value.split(',').map(Number);
  const V={N,R,terrain:terr,k,R0,state:+$('vstate').value,r0:num('vdia',20)/2,tEnd:nSlots*900,wx:t=>wxAt(T0+t)};
  const name=$('vfuel').selectedOptions[0].textContent;
  clearRivers();
  status('Berechne Feuerfront …'); await pause();
  const arr=spreadFire(V), tEnd=V.tEnd;
  const d={label:'Vegetationsbrand ('+name+')',heads:['Spitze m/min','Fläche ha','Front bis'],veg:true,slots:[]};
  const stat=t1=>{
    let area=0, reach=0, far=[0,0], edge=false;
    for(let j=0;j<N;j++)for(let i=0;i<N;i++) if(arr[j*N+i]<=t1){
      area+=cell*cell; if(i===0||j===0||i===N-1||j===N-1) edge=true;
      const x=-R+i*cell, y=-R+j*cell, q=Math.hypot(x,y); if(q>reach){ reach=q; far=[x,y]; }
    }
    return {area,reach:[Math.max(reach,V.r0)],far,edge};
  };
  const post=(a,p,total)=>{
    a.chips=[`<span class="chip"><span class="sw" style="background:#c4001a"></span>Brandfläche ${areaTxt(a.area)}</span>`,
             `<span class="chip">Front bis ca. ${dist(a.reach[0])}</span>`];
    if(!total) a.chips.push(`<span class="chip"><span class="sw" style="background:#ff7800"></span>Zuwachs in diesem Zeitfenster</span>`,
             `<span class="chip">Spitze ca. ${Number((p.Rh*60).toPrecision(2)).toLocaleString('de-DE')} m/min</span>`,`<span class="chip">Brennstofffeuchte ${Math.round(p.fmc)} %</span>`);
    else a.chips.push(`<span class="chip"><span class="sw" style="background:linear-gradient(90deg,#ffdc14,#a50014)"></span>Farbe: früh hell, spät dunkel</span>`);
    a.rings=[{r:a.reach[0],far:a.far,color:'#c4001a',dash:false,text:'Front · '+dist(a.reach[0])}];
    a.cells=[p?Number((p.Rh*60).toPrecision(2)).toLocaleString('de-DE'):'',a.area<5000?'<1':Number((a.area/1e4).toPrecision(2)).toLocaleString('de-DE'),dist(a.reach[0])];
    return a;
  };
  for(let n=1;n<=nSlots;n++){
    if(n%8===0){ status(`Vegetationsbrand: Zeitfenster ${n} von ${nSlots} …`); await pause(); }
    const p=rosParams(meta[n-1].w,V);
    d.slots.push(post({...stat(n*900), img:renderVeg(arr,N,(n-1)*900,n*900,tEnd,false)},p,false));
  }
  d.all=post({...stat(tEnd), img:renderVeg(arr,N,0,tEnd,tEnd,true)},null,true);
  d.maxU=Math.max(...meta.map(m=>m.w.u10));
  return [d];
}
function renderVeg(arr,N,ta,tb,tEnd,total){
  const K=2, M=(N-1)*K+1, cv=document.createElement('canvas'); cv.width=cv.height=M;
  const cx=cv.getContext('2d'), im=cx.createImageData(M,M), D=im.data, cap=tEnd*3+1;
  const g=k=>Math.min(arr[k],cap);
  for(let r=0;r<M;r++){
    const fy=(M-1-r)/K, j=Math.min(N-2,Math.floor(fy)), b=fy-j;
    for(let c=0;c<M;c++){
      const fx=c/K, i=Math.min(N-2,Math.floor(fx)), a=fx-i, k=j*N+i;
      const t=g(k)*(1-a)*(1-b)+g(k+1)*a*(1-b)+g(k+N)*(1-a)*b+g(k+N+1)*a*b;
      if(t>tb) continue;
      const o=(r*M+c)*4;
      if(total){ const q=Math.floor(t/3600)*3600/Math.max(tEnd-3600,1), z=Math.min(1,q); D[o]=255-90*z; D[o+1]=220*(1-z); D[o+2]=20; D[o+3]=165; }
      else if(t>ta){ D[o]=255; D[o+1]=120; D[o+2]=0; D[o+3]=195; }
      else { D[o]=150; D[o+1]=15; D[o+2]=20; D[o+3]=150; }
    }
  }
  cx.putImageData(im,0,0);
  return cv.toDataURL('image/png');
}

function boundsOf(r,Rg){
  const R=Rg||r.R, dLat=R/111320, dLon=R/(111320*Math.cos(r.lat*Math.PI/180));
  return [[r.lat-dLat,r.lon-dLon],[r.lat+dLat,r.lon+dLon]];
}

function warnings(defs,meta,terr,manual){
  const w=[], veg=defs.some(d=>d.veg);
  if(defs.some(d=>d.all.edge)) w.push((veg?'Die Feuerfront':'Die Gefahrenzone')+' erreicht den Rand des Rechengebiets. Rechengebiet vergrößern.');
  for(const d of defs) if(d.none) w.push(d.label+': Keine Schwelle wird am Boden überschritten. Eine aufsteigende Fahne kann über das Gebiet hinwegziehen und weiter entfernt oder an höher gelegenem Gelände auftreffen.');
  if(defs.some(d=>d.P&&d.P.river)) w.push(`Fließgewässer einbezogen mit ${fmt(defs.find(d=>d.P&&d.P.river).P.river.v,2)} m/s: Die Lenkung entlang des Gewässers ist eine grobe Näherung. Tiefliegende Uferbereiche, Brücken, Schleusen und Ortslagen am Wasser gesondert betrachten.`);
  if(defs.some(d=>d.sid==='nh3'&&d.init&&d.init.zustand==='gas')) w.push('Ammoniak aus druckverflüssigter Lagerung tritt kalt und als Nebel aus und verhält sich anfangs wie ein Schwergas. Dafür den Zustand beim Austritt auf „druckverflüssigt" stellen.');
  if(defs.some(d=>d.bm)) w.push('Schwergas: Die Wolke breitet sich in Bodennähe flach und breit aus, auch gegen den Wind, und sammelt sich in Senken, Kellern und Tälern. Die farbigen Flächen stammen aus dem passiven Modell und sind dafür zu schmal.');
  if(veg){
    w.push('Die Vegetation gilt überall als gleich und brennbar. Straßen, Gewässer, Äcker und Ortschaften als Brandriegel selbst in der Karte berücksichtigen.');
    w.push('Flugfeuer ist nicht erfasst'+(defs[0].maxU>=8?'; bei dem vorhergesagten starken Wind ist es wahrscheinlich und kann die Front deutlich schneller vorantreiben.':'.'));
    w.push('Die Ausbreitungsgeschwindigkeit beruht auf Faustformeln. Mit der beobachteten Frontgeschwindigkeit vergleichen und Vegetation oder Zustand anpassen.');
  } else {
    if(meta.some(s=>s.w.u10<1)) w.push('Schwachwind unter 1 m/s: Windrichtung unzuverlässig, Ausbreitung in alle Richtungen möglich. Gefahrenbereich kreisförmig annehmen.');
    if(meta.some(s=>s.w.prec>0.1)) w.push('Niederschlag im Prognosezeitraum: Auswaschung und Rauchniederschlag sind nicht berücksichtigt.');
    if(meta.some(s=>s.w.gust>2*Math.max(s.w.u10,1))) w.push('Starke Böen: Die Fahne pendelt, seitliche Zonen großzügiger ansetzen.');
    if(S.res.R>20000) w.push('Großes Rechengebiet: Auflösung rund 400 m, Wetter nur vom Freisetzungsort. Entfernungen über 10 km sind grobe Schätzungen.');
  }
  if(veg&&meta.some(s=>s.w.gust>2*Math.max(s.w.u10,1))) w.push('Starke Böen: Die Front kann sprunghaft und in wechselnde Richtung laufen.');
  if(!manual){ const ms=modelSpread(S.res.T0); if(ms.rows.length>1&&ms.spread>45) w.push(`Die Wettermodelle weichen bei der Windrichtung um bis zu ${Math.round(ms.spread)}° voneinander ab. Richtung unsicher, vor Ort messen.`); }
  if(!terr) w.push($('useTerr').checked?'Höhendaten nicht abrufbar: ohne Geländeeinfluss gerechnet.':'Gelände abgeschaltet: ohne Geländeeinfluss gerechnet.');
  if(manual) w.push('Wetter von Hand vorgegeben: Wind und Schichtung bleiben über alle Zeitfenster gleich.');
  const el=$('warnings'); el.hidden=!w.length; el.innerHTML='<ul>'+w.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
}
