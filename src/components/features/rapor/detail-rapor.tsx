"use client";

import Link from "next/link";
import { useState } from "react";

import { AksiRapor } from "@/components/features/rapor/aksi-rapor";
import { EditorRapor } from "@/components/features/rapor/editor-rapor";
import { TampilanRapor } from "@/components/features/rapor/tampilan-rapor";
import { TombolPdfRapor } from "@/components/features/rapor/tombol-pdf-rapor";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/errors";
import { useDetailRapor, useElemenPenilaian } from "@/lib/api/rapor";
import { useSession } from "@/lib/auth/use-session";
import { LABEL_STATUS_RAPOR } from "@/lib/constants/label";
import { NADA_STATUS_RAPOR } from "@/lib/constants/status";
import { formatTanggal, formatTanggalWaktu } from "@/lib/format";
import { namaFileRapor, periodeRapor } from "@/lib/rapor";

/**
 * Wali membuka tautan notifikasi rapor yang sudah ditarik (atau belum terbit): backend membalas 404
 * karena rapor itu tidak boleh dilihat wali. Pesannya dibuat ramah, bukan "tidak ditemukan".
 */
function RaporBelumBisaDibuka() {
  return (
    <KotakPesan nada="menunggu" judul="Rapor ini belum bisa dibuka">
      <p>
        Rapor sedang diperiksa ulang oleh sekolah dan akan bisa dilihat lagi setelah diterbitkan kembali. Anda akan menerima notifikasi saat
        rapor terbit.
      </p>
      <Link href="/dashboard/rapor" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}>
        Lihat Rapor Lain
      </Link>
    </KotakPesan>
  );
}

export function DetailRapor({ id }: { id: number }) {
  const { user, isSuperAdmin, isWali } = useSession();
  const { data: rapor, isPending, isError, error, refetch } = useDetailRapor(id);
  const elemen = useElemenPenilaian();
  const [adaPerubahan, setAdaPerubahan] = useState(false);

  if (isPending) return <Skeleton aria-label="Memuat rapor" className="h-96 rounded-xl" />;
  if (isError) {
    if (isWali && error instanceof ApiError && error.code === "NOT_FOUND") return <RaporBelumBisaDibuka />;
    return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  }

  const pembuat = user?.guru?.id !== undefined && user.guru.id === rapor.pembuat.id;
  const bolehIsi = (pembuat && (rapor.status === "draft" || rapor.status === "revisi")) || (isSuperAdmin && rapor.status === "diajukan");
  const panduan = new Map((elemen.data ?? []).map((item) => [item.id, item.deskripsi]));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
      <div className="flex flex-col gap-4">
        <header>
          <p className="text-sm text-muted-foreground">
            {periodeRapor(rapor)} · {rapor.kelas.nama}
          </p>
          <h1 className="text-xl leading-tight font-extrabold">{rapor.murid.nama_lengkap}</h1>
          <p className="text-sm text-muted-foreground tabular-nums">{rapor.murid.nis}</p>
        </header>
        {bolehIsi ? (
          <EditorRapor
            key={rapor.status}
            rapor={rapor}
            bolehUnggahFoto={pembuat && rapor.status !== "diajukan"}
            labelSimpan={isSuperAdmin && rapor.status === "diajukan" ? "Simpan Perbaikan" : "Simpan Draft"}
            onUbahBelumTersimpan={setAdaPerubahan}
            panduan={panduan}
          />
        ) : (
          <TampilanRapor rapor={rapor} />
        )}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          {isWali ? null : (
            <StatusBadge nada={NADA_STATUS_RAPOR[rapor.status]} className="self-start">
              {LABEL_STATUS_RAPOR[rapor.status]}
            </StatusBadge>
          )}
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Guru</dt>
              <dd className="font-bold">{rapor.pembuat.nama}</dd>
            </div>
            {rapor.diajukan_at && !isWali ? (
              <div>
                <dt className="text-muted-foreground">Diajukan</dt>
                <dd className="font-bold">{formatTanggalWaktu(rapor.diajukan_at)}</dd>
              </div>
            ) : null}
            {rapor.terbit_at ? (
              <div>
                <dt className="text-muted-foreground">Terbit</dt>
                <dd className="font-bold">{formatTanggal(rapor.terbit_at)}</dd>
              </div>
            ) : null}
          </dl>
          {isWali ? (
            <TombolPdfRapor id={rapor.id} namaFile={namaFileRapor(rapor)} mode="unduh" />
          ) : (
            <AksiRapor rapor={rapor} pembuat={pembuat} kepalaSekolah={isSuperAdmin} adaPerubahan={bolehIsi && adaPerubahan} />
          )}
        </div>
        {rapor.catatan_revisi && (rapor.status === "revisi" || rapor.status === "diajukan") ? (
          <KotakPesan nada="menunggu" judul={rapor.status === "revisi" ? "Catatan revisi dari Kepala Sekolah" : "Catatan revisi sebelumnya"}>
            <p className="whitespace-pre-line">{rapor.catatan_revisi}</p>
          </KotakPesan>
        ) : null}
      </aside>
    </div>
  );
}
