import type { ReactNode } from "react";

import { Sulur } from "@/components/shared/ornamen/sulur";

type KepalaHalamanProps = { judul: string; deskripsi?: ReactNode; aksi?: ReactNode };

/** Judul halaman dashboard (B2: PageHeader). */
export function KepalaHalaman({ judul, deskripsi, aksi }: KepalaHalamanProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl leading-tight font-extrabold">{judul}</h1>
        <Sulur />
        {deskripsi ? <div className="mt-2 max-w-prose text-muted-foreground">{deskripsi}</div> : null}
      </div>
      {aksi}
    </div>
  );
}
