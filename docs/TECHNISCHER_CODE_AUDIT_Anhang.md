# Technischer Code-Audit: Anhang mit Prüfläufen

Erzeugt von `node tests/audit/audit_pruefungen.js` am geprüften Stand. Nicht von Hand ändern.

## A. Funktionstests (mathematisch)

Je Funktion ein Normalfall, ein Grenzfall und ein Extremfall. Die Erwartung wurde vor dem Lauf festgelegt.

| Funktion | Art | Fall | Erwartung | Ergebnis | Bewertung |
|---|---|---|---|---|---|
| sigma | Normal | Klasse D, 1000 m, Freifläche | 76,3 / 37,9 m (Handrechnung) | 76,3 / 37,9 | bestanden |
| sigma | Grenz | x = 0 und x = −50 | wie x = 1 m, endlich, positiv | 0,08 / 0,06 / 0,08 / 0,06 | bestanden |
| sigma | Extrem | x = 1000 km, Klasse A Bebauung | endlich, σz höchstens 5000 m | 16.000 / 5.000 | bestanden |
| stabClass | Normal | 4 m/s, 400 W/m² | C (2) | 2 | bestanden |
| stabClass | Grenz | genau 2 m/s, 20 W/m², 50 % Bewölkung | eine gültige Klasse 0 bis 5 | 4 | bestanden |
| stabClass | Extrem | ungültige Eingaben (NaN) | Fehler oder Kennzeichnung erwartet | 3 | **nicht bestanden** |
| vertTerm | Normal | d = 0, σz = 50 m, ohne Deckel | 2/(√(2π)·50) = 0,01596 | 0,016 | bestanden |
| vertTerm | Grenz | Übergang bei σz = 1,6·zi (zi = 500 m): Wert knapp darunter / darüber | stetig (Verhältnis nahe 1) | 0,001 / 0,002 / 1,38 | **nicht bestanden** |
| vertTerm | Extrem | d = 1000 m, σz = 0,5 m | 0 | 0 | bestanden |
| plumeRiseFinal | Normal | F = 88 m⁴/s³ (10 MW konvektiv), 3 m/s, neutral | 38,71·88^0,6/3 = 189 m | 189 | bestanden |
| plumeRiseFinal | Grenz | F = 55 von unten / von oben | stetig | 144 / 143 | bestanden |
| plumeRiseFinal | Extrem | F = 100 000, Wind 0 | begrenzt auf 1500 m | 1.500 | bestanden |
| trackPuffs + evalField | Normal | 1 kg/s, D, 3 m/s: Höchstwert / Kleinstwert des Feldes | endlich, nicht negativ | 0,014 / 0 | bestanden |
| trackPuffs + evalField | Grenz | Freisetzungsrate 0 und Wind 0 | alles 0; Wind wird auf 0,5 m/s gesetzt, Ergebnis endlich | 0 / 0 / 0,02 / 0 | bestanden |
| trackPuffs + evalField | Extrem | negative Freisetzungsrate −1 kg/s | Abweisung erwartet | 0 / -0,014 | **nicht bestanden** |
| axisReach | Normal | Chlor 0,5 kg/s, D, 3 m/s, AEGL-2 | rund 2000 m (analytisch 2011 m) | 1.970 | bestanden |
| axisReach | Grenz | alle Schwellen leer | 0 / 0 / 0 | 0 / 0 / 0 | bestanden |
| axisReach | Extrem | Schwelle über jeder Konzentration (1 kg/m³) | 0 | 0 | bestanden |
| bmInit | Normal | Chlor, Gas, 15 °C, 1013 hPa: Dichte | p·M/(R·T) = 3,00 kg/m³ | 3 | bestanden |
| bmInit | Grenz | Chlor „kalt", Luft −40 °C (unter Siedetemperatur): Zustand | Hinweis erwartet; tatsächlich stiller Rückfall auf „gas" | gas | **nicht bestanden** |
| bmInit | Extrem | molare Masse 0 bzw. Luftdruck 0 | Abweisung erwartet | 0 / 0 | **nicht bestanden** |
| bmDistance | Normal | Chlor 0,5 kg/s, 3 m/s, 1 Vol.-% | endlich, Bereich „ok" | 64,8 / 1 | bestanden |
| bmDistance | Grenz | Konzentration 100 % und 0 | „ueber" bzw. „unter", endlich | ueber / unter / 139 | bestanden |
| bmDistance | Extrem | Freisetzungsrate 0 (kontinuierlich) | Rückgabe ohne Abbruch | Abbruch: Cannot read properties of null (reading 'x') | **nicht bestanden** |
| bmDistance | Extrem | Wind 0 | Abweisung oder Kennzeichnung | NaN | **nicht bestanden** |
| denseDistance | Normal | Chlor 0,5 kg/s, 3 m/s, D, 2 ppm | „abgeleitet", endlich | 2.110 / abgeleitet | bestanden |
| denseDistance | Grenz | Schwelle genau an der letzten Kurve (0,2 %) | stetiger Übergang berechnet/abgeleitet (Verhältnis nahe 1) | 139 / 139 / 1 | bestanden |
| denseDistance | Extrem | Schwelle 10⁻¹² (praktisch 0) | endlich, höchstens Suchgrenze 500 km | 500.000 | bestanden |
| fuelMoisture | Normal | 25 °C, 35 % | rund 6,7 % | 6,69 | bestanden |
| fuelMoisture | Grenz | Nahtstellen bei 10 % und 50 % Feuchte, 25 °C: Wert darunter / darüber | stetig | 2,4 / 2,69 / 9,09 / 9,47 | **nicht bestanden** |
| fuelMoisture | Extrem | −20 °C / 100 % und 45 °C / 0 % | endlich, zwischen 1 und 40 % | 28,5 / 1 | bestanden |
| rosParams | Normal | Gras, 5 m/s, 25 °C, 35 % | Kopf rund 20 % des Windes × Feuchtefaktor = 0,96 m/s | 0,956 | bestanden |
| rosParams | Grenz | Wind 0 | Exzentrizität 0 (Kreis) | 0 | bestanden |
| rosParams | Extrem | Wind 40 m/s | Länge zu Breite auf 6 begrenzt (e = 0,986) | 0,986 | bestanden |
| spreadFire | Normal | Gras, 5 m/s, 1 h: Fläche in ha | endlich, größer 0 | 239 | bestanden |
| spreadFire | Grenz | Zustandsfaktor 0 (nicht brennbar) | nur die Anfangsfläche | 0,111 | bestanden |
| spreadFire | Extrem | Prognosedauer 0 | nur die Anfangsfläche | 0,111 | bestanden |
| blastRatio | Normal | Z = 10 m/kg^(1/3) | rund 0,1 (10 kPa) | 0,099 | bestanden |
| blastRatio | Grenz | Z = 0 | endlich (808) | 808 | bestanden |
| blastRatio | Extrem | Z = 10 000 | positiv, sehr klein | 0 | bestanden |
| blastRadius | Normal | 120 kg TNT, 2 kPa | rund 250 m | 254 | bestanden |
| blastRadius | Grenz | Masse 0 | 0 | 0 | bestanden |
| blastRadius | Extrem | Druck 1 Pa (unter dem Suchbereich) | Kennzeichnung erwartet; tatsächlich Abbruch der Suche bei Z = 5000 | 30.000 | **nicht bestanden** |
| bleve | Normal | 22 000 kg: Durchmesser / Dauer | 5,8·M^(1/3) = 163 m / 12,6 s | 163 / 12,6 | bestanden |
| bleve | Grenz | Dauer bei 30 000 kg von unten / von oben | stetig | 14 / 14,5 | **nicht bestanden** |
| bleve | Extrem | Masse 0 | Abweisung erwartet | NaN | **nicht bestanden** |
| blastShadow | Normal | ebenes Gelände | kein Schatten | 0 | bestanden |
| blastShadow | Grenz | Rücken 30 m hoch in 150 m: Punkt davor / dahinter | 0 / 1 | 0 / 1 | bestanden |
| blastShadow | Extrem | Quelle 500 m über Grund (Feuerball), gleicher Rücken | kein Schatten dahinter | 0 | bestanden |

