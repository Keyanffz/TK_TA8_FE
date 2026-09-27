import type { Metadata } from "next";

import { FormInfoWali } from "@/components/features/pengaturan/form-info-wali";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Pengaturan" };

// Tab Rekening, Tagihan, PPDB, dan Elemen Penilaian ditambahkan di Fase 7 (B4).
export default async function PengaturanPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Pengaturan" />
      <section aria-labelledby="judul-info-wali">
        <h2 id="judul-info-wali" className="text-lg font-extrabold">
          Banner beranda wali
        </h2>
        <p className="mt-1 mb-5 max-w-prose text-sm text-muted-foreground">
          Pesan singkat dari sekolah yang tampil paling atas di beranda wali murid, misalnya pengingat rapat atau libur.
        </p>
        <FormInfoWali />
      </section>
    </div>
  );
}
