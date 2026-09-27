import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { LogoSekolah } from "@/components/shared/logo-sekolah";
import { buttonVariants } from "@/components/ui/button";
import type { ProfilSekolah } from "@/lib/api/pengaturan";

export function Hero({ profil }: { profil: ProfilSekolah }) {
  const { hero } = profil;

  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">{hero.judul ?? profil.namaSekolah}</h1>
          <svg
            aria-hidden="true"
            viewBox="0 0 200 14"
            className="mt-3 h-3.5 w-44 text-highlight"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          >
            <path d="M3 8 Q 15 2 27 8 T 51 8 T 75 8 T 99 8 T 123 8 T 147 8 T 171 8 T 197 7" />
          </svg>
          {hero.subjudul ? <p className="mt-5 max-w-prose text-lg text-muted-foreground">{hero.subjudul}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ppdb" className={buttonVariants({ size: "lg" })}>
              {hero.ctaTeks ?? "Lihat Info PPDB"}
            </Link>
            <Link href="/#kontak" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Hubungi Sekolah
            </Link>
          </div>
          {profil.alamat ? (
            <p className="mt-8 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              {profil.alamat}
            </p>
          ) : null}
        </div>

        {hero.gambarUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-primary-soft">
            <Image
              src={hero.gambarUrl}
              alt={`Suasana ${profil.namaSekolah}`}
              fill
              preload
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-primary-soft">
            <LogoSekolah
              logoUrl={profil.logoUrl}
              namaSekolah={profil.namaSekolah}
              ukuran={240}
              prioritas
              className="size-48 md:size-60"
            />
          </div>
        )}
      </div>
    </section>
  );
}
