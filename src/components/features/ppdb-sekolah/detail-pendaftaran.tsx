"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { DialogTerima } from "@/components/features/ppdb-sekolah/dialog-terima";
import { DokumenPendaftaran } from "@/components/features/ppdb-sekolah/dokumen-pendaftaran";
import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailPendaftaran, useTolakPendaftaran, useVerifikasiPendaftaran } from "@/lib/api/ppdb";
import { LABEL_HUBUNGAN, LABEL_JENIS_KELAMIN, LABEL_STATUS_PENDAFTARAN, LABEL_TINGKAT } from "@/lib/constants/label";
import { NADA_STATUS_PENDAFTARAN } from "@/lib/constants/status";
import { formatTanggal, formatTanggalWaktu } from "@/lib/format";
import type { PendaftaranDetail } from "@/types/domain";

function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-extrabold">{judul}</h2>
      {children}
    </section>
  );
}

function Data({ baris }: { baris: readonly [string, string | null][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {baris.map(([label, nilai]) => (
        <div key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-bold break-words">{nilai || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

function AksiKepalaSekolah({ pendaftaran }: { pendaftaran: PendaftaranDetail }) {
  const verifikasi = useVerifikasiPendaftaran(pendaftaran.id);
  const tolak = useTolakPendaftaran(pendaftaran.id);
  const bisaTolak = pendaftaran.status === "diajukan" || pendaftaran.status === "diverifikasi";

  return (
    <div className="flex flex-col gap-2">
      {pendaftaran.status === "diajukan" ? (
        <DialogKonfirmasi
          pemicu={<Button>Dokumen Sudah Sesuai</Button>}
          judul="Tandai dokumen sudah diverifikasi?"
          deskripsi="Pastikan akta kelahiran, Kartu Keluarga, dan pas foto terbaca dan datanya sama dengan isian formulir. Keputusan terima atau tolak diambil setelah ini."
          labelAksi="Verifikasi Dokumen"
          onKonfirmasi={async () => {
            toast.success((await verifikasi.mutateAsync()).message);
          }}
        />
      ) : null}
      {pendaftaran.status === "diverifikasi" ? <DialogTerima pendaftaran={pendaftaran} /> : null}
      {bisaTolak ? (
        <DialogKonfirmasi
          pemicu={<Button variant="outline">Tolak Pendaftaran</Button>}
          judul={`Tolak pendaftaran ${pendaftaran.nama_panggilan}?`}
          deskripsi="Alasan ditampilkan ke orang tua saat mengecek status pendaftaran."
          labelAksi="Tolak Pendaftaran"
          labelAlasan="Alasan penolakan"
          berbahaya
          onKonfirmasi={async (alasan) => {
            toast.success((await tolak.mutateAsync(alasan)).message);
          }}
        />
      ) : null}
    </div>
  );
}

/** Detail pendaftaran PPDB. Kepala Sekolah: verifikasi, terima (pilih kelas), tolak. Wali: hanya lihat miliknya. */
export function DetailPendaftaran({ id, kepalaSekolah }: { id: number; kepalaSekolah: boolean }) {
  const { data: pendaftaran, isPending, isError, error, refetch } = useDetailPendaftaran(id);

  if (isPending) return <Skeleton aria-label="Memuat pendaftaran" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="flex flex-col gap-5">
        <header>
          <p className="text-sm text-muted-foreground tabular-nums">{pendaftaran.kode}</p>
          <h1 className="text-xl leading-tight font-extrabold">{pendaftaran.nama_lengkap}</h1>
          <p className="text-sm text-muted-foreground">
            {LABEL_TINGKAT[pendaftaran.tingkat_tujuan]} · Tahun Ajaran {pendaftaran.tahun_ajaran.nama}
          </p>
        </header>
        <Bagian judul="Data anak">
          <Data
            baris={[
              ["Nama panggilan", pendaftaran.nama_panggilan],
              ["Jenis kelamin", LABEL_JENIS_KELAMIN[pendaftaran.jenis_kelamin]],
              ["Tempat, tanggal lahir", `${pendaftaran.tempat_lahir}, ${formatTanggal(pendaftaran.tanggal_lahir)}`],
              ["NIK", pendaftaran.nik],
              ["Agama", pendaftaran.agama],
              ["Alamat", pendaftaran.alamat],
            ]}
          />
        </Bagian>
        <Bagian judul="Orang tua">
          <Data
            baris={[
              ["Nama ayah", pendaftaran.nama_ayah],
              ["Pekerjaan ayah", pendaftaran.pekerjaan_ayah],
              ["Nama ibu", pendaftaran.nama_ibu],
              ["Pekerjaan ibu", pendaftaran.pekerjaan_ibu],
              ["Nomor HP", pendaftaran.no_hp],
              ["Pendaftar", LABEL_HUBUNGAN[pendaftaran.hubungan]],
            ]}
          />
        </Bagian>
        <Bagian judul="Dokumen">
          <DokumenPendaftaran dokumen={pendaftaran.dokumen} />
        </Bagian>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <StatusBadge nada={NADA_STATUS_PENDAFTARAN[pendaftaran.status]} className="self-start">
            {LABEL_STATUS_PENDAFTARAN[pendaftaran.status]}
          </StatusBadge>
          <dl className="grid gap-2 text-sm">
            {pendaftaran.created_at ? (
              <div>
                <dt className="text-muted-foreground">Mendaftar</dt>
                <dd className="font-bold">{formatTanggalWaktu(pendaftaran.created_at)}</dd>
              </div>
            ) : null}
            {pendaftaran.diproses_at ? (
              <div>
                <dt className="text-muted-foreground">Terakhir diproses</dt>
                <dd className="font-bold">{formatTanggalWaktu(pendaftaran.diproses_at)}</dd>
              </div>
            ) : null}
            {kepalaSekolah ? (
              <div>
                <dt className="text-muted-foreground">Akun wali</dt>
                <dd className="font-bold">
                  {pendaftaran.wali ? `${pendaftaran.wali.nama}${pendaftaran.wali.username ? ` (${pendaftaran.wali.username})` : ""}` : "Mendaftar tanpa akun"}
                </dd>
              </div>
            ) : null}
          </dl>
          {kepalaSekolah ? <AksiKepalaSekolah pendaftaran={pendaftaran} /> : null}
        </div>
        {pendaftaran.status === "ditolak" && pendaftaran.catatan ? (
          <KotakPesan nada="bahaya" judul="Alasan penolakan">
            <p className="whitespace-pre-line">{pendaftaran.catatan}</p>
          </KotakPesan>
        ) : null}
        {pendaftaran.status === "diterima" && pendaftaran.murid ? (
          <KotakPesan nada="sukses" judul="Sudah menjadi murid">
            <p>
              NIS <span className="font-bold tabular-nums">{pendaftaran.murid.nis}</span>.{" "}
              {kepalaSekolah ? "Penempatan kelas dan kartu akun wali ada di halaman murid." : "Silakan datang ke sekolah untuk daftar ulang."}
            </p>
            {kepalaSekolah ? (
              <Link href={`/mudarris/murid/${pendaftaran.murid.id}`} className={buttonVariants({ size: "sm", variant: "outline", className: "mt-3" })}>
                Buka Data Murid
              </Link>
            ) : null}
          </KotakPesan>
        ) : null}
      </aside>
    </div>
  );
}
