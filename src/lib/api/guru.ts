"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { keFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import { segarkanWebsite } from "@/lib/api/website";
import { TAG_PUBLIK } from "@/lib/constants/sekolah";
import type { components } from "@/types/api";
import type { StatusAkun } from "@/types/domain";

export const GURU_PER_HALAMAN = 15;
const SEMUA_GURU = 100;

export type BodyGuru = components["schemas"]["SimpanGuruRequest"];
export type FilterGuru = { status: StatusAkun; search: string; halaman: number };

export function useDaftarGuru({ status, search, halaman }: FilterGuru) {
  const query = { page: halaman, per_page: GURU_PER_HALAMAN, sort: "nama" as const, search: search || undefined, "filter[status]": status };
  return useQuery({
    queryKey: queryKeys.guru.daftar(query),
    queryFn: () => ambilData(api.GET("/guru", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}

/** Guru aktif untuk pilihan wali kelas dan pendamping. */
export function useGuruAktif(aktif = true) {
  const query = { per_page: SEMUA_GURU, sort: "nama" as const, "filter[status]": "aktif" as const };
  return useQuery({
    queryKey: queryKeys.guru.daftar(query),
    queryFn: async () => (await ambilData(api.GET("/guru", { params: { query } }))).data,
    enabled: aktif,
  });
}

export function useDetailGuru(id: number) {
  return useQuery({
    queryKey: queryKeys.guru.detail(id),
    queryFn: async () => (await ambilData(api.GET("/guru/{id}", { params: { path: { id } } }))).data,
  });
}

function useSegarkanGuru() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.guru.semua }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      // Nama, jabatan, dan foto guru "tampil di landing" ada di halaman depan.
      segarkanWebsite([TAG_PUBLIK.guru]),
    ]);
}

export function useTambahGuru() {
  const segarkan = useSegarkanGuru();
  return useMutation({
    mutationFn: (body: BodyGuru) => ambilData(api.POST("/guru", { body, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}

export function useUbahGuru(id: number) {
  const segarkan = useSegarkanGuru();
  return useMutation({
    mutationFn: (body: BodyGuru) => ambilData(api.PUT("/guru/{id}", { params: { path: { id } }, body, bodySerializer: keFormData })),
    onSuccess: segarkan,
  });
}

/** Kepala Sekolah melepas akun Google yang terikat; guru lalu bisa masuk dengan akun Google baru beremail sama. */
export function useResetGoogleGuru() {
  const segarkan = useSegarkanGuru();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.POST("/guru/{id}/reset-google", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useUbahStatusGuru() {
  const segarkan = useSegarkanGuru();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: "aktif" | "nonaktif" }) =>
      ambilData(api.PATCH("/guru/{id}/status", { params: { path: { id } }, body: { status } })),
    onSuccess: segarkan,
  });
}
