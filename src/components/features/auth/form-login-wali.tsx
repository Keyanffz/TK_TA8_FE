"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import { masukDenganNis, tujuanSetelahMasuk } from "@/lib/auth/masuk";

// Backend juga menormalkan NIS (huruf besar, tanpa spasi); di sini supaya
// yang terlihat di kolom sama dengan yang dikirim.
const skemaLoginWali = z.object({
  username: z
    .string()
    .transform((nilai) => nilai.replace(/\s+/g, "").toUpperCase())
    .pipe(z.string().min(1, "NIS anak wajib diisi.")),
  password: z.string().min(1, "Password wajib diisi."),
});

type MasukanLoginWali = z.input<typeof skemaLoginWali>;
type NilaiLoginWali = z.output<typeof skemaLoginWali>;

// Akun nonaktif dan batas percobaan: pesan backend sudah menjelaskan langkahnya.
const KODE_DITAMPILKAN_DI_FORM = ["ACCOUNT_INACTIVE", "ACCOUNT_REJECTED", "TOO_MANY_REQUESTS"];

export function FormLoginWali() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [pesanAkun, setPesanAkun] = useState<string | null>(null);
  const form = useForm<MasukanLoginWali, unknown, NilaiLoginWali>({
    resolver: zodResolver(skemaLoginWali),
    defaultValues: { username: "", password: "" },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: masukDenganNis,
    onSuccess: (user) => {
      router.replace(tujuanSetelahMasuk(user, next));
      router.refresh();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (terapkanErrorValidasi(error, form.setError, ["username", "password"])) return;
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
        <KolomTeks
          label="NIS anak"
          autoComplete="username"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Contoh: TA20260001"
          deskripsi="Tertulis di kartu akun dari sekolah."
          className="font-heading tracking-wider uppercase placeholder:font-sans placeholder:tracking-normal placeholder:normal-case"
          error={errors.username?.message}
          {...form.register("username")}
        />
        <KolomPassword
          label="Password"
          autoComplete="current-password"
          deskripsi="Lupa password? Minta Kepala Sekolah mengembalikannya ke password awal."
          error={errors.password?.message}
          {...form.register("password")}
        />
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Memeriksa..." : "Masuk"}
        </Button>
      </FieldGroup>
    </form>
  );
}
