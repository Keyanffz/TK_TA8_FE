import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { AngkaNaik } from "@/components/shared/angka-naik";
import { Muncul } from "@/components/shared/muncul";
import { formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

type PitaPpdbProps = {
  tahunAjaran: string | null;
  tanggalTutup: string | null;
  kuota: number;
  sisaKuota: number;
};

const JUMLAH_BENDERA = 24;

/** Deretan bendera segitiga (umbul-umbul) yang berayun pelan di atas pita. */
function UmbulUmbul() {
  return (
    <div aria-hidden="true" className="flex h-5 justify-between overflow-hidden px-1">
      {Array.from({ length: JUMLAH_BENDERA }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 22"
          className={cn("gerak-ayun h-5 w-5 shrink-0", i % 2 === 0 ? "text-primary" : "text-card")}
          style={{ "--tunda": `${(i % 6) * 0.25}s` } as CSSProperties}
        >
          <path d="M0 0 H20 L10 22 Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

/** Ditampilkan hanya saat PPDB dibuka. */
export function PitaPpdb({ tahunAjaran, tanggalTutup, kuota, sisaKuota }: PitaPpdbProps) {
  const judul = tahunAjaran ? `PPDB Tahun Ajaran ${tahunAjaran} dibuka` : "PPDB dibuka";

  return (
    <section aria-label="Info PPDB" className="bg-highlight text-highlight-foreground">
      <UmbulUmbul />
      <Muncul
        efek="pop"
        className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div>
          <p className="font-heading text-lg font-extrabold">{judul}</p>
          <p className="text-sm">
            {tanggalTutup ? `Pendaftaran sampai ${formatTanggal(tanggalTutup)}.` : "Pendaftaran lewat dashboard wali murid."}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {sisaKuota > 0 ? (
            <p className="flex items-baseline gap-2">
              <AngkaNaik nilai={sisaKuota} className="font-heading text-2xl leading-none font-extrabold" />
              <span className="text-sm">
                tempat tersisa
                <br />
                dari {kuota}
              </span>
            </p>
          ) : (
            <p className="text-sm font-bold">Kuota sudah penuh.</p>
          )}
          <Link
            href="/ppdb"
            className="group inline-flex items-center gap-1 rounded-md bg-primary-deep px-4 py-3 font-heading text-sm font-bold text-primary-foreground"
          >
            Lihat Info PPDB
            <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Muncul>
    </section>
  );
}
