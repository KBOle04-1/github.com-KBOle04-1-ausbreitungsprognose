# Validierung

Stand: Modellstand 0.11 vom 11.11.2026.

## Grundsätze

- Kein Teilmodell gilt als validiert. Die Einstufung „validiertes Modell" wird in der App nicht vergeben.
- Jeder Prüffall hat eine Referenz mit Herkunftsangabe. Fehlt eine Referenz, wird der Fall als „ohne Referenz" geführt und nicht bewertet.
- Nicht bestandene Fälle bleiben sichtbar. Referenzwerte und Toleranzen werden nicht an das Ergebnis angepasst.
- Die Ergebnisse stehen in `docs/Validierung-Ergebnisse.md` und werden mit `node tests/modelltests.js` neu erzeugt.

## Stand des Prüflaufs

49 Fälle, 46 bestanden, 3 nicht bestanden.

| Gruppe | Fälle | Referenz | Ergebnis |
|---|---|---|---|
| G01 bis G13 Gauß-Fahne | 13 | analytische Lösung | bestanden, Verhältnis 0,89 bis 1,01 |
| G14 Massenerhaltung | 1 | Bilanz | bestanden |
| R01 bis R13 Reichweite unabhängig vom Raster | 13 | analytische Lösung | bestanden, Verhältnis 0,95 bis 1,16 |
| B01 bis B05 Britter-McQuaid | 5 | Stetigkeit, Lehrbuchbeispiel, Handrechnung | bestanden |
| J01 bis J12 Jack Rabbit II | 12 | Versuchsdaten | 9 bestanden, **3 nicht bestanden** |
| V01, V02 Vegetationsbrand | 2 | vorgegebene Ellipse | bestanden |
| E01 bis E03 Druckwelle, Feuerball | 3 | Literaturwerte | bestanden |

### Nicht bestandene Fälle

J06, J07 und J12: Für die Versuche 7 und 9 erreicht das Modell 340, 50 und 100 ppm Chlor schon nach 2,0, 4,5 und 4,2 km. Gemessen wurden diese Spitzenwerte in 5 und 11 km. Das Verhältnis 0,39 bis 0,41 liegt außerhalb des Faktors 2.

Ursache und Folge:

- Alle drei Werte liegen unter dem Kurvenbereich von Britter-McQuaid und sind mit dem Gauß-Modell fortgesetzt („abgeleitet").
- Die Messwerte sind kurzzeitige Spitzen, das Modell rechnet Mittelwerte.
- Die App gibt abgeleitete Schwergas-Entfernungen deshalb als „mindestens" aus, mit dem Zusatz „bis zum 2,5-Fachen möglich", und stuft die Prognose als „außerhalb des gültigen Modellbereichs" ein.
- Behoben ist der Mangel damit nicht. Für giftige schwere Gase im Fernbereich bleibt ein dynamisches Schwergasmodell erforderlich.

## Was die Fälle belegen und was nicht

- Gruppen G, R, V und B01, B03 bis B05 belegen die richtige Umsetzung der Gleichungen, nicht deren Gültigkeit in der Natur.
- B02 belegt die Übereinstimmung mit einem Lehrbuchbeispiel; der Zahlenwert 367 m ist aus dem Gedächtnis zitiert und noch nicht an der Quelle abgeglichen.
- Gruppe J ist der einzige Vergleich mit Versuchsdaten. Eingangsdaten: Freisetzungsdauer, Masse, Wind in 2 m und Temperatur nach der Versuchstabelle von Hanna und Mitautoren; Wind auf 10 m umgerechnet mit dem logarithmischen Profil und der Rauigkeit 0,001 m; Luftdruck 87 000 Pa; Schichtung für die Fortsetzung: Klasse D (für die Versuche 6, 7 und 9 liegt keine veröffentlichte Angabe vor, das ist eine Annahme).
- E01 prüft nur die Größenordnung; der Referenzwert ist nicht abgeglichen.

## Offene Teile des Validierungskatalogs

Der Auftrag verlangt mindestens 25 Szenarien mit Vergleich gegen anerkannte Referenzmodelle und Versuchsdaten. Davon fehlt:

| Vergleich | Stand |
|---|---|
| NOAA ALOHA | fehlt. Das Programm kann in dieser Arbeit nicht ausgeführt werden; veröffentlichte Beispielrechnungen sind noch nicht beschafft. |
| DEGADIS, SLAB | fehlt, aus demselben Grund. |
| Passive Feldversuche (z. B. Prairie Grass) | fehlt |
| Weitere Schwergasversuche (Thorney Island, Burro, Desert Tortoise, Goldfish) | fehlt |
| Brandrauch | keine Referenz vorhanden |
| Vegetationsbrand gegen Rothermel | fehlt, Rothermel ist noch nicht umgesetzt |
| Gasexplosion gegen Multi-Energy | fehlt, Verfahren noch nicht umgesetzt |
| Sensitivitätsanalysen (Wind, Richtung, Rate, Temperatur, Schichtung) | fehlt als Katalog; einzelne Werte im Prüfbericht Abschnitt 5 |

## Quellen der Versuchsdaten

- Versuchstabelle Jack Rabbit II: https://harmo.org/Conferences/Proceedings/_Bologna/publishedSections/H18-071-Hanna.pdf
- Messwerte je Messbogen, Versuche 6 bis 9: https://www.cisa.gov/sites/default/files/publications/2019-CSSS-Jack-Rabbit-II-Update-508.pdf
- Feuerballradien: https://tc.canada.ca/en/dangerous-goods/bleve-response-prevention
