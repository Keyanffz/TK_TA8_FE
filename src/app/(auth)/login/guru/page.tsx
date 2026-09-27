import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FormLoginGuru } from "@/components/features/auth/form-login-guru";
import { IlustrasiGuru } from "@/components/features/auth/ilustrasi-login";
import { KembaliKePilihan } from "@/components/features/auth/kembali-ke-pilihan";
import { RUTE_LOGIN, urlLogin } from "@/lib/auth/rute-login";
import { amankanTujuan } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Masuk Guru dan Kepala Sekolah" };

export default async function LoginGuruPage({ searchParams }: PageProps<"/login/guru">) {
  const { next } = await searchParams;
  const tujuan = typeof next === "string" ? amankanTujuan(next) : null;

  return (
    <>
      <KembaliKePilihan next={tujuan} />
      <div className="gerak-masuk-naik flex items-center justify-between gap-4 rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-xl leading-tight font-extrabold">Masuk sebagai Guru &amp; Kepala Sekolah</h1>
        <IlustrasiGuru className="w-24 shrink-0" />
      </div>
      <div className="mt-8">
        <Suspense>
          <FormLoginGuru />
        </Suspense>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Orang tua atau wali murid?{" "}
        <Link href={urlLogin(RUTE_LOGIN.wali, tujuan)} className="font-bold text-primary-strong hover:underline">
          Masuk dengan Google
        </Link>
      </p>
    </>
  );
}
