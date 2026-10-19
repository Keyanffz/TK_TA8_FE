"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

import { HasilImport } from "@/components/features/murid/import/hasil-import";
import { TabelPratinjau } from "@/components/features/murid/import/tabel-pratinjau";
import { PenandaLangkah } from "@/components/features/ppdb/penanda-langkah";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { ApiError, pesanError } from "@/lib/api/errors";
import { ambilTemplateImport, usePratinjauImportMurid, useSimpanImportMurid } from "@/lib/api/murid";
import { simpanBlob } from "@/lib/api/unduh";
import type { HasilImportMurid, PratinjauImportMurid } from "@/types/domain";

const LANGKAH = ["Unduh Template", "Unggah File", "Periksa dan Impor"] as const;
/** Sama dengan batas backend (`ImportMuridRequest`). */
const UKURAN_MAKS_BYTE = 2 * 1024 * 1024;

function pesanGagal(error: unknown): string {
  return error instanceof ApiError ? (error.errors?.file?.[0] ?? error.message) : pesanError(error);
}

/**
 * Import murid dari Excel/CSV (A2.14): unduh template, unggah untuk diperiksa per baris tanpa menyimpan, lalu impor
 * semua baris valid dalam satu transaksi. File yang sama dikirim lagi saat impor dan diperiksa ulang oleh backend.
 */
export function WizardImport() {
  const [langkah, setLangkah] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [pratinjau, setPratinjau] = useState<PratinjauImportMurid | null>(null);
  const [hasil, setHasil] = useState<HasilImportMurid | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [mengunduh, setMengunduh] = useState(false);
  const periksa = usePratinjauImportMurid();
  const simpan = useSimpanImportMurid();

  const unduhTemplate = async () => {
    setGalat(null);
    setMengunduh(true);
    try {
      simpanBlob(await ambilTemplateImport(), "template-import-murid.xlsx");
    } catch (error) {
      setGalat(pesanGagal(error));
    } finally {
      setMengunduh(false);
    }
  };

  const pilihFile = (dipilih: File | undefined) => {
    setGalat(null);
    if (!dipilih) return;
    if (!/\.(xlsx|csv)$/i.test(dipilih.name)) return setGalat("Pilih file berformat .xlsx atau .csv.");
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

  const impor = () => {
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
      <PenandaLangkah judul={LANGKAH} aktif={hasil ? LANGKAH.length - 1 : langkah} label="Langkah import murid" />

      {langkah === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="max-w-prose text-sm">
            Isi sheet <span className="font-bold">Murid</span> mulai baris kedua, satu murid per baris. Aturan setiap kolom ada di sheet{" "}
            <span className="font-bold">Petunjuk</span>. Data alumni tahun-tahun lalu bisa dimasukkan sekaligus dengan kolom status dan tahun lulus;
            alumni tidak dibuatkan akun wali dan tidak ditagih. Maksimal 500 baris per file.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void unduhTemplate()} disabled={mengunduh}>
              <Download aria-hidden="true" />
              {mengunduh ? "Menyiapkan..." : "Unduh Template"}
            </Button>
            <Button onClick={() => setLangkah(1)}>Template Sudah Terisi</Button>
          </div>
        </div>
      ) : null}

      {langkah === 1 ? (
        <div className="flex flex-col gap-4">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-input px-4 py-4 text-center text-sm hover:border-primary hover:bg-primary-soft/50 has-focus-visible:ring-2 has-focus-visible:ring-ring">
            <FileSpreadsheet aria-hidden="true" className="size-6 text-primary-strong" />
            <span className="font-heading font-bold text-primary-strong">{file ? file.name : "Pilih file .xlsx atau .csv"}</span>
            <span className="text-xs text-muted-foreground">CSV boleh memakai pemisah koma atau titik koma. Maksimal 2 MB.</span>
            <input type="file" accept=".xlsx,.csv" className="sr-only" onChange={(event) => pilihFile(event.target.files?.[0])} />
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
          <TabelPratinjau pratinjau={pratinjau} />
          <KotakPesan nada="proses">
            Hanya baris valid yang diimpor, semuanya sekaligus. Baris bermasalah dilewati dan bisa diunduh setelah impor untuk diperbaiki.
          </KotakPesan>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={ulang} disabled={simpan.isPending}>
              Ganti File
            </Button>
            <Button onClick={impor} disabled={pratinjau.ringkasan.valid === 0 || simpan.isPending}>
              {simpan.isPending ? "Mengimpor..." : `Impor ${pratinjau.ringkasan.valid} Baris Valid`}
            </Button>
          </div>
        </div>
      ) : null}

      {hasil && file ? <HasilImport hasil={hasil} namaFile={file.name} onUlang={ulang} /> : null}

      {galat ? (
        <KotakPesan nada="bahaya" className="mt-4">
          {galat}
        </KotakPesan>
      ) : null}
    </div>
  );
}
