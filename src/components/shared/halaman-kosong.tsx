import type { CSSProperties, ReactNode } from "react";

import { Bintang } from "@/components/shared/ornamen/bintang";
import { BentukPerisai } from "@/components/shared/ornamen/perisai";

type HalamanKosongProps = { kode?: string; judul: string; deskripsi: string; aksi: ReactNode };

/** Tampilan 404 dan error di dalam dashboard: perisai logo dengan bintang, pesan, dan jalan keluar. */
export function HalamanKosong({ kode, judul, deskripsi, aksi }: HalamanKosongProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center">
      <div aria-hidden="true" className="relative size-28 shrink-0">
        <BentukPerisai className="gerak-putar absolute inset-0 text-primary-soft-strong" style={{ "--durasi": "60s" } as CSSProperties} />
        <Bintang className="gerak-melayang absolute inset-[26%] text-highlight" />
      </div>
      <div>
        {kode ? <p className="font-heading text-sm font-bold text-primary-strong">{kode}</p> : null}
        <h1 className="text-xl leading-tight font-extrabold">{judul}</h1>
        <p className="mt-2 text-muted-foreground">{deskripsi}</p>
        <div className="mt-5 flex flex-wrap gap-2">{aksi}</div>
      </div>
    </div>
  );
}
