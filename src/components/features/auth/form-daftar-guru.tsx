"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomPassword, KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { skemaEmail, skemaNomorHp, skemaPasswordBaru } from "@/lib/auth/skema";
import { LABEL_JENIS_KELAMIN } from "@/lib/constants/label";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";

const skemaDaftar = z
  .object({
    name: z.string().trim().min(1, "Nama lengkap wajib diisi.").max(255, "Nama terlalu panjang."),
    email: skemaEmail,
    no_hp: skemaNomorHp,
    jenis_kelamin: z.enum(["L", "P"], { error: "Pilih jenis kelamin." }),
    password: skemaPasswordBaru,
    password_confirmation: z.string().min(1, "Ulangi password Anda."),
  })
  .refine((nilai) => nilai.password === nilai.password_confirmation, {
    path: ["password_confirmation"],
    message: "Password tidak sama.",
  });

type NilaiDaftar = z.input<typeof skemaDaftar>;

const FIELD = ["name", "email", "no_hp", "jenis_kelamin", "password", "password_confirmation"] as const;

export function FormDaftarGuru() {
  const form = useForm<NilaiDaftar, unknown, z.output<typeof skemaDaftar>>({
    resolver: zodResolver(skemaDaftar),
    defaultValues: { name: "", email: "", no_hp: "", password: "", password_confirmation: "" },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (body: z.output<typeof skemaDaftar>) => ambilData(api.POST("/auth/register-guru", { body })),
    onError: (error) => {
      if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col gap-6">
        <KotakPesan nada="sukses" judul="Pendaftaran terkirim">
          Akun Anda menunggu persetujuan Kepala Sekolah. Kami mengirim email ke {mutation.variables.email} setelah akun
          disetujui, lalu Anda bisa masuk dengan email dan password yang baru dibuat.
        </KotakPesan>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit((nilai) => mutation.mutate(nilai))}>
      <FieldGroup>
        <KolomTeks label="Nama lengkap" autoComplete="name" error={errors.name?.message} {...form.register("name")} />
        <KolomTeks label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...form.register("email")} />
        <KolomTeks
          label="Nomor HP"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="08xxxxxxxxxx"
          error={errors.no_hp?.message}
          {...form.register("no_hp")}
        />
        <FieldSet data-invalid={errors.jenis_kelamin ? true : undefined}>
          <FieldLegend variant="label">Jenis kelamin</FieldLegend>
          <Controller
            control={form.control}
            name="jenis_kelamin"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                aria-invalid={errors.jenis_kelamin ? true : undefined}
                className="flex gap-6"
              >
                {(["L", "P"] as const).map((nilai) => (
                  <Field key={nilai} orientation="horizontal" className="w-auto">
                    <RadioGroupItem value={nilai} id={`jenis-kelamin-${nilai}`} />
                    <FieldLabel htmlFor={`jenis-kelamin-${nilai}`} className="font-normal">
                      {LABEL_JENIS_KELAMIN[nilai]}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
            )}
          />
          {errors.jenis_kelamin ? <FieldError>{errors.jenis_kelamin.message}</FieldError> : null}
        </FieldSet>
        <KolomPassword
          label="Password"
          autoComplete="new-password"
          deskripsi="Minimal 8 karakter, berisi huruf dan angka."
          error={errors.password?.message}
          {...form.register("password")}
        />
        <KolomPassword
          label="Ulangi password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...form.register("password_confirmation")}
        />
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Mengirim..." : "Daftar sebagai Guru"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href={RUTE_LOGIN.guru} className="font-semibold text-primary-strong hover:underline">
            Masuk
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
