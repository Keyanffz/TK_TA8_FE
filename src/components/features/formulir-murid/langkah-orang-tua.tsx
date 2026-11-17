"use client";

import type { ReactNode } from "react";
import { Controller, useWatch } from "react-hook-form";

import { FormOrangTua } from "@/components/features/formulir-murid/form-orang-tua";
import { KelompokIsian, useIsianFormulir, useTampil } from "@/components/features/formulir-murid/kolom-formulir";
import { ORANG_TUA_KOSONG } from "@/components/features/formulir-murid/isian";
import { kontakTersedia } from "@/components/features/formulir-murid/skema";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { LABEL_PERAN_ORANG_TUA } from "@/lib/constants/label";

/** Langkah 3: ayah, ibu, wali opsional, dan kontak utama. `awal` untuk pertanyaan "Anda sebagai" wali yang login. */
export function LangkahOrangTua({ awal }: { awal?: ReactNode }) {
  const { control, setValue, getValues, clearErrors, getFieldState, formState } = useIsianFormulir();
  const tampil = useTampil();
  const isian = useWatch({ control });

  // Isian wali ikut dikosongkan supaya tidak muncul lagi kalau wali ditambah ulang, dan kontak utama tidak menunjuk wali yang sudah tidak ada.
  const hapusWali = () => {
    setValue("ada_wali", false, { shouldDirty: true });
    setValue("wali", ORANG_TUA_KOSONG, { shouldDirty: true });
    if (getValues("kontak_utama") === "wali") setValue("kontak_utama", "", { shouldDirty: true });
    clearErrors("wali");
  };
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
          {tampil("ada_wali") ? (
            <Button type="button" variant="outline" size="sm" className="self-end" onClick={hapusWali}>
              Hapus Data Wali
            </Button>
          ) : null}
          <FormOrangTua peran="wali" />
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
          <p className="text-sm text-muted-foreground">Pilihan muncul setelah ada nomor HP yang diisi.</p>
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
