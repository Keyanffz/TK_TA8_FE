"use client";

import { Megaphone, Phone } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarKelas } from "@/lib/api/kelas";
import { useLaporanTunggakan } from "@/lib/api/laporan";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Murid dengan tagihan terlambat, total terbesar di atas, beserta kontak utama walinya. */
export function DaftarTunggakan() {
  const [kelasId, setKelasId] = useQueryState("kelas", parseAsInteger);
  const kelas = useDaftarKelas(null);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useLaporanTunggakan(kelasId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Kelas</span>
          <select
            value={kelasId ?? ""}
            onChange={(e) => void setKelasId(e.target.value ? Number(e.target.value) : null)}
            className="h-10 rounded-md border border-input bg-card px-3 font-bold"
          >
            <option value="">Semua kelas</option>
            {(kelas.data ?? [])
              .filter((item) => item.tahun_ajaran.is_aktif)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
          </select>
        </label>
        {data ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm">
              <span className="font-bold">{data.jumlah_murid} murid</span> menunggak, total{" "}
              <span className="font-heading text-lg font-extrabold text-destructive tabular-nums">{formatRupiah(data.total_tunggakan)}</span>
            </p>
            {data.murid.length > 0 ? (
              <Link href={`/dashboard/pengumuman/baru?dari=tunggakan${kelasId ? `&kelas=${kelasId}` : ""}`} className={buttonVariants({ variant: "outline" })}>
                <Megaphone aria-hidden="true" />
                Kirim Pengumuman
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
      {isPending ? (
        <Skeleton className="h-60 rounded-xl" />
      ) : isError ? (
        <GalatMuat error={error} onCobaLagi={() => void refetch()} />
      ) : data.murid.length === 0 ? (
        <EmptyState judul="Tidak ada tunggakan." deskripsi="Tagihan yang lewat jatuh tempo dan belum dibayar akan muncul di sini." />
      ) : (
        <ul className={cn("grid gap-4 lg:grid-cols-2", isPlaceholderData && "opacity-60")}>
          {data.murid.map((murid) => (
            <li key={murid.id} className="flex flex-col gap-3 rounded-xl border-l-4 border-destructive bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/dashboard/murid/${murid.id}`} className="font-heading font-bold hover:underline">
                    {murid.nama_lengkap}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    <span className="tabular-nums">{murid.nis}</span> · {murid.kelas?.nama ?? "tanpa kelas"}
                  </p>
                </div>
                <p className="text-right">
                  <span className="block font-heading text-lg font-extrabold text-destructive tabular-nums">{formatRupiah(murid.total)}</span>
                  <span className="text-xs text-muted-foreground">{murid.jumlah_tagihan} tagihan</span>
                </p>
              </div>
              <ul className="divide-y divide-border rounded-lg border border-border text-sm">
                {murid.tagihan.map((tagihan) => (
                  <li key={tagihan.id}>
                    <Link href={`/dashboard/tagihan/${tagihan.id}`} className="flex min-h-11 items-center justify-between gap-2 px-3 py-2 hover:bg-muted/60">
                      <span>
                        <span className="block font-bold">{tagihan.nama}</span>
                        <span className="block text-xs text-destructive">Jatuh tempo {formatTanggal(tagihan.jatuh_tempo)}</span>
                      </span>
                      <span className="tabular-nums">{formatRupiah(tagihan.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {murid.kontak_wali ? (
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Kontak utama:</span>
                  <span className="font-bold">{murid.kontak_wali.nama}</span>
                  {murid.kontak_wali.no_hp ? (
                    <a href={`tel:${murid.kontak_wali.no_hp}`} className="inline-flex min-h-11 items-center gap-1 font-bold text-primary-strong hover:underline">
                      <Phone aria-hidden="true" className="size-4" />
                      <span className="tabular-nums">{murid.kontak_wali.no_hp}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">tanpa nomor HP</span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada wali tertaut.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
