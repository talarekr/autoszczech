#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
OUTPUT_FILE="${1:-autoszczech-main.tar.gz}"
PREFIX="${2:-}"

if [[ -n "$PREFIX" ]]; then
  git -C "$ROOT_DIR" archive --format=tar --prefix="${PREFIX%/}/" HEAD | gzip > "$OUTPUT_FILE"
else
  git -C "$ROOT_DIR" archive --format=tar HEAD | gzip > "$OUTPUT_FILE"
fi

echo "Utworzono archiwum: $OUTPUT_FILE"
if [[ -n "$PREFIX" ]]; then
  echo "Katalog główny w archiwum: ${PREFIX%/}/"
fi
