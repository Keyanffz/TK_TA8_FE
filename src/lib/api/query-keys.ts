export const queryKeys = {
  me: ["me"] as const,
  dashboard: (muridId: number | null) => ["dashboard", muridId] as const,
  anakWali: ["wali", "anak"] as const,
  pendaftaranSaya: ["pendaftaran", "saya"] as const,
  pendaftaran: {
    semua: ["pendaftaran"] as const,
    daftar: (filter: object) => ["pendaftaran", "daftar", filter] as const,
    detail: (id: number) => ["pendaftaran", "detail", id] as const,
    status: ["pendaftaran", "status-ppdb"] as const,
  },
  notifikasi: {
    semua: ["notifikasi"] as const,
    belumDibaca: ["notifikasi", "belum-dibaca"] as const,
    daftar: (halaman: number, hanyaBelumDibaca: boolean) => ["notifikasi", "daftar", halaman, hanyaBelumDibaca] as const,
    terbaru: ["notifikasi", "terbaru"] as const,
  },
  guru: {
    semua: ["guru"] as const,
    daftar: (filter: object) => ["guru", "daftar", filter] as const,
    detail: (id: number) => ["guru", "detail", id] as const,
  },
  tahunAjaran: ["tahun-ajaran"] as const,
  kelas: {
    semua: ["kelas"] as const,
    daftar: (filter: object) => ["kelas", "daftar", filter] as const,
    detail: (id: number) => ["kelas", "detail", id] as const,
  },
  murid: {
    semua: ["murid"] as const,
    daftar: (filter: object) => ["murid", "daftar", filter] as const,
    detail: (id: number) => ["murid", "detail", id] as const,
  },
  waliMurid: {
    semua: ["wali-murid"] as const,
    daftar: (filter: object) => ["wali-murid", "daftar", filter] as const,
    detail: (id: number) => ["wali-murid", "detail", id] as const,
  },
  pengaturan: (grup: string) => ["pengaturan", grup] as const,
  tagihan: {
    semua: ["tagihan"] as const,
    daftar: (filter: object) => ["tagihan", "daftar", filter] as const,
    detail: (id: number) => ["tagihan", "detail", id] as const,
  },
  pembayaran: {
    semua: ["pembayaran"] as const,
    daftar: (filter: object) => ["pembayaran", "daftar", filter] as const,
  },
  jenisTagihan: {
    semua: ["jenis-tagihan"] as const,
    daftar: (filter: object) => ["jenis-tagihan", "daftar", filter] as const,
  },
  keringanan: {
    semua: ["keringanan"] as const,
    daftar: (filter: object) => ["keringanan", "daftar", filter] as const,
  },
  kegiatan: {
    semua: ["kegiatan"] as const,
    daftar: (filter: object) => ["kegiatan", "daftar", filter] as const,
    detail: (id: number) => ["kegiatan", "detail", id] as const,
  },
  rapor: {
    semua: ["rapor"] as const,
    daftar: (filter: object) => ["rapor", "daftar", filter] as const,
    detail: (id: number) => ["rapor", "detail", id] as const,
  },
  elemenPenilaian: ["elemen-penilaian"] as const,
  pengumuman: {
    semua: ["pengumuman"] as const,
    daftar: (filter: object) => ["pengumuman", "daftar", filter] as const,
    detail: (id: number) => ["pengumuman", "detail", id] as const,
  },
  agenda: {
    semua: ["agenda"] as const,
    bulan: (bulan: string) => ["agenda", bulan] as const,
  },
  galeri: {
    semua: ["galeri"] as const,
    daftar: (filter: object) => ["galeri", "daftar", filter] as const,
    detail: (id: number) => ["galeri", "detail", id] as const,
  },
  logAktivitas: (filter: object) => ["log-aktivitas", filter] as const,
  laporan: {
    keuangan: (filter: object) => ["laporan", "keuangan", filter] as const,
    tunggakan: (kelasId: number | null) => ["laporan", "tunggakan", kelasId] as const,
  },
};
