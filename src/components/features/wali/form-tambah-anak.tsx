"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAnakAktif } from "@/components/layout/dashboard/anak-aktif";
import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { HUBUNGAN, OPSI_HUBUNGAN } from "@/lib/constants/label";
import { hariIniJakarta } from "@/lib/tanggal";

const skemaTambahAnak = z.object({
  nis: z
    .string()
    .transform((nilai) => nilai.replace(/\s+/g, "").toUpperCase())
    .pipe(z.string().min(1, "NIS anak wajib diisi.")),
  tanggal_lahir: z.string().min(1, "Tanggal lahir anak wajib diisi."),
  hubungan: z.enum(HUBUNGAN, { error: "Pilih hubungan Anda dengan anak." }),
});

type MasukanTambahAnak = z.input<typeof skemaTambahAnak>;
type NilaiTambahAnak = z.output<typeof skemaTambahAnak>;
const FIELD = ["nis", "tanggal_lahir", "hubungan"] as const;

/** Kakak/adik yang sudah bersekolah di sini ditambahkan dengan NIS + tanggal lahir (A2.2). */
export function FormTambahAnak() {
  const queryClient = useQueryClient();
  const { pilih } = useAnakAktif();
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const form = useForm<MasukanTambahAnak, unknown, NilaiTambahAnak>({
    resolver: zodResolver(skemaTambahAnak),
    defaultValues: { nis: "", tanggal_lahir: "" },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (body: NilaiTambahAnak) => ambilData(api.POST("/wali/tambah-anak", { body })),
    onSuccess: async (hasil) => {
      pilih(hasil.data.id);
      form.reset();
      toast.success(`${hasil.data.nama_panggilan} sudah ditambahkan ke akun Anda.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.anakWali }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
    onError: (error) => {
      if (terapkanErrorValidasi(error, form.setError, FIELD)) return;
      // Anak sudah tertaut / tidak aktif dan batas percobaan: pesan backend sudah menjelaskan langkahnya.
      if (error instanceof ApiError && (error.code === "BUSINESS_RULE" || error.code === "TOO_MANY_REQUESTS")) {
        setPesanGagal(error.message);
        return;
      }
      toast.error(pesanError(error));
    },
  });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((nilai) => {
        setPesanGagal(null);
        mutation.mutate(nilai);
      })}
    >
      <FieldGroup>
        {pesanGagal ? <KotakPesan nada="bahaya">{pesanGagal}</KotakPesan> : null}
        <KolomTeks
          label="NIS anak"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Contoh: TA20250004"
          deskripsi="Tertulis di kartu akun anak dari sekolah."
          className="font-heading tracking-wider uppercase placeholder:font-sans placeholder:tracking-normal placeholder:normal-case"
          error={errors.nis?.message}
          {...form.register("nis")}
        />
        <KolomTeks
          label="Tanggal lahir anak"
          type="date"
          max={hariIniJakarta()}
          error={errors.tanggal_lahir?.message}
          {...form.register("tanggal_lahir")}
        />
        <Controller
          control={form.control}
          name="hubungan"
          render={({ field }) => (
            <KolomRadio label="Anda sebagai" opsi={OPSI_HUBUNGAN} nilai={field.value} onUbah={field.onChange} error={errors.hubungan?.message} />
          )}
        />
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Memeriksa data..." : "Tambah Anak"}
        </Button>
      </FieldGroup>
    </form>
  );
}
