#!/usr/bin/env bash
# Checks that the build published every landing exactly as it is in projects/,
# except for the one line it is allowed to change: the robots meta.
#
# This is the promise the whole repo rests on — projects/ is finished, often
# live, client work, and the site publishes it without editing it. Until now
# that check only existed in the documentation as a `diff -r` someone was
# supposed to remember to run. CI runs this instead.
#
# Usage: tools/verificar-landings.sh [dist-dir]     (default: dist)
# Exits non-zero, and says exactly what changed, if anything else differs.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

out_dir="${1:-dist}"

if [ ! -d "$out_dir" ]; then
  echo "error: no existe '$out_dir' — ejecuta 'npm run build' primero" >&2
  exit 1
fi

# The slug map lives in src/lib/landings.mjs; ask it rather than repeating it.
mapfile -t landings < <(node -e '
  import("./src/lib/landings.mjs").then(({ discoverLandings }) => {
    for (const l of discoverLandings("projects")) console.log(`${l.folder} ${l.slug} ${l.dir}`);
  });
')

if [ ${#landings[@]} -eq 0 ]; then
  echo "error: no se descubrió ninguna landing bajo projects/" >&2
  exit 1
fi

fallos=0

for entry in "${landings[@]}"; do
  read -r folder slug dir <<<"$entry"
  published="$out_dir/$slug"

  if [ ! -d "$published" ]; then
    echo "FALLO  $folder: no se publicó en $published"
    fallos=$((fallos + 1))
    continue
  fi

  # Any file added, removed or renamed is a failure on its own.
  estructura="$(diff -rq "$published" "$dir" | grep -v '^Files .* differ$' || true)"
  if [ -n "$estructura" ]; then
    echo "FALLO  $folder: la estructura de ficheros no coincide"
    echo "$estructura" | sed 's/^/         /'
    fallos=$((fallos + 1))
    continue
  fi

  # Of the files that differ, every changed line must be a robots meta — the one
  # rewrite integrations/landings.mjs is allowed to make.
  otras="$(diff -r "$published" "$dir" | grep '^[<>]' | grep -v 'name="robots"' || true)"
  if [ -n "$otras" ]; then
    echo "FALLO  $folder: cambios que no son la meta robots"
    echo "$otras" | sed 's/^/         /'
    fallos=$((fallos + 1))
    continue
  fi

  # And whatever it published must actually be noindex.
  if ! grep -q 'name="robots" content="noindex, nofollow"' "$published/index.html"; then
    echo "FALLO  $folder: la copia publicada no está en noindex"
    fallos=$((fallos + 1))
    continue
  fi

  cambios="$(diff -r "$published" "$dir" | grep -c '^<' || true)"
  echo "ok     $folder -> $slug/ (noindex, $cambios línea(s) reescrita(s))"
done

if [ "$fallos" -gt 0 ]; then
  echo
  echo "$fallos landing(s) con problemas: la salida del build no coincide con projects/." >&2
  exit 1
fi

echo
echo "Todas las landings se publican intactas salvo la meta robots."
