// src/utils/api.js
import axios from "axios";
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("edu_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export const generateVideo = (data) => api.post("/generate", data);
export const getStatus     = (jobId) => api.get(`/status/${jobId}`);
export const getQuiz       = (jobId) => api.get(`/quiz/${jobId}`);
export const askDoubt      = (lesson_id, question) => api.post("/doubt", { lesson_id, question });
export const downloadVideo = (jobId) => `${BASE_URL}/download/video/${jobId}`;
export const downloadPptx  = (jobId) => `${BASE_URL}/download/pptx/${jobId}`;
export const streamVideo   = (jobId) => `${BASE_URL}/output/videos/${jobId}.mp4`;
