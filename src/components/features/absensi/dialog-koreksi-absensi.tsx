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
import { useCatatAbsenMasuk, useKoreksiAbsensi } from "@/lib/api/absensi";
import { pesanError, terapkanErrorValidasi } from "@/lib/api/errors";
import { LABEL_STATUS_ABSENSI, OPSI_STATUS_ABSENSI } from "@/lib/constants/label";
import { formatHariTanggal } from "@/lib/format";
import type { Absensi } from "@/types/domain";

const MAKS_CATATAN = 500;

const catatan = z.string().trim().min(1, "Catatan wajib diisi.").max(MAKS_CATATAN, `Catatan maksimal ${MAKS_CATATAN} karakter.`);
const skema = z.object({ status: z.enum(["hadir", "terlambat", "tidak_hadir"]), catatan });
// Absen masuk baru hanya hadir atau terlambat (yang tidak absen ditandai scheduler); pilihan tidak hadir tidak
// ditampilkan, dan skema ini mempersempit tipenya saat dikirim.
const skemaBaru = z.object({ status: z.enum(["hadir", "terlambat"]), catatan });

type NilaiForm = z.infer<typeof skema>;

type DialogKoreksiAbsensiProps =
  | { nama: string; absensi: Absensi }
  /** Peserta yang belum punya absen masuk di tanggal itu, misalnya lupa absen padahal masuk. */
  | { nama: string; absensi: null; userId: number; tanggal: string };

/**
 * Koreksi status absen masuk oleh Kepala Sekolah, atau pencatatan absen masuk untuk peserta yang belum absen.
 * Catatan wajib dan tersimpan bersama nama pengoreksi.
 */
export function DialogKoreksiAbsensi(props: DialogKoreksiAbsensiProps) {
  const { nama, absensi } = props;
  const baru = absensi === null;
  const [terbuka, setTerbuka] = useState(false);
  const koreksi = useKoreksiAbsensi();
  const catat = useCatatAbsenMasuk();
  const menyimpan = koreksi.isPending || catat.isPending;
  const opsiStatus = OPSI_STATUS_ABSENSI.filter((opsi) => (baru ? opsi.nilai !== "tidak_hadir" : opsi.nilai !== absensi.status));
  const form = useForm<NilaiForm>({ resolver: zodResolver(skema), defaultValues: { status: opsiStatus[0].nilai, catatan: "" } });
  const [galat, setGalat] = useState<string | null>(null);

  const ubahTerbuka = (buka: boolean) => {
    setTerbuka(buka);
    setGalat(null);
    // Status sekarang bisa sudah berubah oleh koreksi sebelumnya, jadi pilihan awal dihitung ulang dari props terbaru.
    form.reset({ status: opsiStatus[0].nilai, catatan: "" });
  };

  const kirim = form.handleSubmit(async (nilai) => {
    setGalat(null);
    try {
      const hasil =
        props.absensi === null
          ? await catat.mutateAsync({ user_id: props.userId, tanggal: props.tanggal, ...skemaBaru.parse(nilai) })
          : await koreksi.mutateAsync({ id: props.absensi.id, ...nilai });
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
          {baru ? "Catat Absen Masuk" : "Koreksi Status"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form noValidate onSubmit={(event) => void kirim(event)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{baru ? `Catat absen masuk ${nama}` : `Koreksi absensi ${nama}`}</DialogTitle>
            <DialogDescription>
              {props.absensi === null
                ? `${formatHariTanggal(props.tanggal)}, belum ada absen masuk. Pakai ini kalau ${nama} masuk tetapi lupa absen. Jam tidak dicatat; nama Anda dan waktu pencatatan ikut tersimpan.`
                : `${formatHariTanggal(props.absensi.tanggal)}, sekarang ${props.absensi.status ? LABEL_STATUS_ABSENSI[props.absensi.status] : "tanpa status"}. Nama Anda dan waktu koreksi ikut tersimpan.`}
            </DialogDescription>
          </DialogHeader>
          <KolomPilih label={baru ? "Status" : "Status baru"} error={form.formState.errors.status?.message} {...form.register("status")}>
            {opsiStatus.map((opsi) => (
              <option key={opsi.nilai} value={opsi.nilai}>
                {opsi.label}
              </option>
            ))}
          </KolomPilih>
          <KolomArea
            label="Catatan"
            rows={3}
            maxLength={MAKS_CATATAN}
            deskripsi={baru ? "Alasan, misalnya lupa absen atau HP tertinggal." : "Alasan koreksi, misalnya dinas luar atau GPS HP bermasalah."}
            error={form.formState.errors.catatan?.message}
            {...form.register("catatan")}
          />
          {galat ? <KotakPesan nada="bahaya">{galat}</KotakPesan> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => ubahTerbuka(false)} disabled={menyimpan}>
              Batal
            </Button>
            <Button type="submit" disabled={menyimpan}>
              {menyimpan ? "Menyimpan..." : baru ? "Simpan Absen Masuk" : "Simpan Koreksi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
