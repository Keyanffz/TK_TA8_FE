"use client";

import type { ReactNode } from "react";
import { Controller } from "react-hook-form";

import { Baris, IsianPilih, IsianTeks, KelompokIsian, useIsianFormulir, useTampil } from "@/components/features/formulir-murid/kolom-formulir";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { FieldGroup } from "@/components/ui/field";
import { OPSI_AGAMA, OPSI_KEWARGANEGARAAN, OPSI_STATUS_YATIM_PIATU } from "@/lib/constants/formulir";
import { OPSI_JENIS_KELAMIN } from "@/lib/constants/label";
import { hariIniJakarta } from "@/lib/tanggal";

/** Langkah 1 formulir data murid: identitas, keluarga, dan alamat anak. `tambahan` diisi PPDB atau form staf. */
export function LangkahDataAnak({ tambahan }: { tambahan?: ReactNode }) {
  const { control, getFieldState, formState } = useIsianFormulir();
  const tampil = useTampil();

  return (
    <FieldGroup>
      <KelompokIsian judul="Identitas anak" field={["nama_lengkap", "nama_panggilan", "jenis_kelamin", "tempat_lahir", "tanggal_lahir", "nik", "agama", "kewarganegaraan"]}>
        <Baris>
          <IsianTeks field="nama_lengkap" label="Nama lengkap" />
          <IsianTeks field="nama_panggilan" label="Nama panggilan" />
        </Baris>
        {tampil("jenis_kelamin") ? (
          <Controller
            control={control}
            name="jenis_kelamin"
            render={({ field }) => (
              <KolomRadio label="Jenis kelamin" opsi={OPSI_JENIS_KELAMIN} nilai={field.value} onUbah={field.onChange} error={getFieldState("jenis_kelamin", formState).error?.message} />
            )}
          />
        ) : null}
        <Baris>
          <IsianTeks field="tempat_lahir" label="Tempat lahir" />
          <IsianTeks field="tanggal_lahir" label="Tanggal lahir" type="date" max={hariIniJakarta()} />
          <IsianTeks field="nik" label="NIK anak" inputMode="numeric" maxLength={16} deskripsi="16 angka, tertulis di Kartu Keluarga." />
          <IsianPilih field="agama" label="Agama" opsi={OPSI_AGAMA} kosong="Pilih agama" />
          <IsianPilih field="kewarganegaraan" label="Kewarganegaraan" opsi={OPSI_KEWARGANEGARAAN} kosong="Pilih kewarganegaraan" />
        </Baris>
      </KelompokIsian>
      <KelompokIsian
        judul="Keluarga"
        field={["anak_ke", "jumlah_saudara_kandung", "jumlah_saudara_tiri", "jumlah_saudara_angkat", "status_yatim_piatu", "bahasa_sehari_hari", "asal_sekolah"]}
      >
        <Baris>
          <IsianTeks field="anak_ke" label="Anak ke-" inputMode="numeric" maxLength={2} />
          <IsianPilih
            field="status_yatim_piatu"
            label="Status yatim/piatu"
            opsi={OPSI_STATUS_YATIM_PIATU}
            kosong="Pilih status"
            deskripsi="Orang tua yang sudah meninggal cukup diisi namanya."
          />
        </Baris>
        <div className="grid gap-4 sm:grid-cols-3">
          <IsianTeks field="jumlah_saudara_kandung" label="Saudara kandung" inputMode="numeric" maxLength={2} />
          <IsianTeks field="jumlah_saudara_tiri" label="Saudara tiri" inputMode="numeric" maxLength={2} />
          <IsianTeks field="jumlah_saudara_angkat" label="Saudara angkat" inputMode="numeric" maxLength={2} />
        </div>
        <Baris>
          <IsianTeks field="bahasa_sehari_hari" label="Bahasa sehari-hari di rumah (opsional)" placeholder="Misalnya Jawa" />
          <IsianTeks field="asal_sekolah" label="Asal sekolah (opsional)" deskripsi="Kosongkan kalau belum pernah sekolah." />
        </Baris>
      </KelompokIsian>
      <KelompokIsian judul="Alamat" field={["alamat", "desa_kelurahan", "kecamatan", "kabupaten_kota", "provinsi", "jarak_rumah_km"]}>
        <IsianTeks field="alamat" label="Jalan, nomor rumah, RT/RW" autoComplete="street-address" />
        <Baris>
          <IsianTeks field="desa_kelurahan" label="Desa/kelurahan" />
          <IsianTeks field="kecamatan" label="Kecamatan" />
          <IsianTeks field="kabupaten_kota" label="Kabupaten/kota" />
          <IsianTeks field="provinsi" label="Provinsi" />
          <IsianTeks field="jarak_rumah_km" label="Jarak rumah ke sekolah, km (opsional)" inputMode="decimal" placeholder="Misalnya 1,5" />
        </Baris>
      </KelompokIsian>
      {tambahan}
    </FieldGroup>
  );
}
