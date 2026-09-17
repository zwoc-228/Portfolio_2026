#!/bin/bash
# Pre-push gate: typecheck + production build. Fails loudly on any error.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
cd "$ROOT"
export PATH="$HOME/.local/node/bin:$PATH"
command -v node >/dev/null || { echo "Node not found (expected ~/.local/node)."; exit 1; }
echo "node $(node --version) / npm $(npm --version)"
npx tsc --noEmit
npm run build
echo "VERIFY OK: tsc + vite build passed"
