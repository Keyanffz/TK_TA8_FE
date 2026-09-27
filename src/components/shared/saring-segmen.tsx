"use client";

import { cn } from "@/lib/utils";

type SaringSegmenProps<T extends string | boolean> = {
  label: string;
  opsi: readonly { nilai: T; label: string; jumlah?: number }[];
  nilai: T;
  onUbah: (nilai: T) => void;
};

/** Pilihan saringan berbentuk pil (status guru, notifikasi belum dibaca, antrean pembayaran). */
export function SaringSegmen<T extends string | boolean>({ label, opsi, nilai, onUbah }: SaringSegmenProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl bg-muted p-1">
      {opsi.map((pilihan) => {
        const aktif = pilihan.nilai === nilai;
        return (
          <button
            key={String(pilihan.nilai)}
            type="button"
            aria-pressed={aktif}
            onClick={() => onUbah(pilihan.nilai)}
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 font-heading text-sm font-bold transition-colors duration-150",
              aktif ? "bg-primary text-primary-foreground" : "hover:bg-card",
            )}
          >
            {pilihan.label}
            {pilihan.jumlah ? (
              <span className="rounded-full bg-highlight px-1.5 text-xs text-highlight-foreground tabular-nums">
                {pilihan.jumlah}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
