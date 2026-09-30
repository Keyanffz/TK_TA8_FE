"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { TombolMasuk } from "@/components/features/auth/tombol-masuk";
import { useMasuk } from "@/components/features/auth/use-masuk";
import { KolomPassword, KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { FieldGroup } from "@/components/ui/field";
import { masukWali } from "@/lib/auth/masuk";

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

export function FormLoginWali() {
  const form = useForm<MasukanLoginWali, unknown, NilaiLoginWali>({
    resolver: zodResolver(skemaLoginWali),
    defaultValues: { username: "", password: "" },
  });
  const { errors } = form.formState;
  const { masuk, sedangMemeriksa, pesan, sisaJeda } = useMasuk({
    kirim: masukWali,
    pesanGagal: () => "NIS anak atau password salah. Periksa kembali NIS di kartu akun dari sekolah.",
  });

  return (
    <form noValidate onSubmit={form.handleSubmit(masuk)}>
      <FieldGroup>
        {pesan ? <KotakPesan nada="bahaya">{pesan}</KotakPesan> : null}
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
        <TombolMasuk sedangMemeriksa={sedangMemeriksa} sisaJeda={sisaJeda} />
      </FieldGroup>
    </form>
  );
}
