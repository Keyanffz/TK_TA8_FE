import type { Metadata } from "next";

import { DetailPengumuman } from "@/components/features/pengumuman/detail-pengumuman";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Pengumuman" };

export default async function DetailPengumumanPage({ params }: PageProps<"/dashboard/pengumuman/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/dashboard/pengumuman">Kembali ke pengumuman</TautanKembali>
      <DetailPengumuman id={id} />
    </div>
  );
}
