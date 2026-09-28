# TK Tarbiyathul Athfal 8 — Frontend

Website publik dan dashboard sistem informasi TK Tarbiyathul Athfal 8 (TK Muslimat NU Kota Semarang). Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui. Semua data berasal dari backend Laravel di repo terpisah (`TK_TA8_BE`), lewat REST API `/api/v1`.

Rincian arsitektur, keputusan teknis, peta route, dan changelog per fase ada di [`dokumentasi.md`](dokumentasi.md). Acuan desain dan kontrak API: [`PROMPT_FE_TK.md`](PROMPT_FE_TK.md).

## Prasyarat

- Node.js 24 (`.nvmrc`)
- Backend `TK_TA8_BE` berjalan (lokal: `http://localhost:8000`)

## Menjalankan

```bash
nvm use
npm install
cp .env.example .env.local
npm run gen:api    # tipe src/types/api.d.ts dari api.json backend
npm run dev        # http://localhost:3000
```

Variabel `.env.local`:

| Variabel | Isi |
|---|---|
| `BE_API_URL` | Base URL API backend termasuk `/api/v1`, misalnya `http://localhost:8000/api/v1`. Harus alamat yang juga bisa dibuka browser, karena signed URL file private dibentuk backend dari host request yang diterimanya. |
| `API_SPEC_PATH` | Path atau URL `api.json` untuk `npm run gen:api`. Lokal: `../TK_TA8_BE/storage/api-docs/api.json`. |

## Perintah

| Perintah | Isi |
|---|---|
| `npm run dev` | server pengembangan |
| `npm run build` / `npm start` | build dan jalankan mode produksi |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run gen:api` | generate `src/types/api.d.ts` dari `API_SPEC_PATH` (file hasil generate di-commit, tidak diedit manual) |
| `npm run check:slop` | pemeriksaan Bagian C6: emoji, sisa debug, placeholder, pembungkam checker, kata terlarang |

Build tidak membutuhkan backend. Kalau backend tidak bisa dihubungi saat `npm run build`, halaman publik tidak di-prerender dan dirender saat diminta. Saat berjalan, halaman publik yang datanya gagal diambil menampilkan pesan "Halaman belum bisa ditampilkan" dan penyebabnya dicatat di log server.

## Fitur per peran

**Pengunjung (tanpa login)**
- Halaman depan dari CMS: profil, sambutan Kepala Sekolah, visi-misi, program, keunggulan, fasilitas, guru, galeri, pengumuman, agenda, info PPDB, kontak dan peta.
- Daftar dan detail pengumuman publik, galeri album.
- PPDB: info, pendaftaran tanpa login dengan unggah dokumen, cek status dengan kode pendaftaran + tanggal lahir anak.
- Login terpisah untuk wali murid dan untuk guru/Kepala Sekolah, daftar akun guru, lupa dan reset password (guru dan Kepala Sekolah).

**Wali Murid**
- Login dengan NIS anak + password. Password awal adalah tanggal lahir anak (DDMMYYYY) dan wajib diganti saat pertama masuk, lalu melengkapi profil.
- Menambahkan kakak/adik dengan NIS + tanggal lahir anak, dan memilih anak aktif.
- Tagihan anak, bayar dengan unggah bukti transfer, riwayat pembayaran dan kwitansi.
- Kegiatan kelas anak (foto), rapor yang sudah terbit dan PDF-nya, pengumuman, agenda, pendaftaran PPDB kakak/adik, notifikasi, profil.

**Guru**
- Kelas yang diampu dan murid di dalamnya, beserta kontak wali.
- Kegiatan kelas dengan foto, keterangan, dan urutan.
- Rapor per elemen penilaian: draft, ajukan, perbaiki saat diminta revisi.
- Pengumuman untuk kelas atau murid di kelasnya, lihat agenda, lihat status tagihan kelasnya.
- Guru dengan izin keuangan mendapat menu keuangan seperti Kepala Sekolah, kecuali rekening dan jenis tagihan.

**Kepala Sekolah**
- Beranda: statistik sekolah, keuangan bulan ini, grafik pemasukan 12 bulan, dan panel "Perlu Tindakan".
- Guru (persetujuan, izin keuangan, tampil di website), tahun ajaran dan kenaikan kelas, kelas, murid (kartu akun wali), wali murid (ubah data, reset ke password awal).
- Keuangan: jenis tagihan, keringanan, tagihan bulanan dan sekali bayar, verifikasi dan pencatatan pembayaran, laporan dengan ekspor Excel, tunggakan.
- Review dan penerbitan rapor, pengumuman semua sasaran, agenda sekolah (hanya Kepala Sekolah yang mengelola agenda).
- PPDB (verifikasi, terima, tolak), CMS website, galeri, pengaturan, log aktivitas.

Proyek ini tidak memiliki modul absensi.

## Deploy

Tempat deploy belum ditentukan. Syarat yang sudah pasti (rinciannya di bagian "Deploy" `dokumentasi.md`):

1. Reverse proxy di depan Next.js yang menambahkan IP klien ke `X-Forwarded-For` (nginx: `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`), supaya rate limit backend per IP tidak bisa diakali.
2. `TRUSTED_PROXIES` di backend berisi IP server Next.js, ditambah reverse proxy di depan backend kalau ada.
3. `BE_API_URL` berisi alamat backend yang bisa dibuka browser, bukan hostname jaringan internal.
4. HTTPS dan `NODE_ENV=production`: cookie sesi `tk_token` (httpOnly) memakai flag `Secure`.
5. Batas unggahan: satu kegiatan bisa mengunggah 10 foto × 5 MB. Batas body reverse proxy minimal 55 MB (nginx `client_max_body_size 55M;`), dan PHP backend `upload_max_filesize` minimal `5M` serta `post_max_size` minimal `55M`.
