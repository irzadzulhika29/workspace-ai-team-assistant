import axios from "axios";
import { urls, getSessionId } from "./api";

// ─── Helper ──────────────────────────────────────────────────────────────────
const post = async (getUrl, payload) => {
  const res = await axios.post(getUrl(), payload, {
    timeout: 60_000,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const chatApi = {
  /**
   * Send a message to the Supervisor Agent.
   * @param {string} message
   * @param {string} action
   */
  sendToSupervisor: (message, action = "chat") =>
    post(urls.getSupervisor, {
      action,
      session_id: getSessionId(),
      message,
      context_filter: null,
      timestamp: new Date().toISOString(),
    }),

  /**
   * Send a message to the Knowledge Agent (RAG).
   * @param {string} message
   * @param {string|null} contextFilter
   * @param {string|null} sessionId - Optional explicit session ID
   */
  sendToKnowledge: (message, contextFilter = null, sessionId = null) =>
    post(urls.getKnowledge, {
      action: "chat",
      session_id: sessionId || getSessionId(),
      message,
      context_filter: contextFilter,
      timestamp: new Date().toISOString(),
    }),
};
