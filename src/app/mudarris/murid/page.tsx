import type { Metadata } from "next";
import Link from "next/link";

import { DaftarMurid } from "@/components/features/murid/daftar-murid";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { buttonVariants } from "@/components/ui/button";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Murid" };

export default async function MuridPage() {
  const user = await wajibAkses((sesi) => sesi.isSuperAdmin || sesi.isGuru);
  const kepalaSekolah = user.role === "super_admin";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Murid"
        deskripsi={kepalaSekolah ? "Semua murid sekolah. Murid baru otomatis dibuatkan akun wali dengan username NIS." : "Murid di kelas yang Anda ampu."}
        aksi={
          kepalaSekolah ? (
            <Link href="/mudarris/murid/baru" className={buttonVariants()}>
              Tambah Murid
            </Link>
          ) : null
        }
      />
      <DaftarMurid />
    </div>
  );
}
