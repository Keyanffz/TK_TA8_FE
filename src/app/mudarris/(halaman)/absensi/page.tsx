import type { Metadata } from "next";

import { HalamanAbsensi } from "@/components/features/absensi/halaman-absensi";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibSesi } from "@/lib/auth/akses";
import { statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Absensi" };

export default async function AbsensiPage() {
  const sesi = statusSesi(await wajibSesi());

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:py-8">
      <KepalaHalaman judul="Absensi" deskripsi="Absen dari area sekolah dengan lokasi dan foto wajah. Jam yang dipakai adalah jam server sekolah." />
      <HalamanAbsensi kepalaSekolah={sesi.isSuperAdmin} />
    </div>
  );
}
