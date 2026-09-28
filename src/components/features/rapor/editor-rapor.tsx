"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FotoElemenRapor } from "@/components/features/rapor/foto-elemen-rapor";
import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { ApiError, pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useIsiRapor } from "@/lib/api/rapor";
import type { RaporDetail } from "@/types/domain";

const MAKS_TEKS = 3000;

function kolomUkuran(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .refine((nilai) => nilai === "" || /^\d+([.,]\d)?$/.test(nilai), `${label} berupa angka dengan paling banyak satu angka desimal.`)
    .refine((nilai) => {
      const angka = Number(nilai.replace(",", "."));
      return nilai === "" || (angka >= min && angka <= max);
    }, `${label} antara ${min} dan ${max}.`);
}

const skemaRapor = z.object({
  tinggi_badan: kolomUkuran("Tinggi badan", 50, 200),
  berat_badan: kolomUkuran("Berat badan", 5, 80),
  catatan_guru: z.string().trim().max(MAKS_TEKS, `Catatan maksimal ${MAKS_TEKS} karakter.`),
  detail: z.array(z.object({ elemen_penilaian_id: z.number(), deskripsi: z.string().trim().max(MAKS_TEKS, `Deskripsi maksimal ${MAKS_TEKS} karakter.`) })),
});

type NilaiRapor = z.infer<typeof skemaRapor>;

const keAngka = (nilai: string) => (nilai === "" ? null : Number(nilai.replace(",", ".")));
const keTeks = (nilai: number | null) => (nilai === null ? "" : String(nilai).replace(".", ","));

function nilaiAwal(rapor: RaporDetail): NilaiRapor {
  return {
    tinggi_badan: keTeks(rapor.tinggi_badan),
    berat_badan: keTeks(rapor.berat_badan),
    catatan_guru: rapor.catatan_guru ?? "",
    detail: rapor.detail.map((baris) => ({ elemen_penilaian_id: baris.elemen.id, deskripsi: baris.deskripsi ?? "" })),
  };
}

type EditorRaporProps = {
  rapor: RaporDetail;
  /** Hanya guru pembuat saat draft/revisi; Kepala Sekolah memperbaiki teks tanpa mengganti foto. */
  bolehUnggahFoto: boolean;
  labelSimpan: string;
  onUbahBelumTersimpan: (ada: boolean) => void;
  /** Deskripsi tiap elemen dari data elemen penilaian, sebagai panduan menulis. */
  panduan: Map<number, string | null>;
};

export function EditorRapor({ rapor, bolehUnggahFoto, labelSimpan, onUbahBelumTersimpan, panduan }: EditorRaporProps) {
  const isi = useIsiRapor(rapor.id);
  const form = useForm<NilaiRapor>({ resolver: zodResolver(skemaRapor), defaultValues: nilaiAwal(rapor) });
  const { errors, isDirty, isSubmitting } = form.formState;

  useEffect(() => onUbahBelumTersimpan(isDirty), [isDirty, onUbahBelumTersimpan]);

  const simpan = form.handleSubmit(async (nilai) => {
    try {
      await isi.mutateAsync({
        tinggi_badan: keAngka(nilai.tinggi_badan),
        berat_badan: keAngka(nilai.berat_badan),
        catatan_guru: nilai.catatan_guru || null,
        detail: nilai.detail.map((baris) => ({ elemen_penilaian_id: baris.elemen_penilaian_id, deskripsi: baris.deskripsi || null })),
      });
      form.reset(nilai);
      toast.success("Rapor tersimpan.");
    } catch (error) {
      const terpasang = terapkanErrorValidasi(error, form.setError, ["tinggi_badan", "berat_badan", "catatan_guru"]);
      const pesanDetail = error instanceof ApiError ? Object.entries(error.errors ?? {}).filter(([kunci]) => kunci.startsWith("detail.")) : [];
      for (const [kunci, pesan] of pesanDetail) {
        const indeks = Number(kunci.split(".")[1]);
        if (Number.isInteger(indeks)) form.setError(`detail.${indeks}.deskripsi`, { type: "server", message: pesan[0] });
      }
      if (!terpasang && pesanDetail.length === 0) toast.error(pesanError(error));
    }
  });

  return (
    <form noValidate onSubmit={(event) => void simpan(event)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <KolomTeks label="Tinggi badan (cm)" inputMode="decimal" placeholder="105,5" error={errors.tinggi_badan?.message} {...form.register("tinggi_badan")} />
        <KolomTeks label="Berat badan (kg)" inputMode="decimal" placeholder="17,2" error={errors.berat_badan?.message} {...form.register("berat_badan")} />
      </div>
      {rapor.detail.map((baris, indeks) => (
        <section key={baris.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <KolomArea
            label={baris.elemen.nama}
            rows={5}
            maxLength={MAKS_TEKS}
            deskripsi={panduan.get(baris.elemen.id) ?? undefined}
            placeholder="Ceritakan perkembangan anak pada elemen ini dengan contoh yang guru amati."
            error={errors.detail?.[indeks]?.deskripsi?.message}
            {...form.register(`detail.${indeks}.deskripsi`)}
          />
          <FotoElemenRapor raporId={rapor.id} detailId={baris.id} namaElemen={baris.elemen.nama} url={baris.foto_url} bolehUnggah={bolehUnggahFoto} />
        </section>
      ))}
      <div className="rounded-xl bg-highlight-soft p-5">
        <KolomArea label="Catatan guru untuk wali murid" rows={4} maxLength={MAKS_TEKS} error={errors.catatan_guru?.message} {...form.register("catatan_guru")} />
      </div>
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-md">
        <p className="text-sm text-muted-foreground">{isDirty ? "Ada perubahan yang belum disimpan." : "Semua perubahan sudah tersimpan."}</p>
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? "Menyimpan..." : labelSimpan}
        </Button>
      </div>
    </form>
  );
}
