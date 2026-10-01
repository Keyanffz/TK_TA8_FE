import type { Metadata } from "next";

import { RiwayatAbsensi } from "@/components/features/absensi/riwayat-absensi";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { TautanKembali } from "@/components/shared/tautan-kembali";
import { wajibSesi } from "@/lib/auth/akses";

export const metadata: Metadata = { title: "Riwayat Absensi" };

export default async function RiwayatAbsensiPage() {
  await wajibSesi();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
      <TautanKembali href="/mudarris/absensi">Kembali ke absensi</TautanKembali>
      <KepalaHalaman judul="Riwayat Absensi Saya" deskripsi="Foto disimpan sementara dan dihapus otomatis setelah masa simpan dari sekolah; catatan absensinya tetap ada." />
      <RiwayatAbsensi />
    </div>
  );
}
