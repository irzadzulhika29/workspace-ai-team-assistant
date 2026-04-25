#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

cd "${PROJECT_ROOT}"

if [[ ! -f ".env.production" ]]; then
  echo "Missing .env.production in ${PROJECT_ROOT}"
  exit 1
fi

set -a
source "${PROJECT_ROOT}/.env.production"
set +a

git fetch origin
git checkout "${DEPLOY_BRANCH}"
git pull --ff-only origin "${DEPLOY_BRANCH}"

docker compose build --pull
docker compose up -d --remove-orphans
docker image prune -f
docker compose ps
