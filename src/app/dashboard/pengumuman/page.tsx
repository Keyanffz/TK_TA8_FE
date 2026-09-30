import type { Metadata } from "next";

import { FeedPengumuman } from "@/components/features/pengumuman/feed-pengumuman";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { BERANDA_WALI } from "@/lib/auth/path";

export const metadata: Metadata = { title: "Pengumuman" };

export default function PengumumanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Pengumuman" deskripsi="Pengumuman dari sekolah dan guru kelas untuk Anda." />
      <FeedPengumuman penulis={false} beranda={BERANDA_WALI} />
    </div>
  );
}
