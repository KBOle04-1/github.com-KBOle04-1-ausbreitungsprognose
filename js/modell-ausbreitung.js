/* ===================== Rechenmodell (ohne DOM) ===================== */
const GRAV = 9.81;
const PEXP_R = [0.07,0.07,0.10,0.15,0.35,0.55];
const PEXP_U = [0.15,0.15,0.20,0.25,0.30,0.30];
const DEFL   = [0,0,0.1,0.3,0.6,0.8];        // Anteil der Hangaufwärts-Komponente, der umgelenkt wird
const TFOLLOW= [0.5,0.5,0.5,0.5,0,0];        // Geländefolge der Fahnenachse
const ZI_DEF = [1500,1200,1000,800,0,0];     // Mischungsschichthöhe, falls keine Daten

// Pasquill-Klasse 0..5 (A..F) nach Turner; Zwischenklassen zur stabileren Seite
function stabClass(u, rad, cloudPct){
  const b = u<2?0 : u<3?1 : u<5?2 : u<6?3 : 4;
  if (rad > 20){
    if (rad < 100) return 3;
    const ins = rad>=600?0 : rad>=300?1 : 2;
    return [[0,1,1],[1,1,2],[1,2,2],[2,3,3],[2,3,3]][b][ins];
  }
  if (cloudPct >= 95) return u<2 ? 4 : 3;
  const clear = cloudPct < 50 ? 1 : 0;
  return [[4,5],[4,5],[3,4],[3,3],[3,3]][b][clear];
}

// Briggs-Ausbreitungsparameter [sigma_y, sigma_z] in m für Laufweg x in m
function sigma(cls, x, urban){
  x = Math.max(x, 1);
  let sy, sz;
  if (urban){
    const fy = 1/Math.sqrt(1+0.0004*x);
    if (cls<=1){ sy=0.32*x*fy; sz=0.24*x*Math.sqrt(1+0.001*x); }
    else if (cls===2){ sy=0.22*x*fy; sz=0.20*x; }
    else if (cls===3){ sy=0.16*x*fy; sz=0.14*x/Math.sqrt(1+0.0003*x); }
    else { sy=0.11*x*fy; sz=0.08*x/Math.sqrt(1+0.0015*x); }
  } else {
    const fy = 1/Math.sqrt(1+0.0001*x);
    switch(cls){
      case 0: sy=0.22*x*fy; sz=0.20*x; break;
      case 1: sy=0.16*x*fy; sz=0.12*x; break;
      case 2: sy=0.11*x*fy; sz=0.08*x/Math.sqrt(1+0.0002*x); break;
      case 3: sy=0.08*x*fy; sz=0.06*x/Math.sqrt(1+0.0015*x); break;
      case 4: sy=0.06*x*fy; sz=0.03*x/(1+0.0003*x); break;
      default: sy=0.04*x*fy; sz=0.016*x/(1+0.0003*x);
    }
  }
  return [sy, Math.min(sz, 5000)];
}

function bil(T, arr, x, y){
  const N=T.N; let fx=(x+T.R)/T.cell, fy=(y+T.R)/T.cell;
  fx=Math.min(Math.max(fx,0),N-1.001); fy=Math.min(Math.max(fy,0),N-1.001);
  const i=Math.floor(fx), j=Math.floor(fy), a=fx-i, b=fy-j, k=j*N+i;
  return arr[k]*(1-a)*(1-b)+arr[k+1]*a*(1-b)+arr[k+N]*(1-a)*b+arr[k+N+1]*a*b;
}

