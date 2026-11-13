import type { Metadata } from "next";

import { HalamanPengaturan } from "@/components/features/pengaturan/halaman-pengaturan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin, statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  const sesi = statusSesi(await wajibAkses((sesi) => sesi.isSuperAdmin || punyaIzin(sesi, "konten_website")));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Pengaturan"
        deskripsi={sesi.isSuperAdmin ? "Aturan tagihan, PPDB, banner beranda wali, dan elemen penilaian rapor." : "Banner info sekolah di beranda wali murid."}
      />
      <HalamanPengaturan kepalaSekolah={sesi.isSuperAdmin} bisaKelolaKonten={punyaIzin(sesi, "konten_website", "kelola")} />
    </div>
  );
}
