"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormKegiatan } from "@/components/features/kegiatan/form-kegiatan";
import { useTambahKegiatan } from "@/lib/api/kegiatan";

export function TambahKegiatan({ kelasAwal }: { kelasAwal: number | null }) {
  const router = useRouter();
  const tambah = useTambahKegiatan();

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <FormKegiatan
        kegiatan={null}
        kelasAwal={kelasAwal}
        labelSimpan="Simpan Kegiatan"
        kirim={async (body) => {
          const { data, message } = await tambah.mutateAsync(body);
          toast.success(message);
          router.replace(`/dashboard/kegiatan/${data.id}`);
        }}
      />
    </div>
  );
}
