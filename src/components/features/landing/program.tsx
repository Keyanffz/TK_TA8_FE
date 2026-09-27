import { JudulBagian } from "@/components/shared/judul-bagian";
import type { ItemBerikon } from "@/lib/api/pengaturan";
import { IKON_CMS } from "@/lib/constants/ikon-cms";

export function BagianProgram({ program }: { program: ItemBerikon[] }) {
  return (
    <section aria-labelledby="judul-program" id="program" className="scroll-mt-16 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian id="judul-program" judul="Program" />
        <div className="grid gap-x-12 md:grid-cols-2">
          {program.map((item) => {
            const Ikon = item.ikon ? IKON_CMS[item.ikon] : undefined;
            return (
              <article key={item.judul} className="border-t border-border py-6">
                <h3 className="flex items-center gap-3 text-lg font-semibold">
                  {Ikon ? <Ikon aria-hidden="true" className="size-6 text-primary" strokeWidth={1.75} /> : null}
                  {item.judul}
                </h3>
                {item.deskripsi ? <p className="mt-2 text-muted-foreground">{item.deskripsi}</p> : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
