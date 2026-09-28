# TK Tarbiyathul Athfal 8 — Frontend

Website publik dan dashboard sistem informasi manajemen **TK Tarbiyathul Athfal 8** (TK Muslimat NU Kota Semarang). Dibangun menggunakan Next.js (App Router), Tailwind CSS v4, shadcn/ui, TanStack Query & Table, serta TypeScript strict.

---

## Prasyarat Sistem

- **Node.js**: `24.x LTS` (sesuai `.nvmrc`)
- **NPM**: bawaan Node 24 (`v10.x` / `v11.x`)
- **Backend API**: Laravel API (`TK_TA8_BE`) berjalan dan dapat diakses (default lokal: `http://localhost:8000`)

---

## Panduan Instalasi & Menjalankan

### 1. Kloning dan Pemasangan Dependensi

```bash
# Masuk ke direktori proyek
cd TK_TA8_FE

# Pastikan versi Node.js sesuai
nvm use

# Pasang dependensi
npm install
```

### 2. Konfigurasi Lingkungan

Salin file contoh konfigurasi:

```bash
cp .env.example .env.local
```

Sesuaikan nilai di dalam `.env.local`:

```env
# Alamat backend yang dapat diakses oleh server Next.js (dan browser)
BE_API_URL=http://localhost:8000

# Opsional: Jika backend diakses via jaringan internal Docker/Kubernetes saat SSR
# INTERNAL_API_URL=http://localhost:8000

# Path ke spesifikasi OpenAPI (api.json) backend untuk generate tipe TypeScript
API_SPEC_PATH=../TK_TA8_BE/dokumentasi/api.json
```

### 3. Generate Tipe OpenAPI

Setiap kali skema `api.json` backend diperbarui, jalankan:

```bash
npm run gen:api
```

Perintah ini akan memperbarui file kontrak tipe di `src/types/api.d.ts`.

### 4. Menjalankan Server Pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada peramban Anda.

---

## Perintah Tersedia

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Next.js dev server dengan Turbopack di port 3000 |
| `npm run build` | Membuat bundel produksi yang teroptimasi (lolos verifikasi offline) |
| `npm start` | Menjalankan server produksi hasil kompilasi `npm run build` |
| `npm run lint` | Menjalankan linter ESLint (`eslint .`) |
| `npm run typecheck` | Menjalankan verifikasi tipe Next.js dan TypeScript (`next typegen && tsc --noEmit`) |
| `npm run gen:api` | Menghasilkan file tipe `src/types/api.d.ts` dari `API_SPEC_PATH` |
| `npm run check:slop` | Memeriksa kepatuhan anti-slop, token terlarang, sisa debug, dan placeholder |

---

## Matriks Fitur Berdasarkan Peran

### 1. Pengunjung Publik
- **Beranda Sekolah**: Profil sekolah, program pendidikan, keunggulan, fasilitas, sambutan Kepala Sekolah, daftar guru, galeri kegiatan, pengumuman, dan agenda mendatang.
- **Penerimaan Peserta Didik Baru (PPDB)**: Informasi kuota, persyaratan, pendaftaran online mandiri dengan unggah berkas (KK, Akta Kelahiran), dan pelacakan status pendaftaran via nomor pendaftaran & nomor telepon.
- **Galeri & Pengumuman**: Tampilan album kegiatan dengan lightbox foto dan arsip pengumuman resmi.

### 2. Orang Tua / Wali Murid
- **Autentikasi**: Masuk menggunakan Nomor Induk Siswa (NIS) anak dan tanggal lahir (format `DDMMYYYY`) sebagai password default. Wajib ganti password pada login perdana.
- **Onboarding**: Panduan awal dan ringkasan data anak terdaftar.
- **Keuangan & Tagihan**: Memantau daftar tagihan (SPP bulanan, uang seragam, kegiatan), riwayat pembayaran, serta pembayaran transfer bank dengan unggahan bukti transfer.
- **Rapor & Perkembangan**: Melihat rapor capaian pembelajaran digital anak per semester setelah diterbitkan sekolah.
- **Kegiatan Kelas & Notifikasi**: Memantau dokumentasi foto dan cerita kegiatan harian kelas anak serta menerima notifikasi pengumuman.

