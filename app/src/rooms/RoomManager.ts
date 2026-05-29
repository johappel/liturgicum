import type { Scene } from "../scene/Scene";
import { runTransition } from "../scene/Transition";
import { useStore } from "../state/store";
import { VorhofRoom } from "./VorhofRoom";
import { SpurenRoom } from "./SpurenRoom";
import { HoerenRoom } from "./HoerenRoom";
import type { Room } from "./Room";
import type { RoomId } from "../state/store";

/**
 * RoomManager orchestriert Vorhof ⇄ Spuren → Hören und führt jede
 * Navigation als atmosphärischen Übergang (Veil-Crossfade) aus.
 */
export class RoomManager {
  private current: Room | null = null;
  private currentId: RoomId | null = null;
  private firstTouchHandler: ((e: PointerEvent) => void) | null = null;
  private transitioning = false;
  private destroyed = false;

  constructor(private scene: Scene) {}

  async start(): Promise<void> {
    if (this.destroyed) return;
    await this.swapTo("vorhof", { skipTransition: true });
    this.attachFirstTouch();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.firstTouchHandler) {
      window.removeEventListener("pointerdown", this.firstTouchHandler);
      this.firstTouchHandler = null;
    }
    this.current?.destroy();
    this.current = null;
    this.currentId = null;
  }

  /** Erstklick irgendwo: Vorhof → Spuren. */
  private attachFirstTouch(): void {
    const handler = (_e: PointerEvent) => {
      if (this.firstTouchHandler) {
        window.removeEventListener("pointerdown", this.firstTouchHandler);
        this.firstTouchHandler = null;
      }
      if (this.currentId === "vorhof" && !this.transitioning) {
        void this.goSpuren();
      }
    };
    this.firstTouchHandler = handler;
    window.addEventListener("pointerdown", handler);
  }

  private async goSpuren(): Promise<void> {
    await this.swapTo("spuren");
  }

  private async goHoeren(): Promise<void> {
    await this.swapTo("hoeren");
  }

  private async goVorhof(): Promise<void> {
    await this.swapTo("vorhof", { mood: "back" });
    // Nach Rückkehr wartet Vorhof wieder auf den ersten Tap.
    if (!this.destroyed) this.attachFirstTouch();
  }

  private build(id: RoomId): Room {
    switch (id) {
      case "vorhof":
        return new VorhofRoom(this.scene);
      case "spuren":
        return new SpurenRoom(this.scene, {
          onRequestForward: () => { void this.goHoeren(); },
          onRequestBack: () => { void this.goVorhof(); },
        });
      case "hoeren":
        return new HoerenRoom(this.scene);
    }
  }

  private async swapTo(
    id: RoomId,
    opts: { skipTransition?: boolean; mood?: "forward" | "back" } = {},
  ): Promise<void> {
    if (this.destroyed || this.transitioning) return;
    this.transitioning = true;
    const reduced = useStore.getState().reducedMotion;
    const exec = async () => {
      this.current?.destroy();
      this.current = this.build(id);
      this.currentId = id;
      await this.current.mount();
    };
    try {
      if (opts.skipTransition) {
        await exec();
      } else {
        await runTransition(this.scene, exec, {
          mood: opts.mood ?? "forward",
          reducedMotion: reduced,
          durationMs: id === "hoeren" ? 6500 : 5500,
        });
      }
    } finally {
      this.transitioning = false;
    }
  }
}
