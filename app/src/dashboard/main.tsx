import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DashboardApp } from "./App";
import "./dashboard.css";

const el = document.getElementById("dashboard-root");
if (!el) throw new Error("#dashboard-root nicht gefunden");
createRoot(el).render(
  <StrictMode>
    <DashboardApp />
  </StrictMode>,
);
