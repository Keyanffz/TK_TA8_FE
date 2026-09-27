import type { Metadata } from "next";

import { DetailGuru } from "@/components/features/guru/detail-guru";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Data Guru" };

export default async function DetailGuruPage({ params }: PageProps<"/dashboard/guru/[id]">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Data Guru" />
      <DetailGuru id={id} />
    </div>
  );
}
