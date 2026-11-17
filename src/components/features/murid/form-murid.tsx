"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, FormProvider, useForm, type DefaultValues } from "react-hook-form";
import { z } from "zod";

import { DataKurang } from "@/components/features/formulir-murid/data-kurang";
import { FORMULIR_KOSONG, isianDariData, keBodyFormulir } from "@/components/features/formulir-murid/isian";
import { Baris, KelompokIsian } from "@/components/features/formulir-murid/kolom-formulir";
import { FIELD_LANGKAH_FORMULIR, LANGKAH, SEMUA_FIELD_FORMULIR, langkahDenganError } from "@/components/features/formulir-murid/label-field";
import { LangkahDataAnak } from "@/components/features/formulir-murid/langkah-data-anak";
import { LangkahKesehatan } from "@/components/features/formulir-murid/langkah-kesehatan";
import { LangkahOrangTua } from "@/components/features/formulir-murid/langkah-orang-tua";
import { RingkasanFormulir } from "@/components/features/formulir-murid/ringkasan-formulir";
import { isianFormulir, periksaKontakUtama } from "@/components/features/formulir-murid/skema";
import { WizardFormulir } from "@/components/features/formulir-murid/wizard-formulir";
import { FotoProfil } from "@/components/shared/foto-profil";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import type { BodyMurid } from "@/lib/api/murid";
import { formatTanggal } from "@/lib/format";
import { hariIniJakarta } from "@/lib/tanggal";
import type { MuridDetail } from "@/types/domain";

// Staf boleh menyimpan formulir yang belum lengkap (A2.16): yang wajib hanya data diri lama dan tanggal masuk.
const skemaMurid = z
  .object({
    ...isianFormulir,
    nisn: z.string().trim().regex(/^(\d{10})?$/, "NISN berisi 10 angka. Boleh dikosongkan."),
    catatan_khusus: z.string().trim().max(1000, "Maksimal 1000 karakter."),
    tanggal_masuk: z.string().min(1, "Tanggal masuk wajib diisi."),
    foto: z.array(z.custom<File>((nilai) => nilai instanceof File)).max(1),
  })
  .superRefine(periksaKontakUtama);

type NilaiMurid = z.infer<typeof skemaMurid>;
const FIELD_TAMBAHAN = [["nisn", "tanggal_masuk", "foto"], ["catatan_khusus"], [], []] as const;

function nilaiAwal(murid: MuridDetail | null): DefaultValues<NilaiMurid> {
  const sekolah = { nisn: murid?.nisn ?? "", catatan_khusus: murid?.catatan_khusus ?? "", tanggal_masuk: murid?.tanggal_masuk ?? hariIniJakarta(), foto: [] };
  return murid ? { ...isianDariData(murid), ...sekolah } : { ...FORMULIR_KOSONG, ...sekolah };
}

/** NIK hanya dikirim kalau backend mengirimnya ke pengguna ini, supaya NIK tersimpan tidak terhapus. */
function keBody(nilai: NilaiMurid, murid: MuridDetail | null): BodyMurid {
  const bolehNik = murid === null || "nik" in murid;
  return {
    ...keBodyFormulir(nilai),
    ...(bolehNik ? { nik: nilai.nik.trim() || null } : {}),
    nisn: nilai.nisn.trim() || null,
    nama_lengkap: nilai.nama_lengkap,
    nama_panggilan: nilai.nama_panggilan,
    jenis_kelamin: nilai.jenis_kelamin,
    tempat_lahir: nilai.tempat_lahir,
    tanggal_lahir: nilai.tanggal_lahir,
    agama: nilai.agama,
    alamat: nilai.alamat,
    catatan_khusus: nilai.catatan_khusus.trim() || null,
    tanggal_masuk: nilai.tanggal_masuk,
    foto: nilai.foto[0] ?? null,
  };
}

type FormMuridProps = {
  murid: MuridDetail | null;
  /** Mengembalikan detail murid hasil simpan, termasuk `data_kurang`. */
  kirim: (body: BodyMurid) => Promise<MuridDetail>;
  labelSimpan: string;
  langkahAwal?: number;
  /** Isi di bawah daftar data kurang setelah simpan, misalnya tautan ke detail murid. */
  sesudahSimpan?: ReactNode;
};

