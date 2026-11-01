import { FileText, ImageIcon } from "lucide-react";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { LABEL_JENIS_LAMPIRAN } from "@/lib/constants/label";
import { formatUkuranFile } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LampiranPengumuman } from "@/types/domain";

/**
 * Lampiran di detail pengumuman (wali, guru, Kepala Sekolah, dan halaman publik). Pratinjau gambar tidak lewat
 * optimasi gambar Next: signed URL kedaluwarsa dalam 30 menit, dan alamat unduhan publik tetap sama walau
 * lampirannya diganti, sehingga hasil optimasi yang di-cache bisa menampilkan gambar lama.
 */
export function KartuLampiran({ lampiran, className }: { lampiran: LampiranPengumuman; className?: string }) {
  const gambar = lampiran.jenis === "gambar";
  const Ikon = gambar ? ImageIcon : FileText;

  return (
    <section aria-labelledby="judul-lampiran" className={cn("flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:p-4", className)}>
      <h2 id="judul-lampiran" className="font-heading text-base font-bold">
        Lampiran
      </h2>
      {gambar ? (
        <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-md bg-muted">
          <Image src={lampiran.url} alt={`Pratinjau ${lampiran.nama}`} fill unoptimized className="object-contain" />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-strong">
          <Ikon aria-hidden="true" className="size-5" />
        </span>
        <p className="min-w-0 flex-1">
          <span className="block font-bold break-words">{lampiran.nama}</span>
          <span className="block text-sm text-muted-foreground">
            {LABEL_JENIS_LAMPIRAN[lampiran.jenis]} · {formatUkuranFile(lampiran.ukuran)}
          </span>
        </p>
        <a
          href={lampiran.url}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full sm:w-auto")}
        >
          Buka Lampiran
        </a>
      </div>
    </section>
  );
}
