import type { Metadata } from "next";

import { DataAnak } from "@/components/features/wali/data-anak";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Data Anak" };

export default async function DataAnakPage({ params }: PageProps<"/dashboard/anak/[id]">) {
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/dashboard/anak">Kembali ke Anak Saya</TautanKembali>
      <DataAnak id={id} />
    </div>
  );
}
