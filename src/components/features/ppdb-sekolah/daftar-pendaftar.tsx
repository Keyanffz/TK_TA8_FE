"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { KolomCari } from "@/components/shared/kolom-cari";
import { SaringSegmen } from "@/components/shared/saring-segmen";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { buttonVariants } from "@/components/ui/button";
import { useDaftarPendaftaran } from "@/lib/api/ppdb";
import { LABEL_STATUS_PENDAFTARAN, LABEL_TINGKAT } from "@/lib/constants/label";
import { NADA_STATUS_PENDAFTARAN } from "@/lib/constants/status";
import { formatTanggal } from "@/lib/format";
import type { Pendaftaran } from "@/types/domain";

const TAB = ["diajukan", "diverifikasi", "diterima", "ditolak", "semua"] as const;
const LABEL_TAB = { diajukan: "Baru", diverifikasi: "Dokumen OK", diterima: "Diterima", ditolak: "Ditolak", semua: "Semua" } as const;

function orangTua(pendaftaran: Pendaftaran): string {
  return [pendaftaran.nama_ayah, pendaftaran.nama_ibu].filter(Boolean).join(" & ") || "-";
}

const KOLOM: ColumnDef<Pendaftaran>[] = [
  {
    id: "anak",
    header: "Calon murid",
    cell: ({ row }) => (
      <div>
        <Link href={`/mudarris/ppdb/${row.original.id}`} className="font-bold hover:underline">
          {row.original.nama_lengkap}
        </Link>
        <p className="text-xs text-muted-foreground tabular-nums">{row.original.kode}</p>
      </div>
    ),
  },
  { id: "tingkat", header: "Kelompok", cell: ({ row }) => LABEL_TINGKAT[row.original.tingkat_tujuan] },
  { id: "ortu", header: "Orang tua", cell: ({ row }) => orangTua(row.original) },
  { id: "hp", header: "Nomor HP", cell: ({ row }) => <span className="tabular-nums">{row.original.no_hp}</span> },
  { id: "daftar", header: "Mendaftar", cell: ({ row }) => (row.original.created_at ? formatTanggal(row.original.created_at) : "-") },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge nada={NADA_STATUS_PENDAFTARAN[row.original.status]}>{LABEL_STATUS_PENDAFTARAN[row.original.status]}</StatusBadge>,
  },
  {
    id: "aksi",
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <Link href={`/mudarris/ppdb/${row.original.id}`} className={buttonVariants({ size: "sm", variant: row.original.status === "diajukan" ? "default" : "outline" })}>
        {row.original.status === "diajukan" ? "Periksa" : "Buka"}
      </Link>
    ),
  },
];

/** Pendaftar PPDB per status (Kepala Sekolah). Tab "Baru" = diajukan, belum diperiksa. */
export function DaftarPendaftar() {
  const [tab, setTab] = useQueryState("status", parseAsStringLiteral(TAB).withDefault("diajukan"));
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const daftar = useDaftarPendaftaran({ halaman, search: cari, status: tab === "semua" ? null : tab });
  const baru = useDaftarPendaftaran({ halaman: 1, search: "", status: "diajukan", perHalaman: 1 });
  const verifikasi = useDaftarPendaftaran({ halaman: 1, search: "", status: "diverifikasi", perHalaman: 1 });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SaringSegmen
          label="Status pendaftaran"
          opsi={TAB.map((nilai) => ({
            nilai,
            label: LABEL_TAB[nilai],
            jumlah: nilai === "diajukan" ? baru.data?.meta.total : nilai === "diverifikasi" ? verifikasi.data?.meta.total : undefined,
          }))}
          nilai={tab}
          onUbah={(nilai) => {
            void setTab(nilai === "diajukan" ? null : nilai);
            void setHalaman(null);
          }}
        />
        <KolomCari
          nilai={cari}
          onUbah={(nilai) => {
            void setCari(nilai || null);
            void setHalaman(null);
          }}
          label="Cari pendaftar"
          placeholder="Cari kode atau nama anak"
          className="w-full sm:w-72"
        />
      </div>
      <TabelData
        label="Daftar pendaftar PPDB"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(item) => item.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kelasKolom={{ aksi: "text-right" }}
        kosong={
          <EmptyState
            judul={cari ? `Tidak ada pendaftar yang cocok dengan "${cari}".` : tab === "diajukan" ? "Tidak ada pendaftaran baru." : "Belum ada pendaftar di tab ini."}
            deskripsi={tab === "diajukan" ? "Pendaftaran dari halaman PPDB website dan dari wali murid akan muncul di sini." : undefined}
          />
        }
        kartu={(item) => (
          <Link href={`/mudarris/ppdb/${item.id}`} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="flex items-start justify-between gap-2">
              <span>
                <span className="block font-bold">{item.nama_lengkap}</span>
                <span className="block text-xs text-muted-foreground tabular-nums">{item.kode}</span>
              </span>
              <StatusBadge nada={NADA_STATUS_PENDAFTARAN[item.status]}>{LABEL_STATUS_PENDAFTARAN[item.status]}</StatusBadge>
            </span>
            <span className="text-sm text-muted-foreground">
              {LABEL_TINGKAT[item.tingkat_tujuan]} · {orangTua(item)} · <span className="tabular-nums">{item.no_hp}</span>
            </span>
          </Link>
        )}
      />
    </div>
  );
}
