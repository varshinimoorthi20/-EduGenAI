"""
scene_generator.py
Breaks the script into structured scene objects ready for slide and video generation.
"""

from typing import List


def build_scenes(script: dict) -> List[dict]:
    """
    Takes a raw script dict and returns a clean list of scene objects,
    including an intro scene and an outro scene.
    """
    scenes = []

    # ── Intro scene ──────────────────────────────────────────────────────────
    scenes.append({
        "scene_number": 0,
        "scene_type": "intro",
        "scene_title": script.get("title", "Lesson"),
        "narration": script.get("introduction", ""),
        "slide_points": [
            f"Grade {script.get('grade', '')} Lesson",
            *script.get("learning_objectives", [])[:3],
        ],
        "key_concepts": [],
        "duration_hint": "short",
    })

    # ── Content scenes ────────────────────────────────────────────────────────
    for s in script.get("scenes", []):
        scenes.append({
            "scene_number": s.get("scene_number"),
            "scene_type": "content",
            "scene_title": s.get("scene_title", f"Scene {s.get('scene_number')}"),
            "narration": s.get("narration", ""),
            "slide_points": s.get("slide_points", []),
            "key_concepts": s.get("key_concepts", []),
            "duration_hint": "normal",
        })

    # ── Outro / summary scene ─────────────────────────────────────────────────
    quiz_text = script.get("quiz_question", "")
    scenes.append({
        "scene_number": len(scenes),
        "scene_type": "outro",
        "scene_title": "Summary & Review",
        "narration": script.get("conclusion", "") + (f" {quiz_text}" if quiz_text else ""),
        "slide_points": [
            "Key Takeaways",
            *[s.get("scene_title", "") for s in script.get("scenes", [])[:4]],
            quiz_text[:60] + ("…" if len(quiz_text) > 60 else "") if quiz_text else "",
        ],
        "key_concepts": [],
        "duration_hint": "short",
    })

    return [s for s in scenes if s["narration"].strip()]  # filter empty


def scene_summary(scenes: List[dict]) -> str:
    lines = [f"  Scene {s['scene_number']} [{s['scene_type']}]: {s['scene_title']}" for s in scenes]
    return "\n".join(lines)
