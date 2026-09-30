# Dokumentasi Frontend TK Tarbiyathul Athfal 8

Website publik dan dashboard sistem informasi TK Tarbiyathul Athfal 8 (TK Muslimat NU Kota Semarang). Acuan desain dan kontrak API: `PROMPT_FE_TK.md`. Backend Laravel ada di repo terpisah (`../TK_TA8_BE`), dengan dokumentasi di `../TK_TA8_BE/dokumentasi.md`.

## Status

| Fase | Status |
|---|---|
| 0. Analisis | Selesai, rencana disetujui (Arah desain A "Buku Cerita") |
| 1. Fondasi | Selesai |
| 2. Publik & auth | Selesai; revisi setelah review (login terpisah, warna, font, gerak) menunggu review |
| Penyesuaian login wali NIS (sebelum Fase 4) | Selesai |
| 3. Shell dashboard | Selesai (review Fase 3 tanpa revisi) |
| 4. Master data | Selesai, disetujui (perbaikan setelah review: lihat "Review Fase 4–5") |
| 5. Keuangan | Selesai, disetujui (perbaikan setelah review: lihat "Review Fase 4–5") |
| 6. Akademik & komunikasi | Selesai, disetujui (lihat "Review Fase 6–7") |
| 7. PPDB, CMS, pengaturan | Selesai, disetujui (lihat "Review Fase 6–7") |
| 8. Integrasi & polish | Selesai, menunggu review (lihat "Review Fase 8") |
| Login terpisah (endpoint auth baru backend) | Selesai, menunggu review (lihat "Keputusan login terpisah") |
| Area `/mudarris` untuk guru dan Kepala Sekolah | Selesai, menunggu review (lihat "Keputusan area /mudarris") |
| Login Google staff, guru tanpa pendaftaran mandiri (branch `fe/login-google-staff`) | Selesai, menunggu review (lihat "Keputusan login Google staff"); butuh backend branch `be/login-google-staff` |

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
| @tiptap/react, @tiptap/starter-kit, @tiptap/pm | 3.31.3 | |
| date-fns | 4.4.0 | |
| sonner | 2.0.8 | |
| browser-image-compression | 2.0.2 | |
| lucide-react | 1.48.0 | |
| eslint, eslint-config-next | 9.39.5, 16.3.6 | |
| server-only | 0.0.1 | penanda modul yang hanya boleh diimpor di server |

## Instalasi dan menjalankan

Prasyarat: Node.js 24, backend berjalan (default `http://localhost:8000`). `npm run build` tetap berhasil kalau backend mati (lihat Keputusan Fase 8).

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
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | browser (tombol Google di `/mudarris/login`) | Client ID OAuth jenis Web application, sama dengan `GOOGLE_CLIENT_ID` backend. Dibaca saat build, jadi build ulang setelah mengubahnya. Kosong → tombol Google diganti pesan, login password Kepala Sekolah tetap bisa dipakai. |

## Arsitektur

### Autentikasi (BFF)

- Browser tidak pernah memegang token. `POST /api/auth/staff/google` (ID token Google `credential`, ke backend `/auth/staff/google`), `POST /api/auth/staff/login` (email + password Kepala Sekolah, ke `/auth/staff/login`), dan `POST /api/auth/wali/login` (NIS anak, ke `/auth/wali/login`) meneruskan body ke backend (ditambah `perangkat: "web"`), lalu menyimpan token di cookie `tk_token` (httpOnly, `secure` di produksi, sameSite lax, 30 hari) dan `tk_role` (bukan httpOnly, hanya nama role). Cookie hanya dipasang kalau `user.role` milik endpoint itu (`super_admin`/`guru` untuk Google, `super_admin` untuk login password staff, `wali_murid` untuk wali). Respons ke browser berisi `user` tanpa token; header `Retry-After` dari 429 ikut diteruskan.
- Tujuan setelah masuk (`tujuanSetelahMasuk()`): `wajib_ganti_password` → `/dashboard/ganti-password`; wali dengan `profil_lengkap = false` → `/dashboard/onboarding`; selain itu `?next=` atau beranda role (`/dashboard` untuk wali, `/mudarris` untuk guru dan Kepala Sekolah).
- `POST /api/auth/logout` memanggil `/auth/logout` backend lalu menghapus `tk_token`, `tk_role`, `tk_anak`. Cookie tetap dihapus walau backend tidak bisa dihubungi. Browser lalu dimuat ulang penuh ke halaman login sesuai role (`ruteLogin()`).
- `GET /api/auth/sesi-habis?next=` menghapus cookie lalu redirect ke halaman login sesuai `tk_role` (`/mudarris/login` untuk guru dan Kepala Sekolah, selain itu `/login`) dengan `?next=`. Dipakai layout dashboard saat `/auth/me` menolak token, karena Server Component tidak bisa menghapus cookie.
- `/api/proxy/[...path]` meneruskan method, query, header `Content-Type`/`Content-Length`, dan body (stream, termasuk multipart dan PUT multipart) ke `{BE_API_URL}/...` dengan `Authorization: Bearer` dari cookie. Respons diteruskan sebagai stream beserta `Content-Type`, `Content-Disposition`, `Cache-Control`, `Retry-After`, dan header rate limit. Backend membalas 401 → cookie sesi dihapus.
- Request yang mengubah data (selain GET/HEAD) ke `/api/proxy` dan `/api/auth/*` ditolak 403 kalau header `Origin` bukan host FE sendiri.
- Segmen path `.` dan `..` di proxy ditolak supaya tidak bisa keluar dari prefix `/api/v1`.
- Backend tidak bisa dihubungi → 502 dengan bentuk error A7 (`code: SERVER_ERROR`), penyebabnya dicatat di log server.

### Penerusan IP klien

Rate limit backend dihitung per IP klien. Semua route handler yang memanggil backend (`/api/proxy`, `/api/auth/*`) meneruskan rantai `X-Forwarded-For` dari request masuk apa adanya (`headerKeBackend()` di `src/lib/api/be.ts`). Next.js mengisi header ini dengan IP socket hanya kalau request masuk belum membawanya.

`X-Forwarded-Host` dan `X-Forwarded-Proto` sengaja tidak diteruskan: backend membentuk signed URL `GET /media/{token}` dari host request, dan URL itu harus tetap menunjuk host backend.

Request dari Server Component ke endpoint publik (landing, ISR) tidak membawa `X-Forwarded-For` karena hasilnya di-cache dan dipakai bersama; backend menghitungnya sebagai IP server FE.

### Route guard

- `src/proxy.ts` (matcher `/dashboard/:path*`, `/mudarris/:path*`, `/login`): wali murid di `/dashboard/*`, guru dan Kepala Sekolah di `/mudarris/*`. Tanpa cookie `tk_token`: `/dashboard/*` → `/login?next=...`, `/mudarris/*` → `/mudarris/login?next=...`; halaman akun (`/mudarris/login`, `/lupa-password`, `/reset-password`) tetap terbuka. Sudah punya cookie buka `/login` atau `/mudarris/login` → beranda sesuai `tk_role`. `tk_role` staff membuka `/dashboard/x` → `/mudarris/x` (tautan notifikasi yang tersimpan sebelum area dipisah, bookmark); `tk_role` wali membuka `/mudarris/*` → `/dashboard?akses=ditolak`. Kedua halaman login `force-dynamic` supaya tidak diambil dari cache browser tanpa melewati proxy. `/api` sengaja tidak dicocokkan karena proxy Next.js membatasi body 10 MB (`proxyClientMaxBodySize`), sedangkan unggahan kegiatan bisa lebih besar.
- `src/app/dashboard/layout.tsx` (wali) dan `src/app/mudarris/layout.tsx` (guru, Kepala Sekolah) memanggil `ambilSesi()` (`GET /auth/me`, di-cache per request) dan memeriksa role sebenarnya: staff di `/dashboard` → `/mudarris`, wali di `/mudarris` → `/dashboard?akses=ditolak`. Token ditolak (401 atau `ACCOUNT_*`) → `/api/auth/sesi-habis`. Di dalam `/mudarris`, halaman khusus Kepala Sekolah atau petugas keuangan memakai `wajibAkses()` (→ `/mudarris?akses=ditolak`). Urutan wajib wali: `wajib_ganti_password` → semua path selain `/dashboard/ganti-password` diarahkan ke sana; lalu `profil_lengkap = false` → `/dashboard/onboarding`. Kedua halaman itu tampil tanpa menu (`KerangkaTanpaMenu`).
- Layout tidak dirender ulang saat navigasi di browser, jadi `Providers` juga menangani `PASSWORD_WAJIB_DIGANTI` dari query/mutation mana pun dengan mengarahkan ke `/dashboard/ganti-password`.
- Halaman `/mudarris` ada di route group `(halaman)` bersama `loading.tsx`; `[...lainnya]` ada di luarnya. Alamat yang tidak dikenal (termasuk `/mudarris/daftar` dan `/mudarris/menunggu-persetujuan` yang sudah dihapus) membalas 404 sungguhan di dalam kerangka untuk pengguna yang sudah masuk, karena respons di bawah loading boundary sudah di-stream sebagai 200 sebelum `notFound()` dipanggil. `/dashboard` belum diubah (alamat tak dikenal masih 200 dengan isi halaman 404).
- Otorisasi sebenarnya tetap di backend.

### Data fetching

- Browser: `api` (`src/lib/api/client.ts`), openapi-fetch dengan `paths` dari `api.d.ts` dan `baseUrl: "/api/proxy"`. `ambilData()` mengubah hasilnya menjadi data atau melempar `ApiError`.
- Server Component: `apiServer({ token, revalidate, tags })` (`src/lib/api/server.ts`). Opsi cache Next.js dipasang lewat `fetch` kustom, karena openapi-fetch membungkus request dalam objek `Request` dan opsi `next` di dalamnya tidak terbaca fetch Next.js.
- React Query: `staleTime` 60 detik (jauh di bawah masa berlaku signed URL 30 menit), tidak mencoba ulang error 4xx. Error 401 di query atau mutation mana pun mengosongkan cache lalu mengarahkan ke halaman login sesuai role sesi (dibaca dari `['me']` sebelum cache dikosongkan) dengan `?next=`.
- Sesi di React Query dengan key `['me']`, diisi dari server lewat `HydrationBoundary` di layout dashboard. `useSession()` → `{ user, role, isSuperAdmin, isGuru, isWali, bisaKelolaKeuangan, beranda }`; `beranda` (`/dashboard` atau `/mudarris`) dipakai komponen kerangka (sidebar, topbar, menu) untuk membentuk tautan.
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
- Login dipisah (revisi review Fase 2; diganti lagi, lihat "Keputusan login terpisah"): `/login` halaman pilihan, `/login/wali` (NIS anak + password, sejak penyesuaian sebelum Fase 4; sebelumnya Google), `/login/guru` (email + password). `?next=` dibawa dari halaman pilihan. Semua tautan memakai `RUTE_LOGIN`/`urlLogin()` (`src/lib/auth/rute-login.ts`). Kode `ACCOUNT_PENDING` → `/menunggu-persetujuan`; `ACCOUNT_REJECTED`, `ACCOUNT_INACTIVE`, dan `TOO_MANY_REQUESTS` ditampilkan di atas form dengan pesan dari backend (termasuk alasan penolakan dan lama tunggu); `VALIDATION_ERROR` dipasang ke field.
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
- **Query string**: `serialisasiQuery()` (`src/lib/api/query-string.ts`) dipakai client browser dan server. Array dikirim `kunci[]=`, nilai kosong (`undefined`, `null`, string kosong) tidak dikirim. Boolean dikirim `true`/`false` apa adanya (backend menerimanya sejak revisi audit).
- **Beranda wali**: satu hal terpenting adalah kartu tagihan (total belum dibayar besar, tombol "Bayar Sekarang" ke detail tagihan kalau hanya satu, ke daftar kalau lebih). Kartu memerah dengan judul "Ada tagihan yang lewat jatuh tempo" kalau ada status `terlambat`; tagihan `menunggu_verifikasi` diberi catatan bahwa bukti sedang diperiksa. Tanpa tagihan aktif tampil "Semua tagihan ... sudah lunas". Wali tanpa anak tertaut melihat ajakan Tautkan Anak / Daftar PPDB. Di desktop agenda mengisi kolom samping tagihan; di HP agenda paling bawah (urutan B5).
- **Beranda guru**: kartu kelas diampu (jumlah murid menghitung naik) dan kartu "Verifikasi Pembayaran" untuk guru petugas keuangan (`pembayaran_menunggu` bukan null). Progres rapor satu batang per status terhadap `total` (murid aktif), ditambah jumlah yang belum dibuat. "Tagihan Jatuh Tempo Bulan Ini" menampilkan persen lunas dari `keuangan_kelas` (jumlah tagihan, bukan rupiah; hanya dilihat).
- **Beranda Kepala Sekolah**: panel "Perlu Tindakan" di blok hijau (kartu kuning untuk yang jumlahnya lebih dari 0, tautan ke halaman terkait), empat angka statistik, keuangan bulan ini dengan batang persen lunas, grafik pemasukan 12 bulan (Recharts, satu seri berwarna `primary`, tooltip per batang, tabel tersembunyi untuk pembaca layar), pengumuman dan agenda.
- Sapaan beranda memakai "Assalamu'alaikum, {nama}" dan tanggal hari ini (Asia/Jakarta), sesuai sekolah Muslimat NU.
- Foto murid dan foto kegiatan berupa signed URL yang kedaluwarsa, jadi ditampilkan lewat `next/image` dengan `unoptimized` (`FotoProfil`, `KartuAnak`, `KegiatanRingkas`).
- Foto profil dikompres di browser (`browser-image-compression`, maks 1 MB dan sisi 1600 px) lalu dikirim sebagai multipart `PUT /auth/profil` lewat `bodySerializer` openapi-fetch.
- Komponen shadcn `dropdown-menu`, `popover`, `textarea` ditulis manual mengikuti pola shadcn karena `ui.shadcn.com` diblokir kebijakan jaringan container (403).
- `EmptyState` sekarang memakai ilustrasi perisai logo dengan bintang melayang; `StatusBadge`, `KepalaHalaman` (PageHeader), `GalatMuat`, `HalamanKosong` (404/error di dashboard) ditambahkan sebagai komponen bersama.

## Keputusan Fase 4

- **Tabel**: `TabelData` (`src/components/shared/tabel-data.tsx`) memakai `@tanstack/react-table` dengan paginasi dari backend (`manualPagination`). Di bawah `md` tiap baris dirender lewat prop `kartu` (B8: tabel menjadi kartu di HP). Saringan, pencarian, dan halaman disimpan di query string lewat `nuqs` (`?status=`, `?cari=`, `?kelas=`, `?page=`); mengubah saringan mengembalikan ke halaman 1.
- `react-hooks/incompatible-library` dimatikan di `eslint.config.mjs`: aturan itu hanya memberi tahu React Compiler melewati komponen yang memakai `useReactTable`, dan React Compiler tidak diaktifkan.
- **Konfirmasi**: semua aksi yang sulit dibatalkan (hapus, tolak, nonaktifkan, reset password, pindah kontak utama, keluarkan murid, simpan kenaikan) lewat `DialogKonfirmasi`. Error backend (misalnya `BUSINESS_RULE` saat menghapus tahun ajaran yang sudah dipakai) tampil di dalam dialog, bukan toast, supaya alasan terbaca.
- **Multipart** (guru, murid): isian teks kosong dikirim `""` (Laravel `ConvertEmptyStringsToNull` menjadikannya null, jadi bisa mengosongkan), `null` tidak dikirim sama sekali (foto hanya dikirim kalau diganti), boolean `1`/`0` (`keFormData`).
- **Guru**: tab status `aktif`, `pending` (dengan jumlah dari `meta.total`), `nonaktif`, dan `ditolak` (B4 hanya menyebut tiga; guru ditolak perlu terlihat untuk melihat alasannya). Profil guru Kepala Sekolah dikenali dari `user.role = super_admin`: aksi status disembunyikan dan `bisa_kelola_keuangan` tidak dikirim. `password_awal` dari `POST /guru` hanya disimpan di state halaman dan hilang saat halaman ditinggalkan.
- **Kelas**: pilihan wali kelas/pendamping = guru aktif (`GET /guru`) ditambah profil guru Kepala Sekolah dari sesi (`user.guru`), karena profil itu tidak ada di `GET /guru`. Guru hanya melihat daftar kelas yang diampu tanpa saringan tahun ajaran.
- **Kenaikan kelas** (`/dashboard/tahun-ajaran/kenaikan`): murid dengan `status_kelas = aktif` di tiap kelas tahun ajaran asal. Saran awal dihitung tanpa disimpan (`saranPenempatan`), hanya perubahan pengguna yang disimpan di state, jadi ganti tahun ajaran tujuan langsung memperbarui saran. Tombol simpan nonaktif selama ada murid naik/tinggal tanpa kelas tujuan.
- **Kartu akun**: `GET /murid/{id}/kartu-akun` diambil sebagai Blob; "Unduh" menyimpan `kartu-akun-<NIS>.pdf`, "Cetak" membuka PDF di tab baru (tab dibuka sebelum permintaan supaya tidak diblokir sebagai pop-up, lalu ditutup lagi kalau gagal). Penolakan `BUSINESS_RULE` ditampilkan apa adanya di kartu.
- **Wali murid**: `PUT /wali-murid/{id}` hanya mengirim field yang berubah. Nomor HP, alamat, dan pekerjaan wajib kalau sebelumnya sudah terisi, boleh tetap kosong untuk akun otomatis yang belum onboarding. Dialog reset password menyebut anak yang tanggal lahirnya menjadi password (kontak utama pertama); wali yang bukan kontak utama diberi keterangan bahwa backend akan menolak.
- **Banner beranda wali** ada di `/dashboard/pengaturan` (satu-satunya bagian di halaman itu sampai Fase 7). `GET /pengaturan` bertipe objek bebas, jadi `beranda.info_wali` dibaca dengan zod (`skemaInfoWali`); kalau bentuknya tidak cocok, form mulai dari keadaan nonaktif. Pesan validasi backend berkunci `items.beranda.info_wali.<field>` dipasang ke field berdasarkan akhiran kuncinya.

