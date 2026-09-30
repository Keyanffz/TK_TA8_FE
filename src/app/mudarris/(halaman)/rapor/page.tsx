import type { Metadata } from "next";

import { RaporKelas } from "@/components/features/rapor/rapor-kelas";
import { RaporKepalaSekolah } from "@/components/features/rapor/rapor-kepala-sekolah";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibSesi } from "@/lib/auth/akses";
import { statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Rapor" };

export default async function RaporMudarrisPage() {
  const sesi = statusSesi(await wajibSesi());

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Rapor"
        deskripsi={
          sesi.isSuperAdmin
            ? "Review rapor yang diajukan guru, perbaiki isinya bila perlu, lalu terbitkan atau kembalikan untuk revisi."
            : "Pilih kelas dan semester, lalu isi rapor tiap murid dan ajukan ke Kepala Sekolah."
        }
      />
      {sesi.isSuperAdmin ? <RaporKepalaSekolah /> : <RaporKelas />}
    </div>
  );
}
