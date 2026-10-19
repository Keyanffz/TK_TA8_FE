"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";

import { DialogUbahStatus } from "@/components/features/murid/dialog-ubah-status";
import { EmptyState } from "@/components/shared/empty-state";
import { FotoProfil } from "@/components/shared/foto-profil";
import { KolomCari } from "@/components/shared/kolom-cari";
import { KELAS_KONTROL_SARINGAN } from "@/components/shared/kolom-teks";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { Button } from "@/components/ui/button";
import { useDaftarKelas } from "@/lib/api/kelas";
import { useDaftarMurid, useUbahStatusMassal } from "@/lib/api/murid";
import { LABEL_JENIS_KELAMIN, LABEL_STATUS_MURID, LABEL_TINGKAT, STATUS_MURID } from "@/lib/constants/label";
import { NADA_STATUS_MURID } from "@/lib/constants/status";
import { formatTanggal } from "@/lib/format";
import type { Murid } from "@/types/domain";

const TINGKAT = ["A", "B"] as const;
const KELAS_CENTANG = "size-5 accent-primary";

export function IdentitasMurid({ murid }: { murid: Murid }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={40} className="size-10 text-sm" />
      <div className="min-w-0">
        <Link href={`/mudarris/murid/${murid.id}`} className="block truncate font-bold hover:underline">
          {murid.nama_lengkap}
        </Link>
        <p className="text-xs text-muted-foreground">{murid.nama_panggilan}</p>
      </div>
    </div>
  );
}

const KOLOM: ColumnDef<Murid>[] = [
  { id: "murid", header: "Murid", cell: ({ row }) => <IdentitasMurid murid={row.original} /> },
  { id: "nis", header: "NIS", cell: ({ row }) => <span className="tabular-nums">{row.original.nis}</span> },
  { id: "kelas", header: "Kelas", cell: ({ row }) => row.original.kelas?.nama ?? <span className="text-muted-foreground">Belum ada</span> },
  { id: "jk", header: "Jenis kelamin", cell: ({ row }) => LABEL_JENIS_KELAMIN[row.original.jenis_kelamin] },
  { id: "lahir", header: "Tanggal lahir", cell: ({ row }) => formatTanggal(row.original.tanggal_lahir) },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge nada={NADA_STATUS_MURID[row.original.status]}>{LABEL_STATUS_MURID[row.original.status]}</StatusBadge>,
  },
];

