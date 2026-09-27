import type { Metadata } from "next";

import { DaftarAnak } from "@/components/features/wali/daftar-anak";
import { FormTautkanAnak } from "@/components/features/wali/form-tautkan-anak";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Anak Saya" };

export default async function AnakPage() {
  await wajibAkses((sesi) => sesi.isWali);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Anak Saya" deskripsi="Anak yang sudah tertaut dengan akun Anda." />
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <DaftarAnak />
        <section aria-labelledby="judul-tautkan" className="rounded-xl bg-card p-5 shadow-sm ring-2 ring-highlight">
          <h2 id="judul-tautkan" className="text-lg font-extrabold">
            Tautkan anak
          </h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Kode yang sama bisa dipakai ayah dan ibu selama belum kedaluwarsa. Belum punya kode? Minta ke guru kelas atau
            tata usaha sekolah.
          </p>
          <FormTautkanAnak />
        </section>
      </div>
    </div>
  );
}
