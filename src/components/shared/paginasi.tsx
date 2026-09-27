"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MetaPaginasi } from "@/types/domain";

type PaginasiProps = { meta: MetaPaginasi; onUbah: (halaman: number) => void; label: string };

/** Sebelumnya/berikutnya untuk daftar di dashboard; halaman disimpan di query string (`?page=`). */
export function Paginasi({ meta, onUbah, label }: PaginasiProps) {
  if (meta.last_page <= 1) return null;
  return (
    <nav aria-label={label} className="mt-4 flex items-center justify-between gap-3">
      <Button variant="outline" disabled={meta.current_page <= 1} onClick={() => onUbah(meta.current_page - 1)}>
        <ChevronLeft aria-hidden="true" />
        Sebelumnya
      </Button>
      <p className="text-sm text-muted-foreground">
        Halaman {meta.current_page} dari {meta.last_page} ({meta.total} data)
      </p>
      <Button variant="outline" disabled={meta.current_page >= meta.last_page} onClick={() => onUbah(meta.current_page + 1)}>
        Berikutnya
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
