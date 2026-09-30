import type { Metadata } from "next";
import Link from "next/link";

import { UbahPengumuman } from "@/components/features/pengumuman/ubah-pengumuman";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Ubah Pengumuman" };

export default async function UbahPengumumanPage({ params }: PageProps<"/mudarris/pengumuman/[id]/ubah">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin || sesi.isGuru);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link href={`/mudarris/pengumuman/${id}`} className="mb-4 inline-flex min-h-11 items-center font-heading text-sm font-bold text-primary-strong hover:underline">
        Kembali ke pengumuman
      </Link>
      <KepalaHalaman judul="Ubah Pengumuman" />
      <UbahPengumuman id={id} />
    </div>
  );
}
