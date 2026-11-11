# Prüfbericht Ausbreitungsprognose: Bestandsaufnahme und Fehleranalyse

Phase 1 und 2 des Entwicklungsauftrags vom 11.11.2026. Geprüfter Stand: Commit `c9fa15b`, Datei `index.html` (1586 Zeilen). Zeilenangaben beziehen sich auf diesen Stand. An der Berechnungslogik wurde für diesen Bericht nichts geändert.

## 1. Ergebnis in Kürze

Die Anwendung rechnet das, was sie rechnet, numerisch sauber: Das Gauß-Puff-Modell trifft die analytische Lösung, die Masse bleibt erhalten, Brandellipse und Druckformel stimmen mit ihren Sollwerten überein. Fachlich reicht das für eine Einsatzbemessung aber nicht. Die Prüfung ergab fünf Mängel, die den Gefahrenbereich **unterschätzen** können:

1. **Rasterabhängigkeit (F-01).** Bei großem Rechengebiet verschwinden die inneren Gefahrenzonen. Chlor, 0,5 kg/s, neutrale Schichtung: AEGL-3 reicht analytisch 500 m; bei ± 10 km zeigt die App 167 m, bei ± 50 km „nicht erreicht".
2. **Kein Schwergasmodell (F-02).** Chlor, Propan und andere schwere Gase werden wie neutrale Gase gerechnet. Kaltes Ammoniak und kaltes Erdgas gelten als leicht.
3. **AEGL-Bewertung ohne Zeitbezug (F-03).** 60-Minuten-Werte werden mit dem Höchstwert einzelner Zeitpunkte verglichen. Mittelung, Expositionsdauer und Dosis fehlen; die Werte stammen aus dem Gedächtnis und sind nicht gegen die amtliche Liste geprüft.
4. **Brandrauch (F-04, F-05).** Bewertet wird nur Ruß mit selbst gesetzten Stufen. Die Brandüberhöhung entscheidet fast allein über das Ergebnis: Mit 10 MW konvektiver Leistung fällt die Zone der Stufe 2 von 4,7 km auf unter 200 m. Ein „nicht erreicht" ist daher keine Entwarnung.
5. **Eigenansätze ohne Literaturbeleg (F-06 bis F-09).** Windumlenkung am Hang, Lenkung entlang von Gewässern, Fließgeschwindigkeit aus dem Abfluss und die Druckwelle beim BLEVE beruhen auf selbst gewählten Zahlen.

Empfehlung bis zur Überarbeitung: Gefahrstoff nur mit Rechengebiet ± 1 bis ± 5 km rechnen, Schwergas-Ergebnisse nicht für Absperrgrenzen verwenden, Brandrauch nur als Richtungsanzeige lesen, Gewässer- und Geländelenkung ausgeschaltet lassen.

## 2. Vorgehen

- Vollständige Durchsicht des Quellcodes (Rechenteil Zeilen 340 bis 601, Ablauf und Oberfläche Zeilen 603 bis 1584), der README und des Zwischenspeichers `sw.js`.
- Nachrechnung ausgewählter Fälle mit dem ausgelesenen Rechenteil (Ergebnisse in Abschnitt 5).
- Einstufung jeder Formel und Konstante nach Herkunft:
  - **L** Literaturformel, aus dem Gedächtnis umgesetzt, Koeffizienten noch **nicht** gegen die Primärquelle geprüft
  - **Q** in dieser Arbeit durch eine abgerufene Quelle belegt
  - **E** Eigenansatz ohne Literaturbeleg

Die Literaturangaben in diesem Bericht sind aus dem Gedächtnis genannt. Sie werden in Phase 3 einzeln gegen die Primärquelle geprüft; bis dahin gelten sie als unbestätigt.

## 3. Bestandsaufnahme

### 3.1 Berechnungsmodelle

