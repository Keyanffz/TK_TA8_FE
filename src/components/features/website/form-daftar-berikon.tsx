"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PilihIkon } from "@/components/features/website/pilih-ikon";
import { TombolSimpanTab } from "@/components/features/website/tombol-simpan-tab";
import { EmptyState } from "@/components/shared/empty-state";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";
import { pesanErrorPengaturan, useSimpanPengaturan } from "@/lib/api/pengaturan-dashboard";
import { IKON_CMS } from "@/lib/constants/ikon-cms";

const MAKS_ITEM = 20;

const skema = z.object({
  item: z
    .array(
      z.object({
        judul: z.string().trim().min(1, "Judul wajib diisi.").max(255, "Judul terlalu panjang."),
        deskripsi: z.string().trim().max(1000, "Deskripsi maksimal 1000 karakter."),
        ikon: z.string().refine((nilai) => nilai in IKON_CMS, "Pilih ikon."),
      }),
    )
    .max(MAKS_ITEM),
});

type NilaiDaftar = z.infer<typeof skema>;
type ItemBerikon = { judul: string; deskripsi: string | null; ikon: string | null };

type FormDaftarBerikonProps = {
  kunci: "landing.program" | "landing.keunggulan";
  /** "program" atau "keunggulan", untuk label dan pesan. */
  nama: string;
  awal: ItemBerikon[];
  onUbahKotor: (kotor: boolean) => void;
};

/** Daftar {judul, deskripsi, ikon} untuk tab Program dan Keunggulan (B7). */
export function FormDaftarBerikon({ kunci, nama, awal, onUbahKotor }: FormDaftarBerikonProps) {
  const simpan = useSimpanPengaturan("landing");
  const form = useForm<NilaiDaftar>({
    resolver: zodResolver(skema),
    defaultValues: { item: awal.map((item) => ({ judul: item.judul, deskripsi: item.deskripsi ?? "", ikon: item.ikon ?? "" })) },
  });
  const daftar = useFieldArray({ control: form.control, name: "item" });
  const { errors, isDirty, isSubmitting } = form.formState;
  const Nama = nama.charAt(0).toUpperCase() + nama.slice(1);

  useEffect(() => onUbahKotor(isDirty), [isDirty, onUbahKotor]);

  const kirim = form.handleSubmit(async (nilai) => {
    try {
      await simpan.mutateAsync({ [kunci]: nilai.item.map((item) => ({ ...item, deskripsi: item.deskripsi || null })) });
      form.reset(nilai);
      toast.success(`Daftar ${nama} tersimpan dan halaman depan sudah diperbarui.`);
    } catch (error) {
      const pesan = pesanErrorPengaturan(error, kunci);
      for (const [path, isi] of pesan) {
        const [indeks, field] = path.split(".");
        if (Number.isInteger(Number(indeks)) && (field === "judul" || field === "deskripsi" || field === "ikon")) {
          form.setError(`item.${Number(indeks)}.${field}`, { type: "server", message: isi });
        } else toast.error(isi);
      }
      if (pesan.length === 0) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
      {daftar.fields.length === 0 ? (
        <EmptyState judul={`Belum ada ${nama}.`} deskripsi={`Bagian ${nama} tidak tampil di halaman depan selama daftarnya kosong.`} />
      ) : null}
      <ol className="flex flex-col gap-4">
        {daftar.fields.map((field, indeks) => (
          <li key={field.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading font-bold text-muted-foreground">
                {Nama} {indeks + 1}
              </p>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label={`Naikkan ${nama} ${indeks + 1}`} disabled={indeks === 0} onClick={() => daftar.move(indeks, indeks - 1)}>
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Turunkan ${nama} ${indeks + 1}`}
                  disabled={indeks === daftar.fields.length - 1}
                  onClick={() => daftar.move(indeks, indeks + 1)}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Hapus ${nama} ${indeks + 1}`} onClick={() => daftar.remove(indeks)}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
            <KolomTeks label="Judul" error={errors.item?.[indeks]?.judul?.message} {...form.register(`item.${indeks}.judul`)} />
            <KolomArea label="Deskripsi (opsional)" rows={2} error={errors.item?.[indeks]?.deskripsi?.message} {...form.register(`item.${indeks}.deskripsi`)} />
            <Controller
              control={form.control}
              name={`item.${indeks}.ikon`}
              render={({ field: ikon }) => <PilihIkon label="Ikon" nilai={ikon.value} onUbah={ikon.onChange} error={errors.item?.[indeks]?.ikon?.message} />}
            />
          </li>
        ))}
      </ol>
      {daftar.fields.length < MAKS_ITEM ? (
        <Button type="button" variant="outline" className="self-start" onClick={() => daftar.append({ judul: "", deskripsi: "", ikon: "" })}>
          <Plus aria-hidden="true" />
          Tambah {Nama}
        </Button>
      ) : null}
      <TombolSimpanTab kotor={isDirty} menyimpan={isSubmitting} label={`Simpan ${Nama}`} />
    </form>
  );
}
