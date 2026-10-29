import { FileQuestionMark, House } from "lucide-react";
import Link from "next/link";

import { HalamanKosong } from "@/components/shared/halaman-kosong";
import { buttonVariants } from "@/components/ui/button";

export default function MudarrisTidakDitemukan() {
  return (
    <HalamanKosong
      label="404"
      judul="Halaman tidak ditemukan"
      deskripsi="Alamat ini tidak ada, datanya sudah dihapus, atau bukan untuk akun Anda."
      ikon={FileQuestionMark}
      aksi={
        <Link href="/mudarris" className={buttonVariants()}>
          <House aria-hidden="true" />
          Kembali ke Beranda
        </Link>
      }
    />
  );
}
