#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

if [[ ! -f ".env.production" ]]; then
  echo "Missing .env.production in ${PROJECT_ROOT}"
  exit 1
fi

set -a
source "${PROJECT_ROOT}/.env.production"
set +a

docker compose up -d --build --remove-orphans
docker compose ps
