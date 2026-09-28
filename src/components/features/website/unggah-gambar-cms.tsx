"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useId } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { pesanError } from "@/lib/api/errors";
import { useUnggahGambarPengaturan } from "@/lib/api/pengaturan-dashboard";
import { kompresGambar, TIPE_GAMBAR_DITERIMA, tipeGambarDiterima } from "@/lib/gambar";
import { cn } from "@/lib/utils";

export type GambarCms = { path: string | null; url: string | null };

type UnggahGambarCmsProps = {
  label: string;
  nilai: GambarCms;
  onUbah: (nilai: GambarCms) => void;
  deskripsi?: string;
  error?: string;
  /** Rasio kotak pratinjau, mengikuti tempat gambar tampil di landing. */
  rasio?: "persegi" | "lebar";
};

/**
 * Gambar CMS langsung diunggah saat dipilih (`POST /pengaturan/upload`) dan path-nya disimpan di form;
 * pengaturan baru berubah setelah tombol simpan tab ditekan.
 */
export function UnggahGambarCms({ label, nilai, onUbah, deskripsi, error, rasio = "lebar" }: UnggahGambarCmsProps) {
  const id = useId();
  const unggah = useUnggahGambarPengaturan();

  const pilih = async (file: File | undefined) => {
    if (!file) return;
    if (!tipeGambarDiterima(file)) {
      toast.error("Pilih gambar berformat JPG, PNG, atau WebP.");
      return;
    }
    try {
      const hasil = await unggah.mutateAsync(await kompresGambar(file));
      onUbah({ path: hasil.path, url: hasil.url });
    } catch (galat) {
      toast.error(pesanError(galat));
    }
  };

  return (
    <Field data-invalid={error ? true : undefined}>
      <p className="text-sm font-bold">{label}</p>
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted", rasio === "persegi" ? "size-24" : "aspect-[16/10] w-40")}>
          {nilai.url ? (
            <Image src={nilai.url} alt={`Pratinjau ${label.toLowerCase()}`} fill unoptimized className={rasio === "persegi" ? "object-contain p-1" : "object-cover"} />
          ) : (
            <span className="px-2 text-center text-xs text-muted-foreground">Belum ada gambar</span>
          )}
        </span>
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={id}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 font-heading text-sm font-bold text-primary-strong hover:bg-primary-soft has-focus-visible:ring-2 has-focus-visible:ring-ring"
          >
            <ImagePlus aria-hidden="true" className="size-4" />
            {unggah.isPending ? "Mengunggah..." : nilai.url ? "Ganti gambar" : "Pilih gambar"}
            <input
              id={id}
              type="file"
              accept={TIPE_GAMBAR_DITERIMA.join(",")}
              className="sr-only"
              disabled={unggah.isPending}
              onChange={(event) => {
                void pilih(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          {nilai.path ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onUbah({ path: null, url: null })}>
              <X aria-hidden="true" />
              Hapus gambar
            </Button>
          ) : null}
        </div>
      </div>
      {deskripsi ? <FieldDescription>{deskripsi}</FieldDescription> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
