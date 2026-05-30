# Interaktions-Spezifikation
## Bedienmodell, Objektgrammatik und Resonanzlogik

Diese Spezifikation bündelt das Interaktionsmodell des digitalen Resonanzraums in einer Form, die sowohl für Konzeptarbeit als auch für spätere TypeScript-Typen, Eventnamen und Engine-Logik nutzbar ist.

Sie ergänzt:

- Konzept.md
- Design-Artefakte.md
- Tech-Stack.md
- WebSocket-Resonanzarchitektur.md

## 1. Leitgedanke

Der User steuert keine Spielfigur.

Der User ist im Raum anwesend und handelt durch:

- Aufmerksamkeit,
- Verweilen,
- Berührung,
- Halten,
- Ziehen,
- Übergeben,
- Loslassen.

Die Interaktion soll nicht wie klassische App-Bedienung oder Game-Mechanik wirken, sondern wie eine ruhige, symbolische Geste mit räumlicher Antwort.

## 2. Perspektive und Steuerung

### Perspektive

Die Grundperspektive ist eine ruhige Raumansicht mit fester oder nur sehr leicht reagierender Kamera.

Der User sieht:

- den Raum,
- seine Objekte,
- atmosphärische Reaktionen,
- gelegentlich eine flüchtige eigene Scherenschnitt-Andeutung,
- aber nicht dauerhaft einen steuerbaren Avatar.

### Eingabeformen

Für den MVP reichen wenige Eingabeformen:

- `tap`
- `press`
- `drag`
- `release`
- `dwell`

Diese Eingaben werden nicht als UI-Befehle verstanden, sondern als Raumgesten.

## 3. Interaktionsphasen

Vor den Objektinteraktionen kann ein Raum eine Ankommensphase haben. In dieser Zeit bleiben Hintergrund, Ambient und ggf. ein liturgischer Impuls wahrnehmbar, aber Praesenzen, Drag/Drop und andere Gesten werden noch nicht freigegeben. Der User soll zuerst den Raum betreten, nicht sofort ein System bedienen.

Im Spuren-Prototyp laeuft diese Phase einmalig pro Session:
- Ambient `ambient_low_drone.mp3` bleibt als Raumgrund bestehen.
- `intro_2.mp3` spielt als ca. 20 Sekunden langes Wahrnehmungsfenster.
- Danach laeuft `spuren.mp3` als gesprochene Einfuehrung.
- Parallel erscheint der Intro-Text als leise Textschicht im Raum.
- Danach markiert `chakra.mp3` die Freigabe der Interaktionen.
- Erst ab dieser Freigabe beginnt die Verweildauer-Zaehlung fuer Reife und geoeffnete Folgeraeume.

Die meisten Objektinteraktionen folgen derselben Grundlogik:

1. `reveal`
2. `claim`
3. `carry`
4. `offer`
5. `resonance`

### 3.1 Reveal

Ein Objekt zeigt beim Antippen oder bei Annäherung, dass es ansprechbar ist.

Mögliche Zeichen:

- leichtes Anheben,
- Rascheln,
- Glimmen,
- Schimmer,
- kleine Oberflächenreaktion,
- kurzer lokaler Klang,
- feine Lichtkante.

### 3.2 Claim

Beim Halten wird die Geste angenommen.

Das Objekt wird nicht einfach „angeklickt“, sondern beginnt, sich symbolisch zu verdichten:

- Kerze entzündet sich,
- Stein wird gravierbar oder schwerer,
- Blätter lösen sich aus einer Schale,
- Papier öffnet sich,
- Wasser bindet die Berührung.

### 3.3 Carry

Beim Ziehen wird die Geste durch den Raum getragen.

Das ist keine Inventarbewegung, sondern eine räumliche Verbindung zwischen Objekt und Ziel:

- Licht wird getragen,
- Stein wird geführt,
- Blatt wird gestreut,
- Papier wird zu einer Wand oder Schwelle gebracht,
- Wasser nimmt eine Spur auf.

### 3.4 Offer

Loslassen vollendet die Geste nur dort, wo Raum und Objekt zusammenpassen.

