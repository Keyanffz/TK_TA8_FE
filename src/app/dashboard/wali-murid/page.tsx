import type { Metadata } from "next";

import { DaftarWaliMurid } from "@/components/features/wali-murid/daftar-wali-murid";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Wali Murid" };

export default async function WaliMuridPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Wali Murid"
        deskripsi="Akun wali dibuat otomatis untuk setiap murid baru. Wali yang lupa password dikembalikan ke password awal dari halaman detailnya."
      />
      <DaftarWaliMurid />
    </div>
  );
}
