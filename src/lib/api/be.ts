import "server-only";

import { NextResponse } from "next/server";

import type { ResponsError } from "@/types/domain";

export function beApiUrl(): string {
  const url = process.env.BE_API_URL;
  if (!url) {
    throw new Error("BE_API_URL belum diisi. Salin .env.example ke .env.local lalu isi nilainya.");
  }
  return url.replace(/\/+$/, "");
}

/**
 * Header untuk request dari server Next.js ke backend. Rate limit backend
 * dihitung per IP klien, jadi rantai X-Forwarded-For dari request browser
 * diteruskan apa adanya. X-Forwarded-Host dan X-Forwarded-Proto sengaja tidak
 * diteruskan: signed URL file private dibentuk dari host request, dan harus
 * tetap menunjuk host backend.
 */
export function headerKeBackend(masuk: Headers, token?: string): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const forwardedFor = masuk.get("x-forwarded-for");
  if (forwardedFor) headers.set("X-Forwarded-For", forwardedFor);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export function responsBackendTidakTerjangkau(penyebab: unknown): NextResponse<ResponsError> {
  console.error("Request ke backend gagal:", penyebab);
  return NextResponse.json(
    {
      success: false,
      message: "Server sekolah sedang tidak bisa dihubungi. Coba lagi beberapa saat lagi.",
      code: "SERVER_ERROR",
      errors: null,
    },
    { status: 502 },
  );
}

/**
 * Request yang mengubah data harus berasal dari origin FE sendiri. Cookie sesi
 * memakai sameSite=lax, ini lapisan kedua terhadap CSRF.
 */
export function dariOriginSendiri(masuk: Headers): boolean {
  const origin = masuk.get("origin");
  if (!origin) return true;
  const host = masuk.get("x-forwarded-host") ?? masuk.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function responsOriginDitolak(): NextResponse<ResponsError> {
  return NextResponse.json(
    {
      success: false,
      message: "Permintaan ditolak karena tidak berasal dari situs ini.",
      code: "FORBIDDEN",
      errors: null,
    },
    { status: 403 },
  );
}
