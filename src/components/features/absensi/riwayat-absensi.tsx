"use client";

import { DaftarAbsensiHarian } from "@/components/features/absensi/daftar-absensi-harian";
import { PilihBulan, useBulanDipilih } from "@/components/features/absensi/pilih-bulan";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Skeleton } from "@/components/ui/skeleton";
import { kelompokkanPerHari } from "@/lib/absensi";
import { useRiwayatAbsensi } from "@/lib/api/absensi";
import { LABEL_STATUS_ABSENSI, OPSI_STATUS_ABSENSI } from "@/lib/constants/label";
import { formatBulan } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Riwayat absensi milik pengguna yang login, per bulan. */
export function RiwayatAbsensi() {
  const { bulan, bulanIni, setBulan } = useBulanDipilih();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useRiwayatAbsensi(bulan, null);

  return (
    <div className="flex flex-col gap-4">
      <PilihBulan bulan={bulan} bulanIni={bulanIni} onUbah={setBulan} />

      {isPending ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState judul={`Belum ada absensi di ${formatBulan(bulan)}.`} deskripsi="Absensi muncul di sini setelah Anda absen masuk atau pulang." />
      ) : (
        <div className={cn("flex flex-col gap-4", isPlaceholderData && "opacity-60")}>
          <dl className="grid grid-cols-3 gap-2">
            {OPSI_STATUS_ABSENSI.map(({ nilai }) => (
              <div key={nilai} className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
                <dt className="text-sm text-muted-foreground">{LABEL_STATUS_ABSENSI[nilai]}</dt>
                <dd className="font-heading text-lg font-extrabold tabular-nums">{data.filter((satu) => satu.status === nilai).length}</dd>
              </div>
            ))}
          </dl>
          <DaftarAbsensiHarian hari={kelompokkanPerHari(data)} />
        </div>
      )}
    </div>
  );
}
