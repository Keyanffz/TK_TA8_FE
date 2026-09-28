"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { TombolSimpanTab } from "@/components/features/website/tombol-simpan-tab";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { FieldGroup } from "@/components/ui/field";
import { pesanError } from "@/lib/api/errors";
import { pesanErrorPengaturan, useSimpanPengaturan } from "@/lib/api/pengaturan-dashboard";

const skema = z.object({
  tanggal_jatuh_tempo: z.coerce.number<string>().int("Isi dengan angka bulat.").min(1, "Antara tanggal 1 dan 28.").max(28, "Antara tanggal 1 dan 28."),
  hari_pengingat: z.coerce.number<string>().int("Isi dengan angka bulat.").min(1, "Antara 1 dan 14 hari.").max(14, "Antara 1 dan 14 hari."),
});

type Masukan = z.input<typeof skema>;
type Keluaran = z.output<typeof skema>;

/** Jatuh tempo tagihan bulanan dan H-sekian pengingat ke wali (`keuangan.*`). */
export function FormAturanTagihan({ jatuhTempo, hariPengingat, onUbahKotor }: { jatuhTempo: number; hariPengingat: number; onUbahKotor: (kotor: boolean) => void }) {
  const simpan = useSimpanPengaturan("keuangan");
  const form = useForm<Masukan, unknown, Keluaran>({
    resolver: zodResolver(skema),
    defaultValues: { tanggal_jatuh_tempo: String(jatuhTempo), hari_pengingat: String(hariPengingat) },
  });
  const { errors, isDirty, isSubmitting } = form.formState;

  useEffect(() => onUbahKotor(isDirty), [isDirty, onUbahKotor]);

  const kirim = form.handleSubmit(async (nilai) => {
    try {
      await simpan.mutateAsync({ "keuangan.tanggal_jatuh_tempo": nilai.tanggal_jatuh_tempo, "keuangan.hari_pengingat": nilai.hari_pengingat });
      form.reset({ tanggal_jatuh_tempo: String(nilai.tanggal_jatuh_tempo), hari_pengingat: String(nilai.hari_pengingat) });
      toast.success("Aturan tagihan tersimpan. Berlaku untuk tagihan bulanan berikutnya.");
    } catch (error) {
      const jatuhTempoGalat = pesanErrorPengaturan(error, "keuangan.tanggal_jatuh_tempo")[0]?.[1];
      const pengingatGalat = pesanErrorPengaturan(error, "keuangan.hari_pengingat")[0]?.[1];
      if (jatuhTempoGalat) form.setError("tanggal_jatuh_tempo", { type: "server", message: jatuhTempoGalat });
      if (pengingatGalat) form.setError("hari_pengingat", { type: "server", message: pengingatGalat });
      if (!jatuhTempoGalat && !pengingatGalat) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <KolomTeks
              label="Tanggal jatuh tempo"
              type="number"
              min={1}
              max={28}
              inputMode="numeric"
              deskripsi="Tanggal di bulan yang sama dengan tagihan dibuat (tanggal 1). Paling lambat tanggal 28 supaya ada di setiap bulan."
              error={errors.tanggal_jatuh_tempo?.message}
              {...form.register("tanggal_jatuh_tempo")}
            />
            <KolomTeks
              label="Pengingat (hari sebelum jatuh tempo)"
              type="number"
              min={1}
              max={14}
              inputMode="numeric"
              deskripsi="Wali yang belum membayar menerima notifikasi pengingat pada hari itu."
              error={errors.hari_pengingat?.message}
              {...form.register("hari_pengingat")}
            />
          </div>
        </FieldGroup>
      </section>
      <TombolSimpanTab kotor={isDirty} menyimpan={isSubmitting} label="Simpan Aturan Tagihan" />
    </form>
  );
}