// Geglättete Gradienten des Geländes
function prepTerrain(T){
  const N=T.N, r=Math.max(1,Math.round(250/T.cell));
  const tmp=new Float32Array(N*N), sm=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){let s=0,c=0;for(let d=-r;d<=r;d++){const ii=i+d;if(ii>=0&&ii<N){s+=T.h[j*N+ii];c++;}}tmp[j*N+i]=s/c;}
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){let s=0,c=0;for(let d=-r;d<=r;d++){const jj=j+d;if(jj>=0&&jj<N){s+=tmp[jj*N+i];c++;}}sm[j*N+i]=s/c;}
  T.gx=new Float32Array(N*N); T.gy=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){
    const i0=Math.max(i-1,0), i1=Math.min(i+1,N-1), j0=Math.max(j-1,0), j1=Math.min(j+1,N-1);
    T.gx[j*N+i]=(sm[j*N+i1]-sm[j*N+i0])/((i1-i0)*T.cell);
    T.gy[j*N+i]=(sm[j1*N+i]-sm[j0*N+i])/((j1-j0)*T.cell);
  }
  T.hsrc=bil(T,T.h,0,0);
  let mn=Infinity,mx=-Infinity; for(const v of T.h){if(v<mn)mn=v;if(v>mx)mx=v;} T.min=mn; T.max=mx;
  return T;
}

function terrainWind(T, x, y, vx, vy, cls, dense, s, hagl, u10){
  const gx=bil(T,T.gx,x,y), gy=bil(T,T.gy,x,y), S=Math.hypot(gx,gy);
  if (S<0.005) return [vx,vy];
  const wH=Math.exp(-hagl/150), nx=gx/S, ny=gy/S;
  const a=Math.min(0.9, DEFL[cls]+(dense?0.2*Math.exp(-s/3000):0))*Math.min(1,S/0.1)*wH;
  const sp=Math.hypot(vx,vy), c=vx*nx+vy*ny;
  if (c>0 && a>0){
    vx-=a*c*nx; vy-=a*c*ny;
    const n=Math.hypot(vx,vy);
    if (n>0.2*sp){ vx*=sp/n; vy*=sp/n; }
  }
  let d=0;
  if (cls>=4 && u10<3) d+=(cls===5?1:0.5)*(1-u10/3)*Math.min(1.5,8*S);   // Kaltluftabfluss
  if (dense) d+=Math.min(1,5*S)*Math.exp(-s/1500);                        // Schwergas hangabwärts
  d*=wH;
  return [vx-d*nx, vy-d*ny];
}

function plumeRiseFinal(F, u, cls, Tk, zi, H0){
  if (F<=0) return 0;
  u=Math.max(u,1);
  let dh;
  if (cls<=3){
    dh = F<55 ? 21.425*Math.pow(F,0.75)/u : 38.71*Math.pow(F,0.6)/u;
    if (zi>0) dh=Math.min(dh, Math.max(zi-H0,10));
  } else {
    const s=GRAV/Tk*(cls===4?0.02:0.035);
    dh=2.6*Math.cbrt(F/(u*s));
  }
  return Math.min(dh,1500);
}

/* P: {nSlots, inst, massKg, rateKgS, durS, H0, sy0, sz0, fireMW (konvektiv), dense, urban, terrain|null, R, wx(tSec)}
   wx(t) -> {u10, dx, dy, cls, zi, Tk}   (dx,dy: Einheitsvektor, wohin der Wind weht)
   Rückgabe: Momentaufnahmen alle 5 min */
