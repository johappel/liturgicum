import { useEffect, useRef } from "react";
import { Scene } from "./scene/Scene";
import { useStore } from "./state/store";
import { audioEngine } from "./audio/AudioEngine";

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

    // Globale Tastatur-Parität: Esc = Notausstieg.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitRoom();
    };
    window.addEventListener("keydown", onKey);

    scene.start();

    return () => {
      window.removeEventListener("keydown", onKey);
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
