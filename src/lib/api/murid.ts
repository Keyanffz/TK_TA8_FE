"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { keFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/types/api";
import type { Hubungan, StatusMurid, Tingkat } from "@/types/domain";

export const MURID_PER_HALAMAN = 20;

export type BodyMurid = components["schemas"]["SimpanMuridRequest"];
export type BodyUbahMurid = components["schemas"]["PerbaruiMuridRequest"];
export type FilterMurid = {
  search: string;
  halaman: number;
  kelasId: number | null;
  status: StatusMurid | null;
  tingkat: Tingkat | null;
  perHalaman?: number;
};

export function useDaftarMurid({ search, halaman, kelasId, status, tingkat, perHalaman = MURID_PER_HALAMAN }: FilterMurid, aktif = true) {
  const query = {
    page: halaman,
    per_page: perHalaman,
    sort: "nama" as const,
    search: search || undefined,
    "filter[kelas_id]": kelasId ?? undefined,
    "filter[status]": status ?? undefined,
    "filter[tingkat]": tingkat ?? undefined,
  };
  return useQuery({
    queryKey: queryKeys.murid.daftar(query),
    queryFn: () => ambilData(api.GET("/murid", { params: { query } })),
    placeholderData: keepPreviousData,
    enabled: aktif,
  });
}

export function useDetailMurid(id: number) {
  return useQuery({
    queryKey: queryKeys.murid.detail(id),
    queryFn: async () => (await ambilData(api.GET("/murid/{id}", { params: { path: { id } } }))).data,
  });
}

function useSegarkanMurid() {
  const queryClient = useQueryClient();
  // Data murid tampil juga di kelas, wali murid, dan beranda.
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.murid.semua }),
      queryClient.invalidateQueries({ queryKey: queryKeys.kelas.semua }),
      queryClient.invalidateQueries({ queryKey: queryKeys.waliMurid.semua }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
}

export function useTambahMurid() {
  const segarkan = useSegarkanMurid();
  return useMutation({
    mutationFn: (body: BodyMurid) => ambilData(api.POST("/murid", { body, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}

export function useUbahMurid(id: number) {
  const segarkan = useSegarkanMurid();
  return useMutation({
    mutationFn: (body: BodyUbahMurid) =>
      ambilData(api.PUT("/murid/{id}", { params: { path: { id } }, body, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}

export function useHapusMurid() {
  const segarkan = useSegarkanMurid();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/murid/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useUbahTautanWali(muridId: number) {
  const queryClient = useQueryClient();
  const segarkan = useSegarkanMurid();
  return useMutation({
    mutationFn: ({ waliId, body }: { waliId: number; body: { hubungan?: Hubungan; is_kontak_utama?: boolean } }) =>
      ambilData(api.PATCH("/murid/{id}/wali/{wali_murid_id}", { params: { path: { id: muridId, wali_murid_id: waliId } }, body })),
    onSuccess: async (hasil) => {
      queryClient.setQueryData(queryKeys.murid.detail(muridId), hasil.data);
      await segarkan();
    },
  });
}

export function useLepasWali(muridId: number) {
  const segarkan = useSegarkanMurid();
  return useMutation({
    mutationFn: (waliId: number) =>
      ambilData(api.DELETE("/murid/{id}/wali/{wali_murid_id}", { params: { path: { id: muridId, wali_murid_id: waliId } } })),
    onSuccess: segarkan,
  });
}

export async function ambilKartuAkun(muridId: number): Promise<Blob> {
  return ambilData(api.GET("/murid/{id}/kartu-akun", { params: { path: { id: muridId } }, parseAs: "blob" }));
}
