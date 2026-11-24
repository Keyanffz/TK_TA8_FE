import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { JudulBagian } from "@/components/shared/judul-bagian";
import type { FotoGaleriTerbaru } from "@/lib/api/publik";
import { cn } from "@/lib/utils";

// Foto tampil seperti foto cetak yang ditempel miring berderet di papan kelas.
const KEMIRINGAN = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg"] as const;

// Satu putaran harus lebih lebar dari layar desktop, jadi foto yang sedikit diulang sampai sejumlah ini.
const MIN_FOTO_SEPUTARAN = 8;
const DETIK_PER_FOTO = 5;

/**
 * Foto album terbaru berjalan terus ke kiri tanpa ujung. Jalurnya berisi dua salinan sama panjang dan bergeser
 * setengah lebarnya, jadi sambungannya tidak terlihat. Salinan kedua (dan foto yang diulang) disembunyikan dari
 * pembaca layar dan Tab. Jalur berhenti saat disentuh kursor atau difokus; dengan gerak dikurangi, jalur diam
 * dan bisa digeser manual.
 */
export function GaleriTerbaru({ foto }: { foto: FotoGaleriTerbaru[] }) {
  const ulang = Math.ceil(MIN_FOTO_SEPUTARAN / foto.length);
  const seputaran = Array.from({ length: ulang }, () => foto).flat();

  return (
    <section aria-labelledby="judul-galeri" className="overflow-hidden bg-primary-soft py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <JudulBagian
          id="judul-galeri"
          judul="Galeri Kegiatan"
          className="mb-4"
          aksi={
            <Link href="/galeri" className="group inline-flex items-center gap-1 font-heading font-bold text-primary-strong hover:underline">
              Lihat semua album
              <ArrowRight aria-hidden="true" className="panah-melesat size-4" />
            </Link>
          }
        />
      </div>
      <div className="motion-reduce:overflow-x-auto">
        <ul
          className="jalur-galeri flex w-max px-2 py-10"
          style={{ "--durasi": `${seputaran.length * DETIK_PER_FOTO}s` } as CSSProperties}
        >
          {[0, 1].map((salinan) =>
            seputaran.map((item, indeks) => {
              const ulangan = salinan === 1 || indeks >= foto.length;
              return (
                <li
                  key={`${salinan}-${indeks}`}
                  aria-hidden={ulangan || undefined}
                  inert={ulangan}
                  className={cn("mr-6 w-52 shrink-0 sm:w-64", ulangan && "motion-reduce:hidden")}
                >
                  <Link
                    href={`/galeri/${item.album.slug}`}
                    className="kartu-foto flex h-full flex-col rounded-md bg-card p-2.5 pb-3 shadow-sm rotate-(--miring) hover:rotate-0"
                    style={{ "--miring": KEMIRINGAN[indeks % KEMIRINGAN.length] } as CSSProperties}
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-sm bg-muted">
                      <Image src={item.url} alt={item.caption ?? ""} fill sizes="(min-width: 640px) 18rem, 15rem" className="object-cover" />
                    </span>
                    <span className="mt-2.5 line-clamp-1 px-1 font-heading text-sm font-bold">{item.album.judul}</span>
                  </Link>
                </li>
              );
            }),
          )}
        </ul>
      </div>
    </section>
  );
}
