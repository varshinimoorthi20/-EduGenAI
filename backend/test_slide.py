import os
import sys

log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_log.txt")
sys.stdout = open(log_file, "w", encoding="utf-8")
sys.stderr = sys.stdout

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.slide_generator import render_all_slides

scenes = [
    {
        "scene_number": 1,
        "scene_type": "content",
        "scene_title": "தமிழ் பாடம் (Tamil Lesson)",
        "slide_points": ["இது ஒரு சோதனை.", "தமிழ் எழுத்துக்கள் சரியாக தெரிய வேண்டும்."],
        "key_concepts": ["தமிழ்", "சோதனை"]
    },
    {
        "scene_number": 2,
        "scene_type": "content",
        "scene_title": "हिंदी पाठ (Hindi Lesson)",
        "slide_points": ["यह एक परीक्षण है।", "हिंदी के अक्षर सही दिखने चाहिए।"],
        "key_concepts": ["हिंदी", "परीक्षण"]
    }
]

output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "test_slides")
os.makedirs(output_dir, exist_ok=True)

paths = render_all_slides(scenes, output_dir, lesson_title="Multilingual Test")

print("Generated slides at:", paths)
