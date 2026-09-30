import type { Metadata } from "next";

import { DetailAlbum } from "@/components/features/galeri-sekolah/detail-album";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Album Galeri" };

export default async function DetailAlbumPage({ params }: PageProps<"/mudarris/website/galeri/[id]">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/mudarris/website/galeri">Kembali ke galeri</TautanKembali>
      <DetailAlbum id={id} />
    </div>
  );
}
