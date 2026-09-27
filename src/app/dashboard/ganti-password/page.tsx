import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TombolKeluar } from "@/components/features/auth/tombol-keluar";
import { FormGantiPassword } from "@/components/features/profil/form-ganti-password";
import { KerangkaTanpaMenu } from "@/components/layout/dashboard/kerangka-tanpa-menu";
import { ambilProfilSekolah } from "@/lib/api/publik";
import { wajibSesi } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Ganti Password" };

/**
 * Wali yang masih memakai password awal (tanggal lahir anak) wajib menggantinya
 * sebelum membuka halaman lain (A2.1). Backend menolak endpoint lain dengan
 * PASSWORD_WAJIB_DIGANTI, dan layout dashboard mengarahkan ke sini.
 */
export default async function GantiPasswordWajibPage() {
  const [user, profil] = await Promise.all([wajibSesi(), ambilProfilSekolah()]);
  if (!user.wajib_ganti_password) redirect("/dashboard");
  const perluOnboarding = user.wali_murid?.profil_lengkap === false;

  return (
    <KerangkaTanpaMenu
      namaSekolah={profil.namaSekolah}
      logoUrl={profil.logoUrl}
      langkah={perluOnboarding ? "Langkah 1 dari 2" : undefined}
      judul="Ganti password awal"
      keterangan="Password awal sama dengan tanggal lahir anak, jadi mudah ditebak orang lain. Buat password baru yang hanya Anda ketahui."
    >
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="mb-5 text-sm text-muted-foreground">
          Masuk sebagai <span className="font-bold text-foreground">{user.username ?? user.name}</span>
        </p>
        <FormGantiPassword wajib />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>Bukan akun Anda?</p>
        <TombolKeluar />
      </div>
    </KerangkaTanpaMenu>
  );
}
