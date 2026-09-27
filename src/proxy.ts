import { NextResponse, type NextRequest } from "next/server";

import { TOKEN_COOKIE } from "@/lib/auth/cookies";
import { HEADER_PATH } from "@/lib/auth/path";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";

/**
 * Pengecekan cepat berdasarkan keberadaan cookie. Keabsahan token diperiksa
 * di layout dashboard (GET /auth/me), dan otorisasi sebenarnya tetap di backend.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sudahMasuk = request.cookies.has(TOKEN_COOKIE);

  if (pathname.startsWith("/dashboard") && !sudahMasuk) {
    const login = new URL(RUTE_LOGIN.pilihan, request.url);
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

  if ((pathname === RUTE_LOGIN.pilihan || pathname.startsWith(`${RUTE_LOGIN.pilihan}/`)) && sudahMasuk) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// /api sengaja tidak dicocokkan: proxy membatasi body 10 MB, sedangkan
// unggahan kegiatan (10 foto) lewat /api/proxy bisa melebihinya.
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/login/:path*"],
};
