import imageCompression from "browser-image-compression";

// Backend menolak gambar di atas 5 MB (B5). Foto dari kamera HP dikecilkan di
// browser dulu supaya unggahan cepat di koneksi seluler.
const UKURAN_MAKS_MB = 1;
const SISI_MAKS_PX = 1600;
export const TIPE_GAMBAR_DITERIMA = ["image/jpeg", "image/png", "image/webp"] as const;

export function tipeGambarDiterima(file: File): boolean {
  return TIPE_GAMBAR_DITERIMA.some((tipe) => tipe === file.type);
}

export function kompresGambar(file: File): Promise<File> {
  return imageCompression(file, { maxSizeMB: UKURAN_MAKS_MB, maxWidthOrHeight: SISI_MAKS_PX, useWebWorker: true });
}
