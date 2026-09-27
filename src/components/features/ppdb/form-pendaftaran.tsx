"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { LangkahDataAnak } from "@/components/features/ppdb/langkah-data-anak";
import { LangkahDokumen } from "@/components/features/ppdb/langkah-dokumen";
import { LangkahOrangTua } from "@/components/features/ppdb/langkah-orang-tua";
import { PenandaLangkah } from "@/components/features/ppdb/penanda-langkah";
import { RingkasanPendaftaran } from "@/components/features/ppdb/ringkasan-pendaftaran";
import {
  LANGKAH_PENDAFTARAN,
  nilaiAwalPendaftaran,
  SEMUA_FIELD_PENDAFTARAN,
  skemaPendaftaran,
  type MasukanPendaftaran,
  type NilaiPendaftaran,
} from "@/components/features/ppdb/skema-pendaftaran";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";

const JUDUL_LANGKAH = LANGKAH_PENDAFTARAN.map((langkah) => langkah.judul);
const LANGKAH_PERIKSA = LANGKAH_PENDAFTARAN.length - 1;

type FormPendaftaranProps<T> = {
  kirim: (nilai: NilaiPendaftaran) => Promise<T>;
  onBerhasil: (hasil: T) => void;
  nilaiAwal?: { no_hp?: string; alamat?: string };
};

/**
 * Form PPDB multi-step, dipakai halaman publik (tanpa login) dan dashboard wali
 * (kakak/adik). Tiap langkah divalidasi sebelum lanjut; error dari backend
 * membawa pengguna kembali ke langkah yang salah.
 */
export function FormPendaftaran<T>({ kirim, onBerhasil, nilaiAwal = {} }: FormPendaftaranProps<T>) {
  const [langkah, setLangkah] = useState(0);
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const atasRef = useRef<HTMLDivElement>(null);
  const form = useForm<MasukanPendaftaran, unknown, NilaiPendaftaran>({
    resolver: zodResolver(skemaPendaftaran),
    defaultValues: nilaiAwalPendaftaran(nilaiAwal),
    shouldUnregister: false,
  });

  const pindah = (tujuan: number) => {
    setLangkah(tujuan);
    atasRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const mutation = useMutation({
    mutationFn: kirim,
    onSuccess: onBerhasil,
    onError: (error) => {
      if (error instanceof ApiError && error.errors?.["lainnya.0"]) {
        form.setError("lainnya", { type: "server", message: error.errors["lainnya.0"][0] });
      }
      if (terapkanErrorValidasi(error, form.setError, SEMUA_FIELD_PENDAFTARAN)) {
        const salah = LANGKAH_PENDAFTARAN.findIndex((item) => item.field.some((field) => form.getFieldState(field).error));
        pindah(salah === -1 ? LANGKAH_PERIKSA : salah);
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

  const ringkasan = langkah === LANGKAH_PERIKSA ? skemaPendaftaran.safeParse(form.getValues()) : null;

  const lanjut = async () => {
    const valid = await form.trigger([...LANGKAH_PENDAFTARAN[langkah].field], { shouldFocus: true });
    if (valid) pindah(langkah + 1);
  };

  return (
    <div ref={atasRef} className="scroll-mt-24">
      <PenandaLangkah judul={JUDUL_LANGKAH} aktif={langkah} />
      <form
        noValidate
        onSubmit={(event) => {
          // Enter di kolom isian sebelum langkah terakhir berarti "lanjut", bukan kirim.
          if (langkah < LANGKAH_PERIKSA) {
            event.preventDefault();
            void lanjut();
            return;
          }
          void form.handleSubmit((nilai) => {
            setPesanGagal(null);
            mutation.mutate(nilai);
          })(event);
        }}
      >
        <h2 className="mb-5 text-lg font-extrabold">{JUDUL_LANGKAH[langkah]}</h2>
        {langkah === 0 ? <LangkahDataAnak form={form} /> : null}
        {langkah === 1 ? <LangkahOrangTua form={form} /> : null}
        {langkah === 2 ? <LangkahDokumen form={form} /> : null}
        {langkah === LANGKAH_PERIKSA ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">Periksa lagi sebelum dikirim. Data yang sudah dikirim hanya bisa diubah oleh sekolah.</p>
            {pesanGagal ? <KotakPesan nada="bahaya" className="mb-4">{pesanGagal}</KotakPesan> : null}
            {ringkasan?.success ? (
              <RingkasanPendaftaran nilai={ringkasan.data} keLangkah={pindah} />
            ) : (
              <KotakPesan nada="menunggu">Ada isian yang belum lengkap. Kembali ke langkah sebelumnya untuk melengkapinya.</KotakPesan>
            )}
          </>
        ) : null}
        <div className="mt-8 flex flex-wrap-reverse justify-between gap-3">
          {langkah > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={() => pindah(langkah - 1)} disabled={mutation.isPending}>
              Kembali
            </Button>
          ) : (
            <span />
          )}
          {/* key berbeda: tanpa itu React memakai ulang elemen tombol dan mengganti type-nya
              menjadi submit di tengah klik, sehingga "Lanjut ke Periksa" langsung mengirim form. */}
          {langkah < LANGKAH_PERIKSA ? (
            <Button key="lanjut" type="button" size="lg" onClick={() => void lanjut()}>
              Lanjut ke {JUDUL_LANGKAH[langkah + 1]}
            </Button>
          ) : (
            <Button key="kirim" type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? "Mengirim..." : "Kirim Pendaftaran"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
