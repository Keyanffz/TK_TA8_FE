"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNis } from "@/lib/format";
import type { BarisNis } from "@/types/domain";

/** Hasil pemeriksaan file NIS per baris, dengan pola yang sama seperti pratinjau import murid. */
export function TabelPratinjauNis({ baris, label }: { baris: BarisNis[]; label: string }) {
  const jumlahBermasalah = baris.filter((item) => !item.valid).length;
  const [hanyaBermasalah, setHanyaBermasalah] = useState(jumlahBermasalah > 0 && jumlahBermasalah < baris.length);
  const tampil = hanyaBermasalah ? baris.filter((item) => !item.valid) : baris;

  return (
    <div className="flex flex-col gap-3">
      {jumlahBermasalah > 0 && jumlahBermasalah < baris.length ? (
        <label className="flex min-h-11 cursor-pointer items-center gap-2 self-end text-sm">
          <input type="checkbox" className="size-5 accent-primary" checked={hanyaBermasalah} onChange={(event) => setHanyaBermasalah(event.target.checked)} />
          Tampilkan hanya baris bermasalah
        </label>
      ) : null}
      <div className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-card shadow-sm">
        <Table aria-label={label}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">Baris</TableHead>
              <TableHead>Nama lengkap</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead>Hasil pemeriksaan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tampil.map((item) => (
              <TableRow key={item.nomor} className={item.valid ? undefined : "bg-status-bahaya-soft/40"}>
                <TableCell className="tabular-nums">{item.nomor}</TableCell>
                <TableCell className="font-bold">{item.nama_lengkap ?? "-"}</TableCell>
                <TableCell className="tabular-nums">{formatNis(item.nis)}</TableCell>
                <TableCell>
                  {item.valid ? (
                    <StatusBadge nada="sukses">{item.akun_wali ? "Siap, akun wali dibuat" : "Siap disimpan"}</StatusBadge>
                  ) : (
                    <ul className="flex list-disc flex-col gap-0.5 pl-4 text-sm text-status-bahaya">
                      {item.alasan.map((alasan) => (
                        <li key={alasan}>{alasan}</li>
                      ))}
                    </ul>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
