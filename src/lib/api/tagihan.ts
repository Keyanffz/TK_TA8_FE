"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { keFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import { useSegarkanKeuangan } from "@/lib/api/segarkan-keuangan";
import type { components } from "@/types/api";
import type { StatusTagihan } from "@/types/domain";

export const TAGIHAN_PER_HALAMAN = 20;

export type BodyUbahTagihan = components["schemas"]["PerbaruiTagihanRequest"];
export type BodyTagihanSekali = components["schemas"]["BuatTagihanSekaliRequest"];
export type BodyBayar = components["schemas"]["BayarTagihanRequest"];

export type FilterTagihan = {
  halaman: number;
  search?: string;
  status?: StatusTagihan | null;
  periode?: string | null;
  kelasId?: number | null;
  muridId?: number | null;
  jenisTagihanId?: number | null;
  perHalaman?: number;
};

export function useDaftarTagihan(filter: FilterTagihan, aktif = true) {
  const query = {
    page: filter.halaman,
    per_page: filter.perHalaman ?? TAGIHAN_PER_HALAMAN,
    search: filter.search || undefined,
    sort: "-jatuh_tempo" as const,
    "filter[status]": filter.status ?? undefined,
    "filter[periode]": filter.periode ?? undefined,
    "filter[kelas_id]": filter.kelasId ?? undefined,
    "filter[murid_id]": filter.muridId ?? undefined,
    "filter[jenis_tagihan_id]": filter.jenisTagihanId ?? undefined,
  };
  return useQuery({
    queryKey: queryKeys.tagihan.daftar(query),
    queryFn: () => ambilData(api.GET("/tagihan", { params: { query } })),
    placeholderData: keepPreviousData,
    enabled: aktif,
  });
}

export function useDetailTagihan(id: number) {
  return useQuery({
    queryKey: queryKeys.tagihan.detail(id),
    queryFn: async () => (await ambilData(api.GET("/tagihan/{id}", { params: { path: { id } } }))).data,
  });
}

export function useUbahTagihan(id: number) {
  const segarkan = useSegarkanKeuangan();
  return useMutation({
    mutationFn: (body: BodyUbahTagihan) => ambilData(api.PUT("/tagihan/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useBatalkanTagihan(id: number) {
  const segarkan = useSegarkanKeuangan();
  return useMutation({
    mutationFn: (alasan: string) => ambilData(api.PATCH("/tagihan/{id}/batalkan", { params: { path: { id } }, body: { alasan } })),
    onSuccess: segarkan,
  });
}

export function useAktifkanTagihan(id: number) {
  const segarkan = useSegarkanKeuangan();
  return useMutation({
    mutationFn: () => ambilData(api.POST("/tagihan/{id}/aktifkan", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useBuatTagihanSekali() {
  const segarkan = useSegarkanKeuangan();
  return useMutation({
    mutationFn: (body: BodyTagihanSekali) => ambilData(api.POST("/tagihan", { body })),
    onSuccess: segarkan,
  });
}

export function useGenerateTagihan() {
  const segarkan = useSegarkanKeuangan();
  return useMutation({
    mutationFn: (periode: string) => ambilData(api.POST("/tagihan/generate", { body: { periode } })),
    onSuccess: segarkan,
  });
}

/** Wali mengunggah bukti transfer; petugas keuangan mencatat tunai/transfer (langsung diterima). */
export function useBayarTagihan(id: number) {
  const segarkan = useSegarkanKeuangan();
  return useMutation({
    mutationFn: (body: BodyBayar) =>
      ambilData(api.POST("/tagihan/{id}/pembayaran", { params: { path: { id } }, body, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}
