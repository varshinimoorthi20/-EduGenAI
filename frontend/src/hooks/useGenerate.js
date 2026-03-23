import { useState, useRef, useCallback } from "react";
import { generateVideo, getStatus } from "../utils/api";
const POLL_INTERVAL = 2500;
export function useGenerate() {
  const [state, setState] = useState({ status: "idle", step: "", progress: 0, jobId: null, result: null, error: null });
  const pollRef = useRef(null);
  const stopPolling = () => { if (pollRef.current) clearInterval(pollRef.current); };
  const startPolling = useCallback((jobId) => {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await getStatus(jobId);
        setState(p => ({ ...p, step: data.step, progress: data.progress, status: data.status, result: data.result, error: data.error }));
        if (data.status === "completed" || data.status === "failed") stopPolling();
      } catch { setState(p => ({ ...p, status: "failed", error: "Network error" })); stopPolling(); }
    }, POLL_INTERVAL);
  }, []);
  const generate = useCallback(async (params) => {
    stopPolling();
    setState({ status: "running", step: "Starting...", progress: 5, jobId: null, result: null, error: null });
    try {
      const { data } = await generateVideo(params);
      setState(p => ({ ...p, jobId: data.job_id, step: data.step, progress: data.progress }));
      startPolling(data.job_id);
    } catch (err) {
      setState({ status: "failed", step: "Failed", progress: 0, jobId: null, result: null, error: err.response?.data?.detail || err.message });
    }
  }, [startPolling]);
  const reset = useCallback(() => { stopPolling(); setState({ status: "idle", step: "", progress: 0, jobId: null, result: null, error: null }); }, []);
  return { ...state, generate, reset };
}
