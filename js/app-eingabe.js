/* ---------- Szenario-Eingaben ---------- */
const sel=$('subst');
SUBST.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;sel.appendChild(o);});
function curSubst(){ return SUBST.find(s=>s.id===sel.value); }
function fillThresholds(){
  let names, lv, note;
  if (S.mode==='fire'){
    names=LNAMES.fire; lv=[0.05,0.5,5];
    note='Rauchpartikel in mg/m³. Orientierungswerte, keine amtlichen Grenzwerte: Stufe 1 Geruch und Belästigung, Stufe 2 Fenster und Türen schließen, Stufe 3 dichte Verrauchung mit Sichtbehinderung.';
  } else {
    const s=curSubst(); names=LNAMES[s.kind]; lv=s.lv;
    note=(S.mode==='combo'?'Gefahrstoff: ':'')+(s.kind==='aegl'?'Werte in ppm, AEGL für 60 Minuten Einwirkzeit. Leeres Feld: kein Wert festgelegt.'
        :s.kind==='ueg'?'Werte in ppm, bezogen auf die untere Explosionsgrenze. Örtliche Spitzen können deutlich über dem berechneten Mittel liegen.'
        :'Eigene Schwellen in ppm.');
    $('customBox').hidden=s.kind!=='custom';
  }
  ['t1l','t2l','t3l'].forEach((id,i)=>$(id).textContent=names[i]);
  ['thr1','thr2','thr3'].forEach((id,i)=>$(id).value=lv[i]==null?'':lv[i]);
  $('thrnote').textContent=note;
}
function stateOptions(){
  const sb=curSubst(), st=$('relState'), th=sb.th;
  st.options[1].disabled=!(th&&th.cpl); st.options[2].disabled=!th;
  if(st.selectedOptions[0].disabled) st.value='gas';
  $('tsLbl').hidden=st.value!=='zweiphasig';
  $('stateNote').textContent=!th?'Für diesen Stoff sind keine Siede- und Verdampfungsdaten hinterlegt. Gerechnet wird als Gas bei Umgebungstemperatur; für eine Freisetzung aus der Flüssigphase ist das Ergebnis dann nicht belastbar.'
    :st.value==='zweiphasig'?'Ein Teil verdampft schlagartig, der Rest wird als Aerosol mitgerissen. Gerechnet wird die gesamte Masse als kalter Dampf bei Siedetemperatur, ohne Ausregnen (sichere Seite).'
    :st.value==='kalt'?'Reiner Dampf bei Siedetemperatur, z. B. über einer verdampfenden Lache.':'';
}
$('relState').onchange=stateOptions;
sel.onchange=()=>{ fillThresholds(); stateOptions(); };
function setMode(m){
  S.mode=m;
  for(const [id,k] of [['modeGas','gas'],['modeFire','fire'],['modeCombo','combo']]) $(id).setAttribute('aria-pressed',m===k);
  const veg=m==='veg', blast=m==='blast';
  if(!veg&&!blast) S.cloudMode=m;
  $('blastBox').style.display=blast?'grid':'none';
  for(const id of ['gridRow','gridNote']) $(id).hidden=blast;
  $('gasBox').style.display=(m==='gas'||m==='combo')?'grid':'none'; $('fireBox').style.display=(m==='fire'||m==='combo')?'grid':'none';
  $('vegBox').style.display=veg?'grid':'none';
  for(const id of ['thrRow','thrnote','urbLbl','urbnote','terrWindLbl']) $(id).hidden=veg||blast;
  document.querySelectorAll('.combo').forEach(e=>e.hidden=m!=='combo'); $('comboNote').hidden=m!=='combo';
  fillThresholds();
}
$('modeGas').onclick=()=>setMode('gas'); $('modeFire').onclick=()=>setMode('fire'); $('modeCombo').onclick=()=>setMode('combo');
function setTab(t){
  S.tab=t; document.body.dataset.tab=t;
  for(const [id,k] of [['tabCloud','cloud'],['tabVeg','veg'],['tabBlast','blast']]) $(id).setAttribute('aria-selected',t===k);
  $('modeSeg').hidden=t!=='cloud';
  setMode(t==='cloud'?(S.cloudMode||'gas'):t);
}
$('tabCloud').onclick=()=>setTab('cloud'); $('tabVeg').onclick=()=>setTab('veg'); $('tabBlast').onclick=()=>setTab('blast');
function setBlastKind(k){
  S.bkind=k;
  for(const [id,q] of [['bGas','gas'],['bBomb','bomb'],['bBleve','bleve']]) $(id).setAttribute('aria-pressed',k===q);
  $('bGasBox').hidden=k!=='gas'; $('bBombBox').hidden=k!=='bomb'; $('bBleveBox').hidden=k!=='bleve';
}
S.bkind='gas';
$('bGas').onclick=()=>setBlastKind('gas'); $('bBomb').onclick=()=>setBlastKind('bomb'); $('bBleve').onclick=()=>setBlastKind('bleve');
$('bvessel').onchange=()=>{ $('bvmass').value=$('bvessel').value; };
$('useRiver').onchange=()=>{ $('riverBox').hidden=!$('useRiver').checked; if(!$('useRiver').checked){ $('riverinfo').textContent=''; clearRivers(); } };
$('rvel').oninput=()=>{ S.rvelManual=true; };
$('rgauge').onclick=async()=>{ if(!S.src){ status('Zuerst den Ort wählen.'); return; } S.rvelManual=false; $('riverinfo').textContent='Rufe Pegel ab …'; $('riverinfo').textContent=await loadGauge(S.riverName||''); };
$('bbomb').onchange=()=>{ const [a,n]=$('bbomb').value.split(','); $('bauw').value=a; $('bneq').value=n; };
function urbNote(){
  $('urbnote').innerHTML=$('urban').value==='1'
   ? '<strong>Bebauung:</strong> Ortslage, Stadt, Gewerbegebiet. Gebäude verwirbeln die Luft stark. Die Wolke wird schnell breiter und höher durchmischt, die Konzentration fällt rascher ab: kürzere Reichweite, dafür breiterer Streifen. Straßenschluchten, Stau hinter Gebäuden und Eindringen in Häuser sind nicht erfasst.'
   : '<strong>Freifläche:</strong> Felder, Wiesen, Wald, einzelne Gebäude. Wenig Verwirbelung. Die Wolke bleibt schmal und bodennah konzentriert: größere Reichweite, schmalerer Streifen. Bei bodennaher Freisetzung im Zweifel diese Einstellung wählen. Bei Brandrauch beide Einstellungen rechnen: Eine aufsteigende Fahne kann in Bebauung früher den Boden erreichen.';
}
$('urban').onchange=urbNote; urbNote();
function setRel(inst){
  S.inst=inst;
  $('relCont').setAttribute('aria-pressed',!inst); $('relInst').setAttribute('aria-pressed',inst);
  $('lblRate').hidden=inst; $('lblDur').hidden=inst; $('lblMass').hidden=!inst;
}
$('relCont').onclick=()=>setRel(false); $('relInst').onclick=()=>setRel(true);
$('firePreset').onchange=()=>{$('mw').value=$('firePreset').value;};
$('manual').onchange=()=>{$('manBox').hidden=!$('manual').checked;};
function setNow(){ const d=new Date(); d.setSeconds(0,0); $('t0').value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); }
$('now').onclick=()=>{setNow(); showWx(); showModels();};
$('t0').onchange=()=>{showWx(); showModels();};
setNow(); fillThresholds(); stateOptions(); document.body.dataset.tab='cloud';
