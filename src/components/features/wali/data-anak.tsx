"use client";

import { useState } from "react";

import { BerkasFisik } from "@/components/features/formulir-murid/berkas-fisik";
import { DataKurang } from "@/components/features/formulir-murid/data-kurang";
import { isianDariData } from "@/components/features/formulir-murid/isian";
import { RingkasanFormulir } from "@/components/features/formulir-murid/ringkasan-formulir";
import { LengkapiDataAnak } from "@/components/features/wali/lengkapi-data-anak";
import { FotoProfil } from "@/components/shared/foto-profil";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailMurid } from "@/lib/api/murid";

/** Data formulir anak untuk wali murid (`GET /murid/{id}`), dengan aksi Lengkapi Data untuk isian yang masih kosong. */
export function DataAnak({ id }: { id: number }) {
  const { data: murid, isPending, isError, error, refetch } = useDetailMurid(id);
  const [melengkapi, setMelengkapi] = useState(false);

  if (isPending) return <Skeleton aria-label="Memuat data anak" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center gap-4">
        <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={64} className="size-16 text-lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-xl leading-tight font-extrabold">{murid.nama_lengkap}</h1>
          <p className="text-muted-foreground">
            {murid.nama_panggilan} · {murid.kelas?.nama ?? "Belum ada kelas"}
          </p>
          {murid.data_lengkap ? null : (
            <StatusBadge nada="menunggu" className="mt-2">
              Data belum lengkap
            </StatusBadge>
          )}
        </div>
        {melengkapi ? null : (
          <Button size="lg" variant={murid.data_lengkap ? "outline" : "default"} onClick={() => setMelengkapi(true)}>
            Lengkapi Data
          </Button>
        )}
      </header>
      {melengkapi ? (
        <>
          <KotakPesan nada="proses">
            Hanya isian yang masih kosong yang bisa diisi di sini. Untuk mengubah data yang sudah ada, hubungi sekolah.
          </KotakPesan>
          <LengkapiDataAnak murid={murid} onSelesai={() => setMelengkapi(false)} />
        </>
      ) : (
        <>
          <DataKurang field={murid.data_kurang} />
          <RingkasanFormulir isian={isianDariData(murid)} tampilkanNik={"nik" in murid} />
          <BerkasFisik berkas={murid.berkas} ubah={null} keterangan="Kartu Keluarga dan akta kelahiran diserahkan langsung ke sekolah dan dicentang oleh sekolah." />
        </>
      )}
    </div>
  );
}
