type NilaiMultipart = string | number | boolean | Blob | null | undefined | readonly (string | number | Blob)[];

/**
 * `bodySerializer` openapi-fetch untuk endpoint multipart. Array dikirim sebagai
 * `kunci[]` (format Laravel), null/undefined tidak dikirim, boolean sebagai 1/0.
 */
export function keFormData(body: Record<string, NilaiMultipart>): FormData {
  const data = new FormData();
  for (const [kunci, nilai] of Object.entries(body)) {
    if (nilai === null || nilai === undefined) continue;
    if (Array.isArray(nilai)) {
      for (const item of nilai) data.append(`${kunci}[]`, item instanceof Blob ? item : String(item));
    } else if (nilai instanceof Blob) {
      data.append(kunci, nilai);
    } else if (typeof nilai === "boolean") {
      data.append(kunci, nilai ? "1" : "0");
    } else {
      data.append(kunci, String(nilai));
    }
  }
  return data;
}
