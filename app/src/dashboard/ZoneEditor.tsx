import { useEffect, useMemo, useRef, useState } from "react";
import type { RoomConfig, NormPointConfig } from "../config/types";

/**
 * Canvas-basierter Editor für Interaktionszonen (Polygone) und die
 * Bodenperspektive eines Raums. Arbeitet direkt auf normalisierten Punkten
 * (0..1) der RoomConfig und meldet Änderungen über onChange zurück.
 */

interface Props {
  config: RoomConfig;
  onChange: (next: RoomConfig) => void;
}

type Mode = "zones" | "perspective";

const HIT_RADIUS = 9;

export function ZoneEditor({ config, onChange }: Props): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgReady, setImgReady] = useState(false);
  const [mode, setMode] = useState<Mode>("zones");
  const zoneNames = useMemo(() => Object.keys(config.zones), [config.zones]);
  const [activeZone, setActiveZone] = useState<string>(zoneNames[0] ?? "");
  const [activePoly, setActivePoly] = useState(0);
  const drag = useRef<{ kind: "point" | "vp" | "rp"; poly?: number; idx?: number } | null>(null);

  const bgUrl = `/${config.id}/${config.background}`;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgReady(true);
    };
    img.onerror = () => setImgReady(false);
    img.src = bgUrl;
  }, [bgUrl]);

  useEffect(() => {
    if (!zoneNames.includes(activeZone)) setActiveZone(zoneNames[0] ?? "");
  }, [zoneNames, activeZone]);

  // Zeichnen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (imgReady && imgRef.current) {
      ctx.drawImage(imgRef.current, 0, 0, w, h);
    } else {
      ctx.fillStyle = "#1e2127";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9aa0ab";
      ctx.font = "13px system-ui";
      ctx.fillText("Hintergrund nicht gefunden: " + bgUrl, 12, 22);
    }

    // alle Zonen blass, aktive Zone betont
    for (const name of zoneNames) {
      const zone = config.zones[name];
      const isActive = name === activeZone && mode === "zones";
      zone.polygons.forEach((poly, pIdx) => {
        if (poly.length === 0) return;
        ctx.beginPath();
        poly.forEach((p, i) => {
          const x = p.x * w;
          const y = p.y * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        const activePolyHere = isActive && pIdx === activePoly;
        ctx.fillStyle = isActive
          ? activePolyHere
            ? "rgba(201,162,75,0.28)"
            : "rgba(201,162,75,0.14)"
          : "rgba(120,140,200,0.10)";
        ctx.strokeStyle = isActive ? "#c9a24b" : "rgba(120,140,200,0.5)";
        ctx.lineWidth = activePolyHere ? 2 : 1;
        ctx.fill();
        ctx.stroke();
        if (isActive) {
          poly.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#f0d68a";
            ctx.fill();
          });
        }
      });
    }

    // Perspektive
    const vp = config.perspective.vanishingPoint;
    const rp = config.perspective.referencePoint;
    ctx.strokeStyle = mode === "perspective" ? "#5aa06a" : "rgba(90,160,106,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vp.x * w, vp.y * h);
    ctx.lineTo(rp.x * w, rp.y * h);
    ctx.stroke();
    drawMarker(ctx, vp.x * w, vp.y * h, "#5aa06a", "VP");
    drawMarker(ctx, rp.x * w, rp.y * h, "#5aa06a", "RP");
  }, [config, imgReady, activeZone, activePoly, mode, zoneNames, bgUrl]);

  function toNorm(e: React.MouseEvent<HTMLCanvasElement>): NormPointConfig {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width);
    const y = ((e.clientY - rect.top) / rect.height);
    return { x: clamp01(x), y: clamp01(y) };
  }

  function hitTest(np: NormPointConfig): { kind: "point" | "vp" | "rp"; poly?: number; idx?: number } | null {
    const canvas = canvasRef.current!;
    const rPx = HIT_RADIUS / canvas.width;
    if (mode === "perspective") {
      if (dist(np, config.perspective.vanishingPoint) < rPx * 2) return { kind: "vp" };
      if (dist(np, config.perspective.referencePoint) < rPx * 2) return { kind: "rp" };
      return null;
    }
    const zone = config.zones[activeZone];
    if (!zone) return null;
    for (let pi = 0; pi < zone.polygons.length; pi++) {
      const poly = zone.polygons[pi];
      for (let i = 0; i < poly.length; i++) {
        if (dist(np, poly[i]) < rPx * 2) return { kind: "point", poly: pi, idx: i };
      }
    }
    return null;
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>): void {
    const np = toNorm(e);
    const hit = hitTest(np);
    if (hit) {
      if (hit.kind === "point" && hit.poly !== undefined) setActivePoly(hit.poly);
      drag.current = hit;
      return;
    }
    // Klick ins Leere im Zonenmodus → Punkt zur aktiven Polygon-Liste anhängen
    if (mode === "zones") {
      const next = structuredClone(config);
      const zone = next.zones[activeZone];
      if (!zone) return;
      if (!zone.polygons[activePoly]) zone.polygons[activePoly] = [];
      zone.polygons[activePoly].push(np);
      onChange(next);
    }
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>): void {
    if (!drag.current) return;
    const np = toNorm(e);
    const next = structuredClone(config);
    const d = drag.current;
    if (d.kind === "vp") next.perspective.vanishingPoint = np;
    else if (d.kind === "rp") next.perspective.referencePoint = np;
    else if (d.kind === "point" && d.poly !== undefined && d.idx !== undefined) {
      next.zones[activeZone].polygons[d.poly][d.idx] = np;
    }
    onChange(next);
  }

  function onMouseUp(): void {
    drag.current = null;
  }

  function onContextMenu(e: React.MouseEvent<HTMLCanvasElement>): void {
    e.preventDefault();
    if (mode !== "zones") return;
    const hit = hitTest(toNorm(e));
    if (hit?.kind === "point" && hit.poly !== undefined && hit.idx !== undefined) {
      const next = structuredClone(config);
      next.zones[activeZone].polygons[hit.poly].splice(hit.idx, 1);
      onChange(next);
    }
  }

  function addPolygon(): void {
    const next = structuredClone(config);
    next.zones[activeZone].polygons.push([]);
    onChange(next);
    setActivePoly(next.zones[activeZone].polygons.length - 1);
  }

  function removePolygon(): void {
    const next = structuredClone(config);
    if (next.zones[activeZone].polygons.length <= 1) {
      next.zones[activeZone].polygons[activePoly] = [];
    } else {
      next.zones[activeZone].polygons.splice(activePoly, 1);
    }
    onChange(next);
    setActivePoly(0);
  }

  function addZone(): void {
    const name = prompt("Name der neuen Zone (a-z, 0-9, _):")?.trim();
    if (!name || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) return;
    if (config.zones[name]) return;
    const next = structuredClone(config);
    next.zones[name] = { polygons: [[]] };
    onChange(next);
    setActiveZone(name);
    setActivePoly(0);
  }

  const polyCount = config.zones[activeZone]?.polygons.length ?? 0;

  return (
    <div className="zone-editor">
      <div className="row">
        <div className="checkbox-row">
          <button className={mode === "zones" ? "primary" : ""} onClick={() => setMode("zones")}>
            Zonen
          </button>
          <button
            className={mode === "perspective" ? "primary" : ""}
            onClick={() => setMode("perspective")}
          >
            Perspektive
          </button>
        </div>
        {mode === "zones" && (
          <>
            <select value={activeZone} onChange={(e) => { setActiveZone(e.target.value); setActivePoly(0); }}>
              {zoneNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <select value={activePoly} onChange={(e) => setActivePoly(Number(e.target.value))}>
              {Array.from({ length: polyCount }, (_, i) => (
                <option key={i} value={i}>
                  Polygon {i + 1}
                </option>
              ))}
            </select>
            <button onClick={addPolygon}>+ Polygon</button>
            <button className="danger" onClick={removePolygon}>
              − Polygon
            </button>
            <button onClick={addZone}>+ Zone</button>
          </>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onContextMenu={onContextMenu}
      />
      <p className="muted">
        {mode === "zones"
          ? "Klick ins Bild fügt einen Punkt zum aktiven Polygon hinzu · Punkt ziehen verschiebt · Rechtsklick auf Punkt löscht."
          : "Fluchtpunkt (VP) und Referenzpunkt (RP) ziehen, um die Bodenperspektive zu justieren."}
      </p>
    </div>
  );
}

function drawMarker(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string): void {
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = "#e6e7ea";
  ctx.font = "11px system-ui";
  ctx.fillText(label, x + 9, y - 6);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function dist(a: NormPointConfig, b: NormPointConfig): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
