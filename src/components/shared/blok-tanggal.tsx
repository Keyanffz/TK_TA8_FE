import { bagianTanggal } from "@/lib/format";

/** Tanggal berbentuk sobekan kalender untuk daftar agenda. */
export function BlokTanggal({ tanggal }: { tanggal: string }) {
  const { hari, bulan } = bagianTanggal(tanggal);
  return (
    <div aria-hidden="true" className="w-14 shrink-0 overflow-hidden rounded-md border border-border bg-card text-center">
      <p className="bg-primary py-0.5 text-xs font-semibold text-primary-foreground uppercase">{bulan}</p>
      <p className="py-1 font-heading text-lg font-semibold">{hari}</p>
    </div>
  );
}
