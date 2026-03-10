import axios from "axios";

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

// ─── Axios instance factory ──────────────────────────────────────────────────
const makeClient = (getUrl) =>
  axios.create({
    timeout: 60_000,
    headers: { "Content-Type": "application/json" },
    get baseURL() {
      return getUrl();
    },
  });

// Each call builds a fresh baseURL from localStorage so URL changes take effect immediately.
const post = async (getUrl, payload) => {
  const res = await axios.post(getUrl(), payload, {
    timeout: 60_000,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// ─── Session ID (per-tab) ────────────────────────────────────────────────────
const getSessionId = () => {
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
};

// ─── API methods ──────────────────────────────────────────────────────────────
export const api = {
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

  /**
   * Send a message to the Supervisor Agent.
   * @param {string} message
   * @param {string} action
   * @returns {Promise<import('./api.types').AgentResponse>}
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
   * @returns {Promise<import('./api.types').AgentResponse>}
   */
  sendToKnowledge: (message, contextFilter = null) =>
    post(urls.getKnowledge, {
      action: "chat",
      session_id: getSessionId(),
      message,
      context_filter: contextFilter,
      timestamp: new Date().toISOString(),
    }),

  /**
   * Upload a document for indexing.
   * @param {File} file
   * @param {string} folder - "input" | "output"
   * @param {string} fileName
   * @returns {Promise<any>}
   */
  uploadDocument: async (file, folder = "input", fileName = "") => {
    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("file", file);
    formData.append("file_name", (fileName || file?.name || "").trim());
    formData.append("kategori", folder);
    formData.append("folder", folder);
    formData.append("session_id", getSessionId());
    const res = await axios.post(urls.getUpload(), formData, {
      timeout: 120_000,
      // Let the browser set multipart boundary automatically.
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  /**
   * Fetch all documents from the Supabase `dokumen` table.
   * @returns {Promise<Array>} array of document records
   */
  fetchDokumen: async () => {
    const SUPABASE_URL = "http://localhost:8000";
    const SUPABASE_ANON_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";

    const url = `${SUPABASE_URL}/rest/v1/dokumen?select=*&order=created_at.desc`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Gagal menarik data dari Supabase");
    }

    return res.json();
  },
};
