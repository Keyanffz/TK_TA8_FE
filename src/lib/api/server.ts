import "server-only";

import createClient from "openapi-fetch";

import { beApiUrl } from "@/lib/api/be";
import { serialisasiQuery } from "@/lib/api/query-string";
import type { paths } from "@/types/api";

type OpsiServer = {
  token?: string;
  /** Detik; diisi untuk data publik yang boleh di-cache (ISR). */
  revalidate?: number;
  tags?: string[];
};

/**
 * Client untuk Server Component. Opsi cache Next.js dipasang lewat fetch
 * kustom, karena openapi-fetch membungkus request dalam objek Request dan
 * opsi `next` di dalamnya tidak terbaca oleh fetch Next.js.
 */
export function apiServer({ token, revalidate, tags }: OpsiServer = {}) {
  const cache: Pick<RequestInit, "cache" | "next"> =
    revalidate === undefined ? { cache: "no-store" } : { next: { revalidate, tags } };

  return createClient<paths>({
    baseUrl: beApiUrl(),
    headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
    querySerializer: serialisasiQuery,
    fetch: (request) => fetch(request, cache),
  });
}
