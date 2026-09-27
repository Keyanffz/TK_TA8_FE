import type { CSSProperties } from "react";

import { Muncul } from "@/components/shared/muncul";
import { TITIK_BINTANG } from "@/components/shared/ornamen/bintang";
import { cn } from "@/lib/utils";

const DAUN = [
  { cx: 27, cy: 9, sudut: -35 },
  { cx: 73, cy: 22, sudut: 30 },
  { cx: 114, cy: 8, sudut: -30 },
] as const;

/**
 * Sulur bergaya ornamen Islami di bawah judul: batang digambar dari kiri,
 * daun tumbuh satu per satu, diakhiri bintang kecil dari logo.
 */
export function Sulur({ className, warnaBatang = "text-primary" }: { className?: string; warnaBatang?: string }) {
  return (
    <Muncul efek="gambar" className={cn("mt-1", className)}>
      <svg aria-hidden="true" viewBox="0 0 164 30" className="h-6 w-36">
        <path
          className={cn("garis-sulur", warnaBatang)}
          pathLength={1}
          d="M3 18 C 22 5, 40 5, 52 16 S 80 27, 96 15 S 126 4, 139 13 C 145 18, 151 16, 149 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {DAUN.map((daun, indeks) => (
          <ellipse
            key={daun.cx}
            className="daun-sulur text-highlight"
            style={{ "--i": indeks } as CSSProperties}
            cx={daun.cx}
            cy={daun.cy}
            rx="7"
            ry="3.4"
            fill="currentColor"
            transform={`rotate(${daun.sudut} ${daun.cx} ${daun.cy})`}
          />
        ))}
        <polygon
          className="daun-sulur text-highlight"
          style={{ "--i": 3 } as CSSProperties}
          points={TITIK_BINTANG}
          transform="translate(146 -4) scale(0.62)"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </Muncul>
  );
}
