export const TOKEN_COOKIE = "tk_token";
export const ROLE_COOKIE = "tk_role";
export const ANAK_COOKIE = "tk_anak";

// Sama dengan masa berlaku token Sanctum di backend.
export const SESI_MAX_AGE_DETIK = 60 * 60 * 24 * 30;

// Preferensi tampilan, bukan data sesi: sidebar diciutkan atau tidak.
export const SIDEBAR_COOKIE = "tk_sidebar";

// Cookie preferensi yang ditulis dari browser (anak aktif, sidebar): satu tahun.
export const PREFERENSI_MAX_AGE_DETIK = 60 * 60 * 24 * 365;

export function tulisCookiePreferensi(nama: string, nilai: string): void {
  document.cookie = `${nama}=${encodeURIComponent(nilai)}; path=/; max-age=${PREFERENSI_MAX_AGE_DETIK}; samesite=lax`;
}
