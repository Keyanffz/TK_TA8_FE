import type { CSSProperties } from "react";

import { LABEL_STATUS_RAPOR } from "@/lib/constants/label";
import { cn } from "@/lib/utils";
import type { StatusRapor } from "@/types/domain";

// Warna batang per status. Tiap baris berlabel dan berangka, jadi warna
// bukan satu-satunya pembeda.
const URUTAN: readonly { status: StatusRapor; batang: string }[] = [
  { status: "terbit", batang: "bg-primary" },
  { status: "diajukan", batang: "bg-status-proses" },
  { status: "revisi", batang: "bg-chart-2" },
  { status: "draft", batang: "bg-input" },
];

type ProgresRaporProps = { progres: Record<StatusRapor, number> & { total: number } };

/** Progres rapor kelas guru (B5): satu batang per status terhadap total murid. */
export function ProgresRapor({ progres }: ProgresRaporProps) {
  const belumDibuat = Math.max(progres.total - progres.draft - progres.diajukan - progres.revisi - progres.terbit, 0);

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {progres.terbit} dari {progres.total} rapor sudah terbit
        {belumDibuat > 0 ? `, ${belumDibuat} belum dibuat` : ""}.
      </p>
      <ul className="mt-4 space-y-3">
        {URUTAN.map(({ status, batang }, indeks) => {
          const persen = progres.total > 0 ? (progres[status] / progres.total) * 100 : 0;
          return (
            <li key={status} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3 text-sm">
              <span className="font-bold">{LABEL_STATUS_RAPOR[status]}</span>
              <span className="h-3 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn("gerak-tumbuh block h-full origin-left rounded-full", batang)}
                  style={{ width: `${persen}%`, "--i": indeks } as CSSProperties}
                />
              </span>
              <span className="text-right font-bold tabular-nums">{progres[status]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
