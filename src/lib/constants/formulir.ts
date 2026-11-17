import type {
  Agama,
  GolonganDarah,
  HubunganWali,
  Imunisasi,
  Kewarganegaraan,
  Pekerjaan,
  PendidikanTerakhir,
  Penghasilan,
  StatusOrangTua,
} from "@/types/domain";
import { NILAI_ENUM } from "@/types/enum-api";

export const LABEL_KEWARGANEGARAAN: Record<Kewarganegaraan, string> = { wni: "WNI", wna: "WNA" };

export const LABEL_GOLONGAN_DARAH: Record<GolonganDarah, string> = { A: "A", B: "B", AB: "AB", O: "O", tidak_tahu: "Tidak tahu" };

export const LABEL_IMUNISASI: Record<Imunisasi, string> = {
  bcg: "BCG",
  hepatitis_b: "Hepatitis B",
  polio: "Polio",
  dpt: "DPT",
  campak_mr: "Campak/MR",
};

export const LABEL_STATUS_ORANG_TUA: Record<StatusOrangTua, string> = { kandung: "Kandung", tiri: "Tiri", angkat: "Angkat" };

export const LABEL_HUBUNGAN_WALI: Record<HubunganWali, string> = {
  kakek: "Kakek",
  nenek: "Nenek",
  paman: "Paman",
  bibi: "Bibi",
  kakak: "Kakak",
  lainnya: "Lainnya",
};

export const LABEL_PENDIDIKAN: Record<PendidikanTerakhir, string> = {
  tidak_sekolah: "Tidak sekolah",
  sd: "SD",
  smp: "SMP",
  slta: "SLTA",
  d1_d3: "D1-D3",
  d4_s1: "D4/S1",
  s2: "S2",
  s3: "S3",
};

export const LABEL_PEKERJAAN: Record<Pekerjaan, string> = {
  tidak_bekerja: "Tidak bekerja",
  mengurus_rumah_tangga: "Mengurus rumah tangga",
  pns_tni_polri: "PNS/TNI/Polri",
  karyawan_swasta: "Karyawan swasta",
  karyawan_bumn: "Karyawan BUMN",
  wiraswasta: "Wiraswasta",
  pedagang: "Pedagang",
  petani_peternak: "Petani/Peternak",
  nelayan: "Nelayan",
  buruh: "Buruh",
  pensiunan: "Pensiunan",
  lainnya: "Lainnya",
};

export const LABEL_PENGHASILAN: Record<Penghasilan, string> = {
  di_bawah_500rb: "Kurang dari Rp500.000",
  "500rb_1jt": "Rp500.000 - Rp999.999",
  "1jt_2jt": "Rp1.000.000 - Rp1.999.999",
  "2jt_5jt": "Rp2.000.000 - Rp4.999.999",
  "5jt_20jt": "Rp5.000.000 - Rp20.000.000",
  di_atas_20jt: "Lebih dari Rp20.000.000",
  tidak_berpenghasilan: "Tidak berpenghasilan",
};

type Opsi<T extends string> = { nilai: T; label: string };

function opsi<T extends string>(nilai: readonly T[], label: Record<T, string>): Opsi<T>[] {
  return nilai.map((item) => ({ nilai: item, label: label[item] }));
}

/** Pilihan dropdown formulir data murid; nilainya dari enum api.json (`gen:api`), label dari konstanta di atas. */
export const OPSI_AGAMA: Opsi<Agama>[] = NILAI_ENUM.Agama.map((nilai) => ({ nilai, label: nilai }));
export const OPSI_KEWARGANEGARAAN = opsi(NILAI_ENUM.Kewarganegaraan, LABEL_KEWARGANEGARAAN);
export const OPSI_GOLONGAN_DARAH = opsi(NILAI_ENUM.GolonganDarah, LABEL_GOLONGAN_DARAH);
export const OPSI_IMUNISASI = opsi(NILAI_ENUM.Imunisasi, LABEL_IMUNISASI);
export const OPSI_STATUS_ORANG_TUA = opsi(NILAI_ENUM.StatusOrangTua, LABEL_STATUS_ORANG_TUA);
export const OPSI_HUBUNGAN_WALI = opsi(NILAI_ENUM.HubunganWali, LABEL_HUBUNGAN_WALI);
export const OPSI_PENDIDIKAN = opsi(NILAI_ENUM.PendidikanTerakhir, LABEL_PENDIDIKAN);
export const OPSI_PEKERJAAN = opsi(NILAI_ENUM.Pekerjaan, LABEL_PEKERJAAN);
export const OPSI_PENGHASILAN = opsi(NILAI_ENUM.Penghasilan, LABEL_PENGHASILAN);
