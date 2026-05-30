# Debugging

## Ziel
Diese Datei dokumentiert die aktuell verfuegbaren Debug-Werkzeuge fuer Raum-Kalibrierung in `SpurenRoom`.

## Zonen-Debug (`?debugZones=1`)
Aktivierung:
- URL mit `?debugZones=1`

Funktionen:
- Sichtbare Overlays fuer Wasser-, Weg- und Steinablage-Polygone
- Vertex-Drag per Maus
- Polygon-Export in Konsole und Clipboard

Tasten:
- `W`: Wasser-Polygon aktiv
- `D`: Weg-Polygon aktiv
- `S`: Steinablage-Polygon aktiv
- `1` / `2` / `3`: Steinablage-Zone 1 bis 3 aktivieren
- `A`: Punkt am Cursor hinzufuegen
- `N`: Punkt auf naechster Kante einfuegen
- `M`: Polygon unterteilen
- `Delete` / `Backspace`: naechsten Punkt loeschen
- `P`: aktuelle Polygone exportieren

Exportierte Konstanten:
- `WATER_POLY`
- `STONE_DROP_ZONES`
- `WAY_DROP_ZONE`

Verhalten:
- Steine duerfen nur in `STONE_DROP_ZONES` abgelegt werden.
- Kerzen duerfen nur in `WAY_DROP_ZONE` abgelegt werden, nicht im Wasser und nicht in Steinzonen.
- Ungueltige Drops springen nicht mehr in eine Ersatzposition, sondern verschwinden beim Loslassen.

## Aktionszonen-Debug (`?debugActionZones=1`)
Aktivierung:
- URL mit `?debugActionZones=1`

Funktionen:
- Sichtbare Overlays fuer Forward-, Back-, Kerzenquell- und Steinquell-Zonen
- Vertex-Drag per Maus
- Polygon-Export in Konsole und Clipboard

Tasten:
- `F`: Forward-/Ausgangszone aktiv
- `B`: Back-/Rueckwegzone aktiv
- `C`: Kerzenquelle aktiv
- `1` / `2` / `3`: Kerzenquelle 1 bis 3 aktivieren
- `T`: Steinquelle aktiv
- `A`: Punkt am Cursor hinzufuegen
- `N`: Punkt auf naechster Kante einfuegen
- `M`: Polygon unterteilen
- `Delete` / `Backspace`: naechsten Punkt loeschen
- `P`: aktuelle Aktionspolygone exportieren

Exportierte Konstanten:
- `GATE_POLY`
- `BACK_ACTION_POLY`
- `STONE_SOURCE_POLY`
- `CANDLE_SOURCE_POLYS`

Verhalten:
- Klick in `GATE_POLY` ruft direkt `onRequestForward` auf.
- Klick in `BACK_ACTION_POLY` ruft direkt `onRequestBack` auf.
- Die fruehere Reife-/Hold-Logik bleibt nicht die primaere Bediengeste fuer diese Aktionszonen.

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
  vanishingPoint: {"x":0.7276041666666667,"y":0.4075595126522962},
  referencePoint: {"x":0.6520833333333333,"y":0.9325210871602624},
  minScale: 0.0025,
  nearScale: 0.89,
};
```

Hinweis:
- Dieselbe Perspektivkonfiguration steuert Objektgroesse und Effektlautstaerke.
- Audioeffekte nahe am `vanishingPoint` werden stark gedaempft.
- Richtung `referencePoint` steigen One-Shots weich auf ihre volle lokale Intensitaet.

## Wo Polygone in Spuren eintragen
Die exportierten Werte aus den Debug-Modi werden in `app/src/rooms/SpurenRoom.ts` direkt in die Konstanten am Dateianfang eingetragen:

- `const WATER_POLY: NormPoint[] = [...]`
- `const STONE_DROP_ZONES: NormPoint[][] = [...]`
- `const WAY_DROP_ZONE: NormPoint[] = [...]`
- `const GATE_POLY: NormPoint[] = [...]`
- `const BACK_ACTION_POLY: NormPoint[] = [...]`
- `const STONE_SOURCE_POLY: NormPoint[] = [...]`
- `const CANDLE_SOURCE_POLYS: NormPoint[][] = [...]`

Wichtig:
- Diese Konstanten enthalten die Basisdaten fuer den Raum.
- Zur Laufzeit werden daraus lokale Kopien erstellt, damit Debug-Edits im laufenden Betrieb moeglich sind.
- Dauerhafte Aenderungen muessen immer in den Konstanten gespeichert werden, nicht nur in der Browser-Konsole.

Empfohlener Ablauf:
- Szene mit `?debugZones=1` kalibrieren
- mit `P` exportieren
- exportierte Arrays in `WATER_POLY`, `STONE_DROP_ZONES` und `WAY_DROP_ZONE` in `app/src/rooms/SpurenRoom.ts` ersetzen
- Szene mit `?debugActionZones=1` kalibrieren
- exportierte Arrays in `GATE_POLY`, `BACK_ACTION_POLY`, `STONE_SOURCE_POLY` und `CANDLE_SOURCE_POLYS` ersetzen
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
