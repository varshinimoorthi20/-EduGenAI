"""
voice_generator.py - Enhanced with multilingual support and voice speed control
Supports gTTS (free) and ElevenLabs (premium)
"""
import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env", override=True)

VOICE_PROVIDER = os.getenv("VOICE_PROVIDER", "gtts")


async def generate_audio(text: str, output_path: str, lang: str = "en", speed: float = 1.0) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    if VOICE_PROVIDER == "elevenlabs":
        return await _elevenlabs_tts(text, output_path, speed=speed)
    else:
        return await _gtts_tts(text, output_path, lang=lang, speed=speed)


async def _gtts_tts(text: str, output_path: str, lang: str = "en", speed: float = 1.0) -> str:
    from gtts import gTTS

    def _synth():
        use_slow = speed <= 0.85
        tts = gTTS(text=text, lang=lang, slow=use_slow)
        tts.save(output_path)

        # Apply speed > 1.0 using ffmpeg if available
        if speed > 1.05:
            import subprocess, shutil, os
            if shutil.which("ffmpeg"):
                temp_path = output_path + ".tmp.mp3"
                os.rename(output_path, temp_path)
                cmd = ["ffmpeg", "-y", "-i", temp_path,
                       "-filter:a", f"atempo={speed}", output_path]
                result = subprocess.run(cmd, capture_output=True)
                if result.returncode == 0:
                    os.remove(temp_path)
                else:
                    os.rename(temp_path, output_path)  # restore original
            else:
                print(f"[Voice] ffmpeg not found — speed {speed}x ignored, using normal speed.")

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _synth)
    return output_path


async def _elevenlabs_tts(text: str, output_path: str, speed: float = 1.0) -> str:
    import httpx
    api_key = os.getenv("ELEVENLABS_API_KEY", "")
    voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {"Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": api_key}
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "speed": speed}
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
    with open(output_path, "wb") as f:
        f.write(resp.content)
    return output_path


async def generate_all_audio(scenes: list, audio_dir: str, lang: str = "en", speed: float = 1.0) -> list:
    os.makedirs(audio_dir, exist_ok=True)
    results = []
    for scene in scenes:
        narration = scene.get("narration", "").strip()
        if not narration:
            continue
        filename = f"audio_{scene['scene_number']:03d}.mp3"
        path = os.path.join(audio_dir, filename)
        await generate_audio(narration, path, lang=lang, speed=speed)
        results.append({"scene_number": scene["scene_number"], "audio_path": path})
    return results