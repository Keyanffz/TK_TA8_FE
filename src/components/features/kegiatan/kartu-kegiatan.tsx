import { Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { formatTanggal } from "@/lib/format";
import type { KegiatanKelas } from "@/types/domain";

const KEMIRINGAN = ["-1deg", "0.8deg", "-0.4deg", "1.2deg"] as const;

/** Satu kegiatan di feed: foto utama besar dan dua foto kecil seperti foto cetak yang ditempel. */
export function KartuKegiatan({ kegiatan, indeks, tampilkanKelas }: { kegiatan: KegiatanKelas; indeks: number; tampilkanKelas: boolean }) {
  const [utama, ...lain] = kegiatan.foto;
  const kecil = lain.slice(0, 2);
  const sisa = kegiatan.foto.length - 1 - kecil.length;

  return (
    <Link
      href={`/dashboard/kegiatan/${kegiatan.id}`}
      className="angkat flex h-full flex-col rounded-lg border border-border bg-card p-3 shadow-sm rotate-(--miring) hover:rotate-0"
      style={{ "--miring": KEMIRINGAN[indeks % KEMIRINGAN.length], "--miring-hover": "0deg" } as CSSProperties}
    >
      <span className="grid grid-cols-3 gap-1.5">
        <span className={`relative block overflow-hidden rounded-sm bg-primary-soft ${kecil.length > 0 ? "col-span-2 aspect-[4/3]" : "col-span-3 aspect-[16/9]"}`}>
          {utama ? (
            <Image src={utama.url} alt={utama.caption ?? `Foto ${kegiatan.judul}`} fill unoptimized className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-sm text-primary-strong">
              <Camera aria-hidden="true" className="size-7" />
              Belum ada foto
            </span>
          )}
        </span>
        {kecil.length > 0 ? (
          <span className={`grid gap-1.5 ${kecil.length === 1 ? "grid-rows-1" : "grid-rows-2"}`}>
            {kecil.map((foto, urutan) => (
              <span key={foto.id} className="relative block overflow-hidden rounded-sm bg-primary-soft">
                <Image src={foto.url} alt={foto.caption ?? ""} fill unoptimized className="object-cover" />
                {urutan === kecil.length - 1 && sisa > 0 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-foreground/60 font-heading text-lg font-extrabold text-white">
                    +{sisa}
                  </span>
                ) : null}
              </span>
            ))}
          </span>
        ) : null}
      </span>
      <span className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <time dateTime={kegiatan.tanggal}>{formatTanggal(kegiatan.tanggal)}</time>
        {tampilkanKelas ? <span>· {kegiatan.kelas.nama}</span> : null}
        {kegiatan.tema ? <span className="rounded-full bg-highlight-soft px-2 py-0.5 font-bold text-highlight-foreground">{kegiatan.tema}</span> : null}
      </span>
      <span className="mt-1 font-heading text-lg leading-snug font-bold">{kegiatan.judul}</span>
      {kegiatan.deskripsi ? <span className="mt-1 line-clamp-3 text-sm text-muted-foreground">{kegiatan.deskripsi}</span> : null}
      <span className="mt-auto pt-3 text-xs text-muted-foreground">
        {kegiatan.foto.length} foto · {kegiatan.guru.nama}
      </span>
    </Link>
  );
}
