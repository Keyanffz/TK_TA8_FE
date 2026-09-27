"use client";

import { toast } from "sonner";

import { DialogCatatPembayaran } from "@/components/features/tagihan/dialog-catat-pembayaran";
import { DialogUbahTagihan } from "@/components/features/tagihan/dialog-ubah-tagihan";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { Button } from "@/components/ui/button";
import { useAktifkanTagihan, useBatalkanTagihan } from "@/lib/api/tagihan";
import { namaTagihan, tagihanTerbuka } from "@/lib/tagihan";
import type { TagihanDetail } from "@/types/domain";

/** Aksi petugas keuangan; batalkan dan aktifkan kembali hanya untuk Kepala Sekolah (A7). */
export function AksiTagihan({ tagihan, kepalaSekolah }: { tagihan: TagihanDetail; kepalaSekolah: boolean }) {
  const batalkan = useBatalkanTagihan(tagihan.id);
  const aktifkan = useAktifkanTagihan(tagihan.id);
  const nama = `${namaTagihan(tagihan)} ${tagihan.murid.nama_panggilan}`;
  const terbuka = tagihanTerbuka(tagihan.status);

  if (!terbuka && !(kepalaSekolah && tagihan.status === "dibatalkan")) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {terbuka ? (
        <>
          <DialogCatatPembayaran tagihan={tagihan} />
          <DialogUbahTagihan tagihan={tagihan} />
        </>
      ) : null}
      {terbuka && kepalaSekolah ? (
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
      {kepalaSekolah && tagihan.status === "dibatalkan" ? (
        <DialogKonfirmasi
          pemicu={<Button variant="secondary">Aktifkan Kembali</Button>}
          judul={`Aktifkan kembali ${nama}?`}
          deskripsi="Status kembali belum dibayar, atau terlambat kalau jatuh temponya sudah lewat. Wali tidak diberi notifikasi. Ditolak kalau murid sudah punya tagihan aktif lain untuk jenis dan periode yang sama."
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
