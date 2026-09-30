import {
  BookCheck,
  BookOpenText,
  CalendarClock,
  CircleAlert,
  CircleCheck,
  CircleX,
  Link2,
  Megaphone,
  ReceiptText,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { NadaStatus } from "@/lib/constants/status";
import type { JenisNotifikasi } from "@/types/domain";

export const TAMPILAN_NOTIFIKASI: Record<JenisNotifikasi, { ikon: LucideIcon; nada: NadaStatus }> = {
  tagihan_baru: { ikon: ReceiptText, nada: "proses" },
  tagihan_tertunda: { ikon: CalendarClock, nada: "menunggu" },
  pengingat_tagihan: { ikon: CalendarClock, nada: "menunggu" },
  tagihan_terlambat: { ikon: CircleAlert, nada: "bahaya" },
  pembayaran_masuk: { ikon: Wallet, nada: "proses" },
  pembayaran_diterima: { ikon: CircleCheck, nada: "sukses" },
  pembayaran_ditolak: { ikon: CircleX, nada: "bahaya" },
  rapor_diajukan: { ikon: BookOpenText, nada: "proses" },
  rapor_revisi: { ikon: BookOpenText, nada: "menunggu" },
  rapor_terbit: { ikon: BookCheck, nada: "sukses" },
  pengumuman_baru: { ikon: Megaphone, nada: "proses" },
  pendaftaran_baru: { ikon: UserPlus, nada: "proses" },
  pendaftaran_diproses: { ikon: UserPlus, nada: "sukses" },
  anak_tertaut: { ikon: Link2, nada: "sukses" },
};
