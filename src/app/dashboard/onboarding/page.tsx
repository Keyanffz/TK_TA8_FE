import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { IlustrasiWali } from "@/components/features/auth/ilustrasi-login";
import { FormOnboarding } from "@/components/features/wali/form-onboarding";
import { LogoSekolah } from "@/components/shared/logo-sekolah";
import { TaburanBintang, type PosisiBintang } from "@/components/shared/ornamen/bintang";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { TepiBergelombang } from "@/components/shared/ornamen/tepi-bergelombang";
import { ambilProfilSekolah } from "@/lib/api/publik";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Lengkapi Profil" };

const BINTANG: readonly PosisiBintang[] = [
  { x: 80, y: 20, ukuran: 12, gerak: "kelip", tunda: 0 },
  { x: 92, y: 60, ukuran: 16, gerak: "melayang", tunda: 0.7 },
  { x: 64, y: 72, ukuran: 9, gerak: "kelip", tunda: 1.4 },
];

/** Onboarding wali (A6): wajib diisi sekali sebelum memakai dashboard. Tampil tanpa menu. */
export default async function OnboardingPage() {
  const [user, profil] = await Promise.all([wajibAkses((sesi) => sesi.isWali), ambilProfilSekolah()]);
  if (user.wali_murid?.profil_lengkap) redirect("/dashboard");

  return (
    <div className="min-h-dvh">
      <header className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <PolaGeometri className="-z-10 text-primary-foreground/[0.07]" />
        <TaburanBintang bintang={BINTANG} className="-z-10" />
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 pt-6 pb-2">
          <span className="rounded-full bg-card p-0.5">
            <LogoSekolah logoUrl={profil.logoUrl} namaSekolah={profil.namaSekolah} ukuran={40} className="size-10" />
          </span>
          <span className="font-heading font-extrabold">{profil.namaSekolah}</span>
        </div>
        <div className="mx-auto flex max-w-xl items-end justify-between gap-4 px-4 pt-4">
          <div className="pb-2">
            <h1 className="gerak-masuk-naik text-xl leading-tight font-extrabold">Assalamu&apos;alaikum, {user.name}</h1>
            <p className="mt-1 text-primary-foreground/95">
              Satu langkah lagi. Lengkapi data berikut supaya sekolah bisa menghubungi Anda.
            </p>
          </div>
          <span className="gerak-masuk mb-2 hidden shrink-0 rounded-full bg-highlight p-3 sm:block">
            <IlustrasiWali className="w-24" />
          </span>
        </div>
        <TepiBergelombang className="text-background" />
      </header>
      <main className="mx-auto max-w-xl px-4 py-8">
        <FormOnboarding noHpAwal={user.no_hp ?? ""} />
      </main>
    </div>
  );
}