/** `bisaKelola` (izin kelola data murid) menampilkan kotak centang untuk mengubah status beberapa murid sekaligus. */
export function DaftarMurid({ bisaKelola }: { bisaKelola: boolean }) {
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [kelasId, setKelasId] = useQueryState("kelas", parseAsInteger);
  const [status, setStatus] = useQueryState("status", parseAsStringLiteral(STATUS_MURID));
  const [tingkat, setTingkat] = useQueryState("tingkat", parseAsStringLiteral(TINGKAT));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const [dipilih, setDipilih] = useState<number[]>([]);
  const kelas = useDaftarKelas(null);
  const daftar = useDaftarMurid({ search: cari, halaman, kelasId, status, tingkat });
  const massal = useUbahStatusMassal();
  const kelasTahunAktif = (kelas.data ?? []).filter((item) => item.tahun_ajaran.is_aktif);
  const adaFilter = cari || kelasId || status || tingkat;
  const idHalaman = (daftar.data?.data ?? []).map((murid) => murid.id);
  const semuaDipilih = idHalaman.length > 0 && idHalaman.every((id) => dipilih.includes(id));

  // Pilihan hanya berlaku untuk murid yang sedang tampil, jadi dikosongkan setiap saringan atau halaman berubah.
  const ubahFilter = (ubah: () => unknown) => {
    ubah();
    setDipilih([]);
    void setHalaman(null);
  };
  const centang = (id: number, aktif: boolean) => setDipilih(aktif ? [...dipilih, id] : dipilih.filter((nilai) => nilai !== id));

  const kolomPilih: ColumnDef<Murid> = {
    id: "pilih",
    header: () => (
      <input
        type="checkbox"
        aria-label="Pilih semua murid di halaman ini"
        className={KELAS_CENTANG}
        checked={semuaDipilih}
        onChange={(event) => setDipilih(event.target.checked ? idHalaman : [])}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`Pilih ${row.original.nama_lengkap}`}
        className={KELAS_CENTANG}
        checked={dipilih.includes(row.original.id)}
        onChange={(event) => centang(row.original.id, event.target.checked)}
      />
    ),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <KolomCari nilai={cari} onUbah={(nilai) => ubahFilter(() => setCari(nilai || null))} label="Cari murid" placeholder="Cari nama atau NIS" />
        <select aria-label="Saring kelas" className={KELAS_KONTROL_SARINGAN} value={kelasId ?? ""} onChange={(e) => ubahFilter(() => setKelasId(e.target.value ? Number(e.target.value) : null))}>
          <option value="">Semua kelas</option>
          {kelasTahunAktif.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama}
            </option>
          ))}
        </select>
        <select
          aria-label="Saring kelompok"
          className={KELAS_KONTROL_SARINGAN}
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
          className={KELAS_KONTROL_SARINGAN}
          value={status ?? ""}
          onChange={(e) => ubahFilter(() => setStatus(STATUS_MURID.find((nilai) => nilai === e.target.value) ?? null))}
        >
          <option value="">Semua status</option>
          {STATUS_MURID.map((nilai) => (
            <option key={nilai} value={nilai}>
              {LABEL_STATUS_MURID[nilai]}
            </option>
          ))}
        </select>
      </div>
      {dipilih.length > 0 ? (
        <div className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary bg-primary-soft p-3 shadow-md">
          <p className="font-bold">{dipilih.length} murid dipilih</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setDipilih([])}>
              Batal Pilih
            </Button>
            <DialogUbahStatus
              judul={`Ubah status ${dipilih.length} murid`}
              deskripsi="Murid yang statusnya sudah sama dilewati. Semua perubahan disimpan sekaligus; kalau satu murid ditolak, tidak ada yang berubah."
              pemicu={<Button>Ubah Status</Button>}
              kirim={async (isian) => {
                const { message } = await massal.mutateAsync({ ...isian, murid_ids: dipilih });
                setDipilih([]);
                return message;
              }}
            />
          </div>
        </div>
      ) : null}
      <TabelData
        label="Daftar murid"
        kolom={bisaKelola ? [kolomPilih, ...KOLOM] : KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(murid) => murid.id}
        onUbahHalaman={(nomor) => {
          setDipilih([]);
          void setHalaman(nomor);
        }}
        kelasKolom={{ pilih: "w-10" }}
        kosong={<EmptyState judul={adaFilter ? "Tidak ada murid yang cocok dengan saringan." : "Belum ada data murid."} />}
        kartu={(murid) => (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            {bisaKelola ? (
              <input
                type="checkbox"
                aria-label={`Pilih ${murid.nama_lengkap}`}
                className={KELAS_CENTANG}
                checked={dipilih.includes(murid.id)}
                onChange={(event) => centang(murid.id, event.target.checked)}
              />
            ) : null}
            <Link href={`/mudarris/murid/${murid.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={44} className="size-11 text-sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{murid.nama_lengkap}</span>
                <span className="block text-xs text-muted-foreground">
                  <span className="tabular-nums">{murid.nis}</span> · {murid.kelas?.nama ?? "Belum ada kelas"}
                </span>
              </span>
            </Link>
            <StatusBadge nada={NADA_STATUS_MURID[murid.status]}>{LABEL_STATUS_MURID[murid.status]}</StatusBadge>
          </div>
        )}
      />
    </div>
  );
}
