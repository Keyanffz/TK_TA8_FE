import { BERANDA_STAFF, BERANDA_WALI } from "@/lib/auth/path";
import type { Role, User } from "@/types/domain";

export type StatusSesi = {
  role: Role | null;
  isSuperAdmin: boolean;
  isGuru: boolean;
  isWali: boolean;
  bisaKelolaKeuangan: boolean;
  /** /mudarris untuk guru dan Kepala Sekolah, /dashboard untuk wali murid. */
  beranda: string;
};

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
    bisaKelolaKeuangan: user?.permissions.kelola_keuangan ?? false,
    beranda: berandaUntuk(role),
  };
}
