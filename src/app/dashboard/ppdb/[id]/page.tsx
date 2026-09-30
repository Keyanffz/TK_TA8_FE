import type { Metadata } from "next";
import Link from "next/link";

import { DetailPendaftaran } from "@/components/features/ppdb-sekolah/detail-pendaftaran";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Pendaftaran PPDB" };

// Juga tujuan notifikasi `pendaftaran_diproses` (backend hanya mengirim pendaftaran milik wali itu).
export default async function DetailPendaftaranPage({ params }: PageProps<"/dashboard/ppdb/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link href="/dashboard/ppdb" className="mb-4 inline-flex min-h-11 items-center font-heading text-sm font-bold text-primary-strong hover:underline">
        Kembali ke PPDB
      </Link>
      <DetailPendaftaran id={id} kepalaSekolah={false} />
    </div>
  );
}
