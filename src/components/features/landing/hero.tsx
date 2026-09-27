import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LogoSekolah } from "@/components/shared/logo-sekolah";
import { TaburanBintang, type PosisiBintang } from "@/components/shared/ornamen/bintang";
import { OrbitLogo } from "@/components/shared/ornamen/orbit-logo";
import { GAYA_MASKER_PERISAI } from "@/components/shared/ornamen/perisai";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { TepiBergelombang } from "@/components/shared/ornamen/tepi-bergelombang";
import { buttonVariants } from "@/components/ui/button";
import type { ProfilSekolah } from "@/lib/api/pengaturan";
import { NAUNGAN_SEKOLAH } from "@/lib/constants/sekolah";

const BINTANG_HERO: readonly PosisiBintang[] = [
  { x: 4, y: 14, ukuran: 14, gerak: "kelip", tunda: 0 },
  { x: 38, y: 8, ukuran: 10, gerak: "kelip", tunda: 1.2 },
  { x: 46, y: 78, ukuran: 18, gerak: "melayang", tunda: 0.4 },
  { x: 8, y: 84, ukuran: 10, gerak: "kelip", tunda: 2.1 },
  { x: 92, y: 10, ukuran: 12, gerak: "kelip", tunda: 0.7 },
  { x: 96, y: 70, ukuran: 16, gerak: "melayang", tunda: 1.6, durasi: 9 },
  { x: 26, y: 92, ukuran: 8, gerak: "kelip", tunda: 2.6 },
];

function urutan(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}

type HeroProps = {
  profil: ProfilSekolah;
  /** Warna blok sesudah hero, untuk tepi bergelombang di bawahnya. */
  warnaTepi: "text-background" | "text-highlight";
};

export function Hero({ profil, warnaTepi }: HeroProps) {
  const { hero } = profil;

  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <PolaGeometri className="-z-10 text-primary-foreground/[0.07]" />
      <TaburanBintang bintang={BINTANG_HERO} className="-z-10" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-6 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-16 md:pb-10">
        <div>
          <p
            className="gerak-masuk inline-flex rounded-full bg-highlight px-3 py-1 text-sm font-bold text-highlight-foreground"
            style={urutan(0)}
          >
            {NAUNGAN_SEKOLAH}
          </p>
          <h1 className="gerak-masuk-naik mt-4 text-2xl leading-[1.1] font-extrabold" style={urutan(1)}>
            {hero.judul ?? profil.namaSekolah}
          </h1>
          {hero.subjudul ? (
            <p className="gerak-masuk-naik mt-4 max-w-prose text-lg text-primary-foreground/95" style={urutan(2)}>
              {hero.subjudul}
            </p>
          ) : null}
          <div className="gerak-masuk-naik mt-8 flex flex-wrap gap-3" style={urutan(3)}>
            <Link href="/ppdb" className={buttonVariants({ size: "lg", variant: "highlight" })}>
              {hero.ctaTeks ?? "Lihat Info PPDB"}
            </Link>
            <Link href="/#kontak" className={buttonVariants({ size: "lg", variant: "terang" })}>
              Hubungi Sekolah
            </Link>
          </div>
          {profil.alamat ? (
            <p className="gerak-masuk-naik mt-8 flex items-start gap-2 text-sm text-primary-foreground/90" style={urutan(4)}>
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-bintang" />
              {profil.alamat}
            </p>
          ) : null}
        </div>

        <div className="gerak-masuk mx-auto w-full max-w-64 sm:max-w-80 md:max-w-md" style={urutan(2)}>
          <OrbitLogo>
            {hero.gambarUrl ? (
              <div className="relative size-full" style={GAYA_MASKER_PERISAI}>
                <Image
                  src={hero.gambarUrl}
                  alt={`Suasana ${profil.namaSekolah}`}
                  fill
                  preload
                  sizes="(min-width: 768px) 32vw, 70vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <LogoSekolah
                logoUrl={profil.logoUrl}
                namaSekolah={profil.namaSekolah}
                ukuran={320}
                prioritas
                className="size-full p-[8%]"
              />
            )}
          </OrbitLogo>
        </div>
      </div>
      <TepiBergelombang className={warnaTepi} />
    </section>
  );
}
