"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { FotoProfil } from "@/components/shared/foto-profil";
import { KolomCari } from "@/components/shared/kolom-cari";
import { SaringSegmen } from "@/components/shared/saring-segmen";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { buttonVariants } from "@/components/ui/button";
import { useDaftarGuru } from "@/lib/api/guru";
import { formatTanggal } from "@/lib/format";
import type { Guru } from "@/types/domain";

const STATUS = ["aktif", "nonaktif"] as const;
const LABEL_TAB = { aktif: "Aktif", nonaktif: "Nonaktif" } as const;

function Identitas({ guru }: { guru: Guru }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <FotoProfil nama={guru.user.name} url={guru.foto_url} ukuran={40} className="size-10 text-sm" />
      <div className="min-w-0">
        <Link href={`/mudarris/guru/${guru.id}`} className="block truncate font-bold hover:underline">
          {guru.user.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{guru.user.email}</p>
      </div>
    </div>
  );
}

function Peran({ guru }: { guru: Guru }) {
  return (
    <div className="flex flex-wrap gap-1">
      {guru.bisa_kelola_keuangan ? <StatusBadge nada="proses">Petugas keuangan</StatusBadge> : null}
      {guru.tampil_di_landing ? <StatusBadge nada="sukses">Di halaman depan</StatusBadge> : null}
    </div>
  );
}

function Aksi({ guru }: { guru: Guru }) {
  return (
    <Link href={`/mudarris/guru/${guru.id}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
      Buka
    </Link>
  );
}

const KOLOM: ColumnDef<Guru>[] = [
  { id: "guru", header: "Guru", cell: ({ row }) => <Identitas guru={row.original} /> },
  { id: "jabatan", header: "Jabatan", cell: ({ row }) => row.original.jabatan },
  { id: "hp", header: "Nomor HP", cell: ({ row }) => <span className="tabular-nums">{row.original.user.no_hp ?? "-"}</span> },
  { id: "peran", header: "Keterangan", cell: ({ row }) => <Peran guru={row.original} /> },
  {
    id: "daftar",
    header: "Terdaftar",
    cell: ({ row }) => (row.original.created_at ? formatTanggal(row.original.created_at) : "-"),
  },
  { id: "aksi", header: () => <span className="sr-only">Aksi</span>, cell: ({ row }) => <Aksi guru={row.original} /> },
];

export function DaftarGuru() {
  const [status, setStatus] = useQueryState("status", parseAsStringLiteral(STATUS).withDefault("aktif"));
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const daftar = useDaftarGuru({ status, search: cari, halaman });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SaringSegmen
          label="Status guru"
          opsi={STATUS.map((nilai) => ({ nilai, label: LABEL_TAB[nilai] }))}
          nilai={status}
          onUbah={(nilai) => {
            void setStatus(nilai === "aktif" ? null : nilai);
            void setHalaman(null);
          }}
        />
        <KolomCari
          nilai={cari}
          onUbah={(nilai) => {
            void setCari(nilai || null);
            void setHalaman(null);
          }}
          label="Cari guru"
          placeholder="Cari nama atau email"
          className="w-full sm:w-72"
        />
      </div>
      <TabelData
        label="Daftar guru"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(guru) => guru.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kelasKolom={{ aksi: "text-right" }}
        kosong={
          <EmptyState
            judul={cari ? `Tidak ada guru yang cocok dengan "${cari}".` : `Belum ada guru berstatus ${LABEL_TAB[status].toLowerCase()}.`}
            deskripsi={status === "aktif" && !cari ? "Tambahkan guru dengan nama dan email Google-nya lewat tombol Tambah Guru." : undefined}
          />
        }
        kartu={(guru) => (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <Identitas guru={guru} />
            <p className="text-sm text-muted-foreground">
              {guru.jabatan} · <span className="tabular-nums">{guru.user.no_hp ?? "-"}</span>
            </p>
            <Peran guru={guru} />
            <Aksi guru={guru} />
          </div>
        )}
      />
    </div>
  );
}
