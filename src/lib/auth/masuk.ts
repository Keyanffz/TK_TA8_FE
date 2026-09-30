import { z } from "zod";

import { errorDariResponse } from "@/lib/api/errors";
import { RUTE_GANTI_PASSWORD, RUTE_ONBOARDING } from "@/lib/auth/path";
import { amankanTujuan } from "@/lib/auth/redirect";
import { berandaUntuk } from "@/lib/auth/role";

// Respons route handler /api/auth/staff/login dan /api/auth/wali/login. Hanya
// bagian yang dibutuhkan untuk menentukan halaman tujuan yang dibaca.
const skemaResponsMasuk = z.object({
  data: z.object({
    user: z.object({
      role: z.enum(["super_admin", "guru", "wali_murid"]),
      wajib_ganti_password: z.boolean(),
      wali_murid: z.object({ profil_lengkap: z.boolean() }).nullable(),
    }),
  }),
});

export type HasilMasuk = z.output<typeof skemaResponsMasuk>["data"]["user"];

async function kirim(path: "/api/auth/staff/login" | "/api/auth/wali/login", body: Record<string, string>): Promise<HasilMasuk> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await errorDariResponse(response);
  const json: unknown = await response.json();
  return skemaResponsMasuk.parse(json).data.user;
}

/** Kepala Sekolah dan guru. */
export function masukStaff(nilai: { email: string; password: string }): Promise<HasilMasuk> {
  return kirim("/api/auth/staff/login", nilai);
}

/** Wali murid: username = NIS anak (A2.1). */
export function masukWali(nilai: { username: string; password: string }): Promise<HasilMasuk> {
  return kirim("/api/auth/wali/login", nilai);
}

/**
 * Urutan wajib wali (A6): ganti password awal, lalu lengkapi profil, baru
 * halaman tujuan. Kedua langkah itu juga dijaga layout dashboard.
 */
export function tujuanSetelahMasuk(
  user: Pick<HasilMasuk, "role" | "wajib_ganti_password" | "wali_murid">,
  next: string | null,
): string {
  if (user.wajib_ganti_password) return RUTE_GANTI_PASSWORD;
  if (user.role === "wali_murid" && user.wali_murid?.profil_lengkap !== true) return RUTE_ONBOARDING;
  return amankanTujuan(next, berandaUntuk(user.role));
}
