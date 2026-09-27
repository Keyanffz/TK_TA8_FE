"use client";

import { toast } from "sonner";

import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { Button } from "@/components/ui/button";
import { useTerimaPembayaran, useTolakPembayaran } from "@/lib/api/pembayaran";
import { formatRupiah } from "@/lib/format";

type AksiVerifikasiProps = { id: number; jumlah: number; namaTagihan: string; namaMurid: string; besar?: boolean };

/** Terima atau tolak bukti transfer wali (A6: verifikasi). */
export function AksiVerifikasi({ id, jumlah, namaTagihan, namaMurid, besar = false }: AksiVerifikasiProps) {
  const terima = useTerimaPembayaran();
  const tolak = useTolakPembayaran();
  const ukuran = besar ? "lg" : "sm";

  return (
    <div className="flex flex-wrap gap-2">
      <DialogKonfirmasi
        pemicu={<Button size={ukuran}>Terima Pembayaran</Button>}
        judul="Terima pembayaran ini?"
        deskripsi={`${namaTagihan} ${namaMurid} sebesar ${formatRupiah(jumlah)} menjadi lunas dan wali mendapat kwitansi. Pastikan uangnya sudah masuk ke rekening sekolah.`}
        labelAksi="Terima Pembayaran"
        onKonfirmasi={async () => {
          await terima.mutateAsync(id);
          toast.success(`${namaTagihan} ${namaMurid} lunas.`);
        }}
      />
      <DialogKonfirmasi
        pemicu={
          <Button size={ukuran} variant="outline">
            Tolak
          </Button>
        }
        judul="Tolak bukti transfer ini?"
        deskripsi="Alasan dikirim ke wali, dan tagihan kembali bisa dibayar."
        labelAksi="Tolak Pembayaran"
        labelAlasan="Alasan penolakan"
        berbahaya
        onKonfirmasi={async (alasan) => {
          await tolak.mutateAsync({ id, alasan });
          toast.success("Pembayaran ditolak dan wali diberi tahu.");
        }}
      />
    </div>
  );
}
