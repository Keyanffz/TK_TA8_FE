import type { Metadata } from "next";

import { DaftarTunggakan } from "@/components/features/laporan/daftar-tunggakan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Tunggakan" };

export default async function TunggakanPage() {
  await wajibAkses((sesi) => sesi.bisaKelolaKeuangan);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Tunggakan"
        deskripsi="Murid dengan tagihan yang lewat jatuh tempo. Wali sudah menerima notifikasi otomatis saat tagihan menjadi terlambat."
      />
      <DaftarTunggakan />
    </div>
  );
}
