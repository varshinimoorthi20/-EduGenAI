"""
script_generator.py - Enhanced with multilingual + learning style + difficulty + revision mode + code examples.
Supports: Groq, OpenAI, Gemini
"""
import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env", override=True)

# Programming/technical topics that trigger code example generation
PROGRAMMING_KEYWORDS = [
    "python", "java", "javascript", "c++", "c#", "programming", "coding", "algorithm",
    "data structure", "machine learning", "deep learning", "neural network", "artificial intelligence",
    "ai", "ml", "data science", "web development", "api", "database", "sql", "html", "css",
    "react", "node", "flask", "django", "sorting", "searching", "recursion", "linked list",
    "stack", "queue", "tree", "graph", "binary", "object oriented", "oop", "function",
    "loop", "array", "string manipulation", "file handling", "numpy", "pandas", "tensorflow",
    "pytorch", "scikit", "opencv", "computer vision", "nlp", "natural language processing",
]


def _is_programming_topic(topic: str) -> bool:
    topic_lower = topic.lower()
    return any(kw in topic_lower for kw in PROGRAMMING_KEYWORDS)


def _grade_descriptor(grade: int) -> str:
    if grade <= 2:
        return "kindergarten to 2nd grade (ages 5-8). Use very simple words, short sentences, and fun analogies."
    elif grade <= 5:
        return "3rd to 5th grade (ages 8-11). Use clear, friendly language with simple definitions."
    elif grade <= 8:
        return "6th to 8th grade (ages 11-14). Use proper terminology with real-world examples."
    elif grade <= 10:
        return "9th to 10th grade (ages 14-16). Use academic language with cause-effect relationships."
    else:
        return "11th to 12th grade (ages 16-18). Use sophisticated academic language with analysis."


def _learning_style_instruction(style: str) -> str:
    styles = {
        "visual": "Use descriptive visual language. Reference diagrams, colors, shapes, and spatial relationships.",
        "example": "Use lots of concrete real-world examples and analogies before explaining theory.",
        "story": "Frame the lesson as a story or narrative with characters and dramatic scenarios.",
    }
    return styles.get(style.lower(), styles["visual"])


def _language_instruction(language: str) -> str:
    if language.lower() == "tamil":
        return "Write the ENTIRE lesson in Tamil language. Use clear Tamil script throughout."
    elif language.lower() == "hindi":
        return "Write the ENTIRE lesson in Hindi language. Use Devanagari script throughout."
    return "Write in English."


def _difficulty_instruction(difficulty: str) -> str:
    difficulties = {
        "beginner": (
            "Difficulty: BEGINNER.\n"
            "- Use very simple language, avoid all jargon.\n"
            "- Focus only on basic concepts with everyday examples.\n"
            "- Keep narration short, friendly, and easy to follow.\n"
            "- Each scene should have 2-3 simple bullet points."
        ),
        "intermediate": (
            "Difficulty: INTERMEDIATE.\n"
            "- Use moderate technical language and introduce proper terminology.\n"
            "- Balance theory with practical examples.\n"
            "- Assume basic prior knowledge of the subject.\n"
            "- Each scene should have 3-4 bullet points with clear explanations."
        ),
        "advanced": (
            "Difficulty: ADVANCED — Write a LARGE and DETAILED lesson.\n"
            "- Use technical language, precise terminology, and in-depth analysis.\n"
            "- Every scene MUST cover: Definition, Working/Concept, Real-world Examples, Applications, Advantages and Limitations.\n"
            "- Narration should be long, thorough, and cover edge cases and nuances.\n"
            "- Each scene should have 5-6 detailed bullet points.\n"
            "- Include multiple examples per concept.\n"
            "- Assume strong prior knowledge — do not oversimplify.\n"
            "- Use more scenes (aim for 5 scenes) to cover the topic comprehensively."
        ),
    }
    return difficulties.get(difficulty.lower(), difficulties["intermediate"])


def _revision_instruction() -> str:
    return """MODE: SMART REVISION MODE — Generate a concise exam-revision summary.
- Focus ONLY on the most important key points.
- Each scene must include: Key definitions, Important concepts, Critical formulas or terms.
- Narration should be SHORT and punchy — suitable for last-minute exam revision.
- Bullet points should be crisp and memorable (max 6 words each).
- Do NOT include long explanations or stories — only essential facts.
- Use 3 scenes maximum."""


def _code_example_instruction() -> str:
    return """CODE EXAMPLES: This is a programming/technical topic.
- Include at least ONE scene dedicated to a simple code example.
- The code scene must contain: concept explanation, a simple beginner-friendly code snippet, and a short line-by-line explanation.
- Put the code snippet inside the narration wrapped in triple backticks like ```python ... ```.
- Keep the code short (5-15 lines max) and easy to understand."""


def _words_for_duration(minutes: int) -> int:
    return minutes * 130


