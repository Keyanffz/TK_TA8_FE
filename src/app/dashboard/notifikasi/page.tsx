import type { Metadata } from "next";
import { Suspense } from "react";

import { DaftarNotifikasi } from "@/components/features/notifikasi/daftar-notifikasi";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";

export const metadata: Metadata = { title: "Notifikasi" };

export default function NotifikasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Notifikasi" deskripsi="Klik notifikasi untuk membuka halaman terkait; notifikasi itu otomatis ditandai dibaca." />
      <Suspense>
        <DaftarNotifikasi />
      </Suspense>
    </div>
  );
}
