# Dokumentasi Frontend TK Tarbiyathul Athfal 8

Website publik dan dashboard sistem informasi TK Tarbiyathul Athfal 8 (TK Muslimat NU Kota Semarang). Acuan desain dan kontrak API: `PROMPT_FE_TK.md`. Backend Laravel ada di repo terpisah (`../TK_TA8_BE`), dengan dokumentasi di `../TK_TA8_BE/dokumentasi.md`.

## Status

| Fase | Status |
|---|---|
| 0. Analisis | Selesai, rencana disetujui (Arah desain A "Buku Cerita") |
| 1. Fondasi | Selesai |
| 2. Publik & auth | Selesai; revisi setelah review (login terpisah, warna, font, gerak) menunggu review |
| 3. Shell dashboard | Selesai, menunggu review desain beranda (C7) |
| 4. Master data | Belum |
| 5. Keuangan | Belum |
| 6. Akademik & komunikasi | Belum |
| 7. PPDB, CMS, pengaturan | Belum |
| 8. Integrasi & polish | Belum |

Mode mock tidak dipakai: `api.json` final dari backend sudah tersedia sejak Fase 1, jadi semua request memakai backend asli dan tipe hasil generate. Tidak ada endpoint mock.

## Stack terpasang

| Paket | Versi | Catatan |
|---|---|---|
| Node.js | 24 LTS (`.nvmrc`) | `engines.node >= 24` |
| next | 16.3.6 | App Router, Turbopack; route guard memakai `src/proxy.ts` (pengganti `middleware.ts` sejak Next 16) |
| react, react-dom | 19.3.0 | |
| typescript | 5.9.3 | Bukan 7.x: typescript-eslint 8.70 butuh TS `<6.1`, openapi-typescript 7.13 punya peer `^5.x` |
| tailwindcss, @tailwindcss/postcss | 4.3.3 | |
| shadcn (CLI + `shadcn/tailwind.css`) | 4.21.0 | style `radix-nova`, komponen di `src/components/ui` |
| radix-ui | 1.6.7 | primitive untuk komponen shadcn |
| cn | 0.4.0 | pengganti clsx + tailwind-merge yang dipakai shadcn 4 |
| @tanstack/react-query | 5.104.0 | |
| @tanstack/react-table | 8.21.3 | Bukan 9.x: pola DataTable shadcn masih memakai API v8 |
| react-hook-form, zod, @hookform/resolvers | 7.89.0, 4.6.5, 5.9.1 | |
| recharts | 3.10.1 | |
| nuqs | 2.10.1 | |
| openapi-typescript, openapi-fetch | 7.13.0, 0.17.0 | |
| @react-oauth/google | 0.13.5 | |
| @tiptap/react, @tiptap/starter-kit, @tiptap/pm | 3.31.3 | |
| date-fns | 4.4.0 | |
| sonner | 2.0.8 | |
| browser-image-compression | 2.0.2 | |
| lucide-react | 1.48.0 | |
| eslint, eslint-config-next | 9.39.5, 16.3.6 | |
| server-only | 0.0.1 | penanda modul yang hanya boleh diimpor di server |

## Instalasi dan menjalankan

Prasyarat: Node.js 24, backend berjalan (default `http://localhost:8000`).

```bash
nvm use            # membaca .nvmrc
npm install
cp .env.example .env.local
npm run gen:api    # generate src/types/api.d.ts dari api.json backend
npm run dev        # http://localhost:3000
```

Perintah lain:

| Perintah | Isi |
|---|---|
| `npm run build` / `npm start` | build dan jalankan mode produksi |
| `npm run lint` | `eslint .` (Next 16 tidak punya `next lint` lagi) |
| `npm run typecheck` | `next typegen && tsc --noEmit`; `next typegen` membuat tipe route (`LayoutProps`, `RouteContext`) tanpa build |
| `npm run gen:api` | `node --env-file-if-exists=.env.local scripts/gen-api.mjs`, membaca `API_SPEC_PATH` |
| `npm run check:slop` | `scripts/check-slop.sh`, pemeriksaan Bagian C6 |

`src/types/api.d.ts` hasil generate di-commit dan tidak diedit manual. Jalankan ulang `npm run gen:api` setiap `api.json` backend berubah.

## Variabel `.env`

| Variabel | Dipakai di | Keterangan |
|---|---|---|
| `BE_API_URL` | server (route handler, Server Component, `next.config.ts`) | Base URL API termasuk `/api/v1`. Harus alamat yang juga bisa dibuka browser, karena signed URL file private dibentuk backend dari host request yang diterimanya. Origin-nya juga dipakai untuk `images.remotePatterns` (`/storage/**`). |
| `API_SPEC_PATH` | `npm run gen:api` | Path atau URL `api.json`. Lokal: `../TK_TA8_BE/storage/api-docs/api.json`. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | browser (tombol Google) | Sama dengan `GOOGLE_CLIENT_ID` di backend. Belum diisi di lokal. |

## Arsitektur

### Autentikasi (BFF)

- Browser tidak pernah memegang token. `POST /api/auth/login` dan `POST /api/auth/google` meneruskan body ke backend (ditambah `perangkat: "web"`), lalu menyimpan token di cookie `tk_token` (httpOnly, `secure` di produksi, sameSite lax, 30 hari) dan `tk_role` (bukan httpOnly, hanya nama role). Respons ke browser berisi `user` (dan `is_new` untuk Google) tanpa token.
- `POST /api/auth/logout` memanggil `/auth/logout` backend lalu menghapus `tk_token`, `tk_role`, `tk_anak`. Cookie tetap dihapus walau backend tidak bisa dihubungi.
- `GET /api/auth/sesi-habis?next=` menghapus cookie lalu redirect ke `/login?next=`. Dipakai layout dashboard saat `/auth/me` menolak token, karena Server Component tidak bisa menghapus cookie.
- `/api/proxy/[...path]` meneruskan method, query, header `Content-Type`/`Content-Length`, dan body (stream, termasuk multipart dan PUT multipart) ke `{BE_API_URL}/...` dengan `Authorization: Bearer` dari cookie. Respons diteruskan sebagai stream beserta `Content-Type`, `Content-Disposition`, `Cache-Control`, `Retry-After`, dan header rate limit. Backend membalas 401 → cookie sesi dihapus.
- Request yang mengubah data (selain GET/HEAD) ke `/api/proxy` dan `/api/auth/*` ditolak 403 kalau header `Origin` bukan host FE sendiri.
- Segmen path `.` dan `..` di proxy ditolak supaya tidak bisa keluar dari prefix `/api/v1`.
- Backend tidak bisa dihubungi → 502 dengan bentuk error A7 (`code: SERVER_ERROR`), penyebabnya dicatat di log server.

### Penerusan IP klien

Rate limit backend dihitung per IP klien. Semua route handler yang memanggil backend (`/api/proxy`, `/api/auth/*`) meneruskan rantai `X-Forwarded-For` dari request masuk apa adanya (`headerKeBackend()` di `src/lib/api/be.ts`). Next.js mengisi header ini dengan IP socket hanya kalau request masuk belum membawanya.

