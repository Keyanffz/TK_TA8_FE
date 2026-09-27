export const RUTE_LOGIN = {
  pilihan: "/login",
  wali: "/login/wali",
  guru: "/login/guru",
} as const;

/** URL halaman login dengan ?next= yang dibawa ke halaman tujuan setelah masuk. */
export function urlLogin(rute: string, next?: string | null): string {
  return next ? `${rute}?next=${encodeURIComponent(next)}` : rute;
}
