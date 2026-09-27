"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Salin teks pendek (kode pendaftaran, password awal) ke clipboard. */
export function TombolSalin({ teks, label }: { teks: string; label: string }) {
  const [tersalin, setTersalin] = useState(false);

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(teks);
      setTersalin(true);
    } catch (penyebab) {
      console.error("Menyalin gagal:", penyebab);
      toast.error("Tidak bisa menyalin otomatis. Catat secara manual.");
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void salin()}>
      {tersalin ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {tersalin ? "Tersalin" : label}
    </Button>
  );
}
