"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomPassword } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { skemaPasswordBaru } from "@/lib/auth/skema";

const skemaGantiPassword = z
  .object({
    current_password: z.string().min(1, "Password lama wajib diisi."),
    password: skemaPasswordBaru,
    password_confirmation: z.string().min(1, "Ulangi password baru."),
  })
  .refine((nilai) => nilai.password === nilai.password_confirmation, {
    path: ["password_confirmation"],
    message: "Password baru tidak sama.",
  })
  .refine((nilai) => nilai.password !== nilai.current_password, {
    path: ["password"],
    message: "Password baru harus berbeda dari password lama.",
  });

type NilaiGantiPassword = z.infer<typeof skemaGantiPassword>;
const FIELD = ["current_password", "password", "password_confirmation"] as const;
const KOSONG: NilaiGantiPassword = { current_password: "", password: "", password_confirmation: "" };

export function FormGantiPassword() {
  const form = useForm<NilaiGantiPassword>({ resolver: zodResolver(skemaGantiPassword), defaultValues: KOSONG });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (body: NilaiGantiPassword) => ambilData(api.PUT("/auth/password", { body })),
    onSuccess: (hasil) => {
      form.reset(KOSONG);
      toast.success(hasil.message);
    },
    onError: (error) => {
      if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
    },
  });

  return (
    <form noValidate onSubmit={form.handleSubmit((nilai) => mutation.mutate(nilai))}>
      <FieldGroup>
        <KolomPassword
          label="Password lama"
          autoComplete="current-password"
          error={errors.current_password?.message}
          {...form.register("current_password")}
        />
        <KolomPassword
          label="Password baru"
          autoComplete="new-password"
          deskripsi="Minimal 8 karakter, berisi huruf dan angka. Perangkat lain akan dikeluarkan."
          error={errors.password?.message}
          {...form.register("password")}
        />
        <KolomPassword
          label="Ulangi password baru"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...form.register("password_confirmation")}
        />
        <Button type="submit" size="lg" variant="outline" disabled={mutation.isPending} className="self-start">
          {mutation.isPending ? "Mengganti..." : "Ganti Password"}
        </Button>
      </FieldGroup>
    </form>
  );
}
