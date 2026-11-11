# Ausbreitungsprognose Gefahrstoff und Brandrauch

Web-App für iPhone und iPad. Sie schätzt ab, wohin sich ein gasförmiger Gefahrstoff, eine Rauchgaswolke oder die Front eines Wald- oder Vegetationsbrandes ausbreitet, und zeigt das Ergebnis in Zeitfenstern von je 15 Minuten auf der Karte. Der Reiter Blast-Cast schätzt die Reichweite der Druckwelle einer Explosion.

Die Kopfzeile hat drei Reiter:

1. **Gefahrstoff und Rauch** mit den Schaltflächen Gefahrstoff, Brandrauch und Kombiniert
2. **Vegetationsbrand**
3. **Blast-Cast** (orange)

Karte, Ortssuche und Berechnung sind auf Deutschland begrenzt.

**Nur Orientierungshilfe.** Das Ergebnis ersetzt keine Messungen vor Ort, keine Fachberatung (z. B. TUIS, Fachberater Chemie) und keine zugelassenen Programme.

App öffnen: https://kbole04-1.github.io/github.com-KBOle04-1-ausbreitungsprognose/

## Stand der fachlichen Überarbeitung

Die App wird seit dem 11.11.2026 fachlich überarbeitet. Der [Prüfbericht](docs/Pruefbericht.md) listet alle bekannten Mängel mit Fundstelle im Quellcode und den Stand ihrer Behebung. Wichtig für die Nutzung:

- Kein Teilmodell ist bisher gegen Versuchsdaten oder Referenzprogramme validiert.
- Schwere Gase werden noch wie neutrale Gase gerechnet. Ergebnisse für Chlor, Propan und ähnliche Stoffe nicht für Absperrgrenzen verwenden.
- AEGL-Werte werden noch ohne Zeitmittel und Dosis bewertet und sind noch nicht gegen die amtliche Liste geprüft.
- Brandrauch ist nur eine Richtungsanzeige: gerechnet wird Ruß, das Ergebnis hängt stark von der unsicheren Überhöhung ab. „Nicht erreicht" ist keine Entwarnung.

### Prognosequalität

Jedes Ergebnis trägt unter den Reichweiten eine aufklappbare Einstufung mit Begründung, die auch im PDF steht:

| Einstufung | Bedeutung |
|---|---|
| Vereinfachtes Modell | Anerkanntes Schätzverfahren innerhalb seines Anwendungsbereichs |
| Eingeschränktes Modell | Wesentliche Wirkung fehlt oder beruht auf Faustformeln (z. B. Schwergas, Brandrauch, Vegetationsbrand, Gasexplosion) |
| Unzureichende Datenlage | Eingangsdaten widersprechen sich, z. B. Wettermodelle uneinig über die Windrichtung |
| Außerhalb des gültigen Modellbereichs | z. B. Wind unter 1 m/s oder Reichweite über 10 km |

Die Stufe „validiertes Modell" wird derzeit nicht vergeben. Entfernungen und Flächen werden gerundet ausgegeben („bis ca. 1,9 km"), weil das Modell keine höhere Genauigkeit hergibt.

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

## Die Szenarien

### Gefahrstoff

- Stoffauswahl mit hinterlegten AEGL-Werten (60 Minuten), Propan und Methan mit Bezug auf die untere Explosionsgrenze, dazu „Eigener Stoff".
- **Kontinuierlich:** Austrittsrate in kg/min und Dauer. **Schlagartig:** Gesamtmasse in kg.
- Darstellung: gelb, orange, rot für Schwelle 1 bis 3.

#### Fließgewässer und schwere Gase

Mit dem Häkchen „Fließgewässer und Pegel anzeigen" (Gefahrstoff und Kombiniert) werden Flüsse, Kanäle und bei kleinem Rechengebiet auch Bäche aus OpenStreetMap geladen und blau in die Karte gezeichnet. In Hessen wird dazu der Abfluss am nächsten HLNUG-Pegel angezeigt. Auf die Rechnung hat das zunächst keine Wirkung.