## Keputusan Fase 5

- **Satu route, isi per peran**: `/dashboard/tagihan` untuk wali berisi kartu tagihan anak aktif (tab Belum lunas/Lunas, total belum dibayar di atas); untuk petugas keuangan dan guru berisi tabel dengan saringan (status, bulan, kelas, jenis, pencarian). `/dashboard/tagihan/[id]` memakai `DetailTagihan` dengan prop `peran` (`wali`, `keuangan`, `kepala-sekolah`, `guru`).
- Tagihan anak untuk wali diambil sekaligus (`per_page` 100, satu anak paling banyak belasan tagihan per tahun) lalu dikelompokkan di browser, karena `filter[status]` hanya menerima satu status.
- **Kapan tagihan bisa dibayar/diubah/dibatalkan**: `tagihanTerbuka()` = `belum_bayar` atau `terlambat` (sama dengan pemeriksaan backend: bukan lunas, bukan dibatalkan, tidak ada pembayaran menunggu). Aktifkan kembali hanya tampil untuk Kepala Sekolah pada tagihan `dibatalkan`.
- **Bukti transfer wali** hanya gambar (backend menolak PDF di sini); foto dikecilkan di browser. Nama pemilik rekening terisi nama wali dari sesi sebagai awal. `metode: "transfer"` ikut dikirim karena wajib di tipe `BayarTagihanRequest`, meski backend tidak memakainya untuk wali.
- **Catat pembayaran** oleh petugas: untuk tunai hanya `metode` dan `tanggal_bayar` yang dikirim (bank, pengirim, dan bukti dilarang backend untuk tunai).
- **Ubah tagihan** hanya mengirim field yang berubah. Jatuh tempo yang tidak diubah boleh sudah lewat; yang diubah paling cepat hari ini. Toast memberi tahu kalau potongan membuat tagihan langsung lunas.
- **Antrean verifikasi** (`/dashboard/pembayaran`, tab Menunggu Verifikasi) urut dari yang paling lama menunggu (`sort=created_at`), bukti tampil besar dan bisa diperbesar. Terima/tolak juga tersedia di riwayat pembayaran detail tagihan. Wali di route yang sama melihat riwayat pembayarannya dengan kwitansi.
- **Laporan**: rentang bawaan dari tanggal mulai tahun ajaran aktif sampai hari ini (disimpan di URL). Backend menghitung tagihan berdasarkan jatuh tempo dan pemasukan berdasarkan tanggal bayar; keterangan di kartu ringkasan menyebut ini. Grafik: batang bertumpuk terbayar + belum terbayar per bulan (jumlahnya total tagihan). Warna `--grafik-terbayar` `#0A6E04` dan `--grafik-belum` `#C07C10` diperiksa dengan validator palet skill dataviz: lolos pemisahan buta warna (ΔE protan 10,7), batas penglihatan normal, dan kontras minimal 3:1 (oranye 3,42:1 di atas kartu putih, 3,23:1 di atas latar krem). Sebelum review warnanya `#D08A1A` (2,86:1). Legenda dan tabel per bulan tetap selalu tampil. Satu sumbu Y, tooltip per batang.
- **Tunggakan** menampilkan kontak utama wali dengan tautan `tel:`. Tombol "Kirim Pengumuman" (B4) ditambahkan di Fase 6 (lihat Keputusan Fase 6).
- `PilihMurid` (cari murid aktif, pilih satu atau banyak) dipakai tagihan sekali bayar, keringanan, dan penempatan murid; `TambahMuridKelas` Fase 4 ikut dipindah ke komponen ini.

## Review Fase 4–5

- Keputusan Fase 4 dan 5 disetujui pemilik repo.
- Oranye grafik laporan digelapkan ke `#C07C10` (lihat Keputusan Fase 5).
- **Kenaikan kelas**: `POST /kelas/kenaikan` tidak punya field tahun ajaran asal; backend selalu memakai tahun ajaran aktif. Wizard sebelumnya membolehkan memilih asal lain, sehingga simpan gagal dengan "Murid berikut tidak punya kelas aktif di tahun ajaran 2026/2027". Pilihan asal diganti teks tetap "(tahun ajaran aktif)"; tanpa tahun ajaran aktif tampil pesan untuk mengaktifkannya.
- **Guru ditolak**: kolom Keterangan di tab Ditolak berisi alasan penolakan (sebelumnya kosong, alasan hanya di detail).
- **Saringan bulan tagihan**: `<input type="month">` tidak didukung Firefox dan tampil sebagai kotak kosong tanpa label. Diganti pilihan "Semua bulan" + bulan-bulan tahun ajaran aktif (`daftarBulan()` di `src/lib/tanggal.ts`, `formatBulan()` di `src/lib/format.ts`).
- **Tampilan HP petugas keuangan**: saringan tanggal di riwayat pembayaran diberi label terlihat "Tanggal bayar"; nominal di antrean verifikasi dan riwayat tidak lagi terpotong dua baris ("Rp / 150.000").

Pengujian alur yang belum pernah diuji (dev server ke backend lokal, Firefox headless lewat puppeteer-core di luar repo):

- Tambah guru "Laila Nurhidayah, S.Pd." dengan foto → kotak password awal tampil, detail guru menampilkan foto dari `/storage/guru/...`.
- Guru pending: setujui Fitri Handayani (toast, pindah ke tab Aktif, login backend berhasil); tolak Ahmad Fauzi tanpa alasan → "Alasan penolakan wajib diisi."; dengan alasan → login backend membalas `ACCOUNT_REJECTED` beserta alasannya.
- Tambah murid "Kinanti Ayu Lestari" → NIS `TA20260031`, toast akun wali otomatis, detail menampilkan "Wali Kinan" (kontak utama, username NIS); kartu akun `GET /murid/62/kartu-akun` 200 PDF; login wali `TA20260031` + `14032021` berhasil. Unggah foto murid lewat Ubah Data → foto tampil di detail (signed URL).
- Hapus murid "Raka Aditya Pratama" (`TA20260032`) → kembali ke daftar, `GET /murid/63` 404, akun otomatisnya `ACCOUNT_INACTIVE`.
- Simpan kenaikan kelas: supaya 60 murid demo tidak ikut naik, dibuat kelas uji TK A1 di 2027/2028 (berisi Kinanti) dan tahun ajaran 2028/2029 dengan TK B1, lalu 2027/2028 diaktifkan sementara. Wizard → Simpan → "1 murid naik kelas, 0 tinggal kelas, 0 lulus", Kinanti ada di TK B1 2028/2029. Tahun ajaran aktif dikembalikan ke 2026/2027.
- Tagihan sekali bayar Uang Kegiatan untuk Kinanti (murid tertentu) → "1 tagihan dibuat." (tagihan 241); catat pembayaran transfer dengan bukti, bank BRI, nama pengirim → lunas, pembayaran `diterima` dengan `bukti_url`.
- Tampilan HP (390 px) guru petugas keuangan `siti.rahmawati`: tagihan, detail tagihan, antrean, riwayat pembayaran, keringanan, laporan, tunggakan tanpa scroll horizontal; temuan diperbaiki di atas.
- Data backend yang berubah: guru Laila (id 10) dan persetujuan/penolakan dua guru pending, murid Kinanti (id 62) beserta akun walinya, murid Raka (terhapus), kelas TK A1 2027/2028 (id 5), tahun ajaran 2028/2029 (id 3) dengan TK B1 (id 6), tagihan 241 lunas.

## Keputusan Fase 6

- **Kegiatan kelas**: feed berisi kartu "foto tempel" (foto utama + dua foto kecil, sisa foto sebagai "+n"), efek muncul `jatuh`. Wali melihat kegiatan kelas anak aktif; id kelas diambil dari `GET /wali/anak` (`useAnakWali`, `src/lib/api/wali.ts`) karena `anak` di sesi hanya memuat nama kelas. Anak tanpa kelas aktif → feed tanpa saringan kelas (kegiatan kelas lama tetap terlihat, backend yang membatasi).
- Kepala Sekolah dan guru memakai saringan kelas dari `useKelasAktif()` (`GET /kelas` tahun ajaran aktif; untuk guru backend sudah membatasi ke kelas yang diampu). Pilihan kelas yang sama dipakai form kegiatan dan sasaran pengumuman.
- **Kelola foto** (pembuat kegiatan atau Kepala Sekolah): keterangan per foto (`PUT /kegiatan-foto/{id}`), geser atas/bawah (urutan ditulis ulang 1..n hanya untuk foto yang nilainya berubah), hapus, tambah foto (sisa kuota 30 per kegiatan, 10 per unggahan). Lightbox memakai `GridFotoGaleri` dengan prop `privat` (signed URL, `unoptimized`) dan `keteranganDiBawah`.
- **Rapor**: guru memilih kelas dan semester (bawaan `semester_aktif` tahun ajaran aktif), daftar murid aktif beserta status rapornya, "Buat Draft" lalu editor. Editor: tinggi/berat (koma atau titik, satu desimal, rentang sama dengan backend), deskripsi per elemen dengan deskripsi elemen sebagai panduan, satu foto per elemen (hanya pembuat saat draft/revisi), catatan guru. Tombol ajukan/terbitkan nonaktif selama ada perubahan belum disimpan, supaya isi terbaru yang dikirim.
- Kepala Sekolah: tab "Menunggu Review" (urut paling lama diajukan), "Semua Rapor" (saringan status, kelas, semester, cari), dan "Kelas Saya" kalau profil gurunya mengampu kelas (memakai `kelas_diampu` dari sesi, karena `GET /kelas` baginya berisi semua kelas). Rapor diajukan bisa diperbaiki ("Simpan Perbaikan"), diterbitkan, atau dikembalikan dengan catatan; rapor terbit bisa ditarik dengan catatan.
- **Rapor ditarik untuk wali**: backend membalas 404 kalau wali membuka rapor yang belum/tidak lagi terbit. Halaman detail wali mengubah 404 itu menjadi kotak "Rapor ini belum bisa dibuka" dengan penjelasan bahwa rapor sedang diperiksa ulang dan notifikasi akan dikirim saat terbit. Status rapor tidak ditampilkan ke wali.
- PDF rapor: wali "Unduh PDF" (simpan file `rapor-<NIS>-<tahun ajaran>-semester-<n>.pdf`), guru dan Kepala Sekolah "Pratinjau PDF" di tab baru (bertanda pratinjau dari backend sebelum terbit).
- **Pengumuman**: editor bersama `EditorTeks` (`src/components/shared/editor-teks.tsx`, Tiptap StarterKit v3 yang sudah memuat Link dan Underline; tanpa code/codeBlock; `immediatelyRender: false`). Toolbar: tebal, miring, garis bawah, subjudul, daftar poin/nomor, tautan (popover), urungkan/ulangi. Dipakai lagi di CMS Fase 7.
- Sasaran: Kepala Sekolah semua target; guru hanya "Kelas tertentu" dan "Murid tertentu" (backend menolak target lain). Pengumuman baru: "Terbitkan Pengumuman" atau "Simpan Draft"; pengumuman terbit hanya "Simpan Perubahan". "Tampilkan di website" hanya untuk Kepala Sekolah dengan target Semua. Penulis dan Kepala Sekolah melihat tab Semua/Terbit/Draft dan sasaran; wali hanya feed.
- **Kirim pengumuman dari Tunggakan**: tombol membuka `/dashboard/pengumuman/baru?dari=tunggakan&kelas=` yang memuat ulang `GET /laporan/tunggakan` dengan saringan kelas yang sama, lalu mengisi judul, isi pengingat, dan semua murid penunggak sebagai sasaran. Guru petugas keuangan hanya bisa menyasar murid di kelas yang dia ampu, jadi murid kelas lain tidak dipilih dan jumlahnya disebut di atas form. Id murid tidak ditaruh di URL.
- **Agenda**: kalender Senin–Minggu, hari ini dilingkari hijau, Minggu merah, label agenda di desktop dan titik berwarna di HP (`NADA_JENIS_AGENDA`: kegiatan hijau, libur merah, rapat biru, lainnya abu). Bulan (`?bulan=`) dan hari terpilih (`?hari=`) di URL; memilih hari menyaring daftar di samping. Kepala Sekolah menambah (tanggal awal = hari terpilih), mengubah, menghapus lewat dialog; agenda tidak publik diberi badge "Internal".

## Keputusan Fase 7

- **PPDB Kepala Sekolah** (`/dashboard/ppdb`): ringkasan status (dibuka/ditutup, tahun ajaran tujuan, sisa kuota, jadwal) dari `GET /public/ppdb` lewat proxy, dengan tautan "Atur PPDB" ke tab PPDB di Pengaturan. Tabel pendaftar per status: Baru (`diajukan`, bawaan), Dokumen OK (`diverifikasi`), Diterima, Ditolak, Semua; jumlah di tab Baru dan Dokumen OK.
- Detail (`/dashboard/ppdb/[id]`): data anak, orang tua, dokumen (signed URL dibuka di tab baru; pratinjau gambar, ikon berkas kalau gagal dimuat karena PDF tidak bisa dikenali dari URL terenkripsi). Aksi mengikuti A6/backend: `diajukan` → "Dokumen Sudah Sesuai" (verifikasi) atau tolak; `diverifikasi` → terima atau tolak. Dialog terima: kelas opsional, hanya kelas di tahun ajaran tujuan, kelompok yang sama didahulukan, kelas penuh tidak bisa dipilih; teks menjelaskan akun wali yang ditautkan atau dibuat otomatis. Setelah diterima tampil NIS dan tautan ke data murid (kartu akun ada di sana).
- Halaman detail yang sama dipakai wali (tujuan notifikasi `pendaftaran_diproses`, `/dashboard/ppdb/{id}`) tanpa tombol keputusan dan tanpa baris akun wali; kartu di "Pendaftaran Anda" sekarang menaut ke detail.
- **CMS** (`/dashboard/website`): tab Profil Sekolah, Pembuka, Program, Keunggulan, Fasilitas (label "Pembuka" untuk `landing.hero`). Tiap tab form sendiri dan disimpan sendiri lewat `PUT /pengaturan` dengan kunci tab itu saja. Gambar (logo, pembuka, fasilitas) langsung diunggah saat dipilih (`POST /pengaturan/upload`, dikompres di browser) dan path-nya baru tersimpan saat tab disimpan. Misi, program, keunggulan, fasilitas memakai daftar dinamis dengan tambah, hapus, naik/turun (maks 20, sama dengan backend). Ikon dipilih dari `IKON_CMS` dengan label Indonesia (`LABEL_IKON_CMS`). Alamat peta harus `https://www.google.com/...` atau `maps.google.com` (sama dengan syarat tampil di landing).
- Pesan validasi backend berkunci `items.<kunci>.<path>` dipasang ke field lewat `pesanErrorPengaturan()`.
- **Perubahan belum disimpan**: `usePeringatanBelumDisimpan()` memasang `beforeunload` dan menangkap klik tautan internal (fase capture) dengan `window.confirm`; pindah tab juga meminta konfirmasi. Tabs memakai `activationMode="manual"`: dengan mode otomatis Radix mengaktifkan tab saat tombolnya mendapat fokus, sehingga setelah konfirmasi ditutup fokus kembali ke tombol tab dan konfirmasi muncul terus (ditemukan saat uji). Berlaku juga di Pengaturan.
- **"Lihat Pratinjau"** membuka `/` di tab baru.
- **Revalidate**: `POST /api/revalidate` `{ tags }` (route handler) memeriksa origin, sesi Kepala Sekolah (`ambilSesi`), dan tag yang dikenal (`TAG_PUBLIK`), lalu `revalidateTag(tag, { expire: 0 })` supaya kunjungan berikutnya langsung mengambil data baru (bukan isi lama sekali lagi seperti profil `"max"`). Dipanggil dari `segarkanWebsite()` setelah menyimpan: profil/landing → `publik-profil`, PPDB (pengaturan dan keputusan pendaftaran, karena sisa kuota) → `publik-ppdb`, galeri → `publik-galeri`, pengumuman oleh Kepala Sekolah → `publik-pengumuman`, agenda → `publik-agenda`, guru → `publik-guru`. Kegagalan revalidate hanya dicatat di konsol; datanya sudah tersimpan dan ISR tetap kedaluwarsa dalam 5 menit.
- **Keunggulan di landing** sekarang menampilkan ikon pilihan CMS di dalam bintang (sebelumnya nomor urut). Kontrak mewajibkan `ikon` untuk keunggulan dan CMS memintanya, jadi ikon yang tidak ditampilkan akan membingungkan; nomor tetap dipakai kalau ikonnya tidak ada di `IKON_CMS`. Mengubah tampilan landing yang disetujui di Fase 2 (saat itu data keunggulan kosong); disetujui di review Fase 6–7.
- **Galeri** (`/dashboard/website/galeri`, `/[id]`): kartu album dengan sampul, jumlah foto, dan status tampil/disembunyikan; dialog album (judul, tanggal, deskripsi, sampul opsional, tampil di website; album baru tersembunyi); detail album dengan kelola foto dan tautan "Lihat di Website" untuk album publik. Pengelolaan foto kegiatan dan galeri memakai satu komponen `KelolaFoto` (`src/components/shared/kelola-foto.tsx`).
- **Pengaturan** (`/dashboard/pengaturan`, `?tab=`): Rekening (maks 5, format nomor sama dengan backend), Tagihan (jatuh tempo 1–28, pengingat 1–14 hari), PPDB (buka/tutup, tahun ajaran tujuan wajib kalau dibuka, jadwal, kuota 0–1000, info dengan Tiptap), Beranda Wali (form Fase 4), Elemen Penilaian (tambah/ubah lewat dialog, kode huruf besar/angka/garis bawah, hapus ditolak backend kalau sudah dipakai rapor dengan saran menonaktifkan).
- **Log aktivitas** (`/dashboard/log-aktivitas`): tabel waktu, pelaku (atau "Sistem"), jenis, aktivitas, dan tautan ke data terkait untuk subjek yang punya halaman (murid, guru, wali murid, tagihan, rapor, pendaftaran). Saringan jenis dan tanggal di URL.

