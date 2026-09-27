"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { KartuAkunMurid } from "@/components/features/murid/kartu-akun-murid";
import { WaliTertaut } from "@/components/features/murid/wali-tertaut";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { FotoProfil } from "@/components/shared/foto-profil";
import { GalatMuat } from "@/components/shared/galat-muat";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailMurid, useHapusMurid } from "@/lib/api/murid";
import { LABEL_JENIS_KELAMIN, LABEL_STATUS_MURID } from "@/lib/constants/label";
import { NADA_STATUS_MURID } from "@/lib/constants/status";
import { formatTanggal } from "@/lib/format";

function Baris({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-bold break-words">{children}</dd>
    </div>
  );
}

type DetailMuridProps = { id: number; bisaKelola: boolean; tagihan?: ReactNode };

export function DetailMurid({ id, bisaKelola, tagihan }: DetailMuridProps) {
  const router = useRouter();
  const { data: murid, isPending, isError, error, refetch } = useDetailMurid(id);
  const hapus = useHapusMurid();

  if (isPending) return <Skeleton aria-label="Memuat data murid" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={80} className="size-20 text-xl" />
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-xl leading-tight font-extrabold">{murid.nama_lengkap}</h1>
              <p className="text-muted-foreground">
                {murid.nama_panggilan} · <span className="tabular-nums">{murid.nis}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge nada={NADA_STATUS_MURID[murid.status]}>{LABEL_STATUS_MURID[murid.status]}</StatusBadge>
                <span className="rounded-full bg-highlight px-2.5 py-0.5 text-xs font-bold text-highlight-foreground">
                  {murid.kelas?.nama ?? "Belum ada kelas"}
                </span>
              </div>
            </div>
            {bisaKelola ? (
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/murid/${murid.id}/ubah`} className={buttonVariants({ variant: "outline" })}>
                  Ubah Data
                </Link>
                <DialogKonfirmasi
                  pemicu={<Button variant="ghost">Hapus</Button>}
                  judul={`Hapus data ${murid.nama_panggilan}?`}
                  deskripsi="Hanya untuk data yang salah input. Murid yang lulus, pindah, atau keluar cukup diubah statusnya. Akun wali otomatis yang belum pernah dipakai ikut dinonaktifkan."
                  labelAksi="Hapus Murid"
                  berbahaya
                  onKonfirmasi={async () => {
                    await hapus.mutateAsync(murid.id);
                    toast.success(`Data ${murid.nama_lengkap} dihapus.`);
                    router.replace("/dashboard/murid");
                  }}
                />
              </div>
            ) : null}
          </div>
          {murid.catatan_khusus ? (
            <div className="mt-5 rounded-lg border-l-4 border-highlight-strong bg-highlight-soft p-3 text-sm">
              <p className="font-heading font-bold">Catatan khusus</p>
              <p className="whitespace-pre-line">{murid.catatan_khusus}</p>
            </div>
          ) : null}
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Baris label="Jenis kelamin">{LABEL_JENIS_KELAMIN[murid.jenis_kelamin]}</Baris>
            <Baris label="Tempat, tanggal lahir">
              {murid.tempat_lahir}, {formatTanggal(murid.tanggal_lahir)}
            </Baris>
            <Baris label="Agama">{murid.agama}</Baris>
            <Baris label="Anak ke-">{murid.anak_ke ?? "-"}</Baris>
            <Baris label="NIK">{murid.nik ?? "-"}</Baris>
            <Baris label="NISN">{murid.nisn ?? "-"}</Baris>
            <Baris label="Tanggal masuk">{formatTanggal(murid.tanggal_masuk)}</Baris>
            {murid.tanggal_keluar ? <Baris label="Tanggal keluar">{formatTanggal(murid.tanggal_keluar)}</Baris> : null}
            <div className="sm:col-span-2">
              <Baris label="Alamat">{murid.alamat}</Baris>
            </div>
          </dl>
        </section>
        {tagihan}
      </div>
      <div className="flex flex-col gap-6">
        {bisaKelola ? <KartuAkunMurid muridId={murid.id} nis={murid.nis} /> : null}
        <section aria-labelledby="judul-wali">
          <h2 id="judul-wali" className="mb-3 text-lg font-extrabold">
            Wali murid
          </h2>
          <WaliTertaut murid={murid} bisaKelola={bisaKelola} />
        </section>
      </div>
    </div>
  );
}
