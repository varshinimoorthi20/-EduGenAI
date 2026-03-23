// src/components/VideoPlayer.jsx
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, BookOpen, Presentation, CheckCircle2, Globe, Brain, ClipboardList } from "lucide-react";
import { downloadVideo, downloadPptx, streamVideo } from "../utils/api";
import QuizPanel from "./quiz/QuizPanel";
import DoubtSolver from "./chat/DoubtSolver";

const LANG_LABELS  = { english: "🇬🇧 English", tamil: "🇮🇳 Tamil", hindi: "🇮🇳 Hindi" };
const STYLE_LABELS = { visual: "👁️ Visual", example: "💡 Examples", story: "📖 Story" };
const TABS = ["Video", "Quiz", "Doubt Solver", "Script"];

export default function VideoPlayer({ result, jobId, onReset }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted]     = useState(false);
  const [tab, setTab]         = useState("Video");

  const videoUrl = streamVideo(jobId);

  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
  };

  const revision = result?.revision_summary;

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-6 mt-8 pb-24">
      {/* Success banner */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 mb-6 font-semibold">
        <CheckCircle2 size={22} />
        <div>
          <span className="font-bold">Your lesson is ready!</span>
          <span className="text-emerald-500 font-normal ml-2 text-sm">{result?.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs bg-white border border-emerald-200 text-emerald-600 px-2 py-1 rounded-lg font-medium">{LANG_LABELS[result?.language] || "English"}</span>
          <span className="text-xs bg-white border border-emerald-200 text-emerald-600 px-2 py-1 rounded-lg font-medium">{STYLE_LABELS[result?.learning_style] || "Visual"}</span>
          {result?.revision_mode && (
            <span className="text-xs bg-amber-100 border border-amber-300 text-amber-700 px-2 py-1 rounded-lg font-medium">📝 Revision Mode</span>
          )}
        </div>
      </motion.div>

      <div className="card overflow-hidden shadow-xl shadow-indigo-100/40">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3.5 text-sm font-bold transition-all ${tab === t ? "text-indigo-600 border-b-2 border-indigo-600 bg-white" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* VIDEO TAB */}
          {tab === "Video" && (
            <div>
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video group mb-5">
                <video ref={videoRef} src={videoUrl} className="w-full h-full object-contain"
                  onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} muted={muted} />
                {!playing && (
                  <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <Play size={32} className="text-indigo-600 ml-1" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                  <button onClick={togglePlay} className="text-white hover:text-indigo-300 transition-colors">
                    {playing ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button onClick={() => setMuted(!muted)} className="text-white hover:text-indigo-300 transition-colors">
                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <div className="flex-1" />
                  <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white hover:text-indigo-300 transition-colors">
                    <Maximize2 size={18} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-2xl text-slate-800 font-semibold">{result?.title}</h2>
                  <p className="text-slate-400 text-sm mt-1">{result?.scenes_count} scenes · Grade {result?.script?.grade} · {result?.script?.duration_minutes} min</p>
                </div>
              </div>

              {/* Learning objectives */}
              {result?.learning_objectives?.length > 0 && (
                <div className="bg-indigo-50 rounded-2xl p-4 mb-5">
                  <h4 className="text-sm font-bold text-indigo-700 mb-2">Learning Objectives</h4>
                  <ul className="space-y-1">
                    {result.learning_objectives.map((obj, i) => (
                      <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">◆</span> {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Download buttons */}
              <div className="flex gap-3 flex-wrap">
                <a href={downloadVideo(jobId)} download className="btn-primary flex items-center gap-2 text-sm py-2.5">
                  <Download size={16} /> Download Video
                </a>
                <a href={downloadPptx(jobId)} download className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-md">
                  <Presentation size={16} /> Download PPTX
                </a>
                <button onClick={onReset} className="btn-secondary flex items-center gap-2 text-sm py-2.5">
                  <RotateCcw size={16} /> New Lesson
                </button>
              </div>
            </div>
          )}

          {/* QUIZ TAB */}
          {tab === "Quiz" && <QuizPanel quiz={result?.quiz} />}

          {/* DOUBT SOLVER TAB */}
          {tab === "Doubt Solver" && <DoubtSolver jobId={jobId} language={result?.language} />}

          {/* SCRIPT TAB */}
          {tab === "Script" && (
            <div className="space-y-6">
              {/* Main Script */}
              <div className="space-y-5">
                {result?.scenes?.map((scene) => (
                  <div key={scene.scene_number} className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg text-xs flex items-center justify-center font-bold">{scene.scene_number}</span>
                      {scene.scene_title}
                    </h5>
                    <p className="text-slate-500 text-sm leading-relaxed">{scene.narration}</p>
                  </div>
                ))}
              </div>

              {/* Revision Mode – Last Minute Preparation */}
              {result?.revision_mode && revision && (
                <div className="mt-6">
                  {/* Section Header */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl px-5 py-4 mb-5">
                    <ClipboardList size={20} className="text-white" />
                    <div>
                      <h3 className="text-base font-bold text-white">Revision Mode – Last Minute Preparation</h3>
                      <p className="text-amber-100 text-xs">Quick exam summary · {result?.title}</p>
                    </div>
                  </div>

                  {/* Key Definitions */}
                  {revision.key_definitions?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                      <h4 className="text-sm font-bold text-amber-700 mb-3">📖 Key Definitions</h4>
                      <div className="space-y-2">
                        {revision.key_definitions.map((item, i) => (
                          <div key={i} className="flex gap-2 text-sm">
                            <span className="font-bold text-amber-800 min-w-fit">{item.term}:</span>
                            <span className="text-amber-700">{item.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Concepts */}
                  {revision.important_concepts?.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4">
                      <h4 className="text-sm font-bold text-indigo-700 mb-3">💡 Important Concepts</h4>
                      <ul className="space-y-1">
                        {revision.important_concepts.map((concept, i) => (
                          <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">◆</span> {concept}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bullet Summaries */}
                  {revision.bullet_summaries?.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                      <h4 className="text-sm font-bold text-slate-700 mb-3">📌 Scene-by-Scene Summary</h4>
                      <div className="space-y-4">
                        {revision.bullet_summaries.map((s, i) => (
                          <div key={i}>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{s.scene}</p>
                            <ul className="space-y-1">
                              {s.points?.map((pt, j) => (
                                <li key={j} className="text-sm text-slate-600 flex items-start gap-2">
                                  <span className="text-slate-400 mt-0.5">•</span> {pt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Terms + Formulas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {revision.important_terms?.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                        <h4 className="text-sm font-bold text-emerald-700 mb-3">🔑 Important Terms</h4>
                        <div className="flex flex-wrap gap-2">
                          {revision.important_terms.map((term, i) => (
                            <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">{term}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {revision.formulas_or_rules?.length > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                        <h4 className="text-sm font-bold text-purple-700 mb-3">📐 Formulas & Rules</h4>
                        <ul className="space-y-1">
                          {revision.formulas_or_rules.map((f, i) => (
                            <li key={i} className="text-sm text-purple-700 font-mono bg-purple-100 px-2 py-1 rounded-lg">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show message if revision mode ON but data not yet available */}
              {result?.revision_mode && !revision && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700 font-medium">
                  📝 Revision summary is being generated...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Revision Mode – Last Minute Preparation ── */}
      {revision && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 card overflow-hidden shadow-xl shadow-amber-100/40">

          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-6 py-5 flex items-center gap-3">
            <ClipboardList size={24} className="text-white" />
            <div>
              <h3 style={{ fontFamily: "Fraunces, serif" }} className="text-xl font-semibold text-white">
                Revision Mode – Last Minute Preparation
              </h3>
              <p className="text-amber-100 text-sm">Quick summary for exam revision · {result?.title}</p>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* Key Definitions */}
            {revision.key_definitions?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-amber-700 mb-3">📖 Key Definitions</h4>
                <div className="space-y-2">
                  {revision.key_definitions.map((item, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="font-bold text-amber-800 min-w-fit">{item.term}:</span>
                      <span className="text-amber-700">{item.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Concepts */}
            {revision.important_concepts?.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-indigo-700 mb-3">💡 Important Concepts</h4>
                <ul className="space-y-1">
                  {revision.important_concepts.map((concept, i) => (
                    <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">◆</span> {concept}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bullet Summaries */}
            {revision.bullet_summaries?.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">📌 Scene-by-Scene Summary</h4>
                <div className="space-y-4">
                  {revision.bullet_summaries.map((s, i) => (
                    <div key={i}>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{s.scene}</p>
                      <ul className="space-y-1">
                        {s.points?.map((pt, j) => (
                          <li key={j} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-slate-400 mt-0.5">•</span> {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Terms + Formulas side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {revision.important_terms?.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-emerald-700 mb-3">🔑 Important Terms</h4>
                  <div className="flex flex-wrap gap-2">
                    {revision.important_terms.map((term, i) => (
                      <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">{term}</span>
                    ))}
                  </div>
                </div>
              )}
              {revision.formulas_or_rules?.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-purple-700 mb-3">📐 Formulas & Rules</h4>
                  <ul className="space-y-1">
                    {revision.formulas_or_rules.map((f, i) => (
                      <li key={i} className="text-sm text-purple-700 font-mono bg-purple-100 px-2 py-1 rounded-lg">{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}

    </motion.section>
  );
}