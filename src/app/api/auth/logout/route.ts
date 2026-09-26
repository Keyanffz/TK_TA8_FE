import { NextResponse, type NextRequest } from "next/server";

import {
  beApiUrl,
  dariOriginSendiri,
  headerKeBackend,
  responsBackendTidakTerjangkau,
  responsOriginDitolak,
} from "@/lib/api/be";
import { TOKEN_COOKIE } from "@/lib/auth/cookies";
import { hapusCookieSesi } from "@/lib/auth/sesi-cookie";

export async function POST(request: NextRequest) {
  if (!dariOriginSendiri(request.headers)) return responsOriginDitolak();

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  let response: NextResponse;

  if (!token) {
    response = NextResponse.json({ success: true, message: "Berhasil keluar.", data: null, meta: null });
  } else {
    try {
      const upstream = await fetch(`${beApiUrl()}/auth/logout`, {
        method: "POST",
        headers: headerKeBackend(request.headers, token),
        cache: "no-store",
      });
      // 401 berarti token sudah tidak berlaku di backend; hasil akhirnya sama.
      if (!upstream.ok && upstream.status !== 401) {
        console.error(`Logout backend membalas ${upstream.status}`);
      }
      response = NextResponse.json({ success: true, message: "Berhasil keluar.", data: null, meta: null });
    } catch (penyebab) {
      response = responsBackendTidakTerjangkau(penyebab);
    }
  }

  // Cookie tetap dihapus walau backend gagal dihubungi, supaya perangkat ini benar-benar keluar.
  hapusCookieSesi(response);
  return response;
}
