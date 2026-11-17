import type { Path } from "react-hook-form";

import type { IsianFormulir, IsianOrangTua } from "@/components/features/formulir-murid/skema";
import { NILAI_ENUM } from "@/types/enum-api";

export const JUDUL_LANGKAH_FORMULIR = ["Data Anak", "Kesehatan", "Orang Tua & Wali", "Konfirmasi"] as const;

export const LANGKAH = { dataAnak: 0, kesehatan: 1, orangTua: 2, konfirmasi: 3 } as const;

const LABEL_ANAK: Record<string, string> = {
  nama_lengkap: "Nama lengkap",
  nama_panggilan: "Nama panggilan",
  nik: "NIK anak",
  jenis_kelamin: "Jenis kelamin",
  tempat_lahir: "Tempat lahir",
  tanggal_lahir: "Tanggal lahir",
  alamat: "Alamat (jalan, RT/RW)",
  desa_kelurahan: "Desa/kelurahan",
  kecamatan: "Kecamatan",
  kabupaten_kota: "Kabupaten/kota",
  provinsi: "Provinsi",
  agama: "Agama",
  kewarganegaraan: "Kewarganegaraan",
  anak_ke: "Anak ke-",
  status_yatim_piatu: "Keadaan ayah dan ibu",
  kontak_utama: "Kontak utama",
};

const LABEL_ORANG_TUA: Record<keyof IsianOrangTua, string> = {
  status: "Status",
  hubungan: "Hubungan",
  hubungan_lainnya: "Hubungan",
  nama: "Nama",
  tempat_lahir: "Tempat lahir",
  tanggal_lahir: "Tanggal lahir",
  agama: "Agama",
  kewarganegaraan: "Kewarganegaraan",
  pendidikan_terakhir: "Pendidikan terakhir",
  pekerjaan: "Pekerjaan",
  pekerjaan_lainnya: "Pekerjaan",
  penghasilan: "Penghasilan",
  alamat_sama_dengan_anak: "Alamat rumah",
  alamat_rumah: "Alamat rumah",
  alamat_kantor: "Alamat kantor",
  no_hp: "Nomor HP",
};

function isKolomOrangTua(kolom: string): kolom is keyof IsianOrangTua {
  return kolom in LABEL_ORANG_TUA;
}

/** Nama field `data_kurang` dari backend (`nik`, `ayah.pekerjaan`) menjadi label dan langkah wizard tempat isiannya. */
export function fieldKurang(field: string): { label: string; langkah: number } {
  const [peran, kolom] = field.split(".");
  if (kolom && isKolomOrangTua(kolom)) return { label: `${LABEL_ORANG_TUA[kolom]} ${peran}`, langkah: LANGKAH.orangTua };
  return { label: LABEL_ANAK[field] ?? field, langkah: field === "kontak_utama" || field === "status_yatim_piatu" ? LANGKAH.orangTua : LANGKAH.dataAnak };
}

type FieldIsian = Path<IsianFormulir>;

const KOLOM_ORANG_TUA = [
  "status", "hubungan", "hubungan_lainnya", "nama", "tempat_lahir", "tanggal_lahir", "agama", "kewarganegaraan",
  "pendidikan_terakhir", "pekerjaan", "pekerjaan_lainnya", "penghasilan", "alamat_sama_dengan_anak", "alamat_rumah", "alamat_kantor", "no_hp",
] as const satisfies readonly (keyof IsianOrangTua)[];

/** Isian tiap langkah, untuk memeriksa langkah sebelum lanjut. Langkah Konfirmasi tidak punya isian sendiri. */
export const FIELD_LANGKAH_FORMULIR: readonly (readonly FieldIsian[])[] = [
  [
    "nama_lengkap", "nama_panggilan", "jenis_kelamin", "tempat_lahir", "tanggal_lahir", "nik", "agama", "kewarganegaraan", "anak_ke",
    "jumlah_saudara_kandung", "jumlah_saudara_tiri", "jumlah_saudara_angkat", "bahasa_sehari_hari", "asal_sekolah",
    "alamat", "desa_kelurahan", "kecamatan", "kabupaten_kota", "provinsi", "jarak_rumah_km",
  ],
  ["golongan_darah", "tinggi_badan", "berat_badan", "imunisasi", "imunisasi_lainnya", "riwayat_penyakit", "ciri_khusus"],
  ["status_yatim_piatu", "ayah", "ibu", "wali", "kontak_utama"],
  [],
];

/** Semua nama field formulir, termasuk `ayah.no_hp`, untuk memasang error validasi dari backend. */
export const SEMUA_FIELD_FORMULIR: readonly FieldIsian[] = [
  ...FIELD_LANGKAH_FORMULIR.flat().filter((field) => !NILAI_ENUM.Hubungan.some((peran) => peran === field)),
  ...NILAI_ENUM.Hubungan.flatMap((peran) => KOLOM_ORANG_TUA.map((kolom): FieldIsian => `${peran}.${kolom}`)),
];

/** Langkah pertama yang punya error, untuk membawa pengguna ke sana setelah validasi gagal. */
export function langkahDenganError<F extends string>(adaError: (field: FieldIsian | F) => boolean, tambahan: readonly (readonly F[])[] = []): number | null {
  const indeks = FIELD_LANGKAH_FORMULIR.findIndex((field, langkah) => [...field, ...(tambahan[langkah] ?? [])].some(adaError));
  return indeks === -1 ? null : indeks;
}
