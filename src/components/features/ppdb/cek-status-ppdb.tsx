"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { HasilStatusPpdb } from "@/components/features/ppdb/hasil-status-ppdb";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { KotakPesan } from "@/components/shared/kotak-pesan";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ambilData } from "@/lib/api/ambil-data";
import { api } from "@/lib/api/client";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { hariIniJakarta } from "@/lib/tanggal";

const skemaCekStatus = z.object({
  kode: z
    .string()
    .transform((nilai) => nilai.replace(/\s+/g, "").toUpperCase())
    .pipe(z.string().min(1, "Kode pendaftaran wajib diisi.")),
  tanggal_lahir: z.string().min(1, "Tanggal lahir anak wajib diisi."),
});

type MasukanCekStatus = z.input<typeof skemaCekStatus>;
type NilaiCekStatus = z.output<typeof skemaCekStatus>;

// Backend membalas 404 dengan pesan umum supaya kode yang ada tidak bisa ditebak.
const PESAN_TIDAK_COCOK =
  "Kode pendaftaran atau tanggal lahir tidak cocok. Periksa lagi kode di bukti pendaftaran, lalu coba lagi.";

export function CekStatusPpdb() {
  const kodeAwal = useSearchParams().get("kode") ?? "";
  const form = useForm<MasukanCekStatus, unknown, NilaiCekStatus>({
    resolver: zodResolver(skemaCekStatus),
    defaultValues: { kode: kodeAwal, tanggal_lahir: "" },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: async (query: NilaiCekStatus) =>
      (await ambilData(api.GET("/public/pendaftaran/status", { params: { query } }))).data,
    onError: (error) => {
      if (terapkanErrorValidasi(error, form.setError, ["kode", "tanggal_lahir"])) return;
      if (error instanceof ApiError && (error.code === "NOT_FOUND" || error.code === "TOO_MANY_REQUESTS")) return;
      toast.error(pesanError(error));
    },
  });

  const galat =
    mutation.error instanceof ApiError && mutation.error.code === "NOT_FOUND"
      ? PESAN_TIDAK_COCOK
      : mutation.error instanceof ApiError && mutation.error.code === "TOO_MANY_REQUESTS"
        ? mutation.error.message
        : null;

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
      <form noValidate onSubmit={form.handleSubmit((nilai) => mutation.mutate(nilai))} className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <FieldGroup>
          <KolomTeks
            label="Kode pendaftaran"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Contoh: PPDB-2027-0001"
            className="font-heading tracking-wider uppercase placeholder:font-sans placeholder:tracking-normal placeholder:normal-case"
            error={errors.kode?.message}
            {...form.register("kode")}
          />
          <KolomTeks label="Tanggal lahir anak" type="date" max={hariIniJakarta()} error={errors.tanggal_lahir?.message} {...form.register("tanggal_lahir")} />
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Mencari..." : "Cek Status"}
          </Button>
        </FieldGroup>
      </form>
      <div aria-live="polite">
        {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
        {mutation.data ? <HasilStatusPpdb pendaftaran={mutation.data} /> : null}
        {!galat && !mutation.data ? (
          <p className="text-sm text-muted-foreground">
            Kode pendaftaran tertera di bukti setelah formulir terkirim, formatnya PPDB-tahun-nomor.
          </p>
        ) : null}
      </div>
    </div>
  );
}
