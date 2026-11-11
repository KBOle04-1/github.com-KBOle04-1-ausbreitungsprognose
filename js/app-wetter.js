/* ---------- Wetter ---------- */
async function fetchJSON(url){
  const r=await fetch(url);
  if(!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}
async function loadWeather(){
  const {lat,lon}=S.src, key=lat.toFixed(3)+','+lon.toFixed(3);
  if (S.wx && S.wxKey===key && Date.now()-S.wx.fetched<10*60000) return S.wx;
  const base=`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&wind_speed_unit=ms&timeformat=unixtime&timezone=GMT&past_days=1&forecast_days=3`;
  const v='relative_humidity_2m,temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,shortwave_radiation,precipitation';
  const variants=[
    base+'&minutely_15='+v+'&hourly=cloud_cover,surface_pressure,boundary_layer_height',
    base+'&minutely_15='+v+'&hourly=cloud_cover,surface_pressure',
    base+'&hourly='+v+',cloud_cover,surface_pressure'];
  let d=null, err=null;
  for(const u of variants){ try{ d=await fetchJSON(u); if(d&&(d.minutely_15||d.hourly)) break; d=null; }catch(e){ err=e; } }
  if(!d) throw new Error('Wetterdaten nicht abrufbar (Internetverbindung prüfen). Ersatzweise Wetter von Hand vorgeben.');
  const m=d.minutely_15||d.hourly, h=d.hourly||{};
  const n=m.time.length, U=new Float32Array(n), V=new Float32Array(n);
  for(let i=0;i<n;i++){
    const sp=m.wind_speed_10m[i]??0, dir=(m.wind_direction_10m[i]??0)*Math.PI/180;
    U[i]=-sp*Math.sin(dir); V[i]=-sp*Math.cos(dir);
  }
  S.wx={fetched:Date.now(), step15:!!d.minutely_15, elev:d.elevation, t:m.time, U, V, spd:m.wind_speed_10m, gust:m.wind_gusts_10m,
        rad:m.shortwave_radiation, temp:m.temperature_2m, prec:m.precipitation, rh:m.relative_humidity_2m,
        th:h.time, cloud:h.cloud_cover, pres:h.surface_pressure, blh:h.boundary_layer_height};
  S.wxKey=key;
  return S.wx;
}
function lin(t,v,ts){
  if(!t||!v||!t.length) return NaN;
  const n=t.length;
  if(ts<=t[0]) return v[0]??NaN;
  if(ts>=t[n-1]) return v[n-1]??NaN;
  const step=t[1]-t[0], i=Math.min(n-2,Math.floor((ts-t[0])/step)), f=(ts-t[i])/step, a=v[i], b=v[i+1];
  if(a==null||Number.isNaN(a)) return b??NaN;
  if(b==null||Number.isNaN(b)) return a;
  return a+(b-a)*f;
}
function wxAt(ts){
  let o;
  if ($('manual').checked){
    const dir=(+$('mdir').value||0)*Math.PI/180, sp=Math.max(0,+$('mspd').value||0), cls=+$('mcls').value;
    o={u10:sp, U:-Math.sin(dir), V:-Math.cos(dir), gust:NaN, rad:NaN, cloud:NaN, T:+$('mtemp').value||10, rh:+$('mrh').value||40, prec:0, pres:1013, zi:ZI_DEF[cls], cls, manual:true};
  } else {
    const W=S.wx;
    o={u10:lin(W.t,W.spd,ts), U:lin(W.t,W.U,ts), V:lin(W.t,W.V,ts), gust:lin(W.t,W.gust,ts), rad:lin(W.t,W.rad,ts)||0,
       T:lin(W.t,W.temp,ts), rh:lin(W.t,W.rh,ts), prec:lin(W.t,W.prec,ts)||0, cloud:lin(W.th,W.cloud,ts), pres:lin(W.th,W.pres,ts), blh:lin(W.th,W.blh,ts)};
    if(Number.isNaN(o.cloud)) o.cloud=50;
    if(Number.isNaN(o.pres)) o.pres=1013;
    if(Number.isNaN(o.T)) o.T=10;
    if(Number.isNaN(o.rh)) o.rh=50;
    o.u10=o.u10||0;
    o.cls=stabClass(o.u10,o.rad,o.cloud);
    o.zi=o.cls<=3 ? (o.blh>50?o.blh:ZI_DEF[o.cls]) : 0;
  }
  const n=Math.hypot(o.U,o.V);
  if(n>1e-6){ o.dx=o.U/n; o.dy=o.V/n; } else { o.dx=1; o.dy=0; }
  o.dir=(Math.atan2(-o.dx,-o.dy)*180/Math.PI+360)%360;
  o.Tk=o.T+273.15;
  return o;
}
function t0sec(){ const d=new Date($('t0').value); return Math.floor(d.getTime()/1000); }
function windText(w){
  return `aus ${Math.round(w.dir)}° (${COMPASS[Math.round(w.dir/22.5)%16]}) mit ${fmt(w.u10)} m/s`+(w.gust>0?`, Böen ${fmt(w.gust)} m/s`:'');
}
function showWx(){
  if(!S.wx||!S.src) return;
  const ts=t0sec(), W=S.wx;
  if(!(ts>=W.t[0] && ts<=W.t[W.t.length-1])){ $('wxinfo').textContent='Für diesen Zeitpunkt liegen keine Wetterdaten vor (verfügbar: gestern bis übermorgen).'; return; }
  const w=wxAt(ts);
  $('wxinfo').innerHTML=`<strong>Vorhersage ${hhmm(ts)} Uhr</strong> (Open-Meteo, ${W.step15?'15-Minuten-Werte':'Stundenwerte, interpoliert'}): Wind ${windText(w)}, ${fmt(w.T)} °C, Luftfeuchte ${Math.round(w.rh)} %, Bewölkung ${Math.round(w.cloud)} %, Strahlung ${Math.round(w.rad)} W/m², Niederschlag ${fmt(w.prec)} mm. Schichtung <strong>${CLS[w.cls]}</strong> (${CLSTXT[w.cls]})`+(w.zi?`, Mischungsschicht ${Math.round(w.zi)} m.`:'.');
}
const MODELS=[['icon_d2','ICON-D2'],['icon_eu','ICON-EU'],['ecmwf_ifs025','ECMWF IFS'],['gfs_seamless','GFS'],['meteofrance_seamless','Météo-France']];
async function loadModels(){
  const key=S.wxKey, {lat,lon}=S.src, out=[];
  $('mdlinfo').textContent='';
  await Promise.all(MODELS.map(async([id,name],idx)=>{
    try{
      const d=await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&wind_speed_unit=ms&timeformat=unixtime&timezone=GMT&past_days=1&forecast_days=3&hourly=wind_speed_10m,wind_direction_10m&models=${id}`);
      const h=d.hourly, n=h.time.length, U=new Float32Array(n), V=new Float32Array(n);
      for(let i=0;i<n;i++){ const sp=h.wind_speed_10m[i], dr=h.wind_direction_10m[i]; if(sp==null||dr==null){U[i]=V[i]=NaN;continue;} U[i]=-sp*Math.sin(dr*Math.PI/180); V[i]=-sp*Math.cos(dr*Math.PI/180); }
      out.push({idx,name,t:h.time,U,V,spd:h.wind_speed_10m});
    }catch(e){ /* Modell für diesen Ort nicht verfügbar */ }
  }));
  if(S.wxKey!==key) return;
  S.mdl=out.sort((a,b)=>a.idx-b.idx); showModels();
}
// Vergleich der Wettermodelle zum Zeitpunkt ts: Liste und größte Abweichung der Windrichtung
function modelSpread(ts){
  const rows=[];
  for(const m of S.mdl||[]){
    const U=lin(m.t,m.U,ts), V=lin(m.t,m.V,ts), sp=lin(m.t,m.spd,ts);
    if(Number.isNaN(U)||Number.isNaN(V)||Number.isNaN(sp)||ts<m.t[0]||ts>m.t[m.t.length-1]) continue;
    rows.push({name:m.name,sp,dir:(Math.atan2(-U,-V)*180/Math.PI+360)%360});
  }
  let spread=0;
  for(const a of rows) for(const b of rows){ const d=Math.abs(a.dir-b.dir); spread=Math.max(spread,Math.min(d,360-d)); }
  return {rows,spread};
}
function showModels(){
  if(!S.mdl||!S.src) return;
  const ts=t0sec(), {rows,spread}=modelSpread(ts);
  if(rows.length<2){ $('mdlinfo').textContent=''; return; }
  const sps=rows.map(r=>r.sp);
  $('mdlinfo').innerHTML=`<strong>Modellvergleich ${hhmm(ts)} Uhr:</strong> `+rows.map(r=>`${r.name} ${Math.round(r.dir)}° / ${fmt(r.sp)} m/s`).join(' · ')
    +`. Windrichtung weicht bis ${Math.round(spread)}° voneinander ab, Windstärke ${fmt(Math.min(...sps))} bis ${fmt(Math.max(...sps))} m/s.`
    +(spread>45?' <strong>Die Modelle sind sich uneinig: Windrichtung unsicher, vor Ort messen.</strong>':'');
}
async function loadObs(){
  $('obsinfo').textContent='';
  try{
    const {lat,lon}=S.src;
    const d=await fetchJSON(`https://api.brightsky.dev/current_weather?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`);
    const w=d.weather, s=(d.sources||[])[0]||{};
    if(!w||w.wind_speed_10==null) return;
    const t=Math.floor(new Date(w.timestamp).getTime()/1000);
    $('obsinfo').innerHTML=`<strong>Messung ${hhmm(t)} Uhr</strong>, DWD-Station ${s.station_name||''}${s.distance?' ('+fmt(s.distance/1000,1)+' km entfernt)':''}: Wind aus ${w.wind_direction_10}° mit ${fmt(w.wind_speed_10/3.6)} m/s`+(w.wind_gust_speed_10!=null?`, Böen ${fmt(w.wind_gust_speed_10/3.6)} m/s`:'')+`, ${fmt(w.temperature)} °C. Weicht die Messung deutlich von der Vorhersage ab, Wetter von Hand vorgeben.`;
  }catch(e){ /* außerhalb des DWD-Gebiets oder Dienst nicht erreichbar */ }
}
