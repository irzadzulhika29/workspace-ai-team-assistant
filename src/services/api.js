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
  ENVIRONMENT: "n8n_environment", // prod | dev
  MODE: "n8n_mode", // publish | test
  DEV_BASE_URL: "n8n_dev_base_url", // ngrok URL
};

const ENVIRONMENTS = {
  PROD: "prod",
  DEV: "dev",
};

const MODES = {
  PUBLISH: "publish",
  TEST: "test",
};

const PROD_BASE_URL = "https://n8n.karyatech.web.id";
const DEFAULT_DEV_BASE_URL = import.meta.env.VITE_N8N_DEV_URL || "https://your-ngrok-url.ngrok.io";

// Default values from .env
const DEFAULT_ENVIRONMENT = import.meta.env.VITE_N8N_ENV || "prod";
const DEFAULT_MODE = import.meta.env.VITE_N8N_MODE || "publish";

// Webhook endpoints
const ENDPOINTS = {
  SUPERVISOR: "chat",
  KNOWLEDGE: "chat",
  PM: "pm",
  REPORT: "report",
  STATUS: "status",
  UPLOAD: "upload-file",
};

// ─── Helper functions ─────────────────────────────────────────────────────────
const normalizeEnvironment = (env) =>
  env === ENVIRONMENTS.DEV ? ENVIRONMENTS.DEV : ENVIRONMENTS.PROD;

const normalizeMode = (mode) =>
  mode === MODES.TEST ? MODES.TEST : MODES.PUBLISH;

/**
 * Generate webhook URL based on environment and mode
 * @param {string} endpoint - Endpoint name (e.g., 'chat', 'upload-file')
 * @param {string} environment - 'prod' or 'dev'
 * @param {string} mode - 'publish' or 'test'
 * @param {string} devBaseUrl - Custom dev base URL (ngrok)
 * @returns {string} Complete webhook URL
 */
const buildWebhookUrl = (endpoint, environment, mode, devBaseUrl) => {
  const baseUrl = environment === ENVIRONMENTS.PROD
    ? PROD_BASE_URL
    : (devBaseUrl || DEFAULT_DEV_BASE_URL);

  // Remove trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  const webhookPath = mode === MODES.TEST ? "webhook-test" : "webhook";

  return `${cleanBaseUrl}/${webhookPath}/${endpoint}`;
};

// ─── URL getters / setters ────────────────────────────────────────────────────
export const urls = {
  // Get current environment (prod/dev)
  getEnvironment: () => {
    const stored = localStorage.getItem(KEYS.ENVIRONMENT);
    return stored ? normalizeEnvironment(stored) : DEFAULT_ENVIRONMENT;
  },

  // Get current mode (publish/test)
  getMode: () => {
    const stored = localStorage.getItem(KEYS.MODE);
    return stored ? normalizeMode(stored) : DEFAULT_MODE;
  },

  // Get dev base URL (ngrok)
  getDevBaseUrl: () =>
    localStorage.getItem(KEYS.DEV_BASE_URL) || DEFAULT_DEV_BASE_URL,

  // Set environment
  setEnvironment: (env) =>
    localStorage.setItem(KEYS.ENVIRONMENT, normalizeEnvironment(env)),

  // Set mode
  setMode: (mode) =>
    localStorage.setItem(KEYS.MODE, normalizeMode(mode)),

  // Set dev base URL
  setDevBaseUrl: (url) =>
    localStorage.setItem(KEYS.DEV_BASE_URL, url),

  // Get specific webhook URLs
  getSupervisor: () => {
    const env = urls.getEnvironment();
    const mode = urls.getMode();
    const devUrl = urls.getDevBaseUrl();
    return buildWebhookUrl(ENDPOINTS.SUPERVISOR, env, mode, devUrl);
  },

  getKnowledge: () => {
    const env = urls.getEnvironment();
    const mode = urls.getMode();
    const devUrl = urls.getDevBaseUrl();
    return buildWebhookUrl(ENDPOINTS.KNOWLEDGE, env, mode, devUrl);
  },

  getPM: () => {
    const env = urls.getEnvironment();
    const mode = urls.getMode();
    const devUrl = urls.getDevBaseUrl();
    return buildWebhookUrl(ENDPOINTS.PM, env, mode, devUrl);
  },

  getReport: () => {
    const env = urls.getEnvironment();
    const mode = urls.getMode();
    const devUrl = urls.getDevBaseUrl();
    return buildWebhookUrl(ENDPOINTS.REPORT, env, mode, devUrl);
  },

  getStatus: () => {
    const env = urls.getEnvironment();
    const mode = urls.getMode();
    const devUrl = urls.getDevBaseUrl();
    return buildWebhookUrl(ENDPOINTS.STATUS, env, mode, devUrl);
  },

  getUpload: () => {
    const env = urls.getEnvironment();
    const mode = urls.getMode();
    const devUrl = urls.getDevBaseUrl();
    return buildWebhookUrl(ENDPOINTS.UPLOAD, env, mode, devUrl);
  },

  // Get all webhook URLs
  getAll: () => ({
    supervisor: urls.getSupervisor(),
    knowledge: urls.getKnowledge(),
    pm: urls.getPM(),
    report: urls.getReport(),
    status: urls.getStatus(),
    upload: urls.getUpload(),
  }),

  // Get current config
  getConfig: () => ({
    environment: urls.getEnvironment(),
    mode: urls.getMode(),
    devBaseUrl: urls.getDevBaseUrl(),
    prodBaseUrl: PROD_BASE_URL,
  }),
};

export const ensureProdEnvironmentOnStartup = () => {
  // Defaults are now handled by getEnvironment() and getMode()
  // which fallback to .env values if localStorage is empty
  // This function is kept for backward compatibility
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
