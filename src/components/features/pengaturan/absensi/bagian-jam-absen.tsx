"use client";

import { useFieldArray, useWatch } from "react-hook-form";

import { IsianJam, type FormAbsensi } from "@/components/features/pengaturan/absensi/isian-jam";
import { JamPerTanggal } from "@/components/features/pengaturan/absensi/jam-per-tanggal";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { HARI_ISO } from "@/lib/constants/label";

type PilihanJam = "bawaan" | "khusus";

const OPSI_JAM = [
  { nilai: "bawaan", label: "Pakai jam bawaan" },
  { nilai: "khusus", label: "Jam khusus" },
] as const;

/**
 * Jam bawaan untuk semua hari kerja, daftar hari kerja yang masing-masing bisa diberi jam khusus (`absensi.jam_khusus`),
 * lalu jam per rentang tanggal. Daftar jam khusus di form selalu urut nomor hari, sama dengan urutan yang dibaca backend.
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
        <IsianJam form={form} awalan="" galat={errors} denganPenjelasan />

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
                    <div className="mt-4">
                      <IsianJam form={form} awalan={`jam_khusus.${urutan}.`} galat={galat} untuk={label} />
                    </div>
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

        <JamPerTanggal form={form} />
      </FieldGroup>
    </section>
  );
}
