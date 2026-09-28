"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { TombolSimpanTab } from "@/components/features/website/tombol-simpan-tab";
import { UnggahGambarCms } from "@/components/features/website/unggah-gambar-cms";
import { EditorTeks } from "@/components/shared/editor-teks";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { pesanError } from "@/lib/api/errors";
import { pesanErrorPengaturan, skemaProfilSekolah, usePengaturan, useSimpanPengaturan } from "@/lib/api/pengaturan-dashboard";
import { teksDariHtml } from "@/lib/html";

const MAKS_MISI = 20;

const skema = z.object({
  nama_sekolah: z.string().trim().min(1, "Nama sekolah wajib diisi.").max(255, "Nama terlalu panjang."),
  npsn: z.string().trim().regex(/^(\d{8})?$/, "NPSN berisi 8 angka. Boleh dikosongkan."),
  alamat: z.string().trim().max(500, "Alamat maksimal 500 karakter."),
  telepon: z.string().trim().max(30, "Nomor telepon maksimal 30 karakter."),
  email: z.union([z.literal(""), z.email("Format email tidak valid.")]),
  maps_embed_url: z
    .string()
    .trim()
    .refine((nilai) => nilai === "" || /^https:\/\/(www\.google\.com|maps\.google\.com)\//.test(nilai), "Tempel alamat peta dari Google Maps (diawali https://www.google.com/maps/embed)."),
  logo: z.object({ path: z.string().nullable(), url: z.string().nullable() }),
  visi: z.string().trim().max(1000, "Visi maksimal 1000 karakter."),
  misi: z.array(z.object({ teks: z.string().trim().min(1, "Isi misi atau hapus barisnya.").max(500, "Misi maksimal 500 karakter.") })).max(MAKS_MISI),
  sejarah: z.string(),
  sambutan_kepsek: z.string(),
});

type NilaiProfil = z.infer<typeof skema>;
type DataProfil = z.infer<typeof skemaProfilSekolah>;

function nilaiAwal(data: DataProfil): NilaiProfil {
  return {
    nama_sekolah: data["profil.nama_sekolah"],
    npsn: data["profil.npsn"] ?? "",
    alamat: data["profil.alamat"] ?? "",
    telepon: data["profil.telepon"] ?? "",
    email: data["profil.email"] ?? "",
    maps_embed_url: data["profil.maps_embed_url"] ?? "",
    logo: { path: data["profil.logo"], url: data["profil.logo_url"] },
    visi: data["profil.visi"] ?? "",
    misi: data["profil.misi"].map((teks) => ({ teks })),
    sejarah: data["profil.sejarah"] ?? "",
    sambutan_kepsek: data["profil.sambutan_kepsek"] ?? "",
  };
}

const KUNCI_FIELD = [
  ["profil.nama_sekolah", "nama_sekolah"],
  ["profil.npsn", "npsn"],
  ["profil.alamat", "alamat"],
  ["profil.telepon", "telepon"],
  ["profil.email", "email"],
  ["profil.maps_embed_url", "maps_embed_url"],
  ["profil.visi", "visi"],
  ["profil.sejarah", "sejarah"],
  ["profil.sambutan_kepsek", "sambutan_kepsek"],
] as const;

function FormIsi({ data, onUbahKotor }: { data: DataProfil; onUbahKotor: (kotor: boolean) => void }) {
  const simpan = useSimpanPengaturan("profil");
  const form = useForm<NilaiProfil>({ resolver: zodResolver(skema), defaultValues: nilaiAwal(data) });
  const misi = useFieldArray({ control: form.control, name: "misi" });
  const { errors, isDirty, isSubmitting } = form.formState;

  useEffect(() => onUbahKotor(isDirty), [isDirty, onUbahKotor]);

  const kirim = form.handleSubmit(async (nilai) => {
    const html = (isi: string) => (teksDariHtml(isi) === "" ? null : isi);
    try {
      await simpan.mutateAsync({
        "profil.nama_sekolah": nilai.nama_sekolah,
        "profil.npsn": nilai.npsn || null,
        "profil.alamat": nilai.alamat || null,
        "profil.telepon": nilai.telepon || null,
        "profil.email": nilai.email || null,
        "profil.maps_embed_url": nilai.maps_embed_url || null,
        "profil.logo": nilai.logo.path,
        "profil.visi": nilai.visi || null,
        "profil.misi": nilai.misi.map((item) => item.teks),
        "profil.sejarah": html(nilai.sejarah),
        "profil.sambutan_kepsek": html(nilai.sambutan_kepsek),
      });
      form.reset(nilai);
      toast.success("Profil sekolah tersimpan dan halaman depan sudah diperbarui.");
    } catch (error) {
      let terpasang = false;
      for (const [kunci, field] of KUNCI_FIELD) {
        const pesan = pesanErrorPengaturan(error, kunci)[0]?.[1];
        if (pesan) {
          form.setError(field, { type: "server", message: pesan });
          terpasang = true;
        }
      }
      for (const [sisa, pesan] of pesanErrorPengaturan(error, "profil.misi")) {
        const indeks = Number(sisa);
        if (Number.isInteger(indeks) && sisa !== "") form.setError(`misi.${indeks}.teks`, { type: "server", message: pesan });
        terpasang = true;
      }
      const pesanLogo = pesanErrorPengaturan(error, "profil.logo")[0]?.[1];
      if (pesanLogo) toast.error(pesanLogo);
      if (!terpasang && !pesanLogo) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-5">
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-extrabold">Identitas dan kontak</h2>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <KolomTeks label="Nama sekolah" error={errors.nama_sekolah?.message} {...form.register("nama_sekolah")} />
            <KolomTeks label="NPSN (opsional)" inputMode="numeric" maxLength={8} error={errors.npsn?.message} {...form.register("npsn")} />
            <KolomTeks label="Telepon (opsional)" type="tel" error={errors.telepon?.message} {...form.register("telepon")} />
            <KolomTeks label="Email (opsional)" type="email" error={errors.email?.message} {...form.register("email")} />
          </div>
          <KolomArea label="Alamat (opsional)" rows={2} error={errors.alamat?.message} {...form.register("alamat")} />
          <KolomTeks
            label="Alamat peta Google Maps (opsional)"
            placeholder="https://www.google.com/maps/embed?pb=..."
            deskripsi="Di Google Maps: Bagikan → Sematkan peta → salin alamat di dalam src=&quot;...&quot;."
            error={errors.maps_embed_url?.message}
            {...form.register("maps_embed_url")}
          />
          <Controller
            control={form.control}
            name="logo"
            render={({ field }) => (
              <UnggahGambarCms label="Logo sekolah" rasio="persegi" deskripsi="Tampil di navbar, footer, dan kop dashboard. Latar transparan paling bagus." nilai={field.value} onUbah={field.onChange} />
            )}
          />
        </FieldGroup>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-extrabold">Visi dan misi</h2>
        <FieldGroup>
          <KolomArea label="Visi" rows={3} error={errors.visi?.message} {...form.register("visi")} />
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold">Misi</legend>
            {misi.fields.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada misi.</p> : null}
            <ol className="flex flex-col gap-2">
              {misi.fields.map((field, indeks) => (
                <li key={field.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="w-6 shrink-0 text-right font-heading font-bold text-muted-foreground tabular-nums">{indeks + 1}.</span>
                    <Input aria-label={`Misi ${indeks + 1}`} aria-invalid={errors.misi?.[indeks]?.teks ? true : undefined} {...form.register(`misi.${indeks}.teks`)} />
                    <Button type="button" variant="ghost" size="icon" aria-label={`Naikkan misi ${indeks + 1}`} disabled={indeks === 0} onClick={() => misi.move(indeks, indeks - 1)}>
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Turunkan misi ${indeks + 1}`}
                      disabled={indeks === misi.fields.length - 1}
                      onClick={() => misi.move(indeks, indeks + 1)}
                    >
                      <ArrowDown aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Hapus misi ${indeks + 1}`} onClick={() => misi.remove(indeks)}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                  {errors.misi?.[indeks]?.teks ? <p className="pl-7 text-sm text-destructive">{errors.misi[indeks]?.teks?.message}</p> : null}
                </li>
              ))}
            </ol>
            {misi.fields.length < MAKS_MISI ? (
              <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => misi.append({ teks: "" })}>
                <Plus aria-hidden="true" />
                Tambah Misi
              </Button>
            ) : null}
          </fieldset>
        </FieldGroup>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-extrabold">Sejarah dan sambutan</h2>
        <FieldGroup>
          <Controller
            control={form.control}
            name="sambutan_kepsek"
            render={({ field }) => (
              <EditorTeks
                label="Sambutan Kepala Sekolah"
                deskripsi="Tampil di samping foto Kepala Sekolah di halaman depan."
                nilai={field.value}
                onUbah={field.onChange}
                error={errors.sambutan_kepsek?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="sejarah"
            render={({ field }) => <EditorTeks label="Sejarah sekolah" nilai={field.value} onUbah={field.onChange} error={errors.sejarah?.message} />}
          />
        </FieldGroup>
      </section>
      <TombolSimpanTab kotor={isDirty} menyimpan={isSubmitting} label="Simpan Profil Sekolah" />
    </form>
  );
}

export function FormProfilSekolah({ onUbahKotor }: { onUbahKotor: (kotor: boolean) => void }) {
  const { data, isPending, isError, error, refetch } = usePengaturan("profil", (mentah) => skemaProfilSekolah.parse(mentah));
  if (isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  return <FormIsi data={data} onUbahKotor={onUbahKotor} />;
}
