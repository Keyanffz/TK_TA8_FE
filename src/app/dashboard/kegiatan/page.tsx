import type { Metadata } from "next";

import { FeedKegiatanWali } from "@/components/features/kegiatan/feed-kegiatan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";

export const metadata: Metadata = { title: "Kegiatan Kelas" };

export default function KegiatanPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Kegiatan Kelas" deskripsi="Foto dan cerita kegiatan dari guru kelas." />
      <FeedKegiatanWali />
    </div>
  );
}
