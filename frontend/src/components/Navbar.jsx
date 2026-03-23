// src/components/Navbar.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <motion.nav initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span style={{ fontFamily: "Fraunces, serif" }} className="text-xl text-slate-800 font-semibold">
            Edu<span className="gradient-text">GenAI</span>
          </span>
          <span className="hidden sm:block text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-0.5 rounded-full">v2.0</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-xl hover:bg-indigo-50">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-xl">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user.username?.[0]?.toUpperCase()}</span>
                </div>
                <span className="text-sm font-semibold text-indigo-700">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">Sign In</Link>
              <Link to="/signup" className="btn-primary text-sm py-2 px-5">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