Beispiele:

- Kerze in Lichtzone,
- Stein auf Bodenniveau oder Steinbett,
- Blatt über Wasser oder Erde,
- Papier an Klagewand,
- Licht an Horizont oder Schwelle.

Außerhalb sinnvoller Zonen soll die Handlung nicht hart fehlschlagen. Im aktuellen Spuren-Prototyp wird ein ungültig abgelegtes Artefakt während des Tragens sichtbar gedimmt und beim Loslassen aufgelöst. Es springt nicht automatisch in eine andere gültige Zone.

### 3.5 Resonance

Die Handlung wird erst durch die Raumantwort vollständig lesbar.

Mögliche Raumantworten:

- Wasserkreise,
- Lichtwärme,
- Schimmer,
- dumpfer Klang,
- Nachhall,
- Windzug,
- Nebelöffnung,
- Partikelverdichtung,
- sichtbare Spur.

## 4. Interaktionsobjekte

### Kerze

- Reveal: schwaches Glimmen oder leichtes Aufrichten
- Claim: Flamme erscheint am stabilen Kerzenkörper
- Carry: Licht wird getragen
- Offer: Loslassen auf dem Weg-/Trockenbereich, außerhalb von Wasser und Steinzonen
- Resonance: Kerzenschimmer, wärmerer Klang, Raumwärme

Die Kerze sollte technisch nicht primär zwischen zwei Vollbildern umgeschaltet werden.

Stattdessen ist sinnvoll:

- ein stabiler Kerzenkörper als freigestelltes Objekt,
- eine kleine prozedurale Flamme mit Rauch,
- Lichtsaum und Raumwärme als Laufzeitreaktion.

Im Spuren-Prototyp werden Kerzen aus mehreren Sprite-Varianten zufällig gewählt, leicht in Breite/Höhe variiert und horizontal gespiegelt. Platziert brennen sie dauerhaft, bis der Raum verlassen oder der Session-Zustand zurückgesetzt wird.

### Stein

- Reveal: Stein hebt sich leicht hervor
- Claim: Gravur oder Verdichtung beginnt
- Carry: Stein wird zu Boden oder Steinbett geführt
- Offer: Loslassen in einer der Steinablagezonen oder bewusst ins Wasser
- Resonance: dumpfer Ton, dunkler Wasserkreis, schwererer Raumklang

Im Spuren-Prototyp haben Steine mehrere Bildvarianten, Größenvariation und zufällige horizontale Spiegelung. Ein Stein im Wasser hinterlässt keine bleibende Ablage, sondern löst eine Wasserresonanz aus.

### Blatt

- Reveal: Blätter heben sich leicht an oder rascheln
- Claim: einige Blätter lösen sich
- Carry: Blätter folgen lose der Geste
- Offer: Loslassen über Wasser, Erde oder Schale
- Resonance: fallende Blätter, Wasserreaktion, zarter Windzug

### Papier

- Reveal: Papier öffnet sich oder wird sichtbar
- Claim: Gedanke oder Klage wird angenommen
- Carry: Papier wird zur Klagewand oder Schwelle geführt
- Offer: Loslassen an Wand oder Fläche
- Resonance: Rascheln, Wandreaktion, bleibende Spur

### Wasser

- Reveal: feiner Schimmer oder kleine Oberflächenstörung
- Claim: Berührung sammelt sich
- Carry: Spur über die Oberfläche
- Offer: Loslassen beendet die Spur in Kreisen
- Resonance: konzentrische Wellen, Reflexionsbruch, tiefer Nachhall

Im Spuren-Prototyp sind Wasserkreise große, ruhige, elliptische Farbbögen. Sie laufen mehrere Sekunden und sollen bis an die wahrgenommene Wasserkante reichen, ohne blütenartige oder pulsierende Formen zu erzeugen.

### Licht

- Reveal: Puls oder Lichtsaum
- Claim: Licht wird aufgenommen
- Carry: Lichtimpuls wird getragen
- Offer: Übergabe an Horizont, Baum, Schwelle oder Antwortort
- Resonance: hellere Kanten, sichtbarer Weg, warme Partikel

