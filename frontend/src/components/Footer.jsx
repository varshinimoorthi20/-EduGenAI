// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <p>Built with ♥ using FastAPI · Groq · gTTS · MoviePy · React</p>
        <p className="font-mono text-xs">EduGenAI v2.0.0</p>
      </div>
    </footer>
  );
}
