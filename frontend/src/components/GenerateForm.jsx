// src/components/GenerateForm.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Clock, Brain, Globe, Gauge, RotateCcw, ChevronDown } from "lucide-react";

const EXAMPLES = ["The Water Cycle", "Newton's Laws of Motion", "Photosynthesis", "The French Revolution", "Introduction to Algebra", "Climate Change", "Human Digestive System", "World War II"];

const LANGUAGES = [
  { id: "english", label: "English", flag: "🇬🇧" },
  { id: "tamil",   label: "Tamil",   flag: "🇮🇳" },
  { id: "hindi",   label: "Hindi",   flag: "🇮🇳" },
];

const STYLES = [
  { id: "visual",  icon: "👁️", label: "Visual",   desc: "Diagrams & imagery" },
  { id: "example", icon: "💡", label: "Examples",  desc: "Real-world examples" },
  { id: "story",   icon: "📖", label: "Story",     desc: "Narrative format" },
];

const DIFFICULTIES = [
  { id: "beginner",     icon: "🌱", label: "Beginner",     desc: "Simple & basic" },
  { id: "intermediate", icon: "📘", label: "Intermediate", desc: "Balanced depth" },
  { id: "advanced",     icon: "🔬", label: "Advanced",     desc: "Technical & deep" },
];

const SPEEDS = [
  { value: 0.75, label: "0.75x", desc: "Slow" },
  { value: 1.0,  label: "1x",    desc: "Normal" },
  { value: 1.25, label: "1.25x", desc: "Fast" },
  { value: 1.5,  label: "1.5x",  desc: "Faster" },
];

const GRADE_GROUPS = [
  { label: "Elementary",   grades: [1,2,3,4,5] },
  { label: "Middle School", grades: [6,7,8] },
  { label: "High School",  grades: [9,10,11,12] },
];

