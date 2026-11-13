"use client";

import { FileSearch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";
import { ambilPdfRapor } from "@/lib/api/rapor";
import { bukaBlobDiTabBaru } from "@/lib/api/unduh";

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
