import type { Metadata } from "next";

import { DetailPendaftaran } from "@/components/features/ppdb-sekolah/detail-pendaftaran";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Pendaftaran PPDB" };

export default async function DetailPendaftaranMudarrisPage({ params }: PageProps<"/mudarris/ppdb/[id]">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/mudarris/ppdb">Kembali ke PPDB</TautanKembali>
      <DetailPendaftaran id={id} kepalaSekolah />
    </div>
  );
}
