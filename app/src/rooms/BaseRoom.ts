import { Container, type Sprite, type Texture } from "pixi.js";
import type { Scene } from "../scene/Scene";
import type { Room } from "./Room";

/**
 * Gemeinsame Basis für alle Räume.
 *
 * Bündelt die in Vorhof / Spuren / Hören duplizierte Infrastruktur:
 * Tick-Registrierung, Resize-Handler, eigene Container und ein idempotentes
 * `destroy()`. Raum-spezifisches Aufräumen läuft über den `onDestroy()`-Hook.
 */
export abstract class BaseRoom implements Room {
  protected destroyed = false;
  private detachTick?: () => void;
  private resizeHandler: (() => void) | null = null;
  private readonly ownedContainers: Container[] = [];

  constructor(protected readonly scene: Scene) {}

  abstract mount(): Promise<void>;

  /** Registriert den Frame-Tick; ersetzt eine vorherige Registrierung. */
  protected startTick(cb: (dt: number) => void): void {
    this.detachTick?.();
    this.detachTick = this.scene.onTick(cb);
  }

  /** Registriert einen Resize-Handler am Fenster und merkt ihn fürs Aufräumen. */
  protected onResize(handler: () => void): void {
    this.resizeHandler = handler;
    window.addEventListener("resize", handler);
  }

  /** Erzeugt einen vom Raum verwalteten Kind-Container (wird automatisch zerstört). */
  protected adopt(parent: Container): Container {
    const c = new Container();
    parent.addChild(c);
    this.ownedContainers.push(c);
    return c;
  }

  /** Zentriert und skaliert einen Hintergrund-Sprite formatfüllend (cover). */
  protected fitBackgroundCover(sprite: Sprite, tex: Texture): void {
    sprite.x = this.scene.width / 2;
    sprite.y = this.scene.height / 2;
    sprite.scale.set(Math.max(this.scene.width / tex.width, this.scene.height / tex.height));
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.detachTick?.();
    this.detachTick = undefined;
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    this.onDestroy();
    for (const c of this.ownedContainers) {
      try { c.destroy({ children: true }); } catch { /* ignore */ }
    }
    this.ownedContainers.length = 0;
  }

  /** Hook für Unterklassen, um eigene Ressourcen freizugeben. */
  protected onDestroy(): void {}
}
