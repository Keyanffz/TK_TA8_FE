"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { MAKS_DOKUMEN_LAINNYA, type MasukanPendaftaran, type NilaiPendaftaran } from "@/components/features/ppdb/skema-pendaftaran";
import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { FieldGroup } from "@/components/ui/field";

type FormPendaftaran = UseFormReturn<MasukanPendaftaran, unknown, NilaiPendaftaran>;

const DOKUMEN_WAJIB = [
  { nama: "akta_kelahiran", label: "Akta kelahiran", terimaPdf: true },
  { nama: "kartu_keluarga", label: "Kartu Keluarga", terimaPdf: true },
  { nama: "pas_foto", label: "Pas foto anak", terimaPdf: false },
] as const;

export function LangkahDokumen({ form }: { form: FormPendaftaran }) {
  const { errors } = form.formState;

  return (
    <FieldGroup>
      <p className="text-sm text-muted-foreground">
        Foto dokumen dari HP boleh, asal tulisannya terbaca. Akta dan Kartu Keluarga boleh berupa foto atau PDF, maksimal 5 MB
        per file.
      </p>
      {DOKUMEN_WAJIB.map((dokumen) => (
        <Controller
          key={dokumen.nama}
          control={form.control}
          name={dokumen.nama}
          render={({ field }) => (
            <ZonaUnggah
              label={dokumen.label}
              terimaPdf={dokumen.terimaPdf}
              nilai={field.value ?? []}
              onUbah={field.onChange}
              error={errors[dokumen.nama]?.message}
            />
          )}
        />
      ))}
      <Controller
        control={form.control}
        name="lainnya"
        render={({ field }) => (
          <ZonaUnggah
            label="Dokumen lain (opsional)"
            deskripsi={`Dokumen tambahan yang diminta sekolah, kalau ada. Paling banyak ${MAKS_DOKUMEN_LAINNYA} file.`}
            terimaPdf
            maks={MAKS_DOKUMEN_LAINNYA}
            nilai={field.value ?? []}
            onUbah={field.onChange}
            error={errors.lainnya?.message}
          />
        )}
      />
    </FieldGroup>
  );
}
