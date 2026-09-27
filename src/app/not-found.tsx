import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function TidakDitemukan() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-16">
      <p className="text-sm font-semibold text-primary-strong">404</p>
      <h1 className="mt-2 text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-muted-foreground">
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
    </main>
  );
}
