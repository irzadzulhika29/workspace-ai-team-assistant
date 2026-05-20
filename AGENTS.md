# AI Team Assistant

## Project Snapshot
Full-stack workspace monorepo (npm workspaces): React SPA (`fe/`) + Express backend (`be/`). AI orchestration via n8n webhooks. PostgreSQL (Prisma) for auth/tokens, Supabase REST for chat/documents/analytics. Pure JavaScript — no TypeScript. Sub-folder AGENTS.md files provide detailed guidance for each package.

## Root Setup Commands

```bash
npm install              # Install all workspace dependencies
npm run dev              # Start frontend (port 5173) + backend (port 3001)
npm run dev:fe           # Frontend only
npm run dev:be           # Backend only (nodemon, auto-regenerates Prisma)
npm run build            # Vite production build (frontend only)
npm run lint             # Lint both workspaces (ESLint --max-warnings 0)
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:migrate   # Apply new Prisma migrations (dev)
npm run prisma:studio    # Visual DB browser for PostgreSQL
```

**No automated tests.** Manual testing only. Husky pre-commit hook enforces `eslint --fix --max-warnings 0` on staged `*.{js,jsx}` files.

## Universal Conventions
- Use `@/` path alias in frontend imports (configured in `fe/jsconfig.json`)
- ESM modules (`"type": "module"`) in both workspaces
- React 18 JSX transform — no need to `import React` in JSX files
- ESLint config at root `.eslintrc.json`: `eslint:recommended` + `plugin:react/recommended` + `plugin:react-hooks/recommended`
- No Prettier configured — style consistency enforced only by ESLint
- Commit format: free-form, keep messages descriptive

## Security & Secrets
- `.env` is gitignored — never commit secrets
- `.env.production` contains production secrets (committed intentionally for deployment)
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` server-side, frontend uses `VITE_SUPABASE_ANON_KEY` client-side
- Jira API tokens stored encrypted in Prisma via `be/server/utils/encryption.js`

## Architecture Diagram

```
Browser (React SPA) → n8n webhooks (AI orchestrator)
                    → Express backend (auth, Google APIs, Jira proxy, Supabase proxy)
                    → Supabase REST API (chat sessions, messages, documents, analytics)
                    → PostgreSQL via Prisma (users, tokens, integrations)
```

## JIT Index

### Package Structure
- **Frontend**: `fe/` → [fe/AGENTS.md](fe/AGENTS.md)
- **Backend**: `be/` → [be/AGENTS.md](be/AGENTS.md)
- **Design System**: `design-system/` → [design-system/AGENTS.md](design-system/AGENTS.md)
- **n8n Workflows**: `n8n/` → [n8n/AGENTS.md](n8n/AGENTS.md)
- **Deployment**: `deploy/` → [deploy/AGENTS.md](deploy/AGENTS.md)

### Quick Find Commands
```bash
# Find React component definitions
rg -n "export (default )?function|export const" fe/src/components

# Find API route handlers
rg -n "router\.(get|post|put|delete|patch)" be/server/routes

# Find Zustand stores
rg -n "create\(" fe/src/store

# Find service function definitions
rg -n "export (const|function)" fe/src/services

# Find all references to a function
rg -n "functionName" fe/src be/server
```

## Routes Overview

| Route | Page | File |
|---|---|---|
| `/` | Dashboard (AI briefings, widgets) | `fe/src/pages/Dashboard.jsx` |
| `/chat/supervisor` | Multi-agent chat | `fe/src/pages/SupervisorChat.jsx` |
| `/workspace/files` | Document workspace | `fe/src/pages/FileWorkspace.jsx` |
| `/workspace/calendar` | Google Calendar | `fe/src/pages/CalendarPage.jsx` |
| `/workspace/jira` | Jira issue viewer | `fe/src/pages/JiraPage.jsx` |
| `/workspace/email` | Gmail inbox + Magic Reply | `fe/src/pages/EmailPage.jsx` |
| `/monitoring/tokens` | Token usage analytics | `fe/src/pages/TokenMonitorPage.jsx` |
| `/integrations` | Google OAuth + Jira setup | `fe/src/pages/IntegrationsPage.jsx` |
| `/debug/auth` | Auth debug tool | `fe/src/pages/DebugAuthPage.jsx` |

## Definition of Done
- ESLint passes with `--max-warnings 0` on both workspaces
- Frontend builds successfully (`npm run build`)
- Manual verification of changed features in browser
- No `.env` or credential files committed
