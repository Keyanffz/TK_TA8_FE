"use client";

import { IKON_CMS, LABEL_IKON_CMS } from "@/lib/constants/ikon-cms";
import { cn } from "@/lib/utils";

/** Pilihan ikon program/keunggulan dari daftar IKON_CMS (nama lain tidak ditampilkan di landing). */
export function PilihIkon({ nilai, onUbah, label, error }: { nilai: string; onUbah: (ikon: string) => void; label: string; error?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {Object.entries(IKON_CMS).map(([nama, Ikon]) => {
          const dipilih = nama === nilai;
          return (
            <button
              key={nama}
              type="button"
              role="radio"
              aria-checked={dipilih}
              aria-label={LABEL_IKON_CMS[nama] ?? nama}
              title={LABEL_IKON_CMS[nama] ?? nama}
              onClick={() => onUbah(nama)}
              className={cn(
                "flex size-10 items-center justify-center rounded-md border transition-colors duration-150",
                dipilih ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary-strong hover:border-primary",
              )}
            >
              <Ikon aria-hidden="true" className="size-5" />
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}
