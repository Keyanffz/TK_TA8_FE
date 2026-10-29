import { FileQuestionMark, House } from "lucide-react";
import Link from "next/link";

import { HalamanKosong } from "@/components/shared/halaman-kosong";
import { buttonVariants } from "@/components/ui/button";

export default function TidakDitemukanPublik() {
  return (
    <HalamanKosong
      label="404"
      judul="Halaman tidak ditemukan"
      deskripsi="Alamat yang dibuka tidak ada, atau datanya sudah tidak ditampilkan untuk umum."
      ikon={FileQuestionMark}
      aksi={
        <>
          <Link href="/" className={buttonVariants()}>
            <House aria-hidden="true" />
            Ke Beranda
          </Link>
          <Link href="/pengumuman" className={buttonVariants({ variant: "outline" })}>
            Lihat Pengumuman
          </Link>
        </>
      }
    />
  );
}
