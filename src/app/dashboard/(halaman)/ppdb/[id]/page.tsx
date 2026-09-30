import type { Metadata } from "next";

import { DetailPendaftaran } from "@/components/features/ppdb-sekolah/detail-pendaftaran";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Pendaftaran PPDB" };

// Juga tujuan notifikasi `pendaftaran_diproses` (backend hanya mengirim pendaftaran milik wali itu).
export default async function DetailPendaftaranPage({ params }: PageProps<"/dashboard/ppdb/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/dashboard/ppdb">Kembali ke PPDB</TautanKembali>
      <DetailPendaftaran id={id} kepalaSekolah={false} />
    </div>
  );
}
