import { BookOpenText, Download } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { formatTanggal } from "@/lib/format";
import type { Rapor } from "@/types/domain";

/** Rapor terbit terbaru anak, dengan unduhan PDF lewat proxy (B6). */
export function KartuRapor({ rapor }: { rapor: Rapor }) {
  const periode = [`Semester ${rapor.semester}`, rapor.tahun_ajaran?.nama].filter(Boolean).join(" · ");

  return (
    <section aria-labelledby="judul-rapor" className="group flex flex-col gap-4 rounded-xl bg-highlight p-5 text-highlight-foreground shadow-sm sm:flex-row sm:items-center">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-card text-primary-strong transition-transform duration-300 group-hover:-rotate-12">
        <BookOpenText aria-hidden="true" className="size-7" />
      </span>
      <div className="flex-1">
        <h2 id="judul-rapor" className="text-lg font-extrabold">
          Rapor terbaru sudah terbit
        </h2>
        <p className="text-sm">
          {periode}
          {rapor.terbit_at ? ` · terbit ${formatTanggal(rapor.terbit_at)}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/proxy/rapor/${rapor.id}/pdf`}
          className={buttonVariants({ variant: "default" })}
          download
        >
          <Download aria-hidden="true" />
          Unduh PDF
        </a>
        <Link href={`/dashboard/rapor/${rapor.id}`} className={buttonVariants({ variant: "outline" })}>
          Lihat Rapor
        </Link>
      </div>
    </section>
  );
}
