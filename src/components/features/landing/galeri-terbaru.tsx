import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { JudulBagian } from "@/components/shared/judul-bagian";
import { cn } from "@/lib/utils";
import type { GaleriAlbum } from "@/types/domain";

// Komposisi menyesuaikan jumlah album: mosaik hanya kalau cukup banyak.
function tataLetak(jumlah: number): { album: number; grid: string; utama: string } {
  if (jumlah >= 5) return { album: 5, grid: "md:grid-cols-4 md:grid-rows-2", utama: "md:col-span-2 md:row-span-2" };
  if (jumlah >= 3) return { album: 3, grid: "md:grid-cols-3 md:grid-rows-2", utama: "md:col-span-2 md:row-span-2" };
  return { album: jumlah, grid: "md:grid-cols-2", utama: "" };
}

export function GaleriTerbaru({ album }: { album: GaleriAlbum[] }) {
  const letak = tataLetak(album.length);

  return (
    <section aria-labelledby="judul-galeri" className="bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian
          id="judul-galeri"
          judul="Galeri Kegiatan"
          aksi={
            <Link href="/galeri" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Lihat semua album
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          }
        />
        <ul className={cn("grid gap-3", letak.grid)}>
          {album.slice(0, letak.album).map((item, indeks) => (
            <li key={item.id} className={cn("min-h-48", indeks === 0 && letak.utama)}>
              <Link
                href={`/galeri/${item.slug}`}
                className="group relative block h-full min-h-48 overflow-hidden rounded-lg bg-muted"
              >
                {item.cover_url ? (
                  <Image
                    src={item.cover_url}
                    alt=""
                    fill
                    sizes={indeks === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                    className="object-cover"
                  />
                ) : null}
                <span className="absolute inset-x-0 bottom-0 bg-foreground/75 px-3 py-2 text-sm font-medium text-primary-foreground group-hover:underline">
                  {item.judul}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
