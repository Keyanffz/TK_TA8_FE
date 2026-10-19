"use client";

import { Download } from "lucide-react";
import Link from "next/link";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button, buttonVariants } from "@/components/ui/button";
import { simpanBlob } from "@/lib/api/unduh";
import type { BarisImportMurid, HasilImportMurid } from "@/types/domain";

function selCsv(nilai: string): string {
  return /[",\r\n]/.test(nilai) ? `"${nilai.replaceAll('"', '""')}"` : nilai;
}

/**
 * Baris gagal dengan kolom yang sama seperti template ditambah kolom `alasan`. Import mengabaikan kolom di luar
 * template, jadi file ini bisa diperbaiki lalu diunggah ulang. BOM supaya Excel membacanya sebagai UTF-8.
 */
function laporanCsv(gagal: BarisImportMurid[]): Blob {
  const kolom = Object.keys(gagal[0]?.data ?? {});
  const baris = gagal.map((item) => [...kolom.map((nama) => item.data[nama as keyof typeof item.data] ?? ""), item.alasan.join("; ")].map(selCsv).join(","));
  return new Blob([`﻿${[[...kolom, "alasan"].join(","), ...baris].join("\r\n")}`], { type: "text/csv;charset=utf-8" });
}

export function HasilImport({ hasil, namaFile, onUlang }: { hasil: HasilImportMurid; namaFile: string; onUlang: () => void }) {
  const jumlahGagal = hasil.gagal.length;

  return (
    <div className="flex flex-col gap-4">
      <KotakPesan nada={hasil.dibuat > 0 ? "sukses" : "menunggu"} judul={`${hasil.dibuat} murid diimpor`}>
        {hasil.akun_wali_dibuat > 0
          ? `${hasil.akun_wali_dibuat} akun wali dibuat untuk murid aktif (username NIS, password awal tanggal lahir anak). Kartu akun bisa diunduh dari halaman detail murid.`
          : "Tidak ada akun wali baru; murid lulus, pindah, dan keluar tidak dibuatkan akun."}
      </KotakPesan>
      {jumlahGagal > 0 ? (
        <KotakPesan nada="bahaya" judul={`${jumlahGagal} baris tidak diimpor`}>
          <p>Unduh laporannya, perbaiki baris sesuai kolom alasan, lalu impor ulang file laporan itu.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => simpanBlob(laporanCsv(hasil.gagal), `gagal-${namaFile.replace(/\.[^.]+$/, "")}.csv`)}>
            <Download aria-hidden="true" />
            Unduh Laporan Baris Gagal
          </Button>
        </KotakPesan>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Link href="/mudarris/murid" className={buttonVariants()}>
          Lihat Daftar Murid
        </Link>
        <Button variant="outline" onClick={onUlang}>
          Impor File Lain
        </Button>
      </div>
    </div>
  );
}
