"use client";

import { DialogUbahStatus } from "@/components/features/murid/dialog-ubah-status";
import { Button } from "@/components/ui/button";
import { useUbahStatusMassal } from "@/lib/api/murid";

/** Meluluskan semua murid aktif di satu kelas tahun ajaran aktif untuk tahun lulus tertentu (A2.14). */
export function LuluskanKelas() {
  const massal = useUbahStatusMassal();

  return (
    <DialogUbahStatus
      judul="Luluskan satu kelas"
      deskripsi="Semua murid aktif di kelas itu menjadi lulus dengan tahun lulus yang sama. Untuk kenaikan kelas di akhir tahun ajaran, pakai wizard di menu Tahun Ajaran."
      pemicu={<Button variant="outline">Luluskan Kelas</Button>}
      luluskanKelas
      kirim={async (isian, kelasId) => (await massal.mutateAsync({ ...isian, kelas_id: kelasId ?? undefined })).message}
    />
  );
}
