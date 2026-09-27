"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { GalatMuat } from "@/components/shared/galat-muat";
import { Paginasi } from "@/components/shared/paginasi";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MetaPaginasi } from "@/types/domain";

const BARIS_SKELETON = 5;

type TabelDataProps<T> = {
  kolom: ColumnDef<T, unknown>[];
  /** Hasil query: undefined selama pertama kali memuat. */
  data: { data: T[]; meta: MetaPaginasi } | undefined;
  memuat: boolean;
  galat: unknown;
  onCobaLagi: () => void;
  /** Data lama masih tampil saat pindah halaman/filter. */
  redup?: boolean;
  kosong: ReactNode;
  /** Tampilan satu baris di HP (B8: tabel di mobile berubah jadi kartu). */
  kartu: (baris: T) => ReactNode;
  idBaris: (baris: T) => string | number;
  onUbahHalaman: (halaman: number) => void;
  label: string;
  /** Kelas tambahan per id kolom untuk <th> dan <td>, misalnya perataan angka. */
  kelasKolom?: Record<string, string>;
};

/** Pola DataTable shadcn: tabel di layar lebar, kartu di HP, dengan loading, kosong, error, dan paginasi. */
export function TabelData<T>(props: TabelDataProps<T>) {
  const { kolom, data, memuat, galat, onCobaLagi, redup, kosong, kartu, idBaris, onUbahHalaman, label, kelasKolom = {} } = props;
  const tabel = useReactTable({
    data: data?.data ?? [],
    columns: kolom,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (baris) => String(idBaris(baris)),
    manualPagination: true,
  });

  if (memuat) {
    return (
      <div className="flex flex-col gap-2" aria-label={`Memuat ${label.toLowerCase()}`}>
        {Array.from({ length: BARIS_SKELETON }, (_, indeks) => (
          <Skeleton key={indeks} className="h-14" />
        ))}
      </div>
    );
  }
  if (galat || !data) return <GalatMuat error={galat} onCobaLagi={onCobaLagi} />;
  if (data.data.length === 0) return kosong;

  return (
    <div className={cn("transition-opacity duration-150", redup && "opacity-60")}>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <Table aria-label={label}>
          <TableHeader>
            {tabel.getHeaderGroups().map((grup) => (
              <TableRow key={grup.id} className="hover:bg-transparent">
                {grup.headers.map((kepala) => (
                  <TableHead key={kepala.id} className={kelasKolom[kepala.column.id]}>
                    {kepala.isPlaceholder ? null : flexRender(kepala.column.columnDef.header, kepala.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tabel.getRowModel().rows.map((baris) => (
              <TableRow key={baris.id}>
                {baris.getVisibleCells().map((sel) => (
                  <TableCell key={sel.id} className={kelasKolom[sel.column.id]}>
                    {flexRender(sel.column.columnDef.cell, sel.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul aria-label={label} className="flex flex-col gap-3 md:hidden">
        {data.data.map((baris) => (
          <li key={idBaris(baris)}>{kartu(baris)}</li>
        ))}
      </ul>
      <Paginasi meta={data.meta} onUbah={onUbahHalaman} label={`Halaman ${label.toLowerCase()}`} />
    </div>
  );
}
