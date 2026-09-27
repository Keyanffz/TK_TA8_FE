"use client";

import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";

import { TombolKwitansi } from "@/components/features/pembayaran/tombol-kwitansi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Paginasi } from "@/components/shared/paginasi";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarPembayaran } from "@/lib/api/pembayaran";
import { LABEL_METODE_BAYAR, LABEL_STATUS_PEMBAYARAN } from "@/lib/constants/label";
import { NADA_STATUS_PEMBAYARAN } from "@/lib/constants/status";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { namaTagihan } from "@/lib/tagihan";
import { cn } from "@/lib/utils";

/** Riwayat pembayaran semua anak wali, dengan kwitansi untuk yang diterima. */
export function PembayaranWali() {
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDaftarPembayaran({ halaman });

  if (isPending) return <Skeleton aria-label="Memuat pembayaran" className="h-60 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  if (data.data.length === 0) {
    return <EmptyState judul="Belum ada pembayaran." deskripsi="Pembayaran yang Anda kirim dari halaman tagihan muncul di sini." />;
  }

  return (
    <div className={cn(isPlaceholderData && "opacity-60")}>
      <ul className="flex flex-col gap-3">
        {data.data.map((bayar) => (
          <li key={bayar.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/dashboard/tagihan/${bayar.tagihan_id}`} className="min-w-0 hover:underline">
                <span className="block font-heading font-bold">{namaTagihan(bayar.tagihan)}</span>
                <span className="block text-sm text-muted-foreground">{bayar.tagihan.murid.nama_panggilan}</span>
              </Link>
              <span className="font-heading text-lg font-extrabold tabular-nums">{formatRupiah(bayar.jumlah)}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {LABEL_METODE_BAYAR[bayar.metode]} · {formatTanggal(bayar.tanggal_bayar)}
            </p>
            {bayar.status === "ditolak" && bayar.alasan_penolakan ? (
              <KotakPesan nada="bahaya" className="mt-3">
                Ditolak: {bayar.alasan_penolakan} Unggah ulang bukti dari halaman tagihan.
              </KotakPesan>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <StatusBadge nada={NADA_STATUS_PEMBAYARAN[bayar.status]}>{LABEL_STATUS_PEMBAYARAN[bayar.status]}</StatusBadge>
              {bayar.status === "diterima" ? <TombolKwitansi id={bayar.id} kode={bayar.kode} /> : null}
            </div>
          </li>
        ))}
      </ul>
      <Paginasi meta={data.meta} onUbah={(nomor) => void setHalaman(nomor)} label="Halaman pembayaran" />
    </div>
  );
}
