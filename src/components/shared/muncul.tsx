"use client";

import type { ReactNode } from "react";

export type EfekMuncul = "pop" | "jatuh" | "balik" | "geser" | "gambar";

type MunculProps = {
  efek: EfekMuncul;
  as?: "div" | "ul" | "ol" | "dl";
  className?: string;
  children: ReactNode;
};

// Mulai animasi sedikit sebelum elemen benar-benar di tengah layar.
const BATAS_BAWAH = "0px 0px -10% 0px";

/**
 * Menjalankan efek muncul (lihat globals.css) saat elemen masuk layar. Anak
 * langsung dianimasikan bergiliran. Tanpa JavaScript, dengan gerak dikurangi,
 * atau kalau sudah terlihat saat dimuat, isi langsung tampil tanpa animasi.
 */
export function Muncul({ efek, as: Tag = "div", className, children }: MunculProps) {
  return (
    <Tag ref={pasangPengamat} className={className} data-muncul={efek}>
      {children}
    </Tag>
  );
}

// Callback ref dengan fungsi pembersih (React 19): dipanggil sekali saat elemen dipasang.
function pasangPengamat(elemen: HTMLElement | null): (() => void) | undefined {
  if (!elemen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const kotak = elemen.getBoundingClientRect();
  if (kotak.top < window.innerHeight && kotak.bottom > 0) {
    elemen.dataset.terlihat = "awal";
    return;
  }

  elemen.dataset.siap = "";
  const pengamat = new IntersectionObserver(
    ([entri]) => {
      if (!entri?.isIntersecting) return;
      elemen.dataset.terlihat = "gerak";
      pengamat.disconnect();
    },
    { rootMargin: BATAS_BAWAH },
  );
  pengamat.observe(elemen);
  return () => pengamat.disconnect();
}
