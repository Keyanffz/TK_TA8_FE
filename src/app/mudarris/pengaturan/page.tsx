import type { Metadata } from "next";

import { HalamanPengaturan } from "@/components/features/pengaturan/halaman-pengaturan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Pengaturan" deskripsi="Rekening dan aturan tagihan, PPDB, banner beranda wali, dan elemen penilaian rapor." />
      <HalamanPengaturan />
    </div>
  );
}
