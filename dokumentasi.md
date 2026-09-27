# Dokumentasi Frontend TK Tarbiyathul Athfal 8

Website publik dan dashboard sistem informasi TK Tarbiyathul Athfal 8 (TK Muslimat NU Kota Semarang). Acuan desain dan kontrak API: `PROMPT_FE_TK.md`. Backend Laravel ada di repo terpisah (`../TK_TA8_BE`), dengan dokumentasi di `../TK_TA8_BE/dokumentasi.md`.

## Status

| Fase | Status |
|---|---|
| 0. Analisis | Selesai, rencana disetujui (Arah desain A "Buku Cerita") |
| 1. Fondasi | Selesai |
| 2. Publik & auth | Selesai, menunggu review desain (C7) |
| 3. Shell dashboard | Belum |
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

- `src/proxy.ts` (matcher `/dashboard/:path*` dan `/login`): tanpa cookie `tk_token` ke `/dashboard/*` → `/login?next=...`; sudah punya cookie buka `/login` → `/dashboard`. `/api` sengaja tidak dicocokkan karena proxy Next.js membatasi body 10 MB (`proxyClientMaxBodySize`), sedangkan unggahan kegiatan bisa lebih besar.
- `src/app/dashboard/layout.tsx` memanggil `ambilSesi()` (`GET /auth/me`, di-cache per request). Token ditolak (401 atau `ACCOUNT_*`) → `/api/auth/sesi-habis`.
- Otorisasi sebenarnya tetap di backend.

### Data fetching

- Browser: `api` (`src/lib/api/client.ts`), openapi-fetch dengan `paths` dari `api.d.ts` dan `baseUrl: "/api/proxy"`. `ambilData()` mengubah hasilnya menjadi data atau melempar `ApiError`.
- Server Component: `apiServer({ token, revalidate, tags })` (`src/lib/api/server.ts`). Opsi cache Next.js dipasang lewat `fetch` kustom, karena openapi-fetch membungkus request dalam objek `Request` dan opsi `next` di dalamnya tidak terbaca fetch Next.js.
- React Query: `staleTime` 60 detik (jauh di bawah masa berlaku signed URL 30 menit), tidak mencoba ulang error 4xx. Error 401 di query atau mutation mana pun mengosongkan cache lalu mengarahkan ke `/login?next=`.
- Sesi di React Query dengan key `['me']`, diisi dari server lewat `HydrationBoundary` di layout dashboard. `useSession()` → `{ user, role, isSuperAdmin, isGuru, isWali, bisaKelolaKeuangan }`.
- Error terpusat di `src/lib/api/errors.ts`: `ApiError { status, code, message, errors }`, `pesanError()` untuk toast, `terapkanErrorValidasi()` memasang `errors` VALIDATION_ERROR ke field react-hook-form.

## Keputusan Fase 2