Die Lenkung der Wolke entlang des Gewässers ist seit dem 11.11.2026 **ausgeschaltet** und nur über das Häkchen „Wolke entlang des Gewässers lenken (experimentell, nicht belegt)" wählbar. Gründe:

- Für die Lenkung einer Gaswolke durch ein Gewässer und für die Kopplung an die Wassergeschwindigkeit gibt es keinen Literaturbeleg; die Faktoren sind selbst gewählt.
- Die Fließrichtung stammt ungeprüft aus der Zeichenrichtung in OpenStreetMap.
- Die Fließgeschwindigkeit wird aus dem Abfluss mit einer eigenen Näherung geschätzt (v ≈ 0,35 · Q^0,25); Abweichungen um den Faktor 2 sind möglich.

Wer die Lenkung einschaltet, erhält eine als „eingeschränkt" gekennzeichnete Prognose. Im Wasser gelöste oder aufschwimmende Stoffe werden nicht gerechnet.

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

### Vegetationsbrand

Prognose für Wald- und Vegetationsbrände. Gerechnet wird, wie weit die Feuerfront in jedem Zeitfenster kommt.

- **Vegetation:** Gras/Wiese, Getreide/Stoppelfeld, Heide/Gebüsch, Nadelwald Bodenfeuer, Nadelwald Vollfeuer, Laub- und Mischwald.
- **Zustand der Vegetation:** von „ausgedörrt" bis „feucht, überwiegend grün". Damit wird die Vorgeschichte (Trockenheit) eingestellt, die aus dem aktuellen Wetter nicht ablesbar ist.
- **Brand bei Beginn:** Durchmesser der brennenden Fläche zum Startzeitpunkt.
- **Berücksichtigt werden** dieselben Größen wie bei den anderen Szenarien: Wind (Richtung und Stärke je Zeitfenster), Temperatur, Luftfeuchte, Niederschlag und Gelände. Bergauf läuft das Feuer schneller (etwa doppelt so schnell je 10° Hangneigung), bergab langsamer.
- **Darstellung im Zeitfenster:** dunkelrot die bisher verbrannte Fläche, orange der Zuwachs in diesen 15 Minuten. Im Gesamtbereich ist die Fläche stundenweise von hell (früh) nach dunkel (spät) gefärbt.
- **Angezeigt werden** Brandfläche in Hektar, größte Entfernung der Front, Geschwindigkeit der Feuerspitze in m/min und die berechnete Brennstofffeuchte.

Grenzen dieses Szenarios:

- Die Vegetation gilt im ganzen Gebiet als gleich und brennbar. Straßen, Gewässer, Äcker und Ortschaften bremsen im Modell nicht; solche Brandriegel selbst in der Karte berücksichtigen.
- Flugfeuer ist nicht erfasst. Bei starkem Wind kann es die Front deutlich schneller vorantreiben.
- Die Geschwindigkeiten beruhen auf Faustformeln (Anteil der Windgeschwindigkeit je Vegetation, z. B. rund 20 % bei trockenem Gras, rund 10 % bei Vollfeuer). Mit der beobachteten Frontgeschwindigkeit vergleichen und Vegetation oder Zustand anpassen.
- Löschmaßnahmen sind nicht berücksichtigt.

### Blast-Cast (Druckwelle)

Schätzt, bis in welche Entfernung welcher Überdruck einer Explosion zu erwarten ist. Die Druckwelle läuft in Sekunden durch, deshalb gibt es hier keine Zeitfenster, sondern Wirkungszonen.

**Gas-Luft-Gemisch**

