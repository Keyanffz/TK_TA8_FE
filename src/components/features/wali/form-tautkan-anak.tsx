"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAnakAktif } from "@/components/layout/dashboard/anak-aktif";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { LABEL_HUBUNGAN } from "@/lib/constants/label";
import { hariIniJakarta } from "@/lib/tanggal";

// Panjang kode tautan dari backend (Murid::PANJANG_KODE_TAUTAN, A2).
const PANJANG_KODE = 8;
const HUBUNGAN = ["ayah", "ibu", "wali"] as const;

const skemaTautkan = z.object({
  kode: z
    .string()
    .trim()
    .toUpperCase()
    .length(PANJANG_KODE, `Kode tautan terdiri dari ${PANJANG_KODE} karakter.`),
  tanggal_lahir: z.string().min(1, "Tanggal lahir anak wajib diisi."),
  hubungan: z.enum(HUBUNGAN, { error: "Pilih hubungan Anda dengan anak." }),
});

type MasukanTautkan = z.input<typeof skemaTautkan>;
type NilaiTautkan = z.output<typeof skemaTautkan>;
const FIELD = ["kode", "tanggal_lahir", "hubungan"] as const;

export function FormTautkanAnak() {
  const queryClient = useQueryClient();
  const { pilih } = useAnakAktif();
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const form = useForm<MasukanTautkan, unknown, NilaiTautkan>({
    resolver: zodResolver(skemaTautkan),
    defaultValues: { kode: "", tanggal_lahir: "" },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (body: NilaiTautkan) => ambilData(api.POST("/wali/tautkan-anak", { body })),
    onSuccess: async (hasil) => {
      pilih(hasil.data.id);
      form.reset();
      toast.success(`${hasil.data.nama_panggilan} sudah tertaut dengan akun Anda.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.anakWali }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
    onError: (error) => {
      if (terapkanErrorValidasi(error, form.setError, FIELD)) return;
      // Kode salah/kedaluwarsa dan batas percobaan: pesan backend sudah menjelaskan langkahnya.
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
          label="Kode tautan"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={PANJANG_KODE}
          placeholder="Contoh: K7M2QX9A"
          deskripsi="Kode 8 karakter dari sekolah. Berlaku 14 hari."
          className="font-heading text-lg tracking-[0.3em] uppercase placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:normal-case"
          error={errors.kode?.message}
          {...form.register("kode")}
        />
        <KolomTeks
          label="Tanggal lahir anak"
          type="date"
          max={hariIniJakarta()}
          error={errors.tanggal_lahir?.message}
          {...form.register("tanggal_lahir")}
        />
        <FieldSet data-invalid={errors.hubungan ? true : undefined}>
          <FieldLegend variant="label">Anda sebagai</FieldLegend>
          <Controller
            control={form.control}
            name="hubungan"
            render={({ field }) => (
              <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex flex-wrap gap-6">
                {HUBUNGAN.map((nilai) => (
                  <Field key={nilai} orientation="horizontal" className="w-auto">
                    <RadioGroupItem value={nilai} id={`hubungan-${nilai}`} />
                    <FieldLabel htmlFor={`hubungan-${nilai}`} className="font-normal">
                      {LABEL_HUBUNGAN[nilai]}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
            )}
          />
          {errors.hubungan ? <FieldError>{errors.hubungan.message}</FieldError> : null}
        </FieldSet>
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Memeriksa kode..." : "Tautkan Anak"}
        </Button>
      </FieldGroup>
    </form>
  );
}
