"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/types/api";

// Jenis tagihan per tahun ajaran hanya beberapa; diambil sekaligus untuk tabel dan pilihan.
const SEMUA_JENIS = 100;

export type BodyJenisTagihan = components["schemas"]["SimpanJenisTagihanRequest"];

export function useDaftarJenisTagihan(tahunAjaranId: number | null, aktif = true) {
  const query = { per_page: SEMUA_JENIS, sort: "nama" as const, "filter[tahun_ajaran_id]": tahunAjaranId ?? undefined };
  return useQuery({
    queryKey: queryKeys.jenisTagihan.daftar(query),
    queryFn: async () => (await ambilData(api.GET("/jenis-tagihan", { params: { query } }))).data,
    placeholderData: keepPreviousData,
    enabled: aktif,
  });
}

function useSegarkanJenis() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.jenisTagihan.semua });
}

export function useSimpanJenisTagihan() {
  const segarkan = useSegarkanJenis();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: BodyJenisTagihan }) =>
      id === null
        ? ambilData(api.POST("/jenis-tagihan", { body }))
        : ambilData(api.PUT("/jenis-tagihan/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useHapusJenisTagihan() {
  const segarkan = useSegarkanJenis();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/jenis-tagihan/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}
