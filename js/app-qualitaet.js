/* ---------- Prognosequalität ---------- */
const MODEL_VERSION='0.11 vom 11.11.2026';
const QCLS={
  out:['Außerhalb des gültigen Modellbereichs','#c4001a'],
  data:['Unzureichende Datenlage','#e06a00'],
  lim:['Eingeschränktes Modell','#c99a00'],
  simple:['Vereinfachtes Modell','#0b5c7a']};
// Einstufung der Prognose mit Begründung. Die Stufe „validiertes Modell" wird nicht vergeben:
// Bisher ist kein Teilmodell gegen Versuchsdaten oder Referenzprogramme validiert.
function quality(r){
  const out=[], data=[], lim=[], note=[]; let model;
  const m=r.mode, spread=r.manual?0:modelSpread(r.T0);
  if(!r.manual&&spread.rows&&spread.rows.length>1&&spread.spread>45) data.push(`Die Wettermodelle weichen bei der Windrichtung um bis zu ${Math.round(spread.spread)}° voneinander ab.`);
  if(r.manual) note.push('Wetter von Hand angenommen, keine Vorhersage und keine Messung.'); else note.push('Wetter aus der Vorhersage für den Ereignisort; gilt für das ganze Rechengebiet.');
  if(m==='blast'){
    if(r.bkind==='gas'){ model='Druckwelle nach Kinney und Graham über TNT-Äquivalent'; lim.push('TNT-Äquivalent mit pauschalem Energieanteil; Hindernisdichte und Flammenbeschleunigung der Gaswolke gehen nicht ein.'); }
    else if(r.bkind==='bomb'){ model='Druckwelle nach Kinney und Graham, Oberflächendetonation; Splitterbereich nach UN IATG 01.80'; note.push('Massen sind Richtwerte je Gewichtsklasse; Lage im Erdreich und Bombenhülle bleiben unberücksichtigt.'); }
    else { model='Feuerball und Wärmestrahlung nach TNO/CCPS, Abstände nach Transport Canada'; note.push('Stoffwerte fest für Propan; Behälterdruck geht nicht ein; Druckwirkung nicht bemessen.'); note.push('Die Abstände sind Richtwerte, keine allgemeinen Sicherheitsabstände.'); }
    if(r.terr) note.push('Geländeschatten nur als Sichtlinie auf Höhendaten mit rund 30 m Auflösung.');
  } else if(m==='veg'){
    model='Elliptische Feuerfront mit Faustformeln für die Ausbreitungsgeschwindigkeit';
    lim.push('Ausbreitungsgeschwindigkeit nach Faustformeln, nicht nach einem Brennstoffmodell; Abweichung um den Faktor 2 bis 3 möglich.');
    lim.push('Keine Brennstoffkarte: Das Feuer wird auch über nicht brennbare Flächen fortgeschrieben. Flugfeuer fehlt.');
  } else {
    model='Gauß-Puff-Modell mit Ausbreitungsparametern nach Briggs und Schichtungsklassen nach Pasquill/Turner'+(r.layers.some(d=>d.bm)?'; Schwergas-Entfernungen nach Britter-McQuaid':'');
    const far=Math.max(...r.layers.flatMap(d=>d.all.reach));
    if(r.meta.some(q=>q.w.u10<1)) out.push('Wind unter 1 m/s: Das Gauß-Modell ist dafür nicht gültig, die Richtung ist unbestimmt.');
    if(far>10000) out.push('Reichweite über 10 km: Ausbreitungsparameter und das Wetter eines einzelnen Punktes sind dort nicht mehr belastbar.');
    for(const d of r.layers){
      if(d.kind==='fire'){ lim.push('Brandrauch: Gerechnet wird nur Ruß; die Stufen haben keine toxikologische Grundlage. Kohlenmonoxid und andere Brandgase fehlen.'); lim.push('Das Ergebnis hängt stark von der unsicheren Überhöhung der Rauchfahne ab. „Nicht erreicht" ist keine Entwarnung.'); continue; }
      if(d.bm){
        lim.push(d.label+': Entfernungen nach Britter-McQuaid, einem vereinfachten Schätzverfahren für ebenes, hindernisarmes Gelände. Es ist weder zeitabhängig noch dreidimensional; Flächen und Zeitverlauf stammen aus dem passiven Gauß-Modell und sind abgeleitet. Eine dynamische Schwergasrechnung (DEGADIS, SLAB) ist nicht verfügbar.');
        if(d.bm.some(b=>b&&b.kind==='abgeleitet')) out.push(d.label+': Mindestens eine Schwelle liegt unter dem Datenbereich von Britter-McQuaid (C/C0 unter 0,002 bzw. 0,001). Die Entfernung ist dort nur durch Fortsetzung mit dem Gauß-Modell abgeleitet; im Vergleich mit den Chlorversuchen Jack Rabbit II lagen solche Werte beim 0,4- bis 0,7-Fachen der Entfernung, in der die Spitzenkonzentration gemessen wurde.');
        if(d.bm.some(b=>b&&b.kind==='Nahbereich')) lim.push(d.label+': Mindestens eine Schwelle liegt im Nahbereich über dem Kurvenbereich (C/C0 über 0,1) und ist nicht berechenbar.');
        for(const f of new Set(d.bm.flatMap(b=>b?b.flags.filter(x=>!x.startsWith('Konzentration')):[]))) lim.push(d.label+': '+f+'.');
        if(d.P.urban) out.push(d.label+': Bebauung gewählt. Britter-McQuaid gilt nur für hindernisarmes Gelände; in Bebauung ist die Schwergasausbreitung mit diesem Verfahren nicht ausreichend berechenbar.');
        if(r.terr&&S.terr&&S.terr.max-S.terr.min>50) out.push(d.label+': Höhenunterschied im Rechengebiet über 50 m. Schweres Gas folgt dem Gelände und sammelt sich in Senken; das ist mit diesem Verfahren nicht ausreichend berechenbar.');
      }
      if(d.sg&&!d.bm&&!d.hasTh&&d.init.zustand==='gas'&&['hf','hcl','h2s','no2','cocl2','hcn'].includes(d.sid)) note.push(d.label+': Keine Siede- und Verdampfungsdaten hinterlegt; gerechnet als Gas bei Umgebungstemperatur. Bei Austritt aus der Flüssigphase kann die Wolke kalt und schwer sein.');
      if(d.sg&&d.hasTh&&d.init.zustand==='gas'&&['nh3','ch4','cl2','so2','c3h8'].includes(d.sid)) note.push(d.label+': Als Gas bei Umgebungstemperatur gerechnet. Tritt der Stoff aus der Flüssigphase oder tiefkalt aus, den Zustand beim Austritt entsprechend wählen.');
      if(d.kind==='aegl') lim.push('AEGL-Werte für 60 Minuten werden mit Höchstwerten im Zeitfenster verglichen, ohne Zeitmittel und Dosis. Die Werte sind noch nicht gegen die amtliche Liste geprüft.');
      if(d.kind==='ueg') lim.push('Zündfähiger Bereich aus mittleren Konzentrationen; örtliche Spitzen liegen deutlich höher.');
      if(d.P.terrWind&&r.terr) lim.push('Windlenkung durch das Gelände eingeschaltet: eigene Näherung ohne Literaturbeleg.');
      if(d.P.river) lim.push('Lenkung entlang des Gewässers eingeschaltet: eigene Näherung ohne Literaturbeleg; Fließrichtung ungeprüft.');
    }
    note.push('Die Quellstärke ist eine Eingabe; Austrittstemperatur, Impuls und Verdampfung werden nicht gerechnet.');
  }
  const cls=out.length?'out':data.length?'data':lim.length?'lim':'simple';
  return {cls,label:QCLS[cls][0],color:QCLS[cls][1],model,reasons:[...new Set([...out,...data,...lim])],notes:note};
}
function qualityHtml(r){
  const q=r.q||(r.q=quality(r));
  return `<details class="qual" style="border-left:5px solid ${q.color}"><summary><strong>Prognosequalität: ${q.label}</strong></summary>`
    +`<div class="small"><p>${q.model}. Nicht gegen Versuchsdaten validiert. Modellstand ${MODEL_VERSION}.</p><ul>${[...q.reasons,...q.notes].map(x=>'<li>'+x+'</li>').join('')}</ul>`
    +`<p>Die Prognose ersetzt keine fachkundige Gefahrenbeurteilung und keine Messungen vor Ort.</p></div></details>`;
}