49 Fälle, davon 11 nicht bestanden.

## B. Numerische Kontrollrechnungen

| Prüfung | Ergebnis |
|---|---|
| Kartenüberlagerung ± 50 km bei 50° N: Lage der Bildmitte bzw. des oberen Viertelpunkts im Mercator-Netz | Abweichung 234 m bzw. 176 m gegenüber linearer Streckung |
| Umrechnung Meter in Grad mit 111 320 m je Grad bei 50° N | Breite: Ellipsoid 111.000 m je Grad (Abweichung 0,082 %); Länge: 71.700 statt 71.600 m je Grad (Abweichung -0,196 %) |
| Deckel der Mischungsschicht: Sprung beim Wechsel auf Gleichverteilung (σz = 1,6·zi) | Faktor 1,38 (Konzentration springt um 37,5 %) |
| Zeitschritt 30 s: Reichweite AEGL-3 (Chlor 0,5 kg/s, D) bei 1 / 3 / 10 / 20 m/s gegenüber der analytischen Lösung | 0,969 / 0,956 / 1,15 / 2,76 |
| Negative Freisetzungsrate im Rechenkern | wird gerechnet; kleinster Feldwert -0,014 kg/m³ |

## C. Validierungsszenarien (physikalisch)

Bewertungsmaßstab, vor der Auswertung festgelegt: analytische Lösung ± 15 % (Konzentration) bzw. ± 20 % (Reichweite); Lehrbuchbeispiel ± 5 %; Versuchsdaten Faktor 2; Ausgleichsgerade Faktor 4 (veröffentlichte Streuung); Richtwerte ± 10 %.

