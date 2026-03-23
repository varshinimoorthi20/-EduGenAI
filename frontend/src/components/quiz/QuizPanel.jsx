// src/components/quiz/QuizPanel.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, CheckCircle2, XCircle, Trophy } from "lucide-react";

export default function QuizPanel({ quiz }) {
  const [answers, setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const score = submitted ? quiz.filter((q, i) => answers[i] === q.correct).length : 0;

  const handleAnswer = (qi, opt) => {
    if (submitted) return;
    setAnswers(p => ({ ...p, [qi]: opt[0] }));
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
          <HelpCircle size={18} className="text-amber-600" />
        </div>
        <h3 style={{ fontFamily: "Fraunces, serif" }} className="text-xl text-slate-800">Quick Quiz</h3>
        {submitted && (
          <div className="ml-auto flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            <Trophy size={16} className="text-amber-500" />
            <span className="font-bold text-amber-700">{score}/{quiz.length}</span>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {quiz.map((q, qi) => {
          const selected = answers[qi];
          const isCorrect = selected === q.correct;
          return (
            <motion.div key={qi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.08 }}
              className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <p className="font-bold text-slate-800 mb-3 text-sm">{qi + 1}. {q.question}</p>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, oi) => {
                  const letter = opt[0];
                  const isSelected = selected === letter;
                  const isRight = letter === q.correct;
                  let cls = "border-2 border-slate-200 bg-white text-slate-700 hover:border-indigo-300";
                  if (submitted) {
                    if (isRight) cls = "border-2 border-emerald-400 bg-emerald-50 text-emerald-800";
                    else if (isSelected && !isRight) cls = "border-2 border-red-400 bg-red-50 text-red-700";
                  } else if (isSelected) {
                    cls = "border-2 border-indigo-500 bg-indigo-50 text-indigo-800";
                  }
                  return (
                    <button key={oi} onClick={() => handleAnswer(qi, opt)} disabled={submitted}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${cls} flex items-center justify-between`}>
                      {opt}
                      {submitted && isRight && <CheckCircle2 size={16} className="text-emerald-500" />}
                      {submitted && isSelected && !isRight && <XCircle size={16} className="text-red-500" />}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  💡 {q.explanation}
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>

      {!submitted && Object.keys(answers).length === quiz.length && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setSubmitted(true)}
          className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-2xl transition-colors">
          Submit Answers
        </motion.button>
      )}
    </div>
  );
}
