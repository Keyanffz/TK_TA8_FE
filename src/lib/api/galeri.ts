"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { keFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import { segarkanWebsite } from "@/lib/api/website";
import { TAG_PUBLIK } from "@/lib/constants/sekolah";
import type { components } from "@/types/api";

export const ALBUM_PER_HALAMAN = 12;
/** Batas backend per unggahan foto galeri. */
export const MAKS_FOTO_GALERI_PER_UNGGAHAN = 20;

export type BodyAlbum = components["schemas"]["SimpanAlbumRequest"];

export function useDaftarAlbum(halaman: number) {
  const query = { page: halaman, per_page: ALBUM_PER_HALAMAN };
  return useQuery({
    queryKey: queryKeys.galeri.daftar(query),
    queryFn: () => ambilData(api.GET("/galeri-album", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}

export function useDetailAlbum(id: number) {
  return useQuery({
    queryKey: queryKeys.galeri.detail(id),
    queryFn: async () => (await ambilData(api.GET("/galeri-album/{id}", { params: { path: { id } } }))).data,
  });
}

function useSegarkanGaleri() {
  const queryClient = useQueryClient();
  return () => Promise.all([queryClient.invalidateQueries({ queryKey: queryKeys.galeri.semua }), segarkanWebsite([TAG_PUBLIK.galeri])]);
}

export function useSimpanAlbum(id: number | null) {
  const segarkan = useSegarkanGaleri();
  return useMutation({
    mutationFn: async (body: BodyAlbum) =>
      id === null
        ? ambilData(api.POST("/galeri-album", { body, bodySerializer: keFormData }))
        : ambilData(api.PUT("/galeri-album/{id}", { params: { path: { id } }, body, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}

export function useHapusAlbum() {
  const segarkan = useSegarkanGaleri();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/galeri-album/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useTambahFotoAlbum(id: number) {
  const segarkan = useSegarkanGaleri();
  return useMutation({
    mutationFn: (foto: File[]) => ambilData(api.POST("/galeri-album/{id}/foto", { params: { path: { id } }, body: { foto }, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}

export function useUbahFotoGaleri() {
  const segarkan = useSegarkanGaleri();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; caption?: string | null; urutan?: number }) =>
      ambilData(api.PUT("/galeri-foto/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useHapusFotoGaleri() {
  const segarkan = useSegarkanGaleri();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/galeri-foto/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}
