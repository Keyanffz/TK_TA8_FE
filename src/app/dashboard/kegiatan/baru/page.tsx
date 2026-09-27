import type { Metadata } from "next";

import { TambahKegiatan } from "@/components/features/kegiatan/tambah-kegiatan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Catat Kegiatan" };

export default async function KegiatanBaruPage({ searchParams }: PageProps<"/dashboard/kegiatan/baru">) {
  await wajibAkses((sesi) => sesi.isSuperAdmin || sesi.isGuru);
  const kelas = Number((await searchParams).kelas);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Catat Kegiatan" deskripsi="Kegiatan dan fotonya langsung terlihat oleh wali murid di kelas yang dipilih." />
      <TambahKegiatan kelasAwal={Number.isInteger(kelas) && kelas > 0 ? kelas : null} />
    </div>
  );
}
