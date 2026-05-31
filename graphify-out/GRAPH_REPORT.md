# Graph Report - liturgicum  (2026-05-31)

## Corpus Check
- 44 files · ~3,723,502 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 356 nodes · 566 edges · 28 communities detected
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 83 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]

## God Nodes (most connected - your core abstractions)
1. `SpurenRoom` - 74 edges
2. `RoomManager` - 10 edges
3. `AudioEngine` - 8 edges
4. `pointInNormPolygon()` - 8 edges
5. `Scene` - 8 edges
6. `randomNearbyPointInPoly()` - 7 edges
7. `SpurenSimulator` - 7 edges
8. `render_one()` - 7 edges
9. `Arbeitsregeln für Beiträge` - 7 edges
10. `Digitaler Resonanzraum` - 7 edges

## Surprising Connections (you probably didn't know these)
- `randomPointInPoly()` --calls--> `reduce()`  [INFERRED]
  app\src\rooms\SpurenRoom.ts → app\src\gesture\reducer.ts
- `render_one()` --calls--> `generate_asset_prompt()`  [INFERRED]
  tools\render_via_imagerouter.py → generate_prompt.py
- `render_one()` --calls--> `to_imagerouter_body()`  [INFERRED]
  tools\render_via_imagerouter.py → generate_prompt.py
- `uploadAudio()` --calls--> `fileToBase64()`  [INFERRED]
  app\src\dashboard\RoomSettings.tsx → app\src\dashboard\api.ts
- `uploadBackground()` --calls--> `fileToBase64()`  [INFERRED]
  app\src\dashboard\RoomSettings.tsx → app\src\dashboard\api.ts

