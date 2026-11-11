# Technischer Code-Audit der Ausbreitungsprognose (Schritt 1)

Erstellt am 11.11.2026. Reine Analyse: An den Programmdateien und am Hauptzweig wurde nichts geändert. Dieser Bericht und die Prüfskripte liegen auf dem Zweig `audit/technischer-code-audit`.

## 1. Zusammenfassung

Geprüft wurde der Stand `a0ddc46` (Modellstand 0.11). Die veröffentlichte Anwendung entspricht diesem Stand.

Die Gleichungen sind überwiegend richtig umgesetzt: Das Gauß-Modell trifft die analytische Lösung auf −11 bis +1 %, die Masse bleibt erhalten, ein Lehrbuchbeispiel zu Britter-McQuaid wird exakt getroffen. Die Anwendung ist damit rechnerisch nachvollziehbar, aber **nicht validiert** und in wesentlichen Teilen fachlich nicht tragfähig.

Kritische Befunde (können zu gravierend falschen Gefahrenprognosen führen):

| Nr. | Befund | Richtung des Fehlers |
|---|---|---|
| A-01 | Schwere giftige Gase im Fernbereich: Die „abgeleiteten" Entfernungen sind zu kurz. Gegenüber der veröffentlichten Ausgleichsgeraden der Chlor-Feldversuche liegt die Konzentration in 2 bis 11 km beim 0,10- bis 0,22-Fachen. Der Hinweis „bis zum 2,5-Fachen möglich" reicht nicht. | Gefahr unterschätzt |
| A-02 | AEGL-Bewertung ohne Zeitbezug: 60-Minuten-Werte werden mit Höchstwerten einzelner Zeitpunkte verglichen; keine Mittelung, keine Dosis, Werte nicht abgeglichen. | unbestimmt |
| A-03 | Brandrauch: Das Ergebnis hängt fast allein an der unsicheren Brandüberhöhung; gerechnet wird nur Ruß mit selbst gesetzten Stufen. | Gefahr kann unterschätzt werden |
| A-04 | Britter-McQuaid wird ohne Prüfung außerhalb seines Anwendungsbereichs gerechnet: bei 80 m Quellhöhe, bei Freisetzungsdauer 0, bei zeitlich drehendem Wind. | unbestimmt |

Weitere 10 Befunde der Stufe Hoch, 13 Mittel, 8 Niedrig (Abschnitt 9). Neu gegenüber dem bisherigen Prüfbericht sind unter anderem: stehenbleibendes altes Ergebnis nach einem Rechenfehler (A-06), Programmabbruch bei Freisetzungsrate 0 (A-07), stark überhöhte Reichweiten bei Sturm durch den festen Zeitschritt (A-08) und ein Sprung von 38 % am Deckel der Mischungsschicht (A-15).

Eignung (Begründung in Abschnitt 11):

| Verwendung | Bewertung |
|---|---|
| Ausbildung und Schulung | geeignet |
| qualitative Lageorientierung | eingeschränkt geeignet |
| überschlägige Entscheidungshilfe | nur für Teilbereiche |
| einsatzbezogene Bemessungsgrundlage | nicht geeignet |

## 2. Untersuchungsumfang

- Quellcode: `index.html` (372 Zeilen), 14 Dateien unter `js/` (1488 Zeilen), `sw.js`, `tests/modelltests.js`.
- Unterlagen: `README.md`, `docs/Pruefbericht.md`, `docs/Britter-McQuaid.md`, `docs/Konstanten.md`, `docs/Validierung.md`, `docs/Architektur.md`.
- Veröffentlichter Stand: Abruf von `js/app-qualitaet.js` und `sw.js` von der veröffentlichten Adresse.
- Prüfläufe: `tests/audit/audit_pruefungen.js` (49 Funktionstests, 5 numerische Kontrollrechnungen, 46 Validierungsszenarien), Ergebnisse in `docs/TECHNISCHER_CODE_AUDIT_Anhang.md`. Dazu neun Eingabefälle an der laufenden Oberfläche mit nachgebildeten Datenquellen.

Nicht geprüft werden konnte: das Verhalten der echten Datendienste auf dem Gerät; das Originalwerk von Britter und McQuaid (lag nicht vor); Vergleiche mit ALOHA, DEGADIS und SLAB (nicht ausführbar). Literaturangaben ohne abgerufene Quelle sind als „nicht abgeglichen" gekennzeichnet.

Zeilennummern beziehen sich auf den Stand `a0ddc46`.

## 3. Versions- und Implementierungsstand

### 3.1 Veröffentlichung

| Prüfpunkt | Ergebnis |
|---|---|
| Hauptzweig `main` | `a0ddc46` vom 11.11.2026, 17:08 |
| Zweig `gh-pages` | `a0ddc46`, identisch |
| Veröffentlichte Datei `js/app-qualitaet.js` | Modellstand „0.11 vom 11.11.2026", enthält die zuletzt geänderte Textstelle |
| Veröffentlichte Datei `sw.js` | Zwischenspeicher `ausbreitung-v12`, Dateiliste wie im Repository |
| Ergebnis | Die veröffentlichte Anwendung entspricht dem Hauptzweig. |

Aus welchem der beiden Zweige GitHub Pages ausliefert, ließ sich nicht abfragen. Da beide gleich sind, ist das für den geprüften Stand ohne Belang; künftig sollte nur ein Zweig gepflegt werden.

### 3.2 Beschriebene und tatsächlich umgesetzte Funktionen