| Nr. | Bereich | Szenario | Referenz | Ergebnis | Referenzwert | Einheit | Abweichung absolut | relativ | zulässiges Verhältnis | Bewertung | Ursache / Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S01 | Gauß | 1 kg/s, Klasse A, Freifläche, Höhe 0 m, 3 m/s: Konzentration in 1 km | analytische Gauß-Fahne | 2,5 | 2,53 | mg/m³ | -0,027 | -1,07 % | 0,85 bis 1,15 | bestanden |  |
| S02 | Gauß | 1 kg/s, Klasse D, Freifläche, Höhe 0 m, 3 m/s: Konzentration in 1 km | analytische Gauß-Fahne | 34,9 | 36,6 | mg/m³ | -1,7 | -4,65 % | 0,85 bis 1,15 | bestanden |  |
| S03 | Gauß | 1 kg/s, Klasse F, Freifläche, Höhe 0 m, 3 m/s: Konzentration in 1 km | analytische Gauß-Fahne | 201 | 225 | mg/m³ | -23,7 | -10,5 % | 0,85 bis 1,15 | bestanden | Mindestbreite im Raster |
| S04 | Gauß | 1 kg/s, Klasse D, Bebauung, Höhe 0 m, 3 m/s: Konzentration in 1 km | analytische Gauß-Fahne | 6,27 | 6,39 | mg/m³ | -0,12 | -1,88 % | 0,85 bis 1,15 | bestanden |  |
| S05 | Gauß | 1 kg/s, Klasse D, Freifläche, Höhe 50 m, 3 m/s: Konzentration in 1 km | analytische Gauß-Fahne | 11,9 | 12,1 | mg/m³ | -0,137 | -1,13 % | 0,85 bis 1,15 | bestanden |  |
| S06 | Gauß | Chlor 0,5 kg/s, Klasse D, 3 m/s, Gebiet ± 50 km: Reichweite AEGL-3 | analytische Gauß-Fahne | 477 | 499 | m | -22,2 | -4,44 % | 0,8 bis 1,2 | bestanden |  |
| S07 | Gauß | Chlor 0,5 kg/s, Klasse F, 1.5 m/s, Gebiet ± 50 km: Reichweite AEGL-3 | analytische Gauß-Fahne | 2.160 | 2.270 | m | -103 | -4,54 % | 0,8 bis 1,2 | bestanden |  |
| S08 | Gauß | Chlor 0,5 kg/s, Klasse A, 2 m/s, Gebiet ± 5 km: Reichweite AEGL-2 | analytische Gauß-Fahne | 552 | 556 | m | -4,77 | -0,856 % | 0,8 bis 1,2 | bestanden |  |
| S09 | Gauß | Chlor 0,5 kg/s, Klasse D, 10 m/s, Gebiet ± 20 km: Reichweite AEGL-3 | analytische Gauß-Fahne | 295 | 256 | m | 39,5 | 15,4 % | 0,8 bis 1,2 | bestanden | Puffabstand 300 m |
| S10 | Schwergas | Flüssigerdgas 0,23 m³/s, 10,9 m/s: Entfernung bis 5 Vol.-% | Lehrbuchbeispiel (aus dem Gedächtnis zitiert) | 367 | 367 | m | 0,345 | 0,094 % | 0,95 bis 1,05 | bestanden | Referenzwert nicht abgeglichen |
| S11 | Schwergas | Jack Rabbit II Versuch 6: Entfernung für 44000 ppm (berechnet) | Messbogen mit dieser Spitzenkonzentration | 168 | 200 | m | -31,9 | -16 % | 0,5 bis 2 | bestanden | Messwert ist Sekundenspitze |
| S12 | Schwergas | Jack Rabbit II Versuch 6: Entfernung für 1900 ppm (berechnet) | Messbogen mit dieser Spitzenkonzentration | 758 | 1.000 | m | -242 | -24,2 % | 0,5 bis 2 | bestanden | Messwert ist Sekundenspitze |
| S13 | Schwergas | Jack Rabbit II Versuch 6: Entfernung für 630 ppm (abgeleitet) | Messbogen mit dieser Spitzenkonzentration | 1.320 | 2.000 | m | -676 | -33,8 % | 0,5 bis 2 | bestanden | außerhalb der Kurven, Fortsetzung mit Gauß; Messwert ist Sekundenspitze |
| S14 | Schwergas | Jack Rabbit II Versuch 7: Entfernung für 70000 ppm (berechnet) | Messbogen mit dieser Spitzenkonzentration | 256 | 200 | m | 56,4 | 28,2 % | 0,5 bis 2 | bestanden | Messwert ist Sekundenspitze |
| S15 | Schwergas | Jack Rabbit II Versuch 7: Entfernung für 1200 ppm (abgeleitet) | Messbogen mit dieser Spitzenkonzentration | 1.180 | 2.000 | m | -823 | -41,2 % | 0,5 bis 2 | bestanden | außerhalb der Kurven, Fortsetzung mit Gauß; Messwert ist Sekundenspitze |
| S16 | Schwergas | Jack Rabbit II Versuch 7: Entfernung für 340 ppm (abgeleitet) | Messbogen mit dieser Spitzenkonzentration | 1.960 | 5.000 | m | -3.040 | -60,8 % | 0,5 bis 2 | **nicht bestanden** | außerhalb der Kurven, Fortsetzung mit Gauß; Messwert ist Sekundenspitze |
| S17 | Schwergas | Jack Rabbit II Versuch 7: Entfernung für 50 ppm (abgeleitet) | Messbogen mit dieser Spitzenkonzentration | 4.460 | 11.000 | m | -6.540 | -59,5 % | 0,5 bis 2 | **nicht bestanden** | außerhalb der Kurven, Fortsetzung mit Gauß; Messwert ist Sekundenspitze |
| S18 | Schwergas | Jack Rabbit II Versuch 9: Entfernung für 29000 ppm (berechnet) | Messbogen mit dieser Spitzenkonzentration | 320 | 200 | m | 120 | 59,8 % | 0,5 bis 2 | bestanden | Messwert ist Sekundenspitze |
| S19 | Schwergas | Jack Rabbit II Versuch 9: Entfernung für 1900 ppm (berechnet) | Messbogen mit dieser Spitzenkonzentration | 1.050 | 1.000 | m | 49,3 | 4,93 % | 0,5 bis 2 | bestanden | Messwert ist Sekundenspitze |
| S20 | Schwergas | Jack Rabbit II Versuch 9: Entfernung für 1300 ppm (berechnet) | Messbogen mit dieser Spitzenkonzentration | 1.290 | 2.000 | m | -713 | -35,7 % | 0,5 bis 2 | bestanden | Messwert ist Sekundenspitze |
| S21 | Schwergas | Jack Rabbit II Versuch 9: Entfernung für 300 ppm (abgeleitet) | Messbogen mit dieser Spitzenkonzentration | 2.550 | 5.000 | m | -2.450 | -49 % | 0,5 bis 2 | bestanden | außerhalb der Kurven, Fortsetzung mit Gauß; Messwert ist Sekundenspitze |
| S22 | Schwergas | Jack Rabbit II Versuch 9: Entfernung für 100 ppm (abgeleitet) | Messbogen mit dieser Spitzenkonzentration | 4.240 | 11.000 | m | -6.760 | -61,4 % | 0,5 bis 2 | **nicht bestanden** | außerhalb der Kurven, Fortsetzung mit Gauß; Messwert ist Sekundenspitze |
| S23 | Schwergas | Jack Rabbit II Versuch 6: Konzentration in 0.5 km | Ausgleichsgerade der Chlorversuche (Hanna et al.), Streuung Faktor 3 bis 4 | 4.930 | 11.800 | ppm | -6.870 | -58,2 % | 0,25 bis 4 | bestanden | Gerade beschreibt Sekundenspitzen |
| S24 | Schwergas | Jack Rabbit II Versuch 6: Konzentration in 1 km | Ausgleichsgerade der Chlorversuche (Hanna et al.), Streuung Faktor 3 bis 4 | 1.150 | 3.720 | ppm | -2.570 | -69,2 % | 0,25 bis 4 | bestanden | Gerade beschreibt Sekundenspitzen |
| S25 | Schwergas | Jack Rabbit II Versuch 6: Konzentration in 2 km | Ausgleichsgerade der Chlorversuche (Hanna et al.), Streuung Faktor 3 bis 4 | 256 | 1.170 | ppm | -914 | -78,1 % | 0,25 bis 4 | **nicht bestanden** | Gerade beschreibt Sekundenspitzen |
| S26 | Schwergas | Jack Rabbit II Versuch 6: Konzentration in 5 km | Ausgleichsgerade der Chlorversuche (Hanna et al.), Streuung Faktor 3 bis 4 | 35,1 | 254 | ppm | -219 | -86,2 % | 0,25 bis 4 | **nicht bestanden** | Gerade beschreibt Sekundenspitzen |
| S27 | Schwergas | Jack Rabbit II Versuch 6: Konzentration in 11 km | Ausgleichsgerade der Chlorversuche (Hanna et al.), Streuung Faktor 3 bis 4 | 7 | 68,3 | ppm | -61,3 | -89,7 % | 0,25 bis 4 | **nicht bestanden** | Gerade beschreibt Sekundenspitzen |
| S28 | BLEVE | Tank 4000 l (2000 kg angenommen): Feuerballradius | Transport Canada | 36,5 | 38 | m | -1,46 | -3,85 % | 0,9 bis 1,1 | bestanden | Füllmasse angenommen |
| S29 | BLEVE | Tank 40 000 l (20 000 kg angenommen): Feuerballradius | Transport Canada | 78,7 | 81 | m | -2,28 | -2,82 % | 0,9 bis 1,1 | bestanden | Füllmasse angenommen |
| S30 | BLEVE | Tank 4000 l: Abstand Einsatzkräfte (4 Radien) | Transport Canada | 146 | 150 | m | -3,85 | -2,57 % | 0,9 bis 1,1 | bestanden |  |
| S31 | BLEVE | Tank 40 000 l: Abstand Einsatzkräfte (4 Radien) | Transport Canada | 315 | 320 | m | -5,13 | -1,6 % | 0,9 bis 1,1 | bestanden |  |
| S32 | Explosion | Überdruck bei skaliertem Abstand 10 | Größenordnung 10 kPa (nicht abgeglichen) | 9,99 | 10 | kPa | -0,015 | -0,146 % | 0,85 bis 1,15 | bestanden | Referenzwert nicht abgeglichen |
| S33 | Gauß | Vergleich mit NOAA ALOHA (passives Gas) | ALOHA | – | – | – | – | – | – | nicht prüfbar | Programm nicht ausführbar, keine veröffentlichte Beispielrechnung beschafft |
| S34 | Gauß | Feldversuch passiv (z. B. Prairie Grass) | Versuchsdaten | – | – | – | – | – | – | nicht prüfbar | Daten nicht beschafft |
| S35 | Schwergas | Vergleich mit DEGADIS | DEGADIS | – | – | – | – | – | – | nicht prüfbar | Programm nicht ausführbar |
| S36 | Schwergas | Vergleich mit SLAB | SLAB | – | – | – | – | – | – | nicht prüfbar | Programm nicht ausführbar |
| S37 | Schwergas | Originalnomogramme Britter-McQuaid | Workbook 1988 | – | – | – | – | – | – | nicht prüfbar | Primärquelle lag nicht vor |
| S38 | Toxikologie | AEGL-Werte gegen amtliche Liste | US-Umweltbehörde | – | – | – | – | – | – | nicht prüfbar | Abgleich noch nicht durchgeführt |
| S39 | Brandrauch | Rauchkonzentration am Boden | Versuchsdaten | – | – | – | – | – | – | nicht prüfbar | keine Referenz; Emissionsdaten nicht belegt |
| S40 | Brandrauch | Brandüberhöhung großer Flächenbrände | Versuchsdaten | – | – | – | – | – | – | nicht prüfbar | keine Referenz beschafft |
| S41 | Vegetationsbrand | Ausbreitungsgeschwindigkeit gegen Rothermel | Rothermel | – | – | – | – | – | – | nicht prüfbar | Rothermel nicht umgesetzt, keine Vergleichsrechnung |
| S42 | Vegetationsbrand | dokumentierter Brandverlauf | Ereignisdaten | – | – | – | – | – | – | nicht prüfbar | keine Daten beschafft |
| S43 | Explosion | Gaswolkenexplosion gegen TNO Multi-Energy | TNO | – | – | – | – | – | – | nicht prüfbar | Kurven nicht verfügbar |
| S44 | Explosion | Rechenbeispiel CCPS | CCPS | – | – | – | – | – | – | nicht prüfbar | Quelle nicht verfügbar |
| S45 | BLEVE | Wärmestrahlung gegen Rechenbeispiel CCPS/TNO | CCPS/TNO | – | – | – | – | – | – | nicht prüfbar | Quelle nicht verfügbar |
| S46 | Gewässer | Fließgeschwindigkeit gegen Messung | HLNUG | – | – | – | – | – | – | nicht prüfbar | keine Geschwindigkeitsmessung verfügbar |

46 Szenarien: 26 bestanden, 6 nicht bestanden, 14 nicht prüfbar.

Jack Rabbit II, 12 Wertepaare (Entfernung Modell zu Messbogen): geometrisches Mittel 0,685, geometrische Varianz 1,41, Anteil innerhalb Faktor 2: 75 %, mittlere quadratische Abweichung im Logarithmus 0,584.
