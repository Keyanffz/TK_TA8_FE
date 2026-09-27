import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { IlustrasiWali } from "@/components/features/auth/ilustrasi-login";
import { KembaliKePilihan } from "@/components/features/auth/kembali-ke-pilihan";
import { MasukGoogle } from "@/components/features/auth/masuk-google";
import { RUTE_LOGIN, urlLogin } from "@/lib/auth/rute-login";
import { amankanTujuan } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Masuk Wali Murid" };

export default async function LoginWaliPage({ searchParams }: PageProps<"/login/wali">) {
  const { next } = await searchParams;
  const tujuan = typeof next === "string" ? amankanTujuan(next) : null;

  return (
    <>
      <KembaliKePilihan next={tujuan} />
      <div className="gerak-masuk-naik rounded-xl bg-highlight p-6 text-highlight-foreground">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl leading-tight font-extrabold">Masuk sebagai Orang Tua / Wali Murid</h1>
          <IlustrasiWali className="w-24 shrink-0" />
        </div>
        <p className="mt-3">
          Wali murid masuk memakai akun Google. Saat pertama kali masuk, akun dibuat otomatis dan Anda diminta
          melengkapi nomor HP, alamat, dan pekerjaan.
        </p>
      </div>
      <div className="mt-6">
        <Suspense>
          <MasukGoogle clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || undefined} />
        </Suspense>
      </div>
      <ol className="mt-8 space-y-2 text-sm text-muted-foreground">
        <li>Setelah masuk, tautkan anak dengan kode tautan dari sekolah dan tanggal lahir anak.</li>
        <li>Belum punya anak di sekolah ini? Anda bisa mendaftarkan anak lewat PPDB setelah masuk.</li>
      </ol>
      <p className="mt-8 text-sm text-muted-foreground">
        Anda guru atau Kepala Sekolah?{" "}
        <Link href={urlLogin(RUTE_LOGIN.guru, tujuan)} className="font-bold text-primary-strong hover:underline">
          Masuk dengan email
        </Link>
      </p>
    </>
  );
}
