"use client";

import { KELAS_NADA, NADA_JENIS_AGENDA } from "@/lib/constants/status";
import { hariDalamBulan, hariIniJakarta } from "@/lib/tanggal";
import { cn } from "@/lib/utils";
import type { Agenda } from "@/types/domain";

const NAMA_HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;
const LABEL_PER_HARI = 2;
// Titik di HP; warnanya sama dengan badge jenis agenda (NADA_JENIS_AGENDA).
const TITIK_JENIS: Record<Agenda["jenis"], string> = {
  kegiatan: "bg-status-sukses",
  libur: "bg-status-bahaya",
  rapat: "bg-status-proses",
  lainnya: "bg-status-netral",
};

type KalenderAgendaProps = {
  bulan: string;
  agenda: Agenda[];
  hariDipilih: string | null;
  onPilihHari: (tanggal: string | null) => void;
};

/** Kalender bulanan, Senin di kiri. Agenda beberapa hari ditandai di setiap harinya. */
export function KalenderAgenda({ bulan, agenda, hariDipilih, onPilihHari }: KalenderAgendaProps) {
  const { tanggal, geserAwal } = hariDalamBulan(bulan);
  const hariIni = hariIniJakarta();

  return (
    <div className="rounded-xl border border-border bg-card p-2 shadow-sm sm:p-4">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground" aria-hidden="true">
        {NAMA_HARI.map((hari) => (
          <span key={hari} className={cn("py-1", hari === "Min" && "text-destructive")}>
            {hari}
          </span>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-1">
        {tanggal.map((satu, indeks) => {
          const hariItu = agenda.filter((item) => item.tanggal_mulai <= satu && item.tanggal_selesai >= satu);
          const dipilih = hariDipilih === satu;
          const nomor = Number(satu.slice(-2));
          return (
            <li key={satu} style={indeks === 0 ? { gridColumnStart: geserAwal + 1 } : undefined}>
              <button
                type="button"
                onClick={() => onPilihHari(dipilih ? null : satu)}
                aria-pressed={dipilih}
                aria-label={`${nomor}${hariItu.length > 0 ? `, ${hariItu.map((item) => item.judul).join(", ")}` : ", tanpa agenda"}`}
                className={cn(
                  "flex h-14 w-full flex-col items-stretch gap-0.5 rounded-md border p-1 text-left transition-colors duration-150 sm:h-24",
                  dipilih ? "border-primary bg-primary-soft" : hariItu.length > 0 ? "border-border hover:border-primary" : "border-transparent bg-muted/40 hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                    satu === hariIni ? "bg-primary text-primary-foreground" : (indeks + geserAwal) % 7 === 6 ? "text-destructive" : undefined,
                  )}
                >
                  {nomor}
                </span>
                <span className="flex gap-0.5 sm:hidden" aria-hidden="true">
                  {hariItu.slice(0, 3).map((item) => (
                    <span key={item.id} className={cn("size-1.5 rounded-full", TITIK_JENIS[item.jenis])} />
                  ))}
                </span>
                <span className="hidden flex-col gap-0.5 sm:flex" aria-hidden="true">
                  {hariItu.slice(0, LABEL_PER_HARI).map((item) => (
                    <span key={item.id} className={cn("truncate rounded-sm px-1 text-xs leading-4 font-bold", KELAS_NADA[NADA_JENIS_AGENDA[item.jenis]])}>
                      {item.judul}
                    </span>
                  ))}
                  {hariItu.length > LABEL_PER_HARI ? <span className="px-1 text-xs text-muted-foreground">+{hariItu.length - LABEL_PER_HARI} lagi</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
