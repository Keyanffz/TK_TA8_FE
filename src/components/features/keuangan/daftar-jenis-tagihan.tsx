"use client";

import { Pencil, Trash2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { toast } from "sonner";

import { FormJenisTagihan } from "@/components/features/keuangan/form-jenis-tagihan";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDaftarJenisTagihan, useHapusJenisTagihan } from "@/lib/api/jenis-tagihan";
import { useDaftarTahunAjaran } from "@/lib/api/tahun-ajaran";
import { LABEL_PERIODE_TAGIHAN, LABEL_TINGKAT } from "@/lib/constants/label";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { JenisTagihan } from "@/types/domain";

function Aksi({ jenis }: { jenis: JenisTagihan }) {
  const hapus = useHapusJenisTagihan();
  return (
    <div className="flex justify-end gap-1">
      <FormJenisTagihan
        jenis={jenis}
        tahunAjaranId={jenis.tahun_ajaran.id}
        pemicu={
          <Button variant="ghost" size="icon" aria-label={`Ubah ${jenis.nama}`}>
            <Pencil aria-hidden="true" />
          </Button>
        }
      />
      <DialogKonfirmasi
        pemicu={
          <Button variant="ghost" size="icon" aria-label={`Hapus ${jenis.nama}`}>
            <Trash2 aria-hidden="true" />
          </Button>
        }
        judul={`Hapus ${jenis.nama}?`}
        deskripsi="Jenis tagihan yang sudah punya tagihan tidak bisa dihapus; nonaktifkan saja supaya tidak dipakai lagi."
        labelAksi="Hapus"
        berbahaya
        onKonfirmasi={async () => {
          await hapus.mutateAsync(jenis.id);
          toast.success(`${jenis.nama} dihapus.`);
        }}
      />
    </div>
  );
}

/** Jenis tagihan per tahun ajaran (SA). Jumlahnya sedikit, jadi ditampilkan tanpa paginasi. */
export function DaftarJenisTagihan() {
  const tahunAjaran = useDaftarTahunAjaran();
  const [taDipilih, setTaDipilih] = useQueryState("ta", parseAsInteger);
  const taId = taDipilih ?? tahunAjaran.data?.find((ta) => ta.is_aktif)?.id ?? null;
  const jenis = useDaftarJenisTagihan(taId, taId !== null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Tahun ajaran</span>
          <select
            value={taId ?? ""}
            onChange={(event) => void setTaDipilih(event.target.value ? Number(event.target.value) : null)}
            className="h-10 rounded-md border border-input bg-card px-3 font-bold"
          >
            {(tahunAjaran.data ?? []).map((ta) => (
              <option key={ta.id} value={ta.id}>
                {ta.nama}
                {ta.is_aktif ? " (aktif)" : ""}
              </option>
            ))}
          </select>
        </label>
        <FormJenisTagihan jenis={null} tahunAjaranId={taId} pemicu={<Button>Tambah Jenis Tagihan</Button>} />
      </div>
      {jenis.isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : jenis.isError ? (
        <GalatMuat error={jenis.error} onCobaLagi={() => void jenis.refetch()} />
      ) : jenis.data.length === 0 ? (
        <EmptyState judul="Belum ada jenis tagihan di tahun ajaran ini." deskripsi="Tambahkan SPP bulanan dan tagihan sekali bayar seperti uang pangkal atau seragam." />
      ) : (
        <div className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", jenis.isPlaceholderData && "opacity-60")}>
          <Table aria-label="Jenis tagihan">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nama</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Berlaku untuk</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jenis.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-bold">{item.nama}</p>
                    {item.deskripsi ? <p className="max-w-xs truncate text-xs text-muted-foreground">{item.deskripsi}</p> : null}
                  </TableCell>
                  <TableCell>{LABEL_PERIODE_TAGIHAN[item.periode]}</TableCell>
                  <TableCell>{item.tingkat ? LABEL_TINGKAT[item.tingkat] : "Semua kelompok"}</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">{formatRupiah(item.nominal)}</TableCell>
                  <TableCell>{item.is_aktif ? <StatusBadge nada="sukses">Aktif</StatusBadge> : <StatusBadge nada="netral">Nonaktif</StatusBadge>}</TableCell>
                  <TableCell>
                    <Aksi jenis={item} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
