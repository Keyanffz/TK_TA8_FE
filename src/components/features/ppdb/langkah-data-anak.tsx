"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import type { MasukanPendaftaran, NilaiPendaftaran } from "@/components/features/ppdb/skema-pendaftaran";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { FieldGroup } from "@/components/ui/field";
import { AGAMA, LABEL_TINGKAT, OPSI_JENIS_KELAMIN } from "@/lib/constants/label";
import { hariIniJakarta } from "@/lib/tanggal";

const OPSI_TINGKAT = (["A", "B"] as const).map((nilai) => ({ nilai, label: LABEL_TINGKAT[nilai] }));

type FormPendaftaran = UseFormReturn<MasukanPendaftaran, unknown, NilaiPendaftaran>;

export function LangkahDataAnak({ form }: { form: FormPendaftaran }) {
  const { errors } = form.formState;

  return (
    <FieldGroup>
      <KolomTeks label="Nama lengkap anak" autoComplete="off" error={errors.nama_lengkap?.message} {...form.register("nama_lengkap")} />
      <KolomTeks label="Nama panggilan" autoComplete="off" error={errors.nama_panggilan?.message} {...form.register("nama_panggilan")} />
      <Controller
        control={form.control}
        name="jenis_kelamin"
        render={({ field }) => (
          <KolomRadio label="Jenis kelamin" opsi={OPSI_JENIS_KELAMIN} nilai={field.value} onUbah={field.onChange} error={errors.jenis_kelamin?.message} />
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <KolomTeks label="Tempat lahir" autoComplete="off" error={errors.tempat_lahir?.message} {...form.register("tempat_lahir")} />
        <KolomTeks label="Tanggal lahir" type="date" max={hariIniJakarta()} error={errors.tanggal_lahir?.message} {...form.register("tanggal_lahir")} />
      </div>
      <KolomTeks
        label="NIK anak"
        inputMode="numeric"
        maxLength={16}
        autoComplete="off"
        deskripsi="16 angka, tertulis di Kartu Keluarga."
        error={errors.nik?.message}
        {...form.register("nik")}
      />
      <KolomPilih label="Agama" error={errors.agama?.message} {...form.register("agama")}>
        <option value="">Pilih agama</option>
        {AGAMA.map((agama) => (
          <option key={agama} value={agama}>
            {agama}
          </option>
        ))}
      </KolomPilih>
      <Controller
        control={form.control}
        name="tingkat_tujuan"
        render={({ field }) => (
          <KolomRadio label="Mendaftar ke" opsi={OPSI_TINGKAT} nilai={field.value} onUbah={field.onChange} error={errors.tingkat_tujuan?.message} />
        )}
      />
    </FieldGroup>
  );
}
