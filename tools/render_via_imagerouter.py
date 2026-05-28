#!/usr/bin/env python3
"""
render_via_imagerouter.py
Rendert Assets für den Liturgicum-Erprobungsraum über imagerouter (gpt-image-2).

Voraussetzungen:
  - IMAGEROUTER_API_KEY in Env oder .env-Datei im Repo-Root
  - generate_prompt.py liefert die Prompts (siehe --asset-Modus dort)

Verwendung:
  python tools/render_via_imagerouter.py --raum spuren --asset candle_field \
      --out rooms/spuren/anchors/candle_field.png

  python tools/render_via_imagerouter.py --raum spuren --asset background \
      --out rooms/spuren/background.png --size 1792x1024

  python tools/render_via_imagerouter.py --raum spuren --all \
      --out-dir rooms/spuren

  python tools/render_via_imagerouter.py --raum spuren --asset background \
      --dry-run                # zeigt nur den Request-Body, ruft API nicht auf

Schreibt nach erfolgreichem Render eine Zeile in rooms/<raum>/meta.json
(Quelle, Modell, Prompt-SHA256, Render-Datum, Größe, Qualität, Lizenz-Hinweis).
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# Repo-Root und generate_prompt importieren
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

import generate_prompt  # noqa: E402  (Repo-lokales Modul)

IMAGEROUTER_URL = "https://api.imagerouter.io/v1/openai/images/generations"
MODEL = "openai/gpt-image-2"
LICENSE_NOTE = "OpenAI-Output-Terms via imagerouter (eigene Nutzungsrechte, keine CC0)"

# Standard-Zielpfade je Asset-Kind (relativ zu rooms/<raum>/).
KIND_TO_SUBDIR = {
    "background": ".",
    "anchor": "anchors",
    "artifact": "artifacts",
    "silhouette": "artifacts",
}


def load_env_file(path: Path) -> None:
    """Sehr einfacher .env-Loader (KEY=VALUE pro Zeile, # für Kommentare)."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        if k and v and k not in os.environ:
            os.environ[k] = v


def call_imagerouter(body: dict, api_key: str) -> dict:
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        IMAGEROUTER_URL,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", errors="replace")
        raise SystemExit(f"imagerouter HTTP {e.code}: {msg}") from e


def extract_png_bytes(response: dict) -> bytes:
    """imagerouter spiegelt das OpenAI-Format: data[0].b64_json oder data[0].url."""
    if "data" not in response or not response["data"]:
        raise SystemExit(f"Unerwartete Response: {json.dumps(response)[:400]}")
    entry = response["data"][0]
    if "b64_json" in entry and entry["b64_json"]:
        return base64.b64decode(entry["b64_json"])
    if "url" in entry and entry["url"]:
        with urllib.request.urlopen(entry["url"], timeout=120) as r:
            return r.read()
    raise SystemExit(f"Weder b64_json noch url in Response: {json.dumps(entry)[:400]}")


def update_meta(meta_path: Path, filename: str, entry: dict) -> None:
    meta_path.parent.mkdir(parents=True, exist_ok=True)
    if meta_path.exists():
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            meta = {}
    else:
        meta = {}
    meta[filename] = entry
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def default_out_path(raum: str, asset_key: str, kind: str, out_dir: Path | None) -> Path:
    sub = KIND_TO_SUBDIR.get(kind, ".")
    base = out_dir if out_dir else (REPO_ROOT / "rooms" / raum)
    if kind == "background":
        return base / "background.png"
    return base / sub / f"{asset_key}.png"


def render_one(
    raum: str,
    asset_key: str,
    out_path: Path,
    size: str,
    quality: str,
    dry_run: bool,
) -> None:
    if raum not in generate_prompt.RAUMASSETS or asset_key not in generate_prompt.RAUMASSETS[raum]:
        raise SystemExit(f"Unbekanntes Asset: {raum}:{asset_key}")

    asset = generate_prompt.RAUMASSETS[raum][asset_key]
    prompt = generate_prompt.generate_asset_prompt(raum, asset_key)
    effective_size = size if size != "auto" else asset.get("default_size", "auto")
    body = generate_prompt.to_imagerouter_body(
        prompt, size=effective_size, quality=quality
    )

    if dry_run:
        print(f"[dry-run] {raum}:{asset_key} → {out_path}")
        print(json.dumps(body, ensure_ascii=False, indent=2))
        return

    api_key = os.environ.get("IMAGEROUTER_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("IMAGEROUTER_API_KEY nicht gesetzt (.env oder Env-Variable).")

    print(f"[render] {raum}:{asset_key} → {out_path}")
    response = call_imagerouter(body, api_key)
    png = extract_png_bytes(response)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(png)

    rooms_dir = REPO_ROOT / "rooms" / raum
    meta_path = rooms_dir / "meta.json"
    rel = out_path.relative_to(rooms_dir) if out_path.is_relative_to(rooms_dir) else out_path.name
    update_meta(
        meta_path,
        str(rel).replace("\\", "/"),
        {
            "source": f"imagerouter:{MODEL}",
            "asset_key": asset_key,
            "kind": asset["kind"],
            "prompt_sha256": hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
            "rendered_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "size": effective_size,
            "quality": quality,
            "license": LICENSE_NOTE,
        },
    )
    print(f"  geschrieben: {out_path}  ({len(png)} bytes)")


def main() -> None:
    load_env_file(REPO_ROOT / ".env")

    p = argparse.ArgumentParser(description="Rendere Liturgicum-Assets via imagerouter (gpt-image-2).")
    p.add_argument("--raum", required=True, help="Raum-ID, z.B. spuren")
    p.add_argument("--asset", help="Asset-Key (siehe generate_prompt.py <raum> --assets)")
    p.add_argument("--all", action="store_true", help="alle Assets des Raums rendern")
    p.add_argument("--out", help="Zielpfad für Einzel-Asset")
    p.add_argument("--out-dir", help="Basisverzeichnis (default: rooms/<raum>)")
    p.add_argument("--size", default="auto", help="auto | WxH (default: auto, fällt auf asset-default zurück)")
    p.add_argument("--quality", default="auto", help="auto | low | medium | high")
    p.add_argument("--dry-run", action="store_true", help="nur Request-Body anzeigen, kein API-Call")
    p.add_argument("--skip-existing", action="store_true", help="bereits vorhandene Zieldateien überspringen")
    args = p.parse_args()

    out_dir = Path(args.out_dir).resolve() if args.out_dir else None

    if args.all:
        for key, asset in generate_prompt.RAUMASSETS.get(args.raum, {}).items():
            out_path = default_out_path(args.raum, key, asset["kind"], out_dir)
            if args.skip_existing and out_path.exists():
                print(f"[skip] {args.raum}:{key} (existiert: {out_path})")
                continue
            render_one(args.raum, key, out_path, args.size, args.quality, args.dry_run)
        return

    if not args.asset:
        raise SystemExit("Entweder --asset <key> oder --all angeben.")

    asset = generate_prompt.RAUMASSETS.get(args.raum, {}).get(args.asset)
    if not asset:
        raise SystemExit(f"Unbekanntes Asset: {args.raum}:{args.asset}")

    if args.out:
        out_path = Path(args.out).resolve()
    else:
        out_path = default_out_path(args.raum, args.asset, asset["kind"], out_dir)

    render_one(args.raum, args.asset, out_path, args.size, args.quality, args.dry_run)


if __name__ == "__main__":
    main()
