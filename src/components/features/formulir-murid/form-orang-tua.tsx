"use client";

import { Controller, useWatch } from "react-hook-form";

import { Baris, hanyaAngka, IsianPilih, IsianTeks, KelompokIsian, useIsianFormulir, useTampil, type FieldFormulir } from "@/components/features/formulir-murid/kolom-formulir";
import { statusDariKeadaan, sudahMeninggal } from "@/components/features/formulir-murid/skema";
import { KolomRadio } from "@/components/shared/kolom-radio";
import {
  OPSI_AGAMA,
  OPSI_HUBUNGAN_WALI,
  OPSI_KEWARGANEGARAAN,
  OPSI_PEKERJAAN,
  OPSI_PENDIDIKAN,
  OPSI_PENGHASILAN,
  OPSI_STATUS_ORANG_TUA,
} from "@/lib/constants/formulir";
import { LABEL_PERAN_ORANG_TUA } from "@/lib/constants/label";
import { hariIniJakarta } from "@/lib/tanggal";
import type { Hubungan } from "@/types/domain";

const ISIAN = [
  "status", "hubungan", "hubungan_lainnya", "nama", "tempat_lahir", "tanggal_lahir", "agama", "kewarganegaraan",
  "pendidikan_terakhir", "pekerjaan", "pekerjaan_lainnya", "penghasilan", "alamat_rumah", "alamat_kantor", "no_hp",
] as const;

const OPSI_KEADAAN = [
  { nilai: "hidup", label: "Masih hidup" },
  { nilai: "meninggal", label: "Sudah meninggal" },
] as const;

/** Isian satu orang (ayah, ibu, atau wali). Ayah atau ibu yang sudah meninggal cukup diisi nama. */
export function FormOrangTua({ peran }: { peran: Hubungan }) {
  const { control, register, getValues, setValue, getFieldState, formState } = useIsianFormulir();
  const tampil = useTampil();
  const [statusYatimPiatu, pekerjaan, hubungan, alamatSama] = useWatch({
    control,
    name: ["status_yatim_piatu", `${peran}.pekerjaan`, `${peran}.hubungan`, `${peran}.alamat_sama_dengan_anak`],
  });
  const f = (kolom: (typeof ISIAN)[number]): FieldFormulir => `${peran}.${kolom}`;
  const sebutan = peran === "wali" ? "wali" : peran;
  const meninggal = sudahMeninggal(peran, statusYatimPiatu);
  const tampilKeadaan = peran !== "wali" && tampil("status_yatim_piatu");

  // Orang tua yang sudah meninggal hanya punya isian nama; kalau nama itu tidak ditampilkan, bagian ini tidak perlu.
  if (meninggal && !tampil(f("nama")) && !tampilKeadaan) return null;

  const ubahKeadaan = (pilihan: (typeof OPSI_KEADAAN)[number]["nilai"]) => {
    const status = getValues("status_yatim_piatu");
    const ayah = peran === "ayah" ? pilihan === "meninggal" : sudahMeninggal("ayah", status);
    const ibu = peran === "ibu" ? pilihan === "meninggal" : sudahMeninggal("ibu", status);
    setValue("status_yatim_piatu", statusDariKeadaan(ayah, ibu), { shouldDirty: true, shouldValidate: true });
  };

  return (
    <KelompokIsian judul={LABEL_PERAN_ORANG_TUA[peran]} field={tampilKeadaan ? [...ISIAN.map(f), "status_yatim_piatu"] : ISIAN.map(f)}>
      {tampilKeadaan ? (
        <Controller
          control={control}
          name="status_yatim_piatu"
          render={() => (
            <KolomRadio
              label={`Keadaan ${sebutan}`}
              opsi={OPSI_KEADAAN}
              nilai={statusYatimPiatu === "" ? undefined : meninggal ? "meninggal" : "hidup"}
              onUbah={ubahKeadaan}
              error={getFieldState("status_yatim_piatu", formState).error?.message}
            />
          )}
        />
      ) : null}
      {meninggal ? (
        <IsianTeks field={f("nama")} label={`Nama ${sebutan}`} placeholder="Sesuai Kartu Keluarga" />
      ) : (
        <>
          <Baris>
            {peran === "wali" ? (
              <IsianPilih field={f("hubungan")} label="Hubungan dengan anak" opsi={OPSI_HUBUNGAN_WALI} kosong="Pilih hubungan" />
            ) : (
              <IsianPilih field={f("status")} label={`Status ${sebutan}`} opsi={OPSI_STATUS_ORANG_TUA} kosong="Pilih status" />
            )}
            {peran === "wali" && hubungan === "lainnya" ? <IsianTeks field={f("hubungan_lainnya")} label="Tulis hubungannya" placeholder="Misalnya kakak sepupu" /> : null}
            <IsianTeks field={f("nama")} label={`Nama ${sebutan}`} placeholder="Sesuai Kartu Keluarga" />
            <IsianTeks field={f("tempat_lahir")} label="Tempat lahir" placeholder="Misalnya Semarang" />
            <IsianTeks field={f("tanggal_lahir")} label="Tanggal lahir" type="date" max={hariIniJakarta()} />
            <IsianPilih field={f("agama")} label="Agama" opsi={OPSI_AGAMA} kosong="Pilih agama" />
            <IsianPilih field={f("kewarganegaraan")} label="Kewarganegaraan" opsi={OPSI_KEWARGANEGARAAN} kosong="Pilih kewarganegaraan" />
            <IsianPilih field={f("pendidikan_terakhir")} label="Pendidikan terakhir" opsi={OPSI_PENDIDIKAN} kosong="Pilih pendidikan" />
            <IsianPilih field={f("pekerjaan")} label="Pekerjaan" opsi={OPSI_PEKERJAAN} kosong="Pilih pekerjaan" />
            {pekerjaan === "lainnya" ? <IsianTeks field={f("pekerjaan_lainnya")} label="Tulis pekerjaannya" placeholder="Misalnya penjahit" /> : null}
            <IsianPilih field={f("penghasilan")} label="Penghasilan per bulan (opsional)" opsi={OPSI_PENGHASILAN} kosong="Pilih rentang" />
            <IsianTeks
              field={f("no_hp")}
              label="Nomor HP (WhatsApp)"
              type="tel"
              inputMode="numeric"
              placeholder="08xxxxxxxxxx"
              maxLength={15}
              bersihkan={hanyaAngka}
              deskripsi="Boleh kosong, tetapi minimal satu nomor HP ayah, ibu, atau wali harus diisi."
            />
          </Baris>
          {tampil(f("alamat_rumah")) ? (
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-bold">
              <input type="checkbox" className="size-5 accent-primary" {...register(`${peran}.alamat_sama_dengan_anak`)} />
              Alamat rumah sama dengan alamat anak
            </label>
          ) : null}
          {alamatSama ? null : <IsianTeks field={f("alamat_rumah")} label="Alamat rumah" placeholder="Misalnya Jl. Pandanaran No. 5, RT 02/RW 04" />}
          <IsianTeks field={f("alamat_kantor")} label="Alamat kantor (opsional)" placeholder="Nama dan alamat tempat kerja" />
        </>
      )}
    </KelompokIsian>
  );
}