## 5. Affordanzen ohne UI-Sprache

Interaktionen sollen entdeckbar sein, ohne wie Interface-Elemente auszusehen.

Geeignete Affordanzen:

- leichtes Anheben,
- Rascheln,
- Schimmern,
- schwaches Glimmen,
- minimale Rotation,
- lokaler Klang,
- Nebelreaktion,
- feine Magnetwirkung einer Zielzone,
- kleine Antwort von Wasser, Stoff oder Partikeln.

Die Zielzone selbst darf technisch als unsichtbare Hit-Fläche oder Polygon über einer sichtbaren Raumstation liegen.

Typisch ist also:

- sichtbarer Kerzentisch,
- sichtbare Schale,
- sichtbare Wand oder Schwelle,
- aber keine sichtbare technische Klickmarkierung.

Nicht verwenden:

- sichtbare Drop-Zonen,
- Pfeile,
- blinkende CTAs,
- Menüs im Raum,
- technische Fehlermeldungen,
- exakte Puzzle-Präzision.

## 6. Flüchtige Scherenschnittfiguren

Scherenschnittfiguren sind optional und nicht Standardbestandteil jeder Interaktion.

Sie dienen nur dann, wenn eine Geste kurz verkörpert werden soll.

Beispiele, wo sie sinnvoll sein können:

- Schwellenübertritt,
- Stein legen,
- Kerze entzünden,
- seltene verdichtete Antwortgeste.

Beispiele, wo sie meist nicht nötig sind:

- Blätter aus einer Schale aufnehmen,
- Wasser berühren,
- Papier an eine Wand ziehen,
- direkt lesbare Objektinteraktionen.

### Pose-Klassen

- `passing`
- `standing`
- `seated`
- `kneeling`
- `reaching`

### Bewegungsmodi

- `still`
- `swaying`
- `drifting`
- `dissolving`

### Sichtbarkeit

- Auftauchen: 1 bis 2 Sekunden
- Wirksamkeit: 2 bis 6 Sekunden
- Auflösen: 1 bis 3 Sekunden
- Gesamtzeit meist unter 10 Sekunden

Im Spuren-Prototyp erscheinen fremde Präsenzen als `walking`, `kneeling` oder `seated`. Sie legen gelegentlich Steine oder Kerzen als Fremd-Spur ab. Beim Verschwinden spielt ein leiser `hush`-Klang. Die Lautstärke dieses Klangs folgt der Raumtiefe: nahe am Fluchtpunkt sehr leise, im vorderen Raum deutlicher.

Damit der Raum nicht unendlich durch Fremd-Spuren anwächst, sind Präsenzen begrenzt: Beim ersten Besuch erscheinen nur wenige Präsenzen, ihre Abstände werden mit zunehmender Verweildauer größer, und die Zahl ihrer hinterlassenen Artefakte ist gedeckelt. Beim Zurückkehren in den Raum erscheinen keine neuen fremden Präsenzen mehr; bestehende Spuren bleiben als Erinnerung erhalten.

## 6.1 Persistente Spuren im Spuren-Prototyp

Der aktuelle Prototyp speichert abgelegte Artefakte im lokalen App-Zustand (`placedArtifacts`). Beim erneuten Betreten von `spuren` werden sie wieder aufgebaut.

Gespeichert werden:
- Artefaktart (`candle` oder `stone`)
- normierte Position
- Alpha-Wert
- Erzeugungszeitpunkt

Nicht dauerhaft festgeschrieben werden aktuell:
- konkrete Bildvariante
- genaue Zufallsskalierung
- horizontale Spiegelung

Das bedeutet: Die räumliche Spur bleibt erhalten, die konkrete visuelle Variante kann beim Wiederaufbau neu wirken. Diese Persistenz gilt innerhalb der laufenden Browser-Session/App-Laufzeit. Sie ist noch keine dauerhafte Speicherung über Reloads oder Geräte hinweg.

## 6.2 Raumtiefe und Effektlautstärke

Ortsgebundene One-Shots in `spuren` werden nicht überall gleich laut abgespielt. Die lokale Intensität wird anhand der Entfernung zum kalibrierten Fluchtpunkt moduliert:

