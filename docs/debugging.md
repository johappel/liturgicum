# Debugging

## Ziel
Diese Datei dokumentiert die aktuell verfuegbaren Debug-Werkzeuge fuer Raum-Kalibrierung in `SpurenRoom`.

## Zonen-Debug (`?debugZones=1`)
Aktivierung:
- URL mit `?debugZones=1`

Funktionen:
- Sichtbare Overlays fuer Wasser- und Weg-Polygon
- Vertex-Drag per Maus
- Polygon-Export in Konsole und Clipboard

Tasten:
- `W`: Wasser-Polygon aktiv
- `D`: Weg-Polygon aktiv
- `A`: Punkt am Cursor hinzufuegen
- `N`: Punkt auf naechster Kante einfuegen
- `M`: Polygon unterteilen
- `Delete` / `Backspace`: naechsten Punkt loeschen
- `P`: aktuelle Polygone exportieren

## Perspektiv-Debug (`?debugPerspective=1`)
Aktivierung:
- URL mit `?debugPerspective=1`

Funktionen:
- Sichtbarer Marker fuer `vanishingPoint`
- Sichtbarer Marker fuer `referencePoint`
- Verbindungslinie zwischen beiden Punkten
- Marker-Drag per Maus
- Export in Konsole und Clipboard

Tasten:
- `V`: `vanishingPoint` aktivieren
- `R`: `referencePoint` aktivieren
- `Arrow Keys`: aktiven Punkt fein verschieben
- `Shift` + `Arrow Keys`: aktiven Punkt grob verschieben
- `O`: aktuelle Perspektivkonfiguration exportieren

## Aktuelle Kalibrierung (Spuren)
```ts
const GROUND_PERSPECTIVE = {
  vanishingPoint: {"x":0.7828125,"y":0.2970946579194002},
  referencePoint: {"x":0.24479166666666666,"y":0.8537956888472352},
  minScale: 0.025,
  nearScale: 0.74,
};
```

## Wo Polygone in Spuren eintragen
Die exportierten Werte aus dem Zonen-Debug werden in `app/src/rooms/SpurenRoom.ts` direkt in die beiden Konstanten am Dateianfang eingetragen:

- `const WATER_POLY: NormPoint[] = [...]`
- `const WAY_DROP_ZONE: NormPoint[] = [...]`

Wichtig:
- Beide Konstanten enthalten die Basisdaten fuer den Raum.
- Zur Laufzeit werden daraus lokale Kopien erstellt (`waterPoly` und `wayDropZone`), damit Debug-Edits im laufenden Betrieb moeglich sind.
- Dauerhafte Aenderungen muessen immer in den Konstanten `WATER_POLY` und `WAY_DROP_ZONE` gespeichert werden.

Empfohlener Ablauf:
- Szene mit `?debugZones=1` kalibrieren
- mit `P` exportieren
- exportierte Arrays in `WATER_POLY` und `WAY_DROP_ZONE` in `app/src/rooms/SpurenRoom.ts` ersetzen
- danach Build/Test laufen lassen

## Wiederverwendung in weiteren Raeumen
Gemeinsame Hilfsfunktionen liegen in:
- `app/src/scene/perspectiveDebug.ts`

Enthaelt:
- `perspectiveGroundScaleAtPoint(...)`
- `drawPerspectiveDebugOverlay(...)`
- `findPerspectiveHandleAtPixel(...)`
- `setPerspectiveHandlePoint(...)`
- `nudgePerspectiveHandle(...)`
- `exportPerspectiveConfigConst(...)`

Empfehlung fuer neue Raeume:
- Lokale `GROUND_PERSPECTIVE`-Konfiguration pro Raum
- `?debugPerspective=1` als opt-in Debugmodus
- Exportierte Werte in den jeweiligen Raum zurueckschreiben
