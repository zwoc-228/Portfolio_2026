#!/bin/bash
# One-glance project status: branch, git state, toolchain, live URL.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
cd "$ROOT"
echo "branch: $(git branch --show-current 2>/dev/null || echo '?')"
echo "status: $(git status --short 2>/dev/null | head -8 | tr '\n' ' ' || echo '?')"
echo "commit: $(git log --oneline -1 2>/dev/null || echo '?')"
if BL="$("$HERE/find-blender.sh" 2>/dev/null)"; then
  echo "blender: $BL ($("$BL" --version 2>/dev/null | head -1))"
else
  echo "blender: NOT FOUND"
fi
export PATH="$HOME/.local/node/bin:$PATH"
echo "node: $(command -v node >/dev/null && node --version || echo MISSING)"
echo "npm: $(command -v npm >/dev/null && npm --version || echo MISSING)"
echo "live: https://zwoc-228.github.io/Portfolio_2026/"
