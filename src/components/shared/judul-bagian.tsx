import type { ReactNode } from "react";

import { Sulur } from "@/components/shared/ornamen/sulur";
import { cn } from "@/lib/utils";

type JudulBagianProps = {
  id?: string;
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  className?: string;
  /** Untuk section berlatar hijau. */
  terang?: boolean;
};

/** Judul section landing dengan sulur yang digambar saat masuk layar. */
export function JudulBagian({ id, judul, deskripsi, aksi, className, terang }: JudulBagianProps) {
  return (
    <div className={cn("mb-10 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h2 id={id} className={cn("text-xl font-extrabold md:text-2xl", terang && "text-primary-foreground")}>
          {judul}
        </h2>
        <Sulur warnaBatang={terang ? "text-primary-foreground" : "text-primary"} />
        {deskripsi ? (
          <p className={cn("mt-3 max-w-prose", terang ? "text-primary-foreground/90" : "text-muted-foreground")}>
            {deskripsi}
          </p>
        ) : null}
      </div>
      {aksi}
    </div>
  );
}
