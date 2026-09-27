import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { HEADER_PATH } from "@/lib/auth/path";
import { statusSesi, type StatusSesi } from "@/lib/auth/role";
import { ambilSesi } from "@/lib/auth/session";
import type { User } from "@/types/domain";

export const PARAM_AKSES_DITOLAK = "akses";

/** Path yang sedang dibuka, dari header yang diisi proxy.ts. */
export async function pathSekarang(): Promise<string> {
  return (await headers()).get(HEADER_PATH) ?? "/dashboard";
}

/**
 * Sesi untuk halaman dashboard. Token yang ditolak backend diarahkan ke
 * /api/auth/sesi-habis (penghapus cookie) lalu ke login dengan ?next= halaman ini.
 */
export async function wajibSesi(): Promise<User> {
  const user = await ambilSesi();
  if (!user) redirect(`/api/auth/sesi-habis?next=${encodeURIComponent(await pathSekarang())}`);
  return user;
}

/**
 * Halaman yang hanya untuk role tertentu. Pengguna lain dikembalikan ke beranda
 * dengan pesan (B3); otorisasi sebenarnya tetap di backend.
 */
export async function wajibAkses(boleh: (sesi: StatusSesi) => boolean): Promise<User> {
  const user = await wajibSesi();
  if (!boleh(statusSesi(user))) redirect(`/dashboard?${PARAM_AKSES_DITOLAK}=ditolak`);
  return user;
}
