"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FIELD_LANGKAH_FORMULIR, LANGKAH, SEMUA_FIELD_FORMULIR, langkahDenganError } from "@/components/features/formulir-murid/label-field";
import { LangkahDataAnak } from "@/components/features/formulir-murid/langkah-data-anak";
import { LangkahKesehatan } from "@/components/features/formulir-murid/langkah-kesehatan";
import { LangkahOrangTua } from "@/components/features/formulir-murid/langkah-orang-tua";
import { RingkasanFormulir } from "@/components/features/formulir-murid/ringkasan-formulir";
import { WizardFormulir } from "@/components/features/formulir-murid/wizard-formulir";
import { BerkasDibawa } from "@/components/features/ppdb/berkas-dibawa";
import { useDrafPendaftaran } from "@/components/features/ppdb/draf-pendaftaran";
import {
  buatSkemaPendaftaran,
  nilaiAwalPendaftaran,
  type MasukanPendaftaran,
  type NilaiPendaftaran,
} from "@/components/features/ppdb/skema-pendaftaran";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { LABEL_TINGKAT, OPSI_HUBUNGAN } from "@/lib/constants/label";

const OPSI_TINGKAT = (["A", "B"] as const).map((nilai) => ({ nilai, label: LABEL_TINGKAT[nilai] }));
const FIELD_TAMBAHAN = [["tingkat_tujuan"], [], ["hubungan"], ["pernyataan"]] as const;

type FormPendaftaranProps<T> = {
  /** Kunci draf isian di browser: satu per formulir dan per akun. */
  kunciDraf: string;
  kirim: (nilai: NilaiPendaftaran) => Promise<T>;
  onBerhasil: (hasil: T) => void;
  /** Wali yang login: ada pertanyaan "Anda sebagai", nomor HP akunnya diisikan ke orang tua yang dipilih. */
  akun?: { noHp: string; alamat: string };
};

/**
 * Form PPDB 4 langkah (A2.16), dipakai halaman publik (tanpa login) dan dashboard wali (kakak/adik). Tiap langkah
 * diperiksa sebelum lanjut; error dari backend membawa pengguna kembali ke langkah yang salah.
 */
export function FormPendaftaran<T>({ kunciDraf, kirim, onBerhasil, akun }: FormPendaftaranProps<T>) {
  const [langkah, setLangkah] = useState<number>(LANGKAH.dataAnak);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [dipulihkan, setDipulihkan] = useState(false);
  const skema = useMemo(() => buatSkemaPendaftaran(akun !== undefined), [akun]);
  const nilaiAwal = useMemo(() => nilaiAwalPendaftaran(akun?.alamat ?? ""), [akun?.alamat]);
  const form = useForm<MasukanPendaftaran, unknown, NilaiPendaftaran>({
    resolver: zodResolver(skema),
    defaultValues: nilaiAwal,
    shouldUnregister: false,
  });
  const { errors } = form.formState;
  const onPulih = useCallback((langkahDraf: number) => {
    setLangkah(langkahDraf);
    setDipulihkan(true);
  }, []);
  const { hapusDraf, mulaiDariAwal } = useDrafPendaftaran({ form, langkah, onPulih, kunci: kunciDraf, nilaiAwal });

  const keLangkahError = () => {
    const tujuan = langkahDenganError((field) => form.getFieldState(field).invalid, FIELD_TAMBAHAN);
    setLangkah(tujuan ?? LANGKAH.konfirmasi);
  };

  const mutation = useMutation({
    mutationFn: kirim,
    onSuccess: (hasil) => {
      hapusDraf();
      onBerhasil(hasil);
    },
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
      {dipulihkan ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg bg-highlight-soft py-1 pr-1 pl-4 text-sm">
          <p>Isian sebelumnya dipulihkan. NIK perlu diisi lagi.</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              mulaiDariAwal();
              setLangkah(LANGKAH.dataAnak);
              setDipulihkan(false);
            }}
          >
            Mulai dari awal
          </Button>
        </div>
      ) : null}
      <WizardFormulir
        langkah={langkah}
        onPindah={(tujuan) => {
          // Pesan pemulihan cukup terlihat di langkah pertama yang dibuka; setelah pindah langkah tidak perlu lagi.
          setDipulihkan(false);
          setLangkah(tujuan);
        }}
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
