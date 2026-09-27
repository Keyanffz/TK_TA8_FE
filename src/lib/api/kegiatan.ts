"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { keFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/types/api";

export const KEGIATAN_PER_HALAMAN = 9;
/** Batas backend per unggahan (`foto[]`). */
export const MAKS_FOTO_PER_UNGGAHAN = 10;
/** Batas backend per kegiatan. */
export const MAKS_FOTO_PER_KEGIATAN = 30;

export type BodyKegiatan = components["schemas"]["SimpanKegiatanRequest"];
export type BodyUbahKegiatan = Omit<BodyKegiatan, "kelas_id" | "foto">;

export function useDaftarKegiatan(filter: { halaman: number; kelasId: number | null; search: string }, aktif = true) {
  const query = {
    page: filter.halaman,
    per_page: KEGIATAN_PER_HALAMAN,
    search: filter.search || undefined,
    "filter[kelas_id]": filter.kelasId ?? undefined,
  };
  return useQuery({
    queryKey: queryKeys.kegiatan.daftar(query),
    queryFn: () => ambilData(api.GET("/kegiatan", { params: { query } })),
    placeholderData: keepPreviousData,
    enabled: aktif,
  });
}

export function useDetailKegiatan(id: number) {
  return useQuery({
    queryKey: queryKeys.kegiatan.detail(id),
    queryFn: async () => (await ambilData(api.GET("/kegiatan/{id}", { params: { path: { id } } }))).data,
  });
}

function useSegarkanKegiatan() {
  const queryClient = useQueryClient();
  // Kegiatan terbaru juga tampil di beranda guru dan wali.
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.kegiatan.semua }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
}

export function useTambahKegiatan() {
  const segarkan = useSegarkanKegiatan();
  return useMutation({
    mutationFn: (body: BodyKegiatan) => ambilData(api.POST("/kegiatan", { body, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}

/**
 * api.json menandai `kelas_id` wajib di PUT, tetapi backend menolaknya (kelas kegiatan tidak bisa diganti).
 * Body tetap mengikuti tipe hasil generate, lalu `kelas_id` dibuang sebelum dikirim.
 */
function keFormDataTanpaKelas({ tanggal, tema, judul, deskripsi }: BodyKegiatan): FormData {
  return keFormData({ tanggal, tema, judul, deskripsi });
}

export function useUbahKegiatan(id: number, kelasId: number) {
  const segarkan = useSegarkanKegiatan();
  return useMutation({
    mutationFn: (body: BodyUbahKegiatan) =>
      ambilData(
        api.PUT("/kegiatan/{id}", { params: { path: { id } }, body: { ...body, kelas_id: kelasId }, bodySerializer: keFormDataTanpaKelas }),
      ),
    onSuccess: segarkan,
  });
}

export function useHapusKegiatan() {
  const segarkan = useSegarkanKegiatan();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/kegiatan/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useTambahFotoKegiatan(id: number) {
  const segarkan = useSegarkanKegiatan();
  return useMutation({
    mutationFn: (foto: File[]) =>
      ambilData(api.POST("/kegiatan/{id}/foto", { params: { path: { id } }, body: { foto }, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}

export function useUbahFotoKegiatan() {
  const segarkan = useSegarkanKegiatan();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; caption?: string | null; urutan?: number }) =>
      ambilData(api.PUT("/kegiatan-foto/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useHapusFotoKegiatan() {
  const segarkan = useSegarkanKegiatan();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/kegiatan-foto/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}
