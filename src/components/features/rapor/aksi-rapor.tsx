"use client";

import { toast } from "sonner";

import { TombolPdfRapor } from "@/components/features/rapor/tombol-pdf-rapor";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { Button } from "@/components/ui/button";
import { useAjukanRapor, useMintaRevisiRapor, useTarikRapor, useTerbitkanRapor } from "@/lib/api/rapor";
import { namaFileRapor } from "@/lib/rapor";
import type { RaporDetail } from "@/types/domain";

type AksiRaporProps = {
  rapor: RaporDetail;
  pembuat: boolean;
  kepalaSekolah: boolean;
  /** Perubahan di editor belum disimpan; aksi status ditahan supaya isi terbaru yang dikirim. */
  adaPerubahan: boolean;
};

/** Tombol alur rapor (A6): guru ajukan; Kepala Sekolah terbitkan, minta revisi, atau tarik rapor terbit. */
export function AksiRapor({ rapor, pembuat, kepalaSekolah, adaPerubahan }: AksiRaporProps) {
  const ajukan = useAjukanRapor(rapor.id);
  const terbitkan = useTerbitkanRapor(rapor.id);
  const revisi = useMintaRevisiRapor(rapor.id);
  const tarik = useTarikRapor(rapor.id);
  const nama = rapor.murid.nama_panggilan;
  const bisaDiajukan = pembuat && (rapor.status === "draft" || rapor.status === "revisi");
  const bisaDireview = kepalaSekolah && rapor.status === "diajukan";

  return (
    <div className="flex flex-col gap-2">
      {adaPerubahan && (bisaDiajukan || bisaDireview) ? (
        <p className="text-sm font-bold text-status-menunggu">Simpan perubahan dulu sebelum {bisaDiajukan ? "mengajukan" : "menerbitkan"} rapor.</p>
      ) : null}
      {bisaDiajukan ? (
        <DialogKonfirmasi
          pemicu={<Button disabled={adaPerubahan}>Ajukan ke Kepala Sekolah</Button>}
          judul={`Ajukan rapor ${nama}?`}
          deskripsi="Rapor tidak bisa diubah selama direview. Semua elemen harus sudah berisi deskripsi."
          labelAksi="Ajukan Rapor"
          onKonfirmasi={async () => {
            toast.success((await ajukan.mutateAsync()).message);
          }}
        />
      ) : null}
      {bisaDireview ? (
        <>
          <DialogKonfirmasi
            pemicu={<Button disabled={adaPerubahan}>Terbitkan Rapor</Button>}
            judul={`Terbitkan rapor ${nama}?`}
            deskripsi="Wali murid menerima notifikasi dan bisa melihat serta mengunduh rapor ini."
            labelAksi="Terbitkan Rapor"
            onKonfirmasi={async () => {
              toast.success((await terbitkan.mutateAsync()).message);
            }}
          />
          <DialogKonfirmasi
            pemicu={<Button variant="outline">Minta Revisi</Button>}
            judul={`Kembalikan rapor ${nama} ke guru?`}
            deskripsi="Guru pembuat menerima notifikasi beserta catatan Anda, lalu memperbaiki dan mengajukan ulang."
            labelAksi="Minta Revisi"
            labelAlasan="Catatan untuk guru"
            onKonfirmasi={async (catatan) => {
              toast.success((await revisi.mutateAsync(catatan)).message);
            }}
          />
        </>
      ) : null}
      {kepalaSekolah && rapor.status === "terbit" ? (
        <DialogKonfirmasi
          pemicu={<Button variant="outline">Tarik Rapor</Button>}
          judul={`Tarik rapor ${nama}?`}
          deskripsi="Rapor kembali ke guru untuk direvisi. Wali murid tidak bisa melihat atau mengunduhnya sampai diterbitkan ulang."
          labelAksi="Tarik Rapor"
          labelAlasan="Catatan untuk guru"
          berbahaya
          onKonfirmasi={async (catatan) => {
            toast.success((await tarik.mutateAsync(catatan)).message);
          }}
        />
      ) : null}
      <TombolPdfRapor id={rapor.id} namaFile={namaFileRapor(rapor)} mode="pratinjau" />
    </div>
  );
}
