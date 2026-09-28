"use client";

import { useEffect } from "react";

export const PESAN_BELUM_DISIMPAN = "Ada perubahan yang belum disimpan. Tinggalkan halaman ini tanpa menyimpan?";

/**
 * Selama `aktif`, menutup/memuat ulang tab memunculkan konfirmasi browser, dan klik tautan internal
 * (menu, logo) meminta konfirmasi dulu. Router App Router tidak punya event "sebelum pindah halaman",
 * jadi klik tautan ditangkap di fase capture sebelum Link Next menanganinya.
 */
export function usePeringatanBelumDisimpan(aktif: boolean) {
  useEffect(() => {
    if (!aktif) return;

    const sebelumTutup = (event: BeforeUnloadEvent) => event.preventDefault();
    const sebelumKlik = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const tautan = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(tautan instanceof HTMLAnchorElement) || tautan.target === "_blank" || tautan.origin !== window.location.origin) return;
      if (!window.confirm(PESAN_BELUM_DISIMPAN)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", sebelumTutup);
    document.addEventListener("click", sebelumKlik, true);
    return () => {
      window.removeEventListener("beforeunload", sebelumTutup);
      document.removeEventListener("click", sebelumKlik, true);
    };
  }, [aktif]);
}
