// src/components/ProgressLoader.jsx
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Layout, Mic, Film, HelpCircle, Presentation, CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  { icon: FileText,     label: "AI Script",  threshold: 10 },
  { icon: Layout,       label: "Scenes",     threshold: 22 },
  { icon: Layout,       label: "Slides",     threshold: 38 },
  { icon: Mic,          label: "Voice",      threshold: 55 },
  { icon: Film,         label: "Video",      threshold: 70 },
  { icon: Presentation, label: "PPTX",       threshold: 84 },
  { icon: HelpCircle,   label: "Quiz",       threshold: 93 },
];

export default function ProgressLoader({ step, progress }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto px-6 mt-8">
      <div className="card p-8 shadow-xl shadow-indigo-100/40">
        <div className="text-center mb-8">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-4 text-indigo-600">
            <Loader2 size={32} />
          </motion.div>
          <h3 style={{ fontFamily: "Fraunces, serif" }} className="text-2xl text-slate-800 mb-2">Creating Your Lesson</h3>
          <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-slate-500 text-sm">{step || "Processing…"}</motion.p>
          </AnimatePresence>
        </div>

        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-8">
          <motion.div initial={{ width: "5%" }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full progress-shimmer" />
        </div>

        <div className="grid grid-cols-7 gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done   = progress > s.threshold;
            const active = !done && (i === 0 || progress > STEPS[i-1]?.threshold);
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} className="flex flex-col items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500
                  ${done ? "bg-emerald-500 text-white shadow-md" : active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110" : "bg-slate-100 text-slate-400"}`}>
                  {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-xs font-bold leading-tight text-center ${active ? "text-indigo-600" : done ? "text-emerald-600" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </motion.div>
            );
          })}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6 font-mono">{progress}% — takes 2–4 minutes</p>
      </div>
    </motion.div>
  );
}
