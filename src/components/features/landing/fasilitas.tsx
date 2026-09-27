import Image from "next/image";

import { JudulBagian } from "@/components/shared/judul-bagian";
import { Muncul } from "@/components/shared/muncul";
import type { ItemFasilitas } from "@/lib/api/pengaturan";

export function BagianFasilitas({ fasilitas }: { fasilitas: ItemFasilitas[] }) {
  return (
    <section aria-labelledby="judul-fasilitas" className="bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian id="judul-fasilitas" judul="Fasilitas" />
        <Muncul efek="jatuh" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {fasilitas.map((item) => (
            <figure key={item.nama} className="angkat rounded-lg border border-border bg-card p-3 shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-primary-soft">
                {item.gambar_url ? (
                  <Image
                    src={item.gambar_url}
                    alt={item.nama}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <p className="flex h-full items-center justify-center px-4 text-sm text-primary-strong">
                    Foto fasilitas belum diunggah
                  </p>
                )}
              </div>
              <figcaption className="px-1 pt-3 pb-1">
                <p className="font-bold">{item.nama}</p>
                {item.deskripsi ? <p className="mt-1 text-sm text-muted-foreground">{item.deskripsi}</p> : null}
              </figcaption>
            </figure>
          ))}
        </Muncul>
      </div>
    </section>
  );
}
