"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { nikAtauNull, skemaAlamat, skemaNikOpsional, skemaPekerjaan } from "@/lib/auth/skema";

const skemaDataWali = z.object({ alamat: skemaAlamat, pekerjaan: skemaPekerjaan, nik: skemaNikOpsional });

type NilaiDataWali = z.infer<typeof skemaDataWali>;
const FIELD = ["alamat", "pekerjaan", "nik"] as const;

type FormDataWaliProps = { alamat: string | null; pekerjaan: string | null; nik: string | null };

/** Alamat, pekerjaan, dan NIK wali setelah onboarding (`PUT /wali/profil`, boleh sebagian). */
export function FormDataWali({ alamat, pekerjaan, nik }: FormDataWaliProps) {
  const queryClient = useQueryClient();
  const form = useForm<NilaiDataWali>({
    resolver: zodResolver(skemaDataWali),
    defaultValues: { alamat: alamat ?? "", pekerjaan: pekerjaan ?? "", nik: nik ?? "" },
  });
  const { errors, isDirty } = form.formState;

  const mutation = useMutation({
    mutationFn: (nilai: NilaiDataWali) =>
      ambilData(api.PUT("/wali/profil", { body: { ...nilai, nik: nikAtauNull(nilai.nik) } })),
    onSuccess: (hasil) => {
      queryClient.setQueryData(queryKeys.me, hasil.data);
      const wali = hasil.data.wali_murid;
      form.reset({ alamat: wali?.alamat ?? "", pekerjaan: wali?.pekerjaan ?? "", nik: wali?.nik ?? "" });
      toast.success("Data wali tersimpan.");
    },
    onError: (error) => {
      if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
    },
  });

  return (
    <form noValidate onSubmit={form.handleSubmit((nilai) => mutation.mutate(nilai))}>
      <FieldGroup>
        <KolomArea label="Alamat rumah" autoComplete="street-address" rows={3} error={errors.alamat?.message} {...form.register("alamat")} />
        <KolomTeks label="Pekerjaan" autoComplete="organization-title" error={errors.pekerjaan?.message} {...form.register("pekerjaan")} />
        <KolomTeks
          label="NIK (opsional)"
          inputMode="numeric"
          maxLength={16}
          deskripsi="16 angka sesuai KTP. Kosongkan untuk menghapus."
          error={errors.nik?.message}
          {...form.register("nik")}
        />
        <Button type="submit" size="lg" disabled={mutation.isPending || !isDirty} className="self-start">
          {mutation.isPending ? "Menyimpan..." : "Simpan Data Wali"}
        </Button>
      </FieldGroup>
    </form>
  );
}
