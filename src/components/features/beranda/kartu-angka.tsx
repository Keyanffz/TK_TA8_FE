import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { AngkaNaik } from "@/components/shared/angka-naik";
import { cn } from "@/lib/utils";

type KartuAngkaProps = {
  label: string;
  nilai: number;
  ikon: LucideIcon;
  urutan: number;
  className?: string;
};

/** Satu angka ringkasan yang menghitung naik saat beranda dimuat. */
export function KartuAngka({ label, nilai, ikon: Ikon, urutan, className }: KartuAngkaProps) {
  return (
    <div
      className={cn("gerak-masuk group rounded-xl border border-border bg-card p-4 shadow-sm", className)}
      style={{ "--i": urutan } as CSSProperties}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary-strong transition-transform duration-300 group-hover:-rotate-12">
        <Ikon aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <AngkaNaik nilai={nilai} className="font-heading text-xl leading-tight font-extrabold" />
    </div>
  );
}
