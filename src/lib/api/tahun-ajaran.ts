"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/types/api";

// Tahun ajaran hanya bertambah satu per tahun, jadi cukup diambil sekaligus.
const SEMUA_TAHUN_AJARAN = 100;

export type BodyTahunAjaran = components["schemas"]["SimpanTahunAjaranRequest"];

export function useDaftarTahunAjaran() {
  return useQuery({
    queryKey: queryKeys.tahunAjaran,
    queryFn: async () =>
      (await ambilData(api.GET("/tahun-ajaran", { params: { query: { per_page: SEMUA_TAHUN_AJARAN, sort: "-tanggal_mulai" } } })))
        .data,
  });
}

function useSegarkanTahunAjaran() {
  const queryClient = useQueryClient();
  // Kelas dan murid menampilkan status tahun ajaran aktif, jadi ikut diambil ulang.
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tahunAjaran }),
      queryClient.invalidateQueries({ queryKey: queryKeys.kelas.semua }),
      queryClient.invalidateQueries({ queryKey: queryKeys.murid.semua }),
    ]);
}

export function useSimpanTahunAjaran() {
  const segarkan = useSegarkanTahunAjaran();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: BodyTahunAjaran }) =>
      id === null
        ? ambilData(api.POST("/tahun-ajaran", { body }))
        : ambilData(api.PUT("/tahun-ajaran/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useAktifkanTahunAjaran() {
  const segarkan = useSegarkanTahunAjaran();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.POST("/tahun-ajaran/{id}/aktifkan", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useHapusTahunAjaran() {
  const segarkan = useSegarkanTahunAjaran();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/tahun-ajaran/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}
