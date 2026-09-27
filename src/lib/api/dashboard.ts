"use client";

import { useQuery } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
async function ambilDashboard(muridId: number | null) {
  const hasil = await ambilData(
    api.GET("/dashboard", { params: { query: muridId === null ? {} : { murid_id: muridId } } }),
  );
  return hasil.data;
}

type DataDashboard = Awaited<ReturnType<typeof ambilDashboard>>;

// api.json menulis data GET /dashboard sebagai anyOf tiga bentuk tanpa penanda
// role, jadi bentuknya dipastikan lewat kunci khas masing-masing.
export type DashboardKepalaSekolah = Extract<DataDashboard, { statistik: unknown }>;
export type DashboardGuru = Extract<DataDashboard, { kelas_saya: unknown }>;
export type DashboardWali = Extract<DataDashboard, { tagihan_aktif: unknown }>;

function bentukTidakSesuai(): never {
  throw new Error("Bentuk data beranda dari server tidak sesuai dengan akun ini. Muat ulang halaman.");
}

export function useDashboardKepalaSekolah() {
  return useQuery({
    queryKey: queryKeys.dashboard(null),
    queryFn: async () => {
      const data = await ambilDashboard(null);
      return "statistik" in data ? data : bentukTidakSesuai();
    },
  });
}

export function useDashboardGuru() {
  return useQuery({
    queryKey: queryKeys.dashboard(null),
    queryFn: async () => {
      const data = await ambilDashboard(null);
      return "kelas_saya" in data ? data : bentukTidakSesuai();
    },
  });
}

export function useDashboardWali(muridId: number | null) {
  return useQuery({
    queryKey: queryKeys.dashboard(muridId),
    queryFn: async () => {
      const data = await ambilDashboard(muridId);
      return "tagihan_aktif" in data ? data : bentukTidakSesuai();
    },
  });
}
