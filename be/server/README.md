# Backend Setup Guide

## Workspace Context

The backend now lives in the `be/` workspace. Run backend-specific commands from the root via npm workspace scripts or directly inside `be/`.

## Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create the root env file:

```bash
cp .env.production.example .env
```

3. Fill `.env` with required values:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/team_workspace
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
SESSION_SECRET=generate-random-secret-here
FRONTEND_URL=http://localhost:5173
N8N_API_URL=https://your-n8n.com/api/v1
N8N_API_KEY=your-n8n-api-key
```

## Commands

From the repo root:

```bash
npm run dev:be
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run start
```

Inside `be/` directly:

```bash
npm run dev
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run start
```

## Local Development

- Backend default URL: `http://localhost:3001`
- Frontend default URL: `http://localhost:5173`
- Google OAuth callback for local dev: `http://localhost:3001/api/auth/google/callback`

To run the full app, use `npm run dev` from the repo root. To run backend only, use `npm run dev:be`.

## Runtime Notes

- API routes remain under `/api/*`
- In production, the backend serves the built SPA from `fe/dist`
- Prisma schema now lives in `be/prisma`
- Server entrypoint is `be/server/index.js`

## Common Issues

- Database connection error:
  Check `DATABASE_URL` in `.env` and make sure PostgreSQL is reachable.
- Google OAuth error:
  Verify the callback URL matches exactly in Google Cloud Console.
- n8n credential creation fails:
  Verify `N8N_API_URL` and `N8N_API_KEY`, then confirm the n8n API is reachable.
