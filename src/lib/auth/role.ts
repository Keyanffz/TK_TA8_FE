import { BERANDA_STAFF, BERANDA_WALI } from "@/lib/auth/path";
import type { IzinEfektif, LevelIzin, ModulIzin, Role, User } from "@/types/domain";

export type StatusSesi = {
  role: Role | null;
  isSuperAdmin: boolean;
  isGuru: boolean;
  isWali: boolean;
  /** Izin per modul dari `/auth/me` (A2.13); Kepala Sekolah `kelola` semua, wali murid null semua. */
  izin: IzinEfektif;
  /** /mudarris untuk guru dan Kepala Sekolah, /dashboard untuk wali murid. */
  beranda: string;
};

const TANPA_IZIN: IzinEfektif = { keuangan: null, konten_website: null, laporan_absensi: null, data_murid: null, pengumuman: null };

/** Menerima string mentah juga, karena role kadang dibaca dari cookie `tk_role`. */
export function isRoleStaff(role: string | null | undefined): boolean {
  return role === "super_admin" || role === "guru";
}

export function berandaUntuk(role: string | null | undefined): string {
  return isRoleStaff(role) ? BERANDA_STAFF : BERANDA_WALI;
}

export function statusSesi(user: User | null | undefined): StatusSesi {
  const role = user?.role ?? null;
  return {
    role,
    isSuperAdmin: role === "super_admin",
    isGuru: role === "guru",
    isWali: role === "wali_murid",
    izin: user?.izin ?? TANPA_IZIN,
    beranda: berandaUntuk(role),
  };
}

/** Sama dengan pemeriksaan backend: izin kelola selalu mencakup izin lihat modul yang sama. */
export function punyaIzin(sesi: Pick<StatusSesi, "izin">, modul: ModulIzin, level: LevelIzin = "lihat"): boolean {
  const milik = sesi.izin[modul];
  return milik === "kelola" || (milik === "lihat" && level === "lihat");
}
