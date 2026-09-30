import type { Metadata } from "next";

import { DaftarJenisTagihan } from "@/components/features/keuangan/daftar-jenis-tagihan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Jenis Tagihan" };

export default async function JenisTagihanPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Jenis Tagihan" deskripsi="Nominal dan periode tiap tagihan per tahun ajaran. Perubahan nominal tidak mengubah tagihan yang sudah dibuat." />
      <DaftarJenisTagihan />
    </div>
  );
}
