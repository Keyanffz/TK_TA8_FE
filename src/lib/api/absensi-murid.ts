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

export function useHariSekolahKelas(kelasId: number) {
  return useQuery({
    queryKey: queryKeys.absensiMurid.hariSekolah(kelasId),
    queryFn: async () => (await ambilData(api.GET("/kelas/{id}/hari-sekolah", { params: { path: { id: kelasId } } }))).data,
  });
}

export type HariSekolahKelas = NonNullable<ReturnType<typeof useHariSekolahKelas>["data"]>;
export type LiburKelas = HariSekolahKelas["libur"][number];

// Hari sekolah dan libur menentukan tanggal yang bisa dicatat dan isi rekap, jadi semua data absensi kelas itu dimuat ulang.
function useSegarkanAbsensiKelas(kelasId: number) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.absensiMurid.semua(kelasId) });
}

export function useUbahHariSekolah(kelasId: number) {
  const segarkan = useSegarkanAbsensiKelas(kelasId);
  return useMutation({
    mutationFn: (hariSekolah: number[]) =>
      ambilData(api.PUT("/kelas/{id}/hari-sekolah", { params: { path: { id: kelasId } }, body: { hari_sekolah: hariSekolah } })),
    onSuccess: segarkan,
  });
}

export function useTambahLiburKelas(kelasId: number) {
  const segarkan = useSegarkanAbsensiKelas(kelasId);
  return useMutation({
    mutationFn: (body: { tanggal_mulai: string; tanggal_selesai: string | null; keterangan: string }) =>
      ambilData(api.POST("/kelas/{id}/libur", { params: { path: { id: kelasId } }, body })),
    onSuccess: segarkan,
  });
}

export function useHapusLiburKelas(kelasId: number) {
  const segarkan = useSegarkanAbsensiKelas(kelasId);
  return useMutation({
    mutationFn: (liburId: number) => ambilData(api.DELETE("/kelas/{id}/libur/{libur_id}", { params: { path: { id: kelasId, libur_id: liburId } } })),
    onSuccess: segarkan,
  });
}
