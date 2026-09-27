"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomArea, KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useUbahTagihan, type BodyUbahTagihan } from "@/lib/api/tagihan";
import { formatRupiah } from "@/lib/format";
import { hariIniJakarta } from "@/lib/tanggal";
import type { TagihanDetail } from "@/types/domain";

function skemaUntuk(tagihan: TagihanDetail) {
  return z
    .object({
      jatuh_tempo: z.string().min(1, "Jatuh tempo wajib diisi."),
      potongan: z.coerce
        .number<string>()
        .int("Isi potongan dalam rupiah tanpa koma.")
        .min(0, "Potongan tidak boleh negatif.")
        .max(tagihan.nominal, `Potongan paling besar ${formatRupiah(tagihan.nominal)}.`),
      catatan: z.string().trim().max(500, "Maksimal 500 karakter."),
    })
    .refine((nilai) => nilai.jatuh_tempo === tagihan.jatuh_tempo || nilai.jatuh_tempo >= hariIniJakarta(), {
      path: ["jatuh_tempo"],
      message: "Jatuh tempo baru paling cepat hari ini.",
    });
}

type Masukan = { jatuh_tempo: string; potongan: string; catatan: string };
const FIELD = ["jatuh_tempo", "potongan", "catatan"] as const;

/** Ubah jatuh tempo, potongan, dan catatan (A7 `PUT /tagihan/{id}`); hanya field yang berubah yang dikirim. */
export function DialogUbahTagihan({ tagihan }: { tagihan: TagihanDetail }) {
  const [terbuka, setTerbuka] = useState(false);
  const ubah = useUbahTagihan(tagihan.id);
  const awal: Masukan = { jatuh_tempo: tagihan.jatuh_tempo, potongan: String(tagihan.potongan), catatan: tagihan.catatan ?? "" };
  const form = useForm<Masukan, unknown, z.output<ReturnType<typeof skemaUntuk>>>({ resolver: zodResolver(skemaUntuk(tagihan)), defaultValues: awal });
  const { errors, dirtyFields } = form.formState;
  const potongan = Number(useWatch({ control: form.control, name: "potongan" })) || 0;

  const kirim = form.handleSubmit((nilai) => {
    const body: BodyUbahTagihan = {
      ...(dirtyFields.jatuh_tempo ? { jatuh_tempo: nilai.jatuh_tempo } : {}),
      ...(dirtyFields.potongan ? { potongan: nilai.potongan } : {}),
      ...(dirtyFields.catatan ? { catatan: nilai.catatan || null } : {}),
    };
    ubah.mutate(body, {
      onSuccess: (hasil) => {
        toast.success(hasil.data.status === "lunas" ? "Potongan menutup seluruh tagihan, status menjadi lunas." : "Tagihan diperbarui.");
        setTerbuka(false);
      },
      onError: (error) => {
        if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
      },
    });
  });

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) form.reset(awal);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Ubah Tagihan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah tagihan</DialogTitle>
          <DialogDescription>
            Nominal {formatRupiah(tagihan.nominal)}. Total baru {formatRupiah(Math.max(0, tagihan.nominal - potongan))}. Wali tidak diberi notifikasi.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <KolomTeks label="Jatuh tempo" type="date" error={errors.jatuh_tempo?.message} {...form.register("jatuh_tempo")} />
            <KolomTeks label="Potongan (Rp)" type="number" inputMode="numeric" min={0} max={tagihan.nominal} error={errors.potongan?.message} {...form.register("potongan")} />
            <KolomArea label="Catatan (opsional)" rows={2} error={errors.catatan?.message} {...form.register("catatan")} />
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setTerbuka(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={ubah.isPending || Object.keys(dirtyFields).length === 0}>
              {ubah.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
