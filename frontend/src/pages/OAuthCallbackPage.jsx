// src/pages/OAuthCallbackPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, GraduationCap } from "lucide-react";

export default function OAuthCallbackPage() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const name   = params.get("name");
    const email  = params.get("email");

    if (token) {
      loginWithToken(token, { username: name?.split(" ")[0] || email, email, full_name: name });
      navigate("/");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-400 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200">
        <GraduationCap size={32} className="text-white" />
      </div>
      <Loader2 size={28} className="text-indigo-500 animate-spin" />
      <p className="text-slate-500 font-medium">Signing you in with Google…</p>
    </div>
  );
}
