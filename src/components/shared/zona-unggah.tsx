"use client";

import { FileText, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { kompresGambar, TIPE_GAMBAR_DITERIMA, TIPE_PDF, tipeGambarDiterima, UKURAN_MAKS_UNGGAH_BYTE } from "@/lib/gambar";
import { cn } from "@/lib/utils";

type ZonaUnggahProps = {
  label: string;
  deskripsi?: string;
  error?: string;
  /** File yang sudah dipilih (dikendalikan react-hook-form lewat Controller). */
  nilai: File[];
  onUbah: (file: File[]) => void;
  /** PDF diterima selain gambar (dokumen PPDB, bukan pas foto). */
  terimaPdf?: boolean;
  maks?: number;
};

function ukuranFile(byte: number): string {
  if (byte < 1024 * 1024) return `${Math.max(1, Math.round(byte / 1024)).toLocaleString("id-ID")} KB`;
  return `${(byte / 1024 / 1024).toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB`;
}

/** Pratinjau: gambar sebagai thumbnail, PDF sebagai nama file. */
function ItemFile({ file, onHapus }: { file: File; onHapus: () => void }) {
  const url = useMemo(() => (file.type === TIPE_PDF ? null : URL.createObjectURL(file)), [file]);
  useEffect(() => (url ? () => URL.revokeObjectURL(url) : undefined), [url]);

  return (
    <li className="flex items-center gap-3 rounded-md border border-border bg-card p-2">
      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
        {url ? <Image src={url} alt="" fill unoptimized className="object-cover" /> : <FileText aria-hidden="true" className="size-6 text-muted-foreground" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{file.name}</span>
        <span className="block text-xs text-muted-foreground">{ukuranFile(file.size)}</span>
      </span>
      <Button type="button" variant="ghost" size="icon" onClick={onHapus} aria-label={`Hapus ${file.name}`}>
        <X aria-hidden="true" />
      </Button>
    </li>
  );
}

/**
 * Pilih file dengan klik atau seret (B1). Gambar dikecilkan di browser sebelum
 * dikirim; PDF dikirim apa adanya dan harus di bawah 5 MB.
 */
export function ZonaUnggah({ label, deskripsi, error, nilai, onUbah, terimaPdf = false, maks = 1 }: ZonaUnggahProps) {
  const id = useId();
  const [memproses, setMemproses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [diseret, setDiseret] = useState(false);
  const penuh = nilai.length >= maks;
  const accept = [...TIPE_GAMBAR_DITERIMA, ...(terimaPdf ? [TIPE_PDF] : [])].join(",");
  const pesan = galat ?? error;

  const tambah = async (daftar: FileList | null) => {
    setGalat(null);
    if (!daftar || daftar.length === 0) return;
    const dipilih = [...daftar].slice(0, maks - nilai.length);
    const hasil: File[] = [];
    setMemproses(true);
    try {
      for (const file of dipilih) {
        if (terimaPdf && file.type === TIPE_PDF) {
          if (file.size > UKURAN_MAKS_UNGGAH_BYTE) {
            setGalat(`${file.name} lebih dari 5 MB. Perkecil file PDF-nya atau kirim foto dokumen.`);
            return;
          }
          hasil.push(file);
        } else if (tipeGambarDiterima(file)) {
          hasil.push(await kompresGambar(file));
        } else {
          setGalat(terimaPdf ? "Pilih foto (JPG, PNG, WebP) atau PDF." : "Pilih foto berformat JPG, PNG, atau WebP.");
          return;
        }
      }
      onUbah([...nilai, ...hasil]);
    } catch (penyebab) {
      console.error("Memproses file gagal:", penyebab);
      setGalat("File tidak bisa diproses. Coba file lain.");
    } finally {
      setMemproses(false);
    }
  };

  const jatuhkan = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDiseret(false);
    if (!penuh && !memproses) void tambah(event.dataTransfer.files);
  };

  return (
    <Field data-invalid={pesan ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {nilai.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {nilai.map((file, indeks) => (
            <ItemFile key={`${file.name}-${indeks}`} file={file} onHapus={() => onUbah(nilai.filter((_, i) => i !== indeks))} />
          ))}
        </ul>
      ) : null}
      {penuh ? null : (
        <label
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault();
            setDiseret(true);
          }}
          onDragLeave={() => setDiseret(false)}
          onDrop={jatuhkan}
          className={cn(
            "flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-4 py-4 text-center text-sm transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
            diseret ? "border-primary bg-primary-soft" : "border-input bg-card hover:border-primary hover:bg-primary-soft/50",
            pesan ? "border-destructive" : undefined,
          )}
        >
          <UploadCloud aria-hidden="true" className="size-6 text-primary-strong" />
          <span className="font-heading font-bold text-primary-strong">
            {memproses ? "Memproses file..." : nilai.length > 0 ? "Tambah file lain" : "Pilih file atau seret ke sini"}
          </span>
          <input
            id={id}
            type="file"
            accept={accept}
            multiple={maks - nilai.length > 1}
            disabled={memproses}
            className="sr-only"
            aria-invalid={pesan ? true : undefined}
            onChange={(event) => {
              void tambah(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      )}
      {deskripsi ? <FieldDescription>{deskripsi}</FieldDescription> : null}
      {pesan ? <FieldError>{pesan}</FieldError> : null}
    </Field>
  );
}
