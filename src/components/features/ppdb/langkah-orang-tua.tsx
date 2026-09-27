"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import type { MasukanPendaftaran, NilaiPendaftaran } from "@/components/features/ppdb/skema-pendaftaran";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { FieldGroup } from "@/components/ui/field";
import { OPSI_HUBUNGAN } from "@/lib/constants/label";

type FormPendaftaran = UseFormReturn<MasukanPendaftaran, unknown, NilaiPendaftaran>;

export function LangkahOrangTua({ form }: { form: FormPendaftaran }) {
  const { errors } = form.formState;

  return (
    <FieldGroup>
      <Controller
        control={form.control}
        name="hubungan"
        render={({ field }) => (
          <KolomRadio
            label="Yang mengisi formulir ini adalah"
            opsi={OPSI_HUBUNGAN}
            nilai={field.value}
            onUbah={field.onChange}
            error={errors.hubungan?.message}
          />
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <KolomTeks label="Nama ayah" autoComplete="off" error={errors.nama_ayah?.message} {...form.register("nama_ayah")} />
        <KolomTeks label="Pekerjaan ayah" autoComplete="off" error={errors.pekerjaan_ayah?.message} {...form.register("pekerjaan_ayah")} />
        <KolomTeks label="Nama ibu" autoComplete="off" error={errors.nama_ibu?.message} {...form.register("nama_ibu")} />
        <KolomTeks label="Pekerjaan ibu" autoComplete="off" error={errors.pekerjaan_ibu?.message} {...form.register("pekerjaan_ibu")} />
      </div>
      <p className="-mt-3 text-sm text-muted-foreground">Data ayah dan ibu boleh dikosongkan kalau tidak ada.</p>
      <KolomTeks
        label="Nomor HP (WhatsApp)"
        type="tel"
        autoComplete="tel"
        inputMode="numeric"
        placeholder="08xxxxxxxxxx"
        deskripsi="Sekolah menghubungi nomor ini tentang pendaftaran."
        error={errors.no_hp?.message}
        {...form.register("no_hp")}
      />
      <KolomArea label="Alamat rumah" autoComplete="street-address" rows={3} error={errors.alamat?.message} {...form.register("alamat")} />
    </FieldGroup>
  );
}
