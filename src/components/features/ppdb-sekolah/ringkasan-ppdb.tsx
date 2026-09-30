"use client";

import Link from "next/link";

import { GalatMuat } from "@/components/shared/galat-muat";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStatusPpdb } from "@/lib/api/ppdb";
import { formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Status PPDB saat ini untuk Kepala Sekolah, dengan tautan ke pengaturan PPDB. */
export function RingkasanPpdb() {
  const { data, isPending, isError, error, refetch } = useStatusPpdb();

  if (isPending) return <Skeleton className="h-28 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  const jadwal = data.tanggal_buka && data.tanggal_tutup ? `${formatTanggal(data.tanggal_buka)} – ${formatTanggal(data.tanggal_tutup)}` : "Jadwal belum diatur";

  return (
    <div className={cn("flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl p-5", data.dibuka ? "bg-primary text-primary-foreground" : "bg-muted")}>
      <div>
        <p className={cn("text-sm", data.dibuka ? "text-primary-foreground/85" : "text-muted-foreground")}>Pendaftaran</p>
        <p className="font-heading text-lg font-extrabold">{data.dibuka ? "Dibuka" : "Ditutup"}</p>
      </div>
      <div>
        <p className={cn("text-sm", data.dibuka ? "text-primary-foreground/85" : "text-muted-foreground")}>Tahun ajaran tujuan</p>
        <p className="font-heading text-lg font-extrabold">{data.tahun_ajaran?.nama ?? "Belum dipilih"}</p>
      </div>
      <div>
        <p className={cn("text-sm", data.dibuka ? "text-primary-foreground/85" : "text-muted-foreground")}>Sisa kuota</p>
        <p className="font-heading text-lg font-extrabold tabular-nums">
          {data.sisa_kuota} dari {data.kuota}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", data.dibuka ? "text-primary-foreground/85" : "text-muted-foreground")}>Jadwal</p>
        <p className="font-bold">{jadwal}</p>
      </div>
      <Link href="/mudarris/pengaturan?tab=ppdb" className={buttonVariants({ variant: data.dibuka ? "terang" : "outline" })}>
        Atur PPDB
      </Link>
    </div>
  );
}
