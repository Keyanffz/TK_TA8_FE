import Link from "next/link";

import { MenuPublikHp } from "@/components/layout/publik/menu-publik-hp";
import { TAUTAN_PUBLIK } from "@/components/layout/publik/tautan-publik";
import { LogoSekolah } from "@/components/shared/logo-sekolah";
import { buttonVariants } from "@/components/ui/button";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";

type NavbarPublikProps = { namaSekolah: string; logoUrl: string | null };

export function NavbarPublik({ namaSekolah, logoUrl }: NavbarPublikProps) {
  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="rounded-full bg-card p-0.5 transition-[rotate] duration-200 group-hover:-rotate-12">
            <LogoSekolah logoUrl={logoUrl} namaSekolah={namaSekolah} ukuran={40} prioritas className="size-9 sm:size-10" />
          </span>
          <span className="truncate font-heading text-base font-bold sm:text-lg">{namaSekolah}</span>
        </Link>

        <nav aria-label="Menu utama" className="ml-auto hidden items-center gap-1 md:flex">
          {TAUTAN_PUBLIK.map((tautan) => (
            <Link
              key={tautan.href}
              href={tautan.href}
              className="rounded-md px-3 py-2 text-sm font-bold transition-colors duration-150 hover:bg-primary-foreground/15"
            >
              {tautan.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <Link href={RUTE_LOGIN.pilihan} className={buttonVariants({ size: "sm", variant: "highlight" })}>
            Masuk
          </Link>
          <MenuPublikHp namaSekolah={namaSekolah} />
        </div>
      </div>
    </header>
  );
}
