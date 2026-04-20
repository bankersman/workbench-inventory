#!/bin/bash
# Copy shared libraries required by native Node .node binaries into $OUT (rootfs overlay).
# Does not copy the .node files themselves. Skips glibc and other bases shipped in distroless Node.
set -euo pipefail

OUT="${1:?output dir}"
shift

skip_lib() {
  case "$1" in
  */libc.so.6 | */libm.so.6 | */libdl.so.2 | */libpthread.so.0 | */libresolv.so.2 | */librt.so.1 | */libanl.so.1 | */ld-linux*.so.* | */libgcc_s.so.* | */libstdc++.so.6)
    return 0
    ;;
  esac
  return 1
}

declare -A seen
queue=()

for bin in "$@"; do
  [[ -f "$bin" ]] || continue
  while read -r dep; do
    [[ -f "$dep" ]] || continue
    skip_lib "$dep" && continue
    queue+=("$dep")
  done < <(ldd "$bin" 2>/dev/null | awk '/=> \//{print $3}')
done

while ((${#queue[@]})); do
  lib="${queue[0]}"
  queue=("${queue[@]:1}")
  [[ -f "$lib" ]] || continue
  [[ ${seen[$lib]:-} ]] && continue
  seen[$lib]=1

  mkdir -p "$OUT$(dirname "$lib")"
  cp -L "$lib" "$OUT$lib" || cp "$lib" "$OUT$lib"

  while read -r dep; do
    [[ -f "$dep" ]] || continue
    skip_lib "$dep" && continue
    queue+=("$dep")
  done < <(ldd "$lib" 2>/dev/null | awk '/=> \//{print $3}')
done
