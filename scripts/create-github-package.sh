#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
OUTPUT_FILE="${1:-autoszczech-github.zip}"
PREFIX="${2:-autoszczech}" # domyślnie katalog główny w archiwum

if [[ -z "$PREFIX" ]]; then
  git -C "$ROOT_DIR" archive --format=zip HEAD > "$OUTPUT_FILE"
else
  git -C "$ROOT_DIR" archive --format=zip --prefix="${PREFIX%/}/" HEAD > "$OUTPUT_FILE"
fi

echo "Utworzono archiwum: $OUTPUT_FILE"
if [[ -n "$PREFIX" ]]; then
  echo "Katalog główny w archiwum: ${PREFIX%/}/"
fi
