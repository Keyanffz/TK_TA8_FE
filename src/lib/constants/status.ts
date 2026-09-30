import type {
  JenisAgenda,
  StatusAkun,
  StatusMurid,
  StatusPembayaran,
  StatusPendaftaran,
  StatusRapor,
  StatusTagihan,
} from "@/types/domain";

export type NadaStatus = "sukses" | "menunggu" | "bahaya" | "proses" | "netral";

/** Kelas warna per nada; token warnanya didefinisikan di globals.css. */
export const KELAS_NADA: Record<NadaStatus, string> = {
  sukses: "bg-status-sukses-soft text-status-sukses",
  menunggu: "bg-status-menunggu-soft text-status-menunggu",
  bahaya: "bg-status-bahaya-soft text-status-bahaya",
  proses: "bg-status-proses-soft text-status-proses",
  netral: "bg-status-netral-soft text-status-netral",
};

export const NADA_STATUS_TAGIHAN: Record<StatusTagihan, NadaStatus> = {
  belum_bayar: "menunggu",
  menunggu_verifikasi: "proses",
  lunas: "sukses",
  terlambat: "bahaya",
  dibatalkan: "netral",
};

export const NADA_STATUS_PEMBAYARAN: Record<StatusPembayaran, NadaStatus> = {
  menunggu: "menunggu",
  diterima: "sukses",
  ditolak: "bahaya",
};

export const NADA_STATUS_RAPOR: Record<StatusRapor, NadaStatus> = {
  draft: "netral",
  diajukan: "proses",
  revisi: "menunggu",
  terbit: "sukses",
};

export const NADA_STATUS_PENDAFTARAN: Record<StatusPendaftaran, NadaStatus> = {
  diajukan: "menunggu",
  diverifikasi: "proses",
  diterima: "sukses",
  ditolak: "bahaya",
};

export const NADA_STATUS_AKUN: Record<StatusAkun, NadaStatus> = {
  aktif: "sukses",
  nonaktif: "netral",
};

export const NADA_STATUS_MURID: Record<StatusMurid, NadaStatus> = {
  aktif: "sukses",
  lulus: "proses",
  pindah: "netral",
  keluar: "netral",
};

export const NADA_JENIS_AGENDA: Record<JenisAgenda, NadaStatus> = {
  kegiatan: "sukses",
  libur: "bahaya",
  rapat: "proses",
  lainnya: "netral",
};
