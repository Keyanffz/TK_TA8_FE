import { NextResponse, type NextRequest } from "next/server";

import { ROLE_COOKIE, TOKEN_COOKIE } from "@/lib/auth/cookies";
import { BERANDA_STAFF, BERANDA_WALI, HEADER_PATH, urlAksesDitolak } from "@/lib/auth/path";
import { berandaUntuk, isRoleStaff } from "@/lib/auth/role";
import { RUTE_AKUN_STAFF, RUTE_LOGIN } from "@/lib/auth/rute-login";

const HALAMAN_LOGIN: readonly string[] = Object.values(RUTE_LOGIN);
const HALAMAN_AKUN_STAFF: readonly string[] = Object.values(RUTE_AKUN_STAFF);

function diBawah(pathname: string, beranda: string): boolean {
  return pathname === beranda || pathname.startsWith(`${beranda}/`);
}

/**
 * Pengecekan cepat berdasarkan cookie: /dashboard untuk wali murid, /mudarris
 * untuk guru dan Kepala Sekolah. Keabsahan token dan role diperiksa lagi di
 * layout tiap area (GET /auth/me), halaman per role dijaga `wajibAkses()`, dan
 * otorisasi sebenarnya tetap di backend.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sudahMasuk = request.cookies.has(TOKEN_COOKIE);
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (HALAMAN_LOGIN.includes(pathname)) {
    return sudahMasuk ? NextResponse.redirect(new URL(berandaUntuk(role), request.url)) : NextResponse.next();
  }
  if (HALAMAN_AKUN_STAFF.includes(pathname)) return NextResponse.next();

  const areaStaff = diBawah(pathname, BERANDA_STAFF);

  if (!sudahMasuk) {
    const login = new URL(areaStaff ? RUTE_LOGIN.staff : RUTE_LOGIN.wali, request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  // Tautan /dashboard/... lama milik staff (notifikasi yang tersimpan sebelum
  // area dipisah, bookmark) dipindah ke halaman yang sama di /mudarris.
  if (!areaStaff && isRoleStaff(role)) {
    return NextResponse.redirect(new URL(`${BERANDA_STAFF}${pathname.slice(BERANDA_WALI.length)}${search}`, request.url));
  }
  if (areaStaff && role === "wali_murid") {
    return NextResponse.redirect(new URL(urlAksesDitolak(BERANDA_WALI), request.url));
  }

  // Layout perlu tahu path yang dibuka (misalnya untuk mengarahkan wali yang
  // belum melengkapi profil), sedangkan layout tidak menerima pathname.
  const headers = new Headers(request.headers);
  headers.set(HEADER_PATH, `${pathname}${search}`);
  return NextResponse.next({ request: { headers } });
}

// /api sengaja tidak dicocokkan: proxy membatasi body 10 MB, sedangkan
// unggahan kegiatan (10 foto) lewat /api/proxy bisa melebihinya.
export const config = {
  matcher: ["/dashboard/:path*", "/mudarris/:path*", "/login"],
};
