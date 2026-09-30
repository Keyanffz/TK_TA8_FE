import type { Metadata } from "next";

import { HalamanAgenda } from "@/components/features/agenda/halaman-agenda";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";

export const metadata: Metadata = { title: "Agenda" };

export default function AgendaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Agenda Sekolah" deskripsi="Kegiatan, libur, dan acara sekolah." />
      <HalamanAgenda kelola={false} />
    </div>
  );
}
