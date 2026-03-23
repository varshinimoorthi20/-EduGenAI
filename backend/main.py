"""
main.py — EduGenAI FastAPI Backend v2.0
Features: Auth, DB, Quiz, PPTX, Doubt Solver, Learning Styles, Difficulty, Voice Speed
Slides/video always in English. Audio narration supports English, Tamil, Hindi.
"""
import os
import uuid
import json
import asyncio
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

_ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=True)

from modules.script_generator import generate_script, generate_revision_summary
from modules.scene_generator import build_scenes
from modules.slide_generator import render_all_slides
from modules.voice_generator import generate_all_audio
from modules.video_compiler import compile_video
from modules.quiz.quiz_generator import generate_quiz
from modules.lesson.doubt_solver import solve_doubt
from modules.pptx.pptx_generator import generate_pptx
from modules.auth import auth_router
from database.db import get_db, init_db

app = FastAPI(title="EduGenAI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "output"))
OUTPUT_DIR.mkdir(exist_ok=True)
(OUTPUT_DIR / "videos").mkdir(exist_ok=True)
(OUTPUT_DIR / "pptx").mkdir(exist_ok=True)

app.mount("/output", StaticFiles(directory=str(OUTPUT_DIR)), name="output")
app.include_router(auth_router)

LANG_CODE_MAP = {
    "english": "en",
    "tamil":   "ta",
    "hindi":   "hi",
}

@app.on_event("startup")
async def startup():
    await init_db()


class GenerateRequest(BaseModel):
    topic:          str   = Field(..., min_length=3, max_length=200, example="The Water Cycle")
    grade:          int   = Field(..., ge=1, le=12, example=6)
    duration:       int   = Field(..., ge=1, le=5, example=3)
    language:       str   = Field(default="english")
    learning_style: str   = Field(default="visual")
    difficulty:     str   = Field(default="intermediate")
    voice_speed:    float = Field(default=1.0)
    revision_mode:  bool  = Field(default=False)


class DoubtRequest(BaseModel):
    lesson_id: str
    question:  str


class JobStatus(BaseModel):
    job_id:   str
    status:   str
    step:     str
    progress: int
    error:    Optional[str] = None
    result:   Optional[dict] = None


jobs: dict = {}


async def run_pipeline(job_id: str, req: GenerateRequest):
    base_dir   = OUTPUT_DIR / job_id
    slides_dir = base_dir / "slides"
    audio_dir  = base_dir / "audio"
    slides_dir.mkdir(parents=True, exist_ok=True)
    audio_dir.mkdir(parents=True, exist_ok=True)

    def upd(step, progress):
        jobs[job_id]["step"]     = step
        jobs[job_id]["progress"] = progress

    try:
        upd("Generating educational script with AI...", 10)
        # Script always generated in English — slides/video stay English
        script = await generate_script(
            req.topic, req.grade, req.duration,
            language="english",
            learning_style=req.learning_style,
            difficulty=req.difficulty,
            revision_mode=req.revision_mode,
        )
        with open(base_dir / "script.json", "w", encoding="utf-8") as f:
            json.dump(script, f, indent=2, ensure_ascii=False)

        upd("Structuring lesson scenes...", 22)
        scenes = build_scenes(script)
        with open(base_dir / "scenes.json", "w", encoding="utf-8") as f:
            json.dump(scenes, f, indent=2, ensure_ascii=False)

        upd("Rendering slide visuals...", 38)
        slide_paths = render_all_slides(scenes, str(slides_dir), lesson_title=script.get("title", req.topic))

        upd("Generating AI voice narration...", 55)
        lang_code   = LANG_CODE_MAP.get(req.language.lower(), "en")
        audio_scenes = scenes
        if req.language.lower() != "english":
            from modules.translation.translator import translate_script
            narration_map = {
                "scenes": [
                    {"scene_number": s["scene_number"], "narration": s.get("narration", "")}
                    for s in scenes
                ]
            }
            translated    = await translate_script(narration_map, req.language)
            trans_lookup  = {s["scene_number"]: s["narration"] for s in translated.get("scenes", [])}
            audio_scenes  = [
                {**s, "narration": trans_lookup.get(s["scene_number"], s.get("narration", ""))}
                for s in scenes
            ]
        # Pass voice_speed to audio generation
        audio_data = await generate_all_audio(audio_scenes, str(audio_dir), lang=lang_code, speed=req.voice_speed)

        upd("Compiling final video...", 70)
        video_filename = f"{job_id}.mp4"
        video_path     = str(OUTPUT_DIR / "videos" / video_filename)
        await compile_video(scenes, slide_paths, audio_data, video_path)

        upd("Generating PowerPoint presentation...", 84)
        pptx_filename = f"{job_id}.pptx"
        pptx_path     = str(OUTPUT_DIR / "pptx" / pptx_filename)
        generate_pptx(scenes, script.get("title", req.topic), pptx_path, language="english")

        upd("Generating quiz questions...", 93)
        quiz = await generate_quiz(script, language="english")
        with open(base_dir / "quiz.json", "w", encoding="utf-8") as f:
            json.dump(quiz, f, indent=2, ensure_ascii=False)

        # Generate revision summary if revision mode is enabled
        revision_summary = None
        if req.revision_mode:
            upd("Generating revision summary...", 97)
            revision_summary = await generate_revision_summary(script)
            with open(base_dir / "revision_summary.json", "w", encoding="utf-8") as f:
                json.dump(revision_summary, f, indent=2, ensure_ascii=False)

        result = {
            "video_url":           f"/output/videos/{video_filename}",
            "pptx_url":            f"/output/pptx/{pptx_filename}",
            "title":               script.get("title", req.topic),
            "scenes_count":        len(scenes),
            "learning_objectives": script.get("learning_objectives", []),
            "quiz":                quiz,
            "quiz_question":       script.get("quiz_question", ""),
            "quiz_answer":         script.get("quiz_answer", ""),
            "script":              script,
            "scenes":              scenes,
            "language":            req.language,
            "learning_style":      req.learning_style,
            "difficulty":          req.difficulty,
            "voice_speed":         req.voice_speed,
            "revision_mode":       req.revision_mode,
            "revision_summary":    revision_summary,
        }
        jobs[job_id].update({"status": "completed", "step": "Video ready!", "progress": 100, "result": result})

    except Exception as e:
        import traceback
        traceback.print_exc()
        jobs[job_id].update({"status": "failed", "step": "Failed", "progress": 0, "error": str(e)})


@app.get("/")
def root():
    return {"message": "EduGenAI API v2.0"}


@app.post("/generate", response_model=JobStatus, status_code=202)
async def generate(req: GenerateRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"job_id": job_id, "status": "running", "step": "Starting...", "progress": 5, "error": None, "result": None}
    (OUTPUT_DIR / job_id).mkdir(parents=True, exist_ok=True)
    background_tasks.add_task(run_pipeline, job_id, req)
    return jobs[job_id]


@app.get("/status/{job_id}", response_model=JobStatus)
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    return jobs[job_id]


@app.get("/download/video/{job_id}")
async def download_video(job_id: str):
    path = OUTPUT_DIR / "videos" / f"{job_id}.mp4"
    if not path.exists():
        raise HTTPException(404, "Video not found")
    return FileResponse(str(path), media_type="video/mp4", filename=f"EduGenAI_{job_id[:8]}.mp4")


@app.get("/download/pptx/{job_id}")
async def download_pptx(job_id: str):
    path = OUTPUT_DIR / "pptx" / f"{job_id}.pptx"
    if not path.exists():
        raise HTTPException(404, "PPTX not found")
    return FileResponse(str(path),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=f"EduGenAI_{job_id[:8]}.pptx")


@app.post("/doubt")
async def ask_doubt(req: DoubtRequest):
    script_path = OUTPUT_DIR / req.lesson_id / "script.json"
    if not script_path.exists():
        raise HTTPException(404, "Lesson not found")
    with open(script_path, encoding="utf-8") as f:
        script = json.load(f)
    answer = await solve_doubt(req.question, script, language="english")
    return {"question": req.question, "answer": answer}


@app.get("/quiz/{job_id}")
async def get_quiz(job_id: str):
    path = OUTPUT_DIR / job_id / "quiz.json"
    if not path.exists():
        raise HTTPException(404, "Quiz not found")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0", "jobs_active": len(jobs)}