"use client";

import { BookOpenText } from "lucide-react";
import Link from "next/link";

import { TombolPdfRapor } from "@/components/features/rapor/tombol-pdf-rapor";
import { useAnakAktif } from "@/components/layout/dashboard/anak-aktif";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Muncul } from "@/components/shared/muncul";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RAPOR_SATU_KELAS, useDaftarRapor } from "@/lib/api/rapor";
import { formatTanggal } from "@/lib/format";
import { namaFileRapor, periodeRapor } from "@/lib/rapor";

/** Rapor terbit anak aktif (backend hanya mengirim rapor terbit ke wali). */
export function DaftarRaporWali() {
  const { anakAktif } = useAnakAktif();
  const { data, isPending, isError, error, refetch } = useDaftarRapor(
    { halaman: 1, muridId: anakAktif?.id ?? null, perHalaman: RAPOR_SATU_KELAS },
    anakAktif !== null,
  );

  if (!anakAktif) return <EmptyState judul="Belum ada anak yang tertaut." deskripsi="Tambahkan anak dari menu Anak Saya." />;
  if (isPending) return <Skeleton aria-label="Memuat rapor" className="h-40 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  if (data.data.length === 0) {
    return (
      <EmptyState
        judul={`Belum ada rapor ${anakAktif.nama_panggilan} yang terbit.`}
        deskripsi="Rapor muncul di sini setelah diterbitkan Kepala Sekolah. Anda akan menerima notifikasi saat rapor terbit."
      />
    );
  }

  return (
    <Muncul as="ul" efek="geser" className="flex flex-col gap-4">
      {data.data.map((rapor) => (
        <li key={rapor.id} className="flex flex-col gap-4 rounded-xl border-2 border-primary bg-card p-5 shadow-sm sm:flex-row sm:items-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
            <BookOpenText aria-hidden="true" className="size-6" />
          </span>
          <div className="flex-1">
            <h2 className="font-heading text-lg font-bold">{periodeRapor(rapor)}</h2>
            <p className="text-sm text-muted-foreground">
              {rapor.kelas.nama}
              {rapor.terbit_at ? ` · terbit ${formatTanggal(rapor.terbit_at)}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TombolPdfRapor id={rapor.id} namaFile={namaFileRapor(rapor)} mode="unduh" />
            <Link href={`/dashboard/rapor/${rapor.id}`} className={buttonVariants({ variant: "outline" })}>
              Lihat Rapor
            </Link>
          </div>
        </li>
      ))}
    </Muncul>
  );
}
