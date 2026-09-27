import Image from "next/image";

import { LOGO_CADANGAN } from "@/lib/constants/sekolah";
import { cn } from "@/lib/utils";

type LogoSekolahProps = {
  logoUrl: string | null;
  namaSekolah: string;
  ukuran: number;
  className?: string;
  prioritas?: boolean;
};

/** Logo dari profil.logo di CMS, atau logo resmi di public/ kalau belum diisi. */
export function LogoSekolah({ logoUrl, namaSekolah, ukuran, className, prioritas }: LogoSekolahProps) {
  return (
    <Image
      src={logoUrl ?? LOGO_CADANGAN}
      alt={`Logo ${namaSekolah}`}
      width={ukuran}
      height={ukuran}
      preload={prioritas}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
