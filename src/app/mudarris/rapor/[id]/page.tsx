import type { Metadata } from "next";

import { DetailRapor } from "@/components/features/rapor/detail-rapor";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Rapor" };

export default async function DetailRaporMudarrisPage({ params }: PageProps<"/mudarris/rapor/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/mudarris/rapor">Kembali ke daftar rapor</TautanKembali>
      <DetailRapor id={id} />
    </div>
  );
}
