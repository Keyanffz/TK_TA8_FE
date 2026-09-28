"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { TombolSimpanTab } from "@/components/features/website/tombol-simpan-tab";
import { EditorTeks } from "@/components/shared/editor-teks";
import { KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { pesanError } from "@/lib/api/errors";
import { pesanErrorPengaturan, useSimpanPengaturan, type skemaPpdb } from "@/lib/api/pengaturan-dashboard";
import { useDaftarTahunAjaran } from "@/lib/api/tahun-ajaran";
import { teksDariHtml } from "@/lib/html";

const skema = z
  .object({
    dibuka: z.boolean(),
    tahun_ajaran_id: z.string(),
    tanggal_buka: z.string(),
    tanggal_tutup: z.string(),
    kuota: z.coerce.number<string>().int("Isi dengan angka bulat.").min(0, "Kuota 0 sampai 1000.").max(1000, "Kuota 0 sampai 1000."),
    info: z.string(),
  })
  .refine((nilai) => !nilai.dibuka || nilai.tahun_ajaran_id !== "", { path: ["tahun_ajaran_id"], message: "Pilih tahun ajaran tujuan sebelum membuka PPDB." })
  .refine((nilai) => !nilai.tanggal_buka || !nilai.tanggal_tutup || nilai.tanggal_tutup >= nilai.tanggal_buka, {
    path: ["tanggal_tutup"],
    message: "Tanggal tutup tidak boleh sebelum tanggal buka.",
  });

type Masukan = z.input<typeof skema>;
type Keluaran = z.output<typeof skema>;
type DataPpdb = z.infer<typeof skemaPpdb>;

const FIELD = [
  ["ppdb.dibuka", "dibuka"],
  ["ppdb.tahun_ajaran_id", "tahun_ajaran_id"],
  ["ppdb.tanggal_buka", "tanggal_buka"],
  ["ppdb.tanggal_tutup", "tanggal_tutup"],
  ["ppdb.kuota", "kuota"],
  ["ppdb.info", "info"],
] as const;

function keMasukan(data: DataPpdb): Masukan {
  return {
    dibuka: data["ppdb.dibuka"],
    tahun_ajaran_id: data["ppdb.tahun_ajaran_id"] ? String(data["ppdb.tahun_ajaran_id"]) : "",
    tanggal_buka: data["ppdb.tanggal_buka"] ?? "",
    tanggal_tutup: data["ppdb.tanggal_tutup"] ?? "",
    kuota: String(data["ppdb.kuota"]),
    info: data["ppdb.info"] ?? "",
  };
}

/** Buka/tutup PPDB, tahun ajaran tujuan, jadwal, kuota, dan info syarat yang tampil di halaman PPDB website. */
export function FormPpdb({ data, onUbahKotor }: { data: DataPpdb; onUbahKotor: (kotor: boolean) => void }) {
  const simpan = useSimpanPengaturan("ppdb");
  const tahunAjaran = useDaftarTahunAjaran();
  const form = useForm<Masukan, unknown, Keluaran>({ resolver: zodResolver(skema), defaultValues: keMasukan(data) });
  const { errors, isDirty, isSubmitting } = form.formState;

  useEffect(() => onUbahKotor(isDirty), [isDirty, onUbahKotor]);

  const kirim = form.handleSubmit(async (nilai) => {
    try {
      await simpan.mutateAsync({
        "ppdb.dibuka": nilai.dibuka,
        "ppdb.tahun_ajaran_id": nilai.tahun_ajaran_id ? Number(nilai.tahun_ajaran_id) : null,
        "ppdb.tanggal_buka": nilai.tanggal_buka || null,
        "ppdb.tanggal_tutup": nilai.tanggal_tutup || null,
        "ppdb.kuota": nilai.kuota,
        "ppdb.info": teksDariHtml(nilai.info) === "" ? null : nilai.info,
      });
      form.reset({ ...nilai, kuota: String(nilai.kuota) });
      toast.success(nilai.dibuka ? "Pengaturan PPDB tersimpan. Pendaftaran dibuka di website." : "Pengaturan PPDB tersimpan. Pendaftaran ditutup.");
    } catch (error) {
      let terpasang = false;
      for (const [kunci, field] of FIELD) {
        const pesan = pesanErrorPengaturan(error, kunci)[0]?.[1];
        if (pesan) {
          form.setError(field, { type: "server", message: pesan });
          terpasang = true;
        }
      }
      if (!terpasang) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <FieldGroup>
          <Controller
            control={form.control}
            name="dibuka"
            render={({ field }) => (
              <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg bg-primary-soft p-3">
                <div>
                  <FieldLabel htmlFor="ppdb-dibuka">Buka pendaftaran</FieldLabel>
                  <FieldDescription>Orang tua bisa mendaftar dari website dan wali dari dashboard selama kuota masih ada.</FieldDescription>
                </div>
                <Switch id="ppdb-dibuka" checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )}
          />
          {errors.dibuka?.message ? <p className="text-sm text-destructive">{errors.dibuka.message}</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <KolomPilih
              label="Tahun ajaran tujuan"
              deskripsi="Biasanya tahun ajaran berikutnya, bukan yang sedang berjalan."
              error={errors.tahun_ajaran_id?.message}
              {...form.register("tahun_ajaran_id")}
            >
              <option value="">Pilih tahun ajaran</option>
              {(tahunAjaran.data ?? []).map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama}
                  {ta.is_aktif ? " (sedang berjalan)" : ""}
                </option>
              ))}
            </KolomPilih>
            <KolomTeks label="Kuota" type="number" min={0} max={1000} inputMode="numeric" error={errors.kuota?.message} {...form.register("kuota")} />
            <KolomTeks label="Tanggal buka (opsional)" type="date" error={errors.tanggal_buka?.message} {...form.register("tanggal_buka")} />
            <KolomTeks label="Tanggal tutup (opsional)" type="date" error={errors.tanggal_tutup?.message} {...form.register("tanggal_tutup")} />
          </div>
          <Controller
            control={form.control}
            name="info"
            render={({ field }) => (
              <EditorTeks
                label="Info PPDB"
                deskripsi="Syarat, biaya, dan alur pendaftaran. Tampil di halaman PPDB website."
                nilai={field.value}
                onUbah={field.onChange}
                error={errors.info?.message}
              />
            )}
          />
        </FieldGroup>
      </section>
      <TombolSimpanTab kotor={isDirty} menyimpan={isSubmitting} label="Simpan Pengaturan PPDB" />
    </form>
  );
}