def _build_prompt(topic, grade, duration, language="english", learning_style="visual",
                  difficulty="intermediate", revision_mode=False):
    grade_desc  = _grade_descriptor(grade)
    lang_instr  = _language_instruction(language)
    style_instr = _learning_style_instruction(learning_style)
    is_programming = _is_programming_topic(topic)

    # Revision mode overrides difficulty
    if revision_mode:
        diff_instr   = _revision_instruction()
        scene_range  = "3 scenes maximum"
        word_count   = int(_words_for_duration(duration) * 0.5)
    else:
        diff_instr = _difficulty_instruction(difficulty)
        word_count = _words_for_duration(duration)
        if difficulty.lower() == "beginner":
            scene_range = "2-3 scenes"
            word_count  = int(word_count * 0.8)
        elif difficulty.lower() == "advanced":
            scene_range = "5 scenes"
            word_count  = int(word_count * 1.5)
        else:
            scene_range = "3-4 scenes"

    # Add code example instruction for programming topics
    code_instr = _code_example_instruction() if (is_programming and not revision_mode) else ""
    if is_programming and not revision_mode:
        print(f"[EduGenAI] Programming topic detected — code examples will be included.")

    return f"""You are an expert educational content creator.
{lang_instr}
Learning style: {style_instr}
{diff_instr}
{code_instr}

Create a structured educational video script on the topic: "{topic}".
Target audience: Grade {grade} students - {grade_desc}
Target duration: {duration} minute(s) (~{word_count} words of narration)

Return a JSON object with this exact structure:
{{
  "title": "Lesson title",
  "grade": {grade},
  "duration_minutes": {duration},
  "language": "{language}",
  "learning_style": "{learning_style}",
  "difficulty": "{difficulty}",
  "revision_mode": {str(revision_mode).lower()},
  "has_code_examples": {str(is_programming and not revision_mode).lower()},
  "learning_objectives": ["objective 1", "objective 2", "objective 3"],
  "introduction": "Engaging opening narration",
  "scenes": [
    {{
      "scene_number": 1,
      "scene_title": "Scene title",
      "narration": "Full narration text for this scene",
      "key_concepts": ["concept 1", "concept 2"],
      "slide_points": ["bullet point 1", "bullet point 2", "bullet point 3"]
    }}
  ],
  "conclusion": "Closing summary narration",
  "quiz_question": "One review question",
  "quiz_answer": "Answer to the review question"
}}

Rules:
- Include {scene_range}
- Narration must match the learning style and difficulty specified
- slide_points should be concise (max 8 words each)
- {"REVISION MODE: Keep everything short and exam-focused." if revision_mode else "For Advanced: each scene narration must be long and detailed (300+ words per scene)."}
- Return ONLY valid JSON, no markdown, no extra text"""


async def generate_script(topic, grade, duration, language="english", learning_style="visual",
                          difficulty="intermediate", revision_mode=False):
    prompt   = _build_prompt(topic, grade, duration, language, learning_style, difficulty, revision_mode)
    provider = os.getenv("AI_PROVIDER", "groq")
    print(f"[EduGenAI] Provider: {provider} | Language: {language} | Style: {learning_style} | Difficulty: {difficulty} | Revision: {revision_mode}")

    if provider == "groq":
        return await _generate_with_groq(prompt)
    elif provider == "gemini":
        return await _generate_with_gemini(prompt)
    else:
        return await _generate_with_openai(prompt)


async def generate_revision_summary(script: dict) -> dict:
    """Generate a concise revision summary from an existing full lesson script."""
    topic    = script.get("title", "this topic")
    scenes   = script.get("scenes", [])
    provider = os.getenv("AI_PROVIDER", "groq")

    scenes_text = "\n".join([
        f"Scene {s.get('scene_number')}: {s.get('scene_title')}\n"
        f"Key Concepts: {', '.join(s.get('key_concepts', []))}\n"
        f"Points: {', '.join(s.get('slide_points', []))}"
        for s in scenes
    ])

    prompt = f"""You are an expert educational content creator.
Based on this lesson about "{topic}", generate a concise Revision Mode Summary for exam preparation.

Lesson content:
{scenes_text}

Return a JSON object with this exact structure:
{{
  "revision_title": "Quick Revision: {topic}",
  "key_definitions": [
    {{"term": "term name", "definition": "short definition"}}
  ],
  "important_concepts": ["concept 1", "concept 2", "concept 3"],
  "bullet_summaries": [
    {{"scene": "Scene title", "points": ["key point 1", "key point 2"]}}
  ],
  "important_terms": ["term 1", "term 2", "term 3"],
  "formulas_or_rules": ["formula or rule 1", "formula or rule 2"]
}}

Rules:
- Keep everything SHORT and exam-focused
- Definitions must be one sentence max
- Bullet points must be under 10 words each
- Return ONLY valid JSON, no markdown"""

    if provider == "groq":
        return await _generate_with_groq(prompt)
    elif provider == "gemini":
        return await _generate_with_gemini(prompt)
    else:
        return await _generate_with_openai(prompt)


async def _generate_with_groq(prompt):
    from groq import AsyncGroq
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an expert educational content creator. Always return valid JSON only. No markdown."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


async def _generate_with_openai(prompt):
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert educational content creator. Always return valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)


async def _generate_with_gemini(prompt):
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = await model.generate_content_async(prompt)
    raw = response.text.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)