import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { JudulHalaman } from "@/components/shared/judul-halaman";
import { PaginasiTautan } from "@/components/shared/paginasi-tautan";
import { ambilDaftarGaleri } from "@/lib/api/publik";
import { formatTanggal } from "@/lib/format";
import { nomorHalaman } from "@/lib/halaman";

export const metadata: Metadata = { title: "Galeri" };

const PER_HALAMAN = 12;

export default async function GaleriPage({ searchParams }: PageProps<"/galeri">) {
  const halaman = nomorHalaman((await searchParams).page);
  const { data, meta } = await ambilDaftarGaleri(halaman, PER_HALAMAN);

  return (
    <>
      <JudulHalaman judul="Galeri" deskripsi="Dokumentasi kegiatan sekolah yang dibagikan untuk umum." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        {data.length === 0 ? (
          <EmptyState judul="Belum ada album galeri." />
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((album) => (
              <li key={album.id}>
                <Link href={`/galeri/${album.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                    {album.cover_url ? (
                      <Image
                        src={album.cover_url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <h2 className="mt-3 font-semibold group-hover:text-primary group-hover:underline">{album.judul}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatTanggal(album.tanggal)}
                    {album.jumlah_foto !== undefined ? ` · ${album.jumlah_foto} foto` : null}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <PaginasiTautan meta={meta} basePath="/galeri" />
      </div>
    </>
  );
}
