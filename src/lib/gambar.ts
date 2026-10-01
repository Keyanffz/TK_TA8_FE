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

// Swafoto absensi: backend membatasi 2 MB, dan foto cukup untuk mengenali wajah.
const SISI_MAKS_FOTO_ABSENSI_PX = 1280;
const UKURAN_MAKS_FOTO_ABSENSI_MB = 1;
const KUALITAS_JPEG_ABSENSI = 0.85;

/** Foto dari input file (cadangan kalau kamera di halaman tidak bisa dipakai) dijadikan JPEG maksimal 1280 px. */
export async function kompresFotoAbsensi(file: File): Promise<File> {
  const hasil: Blob = await imageCompression(file, {
    maxSizeMB: UKURAN_MAKS_FOTO_ABSENSI_MB,
    maxWidthOrHeight: SISI_MAKS_FOTO_ABSENSI_PX,
    fileType: "image/jpeg",
    useWebWorker: true,
  });
  return new File([hasil], "swafoto.jpg", { type: "image/jpeg", lastModified: Date.now() });
}

/** Satu bingkai video kamera menjadi JPEG maksimal 1280 px. Null kalau kamera belum menghasilkan gambar. */
export function tangkapBingkai(video: HTMLVideoElement): Promise<File | null> {
  const { videoWidth, videoHeight } = video;
  if (videoWidth === 0 || videoHeight === 0) return Promise.resolve(null);

  const skala = Math.min(1, SISI_MAKS_FOTO_ABSENSI_PX / Math.max(videoWidth, videoHeight));
  const kanvas = document.createElement("canvas");
  kanvas.width = Math.round(videoWidth * skala);
  kanvas.height = Math.round(videoHeight * skala);
  const konteks = kanvas.getContext("2d");
  if (!konteks) return Promise.resolve(null);
  konteks.drawImage(video, 0, 0, kanvas.width, kanvas.height);

  return new Promise((selesai) => {
    kanvas.toBlob(
      (blob) => selesai(blob ? new File([blob], "swafoto.jpg", { type: "image/jpeg", lastModified: Date.now() }) : null),
      "image/jpeg",
      KUALITAS_JPEG_ABSENSI,
    );
  });
}
