"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomPassword, KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { masukDenganEmail, tujuanSetelahMasuk } from "@/lib/auth/masuk";
import { skemaEmail } from "@/lib/auth/skema";

const skemaLogin = z.object({
  email: skemaEmail,
  password: z.string().min(1, "Password wajib diisi."),
});

type NilaiLogin = z.infer<typeof skemaLogin>;

// Pesan dari backend untuk kode ini sudah menjelaskan penyebab dan langkahnya
// (alasan penolakan, akun nonaktif, batas percobaan), jadi ditampilkan di form.
const KODE_DITAMPILKAN_DI_FORM = ["ACCOUNT_REJECTED", "ACCOUNT_INACTIVE", "TOO_MANY_REQUESTS"];

export function FormLoginGuru() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [pesanAkun, setPesanAkun] = useState<string | null>(null);
  const form = useForm<NilaiLogin>({ resolver: zodResolver(skemaLogin), defaultValues: { email: "", password: "" } });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: masukDenganEmail,
    onSuccess: (user) => {
      router.replace(tujuanSetelahMasuk(user, next));
      router.refresh();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.code === "ACCOUNT_PENDING") {
          router.push("/menunggu-persetujuan");
          return;
        }
        if (terapkanErrorValidasi(error, form.setError, ["email", "password"])) return;
        if (KODE_DITAMPILKAN_DI_FORM.includes(error.code)) {
          setPesanAkun(error.message);
          return;
        }
      }
      toast.error(pesanError(error));
    },
  });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((nilai) => {
        setPesanAkun(null);
        mutation.mutate(nilai);
      })}
    >
      <FieldGroup>
        {pesanAkun ? <KotakPesan nada="bahaya">{pesanAkun}</KotakPesan> : null}
        <KolomTeks label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...form.register("email")} />
        <KolomPassword label="Password" autoComplete="current-password" error={errors.password?.message} {...form.register("password")} />
        <div className="-mt-2 text-right">
          <Link href="/lupa-password" className="text-sm font-semibold text-primary hover:underline">
            Lupa password?
          </Link>
        </div>
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Memeriksa..." : "Masuk"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Belum punya akun guru?{" "}
          <Link href="/daftar-guru" className="font-semibold text-primary hover:underline">
            Daftar sebagai guru
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
