import type { Metadata } from "next";

import { RekapAbsensi } from "@/components/features/absensi/rekap-absensi";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Rekap Absensi" };

export default async function RekapAbsensiPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Rekap Absensi" deskripsi="Kehadiran guru dan Kepala Sekolah per bulan. Tidak absen pulang dihitung setelah jam pulang hari itu tutup." />
      <RekapAbsensi />
    </div>
  );
}
