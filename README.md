# TK Tarbiyatul Athfal 8 — Frontend

Website publik dan dashboard sistem informasi TK Tarbiyatul Athfal 8 (TK Muslimat NU Kota Semarang). Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui. Semua data berasal dari backend Laravel di repo terpisah (`TK_TA8_BE`), lewat REST API `/api/v1`.

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
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID OAuth Google (jenis Web application) untuk tombol Masuk dengan Google di `/mudarris/login`, sama dengan `GOOGLE_CLIENT_ID` di backend. Dibaca saat build, jadi build ulang setelah mengubahnya. Kalau kosong, guru tidak bisa masuk; Kepala Sekolah tetap bisa masuk dengan password. |

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
- Daftar dan detail pengumuman publik beserta lampirannya (PDF atau gambar, bisa dibuka tanpa login), galeri album.
- PPDB: info, pendaftaran tanpa login dengan unggah dokumen, cek status dengan kode pendaftaran + tanggal lahir anak.
- Halaman login terpisah: wali murid di `/login`, guru dan Kepala Sekolah di `/mudarris/login`. Lupa dan reset password hanya untuk Kepala Sekolah.

**Wali Murid**
- Login dengan NIS anak + password. Password awal adalah tanggal lahir anak (DDMMYYYY) dan wajib diganti saat pertama masuk, lalu melengkapi profil.
- Menambahkan kakak/adik dengan NIS + tanggal lahir anak, dan memilih anak aktif.
- Beranda dengan info dari sekolah, tagihan yang belum dibayar, kegiatan, pengumuman, agenda, dan rapor terbaru.
- Tagihan anak, bayar dengan unggah bukti transfer, riwayat pembayaran dan kwitansi.
- Kegiatan kelas anak (foto), rapor yang sudah terbit dan PDF-nya, pengumuman beserta lampirannya, agenda, pendaftaran PPDB kakak/adik, notifikasi, profil.

**Guru**
- Login dengan akun Google yang emailnya didaftarkan Kepala Sekolah. Guru tidak punya password.
- Kelas yang diampu dan murid di dalamnya, beserta kontak wali.
- Kegiatan kelas dengan foto, keterangan, dan urutan.
- Rapor per elemen penilaian: draft, ajukan, perbaiki saat diminta revisi.
- Pengumuman untuk kelas atau murid di kelasnya, dengan lampiran opsional (satu PDF atau gambar, maksimal 5 MB, bisa diganti atau dihapus); lihat agenda, lihat status tagihan kelasnya.
- Absensi dari HP: absen masuk dan absen pulang dengan lokasi dan foto langsung dari kamera; izin, sakit, dan pulang lebih awal dengan foto dari kamera atau galeri (misalnya surat dokter); riwayat absensi sendiri; notifikasi saat absensi tercatat atau dikoreksi.
- Izin per modul dari Kepala Sekolah, level lihat atau kelola: keuangan, konten website, laporan absensi, data murid (termasuk status murid, alumni, dan import), dan pengumuman. Bagian lain di luar kelima modul itu, termasuk jenis tagihan dan rekening sekolah, tetap khusus Kepala Sekolah.

**Kepala Sekolah**
- Login dengan akun Google, atau email + password sebagai cadangan.
- Beranda: statistik sekolah, keuangan bulan ini, grafik pemasukan 12 bulan, dan panel "Perlu Tindakan".
- Guru: tambah dengan nama + email Google, ubah data, aktifkan atau nonaktifkan, tampil di website, reset tautan Google. Hak Akses Guru: izin per modul dan preset (Bendahara, Admin Website, Admin Absensi, Tata Usaha).
- Tahun ajaran dan kenaikan kelas, kelas, murid (kartu akun wali, ubah status per murid, massal, atau meluluskan satu kelas, riwayat status, import dari Excel/CSV), alumni per tahun lulus, wali murid (ubah data, reset ke password awal).
- Keuangan: jenis tagihan, keringanan, tagihan bulanan dan sekali bayar, verifikasi dan pencatatan pembayaran, laporan dengan ekspor Excel, tunggakan.
- Review dan penerbitan rapor, pengumuman semua sasaran dengan lampiran opsional (lampiran pengumuman yang tampil di website bisa diunduh pengunjung), agenda sekolah (hanya Kepala Sekolah yang mengelola agenda).
- Absensi: ikut absen seperti guru; Rekap Absensi (harian dan bulanan 1–3 bulan, koreksi status, mencatat absen masuk atau pulang yang terlupa, unduh CSV); Pengaturan Absensi (titik sekolah di peta, radius, batas akurasi, jam masuk dan pulang, hari kerja, tanggal libur, tanggal mulai, masa simpan foto).
- PPDB (verifikasi, terima, tolak), CMS website, galeri, pengaturan, log aktivitas.

## Deploy

Tempat deploy belum ditentukan. Syarat yang sudah pasti (rinciannya di bagian "Deploy" `dokumentasi.md`):

1. Reverse proxy di depan Next.js yang menambahkan IP klien ke `X-Forwarded-For` (nginx: `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`), supaya rate limit backend per IP tidak bisa diakali.
2. `TRUSTED_PROXIES` di backend berisi IP server Next.js, ditambah reverse proxy di depan backend kalau ada.
3. `BE_API_URL` berisi alamat backend yang bisa dibuka browser, bukan hostname jaringan internal.
4. HTTPS dan `NODE_ENV=production`: cookie sesi `tk_token` (httpOnly) memakai flag `Secure`. Absensi juga butuh HTTPS, karena browser hanya membuka kamera dan lokasi di alamat https (atau `localhost`).
5. Batas unggahan: satu kegiatan bisa mengunggah 10 foto × 5 MB. Batas body reverse proxy minimal 55 MB (nginx `client_max_body_size 55M;`), PHP backend `post_max_size` minimal `55M`, dan `upload_max_filesize` disamakan dengan `post_max_size` (misalnya `55M`). Batas 5 MB per file dijaga validasi backend; kalau `upload_max_filesize` lebih kecil, file di atasnya ditolak PHP lebih dulu dengan pesan dari batas `php.ini` ("Maaf, lampiran gagal diunggah karena ukurannya lebih dari 2 MB. ..." untuk `php.ini` bawaan), bukan pesan batas 5 MB dari aplikasi.
6. Masuk dengan Google: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` diisi sebelum `npm run build`, dan origin FE produksi didaftarkan di Authorized JavaScript origins Client ID itu di Google Cloud Console. Backend memakai Client ID yang sama di `GOOGLE_CLIENT_ID`.
