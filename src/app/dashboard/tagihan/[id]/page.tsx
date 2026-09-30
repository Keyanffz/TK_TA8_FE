import type { Metadata } from "next";

import { DetailTagihan } from "@/components/features/tagihan/detail-tagihan";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Detail Tagihan" };

export default async function DetailTagihanPage({ params }: PageProps<"/dashboard/tagihan/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/dashboard/tagihan">Kembali ke daftar tagihan</TautanKembali>
      <DetailTagihan id={id} peran="wali" />
    </div>
  );
}
