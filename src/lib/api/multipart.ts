type NilaiDasar = string | number | boolean | Blob | null | undefined;
type NilaiMultipart = NilaiDasar | readonly (string | number | Blob)[] | { readonly [kunci: string]: Exclude<NilaiDasar, Blob> };

/**
 * `bodySerializer` openapi-fetch untuk endpoint multipart. Array dikirim sebagai `kunci[]` dan objek sebagai
 * `kunci[sub]` (format Laravel), boolean sebagai 1/0. Bawaannya null/undefined tidak dikirim.
 *
 * `kirimKosong` untuk form yang mengganti seluruh data (ubah murid): null dan array kosong dikirim sebagai string
 * kosong, yang diubah backend menjadi null, supaya isian yang dikosongkan ikut terhapus.
 */
export function keFormData(body: Record<string, NilaiMultipart>, { kirimKosong = false } = {}): FormData {
  const data = new FormData();
  const tambah = (kunci: string, nilai: NilaiDasar) => {
    if (nilai === undefined) return;
    if (nilai === null) {
      if (kirimKosong) data.append(kunci, "");
    } else if (nilai instanceof Blob) {
      data.append(kunci, nilai);
    } else if (typeof nilai === "boolean") {
      data.append(kunci, nilai ? "1" : "0");
    } else {
      data.append(kunci, String(nilai));
    }
  };

  for (const [kunci, nilai] of Object.entries(body)) {
    if (Array.isArray(nilai)) {
      if (nilai.length === 0 && kirimKosong) data.append(kunci, "");
      for (const item of nilai) tambah(`${kunci}[]`, item);
    } else if (nilai !== null && typeof nilai === "object" && !(nilai instanceof Blob)) {
      for (const [sub, isi] of Object.entries(nilai)) tambah(`${kunci}[${sub}]`, isi);
    } else {
      tambah(kunci, nilai);
    }
  }
  return data;
}
