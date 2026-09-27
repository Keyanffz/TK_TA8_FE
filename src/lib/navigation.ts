import {
  Award,
  BadgePercent,
  Bell,
  BookOpenText,
  CalendarDays,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  History,
  House,
  Images,
  LayoutTemplate,
  Megaphone,
  ReceiptText,
  School,
  Settings,
  Smile,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import type { StatusSesi } from "@/lib/auth/role";
import type { Role } from "@/types/domain";

export type ItemMenu = {
  href: string;
  label: string;
  /** Label di bottom nav wali yang sempit. */
  labelPendek?: string;
  ikon: LucideIcon;
  roles: readonly Role[];
  /** Juga tampil untuk guru dengan izin kelola keuangan (K). */
  keuangan?: true;
};

export type GrupMenu = { judul: string; item: readonly ItemMenu[] };

const SA: Role = "super_admin";
const G: Role = "guru";
const W: Role = "wali_murid";

/** Satu sumber menu sidebar, lainnya (HP), dan bottom nav wali (B4). */
export const MENU: readonly GrupMenu[] = [
  {
    judul: "Utama",
    item: [
      { href: "/dashboard", label: "Beranda", ikon: House, roles: [SA, G, W] },
      { href: "/dashboard/anak", label: "Anak Saya", ikon: Smile, roles: [W] },
      { href: "/dashboard/notifikasi", label: "Notifikasi", ikon: Bell, roles: [SA, G, W] },
    ],
  },
  {
    judul: "Akademik",
    item: [
      { href: "/dashboard/kelas", label: "Kelas", ikon: School, roles: [SA, G] },
      { href: "/dashboard/murid", label: "Murid", ikon: UsersRound, roles: [SA, G] },
      { href: "/dashboard/kegiatan", label: "Kegiatan Kelas", labelPendek: "Kegiatan", ikon: Images, roles: [SA, G, W] },
      { href: "/dashboard/rapor", label: "Rapor", ikon: BookOpenText, roles: [SA, G, W] },
      { href: "/dashboard/pengumuman", label: "Pengumuman", ikon: Megaphone, roles: [SA, G, W] },
      { href: "/dashboard/agenda", label: "Agenda", ikon: CalendarDays, roles: [SA, G, W] },
    ],
  },
  {
    judul: "Keuangan",
    item: [
      { href: "/dashboard/tagihan", label: "Tagihan", ikon: ReceiptText, roles: [SA, G, W] },
      { href: "/dashboard/pembayaran", label: "Pembayaran", ikon: Wallet, roles: [SA, W], keuangan: true },
      { href: "/dashboard/keuangan/jenis-tagihan", label: "Jenis Tagihan", ikon: WalletCards, roles: [SA] },
      { href: "/dashboard/keuangan/keringanan", label: "Keringanan", ikon: BadgePercent, roles: [SA], keuangan: true },
      { href: "/dashboard/keuangan/laporan", label: "Laporan Keuangan", ikon: FileSpreadsheet, roles: [SA], keuangan: true },
      { href: "/dashboard/keuangan/tunggakan", label: "Tunggakan", ikon: ClipboardList, roles: [SA], keuangan: true },
    ],
  },
  {
    judul: "Sekolah",
    item: [
      { href: "/dashboard/guru", label: "Guru", ikon: GraduationCap, roles: [SA] },
      { href: "/dashboard/wali-murid", label: "Wali Murid", ikon: Users, roles: [SA] },
      { href: "/dashboard/tahun-ajaran", label: "Tahun Ajaran", ikon: Award, roles: [SA] },
      { href: "/dashboard/ppdb", label: "PPDB", ikon: UserPlus, roles: [SA, W] },
    ],
  },
  {
    judul: "Website & Pengaturan",
    item: [
      { href: "/dashboard/website", label: "Website", ikon: LayoutTemplate, roles: [SA] },
      { href: "/dashboard/website/galeri", label: "Galeri", ikon: Images, roles: [SA] },
      { href: "/dashboard/pengaturan", label: "Pengaturan", ikon: Settings, roles: [SA] },
      { href: "/dashboard/log-aktivitas", label: "Log Aktivitas", ikon: History, roles: [SA] },
    ],
  },
];

/** Empat menu utama di bottom nav wali (HP); sisanya di sheet "Lainnya". */
export const MENU_BAWAH_WALI = ["/dashboard", "/dashboard/tagihan", "/dashboard/kegiatan", "/dashboard/pengumuman"] as const;

export function bolehLihat(item: ItemMenu, sesi: StatusSesi): boolean {
  if (!sesi.role) return false;
  return item.roles.includes(sesi.role) || (item.keuangan === true && sesi.bisaKelolaKeuangan);
}

export function menuUntuk(sesi: StatusSesi): GrupMenu[] {
  return MENU.map((grup) => ({ judul: grup.judul, item: grup.item.filter((item) => bolehLihat(item, sesi)) })).filter(
    (grup) => grup.item.length > 0,
  );
}

/** Item paling spesifik yang cocok dengan path, supaya /dashboard/website/galeri tidak ikut menandai /dashboard/website. */
export function hrefAktif(pathname: string, item: readonly ItemMenu[]): string | null {
  let terbaik: string | null = null;
  for (const { href } of item) {
    const cocok = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    if (cocok && (!terbaik || href.length > terbaik.length)) terbaik = href;
  }
  return terbaik;
}
