"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { useSegarkanKeuangan } from "@/lib/api/segarkan-keuangan";
import type { MetodeBayar, StatusPembayaran } from "@/types/domain";

export const PEMBAYARAN_PER_HALAMAN = 20;

export type FilterPembayaran = {
  halaman: number;
  status?: StatusPembayaran | null;
  metode?: MetodeBayar | null;
  tanggal?: string | null;
  search?: string;
  perHalaman?: number;
};

export function useDaftarPembayaran(filter: FilterPembayaran) {
  const query = {
    page: filter.halaman,
    per_page: filter.perHalaman ?? PEMBAYARAN_PER_HALAMAN,
    search: filter.search || undefined,
    // Antrean verifikasi diurutkan dari yang paling lama menunggu.
    sort: filter.status === "menunggu" ? ("created_at" as const) : ("-created_at" as const),
    "filter[status]": filter.status ?? undefined,
    "filter[metode]": filter.metode ?? undefined,
    "filter[tanggal]": filter.tanggal ?? undefined,
  };
  return useQuery({
    queryKey: queryKeys.pembayaran.daftar(query),
    queryFn: () => ambilData(api.GET("/pembayaran", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}

export function useTerimaPembayaran() {
  const segarkan = useSegarkanKeuangan();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.POST("/pembayaran/{id}/terima", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useTolakPembayaran() {
  const segarkan = useSegarkanKeuangan();
  return useMutation({
    mutationFn: ({ id, alasan }: { id: number; alasan: string }) =>
      ambilData(api.POST("/pembayaran/{id}/tolak", { params: { path: { id } }, body: { alasan } })),
    onSuccess: segarkan,
  });
}

export function ambilKwitansi(id: number): Promise<Blob> {
  return ambilData(api.GET("/pembayaran/{id}/kwitansi", { params: { path: { id } }, parseAs: "blob" }));
}
