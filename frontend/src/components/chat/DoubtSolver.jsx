// src/components/chat/DoubtSolver.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Bot, User } from "lucide-react";
import { askDoubt } from "../../utils/api";

export default function DoubtSolver({ jobId, language }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: language === "tamil" ? "வணக்கம்! இந்த பாடத்தைப் பற்றி எந்த கேள்வியும் கேளுங்கள்." : language === "hindi" ? "नमस्ते! इस पाठ के बारे में कोई भी प्रश्न पूछें।" : "Hello! Ask me anything about this lesson." }
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(p => [...p, { role: "user", text: question }]);
    setLoading(true);
    try {
      const { data } = await askDoubt(jobId, question);
      setMessages(p => [...p, { role: "bot", text: data.answer }]);
    } catch {
      setMessages(p => [...p, { role: "bot", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-cyan-100 rounded-xl flex items-center justify-center">
          <MessageCircle size={18} className="text-cyan-600" />
        </div>
        <h3 style={{ fontFamily: "Fraunces, serif" }} className="text-xl text-slate-800">AI Doubt Solver</h3>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 h-64 overflow-y-auto p-4 space-y-3 mb-3">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.role === "bot" ? "bg-indigo-600" : "bg-slate-300"}`}>
                {m.role === "bot" ? <Bot size={14} className="text-white" /> : <User size={14} className="text-slate-600" />}
              </div>
              <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700" : "bg-indigo-600 text-white"}`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl">
                <Loader2 size={14} className="text-indigo-500 animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask a question about this lesson..."
          className="input-base flex-1 py-2.5 text-sm" disabled={loading} />
        <button onClick={send} disabled={loading || !input.trim()}
          className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center transition-colors disabled:opacity-50">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
