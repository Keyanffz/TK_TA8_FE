import type { Metadata } from "next";
import Link from "next/link";

import { DaftarGuru } from "@/components/features/guru/daftar-guru";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { buttonVariants } from "@/components/ui/button";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Guru" };

export default async function GuruPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Guru"
        deskripsi="Setujui pendaftaran guru, atur izin keuangan, dan pilih guru yang tampil di halaman depan."
        aksi={
          <Link href="/dashboard/guru/baru" className={buttonVariants()}>
            Tambah Guru
          </Link>
        }
      />
      <DaftarGuru />
    </div>
  );
}