- Teks UI memakai sapaan "Anda", sama dengan pesan dari backend, supaya satu layar tidak mencampur "kamu" dan "Anda". (B3 memberi contoh "Kamu tidak punya akses"; menunggu konfirmasi.)
- Data publik diambil di Server Component lewat `src/lib/api/publik.ts` dengan `revalidate` 300 detik dan tag per jenis data. `ambilProfilSekolah()` dibungkus `cache()` React karena dipanggil layout dan halaman.
- Bentuk `GET /public/profil` divalidasi dengan zod (`src/lib/api/pengaturan.ts`) lalu diubah ke objek `ProfilSekolah`. String kosong dianggap belum diisi, jadi NPSN, peta, dan sambutan yang kosong di data demo tidak memunculkan elemen kosong.
- Identitas "TK Muslimat NU Kota Semarang" tidak ada di kunci pengaturan A4, jadi disimpan sebagai konstanta `NAUNGAN_SEKOLAH` dan ditampilkan di footer, bagian profil, dan panel halaman auth.
- Hero tanpa gambar CMS menampilkan logo sekolah di panel hijau muda. Foto guru yang belum diunggah diganti inisial nama. Fasilitas tanpa foto diberi label "Foto fasilitas belum diunggah".
- Foto Kepala Sekolah di sambutan diambil dari `/public/guru` dengan jabatan "Kepala Sekolah" (backend menaruhnya paling depan).
- Agenda di landing: agenda publik bulan ini dan bulan depan yang belum selesai (dibanding tanggal hari ini di Asia/Jakarta), paling banyak 4, disaring per id karena agenda lintas bulan muncul di dua bulan.
- Galeri terbaru: komposisi mengikuti jumlah album (2 kolom sama besar untuk 1–2 album, mosaik untuk 3 atau 5 album).
- Ikon program/keunggulan dari CMS dibatasi ke daftar `IKON_CMS` (28 ikon lucide, kunci kebab-case). Nama di luar daftar tidak ditampilkan. Daftar ini juga menjadi pilihan ikon di CMS Fase 7.
- Peta hanya ditampilkan untuk URL `https` dengan host `www.google.com` atau `maps.google.com`.
- HTML dari CMS/pengumuman dirender apa adanya (`KontenHtml`) karena backend sudah menyanitasinya dengan Purify; gayanya di kelas `.konten-html` (`globals.css`).
- Skeleton `loading.tsx` hanya dipasang di route group `pengumuman/(daftar)` dan `galeri/(daftar)`. Kalau dipasang di level `(public)`, halaman detail sudah mengirim status 200 sebelum `notFound()` dipanggil, sehingga slug yang tidak ada tidak membalas 404.
- Login: tab disimpan di query `?tab=` (nuqs) supaya halaman lain bisa menautkan langsung ke tab guru. Kode `ACCOUNT_PENDING` → `/menunggu-persetujuan`; `ACCOUNT_REJECTED`, `ACCOUNT_INACTIVE`, dan `TOO_MANY_REQUESTS` ditampilkan di atas form dengan pesan dari backend (termasuk alasan penolakan dan lama tunggu); `VALIDATION_ERROR` dipasang ke field.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` kosong → tab wali menampilkan pesan bahwa login Google belum disiapkan sekolah, tanpa memuat script Google.
- Validasi form di browser mengikuti aturan backend (`src/lib/auth/skema.ts`): password minimal 8 karakter berisi huruf dan angka, nomor HP diawali 08 dengan 10–15 angka. Backend tetap pemeriksa akhir.
- Pendaftaran guru, lupa password, dan reset password memanggil backend lewat `/api/proxy` (endpoint publik tanpa token).

## Temuan kontrak dari `api.json`

- Field `meta` pada 18 endpoint berpaginasi bertipe `string` di OpenAPI, padahal backend mengirim angka. FE memakai tipe `MetaPaginasi` (angka) di `src/types/domain.ts` dan menormalisasinya lewat `normalisasiMeta()`. Perlu diperbaiki di anotasi Scramble backend.
- `GET /public/profil` (dan `GET /pengaturan`) bertipe `{ [key: string]: unknown }`. FE memvalidasinya dengan zod di `src/lib/api/pengaturan.ts` mengikuti kunci pengaturan A4.
- `data` di `GET /dashboard` berupa `anyOf` tiga bentuk tanpa penanda role; bentuknya dipilih lewat role dari sesi (Fase 3).
- `AnakWaliResource.kelas.id` bertipe `string` di OpenAPI, sedangkan di tempat lain id kelas bertipe `number`.
- Enum `StatusKelasMurid` (A5) tidak diekspor sebagai skema, jadi ditulis manual di `domain.ts`.

## Desain visual

Arah A "Buku Cerita", disesuaikan dengan logo sekolah (`public/logo-tk-asli.jpeg`: hijau NU sekitar `#0D8905`, kuning bintang sekitar `#FFF001`).

| Token | Nilai | Kontras | Dipakai untuk |
|---|---|---|---|
| `primary` | `#0A7A0A` | putih di atasnya 5,52:1; di atas `background` 5,21:1 | tombol utama, tautan, fokus |
| `primary-strong` | `#075F0B` | putih 7,92:1 | hover tombol, teks status lunas |
| `primary-soft` | `#E7F3E4` | teks `primary-strong` di atasnya 6,9:1 | latar badge, sorotan |
| `highlight` | `#F9D923` | teks `highlight-foreground` `#3A3000` 9,35:1 | pita PPDB, garis bawah judul, tombol CTA kuning |
| `highlight-soft` | `#FFF7CC` | | latar info kuning |
| `background` | `#FBF8F1` | teks `foreground` `#1F2A24` 13,99:1 | latar halaman (krem) |
| `card` | `#FFFFFF` | | kartu |
| `muted-foreground` | `#5F6B63` | 5,25:1 di atas `background` | teks sekunder |
| `border` / `input` | `#E4DFD3` / `#D6D0C2` | | garis |
| `destructive` | `#B42318` | putih 6,57:1 | aksi hapus, status terlambat |

Warna logo asli (`#0D8905`) hanya 4,57:1 dengan teks putih, terlalu tipis untuk teks kecil, jadi `primary` digelapkan sedikit dengan rona yang sama. Kuning logo (`#FFF001`) hampir tidak terlihat di atas latar krem, jadi `highlight` dibuat sedikit lebih hangat dan pekat.

Warna status (`src/lib/constants/status.ts`, token `status-*`): sukses `#075F0B`/`#E7F3E4`, menunggu `#8A5A00`/`#FDF1D3`, bahaya `#B42318`/`#FDE8E6`, proses `#3E5C76`/`#E6EDF3`, netral `#5F6B63`/`#EEEDE8`. Semua di atas 4,5:1.

