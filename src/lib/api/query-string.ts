/**
 * Serializer query untuk openapi-fetch. Validasi `boolean` Laravel menolak
 * "true"/"false" di query string dan hanya menerima 1/0, jadi boolean dikirim
 * sebagai 1/0. Array dikirim sebagai `kunci[]=...`.
 */
export function serialisasiQuery(query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [kunci, nilai] of Object.entries(query)) {
    if (nilai === undefined || nilai === null) continue;
    if (Array.isArray(nilai)) {
      for (const isi of nilai) params.append(`${kunci}[]`, keTeks(isi));
    } else {
      params.append(kunci, keTeks(nilai));
    }
  }
  return params.toString();
}

function keTeks(nilai: unknown): string {
  if (typeof nilai === "boolean") return nilai ? "1" : "0";
  return String(nilai);
}
