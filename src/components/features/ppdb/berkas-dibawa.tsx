import { FileCheck2 } from "lucide-react";

import { cn } from "@/lib/utils";

const BERKAS_PPDB = ["Akta kelahiran anak", "Kartu Keluarga", "Pas foto anak"] as const;

/** Berkas PPDB tidak diunggah; pendaftar membawanya ke sekolah (A2.3). Dibuat mencolok karena mudah terlewat. */
export function BerkasDibawa({ className }: { className?: string }) {
  return (
    <section className={cn("rounded-lg border-2 border-primary bg-primary-soft p-4", className)}>
      <h3 className="flex items-center gap-2 font-heading font-extrabold text-primary-strong">
        <FileCheck2 aria-hidden="true" className="size-5 shrink-0" />
        Berkas yang dibawa ke sekolah
      </h3>
      <ol className="mt-3 flex flex-col gap-2">
        {BERKAS_PPDB.map((berkas, indeks) => (
          <li key={berkas} className="flex items-center gap-3 rounded-md bg-card px-3 py-2 font-bold">
            <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs text-primary-foreground">
              {indeks + 1}
            </span>
            {berkas}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm">Berkas tidak diunggah lewat formulir. Sekolah memeriksanya saat berkas dibawa.</p>
    </section>
  );
}
