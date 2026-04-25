# VPS Deploy

## Files

- `docker-compose.yml` - production stack for the VPS
- `deploy/Caddyfile` - reverse proxy and TLS
- `.env.production.example` - runtime environment template
- `.github/workflows/build-and-push.yml` - build and publish image to GHCR on `main`
- `.github/workflows/deploy-vps.yml` - optional auto-deploy to VPS via SSH after image build

## GitHub setup

Create these GitHub Actions variables:

- `VITE_BACKEND_URL`
- `VITE_N8N_ENV`
- `VITE_N8N_MODE`
- `VITE_N8N_PROD_URL`
- `VITE_N8N_DEV_URL`
- `VITE_SUPABASE_URL`

Create this GitHub Actions secret:

- `VITE_SUPABASE_ANON_KEY`

If you want GitHub to deploy directly to the VPS, also create:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_APP_DIR`

## VPS setup

Create `.env.production` from `.env.production.example`.

Set the Compose variables before running Docker, for example:

```env
APP_IMAGE=ghcr.io/OWNER/REPO:latest
APP_DOMAIN=your-domain.com
```

Then on the VPS:

```bash
docker login ghcr.io
docker compose pull
docker compose up -d
```

## Notes

- The app container serves both frontend and backend on port `3001`.
- Caddy terminates TLS and proxies traffic to the app container.
- `FRONTEND_URL` and `GOOGLE_CALLBACK_URL` must match the public domain exactly.
- `docker compose` needs `APP_IMAGE` and `APP_DOMAIN` in the shell environment or a local `.env` file on the VPS.
