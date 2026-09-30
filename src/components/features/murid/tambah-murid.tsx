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
        toast.success(`${data.nama_lengkap} tersimpan dengan NIS ${data.nis}. Akun wali otomatis sudah dibuat.`);
        router.replace(`/mudarris/murid/${data.id}`);
      }}
    />
  );
}
