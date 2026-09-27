import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

// Bintang lima sudut seperti sembilan bintang di logo sekolah, sudutnya
// dibulatkan lewat stroke supaya terasa lembut.
function titikBintang(): string {
  const titik: string[] = [];
  for (let i = 0; i < 10; i++) {
    const jari = i % 2 === 0 ? 11 : 4.6;
    const sudut = (Math.PI / 5) * i - Math.PI / 2;
    titik.push(`${(12 + jari * Math.cos(sudut)).toFixed(2)},${(12.6 + jari * Math.sin(sudut)).toFixed(2)}`);
  }
  return titik.join(" ");
}

export const TITIK_BINTANG = titikBintang();

type BintangProps = { className?: string; style?: CSSProperties };

export function Bintang({ className, style }: BintangProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("text-bintang", className)} style={style}>
      <polygon points={TITIK_BINTANG} fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export type PosisiBintang = {
  /** Persen dari kiri dan atas bidang induk. */
  x: number;
  y: number;
  /** px */
  ukuran: number;
  gerak: "kelip" | "melayang";
  tunda: number;
  durasi?: number;
};

/** Bintang-bintang yang berkelip atau melayang pelan di atas blok hijau. */
export function TaburanBintang({ bintang, className }: { bintang: readonly PosisiBintang[]; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {bintang.map((item) => (
        <Bintang
          key={`${item.x}-${item.y}`}
          className={cn("absolute", item.gerak === "kelip" ? "gerak-kelip" : "gerak-melayang")}
          style={
            {
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.ukuran,
              height: item.ukuran,
              "--tunda": `${item.tunda}s`,
              "--durasi": item.durasi ? `${item.durasi}s` : undefined,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
