import { NextResponse, type NextRequest } from "next/server";

import { amankanTujuan } from "@/lib/auth/redirect";
import { hapusCookieSesi } from "@/lib/auth/sesi-cookie";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";

/**
 * Tujuan redirect dari Server Component saat token di cookie ditolak backend.
 * Server Component tidak bisa menghapus cookie, jadi penghapusan dilakukan di sini.
 */
export function GET(request: NextRequest) {
  const tujuan = amankanTujuan(request.nextUrl.searchParams.get("next"));
  const login = new URL(RUTE_LOGIN.pilihan, request.nextUrl.origin);
  login.searchParams.set("next", tujuan);
  const response = NextResponse.redirect(login);
  hapusCookieSesi(response);
  return response;
}
