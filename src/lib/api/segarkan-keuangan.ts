"use client";

import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

/**
 * Perubahan tagihan atau pembayaran memengaruhi daftar tagihan, antrean
 * pembayaran, laporan, tunggakan, dan kartu tagihan di beranda (B6).
 */
export function useSegarkanKeuangan() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      [queryKeys.tagihan.semua, queryKeys.pembayaran.semua, ["laporan"], ["dashboard"]].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
}
