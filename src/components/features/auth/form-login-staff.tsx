"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { TombolMasuk } from "@/components/features/auth/tombol-masuk";
import { KolomPassword, KolomTeks } from "@/components/shared/kolom-teks";
import { FieldGroup } from "@/components/ui/field";
import { RUTE_AKUN_STAFF } from "@/lib/auth/rute-login";
import { skemaEmail } from "@/lib/auth/skema";

const skemaLogin = z.object({
  email: skemaEmail,
  password: z.string().min(1, "Password wajib diisi."),
});

export type NilaiLoginStaff = z.infer<typeof skemaLogin>;

type FormLoginStaffProps = {
  masuk: (nilai: NilaiLoginStaff) => void;
  sedangMemeriksa: boolean;
  sisaJeda: number;
  /** Masuk dengan Google sedang diproses. */
  nonaktif: boolean;
};

/**
 * Login password, hanya untuk Kepala Sekolah. Guru ditolak backend dengan
 * pesan yang sama seperti password salah. Pesan gagal ditampilkan `MasukStaff`
 * karena dipakai bersama dengan login Google.
 */
export function FormLoginStaff({ masuk, sedangMemeriksa, sisaJeda, nonaktif }: FormLoginStaffProps) {
  const form = useForm<NilaiLoginStaff>({ resolver: zodResolver(skemaLogin), defaultValues: { email: "", password: "" } });
  const { errors } = form.formState;

  return (
    <form noValidate onSubmit={form.handleSubmit(masuk)}>
      <FieldGroup>
        <KolomTeks label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...form.register("email")} />
        <KolomPassword label="Password" autoComplete="current-password" error={errors.password?.message} {...form.register("password")} />
        <div className="-mt-2 text-right">
          <Link href={RUTE_AKUN_STAFF.lupaPassword} className="text-sm font-semibold text-primary-strong hover:underline">
            Lupa password?
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <TombolMasuk sedangMemeriksa={sedangMemeriksa} sisaJeda={sisaJeda} nonaktif={nonaktif} />
          <p className="text-sm text-muted-foreground">Masuk dengan password khusus untuk Kepala Sekolah.</p>
        </div>
      </FieldGroup>
    </form>
  );
}
