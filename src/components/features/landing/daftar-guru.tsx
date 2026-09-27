import Image from "next/image";

import { AvatarInisial } from "@/components/shared/avatar-inisial";
import { JudulBagian } from "@/components/shared/judul-bagian";
import { Muncul } from "@/components/shared/muncul";
import { GAYA_MASKER_PERISAI } from "@/components/shared/ornamen/perisai";
import type { GuruPublik } from "@/types/domain";

/**
 * Guru yang punya foto tampil sebagai potret berbingkai perisai; yang belum
 * punya foto hanya tampil kecil (inisial + nama) di bawahnya. Pemanggil
 * menyembunyikan section ini kalau belum ada satu pun guru berfoto.
 */
export function BagianGuru({ guru }: { guru: GuruPublik[] }) {
  const berfoto = guru.filter((orang) => orang.foto_url);
  const tanpaFoto = guru.filter((orang) => !orang.foto_url);

  return (
    <section aria-labelledby="judul-guru">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian id="judul-guru" judul="Guru" />
        <Muncul as="ul" efek="pop" className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {berfoto.map((orang) =>
            orang.foto_url ? (
              <li key={orang.id} className="group text-center">
                <div
                  className="relative mx-auto aspect-square w-full max-w-44 bg-primary-soft transition-[rotate] duration-500 group-hover:rotate-[22.5deg]"
                  style={GAYA_MASKER_PERISAI}
                >
                  <Image
                    src={orang.foto_url}
                    alt={orang.nama}
                    fill
                    sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw"
                    className="object-cover transition-[rotate] duration-500 group-hover:-rotate-[22.5deg]"
                  />
                </div>
                <p className="mt-3 font-bold">{orang.nama}</p>
                <p className="text-sm text-muted-foreground">{orang.jabatan}</p>
              </li>
            ) : null,
          )}
        </Muncul>
        {tanpaFoto.length > 0 ? (
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6">
            {tanpaFoto.map((orang) => (
              <li key={orang.id} className="flex items-center gap-2">
                <AvatarInisial nama={orang.nama} className="size-9 rounded-full text-sm" />
                <span className="text-sm">
                  <span className="font-bold">{orang.nama}</span>
                  <span className="text-muted-foreground"> · {orang.jabatan}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
