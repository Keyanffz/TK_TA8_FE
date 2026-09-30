import type { Metadata } from "next";

import { DetailTagihan, type PeranTagihan } from "@/components/features/tagihan/detail-tagihan";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { wajibSesi } from "@/lib/auth/akses";
import { statusSesi } from "@/lib/auth/role";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Detail Tagihan" };

export default async function DetailTagihanMudarrisPage({ params }: PageProps<"/mudarris/tagihan/[id]">) {
  const sesi = statusSesi(await wajibSesi());
  const id = idDariParam((await params).id);
  const peran: PeranTagihan = sesi.isSuperAdmin ? "kepala-sekolah" : sesi.bisaKelolaKeuangan ? "keuangan" : "guru";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/mudarris/tagihan">Kembali ke daftar tagihan</TautanKembali>
      <DetailTagihan id={id} peran={peran} />
    </div>
  );
}
