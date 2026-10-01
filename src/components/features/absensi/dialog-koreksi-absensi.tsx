"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { KotakPesan } from "@/components/shared/kotak-pesan";
import { KolomArea, KolomPilih } from "@/components/shared/kolom-teks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useKoreksiAbsensi } from "@/lib/api/absensi";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { LABEL_STATUS_ABSENSI, OPSI_STATUS_ABSENSI } from "@/lib/constants/label";
import { formatHariTanggal } from "@/lib/format";
import type { Absensi } from "@/types/domain";

const MAKS_CATATAN = 500;

const skema = z.object({
  status: z.enum(["hadir", "terlambat", "tidak_hadir"]),
  catatan: z.string().trim().min(1, "Catatan wajib diisi.").max(MAKS_CATATAN, `Catatan maksimal ${MAKS_CATATAN} karakter.`),
});

type NilaiForm = z.infer<typeof skema>;

/** Koreksi status absen masuk oleh Kepala Sekolah; catatan wajib dan tersimpan bersama nama pengoreksi. */
export function DialogKoreksiAbsensi({ absensi, nama }: { absensi: Absensi; nama: string }) {
  const [terbuka, setTerbuka] = useState(false);
  const koreksi = useKoreksiAbsensi();
  const statusLain = OPSI_STATUS_ABSENSI.filter((opsi) => opsi.nilai !== absensi.status);
  const form = useForm<NilaiForm>({ resolver: zodResolver(skema), defaultValues: { status: statusLain[0].nilai, catatan: "" } });
  const [galat, setGalat] = useState<string | null>(null);

  const ubahTerbuka = (buka: boolean) => {
    setTerbuka(buka);
    if (!buka) {
      form.reset();
      setGalat(null);
    }
  };

  const kirim = form.handleSubmit(async (nilai) => {
    setGalat(null);
    try {
      const hasil = await koreksi.mutateAsync({ id: absensi.id, ...nilai });
      toast.success(hasil.message);
      ubahTerbuka(false);
    } catch (error) {
      if (!terapkanErrorValidasi(error, form.setError, ["status", "catatan"])) setGalat(pesanError(error));
    }
  });

  return (
    <Dialog open={terbuka} onOpenChange={ubahTerbuka}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Koreksi Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Koreksi absensi {nama}</DialogTitle>
            <DialogDescription>
              {formatHariTanggal(absensi.tanggal)}, sekarang {absensi.status ? LABEL_STATUS_ABSENSI[absensi.status] : "tanpa status"}. Nama Anda dan waktu koreksi ikut
              tersimpan.
            </DialogDescription>
          </DialogHeader>
          <KolomPilih label="Status baru" error={form.formState.errors.status?.message} {...form.register("status")}>
            {statusLain.map((opsi) => (
              <option key={opsi.nilai} value={opsi.nilai}>
                {opsi.label}
              </option>
            ))}
          </KolomPilih>
          <KolomArea
            label="Catatan"
            rows={3}
            maxLength={MAKS_CATATAN}
            deskripsi="Alasan koreksi, misalnya dinas luar atau GPS HP bermasalah."
            error={form.formState.errors.catatan?.message}
            {...form.register("catatan")}
          />
          {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => ubahTerbuka(false)} disabled={koreksi.isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={koreksi.isPending}>
              {koreksi.isPending ? "Menyimpan..." : "Simpan Koreksi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
