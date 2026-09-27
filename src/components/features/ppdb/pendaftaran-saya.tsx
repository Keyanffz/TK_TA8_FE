"use client";

import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { LABEL_STATUS_PENDAFTARAN, LABEL_TINGKAT } from "@/lib/constants/label";
import { NADA_STATUS_PENDAFTARAN } from "@/lib/constants/status";
import { formatTanggal } from "@/lib/format";
import type { Pendaftaran } from "@/types/domain";

function keterangan(pendaftaran: Pendaftaran): string {
  switch (pendaftaran.status) {
    case "diajukan":
      return "Menunggu pemeriksaan dokumen oleh sekolah.";
    case "diverifikasi":
      return "Dokumen sudah diperiksa. Tunggu keputusan akhir.";
    case "diterima":
      return pendaftaran.murid
        ? `Diterima dengan NIS ${pendaftaran.murid.nis} dan sudah tertaut ke akun Anda. Silakan datang ke sekolah untuk daftar ulang.`
        : "Diterima. Silakan datang ke sekolah untuk daftar ulang.";
    case "ditolak":
      return pendaftaran.catatan ? `Tidak diterima. Alasan: ${pendaftaran.catatan}` : "Tidak diterima. Hubungi sekolah untuk alasannya.";
  }
}

/** Pendaftaran PPDB milik wali yang masuk (`GET /pendaftaran` terbatas miliknya). */
export function PendaftaranSaya() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.pendaftaranSaya,
    queryFn: async () => (await ambilData(api.GET("/pendaftaran", { params: { query: { per_page: 50 } } }))).data,
  });

  if (isPending) return <Skeleton aria-label="Memuat pendaftaran" className="h-32 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  if (data.length === 0) {
    return <EmptyState judul="Belum ada pendaftaran." deskripsi="Pendaftaran kakak atau adik yang Anda kirim akan muncul di sini." />;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {data.map((pendaftaran) => (
        <li key={pendaftaran.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-heading text-lg leading-tight font-extrabold">{pendaftaran.nama_panggilan}</p>
              <p className="text-sm text-muted-foreground tabular-nums">{pendaftaran.kode}</p>
            </div>
            <StatusBadge nada={NADA_STATUS_PENDAFTARAN[pendaftaran.status]}>{LABEL_STATUS_PENDAFTARAN[pendaftaran.status]}</StatusBadge>
          </div>
          <p className="mt-3 text-sm">{keterangan(pendaftaran)}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {LABEL_TINGKAT[pendaftaran.tingkat_tujuan]}, Tahun Ajaran {pendaftaran.tahun_ajaran.nama}
            {pendaftaran.created_at ? ` · dikirim ${formatTanggal(pendaftaran.created_at)}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
