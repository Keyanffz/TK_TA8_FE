import { ArrowRight, CircleAlert, History } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Muncul } from "@/components/shared/muncul";
import { Bintang } from "@/components/shared/ornamen/bintang";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { LABEL_STATUS_TAGIHAN } from "@/lib/constants/label";
import { NADA_STATUS_TAGIHAN } from "@/lib/constants/status";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { namaTagihan } from "@/lib/tagihan";
import { cn } from "@/lib/utils";
import type { Tagihan } from "@/types/domain";

const MAKS_BARIS = 3;

type KartuTagihanProps = {
  namaAnak: string;
  tagihan: Tagihan[];
  totalBelumBayar: number;
};

/**
 * Hal terpenting di beranda wali (C7): total yang belum dibayar dan tombol
 * bayar. Merah kalau ada tagihan terlambat.
 */
export function KartuTagihan({ namaAnak, tagihan, totalBelumBayar }: KartuTagihanProps) {
  const adaTerlambat = tagihan.some((item) => item.status === "terlambat");
  const perluDibayar = tagihan.filter((item) => item.status === "belum_bayar" || item.status === "terlambat");
  const diperiksa = tagihan.filter((item) => item.status === "menunggu_verifikasi");
  const tujuanBayar = perluDibayar.length === 1 && perluDibayar[0] ? `/dashboard/tagihan/${perluDibayar[0].id}` : "/dashboard/tagihan";

  if (tagihan.length === 0) {
    return (
      <section aria-labelledby="judul-tagihan" className="relative overflow-hidden rounded-xl border-2 border-primary bg-card p-5 shadow-md">
        <Muncul efek="pop" className="flex items-center gap-4">
          <span className="relative flex size-14 shrink-0 items-center justify-center">
            <Bintang className="putar-saat-hover absolute inset-0 size-14 text-highlight" />
          </span>
          <div>
            <h2 id="judul-tagihan" className="text-lg font-extrabold">
              Semua tagihan {namaAnak} sudah lunas
            </h2>
            <p className="text-sm text-muted-foreground">Tagihan baru akan muncul di sini beserta tombol bayarnya.</p>
          </div>
        </Muncul>
        <Link
          href="/dashboard/pembayaran"
          className="mt-4 inline-flex min-h-11 items-center gap-2 font-heading text-sm font-bold text-primary-strong hover:underline"
        >
          <History aria-hidden="true" className="size-4" />
          Lihat riwayat pembayaran
        </Link>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="judul-tagihan"
      className={cn(
        "gerak-masuk overflow-hidden rounded-xl border-2 bg-card shadow-md",
        adaTerlambat ? "border-destructive" : "border-primary",
      )}
      style={{ "--i": 3 } as CSSProperties}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 font-heading text-sm font-bold",
          adaTerlambat ? "bg-destructive text-white" : "bg-primary text-primary-foreground",
        )}
      >
        {adaTerlambat ? <CircleAlert aria-hidden="true" className="gerak-ayun size-4" /> : null}
        <h2 id="judul-tagihan">{adaTerlambat ? "Ada tagihan yang lewat jatuh tempo" : `Tagihan ${namaAnak}`}</h2>
      </div>
      <div className="p-5">
        <p className="text-sm text-muted-foreground">Total belum dibayar</p>
        <p className={cn("font-heading text-2xl leading-tight font-extrabold tabular-nums", adaTerlambat ? "text-destructive" : "text-primary-deep")}>
          {formatRupiah(totalBelumBayar)}
        </p>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {tagihan.slice(0, MAKS_BARIS).map((item) => (
            <li key={item.id}>
              <Link href={`/dashboard/tagihan/${item.id}`} className="flex min-h-12 items-center gap-3 py-2 hover:bg-muted/60">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{namaTagihan(item)}</span>
                  <span className="block text-xs text-muted-foreground">Jatuh tempo {formatTanggal(item.jatuh_tempo)}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-bold tabular-nums">{formatRupiah(item.total)}</span>
                  <StatusBadge nada={NADA_STATUS_TAGIHAN[item.status]}>{LABEL_STATUS_TAGIHAN[item.status]}</StatusBadge>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {tagihan.length > MAKS_BARIS ? (
          <p className="mt-2 text-sm text-muted-foreground">dan {tagihan.length - MAKS_BARIS} tagihan lainnya.</p>
        ) : null}
        {diperiksa.length > 0 ? (
          <p className="mt-3 rounded-md bg-status-proses-soft px-3 py-2 text-sm text-status-proses">
            Bukti transfer untuk {diperiksa.length} tagihan sedang diperiksa sekolah.
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {perluDibayar.length > 0 ? (
            <Link
              href={tujuanBayar}
              className={buttonVariants({ size: "lg", variant: adaTerlambat ? "destructive" : "default", className: "group" })}
            >
              Bayar Sekarang
              <ArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          ) : null}
          <Link href="/dashboard/tagihan" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Semua Tagihan
          </Link>
        </div>
      </div>
    </section>
  );
}
