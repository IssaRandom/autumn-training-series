#!/usr/bin/env bash
# One-shot project facts for the bts-project-manager review. Read-only.
cd "$(git rev-parse --show-toplevel)" || exit 1
B=autumn-training-series/beta
echo "== Date: $(date +%F)"
echo "== Branch: $(git branch --show-current)"
git fetch -q 2>/dev/null
echo "Unpushed on beta (vs origin/beta): $(git rev-list --count origin/beta..beta 2>/dev/null || echo '?')"
echo "beta commits not in master:        $(git rev-list --count origin/master..beta 2>/dev/null || echo '?')"
echo "Last master: $(git log origin/master -1 --format='%h %ad %s' --date=short 2>/dev/null)"
echo "Last beta commit: $(git log -1 --format='%h %ad %s' --date=short)"
echo
echo "== Uncommitted"
echo "Modified: $(git status --porcelain | grep -c '^ M\|^M')  Untracked: $(git status --porcelain | grep -c '^??')"
git diff --stat 2>/dev/null | tail -1
echo
echo "== Commits per day (last 10 days)"
git log --since='10 days ago' --format='%ad' --date=short | sort | uniq -c
echo
echo "== Placeholders still in beta HTML"
for p in PLACEHOLDER 'class="[^"]*todo' 'class="[^"]*wip' 'class="[^"]*verify' 'class="[^"]*draft' picsum 'EDIT LATER'; do
  n=$(grep -rEo "$p" $B --include=*.html 2>/dev/null | wc -l); echo "  $p: $n"
done
echo "  Under-construction pages: $(grep -rl 'Under construction' $B --include=*.html | wc -l)"
echo
echo "== Booking"
grep -nE 'api *[:=]' $B/booking/config.js 2>/dev/null | sed 's/AKfycb[A-Za-z0-9_-]*/AKfycb…/' | head -3
echo "BTS camps (events.js):"
grep -E 'type: "bts-camp"' $B/data/events.js | sed -E 's/.*id: "([^"]+)".*start: "([^"]+)".*(placeholder: true)?.*note: "([^"]*)".*/  \2  \1  \4/' | cut -c1-120
echo
echo "== Plan docs (last modified)"
for f in STATUS.md REVIEW-LIST.md BOOKING-PLAN.md POLISH-AUDIT.md ARTICLE-DESIGN-PLAN.md PROJECT-REVIEW.md; do
  [ -f "$f" ] && echo "  $f  $(git log -1 --format=%ad --date=short -- "$f" 2>/dev/null || echo uncommitted)"
done
