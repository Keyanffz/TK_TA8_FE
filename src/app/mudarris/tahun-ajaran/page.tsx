import type { Metadata } from "next";
import Link from "next/link";

import { DaftarTahunAjaran } from "@/components/features/tahun-ajaran/daftar-tahun-ajaran";
import { FormTahunAjaran } from "@/components/features/tahun-ajaran/form-tahun-ajaran";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { Button, buttonVariants } from "@/components/ui/button";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Tahun Ajaran" };

export default async function TahunAjaranPage() {
  await wajibAkses((sesi) => sesi.isSuperAdmin);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Tahun Ajaran"
        deskripsi="Hanya satu tahun ajaran yang aktif. Kelas, tagihan bulanan, dan rapor memakai tahun ajaran aktif."
        aksi={
          <div className="flex flex-wrap gap-2">
            <Link href="/mudarris/tahun-ajaran/kenaikan" className={buttonVariants({ variant: "outline" })}>
              Kenaikan Kelas
            </Link>
            <FormTahunAjaran tahunAjaran={null} pemicu={<Button>Tambah Tahun Ajaran</Button>} />
          </div>
        }
      />
      <DaftarTahunAjaran />
    </div>
  );
}
