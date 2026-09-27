"use client";

import { Button } from "@/components/ui/button";
import { useKeluar } from "@/components/features/auth/use-keluar";

/** Untuk halaman tanpa menu akun (ganti password awal). */
export function TombolKeluar() {
  const keluar = useKeluar();
  return (
    <Button variant="outline" disabled={keluar.isPending} onClick={() => keluar.mutate()}>
      {keluar.isPending ? "Keluar..." : "Keluar"}
    </Button>
  );
}
