"use client";

import { toast } from "sonner";

import { BuktiTransfer } from "@/components/features/pembayaran/bukti-transfer";
import { TombolKwitansi } from "@/components/features/pembayaran/tombol-kwitansi";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useBatalkanPembayaran } from "@/lib/api/pembayaran";
import { LABEL_METODE_BAYAR, LABEL_STATUS_PEMBAYARAN } from "@/lib/constants/label";
import { NADA_STATUS_PEMBAYARAN } from "@/lib/constants/status";
import { formatRupiah, formatTanggal, formatTanggalWaktu } from "@/lib/format";
import type { RiwayatPembayaran as Bayar, TagihanDetail } from "@/types/domain";

function TombolBatalkan({ bayar }: { bayar: Bayar }) {
  const batalkan = useBatalkanPembayaran();
  return (
    <DialogKonfirmasi
      pemicu={
        <Button variant="ghost" size="sm">
          Batalkan Pembayaran
        </Button>
      }
      judul={`Batalkan pembayaran ${formatRupiah(bayar.jumlah)}?`}
      deskripsi="Untuk pembayaran yang salah dicatat. Sisa tagihan dihitung ulang dan tagihan yang sudah lunas kembali belum lunas. Setelah itu catat lagi jumlah yang benar."
      labelAksi="Batalkan Pembayaran"
      labelAlasan="Alasan pembatalan"
      berbahaya
      onKonfirmasi={async (alasan) => {
        const hasil = await batalkan.mutateAsync({ id: bayar.id, alasan });
        toast.success(hasil.message);
      }}
    />
  );
}

/** Semua pembayaran satu tagihan, terbaru di atas, termasuk yang dibatalkan dan transfer dari riwayat lama. */
export function RiwayatPembayaran({ tagihan, bisaBatalkan }: { tagihan: TagihanDetail; bisaBatalkan: boolean }) {
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
                  ? ` · ${bayar.metode === "tunai" ? "dicatat" : "diperiksa"} ${bayar.diverifikasi_oleh.nama}, ${formatTanggalWaktu(bayar.diverifikasi_at)}`
                  : ""}
              </p>
            </div>
          </div>
          {bayar.status === "ditolak" && bayar.alasan_penolakan ? (
            <KotakPesan nada="bahaya" className="mt-3">
              Ditolak: {bayar.alasan_penolakan}
            </KotakPesan>
          ) : null}
          {bayar.status === "dibatalkan" ? (
            <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm">
              Dibatalkan{bayar.dibatalkan_oleh ? ` oleh ${bayar.dibatalkan_oleh.nama}` : ""}
              {bayar.dibatalkan_at ? `, ${formatTanggalWaktu(bayar.dibatalkan_at)}` : ""}
              {bayar.alasan_pembatalan ? `: ${bayar.alasan_pembatalan}` : "."} Pembayaran ini tidak dihitung.
            </p>
          ) : null}
          {bayar.status === "diterima" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <TombolKwitansi id={bayar.id} kode={bayar.kode} />
              {bisaBatalkan ? <TombolBatalkan bayar={bayar} /> : null}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
