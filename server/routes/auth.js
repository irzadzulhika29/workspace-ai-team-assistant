import express from 'express';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import { deleteN8nCredential } from '../services/n8nService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Initiate Google OAuth
router.get('/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
  }),
  async (req, res) => {
    try {
      // Get user tokens
      const tokens = await prisma.googleToken.findUnique({
        where: { userId: req.user.id }
      });

      if (!tokens) {
        throw new Error('Tokens not found');
      }

      // Note: n8n API doesn't support creating OAuth2 credentials with existing tokens
      // Tokens are saved in our database and can be accessed via our API
      // n8n workflows can call our API endpoints to use these tokens
      console.log('ℹ️  Google tokens saved to database for API access');

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?connected=true`);
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=auth_failed`);
    }
  }
);

// Check connection status
router.get('/google/status', async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ connected: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        googleToken: true
      }
    });

    // User is connected if they have a Google token
    const hasToken = !!user.googleToken;

    res.json({
      connected: hasToken,
      userId: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      credentialId: user.n8nCredentialId,
      hasGoogleToken: hasToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disconnect Google account
router.post('/google/disconnect', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Delete n8n credential
    if (user.n8nCredentialId) {
      await deleteN8nCredential(user.n8nCredentialId);
    }

    // Delete tokens
    await prisma.googleToken.delete({
      where: { userId: req.user.id }
    });

    // Update user
    await prisma.user.update({
      where: { id: req.user.id },
      data: { n8nCredentialId: null }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

export default router;
