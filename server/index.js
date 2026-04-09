import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import cors from 'cors';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import googleRoutes from './routes/google.js';
import integrationRoutes from './routes/integrations.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const PgStore = connectPgSimple(session);
const { Pool } = pg;

if (isProduction) {
  app.set('trust proxy', 1);
}

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const cookieSameSite = process.env.SESSION_COOKIE_SAMESITE || (isProduction ? 'none' : 'lax');
const cookieSecure = process.env.SESSION_COOKIE_SECURE
  ? process.env.SESSION_COOKIE_SECURE === 'true'
  : isProduction;

let finalCookieSecure = cookieSecure;
if (cookieSameSite === 'none' && !cookieSecure) {
  console.warn('SESSION_COOKIE_SAMESITE=none requires secure cookies, forcing secure=true');
  finalCookieSecure = true;
}

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  name: process.env.SESSION_COOKIE_NAME || 'team_assistant.sid',
  cookie: {
    secure: finalCookieSecure,
    httpOnly: true,
    sameSite: cookieSameSite,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

if (process.env.DATABASE_URL) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });

  sessionConfig.store = new PgStore({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  });
}

app.use(session(sessionConfig));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/integrations', integrationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
