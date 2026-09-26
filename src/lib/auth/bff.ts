import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import {
  beApiUrl,
  dariOriginSendiri,
  headerKeBackend,
  responsBackendTidakTerjangkau,
  responsOriginDitolak,
} from "@/lib/api/be";
import { pasangCookieSesi } from "@/lib/auth/sesi-cookie";
import type { ResponsError, Role } from "@/types/domain";

const ROLE: readonly Role[] = ["super_admin", "guru", "wali_murid"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLE.some((role) => role === value);
}

function responsBodyTidakValid(): NextResponse<ResponsError> {
  return NextResponse.json(
    { success: false, message: "Data tidak valid", code: "VALIDATION_ERROR", errors: null },
    { status: 422 },
  );
}

async function bacaBodyJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  const teks = await request.text();
  if (!teks) return {};
  try {
    const body: unknown = JSON.parse(teks);
    return isRecord(body) ? body : null;
  } catch {
    return null;
  }
}

/**
 * Meneruskan login ke backend, lalu menyimpan token di cookie httpOnly.
 * Token tidak pernah dikirim ke browser; respons ke browser hanya berisi
 * data selain token (user, dan is_new untuk login Google).
 */
export async function masukLewatBackend(
  request: NextRequest,
  bePath: "/auth/login" | "/auth/google",
  fieldDiizinkan: readonly string[],
): Promise<NextResponse> {
  if (!dariOriginSendiri(request.headers)) return responsOriginDitolak();

  const bodyMasuk = await bacaBodyJson(request);
  if (!bodyMasuk) return responsBodyTidakValid();

  const bodyKeluar: Record<string, unknown> = { perangkat: "web" };
  for (const field of fieldDiizinkan) {
    if (field in bodyMasuk) bodyKeluar[field] = bodyMasuk[field];
  }

  const headers = headerKeBackend(request.headers);
  headers.set("Content-Type", "application/json");

  let upstream: Response;
  try {
    upstream = await fetch(`${beApiUrl()}${bePath}`, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyKeluar),
      cache: "no-store",
    });
  } catch (penyebab) {
    return responsBackendTidakTerjangkau(penyebab);
  }

  const teks = await upstream.text();
  let body: unknown = null;
  try {
    body = teks ? JSON.parse(teks) : null;
  } catch (penyebab) {
    return responsBackendTidakTerjangkau(penyebab);
  }

  if (!upstream.ok) {
    const headersKeluar = new Headers();
    const retryAfter = upstream.headers.get("Retry-After");
    if (retryAfter) headersKeluar.set("Retry-After", retryAfter);
    return NextResponse.json(body, { status: upstream.status, headers: headersKeluar });
  }

  const data = isRecord(body) ? body.data : null;
  if (!isRecord(data) || typeof data.token !== "string" || !isRecord(data.user) || !isRole(data.user.role)) {
    return responsBackendTidakTerjangkau(new Error(`Respons ${bePath} tidak sesuai kontrak`));
  }

  const token = data.token;
  const dataTanpaToken = Object.fromEntries(Object.entries(data).filter(([kunci]) => kunci !== "token"));
  const response = NextResponse.json({
    success: true,
    message: isRecord(body) && typeof body.message === "string" ? body.message : "Berhasil masuk.",
    data: dataTanpaToken,
    meta: null,
  });
  pasangCookieSesi(response, token, data.user.role);
  return response;
}
