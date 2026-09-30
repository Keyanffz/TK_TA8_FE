import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FormOnboarding } from "@/components/features/wali/form-onboarding";
import { KerangkaTanpaMenu } from "@/components/layout/dashboard/kerangka-tanpa-menu";
import { ambilProfilSekolah } from "@/lib/api/publik";
import { wajibSesi } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Lengkapi Profil" };

/** Onboarding wali (A6): wajib diisi sekali sebelum memakai dashboard. Tampil tanpa menu. */
export default async function OnboardingPage() {
  const [user, profil] = await Promise.all([wajibSesi(), ambilProfilSekolah()]);
  if (user.wali_murid?.profil_lengkap) redirect("/dashboard");

  return (
    <KerangkaTanpaMenu
      namaSekolah={profil.namaSekolah}
      logoUrl={profil.logoUrl}
      langkah="Langkah terakhir"
      judul="Assalamu'alaikum"
      keterangan="Lengkapi data berikut supaya guru dan sekolah bisa menghubungi Anda."
    >
      <FormOnboarding namaAwal={user.name} noHpAwal={user.no_hp ?? ""} />
    </KerangkaTanpaMenu>
  );
}