- Gas wählen und die Gasmenge in der Wolke in kg eintragen.
- **Verdämmung:** Anteil der Verbrennungsenergie, der in die Druckwelle geht: 3 % frei im offenen Gelände, 10 % teilweise verdämmt (Bebauung, Anlagen), 20 % stark verdämmt (im Gebäude, im Behälter). Im Zweifel die höhere Stufe wählen.
- Gerechnet wird über das TNT-Äquivalent. Das ist für Gaswolken grob: Im Nahbereich wird der Druck eher überschätzt.
- Feuerball, Wärmestrahlung und Trümmerwurf sind nicht dargestellt.

**Weltkriegsbombe**

- Gewichtsklasse wählen (100 lb bis Luftmine 4000 lb). Gesamtmasse und Sprengstoffmasse sind Richtwerte und lassen sich überschreiben.
- Gerechnet wird eine Detonation an der Oberfläche. Liegt die Bombe im Erdreich, wird die Druckwelle gedämpft; dafür kommen Erdauswurf und Erschütterung hinzu.
- **Splitter fliegen viel weiter, als die Druckwelle wirkt.** Der gestrichelte Kreis zeigt den Splitterbereich nach der Faustformel der Vereinten Nationen (IATG 01.80: 634 × Gesamtmasse^(1/6), ungeschützt, Zutritt der Öffentlichkeit möglich). Den Evakuierungsradius legt der Kampfmittelräumdienst fest.

**BLEVE (Behälterzerknall mit Feuerball)**

Für Behälter mit druckverflüssigtem Gas (Propan, Butan), die im Feuer versagen: Propangasflaschen (11 und 33 kg), Flüssiggastanks (1,2 t, 2,1 t, 2,9 t), Lkw-Tankwagen (ca. 9 t), Lkw-Sattelzug (ca. 22 t) und Eisenbahn-Kesselwagen (ca. 50 t). Inhalt und Füllgrad lassen sich anpassen.

| Zone | Bedeutung |
|---|---|
| Feuerball | Radius des Feuerballs; Durchmesser 5,8 · M^(1/3) in Metern, M in kg |
| Lebensgefahr | Wärmestrahlung: schwerste Verbrennungen ohne Schutz (Wärmedosis 1000) |
| Verbrennung 2. Grades | an ungeschützter Haut (Wärmedosis 250) |
| Schmerzgrenze | Schmerz, Verbrennungen 1. Grades (Wärmedosis 125) |
| Richtwert Einsatzkräfte | 4 Feuerballradien, mindestens 90 m, in Schutzkleidung |
| Richtwert Evakuierung / erweitert | 15 bzw. 30 Feuerballradien wegen Trümmerflug |

Die drei Richtwerte stammen von Transport Canada für Flüssiggasbehälter. Sie sind keine allgemeinen Sicherheitsabstände. Die Druckwirkung des BLEVE wird nicht bemessen, weil dafür noch kein belegtes Verfahren hinterlegt ist.

