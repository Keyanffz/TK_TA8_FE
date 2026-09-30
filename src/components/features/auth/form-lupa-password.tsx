"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { skemaEmail } from "@/lib/auth/skema";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";

const skemaLupa = z.object({ email: skemaEmail });
type NilaiLupa = z.infer<typeof skemaLupa>;

export function FormLupaPassword() {
  const form = useForm<NilaiLupa>({ resolver: zodResolver(skemaLupa), defaultValues: { email: "" } });

  const mutation = useMutation({
    mutationFn: (body: NilaiLupa) => ambilData(api.POST("/auth/forgot-password", { body })),
    onError: (error) => {
      if (!terapkanErrorValidasi(error, form.setError, ["email"])) toast.error(pesanError(error));
    },
  });

  return (
    <form noValidate onSubmit={form.handleSubmit((nilai) => mutation.mutate(nilai))}>
      <FieldGroup>
        {mutation.isSuccess ? (
          // Backend tidak memberi tahu apakah email terdaftar, jadi pesannya dibuat netral.
          <KotakPesan nada="sukses" judul="Periksa email Anda">
            Kalau {mutation.variables.email} terdaftar sebagai akun guru atau Kepala Sekolah, tautan untuk membuat
            password baru sudah dikirim. Tautan berlaku 60 menit.
          </KotakPesan>
        ) : null}
        <KolomTeks
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Mengirim..." : "Kirim Tautan Reset"}
        </Button>
        <Link href={RUTE_LOGIN.staff} className="text-sm font-semibold text-primary-strong hover:underline">
          Kembali ke halaman masuk
        </Link>
      </FieldGroup>
    </form>
  );
}
