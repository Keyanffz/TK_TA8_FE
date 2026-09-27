import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { dariOriginSendiri, responsOriginDitolak } from "@/lib/api/be";
import { ambilSesi } from "@/lib/auth/session";
import { TAG_PUBLIK } from "@/lib/constants/sekolah";
import type { ResponsError } from "@/types/domain";

const TAG_DIKENAL: readonly string[] = Object.values(TAG_PUBLIK);

function galat(status: number, code: ResponsError["code"], message: string) {
  return NextResponse.json<ResponsError>({ success: false, message, code, errors: null }, { status });
}

/**
 * Membuang cache data publik (B7) setelah Kepala Sekolah menyimpan konten website. Hanya tag yang
 * dikenal yang diterima. `expire: 0` supaya pratinjau langsung menampilkan isi baru, bukan isi lama
 * yang disajikan sekali lagi selama revalidasi berjalan.
 */
export async function POST(request: NextRequest) {
  if (!dariOriginSendiri(request.headers)) return responsOriginDitolak();

  const user = await ambilSesi();
  if (!user) return galat(401, "UNAUTHENTICATED", "Sesi Anda sudah berakhir. Silakan masuk lagi.");
  if (user.role !== "super_admin") return galat(403, "FORBIDDEN", "Hanya Kepala Sekolah yang bisa memperbarui website.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return galat(422, "VALIDATION_ERROR", "Data tidak valid");
  }
  const tags = typeof body === "object" && body !== null && "tags" in body ? body.tags : null;
  if (!Array.isArray(tags) || tags.length === 0 || !tags.every((tag): tag is string => typeof tag === "string" && TAG_DIKENAL.includes(tag))) {
    return galat(422, "VALIDATION_ERROR", "Data tidak valid");
  }

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ success: true, message: "Website diperbarui.", data: null, meta: null });
}
