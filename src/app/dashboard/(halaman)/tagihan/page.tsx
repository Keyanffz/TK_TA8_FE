import type { Metadata } from "next";

import { TagihanWali } from "@/components/features/tagihan/tagihan-wali";
import { KepalaHalaman } from "@/components/shared/kepala-halaman";

export const metadata: Metadata = { title: "Tagihan" };

export default function TagihanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <KepalaHalaman judul="Tagihan" deskripsi="Pembayaran dilakukan tunai di sekolah dan boleh dicicil. Pilih tagihan untuk melihat sisa dan riwayat pembayarannya." />
      <TagihanWali />
    </div>
  );
}
