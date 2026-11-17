"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/types/api";

/** Anak tertaut beserta kelas aktifnya (`GET /wali/anak`); sesi hanya memuat nama kelas, tanpa id. */
export function useAnakWali(aktif = true) {
  return useQuery({
    queryKey: queryKeys.anakWali,
    queryFn: async () => (await ambilData(api.GET("/wali/anak"))).data,
    enabled: aktif,
  });
}

export type BodyLengkapiAnak = components["schemas"]["LengkapiDataAnakRequest"];

/** Wali mengisi isian formulir anaknya yang masih kosong; isian yang sudah terisi hanya diubah sekolah. */
export function useLengkapiDataAnak(muridId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BodyLengkapiAnak) => ambilData(api.PATCH("/wali/anak/{id}", { params: { path: { id: muridId } }, body })),
    onSuccess: async (hasil) => {
      queryClient.setQueryData(queryKeys.murid.detail(muridId), hasil.data);
      await Promise.all([queryClient.invalidateQueries({ queryKey: queryKeys.anakWali }), queryClient.invalidateQueries({ queryKey: ["dashboard"] })]);
    },
  });
}
