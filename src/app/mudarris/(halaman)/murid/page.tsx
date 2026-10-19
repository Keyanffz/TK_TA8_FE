import type { Metadata } from "next";
import Link from "next/link";

import { DaftarMurid } from "@/components/features/murid/daftar-murid";
import { LuluskanKelas } from "@/components/features/murid/luluskan-kelas";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { buttonVariants } from "@/components/ui/button";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin, statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Murid" };

export default async function MuridPage() {
  const sesi = statusSesi(await wajibAkses((sesi) => sesi.isSuperAdmin || sesi.isGuru));
  const bisaKelola = punyaIzin(sesi, "data_murid", "kelola");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Murid"
        deskripsi={
          punyaIzin(sesi, "data_murid")
            ? "Semua murid sekolah. Murid baru otomatis dibuatkan akun wali dengan username NIS."
            : "Murid di kelas yang Anda ampu."
        }
        aksi={
          bisaKelola ? (
            <div className="flex flex-wrap gap-2">
              <LuluskanKelas />
              <Link href="/mudarris/murid/import" className={buttonVariants({ variant: "outline" })}>
                Import Murid
              </Link>
              <Link href="/mudarris/murid/baru" className={buttonVariants()}>
                Tambah Murid
              </Link>
            </div>
          ) : null
        }
      />
      <DaftarMurid bisaKelola={bisaKelola} />
    </div>
  );
}
