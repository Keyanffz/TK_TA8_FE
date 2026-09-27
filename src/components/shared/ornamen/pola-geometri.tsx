import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * Pola bintang delapan (khatam) khas ornamen geometri Islami, dipakai tipis
 * di atas blok hijau. Warna mengikuti currentColor.
 */
export function PolaGeometri({ className }: { className?: string }) {
  const id = useId();

  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 size-full", className)}>
      <defs>
        <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="20" y="20" width="24" height="24" />
            <rect x="20" y="20" width="24" height="24" transform="rotate(45 32 32)" />
            <circle cx="32" cy="32" r="5" />
            <path d="M0 0 L8.5 8.5 M64 0 L55.5 8.5 M0 64 L8.5 55.5 M64 64 L55.5 55.5" />
            <path d="M32 0 V7 M32 57 V64 M0 32 H7 M57 32 H64" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
