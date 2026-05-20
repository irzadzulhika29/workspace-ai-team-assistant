# Deployment (`deploy/`)

## Package Identity
Docker-based deployment configuration for the AI Team Assistant monorepo. Multi-stage Docker build compiles the frontend and runs the Express backend, with Caddy as reverse proxy for automatic HTTPS.

## Files

| File | Purpose |
|---|---|
| `Caddyfile` | Reverse proxy config — routes to app container on port 3001 |
| `pull-and-build.sh` | Git pull + Docker compose rebuild script |
| `restart.sh` | Docker compose restart script |

## Docker Configuration (root level)

### Dockerfile
Multi-stage build:
1. **Stage 1 (builder)**: Node 20 Bookworm Slim — installs all workspace deps, builds frontend with Vite
2. **Stage 2 (runner)**: Node 20 Bookworm Slim — copies built assets, runs Express backend on port 3001

### docker-compose.yml
Two services:
- **app**: Node backend serving on port 3001, uses `.env.production` for runtime env, has healthcheck on `/api/health`
- **caddy**: Reverse proxy on ports 80/443 with automatic HTTPS, routes to app

## Deployment Flow
```bash
# On the server
cd /opt/workspace-ai-team-assistant
bash deploy/pull-and-build.sh    # Git pull + docker compose up --build -d
bash deploy/restart.sh           # Restart containers only
```

## Environment
- Production secrets in `.env.production` (committed to repo)
- `.env` is gitignored — local development only
- `.dockerignore` excludes `.env`, `.git`, `node_modules`, build artifacts

## Key Conventions
- Backend serves static frontend in production: Express handles `*` route to serve `fe/dist/index.html`
- Health check endpoint: `GET /api/health`
- Graceful shutdown on SIGTERM/SIGINT — disconnects Prisma before exit
- Session cookies: `secure=true` and `sameSite=none` in production, `lax` in development
