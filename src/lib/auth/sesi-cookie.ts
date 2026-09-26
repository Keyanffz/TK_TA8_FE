import "server-only";

import type { NextResponse } from "next/server";

import { ANAK_COOKIE, ROLE_COOKIE, SESI_MAX_AGE_DETIK, TOKEN_COOKIE } from "@/lib/auth/cookies";
import type { Role } from "@/types/domain";

const opsiDasar = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: SESI_MAX_AGE_DETIK,
} as const;

export function pasangCookieSesi(response: NextResponse, token: string, role: Role): void {
  response.cookies.set(TOKEN_COOKIE, token, { ...opsiDasar, httpOnly: true });
  response.cookies.set(ROLE_COOKIE, role, { ...opsiDasar, httpOnly: false });
}

export function hapusCookieSesi(response: NextResponse): void {
  for (const nama of [TOKEN_COOKIE, ROLE_COOKIE, ANAK_COOKIE]) {
    response.cookies.set(nama, "", { path: "/", maxAge: 0 });
  }
}
