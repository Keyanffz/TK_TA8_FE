import { NextResponse, type NextRequest } from "next/server";

import { TOKEN_COOKIE } from "@/lib/auth/cookies";
import { HEADER_PATH } from "@/lib/auth/path";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";

const HALAMAN_LOGIN: readonly string[] = Object.values(RUTE_LOGIN);

/**
 * Pengecekan cepat berdasarkan keberadaan cookie. Keabsahan token diperiksa
 * di layout dashboard (GET /auth/me), halaman per role dijaga `wajibAkses()`,
 * dan otorisasi sebenarnya tetap di backend.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sudahMasuk = request.cookies.has(TOKEN_COOKIE);

  // Tanpa cookie sesi, role tidak diketahui (tk_role dihapus bersama tk_token),
  // jadi diarahkan ke login wali. Sesi yang ditolak backend diarahkan sesuai
  // role lewat /api/auth/sesi-habis.
  if (pathname.startsWith("/dashboard") && !sudahMasuk) {
    const login = new URL(RUTE_LOGIN.wali, request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  // Layout dashboard perlu tahu path yang dibuka (misalnya untuk mengarahkan
  // wali yang belum melengkapi profil), sedangkan layout tidak menerima pathname.
  if (pathname.startsWith("/dashboard")) {
    const headers = new Headers(request.headers);
    headers.set(HEADER_PATH, `${pathname}${search}`);
    return NextResponse.next({ request: { headers } });
  }

  // Beranda /dashboard dipakai semua role; isinya menyesuaikan role dari sesi.
  if (HALAMAN_LOGIN.includes(pathname) && sudahMasuk) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// /api sengaja tidak dicocokkan: proxy membatasi body 10 MB, sedangkan
// unggahan kegiatan (10 foto) lewat /api/proxy bisa melebihinya.
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/staff/login"],
};
