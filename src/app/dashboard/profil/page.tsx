import type { Metadata } from "next";

import { FormGantiPassword } from "@/components/features/profil/form-ganti-password";
import { FormProfil } from "@/components/features/profil/form-profil";
import { FormDataWali } from "@/components/features/wali/form-data-wali";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibSesi } from "@/lib/auth/akses";
import { LABEL_ROLE } from "@/lib/constants/label";

export const metadata: Metadata = { title: "Profil Saya" };

export default async function ProfilPage() {
  const user = await wajibSesi();
  const bisaGantiPassword = user.role !== "wali_murid";

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
        {bisaGantiPassword ? (
          <section aria-labelledby="judul-password" className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 id="judul-password" className="mb-5 text-lg font-extrabold">
              Ganti password
            </h2>
            <FormGantiPassword />
          </section>
        ) : (
          <div className="flex flex-col gap-6">
            {user.wali_murid ? (
              <section aria-labelledby="judul-data-wali" className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 id="judul-data-wali" className="mb-5 text-lg font-extrabold">
                  Data wali murid
                </h2>
                <FormDataWali
                  alamat={user.wali_murid.alamat}
                  pekerjaan={user.wali_murid.pekerjaan}
                  nik={user.wali_murid.nik}
                />
              </section>
            ) : null}
            <section className="rounded-xl bg-primary-soft p-5 text-sm">
              <h2 className="font-heading text-lg font-extrabold">Masuk dengan Google</h2>
              <p className="mt-1">
                Akun wali murid tidak memakai password. Untuk masuk, pakai akun Google {user.email}.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
