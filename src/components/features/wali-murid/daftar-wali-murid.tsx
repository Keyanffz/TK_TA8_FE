"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { EmptyState } from "@/components/shared/empty-state";
import { KolomCari } from "@/components/shared/kolom-cari";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { useDaftarWaliMurid } from "@/lib/api/wali-murid";
import { LABEL_STATUS_AKUN } from "@/lib/constants/label";
import { NADA_STATUS_AKUN } from "@/lib/constants/status";
import type { WaliMurid } from "@/types/domain";

function Keadaan({ wali }: { wali: WaliMurid }) {
  return (
    <div className="flex flex-wrap gap-1">
      <StatusBadge nada={NADA_STATUS_AKUN[wali.user.status]}>{LABEL_STATUS_AKUN[wali.user.status]}</StatusBadge>
      {wali.user.wajib_ganti_password ? <StatusBadge nada="menunggu">Belum ganti password</StatusBadge> : null}
      {!wali.user.wajib_ganti_password && !wali.profil_lengkap ? <StatusBadge nada="netral">Profil belum lengkap</StatusBadge> : null}
    </div>
  );
}

const KOLOM: ColumnDef<WaliMurid>[] = [
  {
    id: "wali",
    header: "Wali murid",
    cell: ({ row }) => (
      <Link href={`/dashboard/wali-murid/${row.original.id}`} className="font-bold hover:underline">
        {row.original.user.name}
      </Link>
    ),
  },
  { id: "username", header: "Username (NIS)", cell: ({ row }) => <span className="tabular-nums">{row.original.user.username ?? "-"}</span> },
  { id: "hp", header: "Nomor HP", cell: ({ row }) => <span className="tabular-nums">{row.original.user.no_hp ?? "-"}</span> },
  { id: "anak", header: "Anak", cell: ({ row }) => <span className="tabular-nums">{row.original.jumlah_anak}</span> },
  { id: "keadaan", header: "Keadaan akun", cell: ({ row }) => <Keadaan wali={row.original} /> },
];

export function DaftarWaliMurid() {
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const daftar = useDaftarWaliMurid({ search: cari, halaman });

  return (
    <div className="flex flex-col gap-4">
      <KolomCari
        nilai={cari}
        onUbah={(nilai) => {
          void setCari(nilai || null);
          void setHalaman(null);
        }}
        label="Cari wali murid"
        placeholder="Cari nama, NIS, atau nomor HP"
        className="w-full sm:max-w-sm"
      />
      <TabelData
        label="Daftar wali murid"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(wali) => wali.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kelasKolom={{ anak: "text-right" }}
        kosong={<EmptyState judul={cari ? `Tidak ada wali yang cocok dengan "${cari}".` : "Belum ada wali murid."} />}
        kartu={(wali) => (
          <Link href={`/dashboard/wali-murid/${wali.id}`} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="font-bold">{wali.user.name}</span>
            <span className="text-sm text-muted-foreground">
              <span className="tabular-nums">{wali.user.username ?? "-"}</span> · {wali.jumlah_anak} anak ·{" "}
              <span className="tabular-nums">{wali.user.no_hp ?? "tanpa nomor HP"}</span>
            </span>
            <Keadaan wali={wali} />
          </Link>
        )}
      />
    </div>
  );
}
