"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

type GrupPengaturan = "profil" | "landing" | "keuangan" | "ppdb" | "beranda";

// `data` GET /pengaturan berupa objek berkunci bebas di api.json, jadi bentuk
// tiap kunci dipastikan dengan zod sesuai A4.
export const skemaInfoWali = z.object({
  aktif: z.boolean(),
  judul: z.string().nullable(),
  isi: z.string().nullable(),
  nada: z.enum(["info", "penting", "peringatan"]),
  berlaku_sampai: z.string().nullable(),
});

export type InfoWali = z.infer<typeof skemaInfoWali>;

export function usePengaturan<T>(grup: GrupPengaturan, baca: (data: Record<string, unknown>) => T) {
  return useQuery({
    queryKey: queryKeys.pengaturan(grup),
    queryFn: async () => baca((await ambilData(api.GET("/pengaturan", { params: { query: { grup } } }))).data),
  });
}

export function useSimpanPengaturan(grup: GrupPengaturan) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: Record<string, unknown>) => ambilData(api.PUT("/pengaturan", { body: { items } })),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.pengaturan(grup) }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]),
  });
}
