"use client";

import { Plus, X } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatHariTanggal } from "@/lib/format";

type DaftarTanggalLiburProps = { tanggal: readonly string[]; onUbah: (tanggal: string[]) => void; error?: string };

/** Tanggal libur di luar hari libur mingguan: pada tanggal ini tidak ada absensi dan tidak ada yang ditandai tidak hadir. */
export function DaftarTanggalLibur({ tanggal, onUbah, error }: DaftarTanggalLiburProps) {
  const id = useId();
  const [baru, setBaru] = useState("");
  const sudahAda = tanggal.includes(baru);

  const tambah = () => {
    if (baru === "" || sudahAda) return;
    onUbah([...tanggal, baru].sort());
    setBaru("");
  };

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>Tanggal libur</FieldLabel>
      <div className="flex gap-2">
        <Input id={id} type="date" value={baru} onChange={(event) => setBaru(event.target.value)} className="max-w-52" />
        <Button type="button" variant="outline" disabled={baru === "" || sudahAda} onClick={tambah}>
          <Plus aria-hidden="true" />
          Tambah
        </Button>
      </div>
      <FieldDescription>
        {sudahAda ? "Tanggal itu sudah ada di daftar." : "Libur nasional, libur semester, atau hari sekolah diliburkan. Kalau tanggalnya sudah lewat, tanda tidak hadir otomatis pada hari itu dihapus saat disimpan."}
      </FieldDescription>
      {tanggal.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {tanggal.map((satu) => (
            <li key={satu} className="inline-flex items-center gap-1 rounded-full bg-muted py-1 pr-1 pl-3 text-sm">
              {formatHariTanggal(satu)}
              <button
                type="button"
                aria-label={`Hapus ${formatHariTanggal(satu)} dari tanggal libur`}
                onClick={() => onUbah(tanggal.filter((item) => item !== satu))}
                className="flex size-8 items-center justify-center rounded-full hover:bg-card"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada tanggal libur.</p>
      )}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
