"use client";

import { Button } from "@/components/ui/button";
import { HalamanKosong } from "@/components/shared/halaman-kosong";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <HalamanKosong
      judul="Halaman belum bisa ditampilkan"
      deskripsi="Data dari server sekolah sedang tidak bisa diambil. Coba muat ulang beberapa saat lagi."
      aksi={<Button onClick={reset}>Muat Ulang</Button>}
    />
  );
}
