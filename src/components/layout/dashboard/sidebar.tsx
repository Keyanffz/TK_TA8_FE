"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";

import { DaftarMenu } from "@/components/layout/dashboard/daftar-menu";
import { LogoSekolah } from "@/components/shared/logo-sekolah";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils";

type SidebarProps = {
  namaSekolah: string;
  logoUrl: string | null;
  ciut: boolean;
  onUbahCiut: () => void;
};

export function Sidebar({ namaSekolah, logoUrl, ciut, onUbahCiut }: SidebarProps) {
  const { beranda } = useSession();
  return (
    // Pembungkus hijau ikut setinggi halaman; isi menu menempel di layar saat digulir.
    <div className={cn("hidden shrink-0 bg-primary transition-[width] duration-200 lg:block", ciut ? "w-20" : "w-64")}>
    <aside className="sticky top-0 isolate flex h-dvh flex-col overflow-hidden text-primary-foreground">
      <PolaGeometri className="-z-10 text-primary-foreground/[0.06]" />
      <Link href={beranda} className={cn("flex h-16 shrink-0 items-center gap-3 px-4", ciut && "justify-center px-0")}>
        <span className="rounded-full bg-card p-0.5">
          <LogoSekolah logoUrl={logoUrl} namaSekolah={namaSekolah} ukuran={40} className="size-10" />
        </span>
        <span className={cn("font-heading leading-tight font-extrabold", ciut && "sr-only")}>{namaSekolah}</span>
      </Link>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <DaftarMenu ciut={ciut} />
      </div>
      <button
        type="button"
        onClick={onUbahCiut}
        aria-label={ciut ? "Lebarkan menu" : "Ciutkan menu"}
        className={cn(
          "flex min-h-12 shrink-0 items-center gap-3 border-t border-primary-foreground/20 px-6 font-heading text-sm font-bold hover:bg-primary-foreground/15",
          ciut && "justify-center px-0",
        )}
      >
        {ciut ? <PanelLeftOpen aria-hidden="true" className="size-5" /> : <PanelLeftClose aria-hidden="true" className="size-5" />}
        <span className={cn(ciut && "sr-only")}>Ciutkan menu</span>
      </button>
    </aside>
    </div>
  );
}
