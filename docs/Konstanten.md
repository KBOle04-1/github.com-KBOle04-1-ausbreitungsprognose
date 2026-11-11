# Konstantenregister

Stand: Modellstand 0.11 vom 11.11.2026. Jede Zahl, die in eine Rechnung eingeht, ist hier mit Einheit, Fundstelle und Herkunft geführt.

Status:

- **Q** durch eine in dieser Arbeit abgerufene Quelle belegt
- **L** Literaturwert oder Literaturformel, aus dem Gedächtnis übernommen, noch nicht an der Primärquelle abgeglichen
- **E** Eigenansatz ohne Literaturbeleg
- **S** Stetigkeits- oder Nachrechnung stützt den Wert, Primärquelle nicht eingesehen

Werte mit Status L oder E gelten als unbestätigt. Sie werden paketweise abgeglichen; der Stand wird hier fortgeschrieben.

## Ausbreitung (`js/modell-ausbreitung.js`)

| Größe | Wert | Einheit | Verwendung | Herkunft | Status |
|---|---|---|---|---|---|
| Erdbeschleunigung | 9,81 | m/s² | überall | Normwert | L |
| Windprofil-Exponent Freifläche, Klassen A bis F | 0,07; 0,07; 0,10; 0,15; 0,35; 0,55 | – | Wind in Fahnenhöhe | US-EPA-Standardwerte (Irwin) | L |
| Windprofil-Exponent Bebauung | 0,15; 0,15; 0,20; 0,25; 0,30; 0,30 | – | wie oben | US-EPA-Standardwerte | L |
| Ausbreitungsparameter σy, σz | Koeffizienten in `sigma()` | m | Wolkenbreite und -höhe | Briggs (1973), Freifläche und Bebauung | L |
| Strahlungsgrenzen der Schichtung | 600; 300; 100 | W/m² | Klassen bei Tag | Zuordnung zu „stark, mäßig, schwach" nach Turner | E |
| Mischungsschicht ohne Daten, Klassen A bis D | 1500; 1200; 1000; 800 | m | Deckel | typische Werte | E |
| Übergang zur Gleichverteilung | σz > 1,6 · zi | – | Deckel | Turner, Workbook | L |
| Geländefolge der Fahnenachse | 0,5 (A bis D); 0 (E, F) | – | Auftreffen auf Gelände | Halbhöhen-Korrektur der EPA-Screeningverfahren | L |
| Mindestwind | 0,5 | m/s | Transport | Festlegung | E |
| Zeitschritt, Puffabstand | 30 | s | Transport | Festlegung | E |
| Anfangsbreite und -höhe der Wolke | 2; 1 | m | Quelle | Festlegung | E |
| Auftriebsfluss je MW konvektiver Leistung | 8,8 | m⁴/s³ | Brandüberhöhung | g/(π·cp·ρ·T) für Luft bei 20 °C | L |
| Endüberhöhung neutral/labil | 21,425·F^0,75/u; 38,71·F^0,6/u (Grenze F = 55) | m | Brandüberhöhung | Briggs | L |
| Endüberhöhung stabil | 2,6·(F/(u·s))^(1/3); dθ/dz = 0,02 (E), 0,035 (F) K/m | m | Brandüberhöhung | Briggs; Standardgradienten der EPA | L |
| Anstieg der Fahne | 1,6·F^(1/3)·x^(2/3)/u | m | Brandüberhöhung | Briggs | L |
| Auftriebsbedingte Aufweitung | Δh/3,5 | m | Wolkenbreite | EPA ISC | L |
| Konvektiver Anteil der Brandleistung | 0,7 | – | Brandüberhöhung | üblicher Richtwert | L |
| Geländewind: Umlenkanteile, Kaltluft, Abklinghöhe | 0 bis 0,8; bis 1,5 m/s; 150 m | – | nur bei Wahl „experimentell" | keine | E |
| Gewässerlenkung | 0,9; 1,4/u; 5000 m; 0,3 | – | nur bei Wahl „experimentell" | keine | E |

## Schwergas (`js/modell-schwergas.js`)

| Größe | Wert | Einheit | Herkunft | Status |
|---|---|---|---|---|
| Kurvenstücke kontinuierlich | siehe `docs/Britter-McQuaid.md` | – | abgerufene Wiedergabe der Lehrbuchtabelle | Q, ein Vorzeichen S |
| Kurvenstücke momentan, Zeilen 0,1; 0,05; 0,01; 0,005 | wie oben | – | wie oben | Q, ein Vorzeichen S |
| Kurvenstücke momentan, Zeilen 0,02; 0,002; 0,001 | wie oben | – | Crowl und Louvar | L, S |
| Schwergaskriterium kontinuierlich / momentan | 0,15 / 0,20 | – | Britter und McQuaid nach Crowl und Louvar | L |
| Grenzen kontinuierlich / momentan | 2,5 / 0,6 | – | wie oben | L |
| Gaskonstante | 8,314462 | J/(mol·K) | CODATA | L |
| Molare Masse Luft | 0,028964 | kg/mol | Normwert | L |
| Wärmekapazität Luft | 1005 | J/(kg·K) | Normwert (nur für die Dokumentation der verworfenen Variante) | L |

## Stoffdaten (`js/stoffdaten.js`)

