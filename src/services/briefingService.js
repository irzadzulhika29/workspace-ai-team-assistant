import axios from 'axios';
import { urls } from './api';

/**
 * Service untuk mengelola AI Briefing Dashboard
 */

const api = axios.create({
  baseURL: urls.getBackendUrl(),
  withCredentials: true,
});

const webhookApi = axios.create({
  timeout: 120_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ambilGoogleAccessToken = async () => {
  try {
    const response = await api.get('/api/google/token', {
      timeout: 8_000,
    });
    return response.data?.access_token ?? null;
  } catch {
    return null;
  }
};

const ambilJiraCredentials = async () => {
  try {
    const response = await api.get('/api/integrations/jira/n8n-credentials');
    return response.data?.jira_credentials || null;
  } catch {
    return null;
  }
};

const ambilCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me', {
      timeout: 8_000,
    });
    return response.data || null;
  } catch {
    return null;
  }
};

const normalizeBriefingsResponse = (payload) => {
  const generatedAt = payload?.generated_at || new Date().toISOString();
  const domains = ['jira', 'calendar', 'email'];
  const normalizedBriefings = {};

  for (const domain of domains) {
    const briefing = payload?.briefings?.[domain];
    if (!briefing) continue;

    normalizedBriefings[domain] = {
      ...briefing,
      generated_at: briefing.generated_at || generatedAt,
      next_run_at: briefing.next_run_at || null,
    };
  }

  return {
    success: Boolean(payload?.success),
    generated_at: generatedAt,
    briefings: normalizedBriefings,
  };
};

/**
 * Sementara briefing langsung diambil dari webhook n8n,
 * belum dari endpoint backend lokal / database.
 * @returns {Promise<Object>} Object dengan key domain (jira, calendar, email)
 */
export const ambilSemuaBriefing = async () => {
  const data = await refreshBriefingViaWebhook();
  return normalizeBriefingsResponse(data);
};

/**
 * Mengambil briefing untuk domain tertentu
 * @param {string} domain - Domain briefing (jira, calendar, email)
 * @returns {Promise<Object>} Briefing data
 */
export const ambilBriefingDomain = async (domain) => {
  try {
    const response = await api.get(`/api/dashboard/briefings/${domain}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${domain} briefing:`, error);
    throw error;
  }
};

/**
 * Trigger generate briefing via n8n webhook.
 * Tetap mengandalkan snapshot read dari backend setelah generate selesai.
 * @returns {Promise<Object>} Response dari webhook n8n
 */
export const refreshBriefingViaWebhook = async () => {
  const [user, googleAccessToken, jiraCredentials] = await Promise.all([
    ambilCurrentUser(),
    ambilGoogleAccessToken(),
    ambilJiraCredentials(),
  ]);

  const payload = {
    timestamp: new Date().toISOString(),
    ...(user?.id && { user_id: user.id, userId: user.id }),
    ...(googleAccessToken && { google_access_token: googleAccessToken }),
    ...(jiraCredentials && { jira_credentials: jiraCredentials }),
  };

  try {
    const response = await webhookApi.post(urls.getBriefings(), payload);
    return normalizeBriefingsResponse(response.data);
  } catch (error) {
    console.error('Error refreshing briefings via webhook:', error);
    throw error;
  }
};

/**
 * Helper untuk format waktu next update
 * @param {string} nextRunAt - ISO timestamp
 * @returns {string} Formatted time string
 */
export const formatNextUpdate = (nextRunAt) => {
  if (!nextRunAt) return 'Realtime';
  
  const date = new Date(nextRunAt);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes} WIB`;
};

/**
 * Helper untuk format waktu last updated
 * @param {string} generatedAt - ISO timestamp
 * @returns {string} Formatted relative time
 */
export const formatLastUpdated = (generatedAt) => {
  if (!generatedAt) return 'Belum pernah diupdate';
  
  const now = new Date();
  const generated = new Date(generatedAt);
  const diffMs = now - generated;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  return `${diffDays} hari yang lalu`;
};

/**
 * Helper untuk mendapatkan warna badge priority
 * @param {string} priority - high, medium, low
 * @returns {string} Tailwind color class
 */
export const getPriorityColor = (priority) => {
  const colors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[priority] || colors.medium;
};

/**
 * Helper untuk mendapatkan icon domain
 * @param {string} domain - jira, calendar, email
 * @returns {string} Icon name
 */
export const getDomainIcon = (domain) => {
  const icons = {
    jira: '📊',
    calendar: '📅',
    email: '📧'
  };
  return icons[domain] || '📋';
};

/**
 * Helper untuk mendapatkan label domain
 * @param {string} domain - jira, calendar, email
 * @returns {string} Display label
 */
export const getDomainLabel = (domain) => {
  const labels = {
    jira: 'Jira Progress',
    calendar: 'Calendar Briefing',
    email: 'Email Inbox Briefing'
  };
  return labels[domain] || domain;
};

/**
 * Helper untuk mendapatkan route detail domain
 * @param {string} domain - jira, calendar, email
 * @returns {string} Route path
 */
export const getDomainRoute = (domain) => {
  const routes = {
    jira: '/workspace/jira',
    calendar: '/workspace/calendar',
    email: '/workspace/email'
  };
  return routes[domain] || '/';
};
