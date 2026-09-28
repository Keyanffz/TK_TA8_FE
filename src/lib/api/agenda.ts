"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { segarkanWebsite } from "@/lib/api/website";
import { TAG_PUBLIK } from "@/lib/constants/sekolah";
import type { components } from "@/types/api";

export type BodyAgenda = components["schemas"]["SimpanAgendaRequest"];

/** Agenda yang bersinggungan dengan satu bulan (YYYY-MM), termasuk agenda lintas bulan. */
export function useAgendaBulan(bulan: string) {
  return useQuery({
    queryKey: queryKeys.agenda.bulan(bulan),
    queryFn: async () => (await ambilData(api.GET("/agenda", { params: { query: { bulan } } }))).data,
    placeholderData: keepPreviousData,
  });
}

function useSegarkanAgenda() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.agenda.semua }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      segarkanWebsite([TAG_PUBLIK.agenda]),
    ]);
}

export function useSimpanAgenda(id: number | null) {
  const segarkan = useSegarkanAgenda();
  return useMutation({
    mutationFn: async (body: BodyAgenda) =>
      id === null ? ambilData(api.POST("/agenda", { body })) : ambilData(api.PUT("/agenda/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useHapusAgenda() {
  const segarkan = useSegarkanAgenda();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/agenda/{id}", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}
