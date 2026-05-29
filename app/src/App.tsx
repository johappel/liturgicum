import { useEffect, useRef } from "react";
import { Scene } from "./scene/Scene";
import { useStore } from "./state/store";
import { audioEngine } from "./audio/AudioEngine";
import { RoomManager } from "./rooms/RoomManager";

/**
 * App-Wurzel.
 *
 * Vollbild-Canvas (Pixi) + Notausstieg-Button (einziges Klartext-UI).
 * Räume und Übergänge werden vom RoomManager orchestriert.
 */
export function App() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const exitRoom = useStore((s) => s.exitRoom);

  useEffect(() => {
    if (!hostRef.current) return;
    const scene = new Scene(hostRef.current);
    let manager: RoomManager | null = null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitRoom();
    };
    window.addEventListener("keydown", onKey);

    (async () => {
      await scene.start();
      const unlock = () => {
        audioEngine.unlock();
        window.removeEventListener("pointerdown", unlock);
      };
      window.addEventListener("pointerdown", unlock, { once: true });

      manager = new RoomManager(scene);
      await manager.start();
    })();

    return () => {
      window.removeEventListener("keydown", onKey);
      manager?.destroy();
      scene.destroy();
      audioEngine.stopAll();
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
