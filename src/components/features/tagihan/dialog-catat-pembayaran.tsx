"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomTeks } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useBayarTagihan } from "@/lib/api/tagihan";
import { formatRupiah } from "@/lib/format";
import { hariIniJakarta } from "@/lib/tanggal";
import type { TagihanDetail } from "@/types/domain";

function skemaUntuk(sisa: number) {
  return z.object({
    jumlah: z.coerce
      .number<string>("Isi jumlah yang diterima.")
      .int("Isi jumlah dalam rupiah tanpa koma.")
      .min(1, "Isi jumlah yang diterima.")
      .max(sisa, `Jumlah paling besar ${formatRupiah(sisa)}, sisa tagihan ini.`),
    tanggal_bayar: z
      .string()
      .min(1, "Tanggal bayar wajib diisi.")
      .refine((nilai) => nilai <= hariIniJakarta(), "Tanggal bayar tidak boleh setelah hari ini."),
  });
}

type Masukan = { jumlah: string; tanggal_bayar: string };
const FIELD = ["jumlah", "tanggal_bayar"] as const;

/** Mencatat uang tunai yang diterima di sekolah; boleh sebagian dari sisa tagihan (A2.5). */
export function DialogCatatPembayaran({ tagihan }: { tagihan: TagihanDetail }) {
  const [terbuka, setTerbuka] = useState(false);
  const bayar = useBayarTagihan(tagihan.id);
  const awal: Masukan = { jumlah: String(tagihan.sisa), tanggal_bayar: hariIniJakarta() };
  const form = useForm<Masukan, unknown, z.output<ReturnType<typeof skemaUntuk>>>({ resolver: zodResolver(skemaUntuk(tagihan.sisa)), defaultValues: awal });
  const { errors } = form.formState;
  const jumlah = Number(useWatch({ control: form.control, name: "jumlah" })) || 0;
  const sisaSetelah = tagihan.sisa - jumlah;

  const kirim = form.handleSubmit((nilai) =>
    bayar.mutate(nilai, {
      onSuccess: (hasil) => {
        toast.success(hasil.message);
        setTerbuka(false);
      },
      onError: (error) => {
        if (!terapkanErrorValidasi(error, form.setError, FIELD)) toast.error(pesanError(error));
      },
    }),
  );

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(buka) => {
        setTerbuka(buka);
        if (buka) form.reset(awal);
      }}
    >
      <DialogTrigger asChild>
        <Button>Catat Pembayaran</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Catat pembayaran tunai</DialogTitle>
          <DialogDescription>
            Sisa tagihan {formatRupiah(tagihan.sisa)}. Isi jumlah uang yang diterima; boleh sebagian kalau wali mencicil.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <KolomTeks label="Jumlah diterima (Rp)" type="number" inputMode="numeric" min={1} max={tagihan.sisa} error={errors.jumlah?.message} {...form.register("jumlah")} />
            <KolomTeks label="Tanggal bayar" type="date" max={hariIniJakarta()} error={errors.tanggal_bayar?.message} {...form.register("tanggal_bayar")} />
          </FieldGroup>
          {jumlah > 0 && sisaSetelah >= 0 ? (
            <p className="mt-4 rounded-md bg-muted px-3 py-2 text-sm">
              {sisaSetelah === 0 ? "Tagihan menjadi lunas." : `Sisa setelah pembayaran ini ${formatRupiah(sisaSetelah)}.`}
            </p>
          ) : null}
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setTerbuka(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={bayar.isPending}>
              {bayar.isPending ? "Menyimpan..." : "Simpan Pembayaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
