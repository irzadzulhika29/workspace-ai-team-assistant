# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

```bash
# Development
npm run dev              # Start both frontend (port 5173) and backend (port 3001)
npm run dev:fe           # Frontend only
npm run dev:be           # Backend only

# Build and lint
npm run build            # Build the frontend workspace
npm run lint             # Lint frontend and backend workspaces

# Database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

There are no automated tests in this project.

## Architecture Overview

This is a full-stack workspace monorepo:

- `fe/` contains the Vite/React SPA
- `be/` contains the Express backend and Prisma schema
- The root `package.json` orchestrates both workspaces

Runtime flow:

```text
Browser -> n8n webhooks
        -> Express backend
        -> Supabase
```

## Frontend

- Main app entry: `fe/src/App.jsx`
- State: `fe/src/store/chatStore.js`
- API/webhook URL handling: `fe/src/services/api.js`
- Vite config: `fe/vite.config.js`

## Backend

- Main server entry: `be/server/index.js`
- Auth/session routes and Google proxy routes live under `be/server/routes/`
- Prisma schema lives in `be/prisma/schema.prisma`
- In production, the backend serves the built frontend from `fe/dist`

## Environment

- Root `.env` is the shared source of truth for local/runtime configuration
- Production deployment env can still come from root deployment files such as `.env.production`
