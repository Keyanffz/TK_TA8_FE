import type { Metadata } from "next";
import Link from "next/link";

import { FeedKegiatanSekolah, FeedKegiatanWali } from "@/components/features/kegiatan/feed-kegiatan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { buttonVariants } from "@/components/ui/button";
import { wajibSesi } from "@/lib/auth/akses";
import { statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Kegiatan Kelas" };

export default async function KegiatanPage() {
  const sesi = statusSesi(await wajibSesi());

  if (sesi.isWali) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <KepalaHalaman judul="Kegiatan Kelas" deskripsi="Foto dan cerita kegiatan dari guru kelas." />
        <FeedKegiatanWali />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Kegiatan Kelas"
        deskripsi={sesi.isSuperAdmin ? "Kegiatan semua kelas di tahun ajaran aktif." : "Kegiatan di kelas yang Anda ampu. Wali murid kelas itu bisa melihat foto dan ceritanya."}
        aksi={
          <Link href="/dashboard/kegiatan/baru" className={buttonVariants()}>
            Catat Kegiatan
          </Link>
        }
      />
      <FeedKegiatanSekolah />
    </div>
  );
}
