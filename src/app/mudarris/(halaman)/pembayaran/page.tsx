import type { Metadata } from "next";

import { RiwayatPembayaranSekolah } from "@/components/features/pembayaran/riwayat-pembayaran-sekolah";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Pembayaran" };

export default async function PembayaranMudarrisPage() {
  await wajibAkses((sesi) => punyaIzin(sesi, "keuangan"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Pembayaran"
        deskripsi="Semua pembayaran tunai yang sudah dicatat. Pembayaran baru dicatat dari halaman detail tagihan."
      />
      <RiwayatPembayaranSekolah />
    </div>
  );
}
