import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function TidakDitemukanPublik() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <p className="text-sm font-semibold text-primary-strong">404</p>
      <h1 className="mt-2 text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-3 max-w-prose text-muted-foreground">
        Alamat yang dibuka tidak ada, atau datanya sudah tidak ditampilkan untuk umum.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className={buttonVariants()}>
          Ke Beranda
        </Link>
        <Link href="/pengumuman" className={buttonVariants({ variant: "outline" })}>
          Lihat Pengumuman
        </Link>
      </div>
    </div>
  );
}
