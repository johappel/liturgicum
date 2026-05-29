# Governance-Audit — Erprobungsraum „Spuren" (Phase 3)

**Stand:** 2026-05-29
**Geprüftes Artefakt:** Spuren-Raum in `app/src/rooms/SpurenRoom.ts` mit Übergangs- und Reife-Logik aus `app/src/rooms/RoomManager.ts`, `app/src/scene/Transition.ts`, `app/src/rooms/VorhofRoom.ts`, `app/src/rooms/HoerenRoom.ts`, `app/src/rooms/SpurenSimulator.ts`.
**Prüfraster:** [docs/TESTS/Kontrollfragen.md](Kontrollfragen.md).

Pro Abschnitt **Befund** + **Ampel** (Grün / Gelb / Rot) + ggf. **Maßnahme**.

---

## 1. Grundprüfung

> Vertieft dieses Element Anwesenheit, Resonanz, Würde und leise Wirksamkeit?

**Befund:** Der Raum ist bildlich-still, keine Texte, keine Punkte, keine Profile. Eintritt erfolgt erst nach einer eigenen Geste (kein Auto-Start). Reife öffnet den Raum stufenweise (20 / 45 / 90 s) statt sofort alles zu zeigen. **Ampel: Grün.**

## 2. Präsenz

**Befund:** Kein UI im Bild außer dem Notausstieg-Button (Manifest-konform begründet). Verweilen wird gefördert durch verzögerte Reife (Ausgang erscheint frühestens nach 90 s). Atmosphärische Schichten (FogLayer, DustEmitter, Silhouetten-Simulator) erzeugen Lebendigkeit ohne Forderung. **Ampel: Grün.**

## 3. Stille

**Befund:** Ambient-Drone ist *eine* Spur (low drone), modulierbar über Master-Volume; FogLayer atmet visuell statt zu blinken. Kein UI-Sound, keine Erfolgs-Töne. One-Shots (Kerze, Wasserring) sind sparsam und kurz. Risiko: nur ein Audio-Stem → bei Stille-Pausen läuft die Schleife durch. **Ampel: Gelb.** *Maßnahme:* Phase 1.6 manuell vervollständigen (candle_breath, stone_drop, water_ring), zusätzlich „Atemlücken" im Loop akzeptieren.

## 4. Resonanz

**Befund:** Kerze setzen → Lichthof + warmer Klang; Stein in Wasserkante → Welle + Klang. Beide reagieren über mehrere Sekunden (Flamme 24 s TTL, WaterRing 4 s). Spuren-Simulator zeigt Fremd-Präsenz ohne Profilbindung. **Ampel: Grün.**

## 5. Anonymität und Würde

**Befund:** Keine Avatare, keine Namen, keine Zahlen. Silhouetten sind generische Sprites mit zufälliger Variante, fadeIn/Out. Keine Persistenz, keine Identifikatoren im State. **Ampel: Grün.**

## 6. Nähe und Distanz

**Befund:** Rückweg explizit verschieden vom Vorwärtsweg (1,5 s Halten unten = „loslassen" statt „weiterziehen"). Beobachten ist möglich (man muss nichts antippen). Notausstieg jederzeit. **Ampel: Grün.**

## 7. Liturgische Qualität

