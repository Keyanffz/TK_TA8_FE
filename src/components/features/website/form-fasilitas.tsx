"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { TombolSimpanTab } from "@/components/features/website/tombol-simpan-tab";
import { UnggahGambarCms } from "@/components/features/website/unggah-gambar-cms";
import { EmptyState } from "@/components/shared/empty-state";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";
import { pesanErrorPengaturan, useSimpanPengaturan, type skemaLanding } from "@/lib/api/pengaturan-dashboard";

const MAKS_ITEM = 20;
const KUNCI = "landing.fasilitas";

const skema = z.object({
  item: z
    .array(
      z.object({
        nama: z.string().trim().min(1, "Nama fasilitas wajib diisi.").max(255, "Nama terlalu panjang."),
        deskripsi: z.string().trim().max(1000, "Deskripsi maksimal 1000 karakter."),
        gambar: z.object({ path: z.string().nullable(), url: z.string().nullable() }),
      }),
    )
    .max(MAKS_ITEM),
});

type NilaiFasilitas = z.infer<typeof skema>;
type Fasilitas = z.infer<typeof skemaLanding>["landing.fasilitas"];

/** Daftar fasilitas {nama, deskripsi, gambar} (B7); fasilitas tanpa foto diberi label di landing. */
export function FormFasilitas({ awal, onUbahKotor }: { awal: Fasilitas; onUbahKotor: (kotor: boolean) => void }) {
  const simpan = useSimpanPengaturan("landing");
  const form = useForm<NilaiFasilitas>({
    resolver: zodResolver(skema),
    defaultValues: { item: awal.map((item) => ({ nama: item.nama, deskripsi: item.deskripsi ?? "", gambar: { path: item.gambar, url: item.gambar_url } })) },
  });
  const daftar = useFieldArray({ control: form.control, name: "item" });
  const { errors, isDirty, isSubmitting } = form.formState;

  useEffect(() => onUbahKotor(isDirty), [isDirty, onUbahKotor]);

  const kirim = form.handleSubmit(async (nilai) => {
    try {
      await simpan.mutateAsync({
        [KUNCI]: nilai.item.map((item) => ({ nama: item.nama, deskripsi: item.deskripsi || null, gambar: item.gambar.path })),
      });
      form.reset(nilai);
      toast.success("Daftar fasilitas tersimpan dan halaman depan sudah diperbarui.");
    } catch (error) {
      const pesan = pesanErrorPengaturan(error, KUNCI);
      for (const [path, isi] of pesan) {
        const [indeks, field] = path.split(".");
        if (Number.isInteger(Number(indeks)) && (field === "nama" || field === "deskripsi")) {
          form.setError(`item.${Number(indeks)}.${field}`, { type: "server", message: isi });
        } else toast.error(isi);
      }
      if (pesan.length === 0) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
      {daftar.fields.length === 0 ? (
        <EmptyState judul="Belum ada fasilitas." deskripsi="Bagian fasilitas tidak tampil di halaman depan selama daftarnya kosong." />
      ) : null}
      <ol className="grid gap-4 lg:grid-cols-2">
        {daftar.fields.map((field, indeks) => (
          <li key={field.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading font-bold text-muted-foreground">Fasilitas {indeks + 1}</p>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label={`Naikkan fasilitas ${indeks + 1}`} disabled={indeks === 0} onClick={() => daftar.move(indeks, indeks - 1)}>
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Turunkan fasilitas ${indeks + 1}`}
                  disabled={indeks === daftar.fields.length - 1}
                  onClick={() => daftar.move(indeks, indeks + 1)}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Hapus fasilitas ${indeks + 1}`} onClick={() => daftar.remove(indeks)}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
            <KolomTeks label="Nama" placeholder="Taman bermain" error={errors.item?.[indeks]?.nama?.message} {...form.register(`item.${indeks}.nama`)} />
            <KolomArea label="Deskripsi (opsional)" rows={2} error={errors.item?.[indeks]?.deskripsi?.message} {...form.register(`item.${indeks}.deskripsi`)} />
            <Controller
              control={form.control}
              name={`item.${indeks}.gambar`}
              render={({ field: gambar }) => <UnggahGambarCms label="Foto (opsional)" nilai={gambar.value} onUbah={gambar.onChange} />}
            />
          </li>
        ))}
      </ol>
      {daftar.fields.length < MAKS_ITEM ? (
        <Button type="button" variant="outline" className="self-start" onClick={() => daftar.append({ nama: "", deskripsi: "", gambar: { path: null, url: null } })}>
          <Plus aria-hidden="true" />
          Tambah Fasilitas
        </Button>
      ) : null}
      <TombolSimpanTab kotor={isDirty} menyimpan={isSubmitting} label="Simpan Fasilitas" />
    </form>
  );
}
