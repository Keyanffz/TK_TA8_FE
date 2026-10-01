"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { formatBulan } from "@/lib/format";
import { bulanJakarta, geserBulan } from "@/lib/tanggal";

const POLA_BULAN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Bulan dari `?bulan=YYYY-MM`, bawaan bulan berjalan; bulan yang belum datang tidak bisa dipilih. */
export function useBulanDipilih(): { bulan: string; bulanIni: string; setBulan: (bulan: string) => void } {
  const [bulanUrl, setBulanUrl] = useQueryState("bulan", parseAsString);
  const bulanIni = bulanJakarta();
  const bulan = bulanUrl && POLA_BULAN.test(bulanUrl) && bulanUrl <= bulanIni ? bulanUrl : bulanIni;
  return { bulan, bulanIni, setBulan: (tujuan) => void setBulanUrl(tujuan === bulanIni ? null : tujuan) };
}

export function PilihBulan({ bulan, bulanIni, onUbah }: { bulan: string; bulanIni: string; onUbah: (bulan: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" aria-label="Bulan sebelumnya" onClick={() => onUbah(geserBulan(bulan, -1))}>
        <ChevronLeft aria-hidden="true" />
      </Button>
      <p aria-live="polite" className="min-w-40 text-center font-heading font-bold">
        {formatBulan(bulan)}
      </p>
      <Button variant="outline" size="icon" aria-label="Bulan berikutnya" disabled={bulan >= bulanIni} onClick={() => onUbah(geserBulan(bulan, 1))}>
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  );
}
