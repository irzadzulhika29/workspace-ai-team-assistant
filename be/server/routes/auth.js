import express from 'express';
import passport from '../config/passport.js';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { deleteN8nCredential } from '../services/n8nService.js';
import {
  clearGoogleLinkSession,
  ensureSupabasePasswordUser,
  getSupabaseUserFromAccessToken,
  getWorkspaceAuthStatus,
  isGoogleMismatchError,
  syncSupabaseMetadataForEmail,
  upsertWorkspaceUserFromSupabase,
} from '../services/supabaseAuth.js';

const router = express.Router();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const isGoogleOAuthConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const buildAuthErrorRedirect = (errorCode) =>
  `${frontendUrl}/login?error=${encodeURIComponent(errorCode)}`;

const buildGoogleRedirect = (pathname, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return `${frontendUrl}${pathname}${query ? `?${query}` : ''}`;
};

const resolveGoogleSuccessRedirect = (req) => {
  const isGoogleLinkFlow = Boolean(req.session?.googleLinkUserId);
  return isGoogleLinkFlow ? '/settings' : '/';
};

const beginGoogleOAuth = (req, res, next) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
    });
  }

  if (req.user?.email && req.session) {
    req.session.googleLinkEmail = req.user.email;
    req.session.googleLinkUserId = req.user.id;
  } else {
    clearGoogleLinkSession(req);
  }

  return next();
};

router.get(
  '/google',
  beginGoogleOAuth,
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
    ],
    accessType: 'offline',
    includeGrantedScopes: true,
    prompt: 'consent',
  }),
);

router.get('/google/callback', (req, res, next) => {
  if (!isGoogleOAuthConfigured()) {
    clearGoogleLinkSession(req);
    return res.redirect(buildAuthErrorRedirect('oauth_not_configured'));
  }

  return passport.authenticate('google', (error, user) => {
      if (error) {
        clearGoogleLinkSession(req);

        if (isGoogleMismatchError(error)) {
          return res.redirect(
          buildGoogleRedirect('/settings', {
            error: 'google_email_mismatch',
          }),
        );
      }

      return res.redirect(buildAuthErrorRedirect('auth_failed'));
    }

    if (!user) {
      clearGoogleLinkSession(req);
      return res.redirect(buildAuthErrorRedirect('auth_failed'));
    }

    return req.logIn(user, async (loginError) => {
      if (loginError) {
        clearGoogleLinkSession(req);
        return res.redirect(buildAuthErrorRedirect('auth_failed'));
      }

      try {
        const tokens = await prisma.googleToken.findUnique({
          where: { userId: user.id },
        });

        if (!tokens) {
          throw new Error('Tokens not found');
        }

        if (req.session) {
          req.session.authProvider = 'google';
          req.session.emailVerified = true;
        }

        const successRedirect = resolveGoogleSuccessRedirect(req);
        clearGoogleLinkSession(req);
        res.redirect(buildGoogleRedirect(successRedirect, { connected: 'true' }));
      } catch (callbackError) {
        clearGoogleLinkSession(req);
        res.redirect(buildAuthErrorRedirect('auth_failed'));
      }
    });
  })(req, res, next);
});

router.post('/session/supabase', async (req, res) => {
  try {
    const accessToken = String(req.body?.accessToken || '').trim();

    if (!accessToken) {
      return res.status(400).json({ error: 'accessToken is required' });
    }

    const supabaseUser = await getSupabaseUserFromAccessToken(accessToken);
    const workspaceUser = await upsertWorkspaceUserFromSupabase(supabaseUser);

    req.logIn(workspaceUser, async (loginError) => {
      if (loginError) {
        return res.status(500).json({ error: loginError.message });
      }

      if (req.session) {
        req.session.authProvider = 'password';
        req.session.emailVerified = Boolean(
          supabaseUser.email_confirmed_at || supabaseUser.confirmed_at,
        );
      }

      const status = await getWorkspaceAuthStatus(req);
      return res.json(status);
    });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const status = await getWorkspaceAuthStatus(req);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/google/status', async (req, res) => {
  try {
    if (!req.user) {
      return res.json({
        authenticated: false,
        connected: false,
        hasGoogleToken: false,
      });
    }

    const status = await getWorkspaceAuthStatus(req);

    return res.json({
      authenticated: status.authenticated,
      connected: status.hasGoogleToken,
      userId: status.user?.id || null,
      email: status.user?.email || null,
      name: status.user?.name || null,
      jobTitle: status.user?.jobTitle || null,
      picture: status.user?.picture || null,
      credentialId: req.user.n8nCredentialId || null,
      hasGoogleToken: status.hasGoogleToken,
      canUseGoogleFeatures: status.canUseGoogleFeatures,
      authProvider: status.authProvider,
      emailVerified: status.emailVerified,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/password/setup', requireAuth, async (req, res) => {
  try {
    const ensuredUser = await ensureSupabasePasswordUser({
      email: req.user.email,
      name: req.user.name,
    });

    res.json({
      success: true,
      email: req.user.email,
      authUserId: ensuredUser.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/google/disconnect', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (user.n8nCredentialId) {
      await deleteN8nCredential(user.n8nCredentialId);
    }

    await prisma.googleToken.delete({
      where: { userId: req.user.id },
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { n8nCredentialId: null },
    });

    const status = await getWorkspaceAuthStatus(req);
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  req.logout((logoutError) => {
    if (logoutError) {
      return res.status(500).json({ error: logoutError.message });
    }

    const cookieName = process.env.SESSION_COOKIE_NAME || 'team_assistant.sid';
    req.session?.destroy(() => {
      res.clearCookie(cookieName);
      res.json({ success: true });
    });
  });
});

router.get('/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const status = await getWorkspaceAuthStatus(req);
    res.json(status.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const jobTitle = String(req.body?.jobTitle || '').trim();

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name ? { name } : {}),
        jobTitle: jobTitle || null,
      },
    });

    await syncSupabaseMetadataForEmail({
      email: updatedUser.email,
      name: updatedUser.name,
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        jobTitle: updatedUser.jobTitle,
        picture: updatedUser.picture,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
