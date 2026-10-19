"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BarisImportMurid, PratinjauImportMurid } from "@/types/domain";

function Keterangan({ baris }: { baris: BarisImportMurid }) {
  const { status, kelas, tahun_lulus: tahunLulus } = baris.data;
  if (status === "aktif") return <>Aktif{kelas ? `, ${kelas}` : ", tanpa kelas"}</>;
  return (
    <>
      {status}
      {tahunLulus ? ` ${tahunLulus}` : ""}
    </>
  );
}

/** Hasil pemeriksaan per baris; baris invalid ditandai beserta alasannya. Baris valid boleh disembunyikan. */
export function TabelPratinjau({ pratinjau }: { pratinjau: PratinjauImportMurid }) {
  const [hanyaBermasalah, setHanyaBermasalah] = useState(pratinjau.ringkasan.invalid > 0);
  const baris = hanyaBermasalah ? pratinjau.baris.filter((item) => !item.valid) : pratinjau.baris;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap gap-2 text-sm">
          <span className="font-bold">{pratinjau.ringkasan.total} baris</span>
          <StatusBadge nada="sukses">{pratinjau.ringkasan.valid} valid</StatusBadge>
          <StatusBadge nada={pratinjau.ringkasan.invalid > 0 ? "bahaya" : "netral"}>{pratinjau.ringkasan.invalid} bermasalah</StatusBadge>
        </p>
        {pratinjau.ringkasan.invalid > 0 ? (
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="size-5 accent-primary" checked={hanyaBermasalah} onChange={(event) => setHanyaBermasalah(event.target.checked)} />
            Tampilkan hanya baris bermasalah
          </label>
        ) : null}
      </div>
      <div className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-card shadow-sm">
        <Table aria-label="Pratinjau import murid">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">Baris</TableHead>
              <TableHead>Nama lengkap</TableHead>
              <TableHead>NISN</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hasil pemeriksaan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {baris.map((item) => (
              <TableRow key={item.nomor} className={item.valid ? undefined : "bg-status-bahaya-soft/40"}>
                <TableCell className="tabular-nums">{item.nomor}</TableCell>
                <TableCell className="font-bold">{item.data.nama_lengkap ?? "-"}</TableCell>
                <TableCell className="tabular-nums">{item.data.nisn ?? "-"}</TableCell>
                <TableCell className="capitalize">
                  <Keterangan baris={item} />
                </TableCell>
                <TableCell>
                  {item.valid ? (
                    <StatusBadge nada="sukses">Siap diimpor</StatusBadge>
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
