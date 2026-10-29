"use client";

import { HalamanGalat } from "@/components/shared/halaman-galat";

// Menangkap error dari layout (public), (auth), dan dashboard, yang tidak ditangkap error.tsx di segmen yang sama.
// Navbar dan menu ikut gagal, jadi tampil satu layar penuh.
export default function ErrorAplikasi({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <HalamanGalat error={error} retry={retry} penuh />;
}
