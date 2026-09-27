import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GridFotoGaleri } from "@/components/features/galeri/grid-foto-galeri";
import { EmptyState } from "@/components/shared/empty-state";
import { ambilDetailGaleri } from "@/lib/api/publik";
import { formatTanggal } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/galeri/[slug]">): Promise<Metadata> {
  const album = await ambilDetailGaleri((await params).slug);
  if (!album) return {};
  return { title: album.judul, description: album.deskripsi ?? undefined };
}

export default async function DetailGaleriPage({ params }: PageProps<"/galeri/[slug]">) {
  const album = await ambilDetailGaleri((await params).slug);
  if (!album) notFound();
  const foto = album.foto ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <Link href="/galeri" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-strong hover:underline">
        <ChevronLeft aria-hidden="true" className="size-4" />
        Semua album
      </Link>
      <h1 className="mt-6 text-xl font-semibold md:text-2xl">{album.judul}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatTanggal(album.tanggal)} · {foto.length} foto
      </p>
      {album.deskripsi ? <p className="mt-4 max-w-prose">{album.deskripsi}</p> : null}
      <div className="mt-8">
        {foto.length === 0 ? (
          <EmptyState judul="Album ini belum berisi foto." />
        ) : (
          <GridFotoGaleri judulAlbum={album.judul} foto={foto} />
        )}
      </div>
    </div>
  );
}
