"use client";

import { House, RotateCw } from "lucide-react";
import Link from "next/link";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { ApiError, pesanError } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/use-session";

/**
 * Keadaan error untuk data yang gagal dimuat, dengan tombol coba lagi. Penolakan 403 (izin tidak ada atau baru
 * dicabut) tidak diberi tombol coba lagi karena hasilnya akan sama; pesan backend menyebut izin yang perlu diminta.
 */
export function GalatMuat({ error, onCobaLagi, className }: { error: unknown; onCobaLagi: () => void; className?: string }) {
  const { beranda } = useSession();

  if (error instanceof ApiError && error.code === "FORBIDDEN") {
    return (
      <KotakPesan nada="menunggu" judul="Anda tidak punya akses ke data ini" className={className}>
        <p>{error.message}</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href={beranda}>
            <House aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </Button>
      </KotakPesan>
    );
  }

  return (
    <KotakPesan nada="bahaya" judul="Data belum bisa dimuat" className={className}>
      <p>{pesanError(error)}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onCobaLagi}>
        <RotateCw aria-hidden="true" />
        Muat Ulang
      </Button>
    </KotakPesan>
  );
}
