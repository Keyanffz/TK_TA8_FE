/** Header yang diisi proxy.ts dengan path + query halaman dashboard yang dibuka. */
export const HEADER_PATH = "x-tk-path";

/** Beranda wali murid. Guru dan Kepala Sekolah punya area sendiri di /mudarris. */
export const BERANDA_WALI = "/dashboard";
export const BERANDA_STAFF = "/mudarris";

export const RUTE_ONBOARDING = "/dashboard/onboarding";

/** Wali yang masih memakai password awal hanya boleh membuka halaman ini (A2.1). */
export const RUTE_GANTI_PASSWORD = "/dashboard/ganti-password";

const PARAM_AKSES_DITOLAK = "akses";

/** Beranda dengan penanda yang dibaca `PesanAksesDitolak` untuk menampilkan pesan. */
export function urlAksesDitolak(beranda: string): string {
  return `${beranda}?${PARAM_AKSES_DITOLAK}=ditolak`;
}

export function aksesDitolak(params: URLSearchParams): boolean {
  return params.get(PARAM_AKSES_DITOLAK) === "ditolak";
}
