"use client";

import { FileDown, FileSearch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";
import { ambilPdfRapor } from "@/lib/api/rapor";
import { bukaBlobDiTabBaru, simpanBlob } from "@/lib/api/unduh";

type TombolPdfRaporProps = {
  id: number;
  namaFile: string;
  /** Pratinjau membuka PDF di tab baru (guru dan Kepala Sekolah, bertanda "Pratinjau" sebelum terbit). */
  mode: "unduh" | "pratinjau";
  size?: "sm" | "default";
};

export function TombolPdfRapor({ id, namaFile, mode, size = "default" }: TombolPdfRaporProps) {
  const [memuat, setMemuat] = useState(false);

  const jalankan = async () => {
    setMemuat(true);
    try {
      if (mode === "unduh") simpanBlob(await ambilPdfRapor(id), namaFile);
      else await bukaBlobDiTabBaru(() => ambilPdfRapor(id));
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMemuat(false);
    }
  };

  return (
    <Button variant={mode === "unduh" ? "default" : "outline"} size={size} disabled={memuat} onClick={() => void jalankan()}>
      {mode === "unduh" ? <FileDown aria-hidden="true" /> : <FileSearch aria-hidden="true" />}
      {memuat ? "Menyiapkan..." : mode === "unduh" ? "Unduh PDF" : "Pratinjau PDF"}
    </Button>
  );
}
