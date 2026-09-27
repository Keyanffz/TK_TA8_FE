"use client";

// URL objek dilepas setelah jeda supaya tab/unduhan sempat membacanya.
const JEDA_LEPAS_URL_MS = 60_000;

function lepasNanti(url: string) {
  setTimeout(() => URL.revokeObjectURL(url), JEDA_LEPAS_URL_MS);
}

/** Simpan Blob (PDF kartu akun, kwitansi, Excel laporan) dengan nama file yang rapi (B6). */
export function simpanBlob(blob: Blob, namaFile: string): void {
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = namaFile;
  document.body.append(tautan);
  tautan.click();
  tautan.remove();
  lepasNanti(url);
}

/**
 * Buka PDF di tab baru untuk dicetak. Tab dibuka sebelum file diambil supaya
 * tidak diblokir browser (window.open setelah await dianggap pop-up); kalau
 * pengambilan gagal, tab ditutup lagi dan error diteruskan ke pemanggil.
 */
export async function bukaBlobDiTabBaru(ambil: () => Promise<Blob>): Promise<void> {
  const tab = window.open("", "_blank");
  try {
    const url = URL.createObjectURL(await ambil());
    if (tab) tab.location.href = url;
    else window.location.href = url;
    lepasNanti(url);
  } catch (error) {
    tab?.close();
    throw error;
  }
}
