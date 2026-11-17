"use client";

import type { ReactNode } from "react";
import { Controller, useWatch } from "react-hook-form";

import { FormOrangTua } from "@/components/features/formulir-murid/form-orang-tua";
import { KelompokIsian, useIsianFormulir, useTampil } from "@/components/features/formulir-murid/kolom-formulir";
import { kontakTersedia } from "@/components/features/formulir-murid/skema";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { LABEL_PERAN_ORANG_TUA } from "@/lib/constants/label";

/** Langkah 3: ayah, ibu, wali opsional, dan kontak utama. `awal` untuk pertanyaan "Anda sebagai" wali yang login. */
export function LangkahOrangTua({ awal }: { awal?: ReactNode }) {
  const { control, setValue, getFieldState, formState } = useIsianFormulir();
  const tampil = useTampil();
  const isian = useWatch({ control });
  const tersedia = kontakTersedia({
    status_yatim_piatu: isian.status_yatim_piatu ?? "",
    kontak_utama: isian.kontak_utama ?? "",
    ada_wali: isian.ada_wali ?? false,
    ayah: { no_hp: isian.ayah?.no_hp ?? "" },
    ibu: { no_hp: isian.ibu?.no_hp ?? "" },
    wali: { no_hp: isian.wali?.no_hp ?? "" },
  });

  return (
    <FieldGroup>
      {awal}
      <FormOrangTua peran="ayah" />
      <FormOrangTua peran="ibu" />
      {isian.ada_wali ? (
        <div className="flex flex-col gap-3">
          <FormOrangTua peran="wali" />
          {tampil("ada_wali") ? (
            <Button type="button" variant="ghost" className="self-start" onClick={() => setValue("ada_wali", false, { shouldDirty: true })}>
              Hapus Data Wali
            </Button>
          ) : null}
        </div>
      ) : tampil("ada_wali") ? (
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">Isi data wali kalau anak tinggal dengan selain ayah dan ibu, misalnya kakek atau nenek.</p>
          <Button type="button" variant="outline" className="self-start" onClick={() => setValue("ada_wali", true, { shouldDirty: true })}>
            Tambah Data Wali
          </Button>
        </div>
      ) : null}
      <KelompokIsian judul="Kontak utama" keterangan="Nama dan nomor HP orang ini dipakai untuk akun wali murid yang dibuat sekolah." field={["kontak_utama"]}>
        {tersedia.length === 0 ? (
          <KotakPesan nada="menunggu">Isi nomor HP ayah, ibu, atau wali yang masih hidup dulu, lalu pilih kontak utama di sini.</KotakPesan>
        ) : (
          <Controller
            control={control}
            name="kontak_utama"
            render={({ field }) => (
              <KolomRadio
                label="Kontak utama"
                opsi={tersedia.map((peran) => ({ nilai: peran, label: LABEL_PERAN_ORANG_TUA[peran] }))}
                nilai={field.value === "" ? undefined : field.value}
                onUbah={field.onChange}
                error={getFieldState("kontak_utama", formState).error?.message}
              />
            )}
          />
        )}
        {tersedia.length === 0 ? <FieldError>{getFieldState("kontak_utama", formState).error?.message}</FieldError> : null}
      </KelompokIsian>
    </FieldGroup>
  );
}
