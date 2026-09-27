"use client";

import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { toast } from "sonner";

import { pesanError } from "@/lib/api/errors";
import { useFotoRapor } from "@/lib/api/rapor";
import { kompresGambar, TIPE_GAMBAR_DITERIMA, tipeGambarDiterima } from "@/lib/gambar";

type FotoElemenRaporProps = { raporId: number; detailId: number; namaElemen: string; url: string | null; bolehUnggah: boolean };

/** Satu foto karya/kegiatan per elemen rapor; unggahan baru menggantikan foto lama (hanya guru pembuat). */
export function FotoElemenRapor({ raporId, detailId, namaElemen, url, bolehUnggah }: FotoElemenRaporProps) {
  const id = useId();
  const unggah = useFotoRapor(raporId);
  const [memproses, setMemproses] = useState(false);

  const pilih = async (file: File | undefined) => {
    if (!file) return;
    if (!tipeGambarDiterima(file)) {
      toast.error("Pilih foto berformat JPG, PNG, atau WebP.");
      return;
    }
    setMemproses(true);
    try {
      await unggah.mutateAsync({ detailId, foto: await kompresGambar(file) });
      toast.success(`Foto ${namaElemen} tersimpan.`);
    } catch (error) {
      toast.error(pesanError(error));
    } finally {
      setMemproses(false);
    }
  };

  if (!url && !bolehUnggah) return null;

  return (
    <div className="flex items-center gap-3">
      {url ? (
        <span className="relative block aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md bg-muted">
          <Image src={url} alt={`Foto ${namaElemen}`} fill unoptimized className="object-cover" />
        </span>
      ) : null}
      {bolehUnggah ? (
        <label
          htmlFor={id}
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 font-heading text-sm font-bold text-primary-strong hover:bg-primary-soft has-focus-visible:ring-2 has-focus-visible:ring-ring"
        >
          <ImagePlus aria-hidden="true" className="size-4" />
          {memproses ? "Mengunggah..." : url ? "Ganti foto" : "Tambah foto"}
          <input
            id={id}
            type="file"
            accept={TIPE_GAMBAR_DITERIMA.join(",")}
            className="sr-only"
            disabled={memproses}
            onChange={(event) => {
              void pilih(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      ) : null}
    </div>
  );
}
