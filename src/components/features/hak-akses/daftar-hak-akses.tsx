"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { DialogIzinGuru } from "@/components/features/hak-akses/dialog-izin-guru";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KolomCari } from "@/components/shared/kolom-cari";
import { SaringSegmen } from "@/components/shared/saring-segmen";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarGuru } from "@/lib/api/guru";
import { useDaftarIzin } from "@/lib/api/izin";
import { LABEL_LEVEL_IZIN, LABEL_MODUL_IZIN, LABEL_STATUS_AKUN, MODUL_IZIN } from "@/lib/constants/label";
import type { DaftarIzin, Guru, LevelIzin } from "@/types/domain";

const STATUS = ["aktif", "nonaktif"] as const;

function Level({ level }: { level: LevelIzin | null }) {
  if (level === null) return <span className="text-muted-foreground">-</span>;
  return <StatusBadge nada={level === "kelola" ? "sukses" : "proses"}>{LABEL_LEVEL_IZIN[level]}</StatusBadge>;
}

function kolom(daftar: DaftarIzin): ColumnDef<Guru>[] {
  return [
    {
      id: "guru",
      header: "Guru",
      cell: ({ row }) => (
        <span className="block min-w-0">
          <span className="block truncate font-bold">{row.original.user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{row.original.jabatan}</span>
        </span>
      ),
    },
    ...MODUL_IZIN.map((modul): ColumnDef<Guru> => ({ id: modul, header: LABEL_MODUL_IZIN[modul], cell: ({ row }) => <Level level={row.original.izin[modul]} /> })),
    { id: "aksi", header: () => <span className="sr-only">Aksi</span>, cell: ({ row }) => <DialogIzinGuru guru={row.original} daftar={daftar} /> },
  ];
}

/** Izin modul setiap guru (A2.13), diatur per guru atau dengan preset. */
export function DaftarHakAkses() {
  const [status, setStatus] = useQueryState("status", parseAsStringLiteral(STATUS).withDefault("aktif"));
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const izin = useDaftarIzin();
  const daftar = useDaftarGuru({ status, search: cari, halaman });

  if (izin.isPending) return <Skeleton aria-label="Memuat daftar izin" className="h-72 rounded-xl" />;
  if (izin.isError) return <GalatMuat error={izin.error} onCobaLagi={() => void izin.refetch()} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SaringSegmen
          label="Status guru"
          opsi={STATUS.map((nilai) => ({ nilai, label: LABEL_STATUS_AKUN[nilai] }))}
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
        label="Hak akses guru"
        kolom={kolom(izin.data)}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(guru) => guru.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kelasKolom={{ aksi: "text-right" }}
        kosong={<EmptyState judul={cari ? `Tidak ada guru yang cocok dengan "${cari}".` : `Belum ada guru berstatus ${LABEL_STATUS_AKUN[status].toLowerCase()}.`} />}
        kartu={(guru) => (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div>
              <p className="font-bold">{guru.user.name}</p>
              <p className="text-xs text-muted-foreground">{guru.jabatan}</p>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {MODUL_IZIN.map((modul) => (
                <div key={modul}>
                  <dt className="text-muted-foreground">{LABEL_MODUL_IZIN[modul]}</dt>
                  <dd>
                    <Level level={guru.izin[modul]} />
                  </dd>
                </div>
              ))}
            </dl>
            <DialogIzinGuru guru={guru} daftar={izin.data} />
          </div>
        )}
      />
    </div>
  );
}