| Nr. | Modell | Fundstelle | Verfahren | Herkunft |
|---|---|---|---|---|
| M1 | Schichtungsklasse A bis F | Z. 350–360, Aufruf Z. 813 | Pasquill/Turner aus Wind in 10 m, Globalstrahlung (Grenzen 600/300/100 W/m²) und Bewölkung; Zwischenklassen zur stabileren Seite | L, Strahlungsgrenzen E |
| M2 | Ausbreitungsparameter | Z. 363–384 | Briggs (1973), Freifläche und Bebauung | L |
| M3 | Windprofil | Z. 343–344, 455–456 | Potenzgesetz, Exponenten je Klasse, Wind in max(Höhe, 10 m), Faktor höchstens 2,5 | L |
| M4 | Gauß-Puff-Transport | Z. 445–480 | Puffs alle 30 s, Verlagerung mit zeitlich veränderlichem Punktwind, Zuwachs der Streuung über den Laufweg | L (Prinzip), Umsetzung E |
| M5 | Bodenkonzentration | Z. 483–518 | Gauß-Kern mit Bodenreflexion, eine Spiegelung an der Mischungsschicht, ab σz > 1,6·zi gleichverteilt | L |
| M6 | Brandüberhöhung | Z. 428–441, 474 | Briggs: Endüberhöhung neutral/labil und stabil, Anstieg 1,6·F^(1/3)·x^(2/3)/u, Auftriebsfluss F = 8,8 m⁴/s³ je MW | L |
| M7 | Rauchquelle | Z. 191–193, 996–998 | Rußstrom = Brandleistung / Heizwert × Rußausbeute; konvektiver Anteil 0,7 | Ansatz L, Zahlen E |
| M8 | Geländewind | Z. 410–426 | Umlenkung der Hangaufwärts-Komponente, Kaltluftabfluss, Schwergas hangabwärts | **E** |
| M9 | Geländefolge der Fahne | Z. 346, 507 | Halbhöhen-Korrektur neutral/labil, keine bei stabil | L |
| M10 | Fließgewässer | Z. 461–468, 1085–1118 | Lenkung entlang der Gewässerachse, Drift mit der Strömung | **E** |
| M11 | Fließgeschwindigkeit | Z. 1080 | v = 0,35·Q^0,25 | **E** |
| M12 | Brennstofffeuchte | Z. 521–527 | Simard (1968) | L |
| M13 | Feuerausbreitung | Z. 529–535 | Kopfgeschwindigkeit = (R0 + k·u10) × Feuchtefaktor; Ellipse mit LB = 1 + 0,3·u | k für Gras und Vollfeuer L, übrige Werte E |
| M14 | Hangeinfluss Feuer | Z. 561 | exp(0,069·Neigung in Grad), begrenzt 0,3 bis 5 | L (McArthur), Grenzen E |
| M15 | Frontfortschritt | Z. 537–569 | Ankunftszeit über 16 Nachbarzellen (Dijkstra) | E, geometrisch geprüft |
| M16 | Druckwelle | Z. 572–581 | Kinney und Graham, Oberflächenfaktor 1,8, Luftdruckskalierung | L |
| M17 | Gasexplosion | Z. 211–215, 1164 | TNT-Äquivalent mit 3 / 10 / 20 % der Verbrennungsenergie, 4,6 MJ/kg TNT | Ansatz L, Stufen E |
| M18 | Splitterbereich Bombe | Z. 1159 | 634 × Gesamtmasse^(1/6) | **Q** (UN IATG 01.80) |
| M19 | BLEVE-Feuerball | Z. 593–599 | D = 5,8·M^(1/3); Dauer 0,45·M^(1/3) bzw. 2,6·M^(1/6); Höhe 0,75·D; Abstrahlung 0,3·M·Hc/(π·D²·t), höchstens 350 kW/m²; Durchlässigkeit 2,02·(pw·x)^-0,09 | L (TNO/CCPS) |
| M20 | Wärmedosis | Z. 1143–1146 | (kW/m²)^(4/3)·s, Stufen 125 / 250 / 1000 | L |
| M21 | BLEVE-Druck | Z. 599 | 60 kJ je kg Inhalt als Expansionsarbeit | **E** |
| M22 | BLEVE-Abstände | Z. 1148–1150 | 4, 15 und 30 Feuerballradien | 4 und 15: **Q** (Transport Canada); 30: Sekundärquelle |
| M23 | Geländeschatten | Z. 583–591 | Sichtlinie mit 2 m Zuschlag | E |

### 3.2 Stoff- und Schwellenwerte

