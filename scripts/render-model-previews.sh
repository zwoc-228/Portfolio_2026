#!/bin/bash
# Fast Eevee model previews: find Blender -> run generator -> exit.
# Usage: scripts/render-model-previews.sh [writing|research|architecture|all]
# Env: BL_PREVIEW_ENGINE=eevee (default) | cycles (one-off bake only)
#      BL_PREVIEW_PCT=50 (resolution % while iterating)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WHAT="${1:-writing}"
BLENDER="$("$HERE/find-blender.sh)"
echo "Blender: $BLENDER ($("$BLENDER" --version 2>/dev/null | head -1))"
export BL_PREVIEW_ENGINE="${BL_PREVIEW_ENGINE:-eevee}"
export BL_PREVIEW_PCT="${BL_PREVIEW_PCT:-50}"
echo "Engine: $BL_PREVIEW_ENGINE @ ${BL_PREVIEW_PCT}%"
exec "$HERE/../tools/blender/run.sh" "$WHAT" "$HERE/../public/models"
