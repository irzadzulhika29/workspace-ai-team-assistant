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
  ENV_MODE: "n8n_env_mode",
};

const ENV_MODES = {
  DEV: "dev",
  PROD: "prod",
};

const DEFAULTS = {
  SUPERVISOR: "https://n8n.karyatech.web.id/webhook/chat",
  KNOWLEDGE: "https://n8n.karyatech.web.id/webhook/chat",
  PM: "https://n8n.karyatech.web.id/webhook/pm",
  REPORT: "https://n8n.karyatech.web.id/webhook/report",
  STATUS: "https://n8n.karyatech.web.id/webhook/status",
  UPLOAD: "https://n8n.karyatech.web.id/webhook/upload-file",
};

const normalizeEnvMode = (mode) =>
  mode === ENV_MODES.DEV ? ENV_MODES.DEV : ENV_MODES.PROD;

const convertWebhookUrlForEnv = (rawUrl, mode) => {
  if (!rawUrl) return rawUrl;

  const normalizedMode = normalizeEnvMode(mode);

  try {
    const parsedUrl = new URL(rawUrl);
    const nextPathname =
      normalizedMode === ENV_MODES.DEV
        ? parsedUrl.pathname.replace(/\/webhook(?!-test)(?=\/|$)/g, "/webhook-test")
        : parsedUrl.pathname.replace(/\/webhook-test(?=\/|$)/g, "/webhook");

    parsedUrl.pathname = nextPathname;
    return parsedUrl.toString();
  } catch {
    return normalizedMode === ENV_MODES.DEV
      ? rawUrl.replace(/\/webhook(?!-test)(?=\/|$)/g, "/webhook-test")
      : rawUrl.replace(/\/webhook-test(?=\/|$)/g, "/webhook");
  }
};

const convertAllWebhookUrlsForEnv = (values, mode) => ({
  supervisor: convertWebhookUrlForEnv(values.supervisor, mode),
  knowledge: convertWebhookUrlForEnv(values.knowledge, mode),
  pm: convertWebhookUrlForEnv(values.pm, mode),
  report: convertWebhookUrlForEnv(values.report, mode),
  status: convertWebhookUrlForEnv(values.status, mode),
  upload: convertWebhookUrlForEnv(values.upload, mode),
});

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
  getEnvironment: () => normalizeEnvMode(localStorage.getItem(KEYS.ENV_MODE)),

  setSupervisor: (url) => localStorage.setItem(KEYS.SUPERVISOR, url),
  setKnowledge: (url) => localStorage.setItem(KEYS.KNOWLEDGE, url),
  setPM: (url) => localStorage.setItem(KEYS.PM, url),
  setReport: (url) => localStorage.setItem(KEYS.REPORT, url),
  setStatus: (url) => localStorage.setItem(KEYS.STATUS, url),
  setUpload: (url) => localStorage.setItem(KEYS.UPLOAD, url),
  setEnvironment: (mode) =>
    localStorage.setItem(KEYS.ENV_MODE, normalizeEnvMode(mode)),

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

  convertForEnvironment: (values, mode) =>
    convertAllWebhookUrlsForEnv(values, mode),

  applyEnvironment: (mode) => {
    const normalizedMode = normalizeEnvMode(mode);
    const currentValues = urls.getAll();
    const convertedValues = convertAllWebhookUrlsForEnv(
      currentValues,
      normalizedMode
    );
    urls.setAll(convertedValues);
    urls.setEnvironment(normalizedMode);
    return convertedValues;
  },
};

export const ensureProdEnvironmentOnStartup = () => {
  urls.applyEnvironment(ENV_MODES.PROD);
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