| Daten | Fundstelle | Herkunft |
|---|---|---|
| 11 Stoffe mit AEGL-1/2/3 für 60 Minuten, molare Massen | Z. 608–623 | L, **nicht** gegen die EPA-Liste geprüft |
| Propan, Methan: 10 %, 50 %, 100 % UEG | Z. 620–621 | L |
| Rauchstufen 0,05 / 0,5 / 5 mg/m³ | Z. 693 | **E** |
| Heizwert und Rußausbeute je Brandgut (17/0,015; 22/0,05; 35/0,10) | Z. 191–193 | Größenordnung L, Einzelwerte E |
| Druckstufen 2 / 7 / 20 / 35 / 100 kPa mit Wirkungstext | Z. 1121–1126 | L |
| Bomben: Gesamt- und Sprengstoffmasse je Gewichtsklasse | ab Z. 221 | L, Richtwerte |
| Gase für Explosion: Heizwerte | ab Z. 200 | L |
| Vegetation: k und R0 je Typ, Zustandsfaktoren 1,3 / 1 / 0,6 / 0,25, Regenfaktoren 0,4 / 0,1 | Z. 256–268, 532 | Gras 0,20 und Vollfeuer 0,10: L; alles andere **E** |

### 3.3 Datenquellen

| Quelle | Verwendung | Fundstelle | Anmerkung |
|---|---|---|---|
| Open-Meteo | 15-Minuten-Vorhersage am Ereignisort | Z. 765–797 | ein Punkt für das ganze Gebiet; Modelllauf-Zeit wird nicht angezeigt |
| Open-Meteo, 5 Modelle | Vergleich Wind zum Ereignisbeginn | Z. 833–867 | nur Anzeige und Warnung |
| Bright Sky (DWD) | Stationsmessung | Z. 869 ff. | nur Anzeige, nicht in der Rechnung |
| Terrain Tiles (AWS) / Open-Meteo | Höhen | Z. 894–945 | Daten rund 30 m, kein LIDAR |
| Overpass (OSM) | Gewässer | Z. 1085–1118 | Zeichenrichtung = angenommene Fließrichtung |
| HLNUG | Abfluss am Pegel | Z. 1064–1083 | nur Hessen; Abruf vom Gerät ungeprüft |
| Nominatim | Ortssuche | — | — |

## 4. Fehleranalyse

Stufen nach möglicher Auswirkung auf die Einsatzentscheidung: **kritisch** (Gefahrenbereich kann deutlich zu klein oder in falscher Richtung ausgegeben werden), **hoch**, **mittel**, **gering**.

### 4.1 Gefahrstoffausbreitung

| Nr. | Befund | Fundstelle | Auswirkung | Stufe |
|---|---|---|---|---|
| F-01 | Die Mindestbreite eines Puffs ist an die Rasterweite gekoppelt (halbe Zelle). Bei ± 10 km und mehr wird die Fahne im Nahbereich künstlich verbreitert und verdünnt. Reichweiten werden außerdem nur an Zellmittelpunkten abgelesen. | Z. 488, 607, 1032–1043 | Innere Zonen (AEGL-3, AEGL-2) werden zu klein oder gar nicht ausgegeben, siehe 5.1 | **kritisch** |
| F-02 | Kein Schwergasmodell. Schwere Gase werden passiv gerechnet; die Schwerewirkung besteht nur aus einem Zusatz im Geländewind und einem Warntext. Die Einstufung „schwer" hängt allein an der molaren Masse. | Z. 988, 410–426 | Breite und Verweilen der Wolke am Boden unterschätzt; Ammoniak (kalt, Nebel), kaltes Erdgas und Fluorwasserstoff fälschlich „leicht" | **kritisch** |
| F-03 | AEGL-60-Minuten-Werte werden mit dem Höchstwert aus Momentaufnahmen je Zeitfenster verglichen. Es gibt keine Mittelung, keine Expositionsdauer, keine Dosis; 10-Minuten-, 30-Minuten-, 4- und 8-Stunden-Werte fehlen. | Z. 608–623, 1008–1016 | Bei kurzer Freisetzung zu streng, bei langer Einwirkung ohne Aussage; Bewertung insgesamt nicht normgerecht | **hoch** |
| F-04 | AEGL-Werte und molare Massen sind nicht gegen die amtliche Liste geprüft; Quelle und Stand werden nicht angezeigt. | Z. 608–623 | Einzelne Werte können falsch sein | **hoch** |
| F-05 | Kein Quelltermmodell: Austrittstemperatur, Impuls, Entspannungsverdampfung, Lachenverdampfung fehlen. Der Massenstrom muss bekannt sein. | Z. 986–992 | Ergebnis nur so gut wie der geschätzte Massenstrom | **hoch** |
| F-06 | Geländewind mit selbst gewählten Koeffizienten (Umlenkanteile 0 bis 0,8; Kaltluft bis 1,5 m/s; Höhenabklingen 150 m). | Z. 345, 410–426 | Fahnenrichtung kann verfälscht werden, ohne dass ein Beleg dafür besteht | **hoch** |
| F-07 | Ein Punktwind gilt für das ganze Gebiet, auch bei ± 50 km. | Z. 981, 799–826 | Ab etwa 10 km Richtung und Ankunftszeit unsicher | **hoch** |
| F-08 | Schwachwind: Wind wird auf mindestens 0,5 m/s gesetzt, die Streuung wird nicht angepasst (kein Mäandern). | Z. 448 | Unter 1 m/s ist das Gauß-Modell nicht gültig; nur Warntext | mittel |
| F-09 | Zündfähige Gase werden mit der mittleren Konzentration bewertet. Örtliche Spitzen liegen deutlich darüber. | Z. 620–621 | Zündfähiger Bereich unterschätzt | mittel |
| F-10 | Anfangsgrößen der Wolke (2 m, 1 m; bei Einzelwolke 0,5 × Kubikwurzel des Volumens) sind gesetzt. | Z. 981, 990–991 | Nahbereich bis etwa 100 m unsicher | mittel |
| F-11 | Wechsel der Schichtungsklasse: Der Zuwachs der Streuung wird am selben Laufweg der neuen Klasse abgegriffen, nicht über eine gleichwertige Ersatzquelle. | Z. 459–460 | Abweichung bei Klassenwechsel, meist klein | gering |
| F-12 | Bezugshöhe ist der Boden, nicht die Atemhöhe; Deposition und chemische Umwandlung fehlen. | Z. 483–518 | gering, auf der sicheren Seite | gering |
| F-13 | Für die Randprüfung wird die erste, nicht die kleinste Schwelle verwendet. | Z. 1034 | Nur bei nicht aufsteigend eingegebenen Schwellen | gering |
| F-14 | Mindestreichweite „eine Zelle" erzeugt Scheinwerte wie „bis 420 m" bei grobem Raster. | Z. 1042 | Täuscht ein Ergebnis vor | mittel |

