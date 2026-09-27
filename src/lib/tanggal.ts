const ZONA_WAKTU = "Asia/Jakarta";

// Locale en-CA menghasilkan format YYYY-MM-DD, sama dengan format tanggal API.
const formatIso = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_WAKTU,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Tanggal hari ini di Asia/Jakarta, format YYYY-MM-DD. */
export function hariIniJakarta(sekarang: Date = new Date()): string {
  return formatIso.format(sekarang);
}

/** Bulan di Asia/Jakarta dengan geseran, format YYYY-MM (parameter `bulan` agenda). */
export function bulanJakarta(geser = 0, sekarang: Date = new Date()): string {
  const [tahun, bulan] = hariIniJakarta(sekarang).split("-").map(Number);
  const tujuan = new Date(Date.UTC(tahun, bulan - 1 + geser, 1));
  return `${tujuan.getUTCFullYear()}-${String(tujuan.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Semua bulan dari tanggal mulai sampai tanggal selesai (YYYY-MM-DD), format YYYY-MM. */
export function daftarBulan(mulai: string, selesai: string): string[] {
  const [tahunAwal, bulanAwal] = mulai.split("-").map(Number);
  const [tahunAkhir, bulanAkhir] = selesai.split("-").map(Number);
  const hasil: string[] = [];
  for (let indeks = tahunAwal * 12 + bulanAwal - 1; indeks <= tahunAkhir * 12 + bulanAkhir - 1; indeks++) {
    hasil.push(`${Math.floor(indeks / 12)}-${String((indeks % 12) + 1).padStart(2, "0")}`);
  }
  return hasil;
}

/** Geser bulan YYYY-MM sebanyak `geser` bulan. */
export function geserBulan(bulan: string, geser: number): string {
  const [tahun, nomor] = bulan.split("-").map(Number);
  const tujuan = new Date(Date.UTC(tahun, nomor - 1 + geser, 1));
  return `${tujuan.getUTCFullYear()}-${String(tujuan.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Tanggal YYYY-MM-DD dalam satu bulan, beserta posisi hari pertamanya (0 = Senin). */
export function hariDalamBulan(bulan: string): { tanggal: string[]; geserAwal: number } {
  const [tahun, nomor] = bulan.split("-").map(Number);
  const jumlah = new Date(Date.UTC(tahun, nomor, 0)).getUTCDate();
  const geserAwal = (new Date(Date.UTC(tahun, nomor - 1, 1)).getUTCDay() + 6) % 7;
  return { tanggal: Array.from({ length: jumlah }, (_, i) => `${bulan}-${String(i + 1).padStart(2, "0")}`), geserAwal };
}
