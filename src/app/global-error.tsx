"use client";

import { KELAS_FONT } from "@/app/fonts";
import { HalamanGalat } from "@/components/shared/halaman-galat";

import "./globals.css";

// Menggantikan root layout kalau layout itu sendiri gagal, jadi dokumen, font, gaya, dan judul tab ditulis di sini.
export default function ErrorGlobal({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="id" className={KELAS_FONT}>
      <body className="min-h-dvh">
        <title>Halaman belum bisa ditampilkan</title>
        <HalamanGalat error={error} retry={retry} penuh />
      </body>
    </html>
  );
}
