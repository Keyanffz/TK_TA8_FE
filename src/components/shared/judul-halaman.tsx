import type { ReactNode } from "react";

import { TaburanBintang, type PosisiBintang } from "@/components/shared/ornamen/bintang";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { TepiBergelombang } from "@/components/shared/ornamen/tepi-bergelombang";

type JudulHalamanProps = { judul: string; deskripsi?: ReactNode };

const BINTANG_JUDUL: readonly PosisiBintang[] = [
  { x: 82, y: 22, ukuran: 14, gerak: "kelip", tunda: 0 },
  { x: 92, y: 60, ukuran: 10, gerak: "kelip", tunda: 1.3 },
  { x: 70, y: 70, ukuran: 12, gerak: "melayang", tunda: 0.6 },
];

/** Kepala halaman publik selain landing: pita hijau dengan tepi bergelombang. */
export function JudulHalaman({ judul, deskripsi }: JudulHalamanProps) {
  return (
    <div className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <PolaGeometri className="-z-10 text-primary-foreground/[0.07]" />
      <TaburanBintang bintang={BINTANG_JUDUL} className="-z-10" />
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-6 sm:px-6 md:pt-14">
        <h1 className="gerak-masuk-naik text-xl font-extrabold md:text-2xl">{judul}</h1>
        {deskripsi ? <div className="mt-3 max-w-prose text-primary-foreground/95">{deskripsi}</div> : null}
      </div>
      <TepiBergelombang className="text-background" />
    </div>
  );
}
