# Backend (`be/`)

## Package Identity
Express 4 server with Passport.js (Google OAuth 2.0), session-based auth via PostgreSQL (`connect-pg-simple`), Prisma ORM for PostgreSQL, and Supabase client for REST API. Pure JavaScript (ESM).

## Setup & Run

```bash
cd be
npm install                       # From root: npm install (workspaces)
npm run dev                       # nodemon + prisma:generate → runs on port 3001
npm run start                     # Production start
npm run lint                      # ESLint --max-warnings 0 on *.js
npm run prisma:generate           # Regenerate Prisma client
npm run prisma:migrate            # Apply pending migrations
npm run prisma:studio             # Visual DB browser
```

From root workspace:
```bash
npm run dev:be                    # Start backend dev server
npm run prisma:generate           # Regenerate Prisma client
npm run prisma:migrate            # Apply migrations
npm run prisma:studio             # Open Prisma Studio
```

## Patterns & Conventions

### File Organization
```
be/
├── prisma/
│   ├── schema.prisma             # Database schema (User, GoogleToken, JiraIntegration)
│   └── migrations/               # Prisma migration history
└── server/
    ├── index.js                  # Express app entry, mounts all routes
    ├── config/
    │   ├── env.js                # Centralized dotenv loading
    │   └── passport.js           # Passport Google OAuth strategy
    ├── lib/
    │   └── prisma.js             # Prisma client singleton
    ├── middleware/
    │   ├── auth.js               # Session authentication guard
    │   └── errorHandler.js       # Global error handler
    ├── routes/
    │   ├── api.js                # Core API (sessions, docs, token-usage, protected)
    │   ├── auth.js               # Google OAuth login/logout/status/me
    │   ├── dashboard.js          # AI briefing endpoints (user + n8n)
    │   ├── emailDrafts.js        # Email draft management
    │   ├── google.js             # Google API proxy (Sheets, Drive, Calendar, Gmail)
    │   └── integrations.js       # Jira integration CRUD + proxy
    ├── services/
    │   ├── emailService.js       # Email sending/draft operations
    │   └── n8nService.js         # n8n API interaction (credential management)
    ├── utils/
    │   └── encryption.js         # Encrypt/decrypt Jira API tokens
    └── scripts/
        └── clearTokens.js        # Token cleanup utility
```

### Route Modules
- Each route file exports an `express.Router()` with domain-specific endpoints
- Mounted in `server/index.js` with prefix path (e.g., `app.use('/api/auth', authRoutes)`)
- DO: Follow pattern from `routes/google.js` for Google API proxy — supports both user session and `x-n8n-api-key` auth
- DO: Follow pattern from `routes/dashboard.js` for endpoints that serve dual consumers (FE user + n8n)
- DO: Use `requireAuth` middleware from `middleware/auth.js` for routes requiring logged-in user
- DON'T: Call Supabase directly from frontend — always proxy through Express endpoints

### Authentication
- Google OAuth via Passport.js, configured in `config/passport.js`
- Session stored in PostgreSQL via `connect-pg-simple` (table: `user_sessions`)
- Google tokens stored in `GoogleToken` Prisma model, auto-refreshed via `googleapis` `tokens` event
- n8n-originated requests authenticated via `x-n8n-api-key` header
- Token refresh is automatic — new tokens are persisted to `GoogleToken` table on the `tokens` event
- DO: Get Google access token for the current user via `GET /api/google/token`
- DO: Check auth status via `GET /api/auth/google/status`
- DON'T: Write raw token queries — use the `GoogleToken` Prisma model

### Database
- **PostgreSQL** (Prisma): `User`, `GoogleToken`, `JiraIntegration` tables — for auth and integrations
- **Supabase** (REST): `chat_sessions`, `chat_messages`, `dokumen`, `execution_token_usage`, `dashboard_summary_snapshots` — for chat persistence and analytics
- Prisma client singleton at `lib/prisma.js`
- Supabase client instantiated per-request with `SUPABASE_SERVICE_ROLE_KEY`

### Environment Variables
All loaded in `config/env.js` via `dotenv`:
- `DATABASE_URL` — PostgreSQL connection string
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` — Google OAuth
- `N8N_API_URL`, `N8N_API_KEY` — n8n credential management + inbound request auth
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase connection
- `SESSION_SECRET`, `FRONTEND_URL`, `PORT` (default: 3001)
- `SESSION_COOKIE_NAME`, `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_SAMESITE` — session config
- `ENCRYPTION_KEY` — for Jira token encryption

### New Route Checklist
1. Create route file in `be/server/routes/` (e.g., `myFeature.js`)
2. Export `express.Router()` with handlers — see `routes/dashboard.js` for dual-consumer pattern
3. Mount in `be/server/index.js` — `app.use('/api/my-feature', myFeatureRoutes)`
4. Use `requireAuth` from `middleware/auth.js` for user-authenticated endpoints
5. Check `x-n8n-api-key` for n8n-authenticated endpoints
6. Test manually via browser or curl

## Key Files

| File | Purpose |
|---|---|
| `server/index.js` | Express app: session, Passport, CORS, route mounting, production static serving |
| `server/config/passport.js` | Google OAuth2.0 strategy, token serialization |
| `server/middleware/auth.js` | `requireAuth` middleware — checks `req.isAuthenticated()` |
| `server/middleware/errorHandler.js` | Global error handler with structured JSON responses |
| `server/routes/google.js` | Google API proxy — Sheets/Drive/Calendar/Gmail, dual auth (session + n8n key) |
| `server/routes/auth.js` | Google OAuth flow, logout, status, current user |
| `server/routes/api.js` | Core API: sessions CRUD, docs, token-usage, Google token |
| `server/routes/dashboard.js` | AI briefing: user endpoints + n8n endpoints for data collection/upsert |
| `server/routes/emailDrafts.js` | Email draft management |
| `server/routes/integrations.js` | Jira integration CRUD + REST proxy to Atlassian |
| `lib/prisma.js` | Prisma client singleton |
| `utils/encryption.js` | Encrypt/decrypt Jira API tokens at rest |
| `prisma/schema.prisma` | Database schema definition |

## JIT Index Hints

```bash
# Find all route handler definitions
rg -n "router\.(get|post|put|delete|patch)" be/server/routes

# Find middleware usage
rg -n "requireAuth" be/server/routes

# Find Supabase queries
rg -n "supabase\.(from|from\()" be/server

# Find n8n API key checks
rg -n "x-n8n-api-key" be/server

# Find Prisma queries
rg -n "prisma\.\w+\.(find|create|update|delete|upsert)" be/server

# Find error handling patterns
rg -n "next\(" be/server/routes
```

## Common Gotchas
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` (full access), not the anon key — this is intentional for server-side operations
- Production: `SESSION_COOKIE_SAMESITE=none` requires `SESSION_COOKIE_SECURE=true` — automatically enforced
- Prisma client must be regenerated after schema changes: `npm run prisma:generate`
- In production, Express serves the built frontend from `fe/dist/` for non-API routes
- Jira API tokens are encrypted at rest in PostgreSQL — decrypt via `utils/encryption.js`
- `connect-pg-simple` creates `user_sessions` table automatically if missing

## Pre-PR Checks
```bash
npm run lint --workspace be && npm run prisma:generate --workspace be
```
