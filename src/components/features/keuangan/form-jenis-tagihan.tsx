"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomArea, KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useSimpanJenisTagihan } from "@/lib/api/jenis-tagihan";
import { useDaftarTahunAjaran } from "@/lib/api/tahun-ajaran";
import { LABEL_PERIODE_TAGIHAN } from "@/lib/constants/label";
import type { JenisTagihan } from "@/types/domain";

const OPSI_PERIODE = [
  { nilai: "bulanan", label: LABEL_PERIODE_TAGIHAN.bulanan, keterangan: "Dibuat otomatis tiap tanggal 1 untuk murid aktif." },
  { nilai: "sekali", label: LABEL_PERIODE_TAGIHAN.sekali, keterangan: "Dibuat manual dari halaman Tagihan." },
] as const;

const skemaJenis = z.object({
  tahun_ajaran_id: z.string().min(1, "Pilih tahun ajaran.").transform(Number),
  nama: z.string().trim().min(1, "Nama wajib diisi.").max(100, "Maksimal 100 karakter."),
  deskripsi: z.string().trim().max(500, "Maksimal 500 karakter."),
  nominal: z.coerce.number<string>().int("Isi dalam rupiah tanpa koma.").min(1, "Nominal minimal Rp 1."),
  periode: z.enum(["bulanan", "sekali"], { error: "Pilih periode." }),
  tingkat: z.enum(["", "A", "B"]).transform((nilai) => (nilai === "" ? null : nilai)),
  is_aktif: z.boolean(),
});

type MasukanJenis = z.input<typeof skemaJenis>;
type NilaiJenis = z.output<typeof skemaJenis>;
const FIELD = ["tahun_ajaran_id", "nama", "deskripsi", "nominal", "periode", "tingkat", "is_aktif"] as const;

function nilaiAwal(jenis: JenisTagihan | null, tahunAjaranId: number | null): DefaultValues<MasukanJenis> {
  return {
    tahun_ajaran_id: String(jenis?.tahun_ajaran.id ?? tahunAjaranId ?? ""),
    nama: jenis?.nama ?? "",
    deskripsi: jenis?.deskripsi ?? "",
    nominal: jenis ? String(jenis.nominal) : "",
    periode: jenis?.periode,
    tingkat: jenis?.tingkat ?? "",
    is_aktif: jenis?.is_aktif ?? true,
  };
}

type FormJenisTagihanProps = { jenis: JenisTagihan | null; tahunAjaranId: number | null; pemicu: ReactNode };

export function FormJenisTagihan({ jenis, tahunAjaranId, pemicu }: FormJenisTagihanProps) {
  const [terbuka, setTerbuka] = useState(false);
  const tahunAjaran = useDaftarTahunAjaran();
  const simpan = useSimpanJenisTagihan();
  const form = useForm<MasukanJenis, unknown, NilaiJenis>({ resolver: zodResolver(skemaJenis), defaultValues: nilaiAwal(jenis, tahunAjaranId) });
  const { errors } = form.formState;

  const kirim = form.handleSubmit((body) =>
    simpan.mutate(
      { id: jenis?.id ?? null, body: { ...body, deskripsi: body.deskripsi || null } },
      {
        onSuccess: () => {
          toast.success(jenis ? `${body.nama} diperbarui.` : `${body.nama} ditambahkan.`);
          setTerbuka(false);
        },
        onError: (error) => {
          if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
        },
      },
    ),
  );

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) form.reset(nilaiAwal(jenis, tahunAjaranId));
      }}
    >
      <DialogTrigger asChild>{pemicu}</DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{jenis ? `Ubah ${jenis.nama}` : "Tambah Jenis Tagihan"}</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <KolomPilih label="Tahun ajaran" error={errors.tahun_ajaran_id?.message} {...form.register("tahun_ajaran_id")}>
              <option value="">Pilih tahun ajaran</option>
              {(tahunAjaran.data ?? []).map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama}
                  {ta.is_aktif ? " (aktif)" : ""}
                </option>
              ))}
            </KolomPilih>
            <div className="grid gap-4 sm:grid-cols-2">
              <KolomTeks label="Nama" placeholder="SPP" error={errors.nama?.message} {...form.register("nama")} />
              <KolomTeks label="Nominal (Rp)" type="number" inputMode="numeric" min={1} error={errors.nominal?.message} {...form.register("nominal")} />
            </div>
            <KolomArea label="Keterangan (opsional)" rows={2} error={errors.deskripsi?.message} {...form.register("deskripsi")} />
            <Controller
              control={form.control}
              name="periode"
              render={({ field }) => <KolomRadio label="Periode" opsi={OPSI_PERIODE} nilai={field.value} onUbah={field.onChange} error={errors.periode?.message} />}
            />
            <KolomPilih label="Berlaku untuk" error={errors.tingkat?.message} {...form.register("tingkat")}>
              <option value="">Semua kelompok</option>
              <option value="A">Kelompok A saja</option>
              <option value="B">Kelompok B saja</option>
            </KolomPilih>
            <Controller
              control={form.control}
              name="is_aktif"
              render={({ field }) => (
                <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <FieldLabel htmlFor="jenis-aktif">Aktif</FieldLabel>
                    <FieldDescription>Jenis nonaktif tidak dipakai saat generate bulanan.</FieldDescription>
                  </div>
                  <Switch id="jenis-aktif" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setTerbuka(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={simpan.isPending}>
              {simpan.isPending ? "Menyimpan..." : "Simpan Jenis Tagihan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