### 4.2 Brandrauch

| Nr. | Befund | Fundstelle | Auswirkung | Stufe |
|---|---|---|---|---|
| F-15 | Nur Ruß wird gerechnet. Kohlenmonoxid, Cyanwasserstoff, Chlorwasserstoff und Stickoxide fehlen. Die drei Stufen sind selbst gesetzt. | Z. 191–193, 693 | Keine toxikologische Aussage möglich; die Darstellung legt eine nahe | **hoch** |
| F-16 | Die Endüberhöhung bestimmt das Ergebnis nahezu allein (siehe 5.2). Gerechnet wird mit Wind in 10 m statt in Fahnenhöhe, mit einer Punktquelle statt einer Brandfläche, ohne Abwind an Gebäuden und ohne Durchstoßen der Inversion. | Z. 428–441, 474 | „Nicht erreicht" kann falsch sein; niedergedrückte Fahnen bei starkem Wind werden nicht erkannt | **kritisch** |
| F-17 | Konstante Brandleistung, kein Brandverlauf. | Z. 998 | mittel | mittel |

### 4.3 Gewässer

| Nr. | Befund | Fundstelle | Auswirkung | Stufe |
|---|---|---|---|---|
| F-18 | Die Zeichenrichtung des OpenStreetMap-Abschnitts wird ungeprüft als Fließrichtung verwendet. | Z. 1103 | Driftrichtung kann verkehrt sein (vor allem Kanäle, Altarme) | **hoch** |
| F-19 | Die Lenkung der Wolke entlang des Gewässers und die Kopplung an die Wassergeschwindigkeit haben keinen Literaturbeleg (Faktoren 0,9; 1,4/u; 5000 m; 0,3). | Z. 461–468 | Pauschale Lenkung, die der Auftrag ausdrücklich ausschließt | **hoch** |
| F-20 | v = 0,35·Q^0,25 ist ein eigener Kompromiss, keine veröffentlichte Beziehung. | Z. 1080 | Fließgeschwindigkeit um den Faktor 2 und mehr unsicher | mittel |
| F-21 | Eintrag ins Gewässer, Transport gelöster Stoffe und Ausgasen werden nicht unterschieden und nicht gerechnet. | — | Fehlende Funktion | mittel |
| F-22 | Liegt kein Pegel am selben Gewässer, wird der nächste eines anderen verwendet (mit Hinweis). | Z. 1066–1083 | Falscher Abfluss | mittel |

