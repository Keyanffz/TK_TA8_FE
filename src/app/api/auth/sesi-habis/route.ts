import { NextResponse, type NextRequest } from "next/server";

import { ROLE_COOKIE } from "@/lib/auth/cookies";
import { amankanTujuan } from "@/lib/auth/redirect";
import { ruteLogin, urlLogin } from "@/lib/auth/rute-login";
import { hapusCookieSesi } from "@/lib/auth/sesi-cookie";

/**
 * Tujuan redirect dari Server Component saat token di cookie ditolak backend.
 * Server Component tidak bisa menghapus cookie, jadi penghapusan dilakukan di sini.
 */
export function GET(request: NextRequest) {
  const tujuan = amankanTujuan(request.nextUrl.searchParams.get("next"));
  const login = urlLogin(ruteLogin(request.cookies.get(ROLE_COOKIE)?.value), tujuan);
  // Location relatif: di balik reverse proxy, origin request di route handler adalah
  // alamat server Next.js (misalnya localhost:3000), bukan domain yang dibuka browser.
  // NextResponse.redirect() hanya menerima URL absolut.
  const response = new NextResponse(null, { status: 307, headers: { Location: login } });
  hapusCookieSesi(response);
  return response;
}
