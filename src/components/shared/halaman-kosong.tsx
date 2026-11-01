import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { Bintang, TaburanBintang, type PosisiBintang } from "@/components/shared/ornamen/bintang";
import { OrbitLogo } from "@/components/shared/ornamen/orbit-logo";
import { BentukPerisai } from "@/components/shared/ornamen/perisai";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { TepiBergelombang } from "@/components/shared/ornamen/tepi-bergelombang";
import { cn } from "@/lib/utils";

const BINTANG_PANEL: readonly PosisiBintang[] = [
  { x: 86, y: 14, ukuran: 14, gerak: "kelip", tunda: 0 },
  { x: 94, y: 52, ukuran: 11, gerak: "melayang", tunda: 0.7 },
  { x: 72, y: 74, ukuran: 9, gerak: "kelip", tunda: 1.6 },
  { x: 52, y: 24, ukuran: 10, gerak: "kelip", tunda: 2.3 },
];

type HalamanKosongProps = {
  /** Teks kecil di atas judul: kode 404 atau sumber masalah. */
  label: string;
  judul: string;
  deskripsi: string;
  ikon: LucideIcon;
  aksi: ReactNode;
  /** Keterangan di bawah tombol, misalnya kode kejadian. */
  children?: ReactNode;
  /** Satu layar penuh seperti halaman masuk, untuk halaman yang tidak punya navbar atau menu. */
  penuh?: boolean;
  /** h2 kalau tampil di halaman yang sudah punya judul sendiri, misalnya error kamera di halaman Absensi. */
  tagJudul?: "h1" | "h2";
  /** Kelas tambahan untuk pembungkus terluar, misalnya jarak yang lebih rapat di tengah halaman lain. */
  className?: string;
};

/**
 * Tampilan 404 dan error. Di dalam layout publik atau dashboard: ikon masalah di perisai logo, di samping pesan.
 * Satu layar penuh: ikon di tengah sembilan bintang pada panel hijau, di kiri (desktop) atau di atas (HP).
 */
export function HalamanKosong({ label, judul, deskripsi, ikon: Ikon, aksi, children, penuh = false, tagJudul: Judul = "h1", className }: HalamanKosongProps) {
  const isi = (
    <div>
      <p className="font-heading text-sm font-bold text-primary-strong">{label}</p>
      <Judul className="mt-1 text-xl leading-tight font-extrabold">{judul}</Judul>
      <p className="mt-2 text-muted-foreground">{deskripsi}</p>
      <div className="mt-5 flex flex-wrap gap-2">{aksi}</div>
      {children}
    </div>
  );

  if (!penuh) {
    return (
      <div className={cn("mx-auto flex max-w-xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center", className)}>
        <div aria-hidden="true" className="relative size-28 shrink-0">
          <BentukPerisai className="gerak-putar absolute inset-0 text-primary-soft-strong" style={{ "--durasi": "60s" } as CSSProperties} />
          <Ikon strokeWidth={1.75} className="absolute top-1/2 left-1/2 size-[40%] -translate-1/2 text-primary-strong" />
          <Bintang className="gerak-kelip absolute top-0 right-0 size-[22%] text-highlight" />
        </div>
        {isi}
      </div>
    );
  }

  return (
    <div className={cn("grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1", className)}>
      <div className="relative isolate overflow-hidden bg-primary lg:flex lg:items-center lg:justify-center">
        <PolaGeometri className="-z-10 text-primary-foreground/[0.08]" />
        <TaburanBintang bintang={BINTANG_PANEL} className="-z-10" />
        <OrbitLogo className="gerak-masuk mx-4 mt-6 w-28 sm:mx-6 lg:m-10 lg:w-full lg:max-w-72">
          <div aria-hidden="true" className="flex size-full items-center justify-center">
            <Ikon strokeWidth={1.75} className="size-[52%] text-primary-strong" />
          </div>
        </OrbitLogo>
        <TepiBergelombang className="mt-2 text-background lg:hidden" />
      </div>
      <main className="flex flex-col px-4 py-8 sm:px-6 lg:justify-center lg:px-12 lg:py-16">
        <div className="max-w-lg">{isi}</div>
      </main>
    </div>
  );
}
