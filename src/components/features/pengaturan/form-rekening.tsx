"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { TombolSimpanTab } from "@/components/features/website/tombol-simpan-tab";
import { EmptyState } from "@/components/shared/empty-state";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { pesanError } from "@/lib/api/errors";
import { pesanErrorPengaturan, useSimpanPengaturan, type skemaKeuangan } from "@/lib/api/pengaturan-dashboard";

const MAKS_REKENING = 5;
const KUNCI = "keuangan.rekening";

const skema = z.object({
  rekening: z
    .array(
      z.object({
        bank: z.string().trim().min(1, "Nama bank wajib diisi.").max(50, "Nama bank maksimal 50 karakter."),
        nomor: z.string().trim().regex(/^[0-9 .-]{5,30}$/, "Nomor rekening berisi 5–30 angka (boleh spasi, titik, atau strip)."),
        atas_nama: z.string().trim().min(1, "Nama pemilik rekening wajib diisi.").max(100, "Maksimal 100 karakter."),
      }),
    )
    .max(MAKS_REKENING),
});

type NilaiRekening = z.infer<typeof skema>;
type Rekening = z.infer<typeof skemaKeuangan>["keuangan.rekening"];

/** Rekening sekolah yang tampil di detail tagihan wali (`keuangan.rekening`). */
export function FormRekening({ awal, onUbahKotor }: { awal: Rekening; onUbahKotor: (kotor: boolean) => void }) {
  const simpan = useSimpanPengaturan("keuangan");
  const form = useForm<NilaiRekening>({ resolver: zodResolver(skema), defaultValues: { rekening: awal } });
  const daftar = useFieldArray({ control: form.control, name: "rekening" });
  const { errors, isDirty, isSubmitting } = form.formState;

  useEffect(() => onUbahKotor(isDirty), [isDirty, onUbahKotor]);

  const kirim = form.handleSubmit(async (nilai) => {
    try {
      await simpan.mutateAsync({ [KUNCI]: nilai.rekening });
      form.reset(nilai);
      toast.success("Rekening sekolah tersimpan.");
    } catch (error) {
      const pesan = pesanErrorPengaturan(error, KUNCI);
      for (const [path, isi] of pesan) {
        const [indeks, field] = path.split(".");
        if (Number.isInteger(Number(indeks)) && (field === "bank" || field === "nomor" || field === "atas_nama")) {
          form.setError(`rekening.${Number(indeks)}.${field}`, { type: "server", message: isi });
        } else toast.error(isi);
      }
      if (pesan.length === 0) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
      <p className="max-w-prose text-sm text-muted-foreground">Wali murid melihat rekening ini saat membuka tagihan dan mentransfer pembayaran. Paling banyak {MAKS_REKENING} rekening.</p>
      {daftar.fields.length === 0 ? <EmptyState judul="Belum ada rekening sekolah." deskripsi="Tanpa rekening, wali murid tidak tahu ke mana harus mentransfer." /> : null}
      <ol className="flex flex-col gap-3">
        {daftar.fields.map((field, indeks) => (
          <li key={field.id} className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_1fr_1.4fr_auto] sm:items-start">
            <KolomTeks label="Bank" placeholder="Bank Jateng" error={errors.rekening?.[indeks]?.bank?.message} {...form.register(`rekening.${indeks}.bank`)} />
            <KolomTeks label="Nomor rekening" inputMode="numeric" error={errors.rekening?.[indeks]?.nomor?.message} {...form.register(`rekening.${indeks}.nomor`)} />
            <KolomTeks label="Atas nama" error={errors.rekening?.[indeks]?.atas_nama?.message} {...form.register(`rekening.${indeks}.atas_nama`)} />
            <Button type="button" variant="ghost" size="icon" className="sm:mt-7" aria-label={`Hapus rekening ${indeks + 1}`} onClick={() => daftar.remove(indeks)}>
              <Trash2 aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ol>
      {daftar.fields.length < MAKS_REKENING ? (
        <Button type="button" variant="outline" className="self-start" onClick={() => daftar.append({ bank: "", nomor: "", atas_nama: "" })}>
          <Plus aria-hidden="true" />
          Tambah Rekening
        </Button>
      ) : null}
      <TombolSimpanTab kotor={isDirty} menyimpan={isSubmitting} label="Simpan Rekening" />
    </form>
  );
}
