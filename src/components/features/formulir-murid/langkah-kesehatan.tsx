"use client";

import type { ReactNode } from "react";
import { Controller } from "react-hook-form";

import { Baris, hanyaAngka, IsianArea, IsianPilih, IsianTeks, KelompokIsian, useIsianFormulir, useTampil } from "@/components/features/formulir-murid/kolom-formulir";
import { FieldGroup } from "@/components/ui/field";
import { OPSI_GOLONGAN_DARAH, OPSI_IMUNISASI } from "@/lib/constants/formulir";

/** Langkah 2: semua isian kesehatan opsional. Tinggi dan berat badan adalah data saat masuk, terpisah dari rapor. */
export function LangkahKesehatan({ tambahan }: { tambahan?: ReactNode }) {
  const { control } = useIsianFormulir();
  const tampil = useTampil();

  return (
    <FieldGroup>
      <KelompokIsian judul="Tubuh" field={["golongan_darah", "tinggi_badan", "berat_badan"]}>
        <div className="grid gap-4 sm:grid-cols-3">
          <IsianPilih field="golongan_darah" label="Golongan darah" opsi={OPSI_GOLONGAN_DARAH} kosong="Pilih golongan darah" />
          <IsianTeks field="tinggi_badan" label="Tinggi badan (cm)" inputMode="numeric" maxLength={3} placeholder="Misalnya 105" bersihkan={hanyaAngka} />
          <IsianTeks field="berat_badan" label="Berat badan (kg)" inputMode="numeric" maxLength={3} placeholder="Misalnya 17" bersihkan={hanyaAngka} />
        </div>
      </KelompokIsian>
      <KelompokIsian judul="Imunisasi yang pernah diterima" field={["imunisasi", "imunisasi_lainnya"]}>
        {tampil("imunisasi") ? (
          <Controller
            control={control}
            name="imunisasi"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                {OPSI_IMUNISASI.map((opsi) => (
                  <label key={opsi.nilai} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="size-5 accent-primary"
                      checked={field.value.includes(opsi.nilai)}
                      onChange={(event) =>
                        field.onChange(event.target.checked ? [...field.value, opsi.nilai] : field.value.filter((nilai) => nilai !== opsi.nilai))
                      }
                    />
                    {opsi.label}
                  </label>
                ))}
              </div>
            )}
          />
        ) : null}
        <IsianTeks field="imunisasi_lainnya" label="Imunisasi lainnya (opsional)" placeholder="Misalnya Rotavirus" />
      </KelompokIsian>
      <KelompokIsian judul="Catatan kesehatan" field={["riwayat_penyakit", "ciri_khusus"]}>
        <Baris>
          <IsianArea field="riwayat_penyakit" label="Penyakit yang pernah diderita (opsional)" placeholder="Misalnya asma atau alergi udang" />
          <IsianArea field="ciri_khusus" label="Ciri-ciri khusus (opsional)" placeholder="Misalnya tanda lahir di lengan kiri" />
        </Baris>
      </KelompokIsian>
      {tambahan}
    </FieldGroup>
  );
}
