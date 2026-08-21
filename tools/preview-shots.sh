#!/usr/bin/env bash
# Regenerates the full-page preview images shown on the root gallery
# (assets/img/previews/<landing>.{webp,jpg}).
#
# Not part of serving the site — a one-off (or "re-run when a landing changes")
# dev tool. The site itself stays plain static files; this just produces some of
# those files ahead of time instead of screenshotting live in the browser.
#
# Requires: firefox (headless screenshot), ffmpeg (webp encode), imagemagick
# (`magick`, jpeg encode + resize). Run from anywhere; paths are resolved
# relative to the repo root.
#
# Usage: tools/preview-shots.sh [landing ...]
#   With no arguments, regenerates every folder under projects/ that has an index.html.
#   Landing names are bare folder names (e.g. "inmica"), not "projects/inmica".

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

for cmd in firefox ffmpeg magick python3; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "error: '$cmd' is required but not on PATH" >&2
    exit 1
  fi
done

out_dir="assets/img/previews"
mkdir -p "$out_dir"

# Discover landings the same way the deploy workflow does: any folder under
# projects/ with its own index.html.
landings=("$@")
if [ ${#landings[@]} -eq 0 ]; then
  for dir in projects/*/; do
    name="${dir#projects/}"
    name="${name%/}"
    [ -f "${dir}index.html" ] || continue
    landings+=("$name")
  done
fi

work_dir="$(mktemp -d)"
cleanup() {
  kill "$server_pid" >/dev/null 2>&1 || true
  rm -rf "$work_dir"
}
trap cleanup EXIT

# Serve a mirror of the repo root, not the repo root itself. Firefox's headless
# --screenshot never fires loading="lazy" images — confirmed by isolating it on a
# one-image test page: neither a huge --window-size nor
# dom.image-lazy-loading.enabled=false makes it load. The only reliable fix is to
# drop the attribute before the shutter fires, which the committed HTML must keep
# (real visitors and Googlebot both handle native lazy-loading fine — this is a
# headless-screenshot-only blind spot). So each landing gets a real directory here
# with a lazy-stripped index.html, symlinked to its own css/js/assets/etc. so
# relative paths still resolve to the real files; everything else in the repo is
# symlinked through untouched.
serve_root="$work_dir/serve"
mkdir -p "$serve_root/projects"
for entry in *; do
  [ "$entry" = "projects" ] && continue
  ln -s "$repo_root/$entry" "$serve_root/$entry"
done
for name in "${landings[@]}"; do
  mirror="$serve_root/projects/$name"
  mkdir -p "$mirror"
  sed -E 's/[[:space:]]*loading="lazy"//g' "projects/$name/index.html" > "$mirror/index.html"
  for entry in "projects/$name"/*; do
    base="$(basename "$entry")"
    [ "$base" = "index.html" ] && continue
    ln -s "$repo_root/$entry" "$mirror/$base"
  done
done

port="$(python3 -c 'import socket; s = socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')"
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$serve_root" >/tmp/preview-shots-server.log 2>&1 &
server_pid=$!

# Give the server a moment to bind before the first request.
for _ in $(seq 1 20); do
  curl -sf "http://127.0.0.1:$port/" >/dev/null 2>&1 && break
  sleep 0.25
done

for name in "${landings[@]}"; do
  echo "==> $name"
  raw_png="$work_dir/$name-raw.png"
  profile_dir="$work_dir/$name-profile"
  mkdir -p "$profile_dir"

  # Ask for reduced motion, so .reveal blocks are never mid-animation when the
  # shutter fires. Landings start those blocks at opacity 0 and fade them in from
  # an IntersectionObserver; the capture races that transition, and whatever is
  # still faded out lands in the PNG as blank space. It bit hard and unevenly —
  # measuring flat (contentless) rows in the committed previews: 85% on
  # chantal_verdugo_house, 44% on inmica, against ~38% once fixed.
  #
  # Both landings gate the hidden state behind
  # `@media (prefers-reduced-motion: no-preference)`, so asking for "reduce"
  # drops it altogether: content is painted at load, with no transition to race
  # and JavaScript still on. A still image is exactly what reduced motion is for.
  cat > "$profile_dir/user.js" <<'PREF'
user_pref("ui.prefersReducedMotion", 1);
PREF

  # Width only (no height) tells Firefox's headless --screenshot to capture the
  # full scrollable page, not just one viewport — confirmed against
  # projects/inmica/, which is several screens tall.
  firefox --headless \
    --window-size=1280 \
    --profile "$profile_dir" \
    --screenshot "$raw_png" \
    "http://127.0.0.1:$port/projects/$name/" >/tmp/preview-shots-firefox.log 2>&1

  if [ ! -s "$raw_png" ]; then
    echo "error: no screenshot produced for $name (see /tmp/preview-shots-firefox.log)" >&2
    exit 1
  fi

  # Downscale to a 900px-wide asset, keep full page height so the card can
  # scroll through the whole capture on hover.
  magick "$raw_png" -resize 900x -strip -quality 82 "$out_dir/$name.jpg"
  ffmpeg -y -loglevel error -i "$raw_png" -vf scale=900:-1 "$out_dir/$name.webp"

  jpg_kb=$(( $(stat -c%s "$out_dir/$name.jpg") / 1024 ))
  webp_kb=$(( $(stat -c%s "$out_dir/$name.webp") / 1024 ))
  echo "    $out_dir/$name.jpg (${jpg_kb} KB) / $name.webp (${webp_kb} KB)"
done

echo "Done. Re-run this script whenever a landing's visible content changes."