export function FormMurid({ murid, kirim, labelSimpan, langkahAwal = LANGKAH.dataAnak, sesudahSimpan }: FormMuridProps) {
  const [langkah, setLangkah] = useState(langkahAwal);
  const form = useForm<NilaiMurid>({ resolver: zodResolver(skemaMurid), defaultValues: nilaiAwal(murid), shouldUnregister: false });
  const { errors, isSubmitting } = form.formState;

  const keLangkahError = () => setLangkah(langkahDenganError((field) => form.getFieldState(field).invalid, FIELD_TAMBAHAN) ?? LANGKAH.konfirmasi);

  const simpan = form.handleSubmit(async (nilai) => {
    try {
      await kirim(keBody(nilai, murid));
      form.reset({ ...nilai, foto: [] });
    } catch (error) {
      // Pesan menetap di atas tombol simpan; toast yang hilang sendiri bisa terlewat lalu data dikira tersimpan.
      if (terapkanErrorValidasi(error, form.setError, [...SEMUA_FIELD_FORMULIR, ...FIELD_TAMBAHAN.flat()])) keLangkahError();
      else form.setError("root", { message: pesanError(error) });
    }
  }, keLangkahError);

  return (
    <FormProvider {...form}>
      <WizardFormulir
        langkah={langkah}
        onPindah={setLangkah}
        periksaLangkah={() => form.trigger([...FIELD_LANGKAH_FORMULIR[langkah], ...FIELD_TAMBAHAN[langkah]], { shouldFocus: true })}
        onKirim={() => void simpan()}
        memproses={isSubmitting}
        labelKirim={labelSimpan}
        label="Langkah data murid"
        bisaLoncat={murid !== null}
      >
        {langkah === LANGKAH.dataAnak ? (
          <LangkahDataAnak
            tambahan={
              <KelompokIsian judul="Data sekolah">
                <Baris>
                  <KolomTeks label="NISN (opsional)" inputMode="numeric" maxLength={10} error={errors.nisn?.message} {...form.register("nisn")} />
                  <KolomTeks label="Tanggal masuk" type="date" error={errors.tanggal_masuk?.message} {...form.register("tanggal_masuk")} />
                </Baris>
                <Controller
                  control={form.control}
                  name="foto"
                  render={({ field }) => (
                    <div className="flex items-start gap-4">
                      {murid && field.value.length === 0 ? <FotoProfil nama={murid.nama_lengkap} url={murid.foto_url} ukuran={80} className="mt-7 size-20 text-xl" /> : null}
                      <div className="flex-1">
                        <ZonaUnggah label={murid?.foto_url ? "Ganti foto" : "Foto (opsional)"} nilai={field.value} onUbah={field.onChange} error={errors.foto?.message} />
                      </div>
                    </div>
                  )}
                />
              </KelompokIsian>
            }
          />
        ) : null}
        {langkah === LANGKAH.kesehatan ? (
          <LangkahKesehatan
            tambahan={
              <KolomArea
                label="Catatan khusus untuk guru (opsional)"
                rows={2}
                deskripsi="Misalnya alergi makanan atau kebutuhan khusus. Hanya terlihat guru, Kepala Sekolah, dan wali anak ini."
                error={errors.catatan_khusus?.message}
                {...form.register("catatan_khusus")}
              />
            }
          />
        ) : null}
        {langkah === LANGKAH.orangTua ? <LangkahOrangTua /> : null}
        {langkah === LANGKAH.konfirmasi ? (
          <div className="flex flex-col gap-4">
            {murid ? (
              <DataKurang field={murid.data_kurang} judul="Belum lengkap saat terakhir disimpan" keLangkah={setLangkah} />
            ) : (
              <p className="text-sm text-muted-foreground">Murid tetap bisa disimpan walau data belum lengkap. Isian wajib yang masih kosong ditampilkan setelah disimpan.</p>
            )}
            {murid && murid.data_kurang.length > 0 ? sesudahSimpan : null}
            {errors.root?.message ? <KotakPesan nada="bahaya">{errors.root.message}</KotakPesan> : null}
            <RingkasanFormulir
              isian={form.getValues()}
              tampilkanNik={murid === null || "nik" in murid}
              keLangkah={setLangkah}
              dataSekolah={[
                ["NISN", form.getValues("nisn")],
                ["Tanggal masuk", form.getValues("tanggal_masuk") ? formatTanggal(form.getValues("tanggal_masuk")) : ""],
                ["Catatan khusus", form.getValues("catatan_khusus")],
              ]}
            />
          </div>
        ) : null}
      </WizardFormulir>
    </FormProvider>
  );
}
