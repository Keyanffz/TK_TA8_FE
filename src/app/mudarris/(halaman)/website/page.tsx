import type { Metadata } from "next";

import { HalamanWebsite } from "@/components/features/website/halaman-website";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin, statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Website" };

export default async function WebsitePage() {
  const sesi = statusSesi(await wajibAkses((sesi) => punyaIzin(sesi, "konten_website")));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Website Sekolah"
        deskripsi="Isi halaman depan website. Setiap tab disimpan sendiri; halaman depan langsung berubah setelah disimpan."
      />
      <HalamanWebsite bisaKelola={punyaIzin(sesi, "konten_website", "kelola")} />
    </div>
  );
}
