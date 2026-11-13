"use client";

import type { UseFormReturn } from "react-hook-form";

import type { KeluaranFormAbsensi, MasukanFormAbsensi } from "@/components/features/pengaturan/absensi/skema-pengaturan-absensi";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";

export type FormAbsensi = UseFormReturn<MasukanFormAbsensi, unknown, KeluaranFormAbsensi>;

type KolomJam = "masuk_buka" | "masuk_batas_terlambat" | "masuk_tutup" | "pulang_buka" | "pulang_tutup";

type IsianJamProps = {
  form: FormAbsensi;
  /** Jalur di form: kosong untuk jam bawaan, atau satu baris jam khusus atau jam per tanggal. */
  awalan: "" | `jam_khusus.${number}.` | `jam_tanggal.${number}.`;
  galat: Partial<Record<KolomJam, { message?: string }>> | undefined;
  /** Ditambahkan ke judul Masuk dan Pulang, misalnya nama hari. */
  untuk?: string;
  /** Keterangan fungsi batas terlambat dan jam tutup, cukup sekali di jam bawaan. */
  denganPenjelasan?: boolean;
};

/** Jam masuk (buka, batas terlambat, tutup) dan jam pulang (buka, tutup); bentuknya sama untuk ketiga jenis jam. */
export function IsianJam({ form, awalan, galat, untuk, denganPenjelasan = false }: IsianJamProps) {
  const judul = (jenis: string) => (untuk ? `${jenis} ${untuk}` : jenis);

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend variant="label">{judul("Masuk")}</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-3">
          <KolomTeks label="Jam buka" type="time" error={galat?.masuk_buka?.message} {...form.register(`${awalan}masuk_buka`)} />
          <KolomTeks
            label="Batas terlambat"
            type="time"
            deskripsi={denganPenjelasan ? "Absen setelah jam ini tercatat terlambat." : undefined}
            error={galat?.masuk_batas_terlambat?.message}
            {...form.register(`${awalan}masuk_batas_terlambat`)}
          />
          <KolomTeks
            label="Jam tutup"
            type="time"
            deskripsi={denganPenjelasan ? "Setelah jam ini, yang belum absen ditandai tidak hadir." : undefined}
            error={galat?.masuk_tutup?.message}
            {...form.register(`${awalan}masuk_tutup`)}
          />
        </div>
      </FieldSet>
      <FieldSet>
        <FieldLegend variant="label">{judul("Pulang")}</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-3">
          <KolomTeks label="Jam buka" type="time" error={galat?.pulang_buka?.message} {...form.register(`${awalan}pulang_buka`)} />
          <KolomTeks label="Jam tutup" type="time" error={galat?.pulang_tutup?.message} {...form.register(`${awalan}pulang_tutup`)} />
        </div>
      </FieldSet>
    </FieldGroup>
  );
}
