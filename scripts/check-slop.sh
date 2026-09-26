#!/usr/bin/env bash
# Pemeriksaan Bagian C6 PROMPT_FE_TK.md. Keluar dengan kode 1 kalau ada temuan.
set -uo pipefail

cd "$(dirname "$0")/.."

SUMBER=(src scripts next.config.ts eslint.config.mjs)
DOKUMEN=(dokumentasi.md README.md)
KECUALI=(--exclude=api.d.ts --exclude=check-slop.sh)
temuan=0

periksa() {
  local judul="$1"
  shift
  local hasil
  hasil=$(grep -rnI "${KECUALI[@]}" "$@" 2>/dev/null)
  if [[ -n "$hasil" ]]; then
    echo "== $judul"
    echo "$hasil"
    echo
    temuan=1
  fi
}

dokumen_ada=()
for f in "${DOKUMEN[@]}"; do [[ -f "$f" ]] && dokumen_ada+=("$f"); done

periksa "Emoji" -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{1F000}-\x{1F2FF}\x{FE0F}]' "${SUMBER[@]}" "${dokumen_ada[@]}"
periksa "Sisa debug" -E 'console\.log|console\.debug|\bdebugger\b' "${SUMBER[@]}"
periksa "Placeholder" -iE '\b(TODO|FIXME|lorem|ipsum)\b|john doe|example\.com' "${SUMBER[@]}" "${dokumen_ada[@]}"
periksa "Pembungkam checker" -E '@ts-ignore|@ts-expect-error|@ts-nocheck|eslint-disable|as any\b|: any\b|<any>|any\[\]' "${SUMBER[@]}"
periksa "Kata terlarang C3" -iE 'seamless|revolusioner|solusi (terdepan|terbaik)|era digital|transformasi digital|memberdayakan|tingkatkan pengalaman|all-in-one|mudah, cepat, dan aman|canggih|inovatif|selamat datang di masa depan|mari bersama|#1([^0-9a-fA-F]|$)' src "${dokumen_ada[@]}"

if [[ $temuan -eq 0 ]]; then
  echo "check:slop bersih."
fi
exit $temuan
