"use client";

import { FormPengumuman, nilaiDariPengumuman } from "@/components/features/pengumuman/form-pengumuman";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailPengumuman } from "@/lib/api/pengumuman";

export function UbahPengumuman({ id }: { id: number }) {
  const { data, isPending, isError, error, refetch } = useDetailPengumuman(id);
  if (isPending) return <Skeleton aria-label="Memuat pengumuman" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  return <FormPengumuman id={id} sudahTerbit={data.published_at !== null} awal={nilaiDariPengumuman(data)} />;
}
