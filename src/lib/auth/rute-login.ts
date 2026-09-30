import { isRoleStaff } from "@/lib/auth/role";

export const RUTE_LOGIN = {
  wali: "/login",
  staff: "/mudarris/login",
} as const;

/** Halaman akun guru dan Kepala Sekolah yang bisa dibuka tanpa masuk. */
export const RUTE_AKUN_STAFF = {
  daftar: "/mudarris/daftar",
  lupaPassword: "/mudarris/lupa-password",
  resetPassword: "/mudarris/reset-password",
  menungguPersetujuan: "/mudarris/menunggu-persetujuan",
} as const;

/**
 * Halaman login untuk role dari sesi atau cookie `tk_role`. Tanpa role
 * (belum pernah masuk di browser ini) ke login wali, pengguna terbanyak.
 */
export function ruteLogin(role: string | null | undefined): string {
  return isRoleStaff(role) ? RUTE_LOGIN.staff : RUTE_LOGIN.wali;
}

/** URL halaman login dengan ?next= yang dibawa ke halaman tujuan setelah masuk. */
export function urlLogin(rute: string, next?: string | null): string {
  return next ? `${rute}?next=${encodeURIComponent(next)}` : rute;
}
