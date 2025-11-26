#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
QUESTION="${1:-What is RAG?}"

curl -s -X POST "http://localhost:${PORT}/ask" \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"${QUESTION}\"}"
