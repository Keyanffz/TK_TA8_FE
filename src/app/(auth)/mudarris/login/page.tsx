import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { IlustrasiGuru } from "@/components/features/auth/ilustrasi-login";
import { PilihanMasukStaff } from "@/components/features/auth/pilihan-masuk-staff";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";

export const metadata: Metadata = { title: "Masuk Guru dan Kepala Sekolah" };

// Halaman statis bisa diambil dari cache browser tanpa melewati proxy.ts,
// sehingga pengguna yang sudah masuk tidak diarahkan ke dashboard.
export const dynamic = "force-dynamic";

export default function LoginStaffPage() {
  return (
    <>
      <div className="gerak-masuk-naik flex items-center justify-between gap-4 rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-xl leading-tight font-extrabold">Masuk sebagai Guru &amp; Kepala Sekolah</h1>
        <IlustrasiGuru className="w-24 shrink-0" />
      </div>
      <div className="mt-8">
        <Suspense>
          <PilihanMasukStaff />
        </Suspense>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Orang tua atau wali murid?{" "}
        <Link href={RUTE_LOGIN.wali} className="font-bold text-primary-strong hover:underline">
          Masuk dengan NIS anak
        </Link>
      </p>
    </>
  );
}
