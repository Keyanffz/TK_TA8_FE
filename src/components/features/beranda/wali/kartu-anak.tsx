import Image from "next/image";
import type { CSSProperties } from "react";

import { AvatarInisial } from "@/components/shared/avatar-inisial";
import { Bintang } from "@/components/shared/ornamen/bintang";
import { GAYA_MASKER_PERISAI } from "@/components/shared/ornamen/perisai";
import { LABEL_HUBUNGAN } from "@/lib/constants/label";
import type { Hubungan } from "@/types/domain";

type KartuAnakProps = {
  namaPanggilan: string;
  namaLengkap?: string;
  kelas: string | null;
  fotoUrl: string | null;
  hubungan?: Hubungan | null;
};

/**
 * Kartu anak aktif di blok hijau beranda wali: foto berbingkai perisai logo.
 * Tampil dari data sesi dulu, lalu dilengkapi data beranda.
 */
export function KartuAnak({ namaPanggilan, namaLengkap, kelas, fotoUrl, hubungan }: KartuAnakProps) {
  return (
    <div className="gerak-masuk flex items-center gap-4" style={{ "--i": 2 } as CSSProperties}>
      <div className="group relative size-20 shrink-0 sm:size-24">
        <div className="size-full bg-card p-1 transition-[rotate] duration-500 group-hover:rotate-45" style={GAYA_MASKER_PERISAI}>
          <div className="relative size-full transition-[rotate] duration-500 group-hover:-rotate-45" style={GAYA_MASKER_PERISAI}>
            {fotoUrl ? (
              <Image src={fotoUrl} alt="" fill unoptimized className="object-cover" />
            ) : (
              <AvatarInisial nama={namaLengkap ?? namaPanggilan} className="size-full text-xl" />
            )}
          </div>
        </div>
        <Bintang className="gerak-kelip absolute -top-1 -right-1 size-6" />
      </div>
      <div className="min-w-0">
        <p className="font-heading text-2xl leading-none font-extrabold">{namaPanggilan}</p>
        {namaLengkap ? <p className="mt-1 truncate text-sm text-primary-foreground/90">{namaLengkap}</p> : null}
        <p className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-highlight px-2.5 py-0.5 text-highlight-foreground">{kelas ?? "Belum ada kelas"}</span>
          {hubungan ? (
            <span className="rounded-full bg-primary-foreground/15 px-2.5 py-0.5">Anda: {LABEL_HUBUNGAN[hubungan]}</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
