#!/usr/bin/env bash
set -euo pipefail
repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
site_dir="$repo_root/review-gallery"
for name in editorial paseo literary manuscript atelier; do
  test -d "$site_dir/previews/$name" || { echo "Missing static export: $name" >&2; exit 1; }
done
node "$repo_root/scripts/review-gallery/prepare.mjs"
publish_dir=$(mktemp -d /tmp/ely-review-publish-XXXXXX)
git clone --single-branch --branch design/review-pages https://github.com/onpe5679/elyweb.git "$publish_dir" 2>/dev/null || {
  git -C "$publish_dir" init -b design/review-pages
  git -C "$publish_dir" remote add origin https://github.com/onpe5679/elyweb.git
}
rsync -a --delete --exclude=.git --exclude=.gitignore "$site_dir/" "$publish_dir/"
git -C "$publish_dir" add -A
if ! git -C "$publish_dir" diff --cached --quiet; then
  git -C "$publish_dir" commit -m "Publish five Elysian design previews and review gallery"
  git -C "$publish_dir" push origin HEAD:design/review-pages
fi
printf 'Published branch: design/review-pages\nWorktree: %s\n' "$publish_dir"
