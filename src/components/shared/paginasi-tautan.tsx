import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { MetaPaginasi } from "@/types/domain";

/** Pagination berbasis tautan (?page=) untuk halaman publik yang dirender server. */
export function PaginasiTautan({ meta, basePath }: { meta: MetaPaginasi; basePath: string }) {
  if (meta.last_page <= 1) return null;
  const halaman = meta.current_page;
  const href = (nomor: number) => (nomor === 1 ? basePath : `${basePath}?page=${nomor}`);

  return (
    <nav aria-label="Halaman" className="mt-10 flex items-center justify-between gap-4">
      {halaman > 1 ? (
        <Link href={href(halaman - 1)} className={buttonVariants({ variant: "outline" })}>
          <ChevronLeft aria-hidden="true" />
          Sebelumnya
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted-foreground">
        Halaman {halaman} dari {meta.last_page}
      </p>
      {halaman < meta.last_page ? (
        <Link href={href(halaman + 1)} className={buttonVariants({ variant: "outline" })}>
          Berikutnya
          <ChevronRight aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
