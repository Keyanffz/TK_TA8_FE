import type { Metadata } from "next";

import { PembayaranSekolah } from "@/components/features/pembayaran/pembayaran-sekolah";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibAkses } from "@/lib/auth/akses";
import { punyaIzin, statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Pembayaran" };

export default async function PembayaranMudarrisPage() {
  const sesi = statusSesi(await wajibAkses((sesi) => punyaIzin(sesi, "keuangan")));
  const bisaVerifikasi = punyaIzin(sesi, "keuangan", "kelola");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Pembayaran"
        deskripsi={
          bisaVerifikasi
            ? "Periksa bukti transfer dari wali. Pembayaran tunai dicatat dari halaman detail tagihan."
            : "Bukti transfer dari wali dan riwayat pembayaran. Hanya bisa dilihat."
        }
      />
      <PembayaranSekolah bisaVerifikasi={bisaVerifikasi} />
    </div>
  );
}
