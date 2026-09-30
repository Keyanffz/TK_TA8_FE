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

import { BERANDA_STAFF, BERANDA_WALI } from "@/lib/auth/path";
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

/** Item di konfigurasi: `path` ditulis tanpa beranda, karena wali di /dashboard dan staff di /mudarris. */
type ItemMenuDasar = Omit<ItemMenu, "href"> & { path: string };

const SA: Role = "super_admin";
const G: Role = "guru";
const W: Role = "wali_murid";

/** Satu sumber menu sidebar, lainnya (HP), dan bottom nav wali (B4). */
const MENU: readonly { judul: string; item: readonly ItemMenuDasar[] }[] = [
  {
    judul: "Utama",
    item: [
      { path: "", label: "Beranda", ikon: House, roles: [SA, G, W] },
      { path: "/anak", label: "Anak Saya", ikon: Smile, roles: [W] },
      { path: "/notifikasi", label: "Notifikasi", ikon: Bell, roles: [SA, G, W] },
    ],
  },
  {
    judul: "Akademik",
    item: [
      { path: "/kelas", label: "Kelas", ikon: School, roles: [SA, G] },
      { path: "/murid", label: "Murid", ikon: UsersRound, roles: [SA, G] },
      { path: "/kegiatan", label: "Kegiatan Kelas", labelPendek: "Kegiatan", ikon: Images, roles: [SA, G, W] },
      { path: "/rapor", label: "Rapor", ikon: BookOpenText, roles: [SA, G, W] },
      { path: "/pengumuman", label: "Pengumuman", ikon: Megaphone, roles: [SA, G, W] },
      { path: "/agenda", label: "Agenda", ikon: CalendarDays, roles: [SA, G, W] },
    ],
  },
  {
    judul: "Keuangan",
    item: [
      { path: "/tagihan", label: "Tagihan", ikon: ReceiptText, roles: [SA, G, W] },
      { path: "/pembayaran", label: "Pembayaran", ikon: Wallet, roles: [SA, W], keuangan: true },
      { path: "/keuangan/jenis-tagihan", label: "Jenis Tagihan", ikon: WalletCards, roles: [SA] },
      { path: "/keuangan/keringanan", label: "Keringanan", ikon: BadgePercent, roles: [SA], keuangan: true },
      { path: "/keuangan/laporan", label: "Laporan Keuangan", ikon: FileSpreadsheet, roles: [SA], keuangan: true },
      { path: "/keuangan/tunggakan", label: "Tunggakan", ikon: ClipboardList, roles: [SA], keuangan: true },
    ],
  },
  {
    judul: "Sekolah",
    item: [
      { path: "/guru", label: "Guru", ikon: GraduationCap, roles: [SA] },
      { path: "/wali-murid", label: "Wali Murid", ikon: Users, roles: [SA] },
      { path: "/tahun-ajaran", label: "Tahun Ajaran", ikon: Award, roles: [SA] },
      { path: "/ppdb", label: "PPDB", ikon: UserPlus, roles: [SA, W] },
    ],
  },
  {
    judul: "Website & Pengaturan",
    item: [
      { path: "/website", label: "Website", ikon: LayoutTemplate, roles: [SA] },
      { path: "/website/galeri", label: "Galeri", ikon: Images, roles: [SA] },
      { path: "/pengaturan", label: "Pengaturan", ikon: Settings, roles: [SA] },
      { path: "/log-aktivitas", label: "Log Aktivitas", ikon: History, roles: [SA] },
    ],
  },
];

/** Empat menu utama di bottom nav wali (HP); sisanya di sheet "Lainnya". */
export const MENU_BAWAH_WALI = ["/dashboard", "/dashboard/tagihan", "/dashboard/kegiatan", "/dashboard/pengumuman"] as const;

function bolehLihat(item: ItemMenuDasar, sesi: StatusSesi): boolean {
  if (!sesi.role) return false;
  return item.roles.includes(sesi.role) || (item.keuangan === true && sesi.bisaKelolaKeuangan);
}

export function menuUntuk(sesi: StatusSesi): GrupMenu[] {
  return MENU.map((grup) => ({
    judul: grup.judul,
    item: grup.item.filter((item) => bolehLihat(item, sesi)).map(({ path, ...item }) => ({ ...item, href: `${sesi.beranda}${path}` })),
  })).filter((grup) => grup.item.length > 0);
}

/** Item paling spesifik yang cocok dengan path, supaya /mudarris/website/galeri tidak ikut menandai /mudarris/website. */
export function hrefAktif(pathname: string, item: readonly ItemMenu[]): string | null {
  let terbaik: string | null = null;
  for (const { href } of item) {
    const beranda = href === BERANDA_WALI || href === BERANDA_STAFF;
    const cocok = beranda ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    if (cocok && (!terbaik || href.length > terbaik.length)) terbaik = href;
  }
  return terbaik;
}
