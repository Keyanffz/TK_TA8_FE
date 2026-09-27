"use client";

import {
  kelasTujuanUntuk,
  penempatanLengkap,
  type Penempatan,
  type StatusKenaikan,
} from "@/components/features/tahun-ajaran/penempatan-kenaikan";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Kelas, KelasDetail } from "@/types/domain";

const LABEL_STATUS: Record<StatusKenaikan, string> = { naik: "Naik kelas", tinggal: "Tinggal kelas", lulus: "Lulus" };
const KELAS_SELECT =
  "h-10 w-full rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive";

type KenaikanPerKelasProps = {
  kelas: KelasDetail;
  kelasTujuan: readonly Kelas[];
  penempatan: ReadonlyMap<number, Penempatan>;
  onUbah: (muridId: number, penempatan: Penempatan) => void;
};

/** Satu kelas asal: status dan kelas tujuan per murid, dengan tombol terapkan ke semua. */
export function KenaikanPerKelas({ kelas, kelasTujuan, penempatan, onUbah }: KenaikanPerKelasProps) {
  const murid = kelas.murid.filter((item) => item.status_kelas === "aktif");

  const ubahStatus = (muridId: number, status: StatusKenaikan) =>
    onUbah(muridId, { status, kelasTujuanId: kelasTujuanUntuk(kelas, kelasTujuan, status) });

  const pilihanKelas = (status: StatusKenaikan) =>
    kelasTujuan.filter((item) => (status === "naik" ? item.tingkat === "B" : true));

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <h3 className="font-heading text-lg font-extrabold">{kelas.nama}</h3>
          <p className="text-sm text-muted-foreground">{murid.length} murid aktif</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="self-center text-muted-foreground">Semua murid:</span>
          {(["naik", "tinggal", "lulus"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => murid.forEach((item) => ubahStatus(item.id, status))}
              className="min-h-10 rounded-full border border-input px-3 font-heading font-bold hover:bg-primary-soft"
            >
              {LABEL_STATUS[status]}
            </button>
          ))}
        </div>
      </header>
      {murid.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Tidak ada murid aktif di kelas ini.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Murid</TableHead>
              <TableHead className="w-44">Status</TableHead>
              <TableHead className="w-48">Kelas tujuan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {murid.map((item) => {
              const nilai = penempatan.get(item.id);
              if (!nilai) return null;
              const kurang = !penempatanLengkap(nilai);
              return (
                <TableRow key={item.id} className={cn(kurang && "bg-status-bahaya-soft/50")}>
                  <TableCell>
                    <p className="font-bold">{item.nama_lengkap}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{item.nis}</p>
                  </TableCell>
                  <TableCell>
                    <select
                      aria-label={`Status ${item.nama_panggilan}`}
                      value={nilai.status}
                      onChange={(event) => {
                        const status = (["naik", "tinggal", "lulus"] as const).find((s) => s === event.target.value);
                        if (status) ubahStatus(item.id, status);
                      }}
                      className={KELAS_SELECT}
                    >
                      {(["naik", "tinggal", "lulus"] as const).map((status) => (
                        <option key={status} value={status}>
                          {LABEL_STATUS[status]}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    {nilai.status === "lulus" ? (
                      <span className="text-sm text-muted-foreground">Tidak perlu kelas</span>
                    ) : (
                      <select
                        aria-label={`Kelas tujuan ${item.nama_panggilan}`}
                        aria-invalid={kurang ? true : undefined}
                        value={nilai.kelasTujuanId ?? ""}
                        onChange={(event) =>
                          onUbah(item.id, { status: nilai.status, kelasTujuanId: event.target.value ? Number(event.target.value) : null })
                        }
                        className={KELAS_SELECT}
                      >
                        <option value="">Pilih kelas</option>
                        {pilihanKelas(nilai.status).map((tujuan) => (
                          <option key={tujuan.id} value={tujuan.id}>
                            {tujuan.nama}
                          </option>
                        ))}
                      </select>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
