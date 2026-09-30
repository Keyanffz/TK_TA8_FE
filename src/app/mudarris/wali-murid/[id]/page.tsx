import type { Metadata } from "next";

import { DetailWaliMurid } from "@/components/features/wali-murid/detail-wali-murid";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Data Wali Murid" };

export default async function DetailWaliMuridPage({ params }: PageProps<"/mudarris/wali-murid/[id]">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <DetailWaliMurid id={id} />
    </div>
  );
}
