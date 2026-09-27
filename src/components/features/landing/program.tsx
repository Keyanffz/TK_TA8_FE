import type { CSSProperties } from "react";

import { JudulBagian } from "@/components/shared/judul-bagian";
import { Muncul } from "@/components/shared/muncul";
import { BentukPerisai } from "@/components/shared/ornamen/perisai";
import type { ItemBerikon } from "@/lib/api/pengaturan";
import { IKON_CMS } from "@/lib/constants/ikon-cms";
import { cn } from "@/lib/utils";

// Kartu program bergantian hijau dan kuning, sedikit miring seperti kartu
// yang ditempel di papan kelas; lurus dan terangkat saat disentuh.
const GAYA_KARTU = [
  { kelas: "bg-primary text-primary-foreground", perisai: "text-highlight", ikon: "text-highlight-foreground", miring: "-1.2deg" },
  { kelas: "bg-highlight text-highlight-foreground", perisai: "text-primary", ikon: "text-primary-foreground", miring: "1.2deg" },
] as const;

export function BagianProgram({ program }: { program: ItemBerikon[] }) {
  return (
    <section aria-labelledby="judul-program" id="program" className="scroll-mt-16 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian id="judul-program" judul="Program" />
        <Muncul efek="pop" className="grid gap-6 md:grid-cols-2">
          {program.map((item, indeks) => {
            const Ikon = item.ikon ? IKON_CMS[item.ikon] : undefined;
            const gaya = GAYA_KARTU[indeks % GAYA_KARTU.length] ?? GAYA_KARTU[0];
            return (
              <article
                key={item.judul}
                className={cn("angkat group flex gap-5 rounded-xl p-6 rotate-(--miring) hover:rotate-0 md:p-8", gaya.kelas)}
                style={{ "--miring": gaya.miring, "--miring-hover": "0deg" } as CSSProperties}
              >
                {Ikon ? (
                  <span className="relative flex size-16 shrink-0 items-center justify-center">
                    <BentukPerisai className={cn("absolute inset-0 transition-[rotate] duration-500 group-hover:rotate-45", gaya.perisai)} />
                    <Ikon aria-hidden="true" className={cn("relative size-7", gaya.ikon)} strokeWidth={2} />
                  </span>
                ) : null}
                <div>
                  <h3 className="text-lg font-extrabold">{item.judul}</h3>
                  {item.deskripsi ? <p className="mt-2 opacity-95">{item.deskripsi}</p> : null}
                </div>
              </article>
            );
          })}
        </Muncul>
      </div>
    </section>
  );
}
