"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { FotoProfil } from "@/components/shared/foto-profil";
import { KolomCari } from "@/components/shared/kolom-cari";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { useDaftarKelas } from "@/lib/api/kelas";
import { useDaftarMurid } from "@/lib/api/murid";
import { LABEL_JENIS_KELAMIN, LABEL_STATUS_MURID, LABEL_TINGKAT } from "@/lib/constants/label";
import { NADA_STATUS_MURID } from "@/lib/constants/status";
import { formatTanggal } from "@/lib/format";
import type { Murid } from "@/types/domain";

const STATUS = ["aktif", "lulus", "pindah", "keluar"] as const;
const TINGKAT = ["A", "B"] as const;
const KELAS_SELECT = "h-11 rounded-md border border-input bg-card px-3 text-sm";

function Identitas({ murid }: { murid: Murid }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={40} className="size-10 text-sm" />
      <div className="min-w-0">
        <Link href={`/dashboard/murid/${murid.id}`} className="block truncate font-bold hover:underline">
          {murid.nama_lengkap}
        </Link>
        <p className="text-xs text-muted-foreground">{murid.nama_panggilan}</p>
      </div>
    </div>
  );
}

const KOLOM: ColumnDef<Murid>[] = [
  { id: "murid", header: "Murid", cell: ({ row }) => <Identitas murid={row.original} /> },
  { id: "nis", header: "NIS", cell: ({ row }) => <span className="tabular-nums">{row.original.nis}</span> },
  { id: "kelas", header: "Kelas", cell: ({ row }) => row.original.kelas?.nama ?? <span className="text-muted-foreground">Belum ada</span> },
  { id: "jk", header: "L/P", cell: ({ row }) => LABEL_JENIS_KELAMIN[row.original.jenis_kelamin] },
  { id: "lahir", header: "Tanggal lahir", cell: ({ row }) => formatTanggal(row.original.tanggal_lahir) },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge nada={NADA_STATUS_MURID[row.original.status]}>{LABEL_STATUS_MURID[row.original.status]}</StatusBadge>,
  },
];

export function DaftarMurid() {
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [kelasId, setKelasId] = useQueryState("kelas", parseAsInteger);
  const [status, setStatus] = useQueryState("status", parseAsStringLiteral(STATUS));
  const [tingkat, setTingkat] = useQueryState("tingkat", parseAsStringLiteral(TINGKAT));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const kelas = useDaftarKelas(null);
  const daftar = useDaftarMurid({ search: cari, halaman, kelasId, status, tingkat });
  const kelasTahunAktif = (kelas.data ?? []).filter((item) => item.tahun_ajaran.is_aktif);
  const adaFilter = cari || kelasId || status || tingkat;

  const ubahFilter = (ubah: () => unknown) => {
    ubah();
    void setHalaman(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <KolomCari nilai={cari} onUbah={(nilai) => ubahFilter(() => setCari(nilai || null))} label="Cari murid" placeholder="Cari nama atau NIS" />
        <select aria-label="Saring kelas" className={KELAS_SELECT} value={kelasId ?? ""} onChange={(e) => ubahFilter(() => setKelasId(e.target.value ? Number(e.target.value) : null))}>
          <option value="">Semua kelas</option>
          {kelasTahunAktif.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama}
            </option>
          ))}
        </select>
        <select
          aria-label="Saring kelompok"
          className={KELAS_SELECT}
          value={tingkat ?? ""}
          onChange={(e) => ubahFilter(() => setTingkat(TINGKAT.find((nilai) => nilai === e.target.value) ?? null))}
        >
          <option value="">Semua kelompok</option>
          {TINGKAT.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_TINGKAT[nilai]}
            </option>
          ))}
        </select>
        <select
          aria-label="Saring status"
          className={KELAS_SELECT}
          value={status ?? ""}
          onChange={(e) => ubahFilter(() => setStatus(STATUS.find((nilai) => nilai === e.target.value) ?? null))}
        >
          <option value="">Semua status</option>
          {STATUS.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_STATUS_MURID[nilai]}
            </option>
          ))}
        </select>
      </div>
      <TabelData
        label="Daftar murid"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(murid) => murid.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kosong={<EmptyState judul={adaFilter ? "Tidak ada murid yang cocok dengan saringan." : "Belum ada data murid."} />}
        kartu={(murid) => (
          <Link href={`/dashboard/murid/${murid.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={44} className="size-11 text-sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{murid.nama_lengkap}</span>
              <span className="block text-xs text-muted-foreground">
                <span className="tabular-nums">{murid.nis}</span> · {murid.kelas?.nama ?? "Belum ada kelas"}
              </span>
            </span>
            <StatusBadge nada={NADA_STATUS_MURID[murid.status]}>{LABEL_STATUS_MURID[murid.status]}</StatusBadge>
          </Link>
        )}
      />
    </div>
  );
}
