import type { Metadata } from "next";

import { WizardImport } from "@/components/features/murid/import/wizard-import";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Import Murid" };

export default async function ImportMuridPage() {
  await wajibAkses((sesi) => punyaIzin(sesi, "data_murid", "kelola"));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/mudarris/murid">Kembali ke daftar murid</TautanKembali>
      <KepalaHalaman
        judul="Import Murid"
        deskripsi="Masukkan banyak murid sekaligus dari Excel atau CSV. Murid aktif dibuatkan akun wali seperti saat ditambah satu per satu."
      />
      <WizardImport />
    </div>
  );
}
