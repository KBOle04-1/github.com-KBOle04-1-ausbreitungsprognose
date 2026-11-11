/* Stoffdaten: molare Massen, Schwellenwerte, Siede- und Verdampfungsdaten.
   Herkunft und Prüfstand jedes Wertes: docs/Konstanten.md. Werte ohne Eintrag dort gelten als unbestätigt. */
const SUBST=[
  {id:'cl2', name:'Chlor', M:70.9, lv:[0.5,2,20], kind:'aegl', th:{Tb:239.1,dHv:288e3,cpl:930}},
  {id:'nh3', name:'Ammoniak', M:17.03, lv:[30,160,1100], kind:'aegl', th:{Tb:239.8,dHv:1370e3,cpl:4700}},
  {id:'so2', name:'Schwefeldioxid', M:64.07, lv:[0.2,0.75,30], kind:'aegl', th:{Tb:263.1,dHv:389e3,cpl:1360}},
  {id:'h2s', name:'Schwefelwasserstoff', M:34.08, lv:[0.51,27,50], kind:'aegl'},
  {id:'hcl', name:'Chlorwasserstoff', M:36.46, lv:[1.8,22,100], kind:'aegl'},
  {id:'hf',  name:'Fluorwasserstoff', M:20.01, lv:[1,24,44], kind:'aegl'},
  {id:'hcn', name:'Cyanwasserstoff (Blausäure)', M:27.03, lv:[2,7.1,15], kind:'aegl'},
  {id:'co',  name:'Kohlenmonoxid', M:28.01, lv:[null,83,330], kind:'aegl'},
  {id:'no2', name:'Stickstoffdioxid', M:46.01, lv:[0.5,12,20], kind:'aegl'},
  {id:'cocl2',name:'Phosgen', M:98.92, lv:[null,0.3,0.75], kind:'aegl'},
  {id:'hcho',name:'Formaldehyd', M:30.03, lv:[0.9,14,56], kind:'aegl'},
  {id:'c3h8',name:'Propan (Explosionsgefahr)', M:44.1, lv:[1700,8500,17000], kind:'ueg', th:{Tb:231.0,dHv:426e3,cpl:2400}},
  {id:'ch4', name:'Methan / Erdgas (Explosionsgefahr)', M:16.04, lv:[4400,22000,44000], kind:'ueg', th:{Tb:111.7,dHv:510e3}},
  {id:'custom',name:'Eigener Stoff', M:50, lv:[1,10,100], kind:'custom'}
];
const LNAMES={aegl:['AEGL-1','AEGL-2','AEGL-3'],ueg:['10 % UEG','50 % UEG','UEG'],custom:['Schwelle 1','Schwelle 2','Schwelle 3'],fire:['Stufe 1','Stufe 2','Stufe 3']};
