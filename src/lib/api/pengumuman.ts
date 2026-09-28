"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { segarkanWebsite } from "@/lib/api/website";
import { useSession } from "@/lib/auth/use-session";
import { TAG_PUBLIK } from "@/lib/constants/sekolah";
import type { components } from "@/types/api";

export const PENGUMUMAN_PER_HALAMAN = 10;

export type BodyPengumuman = components["schemas"]["SimpanPengumumanRequest"];

export function useDaftarPengumuman(filter: { halaman: number; search: string; terbit: boolean | null }) {
  const query = {
    page: filter.halaman,
    per_page: PENGUMUMAN_PER_HALAMAN,
    search: filter.search || undefined,
    "filter[terbit]": filter.terbit ?? undefined,
  };
  return useQuery({
    queryKey: queryKeys.pengumuman.daftar(query),
    queryFn: () => ambilData(api.GET("/pengumuman", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}

export function useDetailPengumuman(id: number) {
  return useQuery({
    queryKey: queryKeys.pengumuman.detail(id),
    queryFn: async () => (await ambilData(api.GET("/pengumuman/{id}", { params: { path: { id } } }))).data,
  });
}

function useSegarkanPengumuman() {
  const queryClient = useQueryClient();
  // Hanya pengumuman Kepala Sekolah yang bisa tampil di website (is_publik).
  const { isSuperAdmin } = useSession();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.pengumuman.semua }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      isSuperAdmin ? segarkanWebsite([TAG_PUBLIK.pengumuman]) : null,
    ]);
}

export function useSimpanPengumuman(id: number | null) {
  const segarkan = useSegarkanPengumuman();
  return useMutation({
    mutationFn: async (body: BodyPengumuman) =>
      id === null
        ? ambilData(api.POST("/pengumuman", { body }))
        : ambilData(api.PUT("/pengumuman/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useHapusPengumuman() {
  const segarkan = useSegarkanPengumuman();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/pengumuman/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}
