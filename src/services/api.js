import axios from "axios";

// ─── Re-exports ───────────────────────────────────────────────────────────────
// Barrel module: import dari sini untuk backward-compatibility,
// atau langsung dari masing-masing service module.
export { chatApi } from "./chatService";
export { sessionApi } from "./sessionService";
export { fileApi } from "./fileService";
export { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseHeaders } from "./supabase";

// ─── localStorage keys ───────────────────────────────────────────────────────
const KEYS = {
  SUPERVISOR: "n8n_supervisor_url",
  KNOWLEDGE: "n8n_knowledge_url",
  PM: "n8n_pm_url",
  REPORT: "n8n_report_url",
  STATUS: "n8n_status_url",
  UPLOAD: "n8n_upload_url",
};

const DEFAULTS = {
  SUPERVISOR: "http://localhost:5678/webhook/supervisor",
  KNOWLEDGE:
    "https://undappled-deliriously-yukiko.ngrok-free.dev/webhook-test/f08f222b-93fb-4de3-84df-8342eec065da",
  PM: "http://localhost:5678/webhook/pm",
  REPORT: "http://localhost:5678/webhook/report",
  STATUS: "http://localhost:5678/webhook/status",
  UPLOAD:
    "https://undappled-deliriously-yukiko.ngrok-free.dev/webhook-test/f08f222b-93fb-4de3-84df-8342eec065da",
};

// ─── URL getters / setters ────────────────────────────────────────────────────
export const urls = {
  getSupervisor: () =>
    localStorage.getItem(KEYS.SUPERVISOR) || DEFAULTS.SUPERVISOR,
  getKnowledge: () =>
    localStorage.getItem(KEYS.KNOWLEDGE) || DEFAULTS.KNOWLEDGE,
  getPM: () => localStorage.getItem(KEYS.PM) || DEFAULTS.PM,
  getReport: () => localStorage.getItem(KEYS.REPORT) || DEFAULTS.REPORT,
  getStatus: () => localStorage.getItem(KEYS.STATUS) || DEFAULTS.STATUS,
  getUpload: () => localStorage.getItem(KEYS.UPLOAD) || DEFAULTS.UPLOAD,

  setSupervisor: (url) => localStorage.setItem(KEYS.SUPERVISOR, url),
  setKnowledge: (url) => localStorage.setItem(KEYS.KNOWLEDGE, url),
  setPM: (url) => localStorage.setItem(KEYS.PM, url),
  setReport: (url) => localStorage.setItem(KEYS.REPORT, url),
  setStatus: (url) => localStorage.setItem(KEYS.STATUS, url),
  setUpload: (url) => localStorage.setItem(KEYS.UPLOAD, url),

  getAll: () => ({
    supervisor: localStorage.getItem(KEYS.SUPERVISOR) || DEFAULTS.SUPERVISOR,
    knowledge: localStorage.getItem(KEYS.KNOWLEDGE) || DEFAULTS.KNOWLEDGE,
    pm: localStorage.getItem(KEYS.PM) || DEFAULTS.PM,
    report: localStorage.getItem(KEYS.REPORT) || DEFAULTS.REPORT,
    status: localStorage.getItem(KEYS.STATUS) || DEFAULTS.STATUS,
    upload: localStorage.getItem(KEYS.UPLOAD) || DEFAULTS.UPLOAD,
  }),

  setAll: ({ supervisor, knowledge, pm, report, status, upload }) => {
    if (supervisor !== undefined)
      localStorage.setItem(KEYS.SUPERVISOR, supervisor);
    if (knowledge !== undefined)
      localStorage.setItem(KEYS.KNOWLEDGE, knowledge);
    if (pm !== undefined) localStorage.setItem(KEYS.PM, pm);
    if (report !== undefined) localStorage.setItem(KEYS.REPORT, report);
    if (status !== undefined) localStorage.setItem(KEYS.STATUS, status);
    if (upload !== undefined) localStorage.setItem(KEYS.UPLOAD, upload);
  },
};

// ─── Session ID (per-tab) ────────────────────────────────────────────────────
export const getSessionId = () => {
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
};

// ─── Status check ─────────────────────────────────────────────────────────────
export const statusApi = {
  /**
   * Check n8n connectivity. Resolves true/false — never throws.
   */
  checkStatus: async () => {
    try {
      await axios.get(urls.getStatus(), { timeout: 8_000 });
      return true;
    } catch {
      return false;
    }
  },
};
