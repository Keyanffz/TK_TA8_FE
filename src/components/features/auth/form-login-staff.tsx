"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { TombolMasuk } from "@/components/features/auth/tombol-masuk";
import { useMasuk } from "@/components/features/auth/use-masuk";
import { KolomPassword, KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { FieldGroup } from "@/components/ui/field";
import { masukStaff } from "@/lib/auth/masuk";
import { RUTE_AKUN_STAFF } from "@/lib/auth/rute-login";
import { skemaEmail } from "@/lib/auth/skema";

const skemaLogin = z.object({
  email: skemaEmail,
  password: z.string().min(1, "Password wajib diisi."),
});

type NilaiLogin = z.infer<typeof skemaLogin>;

export function FormLoginStaff() {
  const form = useForm<NilaiLogin>({ resolver: zodResolver(skemaLogin), defaultValues: { email: "", password: "" } });
  const { errors } = form.formState;
  const { masuk, sedangMemeriksa, pesan, sisaJeda } = useMasuk({
    kirim: masukStaff,
    pesanGagal: "Email atau password salah. Periksa kembali, atau atur ulang lewat Lupa password.",
  });

  return (
    <form noValidate onSubmit={form.handleSubmit(masuk)}>
      <FieldGroup>
        {pesan ? <KotakPesan nada="bahaya">{pesan}</KotakPesan> : null}
        <KolomTeks label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...form.register("email")} />
        <KolomPassword label="Password" autoComplete="current-password" error={errors.password?.message} {...form.register("password")} />
        <div className="-mt-2 text-right">
          <Link href={RUTE_AKUN_STAFF.lupaPassword} className="text-sm font-semibold text-primary-strong hover:underline">
            Lupa password?
          </Link>
        </div>
        <TombolMasuk sedangMemeriksa={sedangMemeriksa} sisaJeda={sisaJeda} />
        <p className="text-sm text-muted-foreground">
          Belum punya akun guru?{" "}
          <Link href={RUTE_AKUN_STAFF.daftar} className="font-semibold text-primary-strong hover:underline">
            Daftar sebagai guru
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
