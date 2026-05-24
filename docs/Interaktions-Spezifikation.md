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

Außerhalb sinnvoller Zonen soll die Handlung nicht hart fehlschlagen, sondern weich zurückgleiten oder unvollendet bleiben.

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
- Offer: Loslassen in Lichtzone oder Kerzenbereich
- Resonance: Kerzenschimmer, wärmerer Klang, Raumwärme

Die Kerze sollte technisch nicht primär zwischen zwei Vollbildern umgeschaltet werden.

Stattdessen ist sinnvoll:

- ein stabiler Kerzenkörper als freigestelltes Objekt,
- eine kleine Flamme als Hybrid-Asset oder Animation,
- Lichtsaum und Raumwärme als Laufzeitreaktion.

### Stein

- Reveal: Stein hebt sich leicht hervor
- Claim: Gravur oder Verdichtung beginnt
- Carry: Stein wird zu Boden oder Steinbett geführt
- Offer: Loslassen auf Bodenniveau oder in Klagezone
- Resonance: dumpfer Ton, dunkler Wasserkreis, schwererer Raumklang

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