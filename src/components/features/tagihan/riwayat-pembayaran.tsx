"use client";

import { AksiVerifikasi } from "@/components/features/pembayaran/aksi-verifikasi";
import { BuktiTransfer } from "@/components/features/pembayaran/bukti-transfer";
import { TombolKwitansi } from "@/components/features/pembayaran/tombol-kwitansi";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { LABEL_METODE_BAYAR, LABEL_STATUS_PEMBAYARAN } from "@/lib/constants/label";
import { NADA_STATUS_PEMBAYARAN } from "@/lib/constants/status";
import { formatRupiah, formatTanggal, formatTanggalWaktu } from "@/lib/format";
import { namaTagihan } from "@/lib/tagihan";
import type { TagihanDetail } from "@/types/domain";

type RiwayatPembayaranProps = { tagihan: TagihanDetail; bisaVerifikasi: boolean };

/** Semua percobaan pembayaran satu tagihan, terbaru di atas. */
export function RiwayatPembayaran({ tagihan, bisaVerifikasi }: RiwayatPembayaranProps) {
  if (tagihan.pembayaran.length === 0) return <p className="text-sm text-muted-foreground">Belum ada pembayaran untuk tagihan ini.</p>;

  return (
    <ol className="flex flex-col gap-3">
      {tagihan.pembayaran.map((bayar) => (
        <li key={bayar.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap gap-4">
            {bayar.bukti_url ? <BuktiTransfer url={bayar.bukti_url} label={`Bukti ${bayar.kode}`} className="size-24 shrink-0" /> : null}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-heading font-bold tabular-nums">{formatRupiah(bayar.jumlah)}</p>
                <StatusBadge nada={NADA_STATUS_PEMBAYARAN[bayar.status]}>{LABEL_STATUS_PEMBAYARAN[bayar.status]}</StatusBadge>
              </div>
              <p className="text-sm text-muted-foreground">
                {LABEL_METODE_BAYAR[bayar.metode]} · {formatTanggal(bayar.tanggal_bayar)}
                {bayar.bank_pengirim ? ` · ${bayar.bank_pengirim}` : ""}
                {bayar.nama_pengirim ? ` a.n. ${bayar.nama_pengirim}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="tabular-nums">{bayar.kode}</span>
                {bayar.dibayar_oleh ? ` · dikirim ${bayar.dibayar_oleh.nama}` : ""}
                {bayar.diverifikasi_oleh && bayar.diverifikasi_at
                  ? ` · diperiksa ${bayar.diverifikasi_oleh.nama}, ${formatTanggalWaktu(bayar.diverifikasi_at)}`
                  : ""}
              </p>
            </div>
          </div>
          {bayar.status === "ditolak" && bayar.alasan_penolakan ? (
            <KotakPesan nada="bahaya" className="mt-3">
              Ditolak: {bayar.alasan_penolakan}
            </KotakPesan>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {bayar.status === "diterima" ? <TombolKwitansi id={bayar.id} kode={bayar.kode} /> : null}
            {bayar.status === "menunggu" && bisaVerifikasi ? (
              <AksiVerifikasi id={bayar.id} jumlah={bayar.jumlah} namaTagihan={namaTagihan(tagihan)} namaMurid={tagihan.murid.nama_panggilan} />
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