`X-Forwarded-Host` dan `X-Forwarded-Proto` sengaja tidak diteruskan: backend membentuk signed URL `GET /media/{token}` dari host request, dan URL itu harus tetap menunjuk host backend.

Request dari Server Component ke endpoint publik (landing, ISR) tidak membawa `X-Forwarded-For` karena hasilnya di-cache dan dipakai bersama; backend menghitungnya sebagai IP server FE.

### Route guard

- `src/proxy.ts` (matcher `/dashboard/:path*`, `/login`, `/login/:path*`): tanpa cookie `tk_token` ke `/dashboard/*` → `/login?next=...`; sudah punya cookie buka `/login` atau `/login/*` → `/dashboard`. `/api` sengaja tidak dicocokkan karena proxy Next.js membatasi body 10 MB (`proxyClientMaxBodySize`), sedangkan unggahan kegiatan bisa lebih besar.
- `src/app/dashboard/layout.tsx` memanggil `ambilSesi()` (`GET /auth/me`, di-cache per request). Token ditolak (401 atau `ACCOUNT_*`) → `/api/auth/sesi-habis`.
- Otorisasi sebenarnya tetap di backend.

### Data fetching

- Browser: `api` (`src/lib/api/client.ts`), openapi-fetch dengan `paths` dari `api.d.ts` dan `baseUrl: "/api/proxy"`. `ambilData()` mengubah hasilnya menjadi data atau melempar `ApiError`.
- Server Component: `apiServer({ token, revalidate, tags })` (`src/lib/api/server.ts`). Opsi cache Next.js dipasang lewat `fetch` kustom, karena openapi-fetch membungkus request dalam objek `Request` dan opsi `next` di dalamnya tidak terbaca fetch Next.js.
- React Query: `staleTime` 60 detik (jauh di bawah masa berlaku signed URL 30 menit), tidak mencoba ulang error 4xx. Error 401 di query atau mutation mana pun mengosongkan cache lalu mengarahkan ke `/login?next=`.
- Sesi di React Query dengan key `['me']`, diisi dari server lewat `HydrationBoundary` di layout dashboard. `useSession()` → `{ user, role, isSuperAdmin, isGuru, isWali, bisaKelolaKeuangan }`.
- Error terpusat di `src/lib/api/errors.ts`: `ApiError { status, code, message, errors }`, `pesanError()` untuk toast, `terapkanErrorValidasi()` memasang `errors` VALIDATION_ERROR ke field react-hook-form.

## Keputusan Fase 2

