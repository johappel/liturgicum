import { useEffect, useState } from "react";
import { RoomSettings } from "./RoomSettings";
import { GeneralSettings } from "./GeneralSettings";
import { api, type ServiceKey, type ServicesStatus } from "./api";

type Tab = "rooms" | "general";

export function DashboardApp(): JSX.Element {
  const [tab, setTab] = useState<Tab>("rooms");
  const [services, setServices] = useState<ServicesStatus | null>(null);
  const [serviceError, setServiceError] = useState<string>("");
  const [serviceAction, setServiceAction] = useState<ServiceKey | null>(null);

  useEffect(() => {
    let cancelled = false;

    const pull = async (): Promise<void> => {
      try {
        const next = await api.getServicesStatus();
        if (!cancelled) {
          setServices(next);
          setServiceError("");
        }
      } catch (error) {
        if (!cancelled) setServiceError(String(error));
      }
    };

    void pull();
    const timer = window.setInterval(() => {
      void pull();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  async function handleStartService(service: ServiceKey): Promise<void> {
    try {
      setServiceAction(service);
      await api.startService(service);
      const next = await api.getServicesStatus();
      setServices(next);
      setServiceError("");
    } catch (error) {
      setServiceError(String(error));
    } finally {
      setServiceAction(null);
    }
  }

  return (
    <div className="dash">
      <header>
        <h1>Liturgicum — Konfigurations-Dashboard</h1>
        <div className="header-meta">
          <span className="muted">Resonanz-Räume &amp; gemeinsame Bibliotheken</span>
          <div className="services-bar">
            {(["sfx", "tts"] as ServiceKey[]).map((key) => {
              const service = services?.[key];
              const state = service?.state ?? "down";
              return (
                <div key={key} className={`service-chip is-${state}`}>
                  <div>
                    <strong>{service?.label ?? key}</strong>
                    <span>{service?.detail ?? "Status unbekannt"}</span>
                  </div>
                  {state !== "up" && (
                    <button
                      type="button"
                      disabled={serviceAction === key}
                      onClick={() => void handleStartService(key)}
                    >
                      {serviceAction === key ? "Startet…" : "Starten"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {serviceError && <span className="status err">⚠ {serviceError}</span>}
        </div>
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
