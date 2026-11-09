# Ausbreitungsprognose Gefahrstoff und Brandrauch

Web-App für iPhone und iPad. Sie schätzt ab, wohin sich ein gasförmiger Gefahrstoff oder eine Rauchgaswolke ausbreitet, und zeigt das Ergebnis in Zeitfenstern von je 15 Minuten auf der Karte.

**Nur Orientierungshilfe.** Das Ergebnis ersetzt keine Messungen vor Ort, keine Fachberatung (z. B. TUIS, Fachberater Chemie) und keine zugelassenen Programme.

App öffnen: https://kbole04-1.github.io/github.com-KBOle04-1-ausbreitungsprognose/

## Auf dem iPhone einrichten

1. Adresse oben in Safari öffnen.
2. Teilen-Symbol antippen, dann „Zum Home-Bildschirm" und „Hinzufügen".
3. Die App startet danach im Vollbild über ihr eigenes Symbol.
4. Beim ersten Tippen auf „Mein Standort" den Standortzugriff erlauben.

Für Wetter, Höhendaten und Karten ist eine Internetverbindung nötig. Nach einer Aktualisierung die App einmal schließen und neu öffnen.

## Bedienung in Kurzform

1. **Freisetzungsort** wählen: Karte antippen, Adresse suchen oder „Mein Standort". Die Markierung lässt sich verschieben.
2. **Szenario** wählen und Mengen eintragen (siehe unten).
3. **Zeit und Wetter** prüfen. Voreingestellt ist „jetzt" mit der aktuellen Vorhersage.
4. **Prognose berechnen** antippen.
5. Mit Schieberegler, Pfeiltasten oder „Abspielen" durch die Zeitfenster gehen. Die erste Stellung „Gesamtbereich" zeigt alles, was im gesamten Zeitraum betroffen ist.

Die **Zeittabelle** listet für jedes Zeitfenster Wind, Schichtung und Reichweite je Schwelle. Reichweite ist die größte Entfernung vom Freisetzungsort, in der die Schwelle überschritten wird.

## Die drei Szenarien

### Gefahrstoff

- Stoffauswahl mit hinterlegten AEGL-Werten (60 Minuten), Propan und Methan mit Bezug auf die untere Explosionsgrenze, dazu „Eigener Stoff".
- **Kontinuierlich:** Austrittsrate in kg/min und Dauer. **Schlagartig:** Gesamtmasse in kg.
- Darstellung: gelb, orange, rot für Schwelle 1 bis 3.

### Brandrauch

- Brandleistung in MW (Voreinstellungen von Pkw bis Industrie-Großbrand), Brandfläche, Branddauer, Brandgut.
- Der heiße Rauch steigt auf. Bei großen Bränden kann die Fahne über den Nahbereich hinwegziehen und erst weiter entfernt oder an höherem Gelände den Boden erreichen.
- Die Schwellen für Rauchpartikel sind Orientierungswerte und keine amtlichen Grenzwerte: Stufe 1 Geruch und Belästigung, Stufe 2 Fenster und Türen schließen, Stufe 3 dichte Verrauchung.

### Kombiniert

- Gefahrstoff und Brandrauch werden vom selben Ort aus gerechnet und gemeinsam gezeigt: Gefahrstoff als Farbfläche, Brandrauch schraffiert darüber.
- Zeitleiste und Zeittabelle zeigen beide getrennt.
- Häkchen **„Stoff wird im Brand freigesetzt und steigt mit dem Rauch auf"**:
  - gesetzt: Der Stoff steigt mit dem Brandrauch auf (z. B. brennendes Gefahrstofflager).
  - nicht gesetzt: Der Stoff tritt bodennah neben dem Brand aus (z. B. Leck). Das ergibt meist deutlich größere Reichweiten am Boden.

## Topographie

Das Gelände geht in die Rechnung ein, als vereinfachte Korrektur und nicht als Strömungssimulation:

- **Umlenkung:** Hänge lenken den Wind um, bei stabiler Schichtung stark, bei labiler kaum.
- **Kaltluftabfluss:** Bei stabiler Schichtung und schwachem Wind fließt die Luft hangabwärts.
- **Schwergas:** Schwere Gase wie Chlor fließen zusätzlich hangabwärts.
- **Auftreffen:** Eine aufgestiegene Fahne trifft auf höher gelegenes Gelände.

Unter jedem Ergebnis steht „Gelände: berücksichtigt" oder „nicht berücksichtigt". Mit dem Häkchen „Gelände (Topographie) berücksichtigen" lässt es sich abschalten, um den Unterschied zu vergleichen. Unter „Freisetzungsort" stehen nach der Rechnung die Höhe des Ortes und die Höhenspanne im Rechengebiet.

## Bebauung oder Freifläche

Die Einstellung legt fest, wie stark die Luft verwirbelt wird.

