import type { Metadata } from "next";

import { DaftarKelas } from "@/components/features/kelas/daftar-kelas";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Kelas" };

export default async function KelasPage() {
  const user = await wajibAkses((sesi) => sesi.isSuperAdmin || sesi.isGuru);
  const kepalaSekolah = user.role === "super_admin";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Kelas"
        deskripsi={kepalaSekolah ? "Kelas per tahun ajaran, wali kelas, pendamping, dan kapasitasnya." : "Kelas yang Anda ampu di tahun ajaran aktif."}
      />
      <DaftarKelas bisaKelola={kepalaSekolah} />
    </div>
  );
}
