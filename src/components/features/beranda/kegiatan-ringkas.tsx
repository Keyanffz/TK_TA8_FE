import { Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatTanggal } from "@/lib/format";
import type { KegiatanKelas } from "@/types/domain";

const KEMIRINGAN = ["-1.5deg", "1deg", "-0.5deg"] as const;

/**
 * Kegiatan kelas terbaru sebagai foto cetak yang sedikit miring. Di HP bisa
 * digeser ke samping. Foto memakai signed URL (tanpa optimasi gambar Next).
 */
export function KegiatanRingkas({ kegiatan, tampilkanKelas = false }: { kegiatan: KegiatanKelas[]; tampilkanKelas?: boolean }) {
  if (kegiatan.length === 0) {
    return <EmptyState ringkas judul="Belum ada kegiatan kelas." deskripsi="Foto dan cerita kegiatan dari guru muncul di sini." />;
  }
  return (
    <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pt-1 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
      {kegiatan.map((item, indeks) => {
        const foto = item.foto?.[0];
        return (
          <li key={item.id} className="w-56 shrink-0 snap-start sm:w-auto">
            <Link
              href={`/dashboard/kegiatan/${item.id}`}
              className="angkat flex h-full flex-col rounded-md border border-border bg-card p-2 shadow-sm rotate-(--miring) hover:rotate-0"
              style={{ "--miring": KEMIRINGAN[indeks % KEMIRINGAN.length], "--miring-hover": "0deg" } as CSSProperties}
            >
              <span className="relative block aspect-[4/3] overflow-hidden rounded-sm bg-primary-soft">
                {foto ? (
                  <Image src={foto.url} alt={foto.caption ?? ""} fill unoptimized className="object-cover" />
                ) : (
                  <Camera aria-hidden="true" className="absolute inset-0 m-auto size-8 text-primary-strong/50" />
                )}
                {item.foto && item.foto.length > 1 ? (
                  <span className="absolute right-1.5 bottom-1.5 rounded-full bg-foreground/75 px-2 py-0.5 text-xs font-bold text-white">
                    {item.foto.length} foto
                  </span>
                ) : null}
              </span>
              <span className="mt-2 px-1 text-xs text-muted-foreground">
                {formatTanggal(item.tanggal)}
                {tampilkanKelas && item.kelas ? ` · ${item.kelas.nama}` : ""}
              </span>
              <span className="px-1 pb-1 font-heading leading-snug font-bold">{item.judul}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