- nahe am `vanishingPoint`: stark gedämpft
- Richtung `referencePoint`: weich ansteigend
- vorderer Raum: volle lokale Intensität

Das betrifft Wasser-, Stein-, Kerzen-, Tor- und Silhouetten-Auflösungsgeräusche. Ziel ist kein realistisches 3D-Audio, sondern eine würdige Tiefenstaffelung des Raums.

## 7. TypeScript-Modell

```ts
type RoomId =
  | "threshold"
  | "traces"
  | "listening"
  | "lament"
  | "response"
  | "density"
  | "calling"
  | "exit"
  | "sending";

type InputKind = "tap" | "press" | "drag" | "release" | "dwell";

type InteractionPhase =
  | "reveal"
  | "claim"
  | "carry"
  | "offer"
  | "resonance";

type GestureId =
  | "candle_lit"
  | "stone_laid"
  | "water_touched"
  | "leaf_scattered"
  | "paper_attached"
  | "light_offered"
  | "threshold_crossed";

type TargetId =
  | "candle_cluster"
  | "stone_bed"
  | "water_pool"
  | "bowl"
  | "lament_wall"
  | "threshold_line"
  | "light_source"
  | "horizon_line"
  | "response_tree"
  | "mist_layer";

type ZoneId =
  | "front_left"
  | "front_right"
  | "center"
  | "rear_left"
  | "rear_right"
  | "center_path"
  | "water_edge"
  | "wall_center"
  | "ground_zone"
  | "far_center";

type SilhouettePose =
  | "passing"
  | "standing"
  | "seated"
  | "kneeling"
  | "reaching";

type MovementMode =
  | "still"
  | "swaying"
  | "drifting"
  | "dissolving";

type PresenceMode = "brief" | "ambient" | "fading";

type RenderHint = {
  silhouettePose?: SilhouettePose;
  movementMode?: MovementMode;
  presenceMode?: PresenceMode;
};

type GestureEvent = {
  type: "gesture";
  room: RoomId;
  gesture: GestureId;
  target: TargetId;
  zone?: ZoneId;
  intensity: number;
  renderHint?: RenderHint;
  variant?: Record<string, string | number | boolean>;
  clientTime?: number;
};

type LocalInteractionEvent = {
  type: "local_interaction";
  room: RoomId;
  input: InputKind;
  phase: InteractionPhase;
  gesture?: GestureId;
  target?: TargetId;
  point?: { x: number; y: number };
  intensity?: number;
};
```

## 8. Eventnamen

Empfohlene semantische Eventnamen:

- `gesture.candle_lit`
- `gesture.stone_laid`
- `gesture.water_touched`
- `gesture.leaf_scattered`
- `gesture.paper_attached`
- `gesture.light_offered`
- `gesture.threshold_crossed`
- `presence.entered`
- `presence.dwelling`
- `presence.left`

## 9. Raummatrix

| Raum | Primäre Objekte | Typische Gesten | Mögliche Zielzonen |
| --- | --- | --- | --- |
| `threshold` | Licht, Nebel, Schwelle | `threshold_crossed`, `light_offered` | `center_path`, `threshold_line`, `mist_layer` |
| `traces` | Kerzen, Steine, Wasser | `candle_lit`, `stone_laid`, `water_touched` | `candle_cluster`, `stone_bed`, `water_pool` |
| `listening` | Licht, Sitzort, Wasser | `water_touched`, `light_offered` | `center`, `water_edge`, `far_center` |
| `lament` | Steine, Papier, Wasser, Kerzen | `stone_laid`, `paper_attached`, `candle_lit`, `water_touched` | `ground_zone`, `lament_wall`, `stone_bed`, `water_pool` |
| `response` | Blatt, Wasser, Licht, Schale | `leaf_scattered`, `water_touched`, `light_offered` | `bowl`, `water_pool`, `response_tree` |
| `density` | Licht, Wasser, Partikel | `light_offered`, `water_touched` | `center`, `far_center` |
| `calling` | Licht, Weg, Horizont | `light_offered`, `threshold_crossed` | `horizon_line`, `far_center`, `center_path` |
| `exit` | Papier, Licht, Schwelle | `paper_attached`, `light_offered` | `wall_center`, `threshold_line` |
| `sending` | Licht, Weg, Horizont | `light_offered`, `threshold_crossed` | `horizon_line`, `center_path`, `far_center` |

