import type { Metadata } from "next";

import { TabelLogAktivitas } from "@/components/features/log-aktivitas/tabel-log-aktivitas";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Log Aktivitas" };

export default async function LogAktivitasPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Log Aktivitas" deskripsi="Catatan perubahan penting: akun, tagihan, pembayaran, rapor, PPDB, dan pengaturan." />
      <TabelLogAktivitas />
    </div>
  );
}
