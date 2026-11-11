# Aufbau des Programms

Stand: Modellstand 0.11 vom 11.11.2026.

## Dateien

| Datei | Inhalt | Braucht den Browser |
|---|---|---|
| `index.html` | Seitenaufbau, Gestaltung, Auswahllisten | ja |
| `js/modell-ausbreitung.js` | Schichtung, Ausbreitungsparameter, Gauß-Puff-Transport, Bodenkonzentration, Reichweite entlang der Achse, Brandüberhöhung, Geländefunktionen | nein |
| `js/modell-schwergas.js` | Britter-McQuaid: Kurven, Anfangszustand, Entfernung, Fortsetzung | nein |
| `js/modell-vegetationsbrand.js` | Brennstofffeuchte, Ausbreitungsgeschwindigkeit, Feuerfront | nein |
| `js/modell-explosion.js` | Druckwelle, Geländeschatten, BLEVE-Feuerball | nein |
| `js/stoffdaten.js` | Stoffliste mit Schwellen- und Stoffwerten | nein |
| `js/app-grundlagen.js` | Hilfsfunktionen, Rundung, Zustand der Anwendung | ja |
| `js/app-karte.js` | Karte, Ortswahl, Ortssuche | ja |
| `js/app-eingabe.js` | Eingabefelder, Reiter, Schalter | ja |
| `js/app-wetter.js` | Vorhersage, Modellvergleich, Stationsmessung | ja |
| `js/app-gelaende.js` | Höhendaten | ja |
| `js/app-rechnung.js` | Ablauf der Berechnung je Szenario, Modellwahl, Gewässer, Warnhinweise | ja |
| `js/app-anzeige.js` | Karte und Text der Ergebnisse, Tabelle | ja |
| `js/app-qualitaet.js` | Einstufung der Prognosequalität | ja |
| `js/app-bericht.js` | PDF-Auswertung | ja |
| `tests/modelltests.js` | automatischer Prüflauf der Rechenmodelle | nein |
| `sw.js` | Zwischenspeicher für den Start ohne Netz | ja |
| `docs/` | Prüfbericht, Modellbeschreibung, Konstantenregister, Validierung | – |

Die vier Modelldateien und die Stoffdaten enthalten keine Zugriffe auf die Seite. Sie lassen sich ohne Browser laden und einzeln prüfen.

## Prüflauf

```
node tests/modelltests.js
```

Der Lauf lädt die Modelldateien, rechnet alle Prüffälle und schreibt `docs/Validierung-Ergebnisse.md`. Er braucht nur Node.js, keine weiteren Pakete.

## Aktualisieren und veröffentlichen

1. Dateien ändern und den Prüflauf ausführen.
2. In `sw.js` die Bezeichnung des Zwischenspeichers hochzählen (`ausbreitung-v…`). Neue Dateien in die Liste `SHELL` eintragen.
3. In `js/app-qualitaet.js` den Modellstand (`MODEL_VERSION`) anpassen, wenn sich eine Rechnung ändert.
4. Änderungen auf den Zweig `main` übertragen. GitHub Pages veröffentlicht den Stand nach ein bis zwei Minuten. Der Zweig `gh-pages` wird als Kopie mitgeführt.
5. Auf dem Gerät die App schließen und neu öffnen.

## Noch nicht getrennt

- Die Berechnungsabläufe in `js/app-rechnung.js` mischen Eingabe, Rechnung und Aufbereitung für die Anzeige.
- Auswahllisten mit Rechenwerten (Brandgut, Vegetation, Bomben, Gase) stehen noch in `index.html` statt in `js/stoffdaten.js`.
- Eine toxikologische Bewertung als eigenes Modul gibt es noch nicht.
