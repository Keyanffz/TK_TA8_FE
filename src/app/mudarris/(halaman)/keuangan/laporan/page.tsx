import type { Metadata } from "next";

import { LaporanKeuangan } from "@/components/features/laporan/laporan-keuangan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Laporan Keuangan" };

export default async function LaporanKeuanganPage() {
  await wajibAkses((sesi) => punyaIzin(sesi, "keuangan"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Laporan Keuangan" deskripsi="Rentang paling panjang dua tahun. Excel berisi data yang sama dengan halaman ini." />
      <LaporanKeuangan />
    </div>
  );
}