**Befund:** Eintritt (Vorhof → Spuren, 5,5 s Veil-Crossfade), Aufenthalt (Reife in drei Stufen), Ausgang (Spuren → Hören als „dunkler Vorgeschmack"). Übergänge nutzen `easeInOutCubic` über `Graphics`-Schleier — atmosphärisch, nicht informativ. **Ampel: Grün.**

## 8. Klage

**Befund:** Kein explizites Klage-Element in Spuren (per Konzept Vorarbeit für Hören/Klage). Hörraum schließt mit gedämpfter Drohne ab — Schmerz wird *gerahmt*, nicht ausgespielt. **Ampel: Grün** (Klage gehört in Phase 5 spezifischer Raum).

## 9. Hoffnung

**Befund:** Hoffnung wird nicht behauptet. Stattdessen leise Selbstwirksamkeit: eigene Kerze leuchtet, eigener Stein liegt im Wasser, fremde Spuren bleiben sichtbar. Keine „Erfolgs"-Belohnung. **Ampel: Grün.**

## 10. Sinnhaftigkeit und Berufung

**Befund:** Die eigene Geste verändert sichtbar den Raum (Flamme, Wellenkreis, Trace). Spurensimulator zeigt Mit-Anwesenheit. Kein Score. Ausgang nach Hören wird nicht als Belohnung gezeigt, sondern als Lichthof, der einlädt. **Ampel: Grün.**

## 11. Technik

**Befund:** Statischer Build, kein Login, kein Tracking, kein Netzwerk außer Asset-Load. `prefers-reduced-motion` respektiert (Vorhof/Spuren: kein Fog/Dust/Smoke, Simulator ohne neue Spawns, Transition 1,5 s). Notausstieg via Esc + Button. Datenschutz: kein User-Identifier im Store. **Ampel: Gelb.** *Maßnahme:* A11y-Phase 6.5 (Untertitel, Tastaturanker-Navigation, Kontrastmodus) steht aus.

## 12. Anti-Plattform-Prüfung

**Befund:** Keine Likes, kein Follower-System, keine Rankings, keine Badges, keine Streaks, keine öffentlichen Nutzerzahlen, keine Profile, keine Kommentare, kein Algorithmus, keine Engagement-Schleifen, keine Vergleichbarkeit, keine Selbstdarstellung. Spuren-Simulator ist *lokal* und zeigt keine Verbindung zu echten Personen. **Ampel: Grün.**

## 13. Audio-Prüfung

**Befund:** Tiefer Drone, kein Beat, keine Auflösung. One-Shots sind atemnah. `setVolume`/`setMuted` in AudioEngine vorbereitet (UI-Anbindung steht aus). Textalternativen für Klang fehlen noch. **Ampel: Gelb.** *Maßnahme:* in 6.5 ein dezentes Lautstärke-/Mute-UI ergänzen; Transkripte für Hör-Impulse, sobald Hörraum eigene Inhalte hat.

## 14. Visuelle Prüfung

**Befund:** Hintergrund symbolisch, kein Foto-Realismus. Anker sind angedeutet, Hit-Zonen nicht markiert. Lichthof am Ausgang ist nur ein weicher radialer Gradient — keine Pfeile, kein Button. Dunkelheit wird im Hörraum gehalten ohne Drohgebärde. Risiko: aktuelle gpt-image-2-Anker sind als rechteckige Sprites in den Raum gesetzt; das wirkt teilweise „aufgeklebt". **Ampel: Gelb.** *Maßnahme:* Alpha-Vignetten für Anker (Weiß→Alpha-Shader oder PNG-Maske) oder Anker neu mit transparentem Hintergrund rendern.

## 15. Impuls-Prüfung

**Befund:** Aktuell *keine* Text-Impulse im Erprobungsraum (Hörraum endet stumm-atmosphärisch). Das ist Manifest-konform für die Erprobungsstufe. **Ampel: Grün** (Impulse erst in Phase 5/6 vorgesehen).

## 16. Ausgangsraum-Prüfung

**Befund:** Schwellenraum / Sendung sind *nicht* Teil des Erprobungsraums (per Plan in Phase 7). Keine Persistenz, keine öffentliche Anzeige. **Ampel: Grün** (out-of-scope).

## 17. Evaluationsfragen

Für Phase 4 verwendbar:
- Hattest du das Gefühl, allein zu sein?
- Hast du andere Menschen gespürt, ohne sie zu sehen?
- Gab es einen Moment von Stille?
- War dir klar, wie du den Raum verlassen kannst?
- Hat deine Handlung Bedeutung gehabt?
- Hat etwas nach App/Spiel/Plattform gewirkt?
- Würdest du diesen Raum in einem schwierigen Moment wieder betreten?

---

## 18. Gesamt-Ampel

**Gelb mit klarer Tendenz Grün.**

**Grün** in: Präsenz, Resonanz, Anonymität & Würde, Nähe/Distanz, liturgische Qualität, Klage-Wahrung, Hoffnung, Berufung, Anti-Plattform-Logik, Impuls-Disziplin.

**Gelb** (Maßnahmen offen) in:
1. **Audio-Vollständigkeit:** 3 fehlende Pixabay-One-Shots (`candle_breath.mp3`, `stone_drop.mp3`, `water_ring.mp3`) → Phase 1.6 Hand-Off.
2. **Accessibility:** Tastaturanker-Navigation, Untertitel, Kontrastmodus → eigene Phase 6.5.
3. **Visuelle Integration:** Anker-Sprites mit transparenter Maske oder rerendern → kleines Asset-Patch.

**Rot:** keine.

---

## Verifikations-Lauf (Phase-3-Manuelles-Skript)

| Schritt | Erwartung | Stand |
| --- | --- | --- |
| App öffnen, keine Klicks | Vorhof: schwarzes Feld + leiser Fog, Drone wartet auf Geste | implementiert (Audio puffert via `pendingAmbient`) |
| Erster Klick irgendwo | 5,5 s Crossfade → Spuren | implementiert (RoomManager + Veil) |
| Kerzenfeld antippen | Flamme + Rauch + Kerzen-Klang | implementiert |
| Stein vom Steinbett in die Wasserkante ziehen | dumpfer Klang + WaterRing | implementiert (Klang sobald `water_ring.mp3` da ist) |
| Stein außerhalb der Zone loslassen | Stein verschwindet ohne Klang | implementiert |
| ~20 s warten | Wasserkante wird klar sichtbar | implementiert (Alpha-Tween) |
| ~45 s warten | Atmosphäre wird dichter | implementiert (FogLayer-Intensität 0,35 → 0,55) |
| ~90 s warten | weicher Lichthof oben-rechts erscheint | implementiert (`drawExitGlow`) |
| Lichthof antippen | 6,5 s Crossfade → Hören (dunkel + Drone) | implementiert |
| Im Spurenraum unten 1,5 s halten | Crossfade „back" → Vorhof | implementiert |
| OS reduced-motion | Übergänge 1,5 s, keine Partikel | implementiert |
| Netzwerk-Tab beim Lauf | nur initialer Asset-Load, danach kein Traffic | erwartet (kein WS in Phase 3) |
| Esc | sofortiger Rücksprung in Vorhof | implementiert (`exitRoom`) |

## Manifest-Check (kompakt)

- Anwesenheit & Würde: gewahrt.
- Stille & Resonanz: gewahrt, audioseitig noch unvollständig.
- Anti-Plattform: vollständig.
- Berufung statt Engagement: gewahrt (Reife statt Belohnung).
- Verletzlichkeit: geschützt (kein Identifier, keine Sichtbarkeit von Fremden).
