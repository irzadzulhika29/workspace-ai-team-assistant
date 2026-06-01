import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import './env.js';
import prisma from '../lib/prisma.js';
import { clearGoogleLinkSession } from '../services/supabaseAuth.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        passReqToCallback: true,
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          'http://localhost:3001/api/auth/google/callback',
        accessType: 'offline',
        prompt: 'consent',
        scope: [
          'profile',
          'email',
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/gmail.labels',
        ],
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const profileEmail = String(profile.emails?.[0]?.value || '')
            .trim()
            .toLowerCase();
          const expectedLinkEmail = String(req.session?.googleLinkEmail || '')
            .trim()
            .toLowerCase();
          const linkingUserId = req.session?.googleLinkUserId || null;

          if (!profileEmail) {
            throw new Error('Google profile is missing an email address');
          }

          if (expectedLinkEmail && expectedLinkEmail !== profileEmail) {
            throw new Error('GOOGLE_EMAIL_MISMATCH');
          }

          let user = null;

          if (linkingUserId) {
            user = await prisma.user.findUnique({
              where: { id: linkingUserId },
            });

            if (!user) {
              throw new Error('Workspace user not found for Google linking');
            }

            if (String(user.email || '').trim().toLowerCase() !== profileEmail) {
              throw new Error('GOOGLE_EMAIL_MISMATCH');
            }
          } else {
            user = await prisma.user.findUnique({
              where: { googleId: profile.id },
            });

            if (!user) {
              user = await prisma.user.findUnique({
                where: { email: profileEmail },
              });
            }
          }

          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                email: profileEmail,
                name: profile.displayName || profileEmail,
                picture: profile.photos?.[0]?.value || null,
              },
            });
          } else {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                ...(user.picture
                  ? {}
                  : { picture: profile.photos?.[0]?.value || null }),
                ...(user.name
                  ? {}
                  : { name: profile.displayName || profileEmail }),
              },
            });
          }

          await prisma.googleToken.upsert({
            where: { userId: user.id },
            update: {
              accessToken,
              refreshToken: refreshToken || undefined,
              expiresAt: new Date(Date.now() + 3600 * 1000),
            },
            create: {
              userId: user.id,
              accessToken,
              refreshToken: refreshToken || '',
              expiresAt: new Date(Date.now() + 3600 * 1000),
            },
          });

          clearGoogleLinkSession(req);
          done(null, user);
        } catch (error) {
          clearGoogleLinkSession(req);
          done(error, null);
        }
      },
    ),
  );
} else {
  console.warn(
    'Google OAuth is disabled: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.',
  );
}

export default passport;
