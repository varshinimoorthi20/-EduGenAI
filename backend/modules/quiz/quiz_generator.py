# modules/quiz/quiz_generator.py
"""
Generates 5 multiple-choice quiz questions from a lesson script.
"""
import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env", override=True)


async def generate_quiz(script: dict, language: str = "english") -> list:
    """Returns list of 5 quiz question dicts."""
    topic = script.get("title", "the lesson")
    grade = script.get("grade", 6)
    narration_summary = " ".join([
        s.get("narration", "")[:200] for s in script.get("scenes", [])
    ])

    lang_note = ""
    if language.lower() == "tamil":
        lang_note = "Generate all questions and answers in Tamil language."
    elif language.lower() == "hindi":
        lang_note = "Generate all questions and answers in Hindi language."

    prompt = f"""You are an educational quiz creator. Based on this lesson about "{topic}" for Grade {grade} students, generate exactly 5 multiple choice questions.
{lang_note}

Lesson summary: {narration_summary[:800]}

Return a JSON object with this structure:
{{
  "questions": [
    {{
      "id": 1,
      "question": "Question text here?",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct": "A",
      "explanation": "Brief explanation of why this is correct"
    }}
  ]
}}

Rules:
- 5 questions only
- 4 options each (A, B, C, D)
- Mix easy and medium difficulty
- Return ONLY valid JSON"""

    provider = os.getenv("AI_PROVIDER", "groq")

    try:
        if provider == "groq":
            result = await _quiz_groq(prompt)
        elif provider == "gemini":
            result = await _quiz_gemini(prompt)
        else:
            result = await _quiz_openai(prompt)
        return result.get("questions", [])
    except Exception as e:
        print(f"Quiz generation error: {e}")
        return []


async def _quiz_groq(prompt: str) -> dict:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)


async def _quiz_gemini(prompt: str) -> dict:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = await model.generate_content_async(prompt)
    raw = re.sub(r"^```json\s*", "", response.text.strip())
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


async def _quiz_openai(prompt: str) -> dict:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = await client.chat.completions.create(
        model="gpt-4o", messages=[{"role": "user", "content": prompt}],
        temperature=0.5, response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
