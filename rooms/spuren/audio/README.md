# Spuren — Audio-Stems (Phase 1.6 Hand-Off)

Diese Dateien werden **nicht** committed (per `.gitignore` Konvention)
sondern manuell aus Pixabay (CC0) bezogen und hier abgelegt.

## Erwartete Dateien

Die Engine sucht (siehe `app/src/assets/manifest.ts` und
`app/src/rooms/SpurenRoom.ts`) nach folgenden Pfaden:

| Datei | Verwendung | Empfehlung Pixabay-Suche |
| --- | --- | --- |
| `ambient_low_drone.mp3` | Ambient-Loop des Raums (crossfade beim Eintritt) | „low drone meditation", „stone hum", 60–120 s, sehr ruhig |
| `candle_breath.mp3` | One-Shot beim Entzünden einer Kerze | „candle ignite", „match strike soft", < 1 s |
| `stone_drop.mp3` | One-Shot beim Ablegen eines Steins (reserviert) | „pebble drop water", „stone tap", < 1 s |
| `water_ring.mp3` | One-Shot beim Auslösen des Wasserrings | „water ripple soft", „bowl tone", 1–3 s |

## Auswahlregeln (Manifest-konform)

- Nur CC0 / Pixabay-Lizenz.
- Keine erkennbaren Stimmen, keine Sprache.
- Keine westliche Tonleiter-Auflösung (keine Akkord-Auflösungen, keine Beats).
- Eher Klanglandschaft, Resonanz, atmender Loop.
- Möglichst hoher Headroom (− 18 dB FS) — die Engine moduliert die Lautstärke.

## Quellen-Dokumentation

Nach dem Ablegen bitte in `rooms/spuren/meta.json` eine Audio-Sektion mit
Pixabay-URL und Lizenz-Hinweis pro Datei ergänzen, analog zu den Bild-Assets.

## Solange keine Datei da ist

Die Audio-Engine scheitert seit dem Fix in `AudioEngine.ts` *still* — fehlende
URLs werden beim ersten Ladeversuch aus dem internen Cache entfernt und tauchen
in der Konsole nur einmal als Howler-Warnung auf.
