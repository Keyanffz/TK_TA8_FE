import { bagianTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Tanggal berbentuk sobekan kalender untuk daftar agenda. */
export function BlokTanggal({ tanggal, className }: { tanggal: string; className?: string }) {
  const { hari, bulan } = bagianTanggal(tanggal);
  return (
    <div
      aria-hidden="true"
      className={cn("w-14 shrink-0 overflow-hidden rounded-md border-2 border-primary bg-card text-center shadow-sm", className)}
    >
      <p className="bg-primary py-0.5 font-heading text-xs font-bold text-primary-foreground uppercase">{bulan}</p>
      <p className="py-0.5 font-heading text-xl font-extrabold text-primary-strong">{hari}</p>
    </div>
  );
}
