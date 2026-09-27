import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

const JUMLAH_LEKUK = 8;

// Garis tepi perisai bergelombang seperti bingkai hijau di logo sekolah:
// delapan lekuk yang menggembung keluar di sekeliling lingkaran.
function jalurPerisai(): string {
  const pusat = 50;
  const jari = 40;
  const titik = Array.from({ length: JUMLAH_LEKUK }, (_, i) => {
    const sudut = ((2 * Math.PI) / JUMLAH_LEKUK) * i - Math.PI / 2;
    return [pusat + jari * Math.cos(sudut), pusat + jari * Math.sin(sudut)] as const;
  });
  const busur = 17;
  const [awalX, awalY] = titik[0] ?? [pusat, pusat - jari];
  const bagian = titik.map((_, i) => {
    const [x, y] = titik[(i + 1) % JUMLAH_LEKUK] ?? [awalX, awalY];
    return `A${busur} ${busur} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return `M${awalX.toFixed(2)} ${awalY.toFixed(2)} ${bagian.join(" ")} Z`;
}

export const JALUR_PERISAI = jalurPerisai();

const URL_MASKER = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='10 10 80 80' preserveAspectRatio='none'><path d='${JALUR_PERISAI}'/></svg>`,
)}")`;

/** Gaya mask berbentuk perisai untuk memotong foto; ikut membesar dengan elemennya. */
export const GAYA_MASKER_PERISAI: CSSProperties = {
  maskImage: URL_MASKER,
  WebkitMaskImage: URL_MASKER,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
};

type BentukPerisaiProps = {
  className?: string;
  style?: CSSProperties;
  isi?: "penuh" | "garis";
};

export function BentukPerisai({ className, style, isi = "penuh" }: BentukPerisaiProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={cn("overflow-visible", className)} style={style}>
      {isi === "penuh" ? (
        <path d={JALUR_PERISAI} fill="currentColor" />
      ) : (
        <path d={JALUR_PERISAI} fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
      )}
    </svg>
  );
}
