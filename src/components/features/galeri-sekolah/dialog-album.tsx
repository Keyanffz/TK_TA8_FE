"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useSimpanAlbum } from "@/lib/api/galeri";
import { hariIniJakarta } from "@/lib/tanggal";
import type { GaleriAlbum } from "@/types/domain";

const skema = z.object({
  judul: z.string().trim().min(1, "Judul album wajib diisi.").max(255, "Judul terlalu panjang."),
  tanggal: z.string().min(1, "Tanggal wajib diisi."),
  deskripsi: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter."),
  is_publik: z.boolean(),
  cover: z.array(z.custom<File>((nilai) => nilai instanceof File)).max(1),
});

type NilaiAlbum = z.infer<typeof skema>;

function nilaiAwal(album: GaleriAlbum | null): NilaiAlbum {
  return { judul: album?.judul ?? "", tanggal: album?.tanggal ?? hariIniJakarta(), deskripsi: album?.deskripsi ?? "", is_publik: album?.is_publik ?? false, cover: [] };
}

/** Tambah atau ubah album galeri. Album baru tersembunyi dulu supaya foto bisa dilengkapi sebelum tampil. */
export function DialogAlbum({ album, pemicu }: { album: GaleriAlbum | null; pemicu: ReactNode }) {
  const router = useRouter();
  const [terbuka, setTerbuka] = useState(false);
  const simpan = useSimpanAlbum(album?.id ?? null);
  const form = useForm<NilaiAlbum>({ resolver: zodResolver(skema), defaultValues: nilaiAwal(album) });
  const { errors, isSubmitting } = form.formState;

  const kirim = form.handleSubmit(async ({ cover, deskripsi, ...nilai }) => {
    try {
      const { data, message } = await simpan.mutateAsync({ ...nilai, deskripsi, cover: cover[0] ?? null });
      toast.success(message);
      setTerbuka(false);
      if (!album) router.push(`/mudarris/website/galeri/${data.id}`);
    } catch (error) {
      if (!terapkanErrorValidasi(error, form.setError, ["judul", "tanggal", "deskripsi", "is_publik", "cover"])) toast.error(pesanError(error));
    }
  });

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) form.reset(nilaiAwal(album));
      }}
    >
      <DialogTrigger asChild>{pemicu}</DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{album ? "Ubah album" : "Tambah album"}</DialogTitle>
          <DialogDescription>Foto galeri bisa dilihat siapa saja di website setelah album ditampilkan.</DialogDescription>
        </DialogHeader>
        <form id="form-album" noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <KolomTeks label="Judul" placeholder="Pentas seni akhir tahun" error={errors.judul?.message} {...form.register("judul")} />
            <KolomTeks label="Tanggal kegiatan" type="date" error={errors.tanggal?.message} {...form.register("tanggal")} />
            <KolomArea label="Deskripsi (opsional)" rows={3} error={errors.deskripsi?.message} {...form.register("deskripsi")} />
            <Controller
              control={form.control}
              name="cover"
              render={({ field }) => (
                <ZonaUnggah
                  label={album?.cover_url ? "Ganti sampul (opsional)" : "Sampul (opsional)"}
                  deskripsi="Tanpa sampul, foto pertama album yang dipakai."
                  nilai={field.value}
                  onUbah={field.onChange}
                  error={errors.cover?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="is_publik"
              render={({ field }) => (
                <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <FieldLabel htmlFor="album-publik">Tampilkan di website</FieldLabel>
                    <FieldDescription>Matikan selama foto belum lengkap.</FieldDescription>
                  </div>
                  <Switch id="album-publik" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" form="form-album" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Album"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