### 4.4 Vegetationsbrand

| Nr. | Befund | Fundstelle | Auswirkung | Stufe |
|---|---|---|---|---|
| F-23 | Keine Brennstoffkarte: Das Feuer läuft über Gewässer, Straßen, Äcker und Ortschaften hinweg. | Z. 537–569 | Brandfläche und Front in bebauter oder gegliederter Landschaft falsch | **hoch** |
| F-24 | Ausbreitungsgeschwindigkeit nach Faustregeln, nicht nach Rothermel; Brennstoffmenge fehlt. Werte für Getreide, Heide, Bodenfeuer und die Grundgeschwindigkeit R0 sind gesetzt. Die Regeln stammen aus Australien und Kanada. | Z. 256–262, 529–535 | Geschwindigkeit um den Faktor 2 bis 3 unsicher | **hoch** |
| F-25 | Feuchtefaktor exp(−0,108·(Feuchte − 6)) ist eine Graslandbeziehung, wird auf alle Typen angewandt; Zustands- und Regenfaktoren sind gesetzt. | Z. 531–532 | mittel | mittel |
| F-26 | Länge-zu-Breite 1 + 0,3·u ist gesetzt; veröffentlichte Beziehungen liegen vor. | Z. 533 | Flankenbreite unsicher | mittel |
| F-27 | Flugfeuer fehlt; Hangfaktor bergab bei 0,3 abgeschnitten. | Z. 561 | Bei starkem Wind Front unterschätzt | mittel |

### 4.5 Explosion und BLEVE

| Nr. | Befund | Fundstelle | Auswirkung | Stufe |
|---|---|---|---|---|
| F-28 | Gaswolkenexplosion nur über TNT-Äquivalent mit drei festen Energieanteilen. Hindernisdichte, Verdämmung und Flammenbeschleunigung gehen nicht ein; Multi-Energy und Baker-Strehlow-Tang fehlen. | Z. 211–215, 1164 | Nahbereich überschätzt, Fernbereich je nach Wahl um ein Mehrfaches falsch | **hoch** |
| F-29 | Druckstufen ohne Impuls und Einwirkdauer; Quellen nicht angezeigt. | Z. 1121–1126 | Wirkungstexte nur Anhalt | mittel |
| F-30 | Laufzeit der Druckwelle mit Schallgeschwindigkeit: Die Welle ist im Nahbereich schneller. | Z. 1137 | Angabe ist eine obere Grenze | gering |
| F-31 | BLEVE-Druckwelle mit 60 kJ/kg ohne Beleg. | Z. 599 | Fensterbruch-Radius nicht belastbar | mittel |
| F-32 | BLEVE: Heizwert fest für Propan, Strahlungsanteil fest 0,3; Behälterdruck und Temperatur gehen nicht ein. | Z. 593–599 | Wärmezonen etwa ± 25 % | mittel |
| F-33 | 4, 15 und 30 Feuerballradien werden als „Evakuierung mindestens / empfohlen" ausgegeben. Das sind Richtwerte für Flüssiggasbehälter, keine allgemeinen Sicherheitsabstände. | Z. 1148–1150 | Beschriftung zu absolut | mittel |
| F-34 | Geländeschatten als Ja/Nein-Sichtlinie auf 30-m-Höhendaten; Beugung fehlt. | Z. 583–591 | Im Maßstab von Druckzonen kaum aussagekräftig | mittel |
| F-35 | Bombe im Erdreich wird nicht gerechnet; Hülle bleibt unberücksichtigt. | Z. 1155–1161 | auf der sicheren Seite | gering |

### 4.6 Meteorologie, Software, Ausgabe

| Nr. | Befund | Fundstelle | Auswirkung | Stufe |
|---|---|---|---|---|
| F-36 | Keine Wetterszenarien, kein Unsicherheitssektor für die Windrichtung, obwohl die Modelle sie liefern. | Z. 849–867 | Eine einzige Fahnenachse täuscht Sicherheit vor | **hoch** |
| F-37 | Gemessenes, vorhergesagtes und angenommenes Wetter sind in der Ausgabe nicht klar getrennt; Alter der Vorhersage fehlt. | Z. 765–831 | mittel | mittel |
| F-38 | Schichtung nachts in Bebauung kann F ergeben; Standardwerte der Mischungsschicht sind gesetzt. | Z. 347, 350–360 | auf der sicheren Seite | gering |
| F-39 | Scheingenauigkeit: Reichweiten auf 10 m, Flächen auf 0,01 km². | Z. 627, 1026 | Vermittelt eine Genauigkeit, die das Modell nicht hat | mittel |
| F-40 | Keine Kennzeichnung der Prognosequalität, keine Modellversion in Ausgabe und PDF. | Z. 1369–1582 | mittel | mittel |
| F-41 | Eine Datei für alles; Konstanten ohne Quelle und Einheit im Code; keine Tests im Repository. | gesamt | Nicht unabhängig prüfbar | mittel |

