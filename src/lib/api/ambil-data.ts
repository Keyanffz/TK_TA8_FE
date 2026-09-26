import { buatApiError } from "@/lib/api/errors";

type HasilFetch<T> = { data?: T; error?: unknown; response: Response };

/**
 * Mengubah hasil openapi-fetch menjadi data sukses, atau melempar ApiError
 * supaya React Query dan form menangani error lewat satu jalur.
 */
export async function ambilData<T>(permintaan: Promise<HasilFetch<T>>): Promise<T> {
  const { data, error, response } = await permintaan;
  if (!response.ok || data === undefined) {
    throw buatApiError(response, error);
  }
  return data;
}
