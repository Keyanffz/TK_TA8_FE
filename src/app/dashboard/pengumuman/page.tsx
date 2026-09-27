import type { Metadata } from "next";
import Link from "next/link";

import { FeedPengumuman } from "@/components/features/pengumuman/feed-pengumuman";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { buttonVariants } from "@/components/ui/button";
import { wajibSesi } from "@/lib/auth/akses";
import { statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Pengumuman" };

export default async function PengumumanPage() {
  const sesi = statusSesi(await wajibSesi());
  const penulis = sesi.isSuperAdmin || sesi.isGuru;

  return (
    <div className={`mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8 ${penulis ? "max-w-5xl" : "max-w-3xl"}`}>
      <KepalaHalaman
        judul="Pengumuman"
        deskripsi={
          sesi.isWali
            ? "Pengumuman dari sekolah dan guru kelas untuk Anda."
            : sesi.isSuperAdmin
              ? "Semua pengumuman, termasuk draft. Pengumuman untuk semua penerima bisa ditampilkan di website."
              : "Pengumuman yang Anda terima dan yang Anda tulis untuk kelas Anda."
        }
        aksi={
          penulis ? (
            <Link href="/dashboard/pengumuman/baru" className={buttonVariants()}>
              Tulis Pengumuman
            </Link>
          ) : null
        }
      />
      <FeedPengumuman penulis={penulis} />
    </div>
  );
}
