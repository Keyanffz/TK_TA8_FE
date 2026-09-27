import type { CSSProperties } from "react";

import { TITIK_BINTANG } from "@/components/shared/ornamen/bintang";

/** Orang tua menggandeng anak; si anak melompat kecil saat kartu disentuh. */
export function IlustrasiWali({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 100" className={className}>
      <ellipse cx="60" cy="93" rx="46" ry="5" className="fill-highlight-foreground/15" />
      <g className="fill-primary-strong">
        <circle cx="44" cy="27" r="11" />
        <path d="M30 90 V56 C30 46 36 41 44 41 C52 41 58 46 58 56 V90 Z" />
      </g>
      <path d="M57 60 C 64 68, 70 70, 76 67" fill="none" strokeWidth="4.5" strokeLinecap="round" className="stroke-primary-strong" />
      <g className="lompat-saat-hover fill-primary">
        <circle cx="82" cy="50" r="8" />
        <path d="M72 90 V70 C72 63 76 60 82 60 C88 60 92 63 92 70 V90 Z" />
      </g>
      <polygon
        points={TITIK_BINTANG}
        transform="translate(88 14) scale(0.9)"
        className="naik-saat-hover fill-primary stroke-primary"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Buku terbuka seperti di logo sekolah, dengan bintang yang naik saat kartu disentuh. */
export function IlustrasiGuru({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 100" className={className}>
      <ellipse cx="60" cy="93" rx="46" ry="5" className="fill-primary-foreground/20" />
      <path d="M60 50 C 46 42, 28 42, 16 46 V86 C 28 82, 46 82, 60 90 Z" className="fill-card" />
      <path d="M60 50 C 74 42, 92 42, 104 46 V86 C 92 82, 74 82, 60 90 Z" className="fill-primary-soft" />
      <path
        d="M24 56 C 34 53, 44 54, 52 57 M24 65 C 34 62, 44 63, 52 66 M24 74 C 34 71, 44 72, 52 75"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-primary/40"
      />
      <polygon
        points={TITIK_BINTANG}
        transform="translate(47 8) scale(1.1)"
        className="naik-saat-hover fill-bintang stroke-bintang"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <polygon points={TITIK_BINTANG} transform="translate(20 24) scale(0.45)" className="gerak-kelip fill-bintang" />
      <polygon points={TITIK_BINTANG} transform="translate(90 26) scale(0.55)" className="gerak-kelip fill-bintang" style={{ "--tunda": "1.1s" } as CSSProperties} />
    </svg>
  );
}