| Funktion laut Oberfläche oder Unterlagen | Stand | Eingebunden | Anmerkung |
|---|---|---|---|
| Gauß-Puff-Modell, zeitabhängig | vollständig | ja | `trackPuffs`, `evalField` |
| Stationäre Gauß-Fahne | nicht als eigenes Modell | nur in `denseDistance` und in Tests | – |
| Zeitlicher Konzentrationsverlauf je Rasterpunkt | nicht umgesetzt | – | Gespeichert wird nur der Höchstwert je Zeitfenster |
| Schwergas nach Britter-McQuaid | vereinfachte Näherung | ja | Lehrbuch-Geradenstücke der Nomogramme, eigenes Modul; keine Gauß-Korrektur. Flächen und Fernbereich stammen aber aus dem Gauß-Modell |
| Schwergas-Einstufung | teilweise | ja | Dichte aus molarer Masse und Temperatur plus Kriterium des Workbooks; nicht mehr allein die molare Masse. Aerosol und Lufteinmischung fehlen |
| Zweiphasenfreisetzung | überwiegend Kennzeichnung | ja | Gerechnet wird nur die Dichte bei Siedetemperatur. Die Lagertemperatur ändert nur den angezeigten Verdampfungsanteil, nicht das Ergebnis |
| AEGL-Bewertung | teilweise | ja | nur 60 Minuten, Vergleich mit Höchstwerten |
| Brandrauch | vereinfachte Näherung | ja | Rußfahne; keine Brandgase |
| Toxikologische Rauchbewertung | nicht umgesetzt | – | Stufen sind selbst gesetzt |
| Fließgewässer anzeigen, Pegel | vollständig | ja | – |
| Lenkung der Wolke am Gewässer | Eigenansatz, abschaltbar | nur auf Wahl | „experimentell" beschriftet |
| Stofftransport im Gewässer | nicht umgesetzt | – | README weist darauf hin |
| Vegetationsbrand | vereinfachte Näherung | ja | Faustformeln, Ellipse; kein Rothermel, keine Landbedeckung, kein Flugfeuer |
| Druckwelle Kinney-Graham | vollständig | ja | – |
| Gasexplosion | vereinfachte Näherung | ja | TNT-Äquivalent mit festen Anteilen |
| Multi-Energy, Baker-Strehlow-Tang | nicht umgesetzt | – | nirgends behauptet |
| BLEVE Feuerball und Wärmestrahlung | vollständig | ja | feste Stoffwerte Propan |
| BLEVE Druckwelle | nicht umgesetzt | – | **`index.html` Z. 263 behauptet weiterhin, die Druckwelle werde bemessen** (A-25) |
| Geländewirkung | teilweise | ja | Halbhöhen-Korrektur, Hang beim Feuer, Sichtlinien-Schatten |
| Windlenkung durch Gelände | Eigenansatz, abschaltbar | nur auf Wahl | „experimentell" beschriftet |
| Wettermodellvergleich | vollständig | Anzeige und Warnung | geht nicht in die Rechnung ein |
| Stationsmessung DWD | vollständig | nur Anzeige | geht nicht in die Rechnung ein |
| Prognosequalität | vollständig | ja | – |
| PDF-Auswertung | vollständig | ja | – |

Weitere Abweichungen zwischen Unterlagen und Programm:

- README Z. 308 nennt den Druck bei skaliertem Abstand 10 „wie in der Literatur". Der Vergleichswert ist nicht abgeglichen.
- README Z. 255 und `index.html` Z. 346 nennen „DWD ICON-D2" als Quelle. Die Abfrage überlässt die Modellwahl dem Dienst; welches Modell geliefert wird, prüft das Programm nicht.
- `docs/Pruefbericht.md` nennt Zeilennummern des früheren Einzeldatei-Stands; sie passen nicht mehr zu den heutigen Dateien.

## 4. Softwarearchitektur

| Prüfpunkt | Befund |
|---|---|
| Struktur | Vier Modelldateien und die Stoffdaten sind frei von Zugriffen auf die Seite und ohne Browser ladbar. Neun Dateien für die Oberfläche. |
| Trennung Berechnung / Darstellung | Im Rechenkern erreicht. `js/app-rechnung.js` (391 Zeilen) mischt Eingabe, Modellwahl, Rechnung, Bilderzeugung und Textaufbereitung. |
| Datenfluss | Eingabefelder → `run()` → `runCloud` / `runVeg` / `runBlast` → Ergebnisobjekt `S.res` → `show`, `buildTable`, `makeReport`. Ein gemeinsamer Zustand `S`; `quality()` liest zusätzlich den aktuellen statt des zum Ergebnis gehörenden Geländestands (A-21). |
| Fehlerbehandlung | Ein gemeinsamer Abfangblock in `run()` (Z. 32). Nach einem Fehler bleibt das vorige Ergebnis auf Karte und in der Tabelle stehen (A-06). Ausfälle der Datendienste werden gemeldet und überbrückt. |
| Eingabeprüfung | Fehlt weitgehend. `num()` (Z. 3) nimmt jede Zahl an, auch negative (A-07). |
| Ungenutzter Code | `bmConcAt` (nur in Tests), Konstante `CP_AIR`. Die Funktionen der abgeschalteten Eigenansätze (`terrainWind`, Gewässerlenkung) sind weiter im Auslieferungsstand. |
| Doppelte Logik | Bildaufbau in `render` und `renderVeg`; Reichweitenermittlung in `analyse` und in `runVeg`; Rechenwerte in Auswahllisten der `index.html` statt in `js/stoffdaten.js`. |
| Leistung | 12 Stunden bei ± 50 km mit zwei Stoffen: rund 3 s am Prüfrechner; PDF mit 49 Karten rund 2 s. |
| Abhängigkeiten | Leaflet 1.9.4 und jsPDF 2.5.1 von einem öffentlichen Verteilserver, ohne Prüfsumme (A-30). |
| Schnittstellen | Open-Meteo, Bright Sky, Terrain Tiles, Overpass, HLNUG, Nominatim, Kartenkacheln. Keine Zugangsschlüssel. Nutzungsbedingungen sind nicht dokumentiert (A-34). |
| Sicherheit | Ein fremder Text (Stationsname) wird ungeprüft als Seiteninhalt eingesetzt (A-29). Keine Speicherung personenbezogener Daten. |
| Browser | Aktuelle Browser; ältere Geräte ohne `Promise.allSettled` oder `color-mix` sind nicht abgedeckt. |
| Tests | 49 Fälle für den Rechenkern im Repository; keine Tests für die Oberfläche, kein automatischer Lauf bei Änderungen (A-36). |

## 5. Prüfung der einzelnen Berechnungsmodelle

### 5.1 Gefahrstoffausbreitung, passiv

Formeln (`js/modell-ausbreitung.js`):

- Schichtung: `stabClass(u, rad, cloud)` Z. 10–21. Tag über Globalstrahlung (Grenzen 600, 300, 100 W/m², eigene Zuordnung), Nacht über Bewölkung. Zwischenklassen zur stabileren Seite.
- Ausbreitungsparameter: `sigma(cls, x, urban)` Z. 23–44, Briggs, x in m.
- Transport: `trackPuffs` Z. 105–141. Puffmasse m = Q·Δt mit Δt = 30 s; Wind in Höhe max(H, 10 m) über Potenzgesetz; Zuwachs der Streuung über den Laufweg.
- Bodenkonzentration je Puff: C = m / (2π·σa·σc) · exp(−a²/2σa² − c²/2σc²) · V, mit V nach `vertTerm` Z. 143–148 (Bodenreflexion, eine Spiegelung am Deckel).
- Reichweite: `axisReach` Z. 187–217, Konzentration unter den Puffmittelpunkten ohne Mindestbreite.

