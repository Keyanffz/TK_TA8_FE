"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/types/api";

export const WALI_PER_HALAMAN = 20;

export type BodyWaliMurid = components["schemas"]["PerbaruiWaliMuridRequest"];

export function useDaftarWaliMurid({ search, halaman }: { search: string; halaman: number }) {
  const query = { page: halaman, per_page: WALI_PER_HALAMAN, sort: "nama" as const, search: search || undefined };
  return useQuery({
    queryKey: queryKeys.waliMurid.daftar(query),
    queryFn: () => ambilData(api.GET("/wali-murid", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}

export function useDetailWaliMurid(id: number) {
  return useQuery({
    queryKey: queryKeys.waliMurid.detail(id),
    queryFn: async () => (await ambilData(api.GET("/wali-murid/{id}", { params: { path: { id } } }))).data,
  });
}

function useSegarkanWali() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.waliMurid.semua }),
      queryClient.invalidateQueries({ queryKey: queryKeys.murid.semua }),
    ]);
}

export function useUbahWaliMurid(id: number) {
  const segarkan = useSegarkanWali();
  return useMutation({
    mutationFn: (body: BodyWaliMurid) => ambilData(api.PUT("/wali-murid/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useUbahStatusWali(id: number) {
  const segarkan = useSegarkanWali();
  return useMutation({
    mutationFn: (status: "aktif" | "nonaktif") =>
      ambilData(api.PATCH("/wali-murid/{id}/status", { params: { path: { id } }, body: { status } })),
    onSuccess: segarkan,
  });
}

export function useResetPasswordWali(id: number) {
  const segarkan = useSegarkanWali();
  return useMutation({
    mutationFn: () => ambilData(api.POST("/wali-murid/{id}/reset-password", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}
