"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormMurid } from "@/components/features/murid/form-murid";
import { useTambahMurid } from "@/lib/api/murid";

export function TambahMurid() {
  const router = useRouter();
  const tambah = useTambahMurid();

  return (
    <FormMurid
      murid={null}
      labelSimpan="Simpan Murid"
      kirim={async (body) => {
        const { data } = await tambah.mutateAsync(body);
        if (data.data_kurang.length === 0) {
          toast.success(`${data.nama_lengkap} tersimpan. Akun wali dibuat setelah Kepala Sekolah mengisi NIS.`);
          router.replace(`/mudarris/murid/${data.id}`);
        } else {
          // Tetap di wizard (mode ubah) supaya isian yang masih kosong bisa langsung dilengkapi.
          toast.success(`${data.nama_lengkap} tersimpan, tetapi datanya belum lengkap.`);
          router.replace(`/mudarris/murid/${data.id}/ubah?langkah=konfirmasi`);
        }
        return data;
      }}
    />
  );
}
