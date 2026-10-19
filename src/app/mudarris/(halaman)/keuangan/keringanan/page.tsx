import type { Metadata } from "next";

import { DaftarKeringanan } from "@/components/features/keuangan/daftar-keringanan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin, statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Keringanan" };

export default async function KeringananPage() {
  const sesi = statusSesi(await wajibAkses((sesi) => punyaIzin(sesi, "keuangan")));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Keringanan" deskripsi="Potongan tetap untuk murid tertentu, dalam persen atau rupiah." />
      <DaftarKeringanan bisaKelola={punyaIzin(sesi, "keuangan", "kelola")} />
    </div>
  );
}
