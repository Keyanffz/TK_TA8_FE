import type { Metadata } from "next";
import Link from "next/link";

import { DetailKegiatan } from "@/components/features/kegiatan/detail-kegiatan";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Kegiatan Kelas" };

export default async function DetailKegiatanMudarrisPage({ params }: PageProps<"/mudarris/kegiatan/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link href="/mudarris/kegiatan" className="mb-4 inline-flex min-h-11 items-center font-heading text-sm font-bold text-primary-strong hover:underline">
        Kembali ke kegiatan kelas
      </Link>
      <DetailKegiatan id={id} />
    </div>
  );
}
