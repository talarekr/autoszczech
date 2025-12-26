#!/usr/bin/env bash
set -euo pipefail

REMOTE="${1:-origin}"
BRANCH="${2:-main}"
TMP_BRANCH="__deploy_tmp"

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "No commits found in the current repository. Please create a commit before running this script." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is dirty. Commit or stash your changes before running this script." >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/${TMP_BRANCH}"; then
  echo "Temporary branch ${TMP_BRANCH} already exists. Delete it before running the script." >&2
  exit 1
fi

echo "Creating orphan branch ${TMP_BRANCH} from current tree..."
git checkout --orphan "${TMP_BRANCH}"

echo "Staging repository snapshot..."
git add -A

echo "Creating deployment commit..."
git commit -m "Reset ${BRANCH} with current project snapshot"

echo "Force pushing snapshot to ${REMOTE}/${BRANCH}..."
git push --force "${REMOTE}" "${TMP_BRANCH}:${BRANCH}"

echo "Returning to previous branch..."
git checkout -

echo "Removing temporary branch ${TMP_BRANCH}..."
git branch -D "${TMP_BRANCH}"

echo "Remote ${REMOTE}/${BRANCH} now mirrors the current repository state."
