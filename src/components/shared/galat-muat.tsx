"use client";

import { RotateCw } from "lucide-react";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";

/** Keadaan error untuk data yang gagal dimuat, dengan tombol coba lagi. */
export function GalatMuat({ error, onCobaLagi, className }: { error: unknown; onCobaLagi: () => void; className?: string }) {
  return (
    <KotakPesan nada="bahaya" judul="Data belum bisa dimuat" className={className}>
      <p>{pesanError(error)}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onCobaLagi}>
        <RotateCw aria-hidden="true" />
        Muat Ulang
      </Button>
    </KotakPesan>
  );
}
