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

const HEADER_REQUEST_DITERUSKAN = ["content-type", "content-length"];
const HEADER_RESPONS_DITERUSKAN = [
  "content-type",
  "content-disposition",
  "cache-control",
  "retry-after",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
];

// Node.js mewajibkan duplex "half" untuk body berupa stream; tipe RequestInit bawaan belum memuatnya.
type RequestInitStream = RequestInit & { duplex: "half" };

async function teruskan(request: NextRequest, context: RouteContext<"/api/proxy/[...path]">) {
  const metodeMengubah = request.method !== "GET" && request.method !== "HEAD";
  if (metodeMengubah && !dariOriginSendiri(request.headers)) return responsOriginDitolak();

  const { path } = await context.params;
  // Segmen "." dan ".." akan dinormalisasi URL sehingga bisa keluar dari prefix /api/v1.
  if (path.some((segmen) => segmen === "." || segmen === "..")) {
    return NextResponse.json(
      { success: false, message: "Data tidak ditemukan.", code: "NOT_FOUND", errors: null },
      { status: 404 },
    );
  }

  const target = `${beApiUrl()}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const headers = headerKeBackend(request.headers, token);
  for (const nama of HEADER_REQUEST_DITERUSKAN) {
    const nilai = request.headers.get(nama);
    if (nilai) headers.set(nama, nilai);
  }

  const init: RequestInitStream = {
    method: request.method,
    headers,
    body: metodeMengubah ? request.body : undefined,
    duplex: "half",
    redirect: "manual",
    cache: "no-store",
  };

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (penyebab) {
    return responsBackendTidakTerjangkau(penyebab);
  }

  const headersKeluar = new Headers();
  for (const nama of HEADER_RESPONS_DITERUSKAN) {
    const nilai = upstream.headers.get(nama);
    if (nilai) headersKeluar.set(nama, nilai);
  }

  const response = new NextResponse(upstream.body, { status: upstream.status, headers: headersKeluar });
  if (upstream.status === 401) hapusCookieSesi(response);
  return response;
}

export { teruskan as DELETE, teruskan as GET, teruskan as PATCH, teruskan as POST, teruskan as PUT };
