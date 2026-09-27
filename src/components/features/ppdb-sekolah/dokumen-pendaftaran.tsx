"use client";

import { FileText } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { LABEL_JENIS_DOKUMEN } from "@/lib/constants/label";
import type { PendaftaranDetail } from "@/types/domain";

type Dokumen = PendaftaranDetail["dokumen"][number];

// Signed URL media berisi path terenkripsi, jadi PDF tidak bisa dikenali dari URL-nya.
// Dokumen ditampilkan sebagai gambar dulu; kalau gagal dimuat (PDF), tampil ikon berkas.
function Pratinjau({ dokumen }: { dokumen: Dokumen }) {
  const [bukanGambar, setBukanGambar] = useState(false);
  if (bukanGambar) return <FileText aria-hidden="true" className="size-8 text-muted-foreground" />;
  return <Image src={dokumen.url} alt={LABEL_JENIS_DOKUMEN[dokumen.jenis]} fill unoptimized className="object-cover" onError={() => setBukanGambar(true)} />;
}

/** Dokumen PPDB (akta, KK, pas foto); dibuka di tab baru untuk diperbesar atau dicetak. */
export function DokumenPendaftaran({ dokumen }: { dokumen: Dokumen[] }) {
  if (dokumen.length === 0) return <p className="text-sm text-muted-foreground">Tidak ada dokumen yang diunggah.</p>;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {dokumen.map((item) => (
        <li key={item.id}>
          <a href={item.url} target="_blank" rel="noreferrer" className="angkat flex flex-col gap-2 rounded-lg border border-border bg-card p-2 shadow-sm">
            <span className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm bg-muted">
              <Pratinjau dokumen={item} />
            </span>
            <span className="px-1 font-heading text-sm font-bold">{LABEL_JENIS_DOKUMEN[item.jenis]}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