## 10. Gestaltungsregeln

- Der User entdeckt Interaktionen durch Antwort des Raums, nicht durch UI-Markierungen.
- Die Interaktion darf verborgen sein, aber nicht stumm.
- Objekte tragen Bedeutung, Figuren nur gelegentlich Verkörperung.
- Raumantwort ist wichtiger als Objektbewegung.
- Präzision soll atmosphärisch, nicht technisch erlebt werden.
- Scheitern soll weich, nicht mechanisch sein.
- Jede Handlung soll würdevoll und nicht spielerisch wirken.

## 11. Verweildauer-Heuristik

Räume reagieren nicht nur auf Gesten, sondern auch auf Aufmerksamkeit. Diese Sektion definiert, wie *Verweilen* zu Raumveränderung wird, ohne als Timer wahrnehmbar zu werden.

### 11.1 Grundsätze

- **Keine Timer-Anzeige, keine Fortschrittsbalken.** Der User soll nicht erfahren, dass eine Schwelle erreicht wurde — er soll merken, dass der Raum reifer geworden ist.
- **Reife öffnet, nie verlangt.** Erreichte Schwellen ergänzen Möglichkeiten (Resonanz-Anker, Ausgang); sie reduzieren niemals welche.
- **Pausierbar.** Wer pausiert (Notausstieg-Halt, Tab-Wechsel), verliert keine Reife; die Uhr ruht.
- **Inaktivität ≠ Abwesenheit.** Stilles Verharren zählt voll als Verweilen; Bewegung beschleunigt Reife nicht.
- **Keine Belohnung.** Reife produziert keine Items, keinen Score, kein „freigeschaltet".

### 11.2 Zielzeiten pro Raum (Vorschlag, in Phase 4 zu validieren)

| Raum | Untere Schwelle (Eindruck setzt ein) | Mittlere Verweildauer (Raum öffnet sich) | Volle Reife (Ausgang/nächster Raum spürbar) |
|------|--------------------------------------|------------------------------------------|---------------------------------------------|
| Vorhof | 15 s | 30 s | 45 s |
| Spuren | 20 s | 45 s | 90 s |
| Hören | 30 s | 60 s | 120 s |
| Klage | 30 s | 75 s | 150 s |
| Antwort | 20 s | 50 s | 100 s |
| Verdichtung | 30 s | 90 s | 180 s |
| Berufung | 20 s | 60 s | 120 s |
| Schwellenraum | 15 s | 45 s | 90 s |
| Sendung | 10 s | 30 s | 60 s |

Diese Zielzeiten sind Erwartungswerte für ein „positives Raumerlebnis" — kein Mindestmaß. Wer früher gehen will, kann immer gehen (Notausstieg, Eingangs-Schwelle).

### 11.3 Reife-Stufen Spuren (Referenzimplementierung)

| Zeit ab Eintritt | Atmosphärische Reaktion |
|------------------|--------------------------|
| 0–20 s | Grundzustand: Hintergrund, Ambient-Loop, Pointer-Parallax, vorhandene Fremd-Spuren sichtbar |
| 20 s | Wasserkante reagiert auf Pointer (vorher nicht); Ambient gewinnt eine zusätzliche tiefe Schicht |
| 45 s | Nebel öffnet sich leicht in der Bühnenzone; weitere Fremd-Spur fadet ein |
| 90 s | Ausgangs-Schimmer oben-rechts erscheint über 4 s (`easeOutExpo`); ab jetzt tap-bar |
| +30 s ohne Aktion | sehr leise Glocke aus weiter Ferne (einmalig, nicht wiederholend) |

Die übrigen 8 Räume erhalten in ihrer jeweiligen Aufbauphase eine analoge Tabelle.

### 11.4 Heuristik für „positives Raumerlebnis"

