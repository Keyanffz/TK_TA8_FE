import type { Metadata } from "next";
import Link from "next/link";

import { DetailPendaftaran } from "@/components/features/ppdb-sekolah/detail-pendaftaran";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Pendaftaran PPDB" };

export default async function DetailPendaftaranMudarrisPage({ params }: PageProps<"/mudarris/ppdb/[id]">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link href="/mudarris/ppdb" className="mb-4 inline-flex min-h-11 items-center font-heading text-sm font-bold text-primary-strong hover:underline">
        Kembali ke PPDB
      </Link>
      <DetailPendaftaran id={id} kepalaSekolah />
    </div>
  );
}
