import type { Metadata } from "next";

import { TambahMurid } from "@/components/features/murid/tambah-murid";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Tambah Murid" };

export default async function TambahMuridPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Tambah Murid"
        deskripsi="NIS dibuat otomatis. Akun wali ikut dibuat dengan username NIS dan password awal tanggal lahir anak."
      />
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <TambahMurid />
      </div>
    </div>
  );
}
