# VPS Deploy

## Files

- `docker-compose.yml` - production stack for the VPS
- `deploy/Caddyfile` - reverse proxy and TLS
- `.env.production.example` - runtime environment template
- `deploy/pull-and-build.sh` - pull latest code, build image on the VPS, restart containers
- `deploy/restart.sh` - rebuild and restart containers without updating git

## VPS setup

Create `.env.production` from `.env.production.example`.

Then on the VPS:

```bash
chmod +x deploy/pull-and-build.sh deploy/restart.sh
./deploy/pull-and-build.sh
```

## Notes

- The app container serves both frontend and backend on port `3001`.
- Caddy terminates TLS and proxies traffic to the app container.
- `FRONTEND_URL` and `GOOGLE_CALLBACK_URL` must match the public domain exactly.
- `APP_DOMAIN` is read from `.env.production` and used by Caddy.
- `VITE_*` variables are also read from `.env.production` during Docker build on the VPS.
- `deploy/pull-and-build.sh` defaults to branch `main`. Override with `DEPLOY_BRANCH=branch-name ./deploy/pull-and-build.sh` if needed.
