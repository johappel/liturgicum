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
  private starting = false;
  private disposed = false;
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

  /** True sobald init() durch ist; vorher dürfen Konsumenten nicht aufs ticker zugreifen. */
  get isReady(): boolean {
    return this.started && Boolean(this.app.renderer);
  }

  async start(): Promise<void> {
    if (this.starting || this.started) return;
    this.starting = true;

    try {
      await this.app.init({
        backgroundAlpha: 1,
        backgroundColor: 0x050505,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio ?? 1, 2),
        resizeTo: this.host,
      });
    } catch (err) {
      this.starting = false;
      throw err;
    }

    // StrictMode: destroy() kann während init() gelaufen sein.
    if (this.disposed) {
      this.starting = false;
      this.app.destroy(true, { children: true, texture: false });
      return;
    }

    this.host.appendChild(this.app.canvas);
    for (const name of LAYER_ORDER) {
      this.app.stage.addChild(this.layers[name]);
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.app.renderer?.resize(this.host.clientWidth, this.host.clientHeight);
    });
    this.resizeObserver.observe(this.host);

    this.app.ticker.add(this.boundTick);
    this.started = true;
    this.starting = false;
  }

  /** Registriere einen Tick-Callback (Δt in ms). Liefert unsubscribe-Funktion. */
  onTick(fn: (deltaMs: number) => void): () => void {
    this.tickListeners.add(fn);
    return () => this.tickListeners.delete(fn);
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.tickListeners.clear();
    // app.ticker existiert erst nach erfolgreichem init().
    if (this.app.ticker) this.app.ticker.remove(this.boundTick);
    if (this.app.renderer) {
      this.app.destroy(true, { children: true, texture: false });
    }
    this.started = false;
  }

  get width(): number {
    return this.app.renderer?.width ?? 0;
  }

  get height(): number {
    return this.app.renderer?.height ?? 0;
  }
}