export default function GenerateForm({ onSubmit, isLoading }) {
  const [topic,          setTopic]          = useState("");
  const [grade,          setGrade]          = useState(6);
  const [duration,       setDuration]       = useState(3);
  const [language,       setLanguage]       = useState("english");
  const [learningStyle,  setLearningStyle]  = useState("visual");
  const [difficulty,     setDifficulty]     = useState("intermediate");
  const [voiceSpeed,     setVoiceSpeed]     = useState(1.0);
  const [revisionMode,   setRevisionMode]   = useState(false);
  const [showExamples,   setShowExamples]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit({
      topic: topic.trim(),
      grade,
      duration,
      language,
      learning_style: learningStyle,
      difficulty,
      voice_speed: voiceSpeed,
      revision_mode: revisionMode,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
      className="max-w-3xl mx-auto px-6">
      <div className="card p-8 shadow-xl shadow-indigo-100/50">
        <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-2xl text-slate-800 mb-1 font-semibold">Create Your Lesson</h2>
        <p className="text-slate-400 text-sm mb-8">Fill in the details — AI will do the rest.</p>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Topic */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
              <BookOpen size={14} className="text-indigo-500" /> Topic
            </label>
            <div className="relative">
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g., The Water Cycle, Photosynthesis…"
                className="input-base pr-28" required disabled={isLoading} />
              <button type="button" onClick={() => setShowExamples(!showExamples)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-500 font-bold flex items-center gap-1 hover:text-indigo-700">
                Examples <ChevronDown size={12} className={`transition-transform ${showExamples ? "rotate-180" : ""}`} />
              </button>
            </div>
            {showExamples && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-2 grid grid-cols-2 gap-2">
                {EXAMPLES.map(ex => (
                  <button key={ex} type="button" onClick={() => { setTopic(ex); setShowExamples(false); }}
                    className="text-left text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl transition-colors font-medium">
                    {ex}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Narration Language */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3">
              <Globe size={14} className="text-indigo-500" /> Narration Language
            </label>
            <div className="flex gap-3">
              {LANGUAGES.map(l => (
                <button key={l.id} type="button" onClick={() => setLanguage(l.id)} disabled={isLoading}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2 flex items-center justify-center gap-2
                    ${language === l.id ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">⚠️ Slides stay in English — only the voice narration changes.</p>
          </div>

          {/* Difficulty */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3">
              <Gauge size={14} className="text-indigo-500" /> Lesson Difficulty
            </label>
            <div className="flex gap-3">
              {DIFFICULTIES.map(d => (
                <button key={d.id} type="button" onClick={() => setDifficulty(d.id)} disabled={isLoading}
                  className={`flex-1 py-3 px-2 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-1
                    ${difficulty === d.id ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
                  <span className="text-lg">{d.icon}</span>
                  <span>{d.label}</span>
                  <span className={`text-xs font-normal ${difficulty === d.id ? "text-indigo-200" : "text-slate-400"}`}>{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Revision Mode */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3">
              <RotateCcw size={14} className="text-indigo-500" /> Smart Revision Mode
            </label>
            <button type="button" onClick={() => setRevisionMode(!revisionMode)} disabled={isLoading}
              className={`w-full py-4 rounded-2xl text-sm font-bold transition-all border-2 flex items-center justify-between px-5
                ${revisionMode ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div className="text-left">
                  <p className="font-bold">{revisionMode ? "Revision Mode ON" : "Revision Mode OFF"}</p>
                  <p className={`text-xs font-normal ${revisionMode ? "text-amber-100" : "text-slate-400"}`}>
                    {revisionMode ? "Short key points for quick exam revision" : "Full detailed lesson (default)"}
                  </p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all ${revisionMode ? "bg-white/30" : "bg-slate-200"} relative`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${revisionMode ? "left-6" : "left-0.5"}`} />
              </div>
            </button>
          </div>


          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3">
              <Clock size={14} className="text-indigo-500" /> Voice Speed — <span className="text-indigo-600">{voiceSpeed}x</span>
            </label>
            <div className="flex gap-3">
              {SPEEDS.map(s => (
                <button key={s.value} type="button" onClick={() => setVoiceSpeed(s.value)} disabled={isLoading}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-0.5
                    ${voiceSpeed === s.value ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
                  <span>{s.label}</span>
                  <span className={`text-xs font-normal ${voiceSpeed === s.value ? "text-indigo-200" : "text-slate-400"}`}>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Learning Style */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3">
              <Brain size={14} className="text-indigo-500" /> Learning Style
            </label>
            <div className="flex gap-3">
              {STYLES.map(s => (
                <button key={s.id} type="button" onClick={() => setLearningStyle(s.id)} disabled={isLoading}
                  className={`flex-1 py-3 px-2 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-1
                    ${learningStyle === s.id ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
                  <span className="text-lg">{s.icon}</span>
                  <span>{s.label}</span>
                  <span className={`text-xs font-normal ${learningStyle === s.id ? "text-indigo-200" : "text-slate-400"}`}>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3">
              Grade Level — <span className="text-indigo-600">Grade {grade}</span>
            </label>
            {GRADE_GROUPS.map(({ label, grades }) => (
              <div key={label} className="mb-3">
                <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">{label}</p>
                <div className="flex gap-2 flex-wrap">
                  {grades.map(g => (
                    <button key={g} type="button" onClick={() => setGrade(g)} disabled={isLoading}
                      className={`w-11 h-11 rounded-2xl text-sm font-bold transition-all border-2
                        ${grade === g ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-110" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3">
              <Clock size={14} className="text-indigo-500" /> Duration — <span className="text-indigo-600">{duration} min</span>
            </label>
            <div className="flex gap-3">
              {[1,2,3,4,5].map(d => (
                <button key={d} type="button" onClick={() => setDuration(d)} disabled={isLoading}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2
                    ${duration === d ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <motion.button type="submit" disabled={isLoading || !topic.trim()}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 text-white font-bold text-lg py-4 rounded-2xl
                       shadow-xl hover:shadow-indigo-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-3">
            <Sparkles size={22} />
            {isLoading ? "Generating…" : "Generate Lesson Video"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}