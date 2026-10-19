import type { Metadata } from "next";

import { DialogGenerateTagihan } from "@/components/features/tagihan/dialog-generate-tagihan";
import { DialogTagihanSekali } from "@/components/features/tagihan/dialog-tagihan-sekali";
import { TabelTagihan } from "@/components/features/tagihan/tabel-tagihan";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";
import { wajibSesi } from "@/lib/auth/akses";
import { punyaIzin, statusSesi } from "@/lib/auth/role";

export const metadata: Metadata = { title: "Tagihan" };

export default async function TagihanMudarrisPage() {
  const sesi = statusSesi(await wajibSesi());
  const lihatSemua = punyaIzin(sesi, "keuangan");
  const bisaKelola = punyaIzin(sesi, "keuangan", "kelola");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman
        judul="Tagihan"
        deskripsi={
          bisaKelola
            ? "Tagihan bulanan dibuat otomatis tiap tanggal 1. Tagihan sekali bayar dibuat dari sini."
            : lihatSemua
              ? "Tagihan semua murid. Hanya bisa dilihat."
              : "Status tagihan murid di kelas yang Anda ampu. Hanya bisa dilihat."
        }
        aksi={
          bisaKelola ? (
            <div className="flex flex-wrap gap-2">
              <DialogTagihanSekali />
              {sesi.isSuperAdmin ? <DialogGenerateTagihan /> : null}
            </div>
          ) : null
        }
      />
      <TabelTagihan petugasKeuangan={lihatSemua} />
    </div>
  );
}
