import { FormGantiPassword } from "@/components/features/profil/form-ganti-password";
import { FormProfil } from "@/components/features/profil/form-profil";
import { FormDataWali } from "@/components/features/wali/form-data-wali";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { LABEL_ROLE } from "@/lib/constants/label";
import type { User } from "@/types/domain";

/**
 * Isi halaman Profil Saya untuk kedua area; bagian data wali hanya untuk akun wali murid. Guru tidak punya
 * password (masuk dengan Google), jadi bagian ganti password diganti keterangan akun Google.
 */
export function HalamanProfil({ user }: { user: User }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Profil Saya" deskripsi={`Anda masuk sebagai ${LABEL_ROLE[user.role]}.`} />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="judul-data-diri" className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 id="judul-data-diri" className="mb-5 text-lg font-extrabold">
              Data diri
            </h2>
            <FormProfil user={user} />
          </section>
          {user.wali_murid ? (
            <section aria-labelledby="judul-data-wali" className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 id="judul-data-wali" className="mb-5 text-lg font-extrabold">
                Data wali murid
              </h2>
              <FormDataWali alamat={user.wali_murid.alamat} pekerjaan={user.wali_murid.pekerjaan} nik={user.wali_murid.nik} />
            </section>
          ) : null}
        </div>
        {user.role === "guru" ? (
          <section aria-labelledby="judul-masuk" className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 id="judul-masuk" className="mb-3 text-lg font-extrabold">
              Cara masuk
            </h2>
            <p className="text-muted-foreground">
              Anda masuk dengan akun Google <span className="font-bold break-all text-foreground">{user.email}</span>. Akun guru tidak memakai
              password. Untuk memakai akun Google lain, minta Kepala Sekolah mengganti email Anda di data guru.
            </p>
          </section>
        ) : (
          <section aria-labelledby="judul-password" className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 id="judul-password" className="mb-5 text-lg font-extrabold">
              Ganti password
            </h2>
            <FormGantiPassword />
          </section>
        )}
      </div>
    </div>
  );
}
