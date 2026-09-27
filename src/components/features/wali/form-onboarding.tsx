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
import { skemaNikOpsional, skemaNomorHp } from "@/lib/auth/skema";

const skemaOnboarding = z.object({
  no_hp: skemaNomorHp,
  alamat: z.string().trim().min(1, "Alamat wajib diisi.").max(500, "Alamat maksimal 500 karakter."),
  pekerjaan: z.string().trim().min(1, "Pekerjaan wajib diisi.").max(100, "Pekerjaan maksimal 100 karakter."),
  nik: skemaNikOpsional,
});

type NilaiOnboarding = z.infer<typeof skemaOnboarding>;
const FIELD = ["no_hp", "alamat", "pekerjaan", "nik"] as const;

export function FormOnboarding({ noHpAwal }: { noHpAwal: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<NilaiOnboarding>({
    resolver: zodResolver(skemaOnboarding),
    defaultValues: { no_hp: noHpAwal, alamat: "", pekerjaan: "", nik: "" },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: ({ nik, ...nilai }: NilaiOnboarding) =>
      ambilData(api.PUT("/wali/profil", { body: { ...nilai, nik: nik === "" ? null : nik } })),
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
