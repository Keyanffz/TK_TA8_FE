import type { Metadata } from "next";
import Link from "next/link";

import { DetailAlbum } from "@/components/features/galeri-sekolah/detail-album";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Album Galeri" };

export default async function DetailAlbumPage({ params }: PageProps<"/dashboard/website/galeri/[id]">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link href="/dashboard/website/galeri" className="mb-4 inline-flex min-h-11 items-center font-heading text-sm font-bold text-primary-strong hover:underline">
        Kembali ke galeri
      </Link>
      <DetailAlbum id={id} />
    </div>
  );
}
