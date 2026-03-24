import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
    accessType: 'offline',
    prompt: 'consent',
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/calendar.readonly'
    ]
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔑 OAuth Callback - Access Token received:', accessToken ? 'Yes' : 'No');
      console.log('🔑 OAuth Callback - Refresh Token received:', refreshToken ? 'Yes' : 'No');
      console.log('👤 OAuth Callback - Profile:', profile.displayName, profile.emails[0].value);

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0]?.value
          }
        });
        console.log('✅ New user created:', user.id);
      } else {
        console.log('✅ Existing user found:', user.id);
      }

      // Save or update Google tokens
      await prisma.googleToken.upsert({
        where: { userId: user.id },
        update: {
          accessToken,
          refreshToken: refreshToken || undefined,
          expiresAt: new Date(Date.now() + 3600 * 1000)
        },
        create: {
          userId: user.id,
          accessToken,
          refreshToken: refreshToken || '',
          expiresAt: new Date(Date.now() + 3600 * 1000)
        }
      });

      console.log('💾 Tokens saved to database');

      return done(null, user);
    } catch (error) {
      console.error('❌ OAuth Error:', error);
      return done(error, null);
    }
  }
));

export default passport;
