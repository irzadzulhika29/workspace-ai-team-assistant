/**
 * N8N Webhook Configuration Utility
 *
 * Generates webhook URLs based on environment and mode settings
 *
 * Environment: prod | dev
 * Mode: publish | test
 *
 * URL Structure:
 * - Publish: {baseUrl}/webhook/{endpoint}
 * - Test: {baseUrl}/webhook-test/{endpoint}
 */

/**
 * Get the base URL based on environment
 * @param {string} env - Environment: 'prod' or 'dev'
 * @returns {string} Base URL
 */
export const getBaseUrl = (env = import.meta.env.VITE_N8N_ENV) => {
  if (env === 'prod') {
    return import.meta.env.VITE_N8N_PROD_URL;
  }
  return import.meta.env.VITE_N8N_DEV_URL;
};

/**
 * Get webhook path based on mode
 * @param {string} mode - Mode: 'publish' or 'test'
 * @returns {string} Webhook path
 */
export const getWebhookPath = (mode = import.meta.env.VITE_N8N_MODE) => {
  return mode === 'test' ? 'webhook-test' : 'webhook';
};

/**
 * Generate complete webhook URL
 * @param {string} endpoint - Webhook endpoint name
 * @param {Object} options - Configuration options
 * @param {string} options.env - Environment: 'prod' or 'dev'
 * @param {string} options.mode - Mode: 'publish' or 'test'
 * @returns {string} Complete webhook URL
 */
export const generateWebhookUrl = (endpoint, options = {}) => {
  const env = options.env || import.meta.env.VITE_N8N_ENV || 'prod';
  const mode = options.mode || import.meta.env.VITE_N8N_MODE || 'publish';

  const baseUrl = getBaseUrl(env);
  const webhookPath = getWebhookPath(mode);

  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  return `${baseUrl}/${webhookPath}/${cleanEndpoint}`;
};

/**
 * Get current webhook configuration
 * @returns {Object} Current configuration
 */
export const getWebhookConfig = () => {
  return {
    env: import.meta.env.VITE_N8N_ENV || 'prod',
    mode: import.meta.env.VITE_N8N_MODE || 'publish',
    prodUrl: import.meta.env.VITE_N8N_PROD_URL,
    devUrl: import.meta.env.VITE_N8N_DEV_URL,
  };
};

/**
 * Webhook endpoints registry
 * Add your webhook endpoints here
 */
export const WEBHOOK_ENDPOINTS = {
  // Example endpoints - sesuaikan dengan endpoint yang ada
  EXAMPLE: 'example-endpoint',
  // Tambahkan endpoint lainnya di sini
};

// Export default object with all utilities
export default {
  getBaseUrl,
  getWebhookPath,
  generateWebhookUrl,
  getWebhookConfig,
  WEBHOOK_ENDPOINTS,
};
