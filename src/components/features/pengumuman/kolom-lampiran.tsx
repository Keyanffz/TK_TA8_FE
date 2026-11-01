"use client";

import { FileText, Trash2 } from "lucide-react";
import Image from "next/image";

import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { Button } from "@/components/ui/button";
import { LABEL_JENIS_LAMPIRAN } from "@/lib/constants/label";
import { formatUkuranFile } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LampiranPengumuman } from "@/types/domain";

const ATURAN_FILE = "Satu file PDF atau foto (JPG, PNG, WebP), maksimal 5 MB.";

type Keadaan = "tetap" | "dihapus" | "diganti";

const KETERANGAN_KEADAAN: Record<Exclude<Keadaan, "tetap">, string> = {
  dihapus: "Dihapus saat pengumuman disimpan.",
  diganti: "Diganti file baru saat pengumuman disimpan.",
};

function LampiranTersimpan({ lampiran, keadaan, onUbahDihapus }: {
  lampiran: LampiranPengumuman;
  keadaan: Keadaan;
  onUbahDihapus: (dihapus: boolean) => void;
}) {
  const ditinggalkan = keadaan !== "tetap";
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-2">
      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
        {lampiran.jenis === "gambar" ? (
          <Image src={lampiran.url} alt="" fill unoptimized className={cn("object-cover", ditinggalkan && "opacity-40")} />
        ) : (
          <FileText aria-hidden="true" className="size-6 text-muted-foreground" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <a
          href={lampiran.url}
          target="_blank"
          rel="noreferrer"
          className={cn("block truncate text-sm font-bold hover:underline", ditinggalkan && "text-muted-foreground line-through")}
        >
          {lampiran.nama}
        </a>
        <span className="block text-xs text-muted-foreground">
          {keadaan === "tetap"
            ? `Tersimpan · ${LABEL_JENIS_LAMPIRAN[lampiran.jenis]} · ${formatUkuranFile(lampiran.ukuran)}`
            : KETERANGAN_KEADAAN[keadaan]}
        </span>
      </span>
      {/* Satu tombol yang teksnya berganti, supaya fokus tetap di tombol yang sama setelah diklik. */}
      {keadaan === "diganti" ? null : (
        <Button type="button" variant="ghost" onClick={() => onUbahDihapus(keadaan === "tetap")}>
          {keadaan === "tetap" ? <Trash2 aria-hidden="true" /> : null}
          {keadaan === "tetap" ? "Hapus Lampiran" : "Batal Hapus"}
        </Button>
      )}
    </div>
  );
}

type KolomLampiranProps = {
  /** Lampiran yang sudah tersimpan saat mengubah pengumuman; null untuk pengumuman baru atau tanpa lampiran. */
  tersimpan: LampiranPengumuman | null;
  /** File baru (paling banyak satu); kalau ada, menggantikan lampiran yang tersimpan. */
  nilai: File[];
  onUbah: (file: File[]) => void;
  dihapus: boolean;
  onUbahDihapus: (dihapus: boolean) => void;
  error?: string;
};

/** Kolom "Lampiran (opsional)" di form pengumuman: tambah, ganti, atau hapus satu lampiran. */
export function KolomLampiran({ tersimpan, nilai, onUbah, dihapus, onUbahDihapus, error }: KolomLampiranProps) {
  const keadaan: Keadaan = nilai.length > 0 ? "diganti" : dihapus ? "dihapus" : "tetap";
  const bisaDiganti = tersimpan !== null && keadaan === "tetap";

  return (
    <ZonaUnggah
      label="Lampiran (opsional)"
      deskripsi={bisaDiganti ? `Pilih file lain untuk mengganti lampiran ini. ${ATURAN_FILE}` : ATURAN_FILE}
      terimaPdf
      nilai={nilai}
      onUbah={onUbah}
      error={error}
      tersimpan={tersimpan ? <LampiranTersimpan lampiran={tersimpan} keadaan={keadaan} onUbahDihapus={onUbahDihapus} /> : null}
    />
  );
}
