"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormPendaftaran } from "@/components/features/ppdb/form-pendaftaran";
import { keBodyPendaftaran } from "@/components/features/ppdb/skema-pendaftaran";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { keFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";

/** Kakak/adik didaftarkan wali yang masuk; kalau diterima, langsung tertaut ke akun ini (A2.3). */
export function DaftarPpdbWali({ noHp, alamat }: { noHp: string; alamat: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <FormPendaftaran
      nilaiAwal={{ no_hp: noHp, alamat }}
      kirim={async (nilai) =>
        (await ambilData(api.POST("/pendaftaran", { body: keBodyPendaftaran(nilai), bodySerializer: keFormData }))).data
      }
      onBerhasil={async (pendaftaran) => {
        toast.success(`Pendaftaran ${pendaftaran.nama_panggilan} terkirim dengan kode ${pendaftaran.kode}.`);
        await queryClient.invalidateQueries({ queryKey: queryKeys.pendaftaranSaya });
        router.push("/dashboard/ppdb");
      }}
    />
  );
}
