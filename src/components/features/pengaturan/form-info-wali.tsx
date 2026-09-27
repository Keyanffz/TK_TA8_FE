"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { InfoSekolah } from "@/components/features/beranda/wali/info-sekolah";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ApiError, pesanError } from "@/lib/api/errors";
import { skemaInfoWali, usePengaturan, useSimpanPengaturan, type InfoWali } from "@/lib/api/pengaturan-dashboard";

const KUNCI = "beranda.info_wali";
const MAKS_JUDUL = 100;
const MAKS_ISI = 1000;
const OPSI_NADA = [
  { nilai: "info", label: "Info", keterangan: "Kabar biasa, misalnya jadwal kegiatan." },
  { nilai: "penting", label: "Penting", keterangan: "Perlu diperhatikan, misalnya rapat wali murid." },
  { nilai: "peringatan", label: "Peringatan", keterangan: "Mendesak, misalnya sekolah libur mendadak." },
] as const;

const skemaForm = z
  .object({
    aktif: z.boolean(),
    judul: z.string().trim().max(MAKS_JUDUL, `Judul maksimal ${MAKS_JUDUL} karakter.`),
    isi: z.string().trim().max(MAKS_ISI, `Isi maksimal ${MAKS_ISI} karakter.`),
    nada: z.enum(["info", "penting", "peringatan"]),
    berlaku_sampai: z.string(),
  })
  .refine((nilai) => !nilai.aktif || nilai.judul !== "", { path: ["judul"], message: "Judul wajib diisi kalau banner ditampilkan." })
  .refine((nilai) => !nilai.aktif || nilai.isi !== "", { path: ["isi"], message: "Isi wajib diisi kalau banner ditampilkan." });

type NilaiForm = z.infer<typeof skemaForm>;
const FIELD = ["aktif", "judul", "isi", "nada", "berlaku_sampai"] as const;

function bacaInfoWali(data: Record<string, unknown>): InfoWali {
  const hasil = skemaInfoWali.safeParse(data[KUNCI]);
  return hasil.success ? hasil.data : { aktif: false, judul: null, isi: null, nada: "info", berlaku_sampai: null };
}

function FormIsi({ awal }: { awal: InfoWali }) {
  const simpan = useSimpanPengaturan("beranda");
  const form = useForm<NilaiForm>({
    resolver: zodResolver(skemaForm),
    defaultValues: { aktif: awal.aktif, judul: awal.judul ?? "", isi: awal.isi ?? "", nada: awal.nada, berlaku_sampai: awal.berlaku_sampai ?? "" },
  });
  const { errors, isDirty } = form.formState;
  const pratinjau = useWatch({ control: form.control });

  const kirim = form.handleSubmit((nilai) =>
    simpan.mutate(
      { [KUNCI]: { ...nilai, judul: nilai.judul || null, isi: nilai.isi || null, berlaku_sampai: nilai.berlaku_sampai || null } },
      {
        onSuccess: () => {
          form.reset(nilai);
          toast.success(nilai.aktif ? "Banner tampil di beranda wali." : "Banner disembunyikan dari beranda wali.");
        },
        onError: (error) => {
          // Pesan validasi backend berkunci "items.beranda.info_wali.<field>".
          const errors = error instanceof ApiError ? error.errors : null;
          const terpasang = FIELD.filter((field) => {
            const pesan = Object.entries(errors ?? {}).find(([kunci]) => kunci.endsWith(`info_wali.${field}`))?.[1][0];
            if (pesan) form.setError(field, { type: "server", message: pesan });
            return Boolean(pesan);
          });
          if (terpasang.length === 0) toast.error(pesanError(error));
        },
      },
    ),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
      <form noValidate onSubmit={(event) => void kirim(event)} className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <FieldGroup>
          <Controller
            control={form.control}
            name="aktif"
            render={({ field }) => (
              <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg bg-primary-soft p-3">
                <div>
                  <FieldLabel htmlFor="info-wali-aktif">Tampilkan banner</FieldLabel>
                  <FieldDescription>Muncul di bagian atas beranda semua wali murid.</FieldDescription>
                </div>
                <Switch id="info-wali-aktif" checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="nada"
            render={({ field }) => <KolomRadio label="Jenis" opsi={OPSI_NADA} nilai={field.value} onUbah={field.onChange} error={errors.nada?.message} />}
          />
          <KolomTeks label="Judul" maxLength={MAKS_JUDUL} error={errors.judul?.message} {...form.register("judul")} />
          <KolomArea
            label="Isi"
            rows={5}
            maxLength={MAKS_ISI}
            deskripsi={`Teks biasa, baris baru dipertahankan. ${pratinjau.isi?.length ?? 0}/${MAKS_ISI} karakter.`}
            error={errors.isi?.message}
            {...form.register("isi")}
          />
          <KolomTeks
            label="Tampil sampai (opsional)"
            type="date"
            deskripsi="Banner hilang otomatis setelah tanggal ini. Kosongkan kalau tidak dibatasi."
            error={errors.berlaku_sampai?.message}
            {...form.register("berlaku_sampai")}
          />
          <Button type="submit" disabled={!isDirty || simpan.isPending} className="self-start">
            {simpan.isPending ? "Menyimpan..." : "Simpan Banner"}
          </Button>
        </FieldGroup>
      </form>
      <div className="flex flex-col gap-3 lg:sticky lg:top-24">
        <p className="font-heading text-sm font-bold text-muted-foreground">Pratinjau di beranda wali</p>
        {pratinjau.aktif && pratinjau.judul && pratinjau.isi && pratinjau.nada ? (
          <InfoSekolah judul={pratinjau.judul} isi={pratinjau.isi} nada={pratinjau.nada} berlakuSampai={pratinjau.berlaku_sampai || null} />
        ) : (
          <p className="rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground">
            {pratinjau.aktif ? "Isi judul dan isi untuk melihat pratinjau." : "Banner tidak ditampilkan ke wali."}
          </p>
        )}
      </div>
    </div>
  );
}

/** Banner info sekolah di beranda wali (`beranda.info_wali`, A4). */
export function FormInfoWali() {
  const { data, isPending, isError, error, refetch } = usePengaturan("beranda", bacaInfoWali);

  if (isPending) return <Skeleton className="h-80 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  return <FormIsi awal={data} />;
}
