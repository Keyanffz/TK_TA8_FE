"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { segarkanWebsite } from "@/lib/api/website";
import { TAG_PUBLIK } from "@/lib/constants/sekolah";
import type { StatusPendaftaran } from "@/types/domain";

export const PENDAFTARAN_PER_HALAMAN = 20;

export function useDaftarPendaftaran(filter: { halaman: number; search: string; status: StatusPendaftaran | null; perHalaman?: number }) {
  const query = {
    page: filter.halaman,
    per_page: filter.perHalaman ?? PENDAFTARAN_PER_HALAMAN,
    search: filter.search || undefined,
    sort: "-created_at" as const,
    "filter[status]": filter.status ?? undefined,
  };
  return useQuery({
    queryKey: queryKeys.pendaftaran.daftar(query),
    queryFn: () => ambilData(api.GET("/pendaftaran", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}

export function useDetailPendaftaran(id: number) {
  return useQuery({
    queryKey: queryKeys.pendaftaran.detail(id),
    queryFn: async () => (await ambilData(api.GET("/pendaftaran/{id}", { params: { path: { id } } }))).data,
  });
}

/** Status PPDB (buka/tutup, kuota, sisa kuota, tahun ajaran tujuan) lewat endpoint publik. */
export function useStatusPpdb() {
  return useQuery({
    queryKey: queryKeys.pendaftaran.status,
    queryFn: async () => (await ambilData(api.GET("/public/ppdb"))).data,
  });
}

function useSegarkanPendaftaran() {
  const queryClient = useQueryClient();
  // Penerimaan membuat murid dan akun wali, dan mengurangi sisa kuota di website.
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.pendaftaran.semua }),
      queryClient.invalidateQueries({ queryKey: queryKeys.murid.semua }),
      queryClient.invalidateQueries({ queryKey: queryKeys.kelas.semua }),
      queryClient.invalidateQueries({ queryKey: queryKeys.waliMurid.semua }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      segarkanWebsite([TAG_PUBLIK.ppdb]),
    ]);
}

export function useVerifikasiPendaftaran(id: number) {
  const segarkan = useSegarkanPendaftaran();
  return useMutation({
    mutationFn: () => ambilData(api.POST("/pendaftaran/{id}/verifikasi", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useTerimaPendaftaran(id: number) {
  const segarkan = useSegarkanPendaftaran();
  return useMutation({
    mutationFn: (kelasId: number | null) => ambilData(api.POST("/pendaftaran/{id}/terima", { params: { path: { id } }, body: { kelas_id: kelasId } })),
    onSuccess: segarkan,
  });
}

export function useTolakPendaftaran(id: number) {
  const segarkan = useSegarkanPendaftaran();
  return useMutation({
    mutationFn: (alasan: string) => ambilData(api.POST("/pendaftaran/{id}/tolak", { params: { path: { id } }, body: { alasan } })),
    onSuccess: segarkan,
  });
}
