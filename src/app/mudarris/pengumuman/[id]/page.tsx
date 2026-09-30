import type { Metadata } from "next";
import Link from "next/link";

import { DetailPengumuman } from "@/components/features/pengumuman/detail-pengumuman";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Pengumuman" };

export default async function DetailPengumumanMudarrisPage({ params }: PageProps<"/mudarris/pengumuman/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link href="/mudarris/pengumuman" className="mb-4 inline-flex min-h-11 items-center font-heading text-sm font-bold text-primary-strong hover:underline">
        Kembali ke pengumuman
      </Link>
      <DetailPengumuman id={id} />
    </div>
  );
}
