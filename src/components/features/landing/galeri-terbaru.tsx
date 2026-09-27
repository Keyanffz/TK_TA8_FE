import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { JudulBagian } from "@/components/shared/judul-bagian";
import { Muncul } from "@/components/shared/muncul";
import { cn } from "@/lib/utils";
import type { GaleriAlbum } from "@/types/domain";

// Album tampil seperti foto cetak yang ditempel miring di papan kelas.
const KEMIRINGAN = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg"] as const;

// Komposisi menyesuaikan jumlah album: mosaik hanya kalau cukup banyak.
function tataLetak(jumlah: number): { album: number; grid: string; utama: string } {
  if (jumlah >= 5) return { album: 5, grid: "md:grid-cols-4 md:grid-rows-2", utama: "md:col-span-2 md:row-span-2" };
  if (jumlah >= 3) return { album: 3, grid: "md:grid-cols-3 md:grid-rows-2", utama: "md:col-span-2 md:row-span-2" };
  return { album: jumlah, grid: "md:grid-cols-2", utama: "" };
}

export function GaleriTerbaru({ album }: { album: GaleriAlbum[] }) {
  const letak = tataLetak(album.length);

  return (
    <section aria-labelledby="judul-galeri" className="bg-primary-soft">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <JudulBagian
          id="judul-galeri"
          judul="Galeri Kegiatan"
          aksi={
            <Link href="/galeri" className="group inline-flex items-center gap-1 font-heading font-bold text-primary-strong hover:underline">
              Lihat semua album
              <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          }
        />
        <Muncul as="ul" efek="jatuh" className={cn("grid gap-6", letak.grid)}>
          {album.slice(0, letak.album).map((item, indeks) => (
            <li key={item.id} className={cn("min-h-56", indeks === 0 && letak.utama)}>
              <Link
                href={`/galeri/${item.slug}`}
                className="angkat flex h-full flex-col rounded-md bg-card p-2.5 pb-3 shadow-md rotate-(--miring) hover:rotate-0"
                style={{ "--miring": KEMIRINGAN[indeks % KEMIRINGAN.length], "--miring-hover": "0deg" } as CSSProperties}
              >
                <span className="relative block min-h-44 flex-1 overflow-hidden rounded-sm bg-muted">
                  {item.cover_url ? (
                    <Image
                      src={item.cover_url}
                      alt=""
                      fill
                      sizes={indeks === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <span className="mt-2.5 px-1 font-heading font-bold">{item.judul}</span>
              </Link>
            </li>
          ))}
        </Muncul>
      </div>
    </section>
  );
}
