# Liturgicum App (Phase 2 Scaffold)

Vite + React + TypeScript + PixiJS v8 + Zustand + Howler.
Frontend für den Erprobungsraum *Spuren* (Phase 3) und die spätere Skalierung
auf alle neun Räume (Phase 5).

## Setup

```pwsh
cd app
npm install
```

## Scripts

| Script              | Zweck                                                          |
|---------------------|----------------------------------------------------------------|
| `npm run dev`       | Vite-Dev-Server (zeigt PixiJS-Canvas + Notausstieg)             |
| `npm run build`     | TypeScript-Check + Vite-Build → `app/dist/`                     |
| `npm run preview`   | Vorschau des Produktions-Builds                                 |
| `npm test`          | Vitest-Suite (Gesten-Reducer)                                   |

## Struktur

```
app/
  public/         → wird im Build kopiert; Assets liegen unter rooms/ (Symlink/Copy in Phase 3)
  src/
    main.tsx          App-Bootstrap
    App.tsx           Scene-Host + Notausstieg
    styles.css
    scene/
      types.ts        Layer-Reihenfolge, RoomDef, AnchorDef, ArtifactDef
      layout.ts       Master-Screen-Raster (entry/exit/Bühne), SPUREN_ANCHORS
      Scene.ts        Pixi.Application-Wrapper
    gesture/
      reducer.ts      5-Phasen-State-Machine (reveal → claim → carry → offer → resonance | reverted)
    audio/
      AudioEngine.ts  Howler-Wrapper mit Ambient-Crossfade + One-Shots
    state/
      store.ts        Zustand-Store (Raum, Verweildauer, lokale Spuren, Audio-/A11y-Prefs)
    effects/          Prozedurale PixiJS-Bausteine
      BaseEffect.ts
      FlameEmitter.ts SmokeEmitter.ts FogLayer.ts DustEmitter.ts
      LeafEmitter.ts WaterRing.ts SilhouettePresence.ts
      types.ts index.ts
  tests/
    gesture.test.ts
  index.html
  package.json tsconfig.json vite.config.ts
```

## Deployment (Phase 2.7)

GitHub Action `.github/workflows/pages.yml` baut die App und veröffentlicht
`app/dist/` auf GitHub Pages. Der Vite-`base`-Pfad wird zur Build-Zeit
über `LITURGICUM_BASE=/<repo-slug>/` gesetzt.

## Phase-2-Verifikation

Aus dem Session-Plan:

- `npm run dev` zeigt einen leeren PixiJS-Canvas mit Notausstieg.
- `npm run build` produziert ein deploybares Bundle < 2 MB initial.
- `npm test` läuft die Reducer-Suite grün (Glücklichpfad + Revert-Pfad).
