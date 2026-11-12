"use client";

import { toast } from "sonner";

import { DialogCatatPembayaran } from "@/components/features/tagihan/dialog-catat-pembayaran";
import { DialogUbahTagihan } from "@/components/features/tagihan/dialog-ubah-tagihan";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { Button } from "@/components/ui/button";
import { useAktifkanTagihan, useBatalkanTagihan } from "@/lib/api/tagihan";
import { namaTagihan, tagihanTerbuka } from "@/lib/tagihan";
import type { TagihanDetail } from "@/types/domain";

type AksiTagihanProps = {
  tagihan: TagihanDetail;
  /** Petugas keuangan dan wali kelas murid itu. */
  bisaCatat: boolean;
  /** Petugas keuangan. */
  bisaUbah: boolean;
  kepalaSekolah: boolean;
};

/** Catat pembayaran, ubah tagihan, dan batalkan atau aktifkan kembali (hanya Kepala Sekolah, A7). */
export function AksiTagihan({ tagihan, bisaCatat, bisaUbah, kepalaSekolah }: AksiTagihanProps) {
  const batalkan = useBatalkanTagihan(tagihan.id);
  const aktifkan = useAktifkanTagihan(tagihan.id);
  const nama = `${namaTagihan(tagihan)} ${tagihan.murid.nama_panggilan}`;
  const terbuka = tagihanTerbuka(tagihan.status);
  // Backend menolak membatalkan tagihan yang sudah punya pembayaran diterima.
  const bisaBatalkan = terbuka && kepalaSekolah && tagihan.terbayar === 0;
  const bisaAktifkan = kepalaSekolah && tagihan.status === "dibatalkan";

  if (!(terbuka && (bisaCatat || bisaUbah)) && !bisaAktifkan) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {terbuka && bisaCatat ? <DialogCatatPembayaran tagihan={tagihan} /> : null}
      {terbuka && bisaUbah ? <DialogUbahTagihan tagihan={tagihan} /> : null}
      {bisaBatalkan ? (
        <DialogKonfirmasi
          pemicu={<Button variant="ghost">Batalkan Tagihan</Button>}
          judul={`Batalkan ${nama}?`}
          deskripsi="Tagihan tidak ditagihkan lagi dan tidak dibuat ulang saat generate bulanan. Bisa diaktifkan kembali nanti."
          labelAksi="Batalkan Tagihan"
          labelAlasan="Alasan pembatalan"
          berbahaya
          onKonfirmasi={async (alasan) => {
            await batalkan.mutateAsync(alasan);
            toast.success(`${nama} dibatalkan.`);
          }}
        />
      ) : null}
      {bisaAktifkan ? (
        <DialogKonfirmasi
          pemicu={<Button variant="secondary">Aktifkan Kembali</Button>}
          judul={`Aktifkan kembali ${nama}?`}
          deskripsi="Status kembali belum lunas, atau terlambat kalau jatuh temponya sudah lewat. Wali tidak diberi notifikasi. Ditolak kalau murid sudah punya tagihan aktif lain untuk jenis dan periode yang sama."
          labelAksi="Aktifkan Kembali"
          onKonfirmasi={async () => {
            const hasil = await aktifkan.mutateAsync();
            toast.success(hasil.data.status === "terlambat" ? `${nama} aktif kembali dan berstatus terlambat.` : `${nama} aktif kembali.`);
          }}
        />
      ) : null}
    </div>
  );
}
