import type { CSSProperties, ReactNode } from "react";

import { TaburanBintang, type PosisiBintang } from "@/components/shared/ornamen/bintang";
import { PolaGeometri } from "@/components/shared/ornamen/pola-geometri";
import { TepiBergelombang } from "@/components/shared/ornamen/tepi-bergelombang";
import { formatTanggal } from "@/lib/format";
import { hariIniJakarta } from "@/lib/tanggal";

const BINTANG_SAPAAN: readonly PosisiBintang[] = [
  { x: 70, y: 18, ukuran: 12, gerak: "kelip", tunda: 0 },
  { x: 86, y: 52, ukuran: 16, gerak: "melayang", tunda: 0.8 },
  { x: 95, y: 20, ukuran: 9, gerak: "kelip", tunda: 1.5 },
  { x: 58, y: 70, ukuran: 8, gerak: "kelip", tunda: 2.2 },
];

type SapaanBerandaProps = {
  nama: string;
  keterangan?: ReactNode;
  /** Isi tambahan di dalam blok hijau, misalnya kartu anak. */
  children?: ReactNode;
};

/** Blok hijau di puncak beranda: salam, tanggal hari ini, dan isi utama role. */
export function SapaanBeranda({ nama, keterangan, children }: SapaanBerandaProps) {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <PolaGeometri className="-z-10 text-primary-foreground/[0.07]" />
      <TaburanBintang bintang={BINTANG_SAPAAN} className="-z-10" />
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-4 sm:px-6 lg:px-8 lg:pt-8">
        <p className="gerak-masuk-naik text-sm text-primary-foreground/90">{formatTanggal(hariIniJakarta())}</p>
        <h1 className="gerak-masuk-naik mt-1 text-xl leading-tight font-extrabold" style={{ "--i": 1 } as CSSProperties}>
          Assalamu&apos;alaikum, {nama}
        </h1>
        {keterangan ? (
          <p className="gerak-masuk-naik mt-1 text-primary-foreground/95" style={{ "--i": 2 } as CSSProperties}>
            {keterangan}
          </p>
        ) : null}
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
      <TepiBergelombang className="text-background" />
    </section>
  );
}