## 5. Nachrechnungen

### 5.1 Rasterabhängigkeit (F-01)

Chlor, 0,5 kg/s am Boden, Freifläche, keine Geländewirkung. Reichweite in Metern für AEGL-1 / AEGL-2 / AEGL-3.

| Fall | analytisch | ± 2 km | ± 5 km | ± 10 km | ± 20 km | ± 50 km |
|---|---|---|---|---|---|---|
| Klasse D, 3 m/s | 5187 / 2012 / 500 | Rand / 1967 / 467 | 5001 / 1917 / 417 | 5000 / 1833 / **167** | 5000 / 1800 / **200** | 5000 / **833** / **0** |
| Klasse F, 1,5 m/s | 125 km / 16,2 km / 2268 | Rand | Rand / Rand / 2083 | — | Rand / 15,6 km / **1400** | Rand / 15,4 km / **417** |

„Rand" heißt: Zone endet an der Gebietsgrenze. Bis ± 5 km stimmt das Modell auf 2 bis 17 % mit der analytischen Lösung überein. Darüber gehen die inneren Zonen verloren.

### 5.2 Empfindlichkeit der Brandüberhöhung (F-16)

Rußstrom 0,2 kg/s, Klasse D, 4 m/s, ± 10 km. Reichweite der Stufen 1 / 2 / 3.

| Konvektive Leistung | Reichweite in m |
|---|---|
| 0 MW (keine Überhöhung) | über 10 000 / 4667 / 833 |
| 10 MW | über 10 000 / 167 / 0 |
| 35 MW und mehr | 236 / 167 / 0 |

Zwischen „Rauch am Boden bis 4,7 km" und „Rauch nur am Brandobjekt" liegen 10 MW. Das Modell kann diese Grenze nicht verlässlich ziehen.

### 5.3 Bestätigte Teile

| Prüfung | Ergebnis |
|---|---|
| Gauß-Puff gegen stationäre Gauß-Fahne, 1 km, alle Klassen, Freifläche/Bebauung, Höhe 0 und 50 m | 0,89 bis 1,01 (Abweichung durch Rasterweite) |
| Massenerhaltung Einzelwolke 1000 kg | 998 kg |
| Brandellipse: Kopf, Rücken, Halbbreite | stimmt mit der vorgegebenen Ellipse überein |
| Kinney-Graham bei skaliertem Abstand 10 | 10 kPa, erwartete Größenordnung |
| Feuerballradius Sattelzug | rund 80 m, passend zur Angabe von Transport Canada für 40 000 l |

Diese Prüfungen belegen die richtige Umsetzung der Formeln. Sie sind **keine** Validierung gegen Versuchsdaten oder gegen ALOHA und DEGADIS.

## 6. Abgleich mit dem Auftrag

