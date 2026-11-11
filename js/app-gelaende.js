/* ---------- Gelände ---------- */
function loadImg(url){
  return new Promise((res,rej)=>{
    const im=new Image(); im.crossOrigin='anonymous';
    const to=setTimeout(()=>rej(new Error('Zeitüberschreitung')),10000);
    im.onload=()=>{clearTimeout(to);res(im);}; im.onerror=()=>{clearTimeout(to);rej(new Error('Kachel nicht ladbar'));};
    im.src=url;
  });
}
function nodeLatLon(lat,lon,R,N,i,j){
  const cell=2*R/(N-1);
  return [lat+(-R+j*cell)/111320, lon+(-R+i*cell)/(111320*Math.cos(lat*Math.PI/180))];
}
async function terrTiles(lat,lon,R,N){
  const cosl=Math.cos(lat*Math.PI/180);
  let z=Math.floor(Math.log2(40075016*cosl/(2*R))); z=Math.max(5,Math.min(14,z));
  const n=2**z;
  const px=lo=>(lo+180)/360*n, py=la=>{const r=la*Math.PI/180; return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n;};
  const [latS,lonW]=nodeLatLon(lat,lon,R,N,0,0), [latN,lonE]=nodeLatLon(lat,lon,R,N,N-1,N-1);
  const x0=Math.floor(px(lonW)), x1=Math.floor(px(lonE)), y0=Math.floor(py(latN)), y1=Math.floor(py(latS));
  const cv=document.createElement('canvas'); cv.width=(x1-x0+1)*256; cv.height=(y1-y0+1)*256;
  const cx=cv.getContext('2d',{willReadFrequently:true});
  const jobs=[];
  for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)
    jobs.push(loadImg(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`).then(im=>cx.drawImage(im,(x-x0)*256,(y-y0)*256)));
  await Promise.all(jobs);
  const D=cx.getImageData(0,0,cv.width,cv.height).data, Wd=cv.width, Hd=cv.height;
  const hAt=(ix,iy)=>{ix=Math.min(Math.max(ix,0),Wd-1);iy=Math.min(Math.max(iy,0),Hd-1);const k=(iy*Wd+ix)*4;return D[k]*256+D[k+1]+D[k+2]/256-32768;};
  const h=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){
    const [la,lo]=nodeLatLon(lat,lon,R,N,i,j);
    const fx=(px(lo)-x0)*256-0.5, fy=(py(la)-y0)*256-0.5, ix=Math.floor(fx), iy=Math.floor(fy), a=fx-ix, b=fy-iy;
    h[j*N+i]=hAt(ix,iy)*(1-a)*(1-b)+hAt(ix+1,iy)*a*(1-b)+hAt(ix,iy+1)*(1-a)*b+hAt(ix+1,iy+1)*a*b;
  }
  return {h,src:'Terrain Tiles (Mapzen/AWS), Auflösung ca. '+Math.round(40075016*cosl/n/256)+' m'};
}
async function terrApi(lat,lon,R,N){
  const M=21, pts=[];
  for(let j=0;j<M;j++)for(let i=0;i<M;i++) pts.push(nodeLatLon(lat,lon,R,M,i,j));
  const c=new Float32Array(M*M);
  for(let k=0;k<pts.length;k+=100){
    const part=pts.slice(k,k+100);
    const d=await fetchJSON('https://api.open-meteo.com/v1/elevation?latitude='+part.map(p=>p[0].toFixed(5)).join(',')+'&longitude='+part.map(p=>p[1].toFixed(5)).join(','));
    d.elevation.forEach((e,q)=>c[k+q]=e);
  }
  const Tc={N:M,R,cell:2*R/(M-1)}, cell=2*R/(N-1), h=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++) h[j*N+i]=bil(Tc,c,-R+i*cell,-R+j*cell);
  return {h,src:'Open-Meteo Höhen-API (Copernicus DEM), grobes Raster '+Math.round(2*R/(M-1))+' m'};
}
async function loadTerrain(R){
  const {lat,lon}=S.src, key=[lat.toFixed(5),lon.toFixed(5),R].join();
  if(S.terr&&S.terrKey===key) return S.terr;
  let r=null;
  try{ r=await terrTiles(lat,lon,R,gridN(R)); }catch(e){ try{ r=await terrApi(lat,lon,R,gridN(R)); }catch(e2){ r=null; } }
  S.terrKey=key;
  if(!r){ S.terr=null; $('terrinfo').textContent='Höhendaten nicht abrufbar. Es wird ohne Geländeeinfluss gerechnet.'; return null; }
  S.terr=prepTerrain({N:gridN(R),R,cell:2*R/(gridN(R)-1),h:r.h});
  $('terrinfo').textContent=`Gelände: Freisetzungsort ${Math.round(S.terr.hsrc)} m ü. NN, Rechengebiet ${Math.round(S.terr.min)} bis ${Math.round(S.terr.max)} m. Quelle: ${r.src}.`;
  return S.terr;
}
