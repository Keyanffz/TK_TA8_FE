"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { TombolKwitansi } from "@/components/features/pembayaran/tombol-kwitansi";
import { EmptyState } from "@/components/shared/empty-state";
import { KolomCari } from "@/components/shared/kolom-cari";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { useDaftarPembayaran } from "@/lib/api/pembayaran";
import { LABEL_METODE_BAYAR, LABEL_STATUS_PEMBAYARAN } from "@/lib/constants/label";
import { NADA_STATUS_PEMBAYARAN } from "@/lib/constants/status";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { namaTagihan } from "@/lib/tagihan";
import type { Pembayaran } from "@/types/domain";

const STATUS = ["menunggu", "diterima", "ditolak"] as const;
const METODE = ["transfer", "tunai"] as const;
const KELAS_SELECT = "h-11 rounded-md border border-input bg-card px-3 text-sm";

const KOLOM: ColumnDef<Pembayaran>[] = [
  {
    id: "pembayaran",
    header: "Pembayaran",
    cell: ({ row }) => (
      <Link href={`/dashboard/tagihan/${row.original.tagihan_id}`} className="block hover:underline">
        <span className="block font-bold">{namaTagihan(row.original.tagihan)}</span>
        <span className="block text-xs text-muted-foreground tabular-nums">{row.original.kode}</span>
      </Link>
    ),
  },
  { id: "murid", header: "Murid", cell: ({ row }) => row.original.tagihan.murid.nama_lengkap },
  { id: "metode", header: "Cara", cell: ({ row }) => LABEL_METODE_BAYAR[row.original.metode] },
  { id: "tanggal", header: "Tanggal bayar", cell: ({ row }) => formatTanggal(row.original.tanggal_bayar) },
  { id: "jumlah", header: "Jumlah", cell: ({ row }) => <span className="font-bold tabular-nums">{formatRupiah(row.original.jumlah)}</span> },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge nada={NADA_STATUS_PEMBAYARAN[row.original.status]}>{LABEL_STATUS_PEMBAYARAN[row.original.status]}</StatusBadge>
    ),
  },
  {
    id: "kwitansi",
    header: () => <span className="sr-only">Kwitansi</span>,
    cell: ({ row }) => (row.original.status === "diterima" ? <TombolKwitansi id={row.original.id} kode={row.original.kode} /> : null),
  },
];

/** Semua pembayaran untuk petugas keuangan, dengan saringan status, cara bayar, dan tanggal. */
export function RiwayatPembayaranSekolah() {
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsStringLiteral(STATUS));
  const [metode, setMetode] = useQueryState("metode", parseAsStringLiteral(METODE));
  const [tanggal, setTanggal] = useQueryState("tanggal", parseAsString);
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const daftar = useDaftarPembayaran({ halaman, status, metode, tanggal, search: cari });

  const ubahFilter = (ubah: () => unknown) => {
    ubah();
    void setHalaman(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <KolomCari nilai={cari} onUbah={(nilai) => ubahFilter(() => setCari(nilai || null))} label="Cari pembayaran" placeholder="Cari kode atau nama murid" />
        <select aria-label="Saring status" className={KELAS_SELECT} value={status ?? ""} onChange={(e) => ubahFilter(() => setStatus(STATUS.find((s) => s === e.target.value) ?? null))}>
          <option value="">Semua status</option>
          {STATUS.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_STATUS_PEMBAYARAN[nilai]}
            </option>
          ))}
        </select>
        <select aria-label="Saring cara bayar" className={KELAS_SELECT} value={metode ?? ""} onChange={(e) => ubahFilter(() => setMetode(METODE.find((m) => m === e.target.value) ?? null))}>
          <option value="">Semua cara bayar</option>
          {METODE.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_METODE_BAYAR[nilai]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="shrink-0">Tanggal bayar</span>
          <input type="date" className={`${KELAS_SELECT} min-w-0 flex-1 text-foreground`} value={tanggal ?? ""} onChange={(e) => ubahFilter(() => setTanggal(e.target.value || null))} />
        </label>
      </div>
      <TabelData
        label="Riwayat pembayaran"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(bayar) => bayar.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kelasKolom={{ jumlah: "text-right", kwitansi: "text-right" }}
        kosong={<EmptyState judul="Tidak ada pembayaran yang cocok." />}
        kartu={(bayar) => (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <Link href={`/dashboard/tagihan/${bayar.tagihan_id}`} className="font-bold hover:underline">
              {namaTagihan(bayar.tagihan)} · {bayar.tagihan.murid.nama_panggilan}
            </Link>
            <p className="text-sm text-muted-foreground">
              {LABEL_METODE_BAYAR[bayar.metode]} · {formatTanggal(bayar.tanggal_bayar)} · <span className="font-bold whitespace-nowrap text-foreground tabular-nums">{formatRupiah(bayar.jumlah)}</span>
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge nada={NADA_STATUS_PEMBAYARAN[bayar.status]}>{LABEL_STATUS_PEMBAYARAN[bayar.status]}</StatusBadge>
              {bayar.status === "diterima" ? <TombolKwitansi id={bayar.id} kode={bayar.kode} /> : null}
            </div>
          </div>
        )}
      />
    </div>
  );
}
