"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, useForm, useWatch, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KolomRadio } from "@/components/shared/kolom-radio";
import { KolomPilih, KolomTeks } from "@/components/shared/kolom-teks";
import { PilihMurid, type MuridTerpilih } from "@/components/shared/pilih-murid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { useDaftarJenisTagihan } from "@/lib/api/jenis-tagihan";
import { useSimpanKeringanan } from "@/lib/api/keringanan";
import { LABEL_TIPE_KERINGANAN } from "@/lib/constants/label";
import { formatRupiah } from "@/lib/format";
import { hariIniJakarta } from "@/lib/tanggal";
import type { Keringanan } from "@/types/domain";

// Batas backend (SimpanKeringananRequest::PERSEN_MAKSIMAL).
const PERSEN_MAKS = 100;
const OPSI_TIPE = (["persen", "nominal"] as const).map((nilai) => ({ nilai, label: LABEL_TIPE_KERINGANAN[nilai] }));

const skemaKeringanan = z
  .object({
    murid: z.array(z.custom<MuridTerpilih>()).length(1, "Pilih satu murid."),
    jenis_tagihan_id: z.string().min(1, "Pilih jenis tagihan.").transform(Number),
    tipe: z.enum(["persen", "nominal"], { error: "Pilih tipe potongan." }),
    nilai: z.coerce.number<string>().int("Isi bilangan bulat.").min(1, "Minimal 1."),
    alasan: z.string().trim().min(1, "Alasan wajib diisi.").max(255, "Maksimal 255 karakter."),
    berlaku_mulai: z.string().min(1, "Tanggal mulai wajib diisi."),
    berlaku_sampai: z.string(),
  })
  .refine((nilai) => nilai.tipe !== "persen" || nilai.nilai <= PERSEN_MAKS, { path: ["nilai"], message: `Persen paling besar ${PERSEN_MAKS}.` })
  .refine((nilai) => nilai.berlaku_sampai === "" || nilai.berlaku_sampai >= nilai.berlaku_mulai, {
    path: ["berlaku_sampai"],
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
  });

type MasukanKeringanan = z.input<typeof skemaKeringanan>;
type NilaiKeringanan = z.output<typeof skemaKeringanan>;
const FIELD = ["jenis_tagihan_id", "tipe", "nilai", "alasan", "berlaku_mulai", "berlaku_sampai"] as const;

function nilaiAwal(keringanan: Keringanan | null): DefaultValues<MasukanKeringanan> {
  return {
    murid: keringanan ? [{ id: keringanan.murid.id, nama_lengkap: keringanan.murid.nama_lengkap, nis: keringanan.murid.nis }] : [],
    jenis_tagihan_id: keringanan ? String(keringanan.jenis_tagihan.id) : "",
    tipe: keringanan?.tipe,
    nilai: keringanan ? String(keringanan.nilai) : "",
    alasan: keringanan?.alasan ?? "",
    berlaku_mulai: keringanan?.berlaku_mulai ?? hariIniJakarta(),
    berlaku_sampai: keringanan?.berlaku_sampai ?? "",
  };
}

/** Potongan tetap untuk satu murid dan satu jenis tagihan, diterapkan saat tagihan dibuat (A2.4). */
export function FormKeringanan({ keringanan, pemicu }: { keringanan: Keringanan | null; pemicu: ReactNode }) {
  const [terbuka, setTerbuka] = useState(false);
  const jenis = useDaftarJenisTagihan(null, terbuka);
  const simpan = useSimpanKeringanan();
  const form = useForm<MasukanKeringanan, unknown, NilaiKeringanan>({ resolver: zodResolver(skemaKeringanan), defaultValues: nilaiAwal(keringanan) });
  const { errors } = form.formState;
  const tipe = useWatch({ control: form.control, name: "tipe" });

  const kirim = form.handleSubmit(({ murid, berlaku_sampai, ...nilai }) =>
    simpan.mutate(
      { id: keringanan?.id ?? null, body: { ...nilai, murid_id: murid[0].id, berlaku_sampai: berlaku_sampai || null } },
      {
        onSuccess: () => {
          toast.success(keringanan ? "Keringanan diperbarui." : `Keringanan untuk ${murid[0].nama_lengkap} tersimpan.`);
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
        if (buka) form.reset(nilaiAwal(keringanan));
      }}
    >
      <DialogTrigger asChild>{pemicu}</DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{keringanan ? "Ubah keringanan" : "Tambah keringanan"}</DialogTitle>
          <DialogDescription>Berlaku untuk tagihan yang dibuat setelah ini. Tagihan yang sudah ada diubah dari halaman detail tagihan.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={(event) => void kirim(event)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="murid"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Murid</FieldLabel>
                  <PilihMurid dipilih={field.value ?? []} onUbah={field.onChange} maks={1} error={errors.murid?.message} />
                </Field>
              )}
            />
            <KolomPilih label="Jenis tagihan" error={errors.jenis_tagihan_id?.message} {...form.register("jenis_tagihan_id")}>
              <option value="">Pilih jenis tagihan</option>
              {(jenis.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} · {formatRupiah(item.nominal)} ({item.tahun_ajaran.nama})
                </option>
              ))}
            </KolomPilih>
            <Controller
              control={form.control}
              name="tipe"
              render={({ field }) => <KolomRadio label="Tipe potongan" opsi={OPSI_TIPE} nilai={field.value} onUbah={field.onChange} error={errors.tipe?.message} />}
            />
            <KolomTeks
              label={tipe === "nominal" ? "Potongan (Rp)" : "Potongan (%)"}
              type="number"
              inputMode="numeric"
              min={1}
              max={tipe === "persen" ? PERSEN_MAKS : undefined}
              error={errors.nilai?.message}
              {...form.register("nilai")}
            />
            <KolomTeks label="Alasan" placeholder="Contoh: anak guru, yatim" error={errors.alasan?.message} {...form.register("alasan")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <KolomTeks label="Berlaku mulai" type="date" error={errors.berlaku_mulai?.message} {...form.register("berlaku_mulai")} />
              <KolomTeks label="Berlaku sampai (opsional)" type="date" error={errors.berlaku_sampai?.message} {...form.register("berlaku_sampai")} />
            </div>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setTerbuka(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={simpan.isPending}>
              {simpan.isPending ? "Menyimpan..." : "Simpan Keringanan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
