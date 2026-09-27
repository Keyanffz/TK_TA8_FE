"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomTeks } from "@/components/shared/kolom-teks";
import { ZonaUnggah } from "@/components/shared/zona-unggah";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useBayarTagihan } from "@/lib/api/tagihan";
import { LABEL_METODE_BAYAR } from "@/lib/constants/label";
import { formatRupiah } from "@/lib/format";
import { hariIniJakarta } from "@/lib/tanggal";
import type { TagihanDetail } from "@/types/domain";

const OPSI_METODE = (["tunai", "transfer"] as const).map((nilai) => ({ nilai, label: LABEL_METODE_BAYAR[nilai] }));

const skemaCatat = z.object({
  metode: z.enum(["tunai", "transfer"], { error: "Pilih cara bayar." }),
  tanggal_bayar: z
    .string()
    .min(1, "Tanggal bayar wajib diisi.")
    .refine((nilai) => nilai <= hariIniJakarta(), "Tanggal bayar tidak boleh setelah hari ini."),
  bank_pengirim: z.string().trim().max(50, "Maksimal 50 karakter."),
  nama_pengirim: z.string().trim().max(100, "Maksimal 100 karakter."),
  bukti: z.array(z.custom<File>((nilai) => nilai instanceof File)).max(1),
});

type NilaiCatat = z.infer<typeof skemaCatat>;
const FIELD = ["metode", "tanggal_bayar", "bank_pengirim", "nama_pengirim", "bukti"] as const;

/** Petugas keuangan mencatat pembayaran tunai atau transfer yang sudah masuk; langsung diterima (A2.5). */
export function DialogCatatPembayaran({ tagihan }: { tagihan: TagihanDetail }) {
  const [terbuka, setTerbuka] = useState(false);
  const bayar = useBayarTagihan(tagihan.id);
  const kosong: NilaiCatat = { metode: "tunai", tanggal_bayar: hariIniJakarta(), bank_pengirim: "", nama_pengirim: "", bukti: [] };
  const form = useForm<NilaiCatat>({ resolver: zodResolver(skemaCatat), defaultValues: kosong });
  const { errors } = form.formState;
  const metode = useWatch({ control: form.control, name: "metode" });

  // Bank, pengirim, dan bukti dilarang backend untuk pembayaran tunai.
  const kirim = form.handleSubmit(({ bukti, bank_pengirim, nama_pengirim, ...nilai }) =>
    bayar.mutate(
      nilai.metode === "tunai" ? nilai : { ...nilai, bank_pengirim: bank_pengirim || null, nama_pengirim: nama_pengirim || null, bukti: bukti[0] ?? null },
      {
        onSuccess: () => {
          toast.success(`Pembayaran ${formatRupiah(tagihan.total)} tercatat, tagihan lunas.`);
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
        if (buka) form.reset(kosong);
      }}
    >
      <DialogTrigger asChild>
        <Button>Catat Pembayaran</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Catat pembayaran {formatRupiah(tagihan.total)}</DialogTitle>
          <DialogDescription>Pembayaran langsung diterima dan tagihan menjadi lunas. Tidak ada cicilan.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="metode"
              render={({ field }) => <KolomRadio label="Cara bayar" opsi={OPSI_METODE} nilai={field.value} onUbah={field.onChange} error={errors.metode?.message} />}
            />
            <KolomTeks label="Tanggal bayar" type="date" max={hariIniJakarta()} error={errors.tanggal_bayar?.message} {...form.register("tanggal_bayar")} />
            {metode === "transfer" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <KolomTeks label="Bank pengirim (opsional)" error={errors.bank_pengirim?.message} {...form.register("bank_pengirim")} />
                  <KolomTeks label="Nama pengirim (opsional)" error={errors.nama_pengirim?.message} {...form.register("nama_pengirim")} />
                </div>
                <Controller
                  control={form.control}
                  name="bukti"
                  render={({ field }) => <ZonaUnggah label="Bukti transfer (opsional)" nilai={field.value} onUbah={field.onChange} error={errors.bukti?.message} />}
                />
              </>
            ) : null}
          </FieldGroup>
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
