"use client";

import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";

import type { KeluaranFormAbsensi, MasukanFormAbsensi } from "@/components/features/pengaturan/absensi/skema-pengaturan-absensi";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { HARI_ISO } from "@/lib/constants/label";

type FormAbsensi = UseFormReturn<MasukanFormAbsensi, unknown, KeluaranFormAbsensi>;

type PilihanJam = "bawaan" | "khusus";

const OPSI_JAM = [
  { nilai: "bawaan", label: "Pakai jam bawaan" },
  { nilai: "khusus", label: "Jam khusus" },
] as const;

/**
 * Jam bawaan untuk semua hari kerja, lalu daftar hari kerja yang masing-masing bisa diberi jam khusus
 * (`absensi.jam_khusus`). Daftar jam khusus di form selalu urut nomor hari, sama dengan urutan yang dibaca backend.
 */
export function BagianJamAbsen({ form, className }: { form: FormAbsensi; className: string }) {
  const { errors } = form.formState;
  const daftar = useFieldArray({ control: form.control, name: "jam_khusus" });
  const [hariKerja, masukBuka, batasTerlambat, masukTutup, pulangBuka, pulangTutup] = useWatch({
    control: form.control,
    name: ["hari_kerja", "masuk_buka", "masuk_batas_terlambat", "masuk_tutup", "pulang_buka", "pulang_tutup"],
  });

  const pilih = (hari: number, pilihan: PilihanJam) => {
    const urutan = daftar.fields.findIndex((isi) => isi.hari === hari);
    if (pilihan === "bawaan" && urutan >= 0) daftar.remove(urutan);
    if (pilihan === "khusus" && urutan < 0) {
      // Jam khusus mulai dari jam bawaan, supaya Kepala Sekolah cukup mengubah jam yang berbeda.
      const [masuk_buka, masuk_batas_terlambat, masuk_tutup, pulang_buka, pulang_tutup] = form.getValues([
        "masuk_buka",
        "masuk_batas_terlambat",
        "masuk_tutup",
        "pulang_buka",
        "pulang_tutup",
      ]);
      const posisi = daftar.fields.filter((isi) => isi.hari < hari).length;
      daftar.insert(posisi, { hari, masuk_buka, masuk_batas_terlambat, masuk_tutup, pulang_buka, pulang_tutup });
    }
  };

  return (
    <section aria-labelledby="judul-jam" className={className}>
      <h2 id="judul-jam" className="mb-4 text-lg font-extrabold">
        Jam absen
      </h2>
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Masuk</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-3">
            <KolomTeks label="Jam buka" type="time" error={errors.masuk_buka?.message} {...form.register("masuk_buka")} />
            <KolomTeks label="Batas terlambat" type="time" deskripsi="Absen setelah jam ini tercatat terlambat." error={errors.masuk_batas_terlambat?.message} {...form.register("masuk_batas_terlambat")} />
            <KolomTeks label="Jam tutup" type="time" deskripsi="Setelah jam ini, yang belum absen ditandai tidak hadir." error={errors.masuk_tutup?.message} {...form.register("masuk_tutup")} />
          </div>
        </FieldSet>
        <FieldSet>
          <FieldLegend variant="label">Pulang</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-3">
            <KolomTeks label="Jam buka" type="time" error={errors.pulang_buka?.message} {...form.register("pulang_buka")} />
            <KolomTeks label="Jam tutup" type="time" error={errors.pulang_tutup?.message} {...form.register("pulang_tutup")} />
          </div>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">Jam per hari</FieldLegend>
          <FieldDescription>
            Jam di atas berlaku untuk semua hari kerja. Pilih Jam khusus untuk hari yang jamnya berbeda setiap minggu, misalnya Jumat pulang lebih awal.
          </FieldDescription>
          <ul className="flex flex-col gap-3">
            {HARI_ISO.filter(({ nomor }) => hariKerja.includes(nomor)).map(({ nomor, label }) => {
              const urutan = daftar.fields.findIndex((isi) => isi.hari === nomor);
              const galat = urutan >= 0 ? errors.jam_khusus?.[urutan] : undefined;
              return (
                <li key={nomor} className="rounded-lg border border-border p-3 sm:p-4">
                  <KolomRadio<PilihanJam> label={label} opsi={OPSI_JAM} nilai={urutan >= 0 ? "khusus" : "bawaan"} onUbah={(pilihan) => pilih(nomor, pilihan)} />
                  {urutan >= 0 ? (
                    <FieldGroup className="mt-4">
                      <FieldSet>
                        <FieldLegend variant="label">Masuk {label}</FieldLegend>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <KolomTeks label="Jam buka" type="time" error={galat?.masuk_buka?.message} {...form.register(`jam_khusus.${urutan}.masuk_buka`)} />
                          <KolomTeks label="Batas terlambat" type="time" error={galat?.masuk_batas_terlambat?.message} {...form.register(`jam_khusus.${urutan}.masuk_batas_terlambat`)} />
                          <KolomTeks label="Jam tutup" type="time" error={galat?.masuk_tutup?.message} {...form.register(`jam_khusus.${urutan}.masuk_tutup`)} />
                        </div>
                      </FieldSet>
                      <FieldSet>
                        <FieldLegend variant="label">Pulang {label}</FieldLegend>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <KolomTeks label="Jam buka" type="time" error={galat?.pulang_buka?.message} {...form.register(`jam_khusus.${urutan}.pulang_buka`)} />
                          <KolomTeks label="Jam tutup" type="time" error={galat?.pulang_tutup?.message} {...form.register(`jam_khusus.${urutan}.pulang_tutup`)} />
                        </div>
                      </FieldSet>
                    </FieldGroup>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Masuk {masukBuka}–{masukTutup}, terlambat setelah {batasTerlambat}. Pulang {pulangBuka}–{pulangTutup}.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </FieldSet>
      </FieldGroup>
    </section>
  );
}
