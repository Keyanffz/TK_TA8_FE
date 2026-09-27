import type { ReactNode } from "react";

import { KELAS_NADA, type NadaStatus } from "@/lib/constants/status";
import { cn } from "@/lib/utils";

/** Satu badge status untuk semua modul; warna dari lib/constants/status.ts. */
export function StatusBadge({ nada, children, className }: { nada: NadaStatus; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap", KELAS_NADA[nada], className)}>
      {children}
    </span>
  );
}
