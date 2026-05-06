import axios from "axios";

// Axios interceptors for debugging
if (import.meta.env.DEV) {
  axios.interceptors.request.use(
    (config) => {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        withCredentials: config.withCredentials,
        headers: config.headers,
      });
      return config;
    },
    (error) => {
      console.error("[API Request Error]", error);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );
}

// Re-exports
export { chatApi } from "./chatService";
export { sessionApi } from "./sessionService";
export { fileApi } from "./fileService";
export { tokenUsageApi } from "./tokenUsageService";
export { integrationApi } from "./integrationService";
export { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseHeaders } from "./supabase";

const KEYS = {
  MODE: "n8n_mode",
};

const MODES = {
  PUBLISH: "publish",
  TEST: "test",
};

const N8N_BASE_URL = import.meta.env.VITE_N8N_URL || "https://workflow.jagr.id";
const DEFAULT_MODE = import.meta.env.VITE_N8N_MODE || MODES.PUBLISH;

const ENDPOINTS = {
  SUPERVISOR: "chat",
  CHAT_DOCUMENT: "chat-document",
  PM: "pm",
  REPORT: "report",
  STATUS: "status",
  UPLOAD: "upload-document",
  BRIEFINGS: "briefings",
  CALENDAR: "calendar",
  EMAIL: "email",
  EMAIL_SUMMARY: "email/summary",
  JIRA_SUMMARY: "jira-summary",
};

const normalizeMode = (mode) =>
  mode === MODES.TEST ? MODES.TEST : MODES.PUBLISH;

const getCleanBaseUrl = () =>
  N8N_BASE_URL.endsWith("/") ? N8N_BASE_URL.slice(0, -1) : N8N_BASE_URL;

const buildWebhookUrl = (endpoint, mode) => {
  const webhookPath = mode === MODES.TEST ? "webhook-test" : "webhook";
  return `${getCleanBaseUrl()}/${webhookPath}/${endpoint}`;
};

export const urls = {
  getMode: () => {
    const stored = localStorage.getItem(KEYS.MODE);
    return stored ? normalizeMode(stored) : DEFAULT_MODE;
  },

  setMode: (mode) =>
    localStorage.setItem(KEYS.MODE, normalizeMode(mode)),

  getN8nBaseUrl: () => getCleanBaseUrl(),

  getSupervisor: () => buildWebhookUrl(ENDPOINTS.SUPERVISOR, urls.getMode()),
  getPM: () => buildWebhookUrl(ENDPOINTS.PM, urls.getMode()),
  getReport: () => buildWebhookUrl(ENDPOINTS.REPORT, urls.getMode()),
  getStatus: () => buildWebhookUrl(ENDPOINTS.STATUS, urls.getMode()),
  getUpload: () => buildWebhookUrl(ENDPOINTS.UPLOAD, urls.getMode()),
  getBriefings: () => buildWebhookUrl(ENDPOINTS.BRIEFINGS, urls.getMode()),
  getChatDocument: () => buildWebhookUrl(ENDPOINTS.CHAT_DOCUMENT, urls.getMode()),
  getCalendar: () => buildWebhookUrl(ENDPOINTS.CALENDAR, urls.getMode()),
  getEmail: () => buildWebhookUrl(ENDPOINTS.EMAIL, urls.getMode()),
  getEmailSummary: () => buildWebhookUrl(ENDPOINTS.EMAIL_SUMMARY, urls.getMode()),
  getJiraSummary: () => buildWebhookUrl(ENDPOINTS.JIRA_SUMMARY, urls.getMode()),

  getAll: () => ({
    supervisor: urls.getSupervisor(),
    chatDocument: urls.getChatDocument(),
    pm: urls.getPM(),
    report: urls.getReport(),
    status: urls.getStatus(),
    upload: urls.getUpload(),
    briefings: urls.getBriefings(),
    calendar: urls.getCalendar(),
    email: urls.getEmail(),
    emailSummary: urls.getEmailSummary(),
    jiraSummary: urls.getJiraSummary(),
  }),

  getConfig: () => ({
    mode: urls.getMode(),
    baseUrl: urls.getN8nBaseUrl(),
  }),

  getBackendUrl: () => {
    return import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  },
};

export const ensureProdEnvironmentOnStartup = () => {
  localStorage.removeItem("n8n_environment");
  localStorage.removeItem("n8n_dev_base_url");
};

export const getSessionId = () => {
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
};

export const statusApi = {
  checkStatus: async () => {
    try {
      await axios.get(urls.getStatus(), { timeout: 8_000 });
      return true;
    } catch {
      return false;
    }
  },
};
