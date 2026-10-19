import type { Metadata } from "next";

import { DetailMurid } from "@/components/features/murid/detail-murid";
import { TagihanMurid } from "@/components/features/tagihan/tagihan-murid";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin, statusSesi } from "@/lib/auth/role";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Data Murid" };

export default async function DetailMuridPage({ params }: PageProps<"/mudarris/murid/[id]">) {
  const sesi = statusSesi(await wajibAkses((sesi) => sesi.isSuperAdmin || sesi.isGuru));
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <DetailMurid
        id={id}
        bisaKelola={punyaIzin(sesi, "data_murid", "kelola")}
        bisaKelolaWali={sesi.isSuperAdmin}
        tagihan={<TagihanMurid muridId={id} />}
      />
    </div>
  );
}