## Hyperedges (group relationships)
- **Liturgische Raumfolge** — raeume_vorhof, raeume_spurenraum, raeume_hoerraum, raeume_klageraum, raeume_antwortraum, raeume_verdichtungsraum, raeume_berufungsraum, raeume_schwellenraum, raeume_sendungsraum [EXTRACTED 1.00]
- **Symbolisches Interaktionsprotokoll** — interaction_phase_grammar, interaction_gesture_event_model, tech_object_grammar, websocket_ephemeral_symbolic_events, tech_room_definition_model [INFERRED 0.85]
- **Aggregierte Live-Resonanz** — konzept_live_resonance_channel, tech_shared_state_model, websocket_room_state_values, plan_websocket_phase [INFERRED 0.84]
- **Master Screen Threshold Composition** — masterscreen_arched_stone_hall, masterscreen_circular_floor_pattern, masterscreen_lantern_lit_stairway, masterscreen_radiant_upper_opening [INFERRED 0.88]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (9): setIntensity(), drawPerspectiveDebugOverlay(), drawPolyOverlay(), nearestVertexIndex(), randomHorizontalMirror(), randomRange(), smoothstep(), SpurenRoom (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (35): Arbeitsregeln für Beiträge, Raum der Spuren als erster Prototyp, Warum 2D, Scherenschnitt und hybride Fläche, Hybride 2D-Erfahrungsarchitektur, Symbolische Raumartefakte, Gesture-Event-Modell, Interaktionsphasen Reveal Claim Carry Offer Resonance, Raummatrix der Gesten und Zielzonen (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (4): AudioEngine, HoerenRoom, SpurenSimulator, VorhofRoom

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (10): clamp(), createRectPolyAround(), distancePointToSegment(), insertPointOnNearestEdge(), loadAudioDurationMs(), pointInAnyNormPolygon(), pointInNormPolygon(), randomNearbyPointInPoly() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (11): fileToBase64(), add(), addKind(), patch(), patchKind(), remove(), removeKind(), uploadAudio() (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (10): reduce(), Scene, animate(), clamp(), drawFogCloud(), drawPortal(), fade(), runPortalTransition() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (17): _arg_value(), generate_asset_prompt(), generate_prompt(), _grammatik_als_text(), list_assets(), main(), Baut den Request-Body für POST https://api.imagerouter.io/v1/openai/images/gener, to_imagerouter_body() (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (6): destroy(), mount(), softDisc(), stop(), tick(), DustEmitter

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (5): buildAgentPrompt(), capitalize(), listRooms(), pathExists(), updateMeta()

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (1): RoomManager

### Community 10 - "Community 10"
Cohesion: 0.31
Nodes (5): hitTest(), onContextMenu(), onMouseDown(), onMouseMove(), toNorm()

### Community 11 - "Community 11"
Cohesion: 0.42
Nodes (9): Arched Stone Hall, Circular Floor Pattern, Cloister or Cathedral Association, Contemplative Threshold Space, Lantern-Lit Stairway, Light-Guided Navigation Without UI, Master Screen Reference, Radiant Upper Opening (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.36
Nodes (5): clamp(), exportPerspectiveConfigConst(), nudgePerspectiveHandle(), perspectiveGroundScaleAtPoint(), setPerspectiveHandlePoint()

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (8): Liturgische Raumfolge, Master-Screen als Stilanker, Raumanker, Raumgrammatik, Schwellenlogik als Navigation, Vier Phasen des Übergangs, Rückkehrlogik, Schwellenchoreografie der Raumübergänge

### Community 14 - "Community 14"
Cohesion: 0.48
Nodes (2): createLeafGraphic(), LeafEmitter

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (5): generate_transition_prompt(), main(), _parse_transition(), _raumgrammatik_text(), _verfuegbare_uebergaenge()

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (1): resolveAsset()

### Community 17 - "Community 17"
Cohesion: 0.4
Nodes (1): FlameEmitter

### Community 18 - "Community 18"
Cohesion: 0.4
Nodes (1): SilhouettePresence

### Community 19 - "Community 19"
Cohesion: 0.5
Nodes (1): FogLayer

### Community 21 - "Community 21"
Cohesion: 0.5
Nodes (1): SmokeEmitter

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (3): Harte Negativregeln, Plattformlogiken vermeiden, Anti-Plattform-Prüfung

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (2): Stille Ko-Präsenz, Anwesenheit statt Sichtbarkeit

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (2): Rückkehr in die Welt, Sendung oder Rückkehr

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Vorhof oder Übergang

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Raum des Hörens

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): Raum der Verdichtung

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): Schwellenraum oder Ausgang

## Ambiguous Edges - Review These
- `Arched Stone Hall` → `Cloister or Cathedral Association`  [AMBIGUOUS]
  docs/masterscreen.png · relation: conceptually_related_to

## Knowledge Gaps
- **27 isolated node(s):** `Baut den Request-Body für POST https://api.imagerouter.io/v1/openai/images/gener`, `Sehr einfacher .env-Loader (KEY=VALUE pro Zeile, # für Kommentare).`, `imagerouter spiegelt das OpenAI-Format: data[0].b64_json oder data[0].url.`, `Warum 2D, Scherenschnitt und hybride Fläche`, `Gesture-Event-Modell` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 9`** (11 nodes): `RoomManager.ts`, `RoomManager`, `.attachFirstTouch()`, `.build()`, `.constructor()`, `.destroy()`, `.goHoeren()`, `.goSpuren()`, `.goVorhof()`, `.start()`, `.swapTo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (7 nodes): `LeafEmitter.ts`, `createLeafGraphic()`, `LeafEmitter`, `.addLeaf()`, `.onMount()`, `.resetLeaf()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (5 nodes): `loadRoomConfig.ts`, `loadRoomConfig()`, `resolveAsset()`, `.applyConfig()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (5 nodes): `FlameEmitter.ts`, `FlameEmitter`, `.constructor()`, `.onMount()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (5 nodes): `SilhouettePresence.ts`, `SilhouettePresence`, `.constructor()`, `.onMount()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (4 nodes): `FogLayer.ts`, `FogLayer`, `.onMount()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (4 nodes): `SmokeEmitter.ts`, `SmokeEmitter`, `.onMount()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `Stille Ko-Präsenz`, `Anwesenheit statt Sichtbarkeit`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `Rückkehr in die Welt`, `Sendung oder Rückkehr`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `Vorhof oder Übergang`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `Raum des Hörens`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `Raum der Verdichtung`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `Schwellenraum oder Ausgang`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Arched Stone Hall` and `Cloister or Cathedral Association`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `SpurenRoom` connect `Community 0` to `Community 16`, `Community 3`, `Community 4`, `Community 12`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `runTransition()` connect `Community 5` to `Community 9`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `remove()` connect `Community 4` to `Community 5`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `Baut den Request-Body für POST https://api.imagerouter.io/v1/openai/images/gener`, `Sehr einfacher .env-Loader (KEY=VALUE pro Zeile, # für Kommentare).`, `imagerouter spiegelt das OpenAI-Format: data[0].b64_json oder data[0].url.` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._