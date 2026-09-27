"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";
import { ambilKwitansi } from "@/lib/api/pembayaran";
import { simpanBlob } from "@/lib/api/unduh";

/** Kwitansi PDF, hanya untuk pembayaran yang diterima. */
export function TombolKwitansi({ id, kode }: { id: number; kode: string }) {
  const [memuat, setMemuat] = useState(false);

  const unduh = async () => {
    setMemuat(true);
    try {
      simpanBlob(await ambilKwitansi(id), `kwitansi-${kode}.pdf`);
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMemuat(false);
    }
  };

  return (
    <Button variant="outline" size="sm" disabled={memuat} onClick={() => void unduh()}>
      <FileDown aria-hidden="true" />
      {memuat ? "Menyiapkan..." : "Unduh Kwitansi"}
    </Button>
  );
}
