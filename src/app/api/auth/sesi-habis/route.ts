import { NextResponse, type NextRequest } from "next/server";

import { ROLE_COOKIE } from "@/lib/auth/cookies";
import { amankanTujuan } from "@/lib/auth/redirect";
import { ruteLogin } from "@/lib/auth/rute-login";
import { hapusCookieSesi } from "@/lib/auth/sesi-cookie";

/**
 * Tujuan redirect dari Server Component saat token di cookie ditolak backend.
 * Server Component tidak bisa menghapus cookie, jadi penghapusan dilakukan di sini.
 */
export function GET(request: NextRequest) {
  const tujuan = amankanTujuan(request.nextUrl.searchParams.get("next"));
  const login = new URL(ruteLogin(request.cookies.get(ROLE_COOKIE)?.value), request.nextUrl.origin);
  login.searchParams.set("next", tujuan);
  const response = NextResponse.redirect(login);
  hapusCookieSesi(response);
  return response;
}
