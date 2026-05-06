# Team Assistant Workspace

A workspace-based full-stack application that combines a Vite/React frontend, an Express backend, Google integrations, Supabase-backed persistence, and n8n-driven automation.

## Structure

```text
team-workspace/
|-- fe/                       # Frontend workspace
|   |-- public/               # Static assets
|   |-- src/                  # React application code
|   |-- index.html            # Vite entry HTML
|   `-- package.json          # Frontend workspace manifest
|-- be/                       # Backend workspace
|   |-- prisma/               # Database schema and migrations
|   |-- server/               # Express application
|   |   |-- config/           # Auth and runtime configuration
|   |   |-- middleware/       # Request middleware
|   |   |-- routes/           # API routes
|   |   |-- services/         # Backend services
|   |   `-- index.js          # Backend entrypoint
|   `-- package.json          # Backend workspace manifest
|-- design-system/            # Design system workbench
|-- docs/                     # Product and implementation docs
|-- n8n/                      # Workflow JSON and skill docs
|-- deploy/                   # Deployment config
`-- package.json              # Root workspace orchestrator
```

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL
- Google Cloud OAuth credentials
- n8n instance for webhook-driven features

## Setup

1. Install dependencies from the root:

```bash
npm install
```

2. Create the root env file:

```bash
cp .env.production.example .env
```

3. Fill `.env` with your local or server values:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/team_workspace
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
SESSION_SECRET=generate-a-strong-random-secret-here
FRONTEND_URL=http://localhost:5173
N8N_API_URL=https://your-n8n-instance.com/api/v1
VITE_BACKEND_URL=http://localhost:3001
VITE_N8N_ENV=dev
VITE_N8N_MODE=test
VITE_N8N_PROD_URL=https://your-n8n-instance.com
VITE_N8N_DEV_URL=https://your-dev-n8n-instance.com
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
N8N_API_KEY=your-n8n-api-key
```

## Commands

```bash
# Root orchestration
npm run dev
npm run build
npm run lint
npm run start

# Workspace-specific
npm run dev:fe
npm run dev:be
npm run preview
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Development

Run both workspaces:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1
npm run dev:fe

# Terminal 2
npm run dev:be
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Production

- Build the frontend with `npm run build`
- Start the backend with `npm run start`
- In production, the backend serves the built SPA from `fe/dist`
- Docker and Caddy still use the single-runtime topology

Root `.env` and `.env.production` style files remain the source of container/runtime env values.

## API Surface

- `GET /api/health`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/google/status`
- `POST /api/auth/google/disconnect`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- Additional protected routes under `/api/*`

## Notes

- There are no automated tests in this repo yet; verification is manual.
- Frontend routes remain on the main origin.
- Backend routes remain under `/api/*`.
- Database schema and n8n webhook contracts are unchanged by the workspace split.

For backend-specific setup details, see [be/server/README.md](./be/server/README.md).
