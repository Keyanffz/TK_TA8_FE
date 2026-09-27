import type {
  Hubungan,
  JenisAgenda,
  JenisDokumen,
  JenisKelamin,
  MetodeBayar,
  PeriodeTagihan,
  Role,
  StatusAkun,
  StatusKelasMurid,
  StatusMurid,
  StatusPembayaran,
  StatusPendaftaran,
  StatusRapor,
  StatusTagihan,
  TargetPengumuman,
  Tingkat,
  TipeKeringanan,
} from "@/types/domain";

export const LABEL_ROLE: Record<Role, string> = {
  super_admin: "Kepala Sekolah",
  guru: "Guru",
  wali_murid: "Wali Murid",
};

export const LABEL_STATUS_AKUN: Record<StatusAkun, string> = {
  pending: "Menunggu persetujuan",
  aktif: "Aktif",
  ditolak: "Ditolak",
  nonaktif: "Nonaktif",
};

export const LABEL_STATUS_MURID: Record<StatusMurid, string> = {
  aktif: "Aktif",
  lulus: "Lulus",
  pindah: "Pindah",
  keluar: "Keluar",
};

export const HUBUNGAN = ["ayah", "ibu", "wali"] as const satisfies readonly Hubungan[];

export const LABEL_HUBUNGAN: Record<Hubungan, string> = {
  ayah: "Ayah",
  ibu: "Ibu",
  wali: "Wali",
};

export const OPSI_HUBUNGAN = HUBUNGAN.map((nilai) => ({ nilai, label: LABEL_HUBUNGAN[nilai] }));

export const LABEL_TINGKAT: Record<Tingkat, string> = {
  A: "Kelompok A",
  B: "Kelompok B",
};

export const LABEL_JENIS_KELAMIN: Record<JenisKelamin, string> = {
  L: "Laki-laki",
  P: "Perempuan",
};

export const OPSI_JENIS_KELAMIN = (["L", "P"] as const).map((nilai) => ({ nilai, label: LABEL_JENIS_KELAMIN[nilai] }));

// Enam agama yang diakui di data kependudukan; backend menyimpannya sebagai teks (maks 20).
export const AGAMA = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"] as const;

export const LABEL_STATUS_KELAS_MURID: Record<StatusKelasMurid, string> = {
  aktif: "Aktif",
  naik: "Naik kelas",
  tinggal: "Tinggal kelas",
  lulus: "Lulus",
  keluar: "Keluar",
};

export const LABEL_PERIODE_TAGIHAN: Record<PeriodeTagihan, string> = {
  bulanan: "Bulanan",
  sekali: "Sekali bayar",
};

export const LABEL_TIPE_KERINGANAN: Record<TipeKeringanan, string> = {
  persen: "Persen",
  nominal: "Nominal (Rp)",
};

export const LABEL_STATUS_TAGIHAN: Record<StatusTagihan, string> = {
  belum_bayar: "Belum dibayar",
  menunggu_verifikasi: "Menunggu verifikasi",
  lunas: "Lunas",
  terlambat: "Terlambat",
  dibatalkan: "Dibatalkan",
};

export const LABEL_METODE_BAYAR: Record<MetodeBayar, string> = {
  transfer: "Transfer bank",
  tunai: "Tunai",
};

export const LABEL_STATUS_PEMBAYARAN: Record<StatusPembayaran, string> = {
  menunggu: "Menunggu verifikasi",
  diterima: "Diterima",
  ditolak: "Ditolak",
};

export const LABEL_TARGET_PENGUMUMAN: Record<TargetPengumuman, string> = {
  semua: "Semua",
  guru: "Guru",
  wali_murid: "Wali Murid",
  kelas: "Kelas tertentu",
  murid: "Murid tertentu",
};

export const LABEL_JENIS_AGENDA: Record<JenisAgenda, string> = {
  kegiatan: "Kegiatan",
  libur: "Libur",
  rapat: "Rapat",
  lainnya: "Lainnya",
};

export const LABEL_STATUS_RAPOR: Record<StatusRapor, string> = {
  draft: "Draft",
  diajukan: "Menunggu review",
  revisi: "Perlu revisi",
  terbit: "Terbit",
};

export const LABEL_STATUS_PENDAFTARAN: Record<StatusPendaftaran, string> = {
  diajukan: "Diajukan",
  diverifikasi: "Dokumen diverifikasi",
  diterima: "Diterima",
  ditolak: "Ditolak",
};

export const LABEL_JENIS_DOKUMEN: Record<JenisDokumen, string> = {
  akta_kelahiran: "Akta kelahiran",
  kartu_keluarga: "Kartu Keluarga",
  pas_foto: "Pas foto",
  lainnya: "Dokumen lain",
};
