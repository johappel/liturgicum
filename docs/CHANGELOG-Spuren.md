# Changelog Spuren

Dieses Dokument fuehrt die umgesetzten Aenderungen fuer den Erprobungsraum Spuren als laufendes Arbeitsprotokoll.

## 2026-05-30 - v0.3.0

### Neu
- Einmalige liturgische Ankommensphase fuer Spuren:
  - Ambient `ambient_low_drone.mp3` bleibt als Raumgrund bestehen.
  - `intro_2.mp3` spielt zuerst als ca. 20 Sekunden Raumwahrnehmung.
  - Danach laeuft `spuren.mp3` als gesprochenes Willkommen; die Dauer wird automatisch aus den Audio-Metadaten ermittelt.
  - Der Intro-Text wird parallel als Textschicht eingeblendet.
  - `chakra.mp3` markiert danach die Freigabe der Interaktionen.
  - Reifezeit und 90-Sekunden-Hinweis starten erst nach dieser Freigabe.
- Session-Persistenz fuer abgelegte Artefakte (`placedArtifacts` im Zustand): Kerzen und Steine bleiben beim erneuten Betreten von Spuren erhalten.
- Direkte Aktionszonen fuer Navigation:
  - Forward-Zone (`GATE_POLY`) ruft direkt `onRequestForward` auf.
  - Back-Zone (`BACK_ACTION_POLY`) ruft direkt `onRequestBack` auf.
- Neuer Debugmodus `?debugActionZones=1` fuer Aktionspolygone (Forward, Back, Kerzenquellen, Steinquelle).
- Neues Silhouetten-Ende-Audio: `rooms/spuren/audio/hush.mp3` beim Verschwinden einer Presence.
- Distanzabhaengige Effektlautstaerke in Spuren:
  - Nahe Fluchtpunkt sehr leise.
  - Richtung Referenzpunkt weich ansteigend.
- Hinweis nach mindestens 90 Sekunden mit `chakra.mp3`, dass der naechste Raum offen ist.
- Nebel-Schwellenübergang von Spuren nach Hoeren:
  - Um den Ausgang bauen sich animierte Nebelschichten auf.
  - `rooms/hoeren/background.png` wird erst langsam und unklar im Nebel lesbar.
  - Der Wechsel wirkt dadurch mehr wie spirituelles Weitergehen als wie eine neue Folie.

### Geaendert
- Kerzenquellen auf mehrere Assetvarianten erweitert (`candle_1.png` bis `candle_4.png`) mit zufaelliger Auswahl.
- Kerzen und Steine erhalten zusaetzliche Zufallsvariation (Skalierung, horizontale Spiegelung).
- Kerzenflammen laufen bei platzierten Kerzen dauerhaft (`ttlSeconds: null`).
- Ungueltige Drops springen nicht mehr in Ersatzpositionen:
  - Waehrend Drag visuelles Feedback ueber reduzierte Alpha.
  - Beim Loslassen ausserhalb gueltiger Zone wird das Artefakt aufgeloest.
- Wasserresonanz-Visualisierung ueberarbeitet:
  - Groessere, laenger laufende, ruhige elliptische Ringe.
  - Vermeidung von blumen-/pulsartiger Wobble-Anmutung.
- Dezente fallende Federn als prozeduraler `LeafEmitter` im Mittelgrund ergaenzt und auf ruhige Dichte reduziert.

### Debug/Kalibrierung
- `?debugZones=1` erweitert fuer Steinablagezonen (`STONE_DROP_ZONES`, Auswahl per `S` und `1..3`).
- Export um neue Konstanten erweitert:
  - Zonen: `WATER_POLY`, `STONE_DROP_ZONES`, `WAY_DROP_ZONE`
  - Aktionen: `GATE_POLY`, `BACK_ACTION_POLY`, `STONE_SOURCE_POLY`, `CANDLE_SOURCE_POLYS`
- Perspektivkonfiguration (`GROUND_PERSPECTIVE`) auf aktuellen Kalibrierstand gebracht.

### Dokumentation
- Aktualisiert:
  - `docs/debugging.md`
  - `docs/Interaktions-Spezifikation.md`
  - `docs/Tech-Stack.md`
  - `docs/Raumuebergaenge.md`
  - `docs/Assets-Spuren.md`

### Bekannte Grenzen
- Artefaktpersistenz ist aktuell Session-basiert (lokaler Laufzeitzustand), nicht reload- oder geraeteuebergreifend.
- Bei Wiederherstellung bleiben Position/Typ/Alpha erhalten, visuelle Zufallsdetails (konkrete Variante/Spiegelung/Skalierungszufall) koennen abweichen.
