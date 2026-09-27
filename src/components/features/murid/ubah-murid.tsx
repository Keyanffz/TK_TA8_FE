"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormMurid } from "@/components/features/murid/form-murid";
import { GalatMuat } from "@/components/shared/galat-muat";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailMurid, useUbahMurid } from "@/lib/api/murid";

export function UbahMurid({ id }: { id: number }) {
  const router = useRouter();
  const { data: murid, isPending, isError, error, refetch } = useDetailMurid(id);
  const ubah = useUbahMurid(id);

  if (isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <FormMurid
      key={murid.id}
      murid={murid}
      labelSimpan="Simpan Perubahan"
      kirim={async (body) => {
        await ubah.mutateAsync(body);
        toast.success("Data murid tersimpan.");
        router.push(`/dashboard/murid/${id}`);
      }}
    />
  );
}
