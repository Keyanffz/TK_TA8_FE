import type { Metadata } from "next";
import { Suspense } from "react";

import { IlustrasiGuru } from "@/components/features/auth/ilustrasi-login";
import { MasukStaff } from "@/components/features/auth/masuk-staff";

export const metadata: Metadata = { title: "Masuk Guru dan Kepala Sekolah" };

// Halaman statis bisa diambil dari cache browser tanpa melewati proxy.ts,
// sehingga pengguna yang sudah masuk tidak diarahkan ke dashboard.
export const dynamic = "force-dynamic";

export default function LoginStaffPage() {
  return (
    // 400 px = lebar maksimal tombol Google, supaya tombol itu selebar kolom form.
    <div className="mx-auto w-full max-w-100">
      <div className="gerak-masuk-naik flex items-center justify-between gap-4 rounded-xl bg-primary p-6 text-primary-foreground">
        <h1 className="text-xl leading-tight font-extrabold">Masuk sebagai Guru &amp; Kepala Sekolah</h1>
        <IlustrasiGuru className="w-24 shrink-0" />
      </div>
      <div className="mt-8">
        <Suspense>
          <MasukStaff />
        </Suspense>
      </div>
    </div>
  );
}
