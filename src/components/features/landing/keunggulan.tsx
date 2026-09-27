import { JudulBagian } from "@/components/shared/judul-bagian";
import { Muncul } from "@/components/shared/muncul";
import { Bintang } from "@/components/shared/ornamen/bintang";
import type { ItemBerikon } from "@/lib/api/pengaturan";

export function BagianKeunggulan({ keunggulan }: { keunggulan: ItemBerikon[] }) {
  return (
    <section aria-labelledby="judul-keunggulan">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian id="judul-keunggulan" judul="Keunggulan" />
        <Muncul as="ol" efek="geser" className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {keunggulan.map((item, indeks) => (
            <li key={item.judul} className="group flex gap-5">
              <span className="relative flex size-12 shrink-0 items-center justify-center">
                <Bintang className="putar-saat-hover absolute inset-0 size-12 text-highlight" />
                <span aria-hidden="true" className="relative font-heading text-base font-extrabold text-highlight-foreground">
                  {indeks + 1}
                </span>
              </span>
              <div>
                <h3 className="text-lg font-bold">{item.judul}</h3>
                {item.deskripsi ? <p className="mt-1 text-muted-foreground">{item.deskripsi}</p> : null}
              </div>
            </li>
          ))}
        </Muncul>
      </div>
    </section>
  );
}
