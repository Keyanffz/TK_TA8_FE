import type { ReactNode } from "react";

import { IlustrasiWali } from "@/components/features/auth/ilustrasi-login";
import { LogoSekolah } from "@/components/shared/logo-sekolah";
import { TaburanBintang, type PosisiBintang } from "@/components/shared/ornamen/bintang";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { TepiBergelombang } from "@/components/shared/ornamen/tepi-bergelombang";

const BINTANG: readonly PosisiBintang[] = [
  { x: 80, y: 20, ukuran: 12, gerak: "kelip", tunda: 0 },
  { x: 92, y: 60, ukuran: 16, gerak: "melayang", tunda: 0.7 },
  { x: 64, y: 72, ukuran: 9, gerak: "kelip", tunda: 1.4 },
];

type KerangkaTanpaMenuProps = {
  namaSekolah: string;
  logoUrl: string | null;
  judul: string;
  keterangan: string;
  /** Misalnya "Langkah 1 dari 2". */
  langkah?: string;
  children: ReactNode;
};

/**
 * Halaman wali yang wajib diselesaikan sebelum dashboard bisa dipakai (ganti
 * password awal, onboarding). Tampil tanpa sidebar dan bottom nav.
 */
export function KerangkaTanpaMenu({ namaSekolah, logoUrl, judul, keterangan, langkah, children }: KerangkaTanpaMenuProps) {
  return (
    <div className="min-h-dvh">
      <header className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <PolaGeometri className="-z-10 text-primary-foreground/[0.07]" />
        <TaburanBintang bintang={BINTANG} className="-z-10" />
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 pt-6 pb-2">
          <span className="rounded-full bg-card p-0.5">
            <LogoSekolah logoUrl={logoUrl} namaSekolah={namaSekolah} ukuran={40} className="size-10" />
          </span>
          <span className="font-heading font-extrabold">{namaSekolah}</span>
        </div>
        <div className="mx-auto flex max-w-xl items-end justify-between gap-4 px-4 pt-4">
          <div className="pb-2">
            {langkah ? (
              <p className="mb-2 inline-flex rounded-full bg-highlight px-2.5 py-0.5 font-heading text-xs font-bold text-highlight-foreground">
                {langkah}
              </p>
            ) : null}
            <h1 className="gerak-masuk-naik text-xl leading-tight font-extrabold">{judul}</h1>
            <p className="mt-1 text-primary-foreground/95">{keterangan}</p>
          </div>
          <span className="gerak-masuk mb-2 hidden shrink-0 rounded-full bg-highlight p-3 sm:block">
            <IlustrasiWali className="w-24" />
          </span>
        </div>
        <TepiBergelombang className="text-background" />
      </header>
      <main className="mx-auto max-w-xl px-4 py-8">{children}</main>
    </div>
  );
}
