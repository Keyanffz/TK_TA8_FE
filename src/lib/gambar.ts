import imageCompression from "browser-image-compression";

// Backend menolak gambar di atas 5 MB (B5). Foto dari kamera HP dikecilkan di
// browser dulu supaya unggahan cepat di koneksi seluler.
const UKURAN_MAKS_MB = 1;
const SISI_MAKS_PX = 1600;
export const TIPE_GAMBAR_DITERIMA = ["image/jpeg", "image/png", "image/webp"] as const;

export function tipeGambarDiterima(file: File): boolean {
  return TIPE_GAMBAR_DITERIMA.some((tipe) => tipe === file.type);
}

// Batas backend untuk semua unggahan (MediaService::UKURAN_MAKSIMAL_KB).
export const UKURAN_MAKS_UNGGAH_BYTE = 5 * 1024 * 1024;
export const TIPE_PDF = "application/pdf";

// Hasil imageCompression kadang Blob biasa (bernama, tapi bukan File), jadi
// dibungkus ulang supaya nama file terkirim dan validasi `instanceof File` lolos.
export async function kompresGambar(file: File): Promise<File> {
  const hasil: Blob = await imageCompression(file, { maxSizeMB: UKURAN_MAKS_MB, maxWidthOrHeight: SISI_MAKS_PX, useWebWorker: true });
  return hasil instanceof File ? hasil : new File([hasil], file.name, { type: hasil.type, lastModified: Date.now() });
}
