"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

export type FilterLaporan = { dari: string; sampai: string; kelasId: number | null };

function queryLaporan({ dari, sampai, kelasId }: FilterLaporan) {
  return { dari, sampai, kelas_id: kelasId ?? undefined };
}

export function useLaporanKeuangan(filter: FilterLaporan) {
  const query = queryLaporan(filter);
  return useQuery({
    queryKey: queryKeys.laporan.keuangan(query),
    queryFn: async () => (await ambilData(api.GET("/laporan/keuangan", { params: { query } }))).data,
    placeholderData: keepPreviousData,
    enabled: filter.dari !== "" && filter.sampai !== "" && filter.dari <= filter.sampai,
  });
}

export function ambilEksporLaporan(filter: FilterLaporan): Promise<Blob> {
  return ambilData(api.GET("/laporan/keuangan/export", { params: { query: queryLaporan(filter) }, parseAs: "blob" }));
}

export function useLaporanTunggakan(kelasId: number | null) {
  return useQuery({
    queryKey: queryKeys.laporan.tunggakan(kelasId),
    queryFn: async () =>
      (await ambilData(api.GET("/laporan/tunggakan", { params: { query: { kelas_id: kelasId ?? undefined } } }))).data,
    placeholderData: keepPreviousData,
  });
}
