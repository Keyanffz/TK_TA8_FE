import type { Metadata } from "next";
import Link from "next/link";

import { FeedPengumuman } from "@/components/features/pengumuman/feed-pengumuman";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { buttonVariants } from "@/components/ui/button";
import { wajibSesi } from "@/lib/auth/akses";
import { BERANDA_STAFF } from "@/lib/auth/path";
import { statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Pengumuman" };

export default async function PengumumanMudarrisPage() {
  const sesi = statusSesi(await wajibSesi());

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Pengumuman"
        deskripsi={
          sesi.isSuperAdmin
            ? "Semua pengumuman, termasuk draft. Pengumuman untuk semua penerima bisa ditampilkan di website."
            : "Pengumuman yang Anda terima dan yang Anda tulis untuk kelas Anda."
        }
        aksi={
          <Link href="/mudarris/pengumuman/baru" className={buttonVariants()}>
            Tulis Pengumuman
          </Link>
        }
      />
      <FeedPengumuman penulis beranda={BERANDA_STAFF} />
    </div>
  );
}
