import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type PenandaLangkahProps = {
  judul: readonly string[];
  aktif: number;
  label?: string;
  /** Kalau diisi, setiap langkah menjadi tombol untuk pindah langsung (ubah data murid). */
  onPilih?: (indeks: number) => void;
};

/**
 * Nomor langkah form bertahap (PPDB, data murid, import). Di HP hanya teks + batang supaya tidak berdesakan;
 * kalau langkah bisa dipilih, nomornya tetap tampil sebagai tombol.
 */
export function PenandaLangkah({ judul, aktif, label = "Langkah pendaftaran", onPilih }: PenandaLangkahProps) {
  return (
    <nav aria-label={label} className="mb-6">
      <p className="font-heading text-sm font-bold sm:hidden">
        Langkah {aktif + 1} dari {judul.length}: {judul[aktif]}
      </p>
      <div className={cn("mt-2 h-2 overflow-hidden rounded-full bg-primary-soft sm:hidden", onPilih && "hidden")}>
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${((aktif + 1) / judul.length) * 100}%` }}
        />
      </div>
      <ol className={cn("items-center gap-2", onPilih ? "mt-2 flex sm:mt-0" : "hidden sm:flex")}>
        {judul.map((nama, indeks) => {
          const selesai = indeks < aktif;
          const sekarang = indeks === aktif;
          const isi = (
            <>
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold transition-colors duration-200",
                  selesai && "bg-primary text-primary-foreground",
                  sekarang && "bg-highlight text-highlight-foreground ring-2 ring-primary",
                  !selesai && !sekarang && "bg-muted text-muted-foreground",
                )}
              >
                {selesai && !onPilih ? <Check aria-label="Selesai" className="size-4" /> : indeks + 1}
              </span>
              <span className={cn("text-sm", onPilih && "max-sm:sr-only", sekarang ? "font-bold" : "text-muted-foreground")}>{nama}</span>
            </>
          );
          return (
            <li key={nama} aria-current={sekarang ? "step" : undefined} className="flex flex-1 items-center gap-2">
              {onPilih ? (
                <button type="button" onClick={() => onPilih(indeks)} className="flex min-h-11 items-center gap-2 rounded-md hover:underline">
                  {isi}
                </button>
              ) : (
                isi
              )}
              {indeks < judul.length - 1 ? <span aria-hidden="true" className="h-0.5 flex-1 rounded-full bg-border" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