## Review Fase 6–7

Semua keputusan Fase 6 dan 7 disetujui pemilik repo (setelah penutupan Fase 8). Daftar yang direview:

| Kode | Keputusan |
|---|---|
| F6-1 | Feed kegiatan wali memakai id kelas dari `GET /wali/anak`; anak tanpa kelas aktif melihat feed tanpa saringan kelas (backend yang membatasi). |
| F6-2 | Kelola foto kegiatan: keterangan per foto, geser naik/turun (urutan ditulis ulang 1..n), kuota 30 per kegiatan dan 10 per unggahan. |
| F6-3 | Tombol ajukan/terbitkan rapor nonaktif selama ada perubahan belum disimpan. |
| F6-4 | Kepala Sekolah di Rapor: tab Menunggu Review, Semua Rapor, dan Kelas Saya (kalau profil gurunya mengampu kelas). |
| F6-5 | Rapor yang ditarik: 404 untuk wali ditampilkan sebagai "Rapor ini belum bisa dibuka"; status rapor tidak ditampilkan ke wali. |
| F6-6 | PDF rapor: wali "Unduh PDF", guru dan Kepala Sekolah "Pratinjau PDF" di tab baru. |
| F6-7 | Pengumuman: toolbar Tiptap tanpa code/codeBlock; guru hanya sasaran kelas atau murid tertentu; "Tampilkan di website" hanya Kepala Sekolah dengan sasaran Semua. |
| F6-8 | Kirim pengumuman dari Tunggakan: judul, isi, dan murid penunggak diisi otomatis; guru petugas keuangan hanya murid di kelasnya; id murid tidak di URL. |
| F6-9 | Agenda: kalender Senin–Minggu, warna per jenis, bulan dan hari terpilih di URL, badge "Internal". |
| F7-1 | PPDB Kepala Sekolah: ringkasan dari `GET /public/ppdb`, tab Baru, Dokumen OK, Diterima, Ditolak, Semua. |
| F7-2 | Dialog terima pendaftar: kelas opsional, hanya kelas tahun ajaran tujuan, kelompok yang sama didahulukan, kelas penuh tidak bisa dipilih; wali memakai halaman detail yang sama tanpa tombol keputusan. |
| F7-3 | CMS: tab Hero berlabel "Pembuka"; gambar diunggah saat dipilih dan path-nya baru tersimpan saat tab disimpan (file yang tidak jadi disimpan tertinggal di server, lihat "Rencana perbaikan berikutnya"); daftar maks 20; ikon dari `IKON_CMS` berlabel Indonesia; peta hanya Google Maps. |
| F7-4 | Peringatan perubahan belum disimpan dengan `window.confirm`; tabs `activationMode="manual"`. |
| F7-5 | "Lihat Pratinjau" membuka `/` di tab baru (hanya isi yang sudah disimpan). |
| F7-6 | Revalidate per tag dengan `expire: 0`; kegagalan hanya dicatat di konsol, ISR tetap kedaluwarsa dalam 5 menit. |
| F7-7 | Keunggulan di landing menampilkan ikon CMS di dalam bintang. |
| F7-8 | Album galeri baru tersembunyi; foto kegiatan dan galeri memakai satu komponen `KelolaFoto`. |
| F7-9 | Batas pengaturan sama dengan backend (rekening maks 5, jatuh tempo 1–28, pengingat 1–14 hari, kuota 0–1000); elemen penilaian yang dipakai rapor tidak bisa dihapus, disarankan dinonaktifkan. |
| F7-10 | Log aktivitas menaut ke halaman murid, guru, wali murid, tagihan, rapor, atau pendaftaran terkait. |

## Keputusan Fase 8

- **Data publik saat backend gagal** (`src/lib/api/publik.ts`): error backend dicatat di log server (`console.error`) lalu dilempar, sehingga halaman menampilkan error boundary. `null` hanya untuk 404 asli dari backend (slug pengumuman/galeri tidak ada), yang diteruskan ke `notFound()`. Tidak ada data cadangan.
- **Build tanpa backend**: `next build` menyetel `NEXT_PHASE=phase-production-build` sebelum prerender. Kalau pengambilan data publik gagal pada fase itu, `connection()` dipanggil sehingga prerender halaman dihentikan dan route menjadi dinamis (dirender saat diminta, fetch tetap di-cache 5 menit dengan tag). Halaman tidak di-prerender dengan data kosong, karena isi kosong itu akan disajikan dari cache ISR sampai revalidate. Dengan backend hidup saat build, `/`, `/ppdb`, `/ppdb/daftar`, `/ppdb/status`, `/daftar-guru`, `/lupa-password`, dan `/menunggu-persetujuan` tetap ISR 5 menit.
- **Error boundary root** (`src/app/error.tsx`): error dari layout `(public)`, `(auth)`, dan `dashboard` (misalnya profil sekolah atau sesi yang gagal diambil) tidak ditangkap `error.tsx` di segmen yang sama. Semua error boundary memakai `retry` (Next 16: `router.refresh()` lalu `reset()`), karena `reset` saja tidak mengambil ulang data Server Component.
- **Grafik** (beranda Kepala Sekolah, laporan): container `aria-hidden` dan `accessibilityLayer={false}`. Recharts 3 memberi `<svg>` `tabIndex=0` dan `role="application"` secara bawaan, sehingga grafik yang disembunyikan tetap bisa difokus. Data dibacakan dari tabel (tersembunyi di beranda, terlihat di laporan).
- **Kontak di landing**: `dl > div > dt + dd`, ikon di dalam `dt` diposisikan absolut. Struktur sebelumnya (`dt`/`dd` dua lapis di dalam `dl`) tidak valid.
- **Baris simpan CMS/pengaturan** (`TombolSimpanTab`): `sticky bottom-4` di semua ukuran. `bottom-20` sebelumnya disalin dari editor rapor; halaman ini hanya untuk Kepala Sekolah, yang di HP tidak punya navigasi bawah (hanya wali), jadi jarak 80 px tidak diperlukan. Diuji di 390 px: tombol tidak tertutup elemen lain di posisi atas, tengah, dan bawah halaman. `editor-rapor.tsx` (guru pembuat dan Kepala Sekolah) dan `wizard-kenaikan.tsx` (Kepala Sekolah) disamakan ke `bottom-4` dengan alasan yang sama; tidak ada lagi `bottom-20` di `src`.
- **Fokus tidak tertutup** (`globals.css`): `html` diberi `scroll-padding-top: 5rem` kalau ada topbar dashboard (`data-topbar-dashboard`, sticky `h-16`) dan, di bawah `lg`, `scroll-padding-bottom: 6rem` kalau ada navigasi bawah wali (`data-nav-bawah-wali`, fixed). Tanpa ini Tab ke tombol "Unggah Bukti Transfer" di HP menggulir tombol tepat ke bawah navigasi bawah sehingga fokusnya tidak terlihat.
- **Fokus di `ZonaUnggah`**: input file dinonaktifkan selama kompres dan dilepas saat kuota penuh, tombol hapus hilang bersama filenya, sehingga fokus jatuh ke `body`. Setelah file masuk dan kuota penuh, fokus pindah ke tombol "Hapus <nama file>" file terakhir; setelah menghapus atau kalau kuota belum penuh, fokus kembali ke input file. Berlaku untuk semua unggahan (bukti transfer, PPDB, foto murid/guru, kegiatan, galeri, CMS).
- **Ubah murid dan kegiatan** mengikuti tipe baru dari backend: body tambah dan ubah murid dibentuk dari satu fungsi `keBody()` (`form-murid.tsx`); ubah kegiatan mengirim JSON.

## Keputusan login terpisah

`/staff/login` dan halaman akun guru di bawah ini sudah dipindah ke `/mudarris/...` (lihat "Keputusan area /mudarris").

Backend mengganti endpoint login (path lama `/auth/login` dan `/auth/login-wali` sekarang 404): `POST /auth/staff/login` (email, rate limit 3/menit per email+IP) dan `POST /auth/wali/login` (NIS anak, 5/menit per NIS+IP). Bagian A `PROMPT_FE_TK.md` disalin ulang dari `PROMPT_BE_TK.md` (hanya A7 Auth yang berubah) dan B2–B4 disesuaikan.

- **Dua halaman, tanpa pilihan role**: `/login` untuk wali murid, `/staff/login` untuk guru dan Kepala Sekolah. Halaman pilihan, `/login/wali`, `/login/guru`, `KembaliKePilihan`, dan `RUTE_LOGIN.pilihan` dihapus. Tidak ada redirect dari URL lama karena aplikasi belum di-deploy.
- **Tautan ke `/staff/login`**: tidak ada di navbar dan di `/login`; hanya teks kecil "Masuk guru" di baris hak cipta footer landing, ditambah tautan dari halaman khusus guru (daftar guru, lupa/reset password, menunggu persetujuan). Tombol "Masuk" navbar dan footer ke `/login`.
- **Tujuan setelah masuk** tetap lewat `tujuanSetelahMasuk()`: `wajib_ganti_password` → `/dashboard/ganti-password`, wali dengan profil belum lengkap → onboarding, selain itu `?next=` atau `/dashboard`. Beranda semua role di `/dashboard` (A1), isinya dipilih dari `user.role`.
- **Pesan gagal**: 401/422 → satu pesan di atas form yang tidak menyebut isian mana yang salah ("NIS anak atau password salah. ..." / "Email atau password salah. ..."), bukan pesan backend per field. `ACCOUNT_PENDING` → `/menunggu-persetujuan` (halaman A6 yang sudah ada); `ACCOUNT_REJECTED` dan `ACCOUNT_INACTIVE` → pesan backend di atas form; error lain → toast.
- **429**: `ApiError.tungguDetik` dibaca dari header `Retry-After` (detik). Tombol berisi "Coba lagi dalam N detik", nonaktif sampai hitungan habis, dengan warna `primary-soft`/`primary-strong` (5,67:1) karena tombol nonaktif bawaan memudar 50%. Kotak pesan (`role="alert"`) berisi teks tetap tanpa angka supaya pembaca layar tidak membacakannya tiap detik. Sisa detik dihitung dari jam, bukan dikurangi per tik, karena interval di tab latar belakang diperlambat. Kalau header tidak ada, pesan backend ditampilkan dan tombol tetap aktif. Logika bersama kedua form ada di `useMasuk()` (`src/components/features/auth/use-masuk.ts`).
- **Route guard**: halaman login untuk pengguna yang sudah masuk → `/dashboard` (proxy). Wali yang membuka halaman khusus guru/Kepala Sekolah dan sebaliknya diarahkan ke `/dashboard?akses=ditolak` oleh `wajibAkses()` di tiap halaman (sudah ada sejak Fase 3, tidak diduplikasi di proxy). Otorisasi tetap di backend.
- **Halaman login sesuai role** saat sesi berakhir: `sesi-habis` membaca `tk_role`, handler 401 di `Providers` membaca role dari cache `['me']`, logout memakai role dari `useSession()`. Tanpa cookie sama sekali (belum masuk atau sudah keluar), `/dashboard/*` diarahkan ke `/login`.
- **Keluar dengan muat ulang penuh** (`window.location.replace`): sebelumnya `queryClient.clear()` membuat query yang masih terpasang (notifikasi, beranda) mengambil ulang data, gagal 401, lalu handler 401 mengarahkan ke login wali karena role sudah hilang dari cache. Ditemukan saat uji: guru yang keluar mendarat di `/login?next=/dashboard`. Akibatnya toast error logout tidak lagi tampil; cookie tetap terhapus dan kegagalan backend dicatat di log server.
- **Halaman login `force-dynamic`**: setelah tidak lagi membaca `searchParams`, `/login` menjadi statis dan Firefox mengambilnya dari cache sehingga wali yang sudah masuk tetap melihat form login (ditemukan saat uji).

## Keputusan area /mudarris

Diminta pemilik repo: wali murid dan staff sekolah memakai area yang benar-benar terpisah. A1 ("satu dashboard bersama") diubah di kedua prompt (Bagian A identik), backend ikut disesuaikan (branch `be/rute-mudarris`).

- **Dua pohon route**: `src/app/dashboard/*` hanya untuk wali murid, `src/app/mudarris/*` hanya untuk guru dan Kepala Sekolah, masing-masing dengan layout sendiri yang memeriksa role dari `GET /auth/me`. Halaman yang dipakai keduanya (beranda, tagihan, pembayaran, kegiatan, rapor, pengumuman, agenda, PPDB, notifikasi, profil) dipecah per area, sehingga cabang `isWali`/staff di dalam halaman hilang. Halaman wali tidak lagi memakai `wajibAkses()` karena layout sudah menjamin role; `wajibAkses()` sekarang hanya di `/mudarris` dan mengarahkan ke `/mudarris?akses=ditolak`.
- **Halaman akun guru** pindah ke `/mudarris/login`, `/mudarris/daftar`, `/mudarris/lupa-password`, `/mudarris/reset-password`, `/mudarris/menunggu-persetujuan` (`RUTE_LOGIN.staff`, `RUTE_AKUN_STAFF`). Alamat lama 404; aplikasi belum di-deploy, jadi tidak ada redirect.
- **Tautan**: komponen khusus staff menulis `/mudarris/...`, komponen khusus wali `/dashboard/...`. Komponen tampilan yang dipakai kedua area (`KartuKegiatan`, `KegiatanRingkas`, `PengumumanRingkas`, `FeedPengumuman`) menerima prop `beranda` dari pemanggilnya; komponen kerangka (sidebar, topbar, menu akun, lonceng notifikasi) memakai `useSession().beranda`. Menu di `lib/navigation.ts` ditulis sebagai path relatif (`path`) dan `href`-nya dibentuk dari beranda role.
- **Tautan lama**: notifikasi yang tersimpan sebelum perubahan berisi `/dashboard/...`. `proxy.ts` memetakan `/dashboard/x` milik staff (cookie `tk_role`) ke `/mudarris/x`, jadi tidak perlu migrasi data di backend. Notifikasi baru dari backend sudah berisi `/mudarris/...` untuk staff (`Role::beranda()`).
- **Wali yang membuka `/mudarris/*`** diarahkan ke `/dashboard?akses=ditolak` (toast "Anda tidak punya akses ke halaman itu."), tidak dipetakan, karena halaman staff tidak punya padanan wali.
- `loading.tsx`, `error.tsx`, `[...lainnya]`, dan halaman notifikasi di `/mudarris` mengekspor ulang milik `/dashboard`; `not-found.tsx` terpisah karena tombolnya kembali ke beranda area. Profil memakai `HalamanProfil` di kedua area; tautan kembali di halaman detail memakai `TautanKembali`.

## Keputusan login Google staff

Diminta pemilik repo: guru dan Kepala Sekolah masuk dengan Google, password hanya untuk Kepala Sekolah, dan pendaftaran guru mandiri dihapus. Bagian A disalin dari `PROMPT_BE_TK.md` (identik, dicek `diff`); B2–B5 disesuaikan.

