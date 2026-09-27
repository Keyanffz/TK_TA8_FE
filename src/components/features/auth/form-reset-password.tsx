"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomPassword } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { skemaPasswordBaru } from "@/lib/auth/skema";

const skemaReset = z
  .object({
    password: skemaPasswordBaru,
    password_confirmation: z.string().min(1, "Ulangi password baru."),
  })
  .refine((nilai) => nilai.password === nilai.password_confirmation, {
    path: ["password_confirmation"],
    message: "Password tidak sama.",
  });

type NilaiReset = z.infer<typeof skemaReset>;

export function FormResetPassword({ token, email }: { token: string; email: string }) {
  const form = useForm<NilaiReset>({
    resolver: zodResolver(skemaReset),
    defaultValues: { password: "", password_confirmation: "" },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (nilai: NilaiReset) => ambilData(api.POST("/auth/reset-password", { body: { ...nilai, token, email } })),
    onError: (error) => {
      if (terapkanErrorValidasi(error, form.setError, ["password", "password_confirmation"])) return;
      // Token kedaluwarsa atau email tidak cocok dikembalikan backend di field email/token.
      if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
        const pesan = error.errors?.email?.[0] ?? error.errors?.token?.[0];
        if (pesan) {
          form.setError("root", { message: pesan });
          return;
        }
      }
      toast.error(pesanError(error));
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col gap-6">
        <KotakPesan nada="sukses" judul="Password berhasil diganti">
          Silakan masuk dengan password baru Anda.
        </KotakPesan>
        <Link href="/login?tab=guru" className={buttonVariants({ size: "lg" })}>
          Masuk
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit((nilai) => mutation.mutate(nilai))}>
      <FieldGroup>
        {errors.root?.message ? (
          <KotakPesan nada="bahaya">
            <p>{errors.root.message}</p>
            <Link href="/lupa-password" className="mt-2 inline-block font-semibold underline underline-offset-4">
              Buka halaman lupa password
            </Link>
          </KotakPesan>
        ) : null}
        <p className="text-sm text-muted-foreground">Akun: {email}</p>
        <KolomPassword
          label="Password baru"
          autoComplete="new-password"
          deskripsi="Minimal 8 karakter, berisi huruf dan angka."
          error={errors.password?.message}
          {...form.register("password")}
        />
        <KolomPassword
          label="Ulangi password baru"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...form.register("password_confirmation")}
        />
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
      </FieldGroup>
    </form>
  );
}
