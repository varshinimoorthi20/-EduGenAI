// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(() => localStorage.getItem("edu_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUser(r.data))
        .catch(() => { setToken(null); localStorage.removeItem("edu_token"); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const _saveToken = (t) => {
    setToken(t);
    localStorage.setItem("edu_token", t);
  };

  const login = async (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const { data } = await axios.post(`${BASE_URL}/auth/login`, form);
    _saveToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const signup = async (email, username, password, full_name) => {
    const { data } = await axios.post(`${BASE_URL}/auth/signup`, { email, username, password, full_name });
    _saveToken(data.access_token);
    setUser(data.user);
    return data;
  };

  // Called after Google OAuth redirect
  const loginWithToken = (t, userInfo) => {
    _saveToken(t);
    setUser(userInfo);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("edu_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, loginWithToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
