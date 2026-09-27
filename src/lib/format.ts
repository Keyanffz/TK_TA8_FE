import { formatDistanceToNowStrict } from "date-fns";
import { id } from "date-fns/locale";

const ZONA_WAKTU = "Asia/Jakarta";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 150000 → "Rp 150.000" */
export function formatRupiah(nilai: number): string {
  return rupiah.format(nilai).replace(/ /g, " ");
}

const POLA_TANGGAL_SAJA = /^\d{4}-\d{2}-\d{2}$/;

// Tanggal murni (YYYY-MM-DD) tidak punya zona waktu; dibaca sebagai UTC dan
// diformat di UTC supaya harinya tidak bergeser. Datetime ISO dari backend
// (offset +07:00) diformat di zona Asia/Jakarta.
function keDate(nilai: string): { date: Date; timeZone: string } {
  if (POLA_TANGGAL_SAJA.test(nilai)) {
    return { date: new Date(`${nilai}T00:00:00Z`), timeZone: "UTC" };
  }
  return { date: new Date(nilai), timeZone: ZONA_WAKTU };
}

/** "2026-09-26" → "26 September 2026" */
export function formatTanggal(nilai: string): string {
  const { date, timeZone } = keDate(nilai);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone }).format(date);
}

/** "2026-09-26" → "26 Sep" */
export function formatTanggalPendek(nilai: string): string {
  const { date, timeZone } = keDate(nilai);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone }).format(date);
}

/** Bagian tanggal terpisah untuk blok kalender: { hari: "02", bulan: "Okt" } */
export function bagianTanggal(nilai: string): { hari: string; bulan: string } {
  const { date, timeZone } = keDate(nilai);
  return {
    hari: new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone }).format(date),
    bulan: new Intl.DateTimeFormat("id-ID", { month: "short", timeZone }).format(date),
  };
}

/** "2026-09-26T08:15:00+07:00" → "26 September 2026, 08.15" */
export function formatTanggalWaktu(nilai: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZONA_WAKTU,
  }).format(new Date(nilai));
}

/** Untuk notifikasi: "3 jam yang lalu" */
export function formatRelatif(nilai: string): string {
  return formatDistanceToNowStrict(new Date(nilai), { addSuffix: true, locale: id });
}

/** Satu tanggal, atau "15 Oktober 2026 – 17 Oktober 2026" untuk kegiatan beberapa hari. */
export function rentangTanggal(mulai: string, selesai: string): string {
  if (mulai === selesai) return formatTanggal(mulai);
  return `${formatTanggal(mulai)} – ${formatTanggal(selesai)}`;
}
