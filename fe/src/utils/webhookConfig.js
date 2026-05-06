/**
 * N8N Webhook Configuration Utility
 *
 * Generates webhook URLs based on mode settings.
 *
 * URL Structure:
 * - Publish: {baseUrl}/webhook/{endpoint}
 * - Test: {baseUrl}/webhook-test/{endpoint}
 */

export const getBaseUrl = () => import.meta.env.VITE_N8N_URL;

export const getWebhookPath = (mode = import.meta.env.VITE_N8N_MODE) => {
  return mode === "test" ? "webhook-test" : "webhook";
};

export const generateWebhookUrl = (endpoint, options = {}) => {
  const mode = options.mode || import.meta.env.VITE_N8N_MODE || "publish";
  const baseUrl = getBaseUrl();
  const webhookPath = getWebhookPath(mode);
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  return `${baseUrl}/${webhookPath}/${cleanEndpoint}`;
};

export const getWebhookConfig = () => {
  return {
    mode: import.meta.env.VITE_N8N_MODE || "publish",
    baseUrl: import.meta.env.VITE_N8N_URL,
  };
};

export const WEBHOOK_ENDPOINTS = {
  EXAMPLE: "example-endpoint",
};

export default {
  getBaseUrl,
  getWebhookPath,
  generateWebhookUrl,
  getWebhookConfig,
  WEBHOOK_ENDPOINTS,
};
