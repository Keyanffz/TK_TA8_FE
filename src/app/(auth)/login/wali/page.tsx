import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FormLoginWali } from "@/components/features/auth/form-login-wali";
import { IlustrasiWali } from "@/components/features/auth/ilustrasi-login";
import { KembaliKePilihan } from "@/components/features/auth/kembali-ke-pilihan";
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
        <p className="mt-3">Username adalah NIS anak. Password awal adalah tanggal lahir anak (DDMMYYYY).</p>
        <p className="mt-2 text-sm">
          Contoh: anak lahir 5 November 2021, password awalnya <span className="font-bold tabular-nums">05112021</span>.
          Saat pertama masuk, Anda diminta mengganti password ini.
        </p>
      </div>
      <div className="mt-8">
        <Suspense>
          <FormLoginWali />
        </Suspense>
      </div>
      <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
        <li>Punya lebih dari satu anak di sekolah ini? Masuk dengan NIS salah satu anak, lalu tambahkan kakak atau adiknya dari menu Anak Saya.</li>
        <li>
          Anak belum bersekolah di sini?{" "}
          <Link href="/ppdb" className="font-bold text-primary-strong hover:underline">
            Lihat info pendaftaran murid baru
          </Link>
          .
        </li>
      </ul>
      <p className="mt-8 text-sm text-muted-foreground">
        Anda guru atau Kepala Sekolah?{" "}
        <Link href={urlLogin(RUTE_LOGIN.guru, tujuan)} className="font-bold text-primary-strong hover:underline">
          Masuk dengan email
        </Link>
      </p>
    </>
  );
}
