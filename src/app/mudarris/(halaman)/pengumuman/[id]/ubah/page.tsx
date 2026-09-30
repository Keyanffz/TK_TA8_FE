import type { Metadata } from "next";

import { UbahPengumuman } from "@/components/features/pengumuman/ubah-pengumuman";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Ubah Pengumuman" };

export default async function UbahPengumumanPage({ params }: PageProps<"/mudarris/pengumuman/[id]/ubah">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin || sesi.isGuru);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href={`/mudarris/pengumuman/${id}`}>Kembali ke pengumuman</TautanKembali>
      <KepalaHalaman judul="Ubah Pengumuman" />
      <UbahPengumuman id={id} />
    </div>
  );
}
