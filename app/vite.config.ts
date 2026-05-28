import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite-Konfiguration für GitHub Pages.
// Der `base`-Pfad wird beim Build über die Env-Variable LITURGICUM_BASE gesetzt
// (Default `/` für lokale Entwicklung). Im GitHub-Action wird das auf
// `/<repo-slug>/` gesetzt.
const base = process.env.LITURGICUM_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  // Asset-Wurzel: die Repo-weiten Raumdateien unter rooms/ werden
  // zur Laufzeit unter `${base}<raum>/...` ausgeliefert.
  publicDir: "../rooms",
  // SPA-Fallback deaktivieren, damit fehlende Audio-/Bildpfade einen ehrlichen
  // 404 statt der index.html als text/html liefern (sonst versucht Howler die
  // HTML-Antwort als MP3 zu dekodieren und produziert Konsolen-Rauschen).
  appType: "mpa",
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 1024,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
