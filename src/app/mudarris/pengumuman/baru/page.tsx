import type { Metadata } from "next";

import { PengumumanBaru } from "@/components/features/pengumuman/pengumuman-baru";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Tulis Pengumuman" };

export default async function PengumumanBaruPage({ searchParams }: PageProps<"/mudarris/pengumuman/baru">) {
  const user = await wajibAkses((sesi) => sesi.isSuperAdmin || sesi.isGuru);
  const { dari, kelas } = await searchParams;
  const dariTunggakan = dari === "tunggakan" && user.permissions.kelola_keuangan;
  const kelasId = Number(kelas);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Tulis Pengumuman"
        deskripsi={dariTunggakan ? "Pengingat untuk wali murid yang anaknya punya tagihan lewat jatuh tempo." : "Simpan sebagai draft dulu kalau belum siap dikirim."}
      />
      <PengumumanBaru dariTunggakan={dariTunggakan} kelasId={Number.isInteger(kelasId) && kelasId > 0 ? kelasId : null} />
    </div>
  );
}
