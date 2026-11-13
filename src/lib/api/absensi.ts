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

/** Izin dan sakit dikirim tanpa lokasi; absen lain wajib membawa lokasi. */
export type IsianAbsen = { jenis: JenisAbsensi; keterangan?: string; foto: File } & (
  | { latitude: number; longitude: number; akurasi: number }
  | { jenis: "masuk"; status: "izin" | "sakit"; keterangan: string }
);

export function useAbsen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isian: IsianAbsen) => ambilData(api.POST("/absensi", { body: isian, bodySerializer: keFormData })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.absensi.semua }),
  });
}

/** Riwayat dan rekap mencakup 1 sampai 3 bulan yang berakhir di `bulan`. */
export const JUMLAH_BULAN_REKAP = [1, 2, 3] as const;
export type JumlahBulanRekap = (typeof JUMLAH_BULAN_REKAP)[number];

/**
 * Riwayat `jumlahBulan` bulan yang berakhir di `bulan`. `userId` null = milik sendiri; peserta lain hanya untuk
 * Kepala Sekolah.
 */
export function useRiwayatAbsensi(
  bulan: string,
  userId: number | null,
  { aktif = true, jumlahBulan = 1 }: { aktif?: boolean; jumlahBulan?: JumlahBulanRekap } = {},
) {
  return useQuery({
    queryKey: queryKeys.absensi.riwayat(bulan, userId, jumlahBulan),
    queryFn: async () =>
      (await ambilData(api.GET("/absensi", { params: { query: { bulan, jumlah_bulan: jumlahBulan, user_id: userId ?? undefined } } }))).data,
    placeholderData: keepPreviousData,
    enabled: aktif,
  });
}

export function useRekapAbsensi(bulan: string, jumlahBulan: JumlahBulanRekap) {
  return useQuery({
    queryKey: queryKeys.absensi.rekap(bulan, jumlahBulan),
    queryFn: async () => (await ambilData(api.GET("/absensi/rekap", { params: { query: { bulan, jumlah_bulan: jumlahBulan } } }))).data,
    placeholderData: keepPreviousData,
  });
}

export function useAbsensiHarian(tanggal: string) {
  return useQuery({
    queryKey: queryKeys.absensi.harian(tanggal),
    queryFn: async () => (await ambilData(api.GET("/absensi/harian", { params: { query: { tanggal } } }))).data,
    placeholderData: keepPreviousData,
  });
}

export type FormatEksporRekap = "xlsx" | "pdf";

export function ambilEksporRekapAbsensi(bulan: string, jumlahBulan: JumlahBulanRekap, format: FormatEksporRekap): Promise<Blob> {
  return ambilData(api.GET("/absensi/rekap/export", { params: { query: { bulan, jumlah_bulan: jumlahBulan, format } }, parseAs: "blob" }));
}

// Koreksi dan pencatatan selalu dikirim multipart, juga tanpa lampiran: api.json hanya mencatat body multipart.
export function useKoreksiAbsensi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; status: StatusAbsensi; catatan: string; lampiran?: File }) =>
      ambilData(api.PATCH("/absensi/{id}/koreksi", { params: { path: { id } }, body, bodySerializer: keFormData })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.absensi.semua }),
  });
}

/** Absen pulang tidak punya status, jadi status hanya dikirim untuk absen masuk. */
export type IsianAbsenBaru = { user_id: number; tanggal: string; catatan: string; lampiran?: File } & (
  | { jenis: "masuk"; status: Exclude<StatusAbsensi, "tidak_hadir"> }
  | { jenis: "pulang" }
);

/** Absen masuk atau pulang yang dicatat Kepala Sekolah untuk peserta yang lupa absen di tanggal itu. */
export function useCatatAbsen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isian: IsianAbsenBaru) => ambilData(api.POST("/absensi/koreksi", { body: isian, bodySerializer: keFormData })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.absensi.semua }),
  });
}

/** Akses absen susulan dari Kepala Sekolah untuk satu peserta, satu tanggal, dan satu jenis absen. */
export function useBeriAksesSusulan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { user_id: number; tanggal: string; jenis: JenisAbsensi; catatan: string }) => ambilData(api.POST("/absensi/susulan", { body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.absensi.semua }),
  });
}

export function useCabutAksesSusulan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/absensi/susulan/{id}", { params: { path: { id } } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.absensi.semua }),
  });
}

export function useAbsenSusulan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, foto }: { id: number; foto: File }) =>
      ambilData(api.POST("/absensi/susulan/{id}/absen", { params: { path: { id } }, body: { foto }, bodySerializer: keFormData })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.absensi.semua }),
  });
}
