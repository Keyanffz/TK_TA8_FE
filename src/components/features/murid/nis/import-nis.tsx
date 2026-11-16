"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

import { TabelPratinjauNis } from "@/components/features/murid/nis/tabel-pratinjau-nis";
import { PenandaLangkah } from "@/components/features/ppdb/penanda-langkah";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ApiError, pesanError } from "@/lib/api/errors";
import { ambilDaftarMenungguNis, usePratinjauImportNis, useSimpanImportNis } from "@/lib/api/murid";
import { simpanBlob } from "@/lib/api/unduh";
import type { HasilSimpanNis, PratinjauNis } from "@/types/domain";

const LANGKAH = ["Unduh Daftar", "Unggah File", "Periksa dan Simpan"] as const;
/** Sama dengan batas backend (`ImportNisMuridRequest`). */
const UKURAN_MAKS_BYTE = 2 * 1024 * 1024;

function pesanGagal(error: unknown): string {
  return error instanceof ApiError ? (error.errors?.file?.[0] ?? error.message) : pesanError(error);
}

/**
 * Isi NIS lewat Excel: unduh daftar murid yang menunggu NIS, isi kolom `nis`, unggah untuk diperiksa per baris, lalu
 * simpan baris valid. File yang sama dikirim lagi saat simpan dan diperiksa ulang oleh backend.
 */
export function ImportNis() {
  const [langkah, setLangkah] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [pratinjau, setPratinjau] = useState<PratinjauNis | null>(null);
  const [hasil, setHasil] = useState<HasilSimpanNis | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [mengunduh, setMengunduh] = useState(false);
  const periksa = usePratinjauImportNis();
  const simpan = useSimpanImportNis();

  const unduhDaftar = async () => {
    setGalat(null);
    setMengunduh(true);
    try {
      simpanBlob(await ambilDaftarMenungguNis(), "murid-menunggu-nis.xlsx");
    } catch (error) {
      setGalat(pesanGagal(error));
    } finally {
      setMengunduh(false);
    }
  };

  const pilihFile = (dipilih: File | undefined) => {
    setGalat(null);
    if (!dipilih) return;
    if (!/\.xlsx$/i.test(dipilih.name)) return setGalat("Pilih file berformat .xlsx, misalnya file dari tombol Unduh Daftar Murid.");
    if (dipilih.size > UKURAN_MAKS_BYTE) return setGalat("Ukuran file maksimal 2 MB. Bagi data menjadi beberapa file.");
    setFile(dipilih);
  };

  const periksaFile = () => {
    if (!file) return setGalat("Pilih file yang sudah diisi.");
    setGalat(null);
    periksa.mutate(file, {
      onSuccess: (data) => {
        setPratinjau(data);
        setLangkah(2);
      },
      onError: (error) => setGalat(pesanGagal(error)),
    });
  };

  const simpanFile = () => {
    if (!file) return;
    setGalat(null);
    simpan.mutate(file, {
      onSuccess: ({ data }) => setHasil(data),
      onError: (error) => setGalat(pesanGagal(error)),
    });
  };

  const ulang = () => {
    setFile(null);
    setPratinjau(null);
    setHasil(null);
    setGalat(null);
    setLangkah(1);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <PenandaLangkah judul={LANGKAH} aktif={hasil ? LANGKAH.length - 1 : langkah} label="Langkah isi NIS lewat Excel" />

      {langkah === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="max-w-prose text-sm">
            File berisi murid aktif yang menunggu NIS. Isi kolom <span className="font-bold">nis</span> saja; jangan ubah kolom{" "}
            <span className="font-bold">id</span> dan <span className="font-bold">nama_lengkap</span>, karena keduanya dipakai untuk mencocokkan
            murid. Kolom NIS sudah berformat teks, jadi angka nol di depan tidak hilang.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void unduhDaftar()} disabled={mengunduh}>
              <Download aria-hidden="true" />
              {mengunduh ? "Menyiapkan..." : "Unduh Daftar Murid"}
            </Button>
            <Button onClick={() => setLangkah(1)}>File Sudah Terisi</Button>
          </div>
        </div>
      ) : null}

      {langkah === 1 ? (
        <div className="flex flex-col gap-4">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-input px-4 py-4 text-center text-sm hover:border-primary hover:bg-primary-soft/50 has-focus-visible:ring-2 has-focus-visible:ring-ring">
            <FileSpreadsheet aria-hidden="true" className="size-6 text-primary-strong" />
            <span className="font-heading font-bold text-primary-strong">{file ? file.name : "Pilih file .xlsx"}</span>
            <span className="text-xs text-muted-foreground">Hanya .xlsx, maksimal 2 MB.</span>
            <input type="file" accept=".xlsx" className="sr-only" onChange={(event) => pilihFile(event.target.files?.[0])} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setLangkah(0)}>
              Kembali
            </Button>
            <Button onClick={periksaFile} disabled={!file || periksa.isPending}>
              {periksa.isPending ? "Memeriksa..." : "Periksa File"}
            </Button>
          </div>
        </div>
      ) : null}

      {langkah === 2 && pratinjau && file && !hasil ? (
        <div className="flex flex-col gap-4">
          <p className="flex flex-wrap gap-2 text-sm">
            <span className="font-bold">{pratinjau.ringkasan.total} baris</span>
            <StatusBadge nada="sukses">{pratinjau.ringkasan.valid} valid</StatusBadge>
            <StatusBadge nada={pratinjau.ringkasan.invalid > 0 ? "bahaya" : "netral"}>{pratinjau.ringkasan.invalid} bermasalah</StatusBadge>
          </p>
          <TabelPratinjauNis baris={pratinjau.baris} label="Pratinjau NIS dari file" />
          <KotakPesan nada="proses">
            Hanya baris valid yang disimpan, semuanya sekaligus. {pratinjau.ringkasan.akun_wali} akun wali akan dibuat dengan username NIS dan password
            awal tanggal lahir anak.
          </KotakPesan>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={ulang} disabled={simpan.isPending}>
              Ganti File
            </Button>
            <Button onClick={simpanFile} disabled={pratinjau.ringkasan.valid === 0 || simpan.isPending}>
              {simpan.isPending ? "Menyimpan..." : `Simpan ${pratinjau.ringkasan.valid} NIS`}
            </Button>
          </div>
        </div>
      ) : null}

      {hasil ? (
        <div className="flex flex-col gap-4">
          <KotakPesan nada={hasil.diisi > 0 ? "sukses" : "menunggu"} judul={`${hasil.diisi} NIS tersimpan`}>
            {hasil.akun_wali_dibuat > 0
              ? `${hasil.akun_wali_dibuat} akun wali dibuat. Kartu akunnya bisa diunduh dari halaman detail murid.`
              : "Tidak ada akun wali baru; murid yang sudah punya wali atau tidak aktif hanya mendapat NIS."}
          </KotakPesan>
          {hasil.gagal.length > 0 ? (
            <>
              <KotakPesan nada="bahaya" judul={`${hasil.gagal.length} baris tidak disimpan`}>
                Perbaiki baris berikut di file, lalu unggah lagi. Baris yang sudah tersimpan akan ditandai sudah punya NIS.
              </KotakPesan>
              <TabelPratinjauNis baris={hasil.gagal} label="Baris NIS yang gagal disimpan" />
            </>
          ) : null}
          <Button variant="outline" className="self-start" onClick={ulang}>
            Unggah File Lain
          </Button>
        </div>
      ) : null}

      {galat ? (
        <KotakPesan nada="bahaya" className="mt-4">
          {galat}
        </KotakPesan>
      ) : null}
    </div>
  );
}
