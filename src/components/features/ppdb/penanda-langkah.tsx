import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/** Nomor langkah form pendaftaran. Di HP hanya teks + batang supaya tidak berdesakan. */
export function PenandaLangkah({ judul, aktif }: { judul: readonly string[]; aktif: number }) {
  return (
    <nav aria-label="Langkah pendaftaran" className="mb-6">
      <p className="font-heading text-sm font-bold sm:hidden">
        Langkah {aktif + 1} dari {judul.length}: {judul[aktif]}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-soft sm:hidden">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${((aktif + 1) / judul.length) * 100}%` }}
        />
      </div>
      <ol className="hidden items-center gap-2 sm:flex">
        {judul.map((nama, indeks) => {
          const selesai = indeks < aktif;
          const sekarang = indeks === aktif;
          return (
            <li key={nama} aria-current={sekarang ? "step" : undefined} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold transition-colors duration-200",
                  selesai && "bg-primary text-primary-foreground",
                  sekarang && "bg-highlight text-highlight-foreground ring-2 ring-primary",
                  !selesai && !sekarang && "bg-muted text-muted-foreground",
                )}
              >
                {selesai ? <Check aria-label="Selesai" className="size-4" /> : indeks + 1}
              </span>
              <span className={cn("text-sm", sekarang ? "font-bold" : "text-muted-foreground")}>{nama}</span>
              {indeks < judul.length - 1 ? <span aria-hidden="true" className="h-0.5 flex-1 rounded-full bg-border" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