| Abschnitt | Stand | Umsetzbarkeit |
|---|---|---|
| 4.1 Schwergasmodell | fehlt | Britter-McQuaid-Verfahren als veröffentlichtes Schätzverfahren umsetzbar. Ein vollwertiges DEGADIS als Nachbau in der Web-App ist nicht in vertretbarem Umfang leistbar; Vergleich nur mit veröffentlichten DEGADIS-Ergebnissen. |
| 4.1 Quellterm (Temperatur, Impuls, Verdampfung) | fehlt | In Stufen umsetzbar: Leckrate Gas/Flüssigkeit, Entspannungsverdampfung, Lache. Braucht eine Stoffdatenbank mit belegten Werten. |
| 4.2 AEGL mit Zeiten | fehlt | Umsetzbar, sobald die amtlichen Tabellen abgerufen und je Wert mit Quelle hinterlegt sind. Zeitmittel und Dosis lassen sich aus den vorhandenen Puff-Zeitreihen bilden. |
| 4.3 Brandrauch-Schadstoffe | fehlt | Umsetzbar nur mit belegten Ausbeuten je Brandgut. Wo keine vorliegen: Anzeige „keine belastbaren Emissionsdaten". |
| 4.4 Gewässer | unzureichend | Fließrichtung über Höhendaten prüfbar. Gaslenkung: kein belegtes Verfahren bekannt, daher abschalten und durch Hinweis ersetzen. Gelöste Stoffe: einfache Fließzeitrechnung möglich. |
| 4.5 Vegetationsbrand | vereinfacht | Rothermel mit Standard-Brennstoffmodellen umsetzbar; Flächennutzung aus OpenStreetMap als Brennstoff- und Sperrkarte. Flugfeuer nur als Warnstufe. |
| 4.6 Explosion | vereinfacht | Multi-Energy und Baker-Strehlow-Tang brauchen die veröffentlichten Kurven als Zahlenwerte. Nur umsetzbar, wenn diese aus zitierfähiger Quelle vorliegen. |
| 4.7 BLEVE | weitgehend vorhanden | Druckteil durch belegtes Verfahren ersetzen oder entfernen; Stoff- und Druckabhängigkeit ergänzen. |
| 5 Meteorologie | teilweise | Unsicherheitssektor und Szenarien umsetzbar. Räumliches Windfeld nur grob (mehrere Vorhersagepunkte). |
| 6 Validierung, 25 Szenarien | fehlt | Umsetzbar mit analytischen Lösungen und veröffentlichten Rechenbeispielen. ALOHA und DEGADIS kann ich nicht selbst ausführen; Feldversuchsdaten nur, soweit frei zugänglich. Fehlt eine Referenz, bleibt das Szenario als „ohne Referenz" sichtbar. |
| 7 Prognosequalität | fehlt | umsetzbar |
| 8 Architektur | unzureichend | umsetzbar: getrennte Module, Konstantenregister mit Quelle und Einheit, automatische Tests |
| 9 Einsatzleitungsausgabe | teilweise (PDF) | umsetzbar; betroffene Objekte aus OpenStreetMap |

## 7. Vorschlag für das weitere Vorgehen

Reihenfolge nach Auswirkung auf die Einsatzentscheidung:

1. **Sofortkorrekturen:** F-01 und F-14 (Reichweiten rasterunabhängig bestimmen), F-39 (Rundung), Eigenansätze F-06, F-19, F-20, F-31 abschalten oder als „nicht belegt" kennzeichnen, Kennzeichnung der Prognosequalität.
2. **Struktur:** Aufteilung in Module, Konstantenregister, Testlauf im Repository.
3. **Toxikologie:** AEGL-Tabellen mit Quelle, Zeitmittel, Dosis.
4. **Schwergas und Quellterm.**
5. **Meteorologie:** Unsicherheitssektor, Szenarien, Trennung gemessen / vorhergesagt / angenommen.
6. **Brandrauch-Schadstoffe, Vegetationsbrand, Explosion, BLEVE.**
7. **Validierungskatalog, technische Dokumentation, Einsatzleitungsausgabe.**

Jedes Paket endet mit Tests und einem Eintrag in der Dokumentation. Der Umfang übersteigt eine einzelne Sitzung deutlich.

## 8. Umsetzungsstand

### Sofortkorrekturen vom 11.11.2026 (Modellstand 0.10)

| Befund | Maßnahme | Stand |
|---|---|---|
| F-01 Rasterabhängigkeit | Reichweiten werden unabhängig vom Raster unter den Puffmittelpunkten bestimmt (`axisReach`), ohne Mindestbreite, mit logarithmischer Einpassung zwischen zwei Puffs. Flächen auf zwei ineinander liegenden Rastern (ganzes Gebiet und achtfach feiner um den Ereignisort). | behoben |
| F-13 Randprüfung | kleinste statt erste Schwelle | behoben |
| F-14 Scheinwert „eine Zelle" | entfällt | behoben |
| F-39 Scheingenauigkeit | Entfernungen gerundet auf 10 m, 50 m, 0,1 km bzw. 1 km; Flächen auf ein bis zwei Stellen; Ausgabe mit „ca." | behoben |
| F-06 Geländewind | ausgeschaltet; nur auf ausdrückliche Wahl, dann Einstufung „eingeschränkt" | entschärft |
| F-19, F-20 Gewässerlenkung, Fließgeschwindigkeit | Gewässer und Pegel werden nur noch angezeigt; Lenkung nur auf ausdrückliche Wahl, dann „eingeschränkt" | entschärft |
| F-18 Fließrichtung | Hinweis in Oberfläche und Einstufung; Prüfung über Höhendaten steht aus | offen |
| F-31 BLEVE-Druck | entfernt; Hinweis „Druckwirkung nicht bemessen" | entfernt |
| F-33 BLEVE-Abstände | als „Richtwert" mit Quelle beschriftet | behoben |
| F-40 Prognosequalität | Einstufung mit Begründung, Rechenmodell, Modellstand und Berechnungszeit in Anzeige und PDF | behoben, wird mit jedem Paket fortgeschrieben |

