"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { IzinEfektif, PresetIzin } from "@/types/domain";

/** Modul, level, dan preset izin (A2.13). Isinya tetap, jadi tidak perlu sering diambil ulang. */
export function useDaftarIzin() {
  return useQuery({
    queryKey: queryKeys.izin,
    queryFn: async () => (await ambilData(api.GET("/izin"))).data,
    staleTime: Infinity,
  });
}

function useSegarkanGuru() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.guru.semua });
}

/** Mengganti seluruh izin satu guru. */
export function useSimpanIzinGuru(guruId: number) {
  const segarkan = useSegarkanGuru();
  return useMutation({
    mutationFn: (izin: IzinEfektif) => ambilData(api.PUT("/guru/{id}/izin", { params: { path: { id: guruId } }, body: { izin } })),
    onSuccess: segarkan,
  });
}

export function useTerapkanPreset(guruId: number) {
  const segarkan = useSegarkanGuru();
  return useMutation({
    mutationFn: (preset: PresetIzin) => ambilData(api.POST("/guru/{id}/izin/preset", { params: { path: { id: guruId } }, body: { preset } })),
    onSuccess: segarkan,
  });
}
