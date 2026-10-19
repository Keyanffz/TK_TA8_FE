import type { Metadata } from "next";
import Link from "next/link";

import { DaftarAlumni } from "@/components/features/murid/daftar-alumni";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { buttonVariants } from "@/components/ui/button";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin, statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Alumni" };

export default async function AlumniPage() {
  const sesi = statusSesi(await wajibAkses((sesi) => punyaIzin(sesi, "data_murid")));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Alumni"
        deskripsi="Murid yang sudah lulus. Alumni tidak punya kelas aktif dan tidak ditagih."
        aksi={
          punyaIzin(sesi, "data_murid", "kelola") ? (
            <Link href="/mudarris/murid/import" className={buttonVariants({ variant: "outline" })}>
              Import Data Alumni
            </Link>
          ) : null
        }
      />
      <DaftarAlumni />
    </div>
  );
}
