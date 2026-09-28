"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { TombolSimpanTab } from "@/components/features/website/tombol-simpan-tab";
import { UnggahGambarCms } from "@/components/features/website/unggah-gambar-cms";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { FieldGroup } from "@/components/ui/field";
import { pesanError } from "@/lib/api/errors";
import { pesanErrorPengaturan, useSimpanPengaturan, type skemaLanding } from "@/lib/api/pengaturan-dashboard";

const skema = z.object({
  judul: z.string().trim().min(1, "Judul wajib diisi.").max(255, "Judul terlalu panjang."),
  subjudul: z.string().trim().max(500, "Subjudul maksimal 500 karakter."),
  cta_teks: z.string().trim().max(50, "Teks tombol maksimal 50 karakter."),
  gambar: z.object({ path: z.string().nullable(), url: z.string().nullable() }),
});

type NilaiHero = z.infer<typeof skema>;
type Hero = z.infer<typeof skemaLanding>["landing.hero"];

/** Bagian paling atas landing (`landing.hero`). */
export function FormHero({ hero, onUbahKotor }: { hero: Hero; onUbahKotor: (kotor: boolean) => void }) {
  const simpan = useSimpanPengaturan("landing");
  const form = useForm<NilaiHero>({
    resolver: zodResolver(skema),
    defaultValues: { judul: hero.judul ?? "", subjudul: hero.subjudul ?? "", cta_teks: hero.cta_teks ?? "", gambar: { path: hero.gambar, url: hero.gambar_url } },
  });
  const { errors, isDirty, isSubmitting } = form.formState;

  useEffect(() => onUbahKotor(isDirty), [isDirty, onUbahKotor]);

  const kirim = form.handleSubmit(async (nilai) => {
    try {
      await simpan.mutateAsync({
        "landing.hero": { judul: nilai.judul, subjudul: nilai.subjudul || null, cta_teks: nilai.cta_teks || null, gambar: nilai.gambar.path },
      });
      form.reset(nilai);
      toast.success("Bagian pembuka tersimpan dan halaman depan sudah diperbarui.");
    } catch (error) {
      const pesan = pesanErrorPengaturan(error, "landing.hero");
      for (const [field, isi] of pesan) {
        if (field === "judul" || field === "subjudul" || field === "cta_teks") form.setError(field, { type: "server", message: isi });
        else toast.error(isi);
      }
      if (pesan.length === 0) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-5">
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <FieldGroup>
          <KolomTeks label="Judul" error={errors.judul?.message} {...form.register("judul")} />
          <KolomArea label="Subjudul (opsional)" rows={2} error={errors.subjudul?.message} {...form.register("subjudul")} />
          <KolomTeks
            label="Teks tombol (opsional)"
            placeholder="Lihat Info PPDB"
            deskripsi="Tombol ini membuka halaman info PPDB."
            error={errors.cta_teks?.message}
            {...form.register("cta_teks")}
          />
          <Controller
            control={form.control}
            name="gambar"
            render={({ field }) => (
              <UnggahGambarCms
                label="Foto utama (opsional)"
                deskripsi="Foto suasana sekolah, dipotong berbentuk perisai logo. Tanpa foto, logo sekolah yang tampil."
                nilai={field.value}
                onUbah={field.onChange}
              />
            )}
          />
        </FieldGroup>
      </section>
      <TombolSimpanTab kotor={isDirty} menyimpan={isSubmitting} label="Simpan Bagian Pembuka" />
    </form>
  );
}
