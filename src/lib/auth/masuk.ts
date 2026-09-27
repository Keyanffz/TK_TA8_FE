import { z } from "zod";

import { errorDariResponse } from "@/lib/api/errors";
import { amankanTujuan } from "@/lib/auth/redirect";

// Respons route handler /api/auth/login dan /api/auth/google. Hanya bagian
// yang dibutuhkan untuk menentukan halaman tujuan yang dibaca.
const skemaResponsMasuk = z.object({
  data: z.object({
    user: z.object({
      role: z.enum(["super_admin", "guru", "wali_murid"]),
      wali_murid: z.object({ profil_lengkap: z.boolean() }).nullable(),
    }),
  }),
});

export type HasilMasuk = z.output<typeof skemaResponsMasuk>["data"]["user"];

async function kirim(path: "/api/auth/login" | "/api/auth/google", body: Record<string, string>): Promise<HasilMasuk> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await errorDariResponse(response);
  const json: unknown = await response.json();
  return skemaResponsMasuk.parse(json).data.user;
}

export function masukDenganEmail(nilai: { email: string; password: string }): Promise<HasilMasuk> {
  return kirim("/api/auth/login", nilai);
}

export function masukDenganGoogle(idToken: string): Promise<HasilMasuk> {
  return kirim("/api/auth/google", { id_token: idToken });
}

/** Wali yang profilnya belum lengkap selalu ke onboarding dulu (B3). */
export function tujuanSetelahMasuk(user: HasilMasuk, next: string | null): string {
  if (user.role === "wali_murid" && user.wali_murid?.profil_lengkap !== true) return "/dashboard/onboarding";
  return amankanTujuan(next);
}
