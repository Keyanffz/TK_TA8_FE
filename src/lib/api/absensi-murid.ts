"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { StatusAbsensiMurid } from "@/types/domain";

export function useAbsensiMuridHarian(kelasId: number, tanggal: string) {
  return useQuery({
    queryKey: queryKeys.absensiMurid.harian(kelasId, tanggal),
    queryFn: async () => (await ambilData(api.GET("/kelas/{id}/absensi-murid", { params: { path: { id: kelasId }, query: { tanggal } } }))).data,
    placeholderData: keepPreviousData,
  });
}

export type BarisAbsensiMurid = { murid_id: number; status: StatusAbsensiMurid; keterangan: string | null };

export function useSimpanAbsensiMurid(kelasId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { tanggal: string; absensi: BarisAbsensiMurid[] }) =>
      ambilData(api.PUT("/kelas/{id}/absensi-murid", { params: { path: { id: kelasId } }, body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.absensiMurid.semua(kelasId) }),
  });
}

export function useRekapAbsensiMurid(kelasId: number, bulan: string) {
  return useQuery({
    queryKey: queryKeys.absensiMurid.rekap(kelasId, bulan),
    queryFn: async () => (await ambilData(api.GET("/kelas/{id}/absensi-murid/rekap", { params: { path: { id: kelasId }, query: { bulan } } }))).data,
    placeholderData: keepPreviousData,
  });
}

export function ambilEksporAbsensiMurid(kelasId: number, bulan: string, format: "xlsx" | "pdf"): Promise<Blob> {
  return ambilData(
    api.GET("/kelas/{id}/absensi-murid/rekap/export", { params: { path: { id: kelasId }, query: { bulan, format } }, parseAs: "blob" }),
  );
}
