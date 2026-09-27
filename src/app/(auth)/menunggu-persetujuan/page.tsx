import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { RUTE_LOGIN } from "@/lib/auth/rute-login";

export const metadata: Metadata = { title: "Menunggu Persetujuan" };

export default function MenungguPersetujuanPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Akun Anda sedang menunggu persetujuan</h1>
      <p className="mt-4 text-muted-foreground">
        Kepala Sekolah perlu menyetujui pendaftaran akun guru sebelum akun bisa dipakai. Kami mengirim email ke alamat
        yang Anda daftarkan setelah akun disetujui.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={RUTE_LOGIN.guru} className={buttonVariants({ variant: "outline" })}>
          Kembali ke Halaman Masuk
        </Link>
        <Link href="/" className={buttonVariants({ variant: "ghost" })}>
          Ke Beranda
        </Link>
      </div>
    </>
  );
}
