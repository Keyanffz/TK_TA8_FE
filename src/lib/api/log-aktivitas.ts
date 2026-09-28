"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { operations } from "@/types/api";

export const LOG_PER_HALAMAN = 30;

export type JenisLog = NonNullable<NonNullable<operations["logAktivitas.logAktivitas"]["parameters"]["query"]>["filter[jenis]"]>;

export function useLogAktivitas(filter: { halaman: number; jenis: JenisLog | null; tanggal: string | null }) {
  const query = {
    page: filter.halaman,
    per_page: LOG_PER_HALAMAN,
    "filter[jenis]": filter.jenis ?? undefined,
    "filter[tanggal]": filter.tanggal ?? undefined,
  };
  return useQuery({
    queryKey: queryKeys.logAktivitas(query),
    queryFn: () => ambilData(api.GET("/log-aktivitas", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}
