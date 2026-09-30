import type { Metadata } from "next";

import { PembayaranWali } from "@/components/features/pembayaran/pembayaran-wali";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";

export const metadata: Metadata = { title: "Pembayaran" };

export default function PembayaranPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Riwayat Pembayaran" deskripsi="Kwitansi bisa diunduh setelah pembayaran diterima sekolah." />
      <PembayaranWali />
    </div>
  );
}
