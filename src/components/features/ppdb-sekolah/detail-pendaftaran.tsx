"use client";

import Link from "next/link";

import { BerkasFisik } from "@/components/features/formulir-murid/berkas-fisik";
import { isianDariData } from "@/components/features/formulir-murid/isian";
import { RingkasanFormulir } from "@/components/features/formulir-murid/ringkasan-formulir";
import { BerkasDibawa } from "@/components/features/ppdb/berkas-dibawa";
import { AksiPendaftaran } from "@/components/features/ppdb-sekolah/aksi-pendaftaran";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBerkasPendaftaran, useDetailPendaftaran } from "@/lib/api/ppdb";
import { LABEL_HUBUNGAN, LABEL_STATUS_PENDAFTARAN, LABEL_TINGKAT } from "@/lib/constants/label";
import { NADA_STATUS_PENDAFTARAN } from "@/lib/constants/status";
import { formatTanggalWaktu } from "@/lib/format";
import type { PendaftaranDetail } from "@/types/domain";

function KotakMurid({ pendaftaran, kepalaSekolah }: { pendaftaran: PendaftaranDetail; kepalaSekolah: boolean }) {
  if (!pendaftaran.murid) return null;
  const { nis, id } = pendaftaran.murid;
  return (
    <KotakPesan nada="sukses" judul="Sudah menjadi murid">
      <p>
        {nis === null ? "NIS belum diisi. " : <>NIS <span className="font-bold tabular-nums">{nis}</span>. </>}
        {kepalaSekolah
          ? nis === null
            ? "Isi NIS di halaman murid; akun wali dibuat saat itu kalau pendaftar belum punya akun."
            : "Penempatan kelas, centang berkas, dan kartu akun wali ada di halaman murid."
          : "Silakan datang ke sekolah untuk daftar ulang."}
      </p>
      {kepalaSekolah ? (
        <Link href={`/mudarris/murid/${id}`} className={buttonVariants({ size: "sm", variant: "outline", className: "mt-3" })}>
          Buka Data Murid
        </Link>
      ) : null}
    </KotakPesan>
  );
}

/** Detail pendaftaran PPDB. Kepala Sekolah: centang berkas, verifikasi, terima, tolak, mundur. Wali: hanya lihat miliknya. */
export function DetailPendaftaran({ id, kepalaSekolah }: { id: number; kepalaSekolah: boolean }) {
  const { data: pendaftaran, isPending, isError, error, refetch } = useDetailPendaftaran(id);
  const berkas = useBerkasPendaftaran(id);

  if (isPending) return <Skeleton aria-label="Memuat pendaftaran" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  const masihProses = pendaftaran.status === "diajukan" || pendaftaran.status === "diverifikasi";

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
        <RingkasanFormulir isian={isianDariData(pendaftaran)} tampilkanNik />
        {!kepalaSekolah && pendaftaran.status === "diajukan" ? <BerkasDibawa className="rounded-xl p-5 shadow-sm" /> : null}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <StatusBadge nada={NADA_STATUS_PENDAFTARAN[pendaftaran.status]} className="self-start">
            {LABEL_STATUS_PENDAFTARAN[pendaftaran.status]}
          </StatusBadge>
          <dl className="grid gap-2 text-sm">
            {pendaftaran.created_at ? (
              <div>
                <dt className="text-muted-foreground">Dikirim dan dinyatakan benar</dt>
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
                  {pendaftaran.wali
                    ? `${pendaftaran.wali.nama}${pendaftaran.wali.username ? ` (${pendaftaran.wali.username})` : ""}${pendaftaran.hubungan ? `, ${LABEL_HUBUNGAN[pendaftaran.hubungan].toLowerCase()}` : ""}`
                    : "Mendaftar tanpa akun"}
                </dd>
              </div>
            ) : null}
          </dl>
          {kepalaSekolah ? <AksiPendaftaran pendaftaran={pendaftaran} /> : null}
        </div>
        {pendaftaran.status === "ditolak" && pendaftaran.catatan ? (
          <KotakPesan nada="bahaya" judul="Alasan penolakan">
            <p className="whitespace-pre-line">{pendaftaran.catatan}</p>
          </KotakPesan>
        ) : null}
        {pendaftaran.status === "mengundurkan_diri" ? (
          <KotakPesan nada="proses" judul="Mengundurkan diri">
            <p className="whitespace-pre-line">{pendaftaran.catatan ?? "Tanpa alasan tertulis."}</p>
            {pendaftaran.status_sebelum_mundur === "diterima" ? <p className="mt-1">Mundur setelah diterima; data muridnya sudah dihapus.</p> : null}
          </KotakPesan>
        ) : null}
        {pendaftaran.status === "diterima" ? <KotakMurid pendaftaran={pendaftaran} kepalaSekolah={kepalaSekolah} /> : null}
        <BerkasFisik
          berkas={pendaftaran.berkas}
          ubah={kepalaSekolah && masihProses ? (body) => berkas.mutateAsync(body) : null}
          keterangan={
            kepalaSekolah && !masihProses && pendaftaran.status === "diterima"
              ? "Centang berkas ikut disalin ke data murid; ubah di halaman murid."
              : undefined
          }
        />
      </aside>
    </div>
  );
}
