import type { Metadata } from "next";
import Link from "next/link";

import { LogoSekolah } from "@/components/shared/logo-sekolah";
import { TaburanBintang, type PosisiBintang } from "@/components/shared/ornamen/bintang";
import { OrbitLogo } from "@/components/shared/ornamen/orbit-logo";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { TepiBergelombang } from "@/components/shared/ornamen/tepi-bergelombang";
import { ambilProfilSekolah } from "@/lib/api/publik";
import { NAUNGAN_SEKOLAH } from "@/lib/constants/sekolah";

const BINTANG_PANEL: readonly PosisiBintang[] = [
  { x: 10, y: 22, ukuran: 12, gerak: "kelip", tunda: 0 },
  { x: 84, y: 14, ukuran: 16, gerak: "melayang", tunda: 0.6 },
  { x: 76, y: 76, ukuran: 10, gerak: "kelip", tunda: 1.4 },
  { x: 88, y: 58, ukuran: 18, gerak: "melayang", tunda: 2, durasi: 9 },
  { x: 50, y: 90, ukuran: 9, gerak: "kelip", tunda: 2.5 },
];

const BINTANG_HP: readonly PosisiBintang[] = [
  { x: 92, y: 14, ukuran: 12, gerak: "kelip", tunda: 0 },
  { x: 84, y: 62, ukuran: 9, gerak: "kelip", tunda: 1.2 },
  { x: 95, y: 44, ukuran: 10, gerak: "melayang", tunda: 0.5 },
];

export async function generateMetadata(): Promise<Metadata> {
  const profil = await ambilProfilSekolah();
  return { title: { default: profil.namaSekolah, template: `%s | ${profil.namaSekolah}` } };
}

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const profil = await ambilProfilSekolah();

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <PolaGeometri className="-z-10 text-primary-foreground/[0.08]" />
        <TaburanBintang bintang={BINTANG_PANEL} className="-z-10" />
        <Link href="/" className="flex items-center gap-3 font-heading text-lg font-bold hover:underline">
          {profil.namaSekolah}
        </Link>
        <div>
          <OrbitLogo className="gerak-masuk mx-auto w-full max-w-72">
            <LogoSekolah logoUrl={profil.logoUrl} namaSekolah={profil.namaSekolah} ukuran={240} prioritas className="size-full p-[8%]" />
          </OrbitLogo>
          <p className="mt-10 max-w-sm font-heading text-xl leading-snug font-bold">
            Tagihan, kegiatan kelas, pengumuman, dan rapor anak dalam satu tempat.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/90">{NAUNGAN_SEKOLAH}</p>
      </aside>

      <div className="flex flex-col">
        <header className="relative isolate overflow-hidden bg-primary text-primary-foreground lg:hidden">
          <PolaGeometri className="-z-10 text-primary-foreground/[0.08]" />
          <TaburanBintang bintang={BINTANG_HP} className="-z-10" />
          <Link href="/" className="flex items-center gap-3 px-4 pt-5 pb-3 sm:px-6">
            <span className="rounded-full bg-card p-0.5">
              <LogoSekolah logoUrl={profil.logoUrl} namaSekolah={profil.namaSekolah} ukuran={44} className="size-11" />
            </span>
            <span className="font-heading text-lg font-bold">{profil.namaSekolah}</span>
          </Link>
          <TepiBergelombang className="text-background" />
        </header>
        <main className="flex flex-1 flex-col px-4 py-6 sm:px-6">
          <div className="mx-auto my-auto w-full max-w-lg py-6 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
