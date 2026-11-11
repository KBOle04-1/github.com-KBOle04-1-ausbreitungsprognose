# Validierung: Ergebnisse des automatischen Prüflaufs

Erzeugt von `node tests/modelltests.js`. Diese Datei nicht von Hand ändern.

Art der Referenz: **A** analytische Lösung, **L** Lehrbuch oder veröffentlichtes Rechenbeispiel, **V** veröffentlichte Versuchsdaten, **K** Konsistenzprüfung der Umsetzung.

Geprüft: 49 Fälle, bestanden: 46, nicht bestanden: 3.

| Nr. | Art | Prüffall | Ergebnis | Referenz | Einheit | Verhältnis | Zulässig | Bewertung | Referenzquelle |
|---|---|---|---|---|---|---|---|---|---|
| G01 | A | Gauß-Fahne Freifläche, Klasse A, 3 m/s, 1 km | 2,5 | 2,53 | mg/m³ je kg/s | 0,989 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G02 | A | Gauß-Fahne Freifläche, Klasse B, 3 m/s, 1 km | 5,69 | 5,8 | mg/m³ je kg/s | 0,982 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G03 | A | Gauß-Fahne Freifläche, Klasse C, 3 m/s, 1 km | 13,5 | 13,8 | mg/m³ je kg/s | 0,972 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G04 | A | Gauß-Fahne Freifläche, Klasse D, 3 m/s, 1 km | 34,9 | 36,6 | mg/m³ je kg/s | 0,954 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G05 | A | Gauß-Fahne Freifläche, Klasse E, 3 m/s, 1 km | 74,7 | 80,2 | mg/m³ je kg/s | 0,931 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G06 | A | Gauß-Fahne Freifläche, Klasse F, 3 m/s, 1 km | 201 | 225 | mg/m³ je kg/s | 0,895 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G07 | A | Gauß-Fahne Bebauung, Klasse A, 3 m/s, 1 km | 1,16 | 1,16 | mg/m³ je kg/s | 1,01 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G08 | A | Gauß-Fahne Bebauung, Klasse B, 3 m/s, 1 km | 1,16 | 1,16 | mg/m³ je kg/s | 1,01 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G09 | A | Gauß-Fahne Bebauung, Klasse C, 3 m/s, 1 km | 2,82 | 2,85 | mg/m³ je kg/s | 0,99 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G10 | A | Gauß-Fahne Bebauung, Klasse D, 3 m/s, 1 km | 6,27 | 6,39 | mg/m³ je kg/s | 0,981 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G11 | A | Gauß-Fahne Bebauung, Klasse E, 3 m/s, 1 km | 21,7 | 22,5 | mg/m³ je kg/s | 0,963 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G12 | A | Gauß-Fahne Bebauung, Klasse F, 3 m/s, 1 km | 21,7 | 22,5 | mg/m³ je kg/s | 0,963 | 0,85 bis 1,15 | bestanden | Q/(π·σy·σz·u) |
| G13 | A | Gauß-Fahne Quellhöhe 50 m, Klasse D, 1 km | 11,9 | 12,1 | mg/m³ je kg/s | 0,989 | 0,85 bis 1,15 | bestanden | Gauß-Fahne mit Bodenreflexion |
| G14 | K | Massenerhaltung Einzelwolke 1000 kg nach 10 min | 998 | 1.000 | kg | 0,998 | 0,97 bis 1,03 | bestanden | Integral der Bodenkonzentration |
| R01 | A | Reichweite AEGL-2 Chlor 0,5 kg/s, Klasse D, 3 m/s, Gebiet ± 10 km | 1.970 | 2.010 | m | 0,981 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R02 | A | Reichweite AEGL-3 Chlor 0,5 kg/s, Klasse D, 3 m/s, Gebiet ± 10 km | 477 | 499 | m | 0,956 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R03 | A | Reichweite AEGL-1 Chlor 0,5 kg/s, Klasse D, 3 m/s, Gebiet ± 50 km | 5.130 | 5.190 | m | 0,989 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R04 | A | Reichweite AEGL-2 Chlor 0,5 kg/s, Klasse D, 3 m/s, Gebiet ± 50 km | 1.970 | 2.010 | m | 0,981 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R05 | A | Reichweite AEGL-3 Chlor 0,5 kg/s, Klasse D, 3 m/s, Gebiet ± 50 km | 477 | 499 | m | 0,956 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R06 | A | Reichweite AEGL-2 Chlor 0,5 kg/s, Klasse F, 1.5 m/s, Gebiet ± 50 km | 15.700 | 16.200 | m | 0,969 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R07 | A | Reichweite AEGL-3 Chlor 0,5 kg/s, Klasse F, 1.5 m/s, Gebiet ± 50 km | 2.160 | 2.270 | m | 0,955 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R08 | A | Reichweite AEGL-1 Chlor 0,5 kg/s, Klasse A, 2 m/s, Gebiet ± 5 km | 1.120 | 1.130 | m | 0,995 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R09 | A | Reichweite AEGL-2 Chlor 0,5 kg/s, Klasse A, 2 m/s, Gebiet ± 5 km | 552 | 556 | m | 0,991 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R10 | A | Reichweite AEGL-3 Chlor 0,5 kg/s, Klasse A, 2 m/s, Gebiet ± 5 km | 170 | 174 | m | 0,978 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R11 | A | Reichweite AEGL-1 Chlor 0,5 kg/s, Klasse D, 10 m/s, Gebiet ± 20 km | 2.230 | 2.270 | m | 0,985 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R12 | A | Reichweite AEGL-2 Chlor 0,5 kg/s, Klasse D, 10 m/s, Gebiet ± 20 km | 988 | 948 | m | 1,04 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| R13 | A | Reichweite AEGL-3 Chlor 0,5 kg/s, Klasse D, 10 m/s, Gebiet ± 20 km | 295 | 256 | m | 1,15 | 0,8 bis 1,2 | bestanden | Gauß-Fahne, Achse |
| B01 | K | Britter-McQuaid: größter Sprung zwischen Kurvenstücken (soll unter 0,02 in log10) | 1,01 | 1 | 1 + Sprung | 1,01 | 1 bis 1,02 | bestanden | Stetigkeit der Nomogrammkurven |
| B02 | L | Britter-McQuaid: Flüssigerdgas 0,23 m³/s, Wind 10,9 m/s, Entfernung bis 5 Vol.-% | 367 | 367 | m | 1 | 0,95 bis 1,05 | bestanden | Rechenbeispiel Crowl & Louvar, Chemical Process Safety (aus dem Gedächtnis zitiert, Abgleich steht aus) |
| J01 | V | Jack Rabbit II Versuch 6: Entfernung, in der 44.000 ppm erreicht werden (berechnet) | 168 | 200 | m | 0,84 | 0,5 bis 2 | bestanden | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J02 | V | Jack Rabbit II Versuch 6: Entfernung, in der 1.900 ppm erreicht werden (berechnet) | 758 | 1.000 | m | 0,758 | 0,5 bis 2 | bestanden | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J03 | V | Jack Rabbit II Versuch 6: Entfernung, in der 630 ppm erreicht werden (abgeleitet) | 1.320 | 2.000 | m | 0,662 | 0,5 bis 2 | bestanden | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J04 | V | Jack Rabbit II Versuch 7: Entfernung, in der 70.000 ppm erreicht werden (berechnet) | 256 | 200 | m | 1,28 | 0,5 bis 2 | bestanden | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J05 | V | Jack Rabbit II Versuch 7: Entfernung, in der 1.200 ppm erreicht werden (abgeleitet) | 1.180 | 2.000 | m | 0,588 | 0,5 bis 2 | bestanden | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J06 | V | Jack Rabbit II Versuch 7: Entfernung, in der 340 ppm erreicht werden (abgeleitet) | 1.960 | 5.000 | m | 0,392 | 0,5 bis 2 | **nicht bestanden** | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J07 | V | Jack Rabbit II Versuch 7: Entfernung, in der 50 ppm erreicht werden (abgeleitet) | 4.460 | 11.000 | m | 0,405 | 0,5 bis 2 | **nicht bestanden** | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J08 | V | Jack Rabbit II Versuch 9: Entfernung, in der 29.000 ppm erreicht werden (berechnet) | 320 | 200 | m | 1,6 | 0,5 bis 2 | bestanden | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J09 | V | Jack Rabbit II Versuch 9: Entfernung, in der 1.900 ppm erreicht werden (berechnet) | 1.050 | 1.000 | m | 1,05 | 0,5 bis 2 | bestanden | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J10 | V | Jack Rabbit II Versuch 9: Entfernung, in der 1.300 ppm erreicht werden (berechnet) | 1.290 | 2.000 | m | 0,643 | 0,5 bis 2 | bestanden | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J11 | V | Jack Rabbit II Versuch 9: Entfernung, in der 300 ppm erreicht werden (abgeleitet) | 2.550 | 5.000 | m | 0,51 | 0,5 bis 2 | bestanden | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| J12 | V | Jack Rabbit II Versuch 9: Entfernung, in der 100 ppm erreicht werden (abgeleitet) | 4.240 | 11.000 | m | 0,386 | 0,5 bis 2 | **nicht bestanden** | gemessene Spitzenkonzentration am Messbogen (CISA 2019), Versuchsdaten nach Hanna et al. |
| B03 | K | Modellwahl: Ammoniakgas bei Umgebungstemperatur ist leichter als Luft (g0 < 0) | 1 | 1 | ja = 1 | 1 | 1 bis 1 | bestanden | Dichtevergleich |
| B04 | K | Modellwahl: Chlor 0,5 kg/s bei 3 m/s erfüllt das Schwergaskriterium | 1 | 1 | ja = 1 | 1 | 1 bis 1 | bestanden | Kennzahl ≥ 0,15 |
| B05 | K | Modellwahl: Kennzahl für Chlor 0,001 kg/s bei 10 m/s (unter 0,15, also passiv) | 0,094 | 0,094 | – | 0,996 | 0,97 bis 1,03 | bestanden | Handrechnung |
| V01 | K | Vegetationsbrand: Kopf der Brandellipse nach 1 h | 3.420 | 3.440 | m | 0,993 | 0,95 bis 1,05 | bestanden | vorgegebene Ellipse |
| V02 | K | Vegetationsbrand: Halbbreite der Brandellipse nach 1 h | 708 | 718 | m | 0,986 | 0,9 bis 1,1 | bestanden | vorgegebene Ellipse |
| E01 | L | Kinney-Graham: Überdruck bei skaliertem Abstand 10 m/kg^(1/3) | 9,99 | 10 | kPa | 0,999 | 0,85 bis 1,15 | bestanden | Größenordnung nach Kingery-Bulmash-Kurven (aus dem Gedächtnis, Abgleich steht aus) |
| E02 | L | BLEVE: Feuerballradius Tank 4000 l (2000 kg Propan angenommen) | 36,5 | 38 | m | 0,962 | 0,9 bis 1,1 | bestanden | Transport Canada, BLEVE – Response and Prevention |
| E03 | L | BLEVE: Feuerballradius Tank 40 000 l (20 000 kg Propan angenommen) | 78,7 | 81 | m | 0,972 | 0,9 bis 1,1 | bestanden | Transport Canada, BLEVE – Response and Prevention |
