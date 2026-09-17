#!/bin/bash
# Reproducible headless asset generation.
# Resolves Blender from: $BLENDER_BIN, ./tools/blender-bin, /Applications/Blender.app
# Usage: tools/blender/run.sh [writing|research|architecture|all] [outdir]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WHAT="${1:-writing}"
OUTDIR="${2:-$HERE/../../public/models}"

pick_blender() {
  if [ -n "${BLENDER_BIN:-}" ] && [ -x "$BLENDER_BIN" ]; then echo "$BLENDER_BIN"; return; fi
  if [ -x "$HERE/../blender-bin/blender" ]; then echo "$HERE/../blender-bin/blender"; return; fi
  if [ -x "$HOME/.local/blender/Blender.app/Contents/MacOS/Blender" ]; then echo "$HOME/.local/blender/Blender.app/Contents/MacOS/Blender"; return; fi
  if [ -x "/Applications/Blender.app/Contents/MacOS/Blender" ]; then echo "/Applications/Blender.app/Contents/MacOS/Blender"; return; fi
  if command -v blender >/dev/null 2>&1; then echo "blender"; return; fi
  echo "ERROR: no Blender found. Set BLENDER_BIN or see tools/blender/README.md" >&2
  exit 1
}

BLENDER="$(pick_blender)"
echo "Blender: $BLENDER"
mkdir -p "$OUTDIR"

run_one() {
  echo "=== generating $1 ==="
  "$BLENDER" --background --python "$HERE/generate_$1.py" -- "$OUTDIR"
}

if [ "$WHAT" = "all" ]; then
  run_one writing
  run_one research
  run_one architecture
else
  run_one "$WHAT"
fi
echo "DONE -> $OUTDIR"