Bewertung:

| Punkt | Ergebnis |
|---|---|
| Einheiten | durchgängig SI; kg/m³ intern, Umrechnung ppm über Molvolumen bei Temperatur und Druck zu Ereignisbeginn. Richtig. |
| Übereinstimmung mit der Gauß-Fahne | 0,89 bis 1,01 in 1 km, alle Klassen |
| Reichweite | 0,95 bis 1,15 bei 1 bis 10 m/s. **Bei 20 m/s Faktor 2,8, an der Oberfläche bei 40 m/s 850 m statt rund 100 m** (A-08) |
| Deckel | Sprung um 38 % beim Wechsel auf Gleichverteilung (A-15) |
| Schwachwind | Wind wird auf 0,5 m/s gesetzt, keine angepasste Streuung (A-17) |
| Zeitauflösung | Je Zeitfenster Höchstwert aus drei Momentaufnahmen; kein Zeitmittel (A-20, A-02) |
| Gelände | Halbhöhen-Korrektur für erhöhte Fahnen; bodennahe Wolken sehen das Gelände nicht |
| Quellterm | Massenstrom ist Eingabe; Temperatur, Impuls, Verdampfung fehlen (A-14) |

### 5.2 Britter und McQuaid

Feststellungen zu den im Auftrag gestellten Fragen:

1. **Originalkorrelationen?** Nein, nicht nachweisbar. Umgesetzt sind die in der Lehrbuchliteratur verbreiteten Geradenstücke, die die Nomogramme des Workbooks annähern. Das Workbook lag nicht vor. Die kontinuierlichen Kurven und vier Zeilen der momentanen Kurven sind an einer abgerufenen Wiedergabe abgeglichen; drei Zeilen (0,02; 0,002; 0,001) nicht. Zwei Vorzeichen weichen von der abgerufenen Tabelle ab und sind eigene Korrekturen, begründet mit der Stetigkeit (A-05).
2. **Gauß mit Schwergaskorrektur?** Nein. Die Kennzahlen und Kurven sind eigenständig gerechnet (`bmDistance` Z. 56–82). Aber: Unterhalb des Kurvenbereichs setzt `denseDistance` (Z. 97–109) mit einer Gauß-Verdünnung fort, und alle Flächen stammen aus dem Gauß-Modell.
3. **Reichweite oder Konzentrationsfeld?** Nur Reichweiten in Windrichtung. Es gibt kein räumlich oder zeitlich aufgelöstes Schwergasfeld. Die Oberfläche sagt das zutreffend.

Kennzahlen im Programm:

