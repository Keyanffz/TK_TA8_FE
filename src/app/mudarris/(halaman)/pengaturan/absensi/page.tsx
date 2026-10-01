import type { Metadata } from "next";

import { FormPengaturanAbsensi } from "@/components/features/pengaturan/absensi/form-pengaturan-absensi";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Pengaturan Absensi" };

export default async function PengaturanAbsensiPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Pengaturan Absensi" deskripsi="Lokasi sekolah, jam absen, hari kerja, dan masa simpan foto absensi guru dan Kepala Sekolah." />
      <FormPengaturanAbsensi />
    </div>
  );
}
