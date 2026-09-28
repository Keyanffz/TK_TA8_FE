"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Paginasi } from "@/components/shared/paginasi";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarAlbum } from "@/lib/api/galeri";
import { formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Semua album galeri, termasuk yang belum tampil di website. */
export function DaftarAlbum() {
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDaftarAlbum(halaman);

  if (isPending) return <Skeleton aria-label="Memuat album" className="h-72 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  if (data.data.length === 0) return <EmptyState judul="Belum ada album galeri." deskripsi="Buat album untuk kegiatan sekolah yang fotonya boleh dilihat umum." />;

  return (
    <>
      <ul className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", isPlaceholderData && "opacity-60")}>
        {data.data.map((album) => (
          <li key={album.id}>
            <Link href={`/dashboard/website/galeri/${album.id}`} className="angkat flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <span className="relative block aspect-[4/3] bg-muted">
                {album.cover_url ? (
                  <Image src={album.cover_url} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
                    <ImageOff aria-hidden="true" className="size-6" />
                    Belum ada foto
                  </span>
                )}
              </span>
              <span className="flex flex-1 flex-col gap-1 p-4">
                <span className="flex flex-wrap items-center gap-2">
                  <StatusBadge nada={album.is_publik ? "sukses" : "netral"}>{album.is_publik ? "Tampil di website" : "Disembunyikan"}</StatusBadge>
                  <span className="text-xs text-muted-foreground">{album.jumlah_foto} foto</span>
                </span>
                <span className="font-heading text-lg leading-snug font-bold">{album.judul}</span>
                <span className="text-sm text-muted-foreground">{formatTanggal(album.tanggal)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Paginasi meta={data.meta} onUbah={(nomor) => void setHalaman(nomor)} label="Halaman album" />
    </>
  );
}
