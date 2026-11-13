"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";

import { IsianJam, type FormAbsensi } from "@/components/features/pengaturan/absensi/isian-jam";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";

/**
 * Jam untuk rentang tanggal tertentu (`absensi.jam_tanggal`), misalnya Ramadan. Rentang baru mulai dari jam bawaan,
 * supaya Kepala Sekolah cukup mengubah jam yang berbeda.
 */
export function JamPerTanggal({ form }: { form: FormAbsensi }) {
  const { errors } = form.formState;
  const daftar = useFieldArray({ control: form.control, name: "jam_tanggal" });

  const tambah = () => {
    const [masuk_buka, masuk_batas_terlambat, masuk_tutup, pulang_buka, pulang_tutup] = form.getValues([
      "masuk_buka",
      "masuk_batas_terlambat",
      "masuk_tutup",
      "pulang_buka",
      "pulang_tutup",
    ]);
    daftar.append({ keterangan: "", mulai: "", selesai: "", masuk_buka, masuk_batas_terlambat, masuk_tutup, pulang_buka, pulang_tutup });
  };

  return (
    <FieldSet>
      <FieldLegend variant="label">Jam per tanggal</FieldLegend>
      <FieldDescription>
        Untuk rentang tanggal yang jamnya berbeda, misalnya Ramadan atau pekan ujian. Jam ini dipakai lebih dulu daripada jam per hari dan jam bawaan.
        Hari kerja dan tanggal libur tidak berubah.
      </FieldDescription>
      {daftar.fields.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {daftar.fields.map((isi, urutan) => {
            const galat = errors.jam_tanggal?.[urutan];
            return (
              <li key={isi.id} className="rounded-lg border border-border p-3 sm:p-4">
                <FieldGroup>
                  <KolomTeks label="Keterangan" placeholder="Ramadan" maxLength={100} error={galat?.keterangan?.message} {...form.register(`jam_tanggal.${urutan}.keterangan`)} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <KolomTeks label="Tanggal mulai" type="date" error={galat?.mulai?.message} {...form.register(`jam_tanggal.${urutan}.mulai`)} />
                    <KolomTeks label="Tanggal selesai" type="date" error={galat?.selesai?.message} {...form.register(`jam_tanggal.${urutan}.selesai`)} />
                  </div>
                  <IsianJam form={form} awalan={`jam_tanggal.${urutan}.`} galat={galat} />
                  <Button type="button" variant="outline" className="self-start" onClick={() => daftar.remove(urutan)}>
                    <Trash2 aria-hidden="true" />
                    Hapus Rentang
                  </Button>
                </FieldGroup>
              </li>
            );
          })}
        </ul>
      ) : null}
      <Button type="button" variant="outline" className="self-start" onClick={tambah}>
        <Plus aria-hidden="true" />
        Tambah Jam per Tanggal
      </Button>
    </FieldSet>
  );
}
