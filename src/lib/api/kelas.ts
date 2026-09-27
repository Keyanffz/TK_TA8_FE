"use client";

import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/types/api";

// Satu tahun ajaran paling banyak belasan kelas; pilihan kelas diambil sekaligus.
const SEMUA_KELAS = 100;

export type BodyKelas = components["schemas"]["SimpanKelasRequest"];
export type BodyKenaikan = components["schemas"]["KenaikanKelasRequest"];

export function useDaftarKelas(tahunAjaranId: number | null) {
  const query = { per_page: SEMUA_KELAS, sort: "nama" as const, "filter[tahun_ajaran_id]": tahunAjaranId ?? undefined };
  return useQuery({
    queryKey: queryKeys.kelas.daftar(query),
    queryFn: async () => (await ambilData(api.GET("/kelas", { params: { query } }))).data,
    placeholderData: keepPreviousData,
  });
}

export function useDetailKelas(id: number) {
  return useQuery({
    queryKey: queryKeys.kelas.detail(id),
    queryFn: async () => (await ambilData(api.GET("/kelas/{id}", { params: { path: { id } } }))).data,
  });
}

/** Detail beberapa kelas sekaligus (daftar murid per kelas untuk wizard kenaikan). */
export function useDetailBanyakKelas(ids: readonly number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.kelas.detail(id),
      queryFn: async () => (await ambilData(api.GET("/kelas/{id}", { params: { path: { id } } }))).data,
    })),
  });
}

function useSegarkanKelas() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.kelas.semua }),
      queryClient.invalidateQueries({ queryKey: queryKeys.murid.semua }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
}

export function useSimpanKelas() {
  const segarkan = useSegarkanKelas();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: BodyKelas }) =>
      id === null ? ambilData(api.POST("/kelas", { body })) : ambilData(api.PUT("/kelas/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useHapusKelas() {
  const segarkan = useSegarkanKelas();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/kelas/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useTempatkanMurid(kelasId: number) {
  const segarkan = useSegarkanKelas();
  return useMutation({
    mutationFn: (muridIds: number[]) =>
      ambilData(api.POST("/kelas/{id}/murid", { params: { path: { id: kelasId } }, body: { murid_ids: muridIds } })),
    onSuccess: segarkan,
  });
}

export function useKeluarkanMurid(kelasId: number) {
  const segarkan = useSegarkanKelas();
  return useMutation({
    mutationFn: (muridId: number) =>
      ambilData(api.DELETE("/kelas/{id}/murid/{murid_id}", { params: { path: { id: kelasId, murid_id: muridId } } })),
    onSuccess: segarkan,
  });
}

export function useKenaikanKelas() {
  const segarkan = useSegarkanKelas();
  return useMutation({
    mutationFn: (body: BodyKenaikan) => ambilData(api.POST("/kelas/kenaikan", { body })),
    onSuccess: segarkan,
  });
}

/**
 * Kelas tahun ajaran aktif yang boleh dipilih pengguna: semua kelas untuk Kepala Sekolah, kelas yang
 * diampu untuk guru (backend sudah membatasi `GET /kelas` untuk guru).
 */
export function useKelasAktif() {
  const query = useDaftarKelas(null);
  return { ...query, data: query.data?.filter((kelas) => kelas.tahun_ajaran.is_aktif) };
}