Ein Raumbesuch gilt als gelungen, wenn der User die mittlere Verweildauer überschreitet **und** der Raum auf mindestens eine Geste reagiert hat. Wird dies in Phase 4 (Nutzerfeedback) systematisch unterschritten, ist die Reife-Tabelle zu verkürzen oder die Anker-Affordanz zu verstärken — nicht die Erklärung.

### 11.5 Manifest-Check

- *Vermeidet Plattformlogik?* Ja — keine Timer, keine Belohnung, keine Streaks.
- *Vertieft Anwesenheit?* Reife belohnt Bleiben mit Tiefe, nicht mit Aktivität.
- *Schützt Würde?* Frühes Gehen wird nicht sanktioniert; kein „Du hast Raum X nicht ausreichend erlebt".
- *Anti-Eventisierung?* Reife-Stufen sind raumimmanent, nicht global getaktet.

## 12. Eingabe-Parität und Accessibility

Diese Sektion definiert, wie alle in Abschnitt 2 genannten Eingaben (`tap/press/drag/release/dwell`) über Pointer-, Touch-, Maus- und Tastatur-Eingabe konsistent verfügbar bleiben, und wie der Raum für Menschen ohne volle visuelle oder motorische Voraussetzungen begehbar bleibt.

### 12.1 Pointer-Vereinheitlichung

- **Pointer-Events** (`pointerdown / pointermove / pointerup / pointercancel`) sind die einzige Eingabequelle. Maus, Touch und Pen werden identisch behandelt; keine getrennten Touch-Listener.
- **Touch-Targets** sind mindestens 44×44 CSS-Pixel groß (WCAG 2.5.5); für Anker mit weicher Hit-Zone (siehe `docs/Design-Artefakte.md` § 11.2) gilt das für die innere Trefferzone.
- **Drag-Schwelle:** Pointer-Bewegung > 8 px nach Pointer-Down geht in `carry`, sonst zählt der Release als `tap`.
- **Press-Schwelle:** 150 ms Pointer-Down ohne Bewegung > 4 px geht in `claim`.
- **Long-Press-Schwelle (Rückübergang):** 1500 ms Pointer-Down im definierten Rückkehr-Bereich (siehe Raum-Spezifikation) löst Rückübergang aus.

### 12.2 Tastatur-Parität

Die App soll auch ohne Pointer-Gerät vollständig erlebbar sein. Die folgende Zuordnung gilt global:

| Tastatur | Pointer-Äquivalent |
|----------|--------------------|
| `Tab` / `Shift+Tab` | Pointer-Fokus zum nächsten / vorherigen Raum-Anker bewegen (Reihenfolge folgt Master-Screen-Lesefluss: unten-links → Bühne → oben-rechts) |
| `Enter` / `Space` (kurz) | `tap` (Reveal + Offer in einem) auf fokussiertem Anker |
| `Enter` / `Space` (halten) | `press` → `claim`; Loslassen = `offer` |
| Pfeiltasten während Claim | `carry`-Richtung in Schritten von ~3 % Bildkante pro Tastendruck; Auto-Repeat respektiert |
| `Esc` | Notausstieg (siehe 12.5) |
| `Backspace` (halten 1.5 s) | Rückübergang zum vorigen Raum |
| `M` | Audio mute / unmute |
| `R` | `prefers-reduced-motion` toggle (Session-lokal) |

Fokus-Indikator: dezenter Lichtsaum am fokussierten Anker (kein dicker Browser-Outline-Ring; Custom-Focus-Stil, aber sichtbar mit ausreichendem Kontrast 3:1).

### 12.3 Reduced Motion

Bei `prefers-reduced-motion: reduce` (oder manuell via `R`):

- Pointer-Parallax aus (statisches Hintergrundbild).
- Nebel-/Staub-/Blatt-Eigenbewegung auf 25 % der Spawn-Rate, Drift-Geschwindigkeit halbiert.
- Portal-Übergänge: nur Crossfade von Hintergrund und Ambient, keine choreografierten Phasen.
- Animation-Dauern < 800 ms halbiert, Dauern ≥ 800 ms bleiben (Würde der Übergänge).
- Audio bleibt vollständig erhalten; Resonanz-Klänge sind die primäre Rückmeldung.

