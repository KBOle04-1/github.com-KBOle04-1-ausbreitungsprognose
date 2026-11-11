# Schwergasmodul nach Britter und McQuaid

Datei `js/modell-schwergas.js`, Modellstand 0.11 vom 11.11.2026.

## 1. Zweck und Einordnung

Das Verfahren aus dem *Workbook on the Dispersion of Dense Gases* (Britter und McQuaid, 1988) ist ein Satz empirischer Kurven. Es liefert für eine schwere Gaswolke die **Entfernung in Windrichtung**, bis zu der am Boden auf der Wolkenachse ein bestimmtes Konzentrationsverhältnis Cm/C0 erreicht wird.

Es ist ein vereinfachtes Schätzverfahren für überschlägige Prognosen:

- kein zeitabhängiges Modell: Es gibt keine Ankunftszeiten und keinen Verlauf.
- kein dreidimensionales Strömungsmodell: Es gibt keine Wolkenform, keine Breite und keine Wirkung von Gelände oder Gebäuden.
- Die App gibt deshalb aus dem Verfahren **nur Entfernungen** aus (gestrichelte Kreise, Beschriftung „Schwergas"). Die farbigen Flächen und der Zeitverlauf stammen weiterhin aus dem passiven Gauß-Modell und sind als „abgeleitet" beschriftet.

## 2. Automatische Modellwahl

| Lage | Verwendetes Modell |
|---|---|
| Wolke nicht schwerer als Luft, oder Schwergaskriterium nicht erfüllt | Gauß-Puff-Modell |
| Schwergaskriterium erfüllt | Entfernungen nach Britter-McQuaid, Flächen und Zeitverlauf aus dem Gauß-Modell |
| Schwergas, Schwelle unter dem Kurvenbereich | Britter-McQuaid bis zur letzten Kurve, darüber hinaus Fortsetzung mit dem Gauß-Modell; Einstufung „außerhalb des gültigen Modellbereichs" |
| Schwergas in Bebauung oder bei mehr als 50 m Höhenunterschied im Rechengebiet | Ergebnis wird ausgegeben, aber als „nicht ausreichend berechenbar" eingestuft |
| Stoff steigt mit Brandrauch auf (Kombiniert) | Gauß-Modell mit Brandüberhöhung, keine Schwergasrechnung |
| Dynamische Schwergasrechnung (DEGADIS, SLAB) | **nicht verfügbar**; die Einstufung weist darauf hin |

Die Entscheidung und ihre Kennzahl stehen bei jedem Ergebnis unter „Modellwahl" und im PDF.

## 3. Gleichungen

Bezeichnungen: ρ0 Anfangsdichte der Wolke, ρa Luftdichte, u Wind in 10 m Höhe, q0 Volumenstrom der Quelle, V0 Volumen einer Einzelwolke, Rd Freisetzungsdauer, x Entfernung.

**Auftriebsgröße**

g0' = g · (ρ0 − ρa) / ρa

**Kontinuierliche Freisetzung**

- Längenmaß: Dc = (q0/u)^(1/2)
- Schwergaskriterium: (g0' · q0 / Dc)^(1/3) / u ≥ 0,15
- Kennzahlen der Kurven: α = log10[(g0'² · q0 / u⁵)^(1/5)], β = log10[x / Dc]

**Momentane Freisetzung**

- Längenmaß: Di = V0^(1/3)
- Schwergaskriterium: (g0' · V0)^(1/2) / (u · Di) ≥ 0,20
- Kennzahlen der Kurven: α = log10[(g0' · V0^(1/3) / u²)^(1/2)], β = log10[x / V0^(1/3)]

**Unterscheidung kontinuierlich / momentan**

- u · Rd / x ≥ 2,5: kontinuierlich
- u · Rd / x ≤ 0,6: momentan
- dazwischen: beide Rechnungen; die App verwendet den **größeren** Abstand und weist den Übergangsbereich aus.

**Nicht isotherme Freisetzung**

Für eine Wolke mit Anfangstemperatur T0 und Lufttemperatur Ta wird die geforderte Konzentration C (Stoffmengenanteil) umgerechnet:

C* = C / [C + (1 − C) · Ta / T0]

In die Kurven geht das Verhältnis C*/C0 ein.

**Kurven**

Jede Kurve ist stückweise linear, β = a·α + b. Zwischen zwei Konzentrationsverhältnissen wird linear in log10(Cm/C0) eingepasst.

Kontinuierlich:

| Cm/C0 | Bereich von α | β |
|---|---|---|
| 0,1 | α ≤ −0,55 | 1,75 |
| | −0,55 < α ≤ −0,14 | 0,24α + 1,88 |
| | −0,14 < α ≤ 1 | **−0,50α + 1,78** |
| 0,05 | α ≤ −0,68 | 1,92 |
| | −0,68 < α ≤ −0,29 | 0,36α + 2,16 |
| | −0,29 < α ≤ −0,18 | 2,06 |
| | −0,18 < α ≤ 1 | −0,56α + 1,96 |
| 0,02 | α ≤ −0,69 | 2,08 |
| | −0,69 < α ≤ −0,31 | 0,45α + 2,39 |
| | −0,31 < α ≤ −0,16 | 2,25 |
| | −0,16 < α ≤ 1 | −0,54α + 2,16 |
| 0,01 | α ≤ −0,70 | 2,25 |
| | −0,70 < α ≤ −0,29 | 0,49α + 2,59 |
| | −0,29 < α ≤ −0,20 | 2,45 |
| | −0,20 < α ≤ 1 | −0,52α + 2,35 |
| 0,005 | α ≤ −0,67 | 2,40 |
| | −0,67 < α ≤ −0,28 | 0,59α + 2,80 |
| | −0,28 < α ≤ −0,15 | 2,63 |
| | −0,15 < α ≤ 1 | −0,49α + 2,56 |
| 0,002 | α ≤ −0,69 | 2,60 |
| | −0,69 < α ≤ −0,25 | 0,39α + 2,87 |
| | −0,25 < α ≤ −0,13 | 2,77 |
| | −0,13 < α ≤ 1 | −0,50α + 2,71 |

Momentan:

| Cm/C0 | Bereich von α | β |
|---|---|---|
| 0,1 | α ≤ −0,44 | 0,70 |
| | −0,44 < α ≤ 0,43 | 0,26α + 0,81 |
| | 0,43 < α ≤ 1 | 0,93 |
| 0,05 | α ≤ −0,56 | 0,85 |
| | −0,56 < α ≤ 0,31 | 0,26α + 1,00 |
| | 0,31 < α ≤ 1 | −0,12α + 1,12 |
| 0,02 | α ≤ −0,66 | 0,95 |
| | −0,66 < α ≤ 0,32 | 0,36α + 1,19 |
| | 0,32 < α ≤ 1 | −0,26α + 1,38 |
| 0,01 | α ≤ −0,71 | 1,15 |
| | −0,71 < α ≤ 0,37 | 0,34α + 1,39 |
| | 0,37 < α ≤ 1 | −0,38α + 1,66 |
| 0,005 | α ≤ −0,52 | 1,48 |
| | −0,52 < α ≤ 0,24 | 0,26α + 1,62 |
| | 0,24 < α ≤ 1 | **−0,30α + 1,75** |
| 0,002 | α ≤ 0,27 | 1,83 |
| | 0,27 < α ≤ 1 | −0,32α + 1,92 |
| 0,001 | α ≤ −0,10 | 2,075 |
| | −0,10 < α ≤ 1 | −0,27α + 2,05 |

## 4. Herkunft und Prüfstand der Zahlen

Das Workbook selbst (HSE Contract Research Report 17/1988) lag für diese Arbeit **nicht** vor. Die Kurven sind dort als Nomogramme gezeichnet; die Geradenstücke oben sind die in der Lehrbuchliteratur verbreitete Näherung dieser Nomogramme.

| Bestandteil | Quelle | Stand |
|---|---|---|
| Kurvenstücke kontinuierlich, alle Zeilen | Wiedergabe der Tabelle in einer Dissertation der Texas A&M University (abgerufen am 11.11.2026), dort nach Lehrbuchquelle zitiert | abgeglichen |
| Kurvenstücke momentan, Zeilen 0,1; 0,05; 0,01; 0,005 | dieselbe Wiedergabe | abgeglichen; die Zeile 0,1 enthält dort einen Druckfehler (−0,43 statt 0,43) |
| Kurvenstücke momentan, Zeilen 0,02; 0,002; 0,001 | aus dem Gedächtnis nach Crowl und Louvar, *Chemical Process Safety*; in der abgerufenen Wiedergabe verstümmelt | **nicht abgeglichen**, nur durch die Stetigkeitsprüfung gestützt |
| Zwei Vorzeichen (fett) | In der abgerufenen Tabelle steht „0,50α + 1,78" und „0,30α + 1,75". Damit hätten die Kurven an der Nahtstelle einen Sprung von 0,14 in log10. Mit negativem Vorzeichen sind sie stetig und fallen wie alle Nachbarkurven. | eigene Korrektur, begründet durch Stetigkeit |
| Kriterien 0,15 und 0,20, Grenzen 2,5 und 0,6, Temperaturkorrektur | aus dem Gedächtnis nach Crowl und Louvar | **nicht abgeglichen** |
| Regel im Übergangsbereich | Die Regel des Workbooks ist nicht geprüft. Die App nimmt den größeren Abstand (sichere Seite). | eigene Festlegung |

Der automatische Prüflauf kontrolliert die Stetigkeit aller Kurven (Fall B01) und rechnet ein Lehrbuchbeispiel nach (Fall B02: 367 m, Ergebnis 367 m). Dieses Beispiel bestätigt die Zeilen 0,02 und 0,01 der kontinuierlichen Kurven, die Temperaturkorrektur und die Kennzahlen.

Vor einer Nutzung für die Einsatzbemessung sind die nicht abgeglichenen Zeilen an der Primärquelle zu prüfen.

## 5. Anfangszustand der Wolke

| Wahl in der App | Annahme | Anfangstemperatur | Anfangskonzentration |
|---|---|---|---|
| gasförmig, Umgebungstemperatur | reines Gas | Lufttemperatur | 1 |
| kalter Dampf bei Siedetemperatur | reiner Dampf, z. B. über einer Lache | Siedetemperatur | 1 |
| druckverflüssigt, Austritt aus der Flüssigphase | gesamte Masse als reiner Dampf bei Siedetemperatur; kein Ausregnen | Siedetemperatur | 1 |

Dichte: ρ0 = p · M / (R · T0).

Bei der druckverflüssigten Freisetzung weist die App den Anteil der Entspannungsverdampfung aus, f = cp,fl · (T_Lager − T_Siede) / ΔH_v. Er geht nicht in die Entfernung ein, weil die gesamte Masse als luftgetragen angesetzt wird.

Verworfene Variante: Vorverdünnung der Wolke mit so viel Luft, dass das Aerosol gerade verdampft (C0 rund 7 bis 9 Vol.-% bei Chlor). Im Vergleich mit Jack Rabbit II lagen die damit berechneten Konzentrationen in 1 bis 2 km beim 0,2- bis 0,4-Fachen der Messwerte. Der Ansatz „reiner Dampf bei Siedetemperatur" lag näher an den Messungen und auf der sicheren Seite.

Siede- und Verdampfungsdaten sind nur für Chlor, Ammoniak, Schwefeldioxid, Propan und Methan hinterlegt (siehe `docs/Konstanten.md`, dort als nicht abgeglichen geführt). Für alle anderen Stoffe ist nur „gasförmig" wählbar; die App weist darauf hin, statt Werte zu schätzen.

Nicht gerechnet werden: Austrittsimpuls, Strahlausbreitung, Ausregnen und Lachenbildung, Abkühlung der Wolke durch verdampfendes Aerosol, Wärmeaufnahme vom Boden, chemische Reaktion (z. B. Fluorwasserstoff, Ammoniak mit Luftfeuchte).

## 6. Anwendungsgrenzen

Die App warnt oder stuft herab, wenn eine dieser Grenzen verletzt ist:

| Grenze | Behandlung in der App |
|---|---|
| Konzentrationsverhältnis über 0,1 (Nahbereich) | „nicht berechenbar"; angegeben wird nur, dass die Entfernung unter der der Kurve 0,1 liegt |
| Konzentrationsverhältnis unter 0,002 (kontinuierlich) bzw. 0,001 (momentan) | Entfernung „abgeleitet": bis zur letzten Kurve Britter-McQuaid, danach Verdünnung wie eine passive Gauß-Wolke mit Anschluss über eine Ersatzquelle. Einstufung „außerhalb des gültigen Modellbereichs". |
| α über 1 | Warnhinweis „Kennzahl über dem Kurvenbereich" |
| Schwergaskriterium nicht erfüllt | kein Britter-McQuaid, Gauß-Modell |
| Bebauung, Hindernisse | Einstufung „außerhalb des gültigen Modellbereichs" |
| Höhenunterschied im Rechengebiet über 50 m | Einstufung „außerhalb des gültigen Modellbereichs" |
| Wind | Die Kurven hängen nicht von der Schichtung ab; bei sehr stabiler Schichtung und Schwachwind ist die Aussage unsicher. Es gilt der Wind zu Ereignisbeginn. |
| Quelle | bodennah, ohne Impuls |
| Mittelungszeit | Die Kurven beschreiben mittlere Höchstkonzentrationen. Kurzzeitige Spitzen liegen höher. |

Wichtig für giftige Gase: Die Kurven enden bei 0,1 bis 0,2 % der Anfangskonzentration, also bei rund 1000 bis 2000 ppm für eine reine Gaswolke. AEGL-Werte liegen meist weit darunter. Für diese Schwellen ist die Entfernung deshalb fast immer „abgeleitet".

## 7. Vergleich mit Versuchsdaten

Jack Rabbit II, Chlorversuche 6, 7 und 9 (8 bis 18 t in 33 bis 133 s). Verglichen wird die Entfernung, in der das Modell die am Messbogen gemessene Spitzenkonzentration erreicht, mit der Entfernung des Messbogens. Die Einzelwerte stehen in `docs/Validierung-Ergebnisse.md` (Fälle J01 bis J12).

| Teil | Verhältnis Modell / Messbogen | Bewertung |
|---|---|---|
| innerhalb der Kurven (berechnet), 6 Werte | 0,64 bis 1,60 | innerhalb des Faktors 2 |
| unterhalb der Kurven (abgeleitet), 6 Werte | 0,39 bis 0,66 | drei Werte außerhalb des Faktors 2, alle zu kurz |

Einordnung:

- Die Messwerte sind Spitzen mit 1 bis 3 s Auflösung. Ein Modell für mittlere Konzentrationen liegt dagegen systematisch niedriger.
- Die veröffentlichte Auswertung von Hanna und Mitautoren kommt für das Nomogrammverfahren zu Übereinstimmung meist innerhalb des Faktors 2 und einer Überschätzung um den Faktor 2 bis 3 bei Versuch 1.
- Die abgeleiteten Entfernungen sind zu kurz. Die App gibt sie deshalb als „mindestens" aus, mit dem Zusatz „bis zum 2,5-Fachen möglich".

Vergleiche mit DEGADIS und SLAB liegen **nicht** vor. Beide Programme konnten in dieser Arbeit nicht ausgeführt werden, und veröffentlichte Ergebnisse für gleiche Eingangsdaten wurden nicht beschafft.

## 8. Quellen

- Britter, R. E.; McQuaid, J. (1988): Workbook on the Dispersion of Dense Gases. HSE Contract Research Report 17/1988. Nicht eingesehen.
- Wiedergabe der Kurventabellen: Dissertation, Texas A&M University, https://oaktrust.library.tamu.edu/server/api/core/bitstreams/634efe48-8615-42f1-9cc6-0884b5f602df/content
- Hanna, S. und Mitautoren: Analysis of variations of concentrations with downwind distance (Versuchstabelle Jack Rabbit II), https://harmo.org/Conferences/Proceedings/_Bologna/publishedSections/H18-071-Hanna.pdf
- DHS/CISA (2019): Jack Rabbit II, Messwerte je Messbogen, https://www.cisa.gov/sites/default/files/publications/2019-CSSS-Jack-Rabbit-II-Update-508.pdf
- Hanna, S. und Mitautoren (2020): Britter and McQuaid (B&M) 1988 workbook nomograms for dense gas modeling applied to the Jack Rabbit II chlorine release trials, https://www.sciencedirect.com/science/article/abs/pii/S1352231020302740 (nur Zusammenfassung eingesehen)
- Rauigkeit der Versuchsfläche (0,001 m): https://www.icheme.org/media/11891/paper-04.pdf
