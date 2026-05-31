# Graph Report - liturgicum  (2026-05-31)

## Corpus Check
- 51 files · ~3,746,272 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 386 nodes · 609 edges · 28 communities detected
- Extraction: 77% EXTRACTED · 23% INFERRED · 0% AMBIGUOUS · INFERRED: 142 edges (avg confidence: 0.81)
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
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]

## God Nodes (most connected - your core abstractions)
1. `ConfigRoom` - 67 edges
2. `PolygonZoneEditor` - 14 edges
3. `RoomManager` - 10 edges
4. `AudioEngine` - 8 edges
5. `add()` - 8 edges
6. `pointInNormPolygon()` - 8 edges
7. `Scene` - 8 edges
8. `clamp()` - 8 edges
9. `randomNearbyPointInPoly()` - 7 edges
10. `render_one()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `distancePointToSegment()` --calls--> `clamp()`  [INFERRED]
  app\src\geometry\polygonHelpers.ts → app\src\scene\Transition.ts
- `generate_asset_prompt()` --calls--> `render_one()`  [INFERRED]
  generate_prompt.py → tools\render_via_imagerouter.py
- `to_imagerouter_body()` --calls--> `render_one()`  [INFERRED]
  generate_prompt.py → tools\render_via_imagerouter.py
- `listRooms()` --calls--> `createRoom()`  [INFERRED]
  app\vite-plugin-config-server.ts → app\src\dashboard\RoomSettings.tsx
- `createStoneNode()` --calls--> `randomRange()`  [INFERRED]
  app\src\artifacts\ArtifactFactory.ts → app\src\common\mathUtils.ts

## Hyperedges (group relationships)
- **Liturgische Raumfolge** — raeume_vorhof, raeume_spurenraum, raeume_hoerraum, raeume_klageraum, raeume_antwortraum, raeume_verdichtungsraum, raeume_berufungsraum, raeume_schwellenraum, raeume_sendungsraum [EXTRACTED 1.00]
- **Symbolisches Interaktionsprotokoll** — interaction_phase_grammar, interaction_gesture_event_model, tech_object_grammar, websocket_ephemeral_symbolic_events, tech_room_definition_model [INFERRED 0.85]
- **Aggregierte Live-Resonanz** — konzept_live_resonance_channel, tech_shared_state_model, websocket_room_state_values, plan_websocket_phase [INFERRED 0.84]
- **Master Screen Threshold Composition** — masterscreen_arched_stone_hall, masterscreen_circular_floor_pattern, masterscreen_lantern_lit_stairway, masterscreen_radiant_upper_opening [INFERRED 0.88]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (4): loadAudioDurationMs(), setIntensity(), ConfigRoom, resolveAsset()

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (35): Arbeitsregeln für Beiträge, Raum der Spuren als erster Prototyp, Warum 2D, Scherenschnitt und hybride Fläche, Hybride 2D-Erfahrungsarchitektur, Symbolische Raumartefakte, Gesture-Event-Modell, Interaktionsphasen Reveal Claim Carry Offer Resonance, Raummatrix der Gesten und Zielzonen (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (16): fileToBase64(), ArrivalOverlay, add(), addKind(), addZoneFor(), changeInteraction(), ensureZones(), nextZoneName() (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (11): createRectPolyAround(), drawPolyOverlay(), PolygonZoneEditor, animate(), clamp(), drawFogCloud(), drawPortal(), fade() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (10): distancePointToSegment(), insertPointOnNearestEdge(), nearestVertexIndex(), pointInAnyNormPolygon(), pointInNormPolygon(), randomNearbyPointInPoly(), randomPointInAnyPoly(), randomPointInPoly() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (8): adopt(), destroy(), onDestroy(), onResize(), startTick(), HoerenRoom, Scene, VorhofRoom

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (7): AudioEngine, destroy(), mount(), softDisc(), stop(), tick(), DustEmitter

### Community 7 - "Community 7"
Cohesion: 0.19
Nodes (17): _arg_value(), generate_asset_prompt(), generate_prompt(), _grammatik_als_text(), list_assets(), main(), Baut den Request-Body für POST https://api.imagerouter.io/v1/openai/images/gener, to_imagerouter_body() (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (6): createRoom(), buildAgentPrompt(), capitalize(), listRooms(), pathExists(), updateMeta()

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (6): clamp(), drawPerspectiveDebugOverlay(), exportPerspectiveConfigConst(), nudgePerspectiveHandle(), perspectiveGroundScaleAtPoint(), setPerspectiveHandlePoint()

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (5): createCandleNode(), createPresenceNode(), createStoneNode(), randomHorizontalMirror(), randomRange()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (1): RoomManager

### Community 12 - "Community 12"
Cohesion: 0.31
Nodes (5): hitTest(), onContextMenu(), onMouseDown(), onMouseMove(), toNorm()

### Community 13 - "Community 13"
Cohesion: 0.42
Nodes (9): Arched Stone Hall, Circular Floor Pattern, Cloister or Cathedral Association, Contemplative Threshold Space, Lantern-Lit Stairway, Light-Guided Navigation Without UI, Master Screen Reference, Radiant Upper Opening (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (8): Liturgische Raumfolge, Master-Screen als Stilanker, Raumanker, Raumgrammatik, Schwellenlogik als Navigation, Vier Phasen des Übergangs, Rückkehrlogik, Schwellenchoreografie der Raumübergänge

### Community 15 - "Community 15"
Cohesion: 0.48
Nodes (2): createLeafGraphic(), LeafEmitter

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (5): generate_transition_prompt(), main(), _parse_transition(), _raumgrammatik_text(), _verfuegbare_uebergaenge()

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

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (2): Stille Ko-Präsenz, Anwesenheit statt Sichtbarkeit

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (2): Rückkehr in die Welt, Sendung oder Rückkehr

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Vorhof oder Übergang

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): Raum des Hörens

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): Raum der Verdichtung

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): Schwellenraum oder Ausgang

## Ambiguous Edges - Review These
- `Arched Stone Hall` → `Cloister or Cathedral Association`  [AMBIGUOUS]
  docs/masterscreen.png · relation: conceptually_related_to

## Knowledge Gaps
- **27 isolated node(s):** `Baut den Request-Body für POST https://api.imagerouter.io/v1/openai/images/gener`, `Sehr einfacher .env-Loader (KEY=VALUE pro Zeile, # für Kommentare).`, `imagerouter spiegelt das OpenAI-Format: data[0].b64_json oder data[0].url.`, `Warum 2D, Scherenschnitt und hybride Fläche`, `Gesture-Event-Modell` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 11`** (11 nodes): `RoomManager.ts`, `RoomManager`, `.attachFirstTouch()`, `.build()`, `.constructor()`, `.destroy()`, `.goHoeren()`, `.goSpuren()`, `.goVorhof()`, `.start()`, `.swapTo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (7 nodes): `LeafEmitter.ts`, `createLeafGraphic()`, `LeafEmitter`, `.addLeaf()`, `.onMount()`, `.resetLeaf()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (5 nodes): `FlameEmitter.ts`, `FlameEmitter`, `.constructor()`, `.onMount()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (5 nodes): `SilhouettePresence.ts`, `SilhouettePresence`, `.constructor()`, `.onMount()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (4 nodes): `FogLayer.ts`, `FogLayer`, `.onMount()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (4 nodes): `SmokeEmitter.ts`, `SmokeEmitter`, `.onMount()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `Stille Ko-Präsenz`, `Anwesenheit statt Sichtbarkeit`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `Rückkehr in die Welt`, `Sendung oder Rückkehr`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `Vorhof oder Übergang`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `Raum des Hörens`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `Raum der Verdichtung`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `Schwellenraum oder Ausgang`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Arched Stone Hall` and `Cloister or Cathedral Association`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `ConfigRoom` connect `Community 0` to `Community 2`, `Community 3`, `Community 4`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Why does `add()` connect `Community 2` to `Community 0`, `Community 5`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `add()` (e.g. with `.update()` and `.start()`) actually correct?**
  _`add()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Baut den Request-Body für POST https://api.imagerouter.io/v1/openai/images/gener`, `Sehr einfacher .env-Loader (KEY=VALUE pro Zeile, # für Kommentare).`, `imagerouter spiegelt das OpenAI-Format: data[0].b64_json oder data[0].url.` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._