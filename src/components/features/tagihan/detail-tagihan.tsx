"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { AksiTagihan } from "@/components/features/tagihan/aksi-tagihan";
import { RiwayatPembayaran } from "@/components/features/tagihan/riwayat-pembayaran";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailKelas } from "@/lib/api/kelas";
import { useDetailTagihan } from "@/lib/api/tagihan";
import { useSession } from "@/lib/auth/use-session";
import { LABEL_STATUS_TAGIHAN } from "@/lib/constants/label";
import { NADA_STATUS_TAGIHAN } from "@/lib/constants/status";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { namaTagihan, tagihanTerbuka } from "@/lib/tagihan";
import { cn } from "@/lib/utils";

/** `keuangan-lihat`: guru dengan izin lihat keuangan (A2.13), melihat semua tagihan tanpa aksi. */
export type PeranTagihan = "wali" | "keuangan" | "keuangan-lihat" | "kepala-sekolah" | "guru";

/**
 * Guru tanpa izin kelola keuangan boleh mencatat pembayaran kalau ia wali kelas murid itu (A2.5). Sesi hanya
 * memuat kelas yang diampu tanpa membedakan wali kelas dan pendamping, jadi wali kelasnya dibaca dari detail kelas.
 */
function useWaliKelasMurid(kelasId: number | null, aktif: boolean): boolean {
  const { user } = useSession();
  const diampu = aktif && kelasId !== null && (user?.guru?.kelas_diampu.some((kelas) => kelas.id === kelasId) ?? false);
  const kelas = useDetailKelas(kelasId ?? 0, diampu);
  return diampu && kelas.data?.wali_kelas?.id === user?.guru?.id;
}

function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-extrabold">{judul}</h2>
      {children}
    </section>
  );
}

export function DetailTagihan({ id, peran }: { id: number; peran: PeranTagihan }) {
  const { data: tagihan, isPending, isError, error, refetch } = useDetailTagihan(id);
  const waliKelas = useWaliKelasMurid(tagihan?.murid.kelas?.id ?? null, peran === "guru" || peran === "keuangan-lihat");

  if (isPending) return <Skeleton aria-label="Memuat tagihan" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  const petugas = peran === "keuangan" || peran === "kepala-sekolah";
  const terlambat = tagihan.status === "terlambat";
  const dicicil = tagihan.terbayar > 0 && tagihan.sisa > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
      <div className="flex flex-col gap-6">
        <section className={cn("overflow-hidden rounded-xl border-2 bg-card shadow-md", terlambat ? "border-destructive" : "border-primary")}>
          <div className={cn("px-5 py-3", terlambat ? "bg-destructive text-white" : "bg-primary text-primary-foreground")}>
            <p className="text-sm">{tagihan.kode}</p>
            <h1 className="font-heading text-xl leading-tight font-extrabold">{namaTagihan(tagihan)}</h1>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{dicicil ? "Sisa yang belum dibayar" : "Total"}</p>
                <p className={cn("font-heading text-2xl leading-tight font-extrabold tabular-nums", terlambat ? "text-destructive" : "text-primary-deep")}>
                  {formatRupiah(dicicil ? tagihan.sisa : tagihan.total)}
                </p>
              </div>
              <StatusBadge nada={NADA_STATUS_TAGIHAN[tagihan.status]}>{LABEL_STATUS_TAGIHAN[tagihan.status]}</StatusBadge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Murid</dt>
                <dd className="font-bold">
                  {peran !== "wali" ? (
                    <Link href={`/mudarris/murid/${tagihan.murid.id}`} className="hover:underline">
                      {tagihan.murid.nama_lengkap}
                    </Link>
                  ) : (
                    tagihan.murid.nama_lengkap
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kelas</dt>
                <dd className="font-bold">{tagihan.murid.kelas?.nama ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Jatuh tempo</dt>
                <dd className={cn("font-bold", terlambat && "text-destructive")}>{formatTanggal(tagihan.jatuh_tempo)}</dd>
              </div>
              {tagihan.lunas_at ? (
                <div>
                  <dt className="text-muted-foreground">Lunas</dt>
                  <dd className="font-bold">{formatTanggal(tagihan.lunas_at)}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Nominal</dt>
                <dd className="font-bold tabular-nums">{formatRupiah(tagihan.nominal)}</dd>
              </div>
              {tagihan.potongan > 0 ? (
                <div>
                  <dt className="text-muted-foreground">Potongan</dt>
                  <dd className="font-bold text-primary-strong tabular-nums">- {formatRupiah(tagihan.potongan)}</dd>
                </div>
              ) : null}
              {dicicil ? (
                <>
                  <div>
                    <dt className="text-muted-foreground">Total tagihan</dt>
                    <dd className="font-bold tabular-nums">{formatRupiah(tagihan.total)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Sudah dibayar</dt>
                    <dd className="font-bold text-primary-strong tabular-nums">{formatRupiah(tagihan.terbayar)}</dd>
                  </div>
                </>
              ) : null}
            </dl>
            {tagihan.catatan ? (
              <p className="mt-4 rounded-md bg-muted px-3 py-2 text-sm">
                <span className="font-bold">{tagihan.status === "dibatalkan" ? "Alasan pembatalan: " : "Catatan: "}</span>
                {tagihan.catatan}
              </p>
            ) : null}
            {petugas || waliKelas ? (
              <div className="mt-5">
                <AksiTagihan tagihan={tagihan} bisaCatat bisaUbah={petugas} kepalaSekolah={peran === "kepala-sekolah"} />
              </div>
            ) : null}
          </div>
        </section>
        {peran === "wali" && tagihanTerbuka(tagihan.status) ? (
          <KotakPesan nada="proses" judul="Pembayaran dilakukan tunai di sekolah">
            Bayar {formatRupiah(tagihan.sisa)} ke wali kelas atau petugas keuangan sekolah. Boleh dicicil. Setiap pembayaran yang dicatat sekolah muncul di
            riwayat beserta kwitansinya.
          </KotakPesan>
        ) : null}
      </div>
      <div className="flex flex-col gap-6">
        <Bagian judul="Riwayat pembayaran">
          <RiwayatPembayaran tagihan={tagihan} bisaBatalkan={peran === "kepala-sekolah"} />
        </Bagian>
      </div>
    </div>
  );
}