function trackPuffs(P){
  const dt=30, tEnd=P.nSlots*900, snaps=[], T=P.terrain, F=8.8*(P.fireMW||0);
  let puffs=[];
  for(let t=0;t<=tEnd;t+=dt){
    const w=P.wx(t), u10=Math.max(w.u10,0.5);
    if (P.inst ? t===0 : t<P.durS)
      puffs.push({x:0,y:0,s:0,sy:P.sy0,sz:P.sz0,m:P.inst?P.massKg:P.rateKgS*dt,dh:0,ex:w.dx,ey:w.dy,L:0});
    if (t>0 && t%(P.inst?30:300)===0) snaps.push({t, cls:w.cls, zi:w.zi, puffs:puffs.map(p=>({...p}))});
    if (t>=tEnd) break;
    const pe=(P.urban?PEXP_U:PEXP_R)[w.cls];
    const dhFin=plumeRiseFinal(F,u10,w.cls,w.Tk,w.zi,P.H0);
    for(const p of puffs){
      const Hp=P.H0+p.dh;
      const sp=u10*Math.min(2.5,Math.pow(Math.max(Hp,10)/10,pe));
      let vx=w.dx*sp, vy=w.dy*sp;
      if (T && P.terrWind) [vx,vy]=terrainWind(T,p.x,p.y,vx,vy,w.cls,P.dense,p.s,Hp,u10);   // Eigenansatz ohne Literaturbeleg, nur auf ausdrückliche Wahl
      if (P.river && Hp<20){            // Fließgewässer: Lenkung entlang des Laufs und Drift mit der Strömung
        const Rv=P.river, ci=Math.round((p.x+Rv.R)/Rv.cell), cj=Math.round((p.y+Rv.R)/Rv.cell);
        if (ci>=0&&cj>=0&&ci<Rv.N&&cj<Rv.N){
          const tx=Rv.tx[cj*Rv.N+ci], ty=Rv.ty[cj*Rv.N+ci];
          const c=P.dense?Math.min(0.9,1.4/Math.max(u10,1))*Math.exp(-p.s/5000):(w.cls>=4?0.3:0);   // bei schwachem Wind stärker
          if ((tx||ty)&&c>0){ const al=vx*tx+vy*ty; vx+=c*(al*tx-vx)+c*Rv.v*tx; vy+=c*(al*ty-vy)+c*Rv.v*ty; }
        }
      }
      const v=Math.hypot(vx,vy)||0.1, ds=v*dt;
      const a=sigma(w.cls,p.s,P.urban), b=sigma(w.cls,p.s+ds,P.urban);
      p.sy+=b[0]-a[0]; p.sz+=b[1]-a[1];
      p.x+=vx*dt; p.y+=vy*dt; p.s+=ds;
      p.ex=vx/v; p.ey=vy/v; p.L=P.inst?0:ds;
      if (F>0) p.dh=Math.max(p.dh, Math.min(dhFin, 1.6*Math.cbrt(F)*Math.pow(p.s,2/3)/sp));
    }
    const lim=P.R;
    puffs=puffs.filter(p=>Math.abs(p.x)<lim+4*p.sy && Math.abs(p.y)<lim+4*p.sy);
  }
  return snaps;
}

