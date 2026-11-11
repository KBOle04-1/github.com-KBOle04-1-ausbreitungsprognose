/* ===================== Oberfläche ===================== */
const $=id=>document.getElementById(id);
const gridN=R=>R<=10000?121:R<=20000?201:241;
const LCOL=[[242,199,0],[240,125,0],[209,0,31]];
const CLS='ABCDEF', CLSTXT=['sehr labil','labil','leicht labil','neutral','stabil','sehr stabil'];
const COMPASS=['N','NNO','NO','ONO','O','OSO','SO','SSO','S','SSW','SW','WSW','W','WNW','NW','NNW'];
const S={src:null, wx:null, wxKey:'', obs:null, terr:null, terrKey:'', res:null, slot:0, overlay:null, timer:null, mode:'gas', inst:false, marker:null};

const fmt=(v,d=1)=>v.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
const hhmm=ts=>new Date(ts*1000).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
// Rundung nach der Aussagekraft des Modells, nicht nach der Rechengenauigkeit
const dist=m=>m<=0?'–':m<95?Math.max(10,Math.round(m/10)*10)+' m':m<975?Math.round(m/50)*50+' m':m<9950?fmt(m/1000,1)+' km':Math.round(m/1000)+' km';
const areaTxt=a=>a<5000?'unter 1 ha':'ca. '+(a<95e4?Number((a/1e4).toPrecision(a<95e3?1:2))+' ha':fmt(a/1e6,a<95e5?1:0)+' km²');
function status(t){ $('status').textContent=t; }