| Stoff | Molare Masse g/mol | AEGL-1 / 2 / 3, 60 min, ppm | Siedetemperatur K | Verdampfungswärme kJ/kg | cp flüssig J/(kg·K) | Status |
|---|---|---|---|---|---|---|
| Chlor | 70,9 | 0,5 / 2 / 20 | 239,1 | 288 | 930 | L |
| Ammoniak | 17,03 | 30 / 160 / 1100 | 239,8 | 1370 | 4700 | L |
| Schwefeldioxid | 64,07 | 0,2 / 0,75 / 30 | 263,1 | 389 | 1360 | L |
| Schwefelwasserstoff | 34,08 | 0,51 / 27 / 50 | – | – | – | L |
| Chlorwasserstoff | 36,46 | 1,8 / 22 / 100 | – | – | – | L |
| Fluorwasserstoff | 20,01 | 1 / 24 / 44 | – | – | – | L |
| Cyanwasserstoff | 27,03 | 2 / 7,1 / 15 | – | – | – | L |
| Kohlenmonoxid | 28,01 | – / 83 / 330 | – | – | – | L |
| Stickstoffdioxid | 46,01 | 0,5 / 12 / 20 | – | – | – | L |
| Phosgen | 98,92 | – / 0,3 / 0,75 | – | – | – | L |
| Formaldehyd | 30,03 | 0,9 / 14 / 56 | – | – | – | L |
| Propan | 44,1 | UEG 1,7 Vol.-% | 231,0 | 426 | 2400 | L |
| Methan | 16,04 | UEG 4,4 Vol.-% | 111,7 | 510 | – | L |

Alle AEGL-Werte sind noch nicht gegen die amtliche Liste der US-Umweltbehörde abgeglichen (Paket „Toxikologie"). Ein Strich bedeutet: kein Wert hinterlegt; die zugehörige Funktion ist für den Stoff gesperrt.

## Brandrauch, Vegetationsbrand, Explosion, BLEVE

| Größe | Wert | Einheit | Datei | Herkunft | Status |
|---|---|---|---|---|---|
| Heizwert und Rußausbeute je Brandgut | 17 / 0,015; 22 / 0,05; 35 / 0,10 | MJ/kg; kg/kg | `index.html` | Größenordnung aus Brandschutzhandbüchern | E |
| Rauchstufen | 0,05; 0,5; 5 | mg/m³ | `js/app-eingabe.js` | keine | E |
| Brennstofffeuchte | Koeffizienten in `fuelMoisture()` | % | `js/modell-vegetationsbrand.js` | Simard (1968) | L |
| Feuchtefaktor | exp(−0,108·(Feuchte − 6)), höchstens 1,3 | – | wie oben | Cheney, Gould, Catchpole (1998) für Grasland; Bezug auf 6 % eigene Festlegung | L, E |
| Kopfgeschwindigkeit Gras / Vollfeuer | 0,20 / 0,10 der Windgeschwindigkeit | – | `index.html` | Faustregeln von Cruz und Alexander | L |
| Kopfgeschwindigkeit übrige Vegetation, Grundgeschwindigkeit | 0,15; 0,10; 0,03; 0,015; R0 0,005 bis 0,03 m/s | – | `index.html` | keine | E |
| Zustands- und Regenfaktoren | 1,3; 1; 0,6; 0,25 und 0,4; 0,1 | – | wie oben | keine | E |
| Länge zu Breite der Ellipse | 1 + 0,3·u, höchstens 6 | – | `js/modell-vegetationsbrand.js` | keine | E |
| Hangfaktor | exp(0,069·Neigung in Grad), begrenzt 0,3 bis 5 | – | wie oben | McArthur; Grenzen eigene Festlegung | L, E |
| Druckformel | Kinney und Graham, Koeffizienten in `blastRatio()` | – | `js/modell-explosion.js` | Kinney und Graham (1985) | L |
| Oberflächenfaktor | 1,8 | – | wie oben | üblicher Wert für Detonation am Boden | L |
| TNT-Energie | 4,6 | MJ/kg | `js/app-rechnung.js` | üblicher Wert | L |
| Energieanteile Gasexplosion | 0,03; 0,10; 0,20 | – | `index.html` | Bereich aus der Literatur, Stufen eigene Festlegung | E |
| Druckstufen | 2; 7; 20; 35; 100 | kPa | `js/app-rechnung.js` | übliche Schadenstabellen | L |
| Splitterbereich | 634·M^(1/6) | m | wie oben | UN IATG 01.80 | Q |
| Bombenmassen je Gewichtsklasse | siehe `index.html` | kg | `index.html` | Richtwerte | L |
| Feuerball | D = 5,8·M^(1/3); t = 0,45·M^(1/3) bzw. 2,6·M^(1/6); H = 0,75·D | m; s | `js/modell-explosion.js` | TNO, CCPS | L, Radius durch Transport Canada gestützt (S) |
| Abstrahlung | 0,3·M·46 MJ/kg/(π·D²·t), höchstens 350 | kW/m² | wie oben | CCPS; Strahlungsanteil fest | L |
| Durchlässigkeit der Luft | 2,02·(pw·x)^(−0,09) | – | wie oben | TNO | L |
| Wärmedosis-Stufen | 125; 250; 1000 | (kW/m²)^(4/3)·s | `js/app-rechnung.js` | britische Arbeitsschutzbehörde und Sekundärliteratur | L |
| Abstände | 4; 15 Feuerballradien, mindestens 90 m | – | wie oben | Transport Canada | Q |
| Abstand erweitert | 30 Feuerballradien | – | wie oben | Sekundärquelle | L |
| Fließgeschwindigkeit | 0,35·Q^0,25 | m/s | `js/app-rechnung.js` | keine | E |
