const DE=[[47.2,5.8],[55.1,15.1]];   // Rechen- und Kartenbereich: Deutschland
/* ---------- Karte ---------- */
let map=null;
if (window.L){
  map=L.map('map',{minZoom:5,maxBounds:L.latLngBounds(DE).pad(0.3),maxBoundsViscosity:0.9}).fitBounds(DE);
  const otm=L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'Kartendaten © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM | Darstellung © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'});
  const osm=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'});
  otm.addTo(map);
  L.control.layers({'OpenTopoMap (Gelände)':otm,'OpenStreetMap':osm},null,{position:'topright'}).addTo(map);
  L.control.scale({imperial:false}).addTo(map);
  map.on('click',e=>setSource(e.latlng.lat,e.latlng.lng,false));
  map.on('baselayerchange',e=>{ S.base=e.name==='OpenStreetMap'?'osm':'otm'; });
} else {
  $('hint').textContent='Karte konnte nicht geladen werden (Internetverbindung prüfen)';
}

function setSource(lat,lon,zoom){
  if(lat<DE[0][0]||lat>DE[1][0]||lon<DE[0][1]||lon>DE[1][1]){ status('Der Ort liegt außerhalb Deutschlands. Das Tool rechnet nur innerhalb Deutschlands.'); return; }
  S.src={lat,lon}; S.place='';
  $('hint').hidden=true;
  $('coords').textContent=lat.toFixed(5)+'° N, '+lon.toFixed(5)+'° O';
  if (map){
    if (!S.marker){
      S.marker=L.marker([lat,lon],{draggable:true,icon:L.divIcon({className:'',html:'<div class="srcicon"></div>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);
      S.marker.on('dragend',()=>{const p=S.marker.getLatLng(); setSource(p.lat,p.lng,false);});
    } else S.marker.setLatLng([lat,lon]);
    if (zoom || map.getZoom()<11) map.setView([lat,lon],Math.max(map.getZoom(),13));
  }
  $('terrinfo').textContent='';
  loadWeather().then(()=>{showWx(); loadModels();}).catch(e=>{$('wxinfo').textContent='Wetterdaten nicht abrufbar: '+e.message;});
  loadObs();
}

$('search').onclick=async()=>{
  const q=$('q').value.trim(); if(!q) return;
  status('Suche Ort …');
  try{
    const r=await fetchJSON('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=de&q='+encodeURIComponent(q));
    if(!r.length){ status('Kein Ort gefunden. Schreibweise prüfen oder Karte antippen.'); return; }
    status(r[0].display_name);
    setSource(+r[0].lat,+r[0].lon,true); S.place=r[0].display_name;
  }catch(e){ status('Ortssuche nicht erreichbar: '+e.message); }
};
$('q').addEventListener('keydown',e=>{ if(e.key==='Enter') $('search').click(); });
$('gps').onclick=()=>{
  if(!navigator.geolocation){ status('Standortbestimmung wird vom Browser nicht unterstützt.'); return; }
  status('Bestimme Standort …');
  navigator.geolocation.getCurrentPosition(p=>{status(''); setSource(p.coords.latitude,p.coords.longitude,true);},
    e=>status('Standort nicht verfügbar ('+e.message+'). Ort suchen oder Karte antippen.'),{enableHighAccuracy:true,timeout:10000});
};
