"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

// B6: badge notifikasi diperbarui tiap 60 detik, hanya saat tab aktif
// (React Query tidak menjalankan refetchInterval di tab latar belakang).
const INTERVAL_BADGE_MS = 60_000;
const JUMLAH_TERBARU = 6;
export const NOTIFIKASI_PER_HALAMAN = 15;

export function useJumlahBelumDibaca() {
  return useQuery({
    queryKey: queryKeys.notifikasi.belumDibaca,
    queryFn: async () => (await ambilData(api.GET("/notifikasi/belum-dibaca"))).data.jumlah,
    refetchInterval: INTERVAL_BADGE_MS,
  });
}

export function useNotifikasiTerbaru(aktif: boolean) {
  return useQuery({
    queryKey: queryKeys.notifikasi.terbaru,
    queryFn: async () =>
      (await ambilData(api.GET("/notifikasi", { params: { query: { per_page: JUMLAH_TERBARU } } }))).data,
    enabled: aktif,
  });
}

export function useDaftarNotifikasi(halaman: number, hanyaBelumDibaca: boolean) {
  return useQuery({
    queryKey: queryKeys.notifikasi.daftar(halaman, hanyaBelumDibaca),
    queryFn: async () =>
      ambilData(
        api.GET("/notifikasi", {
          params: {
            query: {
              page: halaman,
              per_page: NOTIFIKASI_PER_HALAMAN,
              ...(hanyaBelumDibaca ? { "filter[dibaca]": false } : {}),
            },
          },
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function useBacaNotifikasi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => ambilData(api.POST("/notifikasi/{id}/baca", { params: { path: { id } } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifikasi.semua }),
  });
}

export function useBacaSemuaNotifikasi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => ambilData(api.POST("/notifikasi/baca-semua")),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifikasi.semua }),
  });
}
