import type { Metadata } from "next";
import Link from "next/link";

import { LogoSekolah } from "@/components/shared/logo-sekolah";
import { ambilProfilSekolah } from "@/lib/api/publik";
import { NAUNGAN_SEKOLAH } from "@/lib/constants/sekolah";

export async function generateMetadata(): Promise<Metadata> {
  const profil = await ambilProfilSekolah();
  return { title: { default: profil.namaSekolah, template: `%s | ${profil.namaSekolah}` } };
}

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const profil = await ambilProfilSekolah();

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="hidden flex-col justify-between bg-primary-strong p-10 text-primary-foreground lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <LogoSekolah logoUrl={profil.logoUrl} namaSekolah={profil.namaSekolah} ukuran={48} className="size-12 rounded-full bg-card" />
          <span className="font-heading text-lg font-semibold">{profil.namaSekolah}</span>
        </Link>
        <div>
          <p className="max-w-sm font-heading text-xl leading-9">
            Masuk untuk melihat tagihan, kegiatan kelas, pengumuman, dan rapor anak.
          </p>
          <svg
            aria-hidden="true"
            viewBox="0 0 120 12"
            className="mt-4 h-3 w-28 text-highlight"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M2 7 Q 12 1 22 7 T 42 7 T 62 7 T 82 7 T 102 7 T 118 6" />
          </svg>
        </div>
        <p className="text-sm text-primary-foreground/85">{NAUNGAN_SEKOLAH}</p>
      </aside>

      <main className="flex flex-col px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-3 lg:hidden">
          <LogoSekolah logoUrl={profil.logoUrl} namaSekolah={profil.namaSekolah} ukuran={40} />
          <span className="font-heading text-base font-semibold">{profil.namaSekolah}</span>
        </Link>
        <div className="mx-auto my-auto w-full max-w-md py-10">{children}</div>
      </main>
    </div>
  );
}
