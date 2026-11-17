import { z } from "zod";

import { hariIniJakarta } from "@/lib/tanggal";
import type { Hubungan, StatusYatimPiatu } from "@/types/domain";
import { NILAI_ENUM } from "@/types/enum-api";

/**
 * Formulir data murid resmi sekolah (A2.16), dipakai PPDB online dan tambah/ubah murid. Skema dasar hanya
 * memeriksa format (semua isian formulir boleh kosong, seperti `FormulirMurid` di backend); PPDB menambahkan
 * `periksaWajib()` karena wajib lengkap, staf hanya `periksaKontakUtama()`.
 */
const teks = (maks: number) => z.string().trim().max(maks, `Maksimal ${maks} karakter.`);
const pilihan = <T extends readonly [string, ...string[]]>(nilai: T) => z.union([z.enum(nilai), z.literal("")]);
const tanggalLampau = z.string().refine((nilai) => nilai === "" || nilai < hariIniJakarta(), "Tanggal lahir harus sebelum hari ini.");
const angka = (pola: RegExp, pesan: string) => z.string().trim().regex(pola, pesan);

export const skemaOrangTua = z.object({
  status: pilihan(NILAI_ENUM.StatusOrangTua),
  hubungan: pilihan(NILAI_ENUM.HubunganWali),
  hubungan_lainnya: teks(50),
  nama: teks(255),
  tempat_lahir: teks(100),
  tanggal_lahir: tanggalLampau,
  agama: pilihan(NILAI_ENUM.Agama),
  kewarganegaraan: pilihan(NILAI_ENUM.Kewarganegaraan),
  pendidikan_terakhir: pilihan(NILAI_ENUM.PendidikanTerakhir),
  pekerjaan: pilihan(NILAI_ENUM.Pekerjaan),
  pekerjaan_lainnya: teks(100),
  penghasilan: pilihan(NILAI_ENUM.Penghasilan),
  alamat_sama_dengan_anak: z.boolean(),
  alamat_rumah: teks(500),
  alamat_kantor: teks(500),
  no_hp: angka(/^(08\d{8,13})?$/, "Nomor HP diawali 08 dan berisi 10-15 angka."),
});

export const isianFormulir = {
  nama_lengkap: z.string().trim().min(1, "Nama lengkap wajib diisi.").max(255, "Nama terlalu panjang."),
  nama_panggilan: z.string().trim().min(1, "Nama panggilan wajib diisi.").max(50, "Maksimal 50 karakter."),
  jenis_kelamin: z.enum(NILAI_ENUM.JenisKelamin, { error: "Pilih jenis kelamin." }),
  tempat_lahir: z.string().trim().min(1, "Tempat lahir wajib diisi.").max(100, "Maksimal 100 karakter."),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi.").refine((nilai) => nilai < hariIniJakarta(), "Tanggal lahir harus sebelum hari ini."),
  // Teks bebas untuk data lama; pilihan di form tetap dari enum Agama.
  agama: z.string().min(1, "Pilih agama."),
  alamat: z.string().trim().min(1, "Alamat wajib diisi.").max(500, "Maksimal 500 karakter."),
  nik: angka(/^(\d{16})?$/, "NIK berisi 16 angka, lihat Kartu Keluarga."),
  desa_kelurahan: teks(100),
  kecamatan: teks(100),
  kabupaten_kota: teks(100),
  provinsi: teks(100),
  asal_sekolah: teks(150),
  kewarganegaraan: pilihan(NILAI_ENUM.Kewarganegaraan),
  anak_ke: angka(/^([1-9]|1\d|20)?$/, "Isi angka 1 sampai 20."),
  jumlah_saudara_kandung: angka(/^(\d|1\d|20)?$/, "Isi angka 0 sampai 20."),
  jumlah_saudara_tiri: angka(/^(\d|1\d|20)?$/, "Isi angka 0 sampai 20."),
  jumlah_saudara_angkat: angka(/^(\d|1\d|20)?$/, "Isi angka 0 sampai 20."),
  status_yatim_piatu: pilihan(NILAI_ENUM.StatusYatimPiatu),
  bahasa_sehari_hari: teks(50),
  jarak_rumah_km: angka(/^(\d{1,3}([.,]\d{1,2})?)?$/, "Isi kilometer, misalnya 1,5."),
  golongan_darah: pilihan(NILAI_ENUM.GolonganDarah),
  riwayat_penyakit: teks(1000),
  tinggi_badan: angka(/^(\d{2,3}([.,]\d)?)?$/, "Isi sentimeter, misalnya 105."),
  berat_badan: angka(/^(\d{1,3}([.,]\d)?)?$/, "Isi kilogram, misalnya 17,5."),
  imunisasi: z.array(z.enum(NILAI_ENUM.Imunisasi)),
  imunisasi_lainnya: teks(255),
  ciri_khusus: teks(1000),
  kontak_utama: pilihan(NILAI_ENUM.Hubungan),
  ayah: skemaOrangTua,
  ibu: skemaOrangTua,
  wali: skemaOrangTua,
  /** Bagian wali hanya dikirim kalau dibuka lewat "Tambah data wali". */
  ada_wali: z.boolean(),
};

export const skemaFormulir = z.object(isianFormulir);

