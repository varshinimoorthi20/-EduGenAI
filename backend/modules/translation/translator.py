# modules/translation/translator.py
"""
Handles multilingual support for English, Tamil, and Hindi.
Uses Groq/Gemini to translate full script objects.
"""
import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env", override=True)

LANGUAGE_CODES = {
    "english": {"gtts": "en", "name": "English", "native": "English"},
    "tamil":   {"gtts": "ta", "name": "Tamil",   "native": "தமிழ்"},
    "hindi":   {"gtts": "hi", "name": "Hindi",   "native": "हिंदी"},
}


def get_gtts_lang(language: str) -> str:
    return LANGUAGE_CODES.get(language.lower(), {}).get("gtts", "en")


def get_language_instruction(language: str) -> str:
    if language.lower() == "tamil":
        return "Write everything in Tamil language (தமிழ்). Use clear Tamil script."
    elif language.lower() == "hindi":
        return "Write everything in Hindi language (हिंदी). Use Devanagari script."
    else:
        return "Write everything in English."


async def translate_script(script: dict, target_language: str) -> dict:
    """Translate an entire script dict to the target language."""
    if target_language.lower() == "english":
        return script  # No translation needed

    provider = os.getenv("AI_PROVIDER", "groq")
    prompt = f"""Translate the following educational lesson JSON to {target_language}.
Translate ALL text values (title, narration, slide_points, learning_objectives, introduction, conclusion, quiz_question, quiz_answer, scene_title, key_concepts).
Keep the JSON structure exactly the same. Return ONLY valid JSON.

{json.dumps(script, ensure_ascii=False)}"""

    if provider == "groq":
        return await _translate_groq(prompt)
    elif provider == "gemini":
        return await _translate_gemini(prompt)
    else:
        return await _translate_openai(prompt)


async def _translate_groq(prompt: str) -> dict:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    raw = response.choices[0].message.content.strip()
    return json.loads(raw)


async def _translate_gemini(prompt: str) -> dict:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = await model.generate_content_async(prompt)
    raw = response.text.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


async def _translate_openai(prompt: str) -> dict:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
