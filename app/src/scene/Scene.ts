import { Application, Container, Ticker } from "pixi.js";
import { LAYER_ORDER, type LayerName, type SceneLayers } from "./types";

/**
 * Scene = Pixi-Application-Wrapper.
 *
 * Verwaltet:
 *  - die Pixi-Application und ihren Canvas im DOM-Host,
 *  - die Standard-Layer (Background, Parallax, Particles, Anchors, Interactions, Overlay),
 *  - Resize-Verhalten,
 *  - sauberes Cleanup beim Unmount.
 *
 * Räume und Übergänge werden in Phase 3 als externe Module die Scene füllen.
 */
export class Scene implements SceneLayers {
  readonly app: Application;
  readonly layers: Record<LayerName, Container>;
  private host: HTMLElement;
  private resizeObserver?: ResizeObserver;
  private started = false;
  private tickListeners = new Set<(deltaMs: number) => void>();
  private boundTick = (ticker: Ticker) => {
    const dt = ticker.deltaMS;
    for (const fn of this.tickListeners) fn(dt);
  };

  constructor(host: HTMLElement) {
    this.host = host;
    this.app = new Application();
    this.layers = LAYER_ORDER.reduce(
      (acc, name) => {
        const c = new Container();
        c.label = name;
        acc[name] = c;
        return acc;
      },
      {} as Record<LayerName, Container>,
    );
  }

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;

    await this.app.init({
      backgroundAlpha: 1,
      backgroundColor: 0x050505,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio ?? 1, 2),
      resizeTo: this.host,
    });

    this.host.appendChild(this.app.canvas);

    for (const name of LAYER_ORDER) {
      this.app.stage.addChild(this.layers[name]);
    }

    this.resizeObserver = new ResizeObserver(() => {
      // resizeTo bindet ans Host-Element; explizit triggern für Sicherheit.
      this.app.renderer.resize(this.host.clientWidth, this.host.clientHeight);
    });
    this.resizeObserver.observe(this.host);

    this.app.ticker.add(this.boundTick);
  }

  /** Registriere einen Tick-Callback (Δt in ms). Liefert unsubscribe-Funktion. */
  onTick(fn: (deltaMs: number) => void): () => void {
    this.tickListeners.add(fn);
    return () => this.tickListeners.delete(fn);
  }

  destroy(): void {
    if (!this.started) return;
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.tickListeners.clear();
    this.app.ticker.remove(this.boundTick);
    this.app.destroy(true, { children: true, texture: false });
    this.started = false;
  }

  get width(): number {
    return this.app.renderer?.width ?? 0;
  }

  get height(): number {
    return this.app.renderer?.height ?? 0;
  }
}
