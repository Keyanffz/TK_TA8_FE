import { NextResponse, type NextRequest } from "next/server";

import { amankanTujuan } from "@/lib/auth/redirect";
import { hapusCookieSesi } from "@/lib/auth/sesi-cookie";

/**
 * Tujuan redirect dari Server Component saat token di cookie ditolak backend.
 * Server Component tidak bisa menghapus cookie, jadi penghapusan dilakukan di sini.
 */
export function GET(request: NextRequest) {
  const tujuan = amankanTujuan(request.nextUrl.searchParams.get("next"));
  const login = new URL("/login", request.nextUrl.origin);
  login.searchParams.set("next", tujuan);
  const response = NextResponse.redirect(login);
  hapusCookieSesi(response);
  return response;
}
