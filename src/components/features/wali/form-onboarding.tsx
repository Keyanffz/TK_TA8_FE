"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { nikAtauNull, skemaAlamat, skemaNama, skemaNikOpsional, skemaNomorHp, skemaPekerjaan } from "@/lib/auth/skema";

const skemaOnboarding = z.object({
  nama: skemaNama,
  no_hp: skemaNomorHp,
  alamat: skemaAlamat,
  pekerjaan: skemaPekerjaan,
  nik: skemaNikOpsional,
});

type NilaiOnboarding = z.infer<typeof skemaOnboarding>;
const FIELD = ["nama", "no_hp", "alamat", "pekerjaan", "nik"] as const;

/** `PUT /wali/profil` wajib mengirim nama dan nomor HP di setiap permintaan (A7). */
export function FormOnboarding({ namaAwal, noHpAwal }: { namaAwal: string; noHpAwal: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<NilaiOnboarding>({
    resolver: zodResolver(skemaOnboarding),
    defaultValues: { nama: namaAwal, no_hp: noHpAwal, alamat: "", pekerjaan: "", nik: "" },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: ({ nik, ...nilai }: NilaiOnboarding) =>
      ambilData(api.PUT("/wali/profil", { body: { ...nilai, nik: nikAtauNull(nik) } })),
    onSuccess: (hasil) => {
      queryClient.setQueryData(queryKeys.me, hasil.data);
      toast.success("Profil tersimpan. Selamat datang!");
      router.replace("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
    },
  });

  return (
    <form noValidate onSubmit={form.handleSubmit((nilai) => mutation.mutate(nilai))}>
      <FieldGroup>
        <KolomTeks
          label="Nama Anda"
          autoComplete="name"
          deskripsi="Nama dari sekolah masih sementara. Ganti dengan nama lengkap Anda, misalnya Budi Santoso."
          error={errors.nama?.message}
          {...form.register("nama")}
        />
        <KolomTeks
          label="Nomor HP (WhatsApp)"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="08xxxxxxxxxx"
          deskripsi="Dipakai guru dan sekolah untuk menghubungi Anda."
          error={errors.no_hp?.message}
          {...form.register("no_hp")}
        />
        <KolomArea label="Alamat rumah" autoComplete="street-address" rows={3} error={errors.alamat?.message} {...form.register("alamat")} />
        <KolomTeks label="Pekerjaan" autoComplete="organization-title" error={errors.pekerjaan?.message} {...form.register("pekerjaan")} />
        <KolomTeks
          label="NIK (opsional)"
          inputMode="numeric"
          maxLength={16}
          deskripsi="16 angka sesuai KTP. Boleh dikosongkan."
          error={errors.nik?.message}
          {...form.register("nik")}
        />
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Menyimpan..." : "Simpan dan Lanjutkan"}
        </Button>
      </FieldGroup>
    </form>
  );
}