- **Tombol resmi Google** (`renderButton`, `theme: outline`, `size: large`, `locale: id`, lebar mengikuti wadah, 200–400 px). Teks tombol dibuat Google sesuai bahasa, jadi di Indonesia tampil "Login dengan Google", bukan "Masuk dengan Google"; mengganti teks atau menumpuk tombol sendiri di atasnya melanggar pedoman merek Google. Kata "Masuk" dipakai di judul, tautan, dan pesan di sekitarnya.
- **`?cara=password`** (nuqs) membuka form password Kepala Sekolah, supaya tetap terbuka setelah muat ulang dan bisa ditautkan dari halaman reset password. Tautan memakai pola disclosure (`aria-expanded`, `aria-controls`).
- **Jendela Google ditutup atau diblokir**: GIS tidak memanggil callback apa pun untuk kedua kejadian itu. `usePantauJendelaGoogle()` mulai memantau saat tombol diklik (`click_listener`): kalau `document.hasFocus()` tidak pernah bernilai false dalam 3 detik, jendela dianggap tidak terbuka (petunjuk izinkan pop-up); kalau fokus hilang lalu kembali dan 2 detik kemudian belum ada kredensial, dianggap ditutup. Keduanya petunjuk (nada kuning), bukan error, dan hilang kalau kredensial tetap datang. Kalau Google kelak memakai dialog FedCM untuk tombol, petunjuk "belum terbuka" bisa muncul saat dialog masih tampil; teksnya dibuat aman untuk kasus itu.
- **Status tombol**: selama memeriksa atau hitung mundur 429, tombol Google disembunyikan (iframe tetap terpasang) dan diganti `TombolMasuk` nonaktif ("Memeriksa..." / "Coba lagi dalam N detik"), supaya tidak bisa diklik dua kali. Callback GIS didaftarkan sekali, jadi handler terbaru dibaca lewat ref.
- **`useMasuk()`**: `pesanGagal` sekarang fungsi dari `ApiError`. Login password tetap satu pesan umum untuk 401/422; login Google memakai `errors.credential[0]` dari backend (token tidak sah, email tidak terdaftar, akun Google lain). 503 (Google belum dikonfigurasi di backend) ditampilkan di atas form. Penanganan `ACCOUNT_PENDING` dan `ACCOUNT_REJECTED` dihapus bersama kodenya.
- **Guru**: tab Aktif/Nonaktif saja; tambah guru meminta "Email Google" dan menampilkan alamat halaman masuk guru (bisa disalin), bukan password awal; tidak ada tombol hapus. Profil guru menampilkan "Cara masuk" (akun Google) sebagai ganti form ganti password. Panel Perlu Tindakan Kepala Sekolah tinggal tiga kartu.
- `ACCOUNT_INACTIVE` tetap satu-satunya kode sesi tidak berlaku selain 401 (`ambilSesi()`).

## Temuan kontrak Fase 6

- Sudah diperbaiki backend (dipakai di Fase 8): `PUT /kegiatan/{id}` sekarang `PerbaruiKegiatanRequest` (JSON, tanpa `kelas_id` dan `foto`), dan `PUT /murid/{id}` memakai `PerbaruiMuridRequest` dengan `status` wajib. Pembuangan `kelas_id` lewat `bodySerializer` sudah dihapus.
- `filter[semester]` dan `semester` di `POST /rapor` bertipe string `"1" | "2"` di `api.json`; FE memetakan angka 1/2 lewat `SEMESTER_API`.

## Audit data dashboard wali (revisi poin 4)

Setiap data yang tampil ke wali dan halaman Kepala Sekolah yang mengelolanya:

| Data yang dilihat wali | Sumber | Halaman kelola Kepala Sekolah | Fase | Status |
|---|---|---|---|---|
| Nama dan logo sekolah (topbar, sidebar, onboarding) | `profil.nama_sekolah`, `profil.logo` | `/dashboard/website` tab Profil Sekolah | 7 | Endpoint ada |
| Kartu anak: nama lengkap, panggilan, foto, NIS, tanggal lahir, jenis kelamin | `murid` | `/dashboard/murid/[id]` (edit + foto) | 4 | Endpoint ada |
| Kelas anak | `kelas`, `kelas_murid` | `/dashboard/kelas/[id]` (penempatan), `/dashboard/tahun-ajaran` (kenaikan) | 4 | Endpoint ada |
| Hubungan wali dengan anak, kontak utama | `murid_wali` | `/dashboard/murid/[id]` bagian wali | 4 | Endpoint ada (`PATCH /murid/{id}/wali/{wali_murid_id}`) |
| Tagihan aktif, total belum dibayar, status, jatuh tempo | `tagihan` | `/dashboard/tagihan` (tagihan sekali, generate, batalkan), `/dashboard/keuangan/jenis-tagihan`, `/dashboard/keuangan/keringanan` | 5 | Endpoint ada (`PUT /tagihan/{id}`, `POST /tagihan/{id}/aktifkan`) |
| Rekening sekolah di detail tagihan | `keuangan.rekening` | `/dashboard/pengaturan` tab Rekening | 7 | Endpoint ada |
| Riwayat pembayaran, kwitansi | `pembayaran` | `/dashboard/pembayaran` (verifikasi, catat tunai) | 5 | Endpoint ada |
| Kegiatan kelas: judul, tema, deskripsi, tanggal, foto | `kegiatan_kelas`, `kegiatan_foto` | `/dashboard/kegiatan/[id]` (SA boleh mengubah semua) | 6 | Endpoint ada (`PUT /kegiatan-foto/{id}`) |
| Pengumuman | `pengumuman` | `/dashboard/pengumuman` (SA semua target, pin, draft) | 6 | Endpoint ada; lampiran belum bisa diunggah (sudah dicatat BE) |
| Agenda sekolah | `agenda` | `/dashboard/agenda` | 6 | Endpoint ada |
| Rapor terbaru dan PDF | `rapor`, `rapor_detail`, `elemen_penilaian` | `/dashboard/rapor` (review, terbitkan, minta revisi), `/dashboard/pengaturan` tab Elemen Penilaian | 6, 7 | Endpoint ada (`PUT /rapor/{id}` untuk SA saat diajukan, `POST /rapor/{id}/tarik`) |
| Info dan status PPDB | `ppdb.*`, `pendaftaran` | `/dashboard/pengaturan` tab PPDB, `/dashboard/ppdb` | 7 | Endpoint ada |
| Notifikasi | dibuat sistem dari aksi di atas | tidak dikelola langsung | | Sesuai desain |
| Banner / teks info khusus di beranda wali | `beranda.info_wali` → `info_sekolah` | `/dashboard/pengaturan` tab Beranda Wali | 4–5 | Endpoint ada; banner tampil di beranda wali |
| Data wali (alamat, pekerjaan, NIK) | `wali_murid` | `/dashboard/wali-murid/[id]` (ubah data, status, reset password); wali sendiri di `/dashboard/profil` | 4 | Endpoint ada; form wali di profil sudah dibuat |

Usulan endpoint yang dikirim ke backend setelah Fase 3 (semua sudah dikerjakan backend dengan penyesuaian, lihat Bagian A):

1. **Info beranda wali**: kunci pengaturan baru `beranda.info_wali` = `{ aktif: bool, judul: string, isi: string (maks ±500 karakter), nada: "info" | "penting", berlaku_sampai: date | null }`, disimpan lewat `PUT /pengaturan` (grup baru `beranda`), dan ikut di respons `GET /dashboard` wali sebagai `info_sekolah: { judul, isi, nada } | null` (null kalau tidak aktif atau lewat `berlaku_sampai`). Wali tidak perlu akses ke `/pengaturan`.
2. **Ubah tagihan**: `PUT /tagihan/{id}` (K atau SA) `{ jatuh_tempo?, potongan?, catatan? }` untuk status `belum_bayar`/`terlambat`, menghitung ulang `total` dan status terlambat. Atau: `generate` dan `POST /tagihan` membuat ulang tagihan yang sebelumnya `dibatalkan` untuk periode yang sama (unique index `murid_id, jenis_tagihan_id, periode` perlu disesuaikan).
3. **Caption dan urutan foto kegiatan**: `PUT /kegiatan-foto/{id}` `{ caption?, urutan? }` (pembuat, SA), seperti `PUT /galeri-foto/{id}`.
4. **Rapor**: `PUT /rapor/{id}` juga untuk SA saat status `diajukan`, dan `POST /rapor/{id}/tarik` (SA) `{ catatan }` untuk mengembalikan rapor `terbit` ke `revisi` (wali tidak lagi melihatnya sampai terbit ulang).
5. **Tautan wali**: `PATCH /murid/{id}/wali/{wali_murid_id}` (SA) `{ hubungan?, is_kontak_utama? }`.
6. **Data wali**: `GET /auth/me` untuk wali menyertakan `wali_murid.alamat`, `pekerjaan`, `nik`; `PUT /wali/profil` menerima perubahan sebagian; `PUT /wali-murid/{id}` (SA) untuk koreksi data.

## Temuan backend dari Fase 3

- Sudah diperbaiki backend (revisi audit): `filter[dibaca]` menerima `true`/`false`, dan `api.json` tidak lagi memakai `allOf`. Konversi boolean ke `1`/`0` dan pengambilan tipe dari hasil pemanggilan sudah dihapus (lihat Changelog "Sebelum Fase 4").
- Tiga wali pendaftar PPDB demo memakai email domain sungguhan (`@gmail.com`, `@gmail.co.id`, `@yahoo.co.id`) dari `UserFactory::freeEmail()`, sedangkan wali demo lain memakai `@wali.tkta8.test`. Kalau mailer diaktifkan, email bisa terkirim ke alamat nyata.
- Pesan validasi `current_password` di `PUT /auth/password` sudah "Password salah." (diperbaiki backend). Istilah "Password" masuk glosarium C4.

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
| `/ppdb` | publik | Status buka/tutup, jadwal, kuota, sisa kuota, info HTML; tombol ke `/ppdb/daftar` dan tautan cek status |
| `/ppdb/daftar` | publik | Form pendaftaran 4 langkah tanpa login (`POST /public/pendaftaran`); setelah terkirim tampil kode pendaftaran + salin. PPDB tutup/kuota penuh → pesan tanpa form |
| `/ppdb/status?kode=` | publik | Cek status dengan kode + tanggal lahir anak (`GET /public/pendaftaran/status`) |
| `/login` | publik (sudah masuk → beranda role) | Login wali murid: NIS anak + password, tanpa pilihan role. Tujuan setelah masuk: ganti password awal, onboarding, lalu `?next=` atau beranda |
| `/mudarris/login` | publik (sudah masuk → beranda role) | Guru dan Kepala Sekolah: tombol Google; `?cara=password` membuka form email + password Kepala Sekolah dan tautan lupa password. Hanya ditautkan kecil dari footer landing ("Masuk guru") dan dari halaman lupa/reset password |
| `/mudarris/lupa-password`, `/mudarris/reset-password?token=&email=` | publik | Reset password Kepala Sekolah; setelah berhasil ke `/mudarris/login?cara=password` |
| `/dashboard` (W); `/mudarris` (SA, G) | SA, G, W | Beranda per role (B5): SA panel Perlu Tindakan, statistik, keuangan bulan ini, grafik pemasukan; G kelas diampu, progres rapor, tagihan kelas; W kartu anak, kartu tagihan, rapor terbaru, kegiatan, pengumuman, agenda |
| `/dashboard/ganti-password` | pengguna dengan `wajib_ganti_password` | Ganti password awal (tanggal lahir anak). Tanpa menu, dengan tombol Keluar; yang tidak wajib diarahkan ke beranda |
| `/dashboard/onboarding` | W (profil belum lengkap) | Lengkapi nama, nomor HP, alamat, pekerjaan, NIK opsional. Tanpa menu; wali yang sudah lengkap diarahkan ke beranda |
| `/dashboard/anak` | W | Kartu anak tertaut + form Tambah Anak (NIS, tanggal lahir, hubungan) |
| `/dashboard/ppdb` (W); `/mudarris/ppdb` (SA, G) | SA, W | SA: ringkasan status PPDB + tabel pendaftar per status. W: pendaftaran miliknya + tombol daftar |
| `/dashboard/ppdb/daftar` | W | Form yang sama dengan form publik (`POST /pendaftaran`), nomor HP dan alamat terisi dari profil |
| `/dashboard/ppdb/[id]` (W); `/mudarris/ppdb/[id]` (SA, G) | SA, W (miliknya) | Detail + dokumen; SA: verifikasi, terima (pilih kelas), tolak |
| `/mudarris/website` | SA | CMS lima tab (`?tab=`), Lihat Pratinjau, penjaga perubahan belum disimpan |
| `/mudarris/website/galeri`, `/[id]` | SA | Album galeri; detail album dengan kelola foto |
| `/mudarris/log-aktivitas` | SA | Tabel log + saringan jenis dan tanggal |
| `/dashboard/notifikasi` (W); `/mudarris/notifikasi` (SA, G) | SA, G, W | Semua notifikasi berpaginasi (`?page=`), saring belum dibaca (`?belum=true`), tandai semua dibaca |
| `/dashboard/profil` (W); `/mudarris/profil` (SA, G) | SA, G, W | Nama, nomor HP, foto profil, ganti password (SA, W; guru melihat keterangan akun Google); wali juga alamat, pekerjaan, NIK (username NIS ditampilkan, tidak bisa diubah) |
| `/mudarris/guru`, `/mudarris/guru/baru`, `/mudarris/guru/[id]` | SA | Daftar Aktif/Nonaktif; tambah guru dengan email Google (tanpa password); ubah data, foto, izin keuangan, tampil di landing, aktif/nonaktif (tanpa hapus) |
| `/mudarris/tahun-ajaran`, `/mudarris/tahun-ajaran/kenaikan` | SA | Tambah/ubah/aktifkan/hapus; wizard kenaikan kelas |
| `/mudarris/kelas`, `/mudarris/kelas/[id]` | SA, G (kelas diampu, tanpa aksi) | Kartu kelas per tahun ajaran; detail + murid; SA tambah/ubah/hapus kelas, tempatkan dan keluarkan murid |
| `/mudarris/murid`, `/mudarris/murid/baru`, `/mudarris/murid/[id]`, `/mudarris/murid/[id]/ubah` | SA, G (murid kelasnya, lihat saja) | Tabel + saringan; detail, kartu akun, wali tertaut (ubah hubungan, kontak utama, lepas); tambah/ubah/hapus (SA) |
| `/mudarris/wali-murid`, `/mudarris/wali-murid/[id]` | SA | Daftar wali; ubah data, aktif/nonaktif, reset password, anak tertaut |
| `/mudarris/pengaturan` | SA | Tab Rekening, Tagihan, PPDB, Beranda Wali, Elemen Penilaian (`?tab=`) |
| `/dashboard/tagihan` (W); `/mudarris/tagihan` (SA, G) | SA, G (kelasnya, lihat saja), W | W: kartu tagihan anak aktif. K: tabel + saringan, tagihan sekali bayar; SA juga generate bulanan |
| `/dashboard/tagihan/[id]` (W); `/mudarris/tagihan/[id]` (SA, G) | SA, G, W | Detail, riwayat pembayaran, kwitansi. W: rekening sekolah + unggah bukti. K: catat pembayaran, ubah, terima/tolak. SA: batalkan, aktifkan kembali |
| `/dashboard/pembayaran` (W); `/mudarris/pembayaran` (SA, G) | K, W | K: antrean verifikasi + semua pembayaran dengan saringan. W: riwayat + kwitansi |
| `/mudarris/keuangan/jenis-tagihan` | SA | Jenis tagihan per tahun ajaran |
| `/mudarris/keuangan/keringanan` | K | Keringanan persen/rupiah per murid dan jenis tagihan |
| `/mudarris/keuangan/laporan` | K | Ringkasan, grafik per bulan, tabel per bulan dan per jenis, unduh Excel |
| `/mudarris/keuangan/tunggakan` | K | Murid dengan tagihan terlambat dan kontak walinya; tombol Kirim Pengumuman |
| `/dashboard/kegiatan` (W); `/mudarris/kegiatan` (SA, G) | SA, G, W (lihat) | SA/G: feed + saringan kelas + cari, tombol Catat Kegiatan. W: feed kelas anak aktif |
| `/mudarris/kegiatan/baru` | SA, G | Form kegiatan + unggah foto (maks 10); `?kelas=` memilih kelas awal |
| `/dashboard/kegiatan/[id]` (W); `/mudarris/kegiatan/[id]` (SA, G) | SA, G, W | Detail + galeri + lightbox; pembuat/SA: ubah, hapus, kelola foto (keterangan, urutan, hapus, tambah) |
| `/dashboard/rapor` (W); `/mudarris/rapor` (SA, G) | SA, G, W | G: kelas + semester → murid + status → buat/isi. SA: Menunggu Review, Semua Rapor, Kelas Saya. W: rapor terbit anak aktif + unduh PDF |
| `/dashboard/rapor/[id]` (W); `/mudarris/rapor/[id]` (SA, G) | SA, G, W | Editor (pembuat saat draft/revisi, SA saat diajukan) atau tampilan; ajukan, terbitkan, minta revisi, tarik; PDF. W: rapor ditarik → pesan ramah |
| `/dashboard/pengumuman` (W); `/mudarris/pengumuman` (SA, G) | SA, G, W (lihat) | Feed (disematkan di atas); SA/G: tab Semua/Terbit/Draft, cari, Tulis Pengumuman |
| `/mudarris/pengumuman/baru` | SA, G | Form Tiptap + sasaran; `?dari=tunggakan&kelas=` terisi murid penunggak (K) |
| `/dashboard/pengumuman/[id]` (W); `/mudarris/pengumuman/[id]`, `/[id]/ubah` (SA, G) | SA, G, W / penulis, SA | Detail; ubah dan hapus untuk penulis dan SA |
| `/dashboard/agenda` (W); `/mudarris/agenda` (SA, G) | SA (kelola), G, W | Kalender bulanan + daftar (`?bulan=`, `?hari=`); SA tambah/ubah/hapus |
| `/dashboard/*`, `/mudarris/*` lain | | 404 di dalam kerangka area masing-masing (`[...lainnya]`); di `/mudarris` dengan status HTTP 404 |
| `/api/auth/staff/google`, `/api/auth/staff/login`, `/api/auth/wali/login`, `/api/auth/logout`, `/api/auth/sesi-habis` | route handler | BFF sesi |
| `/api/proxy/[...path]` | route handler | Proxy ke backend |
| `/api/revalidate` | route handler (SA) | Buang cache data publik per tag setelah konten website disimpan |

