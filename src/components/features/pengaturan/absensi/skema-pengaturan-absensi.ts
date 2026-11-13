import type { FieldPath } from "react-hook-form";
import { z } from "zod";

import type { PengaturanAbsensi } from "@/lib/api/pengaturan-dashboard";

const jam = z.string().regex(/^\d{2}:\d{2}$/, "Isi jam dengan format JJ:MM.");
const bulat = (min: number, maks: number, pesan: string) => z.coerce.number<string>().int("Isi dengan angka bulat.").min(min, pesan).max(maks, pesan);
const koordinat = (batas: number, pesan: string) =>
  z
    .string()
    .trim()
    .refine((nilai) => nilai === "" || (Number.isFinite(Number(nilai)) && Math.abs(Number(nilai)) <= batas), pesan);

type JamForm = Record<"masuk_buka" | "masuk_batas_terlambat" | "masuk_tutup" | "pulang_buka" | "pulang_tutup", string>;

const isianJam = { masuk_buka: jam, masuk_batas_terlambat: jam, masuk_tutup: jam, pulang_buka: jam, pulang_tutup: jam };

/** Urutan jam untuk jam bawaan dan setiap jam khusus, sama dengan pemeriksaan backend. */
function denganUrutanJam<T extends z.ZodType<JamForm>>(skema: T): T {
  return skema
    .refine((nilai) => nilai.masuk_buka <= nilai.masuk_batas_terlambat, { path: ["masuk_batas_terlambat"], message: "Batas terlambat tidak boleh sebelum jam buka." })
    .refine((nilai) => nilai.masuk_batas_terlambat <= nilai.masuk_tutup && nilai.masuk_buka < nilai.masuk_tutup, {
      path: ["masuk_tutup"],
      message: "Jam tutup harus setelah jam buka dan tidak sebelum batas terlambat.",
    })
    .refine((nilai) => nilai.pulang_buka < nilai.pulang_tutup, { path: ["pulang_tutup"], message: "Jam tutup harus setelah jam buka." });
}

/**
 * Batas angka sama dengan validasi backend (`PengaturanService::aturan()`). `jam_khusus` hanya berisi hari kerja yang
 * memakai jam khusus, urut nomor hari seperti yang disimpan backend.
 */
export const skemaFormAbsensi = denganUrutanJam(
  z.object({
    latitude: koordinat(90, "Latitude antara -90 dan 90."),
    longitude: koordinat(180, "Longitude antara -180 dan 180."),
    radius_meter: bulat(10, 5000, "Antara 10 dan 5.000 meter."),
    batas_akurasi_meter: bulat(5, 1000, "Antara 5 dan 1.000 meter."),
    ...isianJam,
    jam_khusus: z.array(denganUrutanJam(z.object({ hari: z.number(), ...isianJam }))),
    hari_kerja: z.array(z.number()).min(1, "Pilih paling sedikit satu hari kerja."),
    tanggal_libur: z.array(z.string()),
    tanggal_mulai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal mulai absensi wajib diisi."),
    masa_simpan_foto_bulan: bulat(1, 60, "Antara 1 dan 60 bulan."),
  }),
).refine((nilai) => (nilai.latitude === "") === (nilai.longitude === ""), { path: ["longitude"], message: "Isi latitude dan longitude, atau kosongkan keduanya." });

export type MasukanFormAbsensi = z.input<typeof skemaFormAbsensi>;
export type KeluaranFormAbsensi = z.output<typeof skemaFormAbsensi>;

const DESIMAL_KOORDINAT = 6;

export function teksKoordinat(nilai: number): string {
  return nilai.toFixed(DESIMAL_KOORDINAT);
}

