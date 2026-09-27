import type { Metadata } from "next";

import { FooterPublik } from "@/components/layout/publik/footer-publik";
import { NavbarPublik } from "@/components/layout/publik/navbar-publik";
import { ambilProfilSekolah } from "@/lib/api/publik";

export async function generateMetadata(): Promise<Metadata> {
  const profil = await ambilProfilSekolah();
  return {
    title: { default: profil.namaSekolah, template: `%s | ${profil.namaSekolah}` },
    description: profil.hero.subjudul ?? undefined,
  };
}

export default async function PublikLayout({ children }: LayoutProps<"/">) {
  const profil = await ambilProfilSekolah();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
      >
        Lewati ke konten
      </a>
      <NavbarPublik namaSekolah={profil.namaSekolah} logoUrl={profil.logoUrl} />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <FooterPublik profil={profil} />
    </div>
  );
}