export type IsianOrangTua = z.infer<typeof skemaOrangTua>;
export type IsianFormulir = z.infer<typeof skemaFormulir>;
type Kontak = Pick<IsianFormulir, "status_yatim_piatu" | "kontak_utama" | "ada_wali"> & Record<Hubungan, { no_hp: string }>;
type Konteks = z.RefinementCtx;

export function sudahMeninggal(peran: Hubungan, status: StatusYatimPiatu | ""): boolean {
  if (peran === "ayah") return status === "yatim" || status === "yatim_piatu";
  if (peran === "ibu") return status === "piatu" || status === "yatim_piatu";
  return false;
}

/** Orang yang bisa dipilih sebagai kontak utama: datanya ada, masih hidup, dan punya nomor HP. */
export function kontakTersedia(isian: Kontak): Hubungan[] {
  return NILAI_ENUM.Hubungan.filter((peran) => {
    if (peran === "wali" && !isian.ada_wali) return false;
    return !sudahMeninggal(peran, isian.status_yatim_piatu) && isian[peran].no_hp.trim() !== "";
  });
}

const WAJIB_ANAK = [
  ["nik", "NIK anak wajib diisi."],
  ["desa_kelurahan", "Desa/kelurahan wajib diisi."],
  ["kecamatan", "Kecamatan wajib diisi."],
  ["kabupaten_kota", "Kabupaten/kota wajib diisi."],
  ["provinsi", "Provinsi wajib diisi."],
  ["kewarganegaraan", "Pilih kewarganegaraan."],
  ["anak_ke", "Anak ke- wajib diisi."],
  ["status_yatim_piatu", "Pilih status yatim/piatu."],
] as const satisfies readonly (readonly [keyof IsianFormulir, string])[];

const WAJIB_ORANG_TUA = [
  ["status", "Status"],
  ["tempat_lahir", "Tempat lahir"],
  ["tanggal_lahir", "Tanggal lahir"],
  ["agama", "Agama"],
  ["kewarganegaraan", "Kewarganegaraan"],
  ["pendidikan_terakhir", "Pendidikan terakhir"],
  ["pekerjaan", "Pekerjaan"],
] as const satisfies readonly (readonly [keyof IsianOrangTua, string])[];

function tandai(ctx: Konteks, path: (string | number)[], message: string) {
  ctx.addIssue({ code: "custom", path, message });
}

/** Kontak utama yang dipilih harus masih ada di `kontakTersedia()`. Berlaku juga untuk isian staf. */
export function periksaKontakUtama(isian: Kontak, ctx: Konteks) {
  if (isian.kontak_utama === "" || kontakTersedia(isian).includes(isian.kontak_utama)) return;
  tandai(ctx, ["kontak_utama"], "Kontak utama harus orang yang masih hidup dan punya nomor HP.");
}

/** Field wajib PPDB online, sama dengan `KelengkapanFormulir` backend; backend tetap pemeriksa akhir. */
export function periksaWajib(isian: IsianFormulir, ctx: Konteks) {
  for (const [field, pesan] of WAJIB_ANAK) {
    if (String(isian[field]).trim() === "") tandai(ctx, [field], pesan);
  }
  for (const peran of ["ayah", "ibu"] as const) {
    const orang = isian[peran];
    if (orang.nama.trim() === "") tandai(ctx, [peran, "nama"], `Nama ${peran} wajib diisi.`);
    if (sudahMeninggal(peran, isian.status_yatim_piatu)) continue;
    for (const [field, label] of WAJIB_ORANG_TUA) {
      if (orang[field].trim() === "") tandai(ctx, [peran, field], `${label} ${peran} wajib diisi.`);
    }
    if (!orang.alamat_sama_dengan_anak && orang.alamat_rumah.trim() === "") tandai(ctx, [peran, "alamat_rumah"], `Alamat rumah ${peran} wajib diisi.`);
    if (orang.pekerjaan === "lainnya" && orang.pekerjaan_lainnya.trim() === "") tandai(ctx, [peran, "pekerjaan_lainnya"], `Tulis pekerjaan ${peran}.`);
  }
  if (isian.ada_wali) {
    if (isian.wali.hubungan === "") tandai(ctx, ["wali", "hubungan"], "Pilih hubungan wali dengan anak.");
    if (isian.wali.hubungan === "lainnya" && isian.wali.hubungan_lainnya.trim() === "") tandai(ctx, ["wali", "hubungan_lainnya"], "Tulis hubungan wali dengan anak.");
    if (isian.wali.nama.trim() === "") tandai(ctx, ["wali", "nama"], "Nama wali wajib diisi.");
    if (isian.wali.no_hp.trim() === "") tandai(ctx, ["wali", "no_hp"], "Nomor HP wali wajib diisi.");
  }
  const hidup = (["ayah", "ibu"] as const).filter((peran) => !sudahMeninggal(peran, isian.status_yatim_piatu));
  if (kontakTersedia(isian).length === 0 && !(isian.ada_wali && isian.wali.no_hp.trim() === "")) {
    tandai(ctx, [hidup[0] ?? "wali", "no_hp"], "Isi minimal satu nomor HP ayah, ibu, atau wali.");
  }
  if (isian.kontak_utama === "") tandai(ctx, ["kontak_utama"], "Pilih kontak utama.");
  periksaKontakUtama(isian, ctx);
}
