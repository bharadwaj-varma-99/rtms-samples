#!/bin/bash

# Script to sync forked repo with upstream changes
# This keeps your main branch up-to-date with zoom/rtms-samples

set -e  # Exit on any error

echo "🔄 Syncing with upstream Zoom repository..."

# Ensure we're on main branch
echo "📍 Switching to main branch..."
git checkout main

# Fetch latest changes from upstream
echo "⬇️  Fetching latest changes from upstream..."
git fetch upstream

# Check if there are any local uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  WARNING: You have uncommitted changes!"
    echo "   Please commit or stash them before syncing."
    echo "   Run: git add . && git commit -m 'Your changes'"
    exit 1
fi

# Merge upstream changes
echo "🔀 Merging upstream/main into local main..."
git merge upstream/main

# Push updated main to your fork
echo "⬆️  Pushing updates to your fork..."
git push origin main

echo "✅ Sync complete! Your fork is now up-to-date with upstream."
echo "📊 Recent commits from upstream:"
git log --oneline -5 upstream/main