"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/types/api";

export const KERINGANAN_PER_HALAMAN = 20;

export type BodyKeringanan = components["schemas"]["SimpanKeringananRequest"];

export function useDaftarKeringanan({ halaman, search }: { halaman: number; search: string }) {
  const query = { page: halaman, per_page: KERINGANAN_PER_HALAMAN, search: search || undefined, sort: "-berlaku_mulai" as const };
  return useQuery({
    queryKey: queryKeys.keringanan.daftar(query),
    queryFn: () => ambilData(api.GET("/keringanan", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}

function useSegarkanKeringanan() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.keringanan.semua });
}

export function useSimpanKeringanan() {
  const segarkan = useSegarkanKeringanan();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: BodyKeringanan }) =>
      id === null
        ? ambilData(api.POST("/keringanan", { body }))
        : ambilData(api.PUT("/keringanan/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useHapusKeringanan() {
  const segarkan = useSegarkanKeringanan();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/keringanan/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}
