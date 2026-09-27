"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useSimpanAgenda } from "@/lib/api/agenda";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { LABEL_JENIS_AGENDA } from "@/lib/constants/label";
import type { Agenda, JenisAgenda } from "@/types/domain";

const JENIS = ["kegiatan", "libur", "rapat", "lainnya"] as const satisfies readonly JenisAgenda[];

const skema = z
  .object({
    judul: z.string().trim().min(1, "Judul agenda wajib diisi.").max(255, "Judul terlalu panjang."),
    jenis: z.enum(JENIS),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi."),
    tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi."),
    deskripsi: z.string().trim().max(2000, "Keterangan maksimal 2000 karakter."),
    is_publik: z.boolean(),
  })
  .refine((nilai) => !nilai.tanggal_mulai || !nilai.tanggal_selesai || nilai.tanggal_selesai >= nilai.tanggal_mulai, {
    path: ["tanggal_selesai"],
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
  });

type NilaiAgenda = z.infer<typeof skema>;
const FIELD = ["judul", "jenis", "tanggal_mulai", "tanggal_selesai", "deskripsi", "is_publik"] as const;

function nilaiAwal(agenda: Agenda | null, tanggal: string | null): NilaiAgenda {
  return {
    judul: agenda?.judul ?? "",
    jenis: agenda?.jenis ?? "kegiatan",
    tanggal_mulai: agenda?.tanggal_mulai ?? tanggal ?? "",
    tanggal_selesai: agenda?.tanggal_selesai ?? tanggal ?? "",
    deskripsi: agenda?.deskripsi ?? "",
    is_publik: agenda?.is_publik ?? true,
  };
}

type DialogAgendaProps = {
  pemicu: ReactNode;
  agenda: Agenda | null;
  /** Tanggal yang sedang dipilih di kalender, sebagai tanggal awal agenda baru. */
  tanggalAwal?: string | null;
};

/** Tambah atau ubah agenda (hanya Kepala Sekolah, B4). */
export function DialogAgenda({ pemicu, agenda, tanggalAwal = null }: DialogAgendaProps) {
  const [terbuka, setTerbuka] = useState(false);
  const simpan = useSimpanAgenda(agenda?.id ?? null);
  const form = useForm<NilaiAgenda>({ resolver: zodResolver(skema), defaultValues: nilaiAwal(agenda, tanggalAwal) });
  const { errors, isSubmitting } = form.formState;

  const kirim = form.handleSubmit(async (nilai) => {
    try {
      const { message } = await simpan.mutateAsync({ ...nilai, deskripsi: nilai.deskripsi || null });
      toast.success(message);
      setTerbuka(false);
    } catch (error) {
      if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
    }
  });

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) form.reset(nilaiAwal(agenda, tanggalAwal));
      }}
    >
      <DialogTrigger asChild>{pemicu}</DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{agenda ? "Ubah agenda" : "Tambah agenda"}</DialogTitle>
          <DialogDescription>Agenda tampil di kalender semua guru dan wali murid.</DialogDescription>
        </DialogHeader>
        <form id="form-agenda" noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <KolomTeks label="Judul" placeholder="Kunjungan ke Semarang Zoo" error={errors.judul?.message} {...form.register("judul")} />
            <Controller
              control={form.control}
              name="jenis"
              render={({ field }) => (
                <KolomRadio label="Jenis" opsi={JENIS.map((nilai) => ({ nilai, label: LABEL_JENIS_AGENDA[nilai] }))} nilai={field.value} onUbah={field.onChange} error={errors.jenis?.message} />
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <KolomTeks label="Tanggal mulai" type="date" error={errors.tanggal_mulai?.message} {...form.register("tanggal_mulai")} />
              <KolomTeks label="Tanggal selesai" type="date" error={errors.tanggal_selesai?.message} {...form.register("tanggal_selesai")} />
            </div>
            <KolomArea label="Keterangan (opsional)" rows={3} error={errors.deskripsi?.message} {...form.register("deskripsi")} />
            <Controller
              control={form.control}
              name="is_publik"
              render={({ field }) => (
                <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <FieldLabel htmlFor="agenda-publik">Tampilkan di website sekolah</FieldLabel>
                    <FieldDescription>Matikan untuk agenda internal, misalnya rapat guru.</FieldDescription>
                  </div>
                  <Switch id="agenda-publik" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" form="form-agenda" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Agenda"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
