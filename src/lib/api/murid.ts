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
export type BodyUbahStatus = components["schemas"]["UbahStatusMuridRequest"];
type BodyUbahStatusMassal = components["schemas"]["UbahStatusMassalRequest"];
export type FilterMurid = {
  search: string;
  halaman: number;
  kelasId: number | null;
  status: StatusMurid | null;
  tingkat: Tingkat | null;
  tahunLulus?: number | null;
  perHalaman?: number;
};

export function useDaftarMurid({ search, halaman, kelasId, status, tingkat, tahunLulus = null, perHalaman = MURID_PER_HALAMAN }: FilterMurid, aktif = true) {
  const query = {
    page: halaman,
    per_page: perHalaman,
    sort: tahunLulus === null && status === "lulus" ? ("-tahun_lulus" as const) : ("nama" as const),
    search: search || undefined,
    "filter[kelas_id]": kelasId ?? undefined,
    "filter[status]": status ?? undefined,
    "filter[tingkat]": tingkat ?? undefined,
    "filter[tahun_lulus]": tahunLulus ?? undefined,
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

/** Tahun lulus yang punya alumni, terbaru dulu, untuk saringan halaman Alumni. */
export function useTahunLulus() {
  return useQuery({
    queryKey: queryKeys.murid.tahunLulus,
    queryFn: async () => (await ambilData(api.GET("/murid/tahun-lulus"))).data,
  });
}

function useSegarkanMurid() {
  const queryClient = useQueryClient();
  // Data murid tampil juga di kelas, wali murid, tagihan, dan beranda.
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
    mutationFn: (body: BodyMurid) => ambilData(api.PUT("/murid/{id}", { params: { path: { id } }, body, bodySerializer: keFormData })),
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

export function useUbahStatusMurid(id: number) {
  const queryClient = useQueryClient();
  const segarkan = useSegarkanMurid();
  return useMutation({
    mutationFn: (body: BodyUbahStatus) => ambilData(api.PATCH("/murid/{id}/status", { params: { path: { id } }, body })),
    onSuccess: async (hasil) => {
      queryClient.setQueryData(queryKeys.murid.detail(id), hasil.data);
      await segarkan();
    },
  });
}

/** Ubah status murid terpilih (`murid_ids`) atau semua murid aktif satu kelas (`kelas_id`). */
export function useUbahStatusMassal() {
  const segarkan = useSegarkanMurid();
  return useMutation({
    mutationFn: (body: BodyUbahStatusMassal) => ambilData(api.POST("/murid/status-massal", { body })),
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

export async function ambilTemplateImport(): Promise<Blob> {
  return ambilData(api.GET("/murid/import/template", { parseAs: "blob" }));
}

/** Memeriksa setiap baris file tanpa menyimpan apa pun. */
export function usePratinjauImportMurid() {
  return useMutation({
    mutationFn: async (file: File) =>
      (await ambilData(api.POST("/murid/import/pratinjau", { body: { file }, bodySerializer: keFormData }))).data,
  });
}

/** Menyimpan semua baris valid dari file yang sama dengan pratinjau, dalam satu transaksi di backend. */
export function useSimpanImportMurid() {
  const segarkan = useSegarkanMurid();
  return useMutation({
    mutationFn: (file: File) => ambilData(api.POST("/murid/import", { body: { file }, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}