- Teks UI memakai sapaan "Anda", sama dengan pesan dari backend (disetujui saat review; B3 dan aturan kerja di `PROMPT_FE_TK.md` sudah disesuaikan).
- Data publik diambil di Server Component lewat `src/lib/api/publik.ts` dengan `revalidate` 300 detik dan tag per jenis data. `ambilProfilSekolah()` dibungkus `cache()` React karena dipanggil layout dan halaman.
- `GET /public/profil` dibaca dari tipe hasil generate lalu diubah ke objek `ProfilSekolah` (`src/lib/api/pengaturan.ts`). String kosong dianggap belum diisi, jadi NPSN, peta, dan sambutan yang kosong di data demo tidak memunculkan elemen kosong.
- Identitas "TK Muslimat NU Kota Semarang" tidak ada di kunci pengaturan A4, jadi disimpan sebagai konstanta `NAUNGAN_SEKOLAH` dan ditampilkan di footer, bagian profil, dan panel halaman auth.
- Hero tanpa gambar CMS menampilkan logo sekolah di lingkaran putih dengan sembilan bintang; kalau ada gambar, foto dipotong berbentuk perisai logo. Section guru hanya tampil kalau minimal satu guru punya foto; guru tanpa foto tampil kecil (inisial + nama) di bawah potret. Fasilitas tanpa foto diberi label "Foto fasilitas belum diunggah".
- Foto Kepala Sekolah di sambutan diambil dari `/public/guru` dengan jabatan "Kepala Sekolah" (backend menaruhnya paling depan).
- Agenda di landing: agenda publik bulan ini dan bulan depan yang belum selesai (dibanding tanggal hari ini di Asia/Jakarta), paling banyak 4, disaring per id karena agenda lintas bulan muncul di dua bulan.
- Galeri terbaru: komposisi mengikuti jumlah album (2 kolom sama besar untuk 1–2 album, mosaik untuk 3 atau 5 album).
- Ikon program/keunggulan dari CMS dibatasi ke daftar `IKON_CMS` (28 ikon lucide, kunci kebab-case). Nama di luar daftar tidak ditampilkan. Daftar ini juga menjadi pilihan ikon di CMS Fase 7.
- Peta hanya ditampilkan untuk URL `https` dengan host `www.google.com` atau `maps.google.com`.
- HTML dari CMS/pengumuman dirender apa adanya (`KontenHtml`) karena backend sudah menyanitasinya dengan Purify; gayanya di kelas `.konten-html` (`globals.css`).
- Skeleton `loading.tsx` hanya dipasang di route group `pengumuman/(daftar)` dan `galeri/(daftar)`. Kalau dipasang di level `(public)`, halaman detail sudah mengirim status 200 sebelum `notFound()` dipanggil, sehingga slug yang tidak ada tidak membalas 404.
- Login dipisah (revisi review Fase 2): `/login` halaman pilihan, `/login/wali` (Google), `/login/guru` (email + password). `?next=` dibawa dari halaman pilihan. Semua tautan memakai `RUTE_LOGIN`/`urlLogin()` (`src/lib/auth/rute-login.ts`). Kode `ACCOUNT_PENDING` → `/menunggu-persetujuan`; `ACCOUNT_REJECTED`, `ACCOUNT_INACTIVE`, dan `TOO_MANY_REQUESTS` ditampilkan di atas form dengan pesan dari backend (termasuk alasan penolakan dan lama tunggu); `VALIDATION_ERROR` dipasang ke field.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` kosong → `/login/wali` menampilkan pesan bahwa login Google belum disiapkan sekolah, tanpa memuat script Google.
- Validasi form di browser mengikuti aturan backend (`src/lib/auth/skema.ts`): password minimal 8 karakter berisi huruf dan angka, nomor HP diawali 08 dengan 10–15 angka. Backend tetap pemeriksa akhir.
- Pendaftaran guru, lupa password, dan reset password memanggil backend lewat `/api/proxy` (endpoint publik tanpa token).

## Keputusan Fase 3

- **Kerangka** (`src/components/layout/dashboard/`): sidebar hijau di desktop untuk semua role (bisa diciutkan, pilihan disimpan di cookie `tk_sidebar` dan dibaca server supaya tidak berkedip), sheet menu di HP untuk SA/G, bottom nav di HP untuk wali (Beranda, Tagihan, Kegiatan, Pengumuman, Lainnya). Topbar hijau di HP dan putih di desktop: pemilih anak (W), lonceng notifikasi, menu akun (Profil Saya, Keluar).
- **Menu** dari satu konfigurasi `MENU` di `src/lib/navigation.ts` (grup Utama, Akademik, Keuangan, Sekolah, Website & Pengaturan). Item tampil kalau role cocok atau (untuk item `keuangan`) guru punya `kelola_keuangan`. Item aktif = yang href-nya paling panjang cocok dengan path.
- **Penjaga onboarding di server**: `proxy.ts` menaruh path yang dibuka di header `x-tk-path` untuk semua `/dashboard/*`, lalu layout dashboard mengarahkan wali dengan `profil_lengkap = false` ke `/dashboard/onboarding` sebelum halaman apa pun dirender. Halaman onboarding tampil tanpa menu.
- **Akses per role**: `wajibAkses()` (`src/lib/auth/akses.ts`) di halaman server; yang tidak berhak diarahkan ke `/dashboard?akses=ditolak` lalu `PesanAksesDitolak` menampilkan toast "Anda tidak punya akses ke halaman itu." dan membersihkan URL. Sesi yang ditolak backend diarahkan ke `/api/auth/sesi-habis?next=<path sekarang>`.
- **Anak aktif**: cookie `tk_anak` (ditulis dari browser), dibaca layout server sebagai nilai awal, disimpan di konteks `AnakAktifProvider`. Id yang tidak ada di daftar anak sesi diganti anak pertama. Beranda wali memanggil `GET /dashboard?murid_id=` dengan query key `["dashboard", muridId]`, jadi ganti anak tidak perlu memuat ulang halaman.
- **Data dashboard** diambil di browser lewat React Query (`src/lib/api/dashboard.ts`), dengan kerangka skeleton saat memuat dan `GalatMuat` (pesan + Muat Ulang) saat gagal. Bentuk `data` (anyOf tiga bentuk) dipastikan lewat kunci khas: `statistik` (SA), `kelas_saya` (G), `tagihan_aktif` (W).
- **Notifikasi**: badge `GET /notifikasi/belum-dibaca` diperbarui tiap 60 detik (React Query tidak menjalankan interval di tab latar belakang); popover memuat 6 notifikasi terbaru hanya saat dibuka. Klik notifikasi menandai dibaca lalu membuka `url` dari backend.
- **Query string**: `serialisasiQuery()` (`src/lib/api/query-string.ts`) dipakai client browser dan server. Boolean dikirim `1`/`0` karena validasi `boolean` Laravel menolak `true`/`false` di query string (lihat temuan backend).
- **Beranda wali**: satu hal terpenting adalah kartu tagihan (total belum dibayar besar, tombol "Bayar Sekarang" ke detail tagihan kalau hanya satu, ke daftar kalau lebih). Kartu memerah dengan judul "Ada tagihan yang lewat jatuh tempo" kalau ada status `terlambat`; tagihan `menunggu_verifikasi` diberi catatan bahwa bukti sedang diperiksa. Tanpa tagihan aktif tampil "Semua tagihan ... sudah lunas". Wali tanpa anak tertaut melihat ajakan Tautkan Anak / Daftar PPDB. Di desktop agenda mengisi kolom samping tagihan; di HP agenda paling bawah (urutan B5).
- **Beranda guru**: kartu kelas diampu (jumlah murid menghitung naik) dan kartu "Verifikasi Pembayaran" untuk guru petugas keuangan (`pembayaran_menunggu` bukan null). Progres rapor satu batang per status terhadap `total` (murid aktif), ditambah jumlah yang belum dibuat. "Tagihan Jatuh Tempo Bulan Ini" menampilkan persen lunas dari `keuangan_kelas` (jumlah tagihan, bukan rupiah; hanya dilihat).
- **Beranda Kepala Sekolah**: panel "Perlu Tindakan" di blok hijau (kartu kuning untuk yang jumlahnya lebih dari 0, tautan ke halaman terkait), empat angka statistik, keuangan bulan ini dengan batang persen lunas, grafik pemasukan 12 bulan (Recharts, satu seri berwarna `primary`, tooltip per batang, tabel tersembunyi untuk pembaca layar), pengumuman dan agenda.
- Sapaan beranda memakai "Assalamu'alaikum, {nama}" dan tanggal hari ini (Asia/Jakarta), sesuai sekolah Muslimat NU.
- Foto murid dan foto kegiatan berupa signed URL yang kedaluwarsa, jadi ditampilkan lewat `next/image` dengan `unoptimized` (`FotoProfil`, `KartuAnak`, `KegiatanRingkas`).
- Foto profil dikompres di browser (`browser-image-compression`, maks 1 MB dan sisi 1600 px) lalu dikirim sebagai multipart `PUT /auth/profil` lewat `bodySerializer` openapi-fetch.
- Komponen shadcn `dropdown-menu`, `popover`, `textarea` ditulis manual mengikuti pola shadcn karena `ui.shadcn.com` diblokir kebijakan jaringan container (403).
- `EmptyState` sekarang memakai ilustrasi perisai logo dengan bintang melayang; `StatusBadge`, `KepalaHalaman` (PageHeader), `GalatMuat`, `HalamanKosong` (404/error di dashboard) ditambahkan sebagai komponen bersama.

## Audit data dashboard wali (revisi poin 4)

Setiap data yang tampil ke wali dan halaman Kepala Sekolah yang mengelolanya:

| Data yang dilihat wali | Sumber | Halaman kelola Kepala Sekolah | Fase | Status |
|---|---|---|---|---|
| Nama dan logo sekolah (topbar, sidebar, onboarding) | `profil.nama_sekolah`, `profil.logo` | `/dashboard/website` tab Profil Sekolah | 7 | Endpoint ada |
| Kartu anak: nama lengkap, panggilan, foto, NIS, tanggal lahir, jenis kelamin | `murid` | `/dashboard/murid/[id]` (edit + foto) | 4 | Endpoint ada |
| Kelas anak | `kelas`, `kelas_murid` | `/dashboard/kelas/[id]` (penempatan), `/dashboard/tahun-ajaran` (kenaikan) | 4 | Endpoint ada |
| Hubungan wali dengan anak, kontak utama | `murid_wali` | `/dashboard/murid/[id]` bagian wali | 4 | **Kurang**: SA hanya bisa melepas tautan; hubungan dan kontak utama tidak bisa diubah |
| Tagihan aktif, total belum dibayar, status, jatuh tempo | `tagihan` | `/dashboard/tagihan` (tagihan sekali, generate, batalkan), `/dashboard/keuangan/jenis-tagihan`, `/dashboard/keuangan/keringanan` | 5 | **Kurang**: tagihan tidak bisa diubah; tagihan bulanan yang dibatalkan tidak bisa dibuat ulang untuk bulan yang sama |
| Rekening sekolah di detail tagihan | `keuangan.rekening` | `/dashboard/pengaturan` tab Rekening | 7 | Endpoint ada |
| Riwayat pembayaran, kwitansi | `pembayaran` | `/dashboard/pembayaran` (verifikasi, catat tunai) | 5 | Endpoint ada |
| Kegiatan kelas: judul, tema, deskripsi, tanggal, foto | `kegiatan_kelas`, `kegiatan_foto` | `/dashboard/kegiatan/[id]` (SA boleh mengubah semua) | 6 | **Kurang**: caption dan urutan foto tidak bisa diubah lewat API |
| Pengumuman | `pengumuman` | `/dashboard/pengumuman` (SA semua target, pin, draft) | 6 | Endpoint ada; lampiran belum bisa diunggah (sudah dicatat BE) |
| Agenda sekolah | `agenda` | `/dashboard/agenda` | 6 | Endpoint ada |
| Rapor terbaru dan PDF | `rapor`, `rapor_detail`, `elemen_penilaian` | `/dashboard/rapor` (review, terbitkan, minta revisi), `/dashboard/pengaturan` tab Elemen Penilaian | 6, 7 | **Kurang**: SA tidak bisa mengubah isi rapor buatan guru dan rapor terbit tidak bisa ditarik untuk dibetulkan |
| Info dan status PPDB | `ppdb.*`, `pendaftaran` | `/dashboard/pengaturan` tab PPDB, `/dashboard/ppdb` | 7 | Endpoint ada |
| Notifikasi | dibuat sistem dari aksi di atas | tidak dikelola langsung | | Sesuai desain |
| Banner / teks info khusus di beranda wali | tidak ada | usulan: `/dashboard/website` tab Beranda Wali | 7 | **Butuh endpoint baru** |
| Data wali (alamat, pekerjaan, NIK) | `wali_murid` | `/dashboard/wali-murid` (lihat + status) | 4 | **Kurang**: tidak ada di `GET /auth/me`, jadi wali tidak bisa melihat atau mengubahnya setelah onboarding; SA juga tidak bisa mengubahnya |

Usulan endpoint untuk backend (belum dikerjakan; FE tidak mengubah BE):

1. **Info beranda wali**: kunci pengaturan baru `beranda.info_wali` = `{ aktif: bool, judul: string, isi: string (maks ±500 karakter), nada: "info" | "penting", berlaku_sampai: date | null }`, disimpan lewat `PUT /pengaturan` (grup baru `beranda`), dan ikut di respons `GET /dashboard` wali sebagai `info_sekolah: { judul, isi, nada } | null` (null kalau tidak aktif atau lewat `berlaku_sampai`). Wali tidak perlu akses ke `/pengaturan`.
2. **Ubah tagihan**: `PUT /tagihan/{id}` (K atau SA) `{ jatuh_tempo?, potongan?, catatan? }` untuk status `belum_bayar`/`terlambat`, menghitung ulang `total` dan status terlambat. Atau: `generate` dan `POST /tagihan` membuat ulang tagihan yang sebelumnya `dibatalkan` untuk periode yang sama (unique index `murid_id, jenis_tagihan_id, periode` perlu disesuaikan).
3. **Caption dan urutan foto kegiatan**: `PUT /kegiatan-foto/{id}` `{ caption?, urutan? }` (pembuat, SA), seperti `PUT /galeri-foto/{id}`.
4. **Rapor**: `PUT /rapor/{id}` juga untuk SA saat status `diajukan`, dan `POST /rapor/{id}/tarik` (SA) `{ catatan }` untuk mengembalikan rapor `terbit` ke `revisi` (wali tidak lagi melihatnya sampai terbit ulang).
5. **Tautan wali**: `PATCH /murid/{id}/wali/{wali_murid_id}` (SA) `{ hubungan?, is_kontak_utama? }`.
6. **Data wali**: `GET /auth/me` untuk wali menyertakan `wali_murid.alamat`, `pekerjaan`, `nik`; `PUT /wali/profil` menerima perubahan sebagian; `PUT /wali-murid/{id}` (SA) untuk koreksi data.

## Temuan backend dari Fase 3

- `GET /notifikasi?filter[dibaca]=true|false` ditolak 422 ("Filter.dibaca harus bernilai true atau false."), padahal OpenAPI menulis parameternya `boolean`. Hanya `1`/`0` yang diterima. FE mengirim `1`/`0` lewat `serialisasiQuery()`.
- Di `api.json`, item array yang memakai Resource lewat `allOf` (misalnya `pengumuman_terbaru`, `kegiatan_terbaru`, `tagihan_aktif` di `GET /dashboard`, dan data banyak endpoint daftar) ditulis sebagai `Resource & Record<string, never>` oleh openapi-typescript, sehingga semua field bertipe `never` kalau dibaca dari tipe `operations`. Tipe yang dikembalikan openapi-fetch tidak terpengaruh, jadi FE mengambil tipe dari hasil pemanggilan. Sebaiknya skema tambahan kosong di `allOf` dihapus di Scramble.
- Tiga wali pendaftar PPDB demo memakai email domain sungguhan (`@gmail.com`, `@gmail.co.id`, `@yahoo.co.id`) dari `UserFactory::freeEmail()`, sedangkan wali demo lain memakai `@wali.tkta8.test`. Kalau mailer diaktifkan, email bisa terkirim ke alamat nyata.
- Pesan validasi `current_password` di `PUT /auth/password` berbunyi "Kata sandi salah.", sedangkan label lain di UI dan pesan backend lain memakai "password".

## Temuan kontrak dari `api.json`

Sudah diperbaiki backend (branch `be/fix-openapi`) dan dipakai lewat `npm run gen:api`: tipe `meta` paginasi, bentuk `GET /public/profil`, `kelas.id` number, `MuridResource.wali[]`, dan `rekening` di detail tagihan. `normalisasiMeta()` dan validasi zod profil publik sudah dihapus.

Yang masih berlaku:

- `data` di `GET /dashboard` berupa `anyOf` tiga bentuk tanpa penanda role; bentuknya dipilih lewat role dari sesi.
- Enum `StatusKelasMurid` (A5) tidak diekspor sebagai skema, jadi ditulis manual di `domain.ts`.

## Desain visual

Arah A "Buku Cerita", direvisi setelah review Fase 1–2: bukan minimalis lagi. Hijau logo menjadi warna dominan (navbar, hero, panel login, blok visi-misi, kontak), kuning bintang logo sebagai aksen, dan ornamen diambil dari identitas sekolah.

| Token | Nilai | Kontras | Dipakai untuk |
|---|---|---|---|
| `primary` | `#0D8905` (hijau logo) | putih di atasnya 4,57:1 | blok besar (navbar, hero, panel login, header), tombol utama, teks besar |
| `primary-strong` | `#0A6E04` | di atas `background` 6,10:1; putih 6,47:1 | hover tombol, teks/tautan hijau kecil di latar terang, fokus (`ring`) |
| `primary-deep` | `#07520A` | putih 9,46:1; `bintang` 7,98:1 | footer, blok gelap, tombol di atas kuning |
| `primary-soft` / `primary-soft-strong` | `#E6F4E1` / `#D3EBCB` | `primary-strong` di atasnya 5,67:1 | latar badge, section galeri |
| `highlight` | `#FFE600` | teks `highlight-foreground` `#3A3000` 10,34:1 | tombol CTA kuning, pita PPDB, kartu wali |
| `highlight-soft` / `highlight-strong` | `#FFF8C2` / `#F2D500` | | latar info kuning / hover |
| `bintang` | `#FFF001` (kuning logo) | di atas `primary` 3,85:1 | hanya ornamen dan ikon di atas hijau, bukan teks kecil |
| `background` | `#FBF8F1` | teks `foreground` `#1F2A24` 13,99:1 | latar halaman (krem) |
| `card` | `#FFFFFF` | | kartu |
| `muted-foreground` | `#5F6B63` | 5,25:1 di atas `background` | teks sekunder |
| `border` / `input` | `#E4DFD3` / `#D6D0C2` | | garis |
| `destructive` | `#B42318` | putih 6,57:1 | aksi hapus, status terlambat |

`#0D8905` di atas krem hanya 4,31:1, jadi teks hijau berukuran kecil di latar terang selalu memakai `primary-strong`. `primary` tetap boleh untuk teks besar (judul, angka besar) dan ornamen.

Warna status (`src/lib/constants/status.ts`, token `status-*`): sukses `#0A6E04`/`#E6F4E1`, menunggu `#8A5A00`/`#FDF1D3`, bahaya `#B42318`/`#FDE8E6`, proses `#3E5C76`/`#E6EDF3`, netral `#5F6B63`/`#EEEDE8`. Semua di atas 4,5:1.

### Font

Judul dan tombol **Baloo 2** (500–800), teks **Andika** (400, 700), keduanya lewat `next/font/google`. Pratinjau tiga kandidat ada di `docs/review/font/` (`index.html` dan screenshot `pasangan-*.png`):

| Pasangan | Catatan |
|---|---|
| A. Baloo 2 + Andika (dipakai) | Baloo 2 bulat dan tebal, terasa ramah anak tanpa jadi kartun. Andika dirancang SIL untuk pembaca pemula: bentuk a dan g seperti tulisan tangan di sekolah, l/I/1 dan 0/O mudah dibedakan, tetap jelas di HP. Angka rupiah rata dan tidak bergaya aneh. |
| B. Grandstander + Atkinson Hyperlegible Next | Judul lebih jenaka, tetapi Atkinson memakai angka nol bergaris miring yang terasa teknis untuk nominal rupiah. |
| C. Sour Gummy + Lexend | Paling "permen"; angka Sour Gummy (7, 2) kurang tegas untuk nominal uang di kartu tagihan. |

Andika hanya punya bobot 400 dan 700, jadi `font-semibold` tampil sebagai 700.

### Ornamen dan gerak

- Ornamen (`src/components/shared/ornamen/`): `Bintang` dan `TaburanBintang` (bintang lima sudut dari logo, berkelip atau melayang), `BentukPerisai` (tepi bergelombang delapan lekuk seperti bingkai logo; juga dipakai sebagai mask foto lewat `GAYA_MASKER_PERISAI`), `OrbitLogo` (logo/foto dikelilingi sembilan bintang seperti susunan di logo), `PolaGeometri` (pola bintang delapan khas geometri Islami, tipis di atas hijau), `Sulur` (garis bawah judul yang digambar lalu daunnya tumbuh), `TepiBergelombang` (peralihan antar blok warna).
- Efek muncul lewat `<Muncul efek>` (`src/components/shared/muncul.tsx`, IntersectionObserver lewat callback ref). Efek berbeda per jenis konten: `pop` (kartu program, kontak), `jatuh` (foto galeri dan fasilitas seperti foto cetak), `balik` (kalender agenda), `geser` (misi, pengumuman, keunggulan), `gambar` (sulur). Anak elemen muncul bergiliran 80 ms. Elemen yang sudah terlihat saat dimuat tidak dianimasikan (tanpa kedipan), dan tanpa JavaScript konten tetap tampil.
- `AngkaNaik` menghitung bilangan bulat dari 0 memakai CSS `@property --angka` (tanpa JavaScript); pembaca layar membaca angka aslinya. Tidak dipakai untuk nominal uang.
- Hover/tekan: kartu terangkat dan lurus (`.angkat`, 220 ms), bintang berputar, tombol mengecil sedikit saat ditekan. Kelas gerak dekoratif (`gerak-*`, efek muncul, hitung) hanya aktif di `@media (prefers-reduced-motion: no-preference)`; dengan `reduce`, semua transisi dipendekkan ke 0,01 ms.
- Tidak ada paket animasi tambahan.

### Lainnya

- Skala tipografi 6 ukuran (Tailwind `--text-*` direset): `xs` 12, `sm` 14, `base` 16, `lg` 20, `xl` 28, `2xl` 44 px (sebelumnya 40; Baloo 2 tampak lebih kecil dari Fraunces pada ukuran yang sama).
- Radius: `--radius` 12 px (kartu); `rounded-md` 10 px (tombol, input); `rounded-sm` 6 px.
- Bayangan dua tingkat (`--shadow-*` direset): `shadow-sm`, `shadow-md`.
- Spasi memakai skala bawaan Tailwind (kelipatan 4 px).
- Fokus: outline 2 px warna `ring`.
- Light mode saja; blok `.dark` bawaan shadcn dihapus.
- Logo: `public/logo-tk.png` (512 px, latar transparan, dipotong mengikuti lingkaran) untuk cadangan kalau `profil.logo` di CMS belum diisi. Favicon dari logo yang sama: `src/app/favicon.ico` (16/32/48), `src/app/icon.png` (192), `src/app/apple-icon.png` (180, latar putih).
- Nama sekolah selalu dari `profil.nama_sekolah`. Nilai tetap hanya ada di metadata default `src/app/layout.tsx` sebagai cadangan.

## Peta route

| Route | Akses | Isi |
|---|---|---|
| `/` | publik | Landing: hero, pita PPDB (jika dibuka), profil (sambutan, visi-misi, sejarah), program, keunggulan, fasilitas, guru, galeri terbaru, pengumuman + agenda, kontak + peta. Section yang datanya kosong di CMS tidak ditampilkan. ISR 5 menit. |
| `/pengumuman`, `/pengumuman/[slug]` | publik | Daftar berpaginasi (`?page=`) dan detail pengumuman publik |
| `/galeri`, `/galeri/[slug]` | publik | Daftar album berpaginasi dan detail album dengan lightbox (panah kiri/kanan, Esc) |
| `/ppdb` | publik | Status buka/tutup, jadwal, kuota, sisa kuota, info HTML; tombol ke `/login/wali?next=/dashboard/ppdb` |
| `/login` | publik (sudah masuk → `/dashboard`) | Pilihan "Orang Tua / Wali Murid" atau "Guru & Kepala Sekolah"; `?next=` diteruskan |
| `/login/wali` | publik (sudah masuk → `/dashboard`) | Login Google wali murid |
| `/login/guru` | publik (sudah masuk → `/dashboard`) | Email + password, tautan daftar guru dan lupa password |
| `/daftar-guru`, `/lupa-password`, `/reset-password?token=&email=`, `/menunggu-persetujuan` | publik | Alur akun guru/Kepala Sekolah |
| `/dashboard` | SA, G, W | Beranda per role (B5): SA panel Perlu Tindakan, statistik, keuangan bulan ini, grafik pemasukan; G kelas diampu, progres rapor, tagihan kelas; W kartu anak, kartu tagihan, rapor terbaru, kegiatan, pengumuman, agenda |
| `/dashboard/onboarding` | W (profil belum lengkap) | Lengkapi nomor HP, alamat, pekerjaan, NIK opsional. Tanpa menu; wali yang sudah lengkap diarahkan ke beranda |
| `/dashboard/anak` | W | Kartu anak tertaut + form tautkan anak (kode, tanggal lahir, hubungan) |
| `/dashboard/notifikasi` | SA, G, W | Semua notifikasi berpaginasi (`?page=`), saring belum dibaca (`?belum=true`), tandai semua dibaca |
| `/dashboard/profil` | SA, G, W | Nama, nomor HP, foto profil; ganti password (SA, G) |
| `/dashboard/*` lain | | 404 di dalam kerangka dashboard (`[...lainnya]`); halamannya dibuat di Fase 4–7 |
| `/api/auth/login`, `/api/auth/google`, `/api/auth/logout`, `/api/auth/sesi-habis` | route handler | BFF sesi |
| `/api/proxy/[...path]` | route handler | Proxy ke backend |

Route lain mengikuti B4 dan ditambahkan per fase. `/api/auth/me` tidak dibuat (disetujui di Fase 0): sesi dibaca lewat `/api/proxy/auth/me`. `/api/revalidate` (disetujui di Fase 0) dibuat di Fase 7 bersama penyimpanan CMS; tag cache publik sudah disiapkan di `TAG_PUBLIK` (`src/lib/constants/sekolah.ts`).

Menu sidebar untuk semua route B4 sudah ada sejak Fase 3 (`src/lib/navigation.ts`); tautan ke halaman fase berikutnya menampilkan 404 di dalam dashboard sampai halamannya dibuat.

## Deploy

Tempat deploy belum ditentukan. Syarat yang sudah pasti:

1. **Reverse proxy di depan Next.js wajib**, dan harus menambahkan IP klien ke `X-Forwarded-For` (nginx: `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`). Next.js hanya mengisi header ini dari IP socket kalau request belum membawanya. Tanpa reverse proxy, pengunjung bisa mengirim `X-Forwarded-For` palsu yang lalu diteruskan ke backend, dan rate limit per IP bisa diakali. Laravel memakai IP paling kanan yang bukan proxy tepercaya, yaitu IP yang ditambahkan reverse proxy.
2. **`TRUSTED_PROXIES` di backend** wajib berisi IP server FE (Next.js), ditambah reverse proxy di depan backend kalau ada. Tanpa itu semua pengunjung dihitung sebagai satu IP (IP server FE).
3. **`BE_API_URL`** harus alamat backend yang bisa dibuka browser (bukan hostname jaringan internal), karena host signed URL file private diambil dari request yang diterima backend.
4. HTTPS di produksi: cookie sesi memakai flag `Secure` saat `NODE_ENV=production`.
5. Batas body di reverse proxy minimal 55 MB (unggahan kegiatan 10 foto × 5 MB), sama dengan `post_max_size` backend.

## Changelog

### Fase 3

File baru:

- `src/lib/navigation.ts`: menu per role (B4) dan urutan bottom nav wali.
- `src/lib/auth/{akses,path,anak-aktif}.ts`: `wajibSesi()`, `wajibAkses()`, header path dari proxy, pemilihan anak aktif.
- `src/lib/api/{dashboard,notifikasi,query-string}.ts`, `src/lib/{tagihan,gambar}.ts`, `src/lib/constants/notifikasi.ts`.
- `src/components/layout/dashboard/{shell-dashboard,sidebar,daftar-menu,menu-hp,bottom-nav-wali,menu-pengguna,anak-switcher,anak-aktif,notifikasi-bell,pesan-akses-ditolak}.tsx`.
- `src/components/features/beranda/`: `sapaan-beranda`, `panel-beranda`, `daftar-ringkas`, `kegiatan-ringkas`, `kartu-angka`, `wali/{beranda-wali,kartu-anak,kartu-tagihan,kartu-rapor}`, `guru/{beranda-guru,progres-rapor}`, `kepala-sekolah/{beranda-kepala-sekolah,perlu-tindakan,grafik-pemasukan}`.
- `src/components/features/wali/{form-onboarding,form-tautkan-anak,daftar-anak}.tsx`, `src/components/features/profil/{form-profil,form-ganti-password}.tsx`, `src/components/features/notifikasi/{item-notifikasi,daftar-notifikasi}.tsx`, `src/components/features/auth/use-keluar.ts` (pengganti `tombol-keluar.tsx`).
- `src/components/shared/{kepala-halaman,status-badge,galat-muat,foto-profil,halaman-kosong}.tsx`.
- `src/components/ui/{dropdown-menu,popover,textarea}.tsx`: ditulis manual mengikuti pola shadcn.
- `src/app/dashboard/{onboarding,anak,notifikasi,profil}/page.tsx`, `[...lainnya]/page.tsx`, `not-found.tsx`, `error.tsx`, `loading.tsx`.
- `docs/review/fase-3/*.png`: screenshot beranda wali (HP viewport, HP penuh, desktop, tanpa anak), guru (desktop, HP), Kepala Sekolah (desktop, HP), Anak Saya, Notifikasi.

File yang diubah:

- `src/proxy.ts`: header `x-tk-path` untuk `/dashboard/*`.
- `src/app/dashboard/layout.tsx`: sesi, penjaga onboarding, cookie sidebar dan anak aktif, kerangka dashboard. `src/app/dashboard/page.tsx`: beranda per role.
- `src/lib/api/{client,server}.ts`: `querySerializer`. `src/lib/api/query-keys.ts`: key dashboard, anak wali, notifikasi. `src/lib/auth/cookies.ts`: `tk_sidebar` dan penulis cookie preferensi. `src/lib/auth/skema.ts`: NIK opsional. `src/types/domain.ts`: alias Resource yang dipakai.
- `src/components/shared/{empty-state,kolom-teks}.tsx`: ilustrasi keadaan kosong, `KolomArea`. `src/app/globals.css`: animasi batang `gerak-tumbuh`.

Pengujian Fase 3 (dev server lalu `next start` ke backend lokal, Chromium headless lewat Playwright; token Kepala Sekolah dan guru dari `POST /auth/login`, token wali dari Tinker):

- `lint`, `typecheck`, `build`, `check:slop` bersih.
- Menu sidebar yang tampil: Kepala Sekolah 22 item (semua grup); guru petugas keuangan: Beranda, Notifikasi, Kelas, Murid, Kegiatan Kelas, Rapor, Pengumuman, Agenda, Tagihan, Pembayaran, Keringanan, Laporan Keuangan, Tunggakan; guru biasa: sampai Tagihan saja; wali: Beranda, Anak Saya, Notifikasi, Kegiatan Kelas, Rapor, Pengumuman, Agenda, Tagihan, Pembayaran, PPDB.
- Onboarding: wali `profil_lengkap = false` yang membuka `/dashboard/tagihan` diarahkan ke `/dashboard/onboarding`; kirim kosong → "Alamat wajib diisi.", "Pekerjaan wajib diisi."; NIK 5 angka → pesan NIK; data benar → toast "Profil tersimpan. Selamat datang!" dan pindah ke beranda.
- Tautkan anak (kode demo): kode salah → "Kode tautan tidak ditemukan..." dari backend di field kode; tanggal lahir salah → "Tanggal lahir tidak cocok..." di field tanggal; data benar → toast, kartu anak muncul, beranda langsung menampilkan anak itu, dan Kepala Sekolah menerima notifikasi "Wali murid baru tertaut" (badge 1, muncul di popover dan halaman notifikasi).
- Ganti anak aktif lewat pemilih di topbar: beranda berganti dari Prakosa ke Ika tanpa muat ulang, dan tetap Ika setelah halaman dimuat ulang (cookie).
- Profil: nomor HP salah → pesan field; simpan → toast, foto profil (JPEG dikompres) terunggah (`avatar_url` baru) dan langsung tampil di form dan topbar. Ganti password dengan password lama salah → pesan backend di field password lama.
- Kepala Sekolah membuka `/dashboard/anak` → kembali ke `/dashboard` dengan toast "Anda tidak punya akses ke halaman itu."; `/dashboard/tidak-ada` → 404 di dalam kerangka dashboard.
- Belum diuji: login Google sungguhan (tanpa `GOOGLE_CLIENT_ID`), notifikasi di wali/guru (data demo tidak punya notifikasi untuk mereka), ganti password yang berhasil (sengaja tidak dijalankan supaya akun demo tetap `guru2026`), tampilan dengan foto murid (data demo tanpa foto), pembaca layar, Safari/Firefox. Tautan kartu ke halaman fase 4–7 (kegiatan, pengumuman, tagihan, rapor) masih 404.

### Revisi setelah review Fase 1–2

File baru:

- `src/app/(auth)/login/wali/page.tsx`, `src/app/(auth)/login/guru/page.tsx`: halaman login per jenis akun.
- `src/components/features/auth/{ilustrasi-login,kembali-ke-pilihan}.tsx`: ilustrasi kartu pilihan login (orang tua menggandeng anak, buku terbuka dari logo) dan tautan kembali.
- `src/lib/auth/rute-login.ts`: `RUTE_LOGIN` dan `urlLogin()`.
- `src/components/shared/ornamen/{bintang,perisai,orbit-logo,pola-geometri,sulur,tepi-bergelombang}.tsx`, `src/components/shared/{muncul,angka-naik}.tsx`: ornamen dan gerak.
- `docs/review/font/`: pratinjau tiga pasangan font. `docs/review/fase-2-revisi/`: screenshot landing (desktop, HP), `/login`, `/login/wali`, `/login/guru`.

File yang diubah:

- `src/types/api.d.ts`: generate ulang dari `api.json` backend yang sudah diperbaiki. `src/lib/api/pengaturan.ts` membaca tipe hasil generate (zod dihapus); `src/lib/api/pagination.ts` dihapus; `src/lib/api/publik.ts` memakai `meta` apa adanya.
- `package-lock.json`: disinkronkan dengan npm 11 (`npm ci` gagal karena `@emnapi/core` dan `@emnapi/runtime` tidak tercatat). Versi paket langsung tidak berubah.
- `src/app/globals.css`: token warna baru, font, skala `2xl`, kelas gerak dan keyframe. `src/app/layout.tsx`: Baloo 2 + Andika, `themeColor` hijau logo.
- `src/components/ui/button.tsx`: font Baloo 2, varian `terang` (garis putih di atas hijau), efek tekan. `src/components/ui/field.tsx` dan tautan di form auth serta halaman publik: `text-primary-strong` untuk teks hijau kecil.
- `src/app/(auth)/layout.tsx`, `login/page.tsx`: panel hijau dengan pola, bintang, dan logo berorbit; di HP diganti pita hijau bertepi gelombang. `tab-login.tsx` dihapus.
- `src/proxy.ts`, `src/app/api/auth/sesi-habis/route.ts`, `src/components/providers.tsx`, `src/components/features/auth/{tombol-keluar,form-*}.tsx`, `menunggu-persetujuan/page.tsx`, `ppdb/page.tsx`, navbar, footer: tautan dan redirect ke login baru.
- `src/components/features/landing/*`, `src/components/shared/{judul-bagian,judul-halaman,blok-tanggal}.tsx`, `src/components/layout/publik/*`, `src/lib/format.ts` (`rentangTanggal`): tampilan landing dan halaman publik (lihat "Ornamen dan gerak").
- `PROMPT_FE_TK.md`: B8 dan C7 (aturan gerak dan warna baru), B4 (login terpisah), sapaan "Anda".

Pengujian revisi (`next start` ke backend lokal di container cloud, Chromium headless lewat Playwright):

- `lint`, `typecheck`, `build`, `check:slop` bersih.
- Tanpa cookie ke `/dashboard/tagihan` → 307 `/login?next=%2Fdashboard%2Ftagihan`. Dengan cookie ke `/login`, `/login/wali`, `/login/guru` → 307 `/dashboard`. `/login?next=/dashboard/ppdb` menautkan ke `/login/wali?next=%2Fdashboard%2Fppdb` dan `/login/guru?next=...`; `?next=//evil.com` diganti `/dashboard`.
- Screenshot desktop 1440 px dan HP 390 px diambil setelah halaman digulir sampai bawah (supaya efek muncul selesai).
- Belum diuji: tampilan dengan foto guru, gambar hero, dan fasilitas dari CMS (data demo kosong); perilaku di Safari dan Firefox (hanya Chromium di container).
- `prefers-reduced-motion` diemulasikan di Chromium: dengan `reduce`, tidak ada elemen `data-siap` (isi di bawah layar tetap opacity 1) dan animasi bintang `none`; dengan `no-preference`, 6 grup di bawah layar menunggu (opacity 0) dan bintang berkelip.

### Fase 2

File baru:

- `src/app/(public)/layout.tsx`, `page.tsx`, `error.tsx`, `not-found.tsx`, `pengumuman/(daftar)/{page,loading}.tsx`, `pengumuman/[slug]/page.tsx`, `galeri/(daftar)/{page,loading}.tsx`, `galeri/[slug]/page.tsx`, `ppdb/page.tsx`: halaman publik.
- `src/app/(auth)/layout.tsx`, `login/page.tsx`, `daftar-guru/page.tsx`, `lupa-password/page.tsx`, `reset-password/page.tsx`, `menunggu-persetujuan/page.tsx`: halaman auth.
- `src/app/not-found.tsx`: 404 untuk URL di luar layout publik.
- `src/components/layout/publik/{navbar-publik,menu-publik-hp,footer-publik,tautan-publik}`: navbar (sheet di HP), footer.
- `src/components/features/landing/{hero,pita-ppdb,profil-sekolah,program,keunggulan,fasilitas,daftar-guru,galeri-terbaru,pengumuman-agenda,kontak}.tsx`: section landing, masing-masing dengan komposisi sesuai isinya.
- `src/components/features/galeri/grid-foto-galeri.tsx`: grid foto + lightbox.
- `src/components/features/auth/{tab-login,form-login-guru,masuk-google,form-daftar-guru,form-lupa-password,form-reset-password}.tsx`.
- `src/components/shared/{judul-bagian,judul-halaman,konten-html,avatar-inisial,logo-sekolah,kotak-pesan,empty-state,paginasi-tautan,blok-tanggal,kolom-teks}.tsx`.
- `src/components/ui/{input,label,tabs,sheet,dialog,skeleton,radio-group,field,separator}.tsx`: dari shadcn, disesuaikan (input 44 px, tab 44 px, radio 20 px, overlay tanpa blur, label "Tutup", kelas dark mode dibuang).
- `src/lib/api/{publik,pengaturan}.ts`, `src/lib/auth/{masuk,skema}.ts`, `src/lib/constants/{sekolah,ikon-cms}.ts`, `src/lib/{tanggal,html,halaman}.ts`.
- `docs/review/fase-2/*.png`: screenshot untuk review desain.

File yang diubah:

- `src/app/page.tsx` dihapus (diganti `src/app/(public)/page.tsx`).
- `src/app/globals.css`: gaya `.konten-html`.
- `src/components/ui/button.tsx`: warna border dan ukuran teks dipindah ke varian supaya `buttonVariants()` yang dipakai langsung di `Link` tidak membawa kelas yang bertabrakan.
- `src/app/dashboard/page.tsx`: sapaan "Anda".

Pengujian Fase 2 (`next start` ke backend lokal, browser Firefox 155 headless lewat WebDriver BiDi):

- Semua route publik dan auth membalas 200; `/tidak-ada`, `/pengumuman/tidak-ada`, `/galeri/tidak-ada` membalas 404.
- Form login guru di browser: field kosong → "Email wajib diisi."; password salah → pesan backend di field email; akun `pending` → pindah ke `/menunggu-persetujuan`; akun benar → `/dashboard` menampilkan nama guru. Tombol Keluar → `/login`, cookie `tk_role` hilang.
- Daftar guru: validasi browser menampilkan enam pesan field; email yang sudah dipakai → "Email sudah digunakan." dari backend di field email. Pendaftaran baru tidak dikirim supaya tidak menambah data di backend.
- Lupa password dengan email tidak terdaftar → pesan netral. Reset dengan token palsu → pesan backend dan tautan ke lupa password.
- Lightbox galeri terbuka dengan klik, menampilkan caption dan tombol sebelumnya/berikutnya. Menu HP terbuka lewat tombol.
- Screenshot desktop 1440 px dan HP 390 px ada di `docs/review/fase-2/`.
- Belum diuji: login Google (tidak ada `GOOGLE_CLIENT_ID`), tampilan dengan sambutan, fasilitas, keunggulan, logo, gambar hero, dan peta dari CMS (kosong di data demo), tampilan dengan foto guru (data demo tanpa foto). Pembaca layar belum dicoba; yang sudah dipastikan: label form terhubung ke input, pesan error terhubung lewat `aria-describedby`, tautan "Lewati ke konten", fokus terlihat.

### Fase 1

File baru:

- `package.json`, `package-lock.json`, `.nvmrc`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, `.gitignore`: kerangka dari `create-next-app@16.3.6` dan `shadcn init` (Radix, preset Nova), versi paket dipasang persis (tanpa `^`). ESLint menambah `no-explicit-any`, `no-non-null-assertion`, dan `no-console` (kecuali `error`/`warn`) sebagai error. `next.config.ts` membaca `BE_API_URL` untuk `remotePatterns` dan hanya membuka `dangerouslyAllowLocalIP` kalau backend berjalan di localhost.
- `AGENTS.md`: blok aturan agen bawaan Next.js 16. Di-commit karena `next dev` menulisnya ulang kalau hilang.
- `.env.example`: daftar variabel.
- `scripts/gen-api.mjs`: generate tipe dari `API_SPEC_PATH`, berhenti dengan pesan jelas kalau kosong atau file tidak ada.
- `scripts/check-slop.sh`: pemeriksaan C6 (emoji, sisa debug, placeholder, pembungkam checker, kata terlarang C3). Sudah diuji dengan file berisi semua pelanggaran (terdeteksi, keluar dengan kode 1).
- `src/types/api.d.ts` (generate), `src/types/domain.ts`: alias tipe skema, `KodeError`, `ResponsError`, `MetaPaginasi`, `StatusKelasMurid`.
- `src/app/globals.css`: token warna, font, skala tipografi, radius, bayangan (lihat "Desain visual").
- `src/app/layout.tsx`: font, metadata cadangan, `lang="id"`, Providers.
- `src/app/page.tsx`: halaman sementara berisi nama sekolah dari CMS (diganti landing di Fase 2).
- `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png`, `public/logo-tk.png`, `public/logo-tk-asli.jpeg`: logo dan favicon.
- `src/app/api/auth/{login,google,logout,sesi-habis}/route.ts`, `src/app/api/proxy/[...path]/route.ts`: BFF.
- `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/components/features/auth/tombol-keluar.tsx`: dashboard sementara untuk membuktikan login sampai dashboard.
- `src/proxy.ts`: route guard.
- `src/components/providers.tsx`: React Query, nuqs, sonner.
- `src/components/ui/button.tsx`: dari shadcn, disesuaikan (tinggi 40/32/48 px, radius 10 px, varian `highlight` kuning, hover memakai token, transisi warna 150 ms).
- `src/lib/api/{be,server,client,ambil-data,errors,pagination,query-keys}.ts`, `src/lib/auth/{cookies,sesi-cookie,bff,session,role,use-session,redirect}.ts`, `src/lib/format.ts`, `src/lib/constants/{label,status}.ts`, `src/lib/utils.ts` (dari shadcn).

Pengujian Fase 1 (server `next start` ke backend lokal dengan data demo):

- Login guru demo lewat `/api/auth/login`: 200, respons tanpa token, cookie `tk_token` HttpOnly + `tk_role`, keduanya SameSite=Lax, 30 hari.
- `/dashboard` dengan cookie menampilkan nama dan role; `/api/proxy/auth/me` membalas data guru beserta kelas diampu.
- Tanpa cookie ke `/dashboard/tagihan` → 307 ke `/login?next=%2Fdashboard%2Ftagihan`; dengan cookie ke `/login` → 307 ke `/dashboard`.
- Password salah → 422 `VALIDATION_ERROR` dengan pesan di field `email`; akun `pending` → 403 `ACCOUNT_PENDING`.
- POST ke proxy dengan `Origin` asing → 403. Endpoint tidak ada → 404 dari backend.
- `X-Forwarded-For`: enam login gagal dengan email yang sama dari IP `203.0.113.10` → yang keenam 429 (`Retry-After: 60`); email yang sama dari `203.0.113.11` tetap 422. Jadi backend (`TRUSTED_PROXIES=127.0.0.1,::1`) memakai IP yang diteruskan FE.
- Logout: 200, cookie terhapus, `/dashboard` kembali redirect ke login.
- Belum diuji: login Google (`GOOGLE_CLIENT_ID` belum ada), unggahan multipart lewat proxy (diuji saat fitur unggah dibuat).