### 12.4 Audio-Alternative für visuelle Resonanz

Jede primär visuelle Raumantwort hat eine hörbare Entsprechung, damit sie auch ohne Bildschirm-Aufmerksamkeit erfahrbar bleibt:

| Visuelle Resonanz | Audio-Entsprechung |
|-------------------|---------------------|
| Wasserkreis | tiefer, weicher Tropfen-Ton mit langem Nachhall |
| Kerzen-Lichtkreis | warmer, leiser Pad-Anschwellton |
| Nebelöffnung | sehr leises Luftrauschen, kurz |
| Ausgangs-Schimmer (Erscheinen) | einmalige ferne Glocke |
| Fremd-Spur fadet ein | minimaler, sehr distanzierter Ton (kaum als Ereignis erkennbar — bewusst) |

Diese Töne sind im Audio-Mix dauerhaft enthalten, *nicht* als „Accessibility-Modus" zugeschaltet — sie gehören zur Komposition.

### 12.5 Notausstieg

Der Notausstieg ist das **einzige** explizit beschriftete UI-Element und ist Manifest-konform begründet (Sicherheit > Reinheit).

- Position: oben-rechts, kleiner als der Ausgangs-Schimmer, dezent grauer Rand, immer sichtbar.
- Label: „Raum verlassen" (Klartext, kein Icon-only).
- Verhalten: Pointer-Tap oder `Esc` schließt die App-Session ohne Rückübergangs-Choreografie (sofortiger Crossfade zu Schwarz, Audio fadet 1.5 s aus, dann leere Seite mit dem Wort „Du bist gegangen.").
- **Niemals** mit Bestätigungsdialog hinterlegen.

### 12.6 Untertitel & Transkripte

Jeder gesprochene oder gesungene Audio-Impuls (Hörraum, Sendung) hat:

- abrufbare Untertitel (ein-/ausschaltbar in einem kleinen Bedien-Glyph oben-rechts, neben Notausstieg),
- ein Volltranskript, das *nicht* in den Raum eingeblendet wird, sondern über einen separaten Link „Text zum Lesen" erreichbar ist (öffnet in neuem Tab als reine Textseite — also kein Bruch der Raum-Stimmung).

Reine Klang-/Ambient-Impulse ohne Sprache brauchen keine Untertitel, sondern eine kurze Audiodeskription auf der „Text zum Lesen"-Seite.

### 12.7 Kontrast und Sehbarkeit

- Anker-Affordanzen (Schimmer, Reveal-Lichtkante) sind so abgestimmt, dass sie auch bei `prefers-contrast: more` als Lichtwert mindestens 3:1 zum unmittelbar umgebenden Hintergrund stehen.
- Der Notausstieg-Beschriftung erfüllt 4.5:1.
- Kein Information-Through-Color-Only: jede farbliche Reife-Veränderung (z. B. Wasserkante kühler/wärmer) hat zusätzlich eine Bewegungs- oder Klang-Entsprechung.

### 12.8 Pausierbarkeit

- Tab-Wechsel pausiert automatisch: Ambient-Loop fadet auf 0, Partikel/Reife-Uhr stoppen.
- Rückkehr (`visibilitychange` → visible): Ambient fadet in 2 s wieder ein, Reife-Uhr läuft an dem Punkt weiter, an dem sie gestoppt wurde.
- Keine Browser-Notifications bei Inaktivität (Manifest).

### 12.9 Manifest-Check

- *Vermeidet Plattformlogik?* Ja — der Notausstieg ist die einzige UI-Beschriftung; alles andere bleibt atmosphärisch.
- *Würde gewahrt?* Tastatur-Pfad ist gleichwertig, nicht „Behelf"; Audio trägt Resonanz auch ohne Bild.
- *Anti-Bevormundung?* Pausen werden nicht erklärt; Untertitel sind opt-in.
- *Schutz vor Überwältigung?* Reduced-Motion und Notausstieg jederzeit erreichbar.