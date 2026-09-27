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
