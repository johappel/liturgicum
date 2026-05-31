import { useState } from "react";
import { RoomSettings } from "./RoomSettings";
import { GeneralSettings } from "./GeneralSettings";

type Tab = "rooms" | "general";

export function DashboardApp(): JSX.Element {
  const [tab, setTab] = useState<Tab>("rooms");

  return (
    <div className="dash">
      <header>
        <h1>Liturgicum — Konfigurations-Dashboard</h1>
        <span className="muted">Resonanz-Räume &amp; gemeinsame Bibliotheken</span>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === "rooms" ? "active" : ""}`}
          onClick={() => setTab("rooms")}
        >
          Raum-Einstellungen
        </button>
        <button
          className={`tab ${tab === "general" ? "active" : ""}`}
          onClick={() => setTab("general")}
        >
          Allgemein &amp; Bibliotheken
        </button>
      </nav>

      {tab === "rooms" ? <RoomSettings /> : <GeneralSettings />}
    </div>
  );
}
