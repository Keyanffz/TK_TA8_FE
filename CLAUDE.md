# CLAUDE.md

Aturan kerja untuk repo frontend ini, berlaku di setiap sesi.

1. Sebelum mengerjakan apa pun, baca `PROMPT_FE_TK.md` sampai habis dan `dokumentasi.md` (setelah dibuat di Fase 1). `PROMPT_FE_TK.md` adalah acuan tunggal desain dan kontrak API; `dokumentasi.md` mencatat status fase, changelog, dan keputusan teknis terakhir.
2. Kerjakan satu fase (Bagian D) saja. Di akhir fase jalankan pengecekan yang diwajibkan, perbarui `dokumentasi.md`, laporkan hasilnya, lalu berhenti dan tunggu konfirmasi sebelum lanjut ke fase berikutnya.
3. Patuhi Bagian C (anti AI-slop) di semua kode, teks UI, tampilan, dokumentasi, dan pesan commit.
4. Laporan akhir fase (dan balasan ke pemilik repo) ditulis dalam Bahasa Indonesia.

## Hemat pengujian
- Pengecekan otomatis (lint, typecheck, build, check:slop) tetap dijalankan penuh. Tampilkan hanya ringkasan dan error, jangan seluruh output.
- Uji manual di browser dan screenshot hanya untuk halaman yang baru, berubah, atau belum pernah diuji, plus alur yang langsung terkait. Fitur yang sudah lolos uji di sesi sebelumnya dan tidak disentuh tidak perlu diuji ulang.
- Jangan membaca ulang file besar (api.d.ts, package-lock.json) kecuali perlu.
