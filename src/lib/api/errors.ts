import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type { KodeError, ResponsError } from "@/types/domain";

const KODE_ERROR: readonly KodeError[] = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "ACCOUNT_PENDING",
  "ACCOUNT_REJECTED",
  "ACCOUNT_INACTIVE",
  "PASSWORD_WAJIB_DIGANTI",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "BUSINESS_RULE",
  "TOO_MANY_REQUESTS",
  "SERVER_ERROR",
];

const PESAN_SERVER_TIDAK_TERJANGKAU =
  "Server sekolah sedang tidak bisa dihubungi. Coba lagi beberapa saat lagi.";

export class ApiError extends Error {
  readonly status: number;
  readonly code: KodeError;
  readonly errors: Record<string, string[]> | null;

  constructor(params: {
    status: number;
    code: KodeError;
    message: string;
    errors?: Record<string, string[]> | null;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.errors = params.errors ?? null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isKodeError(value: unknown): value is KodeError {
  return typeof value === "string" && KODE_ERROR.some((kode) => kode === value);
}

function bacaErrorsField(value: unknown): Record<string, string[]> | null {
  if (!isRecord(value)) return null;
  const hasil: Record<string, string[]> = {};
  for (const [field, pesan] of Object.entries(value)) {
    if (Array.isArray(pesan)) {
      hasil[field] = pesan.filter((item): item is string => typeof item === "string");
    }
  }
  return hasil;
}

export function isResponsError(body: unknown): body is ResponsError {
  return (
    isRecord(body) &&
    body.success === false &&
    typeof body.message === "string" &&
    isKodeError(body.code)
  );
}

function kodeDariStatus(status: number): KodeError {
  if (status === 401) return "UNAUTHENTICATED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 422) return "VALIDATION_ERROR";
  if (status === 429) return "TOO_MANY_REQUESTS";
  return "SERVER_ERROR";
}

export function buatApiError(response: Response, body: unknown): ApiError {
  if (isResponsError(body)) {
    return new ApiError({
      status: response.status,
      code: body.code,
      message: body.message,
      errors: bacaErrorsField(body.errors),
    });
  }

  return new ApiError({
    status: response.status,
    code: kodeDariStatus(response.status),
    message: PESAN_SERVER_TIDAK_TERJANGKAU,
  });
}

/** Untuk fetch langsung ke route handler BFF (login, logout) yang bukan lewat openapi-fetch. */
export async function errorDariResponse(response: Response): Promise<ApiError> {
  const teks = await response.text();
  try {
    return buatApiError(response, teks ? JSON.parse(teks) : null);
  } catch {
    console.error(`Respons ${response.status} dari ${response.url} bukan JSON`);
    return buatApiError(response, null);
  }
}

// Pesan 429 dari backend sudah menyebut lama tunggu, jadi dipakai apa adanya.
export function pesanError(error: unknown): string {
  return error instanceof ApiError ? error.message : PESAN_SERVER_TIDAK_TERJANGKAU;
}

/**
 * Memasang pesan VALIDATION_ERROR ke field form. Mengembalikan true kalau ada
 * pesan yang terpasang, supaya pemanggil tahu tidak perlu menampilkan toast.
 */
export function terapkanErrorValidasi<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  if (!(error instanceof ApiError) || error.code !== "VALIDATION_ERROR" || !error.errors) {
    return false;
  }
  let terpasang = false;
  for (const field of fields) {
    const pesan = error.errors[field]?.[0];
    if (pesan) {
      setError(field, { type: "server", message: pesan });
      terpasang = true;
    }
  }
  return terpasang;
}
