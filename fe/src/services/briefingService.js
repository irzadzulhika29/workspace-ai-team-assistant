import axios from 'axios';
import { urls } from './api';
import { getWebhookUserIdentity } from './authService';

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
  const generatedAt = payload?.generated_at || payload?.timestamp || new Date().toISOString();
  const domains = ['jira', 'calendar', 'email'];
  const normalizedBriefings = {};

  for (const domain of domains) {
    const briefing = payload?.briefings?.[domain];
    if (!briefing) continue;

    normalizedBriefings[domain] = {
      ...briefing,
      generated_at: briefing.generated_at || generatedAt,
    };
  }

  return {
    success: Boolean(payload?.success),
    generated_at: generatedAt,
    briefings: normalizedBriefings,
  };
};

export const ambilSemuaBriefing = async () => {
  const response = await api.get('/api/dashboard/briefings');
  return normalizeBriefingsResponse(response.data);
};

export const ambilBriefingDomain = async (domain) => {
  const response = await api.get(`/api/dashboard/briefings/${domain}`);
  return response.data;
};

export const refreshBriefingViaWebhook = async () => {
  const [user, googleAccessToken, jiraCredentials] = await Promise.all([
    ambilCurrentUser(),
    ambilGoogleAccessToken(),
    ambilJiraCredentials(),
  ]);

  const payload = {
    timestamp: new Date().toISOString(),
    ...(await getWebhookUserIdentity(user)),
    ...(googleAccessToken && { google_access_token: googleAccessToken }),
    ...(jiraCredentials && { jira_credentials: jiraCredentials }),
  };

  await webhookApi.post(urls.getBriefings(), payload);
  const response = await api.get('/api/dashboard/briefings');
  return normalizeBriefingsResponse(response.data);
};

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

export const getPriorityColor = (priority) => {
  const colors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[priority] || colors.medium;
};

export const getDomainIcon = (domain) => {
  const icons = {
    jira: '📊',
    calendar: '📅',
    email: '📧'
  };
  return icons[domain] || '📋';
};

export const getDomainLabel = (domain) => {
  const labels = {
    jira: 'Jira Progress',
    calendar: 'Calendar Briefing',
    email: 'Email Inbox Briefing'
  };
  return labels[domain] || domain;
};

export const getDomainRoute = (domain) => {
  const routes = {
    jira: '/workspace/jira',
    calendar: '/workspace/calendar',
    email: '/workspace/email'
  };
  return routes[domain] || '/';
};
