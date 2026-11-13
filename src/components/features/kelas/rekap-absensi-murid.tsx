"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PilihBulan, useBulanDipilih } from "@/components/features/absensi/pilih-bulan";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ambilEksporAbsensiMurid, useRekapAbsensiMurid } from "@/lib/api/absensi-murid";
import { pesanError } from "@/lib/api/errors";
import { simpanBlob, slugNamaBerkas } from "@/lib/api/unduh";
import { cn } from "@/lib/utils";

const KOLOM = [
  { kunci: "hadir", label: "Hadir" },
  { kunci: "izin", label: "Izin" },
  { kunci: "sakit", label: "Sakit" },
  { kunci: "alpa", label: "Alpa" },
] as const;

const EKSPOR = [
  { format: "xlsx", label: "Unduh Excel" },
  { format: "pdf", label: "Unduh PDF" },
] as const;

/** Jumlah hadir, izin, sakit, dan alpa per murid dalam satu bulan, dengan ekspor Excel dan PDF. */
export function RekapAbsensiMurid({ kelasId, namaKelas }: { kelasId: number; namaKelas: string }) {
  const { bulan, bulanIni, setBulan } = useBulanDipilih();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useRekapAbsensiMurid(kelasId, bulan);
  const [mengunduh, setMengunduh] = useState<"xlsx" | "pdf" | null>(null);

  const unduh = async (format: "xlsx" | "pdf") => {
    setMengunduh(format);
    try {
      simpanBlob(await ambilEksporAbsensiMurid(kelasId, bulan, format), `absensi-murid-${slugNamaBerkas(namaKelas)}-${bulan}.${format}`);
    } catch (galat) {
      toast.error(pesanError(galat));
    } finally {
      setMengunduh(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PilihBulan bulan={bulan} bulanIni={bulanIni} onUbah={setBulan} />
        <div className="flex flex-wrap gap-2">
          {EKSPOR.map(({ format, label }) => (
            <Button key={format} variant="outline" disabled={mengunduh !== null || !data || data.murid.length === 0} onClick={() => void unduh(format)}>
              <Download aria-hidden="true" />
              {mengunduh === format ? "Menyiapkan..." : label}
            </Button>
          ))}
        </div>
      </div>
      {isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.murid.length === 0 ? (
        <EmptyState judul="Belum ada murid di kelas ini." />
      ) : (
        <div className={cn("flex flex-col gap-2", isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground">{data.hari_tercatat} hari tercatat bulan ini.</p>
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  {KOLOM.map(({ kunci, label }) => (
                    <TableHead key={kunci} className="text-center">
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.murid.map((baris) => (
                  <TableRow key={baris.murid.id}>
                    <TableCell className="font-bold">{baris.murid.nama_lengkap}</TableCell>
                    {KOLOM.map(({ kunci }) => (
                      <TableCell key={kunci} className="text-center tabular-nums">
                        {baris[kunci]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