| Größe | Umsetzung | Bewertung |
|---|---|---|
| g0' = g(ρ0 − ρa)/ρa | `bmInit` Z. 45–53 | richtig; ρ0 nur aus Stoff und Temperatur |
| kontinuierlich: Dc = (q0/u)^(1/2), α = log[(g0'²q0/u⁵)^(1/5)], β = log(x/Dc) | Z. 62–65 | dimensionsrichtig |
| momentan: Di = V0^(1/3), α = log[(g0'V0^(1/3)/u²)^(1/2)], β = log(x/Di) | Z. 66–70 | dimensionsrichtig |
| Schwergaskriterien 0,15 und 0,20 | Z. 22, 78 | nicht abgeglichen |
| Abgrenzung u·Rd/x ≥ 2,5 bzw. ≤ 0,6 | Z. 73–75 | nicht abgeglichen; im Übergang eigene Regel (größerer Abstand) |
| Temperaturkorrektur C* = C/[C + (1−C)·Ta/T0] | Z. 59 | durch Lehrbuchbeispiel gestützt |
| Wind | 10 m, Ereignisbeginn | richtig für das Verfahren; spätere Winddrehung bleibt unberücksichtigt |

Unzulässige Übertragungen, die das Programm nicht verhindert (A-04):

- Quelle in der Höhe: Bei 80 m Austrittshöhe wird dieselbe Schwergas-Entfernung ausgegeben wie am Boden.
- Freisetzungsdauer 0: Es werden Entfernungen ausgegeben, obwohl nichts freigesetzt wird (Regime „Übergang").
- Stabile Schichtung und Schwachwind: Die Kurven kennen keine Schichtung; bei Wind 0 rechnet das Programm mit 0,1 m/s weiter.
- Lange Freisetzung mit drehendem Wind: stationäre Schätzung mit dem Anfangswind.
- Bebauung und bewegtes Gelände: werden gerechnet und nur herabgestuft.
- Schwellen weit unter dem Kurvenbereich: werden als „abgeleitet" ausgegeben (A-01).
- Der Schwergas-Kreis wird um den Ereignisort gezogen, obwohl das Verfahren nur die Entfernung in Windrichtung liefert (A-12).

### 5.3 Thermodynamik und Flüssiggas

| Punkt | Stand |
|---|---|
| Druckgas, gasförmig | Dichte bei Umgebungstemperatur. Abkühlung bei der Entspannung fehlt. |
| Druckverflüssigt | gesamte Masse als Dampf bei Siedetemperatur. Verdampfungsanteil nur angezeigt. Abkühlung durch verdampfendes Aerosol, Tröpfchen, Ausregnen, Lache: nicht gerechnet. |
| Tiefkalt | wie oben, ohne Verdampfungsanteil |
| Austrittsimpuls | fehlt |
| Massenstrom | Eingabe; keine Leckrechnung |
| Stoffwerte | fünf Stoffe, nicht abgeglichen (A-13) |
| Lufttemperatur unter Siedetemperatur | stiller Rückfall auf „gasförmig" (A-27) |

Bewertung: Mit den vorhandenen Eingaben ist nur die Anfangsdichte belastbar bestimmbar. Eine Quelltermrechnung findet nicht statt; das Ergebnis ist so gut wie der geschätzte Massenstrom.

### 5.4 AEGL-Bewertung

- Hinterlegt sind nur 60-Minuten-Werte (`js/stoffdaten.js` Z. 4–14). 10 Minuten, 30 Minuten, 4 und 8 Stunden fehlen.
- Verglichen wird mit dem Höchstwert aus Momentaufnahmen je 15-Minuten-Fenster (`js/app-rechnung.js` Z. 87). Das ist weder eine Momentankonzentration im physikalischen Sinn (das Modell liefert Mittelwerte über die den Ausbreitungsparametern zugrunde liegende Zeit) noch ein Mittel über die AEGL-Zeit.
- Ein Zeitverlauf je Rasterpunkt wird nicht gespeichert. Für eine sachgerechte Bewertung ist er erforderlich: gleitende Mittel über die AEGL-Zeiten und eine Dosisgröße.
- Fehlende Werte sind nicht ersetzt (Kohlenmonoxid und Phosgen ohne AEGL-1). Das ist richtig.
- Kein Wert ist gegen die amtliche Liste abgeglichen.

Bewertung: fachlich nicht tragfähig (A-02, A-13).

### 5.5 Brandrauch

- Quelle: Rußstrom = Brandleistung / Heizwert × Rußausbeute (`js/app-rechnung.js` Z. 69). Einheiten richtig (MW / (MJ/kg) = kg/s). Zahlenwerte selbst gesetzt.
- Auftrieb: F = 8,8 m⁴/s³ je MW konvektiver Leistung, konvektiver Anteil 0,7. Die Zahl 8,8 folgt aus g/(π·cp·ρ·T) und ist nachgerechnet richtig.
- Überhöhung: `plumeRiseFinal` Z. 88–103; an der Nahtstelle F = 55 stetig.
- Rauchgastemperatur wird nicht gerechnet.
- Kohlenmonoxid, Cyanwasserstoff, Chlorwasserstoff, Stickoxide, Schwefeldioxid: nicht umgesetzt.

Bewertung: Das Modell ist ein einfaches Rauchfahnenmodell für Partikel. Eine toxikologische Gefahrenprognose rechtfertigt es nicht. Die Einstufung in der App sagt das; die farbigen „Stufen" legen dennoch eine Bewertung nahe (A-03).

### 5.6 Gewässer

| Punkt | Stand |
|---|---|
| Fließrichtung | Zeichenrichtung aus OpenStreetMap, ungeprüft (`js/app-rechnung.js` Z. 191) |
| Fließgeschwindigkeit | 0,35·Q^0,25, Eigenansatz (Z. 168) |
| Gewässergeometrie | Mittellinie mit festem Korridor von 60 m |
| Gaswolke über dem Gewässer | Eigenansatz, abgeschaltet |
| Eintrag, Verdünnung, gelöster Transport, Ausgasen | nicht umgesetzt |

Bewertung: Die Anzeige von Gewässern und Abfluss ist brauchbar. Jede rechnerische Wirkung ist unbelegt (A-26).

### 5.7 Vegetationsbrand

- Kopfgeschwindigkeit (R0 + k·u10) × Feuchtefaktor; Ellipse mit Länge zu Breite 1 + 0,3·u (`js/modell-vegetationsbrand.js` Z. 11–17); Hangfaktor exp(0,069·Neigung) (Z. 43).
- Die Brandellipse wird geometrisch richtig fortgeschrieben (Kopf 99 %, Halbbreite 99 % des Sollwerts).
- Brennstofffeuchte: An den Nahtstellen bei 10 % und 50 % Luftfeuchte springt der Wert um 12 % und 4 % (A-24). Ob das der Originalformel entspricht, ist nicht abgeglichen.
- Vergleich mit Rothermel: nicht möglich, Rothermel ist nicht umgesetzt. Brennstoffmenge, Brennstoffbett und Flammenlänge fehlen.
- Landbedeckung: nicht berücksichtigt. Eine landbedeckungsabhängige Rechnung wäre mit Flächennutzungsdaten aus OpenStreetMap möglich; deren Vollständigkeit wäre zu prüfen.
- Flugfeuer, Barrieren: nicht umgesetzt.

Bewertung: Schulungsmodell (A-10).

### 5.8 Gasexplosion und Druckwelle

- Druck: `blastRatio` Z. 3–5, Kinney-Graham; Oberflächenfaktor 1,8; Skalierung mit dem Luftdruck. Dimensionsrichtig.
- Gas: W = Anteil × Masse × Heizwert / 4,6 MJ/kg (`js/app-rechnung.js` Z. 251), Anteile 3, 10 und 20 %.
- Reflexion: nur über den Faktor 1,8. Beugung: nicht. Abschirmung: Sichtlinie auf 30-m-Höhendaten, Ja/Nein.
- Laufzeit mit Schallgeschwindigkeit (Z. 222): obere Grenze.
- Suchbereich in `blastRadius` endet stillschweigend bei skaliertem Abstand 5000 (A-23).

Bewertung: Für kondensierte Sprengstoffe als Überschlag brauchbar. Für Gaswolken sind feste Energieanteile wissenschaftlich nicht begründet; maßgeblich sind Hindernisdichte und Verdämmung, die das Verfahren nicht kennt. Multi-Energy und Baker-Strehlow-Tang wären geeignet, sind aber nicht umgesetzt (A-11).

### 5.9 BLEVE

- D = 5,8·M^(1/3); t = 0,45·M^(1/3) bis 30 t, darüber 2,6·M^(1/6) (Sprung 3,6 % an der Nahtstelle, in den Formeln angelegt); H = 0,75·D (`js/modell-explosion.js` Z. 24–31).
- Abstrahlung 0,3·M·46 MJ/kg/(π·D²·t), höchstens 350 kW/m²: Strahlungsanteil und Heizwert fest.
- Wärmedosis 125 / 250 / 1000 (kW/m²)^(4/3)·s: nicht abgeglichen.
- Fragmentflug: keine Rechnung; Richtwerte 4, 15, 30 Feuerballradien.
- Feuerballradius und der Abstand für Einsatzkräfte stimmen mit den Angaben von Transport Canada auf 3 bis 4 % überein.

Bewertung: Der thermische Teil ist der am besten gestützte Teil der Anwendung. Die Richtwerte gelten für Flüssiggasbehälter und sind als solche beschriftet.

### 5.10 Meteorologie und Gelände

| Punkt | Stand |
|---|---|
| Wetterdaten | Vorhersage eines Punktes, 15-Minuten-Werte; gilt für das ganze Gebiet bis ± 50 km (A-09) |
| DWD-Messung | nur Anzeige |
| Aktualisierung | 10 Minuten Zwischenspeicher; Alter der Vorhersage wird nicht angezeigt |
| Schichtung | Näherung; ungültige Eingaben ergeben stillschweigend Klasse D (A-16) |
| Windrichtung | eine Achse, kein Unsicherheitssektor, obwohl fünf Modelle abgefragt werden (A-09) |
| Geländehöhen | rund 30 m Auflösung, Oberflächenmodell |
| Rauigkeit | nur über „Freifläche / Bebauung" |
| Lokale Strömung | nicht gerechnet |

Bewertung: Die Daten rechtfertigen die dargestellte räumliche Schärfe (Rasterweite ab 2 m, Kreise mit Meterangabe) nicht. Die Rundung der Zahlen mildert das; die Kartendarstellung bleibt schärfer, als es die Eingangsdaten erlauben.

## 6. Mathematische Prüfung

Ergebnisse der 49 Funktionstests (Anhang A): 37 bestanden, 12 nicht bestanden.

| Funktion | Fall | Ergebnis | Einordnung |
|---|---|---|---|
| `stabClass` | ungültige Eingaben | Klasse D ohne Hinweis | A-16 |
| `vertTerm` | Nahtstelle σz = 1,6·zi | Faktor 1,38 | A-15 |
| `trackPuffs` | negative Rate | negative Konzentration | A-07 |
| `bmInit` | Luft kälter als Siedepunkt | stiller Rückfall | A-27 |
| `bmInit` | molare Masse 0, Druck 0 | Dichte 0 ohne Abweisung | A-27 |
| `bmDistance` | Rate 0 | Programmabbruch | A-07 |
| `bmDistance` | Wind 0 | NaN | A-07 |
| `fuelMoisture` | Nahtstellen | Sprünge 12 % und 4 % | A-24 |
| `blastRadius` | sehr kleiner Druck | Suchgrenze 30 km ohne Hinweis | A-23 |
| `bleve` | 30 t | Sprung 3,6 % | in den Formeln angelegt |
| `bleve` | Masse 0 | NaN | an der Oberfläche abgefangen |

Numerische Kontrollrechnungen (Anhang B):

| Prüfung | Ergebnis |
|---|---|
| Zeitschritt 30 s, Reichweite gegen analytische Lösung bei 1 / 3 / 10 / 20 m/s | 0,97 / 0,96 / 1,15 / 2,76 |
| Deckel, Sprung an der Nahtstelle | 37,5 % |
| Kartenüberlagerung ± 50 km, 50° N | bis 234 m Versatz in der Bildmitte |
| 111 320 m je Grad | Abweichung 0,08 % (Breite), 0,2 % (Länge) |

Weitere Feststellungen:

- Division durch null: im Rechenkern durch Mindestwerte abgefangen (Wind 0,5 m/s, Streuung 0,5 m), nicht aber in `bmDistance` und `bleve`.
- Vorzeichen: Windrichtung (aus → nach), Nord-Süd-Ausrichtung der Bilder und die Drehung des Windpfeils sind geprüft und richtig.
- Interpolation: Die Flächen entstehen durch bilineare Einpassung der Rasterwerte und anschließenden Schwellenvergleich. Bei steilen Gradienten verschiebt das die Grenze um bis zu eine halbe Rasterweite.
- Rundung: Zwischenergebnisse in 32-Bit-Gleitkomma; ein dadurch verursachter Fehler im Brandmodell wurde früher behoben und ist durch einen Test abgedeckt.

## 7. Validierungsergebnisse

Bewertungsmaßstab, vor der Auswertung festgelegt: analytische Lösung ± 15 % (Konzentration) bzw. ± 20 % (Reichweite); Lehrbuchbeispiel ± 5 %; Versuchsdaten Faktor 2; veröffentlichte Ausgleichsgerade Faktor 4; Richtwerte ± 10 %.

46 Szenarien (Anhang C): 26 bestanden, 6 nicht bestanden, 14 nicht prüfbar.

| Bereich | bestanden | nicht bestanden | nicht prüfbar |
|---|---|---|---|
| Gauß, passiv | 9 | 0 | 2 (ALOHA, Feldversuch) |
| Schwergas | 12 | 6 | 3 (DEGADIS, SLAB, Originalnomogramme) |
| Toxikologie | 0 | 0 | 1 |
| Brandrauch | 0 | 0 | 2 |
| Vegetationsbrand | 0 | 0 | 2 |
| Explosion | 1 | 0 | 2 |
| BLEVE | 4 | 0 | 1 |
| Gewässer | 0 | 0 | 1 |

Nicht bestanden:

| Nr. | Szenario | Modell | Referenz | Verhältnis |
|---|---|---|---|---|
| S16 | Jack Rabbit II, Versuch 7: Entfernung für 340 ppm | 1,96 km | 5 km | 0,39 |
| S17 | Versuch 7: Entfernung für 50 ppm | 4,46 km | 11 km | 0,41 |
| S22 | Versuch 9: Entfernung für 100 ppm | 4,24 km | 11 km | 0,39 |
| S25 | Versuch 6: Konzentration in 2 km gegen Ausgleichsgerade | 256 ppm | 1170 ppm | 0,22 |
| S26 | Versuch 6: Konzentration in 5 km | 35 ppm | 254 ppm | 0,14 |
| S27 | Versuch 6: Konzentration in 11 km | 7 ppm | 68 ppm | 0,10 |

Alle sechs betreffen den „abgeleiteten" Fernbereich schwerer Gase und zeigen in dieselbe Richtung: zu niedrige Konzentration, zu kurze Entfernung.

Fehlermaße für die 12 Wertepaare Jack Rabbit II (Entfernung Modell zu Messbogen): geometrisches Mittel 0,69; geometrische Varianz 1,41; 75 % innerhalb des Faktors 2; mittlere quadratische Abweichung im Logarithmus 0,58.

Einschränkungen der Vergleiche:

- Die Messwerte und die Ausgleichsgerade beschreiben Sekundenspitzen; das Modell rechnet Mittelwerte. Ein Teil der Abweichung ist dadurch erklärt, nicht der Faktor 5 bis 10.
- Für die Versuche 6, 7 und 9 ist die Schichtung nicht veröffentlicht; angenommen wurde Klasse D.
- Die bestandenen Gauß-Szenarien belegen die richtige Umsetzung der Gleichung, nicht deren Gültigkeit in der Natur.
- Kein Szenario vergleicht mit ALOHA, DEGADIS, SLAB, Rothermel, Multi-Energy oder einem CCPS-Beispiel. Diese Vergleiche sind als „nicht prüfbar" geführt.

## 8. Karten- und Geodatenprüfung

| Prüfpunkt | Befund |
|---|---|
| Koordinatensystem | Eingabe und Karte in geografischen Koordinaten (WGS 84), Kartenprojektion Web-Mercator. Rechnung in einem örtlichen Meterraster um den Ereignisort. |
| Umrechnung Meter ↔ Grad | 111 320 m je Grad und Kosinus der Breite (`js/app-rechnung.js` Z. 364, `js/app-gelaende.js` Z. 12). Fehler bis 0,2 %, bei 50 km rund 100 m. |
| Lage der Flächen | Die Bilder werden zwischen den Eckpunkten linear gestreckt, die Karte ist in der Breite nicht linear. Versatz bis 234 m bei ± 50 km, unter 3 m bei ± 5 km (A-18). |
| Entfernungen | im Meterraster; richtig |
| Rasterweite | 1/120 bis 1/240 der Gebietsbreite, innen achtfach feiner |
| Schwellenwertdarstellung | bilinear eingepasste Rasterwerte, harte Schwelle; keine Darstellung der Unsicherheit |
| Ausrichtung | Windrichtung, Nordrichtung, Pfeil: richtig (geprüft mit Wind aus West, Wolke nach Ost) |
| Zeitliche Entwicklung | je Zeitfenster eigenes Bild; richtig zugeordnet |
| Kreise | Radius = größte Entfernung einer Überschreitung; beim Schwergas Radius = Entfernung in Windrichtung, als Vollkreis gezeichnet (A-12) |
| Herkunft der Flächen | Gefahrstoff, Rauch, Feuer: aus den Rasterwerten der Rechnung. Blast-Cast: Kreise aus den berechneten Radien. Schwergas: keine Fläche, nur Kreis. Es gibt keine frei gezeichneten Flächen. |
| Genauigkeit | Die Darstellung ist schärfer als die Eingangsdaten (ein Wetterpunkt, Höhen mit 30 m). |

## 9. Fehler- und Schwachstellenverzeichnis

Prioritäten: **Kritisch** (kann zu gravierend falschen Gefahrenprognosen führen), **Hoch** (wesentliche fachliche oder mathematische Einschränkung), **Mittel** (Genauigkeit oder Funktion eingeschränkt), **Niedrig** (Dokumentation, Bedienung, Wartbarkeit).

### Kritisch

| Nr. | Datei, Funktion, Zeile | Aktuelle Umsetzung | Problem | Auswirkung | Empfohlene Korrektur |
|---|---|---|---|---|---|
| A-01 | `js/modell-schwergas.js`, `denseDistance`, Z. 97–109 | Unter dem Kurvenbereich wird die Wolke wie eine passive Gauß-Wolke weiter verdünnt | Gegenüber Chlor-Feldversuchen 5- bis 10-fach zu niedrige Konzentration in 2 bis 11 km | AEGL-Entfernungen für schwere giftige Gase um den Faktor 2,5 bis 4 zu kurz | Dynamisches Schwergasmodell; bis dahin abgeleitete Entfernungen nicht als Zahl ausgeben oder durch eine belegte obere Abschätzung ersetzen |
| A-02 | `js/app-rechnung.js`, `runCloud`, Z. 87; `js/stoffdaten.js`, Z. 4–14 | Höchstwert aus Momentaufnahmen gegen AEGL 60 Minuten | Kein Zeitmittel, keine Expositionsdauer, nur eine Zeitstufe, Werte nicht abgeglichen | Bewertung nicht normgerecht, Richtung unbestimmt | Zeitverlauf je Rasterpunkt, gleitende Mittel je AEGL-Zeit, amtliche Tabellen mit Quelle |
| A-03 | `js/modell-ausbreitung.js`, `plumeRiseFinal`, Z. 88–103; `js/app-rechnung.js`, Z. 69; `js/app-eingabe.js`, Z. 8 | Rußfahne mit Punktquelle, Wind in 10 m, eigene Stufen | Überhöhung entscheidet allein; keine Brandgase | „Nicht erreicht" kann falsch sein | Bandbreite der Überhöhung rechnen und zeigen; Stufen entfernen oder durch belegte Bewertung ersetzen |
| A-04 | `js/app-rechnung.js`, `runCloud`, Z. 54–55; `js/modell-schwergas.js`, `bmDistance`, Z. 72–75 | Britter-McQuaid für jede Eingabe | Keine Prüfung von Quellhöhe, Freisetzungsdauer, Windgrenzen | Entfernungen für Fälle, für die das Verfahren nicht gilt | Anwendungsgrenzen prüfen und die Rechnung sperren; Dauer 0 abweisen |

### Hoch

| Nr. | Datei, Funktion, Zeile | Aktuelle Umsetzung | Problem | Auswirkung | Empfohlene Korrektur |
|---|---|---|---|---|---|
| A-05 | `js/modell-schwergas.js`, `BM_PLUME`, `BM_PUFF`, Z. 7–21 | Geradenstücke aus Lehrbuchwiedergabe | Drei Zeilen nicht abgeglichen, zwei Vorzeichen eigene Korrektur, Workbook nicht eingesehen | Kurven können vom Original abweichen | Abgleich am Workbook; bis dahin als „Näherung, nicht abgeglichen" beschriften |
| A-06 | `js/app-rechnung.js`, `run`, Z. 7–34 | Bei Fehler nur Statuszeile | Voriges Ergebnis bleibt auf Karte, in Tabelle und für das PDF stehen | Altes Ergebnis wird für das neue gehalten | Ergebnis zu Beginn jeder Rechnung löschen |
| A-07 | `js/app-rechnung.js`, `num`, Z. 3; `js/modell-schwergas.js`, Z. 72 | jede Zahl wird angenommen | Rate 0 oder negativ führt zum Abbruch; negative Rate ergibt negative Konzentrationen; Schwellen in falscher Reihenfolge werden angenommen | Fehlbedienung bleibt unbemerkt | Wertebereiche je Feld prüfen, verständliche Meldung |
| A-08 | `js/modell-ausbreitung.js`, `trackPuffs`, Z. 106; `axisReach`, Z. 211 | fester Zeitschritt 30 s, Einpassung zwischen Puffs | Bei starkem Wind liegen die Puffs weiter auseinander als die Zone lang ist | Reichweite bei 20 m/s 2,8-fach, bei 40 m/s rund 8-fach zu groß | Puffabstand an Wind und Streuung koppeln oder Nahbereich analytisch rechnen |
| A-09 | `js/app-wetter.js`, `wxAt`, Z. 41–68; `js/app-rechnung.js`, Z. 40 | ein Wetterpunkt, eine Windrichtung | kein Unsicherheitssektor, kein Windfeld | eine scharfe Fahnenachse täuscht Sicherheit vor | Sektor aus Modellstreuung und Böen; Szenarien |
| A-10 | `js/modell-vegetationsbrand.js`, `rosParams`, Z. 11–17; `index.html`, Z. 270 ff. | Faustformeln, überall brennbar | kein Brennstoffmodell, keine Landbedeckung, kein Flugfeuer | Geschwindigkeit und Fläche um den Faktor 2 bis 3 unsicher; Feuer läuft über Sperren | Rothermel mit Brennstoffmodellen; Landbedeckung als Sperr- und Brennstoffkarte |
| A-11 | `index.html`, Z. 225; `js/app-rechnung.js`, Z. 251 | feste Energieanteile 3 / 10 / 20 % | wissenschaftlich nicht als allgemeine Werte begründbar | Druckzonen je nach Wahl um ein Mehrfaches verschieden | Verfahren mit Hindernisdichte und Verdämmung; Spannweite ausgeben |
| A-12 | `js/app-rechnung.js`, `cloudPost`, Z. 104; `render`, Z. 132 | Schwergas als Vollkreis; Flächen aus Gauß | Kreis unterstellt alle Richtungen; Flächen für schwere Gase zu schmal | Fehldeutung der Karte | Sektor in Windrichtung statt Kreis; Gauß-Flächen bei Schwergas abgesetzt darstellen |
| A-13 | `js/stoffdaten.js`, Z. 4–16 | AEGL-, Stoff- und Siededaten aus dem Gedächtnis | nicht abgeglichen | einzelne Werte können falsch sein | Abgleich mit amtlichen Quellen, Quelle je Wert |
| A-14 | `js/modell-schwergas.js`, `bmInit`, Z. 45–53; `js/app-eingabe.js`, Z. 25 | nur Anfangsdichte; Lagertemperatur nur Anzeige | kein Quellterm; Eingabefeld ohne Wirkung auf das Ergebnis | Ergebnis hängt am geschätzten Massenstrom; Feld täuscht Einfluss vor | Quelltermmodul oder Feld als „nur Anzeige" kennzeichnen |

### Mittel

| Nr. | Datei, Funktion, Zeile | Aktuelle Umsetzung | Problem | Auswirkung | Empfohlene Korrektur |
|---|---|---|---|---|---|
| A-15 | `js/modell-ausbreitung.js`, `vertTerm`, Z. 143–148 | eine Spiegelung, ab σz > 1,6·zi Gleichverteilung | Sprung um 38 % | unstetige Konzentration im Fernbereich | Spiegelreihe vervollständigen oder stetig überblenden |
| A-16 | `js/modell-ausbreitung.js`, `stabClass`, Z. 10–21; `js/app-wetter.js`, Z. 55 | eigene Strahlungsgrenzen; ungültige Werte ergeben D | Näherung; fehlende Daten bleiben unbemerkt | Schichtung um eine Klasse falsch möglich | Verfahren mit Quelle festlegen; fehlende Daten melden |
| A-17 | `js/modell-ausbreitung.js`, `trackPuffs`, Z. 108, 118 | Mindestwind 0,5 m/s | kein Schwachwindansatz | unter 1 m/s nicht gültig | eigenes Verfahren oder Kreis um den Ort |
| A-18 | `js/app-rechnung.js`, `boundsOf`, Z. 364; `js/app-anzeige.js` | Bild linear zwischen den Ecken gestreckt | Mercator ist in der Breite nicht linear | bis 234 m Versatz bei ± 50 km | Bild im Mercator-Raster erzeugen oder Gebiet teilen |
| A-19 | `js/modell-ausbreitung.js`, `evalField`, Z. 162; `js/app-rechnung.js`, `analyse`, Z. 115 | Mindestbreite halbe Rasterweite | Fläche im Außenraster nahe der Quelle zu breit und zu dünn | Flächenangaben ungenau | Flächen aus feinerem Raster oder analytisch |
| A-20 | `js/app-rechnung.js`, Z. 87 | Höchstwert aus Aufnahmen alle 5 Minuten | Durchzug zwischen den Aufnahmen bleibt unberücksichtigt | Zone im Zeitfenster kann fehlen | dichtere Abtastung, Zeitmittel |
| A-21 | `js/modell-explosion.js`, `blastShadow`, Z. 14–22; `js/app-qualitaet.js`, Z. 37 | Sichtlinie Ja/Nein auf 30-m-Daten; Einstufung liest aktuellen Geländestand | keine Beugung; Zuordnung zum Ergebnis nicht gesichert | Schatten im Maßstab der Druckzonen kaum aussagekräftig | als qualitativ kennzeichnen; Geländestand am Ergebnis speichern |
| A-22 | `js/modell-explosion.js`, `bleve`, Z. 24–31; `js/app-rechnung.js`, Z. 231 | feste Stoffwerte, feste Dosisstufen | Stoff- und Druckabhängigkeit fehlt, Stufen nicht abgeglichen | Wärmezonen etwa ± 25 % | Stoffwahl, Quellen der Stufen |
| A-23 | `js/modell-explosion.js`, `blastRadius`, Z. 9; `js/app-rechnung.js`, Z. 209–222 | Suchgrenze 5000; Laufzeit mit Schallgeschwindigkeit; Stufen ohne Impuls | stiller Abbruch; Laufzeit zu lang; Wirkung hängt auch vom Impuls ab | Angaben nur Anhalt | Grenzen melden; Laufzeit als Obergrenze beschriften |
| A-24 | `js/modell-vegetationsbrand.js`, `fuelMoisture`, Z. 3–9 | drei Abschnitte | Sprünge 12 % und 4 % an den Nahtstellen; Koeffizienten nicht abgeglichen | Feuchte und damit Geschwindigkeit springen | Abgleich mit der Quelle |
| A-25 | `index.html`, Z. 263; `README.md`, Z. 308 | Text: Druckwelle wird bemessen; „wie in der Literatur" | stimmt nicht mit dem Programm bzw. ist nicht belegt | falsche Erwartung | Texte berichtigen |
| A-26 | `js/modell-ausbreitung.js`, `terrainWind`, Z. 70–86, Z. 121–128; `js/app-rechnung.js`, Z. 168, 191 | Eigenansätze wählbar | kein Literaturbeleg; Fließrichtung ungeprüft | bei Wahl unbelegte Lenkung der Wolke | aus dem Auslieferungsstand entfernen oder in eine Versuchsfassung auslagern |
| A-27 | `js/modell-schwergas.js`, `bmInit`, Z. 46–52 | Rückfall auf „gas" ohne Hinweis; keine Prüfung von Masse und Druck | Eingabe und Rechnung weichen still voneinander ab | Nutzer rechnet anderes als gewählt | Hinweis ausgeben; Eingaben prüfen |

### Niedrig

| Nr. | Datei, Zeile | Befund | Empfohlene Korrektur |
|---|---|---|---|
| A-29 | `js/app-wetter.js`, Z. 119 | Stationsname aus fremdem Dienst wird als Seiteninhalt eingesetzt | als reinen Text einsetzen |
| A-30 | `index.html`, Z. 14, 354; `js/app-bericht.js` | Bibliotheken ohne Prüfsumme von einem Verteilserver | Prüfsumme angeben oder Dateien selbst ausliefern |
| A-31 | `js/modell-schwergas.js`, Z. 24, 84; `js/app-rechnung.js` | ungenutzte Funktion und Konstante; doppelte Logik | bereinigen |
| A-32 | `js/app-rechnung.js`; `index.html` | Ablauf, Rechnung und Aufbereitung vermischt; Rechenwerte in Auswahllisten | trennen; Werte in die Stoffdaten |
| A-33 | `README.md`, Z. 255; `js/app-wetter.js` | Modellname behauptet, nicht geprüft; Alter der Vorhersage fehlt | geliefertes Modell und Zeitstempel anzeigen |
| A-34 | Unterlagen | Nutzungsbedingungen der Datendienste nicht dokumentiert | prüfen und festhalten |
| A-35 | `docs/Pruefbericht.md` | Zeilennummern des alten Stands | Stand kennzeichnen |
| A-36 | `tests/` | keine Tests der Oberfläche, kein automatischer Lauf | ergänzen |

Die Nummer A-28 ist nicht vergeben: Der vermutete Sprung zwischen „berechnet" und „abgeleitet" an der letzten Kurve hat sich im Test nicht bestätigt (Verhältnis nahe 1).

## 10. Handlungsempfehlungen

In dieser Reihenfolge:

1. **Sofort, ohne neue Modelle:** A-06 (altes Ergebnis löschen), A-07 (Eingaben prüfen), A-04 (Anwendungsgrenzen von Britter-McQuaid sperren), A-25 (Texte berichtigen), A-01 vorläufig (abgeleitete Schwergas-Entfernungen nicht mehr als Zahl ausgeben).
2. **Rechenkern:** A-08 (Zeitschritt), A-15 (Deckel), A-20 (Abtastung), A-19 und A-18 (Flächen und Lage).
3. **Toxikologie:** A-02, A-13 mit amtlichen Tabellen und Zeitverlauf je Rasterpunkt.
4. **Schwergas:** A-05 am Workbook abgleichen; für A-01 ein dynamisches Modell oder eine belegte obere Abschätzung.
5. **Meteorologie:** A-09, A-16, A-17, A-33.
6. **Brandrauch, Vegetationsbrand, Explosion, BLEVE:** A-03, A-10, A-11, A-22, A-23, A-24.
7. **Bereinigung:** A-26, A-29 bis A-36.

Vor jeder Änderung den Bewertungsmaßstab der zugehörigen Tests festlegen; nicht bestandene Fälle bleiben im Prüflauf sichtbar.

## 11. Gesamtbewertung

| Verwendung | Bewertung | Begründung |
|---|---|---|
| Ausbildungs- und Schulungswerkzeug | geeignet | Zusammenhänge (Wind, Schichtung, Menge, Gelände) werden richtig und anschaulich wiedergegeben; Grenzen sind benannt. Voraussetzung: Hinweis, dass die Zahlen keine Bemessungswerte sind. |
| Qualitative Lageorientierung | eingeschränkt geeignet | Ausbreitungsrichtung, Größenordnung und zeitliche Abfolge für passive Gase sind brauchbar, solange das Wetter des Punktes gilt. Nicht für Brandrauch am Boden, nicht für den Fernbereich schwerer Gase. |
| Überschlägige Entscheidungshilfe | nur für Teilbereiche | Brauchbar: passive Gase bis etwa 10 km in ebenem Gelände bei Wind zwischen 1 und 10 m/s; Feuerball und Wärmezonen beim BLEVE; Druckzonen kondensierter Sprengstoffe. Nicht brauchbar: schwere giftige Gase unterhalb von rund 2000 ppm, Brandrauch, Vegetationsbrand, Gaswolkenexplosion. |
| Einsatzbezogene Bemessungsgrundlage | nicht geeignet | Kein Teilmodell ist validiert; die toxikologische Bewertung ist nicht normgerecht; wesentliche Stoff- und Modelldaten sind nicht abgeglichen. |

Einordnung der Funktionen:

| Einstufung | Funktionen |
|---|---|
| Rechnerisch belastbar umgesetzt, fachlich als Überschlag verwendbar | Gauß-Puff-Modell für passive Gase im genannten Bereich; BLEVE-Feuerball mit Wärmestrahlung und Richtwerten; Druckwelle kondensierter Sprengstoffe; Splitterbereich nach UN-Faustformel |
| Nur eingeschränkt verwendbar | Britter-McQuaid innerhalb der Kurven (über rund 2000 ppm, ebenes Gelände, Bodenquelle); Geländewirkung; Wettermodellvergleich; Vegetationsbrand als Richtungs- und Größenordnungsanzeige; Gasexplosion als Spannweite |
| Vor fachlicher Nutzung grundlegend zu überarbeiten | Schwergas-Fernbereich; AEGL-Bewertung; Brandrauch einschließlich Brandgasen; Quellterm und Zweiphasenfreisetzung; Gewässerwirkung; Vegetationsbrand mit Brennstoff und Landbedeckung; Gaswolkenexplosion |

## Quellen der in diesem Audit verwendeten Vergleichsdaten

- Kurventabellen Britter-McQuaid (Wiedergabe): https://oaktrust.library.tamu.edu/server/api/core/bitstreams/634efe48-8615-42f1-9cc6-0884b5f602df/content
- Versuchstabelle und Ausgleichsgerade Jack Rabbit II: https://harmo.org/Conferences/Proceedings/_Bologna/publishedSections/H18-071-Hanna.pdf
- Messwerte je Messbogen: https://www.cisa.gov/sites/default/files/publications/2019-CSSS-Jack-Rabbit-II-Update-508.pdf
- Rauigkeit der Versuchsfläche: https://www.icheme.org/media/11891/paper-04.pdf
- Feuerballradien und Abstände: https://tc.canada.ca/en/dangerous-goods/bleve-response-prevention