- Die Wärmedosis berücksichtigt die Dauer des Feuerballs und die Dämpfung durch die Luftfeuchte (aus den Wetterdaten).
- Die Abstände für Einsatzkräfte und Evakuierung folgen der Empfehlung von Transport Canada („BLEVE – Response and Prevention").
- Trümmer sind die weitreichendste Gefahr. Behälterteile fliegen bevorzugt in Richtung der Behälterenden, einzelne weiter als der Mindestradius.
- Der Zeitpunkt des Versagens ist nicht vorhersagbar; bei direkter Beflammung kann ein Behälter binnen Minuten bersten.
- Gelände: Schraffiert ist der Strahlungsschatten hinter Erhebungen, gesehen vom Mittelpunkt des Feuerballs.

**Wirkungszonen der Druckwelle (Gasgemisch und Bombe)**

| Überdruck | Wirkung |
|---|---|
| 2 kPa | Fensterbruch möglich, Verletzungen durch Glassplitter |
| 7 kPa | Fenster und Türen zerstört, Dächer abgedeckt, Leichtbauten beschädigt |
| 20 kPa | Schwere Gebäudeschäden, Mauerwerk teilweise zerstört |
| 35 kPa | Trommelfellrisse, Wohngebäude weitgehend zerstört |
| 100 kPa | Lebensgefahr durch den Druck selbst (Lungenschäden) |

Die Tabelle „Wirkungszonen" nennt je Zone Radius und Laufzeit der Druckwelle.

**Gelände und Wetter**

- Das Gelände wird als Sichtlinie ausgewertet: Bereiche hinter Geländeerhebungen liegen im Druckschatten und sind schraffiert. Dort ist die Belastung geringer, Schäden bleiben möglich.
- Luftdruck und Temperatur gehen in die Rechnung ein.
- Bei stabiler Schichtung (Inversion) wird die Druckwelle zum Boden zurückgelenkt; Fensterbruch kann dann deutlich weiter reichen als der äußere Kreis. Die App warnt in diesem Fall, ebenso bei starkem Wind.
- Gebäude schirmen ab, in Straßenzügen kann der Druck gebündelt und verstärkt werden. Beides ist nicht erfasst.

## Auswertung drucken (PDF)

Nach jeder Berechnung steht unter der Zeitleiste die Schaltfläche „Auswertung drucken (PDF)". Sie erzeugt ein PDF im Format A4 mit:

- dem Hinweis „Prognose! Werte sind durch geeignete Messungen vor Ort zu überprüfen!" auf der ersten Seite und in jeder Fußzeile,
- allen Eingangsparametern, so wie sie bei der Berechnung galten (Ort, Zeit, Stoff oder Brand, Mengen, Schwellenwerte, Rechengebiet, Gelände, Wetter mit Stationsmessung und Modellvergleich, Fließgewässer),
- den Bemessungsergebnissen als Tabelle je Zeitfenster,
- den Hinweisen zur Bewertung,
- einer Karte für den Gesamtbereich und einer Karte für jedes Zeitfenster, jeweils mit Gefahrenflächen, Radien samt Entfernung, Maßstab und Nordpfeil. Alle Karten zeigen denselben Ausschnitt, damit sich die Zeitfenster vergleichen lassen.

Blast-Cast liefert statt der Zeitfenster eine Übersichtskarte und eine Karte des Nahbereichs.

Danach erscheint „PDF teilen oder sichern" (iPhone und iPad: Drucken, in Dateien sichern, versenden) oder „PDF öffnen". Bei 12 Stunden Prognosedauer entstehen 49 Karten auf rund 28 Seiten.

Der Kartenhintergrund wird für das PDF gesondert geladen. Lässt der Kartendienst das nicht zu, erscheinen die Karten mit grauem Hintergrund und dem Vermerk „Kartenhintergrund nicht verfügbar"; Flächen, Radien und Maßstab bleiben erhalten.

## Radien auf der Karte

Für jede Schwelle wird ein farbiger Umkreis um den Freisetzungsort gezeichnet, dessen Radius der Reichweite entspricht. Eine gepunktete Linie führt zum entferntesten Punkt, dort steht die Entfernung (z. B. „AEGL-2 · 1,9 km"). Gefahrstoff: durchgezogene Kreise in Gelb, Orange, Rot. Brandrauch im kombinierten Modus: gestrichelte Kreise. Vegetationsbrand: ein roter Kreis für die Front. Mit dem Häkchen „Radien mit Entfernung einblenden" über der Zeitleiste lassen sie sich ausblenden.

Der Umkreis zeigt die größte Entfernung in irgendeine Richtung. Betroffen ist nur die farbige Fläche, nicht der ganze Kreis.

## Rechengebiet und Prognosedauer

- Rechengebiet von ± 1 km bis ± 50 km, Prognosedauer von 1 bis 12 Stunden.
- Reichweiten werden unabhängig vom Raster entlang der Fahnenachse bestimmt. Für die Flächen liegen zwei Raster ineinander: das ganze Rechengebiet und ein achtfach feineres um den Ereignisort. Damit gehen die inneren Zonen auch bei großem Rechengebiet nicht mehr verloren.
- Das Wetter wird am Freisetzungsort abgegriffen und gilt für das ganze Gebiet. Über 10 km Entfernung sind die Ergebnisse grobe Schätzungen: Der Wind kann dort anders wehen, und die Ausbreitungsformeln sind für solche Entfernungen nur eingeschränkt belegt.
- Vegetationsbrand rechnet immer mit 1/240 der Gebietsbreite (bei ± 2 km rund 17 m).

## Topographie

Das Gelände geht so in die Rechnung ein:

- **Auftreffen:** Eine aufgestiegene Fahne trifft auf höher gelegenes Gelände (Halbhöhen-Korrektur bei neutraler und labiler Schichtung, volle Geländehöhe bei stabiler).
- **Vegetationsbrand:** Feuer läuft bergauf schneller, bergab langsamer.
- **Blast-Cast:** Erhebungen werfen einen Druck- oder Strahlungsschatten.

Die Umlenkung des Windes an Hängen, der Kaltluftabfluss und das Abfließen schwerer Gase hangabwärts waren eigene Näherungen ohne Literaturbeleg. Sie sind seit dem 11.11.2026 **ausgeschaltet** und nur über das Häkchen „Windlenkung durch das Gelände (experimentell, nicht belegt)" wählbar.

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

- **Vorhersage:** Open-Meteo mit 15-Minuten-Werten (in Mitteleuropa DWD ICON-D2): Wind, Böen, Temperatur, Luftfeuchte, Strahlung, Bewölkung, Niederschlag.
- **Modellvergleich:** Zusätzlich werden fünf Wettermodelle abgefragt (ICON-D2 und ICON-EU des DWD, IFS des ECMWF, GFS, Météo-France) und Windrichtung und Windstärke zum Ereignisbeginn nebeneinander gezeigt. Weichen die Richtungen um mehr als 45° voneinander ab, warnt die App. Gerechnet wird weiter mit der 15-Minuten-Vorhersage.
- **Messung:** Zum Vergleich wird die aktuelle Messung der nächsten DWD-Station angezeigt.
- **Von Hand:** Für Messungen vor Ort oder Übungen lassen sich Windrichtung, Windstärke, Schichtung, Temperatur und Luftfeuchte vorgeben. Sie gelten dann für alle Zeitfenster.
- **Schichtung:** Klassen A (sehr labil) bis F (sehr stabil), bestimmt aus Wind, Strahlung und Bewölkung. Stabile Schichtung (klare, windschwache Nacht) bedeutet schmale Wolke und große Reichweite.
- Der Ereignisbeginn kann zwischen gestern und übermorgen liegen.

## Warnhinweise der App

| Hinweis | Was zu tun ist |
|---|---|
| Gefahrenzone oder Feuerfront erreicht den Rand | Rechengebiet vergrößern |
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
- Die Auflösung hängt vom Rechengebiet ab (siehe „Rechengebiet und Prognosedauer"). Für den Nahbereich ein kleineres Rechengebiet wählen.

## Rechenmodell

- Gauß-Wolkenmodell mit einzelnen Teilwolken (Puffs), die alle 30 Sekunden freigesetzt und mit dem zeitlich veränderlichen Wind verlagert werden.
- Ausbreitungsparameter nach Briggs, getrennt für Freifläche und Bebauung.
- Schichtung nach Pasquill/Turner, Zunahme des Windes mit der Höhe über ein Potenzgesetz.
- Aufstieg der Brandfahne nach Briggs aus der Brandleistung.
- Je Zeitfenster wird der höchste Wert aus drei Momentaufnahmen (alle 5 Minuten) gezeigt.
- Blast-Cast: Spitzenüberdruck nach Kinney und Graham über den skalierten Abstand, Oberflächendetonation mit Faktor 1,8, Gas über TNT-Äquivalent (4,6 MJ/kg).
- Vegetationsbrand: Die Feuerfront breitet sich als Ellipse in Windrichtung aus (je stärker der Wind, desto gestreckter). Die Brennstofffeuchte wird aus Temperatur und Luftfeuchte bestimmt (Simard), Niederschlag bremst zusätzlich. Die Ankunftszeit der Front wird Zelle für Zelle über das Raster berechnet.

## Datenquellen

- Wettervorhersage: Open-Meteo
- Stationsmessung: Bright Sky (DWD)
- Höhendaten: Terrain Tiles (Mapzen/AWS), ersatzweise Open-Meteo Höhen-API (Copernicus DEM)
- Pegel und Abfluss: HLNUG (Hessen)
- Fließgewässer: OpenStreetMap über die Overpass-Schnittstelle
- Karten: OpenTopoMap und OpenStreetMap
- Ortssuche: Nominatim (OpenStreetMap)

## Plausibilitätsprüfung (Stand 10.11.2026)

Geprüft wurde mit nachgebildeten Datenquellen (Wetter, Höhen, Gewässer, Pegel), weil die echten Dienste aus der Prüfumgebung nicht erreichbar waren.

- **Ausbreitung:** Das Modell trifft die analytische Gauß-Lösung für alle Schichtungsklassen, Freifläche und Bebauung, Boden- und Höhenquelle auf 1 bis 11 %. Die größte Abweichung (sehr stabile Schichtung) kommt von der Rasterweite. Die Masse einer Einzelwolke bleibt erhalten (998 von 1000 kg).
- **Vegetationsbrand:** Kopf, Rücken und Breite der Brandellipse stimmen mit der Sollform überein.
- **Blast-Cast:** 10 kPa bei einem skalierten Abstand von 10 m/kg^(1/3), wie in der Literatur. Die BLEVE-Feuerballradien decken sich mit den Angaben von Transport Canada.
- **Ablauf:** Alle Reiter und Schaltflächen, Ortssuche, Zeitleiste, Abspielen, Radien, Tabelle, Gewässer und Pegel liefen ohne Programmfehler, ebenso der Ausfall aller Datenquellen und ein Zeitpunkt außerhalb der Vorhersage.

Nicht prüfbar waren die echten Datendienste auf dem Gerät: ob HLNUG-Pegel und Gewässerabruf vom iPhone aus zugelassen sind und ob jedes der fünf Wettermodelle antwortet. Fällt eine Quelle aus, meldet die App das und rechnet ohne sie weiter.

Die Beschriftung der Radien erscheint erst, wenn der Kreis auf der Karte groß genug ist; bei kleinen inneren Zonen hineinzoomen.

## Nicht eingebundene Datenquellen

- **Kachelmannwetter, Meteosol:** Eine frei nutzbare Schnittstelle für Apps ist für beide nicht bekannt (Stand November 2026, nicht abschließend geprüft). Stattdessen der Modellvergleich oben, der dieselben staatlichen Modelle nutzt.
- **USGS EarthExplorer:** nur mit Anmeldung und ohne Schnittstelle für eine Web-App; die LIDAR-Daten dort decken die USA ab.
- **OpenTopography:** bietet für Deutschland nach bisherigem Kenntnisstand keine LIDAR-Daten, nur weltweite Höhenmodelle mit rund 30 m Auflösung, also dieselbe Datenklasse, die die App schon nutzt. Der Abruf braucht einen persönlichen Schlüssel.
- **BlenderGIS:** ist eine Erweiterung für das 3D-Programm Blender auf dem PC und keine Datenquelle.
- Echte LIDAR-Höhendaten für Deutschland (DGM1, 1 m Auflösung) geben die Landesvermessungen heraus, je Bundesland auf eigenem Weg.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Die gesamte App mit Rechenmodell |
| `manifest.webmanifest`, `icon-180.png`, `icon-512.png` | Angaben und Symbole für den Home-Bildschirm |
| `sw.js` | Zwischenspeicher, damit die App auch bei schlechtem Netz startet |