Route lain mengikuti B4 dan ditambahkan per fase. `/api/auth/me` tidak dibuat (disetujui di Fase 0): sesi dibaca lewat `/api/proxy/auth/me`. `/api/revalidate` (disetujui di Fase 0) dibuat di Fase 7 bersama penyimpanan CMS, memakai tag di `TAG_PUBLIK` (`src/lib/constants/sekolah.ts`).

Menu sidebar untuk semua route B4 sudah ada sejak Fase 3 (`src/lib/navigation.ts`); tautan ke halaman fase berikutnya menampilkan 404 di dalam dashboard sampai halamannya dibuat.

## Rencana perbaikan berikutnya

- **File gambar pengaturan yang tidak jadi disimpan (F7-3)**: `POST /pengaturan/upload` langsung menyimpan file ke disk `public` folder `pengaturan/` (`PengaturanService::FOLDER_GAMBAR`), sedangkan path-nya baru tercatat saat tab CMS disimpan. Kalau Kepala Sekolah memilih gambar lalu membatalkan atau meninggalkan halaman, file itu tidak pernah dipakai dan tidak pernah dihapus. Gambar yang diganti saat menyimpan sudah dihapus backend (`PengaturanService`, perbandingan `semuaGambar()` sebelum dan sesudah simpan), jadi yang tertinggal hanya unggahan yang tidak pernah disimpan.
  Usulan untuk repo backend (belum dikerjakan): perintah artisan `pengaturan:bersihkan-gambar` yang menghapus file di `pengaturan/` pada disk `public` yang tidak ada di `semuaGambar()` pengaturan saat ini dan berumur lebih dari 1 hari (dari waktu ubah file). Batas 1 hari menjaga file yang baru diunggah dan masih menunggu disimpan di form yang sedang terbuka. Dijadwalkan harian di `routes/console.php` pada jam sepi, misalnya `Schedule::command('pengaturan:bersihkan-gambar')->dailyAt('02:00');`, dengan jumlah file yang dihapus dicatat di log. FE tidak perlu berubah.

## Deploy

Tempat deploy belum ditentukan. Syarat yang sudah pasti:

1. **Reverse proxy di depan Next.js wajib**, dan harus menambahkan IP klien ke `X-Forwarded-For` (nginx: `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`). Next.js hanya mengisi header ini dari IP socket kalau request belum membawanya. Tanpa reverse proxy, pengunjung bisa mengirim `X-Forwarded-For` palsu yang lalu diteruskan ke backend, dan rate limit per IP bisa diakali. Laravel memakai IP paling kanan yang bukan proxy tepercaya, yaitu IP yang ditambahkan reverse proxy.
2. **`TRUSTED_PROXIES` di backend** wajib berisi IP server FE (Next.js), ditambah reverse proxy di depan backend kalau ada. Tanpa itu semua pengunjung dihitung sebagai satu IP (IP server FE).
3. **`BE_API_URL`** harus alamat backend yang bisa dibuka browser (bukan hostname jaringan internal), karena host signed URL file private diambil dari request yang diterima backend.
4. HTTPS di produksi: cookie sesi memakai flag `Secure` saat `NODE_ENV=production`.
5. Batas body di reverse proxy minimal 55 MB (unggahan kegiatan 10 foto × 5 MB). PHP backend: `upload_max_filesize` minimal `5M` per file dan `post_max_size` minimal `55M`.
6. **Masuk dengan Google**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` diisi sebelum `npm run build`, dan origin FE produksi (misalnya `https://tkta8.sch.id`) didaftarkan di Authorized JavaScript origins Client ID itu di Google Cloud Console. Backend memakai Client ID yang sama di `GOOGLE_CLIENT_ID`.

## Changelog

### Login Google staff dan guru tanpa pendaftaran mandiri (branch `fe/login-google-staff`)

Bergantung pada backend branch `be/login-google-staff` (`POST /auth/staff/google`, `api.json` baru). Keputusan detail ada di "Keputusan login Google staff".

File baru:

- `src/components/features/auth/tombol-masuk-google.tsx`: tombol Google Identity Services lewat `next/script`, status memuat/gagal/Client ID kosong, penanganan pesan backend dan hitung mundur.
- `src/components/features/auth/use-pantau-jendela-google.ts`: petunjuk kalau jendela Google tidak terbuka atau ditutup.
- `src/components/features/auth/pilihan-masuk-staff.tsx`: tombol Google + tautan "Masuk dengan password (Kepala Sekolah)" (`?cara=password`).
- `src/app/api/auth/staff/google/route.ts`: BFF ke `POST /auth/staff/google`.
- `src/types/google-identity.d.ts`: tipe minimal GIS tanpa `any`.
- `docs/review/login-google-staff/*.png`: screenshot HP 390 px dari uji browser.

File yang diubah:

