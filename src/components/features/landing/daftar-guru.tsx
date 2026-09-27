import Image from "next/image";

import { AvatarInisial } from "@/components/shared/avatar-inisial";
import { JudulBagian } from "@/components/shared/judul-bagian";
import type { GuruPublik } from "@/types/domain";

export function BagianGuru({ guru }: { guru: GuruPublik[] }) {
  return (
    <section aria-labelledby="judul-guru">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian id="judul-guru" judul="Guru" />
        <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-6">
          {guru.map((orang) => (
            <li key={orang.id} className="w-32 shrink-0 snap-start md:w-auto">
              {orang.foto_url ? (
                <Image
                  src={orang.foto_url}
                  alt={orang.nama}
                  width={200}
                  height={250}
                  className="aspect-[4/5] w-full rounded-lg object-cover"
                />
              ) : (
                <AvatarInisial nama={orang.nama} className="aspect-[4/5] w-full rounded-lg text-xl" />
              )}
              <p className="mt-3 text-sm font-semibold">{orang.nama}</p>
              <p className="text-sm text-muted-foreground">{orang.jabatan}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
