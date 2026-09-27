import { JudulBagian } from "@/components/shared/judul-bagian";
import type { ItemBerikon } from "@/lib/api/pengaturan";

export function BagianKeunggulan({ keunggulan }: { keunggulan: ItemBerikon[] }) {
  return (
    <section aria-labelledby="judul-keunggulan">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian id="judul-keunggulan" judul="Keunggulan" />
        <ol className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {keunggulan.map((item, indeks) => (
            <li key={item.judul} className="flex gap-5">
              <span aria-hidden="true" className="w-10 shrink-0 font-heading text-xl font-semibold text-primary">
                {String(indeks + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{item.judul}</h3>
                {item.deskripsi ? <p className="mt-1 text-muted-foreground">{item.deskripsi}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