| | Freifläche | Bebauung |
|---|---|---|
| Gedacht für | Felder, Wiesen, Wald, einzelne Gebäude | Ortslage, Stadt, Gewerbegebiet |
| Wolke | schmal, bodennah konzentriert | breiter, höher durchmischt |
| Reichweite bei bodennaher Freisetzung | größer | kürzer |

Beispiel Chlor, 30 kg/min, Wind 3 m/s, neutrale Schichtung, ohne Gelände: AEGL-2 reicht auf Freifläche bis 1,9 km, in Bebauung bis 670 m.

- **Bodennahe Freisetzung:** Im Zweifel „Freifläche" wählen, sie ergibt die größere Reichweite.
- **Aufsteigende Rauchfahne:** Hier kann es umgekehrt sein. Im Test mit 100 MW erreichte der Rauch den Boden bei „Bebauung" bis 2,6 km, bei „Freifläche" nur im Nahbereich. Bei Brandrauch beide Einstellungen rechnen.
- Straßenschluchten, Stau hinter Gebäuden und das Eindringen in Häuser sind nicht erfasst.

## Wetter

- **Vorhersage:** Open-Meteo mit 15-Minuten-Werten (in Mitteleuropa DWD ICON-D2): Wind, Böen, Temperatur, Strahlung, Bewölkung, Niederschlag.
- **Messung:** Zum Vergleich wird die aktuelle Messung der nächsten DWD-Station angezeigt.
- **Von Hand:** Für Messungen vor Ort oder Übungen lassen sich Windrichtung, Windstärke, Schichtung und Temperatur vorgeben. Sie gelten dann für alle Zeitfenster.
- **Schichtung:** Klassen A (sehr labil) bis F (sehr stabil), bestimmt aus Wind, Strahlung und Bewölkung. Stabile Schichtung (klare, windschwache Nacht) bedeutet schmale Wolke und große Reichweite.
- Der Ereignisbeginn kann zwischen gestern und übermorgen liegen.

## Warnhinweise der App

| Hinweis | Was zu tun ist |
|---|---|
| Gefahrenzone erreicht den Rand | Rechengebiet vergrößern |
| Keine Schwelle überschritten | Fahne kann über das Gebiet hinwegziehen; größeres Rechengebiet prüfen |
| Schwergas | Senken, Keller und Täler gesondert betrachten; Nahbereich ist unterschätzt |
| Schwachwind unter 1 m/s | Gefahrenbereich kreisförmig annehmen |
| Niederschlag | Auswaschung ist nicht berücksichtigt |
| Starke Böen | Seitliche Zonen großzügiger ansetzen |
| Ohne Geländeeinfluss | Höhendaten fehlten oder Gelände war abgeschaltet |

## Grenzen

- Schwergase und Aerosole im Nahbereich, chemische Umwandlung, Niederschlag, Gebäudeumströmung und kleinräumige Talwinde sind nicht oder nur grob erfasst.
- Die Wettervorhersage kann vom tatsächlichen Wind am Ort abweichen. Weicht die Stationsmessung oder eine eigene Messung deutlich ab, das Wetter von Hand vorgeben.
- Die hinterlegten AEGL-Werte vor Verwendung mit der aktuellen AEGL-Liste abgleichen.
- Die Brandwerte (Brandleistung, Rußausbeute) sind grobe Richtwerte.
- Die Auflösung beträgt 1/120 der Breite des Rechengebiets, bei ± 5 km also rund 80 m. Für den Nahbereich ein kleineres Rechengebiet wählen.

## Rechenmodell

- Gauß-Wolkenmodell mit einzelnen Teilwolken (Puffs), die alle 30 Sekunden freigesetzt und mit dem zeitlich veränderlichen Wind verlagert werden.
- Ausbreitungsparameter nach Briggs, getrennt für Freifläche und Bebauung.
- Schichtung nach Pasquill/Turner, Zunahme des Windes mit der Höhe über ein Potenzgesetz.
- Aufstieg der Brandfahne nach Briggs aus der Brandleistung.
- Je Zeitfenster wird der höchste Wert aus drei Momentaufnahmen (alle 5 Minuten) gezeigt.

## Datenquellen

- Wettervorhersage: Open-Meteo
- Stationsmessung: Bright Sky (DWD)
- Höhendaten: Terrain Tiles (Mapzen/AWS), ersatzweise Open-Meteo Höhen-API (Copernicus DEM)
- Karten: OpenTopoMap und OpenStreetMap
- Ortssuche: Nominatim (OpenStreetMap)

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Die gesamte App mit Rechenmodell |
| `manifest.webmanifest`, `icon-180.png`, `icon-512.png` | Angaben und Symbole für den Home-Bildschirm |
| `sw.js` | Zwischenspeicher, damit die App auch bei schlechtem Netz startet |
