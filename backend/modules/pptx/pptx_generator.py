# modules/pptx/pptx_generator.py
"""
Generates a downloadable PowerPoint (.pptx) from lesson scenes.
Uses python-pptx.
"""
import os
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN


# Color palette
BLUE_DARK  = RGBColor(30, 64, 175)    # blue-800
BLUE_MID   = RGBColor(37, 99, 235)    # blue-600
BLUE_LIGHT = RGBColor(219, 234, 254)  # blue-100
WHITE      = RGBColor(255, 255, 255)
GRAY       = RGBColor(71, 85, 105)    # slate-600
GREEN      = RGBColor(16, 185, 129)   # emerald-500


def _add_bg(slide, color: RGBColor):
    """Fill slide background with solid color."""
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def _add_textbox(slide, text, left, top, width, height, font_size, bold=False, color=WHITE, align=PP_ALIGN.LEFT):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.color.rgb = color
    return txBox


def generate_pptx(scenes: list, lesson_title: str, output_path: str, language: str = "english") -> str:
    prs = Presentation()
    prs.slide_width  = Inches(13.33)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]  # blank

    # ── Title slide ────────────────────────────────────────────────────────────
    slide = prs.slides.add_slide(blank_layout)
    _add_bg(slide, BLUE_DARK)

    # Gradient rectangle accent
    left_bar = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(0.15), Inches(7.5))
    left_bar.fill.solid()
    left_bar.fill.fore_color.rgb = BLUE_MID
    left_bar.line.fill.background()

    _add_textbox(slide, "EduGenAI", 0.3, 0.3, 4, 0.5, 14, color=RGBColor(147, 197, 253))
    _add_textbox(slide, lesson_title, 0.3, 1.2, 12, 2.5, 48, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
    _add_textbox(slide, f"Language: {language.title()}", 0.3, 6.8, 6, 0.5, 14, color=RGBColor(148, 163, 184))

    # ── Content slides ─────────────────────────────────────────────────────────
    for scene in scenes:
        scene_type = scene.get("scene_type", "content")
        title_text = scene.get("scene_title", "")
        points = [p for p in scene.get("slide_points", []) if p.strip()]
        concepts = scene.get("key_concepts", [])

        slide = prs.slides.add_slide(blank_layout)

        if scene_type == "intro":
            _add_bg(slide, BLUE_MID)
            bg_color = BLUE_MID
            title_color = WHITE
            bullet_color = RGBColor(219, 234, 254)
        elif scene_type == "outro":
            _add_bg(slide, GREEN)
            bg_color = GREEN
            title_color = WHITE
            bullet_color = WHITE
        else:
            _add_bg(slide, WHITE)
            bg_color = WHITE
            title_color = BLUE_DARK
            bullet_color = GRAY

        # Left accent bar
        bar = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(0.12), Inches(7.5))
        bar.fill.solid()
        bar.fill.fore_color.rgb = BLUE_MID if scene_type == "content" else WHITE
        bar.line.fill.background()

        # Scene badge
        badge_text = "INTRO" if scene_type == "intro" else ("SUMMARY" if scene_type == "outro" else f"SCENE {scene.get('scene_number', '')}")
        badge = slide.shapes.add_shape(1, Inches(0.3), Inches(0.25), Inches(1.4), Inches(0.35))
        badge.fill.solid()
        badge.fill.fore_color.rgb = WHITE if scene_type != "content" else BLUE_MID
        badge.line.fill.background()
        _add_textbox(slide, badge_text, 0.32, 0.27, 1.4, 0.32, 10, bold=True,
                     color=BLUE_DARK if scene_type != "content" else WHITE)

        # Title
        _add_textbox(slide, title_text, 0.3, 0.75, 12.5, 1.2, 36, bold=True, color=title_color)

        # Divider line
        line = slide.shapes.add_shape(1, Inches(0.3), Inches(1.85), Inches(12.5), Inches(0.03))
        line.fill.solid()
        line.fill.fore_color.rgb = BLUE_LIGHT if scene_type == "content" else WHITE
        line.line.fill.background()

        # Bullet points
        top = 2.05
        for point in points[:6]:
            if not point.strip():
                continue
            # Bullet dot
            dot = slide.shapes.add_shape(9, Inches(0.3), Inches(top + 0.07), Inches(0.12), Inches(0.12))
            dot.fill.solid()
            dot.fill.fore_color.rgb = BLUE_MID if scene_type == "content" else WHITE
            dot.line.fill.background()
            _add_textbox(slide, point, 0.55, top, 12, 0.45, 20, color=bullet_color)
            top += 0.55
            if top > 6.5:
                break

        # Key concepts footer
        if concepts and scene_type == "content":
            footer = slide.shapes.add_shape(1, Inches(0), Inches(6.9), Inches(13.33), Inches(0.6))
            footer.fill.solid()
            footer.fill.fore_color.rgb = BLUE_MID
            footer.line.fill.background()
            kc_text = "  ·  ".join(concepts[:4])
            _add_textbox(slide, kc_text, 0.3, 6.92, 12.5, 0.45, 14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

        # Watermark
        _add_textbox(slide, "EduGenAI", 12.0, 7.1, 1.2, 0.3, 10,
                     color=RGBColor(200, 200, 200) if scene_type == "content" else RGBColor(200, 255, 230))

    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
    prs.save(output_path)
    return output_path