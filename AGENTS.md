# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start both frontend (port 5173) & backend (port 3001)
npm run dev:client       # Frontend only
npm run dev:server       # Backend only (nodemon)

# Build & lint
npm run build            # Vite production build
npm run lint             # ESLint with zero warnings tolerance (--max-warnings 0)

# Database (Prisma)
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:migrate   # Apply new migrations (dev)
npm run prisma:studio    # Visual DB browser
```

**Important**: There are no automated tests in this project. Manual testing is required.

## Architecture Overview

This is a **full-stack monorepo**: a React SPA (Vite) plus an Express backend, sharing one `package.json`.

### How the system fits together

```
Browser (React) → n8n webhooks (AI agents)
                → Express backend (auth, session history, Google APIs)
                → Supabase (chat history storage via REST)
```

- **n8n** is the AI orchestration layer. All chat messages go to n8n webhooks, not directly to an LLM. The `src/services/api.js` module manages dynamic webhook URL construction based on environment (`prod`/`dev`) and mode (`publish`/`test`), stored in `localStorage`.
- **Express** (`server/`) handles Google OAuth 2.0 via Passport.js, stores tokens in PostgreSQL via Prisma, and acts as a proxy for Google APIs (Sheets, Drive, Calendar) so n8n can call them on behalf of the authenticated user.
- **Supabase** stores chat sessions (`chat_sessions`) and message histories (`n8n_chat_histories`). The frontend calls Supabase indirectly through the Express backend (`/api/sessions/*`).

### Key frontend patterns

**State management**: Zustand (`src/store/chatStore.js`). Chat messages are persisted to `sessionStorage` (per-tab, not localStorage). Session UUIDs are also per-tab.

**Service layer** (`src/services/`):
- `api.js` — barrel module + webhook URL builder + session ID management
- `chatService.js` — sends messages to Supervisor (supports file attachments) and Knowledge agents
- `sessionService.js` — CRUD for chat sessions and history retrieval with filtering of n8n internal tool traces
- `fileService.js`, `calendarService.js`, `jiraService.js`, `emailService.js`, `integrationService.js`, `tokenUsageService.js` — feature-specific services

**Chat history filtering**: `sessionService.ambilRiwayatChat()` strips n8n/LangChain internal messages (tool calls, empty messages, `[{"output"...}]` JSON blobs) before rendering. It also injects PDF document URLs into AI messages that contain download triggers.

**Routing** (`src/App.jsx`):
- `/` → Dashboard
- `/chat/supervisor` → SupervisorChat (general AI assistant)
- `/chat/knowledge` → KnowledgeChat (RAG-based)
- `/workspace/files`, `/workspace/calendar`, `/workspace/jira` → feature pages
- `/integrations` → third-party integration hub

### Backend structure (`server/`)

- `server/index.js` — Express app entry, mounts all routes
- `server/routes/google.js` — Google API proxy endpoints (Sheets, Drive, Calendar); authenticated either by user session or `x-n8n-api-key` header for n8n-originated requests
- `server/middleware/auth.js` — session auth guard
- Token refresh is handled automatically via `googleapis` `tokens` event; new tokens are persisted to `GoogleToken` table

### Database (PostgreSQL via Prisma + Supabase)

Two separate databases are in use:
1. **PostgreSQL** (Prisma-managed): `User`, `GoogleToken`, and `JiraIntegration` tables for OAuth and integrations
2. **Supabase** (REST API, accessed via `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`): `chat_sessions`, `chat_messages`, `dokumen`, and `execution_token_usage` tables for chat persistence and analytics

**Critical**: Backend uses `SUPABASE_SERVICE_ROLE_KEY` for server-side Supabase operations, not the anon key. Frontend uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` but calls Supabase indirectly through Express endpoints (`/api/sessions/*`).

### n8n workflow

The workflow JSON lives in `n8n/workflow/`. Agent skill documentation is in `n8n/workflow/skills/` (Markdown files describing what each skill does: email, PowerPoint, reports).

The production n8n instance is at `https://n8n.karyatech.web.id`. For local development, set `VITE_N8N_ENV=dev` and `VITE_N8N_DEV_URL` to your ngrok URL, or switch via the Settings modal in the UI.

## Environment Variables

Frontend (`.env`, prefixed `VITE_`):
- `VITE_N8N_ENV` — `prod` or `dev`
- `VITE_N8N_MODE` — `publish` or `test`
- `VITE_N8N_PROD_URL` / `VITE_N8N_DEV_URL` — n8n base URLs
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase connection
- `VITE_BACKEND_URL` — Express backend URL (default: `http://localhost:3001`)

Backend (`.env`):
- `DATABASE_URL` — PostgreSQL connection string
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `N8N_API_URL`, `N8N_API_KEY` — for n8n credential management and inbound requests
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase connection (service role key for backend)
- `SESSION_SECRET`, `FRONTEND_URL`, `PORT` (default: 3001)
