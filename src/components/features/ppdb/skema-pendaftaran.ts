import type { DefaultValues } from "react-hook-form";
import { z } from "zod";

import { skemaAlamat, skemaNomorHp } from "@/lib/auth/skema";
import { HUBUNGAN } from "@/lib/constants/label";
import { hariIniJakarta } from "@/lib/tanggal";
import type { components } from "@/types/api";

const teksOpsional = z.string().trim().max(255, "Maksimal 255 karakter.");

// Aturan sama dengan BuatPendaftaranRequest di backend; backend tetap pemeriksa akhir.
export const skemaPendaftaran = z.object({
  nama_lengkap: z.string().trim().min(1, "Nama lengkap anak wajib diisi.").max(255, "Nama terlalu panjang."),
  nama_panggilan: z.string().trim().min(1, "Nama panggilan wajib diisi.").max(50, "Nama panggilan maksimal 50 karakter."),
  jenis_kelamin: z.enum(["L", "P"], { error: "Pilih jenis kelamin anak." }),
  tempat_lahir: z.string().trim().min(1, "Tempat lahir wajib diisi.").max(100, "Tempat lahir maksimal 100 karakter."),
  tanggal_lahir: z
    .string()
    .min(1, "Tanggal lahir wajib diisi.")
    .refine((nilai) => nilai < hariIniJakarta(), "Tanggal lahir harus sebelum hari ini."),
  nik: z.string().trim().regex(/^\d{16}$/, "NIK anak berisi 16 angka, lihat Kartu Keluarga."),
  agama: z.string().min(1, "Pilih agama anak."),
  tingkat_tujuan: z.enum(["A", "B"], { error: "Pilih kelompok tujuan." }),
  hubungan: z.enum(HUBUNGAN, { error: "Pilih hubungan Anda dengan anak." }),
  nama_ayah: teksOpsional,
  pekerjaan_ayah: teksOpsional,
  nama_ibu: teksOpsional,
  pekerjaan_ibu: teksOpsional,
  no_hp: skemaNomorHp,
  alamat: skemaAlamat,
});

export type MasukanPendaftaran = z.input<typeof skemaPendaftaran>;
export type NilaiPendaftaran = z.output<typeof skemaPendaftaran>;
export type FieldPendaftaran = keyof NilaiPendaftaran;

export const LANGKAH_PENDAFTARAN: readonly { judul: string; field: readonly FieldPendaftaran[] }[] = [
  {
    judul: "Data anak",
    field: ["nama_lengkap", "nama_panggilan", "jenis_kelamin", "tempat_lahir", "tanggal_lahir", "nik", "agama", "tingkat_tujuan"],
  },
  {
    judul: "Orang tua",
    field: ["hubungan", "nama_ayah", "pekerjaan_ayah", "nama_ibu", "pekerjaan_ibu", "no_hp", "alamat"],
  },
  { judul: "Periksa", field: [] },
];

export const SEMUA_FIELD_PENDAFTARAN = LANGKAH_PENDAFTARAN.flatMap((langkah) => langkah.field);

export function nilaiAwalPendaftaran(awal: { no_hp?: string; alamat?: string }): DefaultValues<MasukanPendaftaran> {
  return {
    nama_lengkap: "",
    nama_panggilan: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    nik: "",
    agama: "",
    nama_ayah: "",
    pekerjaan_ayah: "",
    nama_ibu: "",
    pekerjaan_ibu: "",
    no_hp: awal.no_hp ?? "",
    alamat: awal.alamat ?? "",
  };
}

function kosongJadiNull(nilai: string): string | null {
  return nilai === "" ? null : nilai;
}

/** Nilai form → body `POST /pendaftaran` dan `POST /public/pendaftaran`. */
export function keBodyPendaftaran(nilai: NilaiPendaftaran): components["schemas"]["BuatPendaftaranRequest"] {
  return {
    ...nilai,
    nama_ayah: kosongJadiNull(nilai.nama_ayah),
    pekerjaan_ayah: kosongJadiNull(nilai.pekerjaan_ayah),
    nama_ibu: kosongJadiNull(nilai.nama_ibu),
    pekerjaan_ibu: kosongJadiNull(nilai.pekerjaan_ibu),
  };
}
