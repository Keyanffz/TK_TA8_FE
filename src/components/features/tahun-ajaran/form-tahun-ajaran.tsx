"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useSimpanTahunAjaran } from "@/lib/api/tahun-ajaran";
import type { TahunAjaran } from "@/types/domain";

const skemaTahunAjaran = z
  .object({
    nama: z.string().trim().regex(/^\d{4}\/\d{4}$/, "Tulis seperti 2027/2028."),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi."),
    tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi."),
    semester_aktif: z.enum(["1", "2"]),
  })
  .refine((nilai) => nilai.tanggal_selesai > nilai.tanggal_mulai, {
    path: ["tanggal_selesai"],
    message: "Tanggal selesai harus setelah tanggal mulai.",
  });

type NilaiTahunAjaran = z.infer<typeof skemaTahunAjaran>;
const FIELD = ["nama", "tanggal_mulai", "tanggal_selesai", "semester_aktif"] as const;
const OPSI_SEMESTER = [
  { nilai: "1", label: "Semester 1" },
  { nilai: "2", label: "Semester 2" },
] as const;

function nilaiAwal(tahunAjaran: TahunAjaran | null): NilaiTahunAjaran {
  return {
    nama: tahunAjaran?.nama ?? "",
    tanggal_mulai: tahunAjaran?.tanggal_mulai ?? "",
    tanggal_selesai: tahunAjaran?.tanggal_selesai ?? "",
    semester_aktif: tahunAjaran?.semester_aktif === 2 ? "2" : "1",
  };
}

/** Tambah (tahunAjaran null) atau ubah tahun ajaran, di dalam dialog. */
export function FormTahunAjaran({ tahunAjaran, pemicu }: { tahunAjaran: TahunAjaran | null; pemicu: ReactNode }) {
  const [terbuka, setTerbuka] = useState(false);
  const simpan = useSimpanTahunAjaran();
  const form = useForm<NilaiTahunAjaran>({ resolver: zodResolver(skemaTahunAjaran), defaultValues: nilaiAwal(tahunAjaran) });
  const { errors } = form.formState;

  const kirim = form.handleSubmit((body) =>
    simpan.mutate(
      { id: tahunAjaran?.id ?? null, body },
      {
        onSuccess: () => {
          toast.success(tahunAjaran ? "Tahun ajaran diperbarui." : `Tahun ajaran ${body.nama} ditambahkan.`);
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
        if (buka) form.reset(nilaiAwal(tahunAjaran));
      }}
    >
      <DialogTrigger asChild>{pemicu}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tahunAjaran ? `Ubah Tahun Ajaran ${tahunAjaran.nama}` : "Tambah Tahun Ajaran"}</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <KolomTeks label="Nama" placeholder="2027/2028" error={errors.nama?.message} {...form.register("nama")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <KolomTeks label="Tanggal mulai" type="date" error={errors.tanggal_mulai?.message} {...form.register("tanggal_mulai")} />
              <KolomTeks label="Tanggal selesai" type="date" error={errors.tanggal_selesai?.message} {...form.register("tanggal_selesai")} />
            </div>
            <Controller
              control={form.control}
              name="semester_aktif"
              render={({ field }) => (
                <KolomRadio label="Semester berjalan" opsi={OPSI_SEMESTER} nilai={field.value} onUbah={field.onChange} error={errors.semester_aktif?.message} />
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setTerbuka(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={simpan.isPending}>
              {simpan.isPending ? "Menyimpan..." : "Simpan Tahun Ajaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
