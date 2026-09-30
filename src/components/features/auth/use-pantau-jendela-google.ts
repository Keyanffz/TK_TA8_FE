"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const INTERVAL_CEK_MS = 250;

/** Jendela Google biasanya terbuka kurang dari sedetik setelah tombol diklik. */
const BATAS_JENDELA_TERBUKA_MS = 3000;

/** Kredensial dikirim Google sesaat setelah jendelanya tertutup; beri jeda sebelum menganggap dibatalkan. */
const JEDA_SETELAH_JENDELA_TERTUTUP_MS = 2000;

export const PESAN_JENDELA_TIDAK_TERBUKA =
  "Jendela masuk Google belum terbuka. Kalau browser memblokir pop-up, izinkan pop-up untuk situs ini, lalu klik tombol Google lagi.";

export const PESAN_JENDELA_DITUTUP =
  "Masuk dengan Google belum selesai karena jendela Google ditutup. Klik tombol Google lagi untuk mencoba.";

/**
 * Google Identity Services tidak memberi tahu kalau jendela masuknya ditutup
 * atau diblokir. Setelah tombol diklik, halaman kehilangan fokus selama
 * jendela Google terbuka (tab baru di HP) dan mendapatkannya lagi saat jendela
 * itu ditutup. Kalau fokus tidak pernah hilang, jendela dianggap tidak
 * terbuka; kalau fokus kembali tanpa kredensial, dianggap dibatalkan.
 */
export function usePantauJendelaGoogle() {
  const [petunjuk, setPetunjuk] = useState<string | null>(null);
  const interval = useRef<number | null>(null);

  const hentikan = useCallback(() => {
    if (interval.current !== null) window.clearInterval(interval.current);
    interval.current = null;
  }, []);

  useEffect(() => hentikan, [hentikan]);

  // Stabil antar-render karena dipasang sekali ke tombol Google (click_listener).
  const mulai = useCallback(() => {
    hentikan();
    setPetunjuk(null);
    const mulaiPada = Date.now();
    let pernahKehilanganFokus = false;
    let fokusKembaliPada: number | null = null;

    interval.current = window.setInterval(() => {
      const sekarang = Date.now();
      if (!document.hasFocus() || document.visibilityState === "hidden") {
        pernahKehilanganFokus = true;
        fokusKembaliPada = null;
        return;
      }
      if (!pernahKehilanganFokus) {
        if (sekarang - mulaiPada >= BATAS_JENDELA_TERBUKA_MS) {
          setPetunjuk(PESAN_JENDELA_TIDAK_TERBUKA);
          hentikan();
        }
        return;
      }
      fokusKembaliPada ??= sekarang;
      if (sekarang - fokusKembaliPada >= JEDA_SETELAH_JENDELA_TERTUTUP_MS) {
        setPetunjuk(PESAN_JENDELA_DITUTUP);
        hentikan();
      }
    }, INTERVAL_CEK_MS);
  }, [hentikan]);

  const selesai = useCallback(() => {
    hentikan();
    setPetunjuk(null);
  }, [hentikan]);

  return { petunjuk, mulai, selesai };
}
