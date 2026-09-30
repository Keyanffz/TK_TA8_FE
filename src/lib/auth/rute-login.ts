export const RUTE_LOGIN = {
  wali: "/login",
  staff: "/staff/login",
} as const;

/**
 * Halaman login untuk role dari sesi atau cookie `tk_role`. Tanpa role
 * (belum pernah masuk di browser ini) ke login wali, pengguna terbanyak.
 */
export function ruteLogin(role: string | null | undefined): string {
  return role === "super_admin" || role === "guru" ? RUTE_LOGIN.staff : RUTE_LOGIN.wali;
}

/** URL halaman login dengan ?next= yang dibawa ke halaman tujuan setelah masuk. */
export function urlLogin(rute: string, next?: string | null): string {
  return next ? `${rute}?next=${encodeURIComponent(next)}` : rute;
}
