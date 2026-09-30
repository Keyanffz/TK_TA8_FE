import type { Metadata } from "next";

import { UbahMurid } from "@/components/features/murid/ubah-murid";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";
import { idDariParam } from "@/lib/halaman";

export const metadata: Metadata = { title: "Ubah Data Murid" };

export default async function UbahMuridPage({ params }: PageProps<"/mudarris/murid/[id]/ubah">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin);
  const id = idDariParam((await params).id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Ubah Data Murid"
        deskripsi="Kalau tanggal lahir diubah dan akun wali otomatis belum pernah dipakai, password awalnya ikut berubah."
      />
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <UbahMurid id={id} />
      </div>
    </div>
  );
}
