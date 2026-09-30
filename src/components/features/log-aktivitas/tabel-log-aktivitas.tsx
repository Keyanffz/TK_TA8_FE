"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { TabelData } from "@/components/shared/tabel-data";
import { useLogAktivitas, type JenisLog } from "@/lib/api/log-aktivitas";
import { LABEL_ROLE } from "@/lib/constants/label";
import { formatTanggalWaktu } from "@/lib/format";
import type { components } from "@/types/api";

type Log = components["schemas"]["LogAktivitasResource"];

const JENIS = ["akun", "guru", "wali", "tagihan", "pembayaran", "rapor", "ppdb", "pengaturan"] as const satisfies readonly JenisLog[];
const LABEL_JENIS: Record<JenisLog, string> = {
  akun: "Akun",
  guru: "Guru",
  wali: "Wali murid",
  tagihan: "Tagihan",
  pembayaran: "Pembayaran",
  rapor: "Rapor",
  ppdb: "PPDB",
  pengaturan: "Pengaturan",
};

// Subjek log yang punya halaman detail di dashboard.
const HALAMAN_SUBJEK: Record<string, { label: string; href: (id: number) => string }> = {
  murid: { label: "Murid", href: (id) => `/mudarris/murid/${id}` },
  guru: { label: "Guru", href: (id) => `/mudarris/guru/${id}` },
  wali_murid: { label: "Wali murid", href: (id) => `/mudarris/wali-murid/${id}` },
  tagihan: { label: "Tagihan", href: (id) => `/mudarris/tagihan/${id}` },
  rapor: { label: "Rapor", href: (id) => `/mudarris/rapor/${id}` },
  pendaftaran: { label: "Pendaftaran", href: (id) => `/mudarris/ppdb/${id}` },
};

function Pelaku({ log }: { log: Log }) {
  if (!log.pelaku) return <span className="text-muted-foreground">Sistem</span>;
  const role = log.pelaku.role;
  return (
    <span>
      <span className="block font-bold">{log.pelaku.nama}</span>
      <span className="block text-xs text-muted-foreground">{role === "super_admin" || role === "guru" || role === "wali_murid" ? LABEL_ROLE[role] : role}</span>
    </span>
  );
}

function Subjek({ log }: { log: Log }) {
  if (!log.subjek) return <span className="text-muted-foreground">-</span>;
  const halaman = HALAMAN_SUBJEK[log.subjek.tipe];
  if (!halaman) return <span className="text-muted-foreground">{log.subjek.tipe.replace(/_/g, " ")}</span>;
  return (
    <Link href={halaman.href(log.subjek.id)} className="font-bold text-primary-strong hover:underline">
      {halaman.label}
    </Link>
  );
}

const KOLOM: ColumnDef<Log>[] = [
  { id: "waktu", header: "Waktu", cell: ({ row }) => <span className="whitespace-nowrap">{row.original.created_at ? formatTanggalWaktu(row.original.created_at) : "-"}</span> },
  { id: "pelaku", header: "Pelaku", cell: ({ row }) => <Pelaku log={row.original} /> },
  {
    id: "jenis",
    header: "Jenis",
    cell: ({ row }) => {
      const jenis = JENIS.find((item) => item === row.original.jenis);
      return jenis ? LABEL_JENIS[jenis] : row.original.jenis;
    },
  },
  { id: "deskripsi", header: "Aktivitas", cell: ({ row }) => <span className="block max-w-md">{row.original.deskripsi}</span> },
  { id: "subjek", header: "Data", cell: ({ row }) => <Subjek log={row.original} /> },
];

const KELAS_SELECT = "h-11 rounded-md border border-input bg-card px-3 text-sm";

/** Log aktivitas (Kepala Sekolah): siapa melakukan apa, terbaru di atas. */
export function TabelLogAktivitas() {
  const [jenis, setJenis] = useQueryState("jenis", parseAsStringLiteral(JENIS));
  const [tanggal, setTanggal] = useQueryState("tanggal", parseAsString);
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const daftar = useLogAktivitas({ halaman, jenis, tanggal });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Saring jenis aktivitas"
          className={KELAS_SELECT}
          value={jenis ?? ""}
          onChange={(event) => {
            void setJenis(JENIS.find((item) => item === event.target.value) ?? null);
            void setHalaman(null);
          }}
        >
          <option value="">Semua jenis</option>
          {JENIS.map((item) => (
            <option key={item} value={item}>
              {LABEL_JENIS[item]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Tanggal</span>
          <input
            type="date"
            className={`${KELAS_SELECT} text-foreground`}
            value={tanggal ?? ""}
            onChange={(event) => {
              void setTanggal(event.target.value || null);
              void setHalaman(null);
            }}
          />
        </label>
      </div>
      <TabelData
        label="Log aktivitas"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(log) => log.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kosong={<EmptyState judul={jenis || tanggal ? "Tidak ada aktivitas dengan saringan ini." : "Belum ada aktivitas tercatat."} />}
        kartu={(log) => (
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground">
              {log.created_at ? formatTanggalWaktu(log.created_at) : "-"} · {log.pelaku?.nama ?? "Sistem"}
            </span>
            <span>{log.deskripsi}</span>
            <Subjek log={log} />
          </div>
        )}
      />
    </div>
  );
}
