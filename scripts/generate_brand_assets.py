#!/usr/bin/env python3
"""
Regenerate the raster brand assets (favicons + logo PNGs) from the palette in
horilla/settings/branding.py.

Pure standard library — no Pillow, no cairo, nothing to install. Run it again
whenever you change BRAND_PRIMARY and the icons follow:

    python scripts/generate_brand_assets.py

Output is deterministic, so re-running with the same palette rewrites identical
files and produces no noisy diff.
"""

from __future__ import annotations

import importlib.util
import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _load_branding():
    """
    Load horilla/settings/branding.py by path.

    Importing it as ``horilla.settings.branding`` would execute the package
    __init__ files, which pull in Django and the whole dependency set. This
    script only needs a dict of hex strings, so it reads the file directly.
    """
    path = ROOT / "horilla" / "settings" / "branding.py"
    spec = importlib.util.spec_from_file_location("_branding", path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


_branding = _load_branding()
BRAND_PRIMARY = _branding.BRAND_PRIMARY

# Top and bottom of the badge gradient, taken from the brand scale.
TOP = BRAND_PRIMARY["primary_500"]
BOTTOM = BRAND_PRIMARY["primary_700"]


# ── tiny PNG writer ─────────────────────────────────────────────────────────
def _chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def write_png(path: Path, width: int, height: int, pixels: bytearray) -> None:
    """pixels is width*height*4 bytes of RGBA, top-to-bottom."""
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)  # filter type 0 (none)
        raw += pixels[y * stride : (y + 1) * stride]

    png = b"\x89PNG\r\n\x1a\n"
    png += _chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += _chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += _chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def write_ico(path: Path, size: int, png_bytes: bytes) -> None:
    """Minimal ICO wrapping a PNG (supported by every current browser)."""
    dim = 0 if size >= 256 else size
    header = struct.pack("<HHH", 0, 1, 1)
    entry = struct.pack("<BBBBHHII", dim, dim, 0, 0, 1, 32, len(png_bytes), 22)
    path.write_bytes(header + entry + png_bytes)


# ── geometry helpers ────────────────────────────────────────────────────────
def hex_to_rgb(value: str) -> tuple[int, int, int]:
    v = value.lstrip("#")
    return int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16)


def rounded_box_sdf(px: float, py: float, size: float, radius: float) -> float:
    """Signed distance to a rounded square centred in a size x size canvas."""
    half = size / 2.0 - 0.5
    qx = abs(px - size / 2.0) - (half - radius)
    qy = abs(py - size / 2.0) - (half - radius)
    outside = math.hypot(max(qx, 0.0), max(qy, 0.0))
    inside = min(max(qx, qy), 0.0)
    return outside + inside - radius


def circle_sdf(px: float, py: float, cx: float, cy: float, r: float) -> float:
    return math.hypot(px - cx, py - cy) - r


def arc_sdf(
    px: float, py: float, cx: float, cy: float, r: float, width: float, y_min: float
) -> float:
    """Stroked ring of radius r and thickness `width`; caller clips the angle."""
    return abs(math.hypot(px - cx, py - cy) - r) - width / 2.0


# Mark geometry, as fractions of the canvas. Two heads over one shared
# shoulder reads as a group rather than a single user.
HEAD_LARGE = (0.420, 0.375, 0.135)   # cx, cy, r
HEAD_SMALL = (0.625, 0.435, 0.098)
SHOULDER = (0.450, 0.960, 0.300, 0.110, 0.995)  # cx, cy, r, stroke, clip-y


def render(size: int, supersample: int = 3) -> bytearray:
    """Draw the badge mark at the given pixel size."""
    top = hex_to_rgb(TOP)
    bottom = hex_to_rgb(BOTTOM)
    rgba = bytearray(size * size * 4)
    inv = 1.0 / (supersample * supersample)
    radius = size * 0.29

    h1x, h1y, h1r = HEAD_LARGE[0] * size, HEAD_LARGE[1] * size, HEAD_LARGE[2] * size
    h2x, h2y, h2r = HEAD_SMALL[0] * size, HEAD_SMALL[1] * size, HEAD_SMALL[2] * size
    sx, sy, sr, sw, sy_max = (
        SHOULDER[0] * size,
        SHOULDER[1] * size,
        SHOULDER[2] * size,
        SHOULDER[3] * size,
        SHOULDER[4] * size,
    )

    for y in range(size):
        for x in range(size):
            cov_bg = 0.0
            cov_mark = 0.0
            for sy_i in range(supersample):
                for sx_i in range(supersample):
                    px = x + (sx_i + 0.5) / supersample
                    py = y + (sy_i + 0.5) / supersample

                    # The mark never paints outside the badge silhouette, so
                    # arcs that reach the bottom edge are clipped by the shape
                    # instead of spilling onto the page.
                    if rounded_box_sdf(px, py, size, radius) > 0:
                        continue
                    cov_bg += 1.0

                    if circle_sdf(px, py, h1x, h1y, h1r) <= 0:
                        cov_mark += 1.0
                    elif circle_sdf(px, py, h2x, h2y, h2r) <= 0:
                        cov_mark += 1.0
                    elif py <= sy_max and arc_sdf(px, py, sx, sy, sr, sw, sy_max) <= 0:
                        cov_mark += 1.0

            bg = cov_bg * inv
            mark = cov_mark * inv
            if bg <= 0.0 and mark <= 0.0:
                continue

            t = y / max(size - 1, 1)
            r = round(top[0] + (bottom[0] - top[0]) * t)
            g = round(top[1] + (bottom[1] - top[1]) * t)
            b = round(top[2] + (bottom[2] - top[2]) * t)

            # White mark composited over the gradient.
            fr = round(r + (255 - r) * mark)
            fg = round(g + (255 - g) * mark)
            fb = round(b + (255 - b) * mark)

            i = (y * size + x) * 4
            rgba[i] = fr
            rgba[i + 1] = fg
            rgba[i + 2] = fb
            rgba[i + 3] = round(255 * max(bg, mark))
    return rgba


def main() -> None:
    favicons = ROOT / "static" / "favicons"
    theme_img = ROOT / "horilla_theme" / "static" / "horilla_theme" / "assets" / "img"
    ui_img = ROOT / "static" / "images" / "ui"

    small = {16: 8, 32: 6, 180: 3, 192: 3, 512: 2}

    for size, ss in small.items():
        pixels = render(size, supersample=ss)
        if size == 16:
            write_png(favicons / "favicon-16x16.png", size, size, pixels)
        elif size == 32:
            write_png(favicons / "favicon-32x32.png", size, size, pixels)
            write_ico(favicons / "favicon.ico", size,
                      (favicons / "favicon-32x32.png").read_bytes())
        elif size == 180:
            write_png(favicons / "apple-touch-icon.png", size, size, pixels)
        elif size == 192:
            write_png(favicons / "android-chrome-192x192.png", size, size, pixels)
        elif size == 512:
            write_png(favicons / "android-chrome-512x512.png", size, size, pixels)
        print(f"  ✓ favicon {size}x{size}")

    # Sidebar fallback and the auth-logo used inside employee forms.
    write_png(theme_img / "horilla-logo.png", 256, 256, render(256, supersample=2))
    write_png(ui_img / "auth-logo.png", 128, 128, render(128, supersample=4))
    print("  ✓ horilla-logo.png (256x256)")
    print("  ✓ auth-logo.png (128x128)")


if __name__ == "__main__":
    main()
