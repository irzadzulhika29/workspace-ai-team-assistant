import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { decrypt } from '../utils/encryption.js';

const router = express.Router();
const BRIEFING_DOMAINS = ['jira', 'calendar', 'email'];

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isN8nRequest(req) {
  return Boolean(process.env.N8N_API_KEY) && req.headers['x-n8n-api-key'] === process.env.N8N_API_KEY;
}

function requireN8nApiKey(req, res, next) {
  if (!isN8nRequest(req)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid x-n8n-api-key header is required',
    });
  }

  next();
}

async function getBriefingTargets({ userId } = {}) {
  const whereClause = userId ? { id: userId } : {};
  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      name: true,
      googleToken: {
        select: {
          expiresAt: true,
        },
      },
      jiraIntegration: {
        select: {
          subdomain: true,
          email: true,
          isActive: true,
        },
      },
    },
  });

  return users
    .map((user) => {
      const domains = [];

      if (user.googleToken) {
        domains.push('calendar', 'email');
      }

      if (user.jiraIntegration?.isActive) {
        domains.push('jira');
      }

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        domains,
        integrations: {
          google: Boolean(user.googleToken),
          jira: Boolean(user.jiraIntegration?.isActive),
        },
      };
    })
    .filter((user) => user.domains.length > 0);
}

/**
 * GET /api/dashboard/briefings
 * Mengembalikan snapshot briefing terbaru per domain untuk user yang login
 */
router.get('/briefings', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Query untuk mendapatkan snapshot terbaru per domain
    const { data, error } = await supabase
      .from('dashboard_summary_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error fetching briefings:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch briefings',
        details: error.message 
      });
    }

    // Group by domain dan ambil yang terbaru
    const latestByDomain = {};
    const domains = ['jira', 'calendar', 'email'];

    domains.forEach(domain => {
      const domainSnapshots = data.filter(s => s.domain === domain);
      if (domainSnapshots.length > 0) {
        latestByDomain[domain] = domainSnapshots[0];
      }
    });

    res.json({
      success: true,
      briefings: latestByDomain,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /briefings endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * GET /api/dashboard/briefings/:domain
 * Mengembalikan snapshot briefing untuk domain tertentu
 */
router.get('/briefings/:domain', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { domain } = req.params;

    // Validasi domain
    if (!['jira', 'calendar', 'email'].includes(domain)) {
      return res.status(400).json({ 
        error: 'Invalid domain',
        message: 'Domain must be one of: jira, calendar, email'
      });
    }

    const { data, error } = await supabase
      .from('dashboard_summary_snapshots')
      .select('*')
      .eq('user_id', userId)
      .eq('domain', domain)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return res.json({
          success: true,
          briefing: null,
          message: 'No briefing available for this domain'
        });
      }
      console.error('Error fetching briefing:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch briefing',
        details: error.message 
      });
    }

    res.json({
      success: true,
      briefing: data
    });

  } catch (error) {
    console.error('Error in /briefings/:domain endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

router.get('/briefing-targets', requireN8nApiKey, async (req, res) => {
  try {
    const requestedUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const targets = await getBriefingTargets({ userId: requestedUserId });

    res.json({
      success: true,
      targets,
      count: targets.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /briefing-targets endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

router.get('/briefing-data/jira', requireN8nApiKey, async (req, res) => {
  try {
    const userId = String(req.query.userId || '').trim();
    const maxResults = Math.min(Math.max(Number.parseInt(req.query.maxResults, 10) || 50, 1), 100);
    const jql = String(req.query.jql || 'updated >= -30d ORDER BY updated DESC').trim();

    if (!userId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'userId is required',
      });
    }

    const integration = await prisma.jiraIntegration.findFirst({
      where: {
        userId,
        isActive: true,
      },
      select: {
        subdomain: true,
        email: true,
        apiTokenEnc: true,
      },
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Jira integration not found',
        message: 'No active Jira integration for this user',
      });
    }

    const apiToken = decrypt(integration.apiTokenEnc);
    const response = await fetch(`https://${integration.subdomain}/rest/api/3/search/jql`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${integration.email}:${apiToken}`).toString('base64')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jql,
        maxResults,
        fields: ['summary', 'status', 'assignee', 'priority', 'updated', 'project', 'issuetype', 'created'],
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.errorMessages?.join(', ') || payload?.message || 'Failed to fetch Jira issues',
        details: payload,
      });
    }

    res.json({
      success: true,
      userId,
      issues: Array.isArray(payload.issues) ? payload.issues : [],
      total: payload.total || 0,
      maxResults,
      jql,
    });
  } catch (error) {
    console.error('Error in /briefing-data/jira endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

router.post('/briefings/upsert', requireN8nApiKey, async (req, res) => {
  try {
    const domain = String(req.body.domain || '').trim();
    const userId = String(req.body.user_id || req.body.userId || '').trim();
    const summaryPoints = Array.isArray(req.body.summary_points) ? req.body.summary_points : [];
    const sourceMetrics = req.body.source_metrics && typeof req.body.source_metrics === 'object'
      ? req.body.source_metrics
      : {};

    if (!userId || !BRIEFING_DOMAINS.includes(domain)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'user_id and valid domain are required',
      });
    }

    const payload = {
      user_id: userId,
      domain,
      priority: ['high', 'medium', 'low'].includes(req.body.priority) ? req.body.priority : 'medium',
      headline: String(req.body.headline || '').trim() || 'Briefing belum tersedia',
      summary_points: summaryPoints,
      source_metrics: sourceMetrics,
      generated_at: req.body.generated_at || new Date().toISOString(),
      next_run_at: req.body.next_run_at || null,
      status: ['success', 'partial', 'failed'].includes(req.body.status) ? req.body.status : 'success',
      error_message: req.body.error_message ? String(req.body.error_message) : null,
    };

    const { data, error } = await supabase
      .from('dashboard_summary_snapshots')
      .upsert(payload, {
        onConflict: 'user_id,domain',
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting briefing snapshot:', error);
      return res.status(500).json({
        error: 'Failed to upsert briefing snapshot',
        details: error.message,
      });
    }

    res.json({
      success: true,
      briefing: data,
    });
  } catch (error) {
    console.error('Error in /briefings/upsert endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

export default router;
