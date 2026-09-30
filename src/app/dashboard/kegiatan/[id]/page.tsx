import type { Metadata } from "next";

import { DetailKegiatan } from "@/components/features/kegiatan/detail-kegiatan";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Kegiatan Kelas" };

export default async function DetailKegiatanPage({ params }: PageProps<"/dashboard/kegiatan/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/dashboard/kegiatan">Kembali ke kegiatan kelas</TautanKembali>
      <DetailKegiatan id={id} />
    </div>
  );
}
