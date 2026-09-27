import type { Metadata } from "next";

import { TambahGuru } from "@/components/features/guru/tambah-guru";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Tambah Guru" };

export default async function TambahGuruPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Tambah Guru" deskripsi="Akun langsung aktif tanpa perlu persetujuan. Password awal dibuat otomatis." />
      <TambahGuru />
    </div>
  );
}
