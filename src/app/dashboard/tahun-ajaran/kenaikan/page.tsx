import type { Metadata } from "next";

import { WizardKenaikan } from "@/components/features/tahun-ajaran/wizard-kenaikan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Kenaikan Kelas" };

export default async function KenaikanKelasPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Kenaikan Kelas"
        deskripsi="Atur murid tiap kelas: naik ke Kelompok B, tinggal kelas, atau lulus. Saran awal: Kelompok A naik ke kelas B dengan nomor yang sama, Kelompok B lulus."
      />
      <WizardKenaikan />
    </div>
  );
}
