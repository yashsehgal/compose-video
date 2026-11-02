#!/usr/bin/env bash
# Renders half-scale stills of a composition at the given seconds and tiles
# them into one contact sheet, two per row, in the order given.
#
#   stills.sh <CompositionId> <fps> <seconds...>
#   stills.sh ImportCardRefine 60 2 5.5 11 25.5 64.9
#
# Writes out/stills/<id>/NN.png and out/stills/<id>/grid.png. Run from the
# Remotion project root. Needs ffmpeg.
set -euo pipefail

id="$1"; fps="$2"; shift 2
dir="out/stills/$id"
mkdir -p "$dir"

n=0
for s in "$@"; do
  frame=$(awk -v s="$s" -v f="$fps" 'BEGIN { printf "%d", s * f }')
  name=$(printf "%02d" "$n")
  npx remotion still "$id" "$dir/$name.png" --frame="$frame" --scale=0.5 \
    --timeout=120000 --log=error >/dev/null
  echo "$name.png  ${s}s  frame $frame"
  n=$((n + 1))
done

rows=$(( (n + 1) / 2 ))
ffmpeg -v error -y -framerate 1 -i "$dir/%02d.png" \
  -vf "tile=2x${rows}:padding=8:color=0xcccccc" -frames:v 1 "$dir/grid.png"
echo "Contact sheet: $dir/grid.png"
