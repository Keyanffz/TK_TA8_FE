"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FIELD_LANGKAH_FORMULIR, LANGKAH, SEMUA_FIELD_FORMULIR, langkahDenganError } from "@/components/features/formulir-murid/label-field";
import { LangkahDataAnak } from "@/components/features/formulir-murid/langkah-data-anak";
import { LangkahKesehatan } from "@/components/features/formulir-murid/langkah-kesehatan";
import { LangkahOrangTua } from "@/components/features/formulir-murid/langkah-orang-tua";
import { RingkasanFormulir } from "@/components/features/formulir-murid/ringkasan-formulir";
import { WizardFormulir } from "@/components/features/formulir-murid/wizard-formulir";
import { BerkasDibawa } from "@/components/features/ppdb/berkas-dibawa";
import {
  buatSkemaPendaftaran,
  nilaiAwalPendaftaran,
  type MasukanPendaftaran,
  type NilaiPendaftaran,
} from "@/components/features/ppdb/skema-pendaftaran";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { FieldError } from "@/components/ui/field";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { LABEL_TINGKAT, OPSI_HUBUNGAN } from "@/lib/constants/label";

const OPSI_TINGKAT = (["A", "B"] as const).map((nilai) => ({ nilai, label: LABEL_TINGKAT[nilai] }));
const FIELD_TAMBAHAN = [["tingkat_tujuan"], [], ["hubungan"], ["pernyataan"]] as const;

type FormPendaftaranProps<T> = {
  kirim: (nilai: NilaiPendaftaran) => Promise<T>;
  onBerhasil: (hasil: T) => void;
  /** Wali yang login: ada pertanyaan "Anda sebagai", nomor HP akunnya diisikan ke orang tua yang dipilih. */
  akun?: { noHp: string; alamat: string };
};

/**
 * Form PPDB 4 langkah (A2.16), dipakai halaman publik (tanpa login) dan dashboard wali (kakak/adik). Tiap langkah
 * diperiksa sebelum lanjut; error dari backend membawa pengguna kembali ke langkah yang salah.
 */
export function FormPendaftaran<T>({ kirim, onBerhasil, akun }: FormPendaftaranProps<T>) {
  const [langkah, setLangkah] = useState<number>(LANGKAH.dataAnak);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const skema = useMemo(() => buatSkemaPendaftaran(akun !== undefined), [akun]);
  const form = useForm<MasukanPendaftaran, unknown, NilaiPendaftaran>({
    resolver: zodResolver(skema),
    defaultValues: nilaiAwalPendaftaran(akun?.alamat ?? ""),
    shouldUnregister: false,
  });
  const { errors } = form.formState;

  const keLangkahError = () => {
    const tujuan = langkahDenganError((field) => form.getFieldState(field).invalid, FIELD_TAMBAHAN);
    setLangkah(tujuan ?? LANGKAH.konfirmasi);
  };

  const mutation = useMutation({
    mutationFn: kirim,
    onSuccess: onBerhasil,
    onError: (error) => {
      if (terapkanErrorValidasi(error, form.setError, [...SEMUA_FIELD_FORMULIR, "tingkat_tujuan", "hubungan", "pernyataan"])) {
        keLangkahError();
        return;
      }
      // PPDB ditutup, kuota penuh, NIK sudah terdaftar, batas percobaan: pesan backend sudah menjelaskan.
      if (error instanceof ApiError && (error.code === "BUSINESS_RULE" || error.code === "TOO_MANY_REQUESTS")) {
        setPesanGagal(error.message);
        return;
      }
      toast.error(pesanError(error));
    },
  });

  const kirimForm = form.handleSubmit(
    (nilai) => {
      setPesanGagal(null);
      mutation.mutate(nilai);
    },
    keLangkahError,
  );

  return (
    <FormProvider {...form}>
      <WizardFormulir
        langkah={langkah}
        onPindah={setLangkah}
        periksaLangkah={() => form.trigger([...FIELD_LANGKAH_FORMULIR[langkah], ...FIELD_TAMBAHAN[langkah]], { shouldFocus: true })}
        onKirim={() => void kirimForm()}
        memproses={mutation.isPending}
        labelKirim="Kirim Pendaftaran"
        label="Langkah pendaftaran"
      >
        {langkah === LANGKAH.dataAnak ? (
          <LangkahDataAnak
            tambahan={
              <Controller
                control={form.control}
                name="tingkat_tujuan"
                render={({ field }) => (
                  <KolomRadio label="Mendaftar ke" opsi={OPSI_TINGKAT} nilai={field.value} onUbah={field.onChange} error={errors.tingkat_tujuan?.message} />
                )}
              />
            }
          />
        ) : null}
        {langkah === LANGKAH.kesehatan ? <LangkahKesehatan /> : null}
        {langkah === LANGKAH.orangTua ? (
          <LangkahOrangTua
            awal={
              akun ? (
                <Controller
                  control={form.control}
                  name="hubungan"
                  render={({ field }) => (
                    <KolomRadio
                      label="Anda sebagai"
                      opsi={OPSI_HUBUNGAN}
                      nilai={field.value === "" ? undefined : field.value}
                      onUbah={(peran) => {
                        field.onChange(peran);
                        if (form.getValues(`${peran}.no_hp`) === "") form.setValue(`${peran}.no_hp`, akun.noHp);
                      }}
                      error={errors.hubungan?.message}
                    />
                  )}
                />
              ) : undefined
            }
          />
        ) : null}
        {langkah === LANGKAH.konfirmasi ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Periksa lagi sebelum dikirim. Data yang sudah dikirim hanya bisa diubah oleh sekolah.</p>
            {pesanGagal ? <KotakPesan nada="bahaya">{pesanGagal}</KotakPesan> : null}
            <RingkasanFormulir isian={form.getValues()} tampilkanNik keLangkah={setLangkah} />
            <BerkasDibawa />
            <div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-primary" {...form.register("pernyataan")} />
                <span>
                  <span className="font-bold">Saya menyatakan data yang diisi benar.</span> Waktu pengiriman formulir ini dicatat sebagai pengganti
                  tanggal dan tanda tangan di formulir kertas.
                </span>
              </label>
              <FieldError className="mt-2">{errors.pernyataan?.message}</FieldError>
            </div>
          </div>
        ) : null}
      </WizardFormulir>
    </FormProvider>
  );
}