// Vertikaler Anteil am Boden: Bodenreflexion, eine Spiegelung an der Mischungsschicht, darüber gleichverteilt
function vertTerm(d, sz, lid, zi){
  if (lid && sz>1.6*zi) return 1/zi;
  const qz=1/(2*sz*sz); let v=2*Math.exp(-d*d*qz);
  if (lid){ const e=2*zi-d; v+=2*Math.exp(-e*e*qz); }
  return v/(2.5066*sz);
}
function gridHeights(T, N, R){
  const cell=2*R/(N-1), h=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++) h[j*N+i]=bil(T,T.h,-R+i*cell,-R+j*cell);
  return h;
}
// Bodennahe Konzentration (kg/m³) auf dem Raster G = {N, R, h}: N x N Punkte, halbe Kantenlänge R um den Ereignisort,
// Zeile j von Süd nach Nord, h = Geländehöhen an den Rasterpunkten (optional).
// Die Puffbreite wird auf eine halbe Rasterweite begrenzt (nur für die Flächendarstellung; Reichweiten siehe axisReach).
function evalField(snap, P, G){
  const N=G.N, R=G.R, cell=2*R/(N-1), out=new Float32Array(N*N), hg=G.h, hsrc=P.terrain?P.terrain.hsrc:0;
  const lid=snap.cls<=3 && snap.zi>0, zi=snap.zi, tf=TFOLLOW[snap.cls];
  for(const p of snap.puffs){
    const Hp=P.H0+p.dh, b=p.dh/3.5;
    const sc=Math.max(Math.hypot(p.sy,b),0.5*cell);
    const sa=Math.hypot(sc,p.L/3.464);
    const sz=Math.max(Math.hypot(p.sz,b),0.5);
    const half=3.5*sa;
    const i0=Math.max(0,Math.ceil((p.x-half+R)/cell)), i1=Math.min(N-1,Math.floor((p.x+half+R)/cell));
    const j0=Math.max(0,Math.ceil((p.y-half+R)/cell)), j1=Math.min(N-1,Math.floor((p.y+half+R)/cell));
    if (i0>i1||j0>j1) continue;
    const k=p.m/(6.2832*sa*sc), qa=1/(2*sa*sa), qc=1/(2*sc*sc), v0=vertTerm(Hp,sz,lid,zi);
    for(let j=j0;j<=j1;j++){
      const dy=-R+j*cell-p.y;
      for(let i=i0;i<=i1;i++){
        const dx=-R+i*cell-p.x;
        const al=dx*p.ex+dy*p.ey, cr=dy*p.ex-dx*p.ey;
        const q=al*al*qa+cr*cr*qc;
        if (q>6.2) continue;
        let vz=v0;
        if (Hp>1 && hg){ const rise=hg[j*N+i]-hsrc; if (rise>0) vz=vertTerm(Math.max(0,Hp-(1-tf)*rise),sz,lid,zi); }
        out[j*N+i]+=k*Math.exp(-q)*vz;
      }
    }
  }
  return out;
}
// Reichweite je Schwelle unabhängig vom Raster: Bodenkonzentration unter jedem Puffmittelpunkt ohne Mindestbreite.
// Rückgabe je Schwelle {r, x, y}: größte Entfernung vom Ereignisort mit Überschreitung und deren Ort.
function axisReach(snap, P, thr){
  const ps=snap.puffs, n=ps.length, T=P.terrain, lid=snap.cls<=3 && snap.zi>0, zi=snap.zi, tf=TFOLLOW[snap.cls], win=n>300?80:n;
  const res=thr.map(()=>({r:0,x:0,y:0})), act=thr.filter(v=>v!=null);
  if (!act.length) return res;
  const lo=Math.min(...act), C=new Float64Array(n), Rr=new Float64Array(n);
  for(let a=0;a<n;a++){
    const A=ps[a]; let rise=-1, c=0;
    for(let b=Math.max(0,a-win);b<Math.min(n,a+win+1);b++){
      const p=ps[b], Hp=P.H0+p.dh, bu=p.dh/3.5, sc=Math.max(Math.hypot(p.sy,bu),0.5), sa=Math.hypot(sc,p.L/3.464), sz=Math.max(Math.hypot(p.sz,bu),0.5);
      const dx=A.x-p.x, dy=A.y-p.y, al=dx*p.ex+dy*p.ey, cr=dy*p.ex-dx*p.ey, q=al*al/(2*sa*sa)+cr*cr/(2*sc*sc);
      if (q>12) continue;
      let d=Hp;
      if (Hp>1 && T){ if (rise<0) rise=Math.max(0,bil(T,T.h,A.x,A.y)-T.hsrc); d=Math.max(0,Hp-(1-tf)*rise); }
      c+=p.m/(6.2832*sa*sc)*Math.exp(-q)*vertTerm(d,sz,lid,zi);
    }
    C[a]=c; Rr[a]=Math.hypot(A.x,A.y);
  }
  for(let a=0;a<n;a++){
    if (C[a]<lo) continue;
    for(let l=0;l<thr.length;l++){
      if (thr[l]==null || C[a]<thr[l]) continue;
      let r=Rr[a];
      for(const nb of [a-1,a+1]){          // zwischen diesem und dem nächsten, weiter entfernten Puff unter der Schwelle logarithmisch einpassen
        if (nb<0||nb>=n||C[nb]>=thr[l]||Rr[nb]<=Rr[a]) continue;
        r=Math.max(r,Rr[a]+(Rr[nb]-Rr[a])*Math.log(C[a]/thr[l])/Math.log(C[a]/Math.max(C[nb],1e-300)));
      }
      if (r>res[l].r){ const k=Rr[a]>0?r/Rr[a]:1; res[l]={r,x:ps[a].x*k,y:ps[a].y*k}; }
    }
  }
  return res;
}
