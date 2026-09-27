import type { Metadata } from "next";

import { PembayaranSekolah } from "@/components/features/pembayaran/pembayaran-sekolah";
import { PembayaranWali } from "@/components/features/pembayaran/pembayaran-wali";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Pembayaran" };

export default async function PembayaranPage() {
  const user = await wajibAkses((sesi) => sesi.isWali || sesi.bisaKelolaKeuangan);

  if (user.role === "wali_murid") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <KepalaHalaman judul="Riwayat Pembayaran" deskripsi="Kwitansi bisa diunduh setelah pembayaran diterima sekolah." />
        <PembayaranWali />
      </div>
    );
  }

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
