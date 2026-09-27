import Image from "next/image";

import { AvatarInisial } from "@/components/shared/avatar-inisial";
import { cn } from "@/lib/utils";

type FotoProfilProps = {
  nama: string;
  url: string | null;
  /** px, untuk atribut width/height gambar. */
  ukuran: number;
  className?: string;
};

/**
 * Foto bulat orang atau murid, atau inisial kalau belum ada foto. Foto murid
 * berupa signed URL yang kedaluwarsa 30 menit, jadi tidak lewat optimasi gambar Next.
 */
export function FotoProfil({ nama, url, ukuran, className }: FotoProfilProps) {
  if (!url) {
    return <AvatarInisial nama={nama} className={cn("shrink-0 rounded-full", className)} />;
  }
  return (
    <Image
      src={url}
      alt=""
      width={ukuran}
      height={ukuran}
      unoptimized
      className={cn("shrink-0 rounded-full bg-primary-soft object-cover", className)}
    />
  );
}
