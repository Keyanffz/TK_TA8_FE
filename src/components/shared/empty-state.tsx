import type { CSSProperties, ReactNode } from "react";

import { Bintang } from "@/components/shared/ornamen/bintang";
import { BentukPerisai } from "@/components/shared/ornamen/perisai";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  className?: string;
  /** Versi ringkas di dalam kartu beranda. */
  ringkas?: boolean;
};

/** Perisai logo dengan bintang yang melayang, sebagai ilustrasi keadaan kosong. */
function IlustrasiKosong({ kecil }: { kecil: boolean }) {
  return (
    <div aria-hidden="true" className={cn("relative shrink-0", kecil ? "size-14" : "size-24")}>
      <BentukPerisai className="gerak-napas absolute inset-0 text-primary-soft-strong" />
      <Bintang
        className="gerak-melayang absolute inset-[28%] text-highlight"
        style={{ "--durasi": "5s" } as CSSProperties}
      />
      <Bintang className="gerak-kelip absolute top-0 right-0 size-[22%] text-primary" style={{ "--tunda": "0.8s" } as CSSProperties} />
    </div>
  );
}

export function EmptyState({ judul, deskripsi, aksi, className, ringkas = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-lg border-2 border-dashed border-primary-soft-strong bg-card",
        ringkas ? "items-center px-4 py-4" : "flex-col items-start px-6 py-8 sm:flex-row sm:items-center",
        className,
      )}
    >
      <IlustrasiKosong kecil={ringkas} />
      <div>
        <p className="font-heading font-bold">{judul}</p>
        {deskripsi ? <p className="mt-1 text-sm text-muted-foreground">{deskripsi}</p> : null}
        {aksi ? <div className="mt-4 flex flex-wrap gap-2">{aksi}</div> : null}
      </div>
    </div>
  );
}
