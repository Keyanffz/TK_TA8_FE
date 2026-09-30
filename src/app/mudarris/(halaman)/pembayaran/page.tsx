import type { Metadata } from "next";

import { PembayaranSekolah } from "@/components/features/pembayaran/pembayaran-sekolah";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Pembayaran" };

export default async function PembayaranMudarrisPage() {
  await wajibAkses((sesi) => sesi.bisaKelolaKeuangan);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Pembayaran"
        deskripsi="Periksa bukti transfer dari wali. Pembayaran tunai dicatat dari halaman detail tagihan."
      />
      <PembayaranSekolah />
    </div>
  );
}
