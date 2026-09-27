import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelBerandaProps = {
  judul: string;
  tautan?: { href: string; label: string };
  className?: string;
  children: ReactNode;
};

/** Kartu bagian beranda: judul, tautan "lihat semua", dan isi. */
export function PanelBeranda({ judul, tautan, className, children }: PanelBerandaProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">{judul}</h2>
        {tautan ? (
          <Link
            href={tautan.href}
            className="group inline-flex min-h-11 items-center gap-1 font-heading text-sm font-bold text-primary-strong hover:underline"
          >
            {tautan.label}
            <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
