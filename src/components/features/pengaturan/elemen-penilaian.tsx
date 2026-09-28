"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DialogKonfirmasi } from "@/components/shared/dialog-konfirmasi";
import { EmptyState } from "@/components/shared/empty-state";
import { GalatMuat } from "@/components/shared/galat-muat";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useElemenPenilaian, useHapusElemen, useSimpanElemen } from "@/lib/api/rapor";
import type { ElemenPenilaian } from "@/types/domain";

const skema = z.object({
  kode: z
    .string()
    .trim()
    .min(1, "Kode wajib diisi.")
    .max(20, "Kode maksimal 20 karakter.")
    .regex(/^[A-Za-z0-9_]+$/, "Kode hanya boleh berisi huruf, angka, dan garis bawah."),
  nama: z.string().trim().min(1, "Nama elemen wajib diisi.").max(255, "Nama terlalu panjang."),
  deskripsi: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter."),
  urutan: z.coerce.number<string>().int("Isi dengan angka bulat.").min(0, "Urutan 0 sampai 1000.").max(1000, "Urutan 0 sampai 1000."),
  is_aktif: z.boolean(),
});

type Masukan = z.input<typeof skema>;
type Keluaran = z.output<typeof skema>;

function awal(elemen: ElemenPenilaian | null, urutanBaru: number): Masukan {
  return {
    kode: elemen?.kode ?? "",
    nama: elemen?.nama ?? "",
    deskripsi: elemen?.deskripsi ?? "",
    urutan: String(elemen?.urutan ?? urutanBaru),
    is_aktif: elemen?.is_aktif ?? true,
  };
}

function DialogElemen({ elemen, urutanBaru, pemicu }: { elemen: ElemenPenilaian | null; urutanBaru: number; pemicu: ReactNode }) {
  const [terbuka, setTerbuka] = useState(false);
  const simpan = useSimpanElemen(elemen?.id ?? null);
  const form = useForm<Masukan, unknown, Keluaran>({ resolver: zodResolver(skema), defaultValues: awal(elemen, urutanBaru) });
  const { errors, isSubmitting } = form.formState;

  const kirim = form.handleSubmit(async (nilai) => {
    try {
      toast.success((await simpan.mutateAsync({ ...nilai, kode: nilai.kode.toUpperCase(), deskripsi: nilai.deskripsi || null })).message);
      setTerbuka(false);
    } catch (error) {
      if (!terapkanErrorValidasi(error, form.setError, ["kode", "nama", "deskripsi", "urutan", "is_aktif"])) toast.error(pesanError(error));
    }
  });

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) form.reset(awal(elemen, urutanBaru));
      }}
    >
      <DialogTrigger asChild>{pemicu}</DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{elemen ? "Ubah elemen penilaian" : "Tambah elemen penilaian"}</DialogTitle>
          <DialogDescription>Elemen aktif menjadi bagian rapor yang baru dibuat guru. Rapor yang sudah ada tidak berubah.</DialogDescription>
        </DialogHeader>
        <form id="form-elemen" noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
              <KolomTeks label="Kode" placeholder="NAB" deskripsi="Huruf besar, angka, garis bawah." error={errors.kode?.message} {...form.register("kode")} />
              <KolomTeks label="Urutan" type="number" min={0} max={1000} error={errors.urutan?.message} {...form.register("urutan")} />
            </div>
            <KolomTeks label="Nama elemen" error={errors.nama?.message} {...form.register("nama")} />
            <KolomArea label="Deskripsi (opsional)" rows={3} deskripsi="Tampil sebagai panduan saat guru menulis rapor." error={errors.deskripsi?.message} {...form.register("deskripsi")} />
            <Controller
              control={form.control}
              name="is_aktif"
              render={({ field }) => (
                <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <FieldLabel htmlFor="elemen-aktif">Aktif</FieldLabel>
                    <FieldDescription>Elemen nonaktif tidak muncul di rapor baru.</FieldDescription>
                  </div>
                  <Switch id="elemen-aktif" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTerbuka(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" form="form-elemen" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Elemen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Elemen penilaian rapor Kurikulum Merdeka PAUD (A2.8), dikelola Kepala Sekolah. */
export function ElemenPenilaianSekolah() {
  const { data, isPending, isError, error, refetch } = useElemenPenilaian();
  const hapus = useHapusElemen();

  if (isPending) return <Skeleton className="h-60 rounded-xl" />;
  if (isError) return <GalatMuat error={error} onCobaLagi={() => void refetch()} />;
  const urutanBaru = Math.max(0, ...data.map((item) => item.urutan)) + 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-sm text-muted-foreground">Setiap rapor berisi satu deskripsi per elemen aktif, berurutan sesuai nomor urut.</p>
        <DialogElemen
          elemen={null}
          urutanBaru={urutanBaru}
          pemicu={
            <Button>
              <Plus aria-hidden="true" />
              Tambah Elemen
            </Button>
          }
        />
      </div>
      {data.length === 0 ? (
        <EmptyState judul="Belum ada elemen penilaian." deskripsi="Guru tidak bisa membuat rapor sebelum ada elemen yang aktif." />
      ) : (
        <ol className="flex flex-col gap-3">
          {[...data]
            .sort((a, b) => a.urutan - b.urutan)
            .map((elemen) => (
              <li key={elemen.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-heading font-extrabold text-primary-strong tabular-nums">
                  {elemen.urutan}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-heading font-bold">{elemen.nama}</span>
                    <span className="rounded-sm bg-muted px-1.5 text-xs font-bold text-muted-foreground">{elemen.kode}</span>
                    {elemen.is_aktif ? null : <StatusBadge nada="netral">Nonaktif</StatusBadge>}
                  </p>
                  {elemen.deskripsi ? <p className="mt-1 text-sm text-muted-foreground">{elemen.deskripsi}</p> : null}
                </div>
                <div className="flex gap-2">
                  <DialogElemen
                    elemen={elemen}
                    urutanBaru={urutanBaru}
                    pemicu={
                      <Button size="sm" variant="outline">
                        <Pencil aria-hidden="true" />
                        Ubah
                      </Button>
                    }
                  />
                  <DialogKonfirmasi
                    pemicu={
                      <Button size="sm" variant="ghost">
                        <Trash2 aria-hidden="true" />
                        Hapus
                      </Button>
                    }
                    judul={`Hapus elemen "${elemen.nama}"?`}
                    deskripsi="Elemen yang sudah dipakai di rapor tidak bisa dihapus; nonaktifkan saja supaya tidak muncul di rapor baru."
                    labelAksi="Hapus Elemen"
                    berbahaya
                    onKonfirmasi={async () => {
                      toast.success((await hapus.mutateAsync(elemen.id)).message);
                    }}
                  />
                </div>
              </li>
            ))}
        </ol>
      )}
    </div>
  );
}
