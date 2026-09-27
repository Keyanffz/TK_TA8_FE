export const queryKeys = {
  me: ["me"] as const,
  dashboard: (muridId: number | null) => ["dashboard", muridId] as const,
  anakWali: ["wali", "anak"] as const,
  pendaftaranSaya: ["pendaftaran", "saya"] as const,
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
};
