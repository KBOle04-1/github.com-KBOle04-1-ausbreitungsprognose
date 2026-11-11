/* ---------- Anzeige ---------- */
const imgsOf=(s,r)=>s.imgs||(s.img?[{src:s.img,R:r.R}]:[]);
function drawRings(rings){
  const r=S.res; S.ringDefs=rings;
  (S.rings||[]).forEach(o=>map.removeLayer(o)); S.rings=[];
  if(!$('showRings').checked) return;
  const cosl=Math.cos(r.lat*Math.PI/180), ll=p=>[r.lat+p[1]/111320, r.lon+p[0]/(111320*cosl)];
  const mpp=40075016*cosl/(256*Math.pow(2,map.getZoom()));       // Meter je Bildpunkt
  for(const g of rings){
    if(!(g.r>0)) continue;
    const q=Math.hypot(g.far[0],g.far[1])||1, ux=g.far[0]/q, uy=g.far[1]/q, end=ll([ux*g.r,uy*g.r]);
    S.rings.push(L.circle([r.lat,r.lon],{radius:g.r,color:g.color,weight:3,fill:false,dashArray:g.dash?'7 7':null,interactive:false}).addTo(map));
    if(g.r/mpp<16) continue;                                     // zu klein für eine lesbare Beschriftung: erst beim Hineinzoomen
    S.rings.push(L.polyline([[r.lat,r.lon],end],{color:g.color,weight:2,dashArray:'2 6',interactive:false}).addTo(map));
    const tx=ux>0.38?'8px':ux<-0.38?'calc(-100% - 8px)':'-50%', ty=uy>0.38?'calc(-100% - 8px)':uy<-0.38?'8px':'-50%';   // Beschriftung zeigt vom Mittelpunkt weg
    S.rings.push(L.marker(end,{interactive:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<span class="rlab" style="border-color:${g.color};transform:translate(${tx},${ty})">${g.text}</span>`})}).addTo(map));
  }
}
if(map) map.on('zoomend',()=>{ if(S.res&&S.ringDefs) drawRings(S.ringDefs); });
$('showRings').onchange=()=>show(S.slot);
function show(idx){
  const r=S.res; if(!r) return;
  if(r.blast){ showBlast(); return; }
  $('tlRow').hidden=false; clearFills();
  S.slot=idx; $('slider').value=idx;
  const pick=d=>idx===0?d.all:d.slots[idx-1];
  if(map){
    (S.overlays||[]).forEach(o=>map.removeLayer(o));
    S.overlays=r.layers.flatMap(d=>imgsOf(pick(d),r).map(g=>L.imageOverlay(g.src,boundsOf(r,g.R),{opacity:1,interactive:false}).addTo(map)));
    drawRings(r.layers.flatMap(d=>pick(d).rings));
  }
  const m=idx===0?null:r.meta[idx-1];
  $('slotlabel').textContent=idx===0
    ? `Gesamtbereich ${hhmm(r.T0)} bis ${hhmm(r.T0+r.nSlots*900)} Uhr (alle Zeitfenster)`
    : `${hhmm(m.t0)} bis ${hhmm(m.t1)} Uhr · T+${idx*15} min`;
  let h='';
  if(m){ const w=m.w; h+=`<div><span class="arrow" style="transform:rotate(${w.dir}deg)">↓</span> Wind ${windText(w)} · Schichtung ${CLS[w.cls]} (${CLSTXT[w.cls]})${w.manual?'':' · '+fmt(w.T)+' °C'}</div>`; }
  for(const d of r.layers){
    if(r.layers.length>1) h+='<div class="grp">'+d.label+'</div>';
    if(d.sg) h+='<div class="small"><strong>Modellwahl:</strong> '+d.sg.txt+'</div>';
    if(d.bm) h+='<div class="grp">Schwergas-Entfernung nach Britter-McQuaid</div><div class="reach">'+pick(d).bmChips.join('')+'</div><div class="small">Gestrichelte Kreise. Stationäre Abschätzung für ebenes, hindernisarmes Gelände mit dem Wind zu Ereignisbeginn; nicht zeitabhängig, gilt für alle Zeitfenster gleich.</div><div class="grp">Fläche und Zeitverlauf aus dem passiven Gauß-Modell (abgeleitet)</div>';
    h+='<div class="reach">'+pick(d).chips.join('')+'</div>';
  }
  h+='<div class="small">Gelände: '+(r.terr?'berücksichtigt':'nicht berücksichtigt')+'</div>'+qualityHtml(r);
  $('slotinfo').innerHTML=h;
  document.querySelectorAll('#tbody tr').forEach((tr,i)=>tr.classList.toggle('on',i===idx));
}
function buildTable(){
  const r=S.res;
  $('tblTitle').textContent=r.blast?'Wirkungszonen':'Zeittabelle'; $('tblNote').hidden=!!r.blast;
  if(r.blast){
    $('thead').innerHTML='<tr><th>Zone</th><th>bis</th><th style="text-align:left">Wirkung</th></tr>';
    $('tbody').innerHTML=[...r.zones].reverse().map(z=>`<tr><td>${zsw(z)} ${z.name}</td><td>${dist(z.r)}</td><td style="text-align:left;white-space:normal;min-width:200px">${z.txt}</td></tr>`).join('');
    return;
  }
  $('thead').innerHTML='<tr><th>Zeitfenster</th><th>Wind</th><th>Kl.</th>'+r.layers.flatMap(d=>d.heads).map(x=>'<th>'+x+'</th>').join('')+'</tr>';
  const row=(i,first,w)=>'<tr><td>'+first+'</td><td>'+(w?Math.round(w.dir)+'° / '+fmt(w.u10)+' m/s':'')+'</td><td>'+(w?CLS[w.cls]:'')+'</td>'+r.layers.flatMap(d=>(i<0?d.all:d.slots[i]).cells).map(x=>'<td>'+x+'</td>').join('')+'</tr>';
  $('tbody').innerHTML=row(-1,'Gesamt',null)+r.meta.map((m,i)=>row(i,hhmm(m.t0)+'–'+hhmm(m.t1),m.w)).join('');
  document.querySelectorAll('#tbody tr').forEach((tr,i)=>tr.onclick=()=>{stopPlay();show(i);});
}
