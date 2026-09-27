import Link from "next/link";

import { TAUTAN_PUBLIK } from "@/components/layout/publik/tautan-publik";
import { LogoSekolah } from "@/components/shared/logo-sekolah";
import type { ProfilSekolah } from "@/lib/api/pengaturan";
import { NAUNGAN_SEKOLAH } from "@/lib/constants/sekolah";

export function FooterPublik({ profil }: { profil: ProfilSekolah }) {
  const tahun = new Date().getFullYear();

  return (
    <footer className="bg-primary-strong text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr]">
        <div className="flex gap-4">
          <LogoSekolah logoUrl={profil.logoUrl} namaSekolah={profil.namaSekolah} ukuran={56} className="size-14 self-start rounded-full bg-card" />
          <div>
            <p className="font-heading text-lg font-semibold">{profil.namaSekolah}</p>
            <p className="text-sm text-primary-foreground/85">{NAUNGAN_SEKOLAH}</p>
            {profil.alamat ? <p className="mt-3 max-w-sm text-sm text-primary-foreground/85">{profil.alamat}</p> : null}
            {profil.npsn ? <p className="mt-1 text-sm text-primary-foreground/85">NPSN {profil.npsn}</p> : null}
          </div>
        </div>
        <nav aria-label="Tautan footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {TAUTAN_PUBLIK.map((tautan) => (
              <li key={tautan.href}>
                <Link href={tautan.href} className="hover:underline">
                  {tautan.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login" className="hover:underline">
                Masuk
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-primary-foreground/20">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-primary-foreground/85 sm:px-6">
          © {tahun} {profil.namaSekolah}
        </p>
      </div>
    </footer>
  );
}
