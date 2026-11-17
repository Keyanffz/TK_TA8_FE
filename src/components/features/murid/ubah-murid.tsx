"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { LANGKAH } from "@/components/features/formulir-murid/label-field";
import { FormMurid } from "@/components/features/murid/form-murid";
import { GalatMuat } from "@/components/shared/galat-muat";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailMurid, useUbahMurid } from "@/lib/api/murid";

/** `keKonfirmasi`: dibuka dari tambah murid yang datanya belum lengkap, langsung di langkah Konfirmasi. */
export function UbahMurid({ id, keKonfirmasi }: { id: number; keKonfirmasi: boolean }) {
  const router = useRouter();
  const { data: murid, isPending, isError, error, refetch } = useDetailMurid(id);
  const ubah = useUbahMurid(id);

  if (isPending) return <Skeleton aria-label="Memuat data murid" className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;

  return (
    <FormMurid
      key={murid.id}
      murid={murid}
      labelSimpan="Simpan Perubahan"
      langkahAwal={keKonfirmasi ? LANGKAH.konfirmasi : LANGKAH.dataAnak}
      sesudahSimpan={
        <Link href={`/mudarris/murid/${id}`} className={buttonVariants({ variant: "outline", className: "self-start" })}>
          Selesai, Lengkapi Nanti
        </Link>
      }
      kirim={async (body) => {
        const { data } = await ubah.mutateAsync(body);
        if (data.data_kurang.length === 0) {
          toast.success("Data murid tersimpan.");
          router.push(`/mudarris/murid/${id}`);
        } else {
          toast.success("Data murid tersimpan. Masih ada isian wajib yang kosong.");
        }
        return data;
      }}
    />
  );
}
