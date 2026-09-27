"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { KolomCari } from "@/components/shared/kolom-cari";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { useDaftarJenisTagihan } from "@/lib/api/jenis-tagihan";
import { useDaftarKelas } from "@/lib/api/kelas";
import { useDaftarTagihan } from "@/lib/api/tagihan";
import { LABEL_STATUS_TAGIHAN } from "@/lib/constants/label";
import { NADA_STATUS_TAGIHAN } from "@/lib/constants/status";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { namaTagihan } from "@/lib/tagihan";
import { cn } from "@/lib/utils";
import type { Tagihan } from "@/types/domain";

const STATUS = ["belum_bayar", "terlambat", "menunggu_verifikasi", "lunas", "dibatalkan"] as const;
const KELAS_SELECT = "h-11 rounded-md border border-input bg-card px-3 text-sm";

const KOLOM: ColumnDef<Tagihan>[] = [
  {
    id: "tagihan",
    header: "Tagihan",
    cell: ({ row }) => (
      <Link href={`/dashboard/tagihan/${row.original.id}`} className="block hover:underline">
        <span className="block font-bold">{namaTagihan(row.original)}</span>
        <span className="block text-xs text-muted-foreground tabular-nums">{row.original.kode}</span>
      </Link>
    ),
  },
  {
    id: "murid",
    header: "Murid",
    cell: ({ row }) => (
      <span>
        <span className="block font-bold">{row.original.murid.nama_lengkap}</span>
        <span className="block text-xs text-muted-foreground">{row.original.murid.kelas?.nama ?? "Tanpa kelas"}</span>
      </span>
    ),
  },
  {
    id: "jatuh_tempo",
    header: "Jatuh tempo",
    cell: ({ row }) => (
      <span className={cn(row.original.status === "terlambat" && "font-bold text-destructive")}>{formatTanggal(row.original.jatuh_tempo)}</span>
    ),
  },
  { id: "total", header: "Total", cell: ({ row }) => <span className="font-bold tabular-nums">{formatRupiah(row.original.total)}</span> },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge nada={NADA_STATUS_TAGIHAN[row.original.status]}>{LABEL_STATUS_TAGIHAN[row.original.status]}</StatusBadge>,
  },
];

/** Tabel tagihan untuk petugas keuangan (semua murid) dan guru (murid kelasnya, hanya lihat). */
export function TabelTagihan({ petugasKeuangan }: { petugasKeuangan: boolean }) {
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsStringLiteral(STATUS));
  const [periode, setPeriode] = useQueryState("periode", parseAsString);
  const [kelasId, setKelasId] = useQueryState("kelas", parseAsInteger);
  const [jenisId, setJenisId] = useQueryState("jenis", parseAsInteger);
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const kelas = useDaftarKelas(null);
  const jenis = useDaftarJenisTagihan(null, petugasKeuangan);
  const daftar = useDaftarTagihan({ halaman, search: cari, status, periode, kelasId, jenisTagihanId: jenisId });
  const adaFilter = cari || status || periode || kelasId || jenisId;

  const ubahFilter = (ubah: () => unknown) => {
    ubah();
    void setHalaman(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <KolomCari nilai={cari} onUbah={(nilai) => ubahFilter(() => setCari(nilai || null))} label="Cari tagihan" placeholder="Cari kode atau nama murid" />
        <select aria-label="Saring status" className={KELAS_SELECT} value={status ?? ""} onChange={(e) => ubahFilter(() => setStatus(STATUS.find((s) => s === e.target.value) ?? null))}>
          <option value="">Semua status</option>
          {STATUS.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_STATUS_TAGIHAN[nilai]}
            </option>
          ))}
        </select>
        <input
          type="month"
          aria-label="Saring bulan tagihan"
          className={KELAS_SELECT}
          value={periode ?? ""}
          onChange={(e) => ubahFilter(() => setPeriode(e.target.value || null))}
        />
        {petugasKeuangan ? (
          <select aria-label="Saring kelas" className={KELAS_SELECT} value={kelasId ?? ""} onChange={(e) => ubahFilter(() => setKelasId(e.target.value ? Number(e.target.value) : null))}>
            <option value="">Semua kelas</option>
            {(kelas.data ?? [])
              .filter((item) => item.tahun_ajaran.is_aktif)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
          </select>
        ) : null}
        {petugasKeuangan ? (
          <select aria-label="Saring jenis tagihan" className={KELAS_SELECT} value={jenisId ?? ""} onChange={(e) => ubahFilter(() => setJenisId(e.target.value ? Number(e.target.value) : null))}>
            <option value="">Semua jenis</option>
            {(jenis.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama} ({item.tahun_ajaran.nama})
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <TabelData
        label="Daftar tagihan"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(tagihan) => tagihan.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kelasKolom={{ total: "text-right" }}
        kosong={<EmptyState judul={adaFilter ? "Tidak ada tagihan yang cocok dengan saringan." : "Belum ada tagihan."} />}
        kartu={(tagihan) => (
          <Link href={`/dashboard/tagihan/${tagihan.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{namaTagihan(tagihan)}</span>
              <span className="block truncate text-sm">{tagihan.murid.nama_lengkap}</span>
              <span className={cn("block text-xs", tagihan.status === "terlambat" ? "font-bold text-destructive" : "text-muted-foreground")}>
                Jatuh tempo {formatTanggal(tagihan.jatuh_tempo)}
              </span>
            </span>
            <span className="flex flex-col items-end gap-1">
              <span className="font-bold tabular-nums">{formatRupiah(tagihan.total)}</span>
              <StatusBadge nada={NADA_STATUS_TAGIHAN[tagihan.status]}>{LABEL_STATUS_TAGIHAN[tagihan.status]}</StatusBadge>
            </span>
          </Link>
        )}
      />
    </div>
  );
}
