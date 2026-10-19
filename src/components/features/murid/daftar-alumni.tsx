"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IdentitasMurid } from "@/components/features/murid/daftar-murid";
import { EmptyState } from "@/components/shared/empty-state";
import { KolomCari } from "@/components/shared/kolom-cari";
import { KELAS_KONTROL_SARINGAN } from "@/components/shared/kolom-teks";
import { TabelData } from "@/components/shared/tabel-data";
import { useDaftarMurid, useTahunLulus } from "@/lib/api/murid";
import { formatTanggal } from "@/lib/format";
import type { Murid } from "@/types/domain";

const KOLOM: ColumnDef<Murid>[] = [
  { id: "murid", header: "Murid", cell: ({ row }) => <IdentitasMurid murid={row.original} /> },
  { id: "nis", header: "NIS", cell: ({ row }) => <span className="tabular-nums">{row.original.nis}</span> },
  { id: "tahun", header: "Tahun lulus", cell: ({ row }) => <span className="font-bold tabular-nums">{row.original.tahun_lulus ?? "-"}</span> },
  { id: "tanggal", header: "Tanggal lulus", cell: ({ row }) => (row.original.tanggal_keluar ? formatTanggal(row.original.tanggal_keluar) : "-") },
  { id: "keterangan", header: "Keterangan", cell: ({ row }) => <span className="line-clamp-2 max-w-xs">{row.original.keterangan_status ?? "-"}</span> },
];

/** Murid berstatus lulus, disaring per tahun lulus (A2.14). */
export function DaftarAlumni() {
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [tahun, setTahun] = useQueryState("tahun", parseAsInteger);
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const pilihanTahun = useTahunLulus();
  const daftar = useDaftarMurid({ search: cari, halaman, kelasId: null, status: "lulus", tingkat: null, tahunLulus: tahun });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <KolomCari
          nilai={cari}
          onUbah={(nilai) => {
            void setCari(nilai || null);
            void setHalaman(null);
          }}
          label="Cari alumni"
          placeholder="Cari nama, NIS, atau NISN"
        />
        <select
          aria-label="Saring tahun lulus"
          className={KELAS_KONTROL_SARINGAN}
          value={tahun ?? ""}
          onChange={(e) => {
            void setTahun(e.target.value ? Number(e.target.value) : null);
            void setHalaman(null);
          }}
        >
          <option value="">Semua tahun lulus</option>
          {(pilihanTahun.data ?? []).map((nilai) => (
            <option key={nilai} value={nilai}>
              Lulus {nilai}
            </option>
          ))}
        </select>
      </div>
      <TabelData
        label="Daftar alumni"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(murid) => murid.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kosong={
          <EmptyState
            judul={cari || tahun ? "Tidak ada alumni yang cocok dengan saringan." : "Belum ada alumni tercatat."}
            deskripsi={cari || tahun ? undefined : "Alumni muncul setelah murid diluluskan, atau setelah data alumni lama diimpor dari Excel."}
          />
        }
        kartu={(murid) => (
          <Link href={`/mudarris/murid/${murid.id}`} className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="font-bold">{murid.nama_lengkap}</span>
            <span className="text-sm text-muted-foreground">
              <span className="tabular-nums">{murid.nis}</span> · Lulus {murid.tahun_lulus ?? "-"}
              {murid.tanggal_keluar ? ` (${formatTanggal(murid.tanggal_keluar)})` : ""}
            </span>
          </Link>
        )}
      />
    </div>
  );
}
