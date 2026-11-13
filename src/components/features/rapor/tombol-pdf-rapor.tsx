"use client";

import { Download, FileSearch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";
import { ambilPdfRapor, ambilPdfRaporKelas } from "@/lib/api/rapor";
import { bukaBlobDiTabBaru, simpanBlob, slugNamaBerkas } from "@/lib/api/unduh";

/** Membuka PDF rapor di tab baru; backend menandainya "Pratinjau" selama belum terbit. */
export function TombolPdfRapor({ id }: { id: number }) {
  const [memuat, setMemuat] = useState(false);

  const buka = async () => {
    setMemuat(true);
    try {
      await bukaBlobDiTabBaru(() => ambilPdfRapor(id));
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMemuat(false);
    }
  };

  return (
    <Button variant="outline" disabled={memuat} onClick={() => void buka()}>
      <FileSearch aria-hidden="true" />
      {memuat ? "Menyiapkan..." : "Pratinjau PDF"}
    </Button>
  );
}

/**
 * Mengunduh semua rapor terbit satu kelas dan semester dalam satu PDF untuk dicetak. Kalau belum ada yang terbit,
 * pesan backend ditampilkan.
 */
export function TombolPdfRaporKelas({ kelasId, namaKelas, semester }: { kelasId: number; namaKelas: string; semester: 1 | 2 }) {
  const [memuat, setMemuat] = useState(false);

  const unduh = async () => {
    setMemuat(true);
    try {
      simpanBlob(await ambilPdfRaporKelas(kelasId, semester), `rapor-${slugNamaBerkas(namaKelas)}-semester-${semester}.pdf`);
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMemuat(false);
    }
  };

  return (
    <Button variant="outline" disabled={memuat} onClick={() => void unduh()}>
      <Download aria-hidden="true" />
      {memuat ? "Menyiapkan..." : `Unduh Rapor ${namaKelas} (PDF)`}
    </Button>
  );
}
