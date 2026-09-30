import type { Metadata } from "next";

import { FormGantiPassword } from "@/components/features/profil/form-ganti-password";
import { FormProfil } from "@/components/features/profil/form-profil";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibSesi } from "@/lib/auth/akses";
import { LABEL_ROLE } from "@/lib/constants/label";

export const metadata: Metadata = { title: "Profil Saya" };

export default async function ProfilMudarrisPage() {
  const user = await wajibSesi();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Profil Saya" deskripsi={`Anda masuk sebagai ${LABEL_ROLE[user.role]}.`} />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section aria-labelledby="judul-data-diri" className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 id="judul-data-diri" className="mb-5 text-lg font-extrabold">
            Data diri
          </h2>
          <FormProfil user={user} />
        </section>
        <section aria-labelledby="judul-password" className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 id="judul-password" className="mb-5 text-lg font-extrabold">
            Ganti password
          </h2>
          <FormGantiPassword />
        </section>
      </div>
    </div>
  );
}