Nachrechnung zu F-01 nach der Korrektur, Chlor 0,5 kg/s, Reichweite AEGL-1 / AEGL-2 / AEGL-3 in Metern:

| Fall | analytisch | neu, ± 10 km | neu, ± 50 km |
|---|---|---|---|
| Klasse D, 3 m/s | 5187 / 2011 / 499 | 5130 / 1974 / 477 | 5130 / 1974 / 477 |
| Klasse F, 1,5 m/s | 125 km / 16,2 km / 2264 | — | Rand / 15,7 km / 2163 |
| Klasse D, 10 m/s (± 20 km) | 2265 / 948 / 255 | 2231 / 988 / 295 | — |
| Klasse A, 2 m/s (± 5 km) | 1128 / 556 / 174 | 1122 / 552 / 170 | — |

Die Reichweite hängt nicht mehr von der Gebietsgröße ab. Die Abweichung zur analytischen Lösung liegt zwischen −5 % und +16 %; die größte tritt bei starkem Wind auf, weil die Puffs dann weiter auseinander liegen.

Alle übrigen Befunde sind offen. Die kritischen und hohen Befunde F-02 (Schwergas), F-03 und F-04 (AEGL), F-05 (Quellterm), F-07 (Punktwind), F-15 und F-16 (Brandrauch), F-23 und F-24 (Vegetationsbrand), F-28 (Gasexplosion) und F-36 (Wetterszenarien) bestehen fort und stehen in der Einstufung jeder betroffenen Prognose.

### Schwergasmodul und Struktur vom 11.11.2026 (Modellstand 0.11)

| Befund | Maßnahme | Stand |
|---|---|---|
| F-02 Schwergas | Verfahren nach Britter und McQuaid als eigenes Modul (`js/modell-schwergas.js`) mit automatischer Modellwahl über das Schwergaskriterium. Ausgegeben werden Entfernungen, getrennt von den Flächen des Gauß-Modells. Zustand beim Austritt wählbar (gasförmig, kalter Dampf, druckverflüssigt). Beschreibung: `docs/Britter-McQuaid.md`. | teilweise behoben |
| F-02 Rest | Für giftige Gase liegen die Schwellen meist unter dem Kurvenbereich; die Entfernung ist dann nur abgeleitet und im Vergleich mit Jack Rabbit II um bis zum Faktor 2,6 zu kurz. Ein dynamisches Schwergasmodell fehlt weiter. Breite und Verweilen der Wolke werden nicht gerechnet. | offen |
| F-05 Quellterm | Anfangsdichte aus Zustand und Siedetemperatur; Entspannungsverdampfung wird ausgewiesen. Impuls, Ausregnen und Lachenverdampfung fehlen. | teilweise |
| F-41 Struktur | Rechenmodelle, Stoffdaten und Oberfläche in getrennten Dateien; Modelle ohne Browser prüfbar; Prüflauf mit 49 Fällen; Konstantenregister mit Herkunft und Status. Beschreibung: `docs/Architektur.md`, `docs/Konstanten.md`, `docs/Validierung.md`. | weitgehend behoben |

Neu festgestellt:

| Nr. | Befund | Stufe |
|---|---|---|
| F-42 | Die Kurventabellen von Britter-McQuaid sind nur zum Teil an einer abgerufenen Quelle abgeglichen; zwei Vorzeichen wurden anhand der Stetigkeit korrigiert, das Workbook selbst lag nicht vor. | hoch, bis zum Abgleich |
| F-43 | Die Siede- und Verdampfungsdaten der fünf Stoffe mit Zweiphasen-Option sind nicht an einer Primärquelle abgeglichen. | mittel |
| F-44 | Der Prüflauf weist drei nicht bestandene Vergleiche mit Jack Rabbit II aus (abgeleitete Entfernungen zu kurz). | hoch |
