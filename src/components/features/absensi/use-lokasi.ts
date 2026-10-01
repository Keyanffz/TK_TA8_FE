"use client";

import { useCallback, useState } from "react";

export type Posisi = { latitude: number; longitude: number; akurasi: number };

export type StatusLokasi =
  | { tahap: "diam" }
  | { tahap: "mencari" }
  | { tahap: "dapat"; posisi: Posisi }
  | { tahap: "gagal"; pesan: string };

const BATAS_TUNGGU_MS = 20_000;

const PESAN_TIDAK_DIDUKUNG =
  "Lokasi tidak bisa dibaca di browser ini. Buka halaman ini lewat alamat https sekolah dengan Chrome atau Safari versi terbaru.";

function pesanGalat(galat: GeolocationPositionError): string {
  if (galat.code === galat.PERMISSION_DENIED) {
    return "Izin lokasi ditolak. Buka pengaturan situs di browser, izinkan Lokasi untuk halaman ini, lalu tekan Coba Lagi.";
  }
  if (galat.code === galat.TIMEOUT) {
    return "Lokasi terlalu lama terbaca. Pindah ke tempat terbuka, pastikan GPS menyala, lalu coba lagi.";
  }
  return "Lokasi belum terbaca. Nyalakan GPS di HP Anda lalu coba lagi.";
}

/** Lokasi perangkat sekali baca dengan akurasi tinggi. `cari` dipanggil dari tombol atau saat alur absen dibuka. */
export function useLokasi(): { lokasi: StatusLokasi; cari: () => void } {
  const [lokasi, setLokasi] = useState<StatusLokasi>({ tahap: "diam" });

  const cari = useCallback(() => {
    if (!window.isSecureContext || !("geolocation" in navigator)) {
      setLokasi({ tahap: "gagal", pesan: PESAN_TIDAK_DIDUKUNG });
      return;
    }
    setLokasi({ tahap: "mencari" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLokasi({ tahap: "dapat", posisi: { latitude: coords.latitude, longitude: coords.longitude, akurasi: coords.accuracy } }),
      (galat) => setLokasi({ tahap: "gagal", pesan: pesanGalat(galat) }),
      { enableHighAccuracy: true, timeout: BATAS_TUNGGU_MS, maximumAge: 0 },
    );
  }, []);

  return { lokasi, cari };
}
