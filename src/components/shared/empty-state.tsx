import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  className?: string;
};

export function EmptyState({ judul, deskripsi, aksi, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-lg border border-dashed border-input bg-card px-6 py-10", className)}>
      <p className="font-semibold">{judul}</p>
      {deskripsi ? <p className="mt-1 text-sm text-muted-foreground">{deskripsi}</p> : null}
      {aksi ? <div className="mt-4">{aksi}</div> : null}
    </div>
  );
}