- `src/app/(auth)/mudarris/login/page.tsx`, `src/components/features/auth/{form-login-staff,form-login-wali,use-masuk,form-lupa-password,form-reset-password}.ts(x)`, `src/app/(auth)/mudarris/lupa-password/page.tsx`: login password khusus Kepala Sekolah tanpa tautan daftar guru; `pesanGagal` berupa fungsi; reset password berhasil → `/mudarris/login?cara=password`.
- `src/lib/auth/{bff,masuk,rute-login,session}.ts`, `src/lib/api/errors.ts`, `src/types/domain.ts`: jenis login `google`, `masukGoogle()`, login password hanya `super_admin`, `RUTE_AKUN_STAFF` tanpa daftar dan menunggu persetujuan, kode `ACCOUNT_PENDING`/`ACCOUNT_REJECTED` dihapus.
- `src/components/features/guru/{daftar-guru,detail-guru,form-guru,tambah-guru}.tsx`, `src/lib/api/guru.ts`, `src/app/mudarris/(halaman)/guru/{page,baru/page}.tsx`: tanpa persetujuan dan password awal, label "Email Google".
- `src/components/features/beranda/kepala-sekolah/perlu-tindakan.tsx`, `src/components/features/profil/halaman-profil.tsx`, `src/lib/constants/{label,status,notifikasi}.ts`, `src/components/shared/{kotak-pesan,tombol-salin}.tsx`.
- `src/app/mudarris/*` → `src/app/mudarris/(halaman)/*` (kecuali `layout.tsx`, `not-found.tsx`, `error.tsx`, `[...lainnya]`): status 404 untuk alamat tak dikenal.
- `src/types/api.d.ts` (`npm run gen:api`), `.env.example` (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`), `PROMPT_FE_TK.md` (Bagian A disalin dari backend, identik; B2–B5).

File yang dihapus: `src/app/(auth)/mudarris/daftar/page.tsx`, `src/app/(auth)/mudarris/menunggu-persetujuan/page.tsx`, `src/components/features/auth/form-daftar-guru.tsx`, `src/components/features/guru/aksi-persetujuan-guru.tsx`.

Pengujian (build produksi `next start` port 3001 dengan `NEXT_PUBLIC_GOOGLE_CLIENT_ID` uji, backend branch `be/login-google-staff` di port 8001 dengan MariaDB lokal berisi `DemoSeeder`, Firefox headless 390 × 844 lewat puppeteer-core di luar repo):

- `lint`, `typecheck`, `build`, `check:slop` bersih; `build` juga dicoba dengan `.env.local` biasa (Client ID kosong).
- Tanpa Client ID OAuth asli, skrip `https://accounts.google.com/gsi/client` diganti stub lewat intersepsi request di browser uji: tombol biasa yang memanggil callback GIS dengan ID token uji. Token itu ditandatangani kunci RSA uji yang kunci publiknya dipasang sementara di cache backend (`google:kunci-publik`), jadi BFF dan verifikasi backend (tanda tangan, `aud`, `iss`, `exp`, `email_verified`) berjalan sungguhan. Cache itu dihapus setelah uji.
- 23 skenario lulus: tampilan awal tanpa scroll horizontal dan tanpa form password; jendela Google tidak terbuka dan ditutup → petunjuk; email tidak terdaftar, akun nonaktif, token kedaluwarsa, akun Google lain dengan email sama → pesan backend; guru masuk (email di token berhuruf besar) → `/mudarris`, `tk_role=guru`, profil tanpa ganti password, buka `/mudarris/login` → beranda; Kepala Sekolah masuk lewat Google dan lewat password (`aria-expanded=true`), panel Perlu Tindakan tanpa guru, daftar guru hanya Aktif/Nonaktif, tambah guru dengan Email Google; guru ditolak di login password; `/mudarris/daftar` dan `/mudarris/menunggu-persetujuan` → 404 di dalam kerangka untuk guru dan Kepala Sekolah, tanpa sesi → `/mudarris/login?next=`; reset password Kepala Sekolah → tombol Masuk membuka `?cara=password`; 11 permintaan dalam semenit → hitung mundur "Coba lagi dalam N detik" dan tombol Google disembunyikan.
- curl dengan cookie sesi: kedua rute lama dan `/mudarris/tidak-ada` 404, `/mudarris`, `/mudarris/guru`, `/mudarris/profil` 200.
- Belum diuji: tombol dan jendela Google asli (butuh Client ID OAuth), axe dan pembaca layar, Safari/Chromium, tampilan desktop.

### Area /mudarris (branch `fe/rute-mudarris`)

File baru: `src/app/mudarris/{layout,page,loading,error,not-found}.tsx`, `src/app/mudarris/[...lainnya]/page.tsx`, dan halaman `/mudarris` untuk agenda, kegiatan, kegiatan/[id], pengumuman, pengumuman/[id], rapor, rapor/[id], tagihan, tagihan/[id], pembayaran, ppdb, ppdb/[id], notifikasi, profil.

File dipindah: halaman staff `src/app/dashboard/{guru,kelas,murid,keuangan,log-aktivitas,pengaturan,tahun-ajaran,wali-murid,website}`, `kegiatan/baru`, `pengumuman/baru`, `pengumuman/[id]/ubah` → `src/app/mudarris/...`; `src/app/(auth)/{staff/login,daftar-guru,lupa-password,reset-password,menunggu-persetujuan}` → `src/app/(auth)/mudarris/{login,daftar,lupa-password,reset-password,menunggu-persetujuan}`.

File yang diubah:

- `src/app/dashboard/*`: halaman bersama menjadi versi wali saja; layout mengarahkan staff ke `/mudarris`.
- `src/proxy.ts`: dua area, login per area, pemetaan `/dashboard/*` staff ke `/mudarris/*`, penolakan wali di `/mudarris/*`.
- `src/lib/auth/{path,role,rute-login,akses,masuk,redirect}.ts`: `BERANDA_WALI`, `BERANDA_STAFF`, `urlAksesDitolak()`, `aksesDitolak()`, `isRoleStaff()`, `berandaUntuk()`, `StatusSesi.beranda`, `RUTE_AKUN_STAFF`; tujuan setelah masuk ke beranda role.
- `src/lib/navigation.ts`: menu dengan path relatif.
- `src/components/layout/dashboard/{shell-dashboard,sidebar,menu-pengguna,notifikasi-bell,pesan-akses-ditolak}.tsx`: tautan dari beranda sesi.
- 35 komponen khusus staff di `src/components/features/*`: `/dashboard/...` → `/mudarris/...`. `KartuKegiatan`, `KegiatanRingkas`, `PengumumanRingkas`, `FeedPengumuman`: prop `beranda`.
- `src/components/features/auth/{form-login-staff,form-reset-password,use-masuk}.ts(x)`: tautan halaman akun guru.
- `src/types/api.d.ts`: `npm run gen:api` (deskripsi field `url` notifikasi).
- `PROMPT_FE_TK.md`: Bagian A disalin dari backend (identik, dicek `diff`); B2, B3, B4 untuk dua area.

Pengujian (build produksi `next start` port 3001, backend branch `be/rute-mudarris` di port 8001 dengan SQLite sementara berisi `DemoSeeder`, Firefox headless lewat puppeteer-core di luar repo):

- `lint`, `typecheck`, `build`, `check:slop` bersih. Backend: 691 test lulus, Pint, PHPStan, `check:slop` bersih.
- Tanpa sesi: `/mudarris` dan `/mudarris/murid` → `/mudarris/login?next=`, `/dashboard/tagihan` → `/login?next=`. Lima halaman akun guru di `/mudarris/*` 200; `/staff/login`, `/daftar-guru`, `/lupa-password`, `/reset-password`, `/menunggu-persetujuan` 404. Footer landing "Masuk guru" → `/mudarris/login`.
- Kepala Sekolah (1280 px): masuk → `/mudarris`; 22 item menu semua `/mudarris`; 23 halaman `/mudarris` terbuka tanpa halaman galat dan tanpa satu pun tautan `/dashboard`; detail murid juga. Notifikasi baru dari backend (`guru_baru`, url `/mudarris/guru/8`) dibuka dari lonceng → `/mudarris/guru/8`. `/dashboard/tagihan/1` → `/mudarris/tagihan/1`; `/dashboard`, `/login`, `/mudarris/login` → `/mudarris`; keluar → `/mudarris/login`.
- Guru petugas keuangan (390 px): `?next=/mudarris/tagihan` dihormati; `/mudarris/guru` → `/mudarris` (akses ditolak); notifikasi lama berisi `/dashboard/tagihan/1` → `/mudarris/tagihan/1`; menu HP semua `/mudarris`; keluar → `/mudarris/login`. Guru pending → `/mudarris/menunggu-persetujuan`.
- Wali (390 px): masuk → `/dashboard`; 11 halaman wali terbuka tanpa tautan `/mudarris`; navigasi bawah `/dashboard`; `/mudarris/murid` → `/dashboard` dengan toast akses; `/mudarris/login` → `/dashboard`; keluar → `/login`. Wali dengan password awal → `/dashboard/ganti-password`.
- Belum diuji: axe dan pembaca layar untuk halaman yang dipindah (markup tidak berubah), Safari/Chromium.

Pemeriksaan sebelum PR:

- **Duplikasi halaman bersama.** Pasangan `/dashboard` dan `/mudarris` dibandingkan. Yang tadinya tersalin: `notifikasi` (identik; `/mudarris/notifikasi` sekarang mengekspor ulang halaman `/dashboard`), `profil` (markup dipindah ke `HalamanProfil`, `src/components/features/profil/halaman-profil.tsx`; bagian data wali tampil kalau `user.wali_murid` ada), dan tautan kembali di `kegiatan/[id]`, `pengumuman/[id]`, `rapor/[id]`, `tagihan/[id]`, `ppdb/[id]` (kelas panjang yang sama di 12 halaman, sekarang `TautanKembali` di `src/components/shared/tautan-kembali.tsx`). Halaman lain (beranda, kegiatan, pengumuman, rapor, tagihan, pembayaran, PPDB, agenda) sudah wrapper tipis: memanggil komponen fitur sesuai area atau komponen yang sama dengan props berbeda (`kelola`, `penulis`, `beranda`, `peran`, `kepalaSekolah`).
- **Guru tanpa izin keuangan** (`nur.aini`, wali kelas TK A1). BE: `GET /tagihan` 200 hanya 60 dari 240 tagihan (kelasnya), `GET /tagihan/16` (TK A2) 404; `POST /tagihan`, `PUT /tagihan/1`, `POST /tagihan/1/pembayaran`, `POST /tagihan/generate`, `GET /pembayaran`, `GET /pembayaran/1`, `POST /pembayaran/1/terima`, `GET /pembayaran/1/kwitansi`, `GET /pembayaran/1/bukti`, `GET /jenis-tagihan`, `GET /keringanan`, `GET /laporan/keuangan`, `GET /laporan/tunggakan`, `GET /pengaturan?grup=keuangan` semua 403 `FORBIDDEN`; `bukti_url` tidak dikirim. FE: menu tanpa Pembayaran, Jenis Tagihan, Keringanan, Laporan Keuangan, Tunggakan; Tagihan tetap tampil karena A3/B4 memberi guru akses lihat tagihan kelasnya. Beranda tanpa kartu Verifikasi Pembayaran. `/mudarris/pembayaran`, `/mudarris/keuangan/*`, `/mudarris/pengaturan`, `/mudarris/guru`, dan `/dashboard/pembayaran` → `/mudarris` dengan pesan akses ditolak. `/mudarris/tagihan` tanpa tombol buat/generate; detail tagihan kelasnya tanpa aksi keuangan; detail tagihan kelas lain menampilkan "Data tidak ditemukan".
- **Temuan dan perbaikan:** detail tagihan menampilkan tombol "Unduh Kwitansi" untuk guru tanpa izin keuangan, padahal backend membalas 403 (A7: kwitansi hanya K dan W). `RiwayatPembayaran` sekarang menerima `bisaUnduhKwitansi` (`peran !== "guru"`). Kepala Sekolah dan wali tetap melihat tombolnya.
- Setelah perubahan: skenario Kepala Sekolah (23 halaman) dan wali (11 halaman) diulang tanpa kegagalan; profil wali berisi Data diri, Data wali murid, Ganti password; profil `/mudarris` tanpa Data wali murid; notifikasi di kedua area.

### Login terpisah (branch `fe/login-terpisah`)

File baru:

- `src/app/(auth)/staff/login/page.tsx`: login guru dan Kepala Sekolah.
- `src/app/api/auth/staff/login/route.ts`, `src/app/api/auth/wali/login/route.ts`: BFF ke endpoint backend baru.
- `src/components/features/auth/use-masuk.ts`: alur bersama kedua form (kirim, tujuan, pesan gagal, hitung mundur 429).
- `src/components/features/auth/tombol-masuk.tsx`: tombol Masuk dengan status memeriksa dan hitung mundur.

File yang diubah:

- `PROMPT_FE_TK.md`: Bagian A disalin dari `PROMPT_BE_TK.md` (identik, dicek dengan `diff`); B2, B3, B4 ke route baru.
- `src/types/api.d.ts`: `npm run gen:api` (path auth baru, `LoginStaffRequest`, header `Retry-After` di respons 429).
- `src/app/(auth)/login/page.tsx`: sekarang form login wali (isi `/login/wali` lama tanpa tautan ke login guru).
- `src/components/features/auth/form-login-guru.tsx` → `form-login-staff.tsx`, `form-login-wali.tsx`: memakai `useMasuk()` dan `TombolMasuk`.
- `src/lib/auth/bff.ts`: aturan per jenis login (path backend dicek terhadap `paths` hasil generate, field, role yang boleh).
- `src/lib/auth/masuk.ts`: `masukStaff()`, `masukWali()`.
- `src/lib/auth/rute-login.ts`: `RUTE_LOGIN { wali, staff }`, `ruteLogin(role)`.
- `src/lib/api/errors.ts`: `ApiError.tungguDetik` dari `Retry-After`.
- `src/proxy.ts`: matcher dan redirect halaman login.
- `src/app/api/auth/sesi-habis/route.ts`, `src/components/providers.tsx`, `src/components/features/auth/use-keluar.ts`: login sesuai role; keluar dengan muat ulang penuh.
- `src/components/layout/publik/{navbar-publik,footer-publik}.tsx`: "Masuk" ke `/login`, tautan kecil "Masuk guru".
- `src/components/features/auth/{form-lupa-password,form-reset-password,form-daftar-guru}.tsx`, `src/app/(auth)/menunggu-persetujuan/page.tsx`: tautan ke `/staff/login`.

File yang dihapus: `src/app/(auth)/login/wali/page.tsx`, `src/app/(auth)/login/guru/page.tsx`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/login-wali/route.ts`, `src/components/features/auth/kembali-ke-pilihan.tsx`.

Pengujian (build produksi `next start` di port 3001, Firefox headless 390 × 844 lewat puppeteer-core di luar repo):

- Backend: `php artisan serve --port=8001` dari repo backend `main` (merge PR #4) dengan database SQLite sementara di luar repo berisi `DatabaseSeeder` + `DemoSeeder`, karena database MariaDB lokal hanya berisi 3 akun tanpa data demo. MariaDB tidak diubah.
- `lint`, `typecheck`, `build`, `check:slop` bersih.
- curl ke BFF: wali salah → 422; wali `ta2026 0001` benar → 200, cookie `tk_token` + `tk_role=wali_murid`, token tidak ada di body; guru → `tk_role=guru`; Kepala Sekolah → `super_admin`; guru pending → 403 `ACCOUNT_PENDING`; body wali ke endpoint staff → 422; percobaan ke-4 staff dengan email sama → 429 dengan `Retry-After: 60` diteruskan. `/api/auth/login`, `/api/auth/login-wali`, `/login/wali`, `/login/guru` → 404. `sesi-habis` dengan `tk_role=guru` → `/staff/login?next=`, dengan `wali_murid` → `/login?next=`. Sudah masuk buka `/login` atau `/staff/login` → 307 `/dashboard` (wali, guru, Kepala Sekolah). Wali buka `/dashboard/guru` dan `/dashboard/keuangan/laporan`, guru buka `/dashboard/anak` dan `/dashboard/onboarding` → redirect `/dashboard?akses=ditolak` (redirect setelah streaming: HTTP 200 dengan meta refresh + `NEXT_REDIRECT`).
- Browser, wali: landing punya tepat satu tautan ke `/staff/login` (footer); `/login` tanpa tautan ke login staff dan tanpa pilihan role, tanpa scroll horizontal; isian kosong → dua pesan; NIS/password salah → pesan generik; tombol "Memeriksa..." nonaktif selama request; masuk → `/dashboard`; buka `/staff/login` dan `/login` → `/dashboard`; buka `/dashboard/guru` → beranda; Keluar → `/login`. Wali `TA20250022` dengan password awal (`21092021`) → `/dashboard/ganti-password`, buka `/dashboard/tagihan` tetap ke ganti password.
- Browser, staff: guru pending → `/menunggu-persetujuan` dengan tautan kembali ke `/staff/login`; email/password salah → pesan generik; 4 percobaan salah → pesan jeda, tombol "Coba lagi dalam 57 detik" nonaktif, 3 detik kemudian 54, Enter tidak mengirim. Guru dengan `?next=/dashboard/murid` → `/dashboard/murid`; buka `/dashboard/anak` → beranda; buka `/login` → `/dashboard`; Keluar → `/staff/login`. Kepala Sekolah → beranda dengan "Perlu Tindakan".
- Browser, jeda wali sampai habis: 6 percobaan salah untuk NIS yang sama → hitungan, gaya tombol `opacity 1`, teks `#0A6E04` di atas `#E6F4E1`; setelah hitungan habis tombol kembali "Masuk", pesan jeda hilang, login berhasil.
- Belum diuji: axe dan pembaca layar untuk halaman login baru; Safari/Chromium; tampilan desktop (hanya 390 px).

### Fase 8 (branch `fe/fase-6-8`)

Dikerjakan agent lain (Gemini lewat Antigravity) dalam lima commit (`3e3c3b3`..`47beac9`), lalu direview dan diperbaiki (lihat "Review Fase 8"). Isi akhir:

File baru:

- `src/app/error.tsx`: error boundary untuk error dari layout (lihat Keputusan Fase 8).
- `README.md`: instalasi, variabel `.env`, perintah, fitur per peran, syarat deploy.
- `docs/review/fase-8/*.png`: screenshot HP 390 px Kepala Sekolah (PPDB, CMS lima tab, galeri, pengaturan lima tab, log aktivitas), desktop 1280 px (landing, login, beranda tiga peran, tagihan wali), dan halaman yang dibuka saat uji (`7a`–`7f`, hanya membuka halaman tanpa menjalankan aksi).

File yang diubah:

- `src/types/api.d.ts`: `npm run gen:api` dari `api.json` backend terbaru (`PerbaruiKegiatanRequest`, `PerbaruiMuridRequest`). Dicek ulang: generate ulang tidak mengubah file.
- `src/lib/api/kegiatan.ts`, `src/components/features/kegiatan/detail-kegiatan.tsx`: `PUT /kegiatan/{id}` mengirim JSON tanpa `kelas_id`; `useUbahKegiatan(id)` tanpa id kelas.
- `src/lib/api/murid.ts`, `src/components/features/murid/form-murid.tsx`: tipe `BodyUbahMurid`, props `FormMurid` dibedakan untuk tambah dan ubah, body dibentuk `keBody()`.
- `src/lib/api/publik.ts`: error diteruskan dan dicatat, build tanpa backend lewat `connection()`.
- `src/app/(public)/error.tsx`, `src/app/dashboard/error.tsx`: tombol Muat Ulang memakai `retry`.
- `src/components/features/beranda/kepala-sekolah/grafik-pemasukan.tsx`, `src/components/features/laporan/grafik-tagihan-bulanan.tsx`: `aria-hidden` + `accessibilityLayer={false}`.
- `src/components/features/landing/kontak.tsx`: struktur `dl` yang valid.
- `src/components/features/website/tombol-simpan-tab.tsx`: `sticky bottom-4`.
- `src/components/features/pembayaran/antrean-verifikasi.tsx`: judul kartu `h2` (axe `heading-order`).

Pengujian (build produksi `next start`, Firefox headless lewat puppeteer-core di luar repo, backend lokal):

- `lint`, `typecheck`, `check:slop` bersih. `build` bersih dengan backend hidup, dan dengan backend mati (`BE_API_URL` ke port tertutup): exit 0, 15 route publik/auth menjadi dinamis.
- Backend mati saat runtime (build tanpa backend, `next start` tanpa backend): `/`, `/pengumuman`, `/galeri/xyz`, `/ppdb`, `/login` membalas 500 dan menampilkan "Halaman belum bisa ditampilkan"; `/galeri/xyz` tidak berubah menjadi 404. Log server mencatat `Mengambil /public/... dari backend gagal`.
- Backend hidup: `/`, `/pengumuman`, `/galeri`, `/ppdb`, `/login` 200; `/galeri/tidak-ada` dan `/pengumuman/tidak-ada` 404.
- Ubah kegiatan (Kepala Sekolah, UI): `PUT /kegiatan/12` `application/json` berisi `tanggal`, `tema`, `judul`, `deskripsi` → 200, judul di backend berubah, lalu dikembalikan ke judul seeder "Praktik wudu dan salat duha" (sebelumnya tertinggal akhiran "(uji)").
- Murid (UI): tambah murid uji → `POST /murid` multipart tanpa `status`/`tanggal_keluar` → 201, NIS `TA20260031`; ubah catatan → `PUT` dengan `status` → 200; status pindah tanpa tanggal keluar → ditahan di browser dengan pesan; pindah dengan tanggal → 200 (`status=pindah`); kembali aktif → 200, `tanggal_keluar` kosong. Murid uji lalu dihapus.
- HP 390 px Kepala Sekolah: baris simpan di Website (Profil Sekolah, Program) dan Pengaturan (Rekening, PPDB) berjarak 16 px dari bawah layar, tombol aktif bisa diklik (tidak tertutup) di posisi scroll atas, tengah, bawah.
- Grafik beranda Kepala Sekolah dan laporan: `<svg>` tanpa `tabindex`/`role`, di dalam `aria-hidden`, tanpa elemen yang bisa difokus di dalamnya.
- axe-core (semua aturan bawaan, desktop 1280 px): 0 pelanggaran di `/`, `/pengumuman`, `/galeri`, `/ppdb`, `/ppdb/daftar`, `/ppdb/status`, `/login`, `/login/wali`, `/login/guru`, `/daftar-guru`; Kepala Sekolah `/dashboard`, `/dashboard/keuangan/laporan`, `/dashboard/website`, `/dashboard/pengaturan`, `/dashboard/pembayaran` (setelah perbaikan `heading-order`), `/dashboard/murid`; guru `/dashboard`, `/dashboard/rapor`, `/dashboard/kegiatan`. Halaman wali tidak diperiksa axe di review ini. axe tidak menggantikan uji pembaca layar, yang belum dilakukan.
- Uji asap wali, keyboard, dan baris sticky: lihat "Penutupan Fase 8" di bawah.

Data backend yang berubah: kegiatan 12 (judul dikembalikan), murid uji "Nadia Putri Rahmawati" (`TA20260031`, dihapus; akun wali otomatisnya nonaktif).

### Penutupan Fase 8 (branch `fe/fase-6-8`)

File yang diubah:

- `src/components/features/rapor/editor-rapor.tsx`, `src/components/features/tahun-ajaran/wizard-kenaikan.tsx`: baris simpan `sticky bottom-4`.
- `src/app/globals.css`, `src/components/layout/dashboard/{shell-dashboard,bottom-nav-wali}.tsx`: `scroll-padding` untuk topbar dan navigasi bawah wali, penanda `data-topbar-dashboard` dan `data-nav-bawah-wali`.
- `src/components/shared/zona-unggah.tsx`: fokus setelah memilih dan menghapus file.

Pengujian (build produksi `next start`, Firefox headless 390 × 844, backend lokal):

- Persiapan data: rapor semester 1 untuk Sakura Putra (`TA20250028`, TK B2) dibuat guru Endang Susilowati lewat API (draft → isi tiga elemen → ajukan) lalu diterbitkan Kepala Sekolah (rapor 19), karena tidak ada wali yang masih memakai password awal dengan rapor terbit.
- Uji asap wali `TA20250028` (masih `wajib_ganti_password`): login NIS + password awal (keyboard) → `/dashboard/ganti-password` → ganti password (keyboard, Enter) → `/dashboard/onboarding` → isi nama, nomor HP, alamat, pekerjaan → `/dashboard`. Lalu beranda, tagihan, detail tagihan 118 (terlambat), kegiatan dan detail kegiatan 10, rapor dan detail rapor 19, pengumuman, agenda, pembayaran, anak, profil, notifikasi, PPDB terbuka tanpa error.
- Unggah bukti transfer di tagihan 118: JPEG dan PNG palet (`logo-tk.png`) → `POST /tagihan/118/pembayaran` 201, toast "Bukti transfer terkirim. Sekolah akan memeriksanya.", riwayat menampilkan pembayaran. Setiap pembayaran uji ditolak Kepala Sekolah lewat API dengan alasan "Uji coba review Fase 8, bukan pembayaran sungguhan." supaya tagihan kembali `terlambat`.
- axe-core (semua aturan bawaan) di 390 px: 0 pelanggaran di `/login/wali`, `/dashboard/ganti-password`, `/dashboard/onboarding`, dan 14 halaman wali di atas; tidak ada scroll horizontal. axe dijalankan sebelum perubahan `scroll-padding` dan fokus `ZonaUnggah` (keduanya tidak mengubah markup yang diperiksa axe) dan tidak diulang sesudahnya.
- Keyboard:
  - `/login/wali`: urutan Tab logo → "Pilih jenis akun lain" → NIS anak → Password → Tampilkan password → Masuk → info pendaftaran → "Masuk dengan email"; login dengan Enter berhasil.
  - `/dashboard/ganti-password`: Password awal → Tampilkan → Password baru → Tampilkan → Ulangi → Tampilkan → Simpan Password Baru → Keluar; Enter di isian terakhir mengirim form.
  - Form bukti transfer: Tab mencapai input file (label dropzone mendapat ring hijau), tanggal (empat segmen tanggal Firefox), bank, nama pemilik, tombol kirim (ring dengan offset). Temuan dan perbaikannya: fokus hilang ke `body` setelah memilih file, dan tombol kirim tertutup navigasi bawah saat difokus. Setelah perbaikan: fokus ke "Hapus bukti-transfer.jpg" setelah memilih, Enter menghapus dan fokus kembali ke input, tombol kirim di y=456–504 (tidak tertutup), kirim dengan Enter → 201.
  - Pemilih file OS tidak bisa dibuka di browser headless; file dipasang dengan `uploadFile` setelah input difokus lewat Tab.
- Baris sticky di 390 px: editor rapor (guru `nur.aini`, rapor draft 16, setelah diubah) dan wizard kenaikan (Kepala Sekolah, dengan kelas TK B1 2027/2028 sementara) berjarak 16 px dari bawah layar; tombol aktif bisa diklik di posisi scroll atas, tengah, bawah. Kenaikan tidak disimpan.
- `lint`, `typecheck`, `check:slop` bersih; `build` bersih dengan backend hidup dan dengan backend mati.
- Belum diuji: pembaca layar sungguhan; Safari/Chromium di HP asli; halaman wali dengan lebih dari satu anak.

Data backend yang berubah: rapor 19 (Sakura, semester 1, terbit); wali `TA20250028` sudah melengkapi profil (nama "Rina Wulandari", HP, alamat, pekerjaan) lalu password-nya dikembalikan ke password awal lewat reset Kepala Sekolah (`wajib_ganti_password = true` lagi, onboarding tidak akan muncul lagi karena profil sudah lengkap); pembayaran 211–214 ditolak (tagihan 118 tetap `terlambat`); kelas TK B1 2027/2028 dibuat lalu dihapus; draft rapor 16 tidak disimpan.

## Review Fase 8

Temuan pada lima commit Gemini dan perbaikannya:

- `publik.ts` ditulis ulang dengan `try/catch` yang mengembalikan `PROFIL_CADANGAN` (NPSN, alamat, telepon, email, visi, misi, dan teks hero karangan, disalin dari seeder demo) atau daftar kosong, tanpa log. Saat runtime backend mati, landing tampil normal dengan data itu; detail yang gagal menjadi 404; `error.tsx` tidak pernah muncul. Melanggar C1 (error ditelan) dan C3 (data palsu ke publik). Diganti (Keputusan Fase 8).
- Error dari layout publik tidak pernah sampai ke `(public)/error.tsx`, jadi halaman error yang ada tidak berguna untuk kasus backend mati; ditemukan saat menguji perbaikan di atas. Ditambah `src/app/error.tsx`.
- Grafik: `aria-hidden` dihapus sehingga data terbaca dua kali. Dikembalikan dengan `accessibilityLayer={false}`.
- Kontak: `dl` diganti `p`, pasangan label–isi hilang. Dikembalikan ke `dl` yang valid.
- `TombolSimpanTab` `bottom-4`: benar, alasannya di changelog Gemini ("tidak bertabrakan dengan menu bawah") keliru.
- Kegiatan dan murid: benar dan jalan ke backend; body murid dirapikan.
- README: banyak klaim salah (lihat commit `docs(readme)`), ditulis ulang.
- Dokumentasi: status Fase 6–7 "belum direview" dihapus tanpa review; Fase 8 ditandai selesai tanpa review; "0 pelanggaran (WCAG 2.0, 2.1 Level A & AA)" padahal yang dijalankan axe otomatis; tombol `GalatMuat` disebut "Coba lagi" (sebenarnya "Muat Ulang"); wali disebut berhasil ganti password (tidak); `NEXT_PUBLIC_API_URL` di perintah build tidak ada di proyek; `TambahMuridRequest` tidak ada (namanya `SimpanMuridRequest`). Diganti catatan di atas.
- Screenshot: `4d` dan `4e` salinan `4a`, `7b` berisi layar ganti password; `7c`–`7f` bernama aksi yang tidak dijalankan. Diganti, dihapus, atau diberi nama sesuai isi.
- Tidak ditemukan: sisa kode/teks login Google di `src`, README, `.env.example`; gradien, glow, blur; `any`, `@ts-ignore`, `eslint-disable`; file sementara yang ter-commit.

### Fase 7 (branch `fe/fase-6-8`)

File baru:

- `src/app/api/revalidate/route.ts`, `src/lib/api/website.ts` (`segarkanWebsite`).
- `src/lib/api/{ppdb,galeri,log-aktivitas}.ts`, `src/lib/use-peringatan-belum-disimpan.ts`.
- `src/components/shared/kelola-foto.tsx` (dipakai kegiatan dan galeri).
- `src/components/features/ppdb-sekolah/{daftar-pendaftar,detail-pendaftaran,dokumen-pendaftaran,dialog-terima,ringkasan-ppdb}.tsx`.
- `src/components/features/website/{halaman-website,form-profil-sekolah,form-hero,form-daftar-berikon,form-fasilitas,unggah-gambar-cms,pilih-ikon,tombol-simpan-tab}.tsx`.
- `src/components/features/galeri-sekolah/{daftar-album,dialog-album,detail-album}.tsx`.
- `src/components/features/pengaturan/{halaman-pengaturan,form-rekening,form-aturan-tagihan,form-ppdb,elemen-penilaian}.tsx`.
- `src/components/features/log-aktivitas/tabel-log-aktivitas.tsx`.
- Halaman `src/app/dashboard/{ppdb/[id],website,website/galeri,website/galeri/[id],log-aktivitas}/page.tsx`.
- `docs/review/fase-6-7/*.png`: screenshot review Fase 6 dan 7.

File yang diubah:

- `src/app/dashboard/ppdb/page.tsx` (tampilan Kepala Sekolah), `src/app/dashboard/pengaturan/page.tsx` (tab).
- `src/lib/api/pengaturan-dashboard.ts`: skema zod grup profil, landing, keuangan, PPDB; `pesanErrorPengaturan()`; `useUnggahGambarPengaturan()`; simpan membuang cache publik per grup.
- `src/lib/api/{pengumuman,agenda,guru,rapor,query-keys}.ts`: revalidate website, hook elemen penilaian, key PPDB/galeri/log.
- `src/lib/constants/ikon-cms.ts` (`LABEL_IKON_CMS`), `src/types/domain.ts` (`PendaftaranDetail`).
- `src/components/features/pengaturan/form-info-wali.tsx`: melaporkan perubahan belum disimpan.
- `src/components/features/kegiatan/kelola-foto-kegiatan.tsx`: memakai `KelolaFoto`.
- `src/components/features/ppdb/pendaftaran-saya.tsx`: nama anak menaut ke detail.
- `src/components/features/landing/keunggulan.tsx`: ikon CMS di dalam bintang.

Pengujian Fase 7 (dev server lalu `next start` ke backend lokal, Firefox headless):

- `lint`, `typecheck`, `build`, `check:slop` bersih.
- PPDB: ringkasan "Dibuka, 2027/2028, sisa 36 dari 40"; tab Baru berisi 2 pendaftar. PPDB-2027-0002: verifikasi → dialog terima hanya menawarkan kelas TK A1 2027/2028 → diterima dengan NIS `TA20270002`, tertaut ke akun wali pendaftar. PPDB-2027-0003 (terverifikasi) ditolak dengan alasan → alasan tampil. Wali `TA20260001` membuka `/dashboard/ppdb/1` miliknya tanpa tombol keputusan.
- CMS: NPSN 3 angka → pesan; pindah tab saat ada perubahan → konfirmasi, batal tetap di tab; sambutan Kepala Sekolah (Tiptap) tersimpan; keunggulan kosong → "Judul wajib diisi." dan "Pilih ikon."; tiga keunggulan dengan ikon tersimpan; fasilitas dengan foto tersimpan (`gambar_url` terisi).
- CMS ke landing di `next start`: `/` memuat keunggulan, fasilitas, dan sambutan baru; subjudul pembuka diubah lalu `GET /` berikutnya langsung berisi subjudul baru (revalidate berjalan). `/api/revalidate` tanpa sesi → 401, sesi guru → 403, tag tidak dikenal → 422, origin asing → 403.
- Galeri: judul kosong → pesan; album baru → halaman detail; unggah 3 foto, keterangan, geser urutan, tampilkan di website → `/galeri/lomba-mewarnai-hari-anak-nasional` publik menampilkan album. Kelola foto kegiatan 13 tetap berjalan setelah dipindah ke `KelolaFoto`.
- Pengaturan: rekening kosong → tiga pesan; tambah rekening kedua → tersimpan (2), dihapus lagi → 1. Jatuh tempo 30 → "Antara tanggal 1 dan 28." (tidak disimpan). PPDB dibuka tanpa tahun ajaran → pesan (tidak disimpan). Elemen: kode "uji coba" → pesan format; "MOTORIK" ditambahkan lalu dihapus; hapus Jati Diri → pesan backend "sudah dipakai di rapor ...".
- Log aktivitas: saringan jenis Pengaturan menampilkan "Mengubah pengaturan: keuangan.rekening".
- Data backend yang berubah: pendaftaran 2 diterima (murid 64 `TA20270002`), pendaftaran 3 ditolak, `profil.npsn` 20328765, `profil.sambutan_kepsek`, subjudul pembuka, tiga keunggulan, fasilitas Taman bermain, album galeri 3 (publik, 3 foto).
- Catatan lingkungan: di tengah sesi laptop restart; server backend dijalankan ulang dengan `php artisan serve` (tanpa migrate/seed dan tanpa mengubah kode backend), dan harness uji di `/tmp` dibuat ulang.

### Fase 6 (branch `fe/fase-6-8`)

File baru:

- `src/lib/api/{kegiatan,rapor,pengumuman,agenda,wali}.ts`: hook React Query per modul; `src/lib/{rapor,pengumuman}.ts`: nama file PDF rapor, periode, label sasaran pengumuman.
- `src/components/shared/editor-teks.tsx`: editor Tiptap bersama.
- `src/components/features/kegiatan/{kartu-kegiatan,feed-kegiatan,form-kegiatan,tambah-kegiatan,detail-kegiatan,kelola-foto-kegiatan}.tsx`.
- `src/components/features/rapor/{daftar-rapor-wali,rapor-kelas,review-rapor,rapor-kepala-sekolah,detail-rapor,editor-rapor,foto-elemen-rapor,tampilan-rapor,aksi-rapor,tombol-pdf-rapor}.tsx`.
- `src/components/features/pengumuman/{feed-pengumuman,detail-pengumuman,form-pengumuman,pilih-kelas,pengumuman-baru,ubah-pengumuman}.tsx`.
- `src/components/features/agenda/{kalender-agenda,form-agenda,halaman-agenda}.tsx`.
- Halaman `src/app/dashboard/{kegiatan,kegiatan/baru,kegiatan/[id],rapor,rapor/[id],pengumuman,pengumuman/baru,pengumuman/[id],pengumuman/[id]/ubah,agenda}/page.tsx`.

File yang diubah:

- `src/lib/api/query-keys.ts` (key kegiatan, rapor, elemen penilaian, pengumuman, agenda), `src/lib/api/kelas.ts` (`useKelasAktif`), `src/lib/tanggal.ts` (`geserBulan`, `hariDalamBulan`), `src/lib/constants/status.ts` (`NADA_JENIS_AGENDA`), `src/types/domain.ts` (`RaporDetail`, `ElemenPenilaian`).
- `src/components/features/galeri/grid-foto-galeri.tsx`: prop `privat` dan `keteranganDiBawah` untuk foto kegiatan.
- `src/components/features/wali/daftar-anak.tsx`: memakai `useAnakWali`.
- `src/components/features/laporan/daftar-tunggakan.tsx`: tombol Kirim Pengumuman di samping total.

Screenshot review Fase 6 dan 7 ada di `docs/review/fase-6-7/`: `1-feed-kegiatan-wali-hp`, `1b-detail-kegiatan-wali-hp`, `2a-rapor-kelas-guru`, `2-editor-rapor-guru`, `3-review-rapor-kepala-sekolah`, `3b-review-rapor-detail`, `4-form-pengumuman`, `5-kalender-agenda`, `5b-kalender-agenda-wali-hp`, `6a-daftar-ppdb`, `6-review-ppdb`, `7-cms-website-keunggulan`, `7b-cms-website-profil`, `7c-landing-hasil-cms` (diambil dari `next start`).

Pengujian Fase 6 (dev server ke backend lokal, Firefox headless):

- `lint`, `typecheck`, `build`, `check:slop` bersih.
- Kegiatan (guru `nur.aini`): kirim kosong → "Pilih kelas." dan "Judul kegiatan wajib diisi."; simpan dengan 3 foto (kegiatan 13) → detail; keterangan foto 1 tersimpan; geser foto 1 ke bawah → urutan berubah; hapus foto 3 → sisa 2; ubah judul → "Kegiatan tersimpan."; lightbox terbuka, panah kanan pindah ke foto 2.
- Rapor (guru `nur.aini`, TK A1): ringkasan "15 murid · ... · 12 belum dibuat"; Buat Draft (rapor 19, Aurora); ajukan kosong → pesan backend "Lengkapi deskripsi elemen ..." di dialog; tinggi 300 → "Tinggi badan antara 50 dan 200."; isi tiga elemen, foto elemen, catatan → tersimpan → diajukan (editor hilang).
- Rapor (Kepala Sekolah): tab Menunggu Review 5; di rapor 19 Terbitkan nonaktif selama ada perubahan; Simpan Perbaikan → Terbitkan → Terbit. Minta revisi rapor 10 dengan catatan → catatan tampil. Tarik rapor 1 tanpa catatan → "Catatan untuk guru wajib diisi."; dengan catatan → Perlu revisi.
- Wali `TA20250001`: sebelum ditarik rapor 1 bisa dibuka dan PDF 200; sesudah ditarik → kotak "Rapor ini belum bisa dibuka" (HP).
- Pengumuman: dari Tunggakan (TK A1) → 6 murid terpilih, judul dan isi terisi → terbit (pengumuman 8, "Untuk: 6 murid"). Form kosong → dua pesan; target kelas tanpa kelas → "Pilih minimal satu kelas."; daftar poin lewat toolbar tersimpan sebagai `<ul><li>`; draft (pengumuman 9) → ubah → terbit. Guru `sri.wahyuni` hanya melihat opsi Kelas tertentu dan Murid tertentu. Wali `TA20260001` melihat pengingat di feed, tanpa draft.
- Agenda (Kepala Sekolah): tanggal selesai sebelum mulai dan judul kosong → dua pesan; tambah agenda 9 Oktober → pilih tanggal 9 menyaring daftar; ubah jenis; hapus. Wali di HP melihat Desember 2026 tanpa tombol tambah dan tanpa badge Internal.
- Tidak ada error konsol browser selama pengujian di atas.
- Data backend yang berubah: kegiatan 13 (TK A1, 2 foto), rapor 19 terbit, rapor 10 revisi, rapor 1 ditarik (revisi), pengumuman 8 dan 9 terbit.

### Fase 5 (branch `fe/fase-4-5`)

File baru:

- `src/lib/api/{tagihan,pembayaran,jenis-tagihan,keringanan,laporan,segarkan-keuangan}.ts`.
- `src/components/shared/pilih-murid.tsx`.
- `src/components/features/tagihan/{tagihan-wali,tabel-tagihan,detail-tagihan,aksi-tagihan,rekening-sekolah,form-bukti-transfer,riwayat-pembayaran,dialog-ubah-tagihan,dialog-catat-pembayaran,dialog-tagihan-sekali,dialog-generate-tagihan,tagihan-murid}.tsx`.
- `src/components/features/pembayaran/{pembayaran-sekolah,pembayaran-wali,antrean-verifikasi,riwayat-pembayaran-sekolah,aksi-verifikasi,bukti-transfer,tombol-kwitansi}.tsx`.
- `src/components/features/keuangan/{daftar-jenis-tagihan,form-jenis-tagihan,daftar-keringanan,form-keringanan}.tsx`, `src/components/features/laporan/{laporan-keuangan,grafik-tagihan-bulanan,daftar-tunggakan}.tsx`.
- Halaman `src/app/dashboard/{tagihan,tagihan/[id],pembayaran,keuangan/jenis-tagihan,keuangan/keringanan,keuangan/laporan,keuangan/tunggakan}/page.tsx`.

File yang diubah:

- `src/lib/api/query-keys.ts` (key keuangan), `src/lib/tagihan.ts` (`tagihanTerbuka()`), `src/app/globals.css` (`--grafik-terbayar`, `--grafik-belum`).
- `src/app/dashboard/murid/[id]/page.tsx`: bagian tagihan di detail murid. `src/components/features/kelas/tambah-murid-kelas.tsx`: memakai `PilihMurid`.
- `src/components/features/beranda/kepala-sekolah/perlu-tindakan.tsx`: guru menunggu persetujuan membuka `/dashboard/guru?status=pending`.

Pengujian Fase 5 (dev server ke backend lokal, Firefox headless):

- `lint`, `typecheck`, `build`, `check:slop` bersih (build sempat gagal di prerender `/login` saat backend mati setelah laptop restart, lalu lolos setelah backend hidup lagi). Uji setelah restart memakai `next start`.
- Alur bayar sampai lunas pada tagihan 181 (Uang Kegiatan Rika, `terlambat`): wali `TA20260001` di HP membuka detail tagihan, kirim kosong → "Unggah foto atau tangkapan layar bukti transfer." dan "Bank pengirim wajib diisi."; unggah foto + bank BRI → toast "Bukti transfer terkirim...", status Menunggu verifikasi. Kepala Sekolah: tab Menunggu Verifikasi menunjukkan 6; terima di detail tagihan → Lunas, pembayaran Diterima; Unduh Kwitansi → 200 `application/pdf`.
- Catat tunai tagihan 129 (Nardi) → "Pembayaran Rp 150.000 tercatat, tagihan lunas.".
- Ubah tagihan 130 (Endra): potongan Rp 200.000 → "Potongan paling besar Rp 150.000."; jatuh tempo 1 September → "Jatuh tempo baru paling cepat hari ini."; jatuh tempo 10 Oktober 2026 → status kembali Belum dibayar.
- Batalkan tagihan 139 (Pia) tanpa alasan → pesan wajib; dengan alasan → Dibatalkan; aktifkan kembali → toast "aktif kembali dan berstatus terlambat". Catatan tagihan itu sekarang berisi alasan uji (backend tidak menghapus catatan saat aktifkan).
- Tolak satu bukti di antrean dengan alasan → antrean 5 → 4, riwayat tersaring status Ditolak lewat `?tab=riwayat&status=ditolak`.
- Tagihan sekali bayar: validasi jenis, kelas, jatuh tempo; Uang Kegiatan untuk Rika → "0 tagihan dibuat, 1 murid dilewati...". Generate September 2026 → "0 tagihan dibuat, 60 dilewati karena sudah ada." (tidak menambah data).
- Laporan: ringkasan dan tabel tampil (83% lunas), Unduh Excel → 200 `.xlsx`, rentang terbalik → pesan di field. Tunggakan: 23 murid, total Rp 5.850.000. Jenis tagihan: validasi form. Keringanan: validasi form, persen 150 ditolak di browser, 50% untuk Nardi tersimpan lalu dihapus.
- Guru petugas keuangan `siti.rahmawati`: tombol Buat Tagihan Sekali Bayar ada, Generate tidak; antrean pembayaran terbuka; detail tagihan punya Catat Pembayaran dan Ubah Tagihan tanpa Batalkan; `/dashboard/keuangan/jenis-tagihan` → beranda. Guru biasa `nur.aini`: tagihan TK A1 saja (60 tagihan), detail tanpa tombol aksi, `/dashboard/pembayaran` → beranda.
- Tidak ada error di konsol browser selama uji Kepala Sekolah.
- Data backend yang berubah karena pengujian Fase 5: tagihan 181 dan 129 lunas, tagihan 130 jatuh tempo 10 Oktober, catatan tagihan 139, satu bukti transfer seed ditolak.
- Perbaikan setelah melihat screenshot: kartu total di `/dashboard/tagihan` wali memerah kalau ada tagihan terlambat (sama dengan beranda); judul kolom "L/P" di tabel murid menjadi "Jenis kelamin".
- Belum diuji: tambah/ubah jenis tagihan sampai tersimpan, tagihan sekali bayar yang benar-benar membuat tagihan baru, catat transfer dengan bukti oleh petugas, wali unggah ulang setelah ditolak, tampilan HP halaman petugas keuangan.

Screenshot review ada di `docs/review/fase-4-5/` (diambil dari `next start`, Firefox headless): `1-login-wali-hp`, `2-ganti-password-wajib-hp`, `3-ppdb-publik-hp`, `4-tabel-murid`, `5-detail-murid`, `6-antrean-verifikasi`, `7-tagihan-wali-hp`, `7b-detail-tagihan-wali-hp`, `8-laporan-keuangan`.


File baru:

- `src/components/ui/{table,switch}.tsx`: mengikuti pola shadcn (ditulis manual).
- `src/components/shared/{tabel-data,paginasi,dialog-konfirmasi,kolom-cari,saring-segmen,tombol-salin}.tsx`.
- `src/lib/api/{tahun-ajaran,kelas,guru,murid,wali-murid,pengaturan-dashboard,unduh}.ts`: hook React Query per modul dengan invalidasi silang (misalnya simpan murid → murid, kelas, wali murid, dashboard).
- `src/components/features/tahun-ajaran/{daftar-tahun-ajaran,form-tahun-ajaran,wizard-kenaikan,kenaikan-per-kelas,penempatan-kenaikan}`.
- `src/components/features/guru/{daftar-guru,detail-guru,form-guru,tambah-guru,aksi-persetujuan-guru}.tsx`.
- `src/components/features/kelas/{daftar-kelas,detail-kelas,form-kelas,tambah-murid-kelas}.tsx`.
- `src/components/features/murid/{daftar-murid,detail-murid,form-murid,tambah-murid,ubah-murid,kartu-akun-murid,wali-tertaut}.tsx`.
- `src/components/features/wali-murid/{daftar-wali-murid,detail-wali-murid,form-ubah-wali}.tsx`.
- `src/components/features/pengaturan/form-info-wali.tsx`.
- Halaman di `src/app/dashboard/{guru,tahun-ajaran,kelas,murid,wali-murid,pengaturan}/` (lihat peta route).

File yang diubah:

- `src/lib/api/query-keys.ts`: key guru, tahun ajaran, kelas, murid, wali murid, pengaturan. `src/lib/halaman.ts`: `idDariParam()` (id bukan bilangan bulat positif → 404).
- `src/components/features/notifikasi/daftar-notifikasi.tsx`: memakai `SaringSegmen` dan `Paginasi`. `src/components/features/ppdb/daftar-ppdb-publik.tsx`: memakai `TombolSalin`.
- `eslint.config.mjs`: `react-hooks/incompatible-library` dimatikan dengan alasan di komentar.

Pengujian Fase 4 (dev server ke backend lokal, Firefox headless; Kepala Sekolah, guru `nur.aini`):

- `lint`, `typecheck`, `build`, `check:slop` bersih.
- Sepuluh halaman Kepala Sekolah (guru, guru pending, tahun ajaran, kelas, murid, wali murid, pengaturan, kenaikan, tambah guru, tambah murid) memuat tanpa error konsol.
- Kartu akun Rika (`TA20260001`): `GET /api/proxy/murid/1/kartu-akun` 200 `application/pdf`. Bella (`TA20250004`, akun otomatis nonaktif): pesan backend "Tidak ada akun wali aktif dengan username TA20250004. ..." tampil di kartu.
- Tautan wali Rika: hubungan Iriana diubah ke Wali lalu kembali ke Ibu; kontak utama dipindah ke Iriana lalu kembali ke Joko.
- Reset password wali `TA20250022`: dialog menyebut tanggal lahir Jaga; setelah reset, detail menampilkan "Wali masih memakai password awal". Akun itu kembali ke password `31102021`.
- Guru Dwi Lestari: email kosong → "Email wajib diisi."; simpan data tanpa perubahan → "Data guru tersimpan.".
- Kelas: validasi nama/kelompok, pendamping sama dengan wali kelas ditolak di browser; kelas uji TK B1 di 2027/2028 dibuat, wizard kenaikan 2026/2027 → 2027/2028 menampilkan 60 murid dengan saran TK B1, lalu kelas uji dihapus. Tanpa kelas tujuan → "Belum ada kelas di Tahun Ajaran 2027/2028.". Kenaikan tidak disimpan supaya data demo tetap.
- Banner: judul kosong saat aktif → pesan; judul diubah dan disimpan, lalu dikembalikan ke judul semula (dicek lewat `GET /pengaturan`).
- Guru `nur.aini`: `/dashboard/murid` hanya TK A1 (tampilan kartu di HP), `/dashboard/kelas` hanya TK A1 tanpa tombol tambah, `/dashboard/wali-murid` → beranda dengan pesan tidak punya akses.
- Belum diuji: tambah guru dan tambah murid sampai tersimpan (supaya tidak menambah akun demo), persetujuan/penolakan guru pending, nonaktifkan guru/wali, simpan kenaikan kelas, hapus murid, keluarkan murid, dan unggah foto guru/murid.

### Penyesuaian login wali NIS (branch `fe/fase-4-5`, sebelum Fase 4)

Backend mengganti login Google dengan login NIS anak + password, menghapus kode tautan, dan membuka PPDB tanpa login (Bagian A, commit `1d8355c` di `main`, sudah di-merge).

File baru:

- `src/app/api/auth/login-wali/route.ts`: BFF `POST /auth/login-wali` (menggantikan `api/auth/google`).
- `src/components/features/auth/{form-login-wali,tombol-keluar}.tsx`: form NIS + password (NIS dinormalkan huruf besar tanpa spasi), tombol keluar untuk halaman tanpa menu.
- `src/app/dashboard/ganti-password/page.tsx`, `src/components/layout/dashboard/kerangka-tanpa-menu.tsx`: halaman ganti password wajib; kerangka tanpa menu dipakai bersama onboarding.
- `src/components/features/wali/form-tambah-anak.tsx` (menggantikan `form-tautkan-anak.tsx`): `POST /wali/tambah-anak`. NIS/tanggal lahir salah → pesan backend di field NIS; anak sudah tertaut/tidak aktif dan batas percobaan → kotak pesan.
- `src/components/features/ppdb/`: `form-pendaftaran` (4 langkah: data anak, orang tua, dokumen, periksa), `langkah-{data-anak,orang-tua,dokumen}`, `ringkasan-pendaftaran`, `penanda-langkah`, `skema-pendaftaran` (aturan sama dengan `BuatPendaftaranRequest`), `daftar-ppdb-publik`, `daftar-ppdb-wali`, `cek-status-ppdb`, `hasil-status-ppdb`, `pendaftaran-saya`.
- `src/app/(public)/ppdb/{daftar,status}/page.tsx`, `src/app/dashboard/ppdb/{page,daftar/page}.tsx`.
- `src/components/shared/{zona-unggah,kolom-radio}.tsx`, `KolomPilih` di `kolom-teks.tsx`, `src/lib/api/multipart.ts` (`keFormData`).
- Dari branch lokal `simpan/banner-data-wali` (cherry-pick `588a511`, branch sudah dihapus): `src/components/features/beranda/wali/info-sekolah.tsx` (banner `info_sekolah`, isi teks biasa dengan baris baru), `src/components/features/wali/form-data-wali.tsx` (alamat, pekerjaan, NIK di profil).

File yang dihapus: `src/app/api/auth/google/route.ts`, `src/components/features/auth/masuk-google.tsx`, `src/components/features/wali/form-tautkan-anak.tsx`; paket `@react-oauth/google`; variabel `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

File yang diubah:

- `src/types/api.d.ts`: generate ulang. `scripts/gen-api.mjs` sekarang memakai API Node openapi-typescript dengan `transform`: field `format: binary` menjadi `Blob` (`Blob | null` kalau nullable), supaya `File` bisa masuk body multipart tanpa cast. Selain 20 baris itu isinya sama dengan hasil CLI.
- `src/lib/auth/{masuk,bff,path}.ts`, `src/components/providers.tsx`, `src/app/dashboard/layout.tsx`: login NIS, `tujuanSetelahMasuk()` dengan ganti password wajib, `RUTE_GANTI_PASSWORD`, penanganan `PASSWORD_WAJIB_DIGANTI`. `src/types/domain.ts`, `src/lib/api/errors.ts`: kode error baru, alias `Pendaftaran`, `PendaftaranPublik`.
- `src/components/features/profil/form-ganti-password.tsx`: prop `wajib` (label "Password awal", setelah berhasil ambil ulang `/auth/me` lalu lanjut ke onboarding/beranda). `form-profil.tsx`: username NIS untuk wali, `skemaNama`.
- `src/components/features/wali/{form-onboarding,form-data-wali}.tsx`: `PUT /wali/profil` wajib `nama` dan `no_hp`. Onboarding menambah kolom nama (terisi nama sementara "Wali ..."); form data wali mengambil nama dan nomor HP dari sesi.
- `src/app/dashboard/profil/page.tsx`: catatan "Masuk dengan Google" dihapus, ganti password untuk semua role.
- `src/app/(auth)/login/{page,wali/page,guru/page}.tsx`, `lupa-password/page.tsx`, `src/app/(public)/ppdb/page.tsx`, `beranda-wali.tsx`, `anak-switcher.tsx`, `daftar-anak.tsx`, `src/app/dashboard/anak/page.tsx`: teks login NIS, Tambah Anak, dan PPDB publik.
- `src/lib/gambar.ts`: `kompresGambar()` membungkus hasil menjadi `File` (browser-image-compression kadang mengembalikan Blob biasa, yang membuat validasi `instanceof File` gagal tanpa pesan). `src/lib/constants/label.ts`: `HUBUNGAN`, `OPSI_HUBUNGAN`, `OPSI_JENIS_KELAMIN`, `AGAMA`.
- `PROMPT_FE_TK.md`: B1, B2, B3, B4, B6, contoh pesan C3, glosarium C4 (baris Kode Tautan dihapus mengikuti backend), fase di D.

Keputusan:

- Halaman ganti password wajib ada di dalam `/dashboard` (bukan grup auth) karena butuh sesi dan dijaga layout yang sama.
- `/dashboard/ppdb` untuk Kepala Sekolah masih 404 (Fase 7); bagian wali dibuat sekarang karena diminta bersama PPDB publik.
- Tombol "Lanjut" dan "Kirim Pendaftaran" diberi `key` berbeda. Tanpa itu React memakai ulang elemen tombol yang sama dan mengubah `type` menjadi `submit` di tengah klik, sehingga "Lanjut ke Periksa" langsung mengirim form (ditemukan saat uji; pendaftaran uji PPDB-2027-0006 sampai 0010 terkirim karena bug ini).
- Pilihan agama memakai enam agama di data kependudukan (`AGAMA`); backend menyimpannya sebagai teks bebas maksimal 20 karakter.

Pengujian (dev server ke backend lokal, Firefox 155 headless lewat puppeteer-core di luar repo):

- `lint`, `typecheck`, `build`, `check:slop` bersih.
- Login wali: kosong → "NIS anak wajib diisi." dan "Password wajib diisi."; `ta2026 0001` + password salah → "NIS atau password salah." dari backend; `TA20260001`/`wali2026` → beranda.
- Ganti password wajib (akun `TA20250022`, password awal `31102021`): login → `/dashboard/ganti-password`; membuka `/dashboard/tagihan` dan `/dashboard/onboarding` kembali ke halaman itu; `/api/proxy/dashboard` → 403 `PASSWORD_WAJIB_DIGANTI`. Setelah ganti → onboarding (nama terisi "Wali Jaga"; kosong → empat pesan field) → beranda dengan banner info sekolah.
- Tambah anak (akun yang sama): tanggal lahir salah → pesan di field NIS; anak sendiri → kotak pesan "Jaga sudah tertaut ke akun Anda."; `TA20250023` benar → toast, kartu anak kedua muncul.
- PPDB publik: validasi langkah 1 (tujuh pesan), dokumen kosong (tiga pesan), file teks ditolak, PDF ditolak di kolom pas foto, NIK yang sudah terdaftar → pesan backend, batas 3 per jam → pesan 429 backend, kirim berhasil → kode `PPDB-2027-0011`. Cek status: tanggal salah → pesan tidak cocok; `0011` → Diajukan; `0004` → ditolak dengan alasan; `0005` → "Selamat, pendaftaran diterima. ...".
- Wali `TA20260001` di `/dashboard/ppdb` melihat pendaftarannya (`PPDB-2027-0001`); form `/dashboard/ppdb/daftar` terbuka. Kiriman dari dashboard wali tidak diuji supaya tidak menambah data demo.
- Data backend yang berubah karena pengujian: `TA20250022` sudah ganti password (sekarang `31102021a`) dan profilnya "Slamet Riyadi"; `TA20250023` ditambahkan ke akun itu sehingga akun otomatis `TA20250023` dinonaktifkan backend; pendaftaran PPDB uji `PPDB-2027-0006` sampai `0011` (semua "Aisyah", status diajukan). Akun `TA20250030` tidak disentuh.

### Sebelum Fase 4 (branch `fe/fase-4-5`)

- `src/types/api.d.ts`: generate ulang dari `api.json` backend hasil revisi audit. Skema detail punya nama sendiri (`TagihanDetailResource`, `MuridDetailResource`, `KelasDetailResource`, `RaporDetailResource`, `PendaftaranDetailResource`, `WaliMuridDetailResource`, `GaleriAlbumDetailResource`, `RiwayatPembayaranResource`), field relasi yang selalu dikirim wajib, tanpa `allOf`.
- `src/types/domain.ts`: alias skema baru (guru, tahun ajaran, kelas, murid, wali murid, jenis tagihan, keringanan, tagihan, pembayaran beserta bentuk detailnya, `NadaInfo`) dan `DataRespons<operasi>` untuk `data` respons tanpa skema bernama (`Dashboard`, `LaporanKeuangan`, `LaporanTunggakan`).
- `src/lib/api/dashboard.ts`: tipe dashboard dari `Dashboard` di `domain.ts`, bukan dari `ReturnType` pemanggilan.
- `src/lib/api/query-string.ts`: boolean tidak lagi diubah ke `1`/`0`; string kosong tidak dikirim.
- `PROMPT_FE_TK.md`: baris "Password | Kata sandi" di glosarium C4. `scripts/check-slop.sh`: menolak "kata sandi" di `src`.

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
- Belum diuji: notifikasi di wali/guru (data demo tidak punya notifikasi untuk mereka), ganti password yang berhasil (sengaja tidak dijalankan supaya akun demo tetap `guru2026`), tampilan dengan foto murid (data demo tanpa foto), pembaca layar, Safari/Firefox. Tautan kartu ke halaman fase 4–7 (kegiatan, pengumuman, tagihan, rapor) masih 404.

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
- Belum diuji: tampilan dengan sambutan, fasilitas, keunggulan, logo, gambar hero, dan peta dari CMS (kosong di data demo), tampilan dengan foto guru (data demo tanpa foto). Pembaca layar belum dicoba; yang sudah dipastikan: label form terhubung ke input, pesan error terhubung lewat `aria-describedby`, tautan "Lewati ke konten", fokus terlihat.

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
- Belum diuji: unggahan multipart lewat proxy (diuji saat fitur unggah dibuat).