export function nilaiAwalForm(data: PengaturanAbsensi): MasukanFormAbsensi {
  const lokasi = data["absensi.lokasi"];
  return {
    latitude: lokasi ? teksKoordinat(lokasi.latitude) : "",
    longitude: lokasi ? teksKoordinat(lokasi.longitude) : "",
    radius_meter: String(data["absensi.radius_meter"]),
    batas_akurasi_meter: String(data["absensi.batas_akurasi_meter"]),
    masuk_buka: data["absensi.jam_masuk"].buka,
    masuk_batas_terlambat: data["absensi.jam_masuk"].batas_terlambat,
    masuk_tutup: data["absensi.jam_masuk"].tutup,
    pulang_buka: data["absensi.jam_pulang"].buka,
    pulang_tutup: data["absensi.jam_pulang"].tutup,
    jam_khusus: data["absensi.jam_khusus"].map(({ hari, jam_masuk, jam_pulang }) => ({
      hari,
      masuk_buka: jam_masuk.buka,
      masuk_batas_terlambat: jam_masuk.batas_terlambat,
      masuk_tutup: jam_masuk.tutup,
      pulang_buka: jam_pulang.buka,
      pulang_tutup: jam_pulang.tutup,
    })),
    hari_kerja: data["absensi.hari_kerja"],
    tanggal_libur: data["absensi.tanggal_libur"],
    tanggal_mulai: data["absensi.tanggal_mulai"] ?? "",
    masa_simpan_foto_bulan: String(data["absensi.masa_simpan_foto_bulan"]),
  };
}

/** Bentuk `items` untuk `PUT /pengaturan` (A4 "Kunci pengaturan"). */
export function keItemsPengaturan(nilai: KeluaranFormAbsensi): Record<string, unknown> {
  return {
    "absensi.lokasi": nilai.latitude === "" ? null : { latitude: Number(nilai.latitude), longitude: Number(nilai.longitude) },
    "absensi.radius_meter": nilai.radius_meter,
    "absensi.batas_akurasi_meter": nilai.batas_akurasi_meter,
    "absensi.jam_masuk": { buka: nilai.masuk_buka, batas_terlambat: nilai.masuk_batas_terlambat, tutup: nilai.masuk_tutup },
    "absensi.jam_pulang": { buka: nilai.pulang_buka, tutup: nilai.pulang_tutup },
    "absensi.jam_khusus": nilai.jam_khusus.map((khusus) => ({
      hari: khusus.hari,
      jam_masuk: { buka: khusus.masuk_buka, batas_terlambat: khusus.masuk_batas_terlambat, tutup: khusus.masuk_tutup },
      jam_pulang: { buka: khusus.pulang_buka, tutup: khusus.pulang_tutup },
    })),
    "absensi.hari_kerja": nilai.hari_kerja,
    "absensi.tanggal_libur": nilai.tanggal_libur,
    "absensi.tanggal_mulai": nilai.tanggal_mulai,
    "absensi.masa_simpan_foto_bulan": nilai.masa_simpan_foto_bulan,
  };
}

const FIELD_PER_KUNCI: readonly [string, keyof MasukanFormAbsensi][] = [
  ["absensi.lokasi.latitude", "latitude"],
  ["absensi.lokasi.longitude", "longitude"],
  ["absensi.lokasi", "longitude"],
  ["absensi.radius_meter", "radius_meter"],
  ["absensi.batas_akurasi_meter", "batas_akurasi_meter"],
  ["absensi.jam_masuk", "masuk_tutup"],
  ["absensi.jam_pulang", "pulang_tutup"],
  ["absensi.hari_kerja", "hari_kerja"],
  ["absensi.tanggal_libur", "tanggal_libur"],
  ["absensi.tanggal_mulai", "tanggal_mulai"],
  ["absensi.masa_simpan_foto_bulan", "masa_simpan_foto_bulan"],
];

/**
 * Kunci error backend → field form, untuk pesan validasi yang lolos dari pengecekan di browser. Nomor urut jam khusus
 * di kunci backend sama dengan nomor urut di form karena keduanya urut nomor hari.
 */
export function fieldUntukGalat(kunci: string): FieldPath<MasukanFormAbsensi> | null {
  const khusus = /^absensi\.jam_khusus\.(\d+)\.(hari|jam_masuk|jam_pulang)/.exec(kunci);
  if (khusus) {
    const [, urutan, bagian] = khusus;
    if (bagian === "hari") return "hari_kerja";
    return `jam_khusus.${Number(urutan)}.${bagian === "jam_masuk" ? "masuk_tutup" : "pulang_tutup"}`;
  }
  return FIELD_PER_KUNCI.find(([awalan]) => kunci === awalan || kunci.startsWith(`${awalan}.`))?.[1] ?? null;
}
