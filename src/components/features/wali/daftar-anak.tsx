"use client";

import Image from "next/image";
import Link from "next/link";

import { useAnakAktif } from "@/components/layout/dashboard/anak-aktif";
import { AvatarInisial } from "@/components/shared/avatar-inisial";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Muncul } from "@/components/shared/muncul";
import { GAYA_MASKER_PERISAI } from "@/components/shared/ornamen/perisai";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnakWali } from "@/lib/api/wali";
import { LABEL_HUBUNGAN, LABEL_JENIS_KELAMIN } from "@/lib/constants/label";
import { formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DaftarAnak() {
  const { anakAktif, pilih } = useAnakAktif();
  const { data, isPending, isError, error, refetch } = useAnakWali();

  if (isPending) return <Skeleton aria-label="Memuat data anak" className="h-44 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  if (data.length === 0) {
    return (
      <EmptyState
        judul="Belum ada anak yang tertaut."
        deskripsi="Tambahkan anak dengan NIS dan tanggal lahirnya di formulir, atau daftarkan anak baru lewat PPDB."
        aksi={
          <Link href="/dashboard/ppdb" className={buttonVariants({ variant: "outline" })}>
            Daftar PPDB
          </Link>
        }
      />
    );
  }

  return (
    <Muncul as="ul" efek="pop" className="grid gap-4 sm:grid-cols-2">
      {data.map((anak) => {
        const aktif = anak.id === anakAktif?.id;
        return (
          <li
            key={anak.id}
            className={cn("group rounded-xl border-2 bg-card p-5 shadow-sm", aktif ? "border-primary" : "border-border")}
          >
            <div className="flex items-center gap-4">
              <div className="relative size-20 shrink-0 bg-primary-soft transition-[rotate] duration-500 group-hover:rotate-45" style={GAYA_MASKER_PERISAI}>
                <div className="relative size-full transition-[rotate] duration-500 group-hover:-rotate-45">
                  {anak.foto_url ? (
                    <Image src={anak.foto_url} alt="" fill unoptimized className="object-cover" />
                  ) : (
                    <AvatarInisial nama={anak.nama_lengkap} className="size-full text-xl" />
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-heading text-lg leading-tight font-extrabold">{anak.nama_panggilan}</p>
                <p className="text-sm text-muted-foreground">{anak.nama_lengkap}</p>
                <p className="mt-1 inline-flex rounded-full bg-highlight px-2.5 py-0.5 text-xs font-bold text-highlight-foreground">
                  {anak.kelas?.nama ?? "Belum ada kelas"}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">NIS</dt>
                <dd className="font-bold tabular-nums">{anak.nis}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tanggal lahir</dt>
                <dd className="font-bold">{formatTanggal(anak.tanggal_lahir)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Jenis kelamin</dt>
                <dd className="font-bold">{LABEL_JENIS_KELAMIN[anak.jenis_kelamin]}</dd>
              </div>
              {anak.hubungan ? (
                <div>
                  <dt className="text-muted-foreground">Anda sebagai</dt>
                  <dd className="font-bold">
                    {LABEL_HUBUNGAN[anak.hubungan]}
                    {anak.is_kontak_utama ? " (kontak utama)" : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-4">
              {aktif ? (
                <p className="text-sm font-bold text-primary-strong">Sedang ditampilkan di beranda</p>
              ) : (
                <Button variant="secondary" onClick={() => pilih(anak.id)}>
                  Tampilkan di Beranda
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </Muncul>
  );
}
