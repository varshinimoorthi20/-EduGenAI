// src/pages/HomePage.jsx
import { motion, AnimatePresence } from "framer-motion";
import GenerateForm from "../components/GenerateForm";
import ProgressLoader from "../components/ProgressLoader";
import VideoPlayer from "../components/VideoPlayer";
import { useGenerate } from "../hooks/useGenerate";

const FEATURES = [
  { icon: "🎙️", title: "Multilingual Audio",  desc: "Voice narration in English, Tamil, or Hindi" },
  { icon: "🎬", title: "AI Video",             desc: "Full HD video with synced voice narration" },
  { icon: "📊", title: "PowerPoint",           desc: "Download slides as .pptx for classroom use" },
  { icon: "🧠", title: "Smart Quiz",           desc: "Auto-generated 5-question quiz after every lesson" },
  { icon: "💬", title: "Doubt Solver",         desc: "Chat with AI about the lesson content" },
  { icon: "🎨", title: "Learning Styles",      desc: "Visual, example-based, or story-driven lessons" },
];

export default function HomePage() {
  const { status, step, progress, jobId, result, error, generate, reset } = useGenerate();
  const isIdle      = status === "idle";
  const isRunning   = status === "running";
  const isCompleted = status === "completed";
  const isFailed    = status === "failed";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {!isCompleted && (
        <section className="relative overflow-hidden pt-20 pb-14 px-6">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
          <div className="relative max-w-4xl mx-auto text-center">


            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ fontFamily: "Fraunces, serif" }}
              className="text-5xl md:text-7xl text-slate-900 leading-tight mb-6 font-semibold">
              Turn any topic into
              <br />
              <span className="gradient-text">an educational video</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              EduGenAI generates scripts, slides, quiz and a compiled video in English — with voice narration available in English, Tamil, or Hindi.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-4">
              {["🎙️ Tamil Audio", "🎙️ Hindi Audio", "🇬🇧 English Slides", "📊 PPTX Download", "🧠 AI Quiz", "💬 Doubt Solver"].map((pill, i) => (
                <motion.span key={pill} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.06 }}
                  className="bg-white border border-slate-200 text-slate-600 text-sm px-4 py-1.5 rounded-full shadow-sm font-medium">
                  {pill}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Form */}
      <AnimatePresence>
        {(isIdle || isFailed) && (
          <div key="form">
            {isFailed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto px-6 mb-4">
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 text-sm font-medium">
                  ⚠️ {error || "Generation failed."} — <button onClick={reset} className="underline font-bold">Try Again</button>
                </div>
              </motion.div>
            )}
            <GenerateForm onSubmit={generate} isLoading={isRunning} />
          </div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <AnimatePresence>
        {isRunning && <ProgressLoader key="progress" step={step} progress={progress} />}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {isCompleted && result && <VideoPlayer key="video" result={result} jobId={jobId} onReset={reset} />}
      </AnimatePresence>

      {/* Features grid */}
      {isIdle && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-4xl text-slate-800 mb-3 font-semibold">Everything you need</h2>
            <p className="text-slate-500 max-w-xl mx-auto">A fully automated AI pipeline — from topic to finished educational video.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card p-6 hover:shadow-lg hover:shadow-indigo-100/50 transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}