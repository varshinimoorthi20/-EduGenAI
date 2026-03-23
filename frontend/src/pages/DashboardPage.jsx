// src/pages/DashboardPage.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Video, FileDown, Clock, GraduationCap, Globe } from "lucide-react";

const LANG_FLAGS = { english: "🇬🇧", tamil: "🇮🇳", hindi: "🇮🇳" };
const STYLE_ICONS = { visual: "👁️", example: "💡", story: "📖" };

// Demo lessons shown when no real lessons exist
const DEMO_LESSONS = [
  { id: "demo-1", title: "The Water Cycle", topic: "The Water Cycle", grade: 6, duration: 3, language: "english", learning_style: "visual", status: "completed", created_at: new Date().toISOString() },
  { id: "demo-2", title: "Newton's Laws of Motion", topic: "Newton's Laws", grade: 8, duration: 3, language: "english", learning_style: "example", status: "completed", created_at: new Date().toISOString() },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // In a real app these would come from the DB via API
  const lessons = DEMO_LESSONS;

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 style={{ fontFamily: "Fraunces, serif" }} className="text-4xl text-slate-800 font-semibold">
              Welcome, {user.full_name || user.username} 👋
            </h1>
            <p className="text-slate-400 mt-1">Manage your AI-generated lessons and videos</p>
          </div>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <PlusCircle size={18} /> New Lesson
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Video, label: "Total Lessons", value: lessons.length, color: "indigo" },
          { icon: GraduationCap, label: "Grades Covered", value: [...new Set(lessons.map(l => l.grade))].length, color: "blue" },
          { icon: Globe, label: "Languages Used", value: [...new Set(lessons.map(l => l.language))].length, color: "cyan" },
          { icon: Clock, label: "Minutes Generated", value: lessons.reduce((a, l) => a + l.duration, 0), color: "emerald" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card p-5">
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-2xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={`text-${stat.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Lesson history */}
      <div>
        <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-2xl text-slate-800 font-semibold mb-5">Your Lessons</h2>

        {lessons.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🎓</div>
            <p className="text-slate-500 mb-4">No lessons yet. Create your first one!</p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle size={18} /> Create Lesson
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, i) => (
              <motion.div key={lesson.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="card p-5 flex items-center gap-4 hover:shadow-md hover:shadow-indigo-100/40 transition-shadow">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center shrink-0 text-2xl">
                  {STYLE_ICONS[lesson.learning_style] || "🎓"}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{lesson.title}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-400 font-medium">Grade {lesson.grade}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400 font-medium">{lesson.duration} min</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-medium text-indigo-600">{LANG_FLAGS[lesson.language]} {lesson.language}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg font-bold capitalize">{lesson.status}</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {lesson.status === "completed" && (
                    <>
                      <a href={`/output/videos/${lesson.id}.mp4`} download
                        className="flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors">
                        <Video size={13} /> Video
                      </a>
                      <a href={`/output/pptx/${lesson.id}.pptx`} download
                        className="flex items-center gap-1.5 text-xs font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors">
                        <FileDown size={13} /> PPTX
                      </a>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
