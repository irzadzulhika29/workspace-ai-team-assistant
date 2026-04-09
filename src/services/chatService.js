import axios from "axios";
import { urls, getSessionId } from "./api";

// ─── Helper ──────────────────────────────────────────────────────────────────
const post = async (getUrl, payload) => {
  const res = await axios.post(getUrl(), payload, {
    timeout: 120_000,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// Fetch a fresh Google access token from the backend.
// Returns null silently if the user hasn't connected Google or if the request fails.
const fetchGoogleToken = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
    const res = await axios.get(`${backendUrl}/api/google/token`, {
      withCredentials: true,
      timeout: 8_000,
    });
    return res.data.access_token ?? null;
  } catch {
    return null;
  }
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const chatApi = {
  /**
   * Send a message to the Supervisor Agent.
   * @param {string} message
   * @param {string} action
   * @param {string|null} sessionId - Optional explicit session ID
   * @param {File|null} file - Optional file attachment
   */
  sendToSupervisor: async (message, action = "chat", sessionId = null, file = null) => {
    const googleAccessToken = await fetchGoogleToken();

    if (file) {
      // Create FormData if file is present
      const formData = new FormData();
      formData.append("action", action);
      formData.append("session_id", sessionId || getSessionId());
      formData.append("message", message || ""); // Message can be empty if sending only a file
      formData.append("chat_type", "general_chat");
      formData.append("timestamp", new Date().toISOString());
      formData.append("file", file); // Add the file
      if (googleAccessToken) formData.append("google_access_token", googleAccessToken);

      const res = await axios.post(urls.getSupervisor(), formData, {
        timeout: 120_000,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } else {
      // Regular JSON request if no file
      return post(urls.getSupervisor, {
        action,
        session_id: sessionId || getSessionId(),
        message,
        context_filter: null,
        chat_type: "general_chat",
        timestamp: new Date().toISOString(),
        ...(googleAccessToken && { google_access_token: googleAccessToken }),
      });
    }
  },

  /**
   * Send a message to the Knowledge Agent (RAG).
   * @param {string} message
   * @param {string|null} contextFilter
   * @param {string|null} sessionId - Optional explicit session ID
   */
  sendToKnowledge: async (message, contextFilter = null, sessionId = null) => {
    const googleAccessToken = await fetchGoogleToken();
    return post(urls.getKnowledge, {
      action: "chat",
      session_id: sessionId || getSessionId(),
      message,
      context_filter: contextFilter,
      chat_type: "rag_chat",
      timestamp: new Date().toISOString(),
      ...(googleAccessToken && { google_access_token: googleAccessToken }),
    });
  },
};
