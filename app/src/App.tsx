import { useEffect, useRef } from "react";
import { Scene } from "./scene/Scene";
import { useStore } from "./state/store";
import { audioEngine } from "./audio/AudioEngine";
import { SpurenRoom } from "./rooms/SpurenRoom";

/**
 * App-Wurzel.
 *
 * Zeigt einen Vollbild-Canvas (Pixi) und den Notausstieg (einziges Klartext-UI).
 * Räume und Übergänge werden in Phase 3 in `Scene` orchestriert.
 */
export function App() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const exitRoom = useStore((s) => s.exitRoom);

  useEffect(() => {
    if (!hostRef.current) return;
    const scene = new Scene(hostRef.current);
    sceneRef.current = scene;
    let room: SpurenRoom | null = null;

    // Globale Tastatur-Parität: Esc = Notausstieg.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitRoom();
    };
    window.addEventListener("keydown", onKey);

    (async () => {
      await scene.start();
      // Erstunlock für Audio bei erstem Pointerdown (Browser-Policy).
      const unlock = () => {
        audioEngine.unlock();
        window.removeEventListener("pointerdown", unlock);
      };
      window.addEventListener("pointerdown", unlock, { once: true });

      room = new SpurenRoom(scene);
      await room.mount();
    })();

    return () => {
      window.removeEventListener("keydown", onKey);
      room?.destroy();
      scene.destroy();
      audioEngine.stopAll();
      sceneRef.current = null;
    };
  }, [exitRoom]);

  return (
    <>
      <div ref={hostRef} className="scene-host" />
      <button
        type="button"
        className="exit-button"
        onClick={exitRoom}
        aria-label="Raum verlassen"
      >
        Raum verlassen
      </button>
    </>
  );
}
