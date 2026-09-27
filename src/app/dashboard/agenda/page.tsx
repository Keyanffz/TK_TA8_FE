import type { Metadata } from "next";

import { HalamanAgenda } from "@/components/features/agenda/halaman-agenda";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibSesi } from "@/lib/auth/akses";
import { statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Agenda" };

export default async function AgendaPage() {
  const sesi = statusSesi(await wajibSesi());

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Agenda Sekolah"
        deskripsi={sesi.isSuperAdmin ? "Agenda yang ditandai tampil di website juga muncul di halaman depan." : "Kegiatan, libur, dan acara sekolah."}
      />
      <HalamanAgenda kelola={sesi.isSuperAdmin} />
    </div>
  );
}
