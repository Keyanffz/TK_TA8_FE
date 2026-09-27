import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type AngkaNaikProps = {
  nilai: number;
  className?: string;
  /** Hitung langsung saat halaman dimuat, bukan saat masuk layar lewat <Muncul>. */
  saatDimuat?: boolean;
};

/**
 * Bilangan bulat yang menghitung naik dari 0 (CSS @property, lihat globals.css).
 * Pembaca layar membaca angka aslinya. Jangan dipakai untuk nominal uang.
 */
export function AngkaNaik({ nilai, className, saatDimuat }: AngkaNaikProps) {
  return (
    <span className={className}>
      <span className="sr-only">{nilai}</span>
      <span
        aria-hidden="true"
        className={cn("angka-naik", saatDimuat && "gerak-hitung")}
        style={{ "--nilai": Math.round(nilai) } as CSSProperties}
      />
    </span>
  );
}
