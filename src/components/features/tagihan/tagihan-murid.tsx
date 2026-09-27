"use client";

import Link from "next/link";

import { GalatMuat } from "@/components/shared/galat-muat";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarTagihan } from "@/lib/api/tagihan";
import { LABEL_STATUS_TAGIHAN } from "@/lib/constants/label";
import { NADA_STATUS_TAGIHAN } from "@/lib/constants/status";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { namaTagihan, tagihanTerbuka } from "@/lib/tagihan";

const JUMLAH_TAMPIL = 8;

/** Tagihan terbaru di detail murid (B4); daftar lengkap lewat halaman Tagihan. */
export function TagihanMurid({ muridId }: { muridId: number }) {
  const { data, isPending, isError, error, refetch } = useDaftarTagihan({ halaman: 1, muridId, perHalaman: JUMLAH_TAMPIL });

  return (
    <section aria-labelledby="judul-tagihan-murid" className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="judul-tagihan-murid" className="text-lg font-extrabold">
          Tagihan
        </h2>
        {data && data.meta.total > JUMLAH_TAMPIL ? (
          <Link href={`/dashboard/tagihan?cari=${encodeURIComponent(data.data[0]?.murid.nis ?? "")}`} className="text-sm font-bold text-primary-strong hover:underline">
            Semua {data.meta.total} tagihan
          </Link>
        ) : null}
      </div>
      {isPending ? (
        <Skeleton className="h-32" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada tagihan untuk murid ini.</p>
      ) : (
        <>
          <p className="mb-3 text-sm">
            Belum dibayar:{" "}
            <span className="font-bold tabular-nums">
              {formatRupiah(data.data.filter((item) => tagihanTerbuka(item.status)).reduce((jumlah, item) => jumlah + item.total, 0))}
            </span>
          </p>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {data.data.map((tagihan) => (
              <li key={tagihan.id}>
                <Link href={`/dashboard/tagihan/${tagihan.id}`} className="flex min-h-12 items-center gap-3 px-3 py-2 text-sm hover:bg-muted/60">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{namaTagihan(tagihan)}</span>
                    <span className="block text-xs text-muted-foreground">Jatuh tempo {formatTanggal(tagihan.jatuh_tempo)}</span>
                  </span>
                  <span className="tabular-nums">{formatRupiah(tagihan.total)}</span>
                  <StatusBadge nada={NADA_STATUS_TAGIHAN[tagihan.status]}>{LABEL_STATUS_TAGIHAN[tagihan.status]}</StatusBadge>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
