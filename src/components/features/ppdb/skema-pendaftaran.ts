import type { DefaultValues } from "react-hook-form";
import { z } from "zod";

import { FORMULIR_KOSONG, keBodyFormulir } from "@/components/features/formulir-murid/isian";
import { isianFormulir, periksaWajib } from "@/components/features/formulir-murid/skema";
import type { components } from "@/types/api";
import { NILAI_ENUM } from "@/types/enum-api";

/**
 * PPDB online wajib lengkap (A2.16) dan wajib menyetujui pernyataan; backend tetap pemeriksa akhir.
 * `hubungan` ("Anda sebagai") hanya untuk wali yang login, dipakai menautkan anak ke akunnya saat diterima.
 */
export function buatSkemaPendaftaran(denganAkun: boolean) {
  return z
    .object({
      ...isianFormulir,
      agama: z.string().pipe(z.enum(NILAI_ENUM.Agama, { error: "Pilih agama." })),
      tingkat_tujuan: z.enum(NILAI_ENUM.Tingkat, { error: "Pilih kelompok tujuan." }),
      hubungan: z.union([z.enum(NILAI_ENUM.Hubungan), z.literal("")]),
      pernyataan: z.boolean(),
    })
    .superRefine((isian, ctx) => {
      periksaWajib(isian, ctx);
      if (denganAkun && isian.hubungan === "") ctx.addIssue({ code: "custom", path: ["hubungan"], message: "Pilih hubungan Anda dengan anak." });
      if (!isian.pernyataan) {
        ctx.addIssue({ code: "custom", path: ["pernyataan"], message: "Centang pernyataan bahwa data yang diisi benar sebelum mengirim pendaftaran." });
      }
    });
}

export type MasukanPendaftaran = z.input<ReturnType<typeof buatSkemaPendaftaran>>;
export type NilaiPendaftaran = z.output<ReturnType<typeof buatSkemaPendaftaran>>;

export function nilaiAwalPendaftaran(alamat: string): DefaultValues<MasukanPendaftaran> {
  return { ...FORMULIR_KOSONG, alamat, hubungan: "", pernyataan: false };
}

/** Nilai form → body `POST /pendaftaran` (dengan `hubungan`) dan `POST /public/pendaftaran`. */
export function keBodyPendaftaran(nilai: NilaiPendaftaran, denganAkun: boolean): components["schemas"]["BuatPendaftaranRequest"] {
  return {
    ...keBodyFormulir(nilai),
    ...(denganAkun && nilai.hubungan !== "" ? { hubungan: nilai.hubungan } : {}),
    tingkat_tujuan: nilai.tingkat_tujuan,
    nama_lengkap: nilai.nama_lengkap,
    nama_panggilan: nilai.nama_panggilan,
    jenis_kelamin: nilai.jenis_kelamin,
    tempat_lahir: nilai.tempat_lahir,
    tanggal_lahir: nilai.tanggal_lahir,
    nik: nilai.nik,
    agama: nilai.agama,
    alamat: nilai.alamat,
    pernyataan: true,
  };
}
