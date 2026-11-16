import type { Metadata } from "next";

import { ImportNis } from "@/components/features/murid/nis/import-nis";
import { TabelIsiNis } from "@/components/features/murid/nis/tabel-isi-nis";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Murid Menunggu NIS" };

export default async function MuridMenungguNisPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <TautanKembali href="/mudarris/murid">Kembali ke daftar murid</TautanKembali>
      <KepalaHalaman
        judul="Murid Menunggu NIS"
        deskripsi="Murid aktif yang belum punya NIS. Saat NIS disimpan, murid yang belum punya wali dibuatkan akun wali dengan username NIS dan password awal tanggal lahir anak."
      />
      <div className="flex flex-col gap-8">
        <section aria-labelledby="judul-isi-tabel">
          <h2 id="judul-isi-tabel" className="mb-3 text-lg font-extrabold">
            Isi di tabel
          </h2>
          <TabelIsiNis />
        </section>
        <section aria-labelledby="judul-isi-excel">
          <h2 id="judul-isi-excel" className="mb-3 text-lg font-extrabold">
            Isi lewat Excel
          </h2>
          <ImportNis />
        </section>
      </div>
    </div>
  );
}
