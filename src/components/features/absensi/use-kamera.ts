"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** Sebab kamera tidak bisa dipakai. Teks untuk tiap sebab ada di `galat-kamera.tsx`. */
export type GalatKamera = "izin_ditolak" | "tidak_ada" | "dipakai" | "tidak_didukung" | "tidak_tampil";

export type StatusKamera =
  | { tahap: "meminta" }
  | { tahap: "memuat" }
  | { tahap: "aktif" }
  | { tahap: "gagal"; galat: GalatKamera };

export type Kamera = {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: StatusKamera;
  /** Dipasang di `onLoadedData` video: gambar pertama sudah tampil. */
  tandaiTampil: () => void;
  /** Membuka kamera lagi, setelah gagal atau untuk mengambil ulang foto. */
  bukaLagi: () => void;
};

// Dihitung sejak browser memberi aliran kamera, jadi lamanya pengguna menjawab dialog izin tidak ikut dihitung.
const BATAS_TUNGGU_GAMBAR_MS = 10_000;

function kenaliGalat(galat: unknown): GalatKamera {
  const nama = galat instanceof DOMException ? galat.name : "";
  if (nama === "NotAllowedError" || nama === "SecurityError") return "izin_ditolak";
  if (nama === "NotFoundError" || nama === "OverconstrainedError") return "tidak_ada";
  if (nama === "NotReadableError") return "dipakai";
  return "tidak_tampil";
}

// Di alamat http selain localhost (bukan secure context) navigator.mediaDevices tidak ada.
function statusAwal(): StatusKamera {
  const didukung = typeof window !== "undefined" && window.isSecureContext && typeof navigator.mediaDevices?.getUserMedia === "function";
  return didukung ? { tahap: "meminta" } : { tahap: "gagal", galat: "tidak_didukung" };
}

/**
 * Kamera depan untuk swafoto absensi. Kamera menyala selama `perlu` (belum ada foto) dan belum gagal, lalu
 * dimatikan saat foto didapat, kamera gagal, atau komponen dilepas.
 */
export function useKamera(perlu: boolean): Kamera {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<StatusKamera>(statusAwal);
  const menyala = perlu && status.tahap !== "gagal";

  useEffect(() => {
    if (!menyala) return;

    let batal = false;
    let aliran: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
      .then((hasil) => {
        if (batal) {
          hasil.getTracks().forEach((jalur) => jalur.stop());
          return;
        }
        aliran = hasil;
        if (videoRef.current) videoRef.current.srcObject = hasil;
        setStatus({ tahap: "memuat" });
      })
      .catch((galat: unknown) => {
        if (!batal) setStatus({ tahap: "gagal", galat: kenaliGalat(galat) });
      });

    return () => {
      batal = true;
      aliran?.getTracks().forEach((jalur) => jalur.stop());
    };
  }, [menyala]);

  useEffect(() => {
    if (status.tahap !== "memuat") return;
    const batas = window.setTimeout(() => setStatus({ tahap: "gagal", galat: "tidak_tampil" }), BATAS_TUNGGU_GAMBAR_MS);
    return () => window.clearTimeout(batas);
  }, [status.tahap]);

  // Hanya dari tahap memuat, supaya gambar yang datang tepat setelah batas tunggu habis tidak menghidupkan kamera yang sudah dimatikan.
  const tandaiTampil = useCallback(() => setStatus((lama) => (lama.tahap === "memuat" ? { tahap: "aktif" } : lama)), []);
  const bukaLagi = useCallback(() => setStatus(statusAwal()), []);

  return { videoRef, status, tandaiTampil, bukaLagi };
}
