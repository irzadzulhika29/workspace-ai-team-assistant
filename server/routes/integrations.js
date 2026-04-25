import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { decrypt, encrypt } from '../utils/encryption.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

const ALLOWED_PROXY_METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE']);
const JIRA_PATH_PREFIX = '/rest/api/3/';

function normalizeSubdomain(value) {
  const cleaned = String(value || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');

  if (!cleaned || !cleaned.endsWith('.atlassian.net')) {
    throw new Error('Subdomain Jira harus menggunakan domain .atlassian.net');
  }

  return cleaned.toLowerCase();
}

function buildJiraHeaders(email, apiToken) {
  return {
    'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}

async function getActiveJiraIntegration(userId) {
  return prisma.jiraIntegration.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });
}

async function testJiraConnection(subdomain, email, apiToken) {
  const response = await fetch(`https://${subdomain}/rest/api/3/myself`, {
    method: 'GET',
    headers: buildJiraHeaders(email, apiToken),
  });

  if (!response.ok) {
    let details = '';
    try {
      const body = await response.json();
      details = body?.errorMessages?.join(', ') || body?.message || '';
    } catch {
      details = response.statusText;
    }

    throw new Error(details || 'Koneksi ke Jira gagal');
  }

  return true;
}

router.get('/jira', requireAuth, async (req, res) => {
  try {
    const integration = await getActiveJiraIntegration(req.user.id);

    if (!integration) {
      return res.json({ connected: false });
    }

    res.json({
      connected: true,
      subdomain: integration.subdomain,
      email: integration.email,
      connectedAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/jira/n8n-credentials', requireAuth, async (req, res) => {
  try {
    const integration = await getActiveJiraIntegration(req.user.id);

    if (!integration) {
      return res.json({ connected: false, jira_credentials: null });
    }

    res.json({
      connected: true,
      jira_credentials: {
        subdomain: integration.subdomain,
        email: integration.email,
        api_token: decrypt(integration.apiTokenEnc),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/jira', requireAuth, async (req, res) => {
  try {
    const subdomain = normalizeSubdomain(req.body.subdomain);
    const email = String(req.body.email || '').trim().toLowerCase();
    const apiToken = String(req.body.apiToken || '').trim();

    if (!email || !apiToken) {
      return res.status(400).json({ error: 'Subdomain, email, dan API token wajib diisi' });
    }

    await testJiraConnection(subdomain, email, apiToken);

    const integration = await prisma.jiraIntegration.upsert({
      where: { userId: req.user.id },
      update: {
        subdomain,
        email,
        apiTokenEnc: encrypt(apiToken),
        isActive: true,
      },
      create: {
        userId: req.user.id,
        subdomain,
        email,
        apiTokenEnc: encrypt(apiToken),
        isActive: true,
      },
    });

    res.json({
      connected: true,
      subdomain: integration.subdomain,
      email: integration.email,
      connectedAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/jira', requireAuth, async (req, res) => {
  try {
    await prisma.jiraIntegration.deleteMany({
      where: { userId: req.user.id },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/jira/proxy', requireAuth, async (req, res) => {
  try {
    const integration = await getActiveJiraIntegration(req.user.id);
    if (!integration) {
      return res.status(404).json({ error: 'Jira belum terhubung' });
    }

    const method = String(req.body.method || 'GET').toUpperCase();
    const path = String(req.body.path || '').trim();
    const data = req.body.data;

    if (!ALLOWED_PROXY_METHODS.has(method)) {
      return res.status(400).json({ error: 'Method tidak didukung' });
    }

    if (!path.startsWith(JIRA_PATH_PREFIX)) {
      return res.status(400).json({ error: 'Path Jira tidak valid' });
    }

    const apiToken = decrypt(integration.apiTokenEnc);
    const response = await fetch(`https://${integration.subdomain}${path}`, {
      method,
      headers: buildJiraHeaders(integration.email, apiToken),
      body: method === 'GET' || data === undefined ? undefined : JSON.stringify(data),
    });

    const text = await response.text();
    let payload = null;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
    }

    if (!response.ok) {
      console.error('Jira API error:', {
        status: response.status,
        statusText: response.statusText,
        payload
      });
      return res.status(response.status).json({
        error: payload?.errorMessages?.join(', ') || payload?.message || 'Jira request gagal',
        details: payload,
      });
    }

    res.json(payload);
  } catch (error) {
    console.error('Jira proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
