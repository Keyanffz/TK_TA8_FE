import Link from "next/link";

import { HalamanKosong } from "@/components/shared/halaman-kosong";
import { buttonVariants } from "@/components/ui/button";

export default function MudarrisTidakDitemukan() {
  return (
    <HalamanKosong
      kode="404"
      judul="Halaman tidak ditemukan"
      deskripsi="Alamat ini tidak ada, datanya sudah dihapus, atau bukan untuk akun Anda."
      aksi={
        <Link href="/mudarris" className={buttonVariants()}>
          Kembali ke Beranda
        </Link>
      }
    />
  );
}
