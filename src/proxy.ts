import { NextResponse, type NextRequest } from "next/server";

import { TOKEN_COOKIE } from "@/lib/auth/cookies";

/**
 * Pengecekan cepat berdasarkan keberadaan cookie. Keabsahan token diperiksa
 * di layout dashboard (GET /auth/me), dan otorisasi sebenarnya tetap di backend.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sudahMasuk = request.cookies.has(TOKEN_COOKIE);

  if (pathname.startsWith("/dashboard") && !sudahMasuk) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (pathname === "/login" && sudahMasuk) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// /api sengaja tidak dicocokkan: proxy membatasi body 10 MB, sedangkan
// unggahan kegiatan (10 foto) lewat /api/proxy bisa melebihinya.
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
