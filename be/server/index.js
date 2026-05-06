import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import './config/env.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import googleRoutes from './routes/google.js';
import integrationRoutes from './routes/integrations.js';
import dashboardRoutes from './routes/dashboard.js';
import emailDraftsRoutes from './routes/emailDrafts.js';
import { errorHandler } from './middleware/errorHandler.js';
import prisma from './lib/prisma.js';

const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const PgStore = connectPgSimple(session);
const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '..', '..', 'fe', 'dist');

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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/email', emailDraftsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (isProduction) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
