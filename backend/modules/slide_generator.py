"""
slide_generator.py
Renders beautiful educational slide images (1280x720) using Pillow.
Each slide has a gradient background, title, and bullet points.
"""

import os
import textwrap
from pathlib import Path
from typing import List
from PIL import Image, ImageDraw, ImageFont
import colorsys

# ── Colour palettes keyed by scene type ──────────────────────────────────────
PALETTES = {
    "intro": {
        "bg_top": (37, 99, 235),      # blue-600
        "bg_bottom": (147, 197, 253),  # blue-200
        "title_color": (255, 255, 255),
        "bullet_color": (224, 242, 255),
        "accent": (255, 255, 255),
    },
    "content": {
        "bg_top": (255, 255, 255),
        "bg_bottom": (239, 246, 255),  # blue-50
        "title_color": (30, 64, 175),  # blue-800
        "bullet_color": (55, 65, 81),  # gray-700
        "accent": (37, 99, 235),       # blue-600
    },
    "outro": {
        "bg_top": (16, 185, 129),      # emerald-500
        "bg_bottom": (167, 243, 208),  # emerald-200
        "title_color": (255, 255, 255),
        "bullet_color": (236, 253, 245),
        "accent": (255, 255, 255),
    },
}

W, H = 1280, 720


def _vertical_gradient(draw: ImageDraw.Draw, top: tuple, bottom: tuple):
    for y in range(H):
        t = y / H
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Try system fonts, fall back to default."""
    candidates = []
    if bold:
        candidates = [
            "C:/Windows/Fonts/nirmalab.ttf",   # Nirmala UI Bold (Tamil + Hindi) - FIRST
            "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
            "/usr/share/fonts/truetype/noto/NotoSansTamil-Bold.ttf",
            "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ]
    else:
        candidates = [
            "C:/Windows/Fonts/nirmala.ttf",    # Nirmala UI (Tamil + Hindi) - FIRST
            "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
            "/usr/share/fonts/truetype/noto/NotoSansTamil-Regular.ttf",
            "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "C:/Windows/Fonts/arial.ttf",
        ]
    for path in candidates:
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, size)
                print(f"[Font] Loaded: {path}")
                return font
            except Exception:
                continue
    print("[Font] WARNING: Falling back to default font - Tamil/Hindi will not render!")
    return ImageFont.load_default()


def render_slide(
    scene: dict,
    output_path: str,
    lesson_title: str = "",
) -> str:
    """Render a single slide PNG and return the path."""
    palette = PALETTES.get(scene.get("scene_type", "content"), PALETTES["content"])

    img = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Background gradient
    _vertical_gradient(draw, palette["bg_top"], palette["bg_bottom"])

    # Decorative accent bar (left side)
    accent = palette["accent"]
    draw.rectangle([(0, 0), (8, H)], fill=accent)

    # Top strip for intro/outro
    scene_type = scene.get("scene_type", "content")
    if scene_type in ("intro", "outro"):
        draw.rectangle([(0, 0), (W, 12)], fill=(255, 255, 255, 80))

    # Lesson subtitle top-right
    if lesson_title and scene_type != "intro":
        sub_font = _load_font(20)
        draw.text((W - 20, 20), lesson_title, font=sub_font,
                  fill=(*palette["bullet_color"], 140), anchor="ra")

    # Scene number badge
    scene_num = scene.get("scene_number", 0)
    badge_font = _load_font(22, bold=True)
    badge_label = "INTRO" if scene_type == "intro" else ("SUMMARY" if scene_type == "outro" else f"SCENE {scene_num}")
    draw.rounded_rectangle([(40, 30), (40 + len(badge_label) * 13 + 20, 62)], radius=8, fill=palette["accent"])
    draw.text((50, 38), badge_label, font=badge_font, fill=palette["title_color"] if scene_type == "content" else (255, 255, 255))

    # Title
    title_font = _load_font(54, bold=True)
    title_text = scene.get("scene_title", "")
    # Wrap long titles
    title_lines = textwrap.wrap(title_text, width=36)
    ty = 90
    for line in title_lines[:2]:
        draw.text((60, ty), line, font=title_font, fill=palette["title_color"])
        ty += 64

    # Divider line
    div_color = palette["accent"] if scene_type == "content" else (255, 255, 255, 180)
    draw.rectangle([(60, ty + 10), (W - 60, ty + 14)], fill=div_color)
    ty += 40

    # Bullet points
    bullet_font = _load_font(32)
    key_font = _load_font(26, bold=True)
    points = scene.get("slide_points", [])

    for i, point in enumerate(points[:6]):  # max 6 bullets
        if not point.strip():
            continue
        # Bullet circle
        bx, by = 60, ty + 10
        draw.ellipse([(bx, by), (bx + 14, by + 14)], fill=palette["accent"])
        # Wrap long points
        wrapped = textwrap.wrap(point, width=60)
        for j, wline in enumerate(wrapped[:2]):
            draw.text((86, ty + j * 36), wline, font=bullet_font, fill=palette["bullet_color"])
        ty += 36 * min(len(wrapped), 2) + 14

        if ty > H - 80:
            break

    # Key concepts footer
    key_concepts = scene.get("key_concepts", [])
    if key_concepts and scene_type == "content":
        kc_text = "  ·  ".join(key_concepts[:4])
        draw.rectangle([(0, H - 50), (W, H)], fill=palette["accent"])
        draw.text((W // 2, H - 28), kc_text, font=key_font,
                  fill=(255, 255, 255), anchor="mm")

    # EduGenAI watermark
    wm_font = _load_font(18)
    draw.text((W - 20, H - 20), "EduGenAI", font=wm_font,
              fill=(*palette["bullet_color"][:3], 80), anchor="ra")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return output_path


def render_all_slides(scenes: list, slides_dir: str, lesson_title: str = "") -> List[str]:
    """Render slides for all scenes. Returns list of file paths."""
    paths = []
    for scene in scenes:
        filename = f"slide_{scene['scene_number']:03d}.png"
        path = os.path.join(slides_dir, filename)
        render_slide(scene, path, lesson_title=lesson_title)
        paths.append(path)
    return paths