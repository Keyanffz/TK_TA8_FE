import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { BERANDA_STAFF, HEADER_PATH, urlAksesDitolak } from "@/lib/auth/path";
import { statusSesi, type StatusSesi } from "@/lib/auth/role";
import { ambilSesi } from "@/lib/auth/session";
import type { User } from "@/types/domain";

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
 * Halaman /mudarris yang hanya untuk sebagian staff (misalnya hanya Kepala
 * Sekolah atau petugas keuangan). Pengguna lain dikembalikan ke beranda
 * /mudarris dengan pesan (B3); otorisasi sebenarnya tetap di backend.
 */
export async function wajibAkses(boleh: (sesi: StatusSesi) => boolean): Promise<User> {
  const user = await wajibSesi();
  if (!boleh(statusSesi(user))) redirect(urlAksesDitolak(BERANDA_STAFF));
  return user;
}
