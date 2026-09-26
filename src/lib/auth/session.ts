import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { buatApiError } from "@/lib/api/errors";
import { apiServer } from "@/lib/api/server";
import { TOKEN_COOKIE } from "@/lib/auth/cookies";
import type { User } from "@/types/domain";

const KODE_SESI_TIDAK_BERLAKU = ["ACCOUNT_PENDING", "ACCOUNT_REJECTED", "ACCOUNT_INACTIVE"];

/**
 * User yang sedang masuk, atau null kalau tidak ada token atau token ditolak
 * backend. Di-cache per request supaya layout dan halaman tidak memanggil
 * /auth/me berulang.
 */
export const ambilSesi = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  const { data, error, response } = await apiServer({ token }).GET("/auth/me");
  if (data) return data.data;

  const apiError = buatApiError(response, error);
  if (apiError.status === 401 || KODE_SESI_TIDAK_BERLAKU.includes(apiError.code)) return null;
  throw apiError;
});
