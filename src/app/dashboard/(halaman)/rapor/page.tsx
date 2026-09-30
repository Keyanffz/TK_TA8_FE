import type { Metadata } from "next";

import { DaftarRaporWali } from "@/components/features/rapor/daftar-rapor-wali";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";

export const metadata: Metadata = { title: "Rapor" };

export default function RaporPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Rapor" deskripsi="Rapor perkembangan anak yang sudah diterbitkan sekolah." />
      <DaftarRaporWali />
    </div>
  );
}
