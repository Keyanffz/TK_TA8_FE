export const queryKeys = {
  me: ["me"] as const,
  dashboard: (muridId: number | null) => ["dashboard", muridId] as const,
  anakWali: ["wali", "anak"] as const,
  notifikasi: {
    semua: ["notifikasi"] as const,
    belumDibaca: ["notifikasi", "belum-dibaca"] as const,
    daftar: (halaman: number, hanyaBelumDibaca: boolean) => ["notifikasi", "daftar", halaman, hanyaBelumDibaca] as const,
    terbaru: ["notifikasi", "terbaru"] as const,
  },
};