- Font: judul Fraunces (sumbu `SOFT` 100 dan `opsz`), teks Plus Jakarta Sans, keduanya lewat `next/font/google`.
- Skala tipografi 6 ukuran (Tailwind `--text-*` direset): `xs` 12, `sm` 14, `base` 16, `lg` 20, `xl` 28, `2xl` 40 px.
- Radius: `--radius` 12 px (kartu); `rounded-md` 10 px (tombol, input); `rounded-sm` 6 px.
- Bayangan dua tingkat (`--shadow-*` direset): `shadow-sm`, `shadow-md`.
- Spasi memakai skala bawaan Tailwind (kelipatan 4 px).
- Fokus: outline 2 px warna `ring`. `prefers-reduced-motion` mematikan animasi dan transisi.
- Light mode saja; blok `.dark` bawaan shadcn dihapus.
- Logo: `public/logo-tk.png` (512 px, latar transparan, dipotong mengikuti lingkaran) untuk cadangan kalau `profil.logo` di CMS belum diisi. Favicon dari logo yang sama: `src/app/favicon.ico` (16/32/48), `src/app/icon.png` (192), `src/app/apple-icon.png` (180, latar putih).
- Nama sekolah selalu dari `profil.nama_sekolah`. Nilai tetap hanya ada di metadata default `src/app/layout.tsx` sebagai cadangan.

## Peta route

| Route | Akses | Isi |
|---|---|---|
| `/` | publik | Landing: hero, pita PPDB (jika dibuka), profil (sambutan, visi-misi, sejarah), program, keunggulan, fasilitas, guru, galeri terbaru, pengumuman + agenda, kontak + peta. Section yang datanya kosong di CMS tidak ditampilkan. ISR 5 menit. |
| `/pengumuman`, `/pengumuman/[slug]` | publik | Daftar berpaginasi (`?page=`) dan detail pengumuman publik |
| `/galeri`, `/galeri/[slug]` | publik | Daftar album berpaginasi dan detail album dengan lightbox (panah kiri/kanan, Esc) |
| `/ppdb` | publik | Status buka/tutup, jadwal, kuota, sisa kuota, info HTML; tombol ke `/login?tab=wali&next=/dashboard/ppdb` |
| `/login` | publik (sudah masuk → `/dashboard`) | Tab `?tab=wali` (Google) dan `?tab=guru` (email + password) |
| `/daftar-guru`, `/lupa-password`, `/reset-password?token=&email=`, `/menunggu-persetujuan` | publik | Alur akun guru/Kepala Sekolah |
| `/dashboard` | SA, G, W | Fase 1: sapaan + tombol keluar; beranda per role di Fase 3 |
| `/api/auth/login`, `/api/auth/google`, `/api/auth/logout`, `/api/auth/sesi-habis` | route handler | BFF sesi |
| `/api/proxy/[...path]` | route handler | Proxy ke backend |

Route lain mengikuti B4 dan ditambahkan per fase. `/api/auth/me` tidak dibuat (disetujui di Fase 0): sesi dibaca lewat `/api/proxy/auth/me`. `/api/revalidate` (disetujui di Fase 0) dibuat di Fase 7 bersama penyimpanan CMS; tag cache publik sudah disiapkan di `TAG_PUBLIK` (`src/lib/constants/sekolah.ts`).

Wali yang `profil_lengkap = false` diarahkan ke `/dashboard/onboarding` setelah login Google; halaman itu dibuat di Fase 3.

## Deploy

Tempat deploy belum ditentukan. Syarat yang sudah pasti:

1. **Reverse proxy di depan Next.js wajib**, dan harus menambahkan IP klien ke `X-Forwarded-For` (nginx: `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`). Next.js hanya mengisi header ini dari IP socket kalau request belum membawanya. Tanpa reverse proxy, pengunjung bisa mengirim `X-Forwarded-For` palsu yang lalu diteruskan ke backend, dan rate limit per IP bisa diakali. Laravel memakai IP paling kanan yang bukan proxy tepercaya, yaitu IP yang ditambahkan reverse proxy.
2. **`TRUSTED_PROXIES` di backend** wajib berisi IP server FE (Next.js), ditambah reverse proxy di depan backend kalau ada. Tanpa itu semua pengunjung dihitung sebagai satu IP (IP server FE).
3. **`BE_API_URL`** harus alamat backend yang bisa dibuka browser (bukan hostname jaringan internal), karena host signed URL file private diambil dari request yang diterima backend.
4. HTTPS di produksi: cookie sesi memakai flag `Secure` saat `NODE_ENV=production`.
5. Batas body di reverse proxy minimal 55 MB (unggahan kegiatan 10 foto × 5 MB), sama dengan `post_max_size` backend.

## Changelog

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
