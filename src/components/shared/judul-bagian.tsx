import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type JudulBagianProps = {
  id?: string;
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  className?: string;
};

/** Judul section landing dengan garis kuning bergelombang (Arah A). */
export function JudulBagian({ id, judul, deskripsi, aksi, className }: JudulBagianProps) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h2 id={id} className="text-xl font-semibold md:text-2xl">
          {judul}
        </h2>
        <svg
          aria-hidden="true"
          viewBox="0 0 120 12"
          className="mt-2 h-3 w-28 text-highlight"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        >
          <path d="M2 7 Q 12 1 22 7 T 42 7 T 62 7 T 82 7 T 102 7 T 118 6" />
        </svg>
        {deskripsi ? <p className="mt-3 max-w-prose text-muted-foreground">{deskripsi}</p> : null}
      </div>
      {aksi}
    </div>
  );
}
