"use client";

import { useQuery } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

/** Anak tertaut beserta kelas aktifnya (`GET /wali/anak`); sesi hanya memuat nama kelas, tanpa id. */
export function useAnakWali(aktif = true) {
  return useQuery({
    queryKey: queryKeys.anakWali,
    queryFn: async () => (await ambilData(api.GET("/wali/anak"))).data,
    enabled: aktif,
  });
}
