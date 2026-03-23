"""
video_compiler.py
Compiles slide images + audio narrations into a final MP4 educational video.
Uses MoviePy (wraps FFmpeg).
"""

import os
import asyncio
from typing import List
from pathlib import Path


async def compile_video(
    scenes: list,
    slide_paths: List[str],
    audio_data: List[dict],
    output_path: str,
    fps: int = 24,
) -> str:
    """
    Compile all slides + audio into a final video.
    Returns the path to the output MP4 file.
    """
    def _build():
        from moviepy.editor import (
            ImageClip,
            AudioFileClip,
            CompositeAudioClip,
            concatenate_videoclips,
        )

        # Map scene_number → audio_path
        audio_map = {a["scene_number"]: a["audio_path"] for a in audio_data}
        # Map scene_number → slide_path
        slide_map = {i: p for i, p in enumerate(slide_paths)}

        clips = []
        for idx, scene in enumerate(scenes):
            snum = scene.get("scene_number", idx)
            slide_path = slide_map.get(idx)
            audio_path = audio_map.get(snum)

            if not slide_path or not os.path.exists(slide_path):
                continue

            if audio_path and os.path.exists(audio_path):
                audio_clip = AudioFileClip(audio_path)
                duration = audio_clip.duration
                img_clip = ImageClip(slide_path).set_duration(duration)
                img_clip = img_clip.set_audio(audio_clip)
            else:
                # Fallback: 5 seconds per slide with no audio
                img_clip = ImageClip(slide_path).set_duration(5)

            # Fade in/out
            img_clip = img_clip.fadein(0.5).fadeout(0.5)
            clips.append(img_clip)

        if not clips:
            raise ValueError("No clips to compile — check slides and audio.")

        final = concatenate_videoclips(clips, method="compose")
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        final.write_videofile(
            output_path,
            fps=fps,
            codec="libx264",
            audio_codec="aac",
            temp_audiofile=output_path + ".temp.m4a",
            remove_temp=True,
            logger=None,  # suppress verbose output
        )
        final.close()
        return output_path

    result = await asyncio.get_running_loop().run_in_executor(None, _build)
    return result


async def compile_video_ffmpeg(
    scenes: list,
    slide_paths: List[str],
    audio_data: List[dict],
    output_path: str,
) -> str:
    """
    Alternative FFmpeg-based compiler (no MoviePy dependency).
    Uses ffmpeg CLI via subprocess.
    """
    import subprocess
    import tempfile

    audio_map = {a["scene_number"]: a["audio_path"] for a in audio_data}
    segment_paths = []

    with tempfile.TemporaryDirectory() as tmpdir:
        for idx, scene in enumerate(scenes):
            snum = scene.get("scene_number", idx)
            slide_path = slide_paths[idx] if idx < len(slide_paths) else None
            audio_path = audio_map.get(snum)

            if not slide_path or not os.path.exists(slide_path):
                continue

            seg_out = os.path.join(tmpdir, f"seg_{idx:03d}.mp4")

            if audio_path and os.path.exists(audio_path):
                # Get audio duration
                dur_cmd = [
                    "ffprobe", "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1", audio_path
                ]
                dur_result = subprocess.run(dur_cmd, capture_output=True, text=True)
                duration = float(dur_result.stdout.strip() or "5")

                cmd = [
                    "ffmpeg", "-y",
                    "-loop", "1", "-i", slide_path,
                    "-i", audio_path,
                    "-c:v", "libx264", "-tune", "stillimage",
                    "-c:a", "aac", "-b:a", "192k",
                    "-pix_fmt", "yuv420p",
                    "-shortest", "-t", str(duration),
                    seg_out
                ]
            else:
                cmd = [
                    "ffmpeg", "-y",
                    "-loop", "1", "-i", slide_path,
                    "-c:v", "libx264", "-t", "5",
                    "-pix_fmt", "yuv420p",
                    seg_out
                ]

            subprocess.run(cmd, check=True, capture_output=True)
            segment_paths.append(seg_out)

        if not segment_paths:
            raise ValueError("No segments compiled.")

        # Write concat list
        concat_file = os.path.join(tmpdir, "concat.txt")
        with open(concat_file, "w") as f:
            for sp in segment_paths:
                f.write(f"file '{sp}'\n")

        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        concat_cmd = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_file,
            "-c", "copy", output_path
        ]
        subprocess.run(concat_cmd, check=True, capture_output=True)

    return output_path