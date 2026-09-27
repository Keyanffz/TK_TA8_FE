"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { FormKeringanan } from "@/components/features/keuangan/form-keringanan";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { KolomCari } from "@/components/shared/kolom-cari";
import { TabelData } from "@/components/shared/tabel-data";
import { Button } from "@/components/ui/button";
import { useDaftarKeringanan, useHapusKeringanan } from "@/lib/api/keringanan";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { Keringanan } from "@/types/domain";

function nilaiPotongan(keringanan: Keringanan): string {
  return keringanan.tipe === "persen" ? `${keringanan.nilai}%` : formatRupiah(keringanan.nilai);
}

function masaBerlaku(keringanan: Keringanan): string {
  return keringanan.berlaku_sampai
    ? `${formatTanggal(keringanan.berlaku_mulai)} – ${formatTanggal(keringanan.berlaku_sampai)}`
    : `Mulai ${formatTanggal(keringanan.berlaku_mulai)}`;
}

function Aksi({ keringanan }: { keringanan: Keringanan }) {
  const hapus = useHapusKeringanan();
  return (
    <div className="flex justify-end gap-1">
      <FormKeringanan
        keringanan={keringanan}
        pemicu={
          <Button variant="ghost" size="icon" aria-label={`Ubah keringanan ${keringanan.murid.nama_lengkap}`}>
            <Pencil aria-hidden="true" />
          </Button>
        }
      />
      <DialogKonfirmasi
        pemicu={
          <Button variant="ghost" size="icon" aria-label={`Hapus keringanan ${keringanan.murid.nama_lengkap}`}>
            <Trash2 aria-hidden="true" />
          </Button>
        }
        judul="Hapus keringanan ini?"
        deskripsi={`Tagihan ${keringanan.jenis_tagihan.nama} ${keringanan.murid.nama_lengkap} berikutnya dibuat tanpa potongan. Tagihan yang sudah ada tidak berubah.`}
        labelAksi="Hapus"
        berbahaya
        onKonfirmasi={async () => {
          await hapus.mutateAsync(keringanan.id);
          toast.success("Keringanan dihapus.");
        }}
      />
    </div>
  );
}

const KOLOM: ColumnDef<Keringanan>[] = [
  {
    id: "murid",
    header: "Murid",
    cell: ({ row }) => (
      <span>
        <span className="block font-bold">{row.original.murid.nama_lengkap}</span>
        <span className="block text-xs text-muted-foreground tabular-nums">{row.original.murid.nis}</span>
      </span>
    ),
  },
  { id: "jenis", header: "Jenis tagihan", cell: ({ row }) => row.original.jenis_tagihan.nama },
  { id: "potongan", header: "Potongan", cell: ({ row }) => <span className="font-bold tabular-nums">{nilaiPotongan(row.original)}</span> },
  { id: "alasan", header: "Alasan", cell: ({ row }) => <span className="line-clamp-2 max-w-xs">{row.original.alasan}</span> },
  { id: "berlaku", header: "Berlaku", cell: ({ row }) => masaBerlaku(row.original) },
  { id: "aksi", header: () => <span className="sr-only">Aksi</span>, cell: ({ row }) => <Aksi keringanan={row.original} /> },
];

export function DaftarKeringanan() {
  const [cari, setCari] = useQueryState("cari", parseAsString.withDefault(""));
  const [halaman, setHalaman] = useQueryState("page", parseAsInteger.withDefault(1));
  const daftar = useDaftarKeringanan({ halaman, search: cari });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <KolomCari
          nilai={cari}
          onUbah={(nilai) => {
            void setCari(nilai || null);
            void setHalaman(null);
          }}
          label="Cari keringanan"
          placeholder="Cari nama murid"
          className="w-full sm:max-w-sm"
        />
        <FormKeringanan keringanan={null} pemicu={<Button>Tambah Keringanan</Button>} />
      </div>
      <TabelData
        label="Daftar keringanan"
        kolom={KOLOM}
        data={daftar.data}
        memuat={daftar.isPending}
        galat={daftar.error}
        onCobaLagi={() => void daftar.refetch()}
        redup={daftar.isPlaceholderData}
        idBaris={(item) => item.id}
        onUbahHalaman={(nomor) => void setHalaman(nomor)}
        kelasKolom={{ potongan: "text-right" }}
        kosong={<EmptyState judul={cari ? "Tidak ada keringanan yang cocok." : "Belum ada keringanan."} deskripsi="Keringanan memotong tagihan otomatis saat tagihan dibuat." />}
        kartu={(item) => (
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold">{item.murid.nama_lengkap}</span>
              <span className="font-heading font-extrabold tabular-nums">{nilaiPotongan(item)}</span>
            </div>
            <span className="text-sm">{item.jenis_tagihan.nama} · {item.alasan}</span>
            <span className="text-xs text-muted-foreground">{masaBerlaku(item)}</span>
            <Aksi keringanan={item} />
          </div>
        )}
      />
    </div>
  );
}
