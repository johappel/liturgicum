# Technischer Implementationsplan

> **Quelle der Wahrheit:** Der operative Plan (Phasen, Tasks, Abhängigkeiten, Verifikation) lebt in der Session-Plan-Datei `/memories/session/plan.md`. Dieses Dokument fasst die *projekt-übergreifenden* Festlegungen zusammen, die unabhängig von der konkreten Phase gelten: Risiken, Definition of Done, Evaluations-Haltung (Anti-Metriken). Der zuvor hier dokumentierte 12-Phasen-Plan ist in den Session-Plan überführt und durch den dortigen, präziseren Erprobungsraum-Ansatz ersetzt.

## 1. Ziel des Prototyps

Der erste technische Prototyp soll *nicht* alle theologischen, sozialen und liturgischen Dimensionen vollständig umsetzen. Er soll beweisen, dass die zentrale Erfahrung technisch und ästhetisch tragfähig ist:

> Ein Mensch betritt einen digitalen Raum, erlebt Stille, indirekte Gegenwart anderer, symbolische Handlung und leise Wirksamkeit — ohne Chat, Profil, Avatar oder Gamification.

Konkret: Wir bauen *einen* vollständigen Erprobungsraum (**Spuren**, inkl. Eintritt aus Vorhof und Ausgang nach Hören) als laufenden Prototyp auf statischem Host, mit lokal simulierten Fremd-Spuren statt WebSocket. Erst danach Skalierung auf die übrigen Räume und Ko-Präsenz-Server.

## 2. Umsetzungsprinzip

Browserbasierter 2D-Hybridraum: tragende Hintergrundbilder, Parallax-Tiefe, reaktive Klangereignisse, prozedurale Partikel und Shader (Flammen, Rauch, Nebel, Wasserkreise, Silhouetten), Portale als Schwellen, symbolische Artefakte. Kein vollwertiges Spiel, kein 3D-Raum, kein Social-Feature-Set, kein Build-up von Gamification.

Tooling, Architektur und Phasenfolge: siehe Session-Plan und [docs/Tech-Stack.md](docs/Tech-Stack.md).

## 3. Risiken und Gegenmaßnahmen

### 3.1 Zu spielerisch
- Keine Quests, keine Punkte, keine Items, keine Ziele.
- Gestenzyklus endet immer in Resonanz oder stillem Revert, nie in Belohnung.

### 3.2 Zu statisch
- Atmende Animationen (FogLayer, DustEmitter laufen passiv).
- Klangtiefe (Ambient + Reife-Stufen).
- Verweildauer-Reaktionen (Anker und Ausgänge werden erst über Zeit sichtbar).
- Subtile Raum-Antwort auf Pointer-Nähe.

### 3.3 Zu beliebig spirituell
- [docs/Liturgisches-Manifest.md](docs/Liturgisches-Manifest.md) als bindender Wertekompass.
- Klare Raumfolge ([docs/Raeume.md](docs/Raeume.md)).
- Kontrollierte Impulse, theologisch-philosophische Redaktion vor Veröffentlichung.

### 3.4 Zu sozial
- Keine Profile, keine Direktkommunikation.
- Nur aggregierte / anonymisierte Resonanz.
- Keine Nutzerzahlen, keine Listen, keine Identitäten.

### 3.5 Zu ästhetisch ohne Wirkung
- Klageraum, Berufungsraum, Sendungsimpuls als Tiefenanker.
- Evaluation mit Personas aus [docs/Konzept.md](docs/Konzept.md).
- Verbindliche Manifest-Checks am Ende jeder Phase.

## 4. Definition of Done

Ein Feature gilt nur dann als fertig, wenn es:

1. technisch funktioniert,
2. barrierearm nutzbar ist (Tastatur-Parität, Reduced Motion, Pausierbarkeit),
3. keine Plattformlogik einführt (keine Profile, kein Tracking, keine Engagement-Schleifen),
4. dem [Liturgischen Manifest](docs/Liturgisches-Manifest.md) nicht widerspricht,
5. durch [docs/TESTS/Kontrollfragen.md](docs/TESTS/Kontrollfragen.md) geprüft wurde,
6. ästhetisch zur Raumgrammatik aus [docs/Raeume.md](docs/Raeume.md) passt,
7. keine unnötigen personenbezogenen Daten erzeugt (Datensparsamkeit als Default, nicht als Option).

## 5. Evaluations-Haltung und Anti-Metriken

Methoden:

- qualitative Interviews,
- Beobachtung von Nutzungserfahrungen,
- Reflexionsfragen nach Nutzung,
- Tests mit unterschiedlichen Personas,
- Prüfung gegen Manifest und Kontrollfragen.

**Explizit *keine* primären Erfolgsmetriken:**

- Verweildauer
- Klickrate
- Wiederkehrrate
- Engagement

Diese Größen werden weder gemessen noch angezeigt noch als Optimierungsziel verwendet. Sie sind keine Erfolgsgrößen für diesen Raum, weil sie das Manifest implizit umkehren würden (Aufmerksamkeit als Ressource, statt Aufmerksamkeit als Gabe).

Stattdessen qualitative Leitfragen:

- Wurde Anwesenheit vertieft?
- Wurde Stille erfahrbar?
- Wurde Ohnmacht gewürdigt?
- Wurde Handlungsmöglichkeit eröffnet?
- Entstand sozialer Druck?
- Blieb der Raum anonym und würdevoll?

## 6. Verbindliche Verweise

- Operativer Phasenplan: `/memories/session/plan.md`
- Vision und 9-Räume-Charta: [docs/Konzept.md](docs/Konzept.md)
- Wertekompass: [docs/Liturgisches-Manifest.md](docs/Liturgisches-Manifest.md)
- Raumgrammatik: [docs/Raeume.md](docs/Raeume.md)
- Übergänge: [docs/Raumuebergaenge.md](docs/Raumuebergaenge.md)
- Interaktion und A11y: [docs/Interaktions-Spezifikation.md](docs/Interaktions-Spezifikation.md)
- Design-Anker: [docs/Design-Artefakte.md](docs/Design-Artefakte.md)
- Tech-Stack: [docs/Tech-Stack.md](docs/Tech-Stack.md)
- Ko-Präsenz-Protokoll: [docs/WebSocket-Resonanzarchitektur.md](docs/WebSocket-Resonanzarchitektur.md)
- Asset-Schnittliste Spuren: [docs/Assets-Spuren.md](docs/Assets-Spuren.md)
- Prüfraster: [docs/TESTS/Kontrollfragen.md](docs/TESTS/Kontrollfragen.md)
