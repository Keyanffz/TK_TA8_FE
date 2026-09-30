import type { Metadata } from "next";
import Link from "next/link";

import { DetailRapor } from "@/components/features/rapor/detail-rapor";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Rapor" };

export default async function DetailRaporPage({ params }: PageProps<"/dashboard/rapor/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link href="/dashboard/rapor" className="mb-4 inline-flex min-h-11 items-center font-heading text-sm font-bold text-primary-strong hover:underline">
        Kembali ke daftar rapor
      </Link>
      <DetailRapor id={id} />
    </div>
  );
}
