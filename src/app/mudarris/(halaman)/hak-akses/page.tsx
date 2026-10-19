import type { Metadata } from "next";

import { DaftarHakAkses } from "@/components/features/hak-akses/daftar-hak-akses";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Hak Akses Guru" };

export default async function HakAksesGuruPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Hak Akses Guru"
        deskripsi="Beri guru izin lihat atau kelola untuk keuangan, konten website, laporan absensi, data murid, dan pengumuman. Manajemen guru, hak akses, dan pengaturan absensi tetap khusus Kepala Sekolah."
      />
      <DaftarHakAkses />
    </div>
  );
}
