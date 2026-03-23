# modules/lesson/doubt_solver.py
"""
AI Doubt Solver - answers student questions about a lesson.
"""
import os
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env", override=True)


async def solve_doubt(question: str, script: dict, language: str = "english") -> str:
    """Answer a student's question about the lesson."""
    topic = script.get("title", "the lesson")
    grade = script.get("grade", 6)
    context = json.dumps({
        "title": script.get("title"),
        "learning_objectives": script.get("learning_objectives", []),
        "scenes": [{"title": s.get("scene_title"), "narration": s.get("narration", "")[:300]}
                   for s in script.get("scenes", [])]
    }, ensure_ascii=False)

    lang_note = ""
    if language.lower() == "tamil":
        lang_note = "Answer in Tamil language (தமிழ்)."
    elif language.lower() == "hindi":
        lang_note = "Answer in Hindi language (हिंदी)."
    else:
        lang_note = "Answer in English."

    system = f"""You are a friendly and helpful educational assistant for Grade {grade} students studying "{topic}".
{lang_note}
Answer questions clearly, concisely, and in an age-appropriate way.
Base your answers on the lesson content provided. Keep answers under 150 words."""

    user_msg = f"""Lesson context: {context}

Student question: {question}"""

    provider = os.getenv("AI_PROVIDER", "groq")

    if provider == "groq":
        return await _answer_groq(system, user_msg)
    elif provider == "gemini":
        return await _answer_gemini(system, user_msg)
    else:
        return await _answer_openai(system, user_msg)


async def _answer_groq(system: str, user_msg: str) -> str:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user_msg}],
        temperature=0.6, max_tokens=300
    )
    return response.choices[0].message.content.strip()


async def _answer_gemini(system: str, user_msg: str) -> str:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.0-flash", system_instruction=system)
    response = await model.generate_content_async(user_msg)
    return response.text.strip()


async def _answer_openai(system: str, user_msg: str) -> str:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user_msg}],
        temperature=0.6, max_tokens=300
    )
    return response.choices[0].message.content.strip()
