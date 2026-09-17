#!/bin/bash
# Locate a Blender executable on this machine.
# Prints the resolved binary path to stdout; exits non-zero if not found.
# Resolution order: $BLENDER_BIN -> tools/blender-bin -> ~/.local/blender
# -> /Applications -> ~/Applications -> mdfind -> PATH.
# No machine-specific path is hardcoded into project source; every caller
# must use this script.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

if [ -n "${BLENDER_BIN:-}" ] && [ -x "$BLENDER_BIN" ]; then
  echo "$BLENDER_BIN"
  exit 0
fi

for app in \
  "$ROOT/tools/blender-bin/Blender.app" \
  "$HOME/.local/blender/Blender.app" \
  "/Applications/Blender.app" \
  "$HOME/Applications/Blender.app"; do
  bin="$app/Contents/MacOS/Blender"
  if [ -x "$bin" ]; then
    echo "$bin"
    exit 0
  fi
done

if command -v mdfind >/dev/null 2>&1; then
  found="$(mdfind "kMDItemFSName == 'Blender.app'" 2>/dev/null | head -1)"
  if [ -n "$found" ] && [ -x "$found/Contents/MacOS/Blender" ]; then
    echo "$found/Contents/MacOS/Blender"
    exit 0
  fi
fi

if command -v blender >/dev/null 2>&1; then
  command -v blender
  exit 0
fi

echo "ERROR: Blender not found. Install Blender 4.2+ (e.g. Blender.app in /Applications) or set BLENDER_BIN." >&2
exit 1
