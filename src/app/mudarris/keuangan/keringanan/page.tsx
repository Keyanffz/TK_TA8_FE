import type { Metadata } from "next";

import { DaftarKeringanan } from "@/components/features/keuangan/daftar-keringanan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Keringanan" };

export default async function KeringananPage() {
  await wajibAkses((sesi) => sesi.bisaKelolaKeuangan);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Keringanan" deskripsi="Potongan tetap untuk murid tertentu, dalam persen atau rupiah." />
      <DaftarKeringanan />
    </div>
  );
}
