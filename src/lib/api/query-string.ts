/**
 * Serializer query untuk openapi-fetch: array dikirim sebagai `kunci[]=...`,
 * nilai kosong (undefined, null, string kosong) tidak dikirim.
 */
export function serialisasiQuery(query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [kunci, nilai] of Object.entries(query)) {
    if (nilai === undefined || nilai === null || nilai === "") continue;
    if (Array.isArray(nilai)) {
      for (const isi of nilai) params.append(`${kunci}[]`, String(isi));
    } else {
      params.append(kunci, String(nilai));
    }
  }
  return params.toString();
}
