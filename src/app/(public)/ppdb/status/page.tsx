import type { Metadata } from "next";
import { Suspense } from "react";

import { CekStatusPpdb } from "@/components/features/ppdb/cek-status-ppdb";
import { JudulHalaman } from "@/components/shared/judul-halaman";

export const metadata: Metadata = { title: "Cek Status PPDB" };

export default function StatusPpdbPage() {
  return (
    <>
      <JudulHalaman
        judul="Cek Status Pendaftaran"
        deskripsi="Masukkan kode pendaftaran dan tanggal lahir anak yang didaftarkan."
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        <Suspense>
          <CekStatusPpdb />
        </Suspense>
      </div>
    </>
  );
}
