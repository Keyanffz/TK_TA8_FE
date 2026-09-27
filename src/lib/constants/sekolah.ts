// Identitas naungan tidak ada di kunci pengaturan A4, jadi ditulis di sini.
export const NAUNGAN_SEKOLAH = "TK Muslimat NU Kota Semarang";

// Dipakai kalau profil.logo di CMS belum diisi.
export const LOGO_CADANGAN = "/logo-tk.png";

// ISR halaman publik (B7): 5 menit, ditambah revalidateTag setelah Kepala Sekolah menyimpan CMS.
export const REVALIDATE_PUBLIK_DETIK = 300;

export const TAG_PUBLIK = {
  profil: "publik-profil",
  guru: "publik-guru",
  ppdb: "publik-ppdb",
  pengumuman: "publik-pengumuman",
  galeri: "publik-galeri",
  agenda: "publik-agenda",
} as const;
