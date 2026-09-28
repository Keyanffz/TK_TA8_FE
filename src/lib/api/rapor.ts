"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { keFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { components } from "@/types/api";
import type { StatusRapor } from "@/types/domain";

export const RAPOR_PER_HALAMAN = 20;
// Satu kelas paling banyak 20-an murid, jadi rapor satu kelas per semester diambil sekaligus.
export const RAPOR_SATU_KELAS = 100;

// Semester dikirim sebagai string "1"/"2" (enum di api.json).
const SEMESTER_API = { 1: "1", 2: "2" } as const;

export type BodyIsiRapor = components["schemas"]["IsiRaporRequest"];

export type FilterRapor = {
  halaman: number;
  search?: string;
  kelasId?: number | null;
  semester?: 1 | 2 | null;
  status?: StatusRapor | null;
  muridId?: number | null;
  perHalaman?: number;
  sort?: "updated_at" | "-updated_at" | "diajukan_at" | "-diajukan_at";
};

export function useDaftarRapor(filter: FilterRapor, aktif = true) {
  const query = {
    page: filter.halaman,
    per_page: filter.perHalaman ?? RAPOR_PER_HALAMAN,
    sort: filter.sort ?? ("-updated_at" as const),
    search: filter.search || undefined,
    "filter[kelas_id]": filter.kelasId ?? undefined,
    "filter[semester]": filter.semester ? SEMESTER_API[filter.semester] : undefined,
    "filter[status]": filter.status ?? undefined,
    "filter[murid_id]": filter.muridId ?? undefined,
  };
  return useQuery({
    queryKey: queryKeys.rapor.daftar(query),
    queryFn: () => ambilData(api.GET("/rapor", { params: { query } })),
    placeholderData: keepPreviousData,
    enabled: aktif,
  });
}

export function useDetailRapor(id: number) {
  return useQuery({
    queryKey: queryKeys.rapor.detail(id),
    queryFn: async () => (await ambilData(api.GET("/rapor/{id}", { params: { path: { id } } }))).data,
    retry: false,
  });
}

export function useElemenPenilaian() {
  return useQuery({
    queryKey: queryKeys.elemenPenilaian,
    queryFn: async () => (await ambilData(api.GET("/elemen-penilaian"))).data,
  });
}

function useSegarkanRapor() {
  const queryClient = useQueryClient();
  // Progres rapor tampil di beranda guru, antrean review di beranda Kepala Sekolah.
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.rapor.semua }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
}

export function useBuatRapor() {
  const segarkan = useSegarkanRapor();
  return useMutation({
    mutationFn: ({ muridId, semester }: { muridId: number; semester: 1 | 2 }) =>
      ambilData(api.POST("/rapor", { body: { murid_id: muridId, semester: SEMESTER_API[semester] } })),
    onSuccess: segarkan,
  });
}

export function useIsiRapor(id: number) {
  const segarkan = useSegarkanRapor();
  return useMutation({
    mutationFn: (body: BodyIsiRapor) => ambilData(api.PUT("/rapor/{id}", { params: { path: { id } }, body })),
    onSuccess: segarkan,
  });
}

export function useFotoRapor(id: number) {
  const segarkan = useSegarkanRapor();
  return useMutation({
    mutationFn: ({ detailId, foto }: { detailId: number; foto: File }) =>
      ambilData(
        api.POST("/rapor/{id}/detail/{detail_id}/foto", {
          params: { path: { id, detail_id: detailId } },
          body: { foto },
          bodySerializer: keFormData,
        }),
      ),
    onSuccess: segarkan,
  });
}

export function useAjukanRapor(id: number) {
  const segarkan = useSegarkanRapor();
  return useMutation({
    mutationFn: () => ambilData(api.POST("/rapor/{id}/ajukan", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useTerbitkanRapor(id: number) {
  const segarkan = useSegarkanRapor();
  return useMutation({
    mutationFn: () => ambilData(api.POST("/rapor/{id}/terbitkan", { params: { path: { id } } })),
    onSuccess: segarkan,
  });
}

export function useMintaRevisiRapor(id: number) {
  const segarkan = useSegarkanRapor();
  return useMutation({
    mutationFn: (catatan: string) => ambilData(api.POST("/rapor/{id}/revisi", { params: { path: { id } }, body: { catatan } })),
    onSuccess: segarkan,
  });
}

export function useTarikRapor(id: number) {
  const segarkan = useSegarkanRapor();
  return useMutation({
    mutationFn: (catatan: string) => ambilData(api.POST("/rapor/{id}/tarik", { params: { path: { id } }, body: { catatan } })),
    onSuccess: segarkan,
  });
}

export function ambilPdfRapor(id: number): Promise<Blob> {
  return ambilData(api.GET("/rapor/{id}/pdf", { params: { path: { id } }, parseAs: "blob" }));
}

export type BodyElemen = components["schemas"]["SimpanElemenPenilaianRequest"];

export function useSimpanElemen(id: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: BodyElemen) =>
      id === null
        ? ambilData(api.POST("/elemen-penilaian", { body }))
        : ambilData(api.PUT("/elemen-penilaian/{id}", { params: { path: { id } }, body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.elemenPenilaian }),
  });
}

export function useHapusElemen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ambilData(api.DELETE("/elemen-penilaian/{id}", { params: { path: { id } } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.elemenPenilaian }),
  });
}
