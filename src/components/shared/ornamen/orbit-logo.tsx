import type { CSSProperties, ReactNode } from "react";

import { Bintang } from "@/components/shared/ornamen/bintang";
import { BentukPerisai } from "@/components/shared/ornamen/perisai";
import { cn } from "@/lib/utils";

// Susunan sembilan bintang di logo: satu bintang besar di atas, delapan
// bintang kecil turun di kiri dan kanan. Sudut diukur dari puncak.
const SUDUT_BINTANG = [0, -40, 40, -78, 78, -116, 116, -154, 154] as const;

type OrbitLogoProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Isi (logo atau foto) dikelilingi sembilan bintang yang berkelip bergantian,
 * di atas perisai kuning yang berputar sangat pelan. Bintang berputar saat
 * disentuh kursor.
 */
export function OrbitLogo({ children, className }: OrbitLogoProps) {
  return (
    <div className={cn("relative aspect-square", className)}>
      <BentukPerisai className="gerak-putar absolute inset-[11%] text-highlight" style={{ "--durasi": "140s" } as CSSProperties} />
      <BentukPerisai
        isi="garis"
        className="gerak-napas absolute inset-0 text-primary-foreground/50"
        style={{ "--durasi": "11s" } as CSSProperties}
      />
      <div className="absolute inset-[20%] overflow-hidden rounded-full bg-card shadow-md">{children}</div>
      <div className="absolute inset-0">
        {SUDUT_BINTANG.map((sudut, indeks) => {
          const radian = (sudut * Math.PI) / 180;
          const besar = indeks === 0;
          return (
            <Bintang
              key={sudut}
              className={cn("putar-saat-hover gerak-kelip absolute -translate-1/2", besar ? "size-[11%]" : "size-[6.5%]")}
              style={
                {
                  left: `${50 + 45 * Math.sin(radian)}%`,
                  top: `${50 - 45 * Math.cos(radian)}%`,
                  "--tunda": `${indeks * 0.32}s`,
                  "--durasi": "3.4s",
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
