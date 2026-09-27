import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { formatTanggal } from "@/lib/format";

type PitaPpdbProps = {
  tahunAjaran: string | null;
  tanggalTutup: string | null;
  kuota: number;
  sisaKuota: number;
};

/** Ditampilkan hanya saat PPDB dibuka. */
export function PitaPpdb({ tahunAjaran, tanggalTutup, kuota, sisaKuota }: PitaPpdbProps) {
  const judul = tahunAjaran ? `PPDB Tahun Ajaran ${tahunAjaran} dibuka` : "PPDB dibuka";
  const kuotaTeks = sisaKuota > 0 ? `Sisa ${sisaKuota} dari ${kuota} tempat.` : "Kuota sudah penuh.";

  return (
    <section aria-label="Info PPDB" className="bg-highlight text-highlight-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm">
          <span className="font-semibold">{judul}</span>
          {tanggalTutup ? ` sampai ${formatTanggal(tanggalTutup)}.` : "."} {kuotaTeks}
        </p>
        <Link href="/ppdb" className="inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4">
          Lihat Info PPDB
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
