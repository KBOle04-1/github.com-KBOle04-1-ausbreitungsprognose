/* ---------- Auswertung als PDF ---------- */
const JSPDF_URL='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const DISCLAIMER='Prognose! Werte sind durch geeignete Messungen vor Ort zu überprüfen!';
const selTxt=id=>$(id).selectedOptions[0].textContent.trim();
const plain=h=>String(h).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
// Eingaben und Hinweise im Moment der Berechnung festhalten, damit die Auswertung zum Ergebnis passt
function finishResult(){
  const r=S.res, P=[], add=(k,v)=>P.push([k,String(v)]);
  const m=S.mode, thr=ids=>ids.map(id=>$(id).value||'kein Wert').join(' / ');
  add('Prognoseart',{gas:'Gefahrstoff (Gas)',fire:'Brandrauch',combo:'Gefahrstoff und Brandrauch kombiniert',veg:'Vegetationsbrand',blast:'Blast-Cast: '+{gas:'Gas-Luft-Gemisch',bomb:'Weltkriegsbombe',bleve:'BLEVE'}[S.bkind]}[m]);
  add('Ereignisort',(S.place?S.place+' · ':'')+r.lat.toFixed(5)+'° N, '+r.lon.toFixed(5)+'° O');
  add('Ereignisbeginn',new Date(r.T0*1000).toLocaleString('de-DE',{dateStyle:'full',timeStyle:'short'})+' Uhr');
  if(m==='gas'||m==='combo'){
    const sb=curSubst();
    add('Stoff',sb.name+', molare Masse '+(sb.kind==='custom'?$('cM').value:sb.M)+' g/mol');
    add('Freisetzung',S.inst?`schlagartig, ${$('mass').value} kg`:`kontinuierlich, ${$('rate').value} kg/min über ${$('dur').value} min`);
    add('Austrittshöhe',$('hrel').value+' m');
    add('Zustand beim Austritt',selTxt('relState')+($('relState').value==='zweiphasig'&&$('tstore').value?', Lagertemperatur '+$('tstore').value+' °C':''));
    { const d0=r.layers.find(d=>d.sg); if(d0){ add('Modellwahl',d0.sg.txt); if(d0.bm) add('Schwergas-Entfernung (Britter-McQuaid)',[2,1,0].filter(l=>d0.bm[l]).map(l=>{ const b=d0.bm[l]; return d0.names[l]+': '+(b.x?'ca. '+dist(b.x)+' ('+b.kind+')':'Nahbereich, nicht berechenbar'); }).join('; ')+'. Stationär, ebenes Gelände, Wind zu Ereignisbeginn.'); } }
    add('Schwellenwerte Stoff (ppm)',LNAMES[sb.kind].join(' / ')+': '+thr(['thr1','thr2','thr3']));
    if(m==='combo') add('Stoff im Brand',$('lift').checked?'wird im Brand freigesetzt und steigt mit dem Rauch auf':'tritt bodennah neben dem Brand aus');
    add('Fließgewässer',$('useRiver').checked?(($('riverSteer').checked?'Lenkung der Wolke eingeschaltet (experimentell), Fließgeschwindigkeit '+$('rvel').value+' m/s. ':'nur angezeigt, keine Wirkung auf die Rechnung. ')+$('riverinfo').textContent):'nicht angezeigt');
  }
  if(m==='fire'||m==='combo'){
    add('Brand',`${selTxt('firePreset')}; Brandleistung ${$('mw').value} MW, Brandfläche ${$('farea').value} m², Dauer ${$('fdur').value} min`);
    add('Brandgut',selTxt('fuel'));
    add('Schwellenwerte Rauch (mg/m³)','Stufe 1 / 2 / 3: '+thr(m==='combo'?['fthr1','fthr2','fthr3']:['thr1','thr2','thr3']));
  }
  if(m==='veg'){ add('Vegetation',selTxt('vfuel')); add('Zustand der Vegetation',selTxt('vstate')); add('Brand bei Beginn',$('vdia').value+' m Durchmesser'); }
  if(m==='blast'){
    if(S.bkind==='gas'){ add('Gas',selTxt('bfuel')); add('Gasmenge in der Wolke',$('bmass').value+' kg'); add('Verdämmung',selTxt('byield')); }
    if(S.bkind==='bomb'){ add('Bombentyp',selTxt('bbomb')); add('Massen',`Gesamtmasse ${$('bauw').value} kg, Sprengstoff ${$('bneq').value} kg (als TNT)`); }
    if(S.bkind==='bleve'){ add('Behälter',selTxt('bvessel')); add('Inhalt',`${$('bvmass').value} kg bei voller Füllung, Füllgrad ${$('bvfill').value} %`); }
  } else {
    add('Rechengebiet',selTxt('radius')); add('Prognosedauer',selTxt('horizon')+', Zeitfenster je 15 Minuten');
    if(m!=='veg') add('Umgebung',selTxt('urban'));
  }
  if(m!=='veg'&&m!=='blast') add('Windlenkung durch Gelände',$('terrWind').checked?'eingeschaltet (experimentell, nicht belegt)':'ausgeschaltet');
  add('Gelände',r.terr?($('terrinfo').textContent||'berücksichtigt'):($('useTerr').checked?'Höhendaten nicht abrufbar, ohne Gelände gerechnet':'abgeschaltet'));
  if($('manual').checked) add('Wetter (von Hand)',`Wind aus ${$('mdir').value}° mit ${$('mspd').value} m/s, Schichtung ${selTxt('mcls')}, ${$('mtemp').value} °C, Luftfeuchte ${$('mrh').value} %`);
  else {
    add('Wetter zu Beginn',$('wxinfo').textContent);
    if($('obsinfo').textContent) add('Stationsmessung',$('obsinfo').textContent);
    if($('mdlinfo').textContent) add('Wettermodelle',$('mdlinfo').textContent);
  }
  r.calcAt=new Date(); r.q=quality(r);
  r.params=P; r.warn=[...document.querySelectorAll('#warnings li')].map(li=>li.textContent);
  $('pdfShare').hidden=true; $('pdfLink').hidden=true;
}
function loadScript(url){
  return new Promise((res,rej)=>{ if(window.jspdf) return res(); const sc=document.createElement('script'); sc.src=url; sc.onload=res; sc.onerror=()=>rej(new Error('PDF-Bibliothek nicht ladbar (Internetverbindung prüfen).')); document.head.appendChild(sc); });
}
// Kartenhintergrund als Bild: Mittelpunkt Ereignisort, halbe Bildhöhe hm Meter
async function baseMap(lat,lon,hm,Wp,Hp){
  const cosl=Math.cos(lat*Math.PI/180), wpm=z=>256*Math.pow(2,z)/(40075016*cosl);
  const z=Math.max(5,Math.min(17,Math.floor(Math.log2(Hp/(2*hm)*40075016*cosl/256)))), k=Hp/(2*hm*wpm(z)), n=Math.pow(2,z);
  const X=lo=>(lo+180)/360*256*n, Y=la=>{const q=la*Math.PI/180; return (1-Math.log(Math.tan(q)+1/Math.cos(q))/Math.PI)/2*256*n;};
  const ox=X(lon)-Wp/2/k, oy=Y(lat)-Hp/2/k;
  const B={W:Wp,H:Hp,mpp:1/(wpm(z)*k),px:(la,lo)=>[(X(lo)-ox)*k,(Y(la)-oy)*k],tiles:false};
  const draw=async kind=>{
    const cv=document.createElement('canvas'); cv.width=Wp; cv.height=Hp; const cx=cv.getContext('2d');
    cx.fillStyle='#e9edf0'; cx.fillRect(0,0,Wp,Hp);
    if(kind){
      const jobs=[];
      for(let tx=Math.floor(ox/256);tx<=Math.floor((ox+Wp/k)/256);tx++) for(let ty=Math.floor(oy/256);ty<=Math.floor((oy+Hp/k)/256);ty++){
        if(ty<0||ty>=n) continue; const xx=((tx%n)+n)%n;
        const url=kind==='osm'?`https://a.tile.openstreetmap.org/${z}/${xx}/${ty}.png`:`https://${'abc'[(xx+ty+1)%3]}.tile.opentopomap.org/${z}/${xx}/${ty}.png`;
        jobs.push(loadImg(url).then(im=>cx.drawImage(im,(tx*256-ox)*k,(ty*256-oy)*k,256*k+0.6,256*k+0.6)));
      }
      const res=await Promise.allSettled(jobs);
      if(res.filter(q=>q.status==='fulfilled').length<res.length/2) throw new Error('Kacheln');
      cx.getImageData(0,0,1,1);          // wirft, wenn der Kartendienst die Weitergabe als Bild nicht zulässt
    }
    return cv;
  };
  const order=S.base==='osm'?['osm','otm']:['otm','osm'];
  for(const kind of order){ try{ B.cv=await draw(kind); B.tiles=kind; return B; }catch(e){} }
  B.cv=await draw(null); return B;
}
function loadDataImg(src){ return new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src; }); }
// Eine Karte zeichnen: Hintergrund, Flächen, Kreise mit Beschriftung, Maßstab
async function mapFrame(B,r,imgs,rings,fills){
  const cv=document.createElement('canvas'); cv.width=B.W; cv.height=B.H; const cx=cv.getContext('2d');
  cx.drawImage(B.cv,0,0);
  const [sx,sy]=B.px(r.lat,r.lon), bb=boundsOf(r), [x0,y0]=B.px(bb[1][0],bb[0][1]), [x1,y1]=B.px(bb[0][0],bb[1][1]);
  for(const g of S.riverGeo||[]){ cx.beginPath(); g.pts.forEach((p,i)=>{ const [x,y]=B.px(p[0],p[1]); i?cx.lineTo(x,y):cx.moveTo(x,y); }); cx.strokeStyle='#1565c0'; cx.lineWidth=g.big?3:1.5; cx.stroke(); }
  for(const z of fills||[]){ cx.beginPath(); cx.arc(sx,sy,z.r/B.mpp,0,6.2832); cx.globalAlpha=0.22; cx.fillStyle=z.col; cx.fill(); cx.globalAlpha=1; cx.lineWidth=1; cx.strokeStyle=z.col; cx.stroke(); }
  cx.imageSmoothingEnabled=true;
  for(const it of imgs){ if(!it) continue; const g=typeof it==='string'?{src:it,R:r.R}:it, b2=boundsOf(r,g.R), [u0,v0]=B.px(b2[1][0],b2[0][1]), [u1,v1]=B.px(b2[0][0],b2[1][1]); cx.drawImage(await loadDataImg(g.src),u0,v0,u1-u0,v1-v0); }
  const labels=[];
  for(const g of rings){
    if(!(g.r>0)) continue;
    const rp=g.r/B.mpp, q=Math.hypot(g.far[0],g.far[1])||1, ux=g.far[0]/q, uy=g.far[1]/q;
    cx.beginPath(); cx.arc(sx,sy,rp,0,6.2832); cx.setLineDash(g.dash?[9,8]:[]); cx.lineWidth=3; cx.strokeStyle=g.color; cx.stroke(); cx.setLineDash([]);
    if(rp<18) continue;
    const ex=sx+ux*rp, ey=sy-uy*rp;
    cx.beginPath(); cx.moveTo(sx,sy); cx.lineTo(ex,ey); cx.setLineDash([3,6]); cx.lineWidth=2; cx.stroke(); cx.setLineDash([]);
    labels.push({g,ex,ey,ux,uy});
  }
  cx.font='600 17px system-ui,-apple-system,Helvetica,Arial,sans-serif'; cx.textBaseline='middle'; const placed=[];
  for(const {g,ex,ey,ux,uy} of labels){
    const w=cx.measureText(g.text).width+14, h=26;
    let bx=ux>0.38?ex+9:ux<-0.38?ex-9-w:ex-w/2, by=uy>0.38?ey-9-h:uy<-0.38?ey+9:ey-h/2;
    bx=Math.min(Math.max(bx,4),B.W-w-4); by=Math.min(Math.max(by,4),B.H-h-4);
    for(let n=0;n<8&&placed.some(q=>bx<q[0]+q[2]&&bx+w>q[0]&&by<q[1]+h&&by+h>q[1]);n++) by+=(by+h+h+6<B.H?1:-1)*(h+4);   // Schilder nicht übereinander
    placed.push([bx,by,w]);
    cx.fillStyle='#fff'; cx.fillRect(bx,by,w,h); cx.lineWidth=2.5; cx.strokeStyle=g.color; cx.strokeRect(bx,by,w,h);
    cx.fillStyle='#111'; cx.fillText(g.text,bx+7,by+h/2+1);
  }
  cx.beginPath(); cx.arc(sx,sy,8,0,6.2832); cx.fillStyle='#111'; cx.fill(); cx.lineWidth=3; cx.strokeStyle='#fff'; cx.stroke();
  cx.beginPath(); cx.arc(sx,sy,10.5,0,6.2832); cx.lineWidth=2; cx.strokeStyle='#d1001f'; cx.stroke();
  // Maßstab, Nordpfeil, Quellenangabe
  const maxM=B.W*0.25*B.mpp, p10=Math.pow(10,Math.floor(Math.log10(maxM))), len=[5,2,1].map(f=>f*p10).find(v=>v<=maxM), lp=len/B.mpp;
  cx.fillStyle='rgba(255,255,255,.85)'; cx.fillRect(14,B.H-44,lp+20,32);
  cx.fillStyle='#111'; cx.fillRect(24,B.H-22,lp,4); cx.fillRect(24,B.H-28,2,10); cx.fillRect(24+lp-2,B.H-28,2,10);
  cx.font='600 15px system-ui,-apple-system,Helvetica,Arial,sans-serif'; cx.fillText(len>=1000?(len/1000)+' km':len+' m',24,B.H-34);
  cx.fillStyle='rgba(255,255,255,.85)'; cx.fillRect(B.W-48,12,36,54); cx.fillStyle='#111';
  cx.beginPath(); cx.moveTo(B.W-30,18); cx.lineTo(B.W-21,42); cx.lineTo(B.W-30,36); cx.lineTo(B.W-39,42); cx.closePath(); cx.fill(); cx.fillText('N',B.W-36,55);
  const att=B.tiles==='osm'?'Karte © OpenStreetMap-Mitwirkende':B.tiles==='otm'?'Karte © OpenStreetMap-Mitwirkende, SRTM | © OpenTopoMap (CC-BY-SA)':'Kartenhintergrund nicht verfügbar';
  cx.font='13px system-ui,-apple-system,Helvetica,Arial,sans-serif'; const aw=cx.measureText(att).width+12;
  cx.fillStyle='rgba(255,255,255,.85)'; cx.fillRect(B.W-aw-6,B.H-26,aw,20); cx.fillStyle='#222'; cx.fillText(att,B.W-aw,B.H-15);
  return cv.toDataURL('image/jpeg',0.82);
}
let pdfBlob=null, pdfName='';
async function makeReport(){
  const r=S.res; if(!r||!r.params) return;
  const btn=$('printBtn'); btn.disabled=true; $('pdfShare').hidden=true; $('pdfLink').hidden=true;
  try{
    status('Erstelle Auswertung: lade PDF-Bibliothek …'); await loadScript(JSPDF_URL);
    const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}); doc.setLineHeightFactor(1.28);
    const M=15, W=180, BOT=281; let y=M;
    const T=t=>String(t).replace(/[–—]/g,'-').replace(/…/g,'...').replace(/[„“”]/g,'"').replace(/≈/g,'ca.').replace(/[→↓­]/g,'').replace(/[^\x00-\xff]/g,'');
    const need=h=>{ if(y+h>BOT){ doc.addPage(); y=M; return true; } return false; };
    const head=t=>{ need(16); y+=2; doc.setFont('helvetica','bold'); doc.setFontSize(12.5); doc.setTextColor(11,92,122); doc.text(T(t),M,y+4); y+=6; doc.setDrawColor(11,92,122); doc.setLineWidth(0.4); doc.line(M,y,M+W,y); y+=3; doc.setTextColor(20); };
    const para=(t,size=9.5,bold=false,indent=0)=>{ doc.setFont('helvetica',bold?'bold':'normal'); doc.setFontSize(size); const lh=size*0.3528*1.28; for(const l of doc.splitTextToSize(T(t),W-indent)){ need(lh); doc.text(l,M+indent,y+lh*0.75); y+=lh; } y+=1.2; };
    const kv=(k,v)=>{ doc.setFontSize(9.5); const lh=9.5*0.3528*1.28, kl=doc.splitTextToSize(T(k),48), vl=doc.splitTextToSize(T(v),W-52), h=Math.max(kl.length,vl.length)*lh+2; need(h); doc.setFont('helvetica','bold'); doc.text(kl,M,y+lh*0.75+0.6); doc.setFont('helvetica','normal'); doc.text(vl,M+52,y+lh*0.75+0.6); y+=h; doc.setDrawColor(205); doc.setLineWidth(0.1); doc.line(M,y,M+W,y); y+=0.6; };
    const table=(hd,rows,wd)=>{
      const fs=hd.length>7?7:8.2, lh=fs*0.3528*1.28;
      const row=(cells,bold)=>{
        doc.setFontSize(fs); doc.setFont('helvetica',bold?'bold':'normal');
        const ls=cells.map((c,i)=>doc.splitTextToSize(T(c),wd[i]-2)), h=Math.max(...ls.map(l=>l.length))*lh+1.6;
        if(need(h)&&!bold){ row(hd,true); doc.setFont('helvetica','normal'); doc.setFontSize(fs); }
        if(bold){ doc.setFillColor(226,234,238); doc.rect(M,y,W,h,'F'); }
        let x=M; ls.forEach((l,i)=>{ doc.text(l,x+1,y+lh*0.75+0.8); x+=wd[i]; });
        y+=h; doc.setDrawColor(205); doc.setLineWidth(0.1); doc.line(M,y,M+W,y);
      };
      row(hd,true); rows.forEach(c=>row(c,false)); y+=3;
    };
    // Kopf
    doc.setFont('helvetica','bold'); doc.setFontSize(17); doc.setTextColor(11,92,122); doc.text('Auswertung Ausbreitungsprognose',M,y+6); y+=10;
    doc.setTextColor(20); doc.setFontSize(11); doc.text(T(r.blast?r.title:r.layers.map(d=>d.label).join(' + ')),M,y+4,{maxWidth:W}); y+=doc.splitTextToSize(T(r.blast?r.title:r.layers.map(d=>d.label).join(' + ')),W).length*5+2;
    doc.setFillColor(255,212,0); doc.setDrawColor(20); doc.setLineWidth(0.5); doc.rect(M,y,W,9,'FD'); doc.setFontSize(11); doc.text(T(DISCLAIMER),M+W/2,y+6,{align:'center'}); y+=13;
    para('Erstellt am '+new Date().toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'})+' Uhr',8.5);
    head('Prognosequalität und Modell');
    kv('Einstufung',r.q.label); kv('Rechenmodell',r.q.model+'. Nicht gegen Versuchsdaten validiert.'); kv('Modellstand',MODEL_VERSION); kv('Berechnet am',r.calcAt.toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'})+' Uhr');
    [...r.q.reasons,...r.q.notes].forEach(x=>para('-  '+x,9));
    para('Entfernungen und Flächen sind gerundete Schätzwerte. Die Prognose ersetzt keine fachkundige Gefahrenbeurteilung und keine Messungen vor Ort.',9,true);
    head('Eingangsparameter'); r.params.forEach(([k,v])=>kv(k,v));
    head('Bemessungsergebnisse');
    const hd=[...document.querySelectorAll('#thead th')].map(e=>e.textContent), rows=[...document.querySelectorAll('#tbody tr')].map(tr=>[...tr.children].map(td=>td.textContent.trim()));
    if(r.blast) table(hd,rows,[40,20,120]);
    else {
      para('Gesamtbereich '+hhmm(r.T0)+' bis '+hhmm(r.T0+r.nSlots*900)+' Uhr: '+r.layers.map(d=>(r.layers.length>1?d.label+': ':'')+d.all.chips.map(plain).join('; ')).join(' | '));
      const rest=(W-26-30-9)/(hd.length-3); table(hd,rows,[26,30,9,...hd.slice(3).map(()=>rest)]);
      para('Alle Entfernungen sind gerundete Schätzwerte. Reichweite: größte Entfernung vom Ereignisort, in der die Schwelle im Zeitfenster überschritten wird. Wind: Richtung, aus der er weht, und Stärke in 10 m Höhe. Kl.: Schichtungsklasse A (sehr labil) bis F (sehr stabil).',8);
    }
    if(r.warn&&r.warn.length){ head('Hinweise zur Bewertung'); r.warn.forEach(wn=>para('-  '+wn,9)); }
    // Karten
    const Wp=1080, Hp=720, iw=156, ih=104;
    const block=(title,info,img)=>{
      doc.setFontSize(8.5); const il=doc.splitTextToSize(T(info),W).slice(0,3), h=6+il.length*3.9+ih+5;
      need(h); doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.text(T(title),M,y+4); y+=6;
      doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.text(il,M,y+2.8); y+=il.length*3.9+1;
      doc.addImage(img,'JPEG',M+(W-iw)/2,y,iw,ih); doc.setDrawColor(120); doc.setLineWidth(0.2); doc.rect(M+(W-iw)/2,y,iw,ih); y+=ih+4;
    };
    doc.addPage(); y=M; head(r.blast?'Karten':'Karten je Zeitfenster');
    if(r.blast){
      const rAll=r.zones[0].r, fz=r.zones.filter(z=>z.fill), rFill=Math.max(...fz.map(z=>z.r)), rings=blastRings(r);
      status('Erstelle Auswertung: Karte Übersicht …');
      let B=await baseMap(r.lat,r.lon,1.2*rAll,Wp,Hp);
      block('Übersicht',[...r.zones].reverse().map(z=>z.name+' bis '+dist(z.r)).join('; '),await mapFrame(B,r,[r.img],rings,fz));
      if(rAll>1.6*rFill){
        status('Erstelle Auswertung: Karte Nahbereich …');
        B=await baseMap(r.lat,r.lon,1.35*rFill,Wp,Hp);
        block('Nahbereich',fz.slice().reverse().map(z=>z.name+' bis '+dist(z.r)).join('; ')+(r.terr?'. Schraffiert: '+r.shadeName+' des Geländes.':''),await mapFrame(B,r,[r.img],rings.filter(g=>g.r<=1.9*rFill),fz));
      }
    } else {
      const far=Math.max(...r.layers.flatMap(d=>d.all.reach));
      status('Erstelle Auswertung: lade Kartenhintergrund …');
      const B=await baseMap(r.lat,r.lon,far>0?Math.max(1.25*far,150):r.R/4,Wp,Hp);
      const txt=i=>r.layers.map(d=>(r.layers.length>1?d.label+': ':'')+(i<0?d.all:d.slots[i]).chips.map(plain).join('; ')).join(' | ');
      block('Gesamtbereich '+hhmm(r.T0)+' bis '+hhmm(r.T0+r.nSlots*900)+' Uhr (alle Zeitfenster)',txt(-1),await mapFrame(B,r,r.layers.flatMap(d=>imgsOf(d.all,r)),r.layers.flatMap(d=>d.all.rings)));
      for(let i=0;i<r.nSlots;i++){
        if(i%4===0){ status(`Erstelle Auswertung: Karte ${i+1} von ${r.nSlots} …`); await pause(); }
        const m=r.meta[i], w=m.w;
        block(`${hhmm(m.t0)} bis ${hhmm(m.t1)} Uhr · T+${(i+1)*15} min`,`Wind ${windText(w)}, Schichtung ${CLS[w.cls]} (${CLSTXT[w.cls]}). `+txt(i),
              await mapFrame(B,r,r.layers.flatMap(d=>imgsOf(d.slots[i],r)),r.layers.flatMap(d=>d.slots[i].rings)));
      }
    }
    const np=doc.getNumberOfPages();
    for(let i=1;i<=np;i++){ doc.setPage(i); doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(90); doc.text(T(DISCLAIMER),M,290); doc.text('Seite '+i+' von '+np,M+W,290,{align:'right'}); }
    pdfBlob=doc.output('blob');
    const d=new Date(r.T0*1000), z2=v=>String(v).padStart(2,'0');
    pdfName=`Auswertung_${d.getFullYear()}-${z2(d.getMonth()+1)}-${z2(d.getDate())}_${z2(d.getHours())}${z2(d.getMinutes())}.pdf`;
    const link=$('pdfLink'); if(link.href) URL.revokeObjectURL(link.href);
    link.href=URL.createObjectURL(pdfBlob); link.download=pdfName; link.hidden=false;
    let canShare=false; try{ canShare=!!(navigator.canShare&&navigator.canShare({files:[new File([pdfBlob],pdfName,{type:'application/pdf'})]})); }catch(e){}
    $('pdfShare').hidden=!canShare;
    status(`Auswertung fertig: ${np} Seiten. `+(canShare?'Mit „PDF teilen oder sichern" drucken, speichern oder versenden.':'Mit „PDF öffnen" anzeigen, speichern oder drucken.'));
    if(!canShare&&window.innerWidth>=900) link.click();
  }catch(e){ status('Auswertung konnte nicht erstellt werden: '+e.message); console.error(e); }
  btn.disabled=false;
}
$('printBtn').onclick=makeReport;
$('pdfShare').onclick=async()=>{
  try{ await navigator.share({files:[new File([pdfBlob],pdfName,{type:'application/pdf'})],title:'Auswertung Ausbreitungsprognose'}); }
  catch(e){ if(e.name!=='AbortError') status('Teilen nicht möglich. Bitte „PDF öffnen" verwenden.'); }
};
$('slider').oninput=e=>{stopPlay();show(+e.target.value);};
$('prev').onclick=()=>{stopPlay();show(Math.max(0,S.slot-1));};
$('next').onclick=()=>{stopPlay();show(Math.min(S.res.nSlots,S.slot+1));};
function stopPlay(){ if(S.timer){clearInterval(S.timer);S.timer=null;} $('play').textContent='Abspielen'; }
$('play').onclick=()=>{
  if(S.timer){ stopPlay(); return; }
  $('play').textContent='Stopp';
  if(S.slot>=S.res.nSlots||S.slot===0) show(1);
  S.timer=setInterval(()=>{ if(S.slot>=S.res.nSlots){ stopPlay(); return; } show(S.slot+1); },900);
};
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js').catch(()=>{});
