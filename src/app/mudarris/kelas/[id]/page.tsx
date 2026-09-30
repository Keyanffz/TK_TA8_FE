import type { Metadata } from "next";

import { DetailKelas } from "@/components/features/kelas/detail-kelas";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Detail Kelas" };

export default async function DetailKelasPage({ params }: PageProps<"/mudarris/kelas/[id]">) {
  const user = await wajibAkses((sesi) => sesi.isSuperAdmin || sesi.isGuru);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <DetailKelas id={id} bisaKelola={user.role === "super_admin"} />
    </div>
  );
}