### 3. Guru
- **Kelola Kelas & Murid**: Melihat daftar murid di kelas yang diampu, presensi, dan profil perkembangan anak.
- **Jurnal Kegiatan Kelas**: Mencatat dokumentasi kegiatan harian, cerita bermain, dan unggah album foto kelas (hingga 10 foto per kegiatan).
- **Penilaian & Draf Rapor**: Mengisi nilai capaian pembelajaran, narasi deskripsi, dan mengajukan draf rapor ke Kepala Sekolah untuk ditinjau.
- **Pengumuman & Agenda**: Membuat pengumuman internal sekolah/kelas dan menyusun agenda kegiatan.

### 4. Kepala Sekolah (Administrator)
- **Ringkasan Eksekutif & "Perlu Tindakan"**: Dasbor terpadu menampilkan hal yang butuh persetujuan segera (pembayaran menunggu verifikasi, draf rapor diajukan, registrasi guru baru, pendaftar PPDB baru).
- **Verifikasi Keuangan**: Menyetujui atau menolak bukti transfer tagihan dari wali murid serta memantau laporan keuangan bulanan dan tunggakan.
- **Penerbitan Rapor**: Meninjau dan menyetujui draf rapor yang diajukan oleh para guru.
- **CMS Website Sekolah**: Mengubah profil sekolah, teks pembuka/hero, daftar program, fasilitas, keunggulan, dan foto profil sekolah secara langsung tanpa menyentuh kode.
- **Pengaturan & Master Data**: Mengatur rekening transfer sekolah, tahun ajaran, aturan tanggal jatuh tempo SPP, pembukaan PPDB, dan elemen capaian penilaian rapor.
- **Log Aktivitas**: Audit trail pencatatan aktivitas penting di lingkungan sekolah.

---

## Checklist Penerapan Produksi (Deploy Checklist)

Pastikan langkah-langkah berikut terpenuhi sebelum menjalankan aplikasi di lingkungan produksi:

1. **Reverse Proxy (Nginx / Caddy / Cloudflare)**:
   - Konfigurasikan reverse proxy untuk meneruskan permintaan ke server Next.js (port 3000).
   - Pastikan header berikut diteruskan ke backend dan frontend:
     - `Host`
     - `X-Real-IP`
     - `X-Forwarded-For`
     - `X-Forwarded-Proto` (wajib `https` di produksi).
2. **Konfigurasi `TRUSTED_PROXIES` di Backend Laravel**:
   - Backend Laravel harus mengenali IP reverse proxy dan server Next.js melalui `TRUSTED_PROXIES` di `.env` backend (contoh: `TRUSTED_PROXIES=127.0.0.1,::1` atau subnet load balancer), agar pembatasan percobaan login (rate limiting) dan IP pengguna terbaca akurat.
3. **`BE_API_URL` Harus Dapat Diakses Browser Pengguna**:
   - Nilai `BE_API_URL` tidak boleh menggunakan hostname internal Docker yang terisolasi (misalnya `http://backend:8000`), melainkan URL publik (contoh: `https://api.tkta8.sch.id`). Hal ini wajib karena penandatanganan tautan dokumen private (signed URL foto transfer, rapor, dan berkas PPDB) menggunakan alamat origin yang diterima backend.
4. **Batas Ukuran Unggahan (Upload Limits)**:
   - Pengunggahan foto kegiatan kelas dapat berisi hingga 10 foto masing-masing maks 5 MB. Pastikan reverse proxy mengizinkan payload setidaknya **55 MB**:
     - Di Nginx: `client_max_body_size 55M;`
     - Di PHP backend: `upload_max_filesize = 55M` dan `post_max_size = 60M`.
5. **Keamanan Cookie Sesi**:
   - Pastikan menjalankan aplikasi dengan environment `NODE_ENV=production`. Cookie sesi (`tk_token`, `tk_role`) otomatis menerapkan flag `Secure; HttpOnly; SameSite=Lax`.
