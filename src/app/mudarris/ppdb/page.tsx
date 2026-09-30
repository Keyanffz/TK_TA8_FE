import type { Metadata } from "next";

import { DaftarPendaftar } from "@/components/features/ppdb-sekolah/daftar-pendaftar";
import { RingkasanPpdb } from "@/components/features/ppdb-sekolah/ringkasan-ppdb";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "PPDB" };

export default async function PpdbMudarrisPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="PPDB" deskripsi="Periksa dokumen pendaftar, lalu terima dengan memilih kelas atau tolak dengan alasan." />
      <div className="flex flex-col gap-6">
        <RingkasanPpdb />
        <DaftarPendaftar />
      </div>
    </div>
  );
}
