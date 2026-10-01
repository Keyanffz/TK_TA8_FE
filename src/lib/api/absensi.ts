"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { keFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { JenisAbsensi, StatusAbsensi } from "@/types/domain";

// Jam buka dan tutup dibandingkan dengan jam server, jadi status diambil ulang tiap menit selagi halaman terbuka.
const JEDA_SEGARKAN_STATUS_MS = 60_000;

export function useAbsensiHariIni() {
  return useQuery({
    queryKey: queryKeys.absensi.hariIni,
    queryFn: async () => (await ambilData(api.GET("/absensi/hari-ini"))).data,
    refetchInterval: JEDA_SEGARKAN_STATUS_MS,
  });
}

export type IsianAbsen = { jenis: JenisAbsensi; latitude: number; longitude: number; akurasi: number; foto: File };

export function useAbsen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isian: IsianAbsen) => ambilData(api.POST("/absensi", { body: isian, bodySerializer: keFormData })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.absensi.semua }),
  });
}

/** Riwayat satu bulan. `userId` null = milik sendiri; peserta lain hanya untuk Kepala Sekolah. */
export function useRiwayatAbsensi(bulan: string, userId: number | null, aktif = true) {
  return useQuery({
    queryKey: queryKeys.absensi.riwayat(bulan, userId),
    queryFn: async () => (await ambilData(api.GET("/absensi", { params: { query: { bulan, user_id: userId ?? undefined } } }))).data,
    placeholderData: keepPreviousData,
    enabled: aktif,
  });
}

export function useRekapAbsensi(bulan: string) {
  return useQuery({
    queryKey: queryKeys.absensi.rekap(bulan),
    queryFn: async () => (await ambilData(api.GET("/absensi/rekap", { params: { query: { bulan } } }))).data,
    placeholderData: keepPreviousData,
  });
}

export function ambilEksporRekapAbsensi(bulan: string): Promise<Blob> {
  return ambilData(api.GET("/absensi/rekap/export", { params: { query: { bulan } }, parseAs: "blob" }));
}

export function useKoreksiAbsensi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, catatan }: { id: number; status: StatusAbsensi; catatan: string }) =>
      ambilData(api.PATCH("/absensi/{id}/koreksi", { params: { path: { id } }, body: { status, catatan } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.absensi.semua }),
  });
}
