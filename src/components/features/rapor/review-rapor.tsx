"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsNumberLiteral, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KolomCari } from "@/components/shared/kolom-cari";
import { Paginasi } from "@/components/shared/paginasi";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useKelasAktif } from "@/lib/api/kelas";
import { useDaftarRapor } from "@/lib/api/rapor";
import { LABEL_STATUS_RAPOR } from "@/lib/constants/label";
import { NADA_STATUS_RAPOR } from "@/lib/constants/status";
import { formatRelatif, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Rapor } from "@/types/domain";

const STATUS = ["draft", "diajukan", "revisi", "terbit"] as const;
const SEMESTER = [1, 2] as const;
const KELAS_SELECT = "h-11 rounded-md border border-input bg-card px-3 text-sm";

/** Antrean rapor berstatus diajukan, yang paling lama menunggu di atas. */
export function AntreanReviewRapor() {
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDaftarRapor({ halaman, status: "diajukan", sort: "diajukan_at" });

  if (isPending) return <Skeleton aria-label="Memuat antrean rapor" className="h-60 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  if (data.data.length === 0) {
    return <EmptyState judul="Tidak ada rapor yang menunggu review." deskripsi="Rapor yang diajukan guru akan muncul di sini." />;
  }

  return (
    <>
      <ul className={cn("grid gap-3 md:grid-cols-2", isPlaceholderData && "opacity-60")}>
        {data.data.map((rapor) => (
          <li key={rapor.id} className="flex flex-col gap-3 rounded-xl border-l-4 border-status-proses bg-card p-4 shadow-sm">
            <div>
              <p className="font-heading font-bold">{rapor.murid.nama_lengkap}</p>
              <p className="text-sm text-muted-foreground">
                {rapor.kelas.nama} · Semester {rapor.semester} · {rapor.pembuat.nama}
              </p>
              {rapor.diajukan_at ? <p className="text-xs text-muted-foreground">Diajukan {formatRelatif(rapor.diajukan_at)}</p> : null}
            </div>
            <Link href={`/dashboard/rapor/${rapor.id}`} className={buttonVariants({ size: "sm", className: "self-start" })}>
              Review Rapor
            </Link>
          </li>
        ))}
      </ul>
      <Paginasi meta={data.meta} onUbah={(nomor) => void setHalaman(nomor)} label="Halaman antrean rapor" />
    </>
  );
}

const KOLOM: ColumnDef<Rapor>[] = [
  {
    id: "murid",
    header: "Murid",
    cell: ({ row }) => (
      <div>
        <Link href={`/dashboard/rapor/${row.original.id}`} className="font-bold hover:underline">
          {row.original.murid.nama_lengkap}
        </Link>
        <p className="text-xs text-muted-foreground tabular-nums">{row.original.murid.nis}</p>
      </div>
    ),
  },
  { id: "kelas", header: "Kelas", cell: ({ row }) => row.original.kelas.nama },
  { id: "semester", header: "Semester", cell: ({ row }) => `${row.original.semester} · ${row.original.tahun_ajaran.nama}` },
  { id: "guru", header: "Guru", cell: ({ row }) => row.original.pembuat.nama },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge nada={NADA_STATUS_RAPOR[row.original.status]}>{LABEL_STATUS_RAPOR[row.original.status]}</StatusBadge>,
  },
  { id: "diubah", header: "Terakhir diubah", cell: ({ row }) => (row.original.updated_at ? formatTanggal(row.original.updated_at) : "-") },
];

/** Semua rapor dengan saringan status, kelas, dan semester (Kepala Sekolah). */
export function SemuaRapor() {
  const kelas = useKelasAktif();
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsStringLiteral(STATUS));
  const [kelasId, setKelasId] = useQueryState("kelas", parseAsInteger);
  const [semester, setSemester] = useQueryState("semester", parseAsNumberLiteral(SEMESTER));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const daftar = useDaftarRapor({ halaman, search: cari, status, kelasId, semester });

  const ubahFilter = (ubah: () => unknown) => {
    ubah();
    void setHalaman(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <KolomCari nilai={cari} onUbah={(nilai) => ubahFilter(() => setCari(nilai || null))} label="Cari rapor" placeholder="Cari nama atau NIS murid" />
        <select aria-label="Saring status" className={KELAS_SELECT} value={status ?? ""} onChange={(e) => ubahFilter(() => setStatus(STATUS.find((s) => s === e.target.value) ?? null))}>
          <option value="">Semua status</option>
          {STATUS.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_STATUS_RAPOR[nilai]}
            </option>
          ))}
        </select>
        <select aria-label="Saring kelas" className={KELAS_SELECT} value={kelasId ?? ""} onChange={(e) => ubahFilter(() => setKelasId(e.target.value ? Number(e.target.value) : null))}>
          <option value="">Semua kelas</option>
          {(kelas.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama}
            </option>
          ))}
        </select>
        <select
          aria-label="Saring semester"
          className={KELAS_SELECT}
          value={semester ?? ""}
          onChange={(e) => ubahFilter(() => setSemester(e.target.value === "1" ? 1 : e.target.value === "2" ? 2 : null))}
        >
          <option value="">Semua semester</option>
          {SEMESTER.map((nilai) => (
            <option key={nilai} value={nilai}>
              Semester {nilai}
            </option>
          ))}
        </select>
      </div>
      <TabelData
        label="Daftar rapor"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(rapor) => rapor.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kosong={<EmptyState judul={cari ? `Tidak ada rapor yang cocok dengan "${cari}".` : "Belum ada rapor dengan saringan ini."} />}
        kartu={(rapor) => (
          <Link href={`/dashboard/rapor/${rapor.id}`} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="flex items-start justify-between gap-2">
              <span className="font-bold">{rapor.murid.nama_lengkap}</span>
              <StatusBadge nada={NADA_STATUS_RAPOR[rapor.status]}>{LABEL_STATUS_RAPOR[rapor.status]}</StatusBadge>
            </span>
            <span className="text-sm text-muted-foreground">
              {rapor.kelas.nama} · Semester {rapor.semester} · {rapor.pembuat.nama}
            </span>
          </Link>
        )}
      />
    </div>
  );
}
